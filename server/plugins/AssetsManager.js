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
			
			var item = this.project.db.get("assets/" + name);
			var iname = name.split("/").pop();
			
			item.name = iname;
			item.id = this.db.count;
			
			console.log("newFolder", name, item);
			this.a_sendFiles();
		},
		
		a_moveFile: function(files){
			console.log("files",files);
			this.project.db.move("assets"+files.a, "assets"+files.b);
			this.a_sendFiles();
		},
		
		a_updateData: function(data){
			console.log("updateData");
			this.db.contents = data;
			this.sendMyGroup("receiveFileList", this.db.contents);
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
		}
	}
);
