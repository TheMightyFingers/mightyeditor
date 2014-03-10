"use strict";
Test(
	Test.Human = function(name){
		this._name = name;
		console.log(this.name + " has born!");
		
		Object.defineProperty(this, "_secret", { 
			value : name,
			writable : false
		});
		
	},
	{
		_name: "",
		
		_secret: "",
		
		getSecret: function(){
			return this._secret;
		},
		walk: function(){
			console.log(this.name+" is walking: ");
		},
		get name(){
			console.log("GET NAME");
			return this._name;
		},
	
		set name(v){
			console.log(" \""+ this._name + "\" changed name to \"" + v + "\"");
			this._name = v;
		}
	}
);