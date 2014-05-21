MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Stamp = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "stamp";
	},{
		
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
		},
		
		init: function(asset){
			this.map = this.tools.map;
			
			
			this.tools.unselectObjects();
			asset = asset || this.tools.activeAsset;
			
			if(!asset || asset.contents){
				return;
			}
			
			console.log("init stamp");
			
			this.tools.initActiveObject(asset);
			this.tools.setTool(this);
			
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
			
			om.insertObject(this.tools.activeObject.MT_OBJECT);
			
			this.tools.initActiveObject();
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