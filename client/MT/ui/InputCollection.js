MT(
	MT.ui.InputCollection = function(ui, props, object){
		this.object = object || {};
		this.inputs = {};
		for(var i in props){
			if(!props[i].key){
				props[i].key = i;
			}
			this.inputs[i] = new MT.ui.Input(ui, props[i], this.object);
		}
		
	},
	{
		show: function(par){
			for(var i in this.inputs){
				this.inputs[i].show(par);
			}
		},
		hide: function(){
			for(var i in this.inputs){
				this.inputs[i].hide();
			}
		}
	}
);