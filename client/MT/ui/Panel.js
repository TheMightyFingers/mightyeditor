MT.require("ui.Button");
MT.extend("ui.DomElement")(
	MT.ui.Panel = function(events){
		MT.ui.DomElement.call(this);
		this.hide();
		this.addClass("ui-panel");
		this.style.backgroundColor = "rgba(0,0,255, 0.5)";
		
		this.header = new MT.ui.DomElement();
		this.header.addClass("ui-header");
		this.header.el.innerHTML = "PANEL";
		
		
		
		
		this.addHeader();
		
		//this.header.style.height = "20px";
		//this.header.height = 20;
		
		
		this.events = events;
		var that = this;
		this.events.on("mousemove", function(e){
			if(e.target == that.header){
				console.log(that);
			}
		});
	},
	{
		addHeader: function(){
			this.header.show(this.el);
		},
		removeHeader: function(){
			this.header.hide();
		}
		
		
	}
);
