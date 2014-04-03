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
				that.setTool("move");
			});
			
			this.buttons.select = this.panel.addButtonV("", "tool.select", function(){
				that.setTool("select");
			});
			
			this.buttons.stamp = this.panel.addButtonV("", "tool.stamp", function(){
				that.setTool("stamp");
			});
			
			this.buttons.brush = this.panel.addButtonV("", "tool.brush", function(){
				that.setTool("brush");
			});
			
			this.buttons.delete = this.panel.addButtonV("", "tool.delete", function(){
				that.setTool("delete");
			});
			
			
			this.setTool("move");
			
			var lastKey = 0;
			
			this.ui.events.on("keyup", function(e){
				
				if(lastKey == MT.keys.esc){
					that.setTool("move");
					lastKey = 0;
					return;
				}
				
				
				lastKey = e.which;
				
				window.setTimeout(function(){
					lastKey = 0;
				}, 500);
				
				if(e.which === MT.keys.esc){
					that.activeObject = null;
					that.lastAsset = null;
					if(that._md_stamp){
						that.map.off(that._md_stamp);
					}
					that.project.plugins.objectsmanager.update();
				}
			});
			
		},
		
		installUI: function(){
			var that = this;
			var am = this.project.plugins.assetsmanager;
			var map = this.map = this.project.plugins.mapeditor;
			var om = this.project.plugins.objectsmanager;
			
			am.tv.on("click", function(asset, element){
					if( (that.activeTool != that.tools.stamp && map.activeObject == null) || that.activeTool == that.tools.stamp){
						that.initStamp(asset);
					}
					//else{
						//do nothing?
					//}
			});
			
			
		},
		
		lastAsset: null,
		
		_initStampTime: 0,
		initStamp: function(asset){
			this._initStampTime = Date.now();
			asset = asset || this.lastAsset;
			this.lastAsset = asset;
			
			var om = this.project.plugins.objectsmanager;
			
			this.activeObject = this.map.createActiveObject(om.createObject(asset));
			
			this.activeObject.x = this.ui.events.mouse.x;
			this.activeObject.y = this.ui.events.mouse.y;
			
			this.setTool(this.tools.stamp);
			
			this.map.handleMouseMove = this.map._followMouse;
		},
		
		
		setTool: function(tool){
			if(this.activeTool == tool){
				return;
			}
			
			this.buttons[this.activeTool].removeClass("active");
			
			if(this["deactivate_"+this.activeTool]){
				this["deactivate_"+this.activeTool]();
			}
			
			this.activeTool = tool;
			
			var style = window.getComputedStyle(this.buttons[tool].el);
			
			this.ui.center.style.cursor = style.backgroundImage+",auto";
			
			
			
			this.buttons[this.activeTool].addClass("active");
			
			
			this.emit("select", tool);
		},

		
		mouseDown: function(e){
			if(!this["mouseDown_"+this.activeTool]){
				console.log("unknown tool", this.activeTool);
				return;
			}
			
			if(e.button === 2){
				this.mouseDown_hand(e);
				return;
			}
			
			this["mouseDown_"+this.activeTool](e);
			
			
		},
		
		mouseDown_move: function(e){
			if(this.map.activeObject){
				this.map.handleMouseMove = this.map._objectMove;
			}
			else{
				this.map.handleMouseMove = this.map.emptyFn;
			}
		},
		
		_md_stamp: null,
		mouseDown_stamp: function(e){
			
			if(!this.activeObject){
				if(!this.map.activeObject){
					return;
				}
				this.activeObject = this.map.activeObject;
				if(!this.lastAsset){
					this.lastAsset = this.project.plugins.assetsmanager.getById(this.activeObject.MT_OBJECT.assetId);
				}
				this.initStamp(this.lastAsset);
				return;
			}
			
			console.log(">>>>stamp added!!!!");
			
			var that = this;
			
			var om = this.project.plugins.objectsmanager;
			this.map.sync(this.activeObject);
			
			if(this._md_stamp){
				this.map.off(this._md_stamp);
			}
			
			this._md_stamp = function(map){
				that.initStamp();
				console.log("reinit stamp");
				
			};
			this.map.on("objectsAdded", this._md_stamp);
			
			
			
			om.insertObject(this.activeObject.MT_OBJECT);
		},
		
		mouseDown_hand: function(e){
			this.map.handleMouseMove = this.map._cameraMove;
		},
		
		
		mouseUp: function(e){
			if(!this["mouseUp_"+this.activeTool] || e.button == 2){
				console.log("reset up");
				
				this.map.handleMouseMove = this.map.emptyFn;
				return;
			}
			
			
			this["mouseUp_"+this.activeTool](e);
		},
		
		mouseUp_stamp: function(e){
			console.log("upp", e);
			
			
		},
		
		deactivate_stamp: function(){
			if(this._md_stamp){
				this.map.off(this._md_stamp);
			}
			
			this.map.handleMouseMove = this.map.emptyFn;
			this.project.plugins.objectsmanager.update();
		},
		
		
		
		
		
		
	}
);