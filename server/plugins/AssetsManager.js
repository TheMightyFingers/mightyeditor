MT.require("core.FS");


MT.extend("core.SocketManager")(
	MT.plugins.AssetsManager = function(socket, project){
		MT.core.SocketManager.call(this, socket, "Assets");
		this.project = project;
		
		
		this.fs = MT.core.FS;
		
	},
	{
		a_sendFiles: function(){
			var that = this;
			
			MT.core.FS.readdir(this.project.path, true, function(data){
				that.sendMyGroup("receiveFileList", data);
			});
		},
		
		a_newFolder: function(name){
			var that = this;
			console.log("new folder", name);
			this.fs.mkdir(this.project.path + "/" + name, function(){
				that.a_sendFiles();
			});
		},
		
		a_moveFile: function(files){
			var that = this;
			this.fs.move(this.project.path + files.a, this.project.path + files.b, function(){
				that.a_sendFiles();
			});
		},
		
		a_newImage: function(data){
			var that = this;
			console.log("SAVING IMAGE:", this.project.path);
			
			var p = this.project.path  + data.path;
			this.fs.writeFile(p, new Buffer(data.data, "binary"), function(){
				console.log("saved image", p);
				that.a_sendFiles();
			});
		}
	}
);
