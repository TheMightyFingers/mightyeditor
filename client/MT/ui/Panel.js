"use strict";

MT.require("ui.Button");
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.Panel = function(title, events){
		MT.ui.DomElement.call(this);
		
		this.addClass("ui-panel");
		//this.style.backgroundColor = "rgba(0,0,0, 0.5)";
		
	
		this.header = new MT.ui.DomElement();
		this.header.addClass("ui-panel-header");
		this.header.el.innerHTML = "PANEL";
		this.header.height = 25;
		
		
		
		
		
		
		this.content = new MT.ui.DomElement();
		this.addChild(this.content);
		this.content.show(this.el);
		
		
		this.content.style.overflow = "auto";
		//this.content.style.position = "initial";
		this.content.addClass("ui-panel-content");
		
		if(title){
			this.addHeader();
		}
		this.hide();
		
		this.title = title;
		
		this.events = events;
		var that = this;
		this.events.on("mousemove", function(e){
			if(e.target == that.header){
				console.log(that);
			}
		});
		
		this.events.on("resize", function(){
			that.update();
			
		});
		this.buttons = [];
		
		this.isVisible = false;
	},
	{
		show: function(parent){
			if(this.isVisible){
				return;
			}
			MT.ui.DomElement.show.call(this, parent);
			this.alignButtons();
			this.emit("show");
		},
		
		hide: function(){
			if(!this.isVisible){
				return;
			}
			MT.ui.DomElement.hide.call(this);
			this.emit("hide");
		},
		addHeader: function(){
			this.addChild(this.header);
			this.header.show(this.el);
			this.content.y = this.header.height;
		},
		removeHeader: function(){
			this.header.hide();
			this.content.y = 0;
		},
		
		addButton: function(title, className, cb){
			var b = null;
			
			if(title && typeof title == "object"){
				b = title;
			}
			else{
				b = new MT.ui.Button(title, className, this.events, cb);
			}
			this.content.addChild(b);
			this.buttons.push(b);
			
			this.alignButtons();
			return b;
		},
		
		alignButtons: function(){
			var off = 0;
			var c = null;
			for(var i=0; i<this.buttons.length; i++){
				c = this.buttons[i];
				c.x = off;
				off += c.width;
				
			}
			
		},
		
		addButtonV: function(title, className, cb){
			var b = new MT.ui.Button(title, className, this.events, cb);
			
			var off = 0;
			for(var i=0; i<this.content.children.length; i++){
				off += this.content.children[i].el.offsetHeight;
			}
			
			b.y += off;
			
			this.content.addChild(b);
			return b;
		},
		
		set title(val){
			this.header.el.innerHTML = val;
			if(val){
				this.content.y = this.header.height;
			}
		},
		get title(){
			return this.header.el.innerHTML;
		}
		
		
	}
);
