"use strict";
MT.requireFile("js/phaser.js", function(){
	MT.requireFile("js/phaserHacks.js");
	
});
MT.require("core.Helper");
MT.require("core.Selector");

MT.MAP_OBECTS_ADDED = "MAP_OBECTS_ADDED";
MT.SYNC = "SYNC";


MT.plugins.MapEditor = MT.extend("core.Emitter").extend("core.BasicPlugin")(
	function(project){
		MT.core.BasicPlugin.call(this, "map");
		
		this.project = project;
		
		this.assets = [];
		
		this.objects = [];
		this.tmpObjects = [];
		this.oldObjects = [];
		
		this.groups = [];
		this.oldGroups = [];
		
		this.tileLayers = [];
		
		this.dist = {};
		
		this.selection = new Phaser.Rectangle();
		
		this.selector = new MT.core.Selector();
		
		this.helperBoxSize = 6;
		
		
		this.settings = {
			cameraX: 0,
			cameraY: 0,
			gridX: 64,
			gridY: 64,
			
			gridOffsetX: 0,
			gridOffsetY: 0,
			
			showGrid: 1,
			backgroundColor: "#111111"
		};
		
		
		this.zoom = 1;
		
		window.map = this;
	},
	{
		_mousedown: false,
		
		getTileMap: function(obj){
			console.log("tilemap?");
			var tileWidth = obj.tileWidth || 64;
			var tileHeight = obj.tileHeight || 64;
			return this.game.add.tilemap(null, tileWidth, tileHeight, obj.widthInTiles, obj.heightInTiles);
		},
		
		addTileLayer: function(obj){
			console.log("tilemap");
			var tilemap = this.getTileMap(obj);
			
			var tl = tilemap.createBlankLayer(obj.name, obj.widthInTiles, obj.heightInTiles, obj.tileWidth, obj.tileHeight);
			tl.fixedToCamera = obj.isFixedToCamera;
			return tl;
		},
		
		updateTileMap: function(obj, oldLayer){
			oldLayer.destroy();
			
			return this.addTileLayer(obj);
		},
		
		setZoom: function(zoom){
			this.zoom = 1/zoom;
			this.resize();
			
		},
		
		/* basic pluginf fns */
		initUI: function(ui){
			this.ui = ui;
			
			var that = this;
			
			this.panel = ui.createPanel("Map editor");
			ui.setCenter(this.panel);
			
			this.project.ui.on(ui.events.RESIZE,function(){
				that.resize();
			});
			
			this.selector.on("unselect", function(obj){
				that.emit(MT.OBJECT_UNSELECTED, obj);
			});
			
			this.createMap();
			
			var tools = this.project.plugins.tools;
			var om = this.project.plugins.objectmanager;
			
			ui.events.on(ui.events.MOUSEDOWN, function(e){
				if(e.target != game.canvas){
					return;
				}
				that.handleMouseDown(e);
			});
			
			window.oncontextmenu = function(e){
				if(e.target == that.game.canvas){
					e.preventDefault();
				}
			};
			
			this.isCtrlDown = false;
			
			ui.events.on(ui.events.MOUSEUP, function(e){
				that.handleMouseUp(e);
			});
			
			
			var dx = 0;
			var dy = 0;
			ui.events.on(ui.events.MOUSEMOVE, function(e){
				if(e.target !== that.game.canvas){
					return;
				}
				
				//strange chrome bug
				if(that.handleMouseMove === void(0)){
					console.log("chrome bugging");
					return;
				}
				
				that.handleMouseMove(e);
			});
			
			
			ui.events.on(ui.events.KEYDOWN, function(e){
				var w = e.which;
				
				if(e.ctrlKey){
					that.isCtrlDown = true;
				}
				
				if( (e.target != game.canvas && e.target != document.body) ){
					return;
				}
				
				//escape
				if(w == MT.keys.ESC){
					that.activeObject = null;
					that.selector.clear();
					return;
				}
				
				
				that.selector.forEach(function(obj){
					that.moveByKey(e, obj);
				});
			});
			
			ui.events.on(ui.events.KEYUP, function(e){
				that.isCtrlDown = false;
				om.sync();
			});
			
		},
		
		installUI: function(){
			var that = this;
			
			this.tools = this.project.plugins.tools;
			
			this.project.plugins.assetmanager.on(MT.ASSETS_UPDATED, function(data){
				that.addAssets(data);
			});
			
			this.project.plugins.objectmanager.on(MT.OBJECTS_UPDATED, function(data){
				that.addObjects(data);
			});
			
			this.tools.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				if(that.activeObject){
					that.activeObject.frame = frame;
					that.sync();
				}
			});
			
		},
	
		createMap: function(){
			
			if(this.game){
				this.game.canvas.parentNode.removeChild(this.game.canvas);
				this.game.destroy();
			}
			
			var that = this;
			this.activeObject = null;
			
			var ctx = null;
			var drawObjects = function(obj){
				that.highlightObject(ctx, obj);
			};
			
			var game = this.game = window.game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { 
				preload: function(){
					game.stage.disableVisibilityChange = true;
					var c = game.canvas;
					c.parentNode.removeChild(c);
					that.panel.content.el.appendChild(c);
					c.style.position = "relative";
					that.panel.content.style.overflow = "hidden";
					
				},
				create: function(){
					that.resize();
					that.scale = game.camera.scale;
					if(!ctx){
						ctx = game.canvas.getContext("2d");
					}
					
					that.setCameraBounds();
					that.postUpdateSetting();
					
					that.game.plugins.add({
						postUpdate: function(){
							for(var i=0; i<that.tileLayers.length; i++){
								var layer = that.tileLayers[i];
								if(layer.fixedToCamera){
									continue;
								}
								if(layer._mc.x || layer._mc.y){
									layer._ox = layer._mc.x;
									layer._oy = layer._mc.y;
									layer.x += layer._mc.x;
									layer.y += layer._mc.y;
								}
								
							}
							
						},
						postRender: function(){
							
							for(var i=0; i<that.tileLayers.length; i++){
								var layer = that.tileLayers[i];
								if(layer.fixedToCamera){
									continue;
								}
								if(layer._ox !== void(0)){
									layer.x -= layer._ox;
									layer._ox = void(0);
								}
								if(layer._oy !== void(0)){
									layer.y -= layer._oy;
									layer._oy = void(0);
								}
								
							}
						}
						
					});
				},
				
				
				render: function(){
					
					that.drawGrid(ctx);
					
					that.selector.forEach(drawObjects);
					
					that.drawSelection(ctx);
					
					that.highlightDublicates(ctx);
					
				}
			});
			
			
		},
		
		
		resize: function(){
			if(!this.game || !this.game.world){
				return;
			}
			
			this.game.width = this.panel.content.el.offsetWidth;
			this.game.height = this.panel.content.el.offsetHeight;
			
			this.game.renderer.resize(this.game.width, this.game.height);
			
			this.setCameraBounds();
			
		},
		
		setCameraBounds: function(){
			
			this.game.camera.bounds.x = -Infinity;
			this.game.camera.bounds.y = -Infinity;
			this.game.camera.bounds.width = Infinity;
			this.game.camera.bounds.height = Infinity;
			
			
			//this.game.canvas.style.width = "100%";
			//this.game.canvas.style.height = "100%";
			
			this.game.camera.view.width = this.game.canvas.width/this.game.camera.scale.x;
			this.game.camera.view.height = this.game.canvas.height/this.game.camera.scale.y;
			
		},
		
		updateSettings: function(obj){
			if(!obj){
				return;
			}
			
			for(var i in obj){
				this.settings[i] = obj[i];
			}
			
			if(!this.game.isBooted || !this.game.width){
				return;
			}
			
			this.postUpdateSetting();
		},
		
		postUpdateSetting: function(){
			
			
			this.game.width = this.settings.worldWidth;
			this.game.height = this.settings.worldHeight;
			
			//this.game.world.setBounds(0, 0, obj.worldWidth, obj.worldHeight);
			
			
			this.setCameraBounds();
			
			
			this.game.camera.x = this.settings.cameraX;
			this.game.camera.y = this.settings.cameraY;
			
			var tmp = this.settings.backgroundColor.substring(1);
			var bg = parseInt(tmp, 16);
			
			if(this.game.stage.backgroundColor != bg){
				this.game.stage.setBackgroundColor(bg);
			}
		},
		
		/* drawing fns */
		drawGrid: function(ctx){
			if(!this.settings.showGrid){
				return;
			}
			
			var alpha = ctx.globalAlpha;
			
			var g = 0;
			var game = this.game;
			
			
			ctx.save();
			
			ctx.scale(this.game.camera.scale.x, this.game.camera.scale.y);
			
			ctx.beginPath();
			
			var bg = game.stage.backgroundColor;
			var inv = parseInt("FFFFFF", 16);
			var xx = (inv - bg).toString(16);
			while(xx.length < 6){
				xx = "0"+xx;
			}
			
			if(parseInt(xx, 16) - bg < 10){
				xx = "#000000";
			}
			
			ctx.strokeStyle = "#"+xx;
			
			//ctx.strokeStyle = "rgba(255,255,255,0.1)";
			
			var offx = this.settings.gridOffsetX % this.settings.gridX - this.settings.gridX;
			var offy = this.settings.gridOffsetY % this.settings.gridY - this.settings.gridY;
			
			var ox = game.camera.x/this.scale.x % this.settings.gridX - offx;
			var oy = game.camera.y/this.scale.y % this.settings.gridY - offy;
			
			var width = game.canvas.width/game.camera.scale.x - offx;
			var height = game.canvas.height/game.camera.scale.y - offy;
			
			
			
			g = this.settings.gridX;
			
			ctx.lineWidth = 0.2;
			ctx.globalAlpha = 1;
			
			ctx.shadowColor = '#000';
			ctx.shadowBlur = 0;
			ctx.shadowOffsetX = 0.5;
			ctx.shadowOffsetY = 0;
			
			
			ctx.beginPath();
			for(var i = -ox; i<width; i += g){
				if(i < 0){
					continue;
				}
				ctx.moveTo(i+0.5, 0.5);
				ctx.lineTo(i+0.5, height+0.5);
			}
			ctx.stroke();
			
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0.5;
			
			ctx.beginPath();
			g = this.settings.gridY;
			for(var j = -oy; j<height; j += g){
				if(j < 0){
					continue;
				}
				ctx.moveTo(0.5, j+0.5);
				ctx.lineTo(width+0.5, j+0.5);
			}
			ctx.stroke();
			
			ctx.lineWidth = 0.5;
			ctx.globalAlpha = 1;
			
			
			// highlight x = 0; y = 0;
			
			ctx.beginPath();
			
			ctx.moveTo(0, -game.camera.y/this.scale.y);
			ctx.lineTo(width, -game.camera.y/this.scale.y);
			
			ctx.moveTo(-game.camera.x/this.scale.x, 0);
			ctx.lineTo(-game.camera.x/this.scale.x, height);
			
			
			ctx.stroke();
			
			
			
			
			ctx.globalAlpha = alpha;
			ctx.restore();
		},
		
		highlightObject: function(ctx, obj){
			
			if(!obj){
				return;
			}
			
			if(!obj.game || !obj.parent){
				obj = this.getById(obj.MT_OBJECT.id);
				if(!obj){
					return;
				}
			}
			
			if(!this.isVisible(obj)){
				return;
			}
			
			
			var alpha = ctx.globalAlpha;
			
			var bounds = obj.getBounds();
			var group = null;
			
			if(obj.MT_OBJECT.contents){
				group = obj;
			}
			else{
				group = obj.parent || game.world;
			}
			
			var x = this.getObjectOffsetX(group);
			var y = this.getObjectOffsetY(group);
			
			
			ctx.save();
			
			ctx.translate(0.5,0.5);
			
			if(this.activeObject == obj){
				ctx.strokeStyle = "rgb(255,0,0)";
				ctx.lineWidth = 1;
				
				
				var off = this.helperBoxSize;
				var sx = bounds.x-off*0.5 | 0;
				var dx = sx + bounds.width | 0;
				
				var sy = bounds.y-off*0.5 | 0;
				var dy = sy + bounds.height | 0;
					
				if(obj.MT_OBJECT.type == MT.objectTypes.TEXT){
					var width = bounds.width;
					if(obj.wordWrap){
						width = obj.wordWrapWidth*this.game.camera.scale.x | 0;
						
						ctx.strokeRect(bounds.x - off | 0, sy + bounds.height*0.5 | 0, off, off);
						ctx.strokeRect(bounds.x + width | 0, sy + bounds.height*0.5 | 0, off, off);
						
					}
					
					ctx.strokeRect(bounds.x | 0, bounds.y | 0, width | 0, bounds.height | 0);
				}
				else{
					if(obj.type != Phaser.GROUP){
						ctx.strokeRect(sx, sy, off, off);
						ctx.strokeRect(sx, dy, off, off);
						ctx.strokeRect(dx, sy, off, off);
						ctx.strokeRect(dx, dy, off, off);
						ctx.beginPath();
						ctx.moveTo(sx + off, bounds.y);
						ctx.lineTo(dx, bounds.y);
						
						ctx.moveTo(sx + off, bounds.y + bounds.height);
						ctx.lineTo(dx, bounds.y + bounds.height);
						
						ctx.moveTo(bounds.x, sy + off);
						ctx.lineTo(bounds.x, dy);
						
						ctx.moveTo(bounds.x + bounds.width, sy + off);
						ctx.lineTo(bounds.x + bounds.width, dy);
						
						
						ctx.stroke();
						
					}
					else{
						ctx.strokeRect(bounds.x | 0, bounds.y | 0, bounds.width | 0, bounds.height | 0);
					}
					
					
				
				}
			}
			else{
				ctx.strokeStyle = "rgb(255,100,0)";
				ctx.strokeRect(bounds.x | 0, bounds.y | 0, bounds.width, bounds.height);
			}
			
			
			
			
			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = 1;
			
			
			
			var par = group.parent;
			var oo = [];
			while(par){
				oo.push({x: par.x, y: par.y, r: par.rotation});
				par = par.parent;
			}
			
			while(oo.length){
				var p = oo.pop();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.r);
				ctx.translate(-p.x, -p.y);
			}
			
			ctx.translate(x, y);
			ctx.rotate(group.rotation);
			ctx.translate(-x, -y);
			
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x, y - 16);
			ctx.stroke();
			ctx.strokeRect(x - 4, y - 4, 8, 8);

			
			ctx.globalAlpha = alpha;
			ctx.restore();
		},
		
		
		drawSelection: function(ctx){
			
			if(this.selection.empty){
				return;
			}
			
			ctx.save();
			
			ctx.strokeStyle = "rgba(0,70, 150, 0.8)";
			ctx.fillStyle = "rgba(0,70, 150, 0.2)";
			
			ctx.strokeRect(this.selection.x - this.game.camera.x, this.selection.y - this.game.camera.y, this.selection.width, this.selection.height);
			ctx.fillRect(this.selection.x - this.game.camera.x, this.selection.y - this.game.camera.y, this.selection.width, this.selection.height);
			
			ctx.restore();
			
		},
		
		highlightDublicates: function(ctx){
			if(!this.isCtrlDown){
				return;
			}
			var o1 = null;
			var o2 = null;
			var bounds = null;
			ctx.save();
			ctx.fillStyle = "rgba(150, 70, 20, 0.2)";
			for(var j=0; j<this.objects.length; j++){
				o1 = this.objects[j];
				if(!this.isVisible(o1)){
					continue;
				}
				for(var i=0; i<this.objects.length; i++){
					o2 = this.objects[i];
					if(o1 == o2){
						continue;
					}
					if(o1.x == o2.x && o1.y == o2.y && o1.MT_OBJECT.assetId == o2.MT_OBJECT.assetId && o1.width == o2.width){
						bounds = o1.getBounds();
						ctx.fillRect(bounds.x | 0, bounds.y | 0, bounds.width | 0, bounds.height | 0);
					}
				}
			}
			ctx.restore();
		},
		
		
		/* assets n objects */
		isAssetsAdded: false,
		assetsTimeout: 0,
		addAssets: function(assets, inDepth){
			if(!this.game.isBooted || !this.game.width){
				var that = this;
				window.clearTimeout(this.assetsTimeout);
				this.assetsTimeout = window.setTimeout(function(){
					that.addAssets(assets);
				}, 100);
				return;
			}
			
			window.clearTimeout(this.assetsTimeout);
			
			var game = this.game;
			var that = this;
			var asset = null;
			if(!inDepth){
				this.isAssetsAdded = !assets.length;
			}
			for(var i=0; i<assets.length; i++){
				this.addAsset(assets[i], function(){
					that.assetsToLoad--;
					if(that.assetsToLoad == 0){
						that.isAssetsAdded = true;
						that.reloadObjects();
					}
				});
			}
		},
		
		assetsToLoad: 0,
		addAsset: function(asset, cb){
			this.assetsToLoad++;
			if(asset.contents){
				this.addAssets(asset.contents, true);
				if(typeof cb == "function"){
					window.setTimeout(cb, 0);
				}
				return;
			}
			
			var game = this.game;
			var path = this.project.path + "/" + asset.__image;
			if(!MT.core.Helper.isImage(path)){
				if(typeof cb === "function"){
					cb();
				}
				return;
			}
			
			var that = this;
			
			
			if(asset.atlas){
				var ext = asset.atlas.split(".").pop().toLowerCase();
				
				this.ajax(that.project.path + "/" + asset.atlas+"?"+Date.now(), function(dataString){
					console.log("ajax cb");
					var data = null;
					var type = Phaser.Loader.TEXTURE_ATLAS_XML_STARLING;
					/*
					 * Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY
					 * Phaser.Loader.TEXTURE_ATLAS_JSON_HASH
					 */
					if(ext == "json"){
						data = that.parseJSON(dataString);
						console.log(data);
						if(Array.isArray(data.frames)){
							type = Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY;
						}
						else{
							type = Phaser.Loader.TEXTURE_ATLAS_JSON_HASH;
						}
						
					}
					else{
						data = that.parseXML(dataString);
					}
					
					if(!data){
						console.error("failed to parse atlas");
					}
					else{
						that.loadImage(path + "?" + Date.now(), function(){
							that.game.cache.addTextureAtlas(asset.id, asset.__image, this, data, type);
							that.findAtlasNames(asset.id);
						});
					}
					
						//this.game.cache.addTextureAtlas(file.key, file.url, file.data, file.atlasData, file.format);
					
					
				});
				
				//game.cache.addTextureAtlas(asset.id, asset.__image, this);
				//game.load.onLoadComplete.addOnce(cb);
				
				//var i=0;
				//var fn;
				
				/*
				game.load.onFileComplete.add(fn = function(a, key){
					if(key !== asset.id){
						console.log("skipping key", key);
						return;
					}
					
					i++;
					that.findAtlasNames(asset.id);
					cb();
					game.load.onFileComplete.remove(fn);
				});
				
				if(asset.atlas.split(".").pop() == "xml"){
					game.load.atlasXML(asset.id, path+"?"+Date.now(), that.project.path + "/" + asset.atlas+"?"+Date.now());
				}
				else{
					game.load.atlas(asset.id, path+"?"+Date.now(), that.project.path + "/" + asset.atlas+"?"+Date.now() );
				}
				
				game.load.start();
				return;
				*/
			}
			
			this.loadImage(path + "?" + Date.now(), function(){
				if(asset.width != asset.frameWidth || asset.width != asset.frameHeight){
					that.game.cache.addSpriteSheet(asset.id, asset.__image, this, asset.frameWidth, asset.frameHeight, asset.frameMax, asset.margin, asset.spacing);
				}
				else{
					that.game.cache.addImage(asset.id, asset.__image, this);
				}
				cb();
			});
			
		},
		// from Phaser source
		parseXML: function(data){
			var xml;
			try {
				if (window['DOMParser']) {
					
					var domparser = new DOMParser();
					xml = domparser.parseFromString(data, "text/xml");
				}
				else {
					xml = new ActiveXObject("Microsoft.XMLDOM");
					xml.async = 'false';
					xml.loadXML(data);
				}
			}
			catch (e) {
				xml = void(0);
			}

			if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length){
				throw new Error("Phaser.Loader. Invalid Texture Atlas XML given");
			}
			
			return xml;
		},
		
		parseJSON: function(data){
			var json = null;
			try{
				json = JSON.parse(data);
			}
			catch(e){
				console.error(e);
				json = null;
			}
			
			return json;
		},
		
		ajax: function(src, cb){
			var xhr = new XMLHttpRequest();
			xhr.open('get', src);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4){
					console.log(xhr);
					//var text = xhr.responseText;
					cb(xhr.responseText);
				}
			};
			xhr.onerror = function(){
				console.error("couldn't load asset", path);
				cb();
			};
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.send(null); 
		},
		
		loadImage: function(src, cb){
			var image = new Image();
			image.onload = cb;
			image.onerror = function(){
				console.error("couldn't load asset", path);
				cb();
			};
			image.src = src;
		},
		
		
		atlasNames: {},
		
		findAtlasNames: function(id){
			if(!this.game.cache._images[id] || !this.game.cache._images[id].frameData){
				console.error("Failed to parse atlas");
				return;
			}
			
			var frameData = this.game.cache._images[id].frameData;
			var names = Object.keys(frameData._frameNames);
			
			
			var name = "";
			var possibleNames = {};
			var shortName = "";
			var frame = 0;
			var lastName = "";
			
			
			
			for(var i=0; i<names.length; i++){
				name = names[i] || "unnamed";
				
				shortName = name.substring(0, name.indexOf(0));
				if(!shortName){
					shortName = name;
				}
				
				
				if(possibleNames[shortName] === void(0)){
					possibleNames[shortName] = {
						start: frame,
						end: frame
					};
				}
				
				if(lastName && lastName != shortName){
					possibleNames[lastName].end = frame;
				}
				
				lastName = shortName;
				
				frame++;
			}
			if(names.length == 0){
				possibleNames["unnamed"] = {
						start: 0,
						end: 0
					};
			}
			else{
				possibleNames[lastName].end = frame;
				
			}
			
			possibleNames["all_frames"] = {
					start: 0,
					end: frameData._frames.length
			};
			this.atlasNames[id] = possibleNames;
			this.project.plugins.assetmanager.selectActiveAsset();
			
			this.atlasNames[id] = possibleNames;
			this.project.plugins.assetmanager.selectActiveAsset();
		},
		
		cleanImage: function(id){
			console.log("clean images");
			this.game.cache.removeImage(id);
		},
		
		checkId: function(){
			var o = null;
			for(var i=0; i<this.objects.length; i++){
				o = this.objects[i];
				for(var j=0; j<this.objects.length; j++){
					if(o == this.objects[j]){
						continue;
					}
					if(o.MT_OBJECT.id == this.objects[j].MT_OBJECT.id){
						console.error("dublicate id");
					}
				}
			}
			
			
		},
		
		_addTimeout: 0,
		addObjects: function(objs, group){
			this.addedObjects = objs;
			
			group = group || game.world;
			if(!this.isAssetsAdded){
				var that = this;
				if(this._addTimeout){
					window.clearTimeout(this._addTimeout);
					this._addTimeout = 0;
				}
				
				this._addTimeout = window.setTimeout(function(){
					that.addObjects(objs);
					this._addTimeout = 0;
				}, 100);
				return;
			}
			
			this.oldObjects.length = 0;
			this.oldObjects = this.objects.slice(0);
			
			this.tileLayers.length = 0;
			
			for(var i=0; i<this.groups.length; i++){
				if(this.groups[i].parent){
					this.groups[i].destroy(false);
				}
			}
			
			
			//this.oldGroups.length = 0;
			//this.oldGroups = this.oldGroups.slice(0);
			
			
			this.objects.length = 0;
			this.groups.length = 0;
			
			
			this._addObjects(objs, group);
			
			var remove = true;
			for(var i=0; i<this.oldObjects.length; i++){
				remove = true;
				for(var j=0; j<this.objects.length; j++){
					
					if(this.oldObjects[i].MT_OBJECT.id == this.objects[j].MT_OBJECT.id){
						remove = false;
						break;
					}
				}
				if(remove){
					this._destroyObject(this.oldObjects[i]);
				}
			}
			
			
			
			for(var i=0; i<this.tmpObjects.length; i++){
				this.tmpObjects[i].bringToTop();
			}
			
			this.updateSelected();
			this.emit(MT.MAP_OBECTS_ADDED, this);
			this._addTimeout = 0;
		},
		
		_destroyObject: function(object){
			object.destroy(true);
		},
		
		_addObjects: function(objs, group){
			
			for(var i=objs.length-1; i>-1; i--){
				if(objs[i].contents){
					
					var tmp = this.addGroup(objs[i]);
					group.add(tmp);
					
					this._addObjects(objs[i].contents, tmp);
					continue;
				}
				
				var obj = this.addObject(objs[i], group);
				//obj.bringToTop();
				this.inheritSprite(obj, objs[i]);
				obj.z = i;
			}
		},
		
		addGroup: function(obj){
			
			var group = this.game.add.group();
			group.MT_OBJECT = obj;
			
			this.groups.push(group);
			
			group.x = obj.x;
			group.y = obj.y;
			
			if(obj.angle){
				group.angle = obj.angle;
			}
			
			group.visible = !!obj.isVisible;
			
			group.fixedToCamera = !!obj.isFixedToCamera;
			
			return group;
		},
		
		
		/* TODO: clean up - and seperate object types by corresponding tools*/
		addObject: function(obj, group){
			var oo = null;
			var od = null;
			for(var i=0; i<this.oldObjects.length; i++){
				od = this.oldObjects[i];
				oo = this.oldObjects[i].MT_OBJECT;
				if(!od.parent){
					continue;
				}
					
				if(oo.id == obj.id ){
					// fix this - workaround for older projects
					if(oo.type == void(0)){
						oo.type = MT.objectTypes.SPRITE;
					}
					
					if(oo.type == MT.objectTypes.SPRITE){
						od.loadTexture(oo.assetId, oo.frame);
					}
					
					if(oo.type == MT.objectTypes.TEXT){
						od.text = obj.name;
						od.setStyle(obj.style);
					}
					
					if(oo.type == MT.objectTypes.TILE_LAYER){
						od = this.updateTileMap(obj, od);
						od.MT_OBJECT = obj;
						this.project.plugins.tools.tools.tiletool.updateLayer(od);
						this.tileLayers.push(od);
					}
					
					this.objects.push(od);
					group.add(od);
					
					if(od.bringToTop){
						od.bringToTop();
					}
					else{
						if(od.parent.bringToTop){
							od.parent.bringToTop(od);
						}
					}
					return od;
				}
			}
			
			if(obj.type == MT.objectTypes.TEXT){
				var t = this.addText(obj, group);
				t.MT_OBJECT = obj;
				this.objects.push(t);
				return t;
			}
			
			if(obj.type == MT.objectTypes.TILE_LAYER){
				var t = this.addTileLayer(obj);
				t.MT_OBJECT = obj;
				this.objects.push(t);
				this.project.plugins.tools.tools.tiletool.updateLayer(t);
				this.tileLayers.push(t);
				return t;
			}
			
			var sp = this.createSprite(obj, group);
			this.objects.push(sp);
			
			return sp;
		},
		
		addText: function(obj, group){
			group = group || this.game.world;
			var t = this.game.add.text(obj.x, obj.y, obj.name, obj.style);
			group.add(t);
			
			return t;
		},
		
		createSprite: function(obj, group){
			var game = this.game;
			group = group || game.world;
			
			var sp = null;
			if(!game.cache.getImage(obj.assetId)){
				obj.assetId = "__missing";
			}
			
			
			sp = group.create(obj.x, obj.y, obj.assetId);
			
			this.inheritSprite(sp, obj);
			
			
			var frameData = game.cache.getFrameData(obj.assetId);
			
			if(frameData){
				//sp.animations.add("default");
			}
			
			return sp;
		},
		
		inheritSprite: function(sp, obj){
			
			sp.MT_OBJECT = obj;
			
			sp.anchor.x = obj.anchorX;
			sp.anchor.y = obj.anchorY;
			
			sp.x = obj.x;
			sp.y = obj.y;
			
			sp.angle = obj.angle;
			
			obj._framesCount = 0;
			
			
			if(obj.frame){
				sp.frame = obj.frame;
			}
			
			/*if(obj.width && obj.height && sp.scale.x == obj.scaleX && sp.scale.y == obj.scaleY){
				if(obj.width != sp.width || obj.height != sp.height){
					sp.width = obj.width;
					sp.height = obj.height;
					
					obj.scaleX = sp.scale.x;
					obj.scaleY = sp.scale.y;
				}
			}*/
			
			if(obj.scaleX){
				if(sp.scale.x != obj.scaleX || sp.scale.y != obj.scaleY){
					sp.scale.x = obj.scaleX;
					sp.scale.y = obj.scaleY;
					//obj.width = sp.width;
					//obj.height = sp.height;
				}
			}
			
			
			
			sp.visible = !!obj.isVisible;
			
		},
		
		reloadObjects: function(){
			if(this.addedObjects && !this._addTimeout){
				this.addObjects(this.addedObjects);
			}
		},
		
		_activeObject: null,
		_justSelected: null,
		
		get activeObject(){
			if(!this._activeObject){
				return null;
			}
				
			if(!this._activeObject.game){
				this._activeObject = this.getById(this._activeObject.MT_OBJECT.id);
			}
			
			return this._activeObject;
		},
		
		set activeObject(val){
			this._activeObject = val;
		},
		
		get offsetX(){
			return this.panel.content.calcOffsetX() - this.game.camera.x;
		},
		
		get offsetY(){
			return this.panel.content.calcOffsetY() - this.game.camera.y;
		},
		
		get offsetXCam(){
			return this.panel.content.calcOffsetX() + this.game.camera.x;
		},
		
		get offsetYCam(){
			return this.panel.content.calcOffsetY() + this.game.camera.y;
		},
		
		get ox(){
			return this.panel.content.calcOffsetX();
		},
		
		get oy(){
			return this.panel.content.calcOffsetY();
		},
		
		/* input handling */
		handleMouseDown: function(e){
			if(e.button == 0){
				for(var i in this.dist){
					this.dist[i].x = 0;
					this.dist[i].y = 0;
				}
			}
			this.tools.mouseDown(e);
		},
		
		handleMouseUp: function(e){
			this.tools.mouseUp(e);
		},
		
		emptyFn: function(){},
		 
		_handleMouseMove: function(){
			
		},
		
		
		set handleMouseMove(val){
			this._handleMouseMove = val;
		},
		
		get handleMouseMove(){
			return this._handleMouseMove;
		},
		
		
		_cameraMove: function(e){
			this.game.camera.x -= this.ui.events.mouse.mx;
			this.game.camera.y -= this.ui.events.mouse.my;
			this.settings.cameraX = this.game.camera.x;
			this.settings.cameraY = this.game.camera.y;
			
			this.project.settings.updateScene(this.settings);
			
		},
		
		
		dist: null,
		
		_objectMove: function(e, object){
			
			if(!object){
				var that = this;
				this.selector.forEach(function(obj){
					that._objectMove(e, obj);
				});
				return;
			}
			
			var id = object.MT_OBJECT.id;
			if(!object.world){
				object = this.getById(id);
			}
			
			
			var angle = this.getOffsetAngle(object);
			
			var x = this.ui.events.mouse.mx/this.scale.x;
			var y = this.ui.events.mouse.my/this.scale.y;
			
			if(!this.dist[id]){
				this.dist[id] = {
					x: 0,
					y: 0
				};
			}
			var dist = this.dist[id];
			
			
			if(angle){
				x = this.rpx(angle, -this.ui.events.mouse.mx, -this.ui.events.mouse.my, 0, 0);
				y = this.rpy(angle, -this.ui.events.mouse.mx, -this.ui.events.mouse.my, 0, 0);
			}
			
			if(e.ctrlKey){
				
				dist.x += x;
				dist.y += y;
				
				var mx = Math.round( ( dist.x ) / this.settings.gridX) * this.settings.gridX;
				var my = Math.round( ( dist.y ) / this.settings.gridY) * this.settings.gridY;

				dist.x -= mx;
				dist.y -= my;
				
				object.x += mx;
				object.y += my;
				
				object.x = Math.round( object.x / this.settings.gridX ) * this.settings.gridX;
				object.y = Math.round( object.y / this.settings.gridY ) * this.settings.gridY;
				
			}
			else{
				dist.x = x;
				dist.y = y;
				
				object.x += dist.x;
				object.y += dist.y;
			}
			
			this.sync(object);
			this.project.settings.updateObjects(object.MT_OBJECT);
		},
		
		moveByKey: function(e, object){
			var w = e.which;
			var inc = 1;
			
			if(e.ctrlKey){
				if(w == 37 || w == 39){
					inc = this.settings.gridX;
				}
				else{
					inc = this.settings.gridY;
				}
			}
			
			if(w == MT.keys.LEFT){
				object.x -= inc;
			}
			if(w == MT.keys.UP){
				object.y -= inc;
			}
			if(w == MT.keys.RIGHT){
				object.x += inc;
			}
			if(w == MT.keys.DOWN){
				object.y += inc;
			}
			
			object.MT_OBJECT.x = object.x;
			object.MT_OBJECT.y = object.y;
			this.project.settings.updateObjects(object.MT_OBJECT);
			this.sync(object);
		},
		
		_followMouse: function(e, snapToGrid){
			
			if(!this.activeObject){
				return;
			}
			
			this.activeObject.x = (e.x - this.ox + this.game.camera.x)/this.scale.x;
			this.activeObject.y = (e.y - this.oy + this.game.camera.y)/this.scale.y;
			
			if(e.ctrlKey || snapToGrid){
				this.activeObject.x = Math.round(this.activeObject.x / this.settings.gridX) * this.settings.gridX;
				this.activeObject.y = Math.round(this.activeObject.y / this.settings.gridY) * this.settings.gridY;
			}
			
		},
		
		/* helper fns */
		
		getOffsetAngle: function(obj){
			var an = 0;
			var p = obj.parent;
			while(p){
				an += p.rotation;
				p = p.parent;
			}
			
			
			return an;
		},
		
		rpx: function(angle, x, y, cx, cy){
			
			var sin = Math.sin(angle);
			var cos = Math.cos(angle);
			
			return -(x - cx)*cos - (y - cy)*sin + cx;
		},
		
		rpy: function(angle, x, y, cx, cy){
			var sin = Math.sin(angle);
			var cos = Math.cos(angle);
			
			return -(y - cy)*cos + (x - cx)*sin + cy;
		},
		
		sync: function(sprite, obj){
			console.log("sync");
			sprite = sprite || this.activeObject;
			obj = obj || sprite.MT_OBJECT;
			
			obj.x = sprite.x;
			obj.y = sprite.y;
			
			obj.angle = sprite.angle;
			
			obj.scaleX = sprite.scale.x;
			obj.scaleY = sprite.scale.y;
			
			obj.width = sprite.width;
			obj.height = sprite.height;
			
			obj.frame = sprite.frame;
			
			if(sprite == this.activeObject){
				this.project.settings.update();
			}
			
			this.emit(MT.SYNC, this);
		},
   
		createObject: function(obj){
			var sprite = this.createSprite(obj);
			this.tmpObjects.push(sprite);
			
			return sprite;
		},
		
		removeObject: function(obj){
			for(var i=0; i<this.tmpObjects.length; i++){
				if(this.tmpObjects[i] == obj){
					this.tmpObjects.splice(i,1)[0].destroy();
					i--;
				}
			}
		},

		updateScene: function(obj){
			this.updateSettings(obj);
			this.sendDelayed("updateData", this.settings, 100);
		},
		
		received: false,
		a_receive: function(obj){
			if(this.received){
				return;
			}
			this.received = true;
			this.updateSettings(obj);
		},
		
		createActiveObject: function(obj){
			this.activeObject = this.addObject(obj, this.game.world, true);
			return this.activeObject;
		},
		
		
		getObjectOffsetX: function(obj){
			var off = obj.x;
			while(obj.parent){
				off += obj.parent.x;
				obj = obj.parent;
			}
			return off;
		},
		
		getObjectOffsetY: function(obj){
			var off = obj.y;
			while(obj.parent){
				off += obj.parent.y;
				obj = obj.parent;
			}
			return off;
		},
		
		
		pickObject: function(x, y){
			
			x += this.game.camera.x;
			y += this.game.camera.y;
			
			
			
			var ctrl = false;
			var shift = false;
			
			var lc = this.ui.events.mouse.lastClick;
			if(this.ui.events.mouse.lastClick){
				ctrl = lc.ctrlKey;
				shift = lc.shiftKey
			}
			
			
			for(var i=this.objects.length-1; i>-1; i--){
				if(!this.isVisible(this.objects[i])){
					continue;
				}
				if(this.isLocked(this.objects[i])){
					continue;
				}
				var box = this.objects[i].getBounds();
				if(box.contains(x,y)){
					return this.objects[i];
				}
			}
			
			for(var i=0; i<this.tmpObjects.length; i++){
				var box = this.tmpObjects[i].getBounds();
				if(box.contains(x,y)){
					return this.tmpObjects[i];
				}
			}
			var group = this.isGroupHandle(x, y);
			if(group){
				return group;
			}
			return null;
		},
		
		
		pickGroup: function(x,y){
			
			x += this.game.camera.x;
			y += this.game.camera.y;
			
			
			
			var ctrl = false;
			var shift = false;
			
			var lc = this.ui.events.mouse.lastClick;
			if(this.ui.events.mouse.lastClick){
				ctrl = lc.ctrlKey;
				shift = lc.shiftKey
			}
			
			
			var box = null;
			for(var i=0; i<this.groups.length; i++){
				if(!this.groups[i].visible){
					continue;
				}
				box = this.groups[i].getBounds();
				if(box.contains(x, y)){
					return this.groups[i];
				}
			}
			
			return null;
		},
		
		isVisible: function(obj){
			var o = obj;
			while(o.parent){
				if(!o.visible){
					return false;
				}
				o = o.parent;
			}
			
			return o.visible;
		},
		isLocked: function(obj){
			var o = obj;
			while(o.parent){
				if(!o.MT_OBJECT){
					break;
				}
				if(o.MT_OBJECT.isLocked){
					return true;
				}
				o = o.parent;
			}
			
			return false;
		},
		
		selectRect: function(rect, clear){
			rect.x -= this.game.camera.x;
			rect.y -= this.game.camera.y;
			
			var box = null;
			
			
			for(var i=0; i<this.objects.length; i++){
				if(!this.isVisible(this.objects[i])){
					continue;
				}
				if(this.isLocked(this.objects[i])){
					continue;
				}
				
				box = this.objects[i].getBounds();
				if(box.intersects(rect)){
					this.selector.add(this.objects[i]);
				}
				else if(clear){
					this.selector.remove(this.objects[i]);
				}
			}
			
			rect.x += this.game.camera.x;
			rect.y += this.game.camera.y;
			
		},
		
		isGroupHandle: function(x,y){
			return null;
			
			var bounds = null;
			for(var i=0; i<this.groups.length; i++){
				if(this.isGroupSelected(this.groups[i])){
					var ox = this.getObjectOffsetX(this.groups[i]);
					var oy = this.getObjectOffsetY(this.groups[i]);
					
					if(Math.abs(ox - x) < 10 && Math.abs(oy - y) < 10){
						return this.groups[i];
					}
				}
			}
		},
		
		isGroupSelected: function(group){
			return false;
		},
		
		updateSelected: function(){
			if(!this.activeObject){
				return;
			}
			this.activeObject = this.getById(this.activeObject.MT_OBJECT.id);
		},
		
		
		
		
		getById: function(id){
			for(var i=0; i<this.objects.length; i++){
				if(this.objects[i].MT_OBJECT.id == id){
					return this.objects[i];
				}
			}
			
			for(var i=0; i<this.groups.length; i++){
				if(this.groups[i].MT_OBJECT.id == id){
					return this.groups[i];
				}
			}
			
		}
	}
);   
