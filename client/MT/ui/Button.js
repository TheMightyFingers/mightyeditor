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
			//if(events == null){
				this.el.onclick = cb;
			//}
			/*else{
				var that = this;
				events.on("click", function(e){
					if(e.target === that.el){
						cb(e);
					}
				});
			}*/
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
