MT.requireFile("js/phaser.js");
MT.require("core.Helper");

MT(
	MT.plugins.MapEditor = function(project){
		this.selectedObject = null;
		var that = this;
		this.project = project;
		
		this.assets = [];
		this.objects = [];
		this.groups = [];
		
		this.grid = 64;
		
		window.map = this;
	},
	{
		
		createMap: function(){
			
			if(this.game){
				this.game.canvas.parentNode.removeChild(this.game.canvas);
				this.game.destroy();
			}
			
			var that = this;
			
			console.log("new map loaded");
			var that = this;
			
			window.sprite = null;
			
			this.activeObject = null;
			
			var ctx = null;
			
			var game = this.game = window.game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { 
				preload: function(){
					var c = game.canvas;
					c.parentNode.removeChild(c);
					that.project.ui.center.appendChild(c);
					
				},
				create: function(){
					game.input.onDown.add(function(e){
						if(e.button !== 0){
							console.log(e.button);
							return;
						}
						
						if(e.targetObject){
							that.activeObject = e.targetObject.sprite;
						}
						else{
							var group = that.isGroupHandle(e.x, e.y);
							if(!group){
								that.activeObject = null;
							}
							else{
								that.activeObject = group;
							}
						}
						
						
					}, this);
					

					that.resize();
				},
				render: function(){
					if(ctx == null){
						ctx = game.canvas.getContext("2d");
					}
					//ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
					ctx.save();
					ctx.beginPath();
					
					//ctx.translate(-game.camera.x, -game.camera.y);
					ctx.strokeStyle = "rgba(255,255,255,0.1)";
					ctx.globalAlpha = 0.5;
					var g = that.grid;
					
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
					
					
					
					
					if(that.activeObject){
						ctx.save();
						var bounds = that.activeObject.getBounds();
						ctx.strokeStyle = "#ff0000";
						
						ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
						
						var group = null;
						
						if(that.activeObject.MT_OBJECT.contents){
							group = that.activeObject;
						}
						else{
							group = that.activeObject.parent || game.world;
						}
						ctx.strokeStyle = "#ffffff";
						ctx.lineWidth = 1;
						
						var x = group.x - game.camera.x;
						var y = group.y - game.camera.y;
						
						ctx.translate(x, y);
						ctx.rotate(group.rotation);
						ctx.translate(-x, -y);
						
						
						//ctx.translate(x, game.camera.y);
						

						ctx.beginPath();
						ctx.moveTo(group.x, group.y);
						ctx.lineTo(group.x, group.y - 16);
						ctx.stroke();
						
						ctx.strokeRect(group.x - 4, group.y - 4, 8, 8);
					
					
						ctx.restore();
						
						//game.debug.spriteBounds(that.activeObject, "#ff0000", false);
					}
					
					
					game.debug.inputInfo(32, 32);
				}
			});
			
			
			
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
   
   
		_addTimeout: 0,
		addObjects: function(objs, group){
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
				this.objects[i].destroy();
			}
			
			for(var i=this.groups.length-1; i>-1; i--){
				this.groups[i].destroy();
			}
			
			this.objects.length = 0;
			this.groups.length = 0;
			
			
			this._addObjects(objs, group);
			
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
			
			/*
			for(var i=0; i<this.groups.length; i++){
				this.alignGroup(this.groups[i]);
			}
			*/
		},
   
		
		addGroup: function(obj){
			
			var group = this.game.add.group();
			group.MT_OBJECT = obj;
			
			this.groups.push(group);
			
			group.x = obj.x;
			group.y = obj.y;
			//group.anchor.x = obj.anchorX;
			//group.anchor.y = obj.anchorY;
			
			if(obj.rotation){
				group.rotation = Math.PI*obj.rotation/180;
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
			
			if(obj.rotation){
				sp.rotation = Math.PI*obj.rotation/180;
			}
			
			sp.anchor.x = obj.anchorX;
			sp.anchor.y = obj.anchorY;
			
			
			sp.x = obj.x;
			sp.y = obj.y;
			
			that.objects.push(sp);
			
			sp.inputEnabled = true;
			sp.input.pixelPerfectOver = true;
			sp.MT_OBJECT = obj;
			
			sp.inputEnabled = true;
			
			/*sp.events.onInputDown.add(function(){
				that.activeObject = sp;
			});*/
			
			//sp.input.enableDrag();
			
			if(that.activeObject && obj.id == that.activeObject.MT_OBJECT.id){
				that.activeObject = sp;
			}
			
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
   
		resize: function(){
			if(!this.game){
				return;
			}
			this.game.width = this.project.ui.center.offsetWidth;
			this.game.height = this.project.ui.center.offsetHeight;
			
			this.game.world.setBounds(0, 0, 2000, 2000);
			
			//if (this.game.renderType === Phaser.WEBGL){
				this.game.renderer.resize(this.game.width, this.game.height);
			//}
		},
   
		pick: function(x, y, obj){
			game.debug.spriteInputInfo(obj, 32, 32);
		},
   
		initUI: function(ui){
			var that = this;
			this.project.ui.onResize(function(){
				that.resize();
			});
			this.createMap();
			
			this.project.plugins.assetsmanager.onUpdate(function(data){
				that.addAssets(data);
			});
			
			
			var cameraMoveEnabled = false;
			var mousedown = false;
			
			
			
			ui.events.on("mousedown", function(e){
				if(e.target !== that.game.canvas){
					return;
				}
				
				
				mousedown = true;
				if(e.which == 3){
						cameraMoveEnabled = true;
					}
				
				if(that.activeObject){
					that.project.om.updateData();
					that.project.settings.handleObjects(that.activeObject.MT_OBJECT);
				}
				else{
					that.project.settings.handleScene({
						cameraX: game.camera.x,
						cameraY: game.camera.y,
						worldWidth: game.world.width,
						worldHeight: game.world.height,
						grid: that.grid
					});
				}
			
				
			});
			
			window.oncontextmenu = function(e){
				if(e.target == that.game.canvas){
					e.preventDefault();
				}
			};
			
			
			ui.events.on("mouseup", function(){
				cameraMoveEnabled = false;
				mousedown = false;
			});
				
			
			
			var dx = 0;
			var dy = 0;
			ui.events.on("mousemove", function(e){
				if(cameraMoveEnabled){
					that.game.camera.x -= ui.events.mouse.mx;
					that.game.camera.y -= ui.events.mouse.my;
					return;
				}
				if(that.activeObject && mousedown){
					
					var angle = that.getOffsetAngle(that.activeObject);
					
					var x = ui.events.mouse.mx;
					var y = ui.events.mouse.my;
					if(angle){
						var x = that.rpx(angle, -ui.events.mouse.mx, -ui.events.mouse.my, 0, 0);
						var y = that.rpy(angle, -ui.events.mouse.mx, -ui.events.mouse.my, 0, 0);
					}
					
					
					if(e.ctrlKey){
						dx += x;
						dy += y;
						
						if(dx > that.grid){
							that.activeObject.x = Math.round((that.activeObject.x + dx) /that.grid) * that.grid;
							dx -= that.grid;
						}
						else if(dx < -that.grid){
							that.activeObject.x = Math.round((that.activeObject.x + dx) /that.grid) * that.grid;
							dx += that.grid;
						}
						else{
							that.activeObject.x = Math.round((that.activeObject.x) /that.grid) * that.grid;
						}
						
						if(dy > that.grid){
							that.activeObject.y = Math.round((that.activeObject.y + dy) /that.grid) * that.grid;
							dy -= that.grid;
						}
						else if(dy < -that.grid){
							that.activeObject.y = Math.round((that.activeObject.y + dy) /that.grid) * that.grid;
							dy += that.grid;
						}
						else{
							that.activeObject.y = Math.round((that.activeObject.y) /that.grid) * that.grid;
						}
						
					}
					else{
						//that.project.om.updateData();
						that.activeObject.x += x;
						that.activeObject.y += y;
					}
					
					that.sync();
					that.project.settings.updateObjects(that.activeObject.MT_OBJECT);
				}
				
			});
			
			
			ui.events.on("keydown", function(e){
				
				var w = e.which;
				console.log(w, e, e.target);
				
				if(!that.activeObject || (e.target != game.canvas && e.target != document.body) ){
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
			
			sin = Math.sin(angle);
			cos = Math.cos(angle);
			
			return -(x - cx)*cos - (y - cy)*sin + cx;
		},
		
		rpy: function(angle, x, y, cx, cy){
			sin = Math.sin(angle);
			cos = Math.cos(angle);
			
			return -(y - cy)*cos + (x - cx)*sin + cy;
		},
		
		sync: function(obj){
			
			obj = obj || this.activeObject;
			
			obj.MT_OBJECT.x = obj.x;
			obj.MT_OBJECT.y = obj.y;
			
			obj.MT_OBJECT.rotation = obj.angle;
		},
   
		move: function(){
			
			
		},
   
		updateScene: function(obj){
			this.game.width = obj.worldWidth;//.project.ui.center.offsetWidth;
			this.game.height = obj.worldHeight;////this.project.ui.center.offsetHeight;
			
			this.game.world.setBounds(0, 0, obj.worldWidth, obj.worldHeight);
			this.game.camera.x = obj.cameraX;
			this.game.camera.y = obj.cameraY;
			
			this.grid = obj.grid;
			
			
		}
		
		
		
		
		
		
		
		
		
	}
);   
