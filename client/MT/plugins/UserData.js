/* default view depends on settings plugin */

MT.require("ui.TableView");
MT(
	MT.plugins.UserData = function(project){
		this.project = project;
		this.table = new MT.ui.TableView(null, ["key", "value"]);
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("userData");
			this.panel.setFree();
			
		},
		installUI: function(){
			var plugins = this.project.plugins;
			var tools = plugins.tools;
			var that = this;
			
			var updateData = function(obj){
				if(!obj.userData){
					obj.userData = {};
				}
				that.table.setData(obj.userData);
				that.table.show(that.panel.content.el);
			};
			
			tools.on(MT.ASSET_FRAME_CHANGED, updateData);
			tools.on(MT.OBJECT_SELECTED, updateData);
			
			
			this.ui.events.on("keyup", function(e){
				if(e.which == MT.keys.ESC){
					that.table.hide();
				}
			});
			
			this.table.on("change", function(){
				
			});
			
			this.ui.joinPanels(this.project.plugins.settings.panel, this.panel);
			this.project.plugins.settings.panel.show();
		}
	}
);