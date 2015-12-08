/* TODO: 
 * - seperate by object types
 * - optimize - so only changed object gets updated not all object chunk
 * - set correct id instead of tmpXXXXX - probably add event on server side
 */

"use strict";

MT.require("ui.TreeView");
MT.require("ui.List");
MT.require("core.Selector");

MT.objectTypes = {
	SPRITE: 0,
	GROUP: 1,
	TEXT: 2,
	TILE_LAYER: 3,
	MOVIE_CLIP: 4
};

MT.OBJECT_ADDED = "OBJECT_ADDED";
MT.OBJECT_SELECTED = "OBJECT_SELECTED";
MT.OBJECT_UNSELECTED = "OBJECT_UNSELECTED";
MT.OBJECT_DELETED = "OBJECT_DELETED";
MT.OBJECT_UPDATED = "OBJECT_UPDATED";
MT.OBJECT_UPDATED_LOCAL = "OBJECT_UPDATED_LOCAL";
MT.OBJECTS_RECEIVED = "OBJECTS_RECEIVED";

MT.OBJECTS_UPDATED = "OBJECTS_UPDATED";
MT.OBJECTS_SYNC = "OBJECTS_SYNC";

MT.requireFile("js/lodash.js");
MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.ObjectManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "om");
		this.project = project;
		
		this.selector = new MT.core.Selector();
		
		this.id = Date.now();
		
		this._activeGroup = null;
	},
	{
		
		set activeGroup(val){
			this._activeGroup = val;
		},
		get activeGroup(){
			return this._activeGroup;
		},
		
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("Objects");
			this.panel.setFree();
			this.panel.content.style.overflow = "initial";
			
			var that = this;
			
			this.panel.addButtons([
				{
					label: "Add Group",
					className: "add-group",
					cb: function(){
						that.createGroup();
					}
				},
				{
					label: "Duplicate selected object (ctrl + D)",
					className: "duplicate",
					cb: function(){
						that.project.plugins.tools.duplicate();
					}
				},
				/*{
					label: "Add Movie Clip",
					className: "",
					cb: function(){
						that.createMovieClip();
					}
				},*/
				{
					label: "Add TileLayer",
					className: "add-tilelayer",
					cb: function(){
						that.createTileLayer();
					}
				},
				{
					label: "Group Selected Objects",
					className: "Group-selected",
					cb: function(){
						that.groupSelected();
					}
				},
				{
					label: "Delete Selected Objects",
					className: "delete-selected",
					cb: function(){
						that.deleteSelected();
					}
				}
			], ui, true);
			
			
			this.tv = new MT.ui.TreeView([], {
				root: this.project.path,
				showHide: true,
				lock: true
			});
			
			this.tv.on("change", function(oldItem, newItem){
				that.update();
				that.sync();
			});
			
			this.tv.sortable(this.ui.events);
			this.tv.tree.show(this.panel.content.el);
			
			
			this.tv.on(["lock", "open", "close", "show"], function(item){
				that.update();
				that.sync();
			});
			
			this.tv.on(["click", "select"], function(data, el){
				that.emit(MT.OBJECT_SELECTED, data);
			});
			
			var timeouts = {};
			this.on(MT.OBJECT_UPDATED_LOCAL, function(mo){
				if(!mo.id){
					return;
				}
				
				if(timeouts[mo.id]){
					window.clearTimeout(timeouts[mo.id]);
				}
				timeouts[mo.id] = window.setTimeout(function(){
					that.emit(MT.OBJECT_UPDATED, mo);
				}, 500);
			});
			
			this.on(MT.OBJECT_UPDATED, function(mo){
				that.saveObject(mo.data);
				that.update();
			});
		},
		
		
		installUI: function(ui){
			var that = this;
			var tools = this.project.plugins.tools;
			
			tools.on(MT.OBJECT_SELECTED, function(obj){
				var el = that.tv.getById(obj.id);
				
				if(el){
					if(el.isFolder && el.data.type == MT.objectTypes.GROUP){
						that.activeGroup = el.data;
					}
					else{
						if(obj.parent && obj.parent.magic){
							that.activeGroup = obj.parent.magic.data;
						}
					}
					el.addClass("selected.active");
					that.selector.add(el);
				}
			});
			
			tools.on(MT.OBJECT_UNSELECTED, function(obj){
				that.activeGroup = null;
				// deleted
				if(!obj){
					return;
				}
				var el = that.tv.getById(obj.id);
				if(el){
					if(that.activeGroup && that.activeGroup.id == obj.id){
						that.activeGroup = null;
					}
					el.removeClass("selected.active");
					that.selector.remove(el);
				}
			});

			/*ui.events.on(ui.events.MOUSEUP, function(e){
				that.sync();
			});*/
			
			tools.on(MT.ASSET_FRAME_CHANGED, function(obj){
				that.updateTree();
			});
			
			this.tv.on("deleted", function(o){
				that.selector.remove(o);
				that.activeGroup = null;
			});
			
		},
		
		
		received: false,
		
		a_receive: function(data, silent){
			
			if(this.received && !silent){
				this.update();
				return;
			}
			
			this.received = true;
			this.tv.merge(data);
			
			if(!silent){
				this.emit(MT.OBJECTS_UPDATED, this.tv.getData());
			}
			this.update();
		},
		
		getData: function(){
			return this.tv.getData();
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		//add object from asset
		addObject: function( e, obj ){
			if(obj.type == MT.GROUP){
				return;
			}
			var no = this.createObject(obj, e.offsetX, e.offsetY);
			this.insertObject(no);
		},
		
		
		insertObject: function(obj, silent, data, skipActive){
			data = data || this.tv.getData();
			//var data = this.tv.getData();
			var map = this.project.plugins.mapeditor;
			
			var active, cont;
			if(this.activeGroup){
				cont = this.activeGroup.contents;
				active = this.activeGroup;
			}
			else{
				cont = data;
			}
			
			
			if(!skipActive && active){
				active = map.getById(active.id);
				while(active){
					obj.x -= active.x;
					obj.y -= active.y;
					active = active.parent;
					if(active){
						active = active.magic;
					}
				}
			}
			
			obj.id = "tmp"+this.mkid();
			
			obj.tmpName = obj.tmpName || obj.name;
			
			obj.name = obj.tmpName + this.getNewNameId(obj.tmpName, cont, 0);
			
			cont.unshift(obj);
			
			obj.index = -1;
			
			/*map.loadedObjects.forEach(function(o, index){
				o.object.z = index;
			});
			*/
			
			if(!silent){
				this.tv.rootPath = this.project.path
				this.tv.merge(data);
				this.update();
				this.sync();
				this.emit(MT.OBJECT_ADDED, obj);
			}
			
			
			return obj;
		},
		
		updateTree: function(){
			this.tv.merge(this.tv.getData());
		},
		
		createObject: function(asset, x, y){
			x = x || 0;
			y = y || 0;
			
			
			var data = this.tv.getData();
			var name;
			if(asset.atlas){
				if(this.project.plugins.assetmanager.tmpName){
					name = this.project.plugins.assetmanager.tmpName;
				}
			}
			if(!name){
				name = asset.name.split(".");
				name.pop();
				name = name.join("");
			}
			
			return  {
				assetId: asset.id,
				__image: asset.__image,
				x: x,
				y: y,
				type: MT.objectTypes.SPRITE,
				anchorX: asset.anchorX,
				anchorY: asset.anchorY,
				userData: _.cloneDeep((asset.userData || {})),
				physics: _.cloneDeep((asset.physics || {})),
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				alpha: 1,
				tmpName: name,
				frame: 0,
				isVisible: 1,
				isLocked: 0,
				contents: []
			};
		},
		
		createTextObject: function(x, y){
			x = x || 0;
			y = y || 0;

			var name = "Text";
			return  {
				x: x,
				y: y,
				type: MT.objectTypes.TEXT,
				anchorX: 0,
				anchorY: 0,
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				alpha: 1,
				tmpName: name,
				wordWrapWidth: 100,
				style: {
					fontFamily: "Arial",
					fontSize: 32
				},
				align: "left",
				wordWrap: 0,
				isVisible: 1,
				isLocked: 0
			};
			
		},
		
		createGroup: function(silent, isRoot){
			var cont;
			var data = this.tv.getData();
			var map = this.project.plugins.mapeditor;
			if(!isRoot && map.activeObject && map.activeObject.type == MT.objectTypes.GROUP){
				cont = map.activeObject.data.contents;
			}
			else{
				cont = data;
			}
			
			var tmpName= "Group";
			var name = tmpName;
			for(var i=0; i<cont.length; i++){
				if(cont[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			var group = {
				id: "tmp"+this.mkid(),
				name: name,
				x: 0,
				y: 0,
				type: MT.objectTypes.GROUP,
				angle: 0,
				contents: [],
				isVisible: 1,
				isLocked: 0,
				isFixedToCamera: 0,
				isClosed: 0,
				scaleX: 1,
				scaleY: 1,
				alpha: 1
			};
			
			cont.unshift(group);
			
			this.tv.merge(data);
			
			if(!silent){
				this.update();
				this.sync();
			}
			return group;
		},
		
		createTileLayer: function(silent){
			var data = this.tv.getData();
			
			var tmpName= "Tile Layer";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			var obj = {
				id: "tmp"+this.mkid(),
				type: MT.objectTypes.TILE_LAYER,
				name: name,
				x: 0,
				y: 0,
				anchorX: 0,
				anchorY: 0,
				angle: 0,
				data: [],
				isVisible: 1,
				isLocked: 0,
				isFixedToCamera: 0,
				tileWidth: 32,
				tileHeight: 32,
				widthInTiles: 10,
				heightInTiles: 10,
				alpha: 1
			};
			
			data.unshift(obj);
			
			this.tv.merge(data);
			
			if(!silent){
				this.update();
				this.sync();
			}
			
			return obj;
		},
		
		copy: function(obj, x, y, name, silent){
			
			name = name || obj.name + this.getNewNameId(obj.name, this.tv.getData());
			var clone = _.cloneDeep(obj);
			clone.name = name;
			clone.x = x;
			clone.y = y;
			
			this.cleanUpClone(clone);
			
			
			this.insertObject(clone, silent);
			return clone;
		},
		
		multiCopy: function(arr, cb){
			console.log("multiCopy!");
			
			var data = this.tv.getData();
			var name, obj, clone;
			var out = [];
			
			
			
			var parent = this.activeGroup;
			this.activeGroup = null;
			
			for(var i=0; i<arr.length; i++){
				obj = arr[i];
				name = obj.name + this.getNewNameId(obj.name, data);
				clone = _.cloneDeep(obj);
				clone.name = name;
				if(parent && obj.id != parent.id){
					console.log("WILL HAVE PARENT", parent);
					this.activeGroup = parent;
				}
				
				
				this.cleanUpClone(clone);
				
				if(cb){
					cb(clone);
				}
				
				out.push(clone);
				
				
				this.insertObject(clone, true, data, true);
				this.activeGroup = null;
			}
			
			this.tv.rootPath = this.project.path
			this.tv.merge(data);
			
			this.update();
			this.sync();
			
			return out;
		},
		
		cleanUpClone: function(obj, inc){
			inc = inc || 0;
			inc++;
			
			if(obj.contents){
				for(var i=0; i<obj.contents.length; i++){
					this.cleanUpClone(obj.contents[i], inc);
				}
			}
			obj.id = "tmp"+this.mkid();
		},
		
		
		deleteSelected: function(){
			var data = this.tv.getData();
			this.selector.forEach(function(obj){
				this.deleteObj(obj.data.id, true, data);
			}, this);
			
			
			this.selector.clear();
			this.tv.merge(data);
			this.ui.events.simulateKey(MT.keys.ESC);
			this.sync();
		},
		
		deleteObj: function(id, silent, data){
			var datax = data || this.tv.getData();
			this._delete(id, datax);
			if(!data){
				this.tv.merge(datax);
			}
			//if using silent.. you should call manually sync
			if(!silent){
				this.ui.events.simulateKey(MT.keys.ESC);
				this.sync();
				this.update();
			}
			
			this.emit(MT.OBJECT_DELETED, id);
		},
		
		_delete: function(id, data){
			for(var i=0; i<data.length; i++){
				if(data[i].id == id){
					data.splice(i, 1)[0];
					break;
				}
				if(data[i].contents){
					this._delete(id, data[i].contents);
				}
			}
		},
		
		getNewNameId: function(name, data, id){
			id = id || 0;
			var tmpName = name;
			if(id > 0){
				tmpName += id;
			}
			
			
			for(var i=0; i<data.length; i++){
				if(data[i].name == tmpName){
					id++;
					id = this.getNewNameId(name, data, id);
				}
			}
			
			return (id > 0 ? id : "");
		},
		
		buildObjectsTree: function(list){
			var that = this;
			this.tv.rootPath = this.project.path;
			this.tv.merge(list);
			
			this.tv.tree.show(this.panel.content.el);
		},
		
		moveFile: function(a, b){
			this.send("moveFile", {
				a: a,
				b: b
			});
		},
		
		update: function(){
			this.emit(MT.OBJECTS_UPDATED, this.tv.getData());
		},
		
		select: function(id){
			this.tv.select(id);
		},
		
		mkid: function(){
			this.id++;
			return this.id;
		},
		
		groupSelected: function(){
			
			var folder = this.createGroup(true, true);
			folder.isClosed = false;
			var that = this;
			
			var data = this.tv.getData();
			
			var map = this.project.plugins.mapeditor;
			map.selector.sort(function(a, b){
				return (b.object.z - a.object.z);
			});
			map.selector.forEach(function(me){
				console.log("GROUP:", me.data.name);
				
				var o = me.data;
				this._delete(o.id, data);
				folder.contents.push(o);
			}, this);
			
			this.tv.merge(data);
			this.sync();
			this.update();
		},
		
		_syncTm: 0,
		sync: function(silent){
			if(this._syncTm){
				window.clearTimeout(this._syncTm);
				this._syncTm = 0;
			}
			var that = this;
			
			this._syncTm = window.setTimeout(function(){
				var data = that.tv.getData();
				var json = JSON.stringify(data);
				if(this._lastData == json){
					that._syncTm = 0;
					return;
				}

				that._lastData = json;
				if(!silent){
					that.emit(MT.OBJECTS_SYNC, data);
				}
				
				that.send("updateData", data);
				that._syncTm = 0;
				that.updateTree();
			}, 100);
		},
		
		_saveTm: 0,
		saveObject: function(obj){
			
			if(this._saveTm){
				window.clearTimeout(this._saveTm);
				this._saveTm = 0;
			}
			var that = this;
			this._saveTm = window.setTimeout(function(){
				that.send("save", obj);
				that.emit(MT.OBJECTS_SYNC, that.tv.getData());
				that.updateTree();
			}, 1000);
		},
		
		getById: function(id){
			var items = this.tv.items;
			for(var i=0; i<items.length; i++){
				if(items[i].data.id == id){
					return items[i].data;
				}
			}
			
			return null;
		}
	}
);
