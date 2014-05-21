MT.require("ui.Panel");
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.List = function(list, ui, autohide){
		MT.ui.DomElement.call(this);
		this.panel = new MT.ui.Panel("", ui.events);
		this.panel.removeHeader();
		this.panel.content.style.overflow = "initial";
		
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
			
			var b = null;
			var l = null;
			for(var i=0; i<list.length; i++){
				l = list[i];
				b = this.panel.addButton(l.label, l.className, l.cb);
				b.style.position = "relative";
				b.addClass("ui-list-button");
				
				if(l.create){
					l.create(b);
				}
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
