MT.extend("core.Emitter")(
	MT.core.Selector = function(){
		this._selected = [];
	},
	{
		add: function(obj, silent){
			if(!obj){
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
					this._selected.splice(i, 1);
					this.emit("unselect", obj);
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
		
		forEach: function(cb, scope){
			if(!this._selected){
				return;
			}
			for(var i=0; i<this._selected.length; i++){
				if(scope){
					cb.call(scope, this._selected[i]);
				}
				else{
					cb(this._selected[i]);
				}
			}
		},
		
		clear: function(){
			for(var i=0; i<this._selected.length; i++){
				this.emit("unselect", this._selected[i]);
			}
			this._selected.length = 0;
			this.emit("clear");
		}
		
		
		
	}
);