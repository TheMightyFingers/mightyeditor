"use strict"
MT.require("plugins.MapEditor");
MT.require("ui.Keyframes");
MT.require("ui.MovieLayer");
MT.require("ui.FrameControl");
//MT.require("ui.MainMovie");

MT.FRAME_SELECTED = "FRAME_SELECTED";

MT.extend("core.Emitter")(
	MT.plugins.MovieMaker = function(project){
		this.project = project;
		MT.core.BasicPlugin.call(this, "movie");
	
		this.activeFrame = 0;
		this.startFrame = 0;
		this.scale = 1;
		
		this.keys = ["x", "y", "angle", "anchorX", "anchorY", "scaleX", "scaleY", "alpha", "frame", "assetId"];
		this.roundKeys = [];
		this.inputs = {};
		
	},
	{
		_frameSize: 5,
		get frameSize(){
			return this._frameSize*this.scale;
		},
		
		_keyframes: null,
		set keyframes(val){
			this._keyframes = val;
			if(val == this.keyframesMain){
				this.location.style.display = "none";
			}
			else{
				this.location.style.display = "block";
			}
			
		},
		get keyframes(){
			return this._keyframes;
		},
		
		initUI: function(ui){
			this.ui = ui;
			this.panel = this.ui.createPanel("timeline");
			this.panel.addClass("timeline");
			this.panel.setFree();
			this.panel.content.el.style.overflow = "hidden";
			this.el = this.panel.content;
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
			this.panel.options.list.width = 150;
			this.panel.options.list.style.left = "auto";
			
			this.panel.on("show", function(){
				that.hide();
				that.setActive(that.data);
			});
			
			this.settings = this.ui.createPanel("Easing");
			this.settings.setFree();
			
			this.location = document.createElement("div");
			this.location.className = "ui-movie-location";
			this.location.innerHTML = "Back";
			this.location.style.display = "none";
			
			this.panel.content.el.appendChild(this.location);
			
			this.location.onclick = function(){
				that.location.style.display.block;
				var selected = that.map.activeObject;
				
				var d = that.data;
				
				that.clear();
				that.createMainMovie();
				that.keyframes.reactivate();
				
			};
			
			
			
		},
		
		genEasings: function(eas, label, buffer){
			buffer = buffer || [];
			var lab = label;
			for(var k in eas){
				if(label != ""){
					lab = label + ".";
				}
				
				if(typeof eas[k] == "object"){
					this.genEasings(eas[k], lab + k, buffer);
					continue;
				}
				
				buffer.push({
					label: lab + k,
					value: lab + k
				});
			}
			
			return buffer;
			
		},
		
		addInput: function(key, frame, options){
			var el = this.settings.content.el;
			if(this.inputs[key]){
				this.inputs[key].setObject(frame.easings);
				el.appendChild(this.inputs[key].el);
				return;
			}
			
			var input = new MT.ui.Input(this.ui, {
				key: key,
				options: options,
				type: "select"
			}, frame.easings);
			
			this.inputs[key] = input;
			el.appendChild(input.el);
		},
		
		showFrameSettings: function(frame){
			if(!frame.easings){
				frame.easings = {};
			}
			
			var easings = this.genEasings(Phaser.Easing, "", [{label: "NONE", value: "none"}]);
			
			for(var k in frame){
				if(k == "easings"){
					continue;
				}
				
				this.addInput(k, frame, easings);
			}
		},
		hideFrameSettings: function(){
			var el = this.settings.content.el;
			while(el.firstChild){
				el.removeChild(el.firstChild);
			}
			
		},
		
		installUI: function(){
			var span = null, div = null;
			var that = this;
			var ev = this.ui.events;
			this.layers = [];
			this.tools = this.project.plugins.tools;
			
			this.om = this.project.plugins.objectmanager;
			this.map = this.project.plugins.mapeditor;
			
			this.tools.on(MT.OBJECT_SELECTED, function(obj){
				that.selectObject(obj.data);
			});
			this.tools.on(MT.OBJECT_UNSELECTED, function(obj){
				if(!that.items || !that.items[obj.id]){
					return;
				}
				
				if(that.newMovieButton){
					return;
				}
				that.show(obj);
				that.keyframes.unselect(obj.id);
			});
			
			
			this.tools.on(MT.OBJECTS_UPDATED, function(obj){
				that.saveActiveFrame();
				
				if(!that.data){
					that.createMainMovie();
				}
			});
			
			
			this.om.on(MT.OBJECT_UPDATED, function(obj){
				if(obj.data.autoframe){
					that.addFrame();
				}
			});
			
			ev.on(ev.KEYDOWN, function(e){
				if(e.which == MT.keys.ESC){
					
					var oldF = that.keyframes;
					that.clear();
					that.createMainMovie();
					if(that.keyframes != oldF){
						that.keyframes.reactivate();
					}
					return;
				}
			});
			
			
			ev.on(ev.WHEEL, function(e){
				if(e.target !== that.frameControl.sepHolder){
					
					var found = false;
					var par = e.target.parentNode;
					while(par){
						if(par == that.panel.el){
							found = true;
							break;
						}
						par = par.parentNode;
					}
					if(!found){
						return;
					}
					
					if(e.wheelDelta > 0){
						that.keyframes.tv.tree.el.scrollTop -= 30;
					}
					else{
						that.keyframes.tv.tree.el.scrollTop += 30;
					}
					
					return;
				}
				
				
				if(e.wheelDelta > 0){
					that.scale += 0.1;
				}
				else{
					that.scale -= 0.1;
				}
				
				if(that.scale < 0.01){
					that.scale = 0.01;
				}
				that.changeFrame();
			});
			
			
			
			this.addPanels();
			
			this.slider = new MT.ui.DomElement("div");
			this.slider.addClass("ui-movie-slider");
			this.slider.setAbsolute();
			
			this.movieLength = new MT.ui.DomElement("div");
			this.movieLength.addClass("ui-movie-slider ui-movie-length");
			this.movieLength.setAbsolute();
			
			this.movieLengthTip = new MT.ui.DomElement("div");
			this.movieLengthTip.addClass("ui-movie-slider ui-movie-length tip");
			this.movieLengthTip.setAbsolute();
			
			var tipDown = false;
			this.movieLengthTip.el.onmousedown = function(e){
				tipDown = true;
				that.tipH.reset(that.movieLength.x);
				e.preventDefault();
				e.stopPropagation();
			};
			
			this.tipH = new MT.ui.SliderHelper(0, 0, Infinity);
			
			ev.on("mousemove", function(e){
				if(!tipDown){
					return;
				}
				that.tipH.change(ev.mouse.mx);
				var info = that.keyframes.getMovie().info;
				info.lastFrame = Math.floor(that.calcFrame(that.tipH));
				if(info.lastFrame < 0){
					info.lastFrame = 0;
				}
				that.changeFrame();
				that.map.sync();
			});
			
			ev.on("mouseup", function(e){
				tipDown = false;
			});
			
			
			
			this.sidebar = new MT.ui.DomElement("div");
			this.sidebar.addClass("ui-movie-sidebar");
			this.sidebar.setAbsolute();
			
			this.frameControl = new MT.ui.FrameControl(this);
			
			this.frameControl.on("change", function(offset){
				that.startFrame = Math.floor(offset / that.frameSize);
				that.changeFrame();
			});
			
			this.buttons = {
				saveKeyFrame: new MT.ui.Button("", "ui-movie-saveKeyFrame", null, function(e){
					that.addFrame(true);
					e.preventDefault();
					e.stopPropagation();
				})
			};
			this.buttons.saveKeyFrame.show(this.sidebar.el);
			
			this.keyframes = this.keyframesSub = new MT.ui.Keyframes(this, 60);
			this.keyframesSub.on("select", function(data){
				that.forwardObjectSelect(data);
			});
			
			
			this.keyframesMain = new MT.ui.MovieLayer(this, 60);
			this.keyframesMain.hideDelete();
			
			this.keyframesMain.on("select", function(data){
				that.forwardObjectSelect(data);
			});
			
			this.clear();
			
			this.om = this.project.plugins.objectmanager;
			
			this.map.on("update", function(){
				if(that.keyframes == that.keyframesMain){
					that.createMainMovie();
				}
			});
			
			this.ui.on(ev.RESIZE,function(){
				that.redrawAll();
			});
			
		},
		ignoreSelect: false,
		forwardObjectSelect: function(data){
			/*if(data.unselectable){
				return;
			}*/
			if(data.objectId){
				this.selectObject(data);
				this.ignoreSelect = true;
				this.om.emit(MT.OBJECT_SELECTED, this.map.getById(data.objectId));
				this.ignoreSelect = false;
				return;
			}
			
			var id = data.id;
			if(!id){
				return;
			}
			var obj = this.om.getById(id);
			if(!obj){
				return;
			}
			this.om.emit(MT.OBJECT_SELECTED, obj);
		},
		redrawAll: function(){
			if(!this.hasMovies()){
				return;
			}
			
			this.keyframes.updateFrames();
			this.frameControl.build();
		},
		show: function(obj){
			
			this.keyframes.show();
			if(obj){
				this.keyframes.setActiveObject(obj.id);
			}
			
			this.showHelpers();
			this.keyframes.showFrames();
			
		},
		hide: function(){
			
			this.keyframesMain.hide();
			this.keyframesSub.hide();
			this.Keyframes = this.keyframesSub;
			this.hideHelpers();
			if(this.newMovieButton){
				this.newMovieButton.hide();
			}
		},
   
		showHelpers: function(){
			this.slider.show(this.rightPanel.content.el);
			this.movieLength.show(this.rightPanel.content.el);
			this.movieLengthTip.show(this.rightPanel.content.el);
			
			
			this.sidebar.show(this.rightPanel.content.el);
			
			this.sidebar.width = this.frameOffset;
			
			this.frameControl.build();
			this.frameControl.el.show(this.rightPanel.content.el);
			
			//this.panel.content.el.appendChild(this.location.el);
			
		},
		hideHelpers: function(){
			this.keyframes.hide();
			this.slider.hide();
			this.movieLength.hide();
			this.movieLengthTip.hide();
			
			this.frameControl.hide();
			
			this.sidebar.hide();
			//this.location.hide();
		},
   
		clear: function(){
			this.changeFrame(0);
			
			this.keyframes = this.keyframesSub;
			this.keyframes.tv.merge([]);
			this.items = {};
			this.hide();
			
			this.keyframesMain.stop();
			this.keyframesSub.stop();
		},
   
		addPanels: function(){
			
			this.panel.content.style.paddingTop = "19px";
			
			this.leftPanel = this.ui.createPanel("me-layers");
			this.rightPanel = this.ui.createPanel("me-frames");
			
			this.leftPanel.addClass("borderless");
			this.leftPanel.hide().show(this.el.el);
			
			this.leftPanel.fitIn();
			this.leftPanel.width = 270;
			this.leftPanel.style.top = 19+"px";
			this.leftPanel.style.setProperty("border-right", "none 1px #000");
			this.leftPanel.isResizeable = true;
			this.leftPanel.removeHeader();
			this.leftPanel.removeClass("animated");
			
			this.rightPanel.addClass("borderless");
			this.rightPanel.hide().show(this.el.el);
			
			this.rightPanel.fitIn();
			this.rightPanel.style.left = 270+"px";
			this.rightPanel.style.top = 19+"px";
			this.rightPanel.style.width = "auto";
			this.rightPanel.removeHeader();
			this.rightPanel.removeClass("animated");
			
			
			this.leftPanel.content.style.overflow = "visible";
			this.rightPanel.content.style.overflow = "visible";
			
			var activeFrame = null;
			
			var down = false;
			var target;
			
			// 0 - nothing;
			// 1 - moveFrame;
			var action = 0;
			
			this.ui.events.on(this.ui.events.KEYUP, function(e){
				var p = that.ui.pickPanelGlobal();
				if(p != that.panel && p != that.leftPanel && p != that.rightPanel){
					return;
				}
				
				
				if(e.which == MT.keys.DELETE){
					that.removeFrame(activeFrame);
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
				
				if(e.ctrlKey){
					if(e.which == MT.keys.C){
						//copy frame;
						that.copyFrame(activeFrame);
						e.preventDefault();
						e.stopPropagation();
					}
					if(e.which == MT.keys.X){
						//copy frame;
						that.cutFrame(activeFrame);
						e.preventDefault();
						e.stopPropagation();
					}
					if(e.which == MT.keys.V){
						that.pasteFrame();
						e.preventDefault();
						e.stopPropagation();
					}
				}
			}, true);
			
			// global shortcuts
			this.ui.events.on(this.ui.events.KEYUP, function(e){
				if(e.ctrlKey){
					if(e.which == MT.keys.SPACE){
						that.addFrame();
						e.preventDefault();
						e.stopPropagation();
					}
				}
			});
			/*
			this.rightPanel._input.onfocus = function(){
				console.log("focus");
			};
			*/
			var that = this;
			var sl = this.sliderHelper = new MT.ui.SliderHelper(0, 0, Infinity);
			
			var width = that.leftPanel.width;
			this.leftPanel.on("resize", function(w, h){
				if(w < width){
					that.leftPanel.width = width;
					return;
				}
				that.rightPanel.style.left = w +"px";
			});
			
			this.selectedFrame = null;
			
			var startFrame;
			this.rightPanel.content.el.onmousedown = function(e){
				
				if(e.target.autoframe){
					e.target.autoframe.autoframe = !e.target.autoframe.autoframe;
					if(e.target.autoframe.autoframe){
						e.target.ctrl.addClass("active");
					}
					else{
						e.target.ctrl.removeClass("active");
					}
					return;
				}
				
				if(e.target.frameInfo){
					target = e.target.parentNode;
					activeFrame = e.target.frameInfo;
					action = 1;
					that.selectedFrame = activeFrame.frames[activeFrame.index];
					
					
					that.showFrameSettings(that.selectedFrame);
				}
				else{
					action = 0;
					activeFrame = null;
					target = e.target;
					that.selectedFrame = null;
					that.hideFrameSettings();
				}
				
				if(target.data){
					that.forwardObjectSelect(target.data);
				}
				
				var off = e.offsetX;
				if(e.target != that.rightPanel.content.el){
					off += e.target.offsetLeft;
				}
				
				sl.reset(off);
				var f = that.calcFrame(sl);
				if(f > -1){
					down = true;
					that.changeFrame(f);
				}
				startFrame = that.activeFrame;
				that.redrawAll();
			};
			
			this.rightPanel.content.el.onmouseup = function(e){
				down = false;
			};
			
			this.ui.events.on("mousemove", function(e){
				if(!down){
					return;
				}
				
				sl.change(that.ui.events.mouse.mx);
				that.changeFrame((sl - that.frameOffset) / that.frameSize + that.startFrame);
				if(action == 1 && activeFrame){
					if(that.moveFrame(that.selectedFrame, activeFrame, that.selectedFrame.keyframe - (startFrame - that.activeFrame))){
						startFrame = that.activeFrame;
					}
				}
				
			});
			
			this.ui.events.on("mouseup", function(e){
				down = false;
			});
			
		},

		showNewMovie: function(){
			this.hide();
			
			this.newMovieButton = new MT.ui.DomElement("div");
			this.newMovieButton.addClass("ui-new-movie-wrapper");
			
			var that = this;
			this.newMovieButton.button = new MT.ui.Button("New Movie", "ui-new-movie style2", null, function(){
				that.addMovie();
			});
			
			this.newMovieButton.button.show(this.newMovieButton.el);
			
			this.newMovieButton.show(this.panel.content.el);
			
		},
   
		selectObject: function(obj){
			if(this.ignoreSelect){
				return;
			}
			if(this.items && this.items[obj.id]){
				if( !this.hasMovies() ){
					this.hide();
					this.showNewMovie();
				}
				else{
					this.show(obj);
				}
				return;
			}
			this.selectObjectForce(obj);
			
			
			
			//this.location.el.innerHTML = obj.name;
			/*var p = this.keyframes.panels[this.keyframes.activeMovie];
			if(p){
				p.x = this.location.width;
			}*/
		},
		
		selectObjectForce: function(obj){
			this.hide();
			this.keyframes = this.keyframesSub;
			this.setActive(obj);
		},
		
		addMovie: function(item, name){
			
			if(item && name){
				this.__addMovie(item, name);
				return;
			}
			
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
			
			this._addMovie(name);
			
			this.om.sync();
		},
		_addMovie: function(name, data){
			for(var i in this.items){
				data = this.items[i];
				this.__addMovie(data, name);
			}
			this.keyframes = this.keyframesSub;
			this.setActive(this.data);
			this.showHelpers();
			this.keyframes.setActiveMovie(name);
			var that = this;
			window.setTimeout(function(){
				that.keyframes.update();
			});
		},
   
		__addMovie: function(item, name){
			if(!item.movies){
				item.movies = {};
			}
			if(item.movies[name]){
				return;
			}
			item.movies[name] = {
				frames: [],
				info: {
					fps: 60
				}
			};
		},
		
		items: null,
		setActive: function(obj){
			if(this.newMovieButton){
				this.newMovieButton.hide();
			}
			
			this.items = {};
			this.data = obj;
			
			// deleted?
			if(!this.data){
				this.keyframes.setData(null);
				this.hideHelpers();
				return;
			}
			
			if(!this.data.movies){
				this.data.movies = {};
			}
			
			if( !this.hasMovies() ){
				this.hide();
				this.showNewMovie();
				this.collectItems();
				return;
			}
			
			this.collectItems();
			this.keyframes.setData(this.data);
			
			this.show(this.data);
			
			if(!this.activeFrame){
				this.changeFrame(0);
			}
			else{
				this.changeFrame(this.activeFrame);
			}
		},
		
		hasMovies: function(){
			if(!this.data){
				return false;
			}
			var total = Object.keys(this.data.movies).length;
			return !( (total == 0 && this.state != 1) || (total == 1 && this.data.movies[this.mainName] != void(0) && this.keyframes != this.keyframesMain) );
		},
		
		collectItems: function(){
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
		
		frameOffset: 40,
		
		calcFrame: function(px){
			var ret = (px - this.frameOffset) / this.frameSize  + this.startFrame;
			return ret;
		},
		calcFrameLoc: function(frame){
			return frame * this.frameSize + (this.frameSize - this.slider.width)*0.5 + this.frameOffset - this.startFrame * this.frameSize;
		},
   
		changeFrame: function(frameApprox){
			if(frameApprox == void(0)){
				frameApprox = this.activeFrame;
			}
			
			var sl = this.sliderHelper;
			var frame = Math.floor(frameApprox);
			if(frame < 0){
				frame = 0;
			}
			
			var x = this.calcFrameLoc(frame);
			
			if(x < this.frameOffset){
				this.slider.style.visibility = "hidden";
			}
			else{
				this.slider.style.visibility = "visible";
			}
			this.slider.x = x;
			
		
			
			
			var mov = this.keyframes.getMovie();
			if(!mov){
				return;
			}
			
			x = this.calcFrameLoc(mov.info.lastFrame);
			
			if(x < this.frameOffset){
				this.movieLength.style.visibility = "hidden";
				this.movieLengthTip.style.visibility = "hidden";
				
			}
			else{
				this.movieLength.style.visibility = "visible";
				this.movieLengthTip.style.visibility = "visible";
			}
			
			if(mov.info.lastFrame == void(0)){
				mov.info.lastFrame = 60;
			}
			this.movieLength.x = this.calcFrameLoc(mov.info.lastFrame);
			this.movieLengthTip.x = this.movieLength.x;
			
			
			
			this.keyframes.changeFrame(frame);
			
			this.activeFrame = frame;
			this.redrawAll();
		},
		
		addFrame: function(all){
			this.keyframes.saveActiveFrame(null, all);
		},
		
		moveFrame: function(selected, fi, frame){
			if(frame == void(0)){
				 frame = this.activeFrame;
			}
			else{
				frame = Math.round(frame);
				if(frame < 0){
					frame = 0;
				}
			}
			
			if(selected.keyframe == frame){
				return false;
			}
			
			var subframe;
			if(selected.length){
				for(var i=0; i<fi.frames.length; i++){
					subframe = fi.frames[i];
					if(subframe == selected){
						continue;
					}
					if(subframe.keyframe < frame && subframe.keyframe + subframe.length > frame){
						return;
					}
				}
			}
			
			selected.keyframe = frame;
			this.sortFrames(fi.frames);
			this.changeFrame();
			return true;
		},
		
		frameBuffer: null,
		framesToCopy: null,
		cutFrame: function(fi){
			if(fi){
				this.copyFrame(fi);
				fi.frames.splice(fi.index, 1);
				this.framesToCopy = null;
			}
			else{
				this.collectFramesToCopy(true);
			}
			this.changeFrame();
		},
		copyFrame: function(fi){
			if(fi){
				this.frameBuffer = fi;
				this.framesToCopy = null;
			}
			else{
				this.collectFramesToCopy();
			}
		},
		
		collectFramesToCopy: function(cut){
			this.framesToCopy = [];
			var frames, data;
			for(var key in this.items){
				data = this.items[key].movies[this.keyframes.activeMovie]
				frames = data.frames;
				for(var f=0; f<frames.length; f++){
					if(frames[f].keyframe == this.activeFrame){
						this.framesToCopy.push({
							frame: frames[f],
							data: data
						});
						if(cut){
							frames.splice(f, 1);
							f--;
						}
					}
					
				}
			}
			
		},
		pasteFrame: function(){
			var frame, info;
			if(this.framesToCopy){
				for(var i=0; i<this.framesToCopy.length; i++){
					info = this.framesToCopy[i];
					frame = _.cloneDeep(info.frame);
					frame.keyframe = this.activeFrame;
					info.data.frames.push(frame);
					this.sortFrames(info.data.frames);
				}
				this.changeFrame();
				return;
			}
			
			
			if(!this.frameBuffer){
				return;
			}
			var frames = this.frameBuffer.frames;
			frame = _.cloneDeep(frames[this.frameBuffer.index]);
			
			frame.keyframe = this.activeFrame;
			frames.push( frame );
			
			this.sortFrames(frames);
			
			
			this.changeFrame();
		},
		
		sortFrames: function(frames){
			frames.sort(function(a,b){
				return a.keyframe - b.keyframe ;
			});
		},
   
		removeFrame: function(fi){
			if(!fi){
				// debug this
				return;
			}
			fi.frames.splice(fi.index, 1);
			
			this.changeFrame();
			
			this.om.sync();
		},
		
		saveActiveFrame: function(){
			this.keyframes.saveActiveFrame(true);
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
   
		collect: function(dataref, kf, ref){
			var id = dataref.id;
			var obj, data;
			if(dataref.objectId){
				obj = this.map.getById(dataref.objectId);
				
			}
			else{
				obj = this.map.getById(id);
			}
			
			var out = ref || {};
			if(!obj){
				return out;
			}
			
			data = obj.data;
			var k;
			for(var i=0; i<this.keys.length; i++){
				k = this.keys[i];
				if(data[k] != void(0)){
					out[k] = data[k];
				}
			}
			out.keyframe = kf;
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
			var t = (frame - start.keyframe) / (end.keyframe - start.keyframe);
			var mo = this.project.plugins.mapeditor.getById(id);
			// deleted?
			if(!mo){
				return;
			}
			
			var med = this.buildTmpVals(t, start, end);
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
				if(k == "frame" || k == "assetId"){
					tmp[k] = d1[k];
					continue;
				}
				tmp[k] = this.getInt(t, d1[k], d2[k], (d2.easings ? d2.easings[k] : null) );
			}
			
			for(var i=0; i<this.roundKeys.length; i++){
				k = this.roundKeys[i];
				tmp[k] = Math.floor(this.getInt(t, d1[k], d2[k]));
			}
			return tmp;
		},
   
		getInt: function(t, a, b, easing){
			if(isNaN(a)){
				return b;
			}
			if(isNaN(b)){
				return a;
			}
			var tfin = t;
			if(easing){
				tfin = this.resolve(easing, t);
			}
			
			
			return (1 - tfin) * a + tfin * b;
		},
		
		resolve: function(ea, t){
			if(ea == "NONE"){
				return 0;
			}
			var sp = ea.split(".");
			var start = Phaser.Easing;
			for(var i=0; i<sp.length && start; i++){
				start = start[sp[i]];
			}
			
			if(start){
				return start(t);
			}
			return t;
		},
		
		mainMovie: null,
		mainName: "__main",
		createMainMovie: function(){
			this.keyframes.hide();
			this.keyframes = this.keyframesMain;
			
			//this.location.el.innerHTML = "Main Timeline";
			
			this.mainMovie = {
				name: this.mainName,
				id: 0,
				contents: [],
				movies: {}
			};
			
			var info = this.map.settings.movieInfo;
			
			this.mainMovie.movies[this.mainName] = {
				frames: [],
				info: info
			};
			
			var data = this.om.getData();
			this.collectMovies(data, this.mainMovie.contents, 0);
			
			this.setActive(this.mainMovie);
		},
		
		collectMovies: function(data, contents, id){
			var movies, currMovie, tmp, movieContents, frames;
			
			var mainName = this.mainName;
			
			var mdata;
			
			main:
			for(var i=0; i<data.length; i++){
				if(!data[i].movies){
					data[i].movies = {};
				}
				
				movies = data[i].movies;
				if(!movies[mainName]){
					this.__addMovie(data[i], mainName);
				}
				
				tmp = {};
				tmp.id = ++id;
				tmp.objectId = data[i].id;
				
				tmp.movies = data[i].movies;
				tmp.name = data[i].name;
				tmp.isClosed = true;
				
				var mainMovie = tmp.movies[mainName];
				if(!mainMovie.subdata){
					mainMovie.subdata = [];
				}
				movieContents = mainMovie.subdata;
				tmp.contents = movieContents;
				
				// clean deleted movies
				clean:
				for(var j=0; j<movieContents.length; j++){
					for(var key in movies){
						if(movieContents[j].name == key){
							continue clean;
						}
					}
					movieContents.splice(j, 1);
				}
				
				scan:
				for(var key in movies){
					if(key == mainName){
						continue;
					}
					tmp.isClosed = false;
					for(var j = 0; j<movieContents.length; j++){
						if(movieContents[j].name == key){
							mdata = movieContents[j];
							mdata.info = movies[key].info;
							continue scan;
						}
					}
					mdata = {};
					
					mdata[mainName] = {
						frames: [],
						info: movies[key].info
					};
					
					movieContents.push({
						id: Math.random(),
						objectId: data[i].id,
						name: key,
						movies: mdata,
						submovie: true
					});
				}
				contents.push(tmp);
			}
		}
	}
);
