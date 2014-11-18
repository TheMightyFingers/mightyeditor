"use strict";

MT.extend("core.Emitter")(
	MT.ui.Keyframes = function(mm, count){
		var ui = mm.ui;
		var dataIn = window.ddd = mm.data;
		var d1 = mm.leftPanel.content;
		var d2 = mm.rightPanel.content;
		
		this.frameHolderWrapper = document.createElement("div");
		this.frameHolderWrapper.className = "ui-frameHolderWrapper";
		
		this.mm = mm;
		
		var that = this;
		this.dataIn = dataIn;
		this.buildData(dataIn);
		
		this.tv = new MT.ui.TreeView(JSON.parse(JSON.stringify(this.data)), {root: pp.path});
		this.tv.tree.addClass("ui-keyframes-tree");
		
		
		this.scrollTop = 0;
		this.tv.tree.el.onscroll = function(){
			that.hideFrames();
			that.showFrames();
			that.scrollTop = that.tv.tree.el.scrollTop;
		};
		
		var select = function(data, el){
			if(data.isMovie){
				that.unselect();
				that.active = el;
				el.addClass("active");
				return;
			}
			
			if(!data.isMovie || that.activeMovie == data.name){
				that.hideFrames();
				that.emit("select",data);
				that.showFrames();
				return;
			}
			
			
			that.activeMovie = data.name;
			that.markFirstFrame();
			
			that.hideFrames();
			that.showFrames();
			
			that.updateTree(data);
		}
		
		this.tv.on("click", function(data, el){
			console.log("selected", arguments);
			select(data, el);
		});
		
		this.tv.on("open", function(el){
			select(el.data, el);
		});
		
		this.tv.on("close", function(el){
			that.hideFrames();
			
			that.buildData();
			that.tv.merge(that.data);
			
			that.showFrames();
		});
		
		this.tv.enableInput(ui.events);
		
		this.tv.disableRename();
		
		this.ui = ui;
		
		this.el = document.createElement("div");
		this.el.className = "ui-kf-container";
		
		this.label = document.createElement("div");
		this.label.innerHTML = this.name;
		this.label.className = "ui-kf-label";
		
		this.framesHolders = [];
		
		this.buildFrames();
		
		this.count = count;
		this.frames = frames;
		this.frameElements = [];
		
		this.d1 = d1;
		this.d2 = d2;
		
		this.addControls();
		
		this.show();
		
		if(Object.keys(this.dataIn.movies).length == 0){
			this.hide();
		}
	},
	{
		activeMovie: "",
		
		get isReady(){
			return !!Object.keys(this.dataIn.movies).length;
		},
		
		buildData: function(inp){
			this.panels = {};
			
			inp = inp || this.dataIn;
			var movies = inp.movies;
			
			
			var c = [inp];
			var pp;
			for(var key in movies){
				if(this.activeMovie == ""){
					this.activeMovie = key;
				}
				if(pp){
					this.createPanel(key, pp);
				}
				else{
					pp = this.createPanel(key, pp);
				}
			}
			if(pp){
				pp.show();
			}
			this.data = c;
		},
		
		rebuildData: function(){
			var pp;
			var p;
			for(var key in this.dataIn.movies){
				if(!this.panels[key]){
					p = this.createPanel(key, pp);
					p.show();
				}
				else if(!pp){
					pp = this.panels[key];
				}
			}
			this.show();
			this.panels[this.activeMovie].show();
		},
		
		updateTree: function(data){
			this.data = data;
			this.buildData();
			this.tv.merge(this.data);
			
			this.hideFrames();
			this.showFrames();
		},
		
		createPanel: function(name, pp){
			var p = new MT.ui.Panel(name);
			this.panels[name] = p;
			p.hide();
			p.fitIn();
			
			if(pp){
				pp.addJoint(p);
			}
			else{
				p.show(this.mm.panel.content.el);
				p.fitIn();
			}
			p.el.style.height = "18px";
			var that = this;
			p.on("show", function(){
				that.activeMovie = name;
				that.mm.changeFrame(0);
				that.updateFrames();
			});
			p.on("rename", function(n, o){
				that.rename(n, o);
			});
			p.isRenamable = true;
			p.removeBorder();
			return p;
		},
		
		
		rename: function(newName, oldName){
			var item, movie;
			
			for(var i in this.mm.items){
				item = this.mm.items[i];
				movie = item.movies[oldName];
				delete item.movies[oldName];
				item.movies[newName] = movie;
			}
			
			if(this.activeMovie == oldName){
				this.activeMovie = newName;
			}
			this.updateFrames();
			
		},
		
		removeConf: function(name){
			var pop = new MT.ui.Popup("Delete movie?", "Are you sure you want to delete movie: " + MT.core.Helper.htmlEntities(name) + "?");
			var that = this;
			pop.addButton("no", function(){
				pop.hide();
			});
			
			pop.addButton("yes", function(){
				that.remove(name);
				pop.hide();
			});
			
			pop.showClose();
		},
		
		remove: function(name){
			var item, movie;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				movie = item.movies[name];
				delete item.movies[name];
			}
			
			
			
			//delete this.dataIn.movies[name];
			this.panels[name].close();
			
			
			var k = Object.keys(this.dataIn.movies);
			if(!k.length){
				console.log("NO more movies");
				this.mm.clear();
				this.activeMovie = null;
				this.mm.activeMovie = null;
				return;
			}
			
			this.activeMovie = k[0];
			this.mm.redrawAll();
			
			return 
		},
		isVisible: false,
		hide: function(){
			if(!this.isVisible){
				return;
			}
			this.isVisible = false;
			this.tv.tree.hide();
			this.hideFrames();
			if(this.controlsHolder.parentNode){
				this.controlsHolder.parentNode.removeChild(this.controlsHolder);
			}
			
			for(var key in this.panels){
				this.panels[key].hide();
			}
			this.mm.leftPanel.style.borderRightStyle = "none";
		},
		hideFrames: function(){
			if(this.frameHolderWrapper.parentNode){
				this.frameHolderWrapper.parentNode.removeChild(this.frameHolderWrapper);
			}
			
			for(var i=0; i<this.framesHolders.length; i++){
				this.framesHolders[i].hide();
			}
		},
		show: function(){
			if(this.isVisible){
				return;
			}
			this.isVisible = true;
			//this.d1.appendChild(this.tv);
			this.tv.tree.show(this.d1.el);
			this.showFrames();
			
			for(var key in this.panels){
				this.panels[key].show();
				break;
			}
			
			this.mm.leftPanel.style.borderRightStyle = "solid";
		},
		
		showFrames: function(){
			this.d2.el.appendChild(this.frameHolderWrapper);
			
			var wrap = this.frameHolderWrapper;
			var it, f, b;
			var t = 7;
			var db = this.d2.bounds;
			var top;
			for(var i=0; i<this.tv.items.length; i++){
				f = this.framesHolders[i];
				if(!f){
					f = this.addFrameHolder();
				}
				var data = this.tv.items[i].data
				it = this.tv.items[i].head;
				if(this.active == this.tv.items[i]){
					f.addClass("active");
				}
				else{
					f.removeClass("active");
				}
				
				if(!it.isVisible){
					return;
				}
				
				b = it.bounds;
				
				
				if(i==0){
					f.addClass("top");
					f.style.height = b.height + 2 +"px";
					top = (b.top - db.top + this.d2.el.scrollTop -1 - wrap.offsetTop);
				}
				else{
					f.removeClass("top");
					f.style.height = b.height + "px";
					 top = (b.top - db.top + this.d2.el.scrollTop +1 - wrap.offsetTop);
				}
				
				/*
				if(top < 0){
					if(f.el.parentNode){
						f.el.parentNode.removeChild(f.el);
					}
					continue;
				}
				*/
				
				f.style.top = top + "px";
				f.el.data = data;
				
				if(b.height > 0){
					wrap.appendChild(f.el);
				}
				else{
					f.hide();
				}
			}
			
			this.tv.tree.el.scrollTop = this.scrollTop;
		},
		active: null,
		setActiveObject: function(id){
			this.unselect();
			var item = this.tv.getById(id);
			if(!item){
				return;
			}
			item.addClass("active");
			this.active = item;
			
		},
		
		unselect: function(){
			if(this.active){
				this.active.removeClass("active");
				this.active = null;
			}
		},
		buildFrames: function(){
			var it = this.tv.items;
			var f;
			for(var i=0; i<it.length; i++){
				f = this.addFrameHolder();
				
				this.markFrames(it[i], f.el);
				
			}
			
			this.firstFrame = this.framesHolders[0];
			this.makeControls();
		},
		
		addFrameHolder: function(){
			var f = new MT.ui.DomElement("div");
			f.addClass("ui-kf-frames");
			f.style.position = "absolute";
			this.framesHolders.push(f);
			f.el.innerHTML = "";
			return f;
		},
		
		updateFrames: function(){
			var it = this.tv.items;
			var f;
			for(var i=0; i<it.length; i++){
				f = this.framesHolders[i];
				if(!f){
					f = this.addFrameHolder();
				}
				
				f.el.innerHTML = "";
				this.markFrames(it[i], f.el);
			}
			
			this.firstFrame = this.framesHolders[0];
			this.makeControls();
			
			this.showFrames();
		},
		
		makeControls: function(){
			//console.log("make controls", this.tv.items[0]);
		},
		
		
		markFrames: function(item, track){
			if(item.data.isMovie){
				return;
			}
			if(!this.activeMovie){
				return;
			}
			
			var mo = this.mm.getById(item.data.id);
			if(!mo){
				return;
			}
			
			if(!mo.movies || !mo.movies[this.activeMovie]){
				this.mm.addMovie(mo, this.activeMovie);
			}
			
			var frames = mo.movies[this.activeMovie].frames;
			if(!frames){
				this.mm.addMovie(mo, this.activeMovie);
				frames = mo.movies[this.activeMovie].frames;
			}
			
			
			var frame = 0;
			for(var i=0; i<frames.length; i++){
				frame = frames[i].keyframe;
				if(frame < this.mm.startFrame){
					continue;
				}
				
				this.addFrame(frames, i, track);
			}
		},
		
		addFrame: function(frames, index, track){
			var item = frames[index];
			var startFrame = this.mm.startFrame;
			var el = document.createElement("span");
			if(this.mm.selectedFrame == item){
				el.className = "ui-kf-frame active";
			}
			else{
				el.className = "ui-kf-frame";
			}
			track.appendChild(el);
			
			el.style.width = this.mm.frameSize + "px";
			el.style.left = (item.keyframe * this.mm.frameSize + this.mm.frameOffset) - startFrame*this.mm.frameSize + "px";

			el.frameInfo = {
				frames: frames,
				index: index
			};
		},
		
		moveFrame: function(frame, num){
			frame.keyframe = num;
			
		},
		
		controlsHolder: null,
		addControls: function(){
			this.controlsHolder = document.createElement("div");
			this.controlsHolder.className = "ui-keyframes-controls";
			var c = {};
			
			c.play = document.createElement("div");
			c.play.className = "ui-keyframes-play";
			
			c.stop = document.createElement("div");
			c.stop.className = "ui-keyframes-stop";
			
			this.d1.el.appendChild(this.controlsHolder);
			
			c.delete = document.createElement("div");
			c.delete.className = "ui-keyframes-delete";
			
			var mov = this.getMainMovie();
			if(mov){
				var fpsInput = new MT.ui.Input(this.ui, {key: "fps", min: 1}, mov.info);;
				fpsInput.el.className += " keyframes-fps";
				this.controlsHolder.appendChild(fpsInput.el);
				var that = this;
				fpsInput.on("change", function(){
					that.mm.redrawAll();
				});
			}
			
			for(var k in c){
				this.controlsHolder.appendChild(c[k]);
			}
			
			var isPlaying = false;
			var currFrame = this.mm.activeFrame;
			var that = this;
			
			var lastFrame = 0;
			
			var playStartFrame = 0;
			
			var next;
			var loop = function(){
				if(!isPlaying){
					return;
				}
				
				next = that.mm.activeFrame + 1;
				if(next > lastFrame){
					next = 0;
				}
				
				that.mm.changeFrame(next);
				
				window.setTimeout(loop, 1000/that.getFps());
			};
			
			var playPause = function(){
				if(!isPlaying){
					lastFrame =  that.getLastFrame();
					c.play.className = "ui-keyframes-pause";
					isPlaying = true;
					playStartFrame = that.mm.activeFrame;
					loop();
				}
				else{
					isPlaying = false;
					c.play.className = "ui-keyframes-play";
				}
			};
			
			var stop = function(){
				if(!isPlaying){
					playStartFrame = 0;
				}
				isPlaying = false;
				that.mm.changeFrame(playStartFrame);
				c.play.className = "ui-keyframes-play";
			};
			
			
			this.controlsHolder.onmousedown = this.controlsHolder.onmouseup = function(e){
				e.preventDefault();
				e.stopPropagation();
			};
			
			this.controlsHolder.onclick = function(e){
				if(e.target == c.play){
					playPause();
					e.preventDefault();
					e.stopPropagation();
				}
				if(e.target == c.stop){
					stop();
					e.preventDefault();
					e.stopPropagation();
				}
				if(e.target == c.delete){
					that.removeConf(that.activeMovie);
				}
			};
			this.controls = c;
		},
		getLastFrame: function(){
			var max = 0;
			var items = this.mm.items;
			var m, l, mov;
			
			for(var key in items){
				m = items[key].movies;
				if(!m){
					return;
				}
				mov = m[this.activeMovie].frames;
				if(!mov.length){
					continue;
				}
				l = mov[mov.length - 1];
				if(max < l.keyframe){
					max = l.keyframe;
				}
			}
			return max;
		},
		getFps: function(){
			var fps = 60;
			var mov = this.getMainMovie();
			if(mov){
				fps = mov.info.fps;
			}
			return fps;
		},
		getMainMovie: function(){
			if(this.dataIn.movies[this.activeMovie]){
				return this.dataIn.movies[this.activeMovie];
			}
			return null;
		},
		
		markFirstFrame: function(){
			this.mm.changeFrame(0);
			
			console.log("mark frames for movie", this.activeMovie);
			console.log(this.mm.items);
			var item, frameData;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				
				if(!item.movies){
					this.mm.addMovie(item, this.activeMovie);
				}
				
				frameData = item.movies[this.activeMovie].frames[0];
				if(frameData){
					if(frameData.keyframe == void(0)){
						frameData.keyframe = 0;
					}
					this.mm.loadState(i, frameData, 0);
					console.log("Frame added");
				}
				else{
					frameData = this.mm.collect(item);
					frameData.keyframe = 0;
					item.movies[this.activeMovie] = [frameData];
				}
			}
			
			this.updateFrames();
		},
		
		saveActiveFrame: function(ni){
			if(!this.activeMovie){
				return;
			}
			var item, frameData;
			var movie;
			var found = false;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				if(this.active && this.active.data.id && this.active.data.id != item.id){
					continue;
				}
				movie = item.movies[this.activeMovie];
				if(!movie){
					this.mm.clear();
					return;
				}
				found = false;
				for(var j=0; j<movie.frames.length; j++){
					frameData = movie.frames[j];
					if(frameData.keyframe == this.mm.activeFrame){
						movie.frames[j] = this.mm.collect(item, this.mm.activeFrame, movie.frames[j]);
						console.log("frame updated", this.mm.activeFrame);
						found = true;
						break;
					}
				}
				if(!found && !ni){
					frameData = this.mm.collect(item, this.mm.activeFrame);
					movie.frames.push(frameData);
				}
			}
			this.sortFrames();
			this.updateFrames();
		},
		
		sortFrames: function(){
			var item, movie;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				for(var m in item.movies){
					movie = item.movies[m];
					movie.frames.sort(function(a,b){
						return a.keyframe - b.keyframe ;
					});
				}
			}
		},
		
		removeFrame: function(){
			if(this.mm.activeFrame === 0){
				return;
			}
			var item, frameData;
			var movie;
			var found = false;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				movie = item.movies[this.activeMovie];
				found = false;
				for(var j=0; j<movie.length; j++){
					frameData = movie[j];
					if(frameData.keyframe  == this.mm.activeFrame){
						movie.splice(j, 1);
						break;
					}
				}
			}
			
			
			this.updateFrames();
		},
		changeFrame: function(frame){
			
			var item, frameData;
			var movie, frames;
			var found = false;
			var start = 0;
			var end = 0;
			
			for(var i in this.mm.items){
				item = this.mm.items[i];
				movie = item.movies[this.activeMovie];
				frames = movie.frames;
				found = false;
				start = end = 0; 
				// check keyframe
				for(var j=0; j<frames.length; j++){
					frameData = frames[j];
					if(frameData.keyframe  < this.mm.activeFrame){
						start = j;
					}
					
					
					if(frameData.keyframe  == this.mm.activeFrame){
						found = true;
						this.mm.loadState(i, frameData, frameData.keyframe );
						break;
					}
					
					
					if(frameData.keyframe  > this.mm.activeFrame){
						end = j;
						break;
					}
				}
				
				if(found){
					continue;
				}
				
				// only 1 frame has been found
				if(start == end){
					this.mm.loadState(i, frames[start], start);
					continue;
				}
				
				// final frame
				if(start > end){
					this.mm.loadState(i, frames[start], start);
					continue;
				}
				
				// interpolate between frames
				this.mm.interpolate(i, frames[start], frames[end], this.mm.activeFrame);
				
				
				
			}
		},
		
		markActive: function(data){
			console.log("mark active",data);
			
		},
		
		addEvents: function(){
			console.log("add Events");
		},
		
		setActiveFrame: function(index){
			if(this.active > -1){
				this.frameElements[this.active].removeClass("active");
			}
			
			this.active = index;
			this.frameElements[this.active].addClass("active");
			
			this.emit("frameChanged", this.active);
		},
		



	}
);