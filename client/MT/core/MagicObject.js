"use strict";
//MT.require("core.mat");

MT(
	MT.core.MagicObject = function(data, parent, map){
		this.data = data;
		this.parent = parent;
		this.map = map;
		this.settings = this.map.project.plugins.settings;
		
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
		
		// debug only - so we know what is missing
		Object.seal(this);
	},
	{
		radius: 3,
		activeRadius: 5,
		
		create: function(){
			
			if(this.data.contents){
				this.createGroup();
			}
			if(this.data.type == MT.objectTypes.SPRITE){
				this.createSprite();
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
			this.createTileMap();
			this.object = this.tilemap.createBlankLayer(this.data.name, this.data.widthInTiles, this.data.heightInTiles, this.data.tileWidth, this.data.tileHeight);
			this.object.fixedToCamera = this.data.isFixedToCamera;
			this.map.project.plugins.tools.tools.tiletool.updateLayer(this.object, this.data);
			this.map.tileLayers.push(this.object);
		},
		
		createTileMap: function(){
			var tileWidth = this.data.tileWidth || 64;
			var tileHeight = this.data.tileHeight || 64;
			this.tilemap = this.game.add.tilemap(null, tileWidth, tileHeight, this.data.widthInTiles, this.data.heightInTiles);
		},
   
		createGroup: function(){
			this.object = this.game.add.group();
			this.parent.add(this.object);
		},
		
		createSprite: function(){
			this.object = this.parent.create(this.data.x, this.data.y, this.data.assetId);
			this.object.anchor.x = this.data.anchorX;
			this.object.anchor.y = this.data.anchorY;
			this.object.inputEnabled = true;
			this.object.input.pixelPerfectOver = true;
			//this.object.input.stop();
			this.createBox();
		},
		
		createText: function(){
			this.object = this.game.add.text(this.data.x, this.data.y, this.data.text, this.data.style);
			this.parent.add(this.object);
			this.createBox();
			
			this.object.anchor.x = this.data.anchorX;
			this.object.anchor.y = this.data.anchorY;
			this.object.inputEnabled = true;
			this.object.input.pixelPerfectOver = false;
			
			if(this.data.style){
				this.object.style = this.data.style;
			}
			this.wordWrap = this.data.wordWrap;
			this.wordWrapWidth = this.data.wordWrapWidth;
			
			this.object.fontSize = this.data.style.fontSize;
			this.object.font = this.data.style.fontFamily || "Arial";
			this.object.fontWeight = this.data.style.fontWeight || "";
			
			if(!this.data.shadow){
				this.data.shadow = {};
			}
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
				
				this.object.x = this.data.x;
				this.object.y = this.data.y;
				
				this.object.angle = this.data.angle;
				
				if(this.data.scaleX){
					this.object.scale.x = this.data.scaleX;
					this.object.scale.y = this.data.scaleY;
				}
			}
			
			if(parent){
				this.parent = parent;
				this.parent.add(this.object);
				
			}
			
			this.updateBox();
			if(this.map.activeObject == this){
				this.settings.update();
			}
			
			if(!this.data.isVisible){
				this.hide();
			}
			else{
				this.show();
			}
		},
   
		updateBox: function(){
			if(this.data.contents || this.data.type == MT.objectTypes.TILE_LAYER){
				return;
			}
			
			var obj = this.object;
			obj.updateTransform();
			var mat = obj.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;
			
			var angle = this.getOffsetAngle();
			var x, y, dx, dy;
			
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
			if(this.activeHandle != 4){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) ;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) + obj.height*0.5;
				this.rp(angle, x, y, ax, ay, this.handles[4]);
			}
			
			// right
			if(this.activeHandle != 6){
				x = mat.tx + obj.width * (1 - obj.anchor.x) * this.map.scale.x;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) + obj.height*0.5;
				this.rp(angle, x, y, ax, ay, this.handles[6]);
			}
			
			// top
			if(this.activeHandle != 5){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) + obj.width*0.5;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) ;
				this.rp(angle, x, y, ax, ay, this.handles[5]);
			}
			// bottom
			if(this.activeHandle != 7){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) + obj.width*0.5;
				y = mat.ty + obj.height * (1 - obj.anchor.y) * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[7]);
			}
			
			var rx = ax;
			var ry = ay - this.object.height * this.map.scale.x * 0.6 - 20;
			
			if(this.activeHandle != -3){
				this.rotator.x = this.rpx(this.object.rotation, rx, ry, ax, ay);
				this.rotator.y = this.rpy(this.object.rotation, rx, ry, ax, ay);
				
				for(var i=0; i<this.handles.length; i++){
					
				}
				
			}
		},
		
		highlight: function(ctx){
			if(this.isRemoved){
				return;
			}
			var mat = this.object.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;
			ctx.save();
			ctx.translate(0.5, 0.5);
			
			if(this.data.contents){
				var bounds = this.object.getBounds();
				ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
				this.drawGroupHandle(ctx, this.object);
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
			ctx.save();
			ctx.translate(ax, ay);
			ctx.rotate(obj.rotation);
			
			ctx.strokeStyle = "#ffffff";
			
			ctx.strokeRect(- this.radius, - this.radius, this.radius*2, this.radius * 2);
			ctx.beginPath();
			ctx.moveTo(0, 0);
			
			var dx = 0;
			var dy = - this.radius*3;
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
			
		},
		
		moveObject: function(x, y, e){
			
			var mi = this.mouseInfo;
			var dx = (mi.x - x) / this.map.scale.x;
			var dy = (mi.y - y) / this.map.scale.y;
			var angle = this.getParentAngle();
			
			var dxt = this.rpx(-angle, dx, dy, 0, 0);
			var dyt = this.rpy(-angle, dx, dy, 0, 0);
			
			this.x -= dxt;
			mi.x = x;
				
			this.y -= dyt;
			mi.y = y;
			
			if(e.ctrlKey && angle == 0){
				var gx = this.map.settings.gridX;
				var gy = this.map.settings.gridY;
				
				var tx = Math.round(this.x / gx) * gx;
				var ty = Math.round(this.y / gy) * gy;
				
				
				mi.x += (tx - this.x) * this.map.scale.x;
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
			
			var h, dx, dy;
			// rotate
			if(this.activeHandle == -3){
				dx = mi.x - x;
				dy = mi.y - y;
				this.rotator.x -= dx;
				this.rotator.y -= dy;
				
				mi.x = x;
				mi.y = y;
				
				var rot = Math.atan2( mat.ty - this.rotator.y, mat.tx - this.rotator.x) - Math.PI * 0.5;
				this.object.rotation = rot;
				this.data.angle = this.object.angle;
				this.update();
				
				return;
			}
			
			// move anchor
			if(this.activeHandle == -2){
				
				var angle = this.getOffsetAngle();
				var rot = this.object.rotation;
				
				var parrot = this.getParentAngle();
				
				this.object.rotation -= angle;
				
				this.updateBox();
				
				h = this.handles[0];
				
				var ax = mat.tx;
				var ay = mat.ty;
				
				var dxrt = mi.x - x;
				var dyrt = mi.y - y;
				
				var dxr = this.rpx(-parrot, dxrt, dyrt, 0, 0);
				var dyr = this.rpy(-parrot, dxrt, dyrt, 0, 0);
				
				var dx = this.rpx(-rot, dxr, dyr, 0, 0);
				var dy = this.rpy(-rot, dxr, dyr, 0, 0);
				
				var anx = this.anchorX;
				var any = this.anchorY;
				
				var hx = h.x;
				var hy = h.y;
				
				var adx = ax - dx;
				var nax = (adx - hx)/(this.object.width * this.map.scale.x);
				
				var ady = ay - dy;
				var nay = (ady - hy)/(this.object.height * this.map.scale.x);
				
				this.anchorX = nax;
				this.anchorY = nay;
				
				var nx = (nax - anx) * this.object.width;
				var ny = (nay - any) * this.object.height;
				
				this.x += this.rpx(rot, nx, ny, 0, 0);
				this.y += this.rpy(rot, nx, ny, 0, 0);
				
				mi.x = x;
				mi.y = y;
				
				this.object.rotation = rot;
				this.update();
				return;
			}
			
			dx = mi.x - x;
			dy = mi.y - y;
			h = this.handles[this.activeHandle];
			
			
			var dw = this.handles[h.opx];
			var dh = this.handles[h.opy];
			
			
			if(this.activeHandle < 4){
				h.x -= dx;
				h.y -= dy;
			
				this.width = Math.sqrt(Math.pow(dw.x - h.x, 2) + Math.pow(dw.y - h.y, 2)) / this.map.scale.x;
				this.height = Math.sqrt(Math.pow(dh.x - h.x, 2) + Math.pow(dh.y - h.y, 2)) / this.map.scale.y;
			
				this.updateBox();
			
				this.data.scaleX = this.object.scale.x;
				this.data.scaleY = this.object.scale.y;
			}
			else{
				if(this.activeHandle % 2 == 0){
					h.x -= dx;
					h.y -= dy;
					
					this.width = Math.sqrt(Math.pow(dw.x - h.x, 2) + Math.pow(dw.y - h.y, 2)) / this.map.scale.x;
					this.height = Math.sqrt(Math.pow(dh.x - h.x, 2) + Math.pow(dh.y - h.y, 2)) / this.map.scale.y;
					
					this.updateBox();
					this.data.scaleX = this.object.scale.x;
				}
				else{
					h.y -= dy;
					h.x -= dx;
					
					this.height = Math.sqrt(Math.pow(dh.x - h.x, 2) + Math.pow(dh.y - h.y, 2)) / (this.map.scale.y);
				
					this.updateBox();
					this.data.scaleY = this.object.scale.y;
				}
			}
			
			mi.x = x;
			mi.y = y;
			this.update();
		},
   
		bringToTop: function(){
			this.parent.bringToTop(this.object);
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
		
		getParentAngle: function(){
			var par = this.object.parent;
			var angle = 0;
			while(par){
				angle += par.rotation;
				par = par.parent;
			}
			return angle;
		},
		
		get isHidden(){
			return this.object.visible;
		},
   
		set x(x){
			
			if(x == void(0) || isNaN(x)){
				throw new Error("x = nan?");
				return;
			}
			
			this.object.x = x;
			this.data.x = x;
			this.updateBox();
		},
		get x(){
			return this.data.x;
		},
		
		set y(y){
			this.object.y = y;
			this.data.y = y;
			this.updateBox();
		},
		get y(){
			return this.data.y;
		},
   
		set angle(val){
			this.object.angle = val;
			this.data.angle = val;
			this.updateBox();
		},
		get angle(){
			return this.data.angle;
		},
   
		set anchorX(val){
			this.object.anchor.x = val;
			this.data.anchorX = val;
			this.updateBox();
		},
		get anchorX(){
			return this.data.anchorX;
		},
		
		set anchorY(val){
			this.object.anchor.y = val;
			this.data.anchorY = val;
			this.data.width = this.object.width;
			this.updateBox();
		},
		get anchorY(){
			return this.data.anchorY;
		},
		
		set width(val){
			this.object.width = val;
			this.data.width = val;
			this.updateBox();
		},
		get width(){
			return this.data.width;
		},
		set height(val){
			this.object.height = val;
			this.data.height = val;
		},
		get height(){
			return this.data.height;
		},
		
		set scaleX(val){
			this.object.scale.x = val;
			this.data.scaleX = val;
			this.updateBox();
			this.data.width = this.object.width;
		},
		get scaleX(){
			return this.data.scaleX;
		},
   
		set scaleY(val){
			this.object.scale.y = val;
			this.data.scaleY = val;
			this.updateBox();
			this.data.height = this.object.height;
		},
		get scaleY(){
			return this.data.scaleY;
		},
		
		set alpha(val){
			this.object.alpha = val;
			this.data.alpha = val;
		},
		get alpha(){
			return this.data.alpha == void(0) ? 1 : this.data.alpha;
		},
		
		set frame(val){
			this.data.frame = val;
			this.object.frame = val;
		},
		get frame(){
			return this.data.frame;
		},
   
		set isFixedToCamera(val){
			this.object.fixedToCamera = val;
			this.data.isFixedToCamera = val;
			this.updateBox();
		},
		get isFixedToCamera(){
			return this.data.isFixedToCamera;
		},
		
		/* text */
		set wordWrapWidth(val){
			this.object.wordWrapWidth = val;
			this.data.wordWrapWidth = val;
			this.updateBox();
		},
		get wordWrapWidth(){
			return this.data.wordWrapWidth || 100;
		},
		
		set wordWrap(val){
			this.data.wordWrap = val;
			this.object.wordWrap = val;
		},
		get wordWrap(){
			return this.data.wordWrap;
		},
		
		set style(val){
			console.log("do not se style");
			return;
			this.data.style = val;
			this.object.style = val;
		},
		get style(){
			return this.data.style;
		},
		
		set font(val){
			this.object.font = val;
			this.data.style.font = this.object.font;
		},
   
		get font(){
			return this.object.style.font;
		},
   
		set fontFamily(val){
			this.object.font = val;
			this.data.style.fontFamily = val;
		},
		get fontFamily(){
			return this.data.style.fontFamily;
			
		},
   
		set fontWeight(val){
			this.object.fontWeight = val;
			this.data.style.fontWeight = val;
		},
		get fontWeight(){
			this.data.style.fontWeight = val;
		},
		set fontSize(val){
			this.object.fontSize = parseInt(val);
			this.data.style.fontSize = this.object.fontSize;
		},
		get fontSize(){
			if(!this.data.style.fontSize){
				this.data.style.fontSize = this.object.fontSize;
			}
			console.log("font size", this.data.style.fontSize);
			return this.data.style.fontSize;
		},
		
		set align(val){
			this.data.align = val;
			this.object.align = val;
		},
   
		get align(){
			return this.data.align;
		},
		
		set fill(val){
			this.object.fill = val;
			this.data.fill = val;
		},
		get fill(){
			return this.data.fill || "#000000";
		},
		
		set stroke(val){
			this.object.stroke = val;
			this.data.stroke = val;
		},
		get stroke(){
			return this.data.stroke || "#000000";
		},
		
		set strokeThickness(val){
			this.object.strokeThickness = val;
			this.data.strokeThickness = val;
		},
   
		get strokeThickness(){
			return this.data.strokeThickness || 0;
		},
		
		setShadow: function(x, y, color, blur){
			if(!this.data.shadow){
				this.data.shadow = {};
			}
			
			this.data.shadow.x = x;
			this.data.shadow.y = y;
			this.data.shadow.color = color;
			this.data.shadow.blur = blur;
			
			this.object.setShadow(x, y, color, blur);
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
			this.object.text = val;
			this.data.text = val;
		},
		get text(){
			return this.data.text;
		},
		
		/* tilelayer */
		
		set widthInTiles(val){
			this.data.widthInTiles = val;
			this.removeLayer();
			this.createTileLayer();
		},
		get widthInTiles(){
			return this.data.widthInTiles;
		},
		set heightInTiles(val){
			this.data.heightInTiles = val;
			this.removeLayer();
			this.createTileLayer();
		},
		get heightInTiles(){
			return this.data.heightInTiles;
		},
		set tileWidth(val){
			this.data.tileWidth = val;
			this.removeLayer();
			this.createTileLayer();
		},
		get tileWidth(){
			return this.data.tileWidth;
		},
		set tileHeight(val){
			this.data.tileHeight = val;
			this.removeLayer();
			this.createTileLayer();
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
			if(this.data.isVisible){
				return true;
			}
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
		}
		
	}
);