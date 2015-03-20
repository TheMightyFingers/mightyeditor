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
			this.activeObject = null;
			
			var updateData = function(obj){
				if(!obj){
					return;
				}
				if(!obj.userData){
					obj.userData = {};
				}
				that.table.setData(obj.userData);
				that.table.show(that.panel.content.el);
				that.activeObject = obj;
			};
			
			tools.on(MT.ASSET_FRAME_CHANGED, function(obj){
				
			});
			tools.on(MT.OBJECT_SELECTED, function(mo){
				updateData(mo.data);
				that.type = "object";
			});
			
			plugins.assetmanager.on(MT.ASSETS_UPDATED, function(){
				if(that.type == "asset"){
					updateData(plugins.assetmanager.getById(that.activeObject.id));
				}
			});
			
			
			var clear = function(){
				that.table.hide();
			};
			/*
			this.ui.events.on("keyup", function(e){
				if(e.which == MT.keys.ESC){
					clear();
				}
			});
			*/
			tools.on(MT.OBJECT_UNSELECTED, clear);
			
			
			this.ui.joinPanels(this.project.plugins.settings.panel, this.panel);
			this.project.plugins.settings.panel.show();
		}
	}
);