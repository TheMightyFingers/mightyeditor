MT.require("ui.Panel");
MT.extend("ui.DomElement")(
	MT.ui.DDList = function(list, ui){
		MT.ui.DomElement.call(this);
		this.panel = new MT.ui.Panel("", ui.events);
		
		
		var that = this;
		
		ui.events.on("click", function(e){
			for(var i=0; i<that.children.length; i++){
				if(that.children[i].el == e.target){
					return;
				}
			}
			that.hide();
		});
		
		this.isVisible = false;
		
		this.update(list);

		this.addChild(this.panel);
	},
	{
		update: function(list){
			this.clear();
			
			var b = null;
			var l = null;
			for(var i=0; i<list.length; i++){
				l = list[i];
				b = this.panel.addButton(l.label, l.className, l.cb);
				b.style.position = "relative";
				b.addClass("ui-list-button");
			}
		

		}
		
		
		
		
	}
);
