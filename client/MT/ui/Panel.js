MT.require("ui.Button");
MT.extend("ui.DomElement")(
	MT.ui.Panel = function(title, events){
		MT.ui.DomElement.call(this);
		
		this.addClass("ui-panel");
		//this.style.backgroundColor = "rgba(0,0,0, 0.5)";
		
		this.header = new MT.ui.DomElement();
		this.header.addClass("ui-panel-header");
		this.header.el.innerHTML = "PANEL";
		this.header.height = 25;
		
		
		
		this.title = title;
		
		
		this.content = new MT.ui.DomElement();
		this.addChild(this.content);
		this.content.show(this.el);
		this.content.y = this.header.height;
		
		this.content.style.overflow = "auto";
		this.content.addClass("ui-panel-content");
		
		
		this.addHeader();
		this.hide();
		
		
		this.events = events;
		var that = this;
		this.events.on("mousemove", function(e){
			if(e.target == that.header){
				console.log(that);
			}
		});
		
		this.events.on("resize", function(){
			that.update();
			
		});

	},
	{
		addHeader: function(){
			this.addChild(this.header);
			this.header.show(this.el);
			this.content.y = this.header.height;
		},
		removeHeader: function(){
			this.header.hide();
			this.content.y = 0;
		},
		
		addButton: function(title, className, cb){
			var b = new MT.ui.Button(title, className, this.events, cb);
			
			var off = 0;
			for(var i=0; i<this.content.children.length; i++){
				off += this.content.children[i].width;
			}
			
			b.x += off;
			
			this.content.addChild(b);
			return b;
		},
		
		addButtonV: function(title, className, cb){
			var b = new MT.ui.Button(title, className, this.events, cb);
			
			var off = 0;
			for(var i=0; i<this.content.children.length; i++){
				off += this.content.children[i].el.offsetHeight;
			}
			
			b.y += off;
			
			this.content.addChild(b);
			return b;
		},
		
		set title(val){
			this.header.el.innerHTML = val;
		},
		get title(){
			return this.header.el.innerHTML;
		}
		
		
	}
);
