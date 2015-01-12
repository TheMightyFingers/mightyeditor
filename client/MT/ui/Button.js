MT.extend("ui.DomElement")(
	MT.ui.Button = function(text, className, events, cb, tooltip){
		MT.ui.DomElement.call(this);
		if(tooltip){
			this.el.setAttribute("data-tooltip", tooltip);
		}
		this.addClass("ui-button");
		
		if(className){
			this.addClass(className);
		}
		
		if(text != void(0)){
			this.text = text;
		}
		
		if(cb){
			this.el.onclick = cb;
		}
		
	},
	{
		set text(val){
			this.el.innerHTML = val;
		},
		get text(){
			return this.el.innerHTML;
		}
		
		
		
	}
);
