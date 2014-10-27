"use strict"
MT.require("plugins.MapEditor");
MT.require("ui.Keyframes");

MT(
	MT.plugins.MovieMaker = function(project){
		this.project = project;
		MT.core.BasicPlugin.call(this, "movie");
		this.activeId = 0;
		this.activeFrame = 0;
		this.movies = {};
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
			var that = this;
			this.panel.addOptions([
				{
					label: "Add movie",
					className: "",
					cb: function(){
						that.addMovie();
						that.panel.options.list.hide();
					}
				}
			]);
			console.log(this.panel.options);
			this.panel.options.list.width = 150;
			this.panel.options.list.style.left = "auto";
			
		
			
			
		},
		installUI: function(){
			var span = null;
			var div = null;
			this.layers = [];
			this.tools = this.project.plugins.tools;
			var that = this;
			this.tools.on(MT.OBJECT_SELECTED, function(obj){
				
				//if(obj.type == MT.objectTypes.MOVIE_CLIP){
				//	console.log("object selected", obj.id);
					that.setActive(obj.id);
				//}
			});
			this.tools.on(MT.OBJECT_UNSELECTED, function(obj){
				for(var i in that.movies){
					that.movies[i].hide();
				}
			});
			this.om = this.project.plugins.objectmanager;
			this.map = this.project.plugins.mapeditor;
			
			this.addPanels();
			
			this.slider = document.createElement("div");
			this.slider.className = "ui-movie-slider";
			
			
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
			
			
			this.rightPanel.content.el.onmousemove = function(){
				console.log("ove");
			};
		},
		
		addMovie: function(){
			if(!this.data){
				console.log("no data");
				return;
			}
			
			this.data.movies["New Movie"] = [this.collect()];
			console.log("movie added");
		},
   
		setActive: function(id){
			this.data = this.om.getById(id);
			console.log(this.data);
			
			if(!this.data.movies){
				this.data.movies = {};
			}
			else{
				//this.updateScene();
			}
			
			this.movies[id] = new MT.ui.Keyframes(this.ui, this.data, 60, this.leftPanel.content.el, this.rightPanel.content.el);
			
			return;
			if(this.kf[this.activeId]){
				this.kf[this.activeId].hide();
			}
			
			this.activeId = id;
			this.data = this.om.getById(this.activeId);
			console.log(this.data);
			
			if(!this.data.movies){
				this.data.movies = {};
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
			this.data.kf[this.activeFrame] = this.collect();
			this.kf[this.activeId].markFrames(this.data.kf);
		},
		
		addFrame: function(){
			this.data = this.om.getById(this.activeId);
			if(!this.data){
				return;
			}
			this.data.kf[this.activeFrame] = this.collect();
			this.kf[this.activeId].markFrames(this.data.kf);
		},
   
		buildKeyFrames: function(obj){
			//this.tv.merge(obj.contents);
		},
		collect: function(){
			var out = {};
			var k;
			for(var i=0; i<this.keys.length; i++){
				k = this.keys[i];
				out[k] = this.data[k];
			}
			return out;
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
			var med = this.buildTmpVals(t, d1, d2);
			var mo = this.map.getById(this.activeId);
			mo.update(med);
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
			var mo = this.map.getById(this.activeId);
			var k;
			for(var i=0; i<this.keys.length; i++){
				k = this.keys[i]
				mo[k] = cont[k];
			}
			
			this.om.tv.update();
		},
   
		removeFrame: function(){
			this.data.kf[this.activeFrame] = null;
			this.kf[this.activeId].markFrames(this.data.kf);
			
		}
   
	}
);