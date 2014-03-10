
Test.extend("Human")(
	Test.Fighter = function(name){
		Test.Human.call(this, name);
	},
	{
		get name(){
			return "fighter "+this._name;
		},
		hit: function(){
			console.log(this.name+" hits");
		}
	}
); 
 
Test.extend("Fighter")(
	Test.HeavyFighter = function(name){
		Test.Human.call(this, name);
	},
	{
		get name(){
			return "heavy fighter "+this._name;
		},
		hit: function(){
			console.log(this.name+" hits");
		}
	}
); 