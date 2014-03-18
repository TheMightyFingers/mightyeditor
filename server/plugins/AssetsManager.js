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
		
		a_newImage: function(data){
			var that = this;
			
			
			var path = data.path.split("/");
			
			var name = path.pop();
			
			
			
			var ext = name.split(".").pop();;
			
			var folder = this.project.db.get("assets"+path.join("/"));
			
			
			console.log("assets"+path, folder);
			
			
			console.log(ext);
			
			var p = this.project.path  + "/" + this.db.count + "." + ext;
			data.image = this.db.count + "." + ext;
			
			//remove ../client
			//data.image.shift();
			//data.image.shift();
			
			//data.image = data.image.join("/");
			
			console.log("SAVING IMAGE:", p);
			
			that.addItem(folder, data);
			
			this.fs.writeFile(p, new Buffer(data.data, "binary"), function(){
				that.a_sendFiles();
			});
			
		},
		
		addItem: function(folder, data){
			this.db.count++;
			
			var d = {
				name: data.name, 
				id: this.db.count,
				__image: data.image
			};
			
			
			folder.contents.push(d);
		}
	}
);
