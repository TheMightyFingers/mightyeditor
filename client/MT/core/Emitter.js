MT(
	MT.core.Emitter = function(){
		this.callbacks = {};
	},
	{
		on: function(action, cb){
			if(!this.callbacks[action]){
				this.callbacks[action] = [];
			}
			this.callbacks[action].push(cb);
			return cb;
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
			var i=0, cbs = null;
			for(i=0, cbs = this.callbacks[type]; i<cbs.length; i++){
				if(cbs[i] === cb){
					cbs.splice(i, 1);
				}
			}
			return cb;
		},
		
		emit: function(type, action, data){
			if(!this.callbacks[type]){
				console.warn("received unhandled data", type, data);
				return;
			}
			var cbs = this.callbacks[type];
			for(var i=0; i<cbs.length; i++){
				cbs[i](action, data);
			}
		}



	}
);