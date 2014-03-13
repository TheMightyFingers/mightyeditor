MT.require("plugins.Project");

MT(
	MT.plugins.PluginController = function(ui, socket){
		
		var Project = new MT.plugins.Project();
		
		if(ui){
			Project.initUI(ui);
		}
		if(socket){
			Project.initSocket(socket);
		}
		
		
	},
	{
		
		
		
		
	}
);
