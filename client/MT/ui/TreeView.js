MT.require("ui.DomElement");
MT(
	MT.ui.TreeView = function(data){
		this.tree = null;
		
		if(data != void(0)){
			this.create(data);
		}
	},
	{
		create: function(data){
			console.log(data, typeof data);
			
			this.tree = new MT.ui.DomElement();
			this.tree.style.position = "relative";
			this.tree.addClass("ui-treeView");
			
			
			this.createObject("", data, this.tree, 0);
			
		},
		
		createObject: function(title, data, parent, off){
			var el = this.createObjectContainer(title);
			parent.addChild(el);
			
			for(var i in data){
				if(typeof data[i] == "object"){
					this.createObject(i, data[i], el, off);
				}
				else{
					this.createItem(i, data[i], el, off);
				}
				off++;
			}
		},
   
		createItem: function(title, value, parent, off){
			var el = new MT.ui.DomElement();
			parent.addChild(el);
			
			el.show(parent.el);
			el.style.position = "relative";
			el.addClass("ui-treeView-item");
			el.height = 20;
			
			
			var head = new MT.ui.DomElement();
			head.style.position = "relative";
			head.height = 20;
			head.el.innerHTML = title;
			head.addClass("head");
			
			var con = new MT.ui.DomElement();
			con.style.position = "relative";
			con.el.innerHTML = value;
			con.addClass("content");
			
			
			el.addChild(head);
			el.addChild(con);
		},
   
		createObjectContainer: function(title){
			
			
			
			var el = new MT.ui.DomElement();
			el.style.position = "relative";
			el.addClass("ui-treeView-item");
			el.height = 20;
			
			
			
			return el;
		}
   
	}
);