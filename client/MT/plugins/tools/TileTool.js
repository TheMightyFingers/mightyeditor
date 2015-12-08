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
			this.panel = this.tools.project.plugins.assetmanager.preview;
			this.selection = new MT.core.Selector();

			this.start = 0;
			this.stop = 0;


			var that = this;
			this.tools.on(MT.OBJECT_SELECTED, function(obj){
				if(!obj){
					return;
				}
				if(obj.type == MT.objectTypes.TILE_LAYER){
					that._select(obj);
				}
			});
			this.tools.on(MT.OBJECT_UNSELECTED, function(){
				if(that.tools.activeTool == that){
					that.unselect();
				}
			});

			this.tools.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				if(that.tools.activeTool != that){
					return;
				}
				if(!that.panels[asset.id]){
					that.update();
				}
				that.activePanel = that.panels[asset.id];
				that.activePanel.show();
			});

			this.tools.map.on(MT.MAP_OBECTS_ADDED, function(map){
				if(that.tools.activeTool != that){
					return;
				}
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
			var obj = this.active.data;
			var image = null;
			for(var id in images){
				if(this.panels[id]){
					if(!map){
						continue;
					}

					image = images[id];
					p = this.panels[id];
					continue;
				}

				p = this.addPanel(images[id], id);
				if(pp){
					p.addJoint(pp);
				}
				pp = p;
			}

			if(pp){
				this.activePanel = pp;
				pp.show(this.panel.content.el);
			}
		},

		addPanel: function(image, id){
			var p = new MT.ui.Panel(image.name);
			p.fitIn();
			p.addClass("borderless");



			this.createImage(p, image);
			this.panels[id] = p;
			var that = this;
			p.on("show", function(){
				that.stop = that.getTile(0, 0, p.data.image, p.data.data);
				that.activePanel = p;
			});

			return p;
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
			var map = this.active.tilemap;
			for(var i =0; i<map.tilesets.length; i++){
				if(map.tilesets[i].name == image.id){
					return map.tilesets[i].firstgid;
				}
			}

			var nextId = 0;
			for(var i =0; i<map.tilesets.length; i++){
				nextId += map.tilesets[i].total+1;
			}

			//function (tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) {
			var key = ""+image.data.id;
			var tim = map.addTilesetImage(key, key, image.data.frameWidth, image.data.frameHeight, 0, 0, nextId);

			if(!this.active.data.images){
				this.active.data.images = [];
			}

			this.active.data.images.push(image.id);

			return nextId;

		},

		addCanvas: function(panel, image){

			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");

			var map = this.active.tilemap;

			canvas.width = image.width;
			canvas.height = image.height;

			panel.data.canvas = canvas;
			panel.data.ctx = ctx;

			var imgData = panel.data.data;

			panel.data.widthInTiles = image.width / imgData.frameWidth | 0;
			panel.data.heightInTiles = image.height / imgData.frameHeight | 0;



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

			var map = this.active.tilemap;
			ctx.beginPath();

			for(var i = imgData.frameWidth + imgData.margin; i<image.width; i += imgData.frameWidth + imgData.spacing){
				ctx.moveTo(i+0.5, imgData.margin);
				ctx.lineTo(i+0.5, image.height);
			}
			for(var i = imgData.frameHeight + imgData.margin; i<image.height; i += imgData.frameHeight + imgData.spacing){
				ctx.moveTo(imgData.margin, i+0.5);
				ctx.lineTo(image.width, i+0.5);
			}
			ctx.stroke();



			ctx.fillStyle = "rgba(0,0,0,0.5)";

			tx = that.getTileX(this.start, widthInTiles);
			ty = that.getTileY(this.start, widthInTiles);

			this.selection.clear();

			if(this.start == this.stop){

				ctx.fillRect(
							imgData.margin + imgData.frameWidth * tx + tx * imgData.spacing + 0.5,
							imgData.margin + imgData.frameHeight * ty + ty * imgData.spacing + 0.5,
							imgData.frameWidth+0.5, imgData.frameHeight+0.5
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
							imgData.margin + imgData.frameWidth * i  + i * imgData.spacing + 0.5,
							imgData.margin + imgData.frameHeight * j + j * imgData.spacing + 0.5,

							imgData.frameWidth + 0.5,
							imgData.frameHeight + 0.5
						);
						this.selection.add({x: i, y: j, dx: i-startx, dy: j-starty});
					}
				}
			}
		},
		updatePreview: function(asset){
			this.drawImage(this.panels[asset.id]);
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

		getTile2: function(x, y, image, imageData){
			var tx = (x + imageData.margin - imageData.spacing) / (imageData.frameWidth + imageData.spacing ) | 0;
			var ty = (y + imageData.margin - imageData.spacing) / (imageData.frameHeight + imageData.spacing ) | 0;
			return this.getId(tx, ty, image, imageData);
		},

		getTile: function(x, y, image, o){


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

		getId: function(tx, ty, image, imageData){
			var y = ty * ( (image.width + imageData.spacing) / (imageData.frameWidth + imageData.spacing) );
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
			if(!activeLayer.isVisible){
				return;
			}

			var map = this.active.tilemap;

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
			var p = {x: 0, y: 0};
			// TODO: phaser bug with scrollFactorX - check if fixed
			if(this.active.object.scrollFactorX == 0){
				p.x = Math.floor(x / this.active.tileWidth);
			}
			else{
				p.x = this.active.getTileX(x);
			}
			if(this.active.object.scrollFactorY == 0){
				p.y = Math.floor(y / this.active.tileHeight);
			}
			else{
				p.y = this.active.getTileY(y);
			}
			//this.active.getTileXY(x, y, {});

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
			if(!layer.data.tiles){
				layer.data.tiles = {};
			}
			if(!layer.data.tiles[y]){
				layer.data.tiles[y] = {};
			}
			layer.data.tiles[y][x] = id;
			layer.putTile(id, x, y);

			if(this.active){
				this.active.data.lastImage = this.activePanel.data.id;
			}

			this.tools.project.plugins.objectmanager.sync();
		},

		oldSettings: {},
		init: function(){
			this.active = this.tools.map.activeObject;
			if(!this.active){
				this.tools.setTool(this.tools.tools.select, true);
				this.showInfoToolTip(0, true);
				console.warn("not tilelayer selected!!!")
				return;
			}

			this.adjustSettings(this.active.data);
			this.panel.content.clear();

			this.update();

			this.panel.show();
			if(this.activePanel){
				this.activePanel.hide();
				this.activePanel.show();
			}

			//this.tools.map.handlemousemove = this.tools.mousemove;
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
			this.panel.content.clear();
			this.restore();
			if(this.tools.activeTool == this && this.oldSettings.activeTool && this.tools.activeTool != this.oldSettings.activeTool){
				this.tools.setTool(this.oldSettings.activeTool, true);
			}
			else{
				this.tools.setTool(this.tools.tools.select, true);
			}
		},

		deactivate: function(){
			this.restore();
		},

		select: function(obj){
			this._select(obj);
		},
		_select: function(obj){
			if(obj.type != MT.objectTypes.TILE_LAYER){
				this.restore();
				return;
			}
			this.active = this.tools.map.getById(obj.id);
			if(this.tools.map.activeObject != this.active){
				this.restore();
				return;
			}

			this.tools.setTool(this);
			if(!this.active){
				return;
			}


			this.panel.show();
			this.update();
		},

		activeImage: null,
		update: function(){
			var images = this.tools.project.plugins.assetmanager.list;
			if(this.active){
				this.createPanels(images);
				if(!this.active.data.lastImage){
					if(this.active.data.images && this.active.data.images.length){
						this.active.data.lastImage = this.active.data.images[0];
					}
				}

				if(this.active.data.lastImage){
					if(this.active.data.images && this.active.data.images.length){
						var p = this.panels[this.active.data.lastImage];
						if(p){
							this.activePanel = p;
							this.activePanel.show();
						}
					}
				}
			}
			if(this.activePanel){
				this.drawImage(this.activePanel);
			}
		},


		updateLayer: function(mo){

			//this.active = mo;
			var obj = mo.object;
			var data = mo.data;

			if(!data.images || data.images.length == 0){
				return;
			}
			var map = obj.map;
			var nextId = 0;
			var tilesetImage = null;

			var images = this.tools.project.plugins.assetmanager.list;
			var image = null;

			for(var i=0; i<data.images.length; i++){
				image = images[data.images[i]];
				if(!image){
					data.images.splice(i, 1);
					i--;
					continue;
				}
				//addTilesetImage(tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) ??? {Phaser.Tileset}
				tilesetImage = map.addTilesetImage(image.id, image.id, image.frameWidth, image.frameHeight, image.margin, image.spacing, nextId);
				nextId += tilesetImage.total;
			}

			var tiles = data.tiles;
			for(var y in tiles){
				for(var x in tiles[y]){
					if(tiles[y][x] >= map.tiles.length){
						delete tiles[y][x];
						console.warn("tile out of range: ", tiles[y][x]);
						continue;
					}

					obj.map.putTile(tiles[y][x], x, y, obj);
				}
			}
			// is it right place for this?
			if(data.alpha != void(0)){
				obj.alpha = data.alpha;
			}
		}
	}
);
