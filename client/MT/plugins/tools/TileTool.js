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
			for(var id in images){
				if(this.panels[id]){
					if(!map){
						continue;
					}
					
					p = this.panels[id];
					p.data.widthInTiles = p.data.image.width / obj.tileWidth | 0;
					p.data.heightInTiles = p.data.image.height / obj.tileHeight | 0;
					
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
			
			this.addCanvas(panel, img);
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
			var tim = this.active.map.addTilesetImage(key, key, map.tileWidth, map.tileHeight, 0, 0, nextId);
			
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
				var tile = that.getTile(e.offsetX, e.offsetY, panel.data.image);
				
				that.start = tile;
				that.drawImage(panel);
			};
			
			canvas.onmousemove = function(e){
				if(!mdown){
					return;
				}
				var tile = that.getTile(e.offsetX, e.offsetY, panel.data.image);
				that.stop = tile;
				
				that.drawImage(panel);
			};
			
			canvas.onmouseup = function(e){
				mdown = false;
				that.stop = that.getTile(e.offsetX, e.offsetY, panel.data.image);
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
			var tx, ty;
			var widthInTiles = panel.data.widthInTiles;
			
			
			ctx.clearRect(0,0,image.width, image.height);
			ctx.drawImage(image, 0, 0, image.width, image.height);
			
			var map = this.active.map;
			ctx.beginPath();
			for(var i = map.tileWidth; i<image.width; i += map.tileWidth){
				ctx.moveTo(i+0.5, 0);
				ctx.lineTo(i+0.5, image.height);
			}
			for(var i = map.tileHeight; i<image.height; i += map.tileHeight){
				ctx.moveTo(0, i+0.5);
				ctx.lineTo(image.width, i+0.5);
			}
			ctx.stroke();
			
			
			
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			
			tx = that.getTileX(this.start, widthInTiles);
			ty = that.getTileY(this.start, widthInTiles);
			
			this.selection.clear();
			
			if(this.start == this.stop){
				ctx.fillRect(map.tileWidth*tx+0.5, map.tileHeight*ty+0.5, map.tileWidth+0.5, map.tileHeight+0.5);
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
						ctx.fillRect(map.tileWidth*i+0.5, map.tileHeight*j+0.5, map.tileWidth+0.5, map.tileHeight+0.5);
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
			return this.getTile(e.offsetX, e.offsetY, image);
		},
		
		getTile: function(x, y, image){
			var tx = x/this.active.map.tileWidth | 0;
			var ty = y/this.active.map.tileHeight | 0;
			return this.getId(tx, ty, image);
		},
		
		getId: function(x, y, image){
			return x + y*(image.width / this.active.map.tileWidth);
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
			var x = (e.x - this.active.x - this.tools.map.offsetX)/scale;
			var y = (e.y - this.active.y - this.tools.map.offsetY)/scale;
			
			if(this.active){
				var bounds = this.active.getBounds();
				if(!bounds.contains(e.x - this.tools.map.ox, e.y - this.tools.map.oy)){
					return;
				}
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
			
			
			
			this.selection.forEach(function(obj){
				that.putTile(id+that.getId(obj.x, obj.y, that.activePanel.data.image), p.x + obj.dx, p.y + obj.dy, activeLayer);
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
			layer.map.putTile(id, x, y, layer);
		},
		
		oldSettings: {},
		init: function(){
			this.active = this.tools.map.activeObject;
			if(!this.active){
				this.tools.setTool(this.tools.tools.select);
				return;
			}
			
			this.oldSettings.gridX = this.tools.map.settings.gridX;
			this.oldSettings.gridY = this.tools.map.settings.gridY;
			
			this.tools.map.settings.gridX = this.active.MT_OBJECT.tileWidth;
			this.tools.map.settings.gridY = this.active.MT_OBJECT.tileHeight;
			
			this.update();
			
			this.panel.show();
			if(this.activePanel){
				this.activePanel.hide();
				this.activePanel.show();
			}
		},
		
		unselect: function(){
			this.panel.hide();
			this.restore();
		},
		
		select: function(obj){
			if(obj.MT_OBJECT.type != MT.objectTypes.TILE_LAYER){
				this.restore();
				return;
			}
			
			this.oldSettings.gridX = this.tools.map.settings.gridX;
			this.oldSettings.gridY = this.tools.map.settings.gridY;
			
			this.tools.map.settings.gridX = obj.MT_OBJECT.tileWidth;
			this.tools.map.settings.gridY = obj.MT_OBJECT.tileHeight;
			this.tools.map.settings.gridOffsetX = obj.x;
			this.tools.map.settings.gridOffsetY = obj.y;
			
			this.active = obj;
			if(this.tools.activeTool == this){
				
				this.panel.show();
				this.update();
			}
		},
		
		update: function(){
			var images = this.tools.project.plugins.assetsmanager.list;
			this.createPanels(images);
			if(this.activePanel){
				this.drawImage(this.activePanel);
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
		
		updateLayer: function(obj){
			var data = obj.MT_OBJECT;
			this.active = obj;
			if(!data.images || data.images.length == 0){
				return;
			}
			var map = obj.map;
			var nextId = 0;
			var im = null;
			for(var i=0; i<data.images.length; i++){
				im = map.addTilesetImage(data.images[i], data.images[i], map.tileWidth, map.tileHeight, 0, 0, nextId);
				nextId += im.total;
			}
			
			var tiles = obj.MT_OBJECT.tiles;
			for(var y in tiles){
				for(var x in tiles[y]){
					obj.map.putTile(tiles[y][x], x, y, obj);
				}
			}
		}
	}
);