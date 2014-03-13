
MT.require("plugins.MapEditor");
MT.require("plugins.AssetsManager");

MT.require("plugins.Project");


MT(
	MT.plugins.PluginController = function(ui, socket){
		
		//var MapEditor = new MT.plugins.MapEditor();
		//var AssetsManager = new MT.plugins.AssetsManager();
		var Project = new MT.plugins.Project();
		
		if(ui){
			//AssetsManager.initUI(ui);
			//MapEditor.initUI(ui);
			Project.initUI(ui);
		}
		if(socket){
			//AssetsManager.initSocket(socket);
			Project.initSocket(socket);
		}
		
		
	},
	{
		
		
		
		
	}
);
