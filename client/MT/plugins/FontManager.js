MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.FontManager = function(project){
		MT.core.BasicPlugin.call(this, "FontManager");
		this.project = project;
		
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
		
		this.style = document.createElement("style");
		this.style.setAttribute("type", "text/css");
		this.style.setAttribute("ME","style import");
	},
	{
		installUI: function(){
			var that = this;
			this.project.plugins.sourceeditor.on(MT.FILE_UPLOADED, function(path){
				if(MT.core.Helper.isFont(path)){
					that.send("convertFont", path);
				}
			});
			
			this.project.plugins.sourceeditor.on(MT.FILE_LIST_RECEIVED, function(list){
				for(var i=0; i<list.length; i++){
					if(list[i].name == "fonts"){
						that.loadPrivateFonts(list[i].contents);
						return;
					}
				}
			});
		},
		
		
		checkFont: function(fontRaw){
			if(
				this.systemFonts.indexOf(fontRaw) == -1
				&& this._systemFonts.indexOf(fontRaw) == -1
				&& this.loadedFonts.indexOf(fontRaw) == -1
				&& this.fonts.indexOf(fontRaw) == -1
			){
				var font = MT.helper.htmlEntities(fontRaw);
				
				if(font != fontRaw){
					return;
				}
				
				var not = this.project.plugins.notification.show(font, "Trying to get font ("+font+") from the web services.");
				var that = this;
				
				this.send("getFont", font, function(err){
					not.hide();
					if(err === false){
						that.project.plugins.notification.show(font, "Failed to retrieve font. Make sure font ("+font+") exists at google fonts.");
					}
				});
			}
			
		},
		
		loadFont: function(font, cb){
			cb(font);
		},
		
		updateTextObjects: function(fontIn){
			PIXI.Text.heightCache = {};
			
			var objects = this.project.plugins.mapeditor.loadedObjects;
			var font;
			for(var i=0; i<objects.length; i++){
				if(objects[i].data.type == MT.objectTypes.TEXT ){
					font = objects[i].data.style.fontFamily;
					if(fontIn == void(0) || font == fontIn || font.indexOf(fontIn) > -1 ){ 
						objects[i].object.dirty = true;
					}
				}
			}
		},
		
		loadedFonts: [],
		loadPrivateFonts: function(list){
			var font;
			var fullstr = "";
			var str;
			
			/*
			@font-face {
				font-family: 'MyWebFont';
				src: url('webfont.eot');
				src: url('webfont.eot?#iefix') format('embedded-opentype'),
					url('webfont.woff2') format('woff2'),
					url('webfont.woff') format('woff'),
					url('webfont.ttf')  format('truetype'), 
					url('webfont.svg#svgFontName') format('svg');
			}
			*/
			
			var names = [];
			
			for(var i=0; i<list.length; i++){
				font = list[i];
				if(!font.contents){
					continue;
				}
				fontName = font.name;
				
				if(this.loadedFonts.indexOf(fontName) != -1){
					continue;
				}
				if(!fontName){
					continue;
				}
				
				names.push(font.name);
				
				this.loadedFonts.push(fontName);
				
				
				str = "@font-face {"+
					"font-family: '"+fontName+"';src:";
				
				var file = "";
				
				for(var j=font.contents.length-1; j>-1; j--){
					file = font.contents[j];
					var ext = file.name.split(".").pop();
					var path = this.project.path + '/src' + file.fullPath;
					switch(ext){
						case "woff":
							//str += "url('"+path+"') format('woff'),";
						break;
						case "woff2":
							str += "url('"+path+"') format('woff2'),";
						break;
						case "ttf":
							str += "url('"+path+"') format('truetype'),";
						break;
						case "eot":
							//str += "url('"+path+"') format('embedded-opentype'),";
						break;
					}
				}
				
				//remove last ,
				str = str.substring(0, str.length - 1) + ";";
				
				str += '}';
				
				fullstr += (str + "\n\r");
			}
			
			if(names.length == 0){
				return;
			}
			
			if(this.style.parentElement){
				this.style.parentNode.removeChild(this.style);
			}
			
			this.style.innerHTML = "";
			this.style.appendChild(document.createTextNode(fullstr));
			
			document.body.appendChild(this.style);
			
			
			var not = this.project.plugins.notification.show("Loading fonts", names.join("<br />"));
			
			var that = this;
			var todo = names.length;
			var done = function(){
				todo--;
				if(todo !== 0){
					return;
				}
				not.hide();
				that.updateTextObjects();
				that.emit("update");
			};
			
			for(var i=0; i<names.length; i++){
				this.loadFont(function(){
					done();
				}, names[i]);
			}
		},
		
		loadFont: function(cb, name){
			var _this = this;
			var span = document.createElement("span");
			span.style.fontFamily = "Comic Sans MS";
			span.style.position = "fixed";
			span.style.top = "-1000px";
			
			
			span.appendChild(document.createTextNode("`1234567890-=qwertyuiop[]\asdfghjkl;'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}ASDFGHJKL:ZXCVBNM<>?"));
			document.body.appendChild(span);
			
			var csmsBox = span.getBoundingClientRect();
			span.style.fontFamily = name;
			
			//span.style;
			var checkLoaded = function(){
				var newBox = span.getBoundingClientRect();
				if(csmsBox.width != newBox.width || csmsBox.height != newBox.height){
					document.body.removeChild(span);
					cb();
				}
				else{
					window.setTimeout(checkLoaded, 100);
				}
			};
			window.setTimeout(checkLoaded, 1000);
		},
		
		includeFont: function(){
			
		},
		
		getFontInfo: function(font, cb){
			this.send("getFontInfo", font, cb);
		},
		
		_systemFonts: [],
		systemFonts: [],
		loadSysFonts: function(cb){
			if(this.systemFonts.length){
				return;
			}
			
			var that = this;
			window.listFonts = function(fonts){
				var f;
				for(var i=0; i<fonts.length; i++){
					f = fonts[i];
					if(that.systemFonts.indexOf(f) < 0){
						that.systemFonts.push(f);
					}
				}
				cb(fonts);
				that.swf.parentNode.removeChild(that.swf);
				delete window.listFonts;
			};
			this.swf = MT.core.Helper.loadSwf("/swf/FontList.swf?callback=listFonts");
			this._sysFontsLoaded = true;
		},
		
		toggleSysFonts: function(cb){
			if(this.systemFonts.length > 0){
				this._systemFonts = this.systemFonts.slice(0);
				this.systemFonts.length = 0;
				if(cb){cb();}
			}
			else{
				this.loadSysFonts(cb);
			}
		},
		
		showOptions: function(fontname, path){
		/*
			
			console.log("font info", fontname);
			var that = this;
			var pop = new MT.ui.Popup("Import font", path.split("/").pop());
			
			var options = {
				fontname: fontname,
				path: path,
				ttfHinting: 
			};
			
			pop.showClose();
			pop.addButton("OK", function(){
				that.send("convertFont", options);
			});
			
			
			var fn = new MT.ui.Input(this.ui, {
				key: "fontname",
				type: "text"
			}, options);
			
			pop.content.appendChild(fn.el);
			
		*/
		}
	}
);