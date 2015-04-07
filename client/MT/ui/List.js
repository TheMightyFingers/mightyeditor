MT.require("ui.Panel");
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.List = function(list, ui, autohide){
		MT.ui.DomElement.call(this);
		this._items = [];
		this.ui = ui;
		this.setAbsolute();
		this.addClass("ui-list");
		
		this.panel = new MT.ui.Panel("", ui.events);
		this.panel.removeHeader();
		
		
		this.panel.content.style.overflow = "initial";
		this.panel.style.position = "relative";
		this.panel.show(this.el);
		
		
		this.panel.content.style.position = "relative";
		var that = this;
		
		var hasSubList = function(list, el){
			var sub, l;
			for(var i=0; i<list.list.length; i++){
				l = list.list[i];
				if(l._list){
					sub = hasSubList(l._list, el);
					if(sub){
						return sub;
					}
				}
				if(l.button.el == el){
					return true;
				}
			}
			return false;
		};
		
		ui.events.on("mouseup", function(e){
			for(var i=0; i<that.panel.buttons.length; i++){
				if(that.panel.buttons[i].el == e.target){
					return;
				}
			}
			if(MT.ui.hasParent(e.target, that.el)){
				return;
			}
			if(that.isVisible && autohide){
				if(hasSubList(that, e.target)){
					return;
				}
				
				that.hide();
			}
		}, true);
		
		this.isVisible = false;
		this.list = list;
		this.origList = list;
		this.update();
		
		this.addChild(this.panel).show();
	},
	{
		filter: function(cb){
			this.list = this.origList.filter(cb);
			this.update();
		},
		update: function(){
			//this.clear();
			while(this._items.length){
				this._items.pop().remove();
			}
			for(var i=0; i<this.list.length; i++){
				this.addItem(this.list[i]);
			}
		},
		reset: function(){
			this.list = this.origList;
			this.panel.buttons.length = 0;
			this.panel.children.length = 0;
			this.update();
		},
		addItem: function(item){
			if(item.check && !item.check()){
				return;
			}
			var b;
			if (item.contents) {
				var that = this;
				item._list = new MT.ui.List(item.contents, this.ui, true);
				item._list.__parent = this;
				item.cb = function (e) {
					item._list.show();
					
					var bounds = b.bounds;
					item._list.x = bounds.left + bounds.width;
					item._list.y = bounds.top;
					e.preventDefault();
					e.stopPropagation();
				};
			}

			b = this.panel.addButton(item.label, item.className, item.cb);
			b.el.title = item.title || item.label;
			b.style.position = "relative";
			b.addClass("ui-list-button");
			
			if(item.create){
				item.create(b);
			}

			if(item.contents) {
				b.addClass("has-menu");
			}

			this._items.push(b);
			item.button = b;
		},
		
		removeItem: function(item){
			
		},
		
		show: function(parent){
			this.shown = Date.now();
			this.reset();
			this.isVisible = true;
			MT.ui.DomElement.show.call(this, parent);
			this.emit("show");
			if(this.x + this.width > window.innerWidth){
				this.x -= this.width;
			}
			if(this.y + this.height > window.innerHeight){
				if(this.y - this.height < 0){
					this.el.style["min-height"] = "350px";
				}
				else{
					this.y -= this.height;
				}
			}
			
		},
		
		hide: function(){
			// prevent instant show/hide
			if(Date.now() - this.shown < 100){
				return;
			}
			if(!this.isVisible){
				return;
			}
			this.isVisible = false;
			MT.ui.DomElement.hide.call(this);
			this.emit("hide");
		}
	}
);
