MT.require("ui.DomElement");
MT.extend("core.Emitter")(
	MT.ui.TreeView = function(data, root){
		MT.core.Emitter.call(this);
		
		this.tree = null;
		this.items = [];
		this.rootPath = root;
		
		if(data != void(0)){
			this.create(data);
		}
		
		this._onDrop = [];
		
	},
	{
		
		onDrop: function(cb){
			this._onDrop.push(cb);
		},
		
		create: function(data){
			this.tree = new MT.ui.DomElement();
			this.tree.style.position = "relative";
			this.tree.addClass("ui-treeView");
			
			this.updateFullPath(data);
			
			this.createObject(data, this.tree);
		},

		createObject: function(data, parent){
			var d;
			for(var i =0; i<data.length; i++){
				d = data[i];
				// folder
				if(d.contents !== void(0)){
					var p = this.addItem(d, parent);
					this.createObject(d.contents, p);
					continue;
				}
				
				this.addItem(d, parent);
				
			}
		},
		
		getData: function(parent, data){
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
		
		update: function(data){
			this.tree.el.innerHTML = "";
			
			this.createObject(data, this.tree);
		},
   
		addItem: function(data, parent, isVirtual){
			
			for(var i=0; i<this.items.length; i++){
				if(this.items[i].data.id == data.id){
					console.log("matching id");
					this.items[i].needRemove = false;
					for(var k in data){
						this.items[i].data[k] = data[k];
					}
					
					if(parent.hasClass("close")){
						this.items[i].hide();
					}
					return this.items[i];
				}
			}
			
			var that = this;
			var el = new MT.ui.DomElement();
			var type = "item";
			if(data.contents){
				type = "folder";
			}
			
			el.style.position = "relative";
			el.addClass("ui-treeview-"+type);
			
			el.visible = true;
			
			el.data = data;
			el.fullPath = data.fullPath;
			
			var head = new MT.ui.DomElement();
			head.el.innerHTML = data.name;
			head.style.position = "relative";
			
			//el.addChild(head);
			head.show(el.el);
			
			el.head = head;
			
			head.addClass("ui-treeview-item-head");
			
			if(isVirtual){
				el.show(parent.el);
				return el;
			}
			
			parent.addChild(el);
			
			if(type == "folder"){
				head.addClass("ui-treeview-folder-head");
				el.addClass("open");
				head.el.onclick = function(e){
					
					if(e.offsetX > 30){
						return;
					}
					el.visible = !el.visible;
					console.log(e);
					
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
				el.isFolder = false;
				if(!data.type){
					var im = document.createElement("img");
					if(data.__image){
						im.src = this.rootPath + "/" +data.__image;
					}
					
					
					el.el.appendChild(im);
					el.image = im;
				}
				
				if(data.type == "input"){
					var input = new MT.ui.DomElement("span");
					input.el.innerHTML = "88"
					
					input.x = 50;
					
					head.addChild(input);
					el.head = input;
					
				}
				
				
				
			}
			
			
			
			el.el.ondblclick = function(e){
				console.log("double click", el.data);
				that.enableRename(el,e);
				e.stopPropagation();
				e.preventDefault();
			};
			
			
			el.show(parent.el);
			
			this.items.push(el);
			if(parent.hasClass("close")){
				el.hide();
			}
			el.needRemove = false;
			return el;
		},
   
		onChange: null,
   
		sortable: function(ev){
			
			var al = this.addItem({name: "xxx"}, this.tree, true);
			
			al.style.position = "absolute";
			al.style.pointerEvents = "none";
			al.style.bottom = "auto";
			al.style.opacity = 0.6;
			
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
			
			var scrollTop = 0;
			
			ev.on("mousedown", function(e){
				item = that.getOwnItem(e.target.parentNode);
				if( item ){
					mdown = true;
					scrollTop = that.tree.el.parentNode.scrollTop;
					var y = (item.calcOffsetY(that.tree.el));
					al.el.style.top = y + "px";
					my = y - ui.events.mouse.y;
					
				}
			});
			
			var dragged = false;
			
			ev.on("click", function(e){
				if(that.dragged){
					return;
				}
				
				var item = that.getOwnItem(e.target.parentNode);
				
				if(item){
					that.emit("click", item.data);
				}
			});
			
			ev.on("mouseup", function(e){
				
				al.style.display = "none";
				dd.style.display = "none";
				
				if(!mdown){
					return;
				}
				mdown = false;
				
				
				for(var i=0; i<that._onDrop.length; i++){
					if(that._onDrop[i](e, item, last) === false){
						return;
					}
				}
				
				
				if(!dragged){
					return;
				}
				dragged = false;
				
				
				if(!last || last == item || last.parent == item){
					last = null;
					return;
				}
				
				
				if(item.el.parentNode){
					item.el.parentNode.removeChild(item.el);
				}
				
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
					if(item.parent.hasClass("close")){
						item.hide();
					}
				}
				
				that.updateFullPath(that.getData(), null, true);
				
			});
			
			var last = null;
			var bottom = false;
			var inFolder = false;
			ev.on("mousemove", function(e){
				if(!mdown){
					return;
				}
				
				var dy = my - ui.events.mouse.y ;
				
				var p1 = parseInt(al.style.top) + ev.mouse.my - (scrollTop - that.tree.el.parentNode.scrollTop);
				scrollTop = that.tree.el.parentNode.scrollTop;
				var p2 = 0;
				var activeItem = that.getOwnItem(e.target.parentNode);
				
				al.style.top = p1 + "px";
				
				if(!activeItem || !item  || activeItem == item || activeItem.hasParent(item) ){
					return;
				}
				
				
				al.style.display = "block";
				al.head.el.innerHTML = item.data.name;
				
				p2 = activeItem.calcOffsetY(dd.parentNode);
				if(Math.abs(p1-p2) > al.el.offsetHeight){
					return;
				}
				
				dragged = true;
				bottom = false;
				inFolder = false;
				
				
				dd.style.display = "block";
				dd.style.height = "4px";
				
				if(p2 < p1){
					p2 += al.el.offsetHeight;
					bottom = true;
				}
				
				if(Math.abs(p2-p1) < 16 && activeItem.isFolder){
					dd.style.height = al.el.offsetHeight+"px";
					dd.style.top = activeItem.el.offsetTop+"px";
					inFolder = true;
				}
				else{
					dd.style.top = (p2 - 2) +"px";
				}
				
				last = activeItem;
				
			});
			
		},
		
   
		enableRename: function(el, ev){
			var that = this;
			if(!this.input){
				this.input = document.createElement("input");
				this.input.className = "ui-input";
			}
			
			this.input.style.left = (el.head.calcOffsetX(document.body))+"px";
			this.input.style.top = (el.calcOffsetY(document.body)) + "px";
			
			this.input.value = el.data.name;
			var lastValue = el.data.name;
			
			this.input.type = "text";
			
			el.head.el.innerHTML = "&nbsp;"
			
			document.body.appendChild(this.input);
			
			
			this.input.onclick = function(){
				console.log("click");
			};
			
			var needSave = true;
			this.input.onblur = function(){
				try{
				if(this.parentNode){
					this.parentNode.removeChild(this);
				}}
				catch(e){}
				
				if(needSave && this.value != ""){
					var part = "";
					if(el.parent.data){
						part = el.parent.data.fullPath;
					}
					
					var op = el.data.name;
					
					el.data.fullPath = part+"/"+this.value;
					el.data.name = this.value;
					el.head.el.innerHTML = this.value;
					if(that.onChange){
						that.onChange(part + "/" + op, part+"/"+this.value);
					}
				}
				else{
					el.head.el.innerHTML = lastValue;
				}
			};
			
			this.input.onkeyup = function(e){
				console.log("keyup", e.which);
				if(e.which == 27){
					needSave = false;
					this.blur();
				}
				if(e.which == 13){
					this.blur();
				}
			};
			
			
			
			
			this.input.focus();
			
			var tmp = el.data.name.split(".");
			var len = 0;
			if(tmp.length == 1){
				len = tmp[0].length;
			}
			else{
				len = -1;
			}
			for(var i=0; i<tmp.length-1; i++){
				len += tmp[i].length+1;
			}
			
			
			
			this.input.setSelectionRange(0, len);
			
			
			this.inputEnabled = true;
			
		},
   
		remove: function(){
			this.tree.hide();
		},
		
		merge: function(data, oldData){
			for(var i=0; i<this.items.length; i++){
				this.items[i].needRemove = true;
			}
			
			this.updateFullPath(data);
			
			this.createObject(data, this.tree);
			
			for(var i=0; i<this.items.length; i++){
				if(this.items[i].needRemove){
					this.items[i].parent.removeChild(this.items[i]);
					this.items[i].hide();
					this.items.splice(i,1);
					console.log("cleaned up", this.items[i]);
				}
			}
			
		},
   
		getOwnItem: function(it){
			for(var i=0; i<this.items.length; i++){
				if(it == this.items[i].el){// || it == this.items[i].el.parentNode){
					return this.items[i];
				}
			}
			return null;
		},
		
		updateFullPath: function(data, path, shouldNotify){
			path = path || "";
			for(var i=0; i<data.length; i++){
				var fullPath = path + "/" + data[i].name;
				var op = data[i].fullPath;
				data[i].fullPath = fullPath;
				
				if(op != fullPath){
					if(shouldNotify && this.onChange){
						this.onChange(op, fullPath);
					}
					
				}
				
				if(data[i].contents){
					this.updateFullPath(data[i].contents, data[i].fullPath, shouldNotify);
				}
			}
			
			if(shouldNotify){
				this.onChange(null, null);
			}
			
		}
		
	}
);