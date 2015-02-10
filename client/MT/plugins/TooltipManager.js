MT.require("misc.tooltips");

MT(
	MT.plugins.TooltipManager = function(){

	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.el = new MT.ui.DomElement("div");
			this.el.setAbsolute();
			this.el.style.zIndex = 1001;
			this.el.addClass("ui-tooltip");
		},

		installUI: function(){
			var that = this;
			var ev = this.ui.events;
			var lastTarget = null;
			var attr, info, bounds;
			ev.on(ev.MOUSEMOVE, function(e){
				if(e.target === lastTarget){
					return;
				}
				lastTarget = e.target;
				
				attr = e.target.getAttribute("data-tooltip");
				if(!attr){
					that.el.hide();
					return;
				}
				
				info = MT.misc.tooltips[attr];
				
				if(!info){
					info = {
						title: attr
					};
				}
				
				bounds = e.target.getBoundingClientRect();
				
				that.el.show(document.body);
				that.el.el.innerHTML = '<div class="ui-tooltip-label">'+info.title+'</div>';
				if(info.desc){
					that.el.el.innerHTML += '<div class="ui-tooltip-description">'+info.desc;
				}
				that.el.x = bounds.left + bounds.width;
				that.el.y = bounds.top + (bounds.height - that.el.height)*0.5;
				
			});
		}
	}
);