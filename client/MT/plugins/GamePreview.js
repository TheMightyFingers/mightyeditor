MT.extend("core.BasicPlugin")(
	MT.plugins.GamePreview = function(project){
		this.project = project;
	},
	{
		initUI: function(ui){
			
			return;
			this.ui = ui;
			this.panel = this.ui.createPanel("GamePreview");
			this.el = this.panel.content;
		},

		installUI: function(){
			
			return;
			this.ui.joinPanels(this.project.plugins.mapeditor.panel, this.panel);
			this.project.plugins.mapeditor.panel.show();
			
			var that = this;
			var ampv = that.project.plugins.assetmanager.preview;
			var tools = that.project.plugins.tools;
			var zoombox = this.project.plugins.mapmanager.panel;
			var undoredo = this.project.plugins.undoredo;
			this.panel.on("show", function(){
				tools.panel.content.hide();
				zoombox.hide();
				ampv.hide();
				undoredo.disable();
				MT.events.simulateKey(MT.keys.ESC);
				
				that.addButtons(tools.panel);
			});
			this.panel.on("unselect", function(){
				tools.panel.content.show();
				zoombox.show();
				ampv.show();
				undoredo.enable();
				window.getSelection().removeAllRanges();
				
				that.removeButtons();
			});
		},
		
		addButtons: function(){
			
		},
		
		removeButtons: function(){
			
		}




	}
);