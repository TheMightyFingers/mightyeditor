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
		this.bg.onmousedown = this.bg.onmouseup = this.bg.onmousemove = function(e){
			e.preventDefault();
			e.stopPropagation();
			return false;
		};
		
		
		this.style.zIndex = 10000;
		
		this.y = window.innerHeight*0.3;
		this.style.bottom = "auto";
		
		this.addClass("ui-popup-with-head");
		
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
			if(!this.buttonBar){
				this.buttonBar = document.createElement("div");
				this.el.appendChild(this.buttonBar);
				this.buttonBar.className = "ui-button-bar";
			}
			this.buttons = this.buttons || {};
			var button = this.buttons[title] = document.createElement("div");
			button.className = "ui-popup-button";
			button.innerHTML = title;
			button.onclick = function(e){
				cb(e);
				e.stopPropagation();
			};
			
			this.buttonBar.appendChild(button);
			
			this.addClass("ui-has-buttons");
		},
		
		removeHeader: function(){
			if(this.head.parentNode){
				this.head.parentNode.removeChild(this.head);
				this.removeClass("ui-popup-with-head");
			}
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
		},
		
		center: function(){
			this.y = (window.innerHeight - this.height) * 0.5;
		}



	}
);