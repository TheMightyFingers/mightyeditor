MT.require("ui.TreeView");

MT(
	MT.plugins.AssetsManager = function(){
		
		
	},
	{
		initUI: function(ui){
			this.panel = ui.addPanel("Assets");
			this.buildAssetsTree();
		},
		
		buildAssetsTree: function(){
			var test = [
				"main1",
				"asset2",
				"group/asset1",
				"group/asset2"
			];
			
			
			var tv = new MT.ui.TreeView(test);
			
			tv.tree.show(this.panel.content.el);
			
			
			
		}
	}
);
