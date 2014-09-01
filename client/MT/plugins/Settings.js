MT.require("ui.Input");

MT(
	MT.plugins.Settings = function(project){
		
		this.project = project;
		this.inputs = [];
		
		
		this.objects = {};
		
		this.activeId = 0;
	},
	{
		initUI: function(ui){
			this.panel = ui.createPanel("Settings");
			this.panel.setFree();
			var that = this;
			
			ui.events.on("keyup", function(e){
				if(e.which == MT.keys.ESC){
					that.clear();
					that.active
				}
			});
			this.panel.header.addClass("ui-wrap");
		},
		
		installUI: function(){
			var that = this;
			this.project.plugins.tools.on(MT.ASSET_FRAME_CHANGED, function(obj, frame){
				that.handleAssets(obj);
			});
			this.project.plugins.tools.on(MT.OBJECT_SELECTED, function(obj){
				that.handleObjects(obj);
				that.active = obj.id;
			});
			
			var map = this.project.plugins.mapeditor;
			map.on("select", function(obj){
				if(!obj){
					that.handleScene(map.settings);
				}
			});
			
		},
   
		handleClick: function(obj){
			
			
		},
   
		clear: function(){
			var stack = this.inputs[this.stack];
			for(var i in stack){
				stack[i].hide();
			}
			this.stack = "";
			this.lastObj = null;
			return;
			
			this.panel.title = "Settings";
			for(var i=0; i<this.inputs.length; i++){
				this.inputs[i].remove();
			}
			this.inputs.length = 0;
			
		},
		
		addInput: function(key, object, right, cb){
			if(!this.inputs[this.stack]){
				this.inputs[this.stack] = {};
			}
			
			var stack = this.inputs[this.stack];
			var k = key;
			if(typeof key !== "string"){
				k = key.key;
			}
			if(stack[k]){
				stack[k].setObject(object);
				stack[k].show();
				return stack[k];
			}
			
			
			var p = this.panel.content;
			
			var fw = new MT.ui.Input(this.project.ui, key, object);
			fw.show(p.el);
			
			fw.style.position = "relative";
			fw.style.height = "20px";
			
			stack[k] = fw;
			
			fw.on("change", cb);
			return fw;
		},
		
   
		lastObj: null,
		handleAssets: function(obj){
			if(obj.contents !== void(0)){
				return;
			}
			
			if(this.lastObj == obj){
				return;
			}
			this.lastObj = obj;
			
			var that = this;
			this.clear();
			
			this.panel.title = obj.name;
			
			var that = this;
			var cb = function(){
				that.project.am.updateData();
			};
			
			if(!obj.key){
				obj.key = obj.fullPath;
			}
			
			this.stack = "assets";
			this.addInput( {key: "key", type: "text"}, obj, false, cb);
			this.addInput( {key: "frameWidth", step: 1, min: 1}, obj, false, cb);
			this.addInput( {key: "frameHeight", step: 1, min: 1}, obj, true, cb);
			this.addInput( "frameMax", obj, false, cb);
			this.addInput( {key: "margin", step: 1, min: 0} , obj, true, cb);
			this.addInput( {key: "spacing", step: 1, min: 0}, obj, false, cb);
			this.addInput( {key: "anchorX", step: 0.5}, obj, true, cb);
			this.addInput( {key: "anchorY", step: 0.5}, obj, true, cb);
			this.addInput( {key: "fps", step: 1}, obj, true, cb);
			
			this.addInput( {key: "atlas", value: obj.atlas, accept: MT.const.DATA, type: "upload"}, obj, true, function(e, obj){
				if(e.target.files.length === 0){
					return;
				}
				that.project.am.addAtlas(obj, e);
			});
			
			this.addInput( {key: "update", type: "upload", accept: MT.const.IMAGES}, obj, true, function(e){
				that.project.am.updateImage(obj, e);
			});
			
			
		},
   
		handleObjects: function(obj){
			if(!obj){
				return;
			}
			
			if(this.lastObj == obj){
				return;
			}
			this.lastObj = obj;
			
			this.clear();
			this.panel.title = obj.name;
			var that = this;
			var cb = function(){
				that.project.om.update();
			};
			//group
			if(obj.contents){
				this.stack = "group";
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				this.objects.angle = this.addInput( "angle", obj, true, cb);
				if(obj.isFixedToCamera === void(0)){
					obj.isFixedToCamera = 0;
				}
				this.objects.isFixedToCamera = this.addInput({key:"isFixedToCamera", min: 0, max: 1, step: 1}, obj, true, cb);
			}
			// tile layer
			else if(obj.type == MT.objectTypes.TILE_LAYER){
				
				this.stack = "layer";
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				this.addInput("widthInTiles", obj, true, cb);
				this.addInput("heightInTiles", obj, true, cb);
				this.addInput("tileWidth", obj, true, cb);
				this.addInput("tileHeight", obj, true, cb);
				
				
				this.addInput({key:"isFixedToCamera", min: 0, max: 1, step: 1}, obj, true, cb);
				
				this.addInput( {
					key: "anchorX",
					step: 0.1
				}, obj, true, cb);
				this.addInput( {
					key: "anchorY",
					step: 0.1
				}, obj, true, cb);
				
				
			}
			//sprite
			else{
				this.stack = "sprite";
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				
				if(obj._framesCount){
					this.objects.frame = this.addInput( "frame", obj, true, function(){
						
						if(obj.frame >= obj._framesCount){
							obj.frame = 0;
						}
						
						if(obj.frame < 0){
							obj.frame = obj._framesCount - 1;
						}
						
						that.objects.frame.setValue(obj.frame, true);
						
						cb();
					});
				}
				this.objects.angle = this.addInput( "angle", obj, true, cb);
				this.objects.anchorX = this.addInput( {
					key: "anchorX",
					step: 0.1
				}, obj, true, cb);
				this.objects.anchorY = this.addInput( {
					key: "anchorY",
					step: 0.1
				}, obj, true, cb);
				
				this.objects.width = this.addInput( {
					key: "width",
					step: 1,
				}, obj, true, function(width, oldWidth){
					var ow = oldWidth / obj.scaleX;
					var scale = width / ow;
					that.objects.scaleX.setValue(scale);
					cb();
					that.objects.width.setValue(parseInt(width, 10), true);
				});
				
				
				this.objects.height = this.addInput( {
					key: "height",
					step: 1,
				}, obj, true, function(height, oldHeight){
					var ov = oldHeight / obj.scaleY;
					var scale = height / ov;
					that.objects.scaleY.setValue(scale);
					cb();
					that.objects.height.setValue(parseInt(height, 10), true);
				});
				
				this.objects.scaleX = this.addInput( {
					key: "scaleX",
					step: 0.1
				}, obj, true, cb)
				this.objects.scaleY = this.addInput( {
					key: "scaleY",
					step: 0.1
				}, obj, true, cb);
			}
			
			this.objects.alpha = this.addInput( {key: "alpha", min: 0, max: 1, step: 0.1}, obj, true, cb);
			
		},
		
		update: function(){
			for(var i in this.objects){
				this.objects[i].update();
			}
		},
   
		updateObjects: function(obj){
			if(obj.id != this.activeId){
				return;
			}
			for(var i in this.objects){
				this.objects[i].obj = obj;
				this.objects[i].setValue(obj[i], true);
			}
		},
   
		handleScene: function(obj){
			this.clear();
			
			this.stack = "scene";
			var that = this;
			var cb = function(){
				that.project.plugins.mapeditor.updateScene(obj);
			};
			this.scene = {};
			
			this.scene.cameraX = this.addInput( {key: "cameraX"}, obj, true, cb);
			this.scene.cameraY = this.addInput( {key: "cameraY"}, obj, true, cb);
			
			this.scene.worldWidth  = this.addInput( {key: "worldWidth"}, obj, true, cb);
			this.scene.worldHeight = this.addInput( {key: "worldHeight"}, obj, true, cb);
			
			this.scene.viewportWidth  = this.addInput( {key: "viewportWidth"}, obj, true, cb);
			this.scene.viewportHeight = this.addInput( {key: "viewportHeight"}, obj, true, cb);
			
			
			this.scene.gridX = this.addInput( {key: "gridX", min: 2}, obj, true, cb);
			this.scene.gridY = this.addInput( {key: "gridY", min: 2}, obj, true, cb);
			this.scene.showGrid = this.addInput( {key: "showGrid", min: 0, max: 1}, obj, true, cb);
			this.scene.backgroundColor = this.addInput( {key: "backgroundColor", type: "color" }, obj, true, cb);
			
		},
   
		updateScene: function(obj){
			for(var i in this.scene){
				this.scene[i].obj = obj;
				this.scene[i].setValue(obj[i]);
			}
		},




	}
);