MT.require("ui.TreeView");
MT.require("ui.List");

MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.AssetsManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "Assets");
		
		this.selector = new MT.core.Selector();
		
		this.project = project;
		
		this.active = null;
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.addPanel("Assets");
			window.am = this;
			var that = this;
			
			this.list = new MT.ui.List([
				{
					label: "new Folder",
					className: "",
					cb: function(){
						that.newFolder();
					}
				},
				{
					label: "delete selected",
					className: "",
					cb: function(){
						that.deleteAssets();
					}
				}
			
			], ui, true);
			
			
			
			this.list.addClass("settings-list");
			
			this.options = new MT.ui.Button(null, "ui-options", ui.events, function(){
				if(!that.list.isVisible){
					that.list.show(that.panel.header.el);
					that.options.addClass("selected");
				}
				else{
					that.list.hide();
					that.options.removeClass("selected");
				}
			});
			
			this.list.on("hide", function(){
				that.options.removeClass("selected");
			});
			
			this.panel.header.addChild(this.options);
			
			this.options.style.left = "auto";
			
			ui.events.on("drop", function(e){
				that.handleFiles(e);
			});
			
			this.tv = new MT.ui.TreeView([], this.project.path);
			this.tv.onChange = function(oldItem, newItem){
				if(oldItem && newItem){
					that.moveFile(oldItem, newItem);
				}
			};
			
			this.tv.sortable(this.ui.events);
			this.tv.tree.show(this.panel.content.el);
			
			
			this.tv.onDrop(function(e, item, last){
				if(e.target == that.project.map.game.canvas){
					that.project.om.addObject(e, item.data);
					return false;
				}
			});
			
			var select = function(data, element){
				
				if(data.contents){
					return;
				}
				
				if(that.active){
					that.active.removeClass("selected");
				}
				
				that.active = element;
				that.active.addClass("selected");
			};
			
			var click = function(data, element){
				
				var shift = false;
				if(that.ui.events.mouse.lastClick && that.ui.events.mouse.lastClick.shiftKey){
					shift = true;
				}
				
				if(shift){
					that.selector.add(element);
					element.addClass("selected");
				}
				else{
					
					if(data.contents){
						return;
					}
					that.selector.forEach(function(el){
						el.removeClass("active.selected");
					});
					that.selector.clear();
				}
				
				
				if(that.active && !shift){
					that.active.removeClass("active.selected");
					that.selector.remove(element);
				}
				
				that.selector.add(element);
				
				that.active = element;
				that.active.addClass("active.selected");
				
				that.project.map.selector.forEach(function(o){
					o.MT_OBJECT.assetId = data.id;
					o.MT_OBJECT.__image = data.__image;
				});
				that.project.plugins.objectsmanager.update();
				that.project.plugins.objectsmanager.sync();
				
			};
			this.tv.on("click", click);
			this.tv.on("select", select);
			
			var prev = new MT.ui.DomElement();
			prev.width = 200;
			prev.height = 200;
			prev.addClass("ui-preview");
			
			var grid = document.createElement("div");
			prev.el.appendChild(grid);
			grid.style.cssText = this.makeGridCss(200,200);
			
			var prevHideTm = 0;
			
			this.tv.on("mouseover", function(e, el){
				var data = el.data;
				if(data.__image){
					window.clearTimeout(prevHideTm);
					
					prev.show(document.body);
					prev.width = data.width;
					prev.height = data.height;
					grid.style.cssText = that.makeGridCss(data.frameWidth, data.frameHeight);
					
					prev.x = el.calcOffsetX() - data.width;
					prev.y = el.calcOffsetY() - (data.height*0.5 - el.el.offsetHeight*0.5);
					prev.style.backgroundImage = "url('"+that.project.path + "/" +data.__image+"')";
					if(prev.y < 0){
						prev.y = 0;
					}
					prev.el.setAttribute("data-size", data.width+"x"+data.height);
					
					prev.target = e.target;
					prev.data = data;
					prev.element = el;
				}
			});
			
			this.tv.on("mouseout", function(e, el){
				if(prevHideTm){
					window.clearTimeout(prevHideTm);
				}
				prevHideTm = window.setTimeout(function(){
					prev.hide();
				}, 300);
				
			});
			var update = function(){
				that.updateData();
			};
			
			this.tv.on("open", update);
			this.tv.on("close", update);
			
			prev.el.onmouseover = function(){
				if(prevHideTm){
					window.clearTimeout(prevHideTm);
				}
			};
			prev.el.onmouseout = function(){
				prev.hide();
			};
			
			prev.el.onclick = function(e){
				click(prev.data, prev.element);
				
				if(that.active.data != prev.data){
					return;
				}
				
				var data = prev.data;
				
				var frame = that.getFrame(prev.data, e.offsetX, e.offsetY);
				
				that.project.map.selector.forEach(function(o){
					o.MT_OBJECT.assetId = data.id;
					o.MT_OBJECT.__image = data.__image;
					o.MT_OBJECT.frame = frame;
					
				});
				
				that.project.plugins.objectsmanager.update();
				that.project.plugins.objectsmanager.sync();
				
				
				
			};
			
			ui.events.on("keydown", function(e){
				var w = e.which;
				if(w == MT.keys.esc){
					that.selector.forEach(function(obj){
						obj.removeClass("active.selected");
					});
					that.selector.clear();
					
					if(!that.active){
						return;
					}
					that.active.removeClass("active.selected");
					that.active = null;
					return;
				}
			});
			
		},
		
		installUI: function(ui){
			
			var that = this;
			
			this.project.plugins.tools.on("selectedObject", function(objId){
				var obj = that.project.plugins.objectsmanager.getById(objId);
				if(obj){
					that.tv.select(obj.assetId);
					
					var asset = that.tv.getById(obj.assetId);
					
					that.selector.add(asset);
				}
				
			});
			
			this.project.plugins.tools.on("unselectedObject", function(objId){
				var obj = that.project.plugins.objectsmanager.getById(objId);
				
				if(obj){
					var asset = that.tv.getById(obj.assetId);
					
					if(that.active){
						that.active.removeClass("selected.active");
						that.active = null;
					}
					
					if(that.selector.is(asset)){
						asset.removeClass("selected.active");
						that.selector.remove(asset);
					}
				}
				
				
			});
			
			var select = function(obj){
				if(obj.contents){
					if(that.active){
						that.active.removeClass("selected");
						that.active = null;
						that.tv.select(null);
					}
					return;
				}
				that.tv.select(obj.assetId, true);
			};
			
			this.project.om.tv.on("click", select);
			this.project.om.tv.on("select", select);
		},
		
		makeGridCss: function(w, h){
			return "background-size: "+w+"px "+h+"px; \
					background-image:repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent "+h+"px),\
					repeating-linear-gradient(-90deg, #fff, #fff 1px, transparent 1px, transparent "+w+"px); width: 100%; height: 100%; position: absolute;";
		},
		
		getFrame: function(o, x, y){
			
			
			var gx = Math.floor(x/(o.frameWidth));
			var gy = Math.floor(y/(o.frameHeight));
			
			var maxX = Math.floor( o.width / o.frameWidth);
			
			var frame = gx + maxX*gy;
			
			console.log("frame", gx, gy, frame);
			
			return frame;
		},
		
		
		update: function(){
			var data = this.tv.getData();
			this.emit("update", data);
		},
		
		a_receiveFileList: function(list){
			this.buildAssetsTree(list);
			this.update();
		},
		
		handleFiles: function(e){
			var that = this;
			var files = e.dataTransfer.files;
			var entry = null;
			for(var i=0; i<files.length; i++){
				//chrome
				if(e.dataTransfer.items){
					entry = (e.dataTransfer.items[i].getAsEntry ? e.dataTransfer.items[i].getAsEntry() : e.dataTransfer.items[i].webkitGetAsEntry());
					this.handleEntry(entry);
				}
				//ff
				else{
					this.handleFile(files.item(i));
				}
			}
		},
		
		handleFile: function(file){
			var path = file.path || file.name;
			//folder
			if(file.size == 0){
				this.send("newFolder", path);
			}
			//file
			else{
				this.uploadImage(file, path);
			}
		},
		
		handleEntry: function(entry){
			var that = this;
			console.log(entry.type);
			
			
			if (entry.isFile) {
				entry.file(function(file){
					that.uploadImage(file, entry.fullPath);
					
				});
			} else if (entry.isDirectory) {
				this.send("newFolder", entry.fullPath);
				
				var reader = entry.createReader();
				reader.readEntries(function(ev){
					for(var i=0; i<ev.length; i++){
						that.handleEntry(ev[i]);
					}
				});
			}
		},
		
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		updateData: function(){
			this.send("updateData", this.tv.getData());
		},
   
		buildAssetsTree: function(list){
			var that = this;
			list.sort(function(a,b){
				var inca = ( a.contents ? 1000 : 0);
				var incb = ( b.contents ? 1000 : 0);
				var res = (a.name > b.name ? 1 : -1);
				return res + incb-inca;
			});
			

			this.tv.rootPath = this.project.path;
			this.tv.merge(list);
		},
		
		moveFile: function(a, b){
			this.send("moveFile", {
				a: a,
				b: b
			});
		},
		
		newFolder: function(){
			var data = this.tv.getData();
			
			var tmpName= "new folder";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			data.unshift({
				name: name,
				contents: []
			});
			
			this.send("newFolder", name);
			
			this.tv.merge(data);
		},
		
		deleteAssets: function(){
			console.log("deleting");
			this.selector.forEach(function(obj){
				this.deleteAsset(obj.data.id);
			}, this);
		},
		
		deleteAsset: function(id, silent){
			console.log("delete", id);
			this.send("delete", id);
			this.emit("deleted", id);
			//if using silent.. you should call manually sync
			if(!silent){
				this.ui.events.simulateKey(MT.keys.esc);
			}
		},
		
		getById: function(id){
			var items = this.tv.items;
			for(var i=0; i<items.length; i++){
				if(items[i].data.id == id){
					return items[i].data;
				}
			}
			
			return null;
		},
		
		uploadImage: function(file, path){
			var fr  = new FileReader();
			var that = this;
			fr.onload = function(){
				var img = new Image();
				img.onload = function(){
					
					var data = {
						data: fr.result,
						name: file.name,
						path: path,
						fullPath: path,
						key: path,
						width: img.width,
						height: img.height,
						frameWidth: img.width,
						frameHeight: img.height,
						frameMax: -1,
						margin: 0,
						spacing: 0,
						anchorX: 0,
						anchorY: 0,
						fps: 10
					};
					
					that.guessFrameWidth(data);
					
					that.send("newImage", data);
					that.emit("added", path);
				};
				img.src = "data:image/png;base64,"+btoa(fr.result);
			};
			
			fr.readAsBinaryString(file);
		},
		
		guessFrameWidth: function(data){
			var basename = data.name.split(".");
			//throw away extension
			basename.pop();
			
			var tmp = basename.join(".").split("_").pop();
			var dimensions = null;
			if(tmp){
				dimensions = tmp.split("x");
				var w = parseInt(dimensions[0], 10);
				var h = parseInt(dimensions[1], 10);
				if(w && !isNaN(w) && h && !isNaN(h)){
					data.frameWidth = w;
					data.frameHeight = h;
				}
			}
			
			
		}
		
	}
);
