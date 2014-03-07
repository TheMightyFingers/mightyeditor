
MT.require("plugins.MapEditor");
MT.require("plugins.AssetsManager");


MT(
	MT.plugins.PluginController = function(ui){
		
		var MapEditor = new MT.plugins.MapEditor();
		var AssetsManager = new MT.plugins.AssetsManager();
		
		if(ui){
			AssetsManager.initUI(ui);
			MapEditor.initUI(ui);
			
		}
		
		
	},
	{
		
		
		
		
	}
);
