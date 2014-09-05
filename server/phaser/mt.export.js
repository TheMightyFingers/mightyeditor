/*
 * License: MIT http://opensource.org/licenses/MIT
 */
(function(global){
	"use strict";
	var data = null;
	
	if(global.mt && global.mt.data){
		data = global.mt.data;
	}
	
	global.mt = {
		
		SPRITE: 0,
		GROUP: 1,
		TEXT: 2,
		TILE_LAYER: 3,
		
		knownFonts: [
			"Arial",
			"Comic Sans MS",
			"Courier New",
			"Georgia",
			"Impact",
			"Times New Roman",
			"Trebuchet MS",
			"Verdana"
		],
 
		assets: {},
		objects: {},
	
		assetsPath: "assets",
		game: null,
	
		data: data,
		
		autoLoadFonts: true,
 
		preload: function(game){
			this.game = game;
			this.game.load.crossOrigin = "anonymous";
			this.game.load.script("hacks","phaserHacks.js");
			
			this._loadAssets(this.data.assets.contents, this.assets, "");
			if(this.data.map.backgroundColor){
				var tmp = this.data.map.backgroundColor.substring(1);
				var bg = parseInt(tmp, 16);
				
				if(this.game.stage.backgroundColor != bg){
					this.game.stage.setBackgroundColor(bg);
				}
			}
		},
	
		createAll: function(){
			this._loadObjects(this.data.objects.contents, this.objects, "");
		},
		
		getAssetPath: function(asset){
			return this.assetsPath + asset.fullPath;
		},
	
		_loadAssets: function(data, container, path){
			path = path !== "" ? path+"." : path;
			
			var asset = null;
			
			for(var i = 0, l = data.length; i<l; i++){
				asset = data[i];
				if(asset.contents && asset.contents.length){
					if(container[asset.name] === void(0)){
						container[asset.name] = {};
					}
					this._loadAssets(asset.contents, container[asset.name], path + asset.name);
				}
				else{
					this._addAsset(asset, container, path);
				}
			}
		},
	
		_addAsset: function(asset, container, path){
			var that = this;
			if(!asset.key){
				return;
			}
			if(asset.atlas){
				this.game.load.atlas(asset.key, this.assetsPath + asset.fullPath, this.assetsPath + "/" + asset.atlas);
			}
			else if(asset.width != asset.frameWidth || asset.height != asset.frameHeight){
				this.game.load.spritesheet(asset.key, this.assetsPath + asset.fullPath, asset.frameWidth, asset.frameHeight, asset.frameMax, asset.margin, asset.spacing);
			}
			else{
				this.game.load.image(asset.key, this.assetsPath + asset.fullPath);
			}
			
			
			Object.defineProperty(container, asset.name, {
				get : function(){ 
					return asset;
				},
				enumerable: true
			});
			
		},
		
		getAssetById: function(id, container){
			container = container || this.data.assets.contents;
			var ret = null;
			
			for(var i in container){
				if(container[i].id == id){
					return container[i];
				}
				if(container[i].contents){
					ret = this.getAssetById(id, container[i].contents);
					if(ret){
						return ret;
					}
				}
			}
			
			return ret;
		},
 
		_loadObjects: function(data, container, path, group){
			group = group || this.game.world;
			path = path !== "" ? "." + path : path;
			
			for(var i = data.length - 1; i > -1; i--){
				this._add(data[i], container, path, group);
			}
			
		},
		
		_add: function(object, container, path, group){
			var createdObject = null;
			
			if(object.contents){
				createdObject = this._addGroup(object, container);
				group.add(createdObject);
				
				if(!container[object.name]){
					container[object.name] = {
						get self(){
							return createdObject
						}
					};
				}
				
				this._loadObjects(object.contents, container[object.name], path + object.name, createdObject);
			}
			else{
				
				if(object.type == this.TEXT){
					createdObject = this._addText(object, container, group);
				}
				else if(object.type == this.TILE_LAYER){
					createdObject = this._addTileLayer(object, container, group);
				}
				else{
					createdObject = this._addObject(object, container, group);
				}
			}
			
			this._updateCommonProperties(object, createdObject);
		},
		
		_addGroup: function(object){
			var group = this.game.add.group();

			group.x = object.x;
			group.y = object.y;
			group.fixedToCamera = !!object.fixedToCamera;
			
			group.name = object.name;
			
			if(object.angle){
				group.angle = object.angle;
			}
			
			return group;
		},
		
		_addText: function(object, container, group){
			this.getFontFamily(object.style.font);
			
			group = group || this.game.world;
			var t = this.game.add.text(object.x, object.y, object.name, object.style);
			group.add(t);
			
			
			
			if(container.hasOwnProperty(object.name)){
				console.warn("dublicate object name - ", object.name);
			}
			else{
			
				Object.defineProperty(container, object.name, {
					get : function(){ 
						return t;
					},
					enumerable: true
				});
			}
			
			return t;
		},
		
		_addTileLayer: function(object, container, group){
			group = group || this.game.world;
			var map = this.game.add.tilemap(null, object.tileWidth, object.tileHeight, object.widthInTiles, object.heightInTiles);
			
			var tl = map.createBlankLayer(object.name, object.widthInTiles, object.heightInTiles, object.tileWidth, object.tileHeight);
			
			var nextId = 0;
			var im = null;
			var asset = "";
			for(var i=0; i<object.images.length; i++){
				asset = this.getAssetById(object.images[i]);
				
				if(asset){
					im = map.addTilesetImage(asset.key, asset.key, asset.frameWidth, asset.frameHeight, asset.margin, asset.spacing, nextId);
					nextId += im.total;
				}
				else{
					console.warn("cannot find image", object.images[i]);
				}
			}
			
			var tiles = object.tiles;
			for(var y in tiles){
				for(var x in tiles[y]){
					map.putTile(tiles[y][x], x, y, tl);
				}
			}
			
			
			if(container.hasOwnProperty(object.name)){
				console.warn("dublicate object name - ", object.name);
			}
			else{
			
				Object.defineProperty(container, object.name, {
					get : function(){ 
						return tl;
					},
					enumerable: true
				});
			}
			
			return tl;
		},
		
		_addObject: function(object, container, group){
			
			var sp = null;
			group = group || this.game.world;
			
			sp = group.create(object.x, object.y, object.assetKey);
			
			var frameData = this.game.cache.getFrameData(object.assetKey);
			
			if(frameData){
				var arr = [];
				for(var i=0; i<frameData.total; i++){
					arr.push(i);
				}
				sp.animations.add("default", arr, (object.fps !== void(0) ? object.fps : 10) , false);
				sp.frame = object.frame;
			}
			
			if(container.hasOwnProperty(object.name)){
				console.warn("dublicate object name - ", object.name);
			}
			else{
				Object.defineProperty(container, object.name, {
					get : function(){ 
						return sp;
					},
					enumerable: true
				});
			}
			
			return sp;
		},
 
		_updateCommonProperties: function(template, object){
			
			
			if(template.angle){
				object.angle = template.angle;
			}
			
			if(template.type !== mt.GROUP && template.contents === void(0) ){
				object.anchor.x = template.anchorX;
				object.anchor.y = template.anchorY;
				object.scale.x = template.scaleX;
				object.scale.y = template.scaleY;
			}
			
			object.x = template.x;
			object.y = template.y;
			
			object.fixedToCamera = template.isFixedToCamera;
		},
 
		_fontsToLoad: 0,
		getFontFamily: function(font){
			if(!this.autoLoadFonts){
				return;
			}
			var span = document.createElement("span");
			span.style.font = font;
			
			var fontFamily = span.style.fontFamily.replace(/'/gi, '');
			
			if(this.isKnownFontFamily(fontFamily)){
				return;
			}
			var that = this;
			this._fontsToLoad++;
			this.loadFont(fontFamily, function(){
				that._fontsToLoad--;
				
				if(that._fontsToLoad == 0){
					//clean up height cache
					PIXI.Text.heightCache = {};
					that.markDirty();
				}
			});
			return;
		},
		
		//mark all texts dirty to force redraw
		markDirty: function(group){
			group = group || game.world.children;
			
			var child = null;
			for(var i=0; i<group.length; i++){
				child = group[i];
				
				if(child.type == Phaser.TEXT){
					child.dirty = true;
					continue;
				}
				
				if(child.type == Phaser.GROUP){
					this.markDirty(child.children);
				}
			}
		},
 
		isKnownFontFamily: function(font){
			
			for(var i=0; i<this.knownFonts.length; i++){
				if(this.knownFonts[i] == font){
					return true
				}
			}
			
			return false;
		},
		loadFont: function(font, cb){
			// <link href='http://fonts.googleapis.com/css?family=Faster+One' rel='stylesheet' type='text/css'>
			
			var fontUrl = font.replace(/ /gi, "+");
			var link = document.createElement("link");
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("type", "text/css");
			
			var span = document.createElement("span");
			span.style.position = "absolute";
			span.style.top = span.style.left = 0;
			span.style.zIndex = -1;
			
			span.style.fontFamily = font;
			span.innerHTML = "ignore moi";
			span.style.visibility = "hidden";
			document.body.appendChild(span);
			
			link.onload = function(e){
				
				window.setTimeout(function(){
					document.body.removeChild(span);
				}, 1000);
				window.setTimeout(function(){
					cb(font);
				}, 300);
			};
			
			link.href="//fonts.googleapis.com/css?family="+fontUrl;
			
			document.head.appendChild(link);
		}
	};

})(typeof window == "undefined" ? global : window);
