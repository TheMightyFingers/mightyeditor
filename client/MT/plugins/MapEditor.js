"use strict";
MT.requireFile("js/phaser.js");
MT.require("core.Helper");
MT.require("core.Selector");

MT.extend("core.Emitter").extend("core.BasicPlugin")(
	MT.plugins.MapEditor = function(project){
		MT.core.BasicPlugin.call(this, "MapEditor");
		
		this.project = project;
		
		this.assets = [];
		
		this.objects = [];
		this.tmpObjects = [];
		this.oldObjects = [];
		
		this.groups = [];
		this.oldGroups = [];
		
		this.dist = {};
		
		this.selection = new Phaser.Rectangle();
		
		this.selector = new MT.core.Selector();
		
		
		
		this.settings = {
			cameraX: 0,
			cameraY: 0,
			worldWidth: 2000,
			worldHeight: 2000,
			gridX: 64,
			gridY: 64,
			showGrid: 1,
			backgroundColor: "#111111",
			gridColor: "rgba(255,255,255,0.1)"
		};
		
		
		window.map = this;
	},
	{
		_mousedown: false,
		
		
		/* basic pluginf fns */
		initUI: function(ui){
			this.ui = ui;
			
			var that = this;
			
			this.project.ui.onResize(function(){
				that.resize();
			});
			
			this.selector.on("select", function(obj){
				//that.emit("select", obj);
			});
			
			this.selector.on("unselect", function(obj){
				that.emit("unselect", obj);
			});
			
			
			
			this.createMap();
			
			
			
			var tools = this.project.plugins.tools;
			var om = this.project.plugins.objectsmanager;
			
			ui.events.on("mousedown", function(e){
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
			
			
			ui.events.on("mouseup", function(e){
				that.handleMouseUp(e);
			});
			
			
			var dx = 0;
			var dy = 0;
			ui.events.on("mousemove", function(e){
				that.handleMouseMove(e);
			});
			
			
			ui.events.on("keydown", function(e){
				var w = e.which;
				
				if( (e.target != game.canvas && e.target != document.body) ){
					return;
				}
				
				//escape
				if(w == MT.keys.esc){
					that.activeObject = null;
					that.selector.clear();
					return;
				}
				
				
				that.selector.forEach(function(obj){
					that.moveByKey(e, obj);
				});
			});
			
			ui.events.on("keyup", function(e){
				om.sync();
			});
			
		},
		
		installUI: function(){
			var that = this;
			
			this.tools = this.project.plugins.tools;
			
			this.project.plugins.assetsmanager.on("update",function(data){
				that.addAssets(data);
			});
			
			this.project.plugins.objectsmanager.on("update", function(data){
				that.addObjects(data);
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
					var c = game.canvas;
					c.parentNode.removeChild(c);
					that.project.ui.center.appendChild(c);
					
				},
				create: function(){
					that.resize();
					
					if(!ctx){
						ctx = game.canvas.getContext("2d");
					}
					
					that.setCameraBounds();
					that.postUpdateSetting();
				},
				
				
				render: function(){
					
					that.drawGrid(ctx);
					
					that.selector.forEach(drawObjects);
					
					that.drawSelection(ctx);
					
				}
			});
			
		},
		
		
		resize: function(){
			if(!this.game){
				return;
			}
			this.game.width = this.project.ui.center.offsetWidth;
			this.game.height = this.project.ui.center.offsetHeight;
			
			this.game.world.setBounds(0, 0, 2000, 2000);
			
			this.game.renderer.resize(this.game.width, this.game.height);
			
			this.setCameraBounds();
			
		},
		
		setCameraBounds: function(){
			
			this.game.camera.bounds.x = -Infinity;
			this.game.camera.bounds.y = -Infinity;
			this.game.camera.bounds.width = Infinity;
			this.game.camera.bounds.height = Infinity;
		},
		
		updateSettings: function(obj){
			if(!obj){
				return;
			}
			
			for(var i in obj){
				this.settings[i] = obj[i];
			}
			
			if(!this.game.isBooted){
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
			
			if(this.game.stage.backgroundColor != this.settings.backgroundColor){
				this.game.stage.backgroundColor = this.settings.backgroundColor;
			}
		},
		
		/* drawing fns */
		drawGrid: function(ctx){
			if(!this.settings.showGrid){
				return;
			}
			
			var g = 0;
			var game = this.game;
			
			
			ctx.save();
			ctx.beginPath();
			
			ctx.strokeStyle = "rgba(255,255,255,0.1)";
			
			var ox = game.camera.x % this.settings.gridX;
			var oy = game.camera.y % this.settings.gridY;
			
			
			g = this.settings.gridX;
			for(var i = -ox; i<game.canvas.width; i += g){
				if(i < 0){
					continue;
				}
				
				ctx.beginPath();
				if(i + game.camera.x == 0){
					ctx.strokeStyle = "rgba(255,0,0,1)";
				}
				else{
					ctx.strokeStyle = "rgba(255,255,255,0.1)";
				}
				ctx.moveTo(i, 0);
				ctx.lineTo(i, game.canvas.height);
				
				ctx.stroke();
			}
			
			
			g = this.settings.gridY;
			for(var j = -oy; j<game.canvas.height; j += g){
				if(j < 0){
					continue;
				}
				
				ctx.beginPath();
				if(j + game.camera.y == 0){
					ctx.strokeStyle = "rgba(255,0,0,1)";
				}
				else{
					ctx.strokeStyle = "rgba(255,255,255,0.1)";
				}
				
				ctx.moveTo(0, j);
				ctx.lineTo(game.canvas.width, j);
				
				ctx.stroke();
			}
			
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
			
			if(this.activeObject == obj){
				ctx.strokeStyle = "rgba(255,0,0,4)";
			}
			else{
				ctx.strokeStyle = "rgba(255,100,0,0.5)";
			}
			ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

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
		
		
		/* assets n objects */
		isAssetsAdded: false,
		assetsTimeout: 0,
		addAssets: function(assets){
			if(!this.game.isBooted){
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
			this.isAssetsAdded = false;
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
			if(asset.contents){
				this.addAssets(asset.contents);
				return;
			}
			
			this.assetsToLoad++;
			
			var game = this.game;
			var path = this.project.path + "/" + asset.__image;
			if(!MT.core.Helper.isImage(path)){
				if(typeof cb === "function"){
					cb();
				}
				return;
			}
			
			
			var image = new Image();
			image.onload = function(){
				if(asset.width != asset.frameWidth || asset.width != asset.frameHeight){
					game.cache.addSpriteSheet(asset.id, asset.__image, this, asset.frameWidth, asset.frameHeight, asset.frameMax, asset.margin, asset.spacing);
				}
				else{
					game.cache.addImage(asset.id, asset.__image, this);
				}
				
				
				if(typeof cb === "function"){
					cb();
				}
			};
			image.src = path;
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
			this.emit("objectsAdded", this);
			this._addTimeout = 0;
		},
		
		_destroyObject: function(object){
    
			var anims = object.animations._anims;
			var anim = null;
			for(var i in anims){
				anim = anims[i];
				
				anim._parent = null;
				anim._frames = null;
				anim._frameData = null;
				anim.currentFrame = null;
				anim.isPlaying = false;

				anim.onStart.dispose();
				anim.onLoop.dispose();
				anim.onComplete.dispose();

				anim.game.onPause.remove(anim.onPause, anim);
				anim.game.onResume.remove(anim.onResume, anim);
				
				anim.game = null;
			}
			
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
				obj.bringToTop();
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
			
			return group;
		},
   
		addObject: function(obj, group){
			var oo = null;
			var od = null;
			for(var i=0; i<this.oldObjects.length; i++){
				od = this.oldObjects[i];
				oo = this.oldObjects[i].MT_OBJECT;
				
				
				if(oo.id == obj.id ){
					od.loadTexture(oo.assetId, oo.frame);
					
					
					
					
					
					this.objects.push(od);
					group.add(od);
					return od;
				}
			}
			
			
			
			var sp = this.createSprite(obj, group);
			this.objects.push(sp);
			
			return sp;
		},
		
		createSprite: function(obj, group){
			var game = this.game;
			group = group || game.world;
			
			var sp = null;
			sp = group.create(obj.x, obj.y, obj.assetId);
			
			this.inheritSprite(sp, obj);
			
			
			var frameData = game.cache.getFrameData(obj.assetId);
			
			if(frameData){
				var arr = [];
				for(var i=0; i<frameData.total; i++){
					arr.push(i);
				}
				sp.animations.add("default", arr, 10, false);
				obj._framesCount = frameData.total;
			}
			
			
			
			//sp.inputEnabled = true;
			//sp.input.pixelPerfectOver = true;
			
			return sp;
		},
		
		inheritSprite: function(sp, obj){
			
			sp.MT_OBJECT = obj;
			
			sp.anchor.x = obj.anchorX;
			sp.anchor.y = obj.anchorY;
			
			sp.x = obj.x;
			sp.y = obj.y;
			
			if(obj.angle){
				sp.angle = obj.angle;
			}
			obj._framesCount = 0;
			
			
			if(obj.frame){
				sp.frame = obj.frame;
			}
			
			if(obj.scaleX){
				sp.scale.x = obj.scaleX;
				sp.scale.y = obj.scaleY;
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
			console.log("set active", val);
			this._activeObject = val;
		},
		
		get offsetX(){
			return this.ui.center.offsetLeft - this.game.camera.x;
		},
		
		get offsetY(){
			return this.ui.center.offsetTop - this.game.camera.y;
		},
		
		get offsetXCam(){
			return this.ui.center.offsetLeft + this.game.camera.x;
		},
		
		get offsetYCam(){
			return this.ui.center.offsetTop + this.game.camera.y;
		},
		/* input handling */
		
		handleMouseDown: function(e){
			
			
			if(e.button == 0){
				for(var i in this.dist){
					this.dist[i].x = 0;
					this.dist[i].y = 0;
				}
				
				/*var x = e.x - this.offsetXCam;
				var y = e.y - this.offsetYCam;
				
				var obj = this.pickObject(x,y);
				
				this.emit("select", obj);*/
				
			}
			this.tools.mouseDown(e);
		},
		
		handleMouseUp: function(e){
			console.log("up");
			this.tools.mouseUp(e);
			
			
		},
		
		emptyFn: function(){},
		 
		
		
		_handleMouseMove: function(){},
		
		
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
			
			var x = this.ui.events.mouse.mx;
			var y = this.ui.events.mouse.my;
			
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
			
			
			//left
			if(w == 37){
				object.x -= inc;
			}
			//up
			if(w == 38){
				object.y -= inc;
			}
			//right
			if(w == 39){
				object.x += inc;
			}
			//down
			if(w == 40){
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
			
			
			this.activeObject.x = e.x - this.ui.center.offsetLeft + this.game.camera.x;
			this.activeObject.y = e.y - this.ui.center.offsetTop + this.game.camera.y;
			
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
			sprite = sprite || this.activeObject;
			obj = obj || sprite.MT_OBJECT;
			
			obj.x = sprite.x;
			obj.y = sprite.y;
			
			obj.angle = sprite.angle;
			
			obj.scaleX = sprite.scale.x;
			obj.scaleY = sprite.scale.y;
			
			this.emit("sync", this);
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
			
			console.log("save settings");
			
			
			this.sendDelayed("updateData", this.settings, 100);
			//this.settingsgridX = obj.gridX;
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
		
		
		pickObject: function(x,y){
			
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
