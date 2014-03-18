MT.extend("ui.DomElement")(
	MT.ui.Input = function(obj){
		MT.ui.DomElement.call(this);
		
		this.input = document.createElement("input");
		this.addClass("ui-input");
		
		this.label = new MT.ui.DomElement();
		this.value = new MT.ui.DomElement();
		
		//this.label.style.
		//this.value.style.position = "relative";
		//this.value
		
		this.value.el.onmousedown = function(){
			console.log("down");
		};
		this.value.el.onmouseup = function(){
			console.log("up");
		};
		this.value.el.onmousemove = function(){
			console.log("move");
		};
		
		
	},
	{
		
		
		
		
		
		
		
	}
);
