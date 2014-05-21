MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Select = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "select";
		
		this.activeState = this.states.NONE;
		
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
		
		
		mouseMoveFree: function(e){
			
			if(!this.activeObject || e.target != this.game.canvas || this.ui.events.mouse.down){
				return;
			}
			
			var bounds = this.activeObject.getBounds();
			var type = this.activeObject.MT_OBJECT.type;
			
			var off = this.helperBoxSize;
			
			var x = e.x - this.ox;
			var y = e.y - this.oy;
			
			var self = this.project.plugins.tools.tools.select;

			if(type == MT.objectTypes.TEXT){
				
				var my = bounds.y + bounds.height * 0.5 - off*0.5;
				
				
				
				if(x > bounds.x + off && x < bounds.x + off*2  && y > my && y < my + off){
					document.body.style.cursor = "w-resize";
					self.activeState = self.states.RW;
				}
				
				else{
					document.body.style.cursor = "auto";
					self.activeState = self.states.NONE;
				}
				
				
				
				
				/*if(x > bounds.x && x < bounds.x + bounds.width){
					console.log("match X");
				}*/
				
				
			}
			
			
		},
		
		resizeObject: function(){
			
			
		},
		
		
		mouseMove: function(e){

			
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
			var map = this.tools.map;
			
			map.selectRect(map.selection);
			
			map.selection.width = 0;
			map.selection.height = 0;
			
			map.handleMouseMove = this.mouseMoveFree;
		},
		
		initMove: function(e){
			this.map.handleMouseMove = this.map._objectMove;
			
			if(e.altKey){
				var copy = [];
				var sel = this.map.selector;
				sel.forEach(function(o){
					copy.push(o.MT_OBJECT);
				});
				
				sel.clear();
				
				var bounds = null;
				var cx = this.map.game.camera.x;
				var cy = this.map.game.camera.y;
				
				
				
				var data = this.tools.om.multiCopy(copy);
				
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
		mouseDown: function(e){
			
			if(this.activeState !== this.states.NONE){
				this.resizeObject();
				return;
			}
			
			
			
			console.log("mouseDown");
			
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
			
			console.log(obj);
			
			if(obj){
				if(!shift){
					if(this.map.selector.is(obj)){
						this.initMove(e);
					}
					else{
						this.select(obj);
						
						if(this.map.selector.is(obj)){
							this.initMove(e);
						}
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