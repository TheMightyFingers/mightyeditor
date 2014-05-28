MT.require("ui.Panel");
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.List = function(list, ui, autohide){
		MT.ui.DomElement.call(this);
		this.panel = new MT.ui.Panel("", ui.events);
		this.panel.removeHeader();
		this.panel.content.style.overflow = "initial";
		this.panel.style.position = this.panel.content.style.position = "relative";
		this.panel.show(this.el);
		
		var that = this;
		
		ui.events.on("click", function(e){
			for(var i=0; i<that.children.length; i++){
				if(that.children[i].el == e.target){
					return;
				}
			}
			if(that.isVisible && autohide){
				that.hide();
				that.emit("hide");
			}
		});
		
		this.isVisible = false;
		
		this.update(list);
		
		this.addChild(this.panel);
	},
	{
		update: function(list){
			this.clear();
			this.list = list;
			
			for(var i=0; i<list.length; i++){
				this.addItem(list[i]);
			}
		},
		
		addItem: function(item){
			var b = this.panel.addButton(item.label, item.className, item.cb);
			b.style.position = "relative";
			b.addClass("ui-list-button");
			
			if(item.create){
				item.create(b);
			}
		},
		
		show: function(parent){
			if(this.isVisible){
				return;
			}
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
