MT.require("ui.Panel");
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.List = function(list, ui, autohide){
		MT.ui.DomElement.call(this);
		this._items = [];
		
		this.setAbsolute();
		this.addClass("ui-list");
		
		this.panel = new MT.ui.Panel("", ui.events);
		this.panel.removeHeader();
		
		
		this.panel.content.style.overflow = "initial";
		this.panel.style.position = "relative";
		this.panel.show(this.el);
		
		
		this.panel.content.style.position = "relative";
		var that = this;
		
		ui.events.on("mouseup", function(e){
			for(var i=0; i<that.panel.buttons.length; i++){
				if(that.panel.buttons[i].el == e.target){
					return;
				}
			}
			if(that.isVisible && autohide){
				that.hide();
			}
		});
		
		this.isVisible = false;
		this.list = list;
		this.update();
		
		this.addChild(this.panel).show();
	},
	{
		update: function(){
			//this.clear();
			while(this._items.length){
				this._items.pop().remove();
			}
			for(var i=0; i<this.list.length; i++){
				this.addItem(this.list[i]);
			}
		},
		
		addItem: function(item){
			if(item.check && !item.check()){
				return;
			}
			
			var b = this.panel.addButton(item.label, item.className, item.cb);
			b.style.position = "relative";
			b.addClass("ui-list-button");
			
			if(item.create){
				item.create(b);
			}
			this._items.push(b);
		},
		
		show: function(parent){
			if(this.isVisible){
				return;
			}
			this.update();
			this.isVisible = true;
			MT.ui.DomElement.show.call(this, parent);
			this.emit("show");
		},
		
		hide: function(){
			if(!this.isVisible){
				return;
			}
			this.isVisible = false;
			MT.ui.DomElement.hide.call(this);
			this.emit("hide");
		}
	}
);
