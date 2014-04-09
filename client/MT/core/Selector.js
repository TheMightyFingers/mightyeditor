MT.extends("emitter")(
	MT.selectable = function(){
		
		
	},
	{
		select: function(obj){
			if(!this._selected){
				this._selected = [];
				this._selected.push(obj);
				return;
			}
			if(!this.isSelected(obj)){
				this._selected.push(obj);
			}
			
		},
		
		unselect: function(obj){
			for(var i=0; i<this._selected.length; i++){
				if(this._selected[i] == obj){
					this._selected[i] = this.selected.pop();
					return;
				}
			}
		},
		
		isSelected: function(obj){
			for(var i=0; i<this._selected.length; i++){
				if(this._selected[i] == obj){
					return true;
				}
			}
			return false;
		}
		
		
		
	}
);