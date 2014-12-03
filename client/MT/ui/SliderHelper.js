MT(
	MT.ui.SliderHelper = function(value, min, max){
		this.min = min || 0;
		this.max = max || 100;
		this.value = value;
		this._value = 0;
	},
	{
		change: function(delta){
			this._value += delta;
			if(this._value >= this.min && this._value <= this.max){
				this.value = this._value;
			}
			else if(this._value > this.max){
				this.value = this.max;
			}
			else if(this._value < this.min){
				this.value = this.min;
			}
		},
   
		changeTo: function(val){
			this.change(val - this._value);
		},
		
		valueOf: function(){
			return this.value;
		},
		
		reset: function(val){
			
			if(val != void(0)){
				this._value = val;
				this.value = val;
			}
			else{
				this._value = this.value;
			}
		}
	}
);