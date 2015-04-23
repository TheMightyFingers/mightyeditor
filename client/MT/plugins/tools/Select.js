"use strict";
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
			RNW: 5,
			RNE: 6,
			RSW: 7,
			RSE: 8
		},
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			
			this.map = this.tools.map;
		},
		init: function(skipNotify){
			this.mDown = false;
			this.map.handleMouseMove = this.mouseMoveFree;
			if(skipNotify){
				return;
			}
			this.showInfoToolTip();
		},
		
		
		deactivate: function(){
			this.mDown = false;
			this.map.handleMouseMove = this.mouseMoveFree;
			map.selection.width = 0;
			map.selection.height = 0;
		},
		
		select: function(obj){
			if(obj == map.activeObject){
				return;
			}
			
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
			var obj = this.activeObject;
			var x = e.x - this.ox;
			var y = e.y - this.oy;
			
			if(self.checkAltKey(e)){
				
			}
			else{
				obj.mouseMove(x, y, e);
			}
		},
		altKeyReady: false,
		checkAltKey: function(e){
			
			if(!this.altKeyReady){
				return;
			}
			this.altKeyReady = false;
			
			var copy = [];
			var sel = this.map.selector;
			sel.sort(function(a, b){
				return (a.object.z - b.object.z);
			});
			
			sel.forEach(function(o){
				copy.push(o.data);
			});
			
			var bounds = null;
			var cx = this.map.game.camera.x;
			var cy = this.map.game.camera.y;
			
			var data = this.tools.om.multiCopy(copy);
			sel.clear();
			
			var sprite;
			for(var i=0; i<data.length; i++){
				sprite = this.map.getById(data[i].id);
				if(!sprite){
					continue;
				}
				sprite.object.updateTransform();
				sel.add(sprite);
				
			}
			if(data.length > 0){
				this.map.activeObject = this.map.getById(data[0].id);
				
				this.map.emit("select", this.map.settings);
				this.initMove(e);
			}
			
			
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
			
			if(this.map.selector.count !== 1){
				this.map.emit("select", this.map.settings);
				this.map.activeObject = null;
			}
			else{
				this.map.activeObject = this.map.selector.get(0);
				
			}
		},
		
		initMove: function(e){
			if(this.tools.activeTool != this){
				return;
			}
			
			this.checkAltKey(e);
			
			var that = this;
			
			this.map.updateMouseInfo(e);
			
			this.map.handleMouseMove = function(e){
				that.map.handleMouseMove = that.map._objectMove;
			}
		},
		_lastMD: 0,
		doubleClick: function(){
			if(!this.map.activeObject){
				return false;
			}
			
			var mt = this.map.activeObject.data;
			var tmp;
			for(var i=0; i<this.map.loadedObjects.length; i++){
				tmp = this.map.loadedObjects[i];
				if(tmp.data.assetId == mt.assetId && tmp.data.type == mt.type && tmp.isVisible && !tmp.isLocked){
					this.map.selector.add(tmp);
				}
			}
			
			return true;
		},
		
		mDown: false,
		
		mouseUp: function(e){
			if(this.map.activeObject){
				this.map.activeObject.mouseUp(e.x - this.map.ox, e.y - this.map.oy, e);
			}
			
			this.mDown = false;
			var x = e.x - this.map.offsetXCam;
			var y = e.y - this.map.offsetYCam;
			
			var map = this.tools.map;
			
			map.selectRect(map.selection);
			
			map.selection.width = 0;
			map.selection.height = 0;
			
			if(this.map.activeObject){
				this.map.activeObject.mouseUp(e.x - this.map.ox, e.y - this.map.oy, e);
			}
			
			this.checkAltKey(e);
			
			map.handleMouseMove = this.mouseMoveFree;
		},
		
		mouseDown: function(e){
			this.mDown = true;
			if(Date.now() - this._lastMD < 300){
				if(this.doubleClick()){
					return;
				}
			}
			
			this._lastMD = Date.now();
			
			var x = e.x - this.map.ox;
			var y = e.y - this.map.oy;
			
			var dx = e.x - this.map.offsetXCam;
			var dy = e.y - this.map.offsetYCam;
			
			if(e.altKey){
				this.altKeyReady = true;
			}
			
			if(this.map.activeObject && this.map.activeObject.activeHandle != -1){
				this.map.activeObject.mouseDown(x, y, e);
				return;
			}
			
			
			var shift = (e.shiftKey ? true : false);
			
			var obj = this.map.pickObject(dx, dy);
			if(!obj){
				var that = this;
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
					this.map.emit("select", this.map.settings);
				}
				return;
			}
			
			if(!shift){
				if(!this.map.selector.is(obj)){
					this.map.selector.clear();
				}
			}
			else{
				if(this.map.selector.is(obj)){
					this.map.selector.remove(obj);
					return;
				}
			}
			
			this.map.selector.add(obj);
			
			if(this.map.selector.count == 1){
				this.map.activeObject = obj;
				obj.mouseDown(x, y, e);
			}
			else{
				this.map.activeObject = null;
				this.map.emit("select", this.map.settings);
				this.altKeyReady = e.altKey;
				this.initMove(e);
			}
		}
	}
);