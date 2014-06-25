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
	TILE_LAYER: 3
};


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.ObjectsManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "ObjectsManager");
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
		},
		
		
		installUI: function(ui){
			var that = this;
			
			var tools = this.project.plugins.tools;
			
			
			tools.on("selectedObject", function(id){
				var el = that.tv.getById(id);
				
				if(el){
					if(el.isFolder){
						that.activeGroup = el.data;
					}
					el.addClass("selected.active");
					that.selector.add(el);
				}
			});
			
			tools.on("unselectedObject", function(id){
				var el = that.tv.getById(id);
				if(el){
					if(that.activeGroup && that.activeGroup.id == id){
						that.activeGroup = null;
					}
					el.removeClass("selected.active");
					that.selector.remove(el);
				}
			});

			this.ui.events.on("mouseup", function(e){
				that.sync();
			});
			
			this.tv.on("deleted", function(o){
				that.selector.remove(o);
			});
			
		},
		
		
		received: false,
		
		a_receive: function(data, silent){
			
			if(this.received && !silent){
				return;
			}
			
			this.received = true;
			this.tv.merge(data);
			
			if(!silent){
				this.emit("afterSync", this.tv.getData());
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
			
			arr.splice(0,0,obj);
			
			if(!silent){
				this.tv.rootPath = this.project.path
				this.tv.merge(data);
				this.update();
				this.sync();
				this.emit("added", obj.name);
			}
			
			return data;
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
				angle: 0,
				contents: [],
				isVisible: 1,
				isLocked: 0,
				isFixedToCamera: 0
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
				heightInTiles: 10
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
			this.ui.events.simulateKey(MT.keys.esc);
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
				this.ui.events.simulateKey(MT.keys.esc);
				this.sync();
				this.update();
			}
			
			this.emit("deleted", id);
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
			this.emit("update", this.tv.getData());
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
					that.emit("beforeSync", data);
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
