MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Stamp = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "stamp";
		this.activeFrame = 0;
	},{
		
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			var that = this;
			this.tools.on("assetSelected", function(asset){
				if(that.tools.activeTool != that){
					return;
				}
				that.init(asset);
			});
			
			this.activeFrame = 0;
			this.tools.on("changeFrame", function(asset, frame){
				console.log("change Frame");
				that.activeFrame = frame;
				if(that.tools.activeTool != that){
					return;
				}
				
				that.tools.initActiveObject(that.tools.activeAsset);
				that.tools.activeObject.frame = frame;
			});
			
			this.tools.on("update", function(){
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
			this.activeFrame = 0;
			this.tools.initActiveObject(asset);
			
			this.map.handleMouseMove = this.map._followMouse;
		},
		
		mouseDown: function(e){
			
			if(!this.tools.activeObject){
				if(!this.map.activeObject){
					if(this.project.plugins.assetsmanager.active){
						this.tools.lastAsset = this.project.plugins.assetsmanager.active.data;
					}
					return;
				}
				if(!this.tools.lastAsset){
					this.tools.lastAsset = this.project.plugins.assetsmanager.getById(this.map.activeObject.MT_OBJECT.assetId);
				}
				this.init(this.tools.lastAsset);
				return;
			}
			
			var om = this.project.plugins.objectsmanager;
			
			this.map.sync(this.tools.activeObject);
			
			this.tools.activeObject.MT_OBJECT.frame = this.activeFrame;
			om.insertObject(this.tools.activeObject.MT_OBJECT);
			
			this.tools.initActiveObject();
			this.tools.activeObject.frame = this.activeFrame;
			this.tools.unselectObjects();
		},
		
		mouseUp: function(e){
			console.log("upp", e);
		},
		
		deactivate: function(){
			
			if(this.tools.activeObject){
				this.map.removeObject(this.tools.activeObject);
				this.tools.activeObject = null;
				this.tools.lastAsset = null;
			}
			
			this.map.handleMouseMove = this.map.emptyFn;
			this.project.plugins.objectsmanager.update();
		},
	}
);