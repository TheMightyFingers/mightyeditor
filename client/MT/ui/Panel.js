MT.require("ui.Button");
MT.extend("ui.DomElement")(
	MT.ui.Panel = function(title, events){
		MT.ui.DomElement.call(this);
		this.hide();
		this.addClass("ui-panel");
		this.style.backgroundColor = "rgba(0,0,255, 0.5)";
		
		this.header = new MT.ui.DomElement();
		this.header.addClass("ui-header");
		this.header.el.innerHTML = "PANEL";
		this.header.height = 20;
		
		this.addHeader();
		
		this.title = title;
		
		
		this.content = new MT.ui.DomElement();
		this.addChild(this.content);
		this.content.show(this.el);
		this.content.y = this.header.height;
		
		this.content.style.overflow = "auto";
		
		
		
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
			this.addChild(this.header);
			this.header.show(this.el);
		},
		removeHeader: function(){
			this.header.hide();
		},
		set title(val){
			this.header.el.innerHTML = val;
		},
		get title(){
			return this.header.el.innerHTML;
		}
		
		
	}
);
