MT.extend("core.Emitter").extend("ui.DomElement")(
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
		
		this.show();
		
	},
	{

		showClose: function(){
			if(this.close){
				return;
			}
			this.close = document.createElement("div");
			this.close.className = "ui-popup-close";
			this.head.appendChild(this.close);
			var that = this;
			this.close.onclick = function(){
				that.hide(true);
			};
		},
		
		addButton: function(title, cb){
			
			this.buttons = this.buttons || {};
			var button = this.buttons[title] = document.createElement("div");
			button.className = "ui-popup-button";
			button.innerHTML = title;
			button.onclick = cb;
			
			this.content.appendChild(button);
			
			this.addClass("ui-has-buttons");
		},
		
		hide: function(cancel){
			if(this.bg.parentNode){
				this.bg.parentNode.removeChild(this.bg);
			}
			if(this.el.parentNode){
				this.el.parentNode.removeChild(this.el);
			}
			
			this.emit("close", cancel);
		},
		
		show: function(){
			
			this.emit("show");
			document.body.appendChild(this.bg);
			document.body.appendChild(this.el);
		}



	}
);