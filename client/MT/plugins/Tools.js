MT.require("ui.List");
MT.require("plugins.tools.Select");
MT.require("plugins.tools.Stamp");
MT.require("plugins.tools.Brush");
MT.require("plugins.tools.Text");


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.Tools = function(project){
		MT.core.Emitter.call(this);
		
		
		this.project = project;
		
		this.tools = {};
		
		//var tools = MT.plugins.tools;
		this.toolsAvailable = {
			"select": MT.plugins.tools.Select,
			"Stamp": MT.plugins.tools.Stamp,
			"Brush": MT.plugins.tools.Brush,
			"Text": MT.plugins.tools.Text
		};
		


	},
	{
		
		initUI: function(ui){
			this.ui = ui;
			this.panel = this.ui.addPanel("",this.ui.left);
			this.panel.addClass("toolbox");
			this.panel.removeHeader();
					
		
			for(var i in this.toolsAvailable){
				this.tools[i.toLowerCase()] = new this.toolsAvailable[i](this);
			}
		
			return;
		},
		
		installUI: function(){
			var that = this;
			var am = this.project.plugins.assetsmanager;
			var map = this.map = this.project.plugins.mapeditor;
			var om = this.om = this.project.plugins.objectsmanager;
			
			am.tv.on("click", function(asset, element){
				that.activeAsset = asset;
				that.activeTool.init(asset);
			});
			
			
			var select =  function(object){
				that.select(object);
			};
			map.on("select",select);
			
			
			om.tv.on("click",function(data){
				//that.setTool(that.tools.select);
				select(map.getById(data.id));
			});
			
			
			
			map.selector.on("select", function(obj){
				that.emit("selectedObject", obj.MT_OBJECT.id);
			});
			
			map.selector.on("unselect", function(obj){
				that.emit("unselectedObject", obj.MT_OBJECT.id);
			});
			
			om.on("update", function(){
				if(map.activeObject){
					select(map.activeObject);
				}
			});
			
			var lastKey = 0;
			
			var toCopy = [];
			
			this.ui.events.on("keyup", function(e){
				
				if(lastKey == MT.keys.esc){
					that.setTool(that.tools.select);
					lastKey = 0;
					return;
				}
				
				
				if(e.which == MT.keys.delete){
					
					var data = om.tv.getData();
					
					that.map.selector.forEach(function(obj){
						om.deleteObj(obj.MT_OBJECT.id, true, data);
						om.selector.clear();
					});
					
					om.tv.merge(data);
					
					om.sync();
					om.update();
					return;
				}
				
				lastKey = e.which;
				
				window.setTimeout(function(){
					lastKey = 0;
				}, 500);
				
				if(e.which === MT.keys.esc){
					that.activeTool.deactivate();
				}
				
				
				var copyStarted = {
					x: 0,
					y: 0
				};
				
				if(e.ctrlKey){
					if(e.which === MT.keys.C){
						toCopy.length = 0;
						map.selector.forEach(function(obj){
							toCopy.push(obj);
						});
						
						return;
					}
					
					if(e.which === MT.keys.V){
						var x = that.ui.events.mouse.lastEvent.x;
						var y = that.ui.events.mouse.lastEvent.y;
						that.map.selector.clear();
						
						var bounds = null;
						var midX = 0;
						var midY = 0;
						
						for(var i=0; i<toCopy.length; i++){
							bounds = toCopy[i].getBounds();
							midX += bounds.x;
							midY += bounds.y;
						}
						
						midY /= toCopy.length;
						midX /= toCopy.length;
						
						for(var i=0; i<toCopy.length; i++){
							bounds = toCopy[i].getBounds();
							that.copy(toCopy[i].MT_OBJECT, bounds.x - midX + x - map.offsetX, bounds.y - midY + y - map.offsetY);
							that.map.selector.add(this.map.getById(toCopy[i].id));
						}
					}
				}
			});
			
			
			
			
			for(var i in this.tools){
				this.tools[i].initUI(this.ui);
			}
			
			
			this.setTool(this.tools.select);
			
		},
		
		lastAsset: null,
		
		
		select: function(object){
			this.tools.select.select(object);
			if(this.activeTool != this.tools.select){
				this.activeTool.select(object);
			}
			
		},
		
		copy: function(toCopy, x, y){
			if(Array.isArray(toCopy)){
				for(var i=0; i<toCopy.length; i++){
					this.copy(toCopy[i], x, y);
				}
				return;
			}
			
			
			
			var tc = this.om.copy(toCopy, x, y);
			var sprite = this.map.getById(tc.id);
			
			
			
			this.om.sync();
			
			return sprite;
		},
		
		setTool: function(tool){
			if(this.activeTool == tool){
				return;
			}
			
			if(this.activeTool){
				this.activeTool.button.removeClass("active");
				this.activeTool.deactivate();
			}
			
			this.activeTool = tool;
			this.activeTool.button.addClass("active");
			this.activeTool.init()
			this.emit("select", tool);
		},
		
		mouseDown: function(e){
			if(e.button === 2){
				this.previousMouseMove = this.map.handleMouseMove;
				this.mouseDown_hand(e);
				return;
			}
			
			this.activeTool.mouseDown(e);
		},
		
		mouseUp: function(e){
			
			if(e.button == 2){
				this.map.handleMouseMove = this.previousMouseMove;
				return;
			}
			
			this.activeTool.mouseUp(e);
		},
		
		selectObject: function(obj, clear){
			
			if(clear){
				this.map.selector.clear();
			}
			
			this.map.selector.add(obj);
			this.map.activeObject = obj;
			
			this.emit("selectObject", obj);
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
			var dy = 0;
			
			if(this.activeObject){
				dx = this.activeObject.x;
				dy = this.activeObject.y;
			}
			
			this.activeObject =  this.map.createObject(om.createObject(asset));
			this.map.activeObject = this.activeObject;
			
			
			this.activeObject.x = dx || x;
			this.activeObject.y = dy || y;
			
			
		},
		
		
		
		
		
		
		
		mouseDown_hand: function(e){
			this.map.handleMouseMove = this.map._cameraMove;
		},
		

		

		unselectObjects: function(){
			var toUnselect = [];
			this.map.selector.forEach(function(obj){
				if(!obj.MT_OBJECT.contents){
					toUnselect.push(obj);
				}
			});
			
			for(var i=0; i<toUnselect.length; i++){
				this.map.selector.remove(toUnselect[i]);
			}
			
		},
		
		
	}
);