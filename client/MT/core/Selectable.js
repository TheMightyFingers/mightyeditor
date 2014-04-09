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
			for(var i=0; i<this._selected.length; i++){
				if(this._selected[i] == obj){
					
				}
			}
		},
		unselect: function(obj){
			
		}
		
		
		
	}
);