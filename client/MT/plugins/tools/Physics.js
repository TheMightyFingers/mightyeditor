MT.extend("core.BasicTool")(
	MT.plugins.tools.Physics = function(tools){
		this.tools = tools;
		this.enabled = false;
		this.name = "physics";
	},
	{
		initUI: function(){
			var that = this;
			this.button = this.tools.panel.addButton("", "tool.physics", function(){
				//that.tools.setTool(that);
				if(that.enabled){
					that.enabled = false;
					that.button.removeClass("active");
					that.tools.project.plugins.mapeditor.disablePhysics();
				}
				else{
					that.button.addClass("active");
					that.enabled = true;
					that.tools.project.plugins.mapeditor.enablePhysics();
				}
			}, this.getTooltip());
			
		},

	}
);