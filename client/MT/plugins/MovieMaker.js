"use strict"
MT.require("plugins.MapEditor");
MT.require("ui.Keyframes");

MT(
	MT.plugins.MovieMaker = function(project){
		this.project = project;
		MT.core.BasicPlugin.call(this, "movie");
		this.activeId = 0;
		this.activeFrame = 0;
		this.kf = {};
		this.keys = ["x", "y", "angle", "anchorX", "anchorY", "scaleX", "scaleY", "alpha"];
		this.roundKeys = ["frame"];
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = this.ui.createPanel("timeline");
			this.panel.setFree();
			this.el = this.panel.content;
			this.panel.on("click", function(e){
				console.log(e.target);
			});
			
		},
		installUI: function(){
			var span = null;
			var div = null;
			this.layers = [];
			this.om = this.project.plugins.objectmanager;
			var that = this;
			this.om.on(MT.OBJECT_SELECTED, function(obj){
				
				if(obj.type == MT.objectTypes.MOVIE_CLIP){
					console.log("object selected", obj.id);
					that.setActive(obj.id);
				}
			});
			
			this.om = this.project.plugins.objectmanager;
			this.map = this.project.plugins.mapeditor;
			
			this.addPanels();
		},
   
		addPanels: function(){
			
			this.leftPanel = this.ui.createPanel("me-layers");
			this.rightPanel = this.ui.createPanel("me-frames");
			
			this.leftPanel.addClass("borderless");
			this.leftPanel.hide().show(this.el.el);
			
			this.leftPanel.fitIn();
			this.leftPanel.width = 200;
			this.leftPanel.style.setProperty("border-right", "solid 1px #000");
			this.leftPanel.isResizeable = true;
			this.leftPanel.removeHeader();
			this.leftPanel.removeClass("animated");
			
			
			
			this.rightPanel.addClass("borderless");
			this.rightPanel.hide().show(this.el.el);
			
			this.rightPanel.fitIn();
			this.rightPanel.style.left = 200+"px";
			this.rightPanel.style.width = "auto";
			this.rightPanel.removeHeader();
			this.rightPanel.removeClass("animated");
			
			this.rightPanel._input.onkeyup = function(e){
				console.log(e.which);
				
				if(e.which == MT.keys.DELETE){
					that.removeFrame();
				}
				if(e.which == MT.keys.SPACE){
					that.addFrame();
				}
				e.preventDefault();
				e.stopPropagation();
			
			};
			this.rightPanel._input.onfocus = function(){
				console.log("focus");
			};
			
			//this.rightPanel.content.style.overflow = "hidden";
			var that = this;
			this.leftPanel.on("resize", function(w, h){
				that.rightPanel.style.left = w +"px";
			});
			
		},
		
		setActive: function(id){
			
			if(this.kf[this.activeId]){
				this.kf[this.activeId].hide();
			}
			
			this.activeId = id;
			this.data = this.om.getById(this.activeId);
			console.log(this.data);
			
			if(!this.data.kf){
				this.data.kf = [this.data.contents];
			}
			else{
				this.updateScene();
			}
			
			if(!this.kf[id]){
				var that = this;
				this.kf[id] = new MT.ui.Keyframes(this.ui, this.data.kf, 60, "main", this.leftPanel.content.el, this.rightPanel.content.el);
				
				this.kf[id].on("frameChanged", function(frame){
					if(that.activeFrame == frame){
						return;
					}
					that.changeFrame(frame);
				});
				
				this.om.on(MT.OBJECTS_UPDATED, function(){
					console.log("update");
					that.updateData();
				});
			}
			else{
				this.kf[id].markFrames(this.data.kf);
				this.kf[id].show();
			}
			
			
		},
		
		changeFrame: function(frame){
			this.activeFrame = frame;
			console.log("frame", frame);
			this.updateScene();
		},
   
		updateData: function(){
			this.data = this.om.getById(this.activeId);
			if(!this.data){
				return;
			}
			if(!this.data.kf[this.activeFrame]){
				return;
			}
			this.data.kf[this.activeFrame] = JSON.parse(JSON.stringify(this.data.contents));
			this.kf[this.activeId].markFrames(this.data.kf);
		},
		
		addFrame: function(){
			this.data = this.om.getById(this.activeId);
			if(!this.data){
				return;
			}
			this.data.kf[this.activeFrame] = JSON.parse(JSON.stringify(this.data.contents));
			this.kf[this.activeId].markFrames(this.data.kf);
		},
   
		buildKeyFrames: function(obj){
			//this.tv.merge(obj.contents);
		},
   
		updateScene: function(){
			var d = this.data.kf[this.activeFrame];
			console.log(d);
			
			if(d){
				this.updateObjects(d);
			}
			else{
				this.interpolate();
			}
		},
   
		interpolate: function(){
			var i, f1, f2, t;
			for(i=this.activeFrame; i>-1; i--){
				if(this.data.kf[i]){
					f1 = i;
					break;
				}
			}
			
			
			for(i=f1+1; i<this.data.kf.length; i++){
				if(this.data.kf[i]){
					f2 = i;
					break;
				}
			}
			t = (this.activeFrame - f1) / (f2 - f1);
			
			console.log("int",t, f1, f2, this.activeFrame);
			
			var d1 = this.data.kf[f1];
			var d2 = this.data.kf[f2];
			
			if(!d2 || isNaN(t)){
				return;
			}
			this.doInterpolate(t, d1, d2);
		},
   
   
		doInterpolate: function(t, d1, d2){
			var o, mo, tmp;
			for(var i=0; i<d1.length; i++){
				o = d1[i];
				mo = this.map.getById(o.id);
				
				tmp = this.buildTmpVals(t, d1[i], d2[i]);
				
				mo.update(tmp);
			}
		},
   
		buildTmpVals: function(t, d1, d2){
			if(!d2){
				return d1;
			}
			var tmp = {};
			var k;
			for(var i=0; i<this.keys.length; i++){
				k = this.keys[i];
				tmp[k] = this.getInt(t, d1[k], d2[k]);
			}
			
			for(var i=0; i<this.roundKeys.length; i++){
				k = this.roundKeys[i];
				tmp[k] = Math.floor(this.getInt(t, d1[k], d2[k]));
			}
			return tmp;
		},
   
		getInt: function(t, a, b){
			return (1 - t) * a + t * b;
			
		},
   
		updateObjects: function(cont){
			var o, mo;
			var group = this.map.getById(this.activeId);
			
			for(var i=0; i<cont.length; i++){
				o = cont[i];
				mo = this.map.getById(o.id);
				if(!mo || !mo.hasParent(group)){
					cont.splice(i, 1);
					i--;
					continue;
				}
				mo.update(o);
			}
			
			this.om.tv.update();
		},
   
		removeFrame: function(){
			this.data.kf[this.activeFrame] = null;
			this.kf[this.activeId].markFrames(this.data.kf);
			
		}
   
	}
);