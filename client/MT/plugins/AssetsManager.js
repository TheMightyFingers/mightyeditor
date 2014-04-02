MT.require("ui.TreeView");
MT.require("ui.List");

MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.AssetsManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "Assets");
		this.project = project;
		
		this.active = null;
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.addPanel("Assets");
			window.am = this;
			var that = this;
			
			this.list = new MT.ui.List([
				{
					label: "new Folder",
					className: "",
					cb: function(){
						that.newFolder();
					}
				},
				{
					label: "Another options",
					className: "",
					cb: function(){
						console.log("new Folder");
					}
				}
			
			], ui, true);
			
			this.options = new MT.ui.Button(null, "ui-options", ui.events, function(){
				console.log("open options");
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
			
			ui.events.on("drop", function(e){
				that.handleFiles(e);
			});
			
			this.tv = new MT.ui.TreeView([], this.project.path);
			this.tv.onChange = function(oldItem, newItem){
				console.log("updated", oldItem, " -> ", newItem);
				if(oldItem && newItem){
					that.moveFile(oldItem, newItem);
				}
			};
			
			this.tv.sortable(this.ui.events);
			this.tv.tree.show(this.panel.content.el);
			
			
			this.tv.onDrop(function(e, item, last){
				if(e.target == that.project.map.game.canvas){
					that.project.om.addObject(e, item.data);
					return false;
				}
			});
			
			this.tv.on("click", function(data, element){
				console.log("select");
				
				
				if(data.contents){
					
					return;
				}
				
				if(that.active){
					that.active.removeClass("selected");
				}
				
				that.active = element;
				that.active.addClass("selected");
				
				var o = that.project.map.activeObject;
				if(o){
					o.MT_OBJECT.assetId = data.id;
					o.MT_OBJECT.__image = data.__image;
					that.project.plugins.objectsmanager.update();
				}
			});
			
			var prev = new MT.ui.DomElement();
			prev.width = 200;
			prev.height = 200;
			prev.addClass("ui-preview");
			
			
			this.tv.on("mouseover", function(e, el){
				var data = el.data;
				if(data.__image){
					prev.show(document.body);
					prev.width = data.width;
					prev.height = data.height;
					prev.x = el.calcOffsetX() - data.width;
					prev.y = el.calcOffsetY() - (data.height*0.5 - el.el.offsetHeight*0.5);
					prev.style.backgroundImage = "url('"+that.project.path + "/" +data.__image+"')";
				}
			});
			this.tv.on("mouseout", function(e, el){
				prev.hide();
			});
			ui.events.on("keydown", function(e){
				var w = e.which;
				if(w == 27){
					if(!that.active){
						return;
					}
					that.active.removeClass("selected");
					that.active = null;
				}
			});
			
		},
		
		installUI: function(ui){
			
			var that = this;
			
			this.project.map.on("select", function(sprite){
				if(sprite == null){
					if(that.active){
						that.active.removeClass("selected");
					}
					return;
				}
				var obj = sprite.MT_OBJECT;
				that.tv.select(obj.assetId);
			});
			
			this.project.om.tv.on("click", function(obj){
				if(obj.contents){
					if(that.active){
						that.active.removeClass("selected");
						that.active = null;
						that.tv.select(null);
					}
					return;
				}
				that.tv.select(obj.assetId);
			});
		},
		
		update: function(){
			var data = this.tv.getData();
			this.emit("update", data);
		},
		
		a_receiveFileList: function(list){
			this.buildAssetsTree(list);
			this.update();
		},
		
		handleFiles: function(e){
			var that = this;
			var files = e.dataTransfer.files;
			
			for(var i=0; i<files.length; i++){
				var entry = (e.dataTransfer.items[i].getAsEntry ? e.dataTransfer.items[i].getAsEntry() : e.dataTransfer.items[i].webkitGetAsEntry());
				this.handleEntry(entry);
			}
		},
		
		handleEntry: function(entry){
			var that = this;
			
			if (entry.isFile) {
				entry.file(function(file){
					that.uploadImage(file, entry.fullPath);
					
				});
			} else if (entry.isDirectory) {
				this.send("newFolder", entry.fullPath);
				
				var reader = entry.createReader();
				reader.readEntries(function(ev){
					for(var i=0; i<ev.length; i++){
						that.handleEntry(ev[i]);
					}
				});
			}
		},
		
		uploadImage: function(file, path){
			
				var fr  = new FileReader();
				var that = this;
				fr.onload = function(){
					var img = new Image();
					img.onload = function(){
						
						var data = {
							data: fr.result,
							name: file.name,
							path: path,
							width: img.width,
							height: img.height,
							frameWidth: img.width,
							frameHeight: img.height,
							frameMax: -1,
							margin: 0,
							spacing: 0
						};
						
						that.send("newImage", data);
					};
					img.src = "data:image/png;base64,"+btoa(fr.result);
				};
				
				fr.readAsBinaryString(file);
			
			
			
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		updateData: function(){
			this.send("updateData", this.tv.getData());
		},
   
		buildAssetsTree: function(list){
			console.log("list", list);
			
			
			var that = this;
			list.sort(function(a,b){
				var inca = ( a.contents ? 1000 : 0);
				var incb = ( b.contents ? 1000 : 0);
				var res = (a.name > b.name ? 1 : -1);
				return res + incb-inca;
			});
			

			this.tv.rootPath = this.project.path;
			this.tv.merge(list);
		},
		
		moveFile: function(a, b){
			this.send("moveFile", {
				a: a,
				b: b
			});
		},
		
		newFolder: function(){
			var data = this.tv.getData();
			
			var tmpName= "new folder";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			data.unshift({
				name: name,
				contents: []
			});
			
			this.send("newFolder", name);
			
			this.tv.merge(data);
		}
	}
);
