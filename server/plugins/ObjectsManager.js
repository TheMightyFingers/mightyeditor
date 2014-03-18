MT.require("core.FS");

MT.extend("core.SocketManager")(
	MT.plugins.ObjectsManager = function(socket, project){
		MT.core.SocketManager.call(this, socket, "ObjectsManager");
		this.project = project;
		
		this.fs = MT.core.FS;
		
		var that = this;
		this.data = this.project.db.get("objects");
		
	},
	{
		readData: function(){
			this.a_sendData();
		},
		a_sendData: function(){
			this.sendMyGroup("receive", this.data.contents);
		},
		
		a_updateData: function(data){
			this.data.contents = data;
			this.a_sendData();
		}
	}
);
