MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Select = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "select";
		
		this.activeState = this.states.NONE;
		
		
		this.startMove = {
			x: 0,
			y: 0
		};
	},{
		
		states: {
			NONE: 0,
			RW: 1,
			RE: 2,
			RN: 3,
			RS: 4,
		},
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			
			this.map = this.tools.map;
		},
		init: function(){
			this.map.handleMouseMove = this.mouseMoveFree;
		},
		
		deactivate: function(){
			this.mDown = false;
			this.map.handleMouseMove = this.mouseMoveFree;
		},
		
		select: function(obj){
			
			var shift = (this.ui.events.mouse.lastEvent && this.ui.events.mouse.lastEvent.shiftKey ? true : false);
			if(shift){
				if(this.map.selector.is(obj)){
					this.map.selector.remove(obj);
					return;
				}
				
				this.map.selector.add(obj);
				return;
			}
			
			this.tools.selectObject(obj, true);
		},
		
		/* !!! this functions runs in map scope */
		mouseMoveFree: function(e){
			
			if(!this.activeObject){
				return;
			}
			var self = this.project.plugins.tools.tools.select;
			
			if(this.ui.events.mouse.down && self.activeState != self.states.NONE){
				self.resizeObject(this.activeObject, this.ui.events.mouse);
				return;
			}
			
			var bounds = this.activeObject.getBounds();
			var type = this.activeObject.MT_OBJECT.type;
			
			var off = this.helperBoxSize;
			
			var x = e.x - this.ox;
			var y = e.y - this.oy;
			
			var obj = this.activeObject;
			var scale = this.game.camera.scale.x;
			
			if(type == MT.objectTypes.TEXT){
				
				var my = bounds.y + bounds.height * 0.5 - off*0.5;
				
				var width = this.activeObject.wordWrapWidth * scale;
				
				if(y > my && y < my + off){
					if(x > bounds.x - off | 0 && x < bounds.x ){
						document.body.style.cursor = "w-resize";
						self.activeState = self.states.RW;
						self.startMove.x = obj.x;
					}
					else if(x > bounds.x + width && x < bounds.x + width + off){
						document.body.style.cursor = "e-resize";
						self.activeState = self.states.RE;
						self.startMove.x = obj.x;
					}
					else{
						document.body.style.cursor = "auto";
						self.activeState = self.states.NONE;
					}
				}
				else{
					document.body.style.cursor = "auto";
					self.activeState = self.states.NONE;
				}
			}
			if(this.tools.activeTool !== self){
				this.tools.mouseMove(e);
			}
		},
		
		resizeObject: function(obj, mouse){
			obj = obj || this.map.activeObject;
			var scale = this.map.game.camera.scale.x;
			var x = mouse.mx/scale;
			
			if(this.activeState == this.states.RW){
				obj.wordWrapWidth -= x;
				obj.x = (this.startMove.x) + x * (1-obj.anchor.x);
				this.startMove.x = obj.x;
				
				
			}
			if(this.activeState == this.states.RE){
				obj.wordWrapWidth += x;
				obj.x += x*obj.anchor.x;
			}

			this.tools.tools.text.select(obj);
			
			this.map.sync();
		},
		
		
		mouseMove: function(e){
			if(!this.mDown){
				return;
			}
			
			var x = e.x - this.map.offsetX;
			var y = e.y - this.map.offsetY;
			
			
			if(x > this.map.selection.sx){
				this.map.selection.width = x - this.map.selection.x;
			}
			else{
				this.map.selection.width = this.map.selection.sx - x;
				this.map.selection.x = x;
			}
			
			if(y > this.map.selection.sy){
				this.map.selection.height = y - this.map.selection.y;
			}
			else{
				this.map.selection.height = this.map.selection.sy - y;
				this.map.selection.y = y;
			}
			
			this.map.selectRect(this.map.selection, !e.shiftKey);
		},
		
		mouseUp: function(e){
			this.mDown = false;
			var map = this.tools.map;
			
			map.selectRect(map.selection);
			
			map.selection.width = 0;
			map.selection.height = 0;
			
			map.handleMouseMove = this.mouseMoveFree;
		},
		
		initMove: function(e){
			if(this.tools.activeTool != this){
				return;
			}
			this.map.handleMouseMove = this.map._objectMove;
			
			if(e.altKey){
				var copy = [];
				var sel = this.map.selector;
				sel.forEach(function(o){
					copy.push(o.MT_OBJECT);
				});
				
				
				
				var bounds = null;
				var cx = this.map.game.camera.x;
				var cy = this.map.game.camera.y;
				
				
				
				var data = this.tools.om.multiCopy(copy);
				sel.clear();
				
				
				var sprite;
				for(var i=0; i<data.length; i++){
					sprite = this.map.getById(data[i].id);
					bounds = sprite.getBounds();
					data[i].x = bounds.x + cx;
					data[i].y = bounds.y + cy;
					
					sel.add(sprite);
				}
				
				
				
			}
			
		},
		_lastMD: 0,
		doubleClick: function(){
			if(!this.map.activeObject){
				return false;
			}
			
			var mt = this.map.activeObject.MT_OBJECT;
			for(var i=0; i<this.map.objects.length; i++){
				if(this.map.objects[i].MT_OBJECT.assetId == mt.assetId){
					this.map.selector.add(this.map.objects[i]);
				}
			}
			
			return true;
		},
		
		mDown: false,
		mouseDown: function(e){
			
			this.mDown = true;
			if(this.activeState !== this.states.NONE){
				return;
			}
			if(Date.now() - this._lastMD < 300){
				
				if(this.doubleClick()){
					return;
				}
			}
			
			this._lastMD = Date.now();
			
			var that = this;
			var shift = (e.shiftKey ? true : false);
			
			var x = e.x - this.map.offsetXCam;
			var y = e.y - this.map.offsetYCam;
			
			var obj = this.map.pickObject(x, y);
			var group = this.map.pickGroup(x, y);
			
			if(group && (this.map.selector.is(group) || group == this.map.activeObject) ){
				this.initMove(e);
				return;
			}
			
			if(obj){
				if(!shift){
					if(this.map.selector.is(obj)){
						this.initMove(e);
					}
					else{
						if(this.map.selector.is(obj)){
							this.initMove(e);
						}
						this.select(obj);
						this.initMove(e);
					}
				}
				else{
					this.select(obj);
				}
			}
			else{
				this.map.handleMouseMove = function(e){
					that.mouseMove(e);
				};
				
				this.map.selection.x = e.x - this.map.offsetX;
				this.map.selection.y = e.y - this.map.offsetY;
				
				this.map.selection.sx = e.x - this.map.offsetX;
				this.map.selection.sy = e.y - this.map.offsetY;
				
				this.map.selection.width = 0;
				this.map.selection.height = 0;
				
				if(!shift){
					this.map.selector.clear();
					this.map.activeObject = null;
					this.tools.project.plugins.settings.handleScene(this.map.settings);
				}
			}
		}
	}
);