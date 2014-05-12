MT.extend("ui.DomElement")(
	MT.ui.Popup = function(title, content, cb){
		MT.ui.DomElement.call(this);
		this.addClass("ui-popup");
		
		this.head = document.createElement("div");
		this.head.className = "ui-popup-head";
		
		this.content = document.createElement("div");
		this.content.className = "ui-popup-content";
		
		this.el.appendChild(this.head);
		this.el.appendChild(this.content);
		
		this.head.innerHTML = title;
		this.content.innerHTML = content;
		
		this.bg = document.createElement("div");
		this.bg.className = "ui-wrapper";
		this.bg.style.zIndex = 9999;
		this.style.zIndex = 10000;
		
		this.y = window.innerHeight*0.3;
		this.style.bottom = "auto";
		
		document.body.appendChild(this.bg);
		document.body.appendChild(this.el);
		
		
	},
	{





	}
);