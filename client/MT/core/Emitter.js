MT(
	MT.core.Emitter = function(){
		this.callbacks = {};
	},
	{
		on: function(action, cb){
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
			return cb;
		},
		
		once: function(action, cb){
			if(typeof cb != "function"){
				console.error("event",action,"not a function:",cb);
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
				//console.warn("received unhandled data", type, data);
				return;
			}
			
			var cbs = this.callbacks[type];
			var cb = null;
			for(var i=0; i<cbs.length; i++){
				cb = cbs[i];
				cb(action, data);
			}
		}
	}
);