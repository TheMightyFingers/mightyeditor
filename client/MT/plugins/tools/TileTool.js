"use strict";

MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.TileTool = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "tileTools";
		this.active = null;
		this.activePanel = null;
		window.tileTool = this;
		this.panels = {};
	},{
		
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			this.panel = ui.createPanel("Tile tools");
			this.panel.setFree();
			this.panel.height = 300;
			ui.dockToBottom(this.panel);
			this.panel.hide();
			
			var that = this;
			this.tools.on("selectObject", function(obj){
				if(!obj){
					return;
				}
				that.select(obj);
			});
			this.tools.on("unselectedObject", function(){
				that.unselect();
			});
			
			this.selection = new MT.core.Selector();
			
			this.start = 0;
			this.stop = 0;
			
			
			this.tools.map.on("objectsAdded", function(map){
				if(map.activeObject){
					that.select(map.activeObject);
					that.update();
				}
			});
		},
		
		getImageFn: function(img){
			return function(){return img;};
		},
		
		
		
		createPanels: function(images){
			var p, pp;
			var obj = this.active.MT_OBJECT;
			var image = null;
			for(var id in images){
				if(this.panels[id]){
					if(!map){
						continue;
					}
					
					image = images[id];
					p = this.panels[id];
					//p.data.widthInTiles = (p.data.image.width - image.margin*2) / (obj.tileWidth + image.spacing) | 0;
					//p.data.heightInTiles = (p.data.image.height - image.margin*2) / (obj.tileHeight + image.spacing) | 0;
					
					continue;
				}
				
				p = new MT.ui.Panel(images[id].name);
				p.fitIn();
				p.addClass("borderless");
				
				if(pp){
					p.addJoint(pp);
				}
				
				this.createImage(p, images[id]);
				this.panels[id] = p;
				pp = p;
			}
			
			if(pp){
				this.activePanel = pp;
				pp.show(this.panel.content.el);
			}
		},
		
		createImage: function(panel, image){
			var that = this;
			var img = new Image();
			
			img.onload = function(){
				that.addCanvas(panel, this);
				that.drawImage(panel, this);
			};
			img.src = this.tools.project.path + "/" + image.__image;
			
			panel.data = {
				data: image,
				id: image.id,
				image: img,
				canvas: null,
				ctx: null
			};
			
			
		},
		
		
		addImage: function(image){
			var map = this.active.map;
			for(var i =0; i<map.tilesets.length; i++){
				if(map.tilesets[i].name == image.id){
					return map.tilesets[i].firstgid;
				}
			}
			
			var map = this.active.map;
			var nextId = 0;
			for(var i =0; i<map.tilesets.length; i++){
				nextId += map.tilesets[i].total+1;
			}
			
			//function (tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) {
			var key = ""+image.data.id;
			var tim = this.active.map.addTilesetImage(key, key, image.data.frameWidth, image.data.frameHeight, 0, 0, nextId);
			
			if(!this.active.MT_OBJECT.images){
				this.active.MT_OBJECT.images = [];
			}
			
			this.active.MT_OBJECT.images.push(image.id);
			
			return nextId;
			
		},
		
		addCanvas: function(panel, image){
			
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			
			var map = this.active.map;
			
			canvas.width = image.width;
			canvas.height = image.height;
			
			panel.data.canvas = canvas;
			panel.data.ctx = ctx;
			
			panel.data.widthInTiles = image.width / map.tileWidth | 0;
			panel.data.heightInTiles = image.height / map.tileHeight | 0;
			
			
			
			var mdown = false;
			var that = this;
			
			canvas.onmousedown = function(e){
				mdown = true;
				var tile = that.getTile(e.offsetX, e.offsetY, panel.data.image, panel.data.data);
				
				that.start = tile;
				that.stop = tile;
				that.drawImage(panel);
			};
			
			canvas.onmousemove = function(e){
				if(!mdown){
					return;
				}
				var tile = that.getTile(e.offsetX, e.offsetY, panel.data.image, panel.data.data);
				that.stop = tile;
				
				that.drawImage(panel);
			};
			
			canvas.onmouseup = function(e){
				mdown = false;
				that.stop = that.getTile(e.offsetX, e.offsetY, panel.data.image, panel.data.data);
				that.activePanel = panel;
			};
			panel.content.el.appendChild(canvas);
			
		},
		
		addSelection: function(tileId){
			this.selection.add(tileId);
		},
		
		selectAdditionalTiles: function(){
			var min = this.selection.min;
			var max = this.selection.max;
		},
		
		drawImage: function(panel){
			var that = this;
			
			var image = panel.data.image;
			var ctx = panel.data.ctx;
			//image is loading
			if(ctx == null){
				return;
			}
			
			var imgData = panel.data.data;
			
			var tx, ty;
			var widthInTiles = panel.data.widthInTiles;
			
			
			ctx.clearRect(0, 0, image.width, image.height);
			ctx.drawImage(image, 0, 0, image.width, image.height);
			
			var map = this.active.map;
			ctx.beginPath();
			
			for(var i = map.tileWidth; i<image.width; i += map.tileWidth + imgData.spacing){
				ctx.moveTo(imgData.margin + i+0.5, imgData.margin);
				ctx.lineTo(i+0.5, image.height);
			}
			for(var i = map.tileHeight; i<image.height; i += map.tileHeight + imgData.spacing){
				ctx.moveTo(imgData.margin + 0, imgData.margin + i+0.5);
				ctx.lineTo(image.width, i+0.5);
			}
			ctx.stroke();
			
			
			
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			
			tx = that.getTileX(this.start, widthInTiles);
			ty = that.getTileY(this.start, widthInTiles);
			
			this.selection.clear();
			
			if(this.start == this.stop){
				
				ctx.fillRect(imgData.margin + map.tileWidth * tx + tx * imgData.spacing + 0.5,
							imgData.margin + map.tileHeight * ty + ty * imgData.spacing + 0.5,
							map.tileWidth+0.5, map.tileHeight+0.5
				);
				this.selection.add({x: tx, y: ty, dx: 0, dy: 0});
			}
			else{
				
				
				var endx = that.getTileX(this.stop, widthInTiles);
				var endy = that.getTileY(this.stop, widthInTiles);
				
				var startx = Math.min(tx, endx);
				var starty = Math.min(ty, endy);
				
				endx =  Math.max(tx, endx);
				endy =  Math.max(ty, endy);
				
				for(var i=startx; i<=endx; i++){
					for(var j=starty; j<=endy; j++){
						ctx.fillRect(
							imgData.margin + map.tileWidth * i  + i * imgData.spacing + 0.5,
							map.tileHeight * j + j * imgData.spacing + 0.5,
							map.tileWidth + 0.5,
							map.tileHeight + 0.5
						);
						this.selection.add({x: i, y: j, dx: i-startx, dy: j-starty});
					}
				}
				
				
				
			}
		},
		
		getTileX: function(tile, width){
			
			return tile % width;
		},
		
		getTileY: function(tile, width){
			return tile / width | 0;
		},
		
		getSelection: function(panel, e){
			var image = panel.data.image;
			return this.getTile(e.offsetX, e.offsetY, image, panel.data.data);
		},
		
		getTile: function(x, y, image, imageData){
			var tx = (x + imageData.margin - imageData.spacing) / (this.active.map.tileWidth + imageData.spacing ) | 0;
			var ty = (y + imageData.margin - imageData.spacing) / (this.active.map.tileHeight + imageData.spacing ) | 0;
			return this.getId(tx, ty, image, imageData);
		},
		
		getId: function(tx, ty, image, imageData){
			var y = ty * ( (image.width + imageData.spacing) / (this.active.map.tileWidth + imageData.spacing) );
			var ret = (tx + y | 0);
			return ret;
		},
		
		mouseUp: function(e){
			if(e.target != this.tools.map.game.canvas){
				return;
			}
			this.mDown = false;
		},
		
		mouseDown: function(e){
			this.mDown = true;
			this.putTileFromMouse(e);
		},
		
		mouseMove: function(e){
			if(!this.mDown){
				return;
			}
			this.putTileFromMouse(e);
		},
		
		putTileFromMouse: function(e){
			if(e.target != this.tools.map.game.canvas){
				return;
			}
			
			var that = this;
			var activeLayer = this.active;
			var map = this.active.map;
			
			var scale = this.tools.map.game.camera.scale.x;
			
			var x = 0;
			var y = 0;
			
			
			if(!this.active || !this.active.game){
				return;
			}
			
			var bounds = this.active.getBounds();
			if(!bounds.contains(e.x - this.tools.map.ox, e.y - this.tools.map.oy)){
				return;
			}
			
			if(!this.active.fixedToCamera){
				x = (e.x - this.active.x - this.tools.map.offsetX)/scale;
				y = (e.y - this.active.y - this.tools.map.offsetY)/scale;
			}
			else{
				x = (e.x  - this.active.x + this.tools.map.game.camera.x - this.tools.map.ox)/scale;
				y = (e.y  - this.active.y + this.tools.map.game.camera.y - this.tools.map.oy)/scale;
			}
			var p = this.active.getTileXY(x, y, {});
			
			if(e.ctrlKey){
				that.putTile(null, p.x, p.y, activeLayer);
				return;
			}
			if(!this.activePanel){
				return;
			}
			
			var id = this.addImage(this.activePanel.data);
			
			
			var oid = 0;
			this.selection.forEach(function(obj){
				oid = that.getId(obj.x, obj.y, that.activePanel.data.image, that.activePanel.data.data);
				that.putTile(
					id + oid, p.x + obj.dx, p.y + obj.dy, activeLayer
				);
			});
		},
		
		putTile: function(id, x, y, layer){
			if(!layer.MT_OBJECT.tiles){
				layer.MT_OBJECT.tiles = {};
			}
			if(!layer.MT_OBJECT.tiles[y]){
				layer.MT_OBJECT.tiles[y] = {};
			}
			layer.MT_OBJECT.tiles[y][x] = id;
			
			console.log("put tile", id);
			
			layer.map.putTile(id, x, y, layer);
		},
		
		oldSettings: {},
		init: function(){
			this.active = this.tools.map.activeObject;
			if(!this.active){
				this.tools.setTool(this.tools.tools.select);
				console.warn("not tilelayer selected!!!")
				return;
			}
			
			this.adjustSettings(this.active.MT_OBJECT);
			
			this.update();
			
			this.panel.show();
			if(this.activePanel){
				this.activePanel.hide();
				this.activePanel.show();
			}
		},
		
		restore: function(){
			if(this.oldSettings.gridX){
				this.tools.map.settings.gridX = this.oldSettings.gridX;
				this.tools.map.settings.gridY = this.oldSettings.gridY;
				this.tools.map.settings.gridOffsetX = 0;
				this.tools.map.settings.gridOffsetY = 0;
			}
			
			
		},
		
		adjustSettings: function(obj){
			this.restore();
			
			if(this.tools.activeTool != this){
				this.oldSettings.activeTool = this.tools.activeTool;
			}
			this.oldSettings.gridX = this.tools.map.settings.gridX;
			this.oldSettings.gridY = this.tools.map.settings.gridY;
			
			this.tools.map.settings.gridX = obj.tileWidth;
			this.tools.map.settings.gridY = obj.tileHeight;
			this.tools.map.settings.gridOffsetX = obj.x;
			this.tools.map.settings.gridOffsetY = obj.y;
		},
		
		unselect: function(){
			
			this.panel.hide();
			this.restore();
			console.log("unselect");
			if(this.tools.activeTool == this && this.oldSettings.activeTool && this.tools.activeTool != this.oldSettings.activeTool){
				this.tools.setTool(this.oldSettings.activeTool);
			}
		},
		
		deactivate: function(){
			this.restore();
			/*if(this.oldSettings.activeTool && this.tools.activeTool != this.oldSettings.activeTool){
				this.tools.setTool(this.oldSettings.activeTool);
			}*/
		},
		
		select: function(obj){
			if(obj.MT_OBJECT.type != MT.objectTypes.TILE_LAYER){
				this.restore();
				return;
			}
			this.active = obj;
			
			
			this.adjustSettings(this.active.MT_OBJECT);
			
			this.tools.setTool(this);
			this.panel.show();
			this.update();
		},
		
		update: function(){
			var images = this.tools.project.plugins.assetsmanager.list;
			if(this.active){
				this.createPanels(images);
			}
			if(this.activePanel){
				this.drawImage(this.activePanel);
			}
		},
		
		
		updateLayer: function(obj){
			var data = obj.MT_OBJECT;
			this.active = obj;
			if(!data.images || data.images.length == 0){
				return;
			}
			var map = obj.map;
			var nextId = 0;
			var tilesetImage = null;
			
			var images = this.tools.project.plugins.assetsmanager.list;
			var image = null;
			
			for(var i=0; i<data.images.length; i++){
				image = images[data.images[i]];
				if(!image){
					data.images.splice(i, 1);
					i--;
					continue;
				}
				//addTilesetImage(tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) → {Phaser.Tileset}
				tilesetImage = map.addTilesetImage(image.id, image.id, image.frameWidth, image.frameHeight, image.margin, image.spacing, nextId);
				nextId += tilesetImage.total;
			}
			
			var tiles = obj.MT_OBJECT.tiles;
			for(var y in tiles){
				for(var x in tiles[y]){
					if(tiles[y][x] >= nextId){
						delete tiles[y][x];
						console.warn("tile out of range: ", tiles[y][x]);
						continue;
					}
					
					obj.map.putTile(tiles[y][x], x, y, obj);
				}
			}
		}
	}
);