"use strict";

MT.require("ui.Button");
MT.require("ui.PanelHead");
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.Panel = function(title, events){
		MT.ui.DomElement.call(this);
		this.setAbsolute();
		
		this.header = new MT.ui.PanelHead(this);
		this.mainTab = this.header.addTab(title);
		
		this.content = new MT.ui.DomElement();
		this.appendChild(this.content);
		
		this.content.fitIn();
		this.content.show(this.el);
		
		this.content.style.overflow = "auto";
		this.content.addClass("ui-panel-content");
		
		if(title){
			this.addHeader();
		}
		
		this.title = title;
		this.events = events;
		
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
	},
	{
		isResizeable: false,
		isMovable: false,
		isDockable: true,
		
		activate: function(){
			this.show();
		},

		setX: function(val){
			
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setX.call(this.joints[i], val);
			}
			
			if(this.top && this.top.x != val){
				this.top.setX(val);
			}
			if(this.bottom && this.bottom.x != val){
				this.bottom.setX(val);
			}
		},
		
		setTopX: function(val){
			if(this.top){
				this.top.x = val;
				this.top.setTopX(val);
			}
		},
		
		setBottomX: function(val){
			if(this.bottom){
				this.bottom.setX(val);
				this.bottom.setBottomX(val);
			}
		},
		
		set y(val){
			
			var y = this.y;
			this.setY(val);
			
			if(this.isDocked){
				
				if(this.top){
					this.top.height += val - y;
				}
			}
		},
		
		setY: function(val){
			
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setY.call(this.joints[i], val);
			}
			
		},
		
		setWidth: function(val){
			
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setWidth.call(this.joints[i], val);
			}
			
			if(this.top && this.top.width != val){
				this.top.setWidth(val);
			}
			if(this.bottom && this.bottom.width != val){
				this.bottom.setWidth(val);
			}
		},
		
		/* TODO: automatically adjust top members */
		
		setHeight: function(val, adjustTop){
			var old = this.height;
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setHeight.call(this.joints[i], val);
			}
			
			if(this.isDocked && this.top && adjustTop){
				this.top.height += val - old;
			}
			
		},
		
		show: function(parent){
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].hide();
			}
			
			MT.ui.DomElement.show.call(this, parent);
			this.alignButtons();
			this.emit("show");
			
			this.resize();
			
			this.header.showTabs();
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
			console.log("TODO");
		},
		
		unjoin: function(){
			console.log("unjoin");
			
			if(this.joints.length == 1){
				this.breakSideJoints();
				return;
			}
			
			this.removeSideJoints();
			var oldJoints = this.joints;
			
			this.header.removeTab(this.mainTab);
			
			for(var i=0; i<oldJoints.length; i++){
				if(oldJoints[i] == this){
					continue;
				}
				oldJoints[i].removeJoint(this);
			}
			
			this.joints = [this];
			
			this.header.setTabs([this.mainTab]);
			
			for(var i=0; i<oldJoints.length; i++){
				if(oldJoints[i] != this){
					oldJoints[i].show();
					break;
				}
			}
		},
		
		_dockPosition: MT.NONE,
		set dockPosition(pos){
			this.removeClassAll("docked-left");
			this.removeClassAll("docked-right");
			this.removeClassAll("docked-top");
			this.removeClassAll("docked-bottom");
			
			this.setAll("_dockPosition", pos);
			
			if(pos == MT.LEFT){
				this.addClassAll("docked-left");
			}
			
			if(pos == MT.RIGHT){
				this.addClassAll("docked-right");
			}
			
			if(pos == MT.TOP){
				this.addClassAll("docked-top");
			}
			if(pos == MT.BOTTOM){
				this.addClassAll("docked-bottom");
			}
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
		
		
		updateAllSizes: function(){
			this.setAll("width", this.width);
			this.setAll("height", this.height);
		},
		
		joinBottom: function(panel){
			console.log("join bottom");
			
			
			if(this.bottom){
				this.bottom.setAll("top", panel);
				panel.setAll("bottom" , this.bottom);
			}
			
			this.setAll("bottom", panel);
			panel.setAll("top", this);
			
			panel.setAll("top", panel.top);
			panel.setAll("bottom", panel.bottom);
			
			
			
			this.height = this.height - panel.height;
			panel.width = this.width;
			
			panel.x = this.x;
			panel.y = this.y + this.height;
			
			this.updateAllSizes();
			panel.updateAllSizes();
		},
		
		joinTop: function(panel){
			console.log("join top");
			if(this.top){
				this.top.setAll("bottom", panel);
				panel.setAll("top", this.top);
			}
			
			
			this.height = this.height - panel.height;
			panel.width = this.width;
			
			panel.x = this.x;
			
			
			var y = this.y + this.height;
			
			panel.setY(this.y);
			this.setY(y);
			
			this.setAll("top", panel);
			panel.setAll("bottom", this);
			
			this.updateAllSizes();
			panel.updateAllSizes();
			
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
			if(this.bottom){
				console.log("break bottom");
				
				if(this.top){
					this.top.setAll("bottom", this.bottom);
					this.bottom.setAll("top", this.top);
				}
				else{
					this.bottom.setAll("top", null);
				}
				
				this.bottom.setAll("height", this.bottom.height + this.height);
				
				this.bottom.setY(this.y);
				this.joints.forEach(function(){
					console.log(this);
					
				});
			}
			else if(this.top){
				console.log("break top");
				
				
				if(this.bottom){
					this.bottom.setAll("top", this.top);
					this.top.setAll("bottom", this.bottom);
				}
				else{
					this.top.setAll("bottom", null);
				}
				
				
				this.top.setAll("height", this.top.height + this.height);
			}
			
			
			
			this.setAll("top",  null);
			this.setAll("bottom", null);
			this.updateAllSizes();
		},
		
		_isDocked: false,
		set isDocked(val){
			this.setAll("_isDocked", val);
		},
		
		get isDocked(){
			return this._isDocked;
		},
		
		addJoint: function(panel){
			if(panel.joints == this.joints){
				return;
			}
			for(var i=0; i<panel.joints.length; i++){
				this.joints.push(panel.joints[i]);
			}
			
			
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
			
			
			
			//var oldJoints = panel.joints;
			
			panel.setAll("joints", this.joints);
			//panel.header.tabs = this.header.tabs;
			
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].header.tabs = this.header.tabs;
			}
			
			
			this.setAll("top", this.top);
			this.setAll("bottom", this.bottom);
			
			/*for(var i=0; i<oldJoints.length; i++){
				this.addJoint(oldJoints[i]);
			}*/
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
				debugger;
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
		
		hide: function(){
			if(!this.isVisible){
				return;
			}
			MT.ui.DomElement.hide.call(this);
			this.emit("hide");
		},
		
		addHeader: function(){
			this.appendChild(this.header);
			this.header.show(this.el);
			this.content.y = this.header.height;
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
			
			this.alignButtons();
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
		}
		
	}
);
