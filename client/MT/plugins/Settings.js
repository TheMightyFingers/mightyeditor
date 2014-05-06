MT.require("ui.Input");

MT(
	MT.plugins.Settings = function(project){
		
		this.project = project;
		this.inputs = [];
		
		
		this.objects = {};
		
	},
	{
		initUI: function(ui){
			this.panel = ui.addPanel("Settings");
		},
		
		installUI: function(){
			
			var that = this;

			this.project.plugins.assetsmanager.tv.on(["click", "select"], function(obj){
				that.handleAssets(obj);
			});
			
			this.project.plugins.tools.on("selectedObject", function(objId){
				var obj = that.project.plugins.objectsmanager.getById(objId);
				that.handleObjects(obj);
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
			this.panel.title = "Settings";
			for(var i=0; i<this.inputs.length; i++){
				this.inputs[i].remove();
			}
			this.inputs.length = 0;
			
		},
		
		addInput: function(key, toControl, right, cb){
			var p = this.panel.content;
			
			var fw = new MT.ui.Input(this.project.ui.events, key, toControl);
			fw.show(p.el);
			
			fw.style.position = "relative";
			fw.style.height = "20px";
			
			this.inputs.push(fw);
			
			var that = this;
			fw.on("change", cb);
			return fw;
		},
   
		handleAssets: function(obj){
			if(obj.contents !== void(0)){
				return;
			}
			
			this.clear();
			
			this.panel.title = obj.name;
			
			var that = this;
			var cb = function(){
				that.project.am.updateData();
				//that.project.plugins.mapeditor.reloadObjects();
			};
			
			if(!obj.key){
				obj.key = obj.fullPath;
			}
			
			this.addInput( {key: "key", type: "text"}, obj, false, cb);
			this.addInput( {key: "frameWidth", step: 1}, obj, false, cb);
			this.addInput( "frameHeight", obj, true, cb);
			this.addInput( "frameMax", obj, false, cb);
			this.addInput( "margin", obj, true, cb);
			this.addInput( "spacing", obj, false, cb);
			this.addInput( {key: "anchorX", step: 0.5}, obj, true, cb);
			this.addInput( {key: "anchorY", step: 0.5}, obj, true, cb);
			this.addInput( {key: "fps", step: 1}, obj, true, cb);
			
		},
   
		handleObjects: function(obj){
			this.clear();
			this.panel.title = obj.name;
			var that = this;
			var cb = function(){
				that.project.om.update();
			};
			//group
			if(obj.contents){
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				this.objects.angle = this.addInput( "angle", obj, true, cb);
			}
			//sprite
			else{
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
				
				this.objects.scaleX = this.addInput( {
					key: "scaleX",
					step: 0.1
				}, obj, true, cb);
				this.objects.scaleY = this.addInput( {
					key: "scaleY",
					step: 0.1
				}, obj, true, cb);
			}
			
		},
   
		updateObjects: function(obj){
			for(var i in this.objects){
				this.objects[i].obj = obj;
				this.objects[i].setValue(obj[i], true);
			}
		},
   
		handleScene: function(obj){
			this.clear();
			
			var that = this;
			var cb = function(){
				that.project.plugins.mapeditor.updateScene(obj);
			};
			this.scene = {};
			
			this.scene.cameraX = this.addInput( {key: "cameraX"}, obj, true, cb);
			this.scene.cameraY = this.addInput( {key: "cameraY"}, obj, true, cb);
			this.scene.gridX = this.addInput( {key: "gridX", min: 2}, obj, true, cb);
			this.scene.gridY = this.addInput( {key: "gridY", min: 2}, obj, true, cb);
			this.scene.showGrid = this.addInput( {key: "showGrid", min: 0, max: 1}, obj, true, cb);
			this.scene.backgroundColor = this.addInput( {key: "backgroundColor", type: "text" }, obj, true, cb);
			
		},
   
		updateScene: function(obj){
			for(var i in this.scene){
				this.scene[i].obj = obj;
				this.scene[i].setValue(obj[i]);
			}
		},




	}
);