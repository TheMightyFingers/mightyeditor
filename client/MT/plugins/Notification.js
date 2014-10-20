MT(
	MT.plugins.Notification = function(){
		var that = this;
		this.Notification = function(){
			this.el = new MT.ui.DomElement();
			this.el.addClass("ui-notification");
			this.el.el.innerHTML = "Testing....";
		};
		this.Notification.prototype.hide = function(){
			that.hide(this);
		};
		this.Notification.prototype.show = function(p){
			this.el.show(p);
		};
		this.notifications = [];
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.parent = this.ui.centerBottomRightBox;
			
		},
   
		installUI: function(){
			
			var that = this;
			var str = "";
			function makeid(){
				var text = "";
				var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
				
				for(var j = 0; j< 5; j++){
					for( var i=0; i < 5; i++ ) {
						text += possible.charAt(Math.floor(Math.random() * possible.length));
					}
				}
				return text;
			}
			//window.setInterval(function(){
				that.show(makeid(),makeid(), 100000);
			//}, 1000);
			
		},
		show: function(label, text, tm){
			var that = this;
			var n = new this.Notification();
			//n.style.width = 1;
			
			n.el.el.onclick = function(){
				n.hide();
			};
			
			n.el.el.innerHTML = '<p class="label">'+label+'</p>'+'<p>'+text+'</p>';
			n.show(this.parent);
			window.setTimeout(function(){
				n.el.style.opacity = 1;
			}, 100);
			//n.style.width = "auto";
			
			var idx = this.notifications.push(n);
			this.align(n, idx-1);
			
			window.setTimeout(function(){
				n.hide();
			}, tm || 4000);
			
			return n;
		},
		hide: function(n){
			var that = this;
			n.el.style.opacity = 0;
			window.setTimeout(function(){
				that.hideNow(n);
			}, 300);
		},
		hideNow: function(n){
			var index = this.notifications.indexOf(n);
			var n = this.notifications.splice(index, 1)[0];
			if(n){
				n.el.hide();
			}
			for(var i = 0; i<this.notifications.length; i++){
				this.align(this.notifications[i], i);
				
			}
		},
		align: function(n, idx){
			var dec = idx;
			if(idx > 3){
				dec = Math.floor(3 + 3/idx);
			}
			n.el.style.bottom = (dec) * 20 + "px";
			n.el.style.width = 320 - (dec) * 10 + "px";
			n.el.style.zIndex = 999 - idx;
		},
	}
);   
