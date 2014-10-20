"use strict";
MT.require("misc.tooltips");
MT(
	MT.plugins.Notification = function(project){
		this.project = project;
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
			
			var p = this.project.plugins;
			var that = this;
			p.assetmanager.on(MT.ASSETS_UPDATED, function(data){
				that.enabled = true;
				if(data.length <= 1){
					that.showIntro();
				}
			});
		},
   
		installUI: function(){
			
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
			
			if(isFinite(tm)){
				window.setTimeout(function(){
					n.hide();
				}, tm);
			}
			
			
			
			return n;
		},
		showToolTips: function(tool, no, isError){
			var p = this.project.plugins;
			if(!this.enabled){
				
				return;
			}
			
			
			var info = MT.misc.tooltips[tool.tooltip];
			if(!info){
				return;
			}
			
			var tip;
			if(isError){
				tip = info.errors[no];
			}
			else{
				tip = info.tips[no];
			}
			
			this.show(info.title, tip, 3000);
		},
   
		showIntro: function(){
			
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
