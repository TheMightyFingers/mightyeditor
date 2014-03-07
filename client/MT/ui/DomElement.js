MT(
	MT.ui.DomElement = function(){
		this.el = document.createElement("div");
		this.el.style.position = "absolute";
		this.style = this.el.style;
		this.style.top = 0;
		this.style.right = 0;
		this.style.bottom = 0;
		this.style.left = 0;
		
		this.childs = [];
	},
	{
		_parent: null,
		addChild: function(el){
			el._parent = this.el;
			this.childs.push(el);
			el.show(el._parent);
			return el;
		},
		removeChild: function(child){
			for(var i=0; i<this.childs.length; i++){
				if(this.childs[i] == child){
					this.childs[i] = this.childs[this.childs.length-1];
					this.childs.length = this.childs.length - 1;
					break;
				}
			}
		},
		show: function(parent){
			this._parent = parent || this._parent;
			if(this.el.parentNode == this._parent){
				return;
			}
			this._parent.appendChild(this.el);
			
			this.height = this._height;
			this.width = this._width;
		},
   
		hide: function(){
			if(this.el.parentNode !== this._parent || !this._parent){
				return;
			}
			this._parent.removeChild(this.el);
		},
		
		addClass: function(cls){
			if(!this.hasClass(cls)){
				this.el.className += " "+cls;
			}
		},
		
		removeClass: function(cls){
			var c = this.el.className.split(" ");
			for(var i=0; i<c.length; i++){
				if(cls == c[i]){
					c[i] = c[c.length-1];
					c.length = c.length - 1;
				}
			}
			this.el.className = c.join(" ");
		},
		
		hasClass: function(cls){
			var c = this.el.className.split(" ");
			for(var i=0; i<c.length; i++){
				if(cls == c[i]){
					return true;
				}
			}
			return false;
		},
		
		_x: 0,
		set x(val){
			this._x = val;
			this.style.left = val+"px";
			this.width = this._width;
		},
		get x(){
			return this._x;
		},
   
		_y: 0,
		set y(val){
			this._y = val;
			this.style.top = val+"px";
			this.height = this._height;
		},
		get y(){
			return this._y;
		},
   
		_height: 0,
		get height(){
			return this._height;
		},
		set height(val){
			this._height = val;
			
			if(!val){
				for(var i=0; i<this.childs.length; i++){
					this.childs[i].height = this.childs[i]._height;
				}
				return;
			}
			
			this.style.lineHeight = this._height+"px";
			this.style.bottom = 0;
			this.style.bottom = (this.el.offsetHeight - val)+"px";
			for(var i=0; i<this.childs.length; i++){
				this.childs[i].height = this.childs[i]._height;
			}
		},
	
		_width: 0,
		get width(){
			return this._width;
		},
		set width(val){
			if(!val){
				return;
			}
			this._width = val;
			this.style.right = 0;
			this.style.right = (this.el.offsetWidth - val)+"px";
			for(var i=0; i<this.childs.length; i++){
				this.childs[i].width = this.childs[i]._width;
			}
		},
   
		ox: 0,
		oy: 0
		
	}
);