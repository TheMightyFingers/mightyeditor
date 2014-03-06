MT(
	MT.ui.Button = function(className, text, cb, events){
		this.el = document.createElement("div");
		this.el.className = "button "+className;
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
