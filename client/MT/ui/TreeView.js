"use strict";
/*
 * Needs to be reviewed - too many hacks already
 */
MT.require("ui.DomElement");
MT.extend("core.Emitter")(
	MT.ui.TreeView = function(data, options){
		// first instance will create canvas used for small thumbs
		if(!MT.ui.TreeView.canvas){
			MT.ui.TreeView.canvas = document.createElement("canvas");
			MT.ui.TreeView.canvas.ctx = MT.ui.TreeView.canvas.getContext("2d");
			MT.ui.TreeView.canvas.width = 64;
			MT.ui.TreeView.canvas.height = 64;
		}
		this.canvas = MT.ui.TreeView.canvas;
		
		
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
		// static - all correct
		cache: {},
		
		onDrop: function(cb){
			this._onDrop.push(cb);
		},
		
		create: function(data){
			this.tree = new MT.ui.DomElement();
			this.tree.style.position = "relative";
			this.tree.addClass("ui-treeview");
			
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
		
		update: function(data){
			if(!data){
				this.merge(this.getData());
				return;
			}
			//this.tree.el.innerHTML = "";
			this.merge(data, this.tree);
		},
		
		_nextId: 1,
		mkid: function(){
			return ++this._nextId;
		},
		
		addItem: function(data, parent, index, isVirtual){
			var item = this.checkExistingItem(data, parent, index, isVirtual);
			
			if(item){
				return item;
			}
			
			var that = this;
			var type = (data.contents ? "folder" : "item");
			var el = new MT.ui.DomElement();
			el.options = {};
			el.index = index;
			
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
			
			head.show(el.el);
			
			el.head = head;
			head.parent = el;
			
			
			head.addClass("ui-treeview-item-head");
			
			if(isVirtual){
				el.show(parent.el);
				return el;
			}
			
			parent.addChild(el, el.index);
			if(parent.data){
				if(parent.data.isClosed === false){
					el.show();
				}
			}
			else{
				el.show();
			}
			
			
			if(type == "folder"){
				head.addClass("ui-treeview-folder-head");
				if(data.isClosed || data.isClosed === void(0)){
					el.addClass("close");
					el.visible = false;
				}
				else{
					el.addClass("open");
				}
				
				head.label.el.onclick = function(e){
					if(el.isFolder && e.offsetX > 30){
						return;
					}
					
					e.stopPropagation();
					e.preventDefault();
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
					
				}
				
				if(data.type == "input"){
					var input = new MT.ui.DomElement("span");
					input.el.innerHTML = "88"
					
					input.x = 50;
					
					head.addChild(input);
					el.head = input;
					
				}
			}
			
			var im;
			if(data.__image){
				this.addImage(el, data);
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
			
			
			label.el.ondblclick = function(e){
				if(el.isFolder && e.offsetX < 30){
					return;
				}
				
				that.emit("dblclick", e, el);
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
			el.tvItem = true;
			if(parent.hasClass("close")){
				el.hide();
			}
			return el;
		},
		
		addImage: function(el, data){
			var im;
			el.head.addClass("has-image");
			
			im = document.createElement("img");
			im.style.pointerEvents = "none";
			
			this.loadAndDrawImage(im, this.rootPath + "/" +data.__image, data);
			
			
			el.head.el.appendChild(im);
			el.img = im;
		},
		
		loadAndDrawImage: function(im, src, data){
			var that = this;
			if(data.updated && im.updated == data.updated){
				return;
			}
			
			if(that.cache[src] && im.updated == data.updated){
				if(im.src !== im.origSource){
					im.src = im.origSource = that.cache[src];
				}
				return;
			}
			
			var img = new Image();
			im.updated = data.updated;
			
			img.onload = function(){
				var asr = this.width / this.height;
				that.canvas.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
				if(asr > 1){
					that.canvas.ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, that.canvas.width, that.canvas.width / asr);
				}
				else{
					var w = that.canvas.width * asr;
					that.canvas.ctx.drawImage(this, 0, 0, this.width, this.height, (that.canvas.width - w)*0.5, 0, w, that.canvas.width);
				}
				im.src = that.cache[src] = that.canvas.toDataURL("image/png");
			};
			
			img.src = im.origSource = src;
		},
		
		removeImage: function(el){
			el.head.removeClass("has-image");
			if(!el.img){
				return;
			}
			el.head.el.removeChild(el.img);
			el.img = null;
		},
		
		checkExistingItem: function(data, parent, index, isVirtual){
			var item, p;
			for(var i=0; i<this.items.length; i++){
				if(data.id == void(0)){
					data.id = this.mkid();
				}
				if(this.items[i].data.id == data.id){
					this.items[i].needRemove = false;
					item = this.items[i];
					p = item.parent;
					
					if(p){
						p.removeChild(item);
						p.addChild(item, index).show();
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
							this.loadAndDrawImage(item.img, this.rootPath + "/" + data.__image, data);
						}
						else{
							this.addImage(item, data);
						}
					}
					else{
						this.removeImage(item);
						
					}
					
					item.head.label.el.innerHTML = data.name;
					
					return item;
				}
			}
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
				e.preventDefault();
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
		
		
		enableInput: function(ev){
			var that = this;
			var ditem = null;
			
			ev.on("mousedown", function(e){
				// ????
				if(!e.target.parentNode){
					return;
				}
				ditem = that.getOwnItem(e.target.parentNode.parentNode);
			});
			
			ev.on("mouseup", function(e){
				
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
				// sometimes happens when browser freezes for few ms
				if(!item){
					return;
				}
				if(item.isFolder && e.offsetX < 30){
					return;
				}
				
				if(item && item == ditem){
					if(e.button == 0){
						that.emit("click", item.data, item);
					}
					else if(e.button == 2){
						that.emit("context", e, item);
					}
				}
			});
			
			
		},
		
		sortable: function(ev){
			
			var dragHelper = this.addItem({name: "&nbsp;", skip: true}, this.tree, 0, true);
			
			dragHelper.style.position = "absolute";
			dragHelper.style.pointerEvents = "none";
			dragHelper.style.bottom = "auto";
			dragHelper.style.opacity = 0.8;
			dragHelper.style.border = "solid 2px #000";
			dragHelper.style.zindex = 9999;
			dragHelper.style.backgroundColor = "#f00";
			
			var dd = new MT.ui.DomElement("div");
			dd.style.position = "absolute";
			dd.style.height = "4px";
			//dd.style.border = "solid 1px #000";
			dd.style.pointerEvents = "none";
			dd.style.display = "none";
			dd.style.zIndex = 9999;
			
			
			var p = dragHelper.el.parentNode;
			dragHelper.addClass("active ui-wrap");
			p.appendChild(dragHelper.el);
			dragHelper.style.display = "none";
			
			document.body.appendChild(dd.el);
			
			
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
					last.addChild(item, -1);
					//last.show();//){
					//	item.hide();
					//}
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
			
			this.enableInput(ev);
			var startDragPos = {x: 0, y: 0};
			
			ev.on("mousedown", function(e){
				if(!e.target.parentNode){
					return;
				}
				item = that.getOwnItem(e.target.parentNode.parentNode);
				if( !item ){
					return;
				}
				
				that.emit("dragstart", e, item);
				
				mdown = true;
				scrollTop = that.tree.el.scrollTop;
				
				
				
				var y = (item.calcOffsetY(that.tree.el));
				dragHelper.y = y;
				dragHelper.style.left = "0";
				dragHelper.style.right = "0";
				
				my = y - ev.mouse.y;
				startDragPos.x = ev.mouse.x;
				startDragPos.y = ev.mouse.y;
			});
			
			
			
			ev.on("mouseup", function(e){
				if(e.target.isFolder && e.offsetX > 30){
					return;
				}
				dragHelper.style.display = "none";
				dd.style.display = "none";
				dragHelper.y = 0;
				
				if(!mdown){
					return;
				}
				mdown = false;
				that.emit("dragend", e, item);
				
				if(!dragged){
					return;
				}
				dragged = false;
				
				
				for(var i=0; i<that._onDrop.length; i++){
					if(that._onDrop[i](e, item, last) === false){
						return;
					}
				}
				
				
				
				if(!last || last == item || last.hasParent(item)){
					last = null;
					return;
				}
 				
				dropItem(item, last);
				if(item.hasClass("selected")){
					for(var i=0; i<that.items.length; i++){
						var it = that.items[i];
						if(!it.hasClass("selected")){
							continue;
						}
						if(item == it || last == it){
							continue;
						}
						dropItem(it, last);
					}
				}
				that.updateFullPath(that.getData(), null, true);
				
				
			});
			
			ev.on("mousemove", function(e){
				if(!mdown || !item){
					return;
				}
				
				if(Math.abs(startDragPos.x - ev.mouse.x) < 5 && Math.abs(startDragPos.y - ev.mouse.y) < 5 ){
					return;
				}
				
				dragged = true;
				
				that.emit("dragmove", e, item);
				if(e.isPropagationStopped || !MT.ui.hasParent(e.target, that.tree.el)){
					dragHelper.style.display = "none";
					dd.style.display = "none";
					dragHelper.y = 0;
					dragged = false;
					return;
				}
				
				dragHelper.style.zIndex = 9999
				dragHelper.style.display = "block";
				dragHelper.head.el.innerHTML = "&nbsp;";
				
				var bounds = dragHelper.bounds;
				var top = ev.mouse.y;
				
				dragHelper.y = top  - bounds.height*0.5 - that.tree.bounds.top  + that.tree.el.scrollTop;
				dragHelper.style.height = "auto";
				//dd.style.backgroundColor = "#f00";
				
				dd.style.display = "block";
				dd.style.top = top - bounds.height*0.5 + "px";
				
				dd.style.left = bounds.left + "px";
				dd.style.width = bounds.width + "px";
				dd.style.height = bounds.height + "px";
				
				bounds = dd.bounds;
				
				var currItem, head;
				var maxHeight = 0;
				
				last = null;
				
				for(var it, i=0; i<that.items.length; i++){
					currItem = that.items[i];
					head = currItem.head;
					
					it = currItem.head.bounds;
					
					if(maxHeight < it.top + it.height){
						maxHeight = it.top + it.height;
					}
					
					if(top > it.top && top < it.top + it.height + 5){
						last = currItem;
						if(last == item){
							return;
						}
						dragHelper.y = it.top - that.tree.bounds.top  + that.tree.el.scrollTop;
						
						inFolder = currItem.isFolder;
						bottom = false;
						
						if(!inFolder){
							// move over
							if(top - it.top < it.top + it.height - top){
								inFolder = false;
								
								dragHelper.y = it.top - that.tree.bounds.top  + that.tree.el.scrollTop;
								dragHelper.style.height = dragHelper.height*0.5;
								dragHelper.y -= dragHelper.height*0.5;
								
							}
							
							// move under
							else{
								inFolder = false;
								bottom = true;
								
								dragHelper.y = it.top - that.tree.bounds.top + it.height  + that.tree.el.scrollTop;
								dragHelper.style.height = dragHelper.height *0.5;
								dragHelper.y -= dragHelper.height*0.5;
								
							}
							return;
						}
						
						
						// move over
						if(top - it.top < 10){
							inFolder = false;
							
							dragHelper.y = it.top - that.tree.bounds.top  + that.tree.el.scrollTop;
							dragHelper.style.height = dragHelper.height*0.5;
							dragHelper.y -= dragHelper.height*0.5;
						}
						
						// move under
						if(it.top + it.height - top < 5 && last.data.isClosed === true){
							inFolder = false;
							bottom = true;
							
							dragHelper.y = it.top - that.tree.bounds.top + it.height  + that.tree.el.scrollTop;
							dragHelper.style.height = dragHelper.height *0.5;
							dragHelper.y -= dragHelper.height*0.5;
						}
						return;
					}
				}
				
				
				var firstLevel = that.tree.children;
				
				if(that.items.length){
					// most bottom
					if(top > maxHeight){
						dragHelper.y = maxHeight - that.tree.bounds.top + 5  + that.tree.el.scrollTop;
						dragHelper.style.height = dragHelper.height *0.5;
						bottom = true;
						inFolder = false;
						last = firstLevel[firstLevel.length - 1];
					}
					// most top
					else if(top - that.tree.bounds.top < 20){
						dragHelper.y = - dragHelper.height * 0.25;
						dragHelper.style.height = dragHelper.height *0.5;
						last = firstLevel[0];
					}
				}
			});
		},
		
		disableRename: function(){
			this.renameEnabled = false;
		},
		
		renameEnabled: true,
		enableRename: function(el){
			if(!this.renameEnabled){
				return;
			}
			var that = this;
			this.emit("renameStart");
			
			if(!this.input){
				this.input = document.createElement("input");
				this.input.className = "ui-input";
			}
			
			var left = (el.head.calcOffsetX(document.body));
			if(el.img){
				left += 20;
			}
			this.input.style.left = (left)+"px";
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
					that.rename(el, this.value);
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
				e.preventDefault();
				e.stopPropagation();
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

		rename: function(el, name){
			var that = this;
			var part = "";
			if(el.parent.data){
				part = el.parent.data.fullPath;
			}

			var op = el.data.name;

			el.data.fullPath = part+"/"+name;
			el.data.name = name;
			el.head.label.el.innerHTML = name;

			var o = part + "/" + op;
			var n = part + "/" + this.value;

			if(o !== n){
				that.emit("change", part + "/" + op, part + "/" + name);
				that.emit("rename", el, op);
			}
		},

		remove: function(){
			this.tree.hide();
		},
		
		merge: function(data, oldData){
			this.data = data;
			var scroll = this.tree.el.scrollTop;
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
				this.tree.children.forEach(function(c){c.show();});
			}
			this.tree.el.scrollTop = scroll;
		},
   
		getOwnItem: function(it){
			var item = it;
			while(item){
				if(item.ctrl && item.ctrl.tvItem){
					break;
				}
				item = item.parentElement;
			}
			
			if(!item){
				return null;
			}
			
			for(var i=0; i<this.items.length; i++){
				if(item == this.items[i].el){// || it == this.items[i].el.parentNode){
					return this.items[i];
				}
			}
			
			return null;
		},
		
		updateFullPath: function(data, path, shouldNotify, skipGlobalNotify){
			path = path || "";
			for(var i=0; i<data.length; i++){
				var fullPath = path + "/" + data[i].name;
				var op = data[i].fullPath;
				data[i].fullPath = fullPath;
				
				if(op != fullPath){
					if(shouldNotify){
						this.emit("change", op, fullPath);
					}
				}
				
				if(data[i].contents){
					this.updateFullPath(data[i].contents, data[i].fullPath, shouldNotify, true);
				}
			}
			
			if(shouldNotify && !skipGlobalNotify){
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
			
		},
		
		show: function(par){
			this.tree.show(par);
		}
		
	}
);
