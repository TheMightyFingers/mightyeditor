/*
 * UI Controller .. atm. only panel controller
 * TODO: 
 * 		add joinLeft / joinRight - same way as joinTop / joinBottom works
 * 		save / load layout
 * 		create alternate small panel with icons only
 * 
 */

"use strict";



MT.require("ui.Events");
MT.require("ui.Panel");

MT.LEFT = 1;
MT.RIGHT = 2;
MT.TOP = 3;
MT.BOTTOM = 4;
MT.CENTER = 5;
MT.NONE = 0;

MT.ui.addClass = function(el, clsName){
	if(typeof clsName == "object"){
		for(var i=0; i<clsName.length; i++){
			this.addClass(el, clsName[i]);
		}
		return;
	}
	
	var c = el.className.split(" ");
	for(var i=0; i<c.length; i++){
		if(c[i] == clsName){
			return;
		}
	}
	
	c.push(clsName);
	el.className = c.join(" ");
};

MT.ui.removeClass = function(el, clsName){
	if(typeof clsName == "object"){
		for(var i=0; i<clsName.length; i++){
			this.removeClass(el, clsName[i]);
		}
		return;
	}
	
	var c = el.className.split(" ");
	for(var i=0; i<c.length; i++){
		if(c[i] == clsName){
			c.splice(i, 1);
		}
	}
	
	el.className = c.join(" ");
};

MT.ui.hasParent = function(el, parent){
	var ret = false;
	var element = el;
	while(element.parentNode){
		if(element == parent){
			return true;
		}
		element = element.parentNode;
	}
	return false;
};

