"use strict";

MT.require("ui.List");
MT.require("plugins.tools.Select");
MT.require("plugins.tools.Stamp");
MT.require("plugins.tools.Brush");
MT.require("plugins.tools.Text");
MT.require("plugins.tools.TileTool");
MT.require("plugins.tools.Physics");

MT.TOOL_SELECTED = "TOOL_SELECTED";


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
			"Text": MT.plugins.tools.Text,
			"TileTool": MT.plugins.tools.TileTool,
			"Physics": MT.plugins.tools.Physics
		};
		
		this.tmpObject = null;
		this.activeAsset = null;
		this.activeFrame = 0;
	},
	{
		
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("toolbox",this.ui.left);
			this.panel.addClass("toolbox");
			this.panel.removeHeader();
			this.panel.width = 40;
			this.panel.isResizeable = false;
			this.panel.isDockable = true;
			
			
			ui.dockToLeft(this.panel);
		},
		
		installUI: function(){
			var that = this;
			var am = this.project.plugins.assetmanager;
			var map = this.map = this.project.plugins.mapeditor;
			var om = this.om = this.project.plugins.objectmanager;
			
			for(var i in this.toolsAvailable){
				this.tools[i.toLowerCase()] = new this.toolsAvailable[i](this);
			}
			
			
			am.on(MT.ASSET_SELECTED, function(asset, element){
				that.activeAsset = asset;
				that.activeFrame = am.activeFrame;
				that.emit(MT.ASSET_SELECTED, asset);
			});
			
			am.on(MT.ASSET_UNSELECTED, function(asset){
				that.activeAsset = null;
				that.emit(MT.ASSET_UNSELECTED, asset);
			});
			
			am.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				that.activeAsset = asset;
				that.activeFrame = frame;
				that.emit(MT.ASSET_FRAME_CHANGED, asset, frame);
			});
			
			var select =  function(object){
				if(!object){
					console.error("Failed to select an object");
					return;
				}
				that.select(object);
			};
			
			map.on(MT.TOOL_SELECTED, select);
			
			om.on(MT.OBJECT_SELECTED, function(data){
				select(map.getById(data.id));
			});
			
			map.selector.on("select", function(obj){
				that.emit(MT.OBJECT_SELECTED, obj);
			});
			
			map.selector.on("unselect", function(obj){
				that.emit(MT.OBJECT_UNSELECTED, obj);
				
				if(map.selector.count !== 1){
					window.setTimeout(function(){
						if(map.selector.count == 1){
							var obj = map.selector.get(0);
							this.map.activeObject = null;
							map.selector.emit("select", obj);
							this.map.activeObject = obj;
						}
					}, 0);
				}
			});
			
			om.on(MT.OBJECTS_UPDATED, function(){
				that.emit(MT.OBJECTS_UPDATED);
			});
			
			var lastKey = 0;
			
			var toCopy = [];
			this.ui.events.on(this.ui.events.KEYDOWN, function(e){
				if(e.target == document.body && e.ctrlKey && e.which == MT.keys.D){
					e.preventDefault();
					e.stopPropagation();
				}
			});
			this.ui.events.on(this.ui.events.KEYUP, function(e){
				
				if(lastKey == MT.keys.ESC){
					that.setTool(that.tools.select);
					window.getSelection().removeAllRanges();
					lastKey = 0;
					return;
				}
				
				
				if(e.which == MT.keys.DELETE){
					var ap = that.ui.pickPanelGlobal();
					if(!ap){
						return;
					}
					
					if(ap == that.map.panel || ap == om.panel){
						var data = om.tv.getData();
						
						that.map.selector.forEach(function(obj){
							om.deleteObj(obj.id, true, data);
							om.selector.clear();
						});
						
						om.tv.merge(data);
						
						om.sync();
						om.update();
						return;
					}
					if(ap === am.panel){
						am.confirmDeleteSelected();
					}
					
					return;
				}
				
				lastKey = e.which;
				
				window.setTimeout(function(){
					lastKey = 0;
				}, 500);
				
				if(e.which === MT.keys.ESC){
					that.activeTool.deactivate();
				}
				
				
				var copyStarted = {
					x: 0,
					y: 0
				};
				
				// copy / paste
				if(e.ctrlKey){
					if(e.which === MT.keys.C){
						toCopy.length = 0;
						
						map.selector.forEach(function(obj){
							toCopy.push(obj);
						});
						
						toCopy.sort(function(a, b){
							return (map.loadedObjects.indexOf(a) - map.loadedObjects.indexOf(b));
						});
						return;
					}
					
					if(e.which === MT.keys.V && e.target == document.body){
						var x = that.ui.events.mouse.lastEvent.x;
						var y = that.ui.events.mouse.lastEvent.y;
						
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
						that.map.selector.clear();
						var cop = null;
						for(var i=0; i<toCopy.length; i++){
							
							if(!e.shiftKey){
								bounds = toCopy[i].getBounds();
								cop = that.copy(toCopy[i].data, bounds.x - midX + (x - map.offsetX) / map.scale.x, bounds.y - midY + (y - map.offsetY) / map.scale.y);
							}
							else{
								cop = that.copy(toCopy[i].data, toCopy[i].data.x, toCopy[i].data.y);
							}
							
							that.map.selector.add(cop);
						}
					}
					
					if(e.which == MT.keys.D && e.target == document.body){
						that.duplicate();
						e.preventDefault();
					}
					
					
				}
				else if(e.target.tagName != "INPUT" && e.target.tagName != "TEXTAREA") {
					var tools = Object.keys(that.tools);
					if(e.which == "1".charCodeAt(0)){
						that.setTool(that.tools[tools[0]]);
					}
					if(e.which == "2".charCodeAt(0)){
						that.setTool(that.tools[tools[1]]);
					}
					if(e.which == "3".charCodeAt(0)){
						that.setTool(that.tools[tools[2]]);
					}
					if(e.which == "4".charCodeAt(0)){
						that.setTool(that.tools[tools[3]]);
					}
					if(e.which == "5".charCodeAt(0)){
						that.setTool(that.tools[tools[4]]);
					}
				}
			});
			
			for(var i in this.tools){
				this.tools[i].initUI(this.ui);
			}
			
			this.setTool(this.tools.select);
		},
		
		lastAsset: null,
		
		duplicate: function(){
			var tcp = [], cop, that = this, map = this.map;
			map.selector.forEach(function(obj){
				tcp.push(obj);
			});
			tcp.sort(function(a, b){
				return (map.loadedObjects.indexOf(a) - map.loadedObjects.indexOf(b));
			});
			
			that.map.selector.clear();
			for(var i=0; i<tcp.length; i++){
				cop = that.copy(tcp[i].data, tcp[i].data.x, tcp[i].data.y);
				that.map.selector.add(cop);
			}
		},
		
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
		
		setTool: function(tool, skipNotify){
			if(this.activeTool == tool){
				return;
			}
			var oldTool = null;
			if(this.activeTool){
				oldTool = this.activeTool;
				this.activeTool = null;
				oldTool.button.removeClass("active");
			}
			
			this.activeTool = tool;
			this.activeTool.button.addClass("active");
			
			if(oldTool){
				oldTool.deactivate();
			}
			
			
			this.activeTool.init(skipNotify);
			this.emit(MT.TOOL_SELECTED, tool);
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
		
		mouseMove: function(e){
			this.activeTool.mouseMove(e);
		},
		
		lastSelected: null,
		
		selectObject: function(obj, clear){
			/*if(this.lastSelected && this.lastSelected == obj && this.map.activeObject){
				return;
			}
			this.lastSelected = obj;*/
			if(clear){
				this.map.selector.clear();
			}
			
			this.map.activeObject = obj;
			this.map.selector.add(obj);
			
			// next line will be launched from selector listeer
			// this.emit(MT.OBJECT_SELECTED, obj);
		},
		
		
		initTmpObject: function(asset){
			
			asset = asset || this.lastAsset;
			this.lastAsset = asset;
			
			
			
			var x = this.ui.events.mouse.x;
			var y = this.ui.events.mouse.y;
			var om = this.project.plugins.objectmanager;
			
			var dx = 0;
			var dy = 0;
			
			if(this.tmpObject){
				dx = this.tmpObject.x;
				dy = this.tmpObject.y;
			}
			
			if(!this.tmpObject){
				this.tmpObject = new MT.core.MagicObject(om.createObject(asset), this.map.game.world, this.map);
			}
			else{
				this.tmpObject.update(om.createObject(asset));
			}
			//this.tmpObject =  this.map.createObject();
			this.map.activeObject = this.tmpObject;
			
			
			this.tmpObject.x = dx || x;
			this.tmpObject.y = dy || y;
			
			this.tmpObject.bringToTop();
		},
		
		removeTmpObject: function(){
			if(this.tmpObject){
				this.tmpObject.hide();
			}
			
			if(this.map.activeObject == this.tmpObject){
				this.map.activeObject = null;
			}
			this.tmpObject = null;
		},

		
		
		
		mouseDown_hand: function(e){
			this.map.handleMouseMove = this.map._cameraMove;
		},
		

		

		unselectObjects: function(){
			var toUnselect = [];
			this.map.selector.forEach(function(obj){
				if(!obj.data.contents){
					toUnselect.push(obj);
				}
			});
			
			for(var i=0; i<toUnselect.length; i++){
				this.map.selector.remove(toUnselect[i]);
			}
			this.map.activeObject = null;
		},
		
		hide: function(){
			this.object.visible = false;
		},
	}
);