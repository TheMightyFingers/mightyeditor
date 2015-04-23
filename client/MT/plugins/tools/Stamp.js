MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Stamp = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "stamp";
	},{
		
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			var that = this;
			this.tools.on(MT.ASSET_SELECTED, function(asset){
				if(that.tools.activeTool != that){
					return;
				}
				that.init(asset);
				that.tools.tmpObject.frame = 0;
			});
			
			this.tools.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				if(that.tools.activeTool != that){
					return;
				}
				that.init(asset);
				that.tools.tmpObject.frame = frame;
			});
			
			this.tools.on(MT.TOOL_SELECTED, function(){
				if(that.tools.activeTool != that){
					return;
				}
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
		mouseMove: function(e){
			
			if(e.target != this.tools.map.game.canvas){
				return;
			}
			
			if(!this.tools.tmpObject){
				return;
			}

			this.tools.map._followMouse(e, false);
		},
		mouseDown: function(e){
			
			if(!this.tools.tmpObject){
				if(!this.map.activeObject){
					if(this.project.plugins.assetmanager.active){
						this.tools.lastAsset = this.project.plugins.assetmanager.active.data;
					}
					return;
				}
				if(!this.tools.lastAsset){
					this.tools.lastAsset = this.project.plugins.assetmanager.getById(this.map.activeObject.data.assetId);
				}
				this.init(this.tools.lastAsset);
				return;
			}
			
			var om = this.project.plugins.objectmanager;
			
			this.map.sync(this.tools.tmpObject);
			
			this.tools.tmpObject.data.frame = this.tools.activeFrame;
			
			var newObj = om.insertObject(_.cloneDeep(this.tools.tmpObject.data));
			
			this.tools.initTmpObject();
			this.tools.tmpObject.frame = this.tools.activeFrame;
			
			this.tools.tmpObject.x = newObj.x;
			this.tools.tmpObject.y = newObj.y;
			
			
			this.tools.tmpObject.object.bringToTop();
			
			//this.tools.unselectObjects();
		},
		
		mouseUp: function(e){
			
		},
		
		deactivate: function(){
			
			this.tools.removeTmpObject();
			
			this.map.handleMouseMove = this.map.emptyFn;
			this.project.plugins.objectmanager.update();
		},
	}
);