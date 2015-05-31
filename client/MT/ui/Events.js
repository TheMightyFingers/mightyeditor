"use strict";
(function(){
	if(typeof Event === "undefined"){
		return;
	}
	var overriddenStop =  Event.prototype.stopPropagation;
	Event.prototype.stopPropagation = function(){
		this.isPropagationStopped = true;
		overriddenStop.call(this);
	};
})();

MT(
	MT.ui.Events = function(){
		if(window.MT.events){
			console.warn("events already initialized");
			return window.MT.events;
		}
		window.MT.events = this;
		
		this.events = {
			mousemove: [],
			mouseup: [],
			mousedown: [],
			drop: [],
			dragend: [],
			drag: [],
			dragover:[],
			click: [],
			resize: [],
			wheel: []
		};
		
		this._cbs = [];
		
		this.enable();
		
		this.mouse = {
			x: 0,
			y: 0,
			mx: 0,
			my: 0,
			down: false,
			lastEvent: {x:0, y:0},
			lastClick: {x:0, y:0}
		};
	},
	{
		MOUSEMOVE: "mousemove",
		MOUSEUP: "mouseup",
		MOUSEDOWN: "mousedown",
		RESIZE: "resize",
		KEYDOWN: "keydown",
		KEYUP: "keyup",
		DROP: "drop",
		WHEEL: "wheel",
		DBLCLICK: "dblclick",
		
		enable: function(){
			for(var i in this.events){
				this.addEvent(i);
			}
		},
		
		disable: function(){
			for(var i in this.events){
				document.body.removeEventListener(this._cbs[i].type, this._cbs[i]);
			}
		},
		on: function(type, cb, shift){
			if(!this.events[type]){
				console.warn("new Event:", type);
				this.events[type] = [];
				this.addEvent(type);
			}
			var that = this;
			window.setTimeout(function(){
				if(shift){
					that.events[type].unshift(cb);
				}
				else{
					that.events[type].push(cb);
				}
			}, 0);
			return cb;
		},
		once: function(type, cb, shift){
			var that = this;
			var fn;
			fn =  function(e){cb(e);that.off(type, fn);};
			this.on(type, fn, shift);
		},
   
		addEvent: function(i){
			var cb = this._mk_cb(i);
			this._cbs.push(cb);
			window.addEventListener(i, cb, false);
		},
		
		off: function(type, cb){
			var ev = null, j=0;
			
			if(cb !== void(0)){
				ev = this.events[type];
				for(j=0; j<ev.length; j++){
					if(ev[j] == cb){
						ev[j] = ev[ev.length-1];
						ev.length = ev.length-1;
					}
				}
				return;
			}
			
			for(var i in this.events){
				ev = this.events[i];
				for(j=0; j<ev.length; j++){
					if(ev[j] == cb){
						ev[j] = ev[ev.length-1];
						ev.length = ev.length-1;
					}
				}
			}
		},
   
		simulateKey: function(which){
			this.emit(this.KEYDOWN,{
				which: which,
				target: document.body
			});
			
		},
		
		emit: function(type, data){
			if(!this.events[type]){
				console.warn("unknown event", type);
			}
			var ev = this.events[type];
			for(var i=0; i<ev.length; i++){
				if(data instanceof Event){
					if(data.isPropagationStopped){
						break;
					}
				}
				ev[i](data);
			}
		},
   
		
		_mk_mousemove: function(){
			
			var that = this;
			var cb = function(e){
				if(e.x == void(0)){
					Object.defineProperties(e, {
						x: {
							get: function(){
								return e.pageX;
							}
						},
						y: {
							get: function(){
								return e.pageY;
							}
						}
					});
					//e.x = e.pageX;
					//e.y = e.pageY;
				}
				if(e.offsetX === void(0)){
					Object.defineProperties(e, {
						offsetX: {
							get: function(){
								return e.layerX;
							}
						},
						layerY: {
							get: function(){
								return e.layerY;
							}
						}
					});
					//e.offsetX = e.layerX;
					//e.offsetY = e.layerY;
				}
				
				that.mouse.mx = e.pageX - that.mouse.x;
				that.mouse.my = e.pageY - that.mouse.y;
				
				if(that.mouse.mx == 0 && that.mouse.my == 0){
					return;
				}
				
				that.mouse.x = e.pageX;
				that.mouse.y = e.pageY;
				
				that.mouse.lastEvent = e;
				
				that.emit(that.MOUSEMOVE, e);
			};
			cb.type = that.MOUSEMOVE;
			return cb;
			
		},
		_mk_mousedown: function(){
			
			var that = this;
			var cb = function(e){
				if(e.x == void(0)){
					Object.defineProperties(e, {
						x: {
							get: function(){
								return e.pageX;
							}
						},
						y: {
							get: function(){
								return e.pageY;
							}
						}
					});
				}
				that.mouse.down = true;
				that.mouse.lastClick = e;
				
				that.emit(that.MOUSEDOWN, e);
			};
			cb.type = that.MOUSEDOWN;
			return cb;
		},
   
		_mk_mouseup: function(){
			var that = this;
			var cb = function(e){
				if(e.x == void(0)){
					Object.defineProperties(e, {
						x: {
							get: function(){
								return e.pageX;
							}
						},
						y: {
							get: function(){
								return e.pageY;
							}
						}
					});
				}
				that.mouse.down = false;
				that.mouse.lastClick = e;
				
				that.emit(that.MOUSEUP, e);
			};
			cb.type = that.MOUSEUP;
			return cb;
		},
   
		_mk_cb: function(type){
			if(type == this.MOUSEMOVE){
				return this._mk_mousemove();
			}
			
			if(type == this.MOUSEUP){
				return this._mk_mouseup();
			}
			
			if(type == this.MOUSEDOWN){
				return this._mk_mousedown();
			}
			
			var that = this;
			var cb = function(e){
				e = e || event;
				if(e.ctrlKey){
					Object.defineProperties(e, {
						metaKey: {
							get: function(){
								return this.metaKey;
							}
						}
					});
				}
				
				if(type.indexOf("drop") > -1 || type.indexOf("drag") > -1 ){
					e.preventDefault();
				}
				if(e.ctrlKey && e.altKey){
					console.log(e, type);
				}
				that.emit(type, e);
			};
			cb.type = type;
			return cb;
		},
		
		_mk_drop: function(e){
			e.preventDefault();
		}
		
	}
);
