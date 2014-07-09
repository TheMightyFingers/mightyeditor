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
			});
			
			this.tools.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				console.log("change Frame");
				if(that.tools.activeTool != that){
					return;
				}
				
				that.tools.initTmpObject(that.tools.activeAsset);
				that.tools.tmpObject.frame = frame;
			});
			
			this.tools.on(MT.TOOL_SELECTED, function(){
				if(that.tools.activeTool != that){
					return;
				}
			});
		},
		
		init: function(asset){
			
			this.map = this.tools.map;
			
			this.tools.unselectObjects();
			asset = asset || this.tools.activeAsset;
			
			if(!asset || asset.contents){
				return;
			}
			this.tools.initTmpObject(asset);
			this.tools.tmpObject.frame = this.tools.activeFrame;
			
			
			this.map.handleMouseMove = this.map._followMouse;
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
					this.tools.lastAsset = this.project.plugins.assetmanager.getById(this.map.activeObject.MT_OBJECT.assetId);
				}
				this.init(this.tools.lastAsset);
				return;
			}
			
			var om = this.project.plugins.objectmanager;
			
			this.map.sync(this.tools.tmpObject);
			
			this.tools.tmpObject.MT_OBJECT.frame = this.tools.activeFrame;
			
			var newObj = om.insertObject(this.tools.tmpObject.MT_OBJECT);
			
			this.tools.initTmpObject();
			this.tools.tmpObject.frame = this.tools.activeFrame;
			
			this.tools.tmpObject.x = newObj.x;
			this.tools.tmpObject.y = newObj.y;
			
			//this.tools.unselectObjects();
		},
		
		mouseUp: function(e){
			console.log("upp", e);
		},
		
		deactivate: function(){
			
			this.tools.removeTmpObject();
			
			this.map.handleMouseMove = this.map.emptyFn;
			this.project.plugins.objectmanager.update();
		},
	}
);