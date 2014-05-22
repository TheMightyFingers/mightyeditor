(function(global){
	"use strict";
	var data = null;
	
	if(global.mt && global.mt.data){
		data = global.mt.data;
	}
	
	global.mt = {
		
		TEXT: 2,

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
		
		preload: function(game){
			this.game = game;
			this.game.load.crossOrigin = "anonymous";
			
			this._loadAssets(this.data.assets.contents, this.assets, "");
		},
	
		create: function(){
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
			
			if(asset.width != asset.frameWidth || asset.height != asset.frameHeight){
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
		
		_loadObjects: function(data, container, path, group){
			group = group || this.game.world;
			path = path !== "" ? "." + path : path;
			
			for(var i = data.length - 1; i > -1; i--){
				this._add(data[i], container, path, group);
			}
			
		},
		
		_add: function(object, container, path, group){
			
			if(object.contents){
				var tmpGroup = this._addGroup(object, container);
				group.add(tmpGroup);
				
				if(!container[object.name]){
					container[object.name] = {
						get self(){
							return tmpGroup
						}
					};
				}
				
				this._loadObjects(object.contents, container[object.name], path + object.name, tmpGroup );
			}
			else{
				if(object.type == this.TEXT){
					this._addText(object, container, group);
				}
				else{
					this._addObject(object, container, group);
				}
			}
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
			group = group || this.game.world;
			var t = this.game.add.text(object.x, object.y, object.name, object.style);
			group.add(t);
			
			this.getFontFamily(object.style.font);
			
			Object.defineProperty(container, object.name, {
				get : function(){ 
					return t;
				},
				enumerable: true
			});
			
			return t;
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
			
			
			if(object.angle){
				sp.angle = object.angle;
			}
			
			sp.anchor.x = object.anchorX;
			sp.anchor.y = object.anchorY;
			
			
			sp.x = object.x;
			sp.y = object.y;
			sp.scale.x = object.scaleX;
			sp.scale.y = object.scaleY;
			
			
			Object.defineProperty(container, object.name, {
				get : function(){ 
					return sp;
				},
				enumerable: true
			});
			
			
			return sp;
		},
		_fontsToLoad: 0,
		getFontFamily: function(font){
			var sp = document.createElement("span");
			sp.style.font = font;
			var fontFamily = sp.style.fontFamily.replace(/'/gi, '');
			
			if(this.isKnownFontFamily(fontFamily)){
				return;
			}
			var that = this;
			this._fontsToLoad++;
			this.loadFont(fontFamily, function(){
				that._fontsToLoad--;
				
				if(that._fontsToLoad == 0){
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
			
			var sp = document.createElement("span");
			//sp.style.position = "absolute";
			//sp.style.top = sp.style.left = 0;
			
			sp.style.fontFamily = font;
			sp.innerHTML = "ignore moi";
			sp.style.visibility = "hidden";
			document.body.appendChild(sp);
			
			link.onload = function(e){
				
				window.setTimeout(function(){
					document.body.removeChild(sp);
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
