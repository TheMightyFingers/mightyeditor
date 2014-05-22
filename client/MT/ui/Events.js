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
			resize: []
		};
		
		this._cbs = [];
		
		this.enable();
		
		this.mouse = {
			x: 0,
			y: 0,
			mx: 0,
			my: 0,
			down: false,
			lastEvent: null,
			lastClick: null
		};
	},
	{
		enable: function(){
			var that = this;
			for(var i in this.events){
				
				this.addEvent(i);
			}
		},
		
		disable: function(){
			for(var i in this.events){
				document.body.removeEventListener(this._cbs[i].type, this._cbs[i]);
			}
		},
		on: function(type, cb){
			if(!this.events[type]){
				console.warn("new Event:", type);
				this.events[type] = [];
				this.addEvent(type);
			}
			
			this.events[type].push(cb);
			return cb;
		},
   
		addEvent: function(i){
			var cb = this._mk_cb(i);
			this._cbs.push(cb);
			window.addEventListener(i, cb, false);
			
		},
		
		off: function(cb){
			var ev = null;
			for(var i in this.events){
				ev = this.events[i];
				for(var j=0; j<ev.length; j++){
					if(ev[j] == cb){
						ev[j] = ev[ev.length-1];
						ev.length = ev.length-1;
					}
				}
			}
		},
   
		simulateKey: function(which){
			this.emit("keydown",{
				which: which,
				target: document.body
			});
			
		},
		
		emit: function(type, data){
			if(!this.events[type]){
				console.warn("unknown event", type);
			}
			var ev = this.events[type];
			var e = null;
			
			for(var i=0; i<ev.length; i++){
				e = ev[i];
				e(data);
			}
		},
   
		
		_mk_mousemove: function(){
			
			var that = this;
			var cb = function(e){
				e.x = e.x || e.pageX;
				e.y = e.y || e.pageY;
				
				that.mouse.mx = e.pageX - that.mouse.x;
				that.mouse.my = e.pageY - that.mouse.y;
				that.mouse.x = e.pageX;
				that.mouse.y = e.pageY;
				
				that.mouse.lastEvent = e;
				
				that.emit("mousemove", e);
			};
			cb.type = "mousemove";
			return cb;
			
		},
		_mk_mousedown: function(){
			
			var that = this;
			var cb = function(e){
				e.x = e.x || e.pageX;
				e.y = e.y || e.pageY;
				that.mouse.down = true;
				that.mouse.lastClick = e;
				
				that.emit("mousedown", e);
			};
			cb.type = "mousedown";
			return cb;
		},
		_mk_mouseup: function(){
			
			var that = this;
			var cb = function(e){
				e.x = e.x || e.pageX;
				e.y = e.y || e.pageY;
				that.mouse.down = false;
				that.mouse.lastClick = e;
				
				that.emit("mouseup", e);
			};
			cb.type = "mouseup";
			return cb;
		},
   
   
		_mk_cb: function(type){
			if(type == "mousemove"){
				return this._mk_mousemove();
			}
			
			if(type == "mouseup"){
				return this._mk_mouseup();
			}
			
			if(type == "mousedown"){
				return this._mk_mousedown();
			}
			
			
			var that = this;
			var cb = function(e){
				e = e || event;
				
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
