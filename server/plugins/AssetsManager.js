MT.require("core.FS");


MT.extend("core.SocketManager")(
	MT.plugins.AssetsManager = function(socket, project){
		MT.core.SocketManager.call(this, socket, "Assets");
		this.project = project;
		
		this.db = this.project.db.get("assets");
		this.fs = MT.core.FS;
		
	},
	{
		a_sendFiles: function(){
			this.sendMyGroup("receiveFileList", this.db.contents);
		},
		
		a_newFolder: function(name){
			this.db.count++;
			name = name.split("\\").join("/");
			
			console.log("assets" + name);
			
			if(name.substring(0, 1) !== "/"){
				name = "/"+name;
			}
			
			var item = this.project.db.get("assets" + name);
			var iname = name.split("/").pop();
			
			item.name = iname;
			item.id = this.db.count;
			
			console.log("newFolder", name, item);
			this.project.db.save();
			this.a_sendFiles();
		},
		
		a_moveFile: function(files){
			console.log("files",files);
			this.project.db.move("assets"+files.a, "assets"+files.b);
			this.project.db.save();
			this.a_sendFiles();
		},
		
		a_updateData: function(data){
			console.log("updateData");
			this.db.contents = data;
			this.project.db.save();
			this.sendMyGroup("receiveFileList", this.db.contents);
		},
		
		a_delete: function(id){
			this.delete(id);
			this.a_sendFiles();
		},
		
		delete: function(id, data){
			console.log("delete", id);
			var data = data || this.db.contents;
			var item = null;
			item = this._delete(id, data);
			if(item){
				if(item.contents){
					for(var i=0; i<item.contents.length; i++){
						if(this.delete(item.contents[i].id, item.contents)){
							i--;
						}
					}
				}
				console.log("delete", item);
				if(!item.contents){
					this.fs.rm(this.project.path + "/" + item.__image);
				}
			}
			return item;
		},
		
		_delete: function(id, data){
			var ret = null;
			
			for(var i=0; i<data.length; i++){
				if(data[i].id == id){
					console.log("FOUND:", id);
					
					return data.splice(i, 1)[0];
				}
				if(data[i].contents){
					ret = this._delete(id, data[i].contents);
				}
			}
			return ret;
		},
		
		a_newImage: function(data){
			var that = this;
			
			var path = data.path.split("/");
			var name = path.pop();
			var ext = name.split(".").pop();;
			var folder = this.project.db.get("assets"+path.join("/"));
			
			this.db.count++;
			
			
			var p = this.project.path  + "/" + this.db.count + "." + ext;
			var im = {
				__image: this.db.count + "." + ext
			};
			
			for(var i in data){
				if(i == "data"){
					continue;
				}
				im[i] = data[i];
			}
			
			this.addItem(folder, im);
			
			this.fs.writeFile(p, new Buffer(data.data, "binary"), function(){
				that.a_sendFiles();
			});
			
		},
		
		
		addItem: function(folder, data){
			data.id = this.db.count;
			//console.log("new item", data.name, data.id);
			
			folder.contents.push(data);
			this.project.db.save();
		}
	}
);
