MT.require("ui.TreeView");
MT.require("ui.List");

MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.ObjectsManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "ObjectsManager");
		this.project = project;
		
		
		
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.addPanel("Objects");
			
			var that = this;
			
			this.list = new MT.ui.List([
				{
					label: "new group",
					className: "",
					cb: function(){
						that.newFolder();
					}
				}
			], ui, true);
			
			this.options = new MT.ui.Button(null, "ui-options", ui.events, function(){
				if(!that.list.isVisible){
					that.list.show(that.panel.content.el);
				}
				else{
					that.list.hide();
				}
			});
			
			
			this.panel.header.addChild(this.options);
			this.options.style.width = "33px";
			this.options.style.left = "auto";
			
			this.tv = new MT.ui.TreeView([], this.project.path);
			this.tv.onChange = function(oldItem, newItem){
				console.log("change", oldItem, newItem);
				that.update();
			};
			
			this.tv.sortable(this.ui.events);
			this.tv.tree.show(this.panel.content.el);
			
			
			var select = function(data, element){
				
				if(that.active){
					that.active.removeClass("selected");
				}
				
				that.active = element;
				that.active.addClass("selected");
			};
			
			this.tv.on("click", select);
			this.tv.on("select", select);
			
			this.ui.events.on("keyup", function(e){
				if(e.which == MT.keys.delete){
					if(that.active){
						that.deleteObj(that.active.data.id);
					}
				}
				
			});
			
		},
		
		
		installUI: function(ui){
			var that = this;
			
			var map = this.project.plugins.mapeditor;
			
			map.on("select", function(sprite){
				if(sprite == null){
					if(that.active){
						that.active.removeClass("selected");
					}
					that.active = null;
					return;
				}
				
				that.tv.select(sprite.MT_OBJECT.id);
			});
			
			map.on("sync", function(){
				//that.sync();
			});
		},
		
		a_receive: function(data){
			this.tv.merge(data);
			
			this.emit("afterSync", this.tv.getData());
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
		
		insertObject: function(obj){
			var data = this.tv.getData();
			
			//if(obj.id){
				obj.id = "tmp"+Date.now();
			//}
			
			obj.name = obj.tmpName + this.getNewNameId(obj.tmpName, data, 0);
			data.push(obj);
			
			this.tv.rootPath = this.project.path
			this.tv.merge(data);
			
			this.update();
			this.sync();
			
		},
		
		createObject: function(obj, x, y){
			x = x || 0;
			y = y || 0;
			
			
			var data = this.tv.getData();
			var name = obj.name.split(".");
			name.pop();
			name = name.join("");

			return  {
				assetId: obj.id,
				__image: obj.__image,
				x: x,
				y: y,
				anchorX: 0.5,
				anchorY: 0.5,
				angle: 0,
				alpha: 1,
				tmpName: name,
				frame: 0
			};
		},
		
		deleteObj: function(id){
			console.log("delete", id);
			var data = this.tv.getData();
			for(var i=0; i<data.length; i++){
				if(data[i].id == id){
					data.splice(i, 1);
					break;
				}
			}
			this.tv.merge(data);
			
			this.ui.events.simulateKey(MT.keys.esc);
			
			this.sync();
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
		
		newFolder: function(){
			var data = this.tv.getData();
			
			var tmpName= "Group";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			data.unshift({
				name: name,
				x: 0,
				y: 0,
				angle: 0,
				contents: []
			});
			
			this.tv.merge(data);
			this.sync();
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
				if(!silent){
					that.emit("beforeSync", data);
				}
				
				that.send("updateData", data);
				that._syncTm = 0;
			}, 10);
		}
	}
);
