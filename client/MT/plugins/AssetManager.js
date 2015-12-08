"use strict";
/* TODO: split this file in submodules
 * more time spending to scroll than coding
 */
MT.require("ui.TreeView");
MT.require("ui.List");


MT.ASSET_ADDED = "ASSET_ADDED";
MT.ASSET_SELECTED = "ASSET_SELECTED";
MT.ASSET_UNSELECTED = "ASSET_UNSELECTED";
MT.ASSET_UPDATED = "ASSET_UPDATED";
MT.ASSET_DELETED = "ASSET_DELETED";
MT.ASSET_FRAME_CHANGED= "ASSET_FRAME_CHANGED";
MT.ASSETS_RECEIVED = "ASSETS_RECEIVED";
MT.ASSETS_UPDATED = "ASSETS_UPDATED";


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.AssetManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "assets");
		
		this.selector = new MT.core.Selector();
		
		this.project = project;
		
		this.active = null;
		this.knownFrames = {};
		
		this.list = {};
		
		this.__previewCache = {};
		
		this.panels = {};
		
		this.scale = 0;
		
		//hack
		this.pendingFrame = -1;
		
		this.tmpName = "";
	},
	{
		
		get activeFrame(){
			if(!this.active){
				return 0;
			}
			var id = this.active.data.id;
			if(this.knownFrames[id] != void(0)){
				return this.knownFrames[id];
			}
			return 0;
		},
		
		set activeFrame(frame){
			if(!this.active){
				return;
			}
			
			var id = this.active.data.id;
			this.knownFrames[id] = frame;
		},
		
		initUI: function(ui){
			var that = this;
			
			this.ui = ui;
			
			this.panel = ui.createPanel("Assets");
			this.panel.setFree();
			this.panel.content.style.padding = 0;
			
			this.panel.addButtons([
				{
					label: "New Folder",
					className: "new-folder",
					cb: function(){
						that.newFolder();
					}
				},
				{
					label: "Upload File",
					className: "upload-file",
					cb: function(){
						that.upload();
					}
				},
				{
					label: "Upload Folder",
					className: "upload-folder",
					cb: function(){
						that.uploadFolder();
					},
					check: function(){
						if(window.navigator.userAgent.indexOf("WebKit") > -1){
							return true;
						}
					}
				},
				{
					label: "Delete Selected",
					className: "delete-selected",
					cb: function(){
						that.confirmDeleteSelected();
					}
				}
			]);
			
			this.panel.content.el.setAttribute("hint", "Drop assets here to upload");
			
			
			this.tv = new MT.ui.TreeView([], this.project.path);
			
			this.tv.sortable(this.ui.events);
			
			this.tv.tree.show(this.panel.content.el);
			
			
			var select = function(data, element){
				if(that.active == element){
					return;
				}
				
				if(that.active){
					that.active.removeClass("selected");
				}
				
				that.active = element;
				
				// hack - debug this
				if(that.pendingFrame > -1){
					that.activeFrame = that.pendingFrame
					that.pendingFrame = -1;
				}
				
				that.active.addClass("selected");
				//that.emit(MT.ASSET_SELECTED, that.active.data);
				//that.emit(MT.ASSET_FRAME_CHANGED, that.active.data, that.activeFrame);
				
				
				if(data.contents){
					return;
				}
				//that.emit(MT.ASSET_SELECTED, that.active.data, that.activeFrame);
				that.setPreviewAssets(that.active.data);
			};
			
			var update = function(){
				that.updateData();
			};
			
			this.tv.on("click", function(data, element){
				
				var shift = false;
				if(that.ui.events.mouse.lastClick && that.ui.events.mouse.lastClick.shiftKey){
					shift = true;
				}
				
				if(shift){
					if(that.selector.is(element)){
						that.selector.remove(element);
						element.removeClass("selected.active");
					}
					else{
						that.selector.add(element);
						element.addClass("selected");
					}
					//that.emit(MT.ASSET_FRAME_CHANGED, null, null);
					return;
				}
				else{
					
					//if(data.contents){
					//	return;
					//}
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
				
				//that.emit(MT.ASSET_FRAME_CHANGED, that.active.data, that.activeFrame);
				that.emit(MT.ASSET_SELECTED, that.active.data, that.activeFrame);
				that.setPreviewAssets(data);
			});
			
			this.tv.on("select", select);
			
			
			
			var list = new MT.ui.List([
				{
					label: "Make active",
					cb: function(){
						that.emit(MT.ASSET_FRAME_CHANGED, that.active.data, that.activeFrame);
					}
					
				},
				{
					label: "Download image",
					cb: function(){
						window.open(that.active.img.origSource);
					}
					
				},
				{
					label: "Delete",
					cb: function(){
						that.confirmDeleteAsset(that.active.data.id);
						list.hide();
					}
					
				}
			], this.ui, true);
			list.width = 250;
			
			
			this.tv.on("context", function(e, item){
				select(item.data, item);
				list.x = e.pageX;
				list.y = e.pageY;
				list.show();
			});
			
			
			this.tv.on("change", function(oldItem, newItem){
				if(oldItem && newItem){
					that.moveFile(oldItem, newItem);
				}
			});
			
			this.tv.on("open", update);
			this.tv.on("close", update);
			
			
			
			
			
			this.preview = ui.createPanel("assetPreview");
			this.preview.setFree();
			
			
			this.scale = 1;
			
			//this.preview.addOptions(this.mkScaleOptions());
			var pce = window.pce = this.preview.content;
			
			ui.events.on(ui.events.WHEEL, function(e){
				if(!pce.isParentTo(e.target)){
					return;
				}
				if(!e.shiftKey){
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				
				that.scale += 0.1*(e.wheelDelta/Math.abs(e.wheelDelta));
				if(that.scale > 2){
					that.scale = 0;
				}
				if(that.scale < 0.1){
					that.scale = 0.1;
				}
				that.setPreviewAssets();
			});
			
			this.project.on(MT.DROP, function(e, data){
				if(!MT.core.Helper.isImage(data.path)){
					return;
				}
				
				if(!e){
					that.createImage(data);
					return;
				}
				
				var item = that.tv.getOwnItem(e.target);
				if(item && item.data.contents){
					data.path = item.data.fullPath + data.path;
				}
				
				that.createImage(data);
			});
			
			ui.events.on(ui.events.KEYDOWN, function(e){
				var w = e.which;
				
				if(w == MT.keys.ESC){
					that.unselectAll();
				}
			});
		},
		
		
		mkScaleOptions: function(){
			var ret = [];
			var o;
			for(var i=100; i>0; i-=10){
				o = {
					label: i,
					className: "",
					cb: this._mkZoomCB(i)
				};
				ret.push(o);
			}
			return ret;
		},
		
		_mkZoomCB: function(zoom){
			var that = this;
			return function(){
				that.scale = zoom*0.01;
				that.preview.options.list.hide();
				that.setPreviewAssets();
			};
		},
		
		unselectAll: function(){
			var that = this;
			this.selector.forEach(function(obj){
				obj.removeClass("active.selected");
				that.emit(MT.ASSET_UNSELECTED, obj);
			});
			this.selector.clear();
			this.preview.content.clear();
			
			if(!this.active){
				return;
			}
			
			this.active.removeClass("active.selected");
			that.emit(MT.ASSET_UNSELECTED, this.active);
			this.active = null;
			return;
		},
		
		_previewCache: null,
		setPreviewAssets: function(asset){
			if(asset.contents){
				this.preview.content.clear();
				return;
			}
			
			// tiletool uses his own preview
			var tools = this.project.plugins.tools;
			if( tools && tools.activeTool && tools.activeTool == tools.tools.tiletool){
				tools.tools.tiletool.updatePreview(asset);
				return;
			}
				
			if(asset == void(0)){
				if(this.active){
					asset = this.active.data;
				}
			}
			if(asset == void(0) || asset.contents){
				return;
			}
			//this.preview.content.clear();
			
			var map = this.project.plugins.mapeditor;
			var panels;
			if(this.panels[asset.id] == void(0)){
				panels = [];
			}
			else{
				panels = this.panels[asset.id];
			}
			var found = false;
			var panel;
			var pp;
			
			
			if(asset.atlas){
				var images = map.atlasNames[asset.id];
				
				// called while loading new atlas
				if(!images){
					return;
				}
				
				if(images.all_frames){
					panel = this.createPreviewPanel("all_frames", panels, asset, images, true);
					this.drawAtlasImage(panel);
					
					
					
				}
				
				for(var i in images){
					panel = this.createPreviewPanel(i || "xxx", panels, asset, images, true);
					this.drawAtlasImage(panel);

					
				}
			}
			else{
				if(panels.length > 0){
					this.drawSpritesheet(panels[0]);
					panels.active = panels[0];
					this.preview.content.clear();
				}
				else{
					panel = new MT.ui.Panel(asset.name);
					panels.push(panel);
					panel.fitIn();
					panel.addClass("borderless");
					
					
					var image = this.project.plugins.mapeditor.game.cache.getImage(asset.id+"");
					// called while loading
					if(!image){
						return;
					}
					var canvas = document.createElement("canvas");
					canvas.width = image.width;
					canvas.height = image.height;
				
					var ctx = canvas.getContext("2d");
					
					
					panel.data = {
						asset: asset,
						group: panels,
						canvas: canvas,
						ctx: ctx,
						image: image
					};
					
					panel.content.el.appendChild(panel.data.canvas);
					
					
					this.drawSpritesheet(panel);
					this.addSpriteEvents(panel);
				}
			}
			
			
			if(panels.length == 0){
				return;
			}
			
			if(!panels.active){
				panels.active = panels[0];
			}
			//panels.active.hide();
			panels.active.show(this.preview.content.el);
			
			
			/*if(panels.active.data.scrollLeft){
				panels.active.content.el.scrollLeft = panels.active.data.scrollLeft;
			}
			if(panels.active.data.scrollTop){
				panels.active.content.el.scrollTop = panels.active.data.scrollTop;
			}*/
			
			this.panels[asset.id] = panels;
		},
		
		createPreviewPanel: function(name, panels, asset, images, isAtlas){
			var panel = null;
			
			for(var j=0; j<panels.length; j++){
				if(panels[j].title == name){
					panel = panels[j];
					panel.data.frames = images[name];
					
					return panel;
				}
			}

			panel = new MT.ui.Panel(name);
			
			var pp = panels[panels.length - 1];
			
			
			panels.push(panel);
			panel.fitIn();
			panel.addClass("borderless");
			
			panel.data = {
				frames: images[name],
				asset: asset,
				group: panels,
				canvas: document.createElement("canvas"),
				ctx: null
			};
			panel.data.ctx = panel.data.canvas.getContext("2d");
			if(pp){
				pp.addJoint(panel);
			}
			
			if(isAtlas){
				this.addAtlasEvents(panel);
			}
			else{
				this.addSpriteEvents(panel);
			}
			
			return panel;
		},
		
		
		drawAtlasImage: function(panel){
			var asset = panel.data.asset;
			var isxml = (asset.atlas.split(".").pop().toLowerCase().indexOf("xml") !== -1);
			this.drawAtlasJSONImage(panel);
			
			panel.data.canvas.style.cssText = "width: "+(panel.data.canvas.width*this.scale)+"px";//"transform: scale("+this.scale+","+this.scale+"); transform-origin: 0 0;";
		},
		
		drawAtlasJSONImage: function(panel){
			var map = this.project.plugins.mapeditor;
			var game = map.game;
			var cache = game.cache.getImage(panel.data.asset.id);//game.cache._images[panel.data.asset.id];
			var ctx = null;
			
			ctx = panel.data.ctx;
			
			var frames = game.cache.getFrameData(panel.data.asset.id);//cache.frameData;
			panel.data.frameData = frames;
			
			var src = cache;//.data;
			
			var frame;
			var startX = 0;
			
			var width = 0;
			var height = 0;
			var pixi;
			panel.data.rectangles = [];
			var active = panel.data.group.active;
			
			// old spritesheet
			if(active && !active.data.frames){
				active.unjoin();
				active.remove();
				var index = panel.data.group.indexOf(active);
				panel.data.group.splice(index, 1);
			}
			
			
			if(panel.title == "all_frames"){
				var image = cache;//.data;
				
				panel.data.canvas.width = image.width;
				panel.data.canvas.height = image.height;
				
				ctx.clearRect(0, 0, image.width, image.height);
				
				ctx.drawImage(image, 0, 0);
				
				ctx.strokeStyle = "rgba(0,0,0,0.5);"
				
				
				for(var i=0; i<frames._frames.length; i++){
					
					frame = frames.getFrame(i);
					pixi = frame;//PIXI.TextureCache[frame.uuid];
					
					panel.data.rectangles.push(new Phaser.Rectangle(frame.x, frame.y, pixi.width, pixi.height));
					if(this.activeFrame == i){
						ctx.fillStyle = "rgba(0,0,0,0.5)";
						
						ctx.fillRect(frame.x,  frame.y, pixi.width, pixi.height);
						
						if(!active || !active.data.frames || i < active.data.frames.start ||  i > active.data.frames.end){
							panel.data.group.active = panel;
						}
						
					}
					
					ctx.strokeRect(frame.x+0.5,  frame.y+0.5, pixi.width, pixi.height);
					
				}
				
				panel.content.el.appendChild(panel.data.canvas);
				return;
			}
			
			
			for(var i=panel.data.frames.start; i<panel.data.frames.end; i++){
				frame = frames.getFrame(i);
				pixi = frame;//PIXI.TextureCache[frame.uuid];
				
				width += pixi.width;
				if(height < pixi.height){
					height = pixi.height;
				}
			}
			
			if(panel.data.canvas.width != width){
				panel.data.canvas.width = width;
				panel.data.canvas.height = height;
			}
			
			
			
			ctx.clearRect(0, 0, width, height);
			
			for(var i=panel.data.frames.start; i<panel.data.frames.end; i++){
				frame = frames.getFrame(i);
				var r = frame.getRect();
				pixi = frame;//PIXI.TextureCache[frame.uuid];
				
				//src = frame;//pixi.baseTexture.source;
				var x = 0;
				var y = 0;
				if(pixi.trim){
					x = pixi.trim.x;
					y = pixi.trim.y;
				}
				
				
				ctx.drawImage(src, frame.x , frame.y, pixi.width, pixi.height, startX, 0, pixi.width, pixi.height);
				
				panel.data.rectangles.push(new Phaser.Rectangle(startX, 0, pixi.width, pixi.height));
				
				
				if(this.activeFrame == i){
					ctx.fillStyle = "rgba(0,0,0,0.5)";
					ctx.fillRect(startX, 0, pixi.width, height);
					if(!active || i < active.data.frames.start ||  i > active.data.frames.end){
						panel.data.group.active = panel;
					}
				}
				
				startX += pixi.width;
				ctx.beginPath();
				ctx.moveTo(startX+0.5, 0);
				ctx.lineTo(startX+0.5, height);
				ctx.stroke();
			}
			
			panel.content.el.appendChild(panel.data.canvas);
		},
		
		drawSpritesheet: function(panel){
			var image = this.project.plugins.mapeditor.game.cache.getImage(panel.data.asset.id+"");
			var ctx = panel.data.ctx;
			if(!image){
				var that = this;
				window.setTimeout(function(){
					that.drawSpritesheet(panel);
				}, 100);
				return;
			}
			
			var imgData = panel.data.asset;
			ctx.canvas.width = image.width;
			ctx.canvas.height = image.height;
			
			ctx.clearRect(0, 0, image.width, image.height);
			
			
			ctx.drawImage(image, 0, 0, image.width, image.height);
			ctx.beginPath();
			
			// vertical lines
			for(var i = imgData.frameWidth + imgData.margin; i<image.width; i += imgData.frameWidth + imgData.spacing){
				ctx.moveTo(i+0.5, imgData.margin);
				ctx.lineTo(i+0.5, image.height);
			}
			
			// horizontal lines
			for(var i = imgData.frameHeight + imgData.margin; i<image.height; i += imgData.frameHeight + imgData.spacing){
				ctx.moveTo(imgData.margin, i+0.5);
				ctx.lineTo(image.width, i+0.5);
			}
			ctx.stroke();
			
			
			var off = imgData.margin + imgData.spacing * Math.floor( image.width / imgData.frameWidth - imgData.spacing );
			
			var widthInFrames = (image.width - off) / (imgData.frameWidth );
			var dx = this.getTileX(this.activeFrame, widthInFrames);
			var dy = this.getTileY(this.activeFrame, widthInFrames);
			
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.fillRect(
					imgData.margin + imgData.frameWidth  * dx + dx * imgData.spacing + 0.5,
					imgData.margin + imgData.frameHeight * dy + dy * imgData.spacing + 0.5,
				
				
							imgData.frameWidth+0.5, imgData.frameHeight+0.5
				);
			
			
		},
		
		getTileX: function(tile, widthInFrames){
			
			return tile % widthInFrames;
		},
		
		getTileY: function(tile, widthInFrames){
			return tile / widthInFrames | 0;
		},
		
		addSpriteEvents: function(panel){
			var that = this;
			var canvas = panel.data.canvas;
			var mdown = false;
			
			var lastAsset = null;
			
			var select = function(e){
				
				if(e.offsetX == void(0)){
					e.offsetX = e.layerX;
					e.offsetY = e.layerY;
				}
				
				var frame = that.getFrame(panel.data.asset, e.offsetX, e.offsetY);
				if(frame == that.activeFrame && that.active == panel.data.asset){
					return;
				}
				
				// released mouse outside canvas?
				var asset = panel.data.asset;
				var maxframe = Math.floor(  (asset.width / asset.frameWidth) * (asset.height /asset.frameHeight) - 1) ;
				if(maxframe < frame){
					return;
				}
				/*
				panel.data.scrollTop = panel.content.el.scrollTop;
				panel.data.scrollLeft = panel.content.el.scrollLeft;
				*/
				that.activeFrame = frame;
				that.emit(MT.ASSET_FRAME_CHANGED, that.active.data, that.activeFrame);
			};
			
			canvas.onmousedown = function(e){
				mdown = true;
				select(e);
			};
			
			canvas.onmousemove = function(e){
				if(!mdown){
					return;
				}
				
				select(e);
			};
			
			this.ui.events.on(this.ui.events.MOUSEUP, function(e){
				if(!mdown){
					return;
				}
				mdown = false;
				select(e);
			});
		},
		
		addAtlasEvents: function(panel){
			var that = this;
			var mdown = false;
			
			var select = function(e){
				var total = panel.data.frames.end - panel.data.frames.start  - 1;
				var width = panel.data.canvas.width;
				if(e.offsetX == void(0)){
					e.offsetX = e.layerX;
					e.offsetY = e.layerY;
				}
				var x = e.offsetX / that.scale;
				var y = e.offsetY / that.scale;
				var frame = panel.data.frames.start;
				var found = false;
				
				for(var i=0; i<panel.data.rectangles.length; i++){
					if(panel.data.rectangles[i].contains(x, y)){
						frame += i;
						found = true;
						break;
					}
				}
				if(!found){
					return;
				}
				
				if(frame == that.activeFrame && that.active == panel.data.asset){
					return;
				}
				/*
				panel.data.scrollTop = panel.content.el.scrollTop;
				panel.data.scrollLeft = panel.content.el.scrollLeft;
				*/
				panel.data.group.active = panel;
				
				
				if(panel.title == "all_frames"){
					var g = panel.data.group, p;
					for(var i=1; i<g.length; i++){
						p = g[i];
						if(p.data.frames.start <= frame && p.data.frames.end > frame){
							that.tmpName = p.title;
							break;
						}
					}
					
				}
				else{
					that.tmpName = panel.title;
				}
				
				/*var frameInfo = panel.data.frameData.getFrame(frame);

				if(frameInfo.name){
					frame = frameInfo.name;
				}*/
				
				that.activeFrame = frame;
				that.emit(MT.ASSET_FRAME_CHANGED, panel.data.asset, frame);
			};
			panel.data.canvas.oncontextmenu = function(e){
				return false;
			};
			
			panel.data.canvas.onmousedown = function(e){
				e.preventDefault();
				if(e.button != 0){
					return;
				}
				mdown = true;
				select(e);
			};
			
			panel.data.canvas.onmousemove = function(e){
				if(e.button == 2){
					this.parentNode.scrollTop -= that.ui.events.mouse.my;
					this.parentNode.scrollLeft -= that.ui.events.mouse.mx;
					return;
				}
				if(!mdown){
					return;
				}
				
				select(e);
			};
			
			this.ui.events.on(this.ui.events.MOUSEUP, function(e){
				if(!mdown || e.button != 0){
					return;
				}
				mdown = false;
				select(e);
			});
			
		},
		
		installUI: function(ui){
			
			var that = this;
			var tools = this.project.plugins.tools;
			
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
						that.emit(MT.ASSET_UNSELECTED, data);
					});
					that.selector.clear();
				}
				
				
				if(that.active && !shift){
					that.active.removeClass("active.selected");
					that.selector.remove(element);
					that.emit(MT.ASSET_UNSELECTED, data);
				}
				
				that.selector.add(element);
				
				that.active = element;
				that.active.addClass("active.selected");
				
				that.project.map.selector.forEach(function(o){
					o.data.assetId = data.id;
					o.data.__image = data.__image;
				});
				that.project.plugins.objectmanager.update();
				that.project.plugins.objectmanager.sync();
				
				
				//that.setPreviewAssets(data);
			};
			
			
			tools.on(MT.OBJECT_SELECTED, function(obj){
				if(obj){
					that.pendingFrame = obj.frame;
					var asset = that.selectAssetById(obj.data.assetId);
					
					var p = that.panels[obj.data.assetId]
					
					
					//that.setPreviewAssets(asset);
				}
			});
			
			tools.on(MT.OBJECT_UNSELECTED, function(obj){
				
				if(!obj){
					that.unselectAll();
					return;
				}
				
				var asset = that.tv.getById(obj.assetId);
				that.emit(MT.ASSET_UNSELECTED, asset);
				
				if(that.active){
					that.active.removeClass("selected.active");
					that.active = null;
					that.unselectAll();
				}
				
				if(that.selector.is(asset)){
					asset.removeClass("selected.active");
					that.selector.remove(asset);
					
				}
			});
			
			this.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				that.setPreviewAssets(asset);
				if(tools.activeTool != tools.tools.select){
					return;
				}
				
				that.project.map.selector.forEach(function(o){
					if(asset){
						o.data.assetId = asset.id;
						o.data.__image = asset.__image;
					}
					else{
						delete o.data.assetId;
						delete o.data.__image;
						
						if(frame != void(0)){
							o.frame = 0;
						}
						that.activeFrame = 0;
					}
					that.project.plugins.objectmanager.update();
					that.project.plugins.objectmanager.sync();
				});
				
				
			});
			
			
			var map = this.project.plugins.mapeditor;
			
			var shouldEnd = false;
			
			this.tv.on("dragmove", function(e, item){
				if(e.target !== map.game.canvas){
					tools.removeTmpObject();
					return;
				}
				
				shouldEnd = true;
				tools.tools.stamp.init(item.data);
			});
			
			this.tv.on("dragend", function(e, item){
				if(shouldEnd == false){
					return;
				}
				
				shouldEnd = false;
				if(e.target !== map.game.canvas){
					tools.removeTmpObject();
					return;
				}
				tools.tools.stamp.mouseDown(e);
				tools.removeTmpObject();
			});
			
			
		},
		
		selectAssetById: function(id, redraw){
			var asset = this.tv.getById(id);
			this.tv.select(id);
			this.selector.add(asset);
			if(redraw){
				this.setPreviewAssets(asset);
			}
			return asset;
		},
		
		selectActiveAsset: function(active){
			if(active == void(0) && !this.active){
				return;
			}
			//this.emit(MT.ASSET_SELECTED, this.active.data);
			this.emit(MT.ASSET_FRAME_CHANGED, this.active.data, this.activeFrame);
			this.setPreviewAssets(this.active.data);
		},
		
		updateImage: function(asset, e){
			
			var notify = this.project.plugins.notification.show("Updating image", asset.name);
			
			var that = this;
			this.project.plugins.mapeditor.cleanImage(asset.id);
			
			var img = new Image();
			
			
			this.readFile(e.target.files[0], function(fr){
				var data = Array.prototype.slice.call(new Uint8Array(fr.result));
				img.onload = function(){
					//asset.frameWidth = img.width;
					//asset.frameHeight= img.height;
					asset.width = img.width;
					asset.height = img.height;
					asset.updated = Date.now();
					
					that.guessFrameWidth(asset);
					that.emit(MT.ASSET_FRAME_CHANGED, asset, that.activeFrame);
					that.active.data = asset;
					that.send("updateImage", {asset: asset, data: data});
					if(asset.atlas){
						that.project.plugins.mapeditor.addAtlas(asset, null, null, function(){
							notify.hide();
						});
					}
					else{
						notify.hide();
					}
				};
				img.src = that.toPng(fr.result);
			});
		},
		
		addAtlas: function(asset, e){
			var that = this;
			
			var file = e.target.files[0];
			var ext = file.name.split(".").pop();
			
			if(MT.const.DATA.indexOf(ext) === -1){
				var popup = new MT.ui.Popup("Incorrect format","Atlas loading canceled"+"<br /><br />");
				popup.showClose();
				popup.addButton("OK", function(){
					popup.hide();
				});
				return;
			}
			
			var notify = this.project.plugins.notification.show("Updating atlas", file.name);
			this.readFile(file, function(fr){
				asset.updated = Date.now();
				that.send("addAtlas", {id: asset.id, ext: ext, data: Array.prototype.slice.call(new Uint8Array(fr.result)) }, function(){
					notify.hide();
				});
			});
			
		},
		
		getFrame: function(o, x, y){
			var dx = (x - o.margin);
			var dy = (y - o.margin);
			
			if(dx < 0){
				dx = 0;
			}
			if(dy < 0){
				dy = 0;
			}
			var gx = Math.floor( dx /(o.frameWidth + o.spacing));
			var gy = Math.floor( dy /(o.frameHeight + o.spacing));
			
			var maxX = Math.floor( o.width / o.frameWidth);
			
			var frame = gx + maxX * gy;
			return frame;
		},
		
		update: function(){
			var data = this.tv.getData();
			if(this.active){
				this.setPreviewAssets(this.active.data);
			}
			this.emit(MT.ASSETS_UPDATED, data);
		},
		
		a_receiveFileList: function(list){
			
			//this._syncData(list);
			
			this.buildAssetsTree(list);
			this.buildList(list);
			this.update();
			this.updateNotifications(list);
		},
		
		buildList: function(list){
			for(var i=0; i<list.length; i++){
				if(list[i].contents){
					this.buildList(list[i].contents);
					continue;
				}
				this.list[list[i].id] = list[i];
			}
		},
		
		handleDrop: function(e){
			var that = this;
			var files = e.dataTransfer.files;
			this.handleFiles(files, e.dataTransfer);
		},
		
		handleFiles: function(files, dataTransfer){
			var entry = null;
			for(var i=0; i<files.length; i++){
				//chrome
				if(dataTransfer){
					entry = (dataTransfer.items[i].getAsEntry ? dataTransfer.items[i].getAsEntry() : dataTransfer.items[i].webkitGetAsEntry());
					this.handleEntry(entry);
				}
				//ff
				else{
					this.handleFile(files.item(i));
				}
			}
		},
		
		handleFile: function(file){
			var path = file.webkitRelativePath || file.path || file.name;
			//folder
			if(file.size == 0){
				this.send("newFolder", path);
			}
			//file
			else{
				this.uploadImage(file, path);
			}
		},
		
		upload: function(){
			
			var that = this;
			var input = document.createElement("input");
			input.setAttribute("type", "file");
			input.onchange = function(e){
				that.handleFiles(this.files);
			};
			input.onclick = function(){
				console.log("Clicked!;");
			};
			input.click();
		},
		
		uploadFolder: function(){
			var that = this;
			
			var input = document.createElement("input");
			input.type = "file";
			input.setAttribute("webkitdirectory","");
			input.setAttribute("directory","");
			input.value = "";
			
			input.onchange = function(e){
				that.handleFiles(this.files);
			};
			input.click();
		},
		
		handleEntry: function(entry){
			var that = this;
			
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
			this.updateData();
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
		
		deleteSelected: function(){
			this.selector.forEach(function(obj, last){
				this.deleteAsset(obj.data.id, !last);
			}, this);
		},
		
		deleteAsset: function(id, silent){
			this.project.plugins.mapeditor.cleanImage(id);
			
			this.send("delete", id);
			this.emit(MT.ASSET_DELETED, id);
			
			//if using silent.. you should call manually sync
			if(!silent){
				this.ui.events.simulateKey(MT.keys.ESC);
			}
		},
		
		confirmDeleteAsset: function(id){
			var that = this;
			
			var pop = new MT.ui.Popup("Delete Asset?", "Do you really want to delete asset?");
			pop.addButton("no", function(){
				pop.hide();
			});
			pop.addButton("yes", function(){
				that.deleteAsset(id);
				pop.hide();
			});
			pop.showClose();
		},
		confirmDeleteSelected: function(){
			if(!this.selector.count){
				return;
			}
			var that = this;
			
			var pop = new MT.ui.Popup("Delete selected assets?", "Do you really want to delete selected assets?");
			pop.addButton("no", function(){
				pop.hide();
			});
			pop.addButton("yes", function(){
				that.deleteSelected();
				pop.hide();
			});
			pop.showClose();
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
		
		
		readFile: function(file, cb){
			var fr  = new FileReader();
			fr.onload = function(){
				cb(fr);
			};
			fr.readAsArrayBuffer(file);
		},
		
		
		uploadImage: function(file, path){
			if(path.substring(0, 1) != "/"){
				path = "/" + path;
			}
			var that = this;
			this.project.readFile(file, path);
			return;
			this.readFile(file, function(fr){
				that.createImage({
					src: fr.result,
					path: path
				});
			});
		},
		
		notifications: [],
		
		createImage: function(fileObj){
			var path = fileObj.path;
			var src = fileObj.src;
			var name = path.split("/").pop();
			var img = new Image();
			var that = this;
			var imgData = Array.prototype.slice.call(new Uint8Array(src));
			
			img.onload = function(){
				var data = {
					data: imgData,
					id: MT.core.Helper.uuid(),
					name: name,
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
					fps: 10,
					updated: Date.now(),
					atlas: ""
				};
				
				that.guessFrameWidth(data);
				
				that.send("newImage", data);
				that.emit(MT.ASSET_ADDED, path);
				
				var nota = that.project.plugins.notification.show(path, "Upload in progress...", 999999);
				that.notifications[path] = nota;
			};
			img.src = that.toPng(src);
		},
		
		updateNotifications: function(list){
			for(var i =0; i<list.length; i++){
				if(this.notifications[list[i].key]){
					this.notifications[list[i].key].hide();
					return;
				}
				if(list[i].contents){
					this.updateNotifications(list[i].contents);
				}
			}
			
		},
		
		toPng: function(src){
			var str = "";// = String.fromCharCode.apply(null, src);
			
			var buff = new Uint8Array(src);
			for(var i=0; i<buff.length; i++){
				str += String.fromCharCode(buff[i]);
			}
			
			
			return "data:image/png;base64,"+btoa(str);
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
