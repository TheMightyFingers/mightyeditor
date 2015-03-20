MT.extend("core.Emitter")(
	MT.core.Selector = function(){
		this._selected = [];
	},
	{
		add: function(obj, silent){
			if(obj === void(0)){
				return;
			}
			if(!this.is(obj)){
				this._selected.push(obj);
				if(!silent){
					this.emit("select", obj);
				}
			}
			
			
		},
		
		get count(){
			return this._selected.length;
		},
		
		remove: function(obj){
			var o = null;
			for(var i=0; i<this._selected.length; i++){
				if(this._selected[i] == obj){
					this.emit("unselect", obj);
					this._selected.splice(i, 1);
					return;
				}
			}
		},
		
		is: function(obj){
			for(var i=0; i<this._selected.length; i++){
				if(this._selected[i] == obj){
					return true;
				}
			}
			return false;
		},
		
		get min(){
			return Math.min.apply(Math, this._selected);
		},
		get max(){
			return Math.max.apply(Math, this._selected);
		},
		forEach: function(cb, scope){
			if(!this._selected){
				return;
			}
			var last = false;
			for(var i=0; i<this._selected.length; i++){
				if(i == this._selected.length - 1){
					last = true;
				}
				if(scope){
					cb.call(scope, this._selected[i], last);
				}
				else{
					cb(this._selected[i], last);
				}
			}
		},
		
		sortAsc: function(){
			this._selected.sort();
		},
		
		clear: function(){
			for(var i=0; i<this._selected.length; i++){
				this.emit("unselect", this._selected[i]);
			}
			this._selected.length = 0;
			this.emit("clear");
		},
		
		get: function(index){
			return this._selected[index];
		},
		
		sort: function(cb){
			this._selected.sort(cb);
		}
		
		
		
	}
);