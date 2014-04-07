MT.require("ui.List");

MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.Tools = function(project){
		MT.core.Emitter.call(this);
		this.activeTool = this.tools.select;
		
		this.project = project;
		
	},
	{
		tools: {
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
			
			this.buttons.select = this.panel.addButtonV("", "tool.select.active", function(){
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
			
			
			this.setTool("select");
			
			var lastKey = 0;
			
			this.ui.events.on("keyup", function(e){
				
				if(lastKey == MT.keys.esc){
					that.setTool("select");
					lastKey = 0;
					return;
				}
				
				
				lastKey = e.which;
				
				window.setTimeout(function(){
					lastKey = 0;
				}, 500);
				
				if(e.which === MT.keys.esc){
					that.deactivateTool();
				}
			});
			
		},
		
		installUI: function(){
			var that = this;
			var am = this.project.plugins.assetsmanager;
			var map = this.map = this.project.plugins.mapeditor;
			var om = this.project.plugins.objectsmanager;
			
			am.tv.on("click", function(asset, element){
					if( (!that["init_"+that.activeTool])){
						if( map.activeObject == null ){
							that.init_stamp(asset);
						}
					}
					else{
						that["init_"+that.activeTool](asset);
					}
			});
			
			
			var select =  function(object){
				if(that["select_"+that.activeTool]){
					that["select_"+that.activeTool](object);
				}
			};
			map.on("select",select);
			
			
			om.tv.on("click",function(data){
				that.setTool(that.tools.select);
				select(map.getById(data.id));
			});
			
		},
		
		lastAsset: null,
		
		
		
		setTool: function(tool){
			if(this.activeTool == tool){
				return;
			}
			
			console.log("active tool", tool);
			
			this.buttons[this.activeTool].removeClass("active");
			
			this.deactivateTool();
			
			
			this.activeTool = tool;
			
			var style = window.getComputedStyle(this.buttons[tool].el);
			
			this.ui.center.style.cursor = style.backgroundImage+",auto";
			
			
			
			this.buttons[this.activeTool].addClass("active");
			
			/*
			if(this["init_"+this.activeTool]){
				this["init_"+this.activeTool]();
			}
			*/
			this.emit("select", tool);
		},
		
		deactivateTool: function(){
			
			if(this["deactivate_"+this.activeTool]){
				this["deactivate_"+this.activeTool]();
			}
			
		},
		
		mouseDown: function(e){
			if(!this["mouseDown_"+this.activeTool]){
				console.log("unknown tool", this.activeTool);
				return;
			}
			
			if(e.button === 2){
				this.previousMouseMove = this.map.handleMouseMove;
				this.mouseDown_hand(e);
				return;
			}
			
			this["mouseDown_"+this.activeTool](e);
		},
		
		
		mouseDown_select: function(e){
			that = this;
			if(this.map.activeObject){
				this.map.handleMouseMove = this.map._objectMove;
			}
			else{
				this.map.handleMouseMove = function(e){
					that.mouseMove_select(e);
				};
				
				this.map.selection.x = e.x - this.map.offsetX;
				this.map.selection.y = e.y - this.map.offsetY;
				
				this.map.selection.sx = e.x - this.map.offsetX;
				this.map.selection.sy = e.y - this.map.offsetY;
				
				this.map.selection.width = 0;
				this.map.selection.height = 0;
				
			}
		},
		
		
		mouseMove_select: function(e){

			
			var x = e.x - this.map.offsetX;
			var y = e.y - this.map.offsetY;
			
			
			if(x > this.map.selection.sx){
				this.map.selection.width = x - this.map.selection.x;
			}
			else{
				this.map.selection.width = this.map.selection.sx - x;
				this.map.selection.x = x;
			}
			
			if(y > this.map.selection.sy){
				this.map.selection.height = y - this.map.selection.y;
			}
			else{
				this.map.selection.height = this.map.selection.sy - y;
				this.map.selection.y = y;
			}
		},
		mouseUp_select: function(e){
			this.map.selection.x -= this.map.game.camera.x;
			this.map.selection.y -= this.map.game.camera.y;
			
			this.map.selectRect(this.map.selection);
			
			this.map.selection.width = 0;
			this.map.selection.height = 0;
			
			this.map.handleMouseMove = this.map.emptyFn;
		},
		
		select_select: function(obj){
			
			var shift = this.ui.events.mouse.lastEvent.shiftKey;
			if(shift){
				if(this.map.isSelected(obj)){
					this.map.removeSelected(obj);
					return;
				}
			}
			
			
			if(this.map.activeObject != obj){
				this.map.activeObject = obj;
			}
			else{
				if(this.map.activeObject != null){
					this.map.activeObject = null;
				}
			}
		},
		
		
		
		initActiveObject: function(asset){
			
			asset = asset || this.lastAsset;
			this.lastAsset = asset;
			
			if(this.activeObject){
				this.map.removeObject(this.activeObject);
			}
			
			var x = this.ui.events.mouse.x;
			var y = this.ui.events.mouse.y;
			var om = this.project.plugins.objectsmanager;
			
			var dx = 0;
			var dy = 0;//this.activeObject.y;
			
			if(this.activeObject){
				dx = this.activeObject.x;
				dy = this.activeObject.y;
			}
			
			this.activeObject =  this.map.createObject(om.createObject(asset));
			this.map.activeObject = this.activeObject;
			
			
			this.activeObject.x = dx || x;
			this.activeObject.y = dy || y;//this.ui.events.mouse.y;
			
			
		},
		
		init_stamp: function(asset){
			if(asset.contents){
				return;
			}
			
			console.log("init stamp");
			
			this.initActiveObject(asset);
			this.setTool(this.tools.stamp);
			
			this.map.handleMouseMove = this.map._followMouse;
		},
		
		mouseDown_stamp: function(e){
			
			if(!this.activeObject){
				if(!this.map.activeObject){
					this.lastAsset = this.project.plugins.assetsmanager.active.data;
					return;
				}
				if(!this.lastAsset){
					this.lastAsset = this.project.plugins.assetsmanager.getById(this.map.activeObject.MT_OBJECT.assetId);
				}
				this.init_stamp(this.lastAsset);
				return;
			}
			
			var om = this.project.plugins.objectsmanager;
			
			this.map.sync(this.activeObject);
			
			om.insertObject(this.activeObject.MT_OBJECT);
			
			this.initActiveObject();
		},
		
		mouseUp_stamp: function(e){
			console.log("upp", e);
		},
		
		deactivate_stamp: function(){
			
			if(this.activeObject){
				this.map.removeObject(this.activeObject);
				this.activeObject = null;
				this.lastAsset = null;
			}
			
			
			this.map.handleMouseMove = this.map.emptyFn;
			this.project.plugins.objectsmanager.update();
		},
		
		
		init_brush: function(asset){
			console.log("init brush");
			if(asset.contents){
				return;
			}
			this.initActiveObject(asset);
			this.setTool(this.tools.brush);
			
			var that = this;
			this.map.handleMouseMove = function(e){
				that.mouseMove_brush(e);
			}
		},
		
		lastX: 0,
		lastY: 0,
		
		
		
		mouseDown_brush: function(e){
			
			if(!this.activeObject){
				if(!this.map.activeObject){
					return;
				}
				if(!this.lastAsset){
					this.lastAsset = this.project.plugins.assetsmanager.getById(this.map.activeObject.MT_OBJECT.assetId);
				}
				this.init_brush(this.lastAsset);
				return;
			}
			
			var om = this.project.plugins.objectsmanager;
			
			this.map.sync(this.activeObject);
			
			om.insertObject(this.activeObject.MT_OBJECT);
			
			this.lastX = this.activeObject.x;
			this.lastY = this.activeObject.y;
			
			this.initActiveObject();
		},
		
		mouseMove_brush: function(e){
			
			if(e.target != this.map.game.canvas){
				return;
			}
			
			var x = this.activeObject.x;
			var y = this.activeObject.y;
			
			this.map._followMouse(e, true);
			
			if(this.ui.events.mouse.down){
				
				if(this.activeObject.x != this.lastX || this.activeObject.y != this.lastY){
					
					console.log("ADD brush");
					
					var om = this.project.plugins.objectsmanager;
					this.map.sync(this.activeObject, this.activeObject.MT_OBJECT);
					om.insertObject(this.activeObject.MT_OBJECT);
					
					this.lastX = this.activeObject.x;
					this.lastY = this.activeObject.y;
					
					
					this.initActiveObject();
					
				}
				
			}
			
			
			
		},
		
		mouseUp_brush: function(e){
			console.log("upp", e);
			
		},
		
		
		deactivate_brush: function(){
			
			if(this.activeObject){
				this.map.removeObject(this.activeObject);
				this.activeObject = null;
				this.lastAsset = null;
			}
			
			
			this.map.handleMouseMove = this.map.emptyFn;
			this.project.plugins.objectsmanager.update();
		},
		
		
		mouseDown_hand: function(e){
			this.map.handleMouseMove = this.map._cameraMove;
		},
		
		mouseUp: function(e){
			
			if(e.button == 2){
				this.map.handleMouseMove = this.previousMouseMove;
				return;
			}
			
			
			if(!this["mouseUp_"+this.activeTool]){
				console.log("reset up");
				this.map.handleMouseMove = this.map.emptyFn;
				return;
			}
			
			
			this["mouseUp_"+this.activeTool](e);
		},
		

		
		
		
	}
);