MT.require("plugins.AssetsManager");
MT.require("core.JsonDB");

MT.extend("core.SocketManager")(
	MT.Project = function(socket){
		MT.core.SocketManager.call(this, socket, "Project");
		
		this.assets = new MT.plugins.AssetsManager(socket);
		
		this.db = new MT.core.JsonDB("data/JsonDB.json");
		
		
	},
	{
		newProject: function(){
			
			
			this.path = "../client/data/projects";
			
			this.assets.sendFiles(this.path);
			
			
		},
		loadProject: function(id){
			console.log("loading Project", id);
		}
	}
);