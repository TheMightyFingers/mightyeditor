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
			
			var that = this;
			this.sendMyGroup("receiveFileList", this.db.contents);
		},
		
		a_newFolder: function(name){
			this.project.db.get("assets/"+name);
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
			var p = this.project.path  + "/" + this.db.count + "." + ext;
			
			data.__image = this.db.count + "." + ext;
			that.addItem(folder, data);
			
			this.fs.writeFile(p, new Buffer(data.data, "binary"), function(){
				that.a_sendFiles();
			});
			
		},
		
		addItem: function(folder, data){
			this.db.count++;
			
			data.id = this.db.count;
			
			folder.contents.push(data);
		}
	}
);
