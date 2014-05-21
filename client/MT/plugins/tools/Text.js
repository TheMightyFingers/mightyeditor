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
		
		this.createPanel();
		
	
		
		//this.fontSize = new MT.ui.Button(null, "font-size", 
		
		
		this.tools.on("selectObject", function(obj){
			that.select(obj);
		});
		
		this.tools.on("unselectedObject", function(){
			that.panel.hide();
		});
		
		
	},{
		
		createPanel: function(){
			var that = this;
			var ui = this.tools.ui;
			
			this.panel = new MT.ui.Panel(null, ui.events);
			
			this.panel.style.height = ui.top.height+"px";
			this.panel.style.top = ui.top.height+"px";
			this.panel.style.left = ui.left.width+"px";
			this.panel.style.right = ui.right.width+"px";
			
			this.panel.addClass("text-tools");
		
			var fonts = [
				"Arial",
				"Comic Sans MS",
				"Courier New",
				"Georgia",
				"Impact",
				"Times New Roman",
				"Trebuchet MS",
				"Verdana"
			];
			
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
			
			
			this.bold = this.panel.addButton("B", "text-bold", function(){
				that.toggleBold();
			});
			this.bold.width = "auto";
			
			this.italic = this.panel.addButton("I", "text-bold", function(){
				that.toggleItalic();
			});
			this.italic.width = "auto";
			
			
			this.wordWrap = this.panel.addButton("Wx", "text-bold", function(){
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
			
			
			this.panel.addButton(this.wordWrapWidth.button);
			
			
			this.left = this.panel.addButton("L", "text-left", function(){
				that.setAlign("left");
			});
			this.left.width = "auto";
			
			this.center = this.panel.addButton("C", "text-left", function(){
				that.setAlign("center");
			});
			this.center.width = "auto";
			
			this.right = this.panel.addButton("R", "text-left", function(){
				that.setAlign("right");
			});
			this.right.width = "auto";
			
			
			this.colorButton = this.panel.addButton("C", "text-color", function(){
				that.showColorPicker();
			});
			
			this.colorPicker = new MT.ui.TextColorPicker(this.tools.ui);
			this.panel.on("hide", function(){
				that.colorPicker.hide();
			});
			
		},
		
		showColorPicker: function(){
			console.log("SHOW colorPicker");
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
		
		change: function(e){
			console.log("TEXT:: change", e);
		},
		
		setAlign: function(pos){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.map.activeObject.align = pos;
			this.select(this.map.activeObject);
		},
		
		setFontFamily: function(fontIn){
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
			this.tester.style.font = this.map.activeObject.style.font;
			obj.font = this.tester.style.fontFamily.replace(/'/gi,"");
			obj.fontWeight = this.tester.style.fontWeight;
			if(this.tester.style.fontStyle == "italic"){
				obj.fontWeight += " "+this.tester.style.fontStyle;
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
			//if(!this.tester.style.fontFamily){
				
			//}
			
			
			this.fontFace.value = this.tester.style.fontFamily;
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
			
			this.panel.hide();
			
			this.panel.show(document.body);
			console.log(this.tester.style.fontFamily);
		},
		
		
		enableWordWrap: function(obj){
			this.wordWrap.addClass("active");
			this.wordWrapWidth.button.removeClass("hidden");
			this.wordWrapWidth.button.text = obj.wordWrapWidth;
			
			
			
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
			
			var x = e.offsetX + this.map.offsetXCam - this.map.ui.center.offsetLeft;
			var y = e.offsetY + this.map.offsetYCam - this.map.ui.center.offsetTop;
			var obj = this.map.pickObject(e.x - this.map.offsetXCam, e.y - this.map.offsetYCam);
			
			if(obj && obj.MT_OBJECT.type == MT.objectTypes.TEXT){
				console.log("text selected", obj.MT_OBJECT);
				
				this.tools.tools.select.select(obj);
				this.tools.select(obj);
			}
			else{
				
				var text = this.tools.om.createTextObject(x, y);
				this.tools.om.insertObject(text);
				obj = this.map.getById(text.id);
				this.tools.select(obj);
				console.log(obj);
			}
		},
		
		mouseMove: function(){
			
		}
	}

);