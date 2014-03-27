MT.require("ui.TreeView");
MT.require("ui.List");

MT.extend("core.BasicPlugin")(
	MT.plugins.AssetsManager = function(project){
		MT.core.BasicPlugin.call(this, "Assets");
		this.project = project;
		this._onUpdate = [];
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
			this.options.addClass();
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
			
		},
		
		onUpdate: function(cb){
			this._onUpdate.push(cb);
		},
		
		update: function(){
			var data = this.tv.getData();
			for(var i=0; i<this._onUpdate.length; i++){
				this._onUpdate[i](data);
			}
			
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
		
		
		
		handleSocket: function(list){
			
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
