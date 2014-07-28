"use strict";
/*
 * Needs to be reviewed - too many hacks already
 */
MT.require("ui.DomElement");
MT.extend("core.Emitter")(
	MT.ui.TreeView = function(data, options){
		MT.core.Emitter.call(this);
		this.options = {};
		
		for(var i in options){
			this.options[i] = options[i];
		}
		
		this.tree = null;
		this.items = [];
		this.rootPath = options.root;
		
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
					var p = this.addItem(d, parent, i);
					this.createObject(d.contents, p);
					continue;
				}
				
				this.addItem(d, parent, i);
				
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
		
		/*getData: function(parent, data){
			
			//return this.data;
			
			parent = parent || this.tree;
			var c = null;
			var data = [];
			for(var i=0; i<parent.el.children.length; i++){
				c = parent.el.children[i];
				if(!c.ctrl || !c.ctrl.data || c.ctrl.data.skip){
					continue;
				}
				if(c.ctrl.data.contents){
					c.ctrl.data.contents = this.getData(c.ctrl);
				}
				data.push(c.ctrl.data);
			}
			return data;
		},*/
		
		update: function(data){
			this.tree.el.innerHTML = "";
			this.createObject(data, this.tree);
		},
		
		_nextId: 1,
		mkid: function(){
			return ++this._nextId;
		},
		
		addItem: function(data, parent, index, isVirtual){
			
			for(var i=0; i<this.items.length; i++){
				if(data.id == void(0)){
					data.id = this.mkid();
				}
				if(this.items[i].data.id == data.id){
					this.items[i].needRemove = false;
					var item = this.items[i];
					var p = item.parent;
					
					if(p){
						p.removeChild(item);
						p.addChild(item, item.index).show();
					}
					
					
					for(var k in data){
						item.data[k] = data[k];
					}
					
					if(parent.hasClass("close")){
						item.hide();
					}
					
					if(item._parent != parent.el){
						if(item.el.parentNode){
							item.el.parentNode.removeChild(item.el);
						}
						item.parent.removeChild(item);
						parent.addChild(item).show();
						
						
						if(!parent.visible){
							item.hide();
						}
					}
					
					if(item.options.showHide){
						if(!data.isVisible){
							item.options.showHide.addClass("hidden");
						}
						else{
							item.options.showHide.removeClass("hidden");
						}
					}
					
					
					
					if(item.options.lock){
						if(!data.isLocked){
							item.options.lock.addClass("locked");
						}
						else{
							item.options.lock.removeClass("locked");
						}
					}
					
					if(data.__image){
						if(item.img){
							item.img.src = this.rootPath + "/" + data.__image + "?"+Date.now();
						}
						else{
							console.log("WHERE IS IMG?");
						}
							
						
						
					}
					
					return item;
				}
			}
			
			var that = this;
			var el = new MT.ui.DomElement();
			el.options = {};
			
			el.index = index;
			
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
			var label = new MT.ui.DomElement();
			
			head.label = label;
			
			head.addChild(label).show();
			
			label.el.innerHTML = data.name;
			head.style.position = "relative";
			label.addClass("ui-treeview-label");
			
			label.style.position = "relative";
			label.style.paddingLeft = "30px";
			label.style.paddingRight = "23px";
			
			//el.addChild(head);
			head.show(el.el);
			
			el.head = head;
			head.parent = el;
			
			
			head.addClass("ui-treeview-item-head");
			
			if(isVirtual){
				el.show(parent.el);
				return el;
			}
			
			parent.addChild(el, el.index);
			if(!parent.data || !parent.data.isClosed){
				el.show();
			}
			
			
			if(type == "folder"){
				head.addClass("ui-treeview-folder-head");
				if(data.isClosed){
					el.addClass("close");
					el.visible = false;
				}
				else{
					el.addClass("open");
				}
				
				head.el.onclick = function(e){
					if(e.target != el.head.el && e.target != el.head.label.el){
						return;
					}
					
					if(el.isFolder && e.offsetX > 30){
						return;
					}
					
					e.stopPropagation();
					
					el.visible = !el.visible;
					if(el.visible){
						el.addClass("open");
						el.removeClass("close");
						for(var i=0; i<el.children.length; i++){
							el.children[i].show();
						}
						el.data.isClosed = false;
						that.emit("open", el);
					}
					else{
						el.data.isClosed = true;
						el.addClass("close");
						el.removeClass("open");
						for(var i=0; i<el.children.length; i++){
							el.children[i].hide();
						}
						that.emit("close", el);
					}
				};
				el.show();
				el.isFolder = true;
			}
			
			
			
			if(type == "item"){
				el.isFolder = false;
				if(!data.type){
					var im = document.createElement("img");
					if(data.__image){
						im.src = this.rootPath + "/" +data.__image;
					}
					
					
					head.el.appendChild(im);
					im.style.pointerEvents = "none";
					el.img = im;
				}
				
				if(data.type == "input"){
					var input = new MT.ui.DomElement("span");
					input.el.innerHTML = "88"
					
					input.x = 50;
					
					head.addChild(input);
					el.head = input;
					
				}
				
			}
			
			
			if(this.options.showHide){
				el.addClass("show-hide-enabled");
				var b = this._mkShowHide(el);
				if(!data.isVisible){
					b.addClass("hidden");
				}
				el.options.showHide = b;
			}
			
			if(this.options.lock){
				el.addClass("lock-enabled");
				var b = this._mkLock(el);
				if(!data.isLocked){
					b.addClass("locked");
				}
				el.options.lock = b;
			}
			
			
			head.el.ondblclick = function(e){
				if(el.isFolder && e.offsetX < 30){
					return;
				}
				that.enableRename(el, e);
				e.stopPropagation();
				e.preventDefault();
			};
			
			el.el.onmouseover = function(e){
				that.emit("mouseover", e, el);
			};
			el.el.onmouseout = function(e){
				that.emit("mouseout", e, el);
			};
			this.items.push(el);
			el.needRemove = false;
			return el;
		},
   
		addShowHide: function(){
			for(var i=0; i<this.items.length; i++){
				this._mkShowHide(this.items[i]);
				
			}
		},
		
		_mkShowHide: function(item){
			var that = this;
			var b = new MT.ui.Button("", "show-hide", null,  function(e){
				item.data.isVisible = !item.data.isVisible;
				
				if(item.data.isVisible){
					e.target.ctrl.removeClass("hidden")
				}
				else{
					e.target.ctrl.addClass("hidden")
				}
				
				
				that.emit("show", item);
				
				e.stopPropagation();
				
			});
			item.head.el.appendChild(b.el);
			b.parent = item;
			return b;
		},
		
		addLock: function(){
			for(var i=0; i<this.items.length; i++){
				this._mkLock(this.items[i]);
				
			}
		},
		_mkLock: function(item){
			var that = this;
			var b = new MT.ui.Button("", "lock", null, function(e){
				item.data.isLocked = !item.data.isLocked;
				
				if(item.data.isLocked){
					e.target.ctrl.removeClass("locked")
				}
				else{
					e.target.ctrl.addClass("locked")
				}
				
				
				that.emit("lock", item);
				e.stopPropagation();
			});
			item.head.el.appendChild(b.el);
			b.parent = item;
			return b;
		},
		
		
		
		
		sortable: function(ev){
			
			var dragHelper = this.addItem({name: "xxx", skip: true}, this.tree, 0, true);
			
			dragHelper.style.position = "absolute";
			dragHelper.style.pointerEvents = "none";
			dragHelper.style.bottom = "auto";
			dragHelper.style.opacity = 0.6;
			
			var dd = document.createElement("div");
			dd.style.position = "absolute";
			dd.style.height = "4px";
			dd.style.border = "solid 1px #000";
			dd.style.left = 0;
			dd.style.right = 0;
			dd.style.pointerEvents = "none";
			dd.style.display = "none";
			
			
			var p = dragHelper.el.parentNode;
			dragHelper.addClass("active ui-wrap");
			p.appendChild(dragHelper.el);
			dragHelper.style.display = "none";
			
			p.appendChild(dd);
			
			
			var pe = null;
			var that = this;
			var mdown = false;
			
			var mx = 0;
			var my = 0;
			
			var item = null;
			
			var scrollTop = 0;
			
			var dragged = false;
			var last = null;
			var bottom = false;
			var inFolder = false;
			
			var dropItem = function(item, last){
				
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
						last.parent.addChild(item, last.index );
					}
					else{
						last.parent.addChild(item, last.index - 1);
					}
					if(item.parent.hasClass("close")){
						item.hide();
					}
				}
				
			};
			
			ev.on("click", function(e){
				
				if(!e.target.ctrl){
					return;
				}
				
				if(!e.target.ctrl.hasParent(that.tree)){
					return;
				}
				
				if(that.dragged){
					return;
				}
				var item = that.getOwnItem(e.target.parentNode.parentNode);
				if(item){
					that.emit("click", item.data, item);
				}
			});
			
			ev.on("mousedown", function(e){
				if(!e.target.parentNode){
					return;
				}
				item = that.getOwnItem(e.target.parentNode.parentNode);
				if( !item ){
					return;
				}
				mdown = true;
				scrollTop = that.tree.el.parentNode.scrollTop;
				
				var y = (item.calcOffsetY(that.tree.el));
				dragHelper.y = y;
				my = y - ev.mouse.y;
			});
			
			ev.on("mouseup", function(e){
				
				dragHelper.style.display = "none";
				dd.style.display = "none";
				dragHelper.y = 0;
				
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
// 				
				dropItem(item, last);
				if(item.hasClass("selected")){
					for(var i=0; i<that.items.length; i++){
						var it = that.items[i];
						if(!it.hasClass("selected")){
							continue;
						}
						if(item == it || last == it || last.parent == it){
							continue;
						}
						dropItem(it, last);
					}
				}
				that.updateFullPath(that.getData(), null, true);
				
			});
			
			ev.on("mousemove", function(e){
				if(!mdown){
					return;
				}
				
				var dy = my - ev.mouse.y;
				var p1 = dragHelper.y + ev.mouse.my - (scrollTop - that.tree.el.parentNode.scrollTop);
				
				scrollTop = that.tree.el.parentNode.scrollTop;
				var p2 = 0;
				var activeItem = that.getOwnItem(e.target.parentNode.parentNode);
				
				dragHelper.y = p1;
				
				if(!activeItem || !item  || activeItem == item || activeItem.hasParent(item) ){
					return;
				}
				
				
				dragHelper.style.display = "block";
				dragHelper.head.el.innerHTML = item.data.name;
				
				p2 = activeItem.calcOffsetY(dd.parentNode);
				if(Math.abs(p1-p2) > dragHelper.el.offsetHeight){
					return;
				}
				
				dragged = true;
				bottom = false;
				inFolder = false;
				
				
				dd.style.display = "block";
				dd.style.height = "4px";
				
				if(p2 < p1){
					p2 += dragHelper.el.offsetHeight;
					bottom = true;
				}
				
				if(Math.abs(p2-p1) < 16 && activeItem.isFolder){
					dd.style.height = dragHelper.el.offsetHeight+"px";
					dd.style.top = activeItem.el.offsetTop+"px";
					inFolder = true;
				}
				else{
					dd.style.top = (p2 - 2)+"px";
				}
				
				last = activeItem;
				
			});
			
		},
		
		
		
		enableRename: function(el){
			var that = this;
			if(!this.input){
				this.input = document.createElement("input");
				this.input.className = "ui-input";
			}
			
			this.input.style.left = (el.head.calcOffsetX(document.body))+"px";
			this.input.style.top = (el.calcOffsetY(document.body) - 2) + "px"; // check padding here instead of 2 :)
			
			this.input.value = el.data.name;
			var lastValue = el.data.name;
			
			this.input.type = "text";
			
			el.head.label.el.innerHTML = "&nbsp;"
			document.body.appendChild(this.input);
			
			var needSave = true;
			this.input.onblur = function(){
				try{
					if(this.parentNode){
						this.parentNode.removeChild(this);
					}
				}
				catch(e){}
				
				if(needSave && this.value != ""){
					var part = "";
					if(el.parent.data){
						part = el.parent.data.fullPath;
					}
					
					var op = el.data.name;
					
					el.data.fullPath = part+"/"+this.value;
					el.data.name = this.value;
					el.head.label.el.innerHTML = this.value;
					
					that.emit("change", part + "/" + op, part + "/" + this.value);
				}
				else{
					el.head.label.el.innerHTML = lastValue;
				}
			};
			
			this.input.onkeyup = function(e){
				if(e.which == MT.keys.ESC){
					needSave = false;
					this.blur();
				}
				if(e.which == MT.keys.ENTER){
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
			this.data = data;
			this.tree.hide();
			
			var p = this.tree.el.parentNode;
			this.updateFullPath(data);
			
			for(var i=0; i<this.items.length; i++){
				this.items[i].needRemove = true;
			}
			
			this.createObject(data, this.tree);
			
			for(var i=0; i<this.items.length; i++){
				if(this.items[i].needRemove){
					this.items[i].parent.removeChild(this.items[i]);
					this.items[i].hide();
					this.items.splice(i,1);
					i--;
					this.emit("deleted", this.items[i]);
				}
			}
			
			if(data.length !== 0){
				this.tree.show();
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
				this.emit("change", null, null);
			}
			
		},
		
		select: function(id, silent){
			for(var i=0; i<this.items.length; i++){
				if(id == this.items[i].data.id){
					if(silent){
						return this.items[i];
					}
					this.emit("select", this.items[i].data,  this.items[i]);
					return;
				}
			}
			
		},
		
		getById: function(id){
			for(var i=0; i<this.items.length; i++){
				if(id == this.items[i].data.id){
					return this.items[i];
				}
			}
			
		}
		
	}
);