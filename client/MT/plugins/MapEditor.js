"use strict";
MT.requireFile("js/phaser.js");
MT.require("core.Helper");

MT.extend("core.Emitter")(
	MT.plugins.MapEditor = function(project){
		MT.core.Emitter.call(this);
		
		
		this.selectedObject = null;
		this.project = project;
		
		this.assets = [];
		this.objects = [];
		this.groups = [];
		
		this.grid = 64;
		
		
		this.tool = "select";
		
		
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

				if(!that.activeObject || (e.target != game.canvas && e.target != document.body) ){
					return;
				}
				
				//escape
				if(w == 27){
					that.activeObject = null;
					that.emit("select", null);
					return;
				}
				
				//left
				if(w == 37){
					that.activeObject.x -= 1;
				}
				//up
				if(w == 38){
					that.activeObject.y -= 1;
				}
				//right
				if(w == 39){
					that.activeObject.x += 1;
				}
				//down
				if(w == 40){
					that.activeObject.y += 1;
				}
				
				that.activeObject.MT_OBJECT.x = that.activeObject.x;
				that.activeObject.MT_OBJECT.y = that.activeObject.y;
				that.project.settings.updateObjects(that.activeObject.MT_OBJECT);
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
			var game = this.game = window.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'gameContainer', { 
				preload: function(){
					var c = game.canvas;
					c.parentNode.removeChild(c);
					that.project.ui.center.appendChild(c);
					
				},
				create: function(){
					game.input.onDown.add(function(e){
						that.selectObject(e);
					}, this);
					
					that.resize();
					
					if(!ctx){
						ctx = game.canvas.getContext("2d");
					}
				},
				
				
				render: function(){
					
					that.drawGrid(ctx);
					that.highlightActiveObject(ctx);
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
		},


		/* drawing fns */
		drawGrid: function(ctx){
			var g = this.grid;
			var game = this.game;
			
			
			ctx.save();
			ctx.beginPath();
			
			ctx.strokeStyle = "rgba(255,255,255,0.1)";
			ctx.globalAlpha = 0.5;
			
			for(var i = -game.camera.x; i<game.canvas.width; i += g){
				if(i < 0){
					continue;
				}
				ctx.moveTo(i, -game.camera.y);
				ctx.lineTo(i, game.canvas.height + game.camera.y);
			}
			
			for(var j = -game.camera.y; j<game.canvas.height; j += g){
				if(j < 0){
					continue;
				}
				ctx.moveTo(-game.camera.x, j);
				ctx.lineTo(-game.camera.x + game.canvas.width + game.camera.x, j);
			}
			
			
			ctx.stroke();
			ctx.restore();
		},
		
		highlightActiveObject: function(ctx){
			
			if(!this.activeObject || !this.activeObject.game){
				return;
			}
			
			var bounds = this.activeObject.getBounds();
			var group = null;
			
			if(this.activeObject.MT_OBJECT.contents){
				group = this.activeObject;
			}
			else{
				group = this.activeObject.parent || game.world;
			}
			
			var x = group.x - game.camera.x;
			var y = group.y - game.camera.y;
			
			
			ctx.save();
			
			ctx.strokeStyle = "#ff0000";
			
			ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = 1;
			
			ctx.translate(x, y);
			ctx.rotate(group.rotation);
			ctx.translate(-x, -y);
			
			ctx.beginPath();
			ctx.moveTo(group.x, group.y);
			ctx.lineTo(group.x, group.y - 16);
			ctx.stroke();
			
			ctx.strokeRect(group.x - 4, group.y - 4, 8, 8);
			ctx.restore();
			
		},
		
		isGroupHandle: function(x,y){
			var bounds = null;
			for(var i=0; i<this.groups.length; i++){
				bounds = this.groups[i].getBounds();
				if(bounds.contains(x,y)){
					return this.groups[i];
				}
				
				if(Math.abs(this.groups[i].x - x) < 10 && Math.abs(this.groups[i].y - y)){
					return this.groups[i];
				}
				
			}
		},
		
		
		/* assets n objects */
		isAssetsAdded: false,
		addAssets: function(assets){
			var game = this.game;
			var that = this;
			var asset = null;
			var cnt = assets.length;
			this.isAssetsAdded = false;
			for(var i=0; i<assets.length; i++){
				this.addAsset(assets[i], function(){
					cnt--;
					if(cnt == 0){
						that.isAssetsAdded = true;
					}
				});
			}
		},
		
		addAsset: function(asset, cb){
			if(asset.contents){
				this.addAssets(asset.contents);
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
			
			
			var image = new Image();
			image.onload = function(){
				if(asset.width != asset.frameWidth || asset.width != asset.frameHeight){
					game.cache.addSpriteSheet(asset.__image, asset.__image, this, asset.frameWidth, asset.frameHeight, asset.frameMax, asset.margin, asset.spacing);
				}
				else{
					game.cache.addImage(asset.__image, asset.__image, this);
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
				}
				
				this._addTimeout = window.setTimeout(function(){
					that.addObjects(objs);
				}, 100);
				return;
			}
			
			//reverse order
			for(var i=this.objects.length-1; i>-1; i--){
				this._destroyObject(this.objects[i]);
			}
			
			for(var i=this.groups.length-1; i>-1; i--){
				this.groups[i].destroy(true);
			}
			
			this.objects.length = 0;
			this.groups.length = 0;
			
			
			this._addObjects(objs, group);
			
			this.emit("objectsAdded", this);
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
				this.addObject(objs[i], group);
			}
		},
   
		addGroup: function(obj){
			
			var group = this.game.add.group();
			group.MT_OBJECT = obj;
			
			this.groups.push(group);
			
			group.x = obj.x;
			group.y = obj.y;
			//group.anchor.x = obj.anchorX;
			//group.anchor.y = obj.anchorY;
			
			if(obj.angle){
				group.angle = obj.angle;
			}
			
			if(this.activeObject && obj.id == this.activeObject.MT_OBJECT.id){
				this.activeObject = group;
			}
			
			return group;
		},
   
		addObject: function(obj, group){
			var game = this.game;
			var that = this;
			
			var sp = null;
			sp = group.create(obj.x, obj.y, obj.__image);
			
			sp.anchor.x = obj.anchorX;
			sp.anchor.y = obj.anchorY;
			
			
			sp.x = obj.x;
			sp.y = obj.y;
			
			if(obj.angle){
				sp.angle = obj.angle;
			}
			obj._framesCount = 0;
			
			
			var frameData = game.cache.getFrameData(obj.__image);
			
			if(frameData){
				var arr = [];
				for(var i=0; i<frameData.total; i++){
					arr.push(i);
				}
				sp.animations.add("default", arr, 10, false);
				obj._framesCount = frameData.total;
			}
			
			if(obj.frame){
				sp.frame = obj.frame;
			}
			
			
			
			
			that.objects.push(sp);
			
			sp.inputEnabled = true;
			sp.input.pixelPerfectOver = true;
			sp.MT_OBJECT = obj;
			
			if(that.activeObject && obj.id == that.activeObject.MT_OBJECT.id){
				that.activeObject = sp;
			}
			
			return sp;
		},
		
		reloadObjects: function(){
			if(this.addedObjects){
				this.addObjects(this.addedObjects);
			}
		},
		
		/* input handling */
		//this goes from game
		selectObject: function(e){
			
			if(!this.tool == "select"){
				return;
			}
			
			if(e.button !== 0){
				return;
			}
			
			if(e.targetObject){
				this.activeObject = e.targetObject.sprite;
			}
			else{
				var group = this.isGroupHandle(e.x, e.y);
				if(!group){
					this.activeObject = null;
				}
				else{
					this.activeObject = group;
				}
			}
			
			this.emit("select", this.activeObject);
		},
		
		/*rest events goes from ui.events*/
		handleMouseDown: function(e){
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
		},
		
		_objectMove: function(e){
			var angle = this.getOffsetAngle(this.activeObject);
			
			var x = ui.events.mouse.mx;
			var y = ui.events.mouse.my;
			
			if(angle){
				var x = this.rpx(angle, -ui.events.mouse.mx, -ui.events.mouse.my, 0, 0);
				var y = this.rpy(angle, -ui.events.mouse.mx, -ui.events.mouse.my, 0, 0);
			}
			
			
			if(e.ctrlKey){
				dx += x;
				dy += y;
				
				if(dx > this.grid){
					this.activeObject.x = Math.round((this.activeObject.x + dx) /this.grid) * this.grid;
					dx -= this.grid;
				}
				else if(dx < -this.grid){
					this.activeObject.x = Math.round((this.activeObject.x + dx) /this.grid) * this.grid;
					dx += this.grid;
				}
				else{
					this.activeObject.x = Math.round((this.activeObject.x) /this.grid) * this.grid;
				}
				
				if(dy > this.grid){
					this.activeObject.y = Math.round((this.activeObject.y + dy) /this.grid) * this.grid;
					dy -= this.grid;
				}
				else if(dy < -this.grid){
					this.activeObject.y = Math.round((this.activeObject.y + dy) /this.grid) * this.grid;
					dy += this.grid;
				}
				else{
					this.activeObject.y = Math.round((this.activeObject.y) /this.grid) * this.grid;
				}
				
			}
			else{
				//this.project.om.updateData();
				this.activeObject.x += x;
				this.activeObject.y += y;
			}
			
			this.sync();
			this.project.settings.updateObjects(this.activeObject.MT_OBJECT);
		},
		
		_followMouse: function(e){
			if(!this.activeObject){
				return;
			}
			this.activeObject.x = e.x;
			this.activeObject.y = e.y;
		},
		
		
		
		
		setActive: function(id){
			
			for(var i=0; i<this.objects.length; i++){
				if(this.objects[i].MT_OBJECT.id == id){
					this.activeObject = this.objects[i];
				
					return;
				}
			}
			
			for(var i=0; i<this.groups.length; i++){
				if(this.groups[i].MT_OBJECT.id == id){
					this.activeObject = this.groups[i];
					
					return;
				}
			}
			
			console.log("active not found");
		},

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
			
			this.emit("sync", this);
		},
   
		
		updateScene: function(obj){
			this.game.width = obj.worldWidth;
			this.game.height = obj.worldHeight;
			
			this.game.world.setBounds(0, 0, obj.worldWidth, obj.worldHeight);
			this.game.camera.x = obj.cameraX;
			this.game.camera.y = obj.cameraY;
			
			this.grid = obj.grid;
		},
		
		createActiveObject: function(obj){
			this.activeObject = this.addObject(obj, this.game.world);
			return this.activeObject;
		},
		
		
	}
);   
