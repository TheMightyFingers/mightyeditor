"use strict"
MT.require("plugins.MapEditor");
MT.require("ui.Keyframes");

MT(
	MT.plugins.MovieMaker = function(project){
		this.project = project;
		MT.core.BasicPlugin.call(this, "movie");
		this.activeId = 0;
		this.activeFrame = 0;
		this.frameSize = 5;
		this.movies = {};
		this.keys = ["x", "y", "angle", "anchorX", "anchorY", "scaleX", "scaleY", "alpha"];
		this.roundKeys = [];
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = this.ui.createPanel("timeline");
			this.panel.setFree();
			this.el = this.panel.content;
			this.panel.on("click", function(e){
				//console.log(e.target);
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
			//console.log(this.panel.options);
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
				
				if(that.items && that.items[obj.id] && !that.movies[obj.id]){
					that.movies[that.activeId].show();
					that.slider.show();
					that.activeMovie.setActiveObject(obj.id);
					return;
				}
				
				that.setActive(obj.id);
				if(that.activeMovie){
					that.activeMovie.setActiveObject(obj.id);
				}
			});
			this.tools.on(MT.OBJECT_UNSELECTED, function(obj){
				/*for(var i in that.movies){
					that.movies[i].hide();
				}
				that.data = null;*/
				if(that.items && that.items[obj.id]){
					that.movies[that.activeId].show();
					that.slider.show();
					that.activeMovie.unselect(obj.id);
					return;
				}
			});
			
			this.tools.on(MT.OBJECTS_UPDATED, function(obj){
				//console.log("UPDATE!!!");
				that.saveActiveFrame();
			});
			
			this.om = this.project.plugins.objectmanager;
			this.map = this.project.plugins.mapeditor;
			
			this.addPanels();
			
			this.slider = new MT.ui.DomElement("div");
			this.slider.addClass("ui-movie-slider");
			this.slider.setAbsolute();
			
			
			
		},
   
		addPanels: function(){
			
			this.panel.content.style.paddingTop = "19px";
			
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
			this.rightPanel.style.top = 19+"px";
			this.rightPanel.style.width = "auto";
			this.rightPanel.removeHeader();
			this.rightPanel.removeClass("animated");
			
			
			this.leftPanel.el.style.position = "relative";
			this.leftPanel.content.el.style.position = "relative";
			this.leftPanel.content.el.style["min-height"] = "100%";
			
			
			this.leftPanel.content.style.overflow = "visible";
			this.rightPanel.content.style.overflow = "visible";
			
			//this.rightPanel.content.style["overflow-y"] = "auto";
			
			this.rightPanel._input.onkeyup = function(e){
				console.log(e.which);
				
				if(e.which == MT.keys.DELETE){
					that.removeFrame();
					e.preventDefault();
					e.stopPropagation();
				}
				if(e.which == MT.keys.SPACE){
					that.addFrame();
					e.preventDefault();
					e.stopPropagation();
				}
				
				if(e.which == MT.keys.RIGHT){
					that.changeFrame(that.activeFrame + 1);
					e.preventDefault();
					e.stopPropagation();
				}
				
				if(e.which == MT.keys.LEFT){
					that.changeFrame(that.activeFrame - 1);
					e.preventDefault();
					e.stopPropagation();
				}
				
			
			};
			this.rightPanel._input.onfocus = function(){
				//console.log("focus");
			};
			
			//this.rightPanel.content.style.overflow = "hidden";
			var that = this;
			var sl = this.sliderHelper = new MT.ui.SliderHelper(0, 0, Infinity);
			
			this.leftPanel.on("resize", function(w, h){
				that.rightPanel.style.left = w +"px";
			});
			
			var down = false;
			this.rightPanel.content.el.onmousedown = function(e){
				down = true;
				var off = e.offsetX;
				
				
				if(e.target != that.rightPanel.content.el){
					off += e.target.offsetLeft;
				}
					sl.reset(off);
					that.changeFrame(sl / that.frameSize);
			};
			
			
			this.rightPanel.content.el.onmouseup = function(e){
				down = false;
				e.preventDefault();
				e.stopPropagation();
			};
			
			this.ui.events.on("mousemove", function(e){
				
				if(!down){
					return;
				}
				
				sl.change(that.ui.events.mouse.mx);
				that.changeFrame(sl / that.frameSize);
			});
			this.ui.events.on("mouseup", function(e){
				down = false;
			});
			
		},
		
		addMovie: function(){
			if(!this.data){
				return;
			}
			
			var name = "NewMovie";
			var tmpName = name;
			var inc = 1;
			while(this.data.movies[name]){
				name = tmpName + inc;
				inc++;
			}
			
			this._addMovie(name)
		},
		_addMovie: function(name){
			this.data.movies[name] = [this.collect(this.data)];
			var m = this.movies[this.activeId];
			m.activeMovie = name;
			if(m){
				m.rebuildData();
			}
			this.slider.show(this.rightPanel.content.el);
		},
		
		activeMovie: null,
		items: null,
		setActive: function(id){
			this.activeId = id;
			
			this.data = this.om.getById(id);
			if(!this.data.movies){
				this.data.movies = {};
			}
			else{
				//this.updateScene();
			}
			
			
			
			if(this.activeMovie){
				this.activeMovie.hide();
				this.slider.hide();
			}
			
			this.movies[id] = new MT.ui.Keyframes(this, 60);
			
			if(Object.keys(this.data.movies).length == 0){
				return;
			}
			
			var that = this;
			this.movies[id].on("select", function(data){
				that.project.plugins.objectmanager.emit(MT.OBJECT_SELECTED, data);
			});
			this.slider.show(this.rightPanel.content.el);
			
			this.activeMovie = this.movies[id];
			
			this.collectItems();
			
			this.activeMovie.markFirstFrame();
			
		},
		
		collectItems: function(){
			this.items = {};
			this._collectItems(this.data);
		},
		_collectItems: function(data){
			this.items[data.id] = data;
			if(!data.contents){
				return;
			}
			
			for(var i=0; i<data.contents.length; i++){
				this._collectItems(data.contents[i]);
			}
		},
		
		changeFrame: function(frameApprox){
			var sl = this.sliderHelper;
			var frame = Math.floor(frameApprox);
			if(frame < 0){
				frame = 0;
			}
			this.slider.x = frame * this.frameSize + (this.frameSize - this.slider.width)*0.5;
			
			
			console.log("change frame", frame);
			this.activeFrame = frame;
			
			if(this.activeMovie){
				this.activeMovie.changeFrame();
			}
			
			
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
			if(this.activeMovie){
				this.activeMovie.saveActiveFrame();
			}
		},
   
		removeFrame: function(){
			if(this.activeMovie){
				this.activeMovie.removeFrame();
			}
		},
		saveActiveFrame: function(){
			if(this.activeMovie){
				this.activeMovie.saveActiveFrame(true);
			}
		},
   
   
		buildKeyFrames: function(obj){
			//this.tv.merge(obj.contents);
		},
		
		getById: function(id){
			var mo = this.project.plugins.mapeditor.getById(id);
			if(mo){
				return mo.data;
			}
			return;
		},
   
		collect: function(data){
			var out = {};
			var k;
			for(var i=0; i<this.keys.length; i++){
				k = this.keys[i];
				out[k] = data[k];
			}
			return out;
		},
   
		updateScene: function(){
			var d = this.data.kf[this.activeFrame];
			if(d){
				this.updateObjects(d);
			}
			else{
				this.interpolate();
			}
		},
   
   
   
		loadState: function(id, data, frame){
			frame = frame || 0;
			
			var mo = this.project.plugins.mapeditor.getById(id);
			if(!mo){
				return;
			}
			mo.update(data);
		},
		
		
		interpolate: function(id, start, end, frame){
			var t = (frame - start.frame) / (end.frame - start.frame);
			var mo = this.project.plugins.mapeditor.getById(id);
			
			var med = this.buildTmpVals(t, start, end);
			mo.update(med);
			
			
			
		},
   
		interpolate_old: function(){
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
		}
   
	}
);