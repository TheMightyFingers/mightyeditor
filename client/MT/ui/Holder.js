"use strict";

MT.extend("ui.DomElement")(
	MT.ui.Holder = function(pos, events){
		MT.ui.DomElement.call(this);
		
		this.addClass("ui-holder");
		
		
		this.events = events;
		
		this.handle = new MT.ui.DomElement();
		
		this.top = [];
		this.bottom = [];
		this.left = [];
		this.right = [];
		
		this.toUpdate = [];
		this.panels = [];
		this.seperators = [];
		
		this._ov = {
			x: 0,
			y: 0
		};
		
		var that = this;
		this.events.on("mousemove", function(e){
			if(that.handle.mdown){
				that.resize(e);
			}
			if(that.seperators.mdown > -1){
				that.moveSeperator(that.seperators.mdown);
			}
		});
		
		this.events.on("mousedown", function(e){
			if(e.target == that.handle.el){
				that.handle.mdown = true;
				if(that.position == MT.ui.position.LEFT || that.position == MT.ui.position.RIGHT){
					document.body.style.cursor = "ew-resize";
				}
				else{
					document.body.style.cursor = "ns-resize";
				}
			}
			
			for(var i=0; i<that.seperators.length; i++){
				if(e.target == that.seperators[i].el){
					if(that.position == MT.ui.position.LEFT || that.position == MT.ui.position.RIGHT){
						document.body.style.cursor = "ns-resize";
					}
					else{
						document.body.style.cursor = "ew-resize";
					}
					that.seperators.mdown = i;
				}
			}
		});
		
		this.events.on("mouseup", function(e){
			that.handle.mdown = false;
			that.seperators.mdown = -1;
			
			document.body.style.cursor = "auto";
			that._ov.x = 0;
			that._ov.y = 0;
			
			for(var i=0; i<that.seperators.length; i++){
				that.seperators[i].ox = 0;
				that.seperators[i].oy = 0;
			}
			
		});
		
		this.handle.addClass("ui-handle");
		this.handle.show(this.el);
		this.setPosition(pos);
	},
	{
		handleHeight: 3,
		handleWidth: 3,
		addPanel: function(panel){
			if(this.panels.length > 0){
				this.addSeperator();
			}
			
			this.panels.push(panel);
			panel.show(this.el);
			this.children.push(panel);
			this.alignPanels();
		},
		
		addSeperator: function(){
			var sep = new MT.ui.DomElement();
			sep.addClass("ui-seperator");
			
			sep.show(this.el);
			
			
			this.seperators.push(sep);
			
			for(var i=0; i<this.seperators.length; i++){
				this.seperators[i].aligned = false;
			}
			
			
		},
		
		moveSeperator: function(id, koef){
			
			if(koef == void(0)){
				koef = 1;
			}
			var sep = this.seperators[id];
			
			var ph = 0;
			var n = this.el.offsetHeight;
			
			if(id > 0){
				ph = this.seperators[id-1].y;
				this.moveSeperator(id-1, koef*0.5);
			}
			
			if(id < this.seperators.length-1){
				n = this.seperators[id+1].y;
			}
			
			
			var p1 = this.panels[id];
			var p2 = this.panels[id+1];
			
			
			if(this.position == MT.ui.position.LEFT || this.position == MT.ui.position.RIGHT){
				
				var val = this.events.mouse.my * koef;
				if(sep.oy != 0){
					val += sep.oy;
					sep.oy = 0;
				}
				
				if(sep.y + val < 20){
					sep.oy += val;
					sep.y = 20;
				}
				
				else if(sep.y + val > this.el.offsetHeight - 20){
					sep.oy += val;
					sep.y = this.el.offsetHeight - 20;
					return;
				}
				
				else{
					sep.y = sep.y + val;
				}
				
				p1.height = sep.y - ph;
				p2.y = sep.y;
				p2.height = n - sep.y;
				
			}
		},
   
		get width(){
			if(this.position == MT.ui.position.TOP || this.position == MT.ui.position.BOTTOM){
				return 0;
			}
			return this._width;
		},
		
		set width(val){
			
			if(this._ov.x != 0){
				val += this._ov.x;
				this._ov.x = 0;
			}
			
			this._width = val;
			if(this._width > window.innerWidth*0.5){
				this._ov.x = this._width - window.innerWidth*0.5;
				this._width = window.innerWidth*0.5;
			}
			
			if(this._width < 4){
				this._ov.x = this._width;
				this._width = 4;
			}
			
			this.setPosition(this.position);
		},
   
		get height(){
			if(this.position == MT.ui.position.LEFT || this.position == MT.ui.position.RIGHT){
				return 0;
			}
			return this._height;
		},
   
		set height(val){
			if(this._ov.y != 0){
				val += this._ov.y;
				this._ov.y = 0;
			}
			
			this._height = val;
			if(this._height > window.innerHeight*0.5){
				this._ov.y = this._height - window.innerHeight*0.5;
				this._height = window.innerHeight*0.5;
			}
			
			if(this._height < 4){
				this._ov.y = this._height;
				this._height = 4;
			}
			
			this.setPosition(this.position);
			
			for(var i=0; i<this.seperators.length; i++){
				this.moveSeperator(i, 0.5);
			}
			
		},
		
		set resizeable(val){
			if(val){
				this.handle.show(this.el);
			}
			else{
				this.handle.hide();
			}
		},
		
		resize: function(e){
			
			if(this.position == MT.ui.position.LEFT){
				this.width += this.events.mouse.mx;
			}
			if(this.position == MT.ui.position.RIGHT){
				this.width -= this.events.mouse.mx;
			}
			if(this.position == MT.ui.position.TOP){
				this.height += this.events.mouse.my;
			}
			if(this.position == MT.ui.position.BOTTOM){
				this.height -= this.events.mouse.my;
			}
		},
		
		addTop: function(holder){
			this.top.push(holder);
			this.setPosition(this.position);
		},
		
		getTop: function(){
			var ret = 0;
			for(var i=0; i<this.top.length; i++){
				ret += this.top[i].el.offsetHeight;
			}
			return ret;
		},
   
		addLeft: function(holder){
			this.left.push(holder);
			this.setPosition(this.position);
		},
   
		getLeft: function(holder){
			var ret = 0;
			for(var i=0; i<this.left.length; i++){
				ret += this.left[i].width;
			}
			return ret;
		},
   
		addBottom: function(holder){
			this.bottom.push(holder);
			this.setPosition(this.position);
		},
		
		getBottom: function(){
			var ret = 0;
			for(var i=0; i<this.bottom.length; i++){
				ret += this.bottom[i].height;
			}
			return ret;
		},
		
		addRight: function(holder){
			this.right.push(holder);
			this.setPosition(this.position);
		},
		
		getRight: function(){
			var ret = 0;
			for(var i=0; i<this.right.length; i++){
				ret += this.right[i].width;
			}
			return ret;
			
		},
   
		setPosition: function(pos){
			this.position = pos || this.position || MT.ui.position.TOP;
			
			this.el.style.top = this.getTop();
			this.el.style.left = this.getLeft();
			this.el.style.right = this.getRight();
			this.el.style.bottom = this.getBottom();
			
			this.handle.style.top = 0;
			this.handle.style.left = 0;
			this.handle.style.right = 0;
			this.handle.style.bottom = 0;
			
			if(this.position == MT.ui.position.TOP){
				this.el.style.bottom = "auto";
				this.el.style.height = this._height+"px";
				this.el.style.width = "auto";
				
				this.handle.style.top = "auto";
				this.handle.style.height = this.handleHeight+"px";
				this.handle.style.width = "auto";
				this.handle.el.className = "ui-handle-v";
			}
			
			if(this.position == MT.ui.position.RIGHT){
				this.el.style.left = "auto";
				this.el.style.width = this._width+"px";
				this.el.style.height = "auto";
				
				this.handle.style.right = "auto";
				this.handle.style.width =  this.handleWidth+"px";
				this.handle.style.height = "auto";
				this.handle.el.className = "ui-handle-h";
			}
			
			if(this.position == MT.ui.position.BOTTOM){
				this.el.style.top = "auto";
				this.el.style.height = this._height+"px";
				this.el.style.width = "auto";
				
				this.handle.style.bottom = "auto";
				this.handle.style.height = this.handleHeight+"px";
				this.handle.style.width = "auto";
				this.handle.el.className = "ui-handle-v";
			}
			
			if(this.position == MT.ui.position.LEFT){
				this.el.style.right = "auto";
				this.el.style.width = this._width+"px";
				this.el.style.height = "auto";
				
				this.handle.style.left = "auto";
				this.handle.style.width = this.handleWidth+"px";
				this.handle.style.height = "auto";
				this.handle.el.className = "ui-handle-h";
			}
			
			this.alignPanels();
			this.update();
		},
   
		alignPanels: function(){
			if(!this.panels.length){
				return;
			}
			
			for(var i=0; i<this.panels.length; i++){
				this.panels[i].height = this.panels[i]._height;
			}
			
			
			var off = 0;
			if(this.position == MT.ui.position.TOP || this.position == MT.ui.position.BOTTOM){
				for(var i=1; i<this.seperators.length; i++){
					if(!this.seperators[i].aligned){
						this.panels[i-1].height = this.el.offsetWidth / this.panels.length;
						this.panels[i].height = this.el.offsetWidth / this.panels.length;
						
						off += this.el.offsetWidth / this.panels.length;
						this.seperators[i].y = off;
						this.seperators[i].width = this.handleWidth;
						this.seperators[i].aligned = true;
					}
				}
			}
			
			
			var s = this.el.offsetHeight / this.panels.length;
			off = 0;
			
			if(this.position == MT.ui.position.LEFT || this.position == MT.ui.position.RIGHT){
				for(var i=0; i<this.seperators.length; i++){
					off += s;
					if(!this.seperators[i].aligned){
						this.seperators[i].y = off;
						this.seperators[i].height = this.handleHeight;
						this.seperators[i].aligned = true;
					}
					else{
						this.seperators[i].height = this.handleHeight;
						this.seperators[i].y = this.seperators[i].y;
					}
				}
				
				for(var i=0; i<this.seperators.length; i++){
					this.moveSeperator(i, 0);
				}
				
			}
		},
   
   
		onupdate: function(cb){
			this.toUpdate.push(cb);
		},
		update: function(){
			for(var i=0; i<this.toUpdate.length; i++){
				this.toUpdate[i]();
			}
		}
	   
	   
	   
	}
);

MT.ui.position = {
	TOP: 0,
	RIGHT: 1,
	BOTTOM: 2,
	LEFT: 3,
	CENTER: 4
};