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


MT.extend("core.Emitter")(
	MT.ui.Controller = function(){
		this.events = new MT.ui.Events();
		this.panels = [];
		
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
		
		this.snapPx = 20;
		var that = this;
		var mDown = false;
		
		var activePanel = null;
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
			if(!mDown){
				var panel = e.target.panel || that.pickPanel(e);
				if(!panel){
					that.resetResizeCursor();
					activePanel = null;
					return;
				}
				toTop = panel;
				needResize = that.checkResize(panel, e);
				if(!e.target.panel && !needResize && !e.altKey){
					activePanel = null;
					return;
				}
				activePanel = panel;
				return;
			}
			
			
			if(!activePanel){
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			if(needResize){
				that.resizePanel(activePanel, e);
				return;
			}
			
			
			if(!that.tryUnjoin(activePanel, e)){
				return;
			}
			
			that.movePanel(activePanel, e);
		});
		
		this.events.on(this.events.MOUSEDOWN, function(e){
			if(e.button != 0){
				if(e.button == 1){
					if(e.target.data && e.target.data.panel && e.target.data.panel.isCloseable){
						e.target.data.panel.close();
					}
				}
				return;
			}
			mDown = true;
			
			
			if(!activePanel){
				if(toTop && !toTop.isDocked){
					that.updateZ(toTop);
				}
				return;
			}
			
			if(e.target.data && e.target.data.panel){
				activePanel = e.target.data.panel;
				activePanel.isNeedUnjoin = true;
				activePanel.show(null);
			}
			else{
				activePanel.isNeedUnjoin = false;
			}
			
			activePanel.removeClass("animated");
			that.updateZ(activePanel);
		});
		
		this.events.on(this.events.MOUSEUP, function(e){
			mDown = false;
			
			if(!activePanel){
				return;
			}
			
			activePanel.addClass("animated");
			activePanel.isNeedUnjoin = true;
			activePanel.mdown = false;
			
			
			if(activePanel.toJoinWith){
				that.joinPanels(activePanel.toJoinWith, activePanel);
				activePanel.setAll("toJoinWith", null);
				activePanel.isDockNeeded = false;
			}
			
			that.hideDockHelper(activePanel);
			
			activePanel.ox = 0;
			activePanel.oy = 0;
			
			that.sortPanels();
			that.update();
		});
		
		
		// delay a little bit first animation - sometimes game do not resize well 
		// ( probably because of css animation event hasn't been triggered properly )
		// hackinsh - need to figure out better way
		var updateInt = window.setInterval(function(){
			that.emit(that.events.RESIZE);
		}, 200);
		
		// after 5 seconds should all be loaded and all animations stopped
		window.setTimeout(function(){
			window.clearInterval(updateInt);
		}, 5000);
		
		
		this.colorPicker = new MT.ui.ColorPicker(this);
		this.colorPicker.hide();
	},
	{
   
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
		
		createPanel: function(name, width, height){
			if(!name){
				console.error("bad name");
			}
			var p = new MT.ui.Panel(name, this);
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
			this.moveDocks();
			this.updateZ();
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
				if(!p.isDocked || p.dockPosition != MT.LEFT || !p.isVisible){
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
				if(!p.isDocked || p.dockPosition != MT.BOTTOM || !p.isVisible){
					continue;
				}
				if(p.justUpdated || p.bottom){
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
		},
		
		
		tryUnjoin: function(panel, e){
			
			if(panel.joints.length === 1){
				return true;
			}
			
			if(!panel.isJoinable){
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
			if(!panel.isMoveable){
				return;
			}
			
			var hideHelper = true;
			
			var over = this.vsPanels(e, panel);
			
			if(over && over.acceptsPanels){
				var percX = (e.x - over.x) / over.width;
				var percY = (e.y - over.y) / over.height;
				this.showHelperOverPanel(over, percX, percY);
				hideHelper = false;
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
			
			if(hideHelper){
				
				
				if( /* this.box.x + panel.width < window.innerWidth*0.5 && */ Math.abs(e.x - this.box.x) < this.snapPx && !over){
					this.showDockHelperLeft(panel);
					hideHelper = false;
				}
				else if( /*this.box.width - panel.width > window.innerWidth*0.5 && */ Math.abs(e.x - this.box.width) < this.snapPx && !over){
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
			var p = null
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
		
		loadLayout: function(layout){
			var toLoad = layout || JSON.parse(localStorage.getItem("ui"));
			if(!toLoad){
				this.resetLayout();
				return;
			}
			
			
			var obj = null;
			var panel = null;
			this.box = toLoad.__box;
			this.oldScreenSize.width = toLoad.__oldScreenSize.width;
			this.oldScreenSize.height = toLoad.__oldScreenSize.height;
			
			
			for(var i in toLoad){
				obj = toLoad[i];
				panel = this.getByName(i);
				
				if(!panel){
					continue;
				}
				
				
				panel.dockPosition = obj.dockPosition;
				panel.isDocked = obj.isDocked;
				
				//panel.isResizeable = obj.isResizeable;
				panel.isDockable = obj.isDockable;
				panel.isJoinable = obj.isJoinable;
				panel.isPickable = obj.isPickable;
				/*if(obj.isVisible){
					panel.show();
				}
				else{
					panel.hide();
				}*/
				panel.acceptsPanels = obj.acceptsPanels;
			
				panel.savedBox = obj.savedBox;
				
				for(var j=0; j<obj.joints; j++){
					panel.addJoint(this.getByName(obj.joints[i]));
				}
				
				var p = this.getByName(obj.bottom);
				if(p){
					panel.joinBottom(p, true);
				}
				
				p = this.getByName(obj.top);
				if(p){
					panel.joinTop(p, true);
				}
				
				
				panel.setClearX(obj.x);
				panel.setClearY(obj.y);
				panel.setClearWidth(obj.width);
				panel.setClearHeight(obj.height);
				
			}
			
			this.reloadSize();
			/*this.update();*/
		},
		
		
		resetLayout: function(){
			var toLoad = {"__box":{"x":40,"y":29,"width":963,"height":612},"__oldScreenSize":{"width":1234,"height":938},"SourceEditor":{"x":40,"y":29,"width":923,"height":583,"dockPosition":5,"isDocked":true,"isResizeable":false,"isDockable":false,"isJoinable":false,"isPickable":true,"isVisible":false,"acceptsPanels":false,"savedBox":{"x":0,"y":0,"width":0,"height":0},"top":null,"bottom":null},"Assets":{"x":963,"y":29,"width":271,"height":193.25,"dockPosition":2,"isDocked":true,"isResizeable":true,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":true,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":250,"height":400},"top":null,"bottom":"Objects"},"assetPreview":{"x":40,"y":612,"width":923,"height":300,"dockPosition":4,"isDocked":true,"isResizeable":true,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":true,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":250,"height":400},"top":null,"bottom":null},"Objects":{"x":963,"y":222.25,"width":271,"height":168.25,"dockPosition":2,"isDocked":true,"isResizeable":true,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":true,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":250,"height":400},"top":"Assets","bottom":"Settings"},"Map editor":{"x":40,"y":29,"width":923,"height":583,"dockPosition":5,"isDocked":true,"isResizeable":false,"isDockable":false,"isJoinable":false,"isPickable":false,"isVisible":true,"acceptsPanels":false,"savedBox":{"x":0,"y":0,"width":0,"height":0},"top":null,"bottom":null},"toolbox":{"x":0,"y":29,"width":40,"height":909,"dockPosition":1,"isDocked":true,"isResizeable":false,"isDockable":true,"isJoinable":false,"isPickable":true,"isVisible":true,"acceptsPanels":false,"savedBox":{"x":0,"y":0,"width":40,"height":400},"top":null,"bottom":null},"Project":{"x":0,"y":0,"width":1234,"height":29,"dockPosition":3,"isDocked":true,"isResizeable":false,"isDockable":true,"isJoinable":false,"isPickable":true,"isVisible":true,"acceptsPanels":false,"savedBox":{"x":0,"y":0,"width":250,"height":29},"top":null,"bottom":null},"userData":{"x":963,"y":390.5,"width":271,"height":547.5,"dockPosition":2,"isDocked":true,"isResizeable":true,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":false,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":0,"height":0},"top":"Objects","bottom":null},"Map Manager":{"x":40,"y":912,"width":923,"height":26,"dockPosition":4,"isDocked":true,"isResizeable":false,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":true,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":250,"height":26},"top":null,"bottom":null},"physics":{"x":963,"y":390.5,"width":271,"height":547.5,"dockPosition":2,"isDocked":true,"isResizeable":true,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":false,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":0,"height":0},"top":"Objects","bottom":null},"Settings":{"x":963,"y":390.5,"width":271,"height":547.5,"dockPosition":2,"isDocked":true,"isResizeable":true,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":true,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":250,"height":400},"top":"Objects","bottom":null},"Text":{"x":40,"y":29,"width":923,"height":30,"dockPosition":0,"isDocked":false,"isResizeable":false,"isDockable":false,"isJoinable":false,"isPickable":true,"isVisible":false,"acceptsPanels":false,"savedBox":{"x":0,"y":0,"width":944,"height":30},"top":null,"bottom":null},"file-list-holder":{"x":0,"y":0,"width":0,"height":0,"dockPosition":0,"isDocked":false,"isResizeable":true,"isDockable":false,"isJoinable":false,"isPickable":true,"isVisible":true,"acceptsPanels":false,"savedBox":{"x":0,"y":0,"width":250,"height":400},"top":null,"bottom":null},"source-editor":{"x":0,"y":0,"width":0,"height":0,"dockPosition":0,"isDocked":false,"isResizeable":false,"isDockable":false,"isJoinable":false,"isPickable":true,"isVisible":true,"acceptsPanels":false,"savedBox":{"x":0,"y":0,"width":250,"height":400},"top":null,"bottom":null},"color":{"x":656,"y":411,"width":305,"height":200,"dockPosition":0,"isDocked":false,"isResizeable":true,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":false,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":305,"height":200},"top":null,"bottom":null}};
			this.loadLayout(toLoad);
			//this.saveLayout();
		},
		
		saveLayout: function(){
		
			var toSave = {
				__box: this.box,
				__oldScreenSize: this.oldScreenSize
			};
			var p = null;
			
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				toSave[p.name] = {
					x: p.x,
					y: p.y,
					width: p.width,
					height: p.height,
					dockPosition: p.dockPosition,
					
					isDocked: p.isDocked,
					isResizeable: p.isResizeable,
					isDockable: p.isDockable,
					isJoinable: p.isJoinable,
					isPickable: p.isPickable,
					isVisible: p.isVisible,
					acceptsPanels: p.acceptsPanels,
					savedBox: p.savedBox,
					
					
					joints: p.getJointNames(),
					top: (p.top ? p.top.name : null),
					bottom: (p.bottom ? p.bottom.name : null)
				};
			}
			
			var str = JSON.stringify(toSave);
			localStorage.setItem("ui", str);
			console.log("toLoad = ", str);
			
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