MT.extend("core.Emitter")(
	MT.ui.Controller = function(){
		this.events = new MT.ui.Events();
		
		//disble context menu
		window.oncontextmenu = function(e){
			e.preventDefault();
		};
		this.panels = [];
		
		
		this.oldPrefix = "ui-";
		this.keyPrefix = "uin-";
		
		this.resetOldLayout();
		
		this._centerPanels = [];
		
		
		this.additionalBorder = 4;
		
		this.helper = new MT.ui.DomElement();
		this.helper.addClass("ui-main-helper");
		this.helper.setAbsolute();
		
		// TODO: update this properly
		this.helper.style.zIndex = 99999;
		
		this.box = {
			x: 0,
			y: 0,
			width: window.innerWidth,
			height: window.innerHeight
		};
		
		this.centerBottomRightBox = document.createElement("div");
		document.body.appendChild(this.centerBottomRightBox);
		this.centerBottomRightBox.style.position = "absolute";
		
		
		this.snapPx = 20;
		var that = this;
		var mDown = false;
		
		this.activePanel = null;
		var needResize = false;
		var toTop = null;
		
		this.oldScreenSize.width = window.innerWidth;
		this.oldScreenSize.height = window.innerHeight;
		
		//transitionend
		var transitionend = "transitionend";
		if(window.navigator.userAgent.indexOf("Chrome") > 1){
			transitionend = "webkitTransitionEnd";
		}
		var animEnd = function(aa){
			that.update();
			var prop = aa.propertyName;
			
			if(prop == "width" || prop == "height"){
				that.refresh();
				
			}
			
			this.removeEventListener(transitionend, animEnd);
			window.setTimeout(function(){
				document.addEventListener(transitionend, animEnd, false);
			}, 1);
		};
		
		document.addEventListener(transitionend, animEnd, false);
		
		this.events.on(this.events.RESIZE, function(e){
			that.reloadSize(e);
		});
		
		this.events.on(this.events.MOUSEMOVE, function(e){
			that.lastEvent.move = e;
			if(!mDown){
				var panel = e.target.panel || that.pickPanel(e);
				if(!panel){
					that.resetResizeCursor();
					that.activePanel = null;
					return;
				}
				toTop = panel;
				needResize = that.checkResize(panel, e);
				if(!e.target.panel && !needResize && !e.altKey){
					that.activePanel = null;
					return;
				}
				that.activePanel = panel;
				return;
			}
			
			if(!that.activePanel){
				return;
			}
			if(needResize){
				that.resizePanel(that.activePanel, e);
				return;
			}

			if(!that.tryUnjoin(that.activePanel, e)){
				return;
			}
			
			that.movePanel(that.activePanel, e);
		});
		
		this.events.on(this.events.DBLCLICK, function(e){
			if(!that.activePanel){
				return;
			}
			if(!that.activePanel.isRenamable){
				return;
			}
			
			that.activePanel.startRename();
		});
		
		var prevClicked = null;
		
		this.events.on(this.events.MOUSEDOWN, function(e){
			that.lastEvent.down = e;
			that.reloadSize(e);
			if(e.button != 0){
				if(e.button == 1){
					if(e.target.data && e.target.data.panel && e.target.data.panel.isCloseable){
						e.target.data.panel.close();
					}
				}
				return;
			}
			mDown = true;
			
			
			if(!that.activePanel){
				if(toTop && !toTop.isDocked){
					that.updateZ(toTop);
					window.setTimeout(function(){
						toTop.focus();
					},0);
				}
				return;
			}
			
			if(e.target.data && e.target.data.panel){
				
				
				if(e.target.data.panel !== prevClicked){
					prevClicked = e.target.data.panel;
				}
				if(!that.activePanel.isVisible){
					that.activePanel.show(null);
				}
				that.activePanel.isNeedUnjoin = true;
			}
			else{
				that.activePanel.isNeedUnjoin = false;
			}
			
			that.activePanel.removeClass("animated");
			that.updateZ(that.activePanel);
			window.setTimeout(function(){
				that.activePanel.focus();
			},0);
		});
		
		this.events.on(this.events.MOUSEUP, function(e){
			that.lastEvent.up = e;
			mDown = false;
			
			if(!that.activePanel){
				return;
			}
			//e.stopPropagation();
			that.activePanel.addClass("animated");
			that.activePanel.isNeedUnjoin = true;
			that.activePanel.mdown = false;
			
			
			if(that.activePanel.toJoinWith){
				that.joinPanels(that.activePanel.toJoinWith, that.activePanel);
				that.activePanel.setAll("toJoinWith", null);
				that.activePanel.isDockNeeded = false;
			}
			
			that.hideDockHelper(that.activePanel);
			
			that.activePanel.ox = 0;
			that.activePanel.oy = 0;
			
			that.sortPanels();
			that.update();
			that.saveLayout();
		}, false);
		
		
		// delay a little bit first animation - sometimes game do not resize well 
		// ( probably because of css animation event hasn't been triggered properly )
		// hackinsh - need to figure out better way
		var updateInt = window.setInterval(function(){
			that.emit(that.events.RESIZE);
		}, 200);
		
		// after 5 seconds should all be loaded and all animations stopped
		window.setTimeout(function(){
			window.clearInterval(updateInt);
		}, 2000);
		
		
		this.colorPicker = new MT.ui.ColorPicker(this);
		this.colorPicker.hide();
	},
	{
		lastEvent: {
			down: null,
			up: null,
			key: null
		},
		resetOldLayout: function(){
			var key;
			for(var i=0; i<localStorage.length; i++){
				key = localStorage.key(i);
				if(key.substring(0, this.oldPrefix.length) == this.oldPrefix){
					localStorage.removeItem(key);
				}
			}
		},
		saveSlot: 0,
		toResize: {
			TOP: false,
			RIGHT: false,
			BOTTOM: false,
			LEFT: false
		},
   
		zIndex: 1,
		refresh: function(){
			this.emit(this.events.RESIZE);
		},
		setCenter: function(panel){
			
			if(this._centerPanels.length > 0){
				this._centerPanels.join(panel);
			}
			
			this._centerPanels.push(panel);
			
			panel.isDocked = true;
			panel.isPickable = false;
			panel.dockPosition = MT.CENTER;
			
			this.sortPanels();
			this.updateCenter();
		},
		// debug only - fast access to panels
		p: {},
		createPanel: function(name, width, height){
			
			if(!name){
				console.error("bad name");
			}
			var p = new MT.ui.Panel(name, this);
			
			Object.defineProperty(this.p, name, {
				get: function(){
					return p;
				},
				enumerable: true
			});
			
			this.panels.push(p);
			
			p.width = width || 250;
			p.height = height || 400;
			
			p.x = this.box.x;
			p.y = this.box.y;
			
			p.show();
			
			p.name = name;
			p.style.zIndex = 1;
			
			var that = this;
			
			p.on("hide", function(){
				that.beforeHide(p);
			});
			p.on("show", function(){
				that.beforeShow(p);
			});
			p.addClass("animated");
			
			return p;
		},
		
		beforeHide: function(panel){
			panel.cache = {
				dockPosition: panel.dockPosition,
				isDocked: panel.isDocked,
				width: panel.width,
				height: panel.height
			};
			
			if(!panel.isDocked){
				panel.saveBox();
				return;
			}
			this.undock(panel);
			this.update();
		},
		beforeShow: function(panel){
			if(!panel.cache || !panel.cache.isDocked){
				return;
			}
			panel.width = panel.cache.width;
			panel.height = panel.cache.height;
			
			this.helper.dockPosition = panel.cache.dockPosition;
			this.helper.isDocked = true;
			
			if(this.helper.dockPosition == MT.TOP){
				this.showDockHelperTop(panel);
			}
			if(this.helper.dockPosition == MT.LEFT){
				this.showDockHelperLeft(panel);
			}
			if(this.helper.dockPosition == MT.RIGHT){
				this.showDockHelperRight(panel);
			}
			if(this.helper.dockPosition == MT.BOTTOM){
				this.showDockHelperBottom(panel);
			}
			
			this.dockToHelper(panel);
			this.helper.hide();
		},
		
		sortPanels: function(){
			
			this.panels.sort(function(a,b){
				return a.style.zIndex - b.style.zIndex;
			});
			
		},
		
		updateZ: function(panel){
			
			this.sortPanels();
			var p = null;
			for(var i=this.panels.length-1; i>0; i--){
				p = this.panels[i];
				if(!p.isDocked){
					if(p.style.zIndex != i+10 && p.style.zIndex < 1000){
						p.style.zIndex = i+10;
					}
				}
				else{
					if(p.style.zIndex != i){
						p.style.zIndex = i;
					}
				}
			}
			this.zIndex = this.panels.length;
			if(panel){
				if(panel.isDocked){
					panel.style.zIndex = this.zIndex + 1;
				}
				else{
					if(panel.style.zIndex < 1000){
						panel.style.zIndex = this.zIndex + 10;
					}
				}
			}
		},
		
		removePanel: function(panel){
			this.disableMoveable(panel);
			for(var i=0; i<this.panels.length; i++){
				if(this.panels[i] == panel){
					return this.panels.splice(i, 1);
				}
			}
			return null;
		},
		   
		checkResize: function(panel, e){
			if(!panel.isResizeable){
				this.setResizeCursor(true);
				return false;
			}
			if(!MT.ui.hasParent(e.target, panel.el)){
				this.setResizeCursor(true);
				return false;
			}
			var borderV = 0;
			var borderH = 0;
			var style = panel.getStyle();
			
			var hor = (e.x - panel.x);
			var ver = (e.y - panel.y);
			
			var needResize = false;
			
			if(hor/panel.width < 0.5){
				borderH = parseInt(style.borderLeftWidth) ;
				if(borderH && hor < borderH + this.additionalBorder){
					this.toResize.LEFT = true;
					needResize = true;
				}
			}
			else{
				borderH = parseInt(style.borderRightWidth);
				if(borderH &&  panel.width - hor < borderH  + this.additionalBorder){
					this.toResize.RIGHT = true;
					needResize = true;
				}
			}
			if(ver/panel.height < 0.5){
				borderV = parseInt(style.borderTopWidth);
				if(borderV && ver < borderV  + this.additionalBorder){
					this.toResize.TOP = true;
					needResize = true;
				}
			}
			else{
				borderV = parseInt(style.borderBottomWidth );
				if(borderV &&  panel.height - ver < borderV  + this.additionalBorder){
					this.toResize.BOTTOM = true;
					needResize = true;
				}
			}
			
			this.setResizeCursor(!needResize);
			
			
			return needResize;
		},
   
		setResizeCursor: function(reset){
			if(reset){
				this.resetResizeCursor();
				return;
			}
			
			
			var r = "";
			if(this.toResize.TOP){
				r += "n";
			}
			if(this.toResize.BOTTOM){
				r += "s";
			}
			
			if(this.toResize.RIGHT){
				r += "e";
			}
			
			if(this.toResize.LEFT){
				r += "w";
			}
			
			document.body.style.setProperty("cursor",r+"-resize","important");
		},
		
		resetResizeCursor: function(){
			this.toResize.TOP = false;
			this.toResize.RIGHT = false;
			this.toResize.BOTTOM = false;
			this.toResize.LEFT = false;
			document.body.style.removeProperty("cursor","auto","important");
		},
		
		resizePanel: function(panel, e){
			var mx = this.events.mouse.mx;
			var my = this.events.mouse.my;
			if(this.toResize.RIGHT){
				panel.width += mx;
				
				if(panel.dockPosition == MT.LEFT){
					this.resizeSidePanelsFromLeft(panel, mx);
				}
			}
			
			if(this.toResize.BOTTOM){
				panel.height += my;
				if(panel.dockPosition == MT.TOP){
					this.resizeSidePanelsFromTop(panel, my);
				}
			}
			
			if(this.toResize.LEFT){
				panel.x += mx;
				panel.width = panel.width - mx;
				
				if(panel.dockPosition == MT.RIGHT){
					this.resizeSidePanelsFromRight(panel, mx);
				}
			}
			
			if(this.toResize.TOP){
				panel.y += my;
				panel.height -= my;
				if(panel.dockPosition == MT.BOTTOM){
					this.resizeSidePanelsFromBottom(panel, my);
				}
			}
			
			if(panel.isDocked){
				this.moveDocks();
			}
		},
   
		resizeSidePanelsFromLeft: function(panel, dx){
			var p = null;
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				p.setTopBottom("justUpdated", false);
			}
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				if(p.justUpdated){
					continue;
				}
				
				if(p.dockPosition == MT.TOP || p.dockPosition == MT.BOTTOM){
					if(panel.x >= p.x){
						continue;
					}
					
					p.x = ( p.x + dx );
					p.width = (p.width - dx);
					p.setTopBottom("justUpdated", true);
				}
				
			}
		},
		
		resizeSidePanelsFromRight: function(panel, dx){
			var p = null;
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				p.setTopBottom("justUpdated", false);
			}
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				if(p.justUpdated){
					continue;
				}
				
				if(p.dockPosition == MT.TOP || p.dockPosition == MT.BOTTOM){
					if(panel.x + panel.width <= p.x + p.width){
						continue;
					}
					
					//p.x = ( p.x + dx );
					p.width = (p.width + dx);
					p.setTopBottom("justUpdated", true);
				}
				
			}
		},
   
		resizeSidePanelsFromTop: function(panel, dy){
			var p = null;
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				p.setAll("justUpdated", false);
			}
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				if(p.justUpdated){
					continue;
				}
				
				if(p.dockPosition != MT.LEFT && p.dockPosition != MT.RIGHT){
					continue;
				}
				
				if(p.top){
					continue;
				}
				if(panel.y >= p.y){
					continue;
				}
				
				p.y = ( p.y + dy );
				p.height = (p.height - dy);
				p.setAll("justUpdated", true);
				
			}
		},
   
		resizeSidePanelsFromBottom: function(panel, dy){
			var p = null;
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				p.setAll("justUpdated", false);
			}
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				if(p.justUpdated){
					continue;
				}
				if(p.dockPosition != MT.LEFT && p.dockPosition != MT.RIGHT){
					continue;
				}
				if(p.bottom){
					continue;
				}
				if(p.y + p.height >= panel.y + panel.height || p.bottom){
					continue;
				}
				
				p.setClearHeight(p.height + dy);
				p.setAll("justUpdated", true);
				
			}
		},
   
		
		
		
		
		dockToLeft: function(panel){
			if(!panel.isDockable){
				console.error("trying to dock undockable panel");
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			else{
				this.undock(panel);
			}
			
			panel.x = this.box.x;
			panel.y = this.box.y;
			panel.setAll("height", this.box.height);
			panel.dockPosition = MT.LEFT;
			panel.isDocked = true;
			this.moveDocksLeft();
		},
   
		dockToRight: function(panel){
			if(!panel.isDockable){
				console.error("trying to dock undockable panel");
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			else{
				this.undock(panel);
			}
			
			panel.x = this.box.width - panel.width;
			panel.y = this.box.y;
			panel.setAll("height", this.box.height);
			panel.dockPosition = MT.RIGHT;
			panel.isDocked = true;
			
			this.moveDocksRight();
		},

		dockToTop: function(panel){
			if(!panel.isDockable){
				console.error("trying to dock undockable panel");
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			else{
				this.undock(panel);
			}
			
			panel.y = this.box.y;
			panel.x = this.box.x;
			panel.width = this.box.width;
			this.box.y += panel.height;
			this.box.height -= panel.height;
			
			
			panel.dockPosition = MT.TOP;
			panel.isDocked = true;
			
			this.moveDocksTop();
		},
   
		dockToBottom: function(panel){
			
			if(!panel.isDockable){
				console.error("trying to dock undockable panel");
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			else{
				this.undock(panel);
			}

			panel.x = this.box.x;
			panel.y = this.box.height - panel.height;
			panel.width =  this.box.width;
			this.box.height -= panel.height;
			
			
			panel.dockPosition = MT.BOTTOM;
			panel.isDocked = true;
			
			this.moveDocksBottom();
			
		},
		
		update: function(){
			this.updateZ();
			return;
			this.saveLayout();
			this.moveDocks();
		},
		
		/* adjust midddle box */
		moveDocks: function(){
			this.moveDocksLeft();
			this.moveDocksRight();
			this.moveDocksTop();
			this.moveDocksBottom();
			this.updateCenter();
			return;
		},
		
		moveDocksLeft: function(panel){
			
			var tmp = this.panels.slice(0);
			
			tmp.sort(function(a, b){
				return a.x - b.x;
			});
			
			var p = null;
			this.box.x = 0;
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				p.setTopBottom("justUpdated", false);
			}
			
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				if(p.dockPosition != MT.LEFT || !p.isVisible){
					continue;
				}
				if(p.justUpdated){
					continue;
				}
				p.x = this.box.x;
				this.box.x += p.width;
				this.box.width -= p.width;
				p.setTopBottom("justUpdated", true);
			}
			
		},
   
		moveDocksRight: function(panel){
			var tmp = this.panels.slice(0);
			
			tmp.sort(function(a, b){
				return -(a.x + a.width) + (b.x + b.width);
			});
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				p.setTopBottom("justUpdated", false);
			}
			
			
			var p = null;
			this.box.width = window.innerWidth;
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				if(!p.isDocked || p.dockPosition != MT.RIGHT || !p.isVisible){
					continue;
				}
				if(p.justUpdated){
					continue;
				}
				
				p.x = this.box.width - p.width;
				this.box.width -= p.width;
				p.setTopBottom("justUpdated", true);
			}
			
		},
		
		moveDocksTop: function(panel){
			var tmp = this.panels.slice(0);
			
			tmp.sort(function(a, b){
				return a.y - b.y;
			});
			
			var p = null;
			this.box.y = 0;
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				p.setLeftRight("justUpdated", false);
			}
			
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				if(!p.isDocked || p.dockPosition != MT.TOP || !p.isVisible){
					continue;
				}
				if(p.justUpdated){
					continue;
				}
				p.y = this.box.y;
				this.box.y += p.height;
				//this.box.height -= p.height;
				p.setLeftRight("justUpdated", true);
			}
		},
		
		moveDocksBottom: function(panel){
			var tmp = this.panels.slice(0);
			
			tmp.sort(function(a, b){
				return (b.y + b.height) - (a.y + a.height);
			});
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				p.setTopBottom("justUpdated", false);
			}
			
			
			var p = null;
			this.box.height = window.innerHeight;
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				if(p.dockPosition != MT.BOTTOM ){
					continue;
				}
				
				if(!p.isDocked || !p.isVisible){
					continue;
				}
				if(p.justUpdated ){
					continue;
				}
				
				p.y = this.box.height - p.height;
				this.box.height -= p.height;
				p.setLeftRight("justUpdated", true);
			}
		},
		
		updateCenter: function(skipEmit){
			if(this._centerPanels.length == 0){
				return
			}
			
			var centerPanel = this._centerPanels[0];
			/*
			 * Joints will automatically update rest panels
			 */
			
			if(
					centerPanel.x != this.box.x 
						|| centerPanel.y != this.box.y 
						|| centerPanel.width != this.box.width - this.box.x 
						|| centerPanel.height != this.box.height - this.box.y
			){
			
				centerPanel.x = this.box.x;
				centerPanel.y = this.box.y;
				centerPanel.width = this.box.width - this.box.x;
				centerPanel.height = this.box.height - this.box.y;
				
				if(!skipEmit){
					this.emit(this.events.RESIZE);
				}
			}
			
			
			this.centerBottomRightBox.style.left = (centerPanel.x + centerPanel.width) + "px";
			this.centerBottomRightBox.style.top = (centerPanel.y + centerPanel.height) + "px";
			this.centerBottomRightBox.style.zIndex = 1001;
			this.centerBottomRightBox.style.backgroundColor = "inherit";
			//this.centerBottomRightBox.style.overflow = "hidden";
			//this.centerBottomRightBox.style.pointerEvents = "none;"
		},
		
		
		tryUnjoin: function(panel, e){
			
			if(panel.joints.length === 1){
				return true;
			}
			
			if(!panel.isJoinable || !panel.isMovable){
				return true;
			}
			if(!panel.isNeedUnjoin){
				return true;
			}
			
			
			var mx = this.events.mouse.mx;
			var my = this.events.mouse.my;
			
			panel.ox += mx;
			panel.oy += my;
			
			if(Math.abs(panel.ox) < this.snapPx && Math.abs(panel.oy) < this.snapPx){
				return false;
			}
			
			
			
			panel.unjoin();
			panel.isNeedUnjoin = false;
			
			
			if(!panel.isDocked){
				panel.x += panel.ox;
				panel.y += panel.oy;
				panel.ox = 0;
				panel.oy = 0;
			}
			panel.isDocked = false;
			panel.dockPosition = MT.NONE;
			panel.loadBox();
			
			return true;
		},
   
		movePanel: function(panel, e){
			if(!panel.isMovable){
				return;
			}
			
			var hideHelper = true;
			if(panel.isDockable && panel.isJoinable){
				var over = this.vsPanels(e, panel);
				if(over && over.acceptsPanels && over.isJoinable && over.isDockable){
					var percX = (e.x - over.x) / over.width;
					var percY = (e.y - over.y) / over.height;
					this.showHelperOverPanel(over, percX, percY);
					hideHelper = false;
				}
			}
			
			var mx = this.events.mouse.mx;
			var my = this.events.mouse.my;
			
			if(panel.isDocked){
				panel.ox += mx;
				panel.oy += my;
				
				if(Math.abs(panel.ox) < this.snapPx && Math.abs(panel.oy) < this.snapPx){
					return;
				}
				this.undock(panel);
				panel.x += panel.ox;
				panel.y += panel.oy;
				
				panel.ox = 0;
				panel.oy = 0;
			}
			
			
			panel.x += mx;
			panel.y += my;
			
			if(!panel.isDockable){
				
				return;
			}
			
			if(hideHelper){
				if(  Math.abs(e.x - this.box.x) < this.snapPx && !over){
					this.showDockHelperLeft(panel);
					hideHelper = false;
				}
				else if( Math.abs(e.x - this.box.width) < this.snapPx && !over){
					this.showDockHelperRight(panel);
					hideHelper = false;
				}
				else if(Math.abs(e.y - this.box.y) < this.snapPx && !over){
					this.showDockHelperTop(panel);
					hideHelper = false;
				}
				else if(Math.abs(e.y - this.box.height) < this.snapPx && !over){
					this.showDockHelperBottom(panel);
					hideHelper = false;
				}
				else{
					panel.isDockNeeded = false;
				}
			}
			if(hideHelper){
				this.helper.hide();
			}
		},
		
		showDockHelperLeft: function(panel){
			
			this.helper.show();

			this.helper.width = panel.width;
			this.helper.height = this.box.height - this.box.y;
			this.helper.x = this.box.x;
			this.helper.y = this.box.y;
			
			this.helper.dockPosition = MT.LEFT;
			
			panel.isDockNeeded = true;
			this.helper.toJoinWith = null;
		},
		
		showDockHelperRight: function(panel){
			
			this.helper.show();

			this.helper.width = panel.width;
			this.helper.height = this.box.height - this.box.y;
			this.helper.x = this.box.width - panel.width;
			this.helper.y = this.box.y;
			
			this.helper.dockPosition = MT.RIGHT;
			
			panel.isDockNeeded = true;
			this.helper.toJoinWith = null;
		},
		
		showDockHelperTop: function(panel){
			
			this.helper.show();

			this.helper.width = this.box.width - this.box.x;
			this.helper.height = panel.height;
			this.helper.x = this.box.x;
			this.helper.y = this.box.y;
			
			this.helper.dockPosition = MT.TOP;
			
			panel.isDockNeeded = true;
			this.helper.toJoinWith = null;
		},
   
		showDockHelperBottom: function(panel){
			
			this.helper.show();

			this.helper.width = this.box.width - this.box.x;
			this.helper.height = panel.height;
			this.helper.x = this.box.x;
			this.helper.y = this.box.height - panel.height;
			
			this.helper.dockPosition = MT.BOTTOM;
			
			panel.isDockNeeded = true;
			this.helper.toJoinWith = null;
		},
   
		showHelperOverPanel: function(panel, percX, percY){
			if(!panel.acceptsPanels){
				return;
			}
			this.helper.width = panel.width;
			this.helper.x = panel.x;
			this.helper.toJoinWith = panel;
			
			if(panel.isDocked){
				if(percY < 0.3){
					this.helper.y = panel.y;
					this.helper.height = panel.height*0.5;
					this.helper.joinPosition = MT.TOP;
				}
				
				else if(percY > 0.7){
					this.helper.height = panel.height*0.5;
					this.helper.y = panel.y + panel.height - this.helper.height;
					this.helper.joinPosition = MT.BOTTOM;
				}
				else{
					this.helper.y = panel.y;
					this.helper.height = panel.height;
					this.helper.joinPosition = MT.CENTER;
				}
			}
			else{
				this.helper.y = panel.y;
				this.helper.height = panel.height;
				this.helper.joinPosition = MT.CENTER;
			}
			
			
			this.helper.show();
		},
   
		hideDockHelper: function(panel){
			if(!this.helper.isVisible){
				return;
			}
			if(this.helper.toJoinWith){
				panel.saveBox();
				
				panel.height = this.helper.height;
				var join = this.helper.toJoinWith;
				if(this.helper.joinPosition == MT.CENTER){
					this.joinPanels(join, panel);
				}
				if(this.helper.joinPosition == MT.BOTTOM){
					join.joinBottom(panel);
					if(join.isDocked){
						panel.dockPosition = join.dockPosition;
						panel.isDocked = true;
					}
				}
				if(this.helper.joinPosition == MT.TOP){
					join.joinTop(panel);
					if(join.isDocked){
						panel.dockPosition = join.dockPosition;
						panel.isDocked = true;
					}
				}
				
				
				this.helper.toJoinWith = null;
				this.helper.hide();
				return;
			}
			
			
			if(panel && panel.isDockNeeded && !panel.isDocked){
				this.dockToHelper(panel);
			}
			
			this.helper.hide();
		},
		
		joinPanels: function(target, panel){
			panel.inheritSize(target);
			target.addJoint(panel);
			target.removeClass("active");
			panel.removeClass("active");
			
			target.hide(false);
			
			if(target.isDocked){
				this.dockToHelper(panel, target);
			}
			
			panel.header.setActiveIndex(0);
			panel.header.showTabs();
			
			panel.isDockNeeded = false;
			panel.isVisible = false;
			panel.show();
		},
		
		vsPanels: function(point, panel){
			var p = null;
			for(var i=this.panels.length-1; i>-1; i--){
				p = this.panels[i];
				if(p == panel || !p.isVisible || !p.isPickable){
					continue;
				}
				
				if(p.vsPoint(point)){
					return p;
				}
			}
			return null;
		},
		pickPanel: function(point){
			point = point || this.lastEvent.up;
			var p = null;
			for(var i=this.panels.length-1; i>-1; i--){
				p = this.panels[i];
				if(!p.isVisible || !p.isPickable){
					continue;
				}
				
				if(p.vsPoint(point)){
					return p;
				}
			}
			return null;
		},
		pickPanelGlobal: function(point){
			point = point || this.lastEvent.down;
			if(!point){
				return null;
			}
			var p = null;
			for(var i=this.panels.length-1; i>-1; i--){
				p = this.panels[i];
				if(!p.isVisible){
					continue;
				}
				
				if(p.vsPoint(point)){
					return p;
				}
			}
			return null;
		},
		dockToHelper: function(panel, helper){
			if(panel.isDocked){
				return;
			}
			
			helper = helper || this.helper;
			if(!helper.isDocked){
				panel.saveBox();
			}
			
			panel.inheritSize(helper);
			
			panel.setAll("isDocked", true);
			panel.setAll("isDockNeeded", false);
			panel.style.zIndex = 0;
			
			
			panel.dockPosition = helper.dockPosition;
			
			this.moveDocks();
		},
   
		undock: function(panel){
			if(!panel.isDocked){
				return;
			}
			var p = null;
			
			panel.isDocked = false;
			
			var needUpdate = true;
			if(panel.top || panel.bottom){
				needUpdate = false;
			}
			
			var top = panel.getTopMost();
			if(top == panel){
				top = panel.bottom;
			}
			
			
			panel.breakSideJoints();
			
			
			if(needUpdate){
				if(panel.dockPosition == MT.LEFT){
					for(var i=0; i<this.panels.length; i++){
						p = this.panels[i];
						if(p.dockPosition == MT.BOTTOM || p.dockPosition == MT.TOP){
							if(panel.x + panel.width == p.x){
								p.x -= panel.width;
								p.width += panel.width;
							}
						}
					}
				}
				if(panel.dockPosition == MT.RIGHT){
					for(var i=0; i<this.panels.length; i++){
						p = this.panels[i];
						if(p.dockPosition == MT.BOTTOM || p.dockPosition == MT.TOP){
							if(panel.x == p.x + p.width){
								//p.x -= panel.width;
								p.width += panel.width;
							}
						}
					}
				}
				if(panel.dockPosition == MT.TOP){
					for(var i=0; i<this.panels.length; i++){
						p = this.panels[i];
						if(p.dockPosition == MT.LEFT || p.dockPosition == MT.RIGHT){
							if(panel.y + panel.height == p.y){
								p.y -= panel.height;
								p.height += panel.height;
							}
						}
					}
				}
				if(panel.dockPosition == MT.BOTTOM){
					for(var i=0; i<this.panels.length; i++){
						p = this.panels[i];
						if(p.dockPosition == MT.LEFT || p.dockPosition == MT.RIGHT){
							if(panel.y == p.y + p.height){
								p.height += panel.height;
							}
						}
					}
				}
			}
			
			
			panel.loadBox();
			panel.dockPosition = MT.NONE;
			if(panel.x > this.events.mouse.x || panel.x + panel.width < this.events.mouse.x){
				panel.x = this.events.mouse.x - panel.width*0.3;
			}
			this.moveDocks();
		},
		
		loadLayout: function(layout, slot){
			if(slot != void(0)){
				this.saveSlot = slot;
			}
			var def = this.resetLayout(this.saveSlot, true);
			this._loadLayout(def, true);
			
			layout = layout || JSON.parse(localStorage.getItem(this.keyPrefix+this.saveSlot));
			if(!layout){
				this.resetLayout(this.saveSlot);
				return;
			}
			
			//this._loadLayout(layout);
			this._loadLayout(layout, true);
			this._loadLayout(layout, true);
			this._loadLayout(layout, true);
			
			this.updateZ();
			this.reloadSize();
			
		},
		_loadLayout: function(layout, noAnim){
			this._centerPanels.length = 0;
			
			var obj = null;
			var panel = null;
			this.box = layout.__box;
			this.oldScreenSize.width = layout.__oldScreenSize.width;
			this.oldScreenSize.height = layout.__oldScreenSize.height;
			
			
			var animated = [];
			if(noAnim){
				for(var i=0; i<this.panels.length; i++){
					if(this.panels[i].hasClass("animated")){
						animated.push(this.panels[i]);
						this.panels[i].removeClass("animated");
					}
				}
			}
			
			var panels = [];
			for(var i in layout){
				obj = layout[i];
				obj.name = i;
				panel = this.getByName(i);
				if(!panel){
					continue;
				}
				
				
				panel.reset(obj);
				panels.push({p: panel, o: obj});
				continue;
			}
			
			var isFirst = false;
			var tmp = null;
			for(var i=0; i<panels.length; i++){
				panel = panels[i].p;
				obj = panels[i].o;
				
				panel.savedBox = obj.savedBox;
				
				if(!obj.isVisible){
					panel.hide(false, true);
					continue;
				}
				
				isFirst = false;
				for(var j=0; j<obj.joints.length; j++){
					tmp = this.getByName(obj.joints[j]);
					if(!tmp){
						continue;
					}
					if(tmp == panel){
						isFirst = true;
						continue;
					}
					
					if(isFirst){
						panel.addJoint(tmp);
					}
					else{
						tmp.addJoint(panel);
					}
				}
			}
			for(var i=0; i<panels.length; i++){
				panel = panels[i].p;
				obj = panels[i].o;
				var p = this.getByName(obj.bottom);
				if(p){
					if(!p.isVisible){
						p = p.getVisibleJoint();
					}
				}
				if(p){
					panel.joinBottom(p, true);
				}
				
				p = this.getByName(obj.top);
				if(p){
					if(!p.isVisible){
						p = p.getVisibleJoint();
					}
				}
				
				if(p){
					panel.joinTop(p, true);
				}
				if(panel.isVisible){
					panel.header.showTabs();
				}
				panel.dockPosition = obj.dockPosition;
				if(obj.dockPosition == MT.CENTER){
					this.setCenter(panel);
				}
			}
			
			
			
			for(var i=0; i<animated.length; i++){
				animated[i].addClass("animated");
			}
			
			//this.reloadSize();
			/*this.update();*/
		},
		
		
		resetLayout: function(slot, dontSave){
			var toLoad = {"__box":{"x":40,"y":29,"width":804,"height":382,"name":"__box"},"__oldScreenSize":{"width":1075,"height":674},"SourceEditor":{"x":40,"y":29,"width":764,"height":353,"dockPosition":5,"isVisible":false,"savedBox":{"x":0,"y":0,"width":0,"height":0},"isDocked":true},"physics":{"x":804,"y":451.125,"width":271,"height":222.875,"dockPosition":2,"isVisible":false,"savedBox":{"x":0,"y":0,"width":0,"height":0},"isDocked":true},"Assets":{"x":804,"y":29,"width":271,"height":186.25,"dockPosition":2,"isVisible":true,"savedBox":{"x":0,"y":0,"width":250,"height":400},"isDocked":true,"joints":["Assets"],"top":null,"bottom":"Objects"},"Map editor":{"x":40,"y":29,"width":764,"height":353,"dockPosition":5,"isVisible":true,"savedBox":{"x":0,"y":0,"width":0,"height":0},"isDocked":true,"joints":["Map editor","SourceEditor"],"top":null,"bottom":null},"toolbox":{"x":0,"y":29,"width":40,"height":645,"dockPosition":1,"isVisible":true,"savedBox":{"x":0,"y":0,"width":40,"height":400},"isDocked":true,"joints":["toolbox"],"top":null,"bottom":null},"Project":{"x":0,"y":0,"width":1075,"height":29,"dockPosition":3,"isVisible":true,"savedBox":{"x":0,"y":0,"width":250,"height":29},"isDocked":true,"joints":["Project"],"top":null,"bottom":null},"userData":{"x":804,"y":451.125,"width":271,"height":222.875,"dockPosition":2,"isVisible":false,"savedBox":{"x":0,"y":0,"width":0,"height":0},"isDocked":true},"timeline":{"x":40,"y":382,"width":764,"height":266,"dockPosition":4,"isVisible":false,"savedBox":{"x":0,"y":0,"width":250,"height":400},"isDocked":true},"Easing":{"x":804,"y":451.125,"width":271,"height":222.875,"dockPosition":2,"isVisible":false,"savedBox":{"x":0,"y":0,"width":0,"height":0},"isDocked":true},"Map Manager":{"x":40,"y":648,"width":764,"height":26,"dockPosition":4,"isVisible":true,"savedBox":{"x":0,"y":0,"width":250,"height":26},"isDocked":true,"joints":["Map Manager"],"top":null,"bottom":null},"Objects":{"x":804,"y":215.25,"width":271,"height":235.875,"dockPosition":2,"isVisible":true,"savedBox":{"x":0,"y":0,"width":250,"height":400},"isDocked":true,"joints":["Objects"],"top":"Assets","bottom":"Settings"},"Settings":{"x":804,"y":451.125,"width":271,"height":222.875,"dockPosition":2,"isVisible":true,"savedBox":{"x":0,"y":0,"width":250,"height":400},"isDocked":true,"joints":["Settings","physics","userData","Easing"],"top":"Objects","bottom":null},"assetPreview":{"x":40,"y":382,"width":764,"height":266,"dockPosition":4,"isVisible":true,"savedBox":{"x":0,"y":0,"width":250,"height":400},"isDocked":true,"joints":["assetPreview","timeline"],"top":null,"bottom":null},"color":{"x":656,"y":411,"width":305,"height":200,"dockPosition":0,"isVisible":false,"savedBox":{"x":0,"y":0,"width":305,"height":200},"isDocked":false},"Text":{"x":40,"y":29,"width":764,"height":30,"dockPosition":0,"isVisible":false,"savedBox":{"x":0,"y":0,"width":944,"height":30},"isDocked":false}};
			
			if(dontSave == true){
				return toLoad;
			}
			
			var str = JSON.stringify(toLoad);
			if(slot != void(0)){
				localStorage.setItem(this.keyPrefix+slot, str);
			}
			else{
				var key;
				for(var i=0; i<localStorage.length; i++){
					key = localStorage.key(i);
					if(key.substring(0, this.keyPrefix.length) == this.keyPrefix){
						localStorage.setItem(key, str);
					}
				}
			}
			
			this.loadLayout(toLoad);
			return toLoad;
		},
		
		saveLayout: function(slot){
			this.refresh();
			if(slot != void(0)){
				this.saveSlot = slot;
			}
			if(!this.isSaveAllowed){
				return;
			}
			var toSave = {
				__box: this.box,
				__oldScreenSize: this.oldScreenSize
			};
			var p = null;
			
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				
				if(p._parent != document.body){
					continue;
				}
				
				toSave[p.name] = {
					x: p.x,
					y: p.y,
					width: p.width,
					height: p.height,
					dockPosition: p.dockPosition,
					isVisible: p.isVisible,
					savedBox: p.savedBox,
					isDocked: p.isDocked
				};
				
				if(p.isVisible){
					toSave[p.name].joints = p.getJointNames();
					toSave[p.name].top = (p.top ? p.top.name : null);
					toSave[p.name].bottom = (p.bottom ? p.bottom.name : null);
				}
			}
			
			var str = JSON.stringify(toSave);
			localStorage.setItem(this.keyPrefix+this.saveSlot, str);
		},
		
		getSavedLayout: function(){
			console.log("toLoad = ", localStorage.getItem(this.keyPrefix+this.saveSlot) );
		},
		
		oldScreenSize: {
			width: 0,
			height: 0
		},
		
		reloadSize: function(){
			var dx = window.innerWidth - this.oldScreenSize.width;
			var dy = window.innerHeight - this.oldScreenSize.height;
			
			this.oldScreenSize.width = window.innerWidth;
			this.oldScreenSize.height = window.innerHeight;
			
			this.box.width += dx;
			this.box.height += dy;
			
			var p = null;
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				p.setTopBottom("justUpdated", false);
			}
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				if(p.justUpdated){
					continue;
				}
				
				if(p.dockPosition == MT.LEFT || p.dockPosition == MT.RIGHT){
					if(p.bottom){
						continue;
					}
					p.height += dy;
				}
				if(p.dockPosition == MT.BOTTOM){
					p.y += dy;
				}
				
				if(p.dockPosition == MT.TOP || p.dockPosition == MT.BOTTOM){
					p.width += dx;
				}
				
				if(p.dockPosition == MT.RIGHT){
					p.x += dx;
				}
				p.setAll("justUpdated", true);
				p.setTopBottom("justUpdated", true);
				
			}
			
			this.moveDocks();
		},
		getByName: function(name){
			for(var i=0; i<this.panels.length; i++){
				if(this.panels[i].name == name){
					return this.panels[i];
				}
			}
			
			return null;
		}
	}
);
