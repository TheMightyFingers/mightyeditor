"use strict"
MT.require("plugins.MapEditor");

MT(
	MT.plugins.MovieMaker = function(project){
		this.project = project;
		MT.core.BasicPlugin.call(this, "movie");
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = this.ui.createPanel("timeline");
			this.panel.setFree();
			this.el = this.panel.content;
			this.panel.on("click", function(e){
				console.log(e.target);
			});
		},
		installUI: function(){
			//this.ui.joinPanels(this.project.plugins.mapeditor.panel, this.panel);
			//this.project.plugins.mapeditor.panel.show();
			var span = null;
			var div = null;
			this.layers = [];
			this.om = this.project.plugins.objectmanager;
			var that = this;
			this.om.on(MT.OBJECT_SELECTED, function(obj){
				
				if(obj.type == MT.objectTypes.MOVIE_CLIP){
					console.log("object selected", obj.id);
					that.buildKeyFrames(obj);
				}
			});
			
			this.tv = new MT.ui.TreeView([], {
				root: this.project.path,
				showHide: true,
				lock: true
			});
			
			this.addPanels();
			
			//var d = document.createElement("div");
			//this.panel.content.el.appendChild(d);
			
			
			this.tv.show(this.leftPanel.content.el);
		},
   
		addPanels: function(){
			
			this.leftPanel = this.ui.createPanel("me-layers");
			this.rightPanel = this.ui.createPanel("me-frames");
			
			this.leftPanel.addClass("borderless");
			this.leftPanel.hide().show(this.el.el);
			
			this.leftPanel.fitIn();
			this.leftPanel.width = 200;
			this.leftPanel.style.setProperty("border-right", "solid 1px #000");
			this.leftPanel.isResizeable = true;
			this.leftPanel.removeHeader();
			
			
			
			
			this.rightPanel.addClass("borderless");
			this.rightPanel.hide().show(this.el.el);
			
			this.rightPanel.fitIn();
			this.rightPanel.style.left = 200+"px";
			this.rightPanel.style.width = "auto";
			this.rightPanel.removeHeader();
			
			this.rightPanel.content.style.overflow = "hidden";
			var that = this;
			this.leftPanel.on("resize", function(w, h){
				that.rightPanel.style.left = w +"px";
			});
		},
   
		buildKeyFrames: function(obj){
			this.tv.merge(obj.contents);
		}
	}
);