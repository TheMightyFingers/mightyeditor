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
			this.addIndices(data);
			
			
			this.data.contents = data;
			this.a_sendData();
		},
		
		addIndices: function(data, id){
			id = id || 0;
			for(var i=0; i<data.length; i++){
				id++;
				if(data[i].contents){
					id = this.addIndices(data[i].contents, id);
					continue;
				}
				if(data[i].id){
					id = data[i].id;
					continue;
				}
				data[i].id = id;
				
			}
			
			
		}
	}
);
