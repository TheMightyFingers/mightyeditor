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
MT.OBJECTS_RECEIVED = "OBJECTS_RECEIVED";

MT.OBJECTS_UPDATED = "OBJECTS_UPDATED";
MT.OBJECTS_SYNC = "OBJECTS_SYNC";


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.ObjectManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "om");
		this.project = project;
		
		this.selector = new MT.core.Selector();
		
		this.id = Date.now();
		
		this.activeGroup = null;
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("Objects");
			this.panel.setFree();
			
			var that = this;
			
			this.panel.addOptions([
				{
					label: "Add Group",
					className: "",
					cb: function(){
						that.createGroup();
						that.panel.options.list.hide();
					}
				},
				{
					label: "Add Movie Clip",
					className: "",
					cb: function(){
						that.createMovieClip();
						that.panel.options.list.hide();
					}
				},
				{
					label: "Add TileLayer",
					className: "",
					cb: function(){
						that.createTileLayer();
						that.panel.options.list.hide();
					}
				},
				{
					label: "Group Selected Objects",
					className: "",
					cb: function(){
						that.groupSelected();
						that.panel.options.list.hide();
					}
				},
				{
					label: "Delete Selected Objects",
					className: "",
					cb: function(){
						that.deleteSelected();
						that.panel.options.list.hide();
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
			
			
			this.tv.on("show", function(item){
				that.update();
			});
			
			this.tv.on("lock", function(item){
				that.update();
			});
			
			this.tv.on("click", function(data, el){
				that.emit(MT.OBJECT_SELECTED, data);
			});
			
			
		},
		
		
		installUI: function(ui){
			var that = this;
			
			var tools = this.project.plugins.tools;
			
			tools.on(MT.OBJECT_SELECTED, function(obj){
				var el = that.tv.getById(obj.id);
				
				if(el){
					if(el.isFolder){
						that.activeGroup = el.data;
					}
					el.addClass("selected.active");
					that.selector.add(el);
				}
			});
			
			tools.on(MT.OBJECT_UNSELECTED, function(obj){
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

			ui.events.on(ui.events.MOUSEUP, function(e){
				that.sync();
			});
			
			this.tv.on("deleted", function(o){
				that.selector.remove(o);
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
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		//add object from asset
		addObject: function( e, obj ){
			if(obj.contents){
				return;
			}
			var no = this.createObject(obj, e.offsetX, e.offsetY);
			this.insertObject(no);
		},
		
		
		insertObject: function(obj, silent, data){
			data = data || this.tv.getData();
			
			
			obj.id = "tmp"+this.mkid();
			
			obj.tmpName = obj.tmpName || obj.name;
			
			var arr = data;
			if(this.activeGroup){
				arr = this.activeGroup.contents;
			}
			
			obj.name = obj.tmpName + this.getNewNameId(obj.tmpName, arr, 0);
			
			arr.splice(0, -1, obj);
			
			obj.index = -1;
			
			if(!silent){
				this.tv.rootPath = this.project.path
				this.tv.merge(data);
				this.update();
				this.sync();
				this.emit(MT.OBJECT_ADDED, obj);
			}
			
			console.log(obj);
			
			return obj;
		},
		
		createObject: function(asset, x, y){
			x = x || 0;
			y = y || 0;
			
			
			var data = this.tv.getData();
			var name = asset.name.split(".");
			name.pop();
			name = name.join("");
			
			return  {
				assetId: asset.id,
				__image: asset.__image,
				x: x,
				y: y,
				type: MT.objectTypes.SPRITE,
				anchorX: asset.anchorX,
				anchorY: asset.anchorY,
				userData: JSON.parse(JSON.stringify(asset.userData || {})),
				physics: JSON.parse(JSON.stringify(asset.physics || {})),
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				alpha: 1,
				tmpName: name,
				frame: 0,
				isVisible: 1,
				isLocked: 0
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
		
		createGroup: function(silent){
			var data = this.tv.getData();
			
			var tmpName= "Group";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
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
				alpha: 1
			};
			
			data.unshift(group);
			
			this.tv.merge(data);
			
			if(!silent){
				this.update();
				this.sync();
			}
			return group;
		},
		
		createMovieClip: function(silent){
			var data = this.tv.getData();
			
			var tmpName= "Movie";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			var group = {
				id: "tmp"+this.mkid(),
				name: name,
				x: 0,
				y: 0,
				type: MT.objectTypes.MOVIE_CLIP,
				angle: 0,
				contents: [],
				isVisible: 1,
				isLocked: 0,
				isFixedToCamera: 0,
				alpha: 1
			};
			
			data.unshift(group);
			
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
				tileWidth: 64,
				tileHeight: 64,
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
			var clone = JSON.parse(JSON.stringify(obj));
			clone.name = name;
			clone.x = x;
			clone.y = y;
			
			
			this.cleanUpClone(clone);
			
			
			this.insertObject(clone, silent);
			return clone;
		},
		
		multiCopy: function(arr, cb){
			var data = this.tv.getData();
			var name, obj, clone;
			var out = [];
			
			for(var i=0; i<arr.length; i++){
				obj = arr[i];
				name = obj.name + this.getNewNameId(obj.name, data);
				clone = JSON.parse(JSON.stringify(obj));
				clone.name = name;
				this.cleanUpClone(clone);
				
				if(cb){
					cb(clone);
				}
				
				out.push(clone);
				this.insertObject(clone, true, data);
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
		
		cleanSelection: function(){
			
		},
		
		mkid: function(){
			this.id++;
			
			return this.id;
		},
		
		groupSelected: function(){
			var folder = this.createGroup(true);
			var that = this;
			
			var data = this.tv.getData();
			
			this.selector.forEach(function(el){
				var o = el.data;
				this._delete(o.id, data);
				
				folder.contents.push(o);
				
			}, this);
			
			this.tv.merge(data);
			this.send("updateData", data);
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
					this._syncTm = 0;
					return;
				}
				
				this._lastData = json;
				if(!silent){
					that.emit(MT.OBJECTS_SYNC, data);
				}
				
				that.send("updateData", data);
				that._syncTm = 0;
			}, 100);
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
