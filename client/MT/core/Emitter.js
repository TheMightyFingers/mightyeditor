MT(
	MT.core.Emitter = function(){
		this.callbacks = {};
	},
	{
		on: function(action, cb, priority){
			
			if(action == void(0)){
				console.error("undefined action");
				return;
			}
			
			if(typeof cb != "function"){
				console.error("event",action,"not a function:",cb);
				return;
			}
			if(Array.isArray(action)){
				for(var i=0; i<action.length; i++){
					this.on(action[i], cb);
				}
				return;
			}
			
			if(!this.callbacks){
				this.callbacks = {};
			}
			
			if(!this.callbacks[action]){
				this.callbacks[action] = [];
			}
			
			
			this.callbacks[action].push(cb);
			cb.priority = priority || this.callbacks[action].length;
			this.callbacks[action].sort(function(a, b){
				return a.priority - b.priority;
			});
			
			return cb;
		},
		
		once: function(action, cb){
			if(typeof cb != "function"){
				console.error("event", action, "not a function:", cb);
				return;
			}
			
			if(Array.isArray(action)){
				for(var i=0; i<action.length; i++){
					this.once(action[i], cb);
				}
				return;
			}
			
			var that = this;
			var fn = function(action1, data){
				cb(action1, cb);
				that.off(action, fn);
			};
			
			this.on(action, fn);
			
		},
   
		off: function(type, cb){
			if(cb === void(0)){
				cb = type; type = void(0);
			}
			
			if(type && !this.callbacks[type]){
				return;
			}
			
			if(type){
				this._off(cb, type);
				return;
			}
			
			for(var i in this.callbacks){
				if(cb == void(0)){
					this.callbacks[i].length = 0;
					continue;
				}
				this._off(cb, i);
			}
		},
		
		_off: function(cb, type){
			var i=0, cbs = this.callbacks[type];
			for(i=0; i<cbs.length; i++){
				if(cbs[i] === cb){
					cbs.splice(i, 1);
				}
			}
			return cb;
		},
		
		emit: function(type, action, data){
			if(!this.callbacks){
				return;
			}
			
			if(!this.callbacks[type]){
				return;
			}
			
			var cbs = this.callbacks[type];
			
			
			
			for(var i=0; i<cbs.length; i++){
				cbs[i](action, data);
			}
		},
   
		debug: function(type){
			try{
				throw new Error();
			}catch(e){
				var stack = e.stack.split("\n");
				//remove self and emit
				stack.splice(0, 3);
				console.log("EMIT: ", type);
				console.log(stack.join("\n"));
			}
			
		}
	}
);