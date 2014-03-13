MT.require("ui.TreeView");
MT.require("ui.List");

MT.extend("core.BasicPlugin")(
	MT.plugins.AssetsManager = function(project){
		MT.core.BasicPlugin.call(this, "Assets");
		this.project = project;
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
			
			], ui);
			
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
			//this.options.x = this.panel.el.offsetWidth - this.options.width;
			
			//this.buildAssetsTree();
			ui.events.on("drop", function(e){
				
				console.log(e.dataTransfer.files);
				
				
				that.handleFiles(e);
			});
		},
		
		a_receiveFileList: function(list){
			this.buildAssetsTree(list);
			
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
				this.send("newFolder", entry.name);
				
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
				var data = {
					data: this.result,
					name: file.name,
					path: path
				};
				that.send("newImage", data);
			};
			
			fr.readAsBinaryString(file);
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		
		
		handleSocket: function(list){
			
			
		},
   
		buildAssetsTree: function(list){
			var that = this;
			list.sort(function(a,b){
				var inca = ( a.contents ? 1000 : 0);
				var incb = ( b.contents ? 1000 : 0);
				var res = (a.name > b.name ? 1 : -1);
				return res + incb-inca;
			});
			
			if(!this.tv){
				this.tv = new MT.ui.TreeView(list, this.project.path);
				this.tv.onChange = function(oldItem, newItem){
					console.log("updated", oldItem, " -> ", newItem);
					that.moveFile(oldItem, newItem);
				};
				this.tv.sortable(this.ui.events);
			}
			else{
				this.tv.rootPath = this.project.path;
				this.tv.merge(list);
			}
			
			
			
			this.tv.tree.show(this.panel.content.el);
			
			
			
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
