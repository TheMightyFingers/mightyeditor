"use strict";

MT.require("ui.Events");
MT.require("ui.Panel");

MT.LEFT = 1;
MT.RIGHT = 2;
MT.TOP = 3;
MT.BOTTOM = 4;
MT.CENTER = 5;
MT.NONE = 0;

MT(
	MT.ui.Controller = function(){
		this.events = new MT.ui.Events();
		this.panels = [];
		
		this.docksLeft = [];
		this.docksRight = [];
		
		
		this.helper = new MT.ui.DomElement();
		this.helper.style.backgroundColor = "rgba(200,0,0,0.5)";
		this.helper.setAbsolute();
		
		
		this.helper.addClass("ui-main-helper");
		
		this.box = {
			x: 0,
			y: 0,
			width: window.innerWidth,
			height: window.innerHeight
		};
		
		this.snapPx = 20;
		var that = this;
		var mDown = false;
		
		this.events.on(this.events.RESIZE, function(){
			that.updateDockPosition();
		});
		
		var activePanel = null;
		var needResize = false;
		
		this.events.on(this.events.MOUSEMOVE, function(e){
			if(!mDown){
				var panel = that.pickPanel(e);
				if(!panel){
					that.resetResizeCursor();
					activePanel = null;
					return;
				}
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
			mDown = true;
			if(!activePanel){
				return;
			}
			
			if(e.target.data && e.target.data.panel){
				activePanel = e.target.data.panel;
				activePanel.isNeedUnjoin = true;
				activePanel.show();
				activePanel.style.zIndex = that.zIndex;
				that.zIndex++;
			}
			else{
				activePanel.isNeedUnjoin = false;
				activePanel.mdown = true;
				activePanel.isNeedUnjoin = false;
				activePanel.style.zIndex = that.zIndex;
				that.zIndex++;
			}
		});
		
		this.events.on(this.events.MOUSEUP, function(e){
			mDown = false;
			
			if(!activePanel){
				return;
			}
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
		});
	},
	{
		LEFT: MT.LEFT,
		RIGHT: MT.RIGHT,
		TOP: MT.TOP,
		BOTTOM: MT.BOTTOM,
   
		toResize: {
			TOP: false,
			RIGHT: false,
			BOTTOM: false,
			LEFT: false
		},
   
		zIndex: 1,
   
		createPanel: function(name, width, height){
			var p = new MT.ui.Panel(name, this.events);
			this.panels.push(p);
			
				p.width = width || 250;
				p.height = height || 400;
			
			
			p.show();
			
			p.name = name;
			p.style.zIndex = 1;
			return p;
		},
   
		removePanel: function(panel){
			this.disableMoveable(panel);
			
			
			for(var i=0; i<this.panels.length; i++){
				if(this.panels[i] == panel){
					this.panels.splice(i, 1);
					return;
				}
			}
		},
		
		setMoveable: function(panel){
			panel.isMoveable = true;
		},
		
		setResizeable: function(panel){
			panel.isResizeable = true;
		},
		setDockable: function(panel){
			panel.isDockable = true;
		},
		disableMoveable: function(panel){
			panel.isMoveable = false;
		},
		   
		checkResize: function(panel, e){
			if(!panel.isResizeable){
				return false;
			}
			var borderV = 0;
			var borderH = 0;
			var style = panel.getStyle();
			
			var hor = (e.x - panel.x);
			var ver = (e.y - panel.y);
			
			var needResize = false;
			
			if(hor/panel.width < 0.5){
				borderH = parseInt(style.borderLeft);
				if(hor < borderH){
					this.toResize.LEFT = true;
					needResize = true;
				}
			}
			else{
				borderH = parseInt(style.borderRight);
				if( panel.width - hor < borderH){
					this.toResize.RIGHT = true;
					needResize = true;
				}
			}
			if(ver/panel.height < 0.5){
				borderV = parseInt(style.borderTop);
				if(ver < borderV){
					this.toResize.TOP = true;
					needResize = true;
				}
			}
			else{
				borderV = parseInt(style.borderBottom);
				if( panel.height - ver < borderV){
					this.toResize.BOTTOM = true;
					needResize = true;
				}
			}
			
			this.setResizeCursor(!needResize);
			
			
			return needResize;
		},
   
		setResizeCursor: function(reset){
			
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
			
			if(reset){
				this.resetResizeCursor();
			}
			else{
				document.body.style.cursor = r+"-resize";
			}
		},
		
		resetResizeCursor: function(){
			this.toResize.TOP = false;
			this.toResize.RIGHT = false;
			this.toResize.BOTTOM = false;
			this.toResize.LEFT = false;
			document.body.style.cursor = "auto";
		},
		
		resizePanel: function(panel, e){
			var mx = this.events.mouse.mx;
			var my = this.events.mouse.my;
			if(this.toResize.RIGHT){
				panel.width += mx;
			}
			
			if(this.toResize.BOTTOM){
				panel.height += my;
			}
			
			if(this.toResize.LEFT){
				panel.x += mx;
				panel.width = panel.width - mx;
			}
			
			if(this.toResize.TOP){
				//skip top panel
				if(!panel.isDocked || panel.top !== null){
					panel.y += my;
					panel.height -= my;
				}
			}
			
			if(panel.isDocked){
				this.moveDocks();
			}
			
			
		},
   
		dockToLeft: function(panel){
			if(!panel.isDockable){
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			this.undock(panel);
			
			panel.saveBox();
			panel.x = this.box.x;
			panel.y = this.box.y;
			panel.setAll("height", this.box.height);
			panel.dockPosition = MT.LEFT;
			panel.isDocked = true;
			this.moveDocksLeft();
		},
   
		dockToRight: function(panel){
			if(!panel.isDockable){
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			this.undock(panel);
			
			panel.x = this.box.width - panel.width;
			panel.y = this.box.y;
			panel.setAll("height", this.box.height);
			panel.dockPosition = MT.RIGHT;
			panel.isDocked = true;
			
			this.moveDocksRight();
		},

		dockToTop: function(panel){
			if(!panel.isDockable){
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			this.undock(panel);
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
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			this.undock(panel);
			panel.y = this.box.y;
			panel.x = this.box.x;
			panel.width = this.box.width;
			this.box.y += panel.height;
			
			
			panel.dockPosition = MT.BOTTOM;
			panel.isDocked = true;
			
			this.moveDocksTop();
			
		},
   
		tryUnjoin: function(panel, e){
			if(!panel.isNeedUnjoin){
				return true;
			}
			
			var mx = panel.events.mouse.mx;
			var my = panel.events.mouse.my;
			
			panel.ox += mx;
			panel.oy += my;
			
			if(Math.abs(panel.ox) < this.snapPx && Math.abs(panel.oy) < this.snapPx){
				return false;
			}
			
			
			
			panel.unjoin();
			panel.isNeedUnjoin = false;
			
			panel.x += panel.ox;
			panel.y += panel.oy;
			panel.ox = 0;
			panel.oy = 0;
			
			
			return true;
		},
   
		movePanel: function(panel, e){
			if(!panel.isMoveable){
				return;
			}
			
			var hideHelper = true;
			
			var over = this.vsPanels(e, panel);
			
			if(over){
				var perc = (e.y - over.y) / over.height;
				this.showHelperOverPanel(over, perc);
				hideHelper = false;
			}
			
			var mx = panel.events.mouse.mx;
			var my = panel.events.mouse.my;
			
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
				else if( /*this.box.width - panel.width > window.innerWidth*0.5 && */ Math.abs(e.x - (this.box.width) ) < this.snapPx && !over){
					this.showDockHelperRight(panel);
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
			this.helper.height = this.box.height;
			this.helper.x = this.box.x;
			this.helper.y = this.box.y;
			
			this.helper.dockPosition = this.LEFT;
			
			panel.isDockNeeded = true;
			this.helper.toJoinWith = null;
		},
		
		showDockHelperRight: function(panel){
			
			this.helper.show();

			this.helper.width = panel.width;
			this.helper.height = this.box.height;
			this.helper.x = this.box.width - panel.width;
			this.helper.y = this.box.y;
			
			this.helper.dockPosition = this.RIGHT;
			
			panel.isDockNeeded = true;
			this.helper.toJoinWith = null;
		},
   
		showHelperOverPanel: function(panel, perc){
			this.helper.width = panel.width;
			this.helper.x = panel.x;
			this.helper.toJoinWith = panel;
			
			if(panel.isDocked){
				if(perc < 0.3){
					this.helper.y = panel.y;
					this.helper.height = panel.height*0.5;
					this.helper.joinPosition = this.TOP;
				}
				
				else if(perc > 0.7){
					this.helper.height = panel.height*0.5;
					this.helper.y = panel.y + panel.height - this.helper.height;
					this.helper.joinPosition = this.BOTTOM;
				}
				else{
					this.helper.y = panel.y;
					this.helper.height = panel.height;
					this.helper.joinPosition = this.CENTER;
				}
			}
			else{
				this.helper.y = panel.y;
				this.helper.height = panel.height;
				this.helper.joinPosition = this.CENTER;
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
				if(this.helper.joinPosition == this.CENTER){
					this.joinPanels(join, panel);
				}
				if(this.helper.joinPosition == this.BOTTOM){
					join.joinBottom(panel);
					if(join.isDocked){
						panel.dockPosition = join.dockPosition;
						panel.isDocked = true;
					}
				}
				if(this.helper.joinPosition == this.TOP){
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
		
		debug: function(panel){
			
			var cnt = 0;
			var j = panel.bottom;
			while(j){
				j = j.bottom;
				cnt++;
				if(cnt>10){
					debugger;
					break;
				}
			}
			
			cnt = 0;
			j = panel.top;
			while(j){
				j = j.top;
				cnt++;
				if(cnt>10){
					debugger;
					break;
				}
			}
			
		},

		joinPanels: function(target, panel){
			console.log("join");
			
			//this.debug(panel);
			
			panel.inheritSize(target);
			
			//this.debug(panel);
			target.addJoint(panel);
			
			
			//this.debug(panel);
			target.removeClass("active");
			panel.removeClass("active");
			
			target.hide();
			
			if(target.isDocked){
				this.dockToHelper(panel, target);
			}
			
			
			//this.debug(panel);
			panel.header.setActiveIndex(0);
			panel.header.showTabs();
			
			panel.isDockNeeded = false;
			
			//panel.setAll("dockPosition", panel.dockPosition);
			
		},
		
		vsPanels: function(point, panel){
			var p = null;
			for(var i=this.panels.length-1; i>-1; i--){
				p = this.panels[i];
				if(p == panel || !p.isVisible){
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
			console.log("dock");
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
				console.log("not docked");
				return;
			}
			console.log("undock");
			
			panel.isDocked = false;
			
			var needUpdate = true;
			if(panel.top || panel.bottom){
				needUpdate = false;
			}
			
			panel.breakSideJoints();
			
			
			panel.width = panel.savedBox.width;
			panel.height = panel.savedBox.height;
			
			for(var i=0; i<panel.joints.length; i++){
				panel.joints[i].inheritSize(panel);
			}
			
			
			
			
			
			if(needUpdate){
				if(panel.dockPosition == MT.LEFT){
					this.moveDocksLeft(panel);
				}
				else if(panel.dockPosition == MT.RIGHT){
					this.moveDocksRight(panel);
				}
			}
			
			panel.loadBox();
			
			panel.dockPosition = MT.NONE;
		},
		
		moveDocks: function(){
			this.moveDocksLeft();
			this.moveDocksRight();
			this.moveDocksTop();
			this.moveDocksBottom();
			return;
		},
		
		moveDocksLeft: function(panel){
			
			var tmp = this.panels.slice(0);
			
			tmp.sort(function(a, b){
				return a.x > b.x;
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
				p.setTopBottom("justUpdated", true);
			}
			
		},
   
		moveDocksRight: function(panel){
			console.log("move docks");
			var tmp = this.panels.slice(0);
			
			tmp.sort(function(a, b){
				return a.x + a.width < b.x + b.width;
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
				return a.y > b.y;
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
				p.setLeftRight("justUpdated", true);
			}
		},
		
		moveDocksBottom: function(panel){
			console.log("move docks");
			var tmp = this.panels.slice(0);
			
			tmp.sort(function(a, b){
				return a.x + a.width < b.x + b.width;
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
		loadLayout: function(){
			console.log("todo");
		},
		
		saveLayout: function(){
			console.log("todo");
		}
	}
);
