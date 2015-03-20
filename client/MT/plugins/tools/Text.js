"use strict";
MT.require("ui.Dropdown");
MT.require("ui.TextColorPicker");


MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Text = function(tools){
		MT.core.BasicTool.call(this, tools);
		
		this.manager = this.tools.project.plugins.fontmanager;
		this.fonts = this.manager.fonts;
		
		this.name = "text";
		this.isInitialized = false;
		
		
		var that = this;
		var ui = tools.ui;
		this.tools = tools;
		
		
		this.tester = document.createElement("span");
		
		
		this.tools.on(MT.OBJECT_SELECTED, function(obj){
			if(tools.map.selector.count > 1){
				that.panel.hide();
				return;
			}
			//if(tools.map.activeObject){
				that.select(obj);
			//}
		});
		
		this.tools.on(MT.OBJECT_UNSELECTED, function(){
			that.panel.hide();
		});
		
		var ev = this.tools.ui.events;
		ev.on(ev.KEYUP, function(e){
			var w = e.which;
			if(w == MT.keys.ESC){
				that.textPopup.hide(true);
			}
		});
		
		
		this.manager.on("update", function(){
			that.updateFontFaces();
		});
		
		var ready = function(){
			that.checkFonts();
			
			that.tools.map.off(ready);
		};
		this.tools.map.on(MT.MAP_OBECTS_ADDED, ready);
		
		
		this.createPanel();

	},{
		
		createPanel: function(){
			var that = this;
			var ui = this.tools.ui;
			
			this.panel = ui.createPanel("Text");
			
			this.panel.style.height = this.project.panel.height + "px";
			this.panel.style.top = this.tools.map.panel.content.bounds.top + "px";
			this.panel.style.left = this.project.panel.width + "px";
			
			this.panel.addClass("text-tools");
			this.panel.removeHeader();
			
			this.panel.hide();
			
			
			this.buildOptions();
			
			
			var fonts = this.fonts;
			
			var fontList = [];
			for(var i=0; i<fonts.length; i++){
				fontList.push(this._mk_setFontSelect(fonts[i]));
			}
			
			this.fontFace = new MT.ui.Dropdown({
				list: fontList,
				button: {
					class: "text-font",
					width: "auto"
				},
				listStyle: {
					width: 200
				},
				onchange: function(val){
					that.setFontFamily(val);
				}
				
			}, ui);
			
			var fontSizes = [10, 11, 12, 14, 18, 24, 26, 28, 30, 32, 36, 48, 60, 72, 96];
			var fsList = [];
			for(var i=0; i<fontSizes.length; i++){
				fsList.push(this._mk_setFontSizeSelect(fontSizes[i]));
			}
			this.panel.addButton(this.fontFace.button);
			this.fontFace.on("update", function(Val){
				if(Val == ""){
					that.fontFace.list.reset();
					return;
				}
				var val = Val.toLowerCase();
				that.fontFace.list.filter(function(item){
					return item.label.toLowerCase().indexOf(val) >= 0;
				});
			});
			
			this.fontSize = new MT.ui.Dropdown({
				list: fsList,
				button: {
					class: "text-size",
					width: "auto"
				},
				listStyle: {
					width: 50
				},
				onchange: function(val){
					that.setFontSize(val);
				}
				
			}, ui);
			
			
			this.panel.addButton(this.fontSize.button);
			
			ui.on(ui.events.RESIZE, function(){
				
				that.panel.width = that.tools.map.panel.content.width;
				that.panel.height = 30;
				that.panel.style.top = that.tools.map.panel.content.bounds.top+"px";
				
			});
			
			
			this.bold = this.panel.addButton("", "text-bold", function(){
				that.toggleBold();
			}, null, "Bold");
			this.bold.width = "auto";
			this.bold.el.title = "Bold";
			
			this.italic = this.panel.addButton("", "text-italic", function(){
				that.toggleItalic();
			}, null, "Italic");
			this.italic.width = "auto";
			this.italic.el.title = "Italic";
			
			this.wordWrap = this.panel.addButton("", "text-wrap", function(){
				that.toggleWordWrap();
			}, null, "Wrap Text");
			this.wordWrap.width = "auto";
			this.wordWrap.el.title = "Word Wrap";
			
			this.wordWrapWidth = new MT.ui.Dropdown({
				button: {
					class: "word-wrap-width-size",
					width: "auto"
				},
				onchange: function(val){
					that.setWordWrapWidth(val);
				}
			}, ui);
			this.wordWrapWidth.button.el.title = "Word Wrap Width";
			
			
			this.wordWrapWidth.on("show", function(show){
				that.wordWrapWidth.button.el.removeAttribute("px");
			});
			this.wordWrapWidth.on("hide", function(show){
				that.wordWrapWidth.button.el.setAttribute("px", "px");
			});
			this.panel.addButton(this.wordWrapWidth.button);
			
			this.left = this.panel.addButton("", "text-left", function(){
				that.setAlign("left");
			}, null, "left");
			this.left.width = "auto";
			this.left.el.title = "Align Left";
			
			this.center = this.panel.addButton("", "text-center", function(){
				that.setAlign("center");
			}, null, "center");
			this.center.width = "auto";
			this.center.el.title = "Align Center";
			
			
			this.right = this.panel.addButton("", "text-right", function(){
				that.setAlign("right");
			}, null, "right");
			this.right.width = "auto";
			this.right.el.title = "Align Right";
			
			
			this.colorButton = this.panel.addButton("", "text-color", function(){
				that.showColorPicker();
			}, null, "color");
			this.colorButton.width = "auto";
			this.colorButton.el.title = "Color";
			
			this.colorPicker = new MT.ui.TextColorPicker(this.tools.ui);
			this.colorPicker.el.style.zIndex = 3;
			
			this.panel.on("hide", function(){
				that.colorPicker.hide();
			});
			
			this.colorPicker.on("fill", function(color){
				that.setFill(color);
			});
			this.colorPicker.on("stroke", function(obj){
				that.setStroke(obj);
			});
			this.colorPicker.on("shadow", function(obj){
				that.setShadow(obj);
			});
			
			this.textButton = this.panel.addButton("", "text-edit", function(){
				that.showTextEdit();
			}, null, "Edit Text");
			this.textButton.width = "auto";
			this.textButton.el.title= "Edit Text";
			
			
			this.textPopup = new MT.ui.Popup("Edit Text", "");
			this.textPopup.hide();
			
			this.textPopup.showClose();
			
			
			this.textArea = document.createElement("textarea");
			this.textPopup.content.appendChild(this.textArea);
			this.textArea.style.width = "100%";
			this.textArea.style.height = "200px";
			
			
			var stopPropagation = function(e){
				e.stopPropagation();
			};
			
			this.textArea.onkeydown = stopPropagation;
			this.textArea.onkeyup = stopPropagation;
			this.textArea.onfocus = stopPropagation;
			this.textArea.onmousedown = stopPropagation;
			this.textArea.onmouseup = stopPropagation;
			
			this.textPopup.addButton("Done", function(){
				that.setText(that.textArea.value);
				that.textPopup.hide();
			});
			
		},
		
		
		buildOptions: function(){
			var ui = this.tools.ui,
				that = this;
			
			this.options = ui.createPanel("Text Options");
			this.options.hide();
			this.options.isResizeable = true;
			this.options.isMovable = true;
			this.options.isDockable = false;
			this.options.isJoinable = false;
			
			this.sysButton = this.panel.addButton("", "text-system", function(){
				//that.showOptions();
				if(that.manager.systemFonts.length == 0){
					that.sysButton.addClass("active");
				}
				else{
					that.sysButton.removeClass("active");
				}
				
				that.manager.toggleSysFonts(function(){
					that.updateFontFaces();
					console.log("SYS fonts loaded");
				});
			});
			this.sysButton.el.title = "Show System Fonts";
		},
		
		showOptions: function(){
			//this.options.show();
			
		},
		
		updateFontFaces: function(){
			var loadedFonts = this.manager.loadedFonts;
			var sysFonts = this.manager.systemFonts;
			
			var list = this.fontFace.list;
			list.origList.length = 0;
			
			for(var i=0; i<loadedFonts.length; i++){
				list.origList.push(this._mk_setFontSelect(loadedFonts[i]));
			}
			
			for(var i=0; i<this.fonts.length; i++){
				list.origList.push(this._mk_setFontSelect(this.fonts[i]));
			}
			
			for(var i=0; i<sysFonts.length; i++){
				list.origList.push(this._mk_setFontSelect(sysFonts[i], true));
			}
			
			
			
			//list.origList.push(this._mk_setFontSelect("xxx"));
			
			
			
			list.update();
			
			
		},
		
		showColorPicker: function(){
			if(this.colorPicker.isVisible){
				this.colorPicker.hide();
				return;
			}
			
			this.colorPicker.show(document.body);
			var r = this.colorButton.el.getBoundingClientRect();
			this.colorPicker.y = r.top + r.height;
			this.colorPicker.x = r.left;
			this.colorPicker.style.zIndex = this.ui.zIndex*10+1;
			
		},
		
		
		
		_mk_setFontSelect: function(font, gray){
			var that = this;
			return {
				label: font,
				cb: function(){
					that.setFontFamily(font);
				},
				create: function(element){
					element.style.fontFamily = font;
					if(gray){
						element.className += " grayed";
					}
				},
				className: gray ? "grayed" : ""
			};
		},
		
		_mk_setFontSizeSelect: function(font){
			var that = this;
			return {
				label: font,
				cb: function(){
					that.setFontSize(font);
				}
			};
		},
		
		
		showTextEdit: function(shouldRemove){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			var obj = this.tools.map.activeObject;
			
			this.textArea.value = obj.text;
			
			this.textPopup.show();
			
			if(shouldRemove){
				var pop = this.textPopup;
				var that = this;
				var rem = function(cancel){
					pop.off("close", rem);
					if(cancel){
						that.tools.om.deleteObj(obj.id);
					}
				};
				this.textPopup.on("close", rem);
			}
		},
		
		setText: function(val){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.map.activeObject.text = val;
		},
		
		change: function(e){
			
		},
		
		setFill: function(color){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.map.activeObject.fill = color;
			this.tools.om.sync();
		},
		
		setStroke: function(obj){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.map.activeObject.stroke = obj.color;
			this.map.activeObject.strokeThickness = obj.strokeThickness;
		},
		
		setShadow: function(obj){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.map.activeObject.setShadow(obj.x, obj.y, obj.color, obj.shadowBlur);
			
		},
		
		setAlign: function(pos){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.map.activeObject.align = pos;
			this.select(this.map.activeObject);
		},
		
		isUnknownFont: function(font, cb){
			for(var i=0; i<this.fonts.length; i++){
				if(this.fonts[i] == font){
					return false;
				}
			}
			return true;
		},
		
		addFont: function(font){
			if(this.isUnknownFont(font)){
				this.fonts.push(font);
				// might not be isInitialized yet
				if(this.fontFace){
					this.fontFace.list.list.push(this._mk_setFontSelect(font));
					this.fontFace.list.update();
				}
			}
		},
		
		checkFonts: function(){
			var objects = this.tools.map.loadedObjects;
			var o = null;
			var that = this;
			var toLoad = 0;
			var font;
			
			for(var i=0; i<objects.length; i++){
				o = objects[i];
				if(o.data.type != MT.objectTypes.TEXT){
					continue;
				}
				
				//this._setFontFamily(o);
				font = o.data.style.fontFamily;
				if(!font){
					continue;
				}
				
				if(!this.isUnknownFont(font)){
					continue;
				}
				
				this.addFont(font);
				
				toLoad++;
				this.manager.loadFont(font, function(){
					toLoad--;
					if(toLoad != 0){
						return;
					}
					window.setTimeout(function(){
						that.manager.updateTextObjects();
					}, 500);
				});
			}
		},
		
		
		__setFontFamily: function(fontFamily){
			
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			
			var obj = this.map.activeObject;
			
			if(this.isUnknownFont(fontFamily)){
				var that = this;
				var active = obj;
				this.addFont(fontFamily);
				this.manager.loadFont(fontFamily, function(){
					that.setFontFamily(fontFamily);
					window.setTimeout(function(){
						that.manager.updateTextObjects(fontFamily);
					}, 1000);
				});
				return;
			}
			
			
			
			this.map = this.tools.map;
			if(!obj){
				return;
			}
			//this._setFontFamily(obj, fontFamily);
			obj.object.dirty = true;
			this.select(obj);
			
			return;
			
			this.tester.style.font = obj.font || obj.style.font;
			this.tester.style.fontFamily = fontFamily;
			
			
			
			var font = this.tester.style.fontFamily;
			font = font.replace(/'/gi, "");
			
			//this.fontFace.button.style.fontFamily = font;
			obj.font = font;
			if(this.tester.style.fontSize){
				obj.fontSize = this.tester.style.fontSize;
			}
			
			this._setFontFamily(obj);
			
			this.select(obj);
			obj.object.dirty = true;
		},
		
				
		setFontFamily: function(fontFamily){
			this.map = this.tools.map;
			var obj = this.map.activeObject;
			
			this.tester.style.font = obj.style.font;
			this.tester.style.fontFamily = fontFamily;
			
			obj.fontFamily = this.tester.style.fontFamily.replace(/'/gi,"");
			obj.fontWeight = this.tester.style.fontWeight.replace(/normal/gi,'');
			if(this.tester.style.fontStyle == "italic"){
				obj.fontWeight += " "+this.tester.style.fontStyle.replace(/normal/gi,"");;
			}
			obj.fontSize = parseInt(this.tester.style.fontSize);
			this.select(obj);
			
			this.manager.checkFont(fontFamily);
			
		},
		
		setFontSize: function(size){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			var obj = this.map.activeObject;
			
			this.tester.style.font = obj.font || obj.style.font;
			
			
			//this._setFontFamily(obj);
			this.tester.style.fontSize = size + "px";
			
			obj.fontSize = this.tester.style.fontSize;
			
			this.select(this.map.activeObject);
			
		},
		
		toggleBold: function(){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			
			var obj = this.map.activeObject;
			var w = obj.style.font;
			var att = this.getFontAttribs(w);
			var out = "";
			if(!att.bold){
				out = "bold";
			}
			if(att.italic){
				out += " italic";
			}
			
			
			out = out.trim();
			//this._setFontFamily(obj);
			obj.fontWeight = out;
			this.select(obj);
		},
		
		toggleItalic: function(){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			var obj = this.map.activeObject
			
			var w = obj.style.font;
			var att = this.getFontAttribs(w);
			var out = "";
			
			if(att.bold){
				out += "bold";
			}
			if(!att.italic){
				out += " italic";
			}
			
			
			out = out.trim();
			
			
			//this._setFontFamily(obj);
			
			obj.fontWeight = out;
			this.select(obj);
		},
		toggleWordWrap: function(){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			
			var obj = this.map.activeObject;
			
			obj.wordWrap = !obj.wordWrap;
			var bounds = obj.object.getBounds();
			if(obj.wordWrapWidth < bounds.width - 10){
				obj.wordWrapWidth = parseInt(bounds.width, 10);
			}
			this.select(obj);
		},
		setWordWrapWidth: function(val){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			
			this.map.activeObject.wordWrapWidth = parseInt(val, 10);
			this.select(this.map.activeObject);
			
		},

		
		init: function(){
			this.map = this.tools.map;
			
			if(this.isInitialized){
				return;
			}
			var that = this;
			this.tools.ui.events.on("keypress", function(e){
				that.change(e);
			});
			this.isInitialized = true;
			
			
		},
		
		showTools: function(){
			
			
		},
		
		select: function(objTemplate){
			/* fix this */
			var obj = objTemplate;
			
			if(!obj || !obj.data || obj.data.type != MT.objectTypes.TEXT){
				this.panel.hide();
				return;
			}
			
			obj.data.style = obj.style;
			this.tools.om.sync();
			
			if(obj.font){
				this.tester.style.font = obj.font;
			}
			else{
				this.tester.style.font = obj.object.style.font;
			}
			
			
			
			
			this.fontFace.value = this.tester.style.fontFamily.replace(/'/gi, "");;
			//this.fontFace.button.style.fontFamily = this.tester.style.fontFamily;
			
			this.fontSize.value = obj.fontSize;
			
			var att = this.getFontAttribs(obj.style.font);
			if(att.bold){
				this.bold.style.fontWeight = "bold";
				this.bold.addClass("active");
			}
			else{
				this.bold.style.fontWeight = "normal";
				this.bold.removeClass("active");
			}
			if(att.italic){
				this.italic.style.fontStyle = "italic";
				this.italic.addClass("active");
			}
			else{
				this.italic.style.fontStyle = "normal";
				this.italic.removeClass("active");
			}
			
			if(obj.wordWrap){
				this.enableWordWrap(obj);
			}
			else{
				this.disableWordWrap(obj);
			}
			
			this.checkAlign(obj);
			
			
			this.colorPicker.setColors({
				stroke: obj.stroke,
				fill: obj.fill,
				shadow: obj.shadowColor
			});
			
			this.colorPicker.shadowXInput.setValue(obj.shadowOffsetX, true);
			this.colorPicker.shadowYInput.setValue(obj.shadowOffsetY, true);
			this.colorPicker.shadowBlurInput.setValue(obj.shadowBlur, true);
			
			this.colorPicker.strokeThicknessInput.setValue(obj.strokeThickness, true);
			
			this.panel.hide();
			
			this.panel.show(document.body);
			obj.object.dirty = true;
			
			this.tools.project.plugins.settings.update();
		},
		
		
		enableWordWrap: function(obj){
			this.wordWrap.addClass("active");
			this.wordWrapWidth.button.removeClass("hidden");
			this.wordWrapWidth.button.text = obj.wordWrapWidth;
			this.wordWrapWidth.button.el.setAttribute("px", "px");
			
			
			/*this.left.removeClass("hidden");
			this.center.removeClass("hidden");
			this.right.removeClass("hidden");*/
		},
		disableWordWrap: function(obj){
			this.wordWrap.removeClass("active");
			this.wordWrapWidth.button.addClass("hidden");
			
			/*this.left.addClass("hidden");
			this.center.addClass("hidden");
			this.right.addClass("hidden");*/
		},
		
		checkAlign: function(mo){
			var obj = mo;
			if(obj.wordWrap || obj.object.text.split("\n").length > 1){
				this.left.removeClass("hidden active");
				this.center.removeClass("hidden active");
				this.right.removeClass("hidden active");
				
				
				if(obj.align == "left"){
					this.left.addClass("active");
				}
				if(obj.align == "right"){
					this.right.addClass("active");
				}
				if(obj.align == "center"){
					this.center.addClass("active");
				}
				
			}
			else{
				this.left.addClass("hidden");
				this.center.addClass("hidden");
				this.right.addClass("hidden");
			}
		},
		
		getFontAttribs: function(fontWeight){
			var r = {
				bold: false,
				italic: false
			};
			
			if(!fontWeight){
				return r;
			}
			
			var t = fontWeight.split(" ");
			for(var i=0; i<t.length; i++){
				if(t[i].trim() == "bold"){
					r.bold = true;
				}
				if(t[i].trim() == "italic"){
					r.italic = true;
				}
			}
			
			return r;
		},
		
		mouseDown: function(e){
			this.mDown = true;
		},
		mouseUp: function(e){
			if(!this.mDown){
				return;
			}
			this.mDown = false;
			
			if(e.target != this.map.game.canvas){
				return;
			}
			
			var x = e.offsetX + this.map.offsetXCam - this.map.ox;
			var y = e.offsetY + this.map.offsetYCam - this.map.oy;
			var obj = this.map.pickObject(e.x - this.map.offsetXCam, e.y - this.map.offsetYCam);
			
			if(obj && obj.data.type == MT.objectTypes.TEXT){
				this.tools.tools.select.select(obj);
				this.tools.select(obj);
				this.tools.tools.text.showTextEdit();
			}
			else{
				
				var text = this.tools.om.createTextObject(x, y);
				text.text = text.tmpName;
				this.tools.om.insertObject(text);
				obj = this.map.getById(text.id);
				this.tools.select(obj);
				
				this.tools.tools.text.showTextEdit(true);
			}
		},
		
		mouseMove: function(){
			
		}
	}

);