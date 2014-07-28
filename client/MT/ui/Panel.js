"use strict";

MT.require("ui.Button");
MT.require("ui.PanelHead");
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.Panel = function(title, ui){
		MT.ui.DomElement.call(this);
		this.setAbsolute();
		
		this.header = new MT.ui.PanelHead(this);
		this.mainTab = this.header.addTab(title);
		
		this.content = new MT.ui.DomElement();
		this.appendChild(this.content);
		
		
		this.content.show(this.el);
		this.content.addClass("ui-panel-content");
		
		
		if(title){
			this.addHeader();
		}
		
		this.title = title;
		
		this.buttons = [];
		this.savedBox = {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};
		this.isVisible = false;
		
		this.joints = [this];
		
		this.addClass("ui-panel");
		
		
		this.top = null;
		this.right = null;
		this.bottom = null;
		this.left = null;
		
		this.ui = ui;
	},
	{
		isResizeable: false,
		isMovable: false,
		isDockable: false,
		isJoinable: false,
		acceptsPanels: false,
		isPickable: true,
		
		setFree: function(){
			this.isMoveable = true;
			this.isDockable = true;
			this.isJoinable = true;
			this.isDockable = true;
			this.isResizeable = true;
			this.acceptsPanels = true;
		},
		
		addOptions: function(options){
			this.options = {};
			var list = this.options.list = new MT.ui.List(options, this.ui, true);
			
			list.addClass("settings-list");
			//list.fitIn();
			
			var that = this;
			
			var button = this.options.button = new MT.ui.Button(null, "ui-options", null, function(e){
				e.stopPropagation();
				
				if(!list.isVisible){
					list.show(that.header.el);
					button.addClass("selected");
				}
				else{
					list.hide();
					button.removeClass("selected");
				}
			});
			button.show(this.header.el);
			
			list.on("hide", function(){
				button.removeClass("selected");
			});
			
			this.header.addChild(this.options);
			
			list.style.left = 0;
			list.style.right = 0;
			
			return this.options;
		},
		
		
		activate: function(){
			this.show();
		},

		setX: function(val){
			
			this.setClearX(val);
			
			if(this.top && this.top.x != val){
				this.top.setX(val);
			}
			if(this.bottom && this.bottom.x != val){
				this.bottom.setX(val);
			}
		},
		
		setClearX: function(val){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setX.call(this.joints[i], val);
			}
		},
		
		setWidth: function(val){
			
			this.setClearWidth(val)
			
			if(this.top && this.top.width != val){
				this.top.setWidth(val);
			}
			if(this.bottom && this.bottom.width != val){
				this.bottom.setWidth(val);
			}
			
			this.emit("resize", this.width, this.height);
		},
		
		setClearWidth: function(val){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setWidth.call(this.joints[i], val);
			}
		},
		
		setY: function(val){
			
			if(this.top){
				this.top.height += val - this.y;
			}
			
			
			this.setClearY(val);
		},
		
		setClearY: function(val){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setY.call(this.joints[i], val);
			}
		},
		
		setHeight: function(val){
			
			if(this.dockPosition == MT.TOP && this.bottom){
				this.bottom.setClearY(this.bottom.y + (val - this.height));
			}
			
			this.setClearHeight(val);
			
			if(this.left && this.left.height != val){
				this.left.setWidth(val);
			}
			if(this.right && this.right.width != val){
				this.right.setWidth(val);
			}
			
			
			this.emit("resize", this.width, this.height);
		},
		
		setClearHeight: function(val){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setHeight.call(this.joints[i], val);
			}
		},
		
		show: function(parent, silent){
			if(this.isVisible){
				return this;
			}
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].hide(false);
			}
			
			MT.ui.DomElement.show.call(this, parent);
			this.setAll("_parent", this._parent);
			
			if(silent !== false){
				this.emit("show");
			}
			
			this.header.showTabs();
			this.content.fitIn();
			this.content.y = this.header.el.offsetHeight;
			return this;
		},
		
		addClass: function(className){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.addClass.call(this.joints[i], className);
			}
		},
		
		removeClass: function(className){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.removeClass.call(this.joints[i], className);
			}
		},
		
		setJoints: function(key, value){
			for(var i=0; i<this.joints.length; i++){
				this.joints[i][key] = value;
			}
			
		},
		
		setAll: function(key, value){
			this.setJoints(key, value);
		},
		
		setTop: function(key, value){
			this.setAll(key, value);
			if(this.top){
				this.top.setTop(key,value);
			}
		},
		
		setBottom: function(key, value){
			this.setAll(key, value);
			if(this.bottom){
				this.bottom.setBottom(key,value);
			}
		},
		
		setTopBottom: function(key, value){
			this.setTop(key, value);
			this.setBottom(key, value);
		},
		
		setLeftRight: function(key, value){
			//console.log("TODO");
		},
		
		unjoin: function(){
			if(this.joints.length == 1){
				this.breakSideJoints();
				return;
			}
			
			this.removeSideJoints();
			var oldJoints = this.joints;
			this.joints = [this];
			for(var i=0; i<oldJoints.length; i++){
				if(oldJoints[i] == this){
					oldJoints.splice(i, 1);
					break;
				}
			}
			
			
			
			this.header.removeTab(this.mainTab);
			
			this.header.setTabs([this.mainTab]);
			
			for(var i=0; i<oldJoints.length; i++){
				if(oldJoints[i] != this){
					oldJoints[i].show();
					oldJoints[i].header.showTabs();
					
					break;
				}
			}
		},
		
		addJoint: function(panel){
			console.log("join", this.title, panel.title);
			
			panel._parent = this._parent;
			
			panel.removeClass("animated");
			this.removeClass("animated");
			
			if(panel.joints == this.joints){
				return;
			}
			
			for(var i=0; i<panel.joints.length; i++){
				this.joints.push(panel.joints[i]);
			}
			panel.setAll("joints", this.joints);
			
			if(this.header.tabs != panel.header.tabs){
				
				var tabs = panel.header.tabs;
				var needPush = true;
				for(var i=tabs.length-1; i>-1; i--){
					for(var j=0; j<this.header.tabs.length; j++){
						if(this.header.tabs[j] == tabs[i]){
							needPush = false;
							break;
						}
					}
					if(needPush){
						this.header.tabs.push(tabs[i]);
					}
				}
			}
			
			
			
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].header.tabs = this.header.tabs;
			}
			
			
			this.setAll("top", this.top);
			this.setAll("bottom", this.bottom);
			
			
			if(!panel.isVisible && this.isVisible){
				panel.show();
			}
			
		},
		
		_dockPosition: MT.NONE,
		set dockPosition(pos){
			var topMost = this.getTopMost();
			topMost.setDockPosition(pos);
		},
		
		setDockPosition: function(pos, skip){
			
			this.removeClassAll("docked-left");
			this.removeClassAll("docked-right");
			this.removeClassAll("docked-top");
			this.removeClassAll("docked-bottom");
			this.removeClassAll("docked-left-bottom");
			this.removeClassAll("docked-left-top");
			this.removeClassAll("docked-center");
			
			this.setAll("_dockPosition", pos);
			
			if(pos == MT.LEFT || pos == MT.RIGHT){
				if(!this.top){
					this.addClassAll("docked-left-top");
				}
				
				if(!this.bottom){
					this.addClassAll("docked-left-bottom");
				}
				
				if(pos == MT.LEFT){
					this.addClassAll("docked-left");
				}
				
				if(pos == MT.RIGHT){
					this.addClassAll("docked-right");
				}
			}
			
			if(pos == MT.TOP){
				this.addClassAll("docked-top");
			}
			if(pos == MT.BOTTOM){
				this.addClassAll("docked-bottom");
			}
			if(pos == MT.CENTER){
				this.addClassAll("docked-center");
			}
			if(this.bottom){
				this.bottom.setDockPosition(pos);
			}
		},
		
		getTopMost: function(){
			var top = this;
			while(top.top){
				top = top.top;
			}
			return top;
		},
		
		getBottomMost: function(){
			var bottom = this;
			while(bottom.bottom){
				bottom = bottom.bottom;
			}
			return bottom;
		},
		
		get dockPosition(){
			return this._dockPosition;
		},
		
		addClassAll: function(className){
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].addClass(className);
			}
		},
		
		removeClassAll: function(className){
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].removeClass(className);
			}
		},
		
		
		joinBottom: function(panel, noResize){
			if(panel == this.bottom){
				return;
			}
			if(!noResize){
				this.setClearHeight(this.height - panel.height);
				panel.setClearWidth(this.width);
				
				panel.setClearX(this.x);
				panel.setClearY(this.y + this.height);
			}
			
			if(this.bottom){
				this.bottom.setAll("top", panel);
				panel.setAll("bottom" , this.bottom);
			}
			
			this.setAll("bottom", panel);
			panel.setAll("top", this);
			
			panel.setAll("top", panel.top);
			panel.setAll("bottom", panel.bottom);
			
		},
		
		joinTop: function(panel, noResize){
			if(panel == this.top){
				return;
			}
			if(!noResize){
				this.setClearHeight(this.height - panel.height);
				panel.setClearWidth(this.width);
				
				panel.setClearX(this.x);
				
				
				var y = this.y + this.height;
				
				panel.setClearY(this.y);
				this.setClearY(y);
			}
			
			if(this.top){
				this.top.setAll("bottom", panel);
				panel.setAll("top", this.top);
			}
			
			this.setAll("top", panel);
			panel.setAll("bottom", this);
			
		},
		
		
		removeSideJoints: function(){
			if(this.joints.length > 1){
				var next = null;
				for(var i=0; i<this.joints.length; i++){
					next = this.joints[i];
					if(next != this){
						break;
					}
				}
				
				this.setAll("top", this.top);
				this.setAll("bottom", this.bottom);
				
				if(this.top){
					this.top.setAll("bottom", next);
				}
				if(this.bottom){
					this.bottom.setAll("top", next);
				}
				
				this.top = null;
				this.bottom = null;
				return;
			}
			
			
			if(this.top){
				this.top.setAll("bottom", this.bottom);
			}
			if(this.bottom){
				this.bottom.setAll("top", this.top);
			}
			
			this.top = null;
			this.bottom = null;
		},
		
		breakSideJoints: function(){
			var pos = this.dockPosition;
			if(this.bottom){
				if(this.top){
					this.top.setAll("bottom", this.bottom);
				}
				this.bottom.setAll("top", this.top);
				
				
				this.bottom.setClearHeight(this.bottom.height + this.height);
				this.bottom.setClearY(this.y);
				
				this.bottom.setDockPosition(pos);
				
			}
			else if(this.top){
				if(this.bottom){
					this.bottom.setAll("top", this.top);
				}
				this.top.setAll("bottom", this.bottom);
				
				this.top.setClearHeight(this.top.height + this.height);
			}
			
			
			this.setAll("top", null);
			this.setAll("bottom", null);
			this.setAll("left", null);
			this.setAll("right", null);
			
		},
		
		_isDocked: false,
		set isDocked(val){
			this.setAll("_isDocked", val);
		},
		
		get isDocked(){
			return this._isDocked;
		},
		

		
		removeJoint: function(panel){
			var j = null;
			for(var i=0; i<this.joints.length; i++){
				j = this.joints[i];
				if(j == panel){
					this.joints.splice(i, 1);
					return;
				}
			}
		},
		
		vsBox: function(box){
			return !(this.x + this.width < box.x || this.y + this.height < box.y || this.x > box.x + box.width || this.y > box.y + box.height);
		},
		
		vsPoint: function(point){
			return !(this.x + this.width < point.x || this.y + this.height < point.y || this.x > point.x || this.y > point.y );
		},
		
		mouseDown: false,
		
		saveBox: function(shallow){
			if(this.isDocked){
				console.warn("saving docked panel");
				return;
			}
			
			this.savedBox.width = this.width;
			this.savedBox.height = this.height;
			if(shallow){
				return;
			}
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].saveBox(true);
			}
		},
		
		loadBox: function(){
			this.width = this.savedBox.width;
			this.height = this.savedBox.height;
		},
		
		hide: function(silent){
			if(!this.isVisible){
				return this;
			}
			this.isVisible = false;
			MT.ui.DomElement.hide.call(this);
			if(silent !== false){
				this.emit("hide");
			}
			else{
				this.emit("unselect");
			}
			return this;
		},
		
		addHeader: function(){
			this.appendChild(this.header);
			this.header.show(this.el);
		},
		
		removeHeader: function(){
			this.header.hide();
			this.content.y = 0;
		},
		
		addButton: function(title, className, cb){
			var b = null;
			
			if(title && typeof title == "object"){
				b = title;
			}
			else{
				b = new MT.ui.Button(title, className, this.events, cb);
			}
			this.content.addChild(b);
			this.buttons.push(b);
			b.show();
			
			return b;
		},
		
		alignButtons: function(){
			var off = 0;
			var c = null;
			for(var i=0; i<this.buttons.length; i++){
				c = this.buttons[i];
				c.x = off;
				off += c.width;
			}
		},
		
		addButtonV: function(title, className, cb){
			var b = new MT.ui.Button(title, className, this.events, cb);
			
			var off = 0;
			for(var i=0; i<this.content.children.length; i++){
				off += this.content.children[i].el.offsetHeight;
			}
			
			b.y += off;
			
			this.content.addChild(b);
			return b;
		},
		
		getJointNames: function(){
			var names = [];
			for(var i=0; i<this.joints.length; i++){
				if(this.joints[i] == this){
					continue;
				}
				names.push(this.joints[i].name);
			}
			
		},
		
	}
);
