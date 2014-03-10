MT.require("ui.DomElement");
MT(
	MT.ui.TreeView = function(data){
		this.tree = null;
		this.items = [];
		
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
			this.createObject(data, this.tree);
			
		},
		
		createObject: function(data, parent){
			var d;
			for(var i =0; i<data.length; i++){
				d = data[i];
				// folder
				if(d.contents !== void(0)){
					var p = this.addItem(d, "folder", parent);
					this.createObject(d.contents, p);
					continue;
				}
				
				this.addItem(d, "item", parent);
				
			}
		},
		
		getData: function(parent){
			parent = parent || this.tree;
			var c = null;
			var data = [];
			for(var i=0; i<parent.children.length; i++){
				c = parent.children[i];
				if(c.data.contents){
					c.data.contents = this.getData(c);
				}
				data.push(c.data);
			}
			return data;
		},
   
		addItem: function(data, type, parent, isVirtual){
			var el = new MT.ui.DomElement();
			el.style.position = "relative";
			el.addClass("ui-treeview-"+type);
			
			el.visible = true;
			
			el.data = data;
			
			var head = new MT.ui.DomElement();
			head.el.innerHTML = data.name;
			head.style.position = "relative";
			
			//el.addChild(head);
			head.show(el.el);
			
			if(isVirtual){
				el.show(parent.el);
				return el;
			}
			
			parent.addChild(el);
			
			if(type == "folder"){
				head.addClass("ui-treeview-folder-head");
				el.addClass("open");
				head.el.onclick = function(){
					el.visible = !el.visible;
					
					if(el.visible){
						el.addClass("open");
						el.removeClass("close");
						for(var i=0; i<el.children.length; i++){
							el.children[i].show();
						}
					}
					else{
						
						el.addClass("close");
						el.removeClass("open");
						for(var i=0; i<el.children.length; i++){
							el.children[i].hide();
						}
					}
					
				};
				
				el.isFolder = true;
			}
			
			if(type == "item"){
				var im = document.createElement("img");
				im.src = data.path;
				el.el.appendChild(im);
				el.image = im;
				el.isFolder = false;
			}
			
			
			el.show(parent.el);
			
			this.items.push(el);
			
			return el;
		},
   
   
		sortable: function(ev){
			var al = this.addItem({name: "xxx"}, "item", this.tree, true);
			
			al.style.position = "absolute";
			al.style.pointerEvents = "none";
			al.style.bottom = "auto";
			al.style.opacity = 0.1;
			
			var dd = document.createElement("div");
			dd.style.position = "absolute";
			dd.style.height = "4px";
			dd.style.border = "solid 1px #000";
			dd.style.left = 0;
			dd.style.right = 0;
			dd.style.pointerEvents = "none";
			dd.style.display = "none";
			
			
			var p = al.el.parentNode;
			al.addClass("active");
			p.appendChild(al.el);
			al.style.display = "none";
			
			p.appendChild(dd);
			
			
			var pe = null;
			var that = this;
			var mdown = false;
			
			var mx = 0;
			var my = 0;
			
			var item = null;
			
			ev.on("mousedown", function(e){
				item = that.getOwnItem(e.target.parentNode);
				if( item ){
					mdown = true;
					
					var y = (item.calcOffsetY(that.tree.el));
					al.el.style.top = y + "px";
					my = y - ui.events.mouse.y;
					
				}
			});
			
			var dragged = false;
			
			ev.on("mouseup", function(e){
				mdown = false;
				
				
				al.style.display = "none";
				dd.style.display = "none";
				
				if(!dragged || !last || last == item || last.parent == item){
					last = null;
					return;
				}
				dragged = false;
				
				item.el.parentNode.removeChild(item.el);
				
				
				item.parent.removeChild(item);
				if(inFolder){
					last.addChild(item);
					if(!last.visible){
						item.hide();
					}
				}
				else{
					if(bottom){
						last.parent.addChild(item, last.index + 1);
					}
					else{
						last.parent.addChild(item, last.index);
					}
				}
				
			});
			
			var last = null;
			var bottom = false;
			var inFolder = false;
			ev.on("mousemove", function(e){
				if(!mdown){
					return;
				}
				
				
				var dy = my - ui.events.mouse.y;
				
				var p1 = parseInt(al.style.top) + ev.mouse.my;
				var p2 = 0;
				var activeItem = that.getOwnItem(e.target.parentNode);
				
				al.style.top = p1 + "px";
				
				if(!activeItem || !item  || activeItem == item || activeItem.parent == item){
					return;
				}
				
				dragged = true;
				bottom = false;
				inFolder = false;
				
				al.style.display = "block";
				dd.style.display = "block";
				dd.style.height = "4px";
				
				p2 = activeItem.calcOffsetY(dd.parentNode);
				
				if(p2 < p1){
					p2 += al.el.offsetHeight;
					bottom = true;
				}
				
				if(Math.abs(p2-p1) < 4 && activeItem.isFolder){
					dd.style.height = al.el.offsetHeight+"px";
					inFolder = true;
				}
				
				
				dd.style.top = (p2 - 2) +"px";
				last = activeItem;
				
				
				
				
			});
			
		},
		
		getOwnItem: function(it){
			for(var i=0; i<this.items.length; i++){
				if(it == this.items[i].el){// || it == this.items[i].el.parentNode){
					return this.items[i];
				}
			}
			return null;
		}
		
	}
);