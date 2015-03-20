"use strict";

MT.require("ui.Button");
MT.require("ui.PanelHead");
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.Panel = function(title, ui){
		if(title == ""){
			title = "&nbsp;";
		}
		
		MT.ui.DomElement.call(this);
		this.setAbsolute();
		
		this.header = new MT.ui.PanelHead(this);
		this.mainTab = this.header.addTab(title);
		
		this.content = new MT.ui.DomElement();
		this.appendChild(this.content);
		
		
		this.content.show(this.el);
		this.content.addClass("ui-panel-content");
		
		this._input = document.createElement("input");
		this._input.setAttribute("readonly", "readonly");
		this._input.style.cssText = "position: fixed; top: -99999px;";
		this._input.panel = this;
		this.content.el.appendChild(this._input);
		
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
		isDockable: true,
		isJoinable: true,
		acceptsPanels: false,
		isPickable: true,
		isCloaseable: false,
		isRenamable: false,
		
		set title(val){
			this.mainTab.title.innerHTML = val;
		},
		
		get title(){
			return this.mainTab.title.innerHTML;
		},
		
		get activeJoint(){
			for(var i=0; i<this.joints.length; i++){
				if(this.joints[i].isVisible){
					return this.joints[i];
				}
			}
		},
		
		startRename: function(){
			var el = this.mainTab;
			var that = this;
			this.emit("renameStart");
			
			if(!this.input){
				this.input = document.createElement("input");
				this.input.className = "ui-input ui-panel-rename";
			}
			
			this.input.style.left = (el.calcOffsetX(document.body))+"px";
			this.input.style.top = (el.calcOffsetY(document.body) - 2) + "px"; // check padding here instead of 2 :)
			this.input.style.width = (el.width - 10) + "px";
			

			this.input.value = this.title;
			var lastValue = this.title;
			
			this.input.type = "text";
			
			el.title.style.visibility = "hidden";
			
			document.body.appendChild(this.input);
			
			var needSave = true;
			this.input.onblur = function(){
				try{
					if(this.parentNode){
						this.parentNode.removeChild(this);
					}
				}
				catch(e){}
				
				var o = lastValue;
				var n = this.value;
				if(needSave && this.value != ""){
					if(o !== n){
						el.title.innerHTML = n;
						that.title = n;
						that.emit("rename", n, o);
					}
				}
				el.title.style.visibility = "visible";
			};
			
			this.input.addEventListener("keydown",function(e){
				e.stopPropagation();
			});
			
			this.input.onkeyup = function(e){
				e.stopPropagation();
				if(e.which == MT.keys.ESC){
					needSave = false;
					this.blur();
				}
				if(e.which == MT.keys.ENTER){
					this.blur();
				}
			};
			
			
			
			
			this.input.focus();
			
			var tmp = this.title.split(".");
			var len = 0;
			if(tmp.length == 1){
				len = tmp[0].length;
			}
			else{
				len = -1;
			}
			for(var i=0; i<tmp.length-1; i++){
				len += tmp[i].length+1;
			}
			
			this.input.setSelectionRange(0, len);
			
			this.inputEnabled = true;
		},
		
		setFree: function(){
			this.isMovable = true;
			this.isDockable = true;
			this.isJoinable = true;
			this.isDockable = true;
			this.isResizeable = true;
			this.acceptsPanels = true;
		},
		focus: function(){
			this.saveScroll();
			//this._input.focus();
			this.restoreScroll();
		},
		
		saveScroll: function(){
			if(!this.savePos){
				this.savedPos = {
					left: this.content.el.scrollLeft,
					top: this.content.el.scrollTop
				};
			}
			else{
				this.savedPos.left = this.content.el.scrollLeft;
				this.savedPos.top = this.content.el.scrollTop;
			}
			
		},
		
		restoreScroll: function(){
			if(!this.savedPos){
				return;
			}
			this.content.el.scrollLeft = this.savedPos.left;
			this.content.el.scrollTop = this.savedPos.top;
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
		addButtons: function(options){
			if(!this.buttonsHolder){
				this.buttonsHolder = document.createElement("div");
				this.buttonsHolder.className = "panel-buttonsHolder";
				this.content.el.appendChild(this.buttonsHolder);
			}
			var buttons = [];
			var button;
			for(var i=0; i<options.length; i++){
				button = new MT.ui.Button(null, "panel-head-button "+options[i].className, null, options[i].cb);
				button.show(this.buttonsHolder);
				button.el.setAttribute("title", options[i].label);
			}
			
			
		},
		removeBorder: function(){
			this.addClass("borderless");
		},
		showBorder: function(){
			this.removeClass("borderless");
		},
		activate: function(){
			this.show();
		},
		
		reset: function(obj){
			this.dockPosition = obj.dockPosition;
			
			// is docked should be removed..
			this.isDocked = obj.isDocked;
			//this.isVisible = obj.isVisible;
			
			this.x = obj.x;
			this.y = obj.y;
			this.width = obj.width;
			this.height = obj.height;
			
			this.top = null;
			this.bottom = null;
			
			if(this.joints.length > 1){
				this.isVisible = true;
				MT.ui.DomElement.show.call(this, this._parent);
			}
			
			this.joints = [this];
			this.header.tabs = [this.mainTab];
			this.header.setTabs(this.header.tabs);
			
			this.setClearX(obj.x);
			this.setClearY(obj.y);
			this.setClearWidth(obj.width);
			this.setClearHeight(obj.height);
			
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
			
			
		},
		
		setClearWidth: function(val){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setWidth.call(this.joints[i], val);
				this.joints[i].emit("resize", this.width, this.height);
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
		alingCenter: function(){
			this.x = (window.innerWidth - this.width)*0.5;
			this.y = (window.innerHeight - this.height)*0.5;
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
			
			
			//this.emit("resize", this.width, this.height);
		},
		
		setClearHeight: function(val){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setHeight.call(this.joints[i], val);
				this.joints[i].emit("resize", this.width, this.height);
			}
			
		},
		
		show: function(parent, silent){
			this.header.showTabs();
			
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
			
			
			this.content.fitIn();
			var that = this;
			var align = function(){
				if(!that.header.el.offsetHeight){
					window.setTimeout(align, 50);
					return;
				}
				that.content.y = that.header.el.offsetHeight;
				that.restoreScroll();
				
			};
			
			align();
			
			
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
			
			
			// show first
			for(var i=0; i<oldJoints.length; i++){
				if(oldJoints[i] != this){
					oldJoints[i].show();
					oldJoints[i].header.showTabs();
					break;
				}
			}
		},
		
		addJoint: function(panel){
			if(!panel || this == panel){
				console.log("joining with self?");
				return;
			}
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
			
			var j = this.activeJoint;
			if(j){
				j.show();
			}
			return;
			if(!panel.isVisible && this.isVisible){
				//panel.show();
				panel.header.setTabs(this.header.tabs);
			}
			else{
				this.header.setTabs(this.header.tabs);
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
		
		
		_bottom: null,
		
		set bottom(val){
			if(typeof val != "object"){
				throw new Error("setting top nt non object", val);
			}
			
			var next = this._bottom;
			
			var depth = 0;
			
			while(next){
				depth++;
				if(depth > 10){
					console.warn("recursivity warning");
					break;
				}
				if(next == this  || next == val){
				}
				
				next = next._bottom;
			}
			
			this._bottom = val;
			
		},
		
		get bottom(){
			return this._bottom;
		},
		
		_top: null,
		set top(val){
			if(typeof val != "object"){
				throw new Error("setting top nt non object", val);
			}
			
			var next = this._top;
			var depth = 0;
			while(next){
				depth++;
				if(depth > 10){
					console.warn("recursivity warning");
					break;
				}
				if(next == this || (next == val && next != this._top)){
					console.warn("recursivity warning");
					this._top = val;
					return;
				}
				
				next = next._top;
			}
			
			this._top = val;
		},
		
		get top(){
			return this._top;
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
			if(val == void(0)){
				throw new Error("docek");
			}
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
			if(this.savedBox.width){
				this.width = this.savedBox.width;
			}
			if(this.savedBox.height){
				this.height = this.savedBox.height;
			}
		},
		getVisibleJoint: function(){
			for(var i=0; i<this.joints.length; i++){
				if(this.joints[i].isVisible){
					return this.joints[i];
				}
			}
			
			this.show(this._parent, false);
			return this;
		},
		hide: function(silent, noEmit){
			if(!this.isVisible){
				return this;
			}
			this.saveScroll();
			
			this.isVisible = false;
			MT.ui.DomElement.hide.call(this);
			if(noEmit != void(0)){
				return this;
			}
			
			
			if(silent !== false){
				this.emit("hide");
			}
			else{
				this.emit("unselect");
			}
			return this;
		},
		
		close: function(){
			this.unjoin();
			this.hide();
			this.emit("close");
		},
		
		addHeader: function(){
			this.appendChild(this.header);
			this.header.show(this.el);
		},
		
		removeHeader: function(){
			this.header.hide();
			this.content.y = 0;
		},
		
		addButton: function(title, className, cb, tooltip){
			var b = null;
			
			if(title && typeof title == "object"){
				b = title;
			}
			else{
				b = new MT.ui.Button(title, className, this.events, cb, tooltip);
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
				names.push(this.joints[i].name);
			}
			return names;
		},
		
	}
);
