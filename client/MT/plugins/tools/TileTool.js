MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.TileTool = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "tileTools";
	},{
		
		initUI: function(ui){
			this.panel = ui.createPanel("Tile tools");
			this.panel.setFree();
			this.panel.hide();
			
			var that = this;
			this.tools.on("selectObject", function(obj){
				that.select(obj);
			});
			this.tools.on("unselectedObject", function(){
				that.panel.hide();
			});
		},
		select: function(obj){
			if(obj.MT_OBJECT.type != MT.objectTypes.TILE_LAYER){
				return;
			}
			this.panel.show();
			console.log("select", obj);
		}

	}
);