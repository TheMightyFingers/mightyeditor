"use strict";
MT.require("ui.Dropdown");
MT.require("ui.TextColorPicker");

MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Text = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "text";
		this.isInitialized = false;
		
		
		var that = this;
		var ui = tools.ui;
		this.tools = tools;
		
		
		this.tester = document.createElement("span");
		
		this.fonts = [
			"Arial",
			"Comic Sans MS",
			"Courier New",
			"Georgia",
			"Impact",
			"Times New Roman",
			"Trebuchet MS",
			"Verdana"
		];
		
	
		
		//this.fontSize = new MT.ui.Button(null, "font-size", 
		
		
		this.tools.on("selectObject", function(obj){
			that.select(obj);
		});
		
		this.tools.on("unselectedObject", function(){
			that.panel.hide();
		});
		
		this.manager = this.tools.project.plugins.fontmanager;
		
		var ready = function(){
			that.checkFonts();
			
			that.tools.map.off(ready);
		};
		this.tools.map.on("objectsAdded", ready);
		
		
		this.createPanel();
		
	},{
		
		createPanel: function(){
			var that = this;
			var ui = this.tools.ui;
			
			this.panel = ui.createPanel("Text");
			
			this.panel.style.height = this.project.panel.height+"px";
			this.panel.style.top = this.tools.map.panel.content.bounds.top+"px";
			this.panel.style.left = this.project.panel.width+"px";
			
			this.panel.addClass("text-tools");
			this.panel.removeHeader();
			
			this.panel.hide();
			
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
			
			this.fontSize = new MT.ui.Dropdown({
				list: fsList,
				button: {
					class: "text-size",
					width: "auto"
				},
				listStyle: {
					width: 25
				},
				onchange: function(val){
					that.setFontSize(val);
				}
				
			}, ui);
			
			this.panel.addButton(this.fontFace.button);
			this.panel.addButton(this.fontSize.button);
			
			ui.on(ui.events.RESIZE, function(){
				
				that.panel.width = that.tools.map.panel.content.width;
				that.panel.height = 30;
				that.panel.style.top = that.tools.map.panel.content.bounds.top+"px";
				
			});
			
			
			this.bold = this.panel.addButton("B", "text-bold", function(){
				that.toggleBold();
			});
			this.bold.width = "auto";
			
			this.italic = this.panel.addButton("I", "text-italic", function(){
				that.toggleItalic();
			});
			this.italic.width = "auto";
			
			this.wordWrap = this.panel.addButton("Wx", "text-wrap", function(){
				that.toggleWordWrap();
			});
			this.wordWrap.width = "auto";
			
			this.wordWrapWidth = new MT.ui.Dropdown({
				button: {
					class: "word-wrap-width-size",
					width: "auto"
				},
				onchange: function(val){
					that.setWordWrapWidth(val);
				}
			}, ui);
			
			this.wordWrapWidth.on("show", function(show){
				that.wordWrapWidth.button.el.removeAttribute("px");
			});
			this.wordWrapWidth.on("hide", function(show){
				that.wordWrapWidth.button.el.setAttribute("px", "px");
			});
			this.panel.addButton(this.wordWrapWidth.button);
			
			this.left = this.panel.addButton("L", "text-left", function(){
				that.setAlign("left");
			});
			this.left.width = "auto";
			
			this.center = this.panel.addButton("C", "text-center", function(){
				that.setAlign("center");
			});
			this.center.width = "auto";
			
			this.right = this.panel.addButton("R", "text-right", function(){
				that.setAlign("right");
			});
			this.right.width = "auto";
			
			this.colorButton = this.panel.addButton("C", "text-color", function(){
				that.showColorPicker();
			});
			this.colorButton.width = "auto";
			
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
			
			
			
			this.textButton = this.panel.addButton("txt", "text-edit", function(){
				that.showTextEdit();
			});
			this.textButton.width = "auto";
			
			this.textPopup = new MT.ui.Popup("Edit Text", "");
			this.textPopup.hide();
			
			this.textPopup.showClose();
			this.textPopup.addButton("Done", function(){
				that.setText(that.textArea.value);
				that.textPopup.hide();
			});
			
			this.textArea = document.createElement("textarea");
			this.textPopup.content.appendChild(this.textArea);
			this.textArea.style.width = "100%";
			this.textArea.style.height = "200px";
			
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
			
			
		},
		
		_mk_setFontSelect: function(font){
			var that = this;
			return {
				label: font,
				cb: function(){
					that.setFontFamily(font);
				},
				create: function(element){
					element.style.fontFamily = font;
				}
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
						that.tools.om.deleteObj(obj.MT_OBJECT.id);
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
			this.map.activeObject.MT_OBJECT.text = val;
			this.map.activeObject.MT_OBJECT.name = val;
			
		},
		
		change: function(e){
			console.log("TEXT:: change", e);
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
					this.fontFace.addItem(this._mk_setFontSelect(font));
				}
			}
		},
		
		
		checkFonts: function(){
			var objects = this.tools.map.objects;
			var o = null;
			var that = this;
			var toLoad = 0;
			for(var i=0; i<objects.length; i++){
				o = objects[i];
				if(o.type == Phaser.TEXT){
					this._setFontFamily(o);
					
					if(this.isUnknownFont(o.font)){
						this.addFont(o.font);
						toLoad++;
						this.manager.loadFont(o.font, function(){
							toLoad--;
							if(toLoad != 0){
								return;
							}
							window.setTimeout(function(){
								that.updateTextObjects();
							}, 500);
						});
					}
				}
			}
		},
		
		updateTextObjects: function(fontIn){
			
			var objects = this.tools.map.objects;
			PIXI.Text.heightCache = {};
			for(var i=0; i<objects.length; i++){
				if(objects[i].type == Phaser.TEXT ){
					if(fontIn == void(0) || objects[i].font == fontIn || objects[i].style.font.indexOf(fontIn) > -1 ){ 
						objects[i].dirty = true;
					}
				}
			}
		},
		
		setFontFamily: function(fontIn){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			
			if(this.isUnknownFont(fontIn)){
				var that = this;
				var active = this.map.activeObject;
				this.addFont(fontIn);
				this.manager.loadFont(fontIn, function(){
					that.setFontFamily(fontIn);
					window.setTimeout(function(){
						that.updateTextObjects(fontIn);
					}, 1000);
				});
				return;
			}
			
			
			
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this._setFontFamily(this.map.activeObject);
			
			
			this.tester.style.font = this.map.activeObject.font || this.map.activeObject.style.font;
			this.tester.style.fontFamily = fontIn;
			
			
			
			var font = this.tester.style.fontFamily;
			font = font.replace(/'/gi, "");
			
			this.fontFace.button.style.fontFamily = font;
			this.map.activeObject.font = font;
			if(this.tester.style.fontSize){
				this.map.activeObject.fontSize = this.tester.style.fontSize;
			}
			
			this._setFontFamily(this.map.activeObject);
			
			this.select(this.map.activeObject);
			this.map.activeObject.dirty = true;
		},
		
		setFontSize: function(size){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.tester.style.font = this.map.activeObject.font || this.map.activeObject.style.font;
			
			
			this._setFontFamily(this.map.activeObject);
			this.tester.style.fontSize = size;
			
			this.map.activeObject.fontSize = this.tester.style.fontSize;
			
			this.select(this.map.activeObject);
			
		},
		
		toggleBold: function(){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			var w = this.map.activeObject.style.font;
			var att = this.getFontAttribs(w);
			var out = "";
			if(!att.bold){
				out = "bold";
			}
			if(att.italic){
				out += " italic";
			}
			
			
			out = out.trim();
			this._setFontFamily(this.map.activeObject);
			this.map.activeObject.fontWeight = out;
			this.select(this.map.activeObject);
		},
		
		toggleItalic: function(){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			var w = this.map.activeObject.style.font;
			var att = this.getFontAttribs(w);
			var out = "";
			
			if(att.bold){
				out += "bold";
			}
			if(!att.italic){
				out += " italic";
			}
			
			
			out = out.trim();
			
			
			this._setFontFamily(this.map.activeObject);
			
			this.map.activeObject.fontWeight = out;
			this.select(this.map.activeObject);
		},
		toggleWordWrap: function(){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			
			this.map.activeObject.wordWrap = !this.map.activeObject.wordWrap;
			var bounds = this.map.activeObject.getBounds();
			if(this.map.activeObject.wordWrapWidth < bounds.width - 10){
				this.map.activeObject.wordWrapWidth = parseInt(bounds.width, 10);
			}
			this.select(this.map.activeObject);
			
			
		},
		setWordWrapWidth: function(val){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			
			this.map.activeObject.wordWrapWidth = parseInt(val, 10);
			this.select(this.map.activeObject);
			
		},
		
		_setFontFamily: function(obj){
			obj = obj || this.map.activeObject;
			
			
			this.tester.style.font = obj.style.font;
			obj.font = this.tester.style.fontFamily.replace(/'/gi,"");
			obj.fontWeight = this.tester.style.fontWeight.replace(/normal/gi,'');
			if(this.tester.style.fontStyle == "italic"){
				console.log("italic");
				obj.fontWeight += " "+this.tester.style.fontStyle.replace(/normal/gi,"");;
			}
			obj.fontSize = this.tester.style.fontSize;
		},
		
		init: function(){
			console.log("init text");
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
		
		select: function(obj){
			
			if(!obj || !obj.MT_OBJECT || obj.MT_OBJECT.type != MT.objectTypes.TEXT){
				this.panel.hide();
				return;
			}
			
			obj.MT_OBJECT.style = obj.style;
			this.tools.om.sync();
			
			if(obj.font){
				this.tester.style.fontFamily = obj.font;
			}
			else{
				this.tester.style.font = obj.style.font;
			}
			
			
			
			
			this.fontFace.value = this.tester.style.fontFamily.replace(/'/gi, "");;
			this.fontFace.button.style.fontFamily = this.tester.style.fontFamily;
			
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
				console.log("not italic");
				
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
			obj.dirty = true;
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
		
		checkAlign: function(obj){
			if(obj.wordWrap || obj.text.split("\n").length > 1){
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
			var t = fontWeight.split(" ");
			var bold = false;
			var italic = false;
			
			for(var i=0; i<t.length; i++){
				if(t[i].trim() == "bold"){
					bold = true;
				}
				if(t[i].trim() == "italic"){
					italic = true;
				}
			}
			
			return {
				bold: bold,
				italic: italic
			};
			
		},
		
		mouseDown: function(e){
			console.log("mouse down");
			
		},
		
		mouseUp: function(e){
			//this.tools.tools.select.mouseUp(e);
			if(e.target != this.map.game.canvas){
				return;
			}
			
			var x = e.offsetX + this.map.offsetXCam - this.map.ox;
			var y = e.offsetY + this.map.offsetYCam - this.map.oy;
			var obj = this.map.pickObject(e.x - this.map.offsetXCam, e.y - this.map.offsetYCam);
			
			if(obj && obj.MT_OBJECT.type == MT.objectTypes.TEXT){
				console.log("text selected", obj.MT_OBJECT);
				
				this.tools.tools.select.select(obj);
				this.tools.select(obj);
				this.tools.tools.text.showTextEdit();
			}
			else{
				
				var text = this.tools.om.createTextObject(x, y);
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