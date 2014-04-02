MT.require("ui.List");

MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.Tools = function(project){
		MT.core.Emitter.call(this);
		this.activeTool = this.tools.select;
		
		this.project = project;
		
	},
	{
		tools: {
			move: "move",
			select: "select",
			brush: "brush",
			stamp: "stamp"
		},
		initUI: function(ui){
			this.ui = ui;
			this.panel = this.ui.addPanel("",this.ui.left);
			this.panel.addClass("toolbox");
			this.panel.removeHeader();
			
			
			var that = this;
			this.buttons = {};
			
			this.buttons.move = this.panel.addButtonV("", "tool.move", function(){
				console.log("move");
				that.setTool("move");
			});
			this.buttons.select = this.panel.addButtonV("", "tool.select", function(){
				console.log("select");
				that.setTool("select");
			});
			this.buttons.brush = this.panel.addButtonV("", "tool.brush", function(){
				console.log("brush");
				
				that.setTool("brush");
			});
			this.buttons.stamp = this.panel.addButtonV("", "tool.stamp", function(){
				console.log("stamp");
				
				that.setTool("stamp");
			});
			
			this.setTool("move");
			
		},
		
		installUI: function(){
			var that = this;
			var am = this.project.plugins.assetsmanager;
			var map = this.project.plugins.mapeditor;
			var om = this.project.plugins.objectsmanager;
			
			am.tv.on("click", function(asset, element){
				//console.log("selected", obj, b);
				if(map.activeObject == null){
					that.initStamp(asset);
				}
				else{
					//do nothing?
				}
			});
			
		},
		
		lastAsset: null,
		initStamp: function(asset){
			asset = asset || this.lastAsset;
			this.lastAsset = asset;
			
			var am = this.project.plugins.assetsmanager;
			var map = this.project.plugins.mapeditor;
			var om = this.project.plugins.objectsmanager;
			
			this.setTool(this.tools.stamp);
			var sprite = map.createActiveObject(om.createObject(asset));
			map.follow(sprite);
			
		},
		
		
		setTool: function(tool){
			this.buttons[this.activeTool].removeClass("active");
			
			
			this.activeTool = tool;
			var style = window.getComputedStyle(this.buttons[tool].el);
			
			console.log(style.backgroundImage);
			
			this.ui.center.style.cursor = style.backgroundImage+",auto";
			
			
			this.buttons[this.activeTool].addClass("active");
			
			this.emit("select", tool);
			
			//console.log(tool, "im"+this.buttons[tool].el.style.backgroundImage);
			//window.bb = this.buttons[tool];
			
		}


	}
);