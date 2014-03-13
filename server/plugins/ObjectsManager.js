MT.require("core.FS");

MT.extend("core.SocketManager")(
	MT.plugins.ObjectsManager = function(socket, project){
		MT.core.SocketManager.call(this, socket, "ObjectsManager");
		this.project = project;
		
		this.fs = MT.core.FS;
		
		var that = this;
		this.data = [];
		
	},
	{
		update: function(){
			this.dbfile = this.project.path + "/objects.js";
			this.fs.readFile(that.dbfile, function(err, contents){
				that.data = JSON.parse(contents);
				that.a_sendData();
			});
			
		},
		a_sendData: function(){
			that.sendMyGroup("receive", this.data);
		},
		
		a_updateData: function(data){
			this.data = data;
			this.fs.writeFile(this.dbfile, JSON.stringify(data), function(){
				console.log("saved data", p);
				that.a_sendData();
			});
			
		}
	}
);
