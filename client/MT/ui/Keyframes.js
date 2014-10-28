"use strict";

MT.extend("core.Emitter")(
	MT.ui.Keyframes = function(mm, count){
		var ui = mm.ui;
		var dataIn = mm.data;
		var d1 = mm.leftPanel.content;
		var d2 = mm.rightPanel.content;
		
		
		this.mm = mm;
		
		var that = this;
		this.dataIn = dataIn;
		this.buildData(dataIn);
		
		this.tv = new MT.ui.TreeView(JSON.parse(JSON.stringify(this.data)), {root: pp.path});
		
		this.tv.tree.style.paddingTop = "30px";
		
		var select = function(data, el){
			if(data.isMovie){
				that.unselect();
				that.active = el;
				el.addClass("active");
				return;
			}
			
			if(!data.isMovie || that.activeMovie == data.name){
				that.hideFrames();
				that.showFrames();
				that.markActive( data );
				
				that.emit("select",data);
				return;
			}
			
			
			that.activeMovie = data.name;
			that.markFirstFrame();
			
			that.hideFrames();
			that.showFrames();
			
			that.buildData();
			that.tv.merge(that.data);
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
		this.tv.on("rename", function(el, oldName){
			if(!el.data.isMovie){
				return;
			}
			console.log("rename", el.data.name, oldName);
			
			
			var t = that.dataIn.movies[oldName];
			
			delete that.dataIn.movies[oldName];
			
			that.dataIn.movies[el.data.name] = t;
			
			if(that.activeMovie == oldName){
				that.activeMovie = el.data.name;
			}
			
			that.hideFrames();
			
			that.buildData();
			that.tv.merge(that.data);
			
		});
		
		
		this.tv.enableInput(ui.events);
		
		
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
	},
	{
		activeMovie: "",
		
		buildData: function(inp){
			inp = inp || this.dataIn;
			var ret = [];
			var movies = inp.movies;
			var c = [inp];
			for(var key in movies){
				if(this.activeMovie == ""){
					this.activeMovie = key;
				}
				if(this.activeMovie == key){
					ret.push({
						name: key,
						contents: c,
						isClosed: false,
						isMovie: true
					});
				}
			}
			for(var key in movies){
				if(this.activeMovie !== key){
					ret.push({
						name: key,
						contents: [],
						isClosed: true,
						isMovie: true
					});
				}
			}
			
			
			this.data = ret;
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
		},
		hideFrames: function(){
			var f;
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
		},
		showFrames: function(){
			var it, f, b;
			var t = 7;
			var shouldBreak = false;
			var db = this.d2.bounds;
			for(var i=0; i<this.framesHolders.length; i++){
				f = this.framesHolders[i];

				if(this.tv.items[i].data.isMovie){
					if(shouldBreak){
						break;
					}
					f.addClass("top");
					shouldBreak = true;
				}
				else{
					f.removeClass("top");
				}
				
				
				it = this.tv.items[i].head;
				if(it.isVisible){
					b = it.bounds;

					f.style.top = (b.top - db.top + this.d2.el.scrollTop +1)+"px";
					f.style.height = b.height + "px";
					if(b.height > 0){
						this.d2.el.appendChild(f.el);
					}
					else{
						f.hide();
					}
				}
			}
			
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
				f = new MT.ui.DomElement("div");
				f.addClass("ui-kf-frames");
				f.style.position = "absolute";
				this.framesHolders.push(f);
				f.el.innerHTML = "";
				
				this.markFrames(it[i], f.el);
				
			}
			
			this.firstFrame = this.framesHolders[0];
			this.makeControls();
		},
		
		updateFrames: function(){
			
			console.log("UPDATE!!!!");
			
			var it = this.tv.items;
			var f;
			for(var i=0; i<it.length; i++){
				f = this.framesHolders[i];
				f.el.innerHTML = "";
				this.markFrames(it[i], f.el);
			}
			
			this.firstFrame = this.framesHolders[0];
			this.makeControls();
		},
		
		makeControls: function(){
			console.log("make controls", this.tv.items[0]);
		},
		
		
		markFrames: function(item, track){
			if(item.data.isMovie){
				return;
			}
			
			var mo = this.mm.getById(item.data.id);
			if(!mo.movies){
				mo.movies = {};
			}
			var frames = mo.movies[this.activeMovie];
			var frame = 0;
			var el;
			
			for(var i=0; i<frames.length; i++){
				frame = frames[i].frame;
				el = document.createElement("span");
				el.className = "ui-kf-frame";
				track.appendChild(el);
				el.style.width = this.mm.frameSize + "px";
				el.style.left = (frame * this.mm.frameSize) + "px";
				el.setAttribute("frame", frame);
			}
			
			
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
			
			for(var k in c){
				this.controlsHolder.appendChild(c[k]);
			}
			
			this.controls = c;
		},
		
		markFirstFrame: function(){
			console.log("mark frames for movie", this.activeMovie);
			console.log(this.mm.items);
			var item, frameData;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				if(!item.movies){
					item.movies = {};
				}
				if(!item.movies[this.activeMovie]){
					item.movies[this.activeMovie] = [this.mm.collect(item)];
				}
				frameData = item.movies[this.activeMovie][0];
				if(frameData){
					if(frameData.frame == void(0)){
						frameData.frame = this.mm.activeFrame;
					}
					this.mm.loadState(i, frameData, 0);
				}
				else{
					frameData = this.mm.collect(item);
					frameData.frame = 0;
					item.movies[this.activeMovie] = [frameData];
				}
			}
			
			this.updateFrames();
		},
		
		saveActiveFrame: function(ni){
			var item, frameData;
			var movie;
			var found = false;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				if(this.active && this.active.data.id && this.active.data.id != item.id){
					continue;
				}
				movie = item.movies[this.activeMovie];
				found = false;
				for(var j=0; j<movie.length; j++){
					frameData = movie[j];
					if(frameData.frame == this.mm.activeFrame){
						movie[j] = this.mm.collect(item);
						movie[j].frame = this.mm.activeFrame;
						console.log("frame updated", this.mm.activeFrame);
						found = true;
						break;
					}
				}
				if(!found && !ni){
					frameData = this.mm.collect(item);
					frameData.frame = this.mm.activeFrame;
					console.log("frame added", this.mm.activeFrame);
					movie.push(frameData);
				}
				
				movie.sort(function(a,b){
					return a.frame - b.frame;
				});
			}
			
			this.updateFrames();
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
					if(frameData.frame == this.mm.activeFrame){
						movie.splice(j, 1);
						break;
					}
				}
			}
			
			
			this.updateFrames();
		},
		changeFrame: function(frame){
			
			var item, frameData;
			var movie;
			var found = false;
			var start = 0;
			var end = 0;
			
			for(var i in this.mm.items){
				item = this.mm.items[i];
				movie = item.movies[this.activeMovie];
				found = false;
				start = end = 0; 
				// check keyframe
				for(var j=0; j<movie.length; j++){
					frameData = movie[j];
					if(frameData.frame < this.mm.activeFrame){
						start = j;
					}
					
					
					if(frameData.frame == this.mm.activeFrame){
						found = true;
						this.mm.loadState(i, frameData, frameData.frame);
						console.log("LOAD:", frameData);
						
						break;
					}
					
					
					if(frameData.frame > this.mm.activeFrame){
						end = j;
						break;
					}
				}
				
				if(found){
					continue;
				}
				
				//console.log("interpolate", start, end);
				
				// only 1 frame has been found
				if(start == end){
					this.mm.loadState(i, movie[start], start);
					continue;
				}
				
				// final frame
				if(start > end){
					this.mm.loadState(i, movie[start], start);
					continue;
				}
				
				// interpolate between frames
				this.mm.interpolate(i, movie[start], movie[end], this.mm.activeFrame);
				
				
				
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