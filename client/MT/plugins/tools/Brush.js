MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Brush = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "brush";
	},{
		
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			var that = this;
			
			this.tools.on(MT.ASSET_SELECTED, function(asset){
				if(that.tools.activeTool != that){
					return;
				}
				that.init(asset);
			});
			
			this.tools.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				if(that.tools.activeTool != that){
					return;
				}
				
				that.init(asset);
				that.tools.tmpObject.frame = that.tools.activeFrame;
				
			});
			
			this.tools.on(MT.OBJECT_SELECTED, function(){
				if(that.tools.activeTool != that){
					return;
				}
				if(!that.tools.tmpObject){
					return;
				}
				that.tools.initTmpObject();
			});
		},
		
		lastX: 0,
		lastY: 0,
		
		init: function(asset){
			this.map = this.tools.map;
			this.tools.unselectObjects();
			
			asset = asset || this.tools.activeAsset;
			
			var that = this;
			this.tools.map.handleMouseMove = function(e){
				that.mouseMove(e);
			}
			
			if(!asset || asset.contents){
				return;
			}
			
			this.tools.initTmpObject(asset);
			this.tools.tmpObject.frame = this.tools.activeFrame;
			
		},
		
		
		mouseDown: function(e){
			
			if(!this.tools.tmpObject){
				if(!this.tools.map.activeObject){
					return;
				}
				if(!this.tools.lastAsset){
					this.tools.lastAsset = this.project.plugins.assetmanager.getById(this.tools.map.activeObject.data.assetId);
				}
				this.init(this.tools.lastAsset);
				
				return;
			}
			
			this.insertObject();
		},
		
		mouseMove: function(e){
			
			if(e.target != this.tools.map.game.canvas){
				return;
			}
			
			if(!this.tools.tmpObject){
				return;
			}
			
			var x = this.tools.tmpObject.x;
			var y = this.tools.tmpObject.y;
			
			this.tools.map._followMouse(e, true);
			
			if(this.ui.events.mouse.down){
				
				if(this.tools.tmpObject.x != this.lastX || this.tools.tmpObject.y != this.lastY){
					this.insertObject();
					
				}
			}
		},
		
		insertObject: function(){
			var om = this.project.plugins.objectmanager;
			this.tools.map.sync(this.tools.tmpObject, this.tools.tmpObject.data);
			
			this.tools.tmpObject.data.frame = this.tools.activeFrame;
			om.insertObject(_.cloneDeep(this.tools.tmpObject.data));
			
			this.lastX = this.tools.tmpObject.x;
			this.lastY = this.tools.tmpObject.y;
			this.tools.initTmpObject();
			
			this.tools.tmpObject.frame = this.tools.activeFrame;
			this.tools.tmpObject.x = this.lastX;
			this.tools.tmpObject.y = this.lastY;
			this.tools.tmpObject.object.bringToTop();
		},
		
		mouseUp: function(e){
			
		},
		
		deactivate: function(){
			this.tools.removeTmpObject();
			
			this.tools.map.handleMouseMove = this.tools.map.emptyFn;
			this.project.plugins.objectmanager.update();
		},
		
		

	}
);