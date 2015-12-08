"use strict";
(function(){
	var phaserSrc = "js/phaser/";
	//var pixiSrc = phaserSrc;
	phaserSrc += (window.release ? "phaser-arcade-physics.min-2.4.4.js" : "phaser-arcade-physics-2.4.4.js");
	//pixiSrc += (window.release ? "pixi.min.js" : "pixi.js");

	MT.requireFilesSync([
		phaserSrc, "js/phaser/phaserHacks.js"
	]);

	/*
	MT.requireFile(phaserSrc, function(){
		MT.requireFile("js/phaser/pixi.js");
		MT.requireFile("js/phaser/geom.js", function(){
			MT.requireFile("js/phaser/components.js", function(){
				MT.requireFile("js/phaser/text.js");
				MT.requireFile("js/phaserHacks.js");
			});
		});
	});
	*/
})();
MT.require("core.Helper");
MT.require("core.Selector");
MT.require("core.MagicObject");

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


		this.loadedObjects = [];

		this.tileLayers = [];

		this.dist = {};
		this.cache = {};

		this.selection = new Phaser.Rectangle();

		this.selector = new MT.core.Selector();

		this.helperBoxSize = 6;


		this.settings = {
			cameraX: 0,
			cameraY: 0,

			worldWidth: 800,
			worldHeight: 480,

			viewportWidth: 800,
			viewportHeight: 480,

			scaleMode: "SHOW_ALL",

			gridX: 32,
			gridY: 32,

			gridOffsetX: 0,
			gridOffsetY: 0,

			showGrid: 1,
			gridOpacity: 0.3,
			backgroundColor: "#111111",

			movieInfo: {
				fps: 60,
				lastFrame: 60
			},
			pixelPerfectPicking: 1
		};


		this.zoom = 1;

		window.map = this;
	},
	{
		_mousedown: false,

		setZoom: function(zoom){
			this.zoom = 1/zoom;
			this.resize();

		},

		/* basic pluginf fns */
		initUI: function(ui){
			this.ui = ui;

			var that = this;

			this.panel = ui.createPanel("Map editor");
			this.panel.on("show", function(){
				that.ui.refresh();
			});
			ui.setCenter(this.panel);

			this.ui.on(ui.events.RESIZE,function(){
				that.resize();
			});

			this.selector.on("unselect", function(obj){
				that.emit(MT.OBJECT_UNSELECTED, obj);
			});

			this.createMap();

			var tools = this.project.plugins.tools;
			var om = this.project.plugins.objectmanager;

			var mdown = false;

			ui.events.on(ui.events.MOUSEDOWN, function(e){
				if(e.target != game.canvas){
					return;
				}
				mdown = true;
				that.handleMouseDown(e);
			});

			this.isCtrlDown = false;

			ui.events.on(ui.events.MOUSEUP, function(e){
				that.handleMouseUp(e);
				mdown = false;
			});


			var dx = 0;
			var dy = 0;

			ui.events.on(ui.events.MOUSEMOVE, function(e){
				if( e.target != game.canvas && e.button != 2 && !mdown){
					return;
				}

				//strange chrome bug
				if(that.handleMouseMove === void(0)){
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

				if(e.which == MT.keys.G){
					var first = that.selector.get(0)
					if(first && first.parent && first.parent.magic){
						that.activeObject = first.parent.magic;
						that.selector.clear();
						that.selector.add(that.activeObject);
					}
				}
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

			this.project.plugins.objectmanager.on(MT.OBJECT_DELETED, function(id){
				var tmp;
				for(var i=0; i<that.loadedObjects.length; i++){
					tmp = that.loadedObjects[i];

					if(tmp.id == id){
						that.loadedObjects.splice(i, 1);
						that.cache[id] = null;
						tmp.remove();
						if(that.activeObject == tmp){
							that.activeObject = null;
						}
						return;
					}
				}

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

			var canvas, ctx = null, FG = null;
			var drawObjects = function(obj){
				obj.highlight(ctx);
			};

			var mode = Phaser.CANVAS;
			if(this.project.data.webGl){
				mode = Phaser.AUTO;
			}

			var game = this.game = window.game = new Phaser.Game(800, 600, mode, '', {
				preload: function(){
					game.stage.disableVisibilityChange = true;
					var c = game.canvas;
					if(!c.parentNode){
						return;
					}
					c.parentNode.removeChild(c);
					that.panel.content.el.appendChild(c);
					c.style.position = "relative";
					that.panel.content.style.overflow = "hidden";

				},
				create: function(){
					that.resize();
					that.scale = game.camera.scale;

					that.setCameraBounds();
					that.postUpdateSetting();

					// create canvas for grid BG
					that.fgcanvas = canvas = document.createElement("canvas");
					canvas.width = game.canvas.width;
					canvas.height = game.canvas.height;
					game.cache.addImage("__gridBG","__gridBG", canvas);
					ctx = canvas.getContext("2d");
					ctx.fillStyle = "#ff0000";
					ctx.fillRect(10, 10, 40, 50);
					// end grid canvas
					// grid sprite
					FG = window.FG = game.add.sprite(0, 0, "__gridBG", 0);
					FG.fixedToCamera = true;
					FG.bringToTop();
					// end grid sprite


					var graphics = window.graphics = new Phaser.Graphics();
					// begin a green fill..
					graphics.beginFill(0xffffff);
					// top
					graphics.drawRect(0, 0, that.game.canvas.width, -that.game.camera.y);
					// right
					graphics.drawRect(that.settings.viewportWidth, -that.game.camera.y, that.game.canvas.width, that.settings.viewportHeight);
					// bottom
					graphics.drawRect(0, that.settings.viewportWidth, that.game.canvas.width, that.game.canvas.height);
					// left
					graphics.drawRect(0, -that.game.camera.y, -that.game.camera.x, that.settings.viewportHeight);
					// end the fill
					graphics.endFill();
					graphics.alpha = 0.05;

					// TODO: bug
					game.stage.addChild(graphics);
					graphics.game = game;

					//graphics.postUpdate = graphics.preUpdate = function(){};

					graphics._update = function(){
						//graphics.x = -that.game.camera.x;
						//graphics.y = -that.game.camera.y;
						var shape;
						//update top
						//graphics.graphicsData[0].points[2] = that.game.canvas.width;
						//graphics.graphicsData[0].points[3] = -that.game.camera.y;
						shape = graphics.graphicsData[0].shape;
						shape.width = that.game.canvas.width;
						shape.height = -that.game.camera.y;

						// update right

						/*graphics.graphicsData[1].points[0] = (that.settings.viewportWidth* that.game.camera.scale.x - that.game.camera.x) ;
						graphics.graphicsData[1].points[1] = -that.game.camera.y;
						graphics.graphicsData[1].points[2] = that.game.canvas.width + that.game.camera.x;
						graphics.graphicsData[1].points[3] = that.settings.viewportHeight* that.game.camera.scale.y;
						*/


						shape = graphics.graphicsData[1].shape;
						shape.x = (that.settings.viewportWidth* that.game.camera.scale.x - that.game.camera.x);
						shape.y = -that.game.camera.y;
						shape.width = that.game.canvas.width + that.game.camera.x;
						shape.height = that.settings.viewportHeight* that.game.camera.scale.y;



						// update bottom
						/*graphics.graphicsData[2].points[1] = that.settings.viewportHeight* that.game.camera.scale.y - that.game.camera.y;
						graphics.graphicsData[2].points[2] = that.game.canvas.width;
						graphics.graphicsData[2].points[3] = that.game.canvas.height + that.game.camera.y;
						*/
						shape = graphics.graphicsData[2].shape;
						shape.y = that.settings.viewportHeight* that.game.camera.scale.y - that.game.camera.y;
						shape.width = that.game.canvas.width;
						shape.height = that.game.canvas.height + that.game.camera.y;


						// update left
						/*
						graphics.graphicsData[3].points[1] = -that.game.camera.y;
						graphics.graphicsData[3].points[2] = -that.game.camera.x;
						graphics.graphicsData[3].points[3] = that.settings.viewportHeight* that.game.camera.scale.y;
						*/
						shape = graphics.graphicsData[3].shape;
						shape.y = -that.game.camera.y;
						shape.width = -that.game.camera.x;
						shape.height = that.settings.viewportHeight* that.game.camera.scale.y;
						//graphics.drawRect(0, 0, that.settings.width, that.settings.height);

						// buggy buggy
						graphics.webGLDirty = true;
						graphics.clearDirty = true;
					};

					// add it the stage so we see it on our screens..

					//graphics.parent = map.game.stage;

				},


				preRender: function(){
					//return;

					//FG.width = canvas.width;
					//FG.height = canvas.height;
					//console.log("PRE render");
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					that.drawGrid(ctx);


					that.selector.forEach(drawObjects);

					that.drawSelection(ctx);

					that.highlightDublicates(ctx);

					that.drawPhysics(ctx);

					FG.bringToTop();
					FG.texture.baseTexture.unloadFromGPU();
					//FG.loadTexture("__gridBG")
					FG.scale.set(1/game.camera.scale.x, 1/game.camera.scale.y);
					// force PIXI to reload Texture

					//
					graphics._update();
				},

				update: function(){

				},
			});


		},
		update: function(){
			var tmp;
			return;
			for(var i=0; i<this.loadedObjects.length; i++){
				tmp = this.loadedObjects[i];
				tmp.updateBox();
			}
		},

		resize: function(){
			if(!this.game || !this.game.world){
				return;
			}

			this.game.width = this.panel.content.el.offsetWidth;
			this.game.height = this.panel.content.el.offsetHeight;

			if(window.FG){
				this.fgcanvas.width = FG.texture.baseTexture.width = this.game.canvas.width;// / game.camera.scale.x;
				this.fgcanvas.height = FG.texture.baseTexture.height = this.game.canvas.height;//  / game.camera.scale.y;
				FG.texture.frame.width = FG.texture.crop.width = this.game.width;
				FG.texture.frame.height = FG.texture.crop.height = this.game.height;
			}

			this.game.renderer.resize(this.game.width, this.game.height);

			this.setCameraBounds();
			this.reloadObjectsDelayed();
		},
		_reloadDelay: 0,
		reloadObjectsDelayed: function(){
			if(this._reloadDelay){
				window.clearTimeout(this._reloadDelay);
			}
			var that = this;
			this._reloadDelay = window.setTimeout(function(){
				that._reloadDelay = 0;
				that.reloadObjects();
			}, 500);
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
			this.project.plugins.settings.update();
		},

		postUpdateSetting: function(){
			this.game.width = this.settings.worldWidth;
			this.game.height = this.settings.worldHeight;
			this.setCameraBounds();

			this.game.camera.x = this.settings.cameraX;
			this.game.camera.y = this.settings.cameraY;

			var tmp = this.settings.backgroundColor.substring(1);
			var bg = parseInt(tmp, 16);

			if(this.game.stage.backgroundColor != bg){
				this.game.stage.setBackgroundColor(bg);
			}

			this.update();
		},

		/* drawing fns */
		drawGrid: function(ctx){
			if(!this.settings.showGrid || this.settings.gridOpacity == 0){
				return;
			}

			var alpha = ctx.globalAlpha;

			var g = 0;
			var game = this.game;


			ctx.globalAlpha = this.settings.gridOpacity;

			ctx.save();

			ctx.scale(this.game.camera.scale.x, this.game.camera.scale.y);

			ctx.beginPath();

			var bg = game.stage.backgroundColor;
			var inv = 0xffffff;//parseInt("FFFFFF", 16);
			var xx = (inv - bg).toString(16);
			while(xx.length < 6){
				xx = "0"+xx;
			}

			if(parseInt(xx, 16) - bg < 10){
				xx = "#000000";
			}

			ctx.strokeStyle = "#"+xx;

			var offx = this.settings.gridOffsetX % this.settings.gridX - this.settings.gridX;
			var offy = this.settings.gridOffsetY % this.settings.gridY - this.settings.gridY;

			var ox = game.camera.x/this.scale.x % this.settings.gridX - offx;
			var oy = game.camera.y/this.scale.y % this.settings.gridY - offy;

			var width = game.canvas.width/game.camera.scale.x - offx;
			var height = game.canvas.height/game.camera.scale.y - offy;



			g = this.settings.gridX;

			ctx.lineWidth = 0.2;

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
			ctx.beginPath();

			ctx.moveTo(0, -game.camera.y/this.scale.y);
			ctx.lineTo(width, -game.camera.y/this.scale.y);

			ctx.moveTo(-game.camera.x/this.scale.x, 0);
			ctx.lineTo(-game.camera.x/this.scale.x, height);


			ctx.stroke();
			ctx.restore();

			ctx.globalAlpha = alpha;
		},

		highlightObject: function(ctx, obj){
			if(!obj){
				return;
			}

			if(!obj.game || !obj.parent){
				obj = this.getById(obj.id);
				if(!obj){
					return;
				}
			}

			if(!this.isVisible(obj)){
				return;
			}

			/*var matrix = obj.xxx.matrix;
			if(!matrix){
				matrix = [1, 0, 0, 1, 0, 0, 0, 0];
				obj.xxx.matrix = matrix;

			}*/

			var alpha = ctx.globalAlpha;

			var bounds = obj.getBounds();
			var group = null;

			if(obj.type == MT.objectTypes.GROUP){
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

				if(obj.data.type == MT.objectTypes.TEXT){
					var width = bounds.width;
					if(obj.wordWrap){
						width = obj.wordWrapWidth*this.game.camera.scale.x | 0;

						ctx.strokeRect(bounds.x - off | 0, sy + bounds.height*0.5 | 0, off, off);
						ctx.strokeRect(bounds.x + width | 0, sy + bounds.height*0.5 | 0, off, off);

					}

					ctx.strokeRect(bounds.x | 0, bounds.y | 0, width | 0, bounds.height | 0);
				}
				else{
					if(obj.type == Phaser.SPRITE){
						obj.updateTransform();
						var mat = obj.worldTransform;
						var ax = mat.tx;
						var ay = mat.ty;
						var angle = obj.rotation;
						var par = obj.parent;
						while(par){
							angle += par.rotation;
							par = par.parent;
						}

						var x, y, dx, dy;

						ctx.strokeStyle = "#ffee22";
						ctx.beginPath();
						ctx.arc(ax, ay, 5, 0, 2*Math.PI);
						ctx.stroke();


						ctx.strokeStyle = "#ff0000";
						// top left
						x = mat.tx - obj.width*(obj.anchor.x);
						y = mat.ty - obj.height*(obj.anchor.y);

						dx = this.rpx(angle, x, y, ax, ay);
						dy = this.rpy(angle, x, y, ax, ay);
						ctx.beginPath();
						ctx.arc(dx, dy, 5, 0, 2*Math.PI);
						ctx.stroke();


						// top right
						x = mat.tx + obj.width*(1-obj.anchor.x);
						y = mat.ty - obj.height*(obj.anchor.y);

						dx = this.rpx(angle, x, y, ax, ay);
						dy = this.rpy(angle, x, y, ax, ay);
						ctx.beginPath();
						ctx.arc(dx, dy, 5, 0, 2*Math.PI);
						ctx.stroke();


						// bottom left
						x = mat.tx - obj.width*(obj.anchor.x);
						y = mat.ty + obj.height*(1 - obj.anchor.y);

						dx = this.rpx(angle, x, y, ax, ay);
						dy = this.rpy(angle, x, y, ax, ay);
						ctx.beginPath();
						ctx.arc(dx, dy, 5, 0, 2*Math.PI);
						ctx.stroke();

						// bottom right
						x = mat.tx + obj.width*(1- obj.anchor.x);
						y = mat.ty + obj.height*(1- obj.anchor.y);

						dx = this.rpx(angle, x, y, ax, ay);
						dy = this.rpy(angle, x, y, ax, ay);
						ctx.beginPath();
						ctx.arc(dx, dy, 5, 0, 2*Math.PI);
						ctx.stroke();

						return;

						/*
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

						//if(this.tools.activeTool.resize){
							ctx.strokeRect(sx, sy, off, off);
							ctx.strokeRect(sx, dy, off, off);
							ctx.strokeRect(dx, sy, off, off);
							ctx.strokeRect(dx, dy, off, off);
						/*}
						else{
							var d =  Math.sqrt((dx - sx)*(dx - sx) + (dy - sy)*(dy - sy)) * 0.02;

							sx += off*0.5 + d;
							sy += off*0.5 + d;
							dx += off*0.5 - d;
							dy += off*0.5 - d;


							ctx.beginPath();
							ctx.arc(sx, sy, 10, 1*Math.PI, 1.5*Math.PI);
							ctx.stroke();

							ctx.beginPath();
							ctx.arc(sx, dy, 10, 0.5*Math.PI, 1.0*Math.PI);
							ctx.stroke();

							ctx.beginPath();
							ctx.arc(dx, sy, 10, 1.5*Math.PI, 2*Math.PI);
							ctx.stroke();

							ctx.beginPath();
							ctx.arc(dx, dy, 10, 0*Math.PI, 0.5*Math.PI);
							ctx.stroke();
						}

						var ax = obj.scale.x > 0 ? obj.anchor.x : 1 - obj.anchor.x;
						var ay = obj.scale.y > 0 ? obj.anchor.y : 1 - obj.anchor.y;

						var tx = (obj.x* this.scale.x) - this.game.camera.x;
						var ty = (obj.y* this.scale.x) - this.game.camera.y ;

						/*
						tx = tx;
						ty = ty * this.scale.x;

						ctx.save()
						ctx.beginPath();
						//ctx.scale(this.scale.x, this.scale.x);
						ctx.translate(tx, ty);
						ctx.rotate(obj.rotation);

						ctx.strokeStyle = "#ffaa00";
						ctx.fillStyle = "rgba(0,0,0,0.5)";

						ctx.arc(0 , 0, off*0.5, 0, 2*Math.PI);
						ctx.fill();
						ctx.stroke();

						var h = -obj.height*this.scale.x*0.5;
						var w = -obj.width*this.scale.x*0.5
						var height = -50 - Math.sqrt(h*h+w*w);

						ctx.beginPath();
						ctx.moveTo(0, 0);
						ctx.lineTo(0, height + off*0.5);
						ctx.stroke();

						ctx.strokeRect(-off*0.5, height - off*0.5, off, off);



						ctx.restore();

						*/

					}

					else{ //(obj.type == Phaser.GROUP ){
						ctx.strokeRect(bounds.x | 0, bounds.y | 0, bounds.width | 0, bounds.height | 0);
					}
					if(obj.type != Phaser.TILE_LAYER){
					//	ctx.strokeRect((bounds.x  - this.game.camera.x) | 0, (bounds.y - this.game.camera.y) | 0 , bounds.width | 0, bounds.height | 0);
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

		drawPhysics: function(ctx){
			if(!this.enabledPhysics){
				return;
			}
			for(var i=0; i<this.loadedObjects.length; i++){
				this.drawPhysicsBody(ctx, this.loadedObjects[i]);
			}
		},

		drawPhysicsBody: function(ctx, obj){

			if(!obj){
				return;
			}

			if(!obj.game || !obj.parent){
				obj = this.getById(obj.id);
				if(!obj){
					return;
				}
			}

			if(!obj.isVisible){
				return;
			}
			if(obj.type == MT.objectTypes.GROUP){
				return;
			}

			var p = obj.data.physics;
			if(!p || !p.enable){
				var pp = obj.object.parent;
				if(obj.parent == obj.game.world){
					pp = this.settings.physics;
				}
				else{
					pp = pp.magic.data.physics;
				}
				if(!pp || !pp.enable){
					return;
				}
				p = pp;
			}


			var alpha = ctx.globalAlpha;
			//this.object.updateTransform();

			var mat = obj.object.worldTransform

			var x = mat.tx;
			var y = mat.ty;

			ctx.save();

			ctx.fillStyle = "rgb(100,200,70)";
			ctx.globalAlpha = 0.2;

			var w = obj.width;
			var h = obj.height;

			if(p.size.width > 0){
				w = p.size.width;
			}
			if(p.size.height > 0){
				h = p.size.height;
			}

			w = w * obj.scaleX;
			h = h * obj.scaleY;

			ctx.translate(mat.tx, mat.ty);
			ctx.rotate(obj.object.rotation);
			ctx.scale(this.scale.x, this.scale.y);

			//ctx.setTransform(mat.a, -mat.b, -mat.c, mat.d, mat.tx, mat.ty);

			ctx.fillRect(-w*obj.object.anchor.x + p.size.offsetX,-h*obj.object.anchor.y + p.size.offsetY, w, h);
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
			ctx.fillStyle = "rgba(150, 70, 20, 0.3)";
			for(var j=0; j<this.loadedObjects.length; j++){
				o1 = this.loadedObjects[j];
				if(!o1.isVisible || o1.type == MT.objectTypes.GROUP){
					continue;
				}
				for(var i=j; i<this.loadedObjects.length; i++){
					o2 = this.loadedObjects[i];
					if(o1 == o2){
						continue;
					}
					if(o1.x == o2.x && o1.y == o2.y && o1.assetId == o2.assetId && o1.width == o2.width && o1.data.type == o2.data.type){
						if(o1.parent == o2.parent){
							bounds = o1.object.getBounds();
							ctx.fillRect(bounds.x | 0, bounds.y | 0, bounds.width | 0, bounds.height | 0);
						}
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
				this.addAtlas(asset, null, null, cb);
				return;
			}

			this.loadImage(path + "?" + Date.now(), function(){
				if(asset.width != asset.frameWidth || asset.width != asset.frameHeight){
					that.game.cache.addSpriteSheet(asset.id, asset.__image, this, asset.frameWidth, asset.frameHeight, asset.frameMax, asset.margin, asset.spacing);
				}
				else{
					that.game.cache.addImage(asset.id, asset.__image, this);
					console.log("added", asset.id);
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
					cb(xhr.responseText);
				}
			};
			xhr.onerror = function(){
				console.error("couldn't load asset", src);
				cb();
			};
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.send(null);
		},

		loadImage: function(src, cb){
			var image = new Image();
			image.onload = cb;
			image.onerror = function(){
				console.error("couldn't load asset", src);
				cb();
			};
			image.src = src;
		},



		addAtlas: function(asset, atlasImage, atlasData, cb){
			var ext = asset.atlas.split(".").pop().toLowerCase();
			var that = this;
			var path = this.project.path + "/" + asset.__image;


			var setImage = function(data, type, image){
				that.game.cache.addTextureAtlas(asset.id, asset.__image, image, data, type);
				that.findAtlasNames(asset.id);
				if(asset.type != type){
					asset.type = type;
					that.project.plugins.assetmanager.updateData();
				}
				if(cb){
					cb();
				}
			};


			var setData = function(dataString){
				var data = null;
				var type = Phaser.Loader.TEXTURE_ATLAS_XML_STARLING;
				/*
					* Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY
					* Phaser.Loader.TEXTURE_ATLAS_JSON_HASH
					* Phaser.Loader.TEXTURE_ATLAS_XML_STARLING
					*/
				if(ext == "json"){
					data = that.parseJSON(dataString);
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
					if(atlasImage == void(0)){
						that.loadImage(path + "?" + Date.now(), function(){
							setImage(data, type, this);
						});
					}
					else{
						setImage(data, type);
					}
				}
			};

			if(atlasData == void(0)){
				MT.loader.get(that.project.path + "/" + asset.atlas+"?"+Date.now(), setData);
			}
			else{
				setData(atlasData);
			}
		},


		atlasNames: {},

		findAtlasNames: function(id){
			if(!this.game.cache.checkImageKey(id)){
				console.error("Failed to parse atlas image");
				return;
			}
			else if( !this.game.cache.getFrameData(id) ){
				console.error("Failed to parse atlas frame data");
				return;
			}
			var frameData = this.game.cache.getFrameData(id);
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
			// hack
			//this.game.cache._images[id];
			this.game.cache.removeImage(id, false);

			var img = PIXI.BaseTextureCache[id];
			if(img){
				img.destroy();
			}

			delete this.atlasNames[id];
		},

		checkId: function(){
			var o = null;
			for(var i=0; i<this.objects.length; i++){
				o = this.objects[i];
				for(var j=0; j<this.objects.length; j++){
					if(o == this.objects[j]){
						continue;
					}
					if(o.id == this.objects[j].id){
						console.error("dublicate id");
					}
				}
			}
		},

		_addTimeout: 0,
		lastAddedObjects: null,
		addObjects: function(objs, group){

			this.lastAddedObjects = objs;

			// check if assets is loaded - if not - call again this method after a while
			if(!this.isAssetsAdded){
				var that = this;
				if(this._addTimeout){
					window.clearTimeout(this._addTimeout);
					this._addTimeout = 0;
				}

				this._addTimeout = window.setTimeout(function(){
					that.addObjects(objs, group);
					that._addTimeout = 0;
				}, 100);
				return;
			}
			var tmp;
			for(var i=0; i< this.loadedObjects.length; i++){
				tmp = this.loadedObjects[i];
				tmp.isRemoved = true;
			}

			group = group || game.world;
			this._addObjects(objs, group);

			if(this.tools.tmpObject){
				this.tools.tmpObject.bringToTop();
			}

			for(var i=0; i< this.loadedObjects.length; i++){
				tmp = this.loadedObjects[i];
				if(tmp.isRemoved){
					this.loadedObjects.splice(i, 1);
					this.cache[tmp.id] = null;
					tmp.remove();
					i--;
				}
			}
			this.emit(this, MT.MAP_OBECTS_ADDED);
			return;
		},

		_destroyObject: function(object){
			object.destroy(true);
		},

		_addObjects: function(objs, group){
			var tmp, k=0, o;

			for(var i=objs.length-1; i>-1; i--){
				o = objs[i];
				tmp = this.getById(o.id);

				if(!tmp ){
					tmp = new MT.core.MagicObject(o, group, this);
					this.cache[o.id] = tmp;
					this.loadedObjects.push(tmp);
				}

				tmp.isRemoved = false;
				tmp.update(o.data, group);

				tmp.object.visible = tmp.isVisible;
				//tmp.object.z = i;

				tmp.bringToTop();
				// handle group and parents
				if(tmp.data.contents){
					this._addObjects(tmp.data.contents, tmp.object);
				}
			}
		},

		resort: function(){
			var tmp;
			/*for(var i=0; i<this.loadedObjects.length; i++){
				tmp = this.loadedObjects[i];
				tmp.bringToTop();
			}*/

			if(this.tools.tmpObject){
				this.tools.tmpObject.bringToTop();
			}
		},

		addGroup: function(obj){
			console.error("removed");
			return;

			var group = this.game.add.group();
			group = obj;

			this.groups.push(group);

			group.x = obj.x;
			group.y = obj.y;

			if(obj.angle){
				group.angle = obj.angle;
			}

			group.visible = !!obj.isVisible;

			//group.fixedToCamera = !!obj.isFixedToCamera;

			return group;
		},


		/* TODO: clean up - and seperate object types by corresponding tools*/
		addObject: function(obj, group){
			console.error("removed - addObject");
			return;
			var oo = null;
			var od = null;
			for(var i=0; i<this.oldObjects.length; i++){
				od = this.oldObjects[i];
				oo = this.oldObjects[i].xxx;
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
						od.text = obj.text || obj.name;
						od.setStyle(obj.style);
					}

					if(oo.type == MT.objectTypes.TILE_LAYER){
						od = this.updateTileMap(obj, od);
						od.xxx = obj;
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
				t.xxx = obj;
				this.objects.push(t);
				return t;
			}

			if(obj.type == MT.objectTypes.TILE_LAYER){
				var t = this.addTileLayer(obj);
				t.xxx = obj;
				this.objects.push(t);
				this.project.plugins.tools.tools.tiletool.updateLayer(t);
				this.tileLayers.push(t);
				return t;
			}

			var sp = this.createSprite(obj, group);
			this.objects.push(sp);

			return sp;
		},

		reloadObjects: function(){
			if(this.lastAddedObjects  && !this._addTimeout){
				this.addObjects(this.lastAddedObjects);
			}
		},

		_activeObject: null,
		_justSelected: null,

		get activeObject(){
			if(!this._activeObject){
				return null;
			}

			if(!this._activeObject.game){
				this._activeObject = this.getById(this._activeObject.xxx.id);
			}

			return this._activeObject;
		},
		savedSettings: null,
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

			this.project.plugins.settings.updateScene(this.settings);

			this.update();
		},


		dist: null,

		updateMouseInfo: function(e){
			var that = this;
			this.selector.forEach(function(obj){
				obj.mouseInfo.x = e.x;// - that.ox;
				obj.mouseInfo.y = e.y;// - that.oy;
			});

		},

		_objectMove: function(e, mo){

			if(!mo){
				var that = this;
				this.selector.forEach(function(obj){
					that._objectMove(e, obj);
				});
				return;
			}
			var x = this.ui.events.mouse.mx + this.ox;
			var y = this.ui.events.mouse.my + this.oy;

			var m = this.ui.events.mouse;

			//mo.mouseInfo.x = m.x
			//mo.mouseInfo.y = m.y

			mo.moveObject(m.x + m.mx, m.y + m.my, e);

			return;
		},

		enabledPhysics: false,
		enablePhysics: function(){
			this.enabledPhysics = true;
		},
		disablePhysics: function(){
			this.enabledPhysics= false;
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
			else if(e.shiftKey){
				inc *= 10;
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

			//this.project.plugins.settings.updateObjects(object);
			//this.sync(object);
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

		sync: function(sprite, obj){
			this.sendDelayed("updateData", this.settings, 100);
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
			if( this.received ){
				return;
			}
			this.received = true;
			this.updateSettings(obj);
			this.emit("update");
		},

		createActiveObject: function(obj){
			this.activeObject = this.addObject(obj, this.game.world, true);
			return this.activeObject;
		},

		pickObject: function(x, y){
			x += this.game.camera.x;
			y += this.game.camera.y;
			var obj;

			// chek if we are picking already selected object
			if(this.activeObject){
				if(this.activeObject.type == MT.objectTypes.GROUP){
				//if(!this.ui.events.mouse.lastEvent.shiftKey){
					if(this.checkBounds(this.activeObject, x, y)){
						return this.activeObject;
					}
				}

				if(this.activeObject.type == MT.objectTypes.SPRITE || this.activeObject.type == MT.objectTypes.TEXT){
					obj = this._pick(this.activeObject, x, y);
					if(obj){
						return obj;
					}
				}
			}

			var p = new Phaser.Point(0,0);
			var pointer = this.game.input.activePointer;

			for(var i=this.loadedObjects.length-1; i>-1; i--){
				obj = this.loadedObjects[i];
				var ret = this._pick(obj, x, y, true);
				if(ret){
					return ret;
				}
			}

			return null;
		},

		_pick: function(obj, x, y, checkGroup){
			var bounds;
			if(!obj.isVisible){
				return null;;
			}
			if(obj.type == MT.objectTypes.GROUP){
				return null;;
			}
			if(obj.isLocked){
				return null;;
			}

			var ob = this.checkBounds(obj, x, y);

			if(!ob){
				return null;
			}
			// check bounds
			if(!obj.object.input || !this.settings.pixelPerfectPicking){
				return ob;
			}

			if( obj.object.input.checkPointerOver(this.game.input.activePointer)){
				/*if(this.ui.events.mouse.lastEvent.ctrlKey && !this.activeObject && checkGroup){
					if(obj.parent && obj.parent.magic){
						this.activeObject = obj.parent.magic;
					}
					else{
						this.activeObject = obj;
					}
					return this.activeObject
				}*/

				this.activeObject = obj;
				return obj;
			}
			return null;

		},

		checkBounds: function(obj, x, y){
			var bounds = obj.object.getBounds();
			if(bounds.contains(x, y)){
				if(obj.data.type == MT.objectTypes.TILE_LAYER){
					if(obj.getTile(x + this.game.camera.x, y + this.game.camera.y)){
						return obj;
					}
					return null;
				}
				return obj;
			}
			return null;
		},


		selectRect: function(rect, clear){
			rect.x -= this.game.camera.x;
			rect.y -= this.game.camera.y;

			var box = null;
			var obj = null;

			for(var i=0; i<this.loadedObjects.length; i++){
				obj = this.loadedObjects[i];
				if(obj.data.type == MT.objectTypes.GROUP){
					continue;
				}
				var sprite = obj.object;

				if(obj.type == MT.objectTypes.GROUP){
					continue;
				}

				if(!obj.isVisible){
					continue;
				}
				if(obj.isLocked){
					continue;
				}


				box = sprite.getBounds();
				if(box.intersects(rect)){
					this.selector.add(obj);
				}
				else if(clear){
					this.selector.remove(obj);
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

		createSprite: function(obj, group){
			var game = this.game;
			group = group || game.world;

			var sp = null;
			if(!game.cache.getImage(obj.assetId)){
				obj.assetId = "__missing";
			}


			sp = group.create(obj.x, obj.y, obj.assetId);
			return sp;
		},

		isGroupSelected: function(group){
			return false;
		},

		/* TODO: refactor so all can use MagicObject */
		getById: function(id){

			return this.cache[id];

			/*for(var i=0; i<this.loadedObjects.length; i++){
				if(!this.loadedObjects[i].data){
					console.warn("smth wrong");
					continue;
				}
				if(this.loadedObjects[i].data.id == id){
					return this.loadedObjects[i];
				}
			}*/
		}
	}
);
