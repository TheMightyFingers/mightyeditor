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
			
			
			
			var that = this;
			var clickFn = function(obj){
				console.log("clicked!", obj);
				that.handleClick(obj);
			};
			
			this.project.plugins.assetsmanager.tv.on("click", function(obj){
				that.handleAssets(obj);
			});
			
			this.project.plugins.objectsmanager.tv.on("click", function(obj){
				that.handleObjects(obj);
				that.project.map.setActive(obj.id);
			});
		},
   
		handleClick: function(obj){
			
			
		},
   
		clear: function(){
			for(var i=0; i<this.inputs.length; i++){
				this.inputs[i].remove();
			}
			
		},
		
		addInput: function(key, toControl, right, cb){
			var p = this.panel.content;
			
			var fw = new MT.ui.Input(this.project.ui.events, key, toControl);
			
			//fw.width = p.el.offsetWidth*0.5 - 20;
			
			fw.show(p.el);
			if(right){
			//	fw.x = fw.width + 20;
			}
			
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
			
			var that = this;
			var cb = function(){
				that.project.am.updateData();
			};
			
			
			this.addInput( {key: "frameWidth", step: 1}, obj, false, cb);
			this.addInput( "frameHeight", obj, true, cb);
			this.addInput( "frameMax", obj, false, cb);
			this.addInput( "margin", obj, true, cb);
			this.addInput( "spacing", obj, false, cb);
		},
   
		handleObjects: function(obj){
			this.clear();
			
			var that = this;
			var cb = function(){
				that.project.om.updateData();
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
				this.objects.angle = this.addInput( "angle", obj, true, cb);
				this.objects.anchorX = this.addInput( "anchorX", obj, true, cb);
				this.objects.anchorY = this.addInput( "anchorY", obj, true, cb);
			}
			
		},
   
		updateObjects: function(obj){
			for(var i in this.objects){
				this.objects[i].obj = obj;
				this.objects[i].setValue(obj[i]);
			}
		},
   
		handleScene: function(obj){
			this.clear();
			
			var that = this;
			var cb = function(){
				that.project.map.updateScene(obj);
			};
			
			this.addInput( "cameraX", obj, true, cb);
			this.addInput( "cameraY", obj, true, cb);
			this.addInput( "worldWidth", obj, true, cb);
			this.addInput( "worldHeight", obj, true, cb);
			this.addInput( "grid", obj, true, cb);
			
		}




	}
);