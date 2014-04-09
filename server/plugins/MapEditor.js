MT.extend("core.SocketManager")(
	MT.plugins.MapEditor = function(socket, project){
		MT.core.SocketManager.call(this, socket, "MapEditor");
		this.project = project;
		this.data = this.project.db.get("map");
	},
	{
		readData: function(){
			this.a_sendData();
		},
		a_sendData: function(){
			this.sendMyGroup("receive", this.data.contents[0]);
		},
		
		a_updateData: function(data){
			this.data.contents[0] = data;
			this.project.db.save();
			this.a_sendData();
		}
	}
);
