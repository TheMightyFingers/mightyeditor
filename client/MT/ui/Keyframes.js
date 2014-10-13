"use strict";

MT.extend("core.Emitter")(
	MT.ui.Keyframes = function(ui, frames, count, name, d1, d2){
		this.name = name || "xxx";
		this.ui = ui;
		
		this.el = document.createElement("div");
		this.el.className = "ui-kf-container";
		
		this.label = document.createElement("div");
		this.label.innerHTML = this.name;
		this.label.className = "ui-kf-label";
		
		var that = this;
		/*this.label.onmousedown = function(e){
			
		};*/
		
		/*this.label.ondblclick = function(e){
			that.label.setAttribute("contenteditable", true);
			e.preventDefault();
			e.stopPropagation();
		};
		this.label.onkeyup = function(){
			console.log("UPPP");
		};
		ui.on("mousedown", function(e){
			if(e.target != that.label){
				console.log("blurr");
			}
		});*/
		this.framesHolder = document.createElement("div");
		this.framesHolder.className = "ui-kf-frames";
		
		
		
		this.count = count;
		this.frames = frames;
		this.frameElements = [];
		
		this.d1 = d1;
		this.d2 = d2;
		
		this.show();
		
		this.buildFrames();
		
		this.addEvents();
		
		this.setActive(0);
		
		this.markFrames(frames);
	},
	{
		isVisible: false,
		hide: function(){
			if(!this.isVisible){
				return;
			}
			this.isVisible = false;
			this.d1.removeChild(this.label);
			this.d2.removeChild(this.framesHolder);
		},
		show: function(){
			if(this.isVisible){
				return;
			}
			this.isVisible = true;
			this.d1.appendChild(this.label);
			this.d2.appendChild(this.framesHolder);
		},
		buildFrames: function(){
			var el;
			for(var i=0; i<this.count; i++){
				el = new MT.ui.DomElement("span");
				this.frameElements.push(el);
				this.framesHolder.appendChild(el.el);
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