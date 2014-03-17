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
		readData: function(){
			return;
			var that = this;
			
			this.dbfile = this.project.path + "/objects.js";
			console.log("reading data", this.dbfile);
			this.fs.readFile(this.dbfile, function(err, contents){
				if(err){
					that.data = [];
					that.a_sendData();
					return;
				}

				that.data = JSON.parse(contents);
				that.a_sendData();
			});
			
		},
		a_sendData: function(){
			return;
			this.sendMyGroup("receive", this.data);
		},
		
		a_updateData: function(data){
			return;
			this.data = data;
			var that = this;
			this.fs.writeFile(this.dbfile, JSON.stringify(data), function(){
				console.log("saved data", data);
				that.a_sendData();
			});
			
		}
	}
);
