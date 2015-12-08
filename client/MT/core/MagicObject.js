"use strict";
//MT.require("core.mat");

MT(
	MT.core.MagicObject = function(data, parent, map){
		this.data = data;
		this.parent = parent;
		this.map = map;
		this.project = this.map.project;
		this.settings = this.project.plugins.settings;
		this.manager = this.project.plugins.objectmanager;

		this.game = map.game;
		this.isRemoved = false;

		/*
		 * activeHandle
		 * 0 && > 0 - index in handles
		 * -1 - nothing
		 * < -1 - special cases
		 * -2 - move anchor
		 * -3 - rotate
		 */
		this.activeHandle = -1;

		this.handles = [];

		this.mouseInfo = {
			down: false,
			x: 0,
			y: 0
		};

		this.rotator = {
			x: 0,
			y: 0
		};

		this.create();

		this.activeFrame = -1;

		this.activeMovie = "";

		this.tmpData = {
			x: 0,
			y: 0,
			alpha: 1,
			angle: 0,
			scaleX: 1,
			scaleY: 1,
			anchorX: 0,
			anchorY: 0
		};

		// debug only - so we know what is missing
		Object.seal(this);
	},
	{
		radius: 3,
		activeRadius: 5,
		/* interpolation */
		changeMovieFrame: function(movie, frame, skipChildren){
			this.activeMovie = movie;
			this.activeFrame = frame;
			this.loadMovieFrame();

			if(skipChildren){
				return;
			}
			this.changeChildrenMovieFrame(movie, frame);
		},

		changeChildrenMovieFrame: function(movie, frame){
			for(var i=0; i<this.object.children.length; i++){
				this.object.children[i].magic.changeMovieFrame(movie, frame);
			}
		},

		loadMovieFrame: function(){
			if(!this.data.movies){
				return;
			}
			var movie = this.data.movies[this.activeMovie];
			if(!movie){
				return;
			}

			var frameData = movie.frames;
			if(!frameData || frameData.length === 0){
				return;
			}

			var frame;
			var start = frameData[0], end;
			end = frameData[frameData.length-1];
			if(end.keyframe < this.activeFrame){
				this.update(end);
				return;
			}

			for(var i=0; i<frameData.length; i++){
				frame = frameData[i];
				if(frame.keyframe < this.activeFrame){
					start = frame;
				}
				if(frame.keyframe > this.activeFrame){
					end = frame;
					break;
				}
				if(frame.keyframe == this.activeFrame){
					this.update(frame);
					return;
				}
			}
			if(start == end){
				this.update(end);
				return;
			}

			this.prepareInterpolate(start, end);
		},

		prepareInterpolate: function(start, end){
			var t = (this.activeFrame - start.keyframe) / (end.keyframe - start.keyframe);
			var med = this.buildTmpVals(t, start, end);
			this.update(this.tmpData);
		},

		buildTmpVals: function(t, start, end){

			var tmp = this.tmpData;
			if(end.easings == void(0)){
				tmp.x = this.getInt(t, start.x, end.x);
				tmp.y = this.getInt(t, start.y, end.y);

				tmp.angle = this.getInt(t, start.angle, end.angle);
				tmp.alpha = this.getInt(t, start.alpha, end.alpha);

				tmp.scaleX = this.getInt(t, start.scaleX, end.scaleX);
				tmp.scaleY = this.getInt(t, start.scaleY, end.scaleY);
				if(this.data.type != MT.objectTypes.GROUP){
					tmp.anchorX = this.getInt(t, start.anchorX, end.anchorX);
					tmp.anchorY = this.getInt(t, start.anchorY, end.anchorY);
				}
			}
			else{
				tmp.x = this.getInt(t, start.x, end.x, end.easings.x);
				tmp.y = this.getInt(t, start.y, end.y, end.easings.y);

				tmp.angle = this.getInt(t, start.angle, end.angle, end.easings.angle);
				tmp.alpha = this.getInt(t, start.alpha, end.alpha, end.easings.alpha);

				tmp.scaleX = this.getInt(t, start.scaleX, end.scaleX, end.easings.scaleX);
				tmp.scaleY = this.getInt(t, start.scaleY, end.scaleY, end.easings.scaleY);

				if(this.data.type != MT.objectTypes.GROUP){
					tmp.anchorX = this.getInt(t, start.anchorX, end.anchorX, end.easings.anchorX);
					tmp.anchorY = this.getInt(t, start.anchorY, end.anchorY, end.easings.anchorY);
				}
			}
		},

		getInt: function(t, a, b, easing){
			var tfin = t;
			if(easing){
				tfin = this.resolve(easing, t);
			}

			if(isNaN(a) || isNaN(b)){
				return;
			}

			return (1 - tfin) * a + tfin * b;
		},

		resolve: function(ea, t){
			if(ea == "NONE"){
				return 0;
			}
			var sp = ea.split(".");
			var start = Phaser.Easing;
			for(var i=0; i<sp.length && start; i++){
				start = start[sp[i]];
			}

			if(start){
				return start(t);
			}
			return t;
		},
		/* interpolation::end */

		create: function(){
			// fix old groups
			if(this.data.type == void(0)){
				if(this.data.contents){
					this.data.type = MT.objectTypes.GROUP;
				}
			}

			if(this.data.type == MT.objectTypes.GROUP){
				this.createGroup();
			}
			if(this.data.type == MT.objectTypes.SPRITE){
				this.createSprite();
				this.width = this.object.width;
				this.height= this.object.height;
			}
			if(this.data.type == MT.objectTypes.TEXT){
				this.createText();
			}
			if(this.data.type == MT.objectTypes.TILE_LAYER){
				this.createTileLayer();
			}
			this.object.magic = this;
		},

		createTileLayer: function(){

			// hack for phaser - might be problematic if canvas exceeds max bitmap size
			var gm = this.game.width;
			var gh = this.game.height;

			this.game.width = 99999;
			this.game.height = 99999;


			this.createTileMap();
			this.object = this.tilemap.createBlankLayer(this.data.name, this.data.widthInTiles, this.data.heightInTiles, this.data.tileWidth, this.data.tileHeight, this.parent);
			this.object.fixedToCamera = this.data.isFixedToCamera;
			this.map.project.plugins.tools.tools.tiletool.updateLayer(this);
			this.map.tileLayers.push(this.object);
			this.map.resort();

			this.game.width = gm;
			this.game.height = gh;
			if(!this.data.isVisible){
				this.hide();
			}

			this.object.scrollFactorX = 0;
			this.object.scrollFactorY = 0;

		},

		createTileMap: function(){
			var tileWidth = this.data.tileWidth || 64;
			var tileHeight = this.data.tileHeight || 64;
			this.tilemap = this.game.add.tilemap(null, tileWidth, tileHeight, this.data.widthInTiles, this.data.heightInTiles);
		},

		createGroup: function(){
			this.object = this.game.add.group();
			this.appendToParent();
		},

		createSprite: function(){
			if(!this.data.contents){
				this.data.contents = [];
			}
			/*if(!PIXI.BaseTextureCache[this.data.assetId]){
				this.data.assetId = "__missing";
			}*/
			if(this.parent.type == Phaser.GROUP){
				this.object = this.parent.create(this.data.x, this.data.y, this.data.assetId);
			}
			else{
				this.object = this.parent.game.add.sprite(this.data.x, this.data.y, this.data.assetId);

				this.game.world.removeChild(this.object);
				this.appendToParent();

			}

			this.object.inputEnabled = true;
			this.object.input.pixelPerfectOver = true;
			//this.object.input.stop();

			this.createBox();
			this.update();
		},

		createText: function(){
			this.object = this.game.add.text(this.data.x, this.data.y, this.data.text, this.data.style);
			this.appendToParent();
			this.object.inputEnabled = true;
			this.object.input.pixelPerfectOver = false;


			this.createBox();

			this.update();
		},

		appendToParent: function(){
			if(this.parent.type == Phaser.GROUP){
				this.parent.add(this.object);
			}
			else{
				this.parent.addChild(this.object);
			}
		},

		updateText: function(){
			this.object.text = this.data.text;

			if(this.data.style){
				this.object.style = this.data.style;
			}
			else{
				this.data.style = {};
			}
			this.wordWrap = this.data.wordWrap;
			this.wordWrapWidth = this.data.wordWrapWidth;

			this.object.fontSize = this.data.style.fontSize || 32;
			this.object.font = this.data.style.fontFamily || "Arial";
			this.object.fontWeight = this.data.style.fontWeight || "";
			this.object.style.fill = this.fill;

			if(!this.data.shadow){
				this.data.shadow = {};
			}
			this.object.anchor.x = this.data.anchorX;
			this.object.anchor.y = this.data.anchorY;
		},

		updateSprite: function(){
			// sometimes gets deleted - Alt -> click -> delete
			if(!this.object.game){
				return;
			}
			this.object.anchor.x = this.data.anchorX;
			this.object.anchor.y = this.data.anchorY;
			this.object.loadTexture(this.data.assetId);
			this.object.frame = this.data.frame;
		},

		hide: function(){
			this.object.visible = false;
		},
		show: function(){
			this.object.visible = true;
		},
		remove: function(){
			if(this.type == MT.objectTypes.TILE_LAYER){
				this.removeLayer();
			}
			else{
				this.object.destroy();
			}
			this.isRemoved = true;
		},

		createBox: function(){

			this.handles[0] = {
				x: 0,
				y: 0,
				opx: 1,
				opy: 3
			};

			this.handles[1] = {
				x: 0,
				y: 0,
				opx: 0,
				opy: 2
			};

			this.handles[2] = {
				x: 0,
				y: 0,
				opx: 3,
				opy: 1
			};

			this.handles[3] = {
				x: 0,
				y: 0,
				opx: 2,
				opy: 0
			};

			// horizontal handles
			this.handles[4] = {
				x: 0,
				y: 0,
				opx: 6,
				opy: 0
			};

			this.handles[5] = {
				x: 0,
				y: 0,
				opx: 7,
				opy: 7
			};

			this.handles[6] = {
				x: 0,
				y: 0,
				opx: 4,
				opy: 0
			};

			this.handles[7] = {
				x: 0,
				y: 0,
				opx: 2,
				opy: 5
			};

			this.updateBox();
		},

		update: function(data, parent){

			if(data){
				for(var i in data){
					this.data[i] = data[i];
				}

			}

			if(parent && parent != this.parent){
				// remove before
				if(this.parent.type == Phaser.Sprite){
					this.parent.removeChild(this.object);
				}

				if(parent.type == Phaser.GROUP){
					parent.add(this.object, true);
				}
				else{
					parent.addChild(this.object);
				}

				this.parent = parent;
			}

			this.updateBox();


			if(!this.data.isVisible){
				this.hide();
			}
			else{
				this.show();
			}

			if(this.data.type == MT.objectTypes.TEXT){
				this.updateText();
			}

			if(this.data.type == MT.objectTypes.SPRITE){
				this.updateSprite();
			}

			if(this.data.type == MT.objectTypes.TILE_LAYER){
				this.removeLayer();
				this.createTileLayer();
				this.object.visible = this.isVisible;
			}


			this.object.x = this.data.x;
			this.object.y = this.data.y;
			this.object.alpha = this.data.alpha;

			this.object.angle = this.data.angle;

			if(this.data.scaleX){
				this.object.scale.x = this.scaleX;
				this.object.scale.y = this.scaleY;
			}

			this.map.resort();

			if(this.map.activeObject == this){
				this.settings.update();
			}

			this.object.dirty = true;
		},

		updateBox: function(){
			if( this.data.type == MT.objectTypes.TILE_LAYER || !this.map || !this.map.scale){
				return;
			}
			var obj = this.object;
			obj.updateTransform();

			var mat = obj.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;

			var angle = this.getOffsetAngle();
			var x, y, dx, dy;
			var rx = ax;
			var ry = ay - 60;


			if(this.data.type == MT.objectTypes.GROUP){
				if(this.activeHandle != -3){
					this.rotator.x = this.rpx(this.object.rotation, rx, ry, ax, ay);
					this.rotator.y = this.rpy(this.object.rotation, rx, ry, ax, ay);
				}
				return;
			}

			rx = ax;
			ry = ay - this.object.height * this.map.scale.x * 0.6 - 20;


			if(this.activeHandle != 0){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) ;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) ;
				this.rp(angle, x, y, ax, ay, this.handles[0]);
			}

			if(this.activeHandle != 1){
				x = mat.tx + obj.width * (1 - obj.anchor.x) * this.map.scale.x;
				y = mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[1]);
			}

			if(this.activeHandle != 2){
				x = mat.tx + obj.width * (1 - obj.anchor.x) * this.map.scale.x;
				y = mat.ty + obj.height * (1 - obj.anchor.y) * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[2]);
			}

			if(this.activeHandle != 3){
				x = mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x;
				y = mat.ty + obj.height * (1 - obj.anchor.y) * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[3]);
			}
			// sides
			// left
			//if(this.activeHandle != 4){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) ;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) + obj.height*0.5 * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[4]);
			//}

			// right
			if(this.activeHandle != 6){
				x = mat.tx + obj.width * (1 - obj.anchor.x) * this.map.scale.x;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) + obj.height*0.5 * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[6]);
			}

			// top
			if(this.activeHandle != 5){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) + obj.width*0.5 * this.map.scale.x;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) ;
				this.rp(angle, x, y, ax, ay, this.handles[5]);
			}
			// bottom
			if(this.activeHandle != 7){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) + obj.width*0.5 * this.map.scale.x;
				y = mat.ty + obj.height * (1 - obj.anchor.y) * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[7]);
			}



			if(this.activeHandle != -3){
				this.rotator.x = this.rpx(this.object.rotation, rx, ry, ax, ay);
				this.rotator.y = this.rpy(this.object.rotation, rx, ry, ax, ay);
			}
		},

		highlight: function(ctx){
			if(this.isRemoved || !this.isVisible){
				return;
			}
			var mat = this.object.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;
			ctx.save();
			ctx.translate(0.5, 0.5);

			ctx.strokeStyle = "#ffaa00";

			if(this.data.type == MT.objectTypes.GROUP){
				if(this.activeHandle != -3){
					var rx = ax;
					var ry = ay - 60;

					this.rotator.x = this.rpx(this.object.rotation, rx, ry, ax, ay);
					this.rotator.y = this.rpy(this.object.rotation, rx, ry, ax, ay);
				}

				var bounds = this.object.getBounds();
				ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
				this.drawGroupHandle(ctx, this.object);

				if(this.map.activeObject == this){
					ctx.strokeStyle = "#ffee22";

					// rotate
					ctx.beginPath();
					if(this.activeHandle == -3){
						ctx.arc(this.rotator.x, this.rotator.y, this.activeRadius, 0, 2*Math.PI);

					}
					else{
						ctx.arc(this.rotator.x, this.rotator.y, this.radius, 0, 2*Math.PI);
					}
					grd = ctx.createRadialGradient(this.rotator.x, this.rotator.y, 0, this.rotator.x, this.rotator.y, this.radius);
					grd.addColorStop(0,"rgba(255, 255, 255, 0)");
					grd.addColorStop(1,"rgba(0, 70, 70, 1)");
					ctx.fillStyle = grd;

					ctx.fill();
					ctx.stroke();
				}



				ctx.restore();
				return;
			}

			if(this.data.type == MT.objectTypes.TILE_LAYER){

				var bounds = this.object.getBounds();
				ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
				this.drawGroupHandle(ctx, this.parent);
				ctx.restore();
				return;
			}

			/*if(this.data.type == MT.objectTypes.TEXT){
				var bounds = this.object.getBounds();
				ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
				this.drawGroupHandle(ctx, this.object.parent);

				this.updateBox();

				ctx.restore();
				return;
			}*/

			this.drawGroupHandle(ctx, this.parent);
			this.updateBox();

			var h1 = this.handles[0];

			ctx.beginPath();
			ctx.moveTo(h1.x, h1.y);

			var h, grd;
			for(var i=1; i<4; i++){
				h = this.handles[i];
				ctx.lineTo(h.x, h.y);
			}

			ctx.lineTo(h1.x, h1.y);
			ctx.stroke();

			if(this.map.activeObject == this){
				ctx.strokeStyle = "#ff0000";

				ctx.fillStyle = grd;//"rgba(255,255,255,0.1)";
				for(var i=0; i<this.handles.length; i++){
					h = this.handles[i];

					ctx.beginPath();

					if(this.activeHandle == i){
						ctx.arc(h.x, h.y, this.activeRadius, 0, 2*Math.PI);
					}
					else{
						ctx.arc(h.x, h.y, this.radius, 0, 2*Math.PI);
					}
					grd = ctx.createRadialGradient(h.x, h.y, 0, h.x,h.y, this.radius);
					grd.addColorStop(0,"rgba(255, 255, 255, 0)");
					grd.addColorStop(1,"rgba(0, 70, 70, 1)");
					ctx.fillStyle = grd;

					ctx.fill();
					ctx.stroke();
				}


				ctx.strokeStyle = "#ffee22";

				// rotate
				ctx.beginPath();
				if(this.activeHandle == -3){
					ctx.arc(this.rotator.x, this.rotator.y, this.activeRadius, 0, 2*Math.PI);

				}
				else{
					ctx.arc(this.rotator.x, this.rotator.y, this.radius, 0, 2*Math.PI);
				}
				grd = ctx.createRadialGradient(this.rotator.x, this.rotator.y, 0, this.rotator.x, this.rotator.y, this.radius);
				grd.addColorStop(0,"rgba(255, 255, 255, 0)");
				grd.addColorStop(1,"rgba(0, 70, 70, 1)");
				ctx.fillStyle = grd;

				ctx.fill();
				ctx.stroke();

				// connect anchor and rotator
				ctx.beginPath();
				ctx.moveTo(this.rotator.x, this.rotator.y);
				ctx.lineTo(ax, ay);
				ctx.stroke();


				// anchor
				ctx.strokeStyle = "#000000";
				ctx.beginPath();
				if(this.activeHandle == -2){
					ctx.arc(ax, ay, this.activeRadius, 0, 2*Math.PI);
				}
				else{
					ctx.arc(ax, ay, this.radius, 0, 2*Math.PI);
				}
				grd = ctx.createRadialGradient(ax, ay, 0, ax, ay, this.radius);
				grd.addColorStop(0,"rgba(255, 255, 255, 0)");
				grd.addColorStop(1,"rgba(0, 70, 70, 1)");
				ctx.fillStyle = grd;

				ctx.fill();
				ctx.stroke();
			}

			ctx.restore();

		},
		drawGroupHandle: function(ctx, obj){
			var mat = obj.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;

			var dx = 0;
			var dy = - this.radius*3;

			ctx.save();
			ctx.translate(ax, ay);
			ctx.rotate(obj.rotation);

			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = 1.5;

			ctx.strokeRect(- this.radius + 0.5, - this.radius + 0.5, this.radius*2, this.radius * 2);
			ctx.beginPath();
			ctx.moveTo(0.5, 0.5);
			ctx.lineTo(dx + 0.5, dy + 0.5);
			ctx.stroke();

			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 1;
			ctx.strokeRect(- this.radius, - this.radius, this.radius*2, this.radius * 2);
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(dx, dy);
			ctx.stroke();


			ctx.restore();
		},
		mouseDown: function(x, y, e){
			this.mouseInfo.down = true;
			this.mouseInfo.x = x;
			this.mouseInfo.y = y;

			if(this.activeHandle != -1){
				//document.body.style.cursor = "none";
			}
		},

		mouseUp: function(e){
			this.mouseInfo.down = false;
			//document.body.style.cursor = "auto";
		},

		mouseMove: function(x, y, e){
			var mi = this.mouseInfo;

			if(!this.isVisible){
				return;
			}

			if(this.type == MT.objectTypes.TILE_LAYER){
				var tools = this.map.project.plugins.tools;
				if(tools.activeTool == tools.tools.tiletool){
					tools.tools.tiletool.mouseMove(e);
					return;
				}
			}

			if(this.mouseInfo.down){
				if(this.activeHandle != -1){
					this.moveHandle(x, y, e);
				}
				else{
					this.moveObject(x, y, e);
				}
				return;
			}

			mi.x = x;
			mi.y = y;


			this.updateBox();
			var dx, dy, h;
			var mat = this.object.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;

			dx = Math.abs(ax - x);
			dy = Math.abs(ay - y);

			var rad = this.radius;

			if(this.activeHandle == -2){
				rad = this.activeRadius;
			}
			if(dx < rad && dy < rad){
				this.activeHandle = -2;
				return;
			}

			rad = this.radius;

			dx = Math.abs(this.rotator.x - x);
			dy = Math.abs(this.rotator.y - y);

			if(this.activeHandle == -3){
				rad = this.activeRadius;
			}

			if(dx < rad && dy < rad){
				this.activeHandle = -3;
				return;
			}

			for(var i=0; i<this.handles.length; i++){
				rad = this.radius;
				h = this.handles[i];

				dx = Math.abs(h.x - x);
				dy = Math.abs(h.y - y);

				if(this.activeHandle == i){
					rad = this.activeRadius;
				}

				if(dx < rad && dy < rad){
					this.activeHandle = i;
					return;
				}
			}
			this.activeHandle = -1;
			this.updateBox();
		},

		moveObject: function(x, y, e){
			var mi = this.mouseInfo;
			var dx = (mi.x - x) / this.map.scale.x;
			var dy = (mi.y - y) / this.map.scale.y;
			var angle = this.getParentAngle();

			var invX = this.offsetScaleX();

			if(invX < 0){
				dx *= -1;
			}

			if(this.offsetScaleY() < 0){
				dy *= -1;
			}

			var dxt = this.rpx(-angle, dx, dy, 0, 0);
			var dyt = this.rpy(-angle, dx, dy, 0, 0);



			this.x -= dxt;
			mi.x = x;

			this.y -= dyt;
			mi.y = y;

			if(e.ctrlKey && angle % Math.PI*2 == 0){
				var gx = this.map.settings.gridX;
				var gy = this.map.settings.gridY;

				var tx = Math.round(this.x / gx) * gx;
				var ty = Math.round(this.y / gy) * gy;

				if(invX > 0){
					mi.x += (tx - this.x) * this.map.scale.x;
				}
				else{
					mi.x -= (tx - this.x) * this.map.scale.x;
				}
				mi.y += (ty - this.y) * this.map.scale.x;

				this.x = tx;
				this.y = ty;

			}


			this.update();
		},

		moveHandle: function(x, y, e){

			var mi = this.mouseInfo;
			var obj = this.object;
			var mat = obj.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;

			var angle = this.getOffsetAngle();

			var h, dx, dy;

			dx = mi.x - x;
			dy = mi.y - y;
			// rotate
			if(this.activeHandle == -3){

				this.rotator.x -= dx;
				this.rotator.y -= dy;


				var rot = Math.atan2( mat.ty - this.rotator.y, mat.tx - this.rotator.x) - Math.PI * 0.5;

				var diff = rot - Phaser.Math.degToRad(this.angle);

				mi.x = x;
				mi.y = y;

				while(diff > Math.PI){
					diff = diff - Math.PI*2;
				}
				while(diff < -Math.PI){
					diff = Math.PI*2 + diff;
				}
				this.angle += Phaser.Math.radToDeg(diff);

				if(e.ctrlKey){
					this.data.angle = Math.round(this.data.angle / 15)*15;
				}

				this.update();
				return;
			}

			// move anchor
			if(this.activeHandle == -2){

				if(this.data.type == MT.objectTypes.GROUP){
					dx /= this.map.scale.x
					dy /= this.map.scale.x

					var sx = this.x;
					var sy = this.y;

					this.moveObject(x, y, e);

					dx = sx - this.x;
					dy = sy - this.y;


					var o;
					var rx = this.rpx(-this.object.rotation, dx , dy, 0, 0);
					var ry = this.rpy(-this.object.rotation, dx, dy, 0, 0);

					for(var i=0; i<this.object.children.length; i++){
						o = this.object.children[i].magic;
						o.move(o.x + rx, o.y + ry);
					}
					return;
				}


				var sx = this.anchorX;
				var sy = this.anchorY;

				this.translateAnchor(-dx, -dy);
				mi.x = x;
				mi.y = y;


				if(e.ctrlKey){
					this.moveAnchor(Math.round(this.anchorX * 10) * 0.1, Math.round(this.anchorY * 10) * 0.1);
						var angle = this.getOffsetAngle();

						var ddx = this.width * (this.anchorX - sx) * this.map.scale.x;
						var ddy = this.height * (this.anchorY - sy) * this.map.scale.y;

						var drx = this.rpx(angle, ddx, ddy, 0, 0);
						var dry = this.rpy(angle, ddx, ddy, 0, 0);

						mi.x = x + dx + drx;
						mi.y = y + dy + dry;

				}
				this.update();
				return;
			}


			dx = mi.x - x;
			dy = mi.y - y;
			h = this.handles[this.activeHandle];


			var dw = this.handles[h.opx];
			var dh = this.handles[h.opy];

			var sigX, sigY;

			var tx = this.rpx(-angle, h.x, h.y, ax, ay);
			var ty = this.rpy(-angle, h.x, h.y, ax, ay);

			var wtx = this.rpx(-angle, dw.x, dw.y, ax, ay);
			var wty = this.rpy(-angle, dw.x, dw.y, ax, ay);

			var htx = this.rpx(-angle, dh.x, dh.y, ax, ay);
			var hty = this.rpy(-angle, dh.x, dh.y, ax, ay);


			sigX = (wtx - tx) > 0 ? 1 : -1;
			sigY = (hty - ty) > 0 ? 1 : -1;
			if(this.activeHandle < 4){
				h.x -= dx;
				h.y -= dy;

				var pWidth = this.width;
				var pHeight = this.height;

				var nWidth = Math.sqrt(Math.pow(dw.x - h.x, 2) + Math.pow(dw.y - h.y, 2)) / this.map.scale.x;
				var nHeight = Math.sqrt(Math.pow(dh.x - h.x, 2) + Math.pow(dh.y - h.y, 2)) / this.map.scale.y;


				if(this.activeHandle == 1 || this.activeHandle == 2){
					sigX *= -1;
				}

				if(this.activeHandle == 2 || this.activeHandle == 3){
					sigY *= -1;
				}


				this.width = nWidth;
				this.scaleX = this.object.scale.x * sigX;

				this.scaleY = this.object.scale.y * sigY;
				this.height = nHeight;

				this.updateBox();
				if(e.ctrlKey){
					this.scaleX = Math.round(this.scaleX/0.1)*0.1;
					this.scaleY = Math.round(this.scaleY/0.1)*0.1;
				}

				if(e.shiftKey){
					this.scaleX = this.scaleY;
				}
			}
			else{
				// side handles
				/*
				 * 4 - left
				 * 5 - top
				 * 6 - right
				 * 7 - bottom
				 */
				if(this.activeHandle == 4 && this.anchorX == 0){
					return;
				}
				if(this.activeHandle == 5 && this.anchorY == 0){
					return;
				}
				if(this.activeHandle == 6 && this.anchorX == 1){
					return;
				}
				if(this.activeHandle == 7 && this.anchorY == 1){
					return;
				}


				if(this.activeHandle % 2 == 0){
					if(this.activeHandle == 6){
						sigX *= -1;
					}
					h.x -= dx;
					h.y -= dy;

					var width = sigX * Math.sqrt(Math.pow(dw.x - h.x, 2) + Math.pow(dw.y - h.y, 2)) / this.map.scale.x;

					if(this.data.type == MT.objectTypes.TEXT && this.data.wordWrap){

						this.wordWrapWidth = Math.round(width);
					}
					else{
						this.width = width;
					}
					//this.height = sigY * Math.sqrt(Math.pow(dh.x - h.x, 2) + Math.pow(dh.y - h.y, 2)) / this.map.scale.y;

					this.scaleX = this.object.scale.x;
					//this.scaleY = this.object.scaleY;

					this.updateBox();

					if(e.ctrlKey){
						this.scaleX = Math.round(this.scaleX/0.1)*0.1;
					}

					if(e.shiftKey){
						this.scaleY = this.scaleX;
					}


					this.data.scaleX = this.object.scale.x;
					this.updateBox();
				}
				else{
					h.y -= dy;
					h.x -= dx;
					if(this.activeHandle == 7){
						sigY *= -1;
					}

					//this.width = sigX * Math.sqrt(Math.pow(dw.x - h.x, 2) + Math.pow(dw.y - h.y, 2)) / this.map.scale.x;
					this.height = sigY * Math.sqrt(Math.pow(dh.x - h.x, 2) + Math.pow(dh.y - h.y, 2)) / (this.map.scale.y);

					//this.scaleX = this.object.scaleX;
					this.scaleY = this.object.scale.y;

					this.updateBox();

					if(e.ctrlKey){
						//this.scaleX = Math.round(this.scaleX/0.1)*0.1;
						this.scaleY = Math.round(this.scaleY/0.1)*0.1;
					}

					if(e.shiftKey){
						this.scaleX = this.object.scale.x;
					}


					this.data.scaleY = this.object.scale.y;
					this.updateBox();
				}
			}

			mi.x = x;
			mi.y = y;
			this.update();
		},

		bringToTop: function(){
			this.parent.bringToTop(this.object);
		},

		moveAnchor: function(ax, ay){
			var sx = this.width * this.anchorX;
			var sy = this.height * this.anchorY;

			var parrot = this.getOffsetAngle() - this.getParentAngle();

			this.anchorX = ax;
			this.anchorY = ay;


			var dx = this.width *ax - sx;
			var dy = this.height *ay - sy;


			this.x += this.rpx(parrot, dx, dy, 0, 0);
			this.y += this.rpy(parrot, dx, dy, 0, 0);
		},

		translateAnchor: function(x, y){

			var angle = this.getOffsetAngle();
			var rot = this.object.rotation;
			var mat = this.object.worldTransform;
			var parrot = this.getParentAngle();

			var dxrt =  -x;
			var dyrt =  -y;

			this.object.rotation -= angle;


			this.updateBox();

			var h = this.handles[0];

			var dxr = this.rpx(-parrot, dxrt, dyrt, 0, 0);
			var dyr = this.rpy(-parrot, dxrt, dyrt, 0, 0);

			var dx = this.rpx(-rot, dxr, dyr, 0, 0);
			var dy = this.rpy(-rot, dxr, dyr, 0, 0);

			var hx = h.x;
			var hy = h.y;

			var adx = mat.tx - dx;
			var nax = (adx - hx)/(this.object.width * this.map.scale.x);

			var ady = mat.ty - dy;
			var nay = (ady - hy)/(this.object.height * this.map.scale.x);

			var anx = this.anchorX;
			var any = this.anchorY;

			this.anchorX = nax;
			this.anchorY = nay;

			var nx = (nax - anx) * this.object.width;
			var ny = (nay - any) * this.object.height;

			this.x += this.rpx(rot, nx, ny, 0, 0);
			this.y += this.rpy(rot, nx, ny, 0, 0);

			this.object.rotation = rot;

			this.update();
		},


		move: function(x, y){
			var angle = this.getParentAngle();
			this.x = x;
			this.y = y;
		},

		rpx: function(angle, x, y, cx, cy){

			var sin = Math.sin(angle);
			var cos = Math.cos(angle);

			return (x - cx)*cos - (y - cy)*sin + cx;
		},

		rpy: function(angle, x, y, cx, cy){
			var sin = Math.sin(angle);
			var cos = Math.cos(angle);

			return (y - cy)*cos + (x - cx)*sin + cy;
		},

		rp: function(angle, x, y, cx, cy, ref){
			var sin = Math.sin(angle);
			var cos = Math.cos(angle);
			ref.x = (x - cx)*cos - (y - cy)*sin + cx;
			ref.y = (y - cy)*cos + (x - cx)*sin + cy;
		},

		getOffsetAngle: function(){
			return this.object.rotation + this.getParentAngle();
		},

		offsetScaleX: function(){
			var par = this.object.parent;
			var scale = 1;
			while(par){
				scale *= par.scale.x;
				par = par.parent;
			}
			return scale;
		},
		offsetScaleY: function(){
			var par = this.object.parent;
			var scale = 1;
			while(par){
				scale *= par.scale.y;
				par = par.parent;
			}
			return scale;
		},
		getParentAngle: function(){
			var par = this.object.parent;
			var angle = 0;
			while(par){
				angle += par.rotation;
				par = par.parent;
			}
			return angle;
		},

		hasParent: function(parent){
			var p = parent.object;
			var t = this.object.parent;
			while(t){
				if(t == p){
					return true;
				}
				t = t.parent;
			}
			return false;
		},

		putTile: function(id, x, y){
			this.object.map.putTile(id, x, y, this.object);
			//layer.tilemap.putTile(id, x, y, layer.object);
		},
		getTile: function(x, y, tile){
			return this.object.map.getTileWorldXY(x, y, void(0), void(0), this.object);
		},

		get isHidden(){
			return this.object.visible;
		},

		set x(x){
			if(isNaN(x)){
				return;
			}
			if(this.data.x == x){
				return;
			}
			if(this.project.data.roundPosition){
				x = Math.floor(x);
			}
			this.object.x = x;
			this.data.x = x;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);

		},
		get x(){
			return this.data.x || 0;
		},

		set y(y){
			if(isNaN(y)){
				return;
			}
			if(this.data.y == y){
				return;
			}
			if(this.project.data.roundPosition){
				y = Math.floor(y);
			}
			this.object.y = y;
			this.data.y = y;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get y(){
			return this.data.y;
		},

		set angle(val){
			if(this.data.angle == val){
				return;
			}
			if(isNaN(val)){
				return;
			}
			this.object.angle = val;
			this.data.angle = val;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get angle(){
			return this.data.angle;
		},

		set anchorX(val){
			if(this.data.anchorX == val){
				return;
			}
			this.object.anchor.x = val || 0;
			this.data.anchorX = this.object.anchor.x;
			this.data.width = this.object.width;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get anchorX(){
			return this.data.anchorX || 0;
		},

		set anchorY(val){
			if(this.data.anchorY == val){
				return;
			}
			this.object.anchor.y = val || 0;
			this.data.anchorY = val;
			this.data.height = this.object.height;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get anchorY(){
			return this.data.anchorY || 0;
		},

		set width(val){
			val = parseFloat(val);
			if(isNaN(val)){
				return;
			}
			if(this.data.width == val){
				return;
			}

			this.object.width = val;
			this.data.width = val;
			this.data.scaleX = this.object.scale.x;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get width(){
			return this.data.width;
		},
		set height(val){
			val = parseFloat(val);
			if(isNaN(val)){
				return;
			}
			if(this.data.height == val){
				return;
			}

			this.object.height = val;
			this.data.height = val;
			this.data.scaleY = this.object.scale.y;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get height(){
			return this.data.height;
		},

		set scaleX(val){
			val = parseFloat(val);
			if(isNaN(val)){
				return;
			}

			if(this.data.scaleX == val){
				return;
			}
			this.object.scale.x = val;
			this.data.scaleX = val;
			this.updateBox();
			this.data.width = this.object.width;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get scaleX(){
			return this.data.scaleX;
		},

		set scaleY(val){
			val = parseFloat(val);
			if(isNaN(val)){
				return;
			}

			if(this.data.scaleY == val){
				return;
			}
			this.object.scale.y = val;
			this.data.scaleY = val;
			this.updateBox();
			this.data.height = this.object.height;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get scaleY(){
			return this.data.scaleY;
		},

		get assetId(){
			return this.data.assetId;
		},

		set assetId(id){
			/*if(isNaN(this.data.assetId)){
				throw new Error("Err");
			}*/

			if(this.data.assetId == id){
				return;
			}
			this.data.assetId = id;
			this.object.loadTexture(id);
			
			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},

		set alpha(val){
			if(this.data.alpha == val){
				return;
			}
			if(isNaN(val)){
				return;
			}
			this.object.alpha = val;
			this.data.alpha = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get alpha(){
			return this.data.alpha == void(0) ? 1 : this.data.alpha;
		},

		set frame(val){
			if(this.data.frame == val){
				return;
			}
			this.data.frame = val;
			this.object.frame = val;

			var frameData = this.map.game.cache.getFrameData(this.assetId);//_images[this.assetId];
			if(frameData.total > 1){
				this.data.frameName = frameData.getFrame(val).name;
			}
			else{
				delete this.data.frameName;
			}

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get frame(){
			if(this.data.frameName){
				var frameData = this.map.game.cache.getFrameData(this.assetId);
				var frame = frameData.getFrameByName(this.data.frameName);
				if(frame && this.data.frame != frame.index){
					console.log("Frame changed by name!");
					this.frame = frame.index;
				}

				return this.data.frame;
			}


			return this.data.frame;
		},

		set isFixedToCamera(val){
			if(this.data.isFixedToCamera == val){
				return;
			}
			this.object.fixedToCamera = val;
			this.data.isFixedToCamera = val;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get isFixedToCamera(){
			return this.data.isFixedToCamera;
		},

		/* text */
		set wordWrapWidth(val){
			if(this.data.wordWrapWidth == val){
				return;
			}
			this.object.wordWrapWidth = val;
			this.data.wordWrapWidth = val;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get wordWrapWidth(){
			return this.data.wordWrapWidth || 100;
		},

		set wordWrap(val){
			if(this.data.wordWrap == val){
				return;
			}
			this.data.wordWrap = val;
			this.object.wordWrap = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get wordWrap(){
			return this.data.wordWrap;
		},

		set style(val){
			return;
			this.data.style = val;
			this.object.style = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get style(){
			return this.data.style || {};
		},

		set font(val){
			if(this.data.style.font == this.object.font){
				return;
			}
			this.object.font = val;
			this.data.style.font = this.object.font;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},

		get font(){
			return this.object.style.font;
		},

		set fontFamily(val){
			if(this.data.style.fontFamily == val){
				return;
			}
			this.object.font = val;
			this.data.style.fontFamily = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get fontFamily(){
			return this.data.style.fontFamily;

		},

		set fontWeight(val){
			if(this.data.style.fontWeight == val){
				return;
			}

			this.object.fontWeight = val;
			this.data.style.fontWeight = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get fontWeight(){
			return this.data.style.fontWeight;
		},
		set fontSize(val){
			if(this.data.style.fontSize == val){
				return;
			}

			var scaleX = this.object.scale.x;
			var scaleY = this.object.scale.y;

			this.object.fontSize = parseInt(val);
			this.data.style.fontSize = this.object.fontSize;

			this.scaleX = scaleX;
			this.scaleY = scaleY;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get fontSize(){
			if(!this.data.style.fontSize){
				this.data.style.fontSize = this.object.fontSize;
			}
			return this.data.style.fontSize;
		},

		set align(val){
			if(this.data.align == val){
				return;
			}
			this.data.align = val;
			this.object.align = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},

		get align(){
			return this.data.align;
		},

		set fill(val){
			if(this.data.fill == val){
				return;
			}
			this.object.fill = val;
			this.data.fill = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get fill(){
			return this.data.fill || "#000000";
		},

		set stroke(val){
			if(this.data.stroke == val){
				return;
			}
			this.object.stroke = val;
			this.data.stroke = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get stroke(){
			return this.data.stroke || "#000000";
		},

		set strokeThickness(val){
			if(this.data.strokeThickness == val){
				return;
			}
			this.object.strokeThickness = val;
			this.data.strokeThickness = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},

		get strokeThickness(){
			return this.data.strokeThickness || 0;
		},

		setShadow: function(x, y, color, blur){
			if(!this.data.shadow){
				this.data.shadow = {};
			}
			else{
				if(this.data.shadow.x == x && this.data.shadow.y == y &&
					this.data.shadow.color == color && this.data.shadow.blur == blur){
					return;
				}
			}
			this.data.shadow.x = x;
			this.data.shadow.y = y;
			this.data.shadow.color = color;
			this.data.shadow.blur = blur;

			this.object.setShadow(x, y, color, blur);

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},

		get shadowColor(){
			return this.data.shadow.color || "#000000";
		},
		get shadowOffsetX(){
			return this.data.shadow.x || 0;
		},
		get shadowOffsetY(){
			return this.data.shadow.y || 0;
		},
		get shadowBlur(){
			return this.data.shadow.blur || 0;
		},


		set text(val){
			if(this.object.text == val){
				return;
			}
			this.object.text = val;
			this.data.text = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get text(){
			return this.data.text;
		},

		/* tilelayer */

		set widthInTiles(val){
			if(this.data.widthInTiles == val){
				return;
			}
			this.data.widthInTiles = val;
			this.removeLayer();
			this.createTileLayer();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get widthInTiles(){
			return this.data.widthInTiles;
		},
		set heightInTiles(val){
			if(this.data.heightInTiles == val){
				return;
			}
			this.data.heightInTiles = val;
			this.removeLayer();
			this.createTileLayer();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get heightInTiles(){
			return this.data.heightInTiles;
		},
		set tileWidth(val){
			if(this.data.tileWidth == val){
				return;
			}
			this.data.tileWidth = val;
			this.removeLayer();
			this.createTileLayer();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get tileWidth(){
			return this.data.tileWidth;
		},
		set tileHeight(val){
			if(this.data.tileHeight == val){
				return;
			}
			this.data.tileHeight = val;
			this.removeLayer();
			this.createTileLayer();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get tileHeight(){
			return this.data.tileHeight;
		},
		getTileXY: function(x, y, point){
			return this.object.getTileXY(x, y, point);
		},
		removeLayer: function(){
			this.object.destroy();
			var i = this.map.tileLayers.indexOf(this.object);
			this.map.tileLayers.splice(i, 1);
		},

		get isVisible(){
			var o = this;
			while(o.parent.magic){
				if(!o.data.isVisible){
					return false;
				}
				o = o.parent.magic;
			}

			return o.data.isVisible;
		},

		get isLocked(){
			if(this.data.isLocked){
				return true;
			}
			var o = this.parent.magic;
			while(o){
				if(o.data.isLocked){
					return true;
				}
				o = o.parent.magic;
			}

			return false;
		},

		get id(){
			return this.data.id;
		},

		get type(){
			return this.data.type;
		},

		getBounds: function(){
			return this.object.getBounds();
		},

		_mapSettings: {},
		get mapSettings(){
			if(this.data.type != MT.objectTypes.TILE_LAYER){
				return null;
			}
			else{
				this._mapSettings.gridX = this.tileWidth;
				this._mapSettings.gridY = this.tileHeight;
				this._mapSettings.gridOffsetX = this.x;
				this._mapSettings.gridOffsetY = this.y;
			}
		}

	}
);
