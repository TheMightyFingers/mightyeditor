"use strict";

MT.extend("core.Emitter")(
	MT.ui.Keyframes = function(ui, dataIn, count, d1, d2){
		var that = this;
		
		this.data = this.buildData(dataIn);
		
		this.tv = new MT.ui.TreeView(this.data, {root: pp.path});
		this.tv.on("click", function(){
			console.log("selected", arguments);
		});
		this.tv.on(["open", "close"], function(){
			that.hideFrames();
			that.showFrames();
		});
		this.tv.enableInput(ui.events);
		
		
		this.ui = ui;
		
		this.el = document.createElement("div");
		this.el.className = "ui-kf-container";
		
		this.label = document.createElement("div");
		this.label.innerHTML = this.name;
		this.label.className = "ui-kf-label";
		
		this.framesHolders = [];
		this.createKeyFrames();
		
		this.count = count;
		this.frames = frames;
		this.frameElements = [];
		
		this.d1 = d1;
		this.d2 = d2;
		
		this.show();
		
		return;
		this.buildFrames();
		
		this.addEvents();
		
		this.setActive(0);
		
		//this.markFrames(frames);
	},
	{
		buildData: function(inp){
			//var out = {};
			var ret = [];
			var movies = inp.movies;
			//out.name = inp.name;
			//out.contents = [];
			
			for(var key in movies){
				ret.push({
					name: key,
					contents: [inp]
				});
				break;
			}
			
			
			return ret;
		},
		
		createKeyFrames: function(){
			var it = this.tv.items;
			var f;
			for(var i=0; i<it.length; i++){
				f = document.createElement("div");
				f.className = "ui-kf-frames";
				f.style.position = "absolute";
				//console.log(it[i].el.offsetTop);
				this.framesHolders.push(f);
			}
		},
		
		isVisible: false,
		hide: function(){
			if(!this.isVisible){
				return;
			}
			this.isVisible = false;
			this.tv.tree.hide();
			this.hideFrames();
		},
		hideFrames: function(){
			var f;
			for(var i=0; i<this.framesHolders.length; i++){
				f = this.framesHolders[i];
				if(f.parentNode){
					this.d2.removeChild(f);
				}
			}
		},
		show: function(){
			if(this.isVisible){
				return;
			}
			this.isVisible = true;
			//this.d1.appendChild(this.tv);
			this.tv.tree.show(this.d1);
			this.showFrames();
		},
		showFrames: function(){
			var it, f, b;
			for(var i=0; i<this.framesHolders.length; i++){
				f = this.framesHolders[i];
				it = this.tv.items[i].head;
				if(it.isVisible){
					b = it.calcOffsetY(this.d1);
					if(i > 0){
						f.style.top = (4+b)+"px";
					}
					else{
						f.style.top = (2+b)+"px";
						
					}
					b = it.bounds;
					f.style.height = b.height + "px";
					console.log(b);
					if(b.height > 0){
						this.d2.appendChild(f);
					}
				}
			}
		},
		buildFrames: function(){
			var el, f;
			for(var j=0; j<this.framesHolders.length; j++){
				for(var i=0; i<this.count; i++){
					el = new MT.ui.DomElement("span");
					this.frameElements.push(el);
					this.framesHolders[i].appendChild(el.el);
				}
			}
			
		},
		
		markFrames: function(frames){
			this.frames = frames;
			for(var i=0; i<this.count; i++){
				if(this.frames[i]){
					this.frameElements[i].addClass("keyframe");
				}
				else{
					this.frameElements[i].removeClass("keyframe");
				}
			}
		},
		
		addEvents: function(){
			var that = this;
			var mdown = false;
			
			var action = function(e){
				
				
				var index = Array.prototype.indexOf.call(that.framesHolder.childNodes, e.target);
				if(index === -1){
					return;
				}
				that.setActive(index);
			};
			/*
			this.framesHolder.onmousemove = function(e){
				if(mdown){
					action(e);
					e.preventDefault();
					e.stopPropagation();
				}
			};
			this.framesHolder.onmousedown = function(e){
				mdown = true;
				action(e);
			};
			this.ui.events.on("mouseup", function(){
				mdown = false;
			});
			*/
		},
		
		setActive: function(index){
			if(this.active > -1){
				this.frameElements[this.active].removeClass("active");
			}
			
			this.active = index;
			this.frameElements[this.active].addClass("active");
			
			this.emit("frameChanged", this.active);
		},
		



	}
);