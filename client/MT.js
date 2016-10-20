window.MT = createClass('MT')
//MT/ui/ColorPalette.js
MT.namespace('ui');
"use strict";

MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.ColorPalette = function(onChange){
		MT.ui.DomElement.call(this);
		var that = this;
		this.addClass("ui-colorpalette");
		this.nodes = [];
		
		this.createPalette();
		this.el.onclick = function(e){
			if(onChange && e.target.color){
				onChange(e.target.color);
				that.emit("change", e.target.color);
			}
		};
	},
	{
		createPalette: function(){
			var el = this.el;
			
			var node = null;
			
			var total;
			
			var colors = [
				0xff0000,
				0xffff00,
				0x00ff00,
				0x00ffff,
				0x0000ff,
				0xff00ff,
				0xff0000
			];
			
			var color = "";
			
			var it = 2;
			var rows = 3;
			
			for(var l=-rows; l<rows; l++){
				for(var i=0, l=(colors.length-1)*it; i<l; i++){
					node = document.createElement("span");
					node.className = "ui-colorpalette-node";
					el.appendChild(node);
					color = this.mkColor(0x000000, 0xffffff, i/(l-1), 0);
					node.color = color;
					node.style.backgroundColor = color;
				}
			}
			
			node = document.createElement("div");
			el.appendChild(node);
			node.className = "seperator";
			
			for(var i=0; i<colors.length-1; i++){
				for(var j=0; j<it; j++){
					node = document.createElement("span");
					node.className = "ui-colorpalette-node";
					el.appendChild(node);
					color = this.mkColor(colors[i], colors[i+1], j/it, 0);
					node.color = color;
					node.style.backgroundColor = color;
				}
			}
			
			node = document.createElement("div");
			el.appendChild(node);
			node.className = "seperator";
			
			
			for(var l=-rows; l<rows+1; l++){
				if(l == 0){
					continue;
				}
				for(var i=0; i<colors.length-1; i++){
					for(var j=0; j<it; j++){
						node = document.createElement("span");
						node.className = "ui-colorpalette-node";
						el.appendChild(node);
						color = this.mkColor(colors[i], colors[i+1], j/(it+1), l/(rows*1.8));
						node.color = color;
						node.style.backgroundColor = color;
					}
				}
				node = document.createElement("div");
				el.appendChild(node);
			}
		},
		
		mutate: function(col1, col2, inc, light){
			var max = 0xff;
			
			var red1 = (col1 >> 16) + max*light;
			var green1 = ((col1 >> 8) & 0xFF) + max*light;
			var blue1  = (col1 & 0xFF) + max*light;

			var red2 = (col2 >> 16)  + max*light;
			var green2 = ((col2 >> 8) & 0xFF) + max*light;
			var blue2  = (col2 & 0xFF) + max*light;

			var outred = inc * red2 + (1-inc) * red1 | 0;
			var outgreen = inc * green2 + (1-inc) * green1 | 0;
			var outblue = inc * blue2 + (1-inc) * blue1 | 0;
			
			var p = 0;
			
			if(outred > max){
				p = (outred - max) / max;
				
				outblue = (outblue + outblue*p) | 0;
				outgreen = (outgreen + outgreen*p) | 0;

				outred = max;
			}
			if(outblue > max){
				p = ( outblue - max ) / max;
				
				outred = (outred + outred*p) | 0;
				outgreen = (outgreen + outgreen*p) | 0;
				outblue = max;
			}
			if(outgreen > max){
				p = (outgreen - max) / max;
				
				outred = (outred + outred*p) | 0;
				outblue = (outblue + outblue*p) | 0;
				
				outgreen = max;
			}
			
			if(outgreen > max){
				outgreen = max
			}
			if(outblue > max){
				outblue = max;
			}
			
			if(outred > max){
				outred = max
			}
			
			
			if(outred < 0){
				p = -outred / max;
				
				outblue = (outblue - outblue*p) | 0;
				outgreen = (outgreen - outgreen*p) | 0;
				outred = 0;
			}
			if(outblue < 0){
				p = -outblue / max;
				
				outred = (outred - outred*p) | 0;
				outgreen = (outgreen - outgreen*p) | 0;
				
				outblue = 0;
			}
			if(outgreen < 0){
				p = -outgreen / max;
				outred = (outred - outred*p) | 0;
				outblue = (outblue - outblue*p) | 0;
				
				outgreen = 0;
			}
			
			
			var rstr = outred.toString(16);
			if(rstr.length < 2){
				rstr = "0"+rstr;
			}
			
			var gstr = outgreen.toString(16);
			if(gstr.length < 2){
				gstr = "0"+gstr;
			}
			
			var bstr = outblue.toString(16);
			if(bstr.length < 2){
				bstr = "0"+bstr;
			}
			
			
			return "#"+rstr+gstr+bstr;
		},
		
		
		mkColor: function(col1, col2, inc, light){
			var ret = this.mutate(col1, col2, inc, light);
			return ret;
			//return "#"+ret;
		}



	}
);
//MT/core/Color.js
MT.namespace('core');
"use strict";

MT(
	MT.core.Color = function(color){
		this.setColor(color);
	},
	{
		_r: 0,
		set r(v){
			this._r = r;
			this.calcHSL();
		},
		get r(){
			return this._r;
		},
		_g: 0,
		set g(v){
			this._g = v;
			this.calcHSL();
		},
		get g(){
			return this._g;
		},
		_b: 0,
		set b(v){
			this._b = v;
			this.calcHSL();
		},
		get b(){
			return this._b;
		},
		
		_h: 0,
		set h(v){
			this._h = v;
			this.calcRGB();
		},
		get h(){
			return this._h;
		},
		_s: 0,
		set s(v){
			this._s = v;
			this.calcRGB();
		},
		get s(){
			return this._s;
		},
		_l: 0,
		set l(v){
			this._l = v;
			this.calcRGB();
		},
		get l(){
			return this._l;
		},
		a: 0,
		
		
		hsl: function(){
			return "hsl("+this.h+","+this.s+","+this.l+")";
		},
		inherit: function(color){
			this._r = color.r;
			this._g = color.g;
			this._b = color.b;
			this.calcHSL();
		},
		setColor: function(color){
			color = color.trim();
			var t;
			if(typeof color === "string"){
				//hex
				if(color.substring(0,1) == "#"){
					if(color.length == 4){
						t = color.substring(1, 2);
						this._r = parseInt(t+t, 16);
						
						t = color.substring(2, 3);
						this._g = parseInt(t+t, 16);
						
						t = color.substring(3, 4);
						this._b = parseInt(t+t, 16);
						
						this.a = 1;
					}
					else if(color.length > 6){
						this._r = parseInt(color.substring(1, 3), 16);
						this._g = parseInt(color.substring(3, 5), 16);
						this._b = parseInt(color.substring(5, 7), 16);
						if(color.length === 9){
							this.a = parseInt(color.substring(7, 2), 16);
						}
						else{
							this.a = 1;
						}
					}
				}
				else if(color.substring(0,4) == "rgba"){
					t = color.substring(color.indexOf("(")+1, color.indexOf(")")).split(",");
					this._r = parseInt(t[0]);
					this._g = parseInt(t[1]);
					this._b = parseInt(t[2]);
					this.a = parseInt(t[3]);
					
				}
				else if(color.substring(0,3) == "rgb"){
					t = color.substring(color.indexOf("(")+1, color.indexOf(")")).split(",");
					this._r = parseInt(t[0]);
					this._g = parseInt(t[1]);
					this._b = parseInt(t[2]);
					this.a = 1;
				}
			}
			this.calcHSL();
		},
		
		setRGB: function(r,g,b){
			this._r = r;
			this._g = g;
			this._b = b;
			this.calcHSL();
		},
		
		setHSL: function(h, s, l){
			this._h = h;
			this._s = l;
			this._l = l;
			this.calcHSL();
		},
		
		_hue2rgb: function(p, q, t){
			if(t < 0) t += 1;
			if(t > 1) t -= 1;
			if(t < 1/6) return p + (q - p) * 6 * t;
			if(t < 1/2) return q;
			if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		},
		
		valueOf: function(){
			if(this.a < 1){
				return this.rgba();
			}
			else{
				return this.hex();
			}
		},
		
		hex: function(){
			var r = this.r.toString(16);
			var g = this.g.toString(16);
			var b = this.b.toString(16);
			
			if(r.length < 2){
				r = "0"+r;
			}
			if(g.length < 2){
				g = "0"+g;
			}
			if(b.length < 2){
				b = "0"+b
			}
			return "#"+r+g+b;
		},
		
		rgba: function(){
			return "rgba("+this._r+","+this._g+","+this._b+","+this.a+")";
		},
		rgb: function(){
			return "rgb("+this._r+","+this._g+","+this._b+")";
		},
		
		calcRGB: function(){
			var r, g, b;
			var h = this._h,
				s = this._s,
				l = this._l;
			
			if(this.s == 0){
				r = g = b = l; // achromatic
			}
			else{
				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;
				r = this._hue2rgb(p, q, h + 1/3);
				g = this._hue2rgb(p, q, h);
				b = this._hue2rgb(p, q, h - 1/3);
			}
			this._r = Math.floor(r * 255);
			this._g = Math.floor(g * 255);
			this._b = Math.floor(b * 255);
			
		},
		calcHSL: function(){
			var r = this.r / 255, 
				g = this.g / 255, 
				b = this.b / 255;
				
			var max = Math.max(r, g, b),
				min = Math.min(r, g, b);
			var h, s, l = (max + min) / 2;

			if(max == min){
				h = s = 0; // achromatic
			}
			else{
				var d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch(max){
					case r: h = (g - b) / d + (g < b ? 6 : 0); break;
					case g: h = (b - r) / d + 2; break;
					case b: h = (r - g) / d + 4; break;
				}
				h /= 6;
			}
			
			this._h = h;
			this._s = s;
			this._l = l;
		}
		
	}
);
//MT/ui/SliderHelper.js
MT.namespace('ui');
MT(
	MT.ui.SliderHelper = function(value, min, max){
		this.min = min || 0;
		this.max = max || 100;
		this.value = value;
		this._value = 0;
	},
	{
		change: function(delta){
			this._value += delta;
			if(this._value >= this.min && this._value <= this.max){
				this.value = this._value;
			}
			else if(this._value > this.max){
				this.value = this.max;
			}
			else if(this._value < this.min){
				this.value = this.min;
			}
		},
   
		changeTo: function(val){
			this.change(val - this._value);
		},
		
		valueOf: function(){
			return this.value;
		},
		
		reset: function(val){
			
			if(val != void(0)){
				this._value = val;
				this.value = val;
			}
			else{
				this._value = this.value;
			}
		}
	}
);
//MT/core/BasicTool.js
MT.namespace('core');
MT(
	MT.core.BasicTool= function(tools){
		this.tools = tools;
		this.project = tools.project;
	},
	{
		// called once per tool - by default adds tool button on side panel
		initUI: function(ui){
			var that = this;
			this.ui = ui;
			this.tooltip = this.getTooltip();
			
			this.button = this.tools.panel.addButton("", "tool."+this.name, function(){
				that.tools.setTool(that);
			}, this.tooltip);
			
		},
		
		showInfoToolTip: function(no, isError){
			no = no || 0;
			var plugins = this.tools.project.plugins;
			plugins.notification.showToolTips(this, no, isError);
		},
   
		getTooltip: function(name){
			
			var tkey = (this.name || name)+"Tool";
			return tkey;
		},
		// called when tool has been selected
		init: function(){
			console.log("TODO: init");
			this.activate();
		},
		// proxy for init - probably better naming
		activate: function(){
			
		},
		
		// called when object has been selected and tool is active
		select: function(object){
			console.log("TODO: select", object);
		},
		// on mouse down
		mouseDown: function(e){
			console.log("TODO: mousedown");
		},
		// on mouse up
		mouseUp: function(e){
			console.log("TODO: mouseup");
		},
		// on mouse move
		mouseMove: function(){
			console.log("TODO: mouse move");
		},
		// called before another tool has been selected
		deactivate: function(){
			console.log("TODO: deactivate");
			this.deinit();
		},
		
		// proxy to deactivate - probably better naming
		deinit: function(){
			
		}

	}
);
//MT/ui/TextColorPicker.js
MT.namespace('ui');
"use strict";
MT.require("ui.Button");
MT.require("ui.Input");
MT.require("ui.ColorPalette");


MT.extend("core.Emitter").extend("ui.Panel")(
	MT.ui.TextColorPicker = function(ui){
		var that = this;
		
		
		this.data = {
			stroke: "#000000",
			fill: "#000000",
			shadow: "#000000"
		};
		
		MT.ui.Panel.call(this, "", ui.events);
		this.ui = ui;
		
		this.removeHeader();
		
		
		
		this.fill = new MT.ui.Button("Fill", "ui-text-colorpicker-fill", null, function(){
			that.select("fill");
		});
		this.fill.width = "auto";
		
		this.stroke = new MT.ui.Button("Stroke", "ui-text-colorpicker-stroke", null, function(){
			that.select("stroke");
		});
		this.stroke.width = "auto";
		
		this.shadow = new MT.ui.Button("Shadow", "ui-text-colorpicker-shadow", null, function(){
			that.select("shadow");
		});
		this.shadow.width = "auto";
		
		
		
		this.addButton(this.fill);
		this.addButton(this.stroke);
		this.addButton(this.shadow);
		
		
		this.addClass("ui-text-colorpicker");
		
		this.width = 252;
		this.height = 280;
		
		
		this.colorPalette = new MT.ui.ColorPalette(function(color){
			that.change(color);
		});
		this.colorPalette.show();
		this.colorPalette.on("hover", function(color){
			that.colorInput.setValue(color, true);
		});
		
		
		this.content.addChild(this.colorPalette);
		this.colorPalette.y = 25;
		this.colorPalette.height = 190;
		
		
		this.color = "#000000";
		this.colorInput = new MT.ui.Input(ui, {key: "color", type: "color"}, this);
		this.colorInput.style.top = "auto";
		this.colorInput.style.bottom = "70px";
		this.colorInput.on("change", function(val){
			that.change(val);
		});
		this.addChild(this.colorInput).show();
		
		
		// add stroke options
		this.strokeThickness = 0;
		this.strokeThicknessInput = new MT.ui.Input(ui, {key: "strokeThickness", min: 0, step: 1}, this);
		this.strokeThicknessInput.style.top = "auto";
		this.strokeThicknessInput.style.bottom = "50px";
		this.strokeThicknessInput.on("change", function(val){
			that.change();
		});
		
		
		
		// add shadow options
		this.shadowX = 0;
		this.shadowXInput =  new MT.ui.Input(ui, {key: "shadowX", step: 1}, this);
		this.shadowXInput.style.top = "auto";
		this.shadowXInput.style.bottom = "50px";
		this.shadowXInput.on("change", function(val){
			that.change();
		});
		
		
		this.shadowY = 0;
		this.shadowYInput =  new MT.ui.Input(ui, {key: "shadowY", step: 1}, this);
		
		this.shadowYInput.style.top = "auto";
		this.shadowYInput.style.bottom = "30px";
		this.shadowYInput.on("change", function(val){
			that.change();
		});
		
		this.shadowBlur = 0;
		this.shadowBlurInput =  new MT.ui.Input(ui, {key: "shadowBlur", min: 0, step: 1}, this);
		
		this.shadowBlurInput.style.top = "auto";
		this.shadowBlurInput.style.bottom = "10px";
		this.shadowBlurInput.on("change", function(val){
			that.change();
		});
		
		
		this.select("fill");
	},
	{
		setColors: function(colors){
			this.colorInput.setValue(colors[this.active], true);
			this.data = colors;
			
		},
		change: function(color){
			if(color){
				this.colorInput.setValue(color);
				this.data[this.active] = color;
			}
			
			this.color = this.data[this.active];
			this[this.active+"_change"]();
		},
		select: function(type){
			if(this.active){
				this[this.active].removeClass("active");
				this[this.active+"_deselect"]();
			}
			
			this.active = type;
			this[type].addClass("active");
			this[type+"_select"]();
		},
		
		fill_select: function(){
			this.colorInput.setValue(this.data.fill, true);
		},
		
		fill_deselect: function(){
			
		},
		
		fill_change: function(){
			this.emit("fill", this.color);
			
		},
		
		stroke_select: function(){
			this.colorInput.setValue(this.data.stroke, true);
			this.addChild(this.strokeThicknessInput).show();
		},
		
		stroke_deselect: function(){
			this.removeChild(this.strokeThicknessInput);
		},
		
		stroke_change: function(){
			this.emit("stroke", {
				color: this.color,
				strokeThickness: this.strokeThickness
			});
		},
		
		shadow_select: function(){
			this.colorInput.setValue(this.data.shadow, true);
			
			this.addChild(this.shadowXInput).show();
			this.addChild(this.shadowYInput).show();
			this.addChild(this.shadowBlurInput).show();
		},
		
		shadow_deselect: function(){
			this.removeChild(this.shadowXInput);
			this.removeChild(this.shadowYInput);
			this.removeChild(this.shadowBlurInput);
		},
		
		shadow_change: function(){
			this.emit("shadow", {
				color: this.color,
				shadowBlur: this.shadowBlur,
				x: this.shadowX,
				y: this.shadowY
			});
			
		}

	}
);

//MT/ui/Dropdown.js
MT.namespace('ui');
MT.require("ui.List");
MT.require("ui.Button");

MT.extend("core.Emitter")(
	MT.ui.Dropdown = function(options, ui){
		this.options = options || {};
		var that = this;
		
		var input = this.input = document.createElement("input");
		input.setAttribute("type", "text");
		input.className = "ui-input ui-input-helper";
		
		input.onkeyup = function(e){
			if(e.which == MT.keys.ENTER){
				if(this.value != ""){
					button.text = this.value;
				}
				else{
					button.text = this.oldValue;
				}
				
				// chrome bug
				try{
					if(this.parentNode){
						this.parentNode.removeChild(this);
					}
				}
				catch(e){
					window.getSelection().removeAllRanges();
				}
				
				that.emit("change", button.text);
				
				
				
				if(options.onchange){
					that.hide();
					options.onchange(button.text);
				}
			}
			else{
				that.emit("update", input.value);
			}
		};
		
		var prev = function(e){
			e.stopPropagation();
		};
		input.onmouseup = prev;
		input.onmousedown = prev;
		input.onclick = prev;
		
		
		var list = null;
		
		if(options.list){
			if(typeof options.list[0] !== "object"){
				this.listSource = this.mkList(options.list);
			}
			else{
				this.listSource = options.list;
			}
			
			
			list = this.list = new MT.ui.List(this.listSource, ui, true);
			list.addClass("ui-dropdown-list");
			
			list.panel.content.style.position = "relative";
			
			list.on("show", function(){
				var b = button.el.getBoundingClientRect();
				list.style.top = (b.top + b.height)+"px";
				list.style.left = b.left+"px";
				var top;
				
				if(list.el.offsetTop + list.panel.content.el.offsetHeight > window.innerHeight){
					top = b.top - list.panel.content.el.offsetHeight;
					if(top > 0){
						list.style.top = top+"px";
					}
					if(list.panel.content.el.offsetHeight > 0){
						list.style.maxHeight = "350px";
						list.style.overflow = "auto";
					}
					
				}
				if(options.listStyle){
					list.style.minWidth = options.listStyle.width;
				}
				
			});
			
			list.on("hide", function(){
				that.hide();
			});
			that.on("hide", function(){
				list.hide();
			});
		}
		else{
			input.onblur = function(){
				that.hide();
			};
		}
		
		var button = this.button = new MT.ui.Button(null, options.button.class, ui.events, function(){
			document.body.appendChild(input);
			if(list){
				list.show(document.body);
			}
			var b = button.el.getBoundingClientRect();
			input.style.top = b.top+"px";
			input.style.left = b.left+"px";
			input.style.width = b.width+"px";
			input.oldValue = button.text;
			input.value = button.text;
			button.text = "";
			input.focus();
			that.emit("show");
			
			
		});
		
		if(options.button.width){
			button.width = options.button.width;
		}
		
		if(options.value){
			button.text = options.value;
		}
		
		
		this.on("show", function(){
			button.addClass("active");
		});
		
		this.on("hide", function(){
			button.removeClass("active");
		});
	},
	{
		
		mkList: function(arr){
			var out = [];
			for(var i=0; i<arr.length; i++){
				out.push(this.mkListItem(arr[i]));
			}
			return out;
		},
		
		mkListItem: function(str){
			var that = this;
			
			return {
				label: str,
				cb: function(){
					that.value = str;
					that.emit("change", str);
				}
			};
		},
		
		set value(val){
			if(!this.list.isVisible){
				this.button.text = val;
			}
			this.input.value = val;
		},
		
		get value(){
			return this.button.text;
		},
		
		addItem: function(item){
			this.list.addItem(item);
		},
		
		show: function(){
			this.emit("show");
		},
		
		hide: function(){
			this.emit("hide");
			if(this.list){
				this.list.hide();
			}
			if(this.input.parentNode){
				this.input.parentNode.removeChild(this.input);
			}
			this.button.text = this.input.value || this.input.oldValue;
		}

	}
);
//MT/ui/ColorPicker.js
MT.namespace('ui');
"use strict";
MT.require("ui.SliderHelper");
MT.require("core.Color");
MT.extend("core.Emitter")(
	MT.ui.ColorPicker = function(ui){
		this.ui = ui;
		this.canvas = document.createElement("canvas");
		this.canvas.width = 230;
		this.canvas.height = 200;
		this.canvas.style.margin = "5px"
		this.ctx = this.canvas.getContext("2d");
		
		this.cache = document.createElement("canvas");
		this.cache.width = 1;
		this.cacheCtx = this.cache.getContext("2d");
		this.updateCache();
		
		this.pickOffset = 30;
		this.isBase = false;
		
		var that = this;
		var mdown = false;
		
		this.panel = ui.createPanel("color");
		this.panel.setFree();
		this.panel.content.el.appendChild(this.canvas);
		
		this.preview = document.createElement("div");
		this.preview.style.width = "20%";
		this.preview.style.height = "20px";
		this.preview.style.marginLeft = "5px";
		this.preview.style.float = "left";
		this.preview.style.border = "solid 1px rgba(0,0,0,0.5)";
		this.panel.content.el.appendChild(this.preview);
		
		
		
		this.text = document.createElement("span");
		this.text.style.width = "20%";
		this.text.style.height = "20px";
		this.text.style.lineHeight = "19px";
		this.text.style.marginLeft = "5px";
		this.text.style.float = "left";
		this.panel.content.el.appendChild(this.text);
		
		
		this.color = new MT.core.Color("#f00");
		this.baseColor = new MT.core.Color("#f00");
		
		this.drawSide();
		this.drawBase("#F00");
		
		
		
		this.input = document.createElement("input");
		this.panel.el.appendChild(this.input);
		
		
		this.panel.width =this.canvas.width + 2 + 10;
		
		
		this.panel.on("resize", function(w, h){
			that.resize();
		});
		

		
		this.baseHandle = new MT.ui.SliderHelper(0, 0, this.canvas.height - 1);
		this.handleX = new MT.ui.SliderHelper(0, 0, this.canvas.width - this.pickOffset - 1);
		this.handleY = new MT.ui.SliderHelper(0, 0, this.canvas.height - 1);
		
		ui.events.on(ui.events.MOUSEDOWN, function(e){
			if(!that.panel.vsPoint(e)){
				that.emit("change", that.color.valueOf());
				that.hide();
				return;
			}
			
			if(e.target !== that.canvas){
				return;
			}
			
			
			
			if(e.offsetX > that.canvas.width - that.pickOffset){
				that.isBase = true;
				that.baseHandle.reset(e.offsetY);
			}
			else{
				that.handleX.reset(e.offsetX);
				that.handleY.reset(e.offsetY);
			}
				mdown = true;
				e.preventDefault();
				e.stopPropagation();
				
				that.input.focus();
				
				that.getColor(e.offsetX, e.offsetY);
		});
		
		
		
		var lastBase = false;
		ui.events.on(ui.events.MOUSEMOVE, function(e){
			if(!mdown){
				return;
			}
			e.preventDefault();
			e.stopPropagation();
			
			if(that.isBase){
				
				that.baseHandle.change(ui.events.mouse.my);
				that.getColor(that.canvas.width - that.pickOffset*0.5, that.baseHandle.value);
			}
			else{
				that.handleX.change(ui.events.mouse.mx);
				that.handleY.change(ui.events.mouse.my);
				
				that.getColor(that.handleX.value, that.handleY.value);
			}
			that.input.focus();
		});
		ui.events.on(ui.events.MOUSEUP, function(e){
			if(!mdown){
				return;
			}
			e.stopPropagation();
			mdown = false;
			that.isBase = false;
			that.baseHandle.reset();
			that.handleX.reset();
			that.handleY.reset();
			that.input.focus();
		}, true);
		
		
		that.input.onkeyup = function(e){
			e.stopPropagation();
			e.preventDefault();
			if(e.which == MT.keys.ESC){
				that.emit("change", that.startColor);
				that.setColor(that.startColor);
				that.hide();
				return;
			}
			
			if(e.which == MT.keys.ENTER){
				that.emit("change", that.color.valueOf());
				that.hide();
			}
		};
		
		
		
		
		this.panel.width = 300;
		this.panel.height = 200;
		//this.resize();
		
	},
	{
		resize: function(){
			this.canvas.width = this.panel.width - 12;
			this.canvas.height = this.panel.height - 40 - 20;
			
			
			this.baseHandle.max = this.canvas.height - 1;
			this.handleX.max = this.canvas.width - this.pickOffset - 1;
			this.handleY.max = this.canvas.height - 1;
			
			this._gradients.white = null;
			this._gradients.black = null;
			
			
			this.updateCache();
			this.update();
		},
		
		getColor: function(x, y){
			var data = null;
			if(this.isBase){
				data = this.cacheCtx.getImageData(0, this.baseHandle.value, 1, 1).data;
				this.baseColor.setRGB(data[0], data[1], data[2]);
			}
			this.redraw();
			data = this.ctx.getImageData(this.handleX.value, this.handleY.value, 1, 1).data;
			
			this.color.setRGB(data[0], data[1], data[2]);

			this.drawHandles();
			
			this.preview.style.backgroundColor = this.color.valueOf();
			this.text.innerHTML = this.color.valueOf();
			
			this.emit("change", this.color.valueOf());
		},
		
		startColor: null,
		setColor: function(color){
			color = color || "#333";
			this.startColor = color;
			
			this.preview.style.backgroundColor = color;
			
			this.color.setColor(color);
			this.baseColor.inherit(this.color);
			
			this.baseColor.s = 1;
			this.baseColor.l = 0.5;
			
			this.update();
		},
   
		update: function(){
			
			this.redraw();
			
			
			
			
			// get base handle
			this.baseHandle.reset(Math.floor((1 - this.baseColor.h) * this.canvas.height));
			
			
			// TODO: optimise this - atm brute force
			
			var dist = 2;
			// get main handle
			var data = this.ctx.getImageData(0, 0, this.canvas.width - this.pickOffset, this.canvas.height).data;
			for(var i=0; i<data.length; i+=4){
				if(Math.abs(data[i] - this.color.r) < dist && Math.abs(data[i+1] - this.color.g) < dist && Math.abs(data[i+2] - this.color.b) < dist){
					if(Math.abs(data[i+4] - this.color.r) < dist-1 && Math.abs(data[i+1+4] - this.color.g) < dist-1 && Math.abs(data[i+2+4] - this.color.b) < dist-1){
						dist--;
						if(dist > 0){
							continue;
						}
					}
					this.handleX.reset( (i/4) % (this.canvas.width - this.pickOffset) );
					this.handleY.reset( Math.floor( (i/4) / (this.canvas.width - this.pickOffset) ) );
					break;
				}
			}
			
			
			this.drawHandles();
			
			this.preview.style.backgroundColor = this.color.valueOf();
			this.text.innerHTML = this.color.valueOf();
		},

		updateCache: function(){
			this.cache.height = this.canvas.height;
			this.drawSide(this.cacheCtx);
		},
		
		redraw: function(){
			this.drawSide();
			this.drawBase();
			this.drawGradient();
			
		},
		drawBase: function(){
			var c = this.canvas;
			var ctx = this.ctx;
			
			ctx.fillStyle = this.baseColor.valueOf();
			ctx.fillRect(0, 0, c.width - this.pickOffset, c.height);
		},
		
		drawSide: function(ctx){
			ctx = ctx || this.ctx;
			var c = ctx.canvas;
			
			
			ctx.clearRect(0, 0, c.width, c.height);
			
			var colors = ctx.createLinearGradient(0, 0, 0, c.height);
			colors.addColorStop(0.01,   "#F00" );
			colors.addColorStop(0.166, "#F0F" );
			colors.addColorStop(0.3333, "#00F" );
			colors.addColorStop(0.5, "#0FF" );
			colors.addColorStop(0.666, "#0F0" );
			colors.addColorStop(0.833,   "#FF0" );
			colors.addColorStop(1,   "#F00" );


			ctx.fillStyle = colors;
			if(ctx == this.ctx){
				ctx.fillRect(c.width - 27, 0, 26, c.height);
			}
			else{
				ctx.fillRect(0, 0, c.width, c.height);
			}
		},
   
   
		_gradients: {
			white: null,
			black: null
		},
		drawGradient: function(){
			var c = this.canvas;
			var ctx = this.ctx;
			
			if(!this._gradients.white){
				this._gradients.white = ctx.createLinearGradient(0,0,c.width - 30,0);
				this._gradients.white.addColorStop(0.01,"rgba(255,255,255,1)" );
				this._gradients.white.addColorStop(0.99,"rgba(255,255,255,0)" );
				
				this._gradients.black = ctx.createLinearGradient(0,0, 0, c.height);
				this._gradients.black.addColorStop(0.01, "rgba(0,0,0,0)");
				this._gradients.black.addColorStop(0.99, "rgba(0,0,0,1)");
			}
			
			ctx.fillStyle = this._gradients.white;
			ctx.fillRect(0,0,c.width - this.pickOffset, c.height);

			ctx.fillStyle = this._gradients.black;
			ctx.fillRect(0,0,c.width - this.pickOffset, c.height);
			
			
		},
   
		drawHandles: function(){
			this.ctx.strokeStyle = "#000";
			this.ctx.strokeRect(this.canvas.width - 29.5, this.baseHandle - 2.5, 29, 4);
			
			
			//this.ctx.strokeRect(this.handleX - 1.5, this.handleY - 1.5, 5, 5);
			this.ctx.beginPath();
			this.ctx.arc(this.handleX+0.5, this.handleY+0.5, 3, 0, 2*Math.PI);
			this.ctx.stroke();
			
			this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
			this.ctx.strokeWidth = 0.5;
			//this.ctx.strokeRect(this.handleX - 0.5, this.handleY - 0.5, 3, 3);
			
			this.ctx.beginPath();
			this.ctx.arc(this.handleX+0.5, this.handleY+0.5, 2, 0, 2*Math.PI);
			this.ctx.stroke();
		},
		
		show: function(){
			this.panel.style.zIndex = this.ui.zIndex*10+9999;
			this.panel.show();
			this.input.focus();
			
		},
		
		hide: function(){
			this.panel.hide();
			this.input.blur();
			this.off();
		}

	}
);
//MT/ui/InputHelper.js
MT.namespace('ui');
"use strict";
MT.require("core.keys");
MT.extend("core.Emitter")(
	MT.ui.InputHelper = function(){
		var input = document.createElement("input");
		input.style.position = "absolute";
		input.type = "text";
		input.className = "ui-input";
		input.isVisible = false;
		input.style.textAlign = "right";
		input.style.paddingRight = "10px";
		
		
		var that = this;
		input.onblur = function(){
			that.emit("blur", input.value);
			var par = input.parentElement;
			if(par){
				par.removeChild(input);
			}
			that.el.style.visibility = "";
		};
		
		input.onkeyup = function(e){
			
			var key = e.which;
			if(key == MT.keys.ESC){
				input.blur();
				return;
			}
			
			if(key == MT.keys.ENTER){
				input.blur();
				that.emit("enter", e);
			}
			
			that.emit("change", input.value);
			that.inheritStyle();
		};
		
		input.onkeydown = function(e){
			
			var key = e.which;
			if(key == MT.keys.TAB){
				e.preventDefault();
				e.stopPropagation();
				that.emit("tab", e);
			}
		};
		
		
		this.input = input;
	},
	{
		show: function(el, val, ox, oy){
			
			if(this.el){
				this.el.style.visibility = "";
				this.el = null;
			}
			
			if(val == void(0)){
				val = el.innerHTML;
			}
			
			this.el = el;
			this.inheritStyle();
			this.input.value = val;
			
			el.style.visibility = "hidden";
			
			
			document.body.appendChild(this.input);
			this.input.focus();
			this.input.setSelectionRange(0, this.input.value.length);
		},
		blur: function(){
			this.input.blur();
		},
		inheritStyle: function(){
		
			var bounds = this.el.getBoundingClientRect();
			var style = window.getComputedStyle(this.el);
			var keys = Object.keys(style);
			for(var i=0; i<keys.length; i++){
				this.input.style[keys[i]] = style[keys[i]];
			}
			this.input.style.zIndex = 10000;
			this.input.style.position = "absolute";
			this.input.style.visibility = "visible";
			
			
			this.input.style.top = bounds.top + "px";
			this.input.style.left = bounds.left + "px";
			this.input.style.width = bounds.width + 1 + "px";
			this.input.style.height = bounds.height + 1 + "px";
			this.input.style.paddingBottom = "1px";
			this.input.style.paddingRight = "1px";
			
			//this.input.style.cssText = 
			//this.input.style. = el.style.fontSize;
			
		}
	}
);

//MT/plugins/tools/Physics.js
MT.namespace('plugins.tools');
MT.extend("core.BasicTool")(
	MT.plugins.tools.Physics = function(tools){
		this.tools = tools;
		this.enabled = false;
		this.name = "physics";
	},
	{
		initUI: function(){
			var that = this;
			this.button = this.tools.panel.addButton("", "tool.physics", function(){
				//that.tools.setTool(that);
				if(that.enabled){
					that.enabled = false;
					that.button.removeClass("active");
					that.tools.project.plugins.mapeditor.disablePhysics();
				}
				else{
					that.button.addClass("active");
					that.enabled = true;
					that.tools.project.plugins.mapeditor.enablePhysics();
				}
			}, this.getTooltip());
			
		},

	}
);
//MT/plugins/tools/TileTool.js
MT.namespace('plugins.tools');
"use strict";

MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.TileTool = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "tileTools";
		this.active = null;
		this.activePanel = null;
		window.tileTool = this;
		this.panels = {};
	},{

		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			this.panel = this.tools.project.plugins.assetmanager.preview;
			this.selection = new MT.core.Selector();

			this.start = 0;
			this.stop = 0;


			var that = this;
			this.tools.on(MT.OBJECT_SELECTED, function(obj){
				if(!obj){
					return;
				}
				if(obj.type == MT.objectTypes.TILE_LAYER){
					that._select(obj);
				}
			});
			this.tools.on(MT.OBJECT_UNSELECTED, function(){
				if(that.tools.activeTool == that){
					that.unselect();
				}
			});

			this.tools.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				if(that.tools.activeTool != that){
					return;
				}
				if(!that.panels[asset.id]){
					that.update();
				}
				that.activePanel = that.panels[asset.id];
				that.activePanel.show();
			});

			this.tools.map.on(MT.MAP_OBECTS_ADDED, function(map){
				if(that.tools.activeTool != that){
					return;
				}
				if(map.activeObject){
					that.select(map.activeObject);
					that.update();
				}
			});
		},

		getImageFn: function(img){
			return function(){return img;};
		},

		createPanels: function(images){
			var p, pp;
			var obj = this.active.data;
			var image = null;
			for(var id in images){
				if(this.panels[id]){
					if(!map){
						continue;
					}

					image = images[id];
					p = this.panels[id];
					continue;
				}

				p = this.addPanel(images[id], id);
				if(pp){
					p.addJoint(pp);
				}
				pp = p;
			}

			if(pp){
				this.activePanel = pp;
				pp.show(this.panel.content.el);
			}
		},

		addPanel: function(image, id){
			var p = new MT.ui.Panel(image.name);
			p.fitIn();
			p.addClass("borderless");



			this.createImage(p, image);
			this.panels[id] = p;
			var that = this;
			p.on("show", function(){
				that.stop = that.getTile(0, 0, p.data.image, p.data.data);
				that.activePanel = p;
			});

			return p;
		},

		createImage: function(panel, image){
			var that = this;
			var img = new Image();

			img.onload = function(){
				that.addCanvas(panel, this);
				that.drawImage(panel, this);
			};
			img.src = this.tools.project.path + "/" + image.__image;

			panel.data = {
				data: image,
				id: image.id,
				image: img,
				canvas: null,
				ctx: null
			};


		},


		addImage: function(image){
			var map = this.active.tilemap;
			for(var i =0; i<map.tilesets.length; i++){
				if(map.tilesets[i].name == image.id){
					return map.tilesets[i].firstgid;
				}
			}

			var nextId = 0;
			for(var i =0; i<map.tilesets.length; i++){
				nextId += map.tilesets[i].total+1;
			}

			//function (tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) {
			var key = ""+image.data.id;
			var tim = map.addTilesetImage(key, key, image.data.frameWidth, image.data.frameHeight, 0, 0, nextId);

			if(!this.active.data.images){
				this.active.data.images = [];
			}

			this.active.data.images.push(image.id);

			return nextId;

		},

		addCanvas: function(panel, image){

			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");

			var map = this.active.tilemap;

			canvas.width = image.width;
			canvas.height = image.height;

			panel.data.canvas = canvas;
			panel.data.ctx = ctx;

			var imgData = panel.data.data;

			panel.data.widthInTiles = image.width / imgData.frameWidth | 0;
			panel.data.heightInTiles = image.height / imgData.frameHeight | 0;



			var mdown = false;
			var that = this;

			canvas.onmousedown = function(e){
				mdown = true;
				var tile = that.getTile(e.offsetX, e.offsetY, panel.data.image, panel.data.data);

				that.start = tile;
				that.stop = tile;
				that.drawImage(panel);
			};

			canvas.onmousemove = function(e){
				if(!mdown){
					return;
				}
				var tile = that.getTile(e.offsetX, e.offsetY, panel.data.image, panel.data.data);
				that.stop = tile;

				that.drawImage(panel);
			};

			canvas.onmouseup = function(e){
				mdown = false;
				that.stop = that.getTile(e.offsetX, e.offsetY, panel.data.image, panel.data.data);
				that.activePanel = panel;
			};
			panel.content.el.appendChild(canvas);

		},

		addSelection: function(tileId){
			this.selection.add(tileId);
		},

		selectAdditionalTiles: function(){
			var min = this.selection.min;
			var max = this.selection.max;
		},

		drawImage: function(panel){
			var that = this;

			var image = panel.data.image;
			var ctx = panel.data.ctx;
			//image is loading
			if(ctx == null){
				return;
			}

			var imgData = panel.data.data;

			var tx, ty;
			var widthInTiles = panel.data.widthInTiles;


			ctx.clearRect(0, 0, image.width, image.height);
			ctx.drawImage(image, 0, 0, image.width, image.height);

			var map = this.active.tilemap;
			ctx.beginPath();

			for(var i = imgData.frameWidth + imgData.margin; i<image.width; i += imgData.frameWidth + imgData.spacing){
				ctx.moveTo(i+0.5, imgData.margin);
				ctx.lineTo(i+0.5, image.height);
			}
			for(var i = imgData.frameHeight + imgData.margin; i<image.height; i += imgData.frameHeight + imgData.spacing){
				ctx.moveTo(imgData.margin, i+0.5);
				ctx.lineTo(image.width, i+0.5);
			}
			ctx.stroke();



			ctx.fillStyle = "rgba(0,0,0,0.5)";

			tx = that.getTileX(this.start, widthInTiles);
			ty = that.getTileY(this.start, widthInTiles);

			this.selection.clear();

			if(this.start == this.stop){

				ctx.fillRect(
							imgData.margin + imgData.frameWidth * tx + tx * imgData.spacing + 0.5,
							imgData.margin + imgData.frameHeight * ty + ty * imgData.spacing + 0.5,
							imgData.frameWidth+0.5, imgData.frameHeight+0.5
				);
				this.selection.add({x: tx, y: ty, dx: 0, dy: 0});
			}
			else{


				var endx = that.getTileX(this.stop, widthInTiles);
				var endy = that.getTileY(this.stop, widthInTiles);

				var startx = Math.min(tx, endx);
				var starty = Math.min(ty, endy);

				endx =  Math.max(tx, endx);
				endy =  Math.max(ty, endy);

				for(var i=startx; i<=endx; i++){
					for(var j=starty; j<=endy; j++){
						ctx.fillRect(
							imgData.margin + imgData.frameWidth * i  + i * imgData.spacing + 0.5,
							imgData.margin + imgData.frameHeight * j + j * imgData.spacing + 0.5,

							imgData.frameWidth + 0.5,
							imgData.frameHeight + 0.5
						);
						this.selection.add({x: i, y: j, dx: i-startx, dy: j-starty});
					}
				}
			}
		},
		updatePreview: function(asset){
			this.drawImage(this.panels[asset.id]);
		},
		getTileX: function(tile, width){

			return tile % width;
		},

		getTileY: function(tile, width){
			return tile / width | 0;
		},

		getSelection: function(panel, e){
			var image = panel.data.image;
			return this.getTile(e.offsetX, e.offsetY, image, panel.data.data);
		},

		getTile2: function(x, y, image, imageData){
			var tx = (x + imageData.margin - imageData.spacing) / (imageData.frameWidth + imageData.spacing ) | 0;
			var ty = (y + imageData.margin - imageData.spacing) / (imageData.frameHeight + imageData.spacing ) | 0;
			return this.getId(tx, ty, image, imageData);
		},

		getTile: function(x, y, image, o){


			var dx = (x - o.margin);
			var dy = (y - o.margin);

			if(dx < 0){
				dx = 0;
			}
			if(dy < 0){
				dy = 0;
			}
			var gx = Math.floor( dx /(o.frameWidth + o.spacing));
			var gy = Math.floor( dy /(o.frameHeight + o.spacing));

			var maxX = Math.floor( o.width / o.frameWidth);

			var frame = gx + maxX * gy;
			return frame;
		},

		getId: function(tx, ty, image, imageData){
			var y = ty * ( (image.width + imageData.spacing) / (imageData.frameWidth + imageData.spacing) );
			var ret = (tx + y | 0);
			return ret;
		},

		mouseUp: function(e){
			if(e.target != this.tools.map.game.canvas){
				return;
			}
			this.mDown = false;
		},

		mouseDown: function(e){
			this.mDown = true;
			this.putTileFromMouse(e);
		},

		mouseMove: function(e){
			if(!this.mDown){
				return;
			}
			this.putTileFromMouse(e);
		},

		putTileFromMouse: function(e){
			if(e.target != this.tools.map.game.canvas){
				return;
			}

			var that = this;
			var activeLayer = this.active;
			if(!activeLayer.isVisible){
				return;
			}

			var map = this.active.tilemap;

			var scale = this.tools.map.game.camera.scale.x;

			var x = 0;
			var y = 0;


			if(!this.active || !this.active.game){
				return;
			}

			var bounds = this.active.getBounds();
			if(!bounds.contains(e.x - this.tools.map.ox, e.y - this.tools.map.oy)){
				return;
			}

			if(!this.active.fixedToCamera){
				x = (e.x - this.active.x - this.tools.map.offsetX)/scale;
				y = (e.y - this.active.y - this.tools.map.offsetY)/scale;
			}
			else{
				x = (e.x  - this.active.x + this.tools.map.game.camera.x - this.tools.map.ox)/scale;
				y = (e.y  - this.active.y + this.tools.map.game.camera.y - this.tools.map.oy)/scale;
			}
			var p = {x: 0, y: 0};
			// TODO: phaser bug with scrollFactorX - check if fixed
			if(this.active.object.scrollFactorX == 0){
				p.x = Math.floor(x / this.active.tileWidth);
			}
			else{
				p.x = this.active.getTileX(x);
			}
			if(this.active.object.scrollFactorY == 0){
				p.y = Math.floor(y / this.active.tileHeight);
			}
			else{
				p.y = this.active.getTileY(y);
			}
			//this.active.getTileXY(x, y, {});

			if(e.ctrlKey){
				that.putTile(null, p.x, p.y, activeLayer);
				return;
			}
			if(!this.activePanel){
				return;
			}

			var id = this.addImage(this.activePanel.data);


			var oid = 0;
			this.selection.forEach(function(obj){
				oid = that.getId(obj.x, obj.y, that.activePanel.data.image, that.activePanel.data.data);
				that.putTile(
					id + oid, p.x + obj.dx, p.y + obj.dy, activeLayer
				);
			});
		},

		putTile: function(id, x, y, layer){
			if(!layer.data.tiles){
				layer.data.tiles = {};
			}
			if(!layer.data.tiles[y]){
				layer.data.tiles[y] = {};
			}
			layer.data.tiles[y][x] = id;
			layer.putTile(id, x, y);

			if(this.active){
				this.active.data.lastImage = this.activePanel.data.id;
			}

			this.tools.project.plugins.objectmanager.sync();
		},

		oldSettings: {},
		init: function(){
			this.active = this.tools.map.activeObject;
			if(!this.active){
				this.tools.setTool(this.tools.tools.select, true);
				this.showInfoToolTip(0, true);
				console.warn("not tilelayer selected!!!")
				return;
			}

			this.adjustSettings(this.active.data);
			this.panel.content.clear();

			this.update();

			this.panel.show();
			if(this.activePanel){
				this.activePanel.hide();
				this.activePanel.show();
			}

			//this.tools.map.handlemousemove = this.tools.mousemove;
		},

		restore: function(){
			if(this.oldSettings.gridX){
				this.tools.map.settings.gridX = this.oldSettings.gridX;
				this.tools.map.settings.gridY = this.oldSettings.gridY;
				this.tools.map.settings.gridOffsetX = 0;
				this.tools.map.settings.gridOffsetY = 0;
			}
		},

		adjustSettings: function(obj){
			this.restore();

			if(this.tools.activeTool != this){
				this.oldSettings.activeTool = this.tools.activeTool;
			}
			this.oldSettings.gridX = this.tools.map.settings.gridX;
			this.oldSettings.gridY = this.tools.map.settings.gridY;

			this.tools.map.settings.gridX = obj.tileWidth;
			this.tools.map.settings.gridY = obj.tileHeight;
			this.tools.map.settings.gridOffsetX = obj.x;
			this.tools.map.settings.gridOffsetY = obj.y;
		},

		unselect: function(){
			this.panel.content.clear();
			this.restore();
			if(this.tools.activeTool == this && this.oldSettings.activeTool && this.tools.activeTool != this.oldSettings.activeTool){
				this.tools.setTool(this.oldSettings.activeTool, true);
			}
			else{
				this.tools.setTool(this.tools.tools.select, true);
			}
		},

		deactivate: function(){
			this.restore();
		},

		select: function(obj){
			this._select(obj);
		},
		_select: function(obj){
			if(obj.type != MT.objectTypes.TILE_LAYER){
				this.restore();
				return;
			}
			this.active = this.tools.map.getById(obj.id);
			if(this.tools.map.activeObject != this.active){
				this.restore();
				return;
			}

			this.tools.setTool(this);
			if(!this.active){
				return;
			}


			this.panel.show();
			this.update();
		},

		activeImage: null,
		update: function(){
			var images = this.tools.project.plugins.assetmanager.list;
			if(this.active){
				this.createPanels(images);
				if(!this.active.data.lastImage){
					if(this.active.data.images && this.active.data.images.length){
						this.active.data.lastImage = this.active.data.images[0];
					}
				}

				if(this.active.data.lastImage){
					if(this.active.data.images && this.active.data.images.length){
						var p = this.panels[this.active.data.lastImage];
						if(p){
							this.activePanel = p;
							this.activePanel.show();
						}
					}
				}
			}
			if(this.activePanel){
				this.drawImage(this.activePanel);
			}
		},


		updateLayer: function(mo){

			//this.active = mo;
			var obj = mo.object;
			var data = mo.data;

			if(!data.images || data.images.length == 0){
				return;
			}
			var map = obj.map;
			var nextId = 0;
			var tilesetImage = null;

			var images = this.tools.project.plugins.assetmanager.list;
			var image = null;

			for(var i=0; i<data.images.length; i++){
				image = images[data.images[i]];
				if(!image){
					data.images.splice(i, 1);
					i--;
					continue;
				}
				//addTilesetImage(tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) ??? {Phaser.Tileset}
				tilesetImage = map.addTilesetImage(image.id, image.id, image.frameWidth, image.frameHeight, image.margin, image.spacing, nextId);
				nextId += tilesetImage.total;
			}

			var tiles = data.tiles;
			for(var y in tiles){
				for(var x in tiles[y]){
					if(tiles[y][x] >= map.tiles.length){
						delete tiles[y][x];
						console.warn("tile out of range: ", tiles[y][x]);
						continue;
					}

					obj.map.putTile(tiles[y][x], x, y, obj);
				}
			}
			// is it right place for this?
			if(data.alpha != void(0)){
				obj.alpha = data.alpha;
			}
		}
	}
);

//MT/plugins/tools/Text.js
MT.namespace('plugins.tools');
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
//MT/plugins/tools/Brush.js
MT.namespace('plugins.tools');
MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Brush = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "brush";
	},{
		
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			var that = this;
			
			this.tools.on(MT.ASSET_SELECTED, function(asset){
				if(that.tools.activeTool != that){
					return;
				}
				that.init(asset);
			});
			
			this.tools.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				if(that.tools.activeTool != that){
					return;
				}
				
				that.init(asset);
				that.tools.tmpObject.frame = that.tools.activeFrame;
				
			});
			
			this.tools.on(MT.OBJECT_SELECTED, function(){
				if(that.tools.activeTool != that){
					return;
				}
				if(!that.tools.tmpObject){
					return;
				}
				that.tools.initTmpObject();
			});
		},
		
		lastX: 0,
		lastY: 0,
		
		init: function(asset){
			this.map = this.tools.map;
			this.tools.unselectObjects();
			
			asset = asset || this.tools.activeAsset;
			
			var that = this;
			this.tools.map.handleMouseMove = function(e){
				that.mouseMove(e);
			}
			
			if(!asset || asset.contents){
				return;
			}
			
			this.tools.initTmpObject(asset);
			this.tools.tmpObject.frame = this.tools.activeFrame;
			
		},
		
		
		mouseDown: function(e){
			
			if(!this.tools.tmpObject){
				if(!this.tools.map.activeObject){
					return;
				}
				if(!this.tools.lastAsset){
					this.tools.lastAsset = this.project.plugins.assetmanager.getById(this.tools.map.activeObject.data.assetId);
				}
				this.init(this.tools.lastAsset);
				
				return;
			}
			
			this.insertObject();
		},
		
		mouseMove: function(e){
			
			if(e.target != this.tools.map.game.canvas){
				return;
			}
			
			if(!this.tools.tmpObject){
				return;
			}
			
			var x = this.tools.tmpObject.x;
			var y = this.tools.tmpObject.y;
			
			this.tools.map._followMouse(e, true);
			
			if(this.ui.events.mouse.down){
				
				if(this.tools.tmpObject.x != this.lastX || this.tools.tmpObject.y != this.lastY){
					this.insertObject();
					
				}
			}
		},
		
		insertObject: function(){
			var om = this.project.plugins.objectmanager;
			this.tools.map.sync(this.tools.tmpObject, this.tools.tmpObject.data);
			
			this.tools.tmpObject.data.frame = this.tools.activeFrame;
			om.insertObject(_.cloneDeep(this.tools.tmpObject.data));
			
			this.lastX = this.tools.tmpObject.x;
			this.lastY = this.tools.tmpObject.y;
			this.tools.initTmpObject();
			
			this.tools.tmpObject.frame = this.tools.activeFrame;
			this.tools.tmpObject.x = this.lastX;
			this.tools.tmpObject.y = this.lastY;
			this.tools.tmpObject.object.bringToTop();
		},
		
		mouseUp: function(e){
			
		},
		
		deactivate: function(){
			this.tools.removeTmpObject();
			
			this.tools.map.handleMouseMove = this.tools.map.emptyFn;
			this.project.plugins.objectmanager.update();
		},
		
		

	}
);
//MT/plugins/tools/Stamp.js
MT.namespace('plugins.tools');
MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Stamp = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "stamp";
	},{
		
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			var that = this;
			this.tools.on(MT.ASSET_SELECTED, function(asset){
				if(that.tools.activeTool != that){
					return;
				}
				that.init(asset);
				that.tools.tmpObject.frame = 0;
			});
			
			this.tools.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				if(that.tools.activeTool != that){
					return;
				}
				that.init(asset);
				that.tools.tmpObject.frame = frame;
			});
			
			this.tools.on(MT.TOOL_SELECTED, function(){
				if(that.tools.activeTool != that){
					return;
				}
			});
			
			this.tools.on(MT.OBJECT_SELECTED, function(){
				if(that.tools.activeTool != that){
					return;
				}
				if(!that.tools.tmpObject){
					return;
				}
				that.tools.initTmpObject();
			});
		},
		
		init: function(asset){
			
			this.map = this.tools.map;
			this.tools.unselectObjects();
			
			asset = asset || this.tools.activeAsset;
			var that = this;
			this.tools.map.handleMouseMove = function(e){
				that.mouseMove(e);
			}
			
			if(!asset || asset.contents){
				return;
			}
			this.tools.initTmpObject(asset);
			this.tools.tmpObject.frame = this.tools.activeFrame;
			
		},
		mouseMove: function(e){
			
			if(e.target != this.tools.map.game.canvas){
				return;
			}
			
			if(!this.tools.tmpObject){
				return;
			}

			this.tools.map._followMouse(e, false);
		},
		mouseDown: function(e){
			
			if(!this.tools.tmpObject){
				if(!this.map.activeObject){
					if(this.project.plugins.assetmanager.active){
						this.tools.lastAsset = this.project.plugins.assetmanager.active.data;
					}
					return;
				}
				if(!this.tools.lastAsset){
					this.tools.lastAsset = this.project.plugins.assetmanager.getById(this.map.activeObject.data.assetId);
				}
				this.init(this.tools.lastAsset);
				return;
			}
			
			var om = this.project.plugins.objectmanager;
			
			this.map.sync(this.tools.tmpObject);
			
			this.tools.tmpObject.data.frame = this.tools.activeFrame;
			
			var newObj = om.insertObject(_.cloneDeep(this.tools.tmpObject.data));
			
			this.tools.initTmpObject();
			this.tools.tmpObject.frame = this.tools.activeFrame;
			
			this.tools.tmpObject.x = newObj.x;
			this.tools.tmpObject.y = newObj.y;
			
			
			this.tools.tmpObject.object.bringToTop();
			
			//this.tools.unselectObjects();
		},
		
		mouseUp: function(e){
			
		},
		
		deactivate: function(){
			
			this.tools.removeTmpObject();
			
			this.map.handleMouseMove = this.map.emptyFn;
			this.project.plugins.objectmanager.update();
		},
	}
);
//MT/plugins/tools/Select.js
MT.namespace('plugins.tools');
"use strict";
MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Select = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "select";
		
		this.activeState = this.states.NONE;
		
		
		this.startMove = {
			x: 0,
			y: 0
		};
	},{
		
		states: {
			NONE: 0,
			RW: 1,
			RE: 2,
			RN: 3,
			RS: 4,
			RNW: 5,
			RNE: 6,
			RSW: 7,
			RSE: 8
		},
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			
			this.map = this.tools.map;
		},
		init: function(skipNotify){
			this.mDown = false;
			this.map.handleMouseMove = this.mouseMoveFree;
			if(skipNotify){
				return;
			}
			this.showInfoToolTip();
		},
		
		
		deactivate: function(){
			this.mDown = false;
			this.map.handleMouseMove = this.mouseMoveFree;
			map.selection.width = 0;
			map.selection.height = 0;
		},
		
		select: function(obj){
			if(obj == map.activeObject){
				return;
			}
			
			var shift = (this.ui.events.mouse.lastEvent && this.ui.events.mouse.lastEvent.shiftKey ? true : false);
			if(shift){
				if(this.map.selector.is(obj)){
					this.map.selector.remove(obj);
					return;
				}
				
				this.map.selector.add(obj);
				return;
			}
			
			this.tools.selectObject(obj, true);
		},
		
		/* !!! this functions runs in map scope */
		mouseMoveFree: function(e){
			
			if(!this.activeObject){
				return;
			}
			var self = this.project.plugins.tools.tools.select;
			var obj = this.activeObject;
			var x = e.x - this.ox;
			var y = e.y - this.oy;
			
			if(self.checkAltKey(e)){
				
			}
			else{
				obj.mouseMove(x, y, e);
			}
		},
		altKeyReady: false,
		checkAltKey: function(e){
			
			if(!this.altKeyReady){
				return;
			}
			this.altKeyReady = false;
			
			var copy = [];
			var sel = this.map.selector;
			sel.sort(function(a, b){
				return (a.object.z - b.object.z);
			});
			
			sel.forEach(function(o){
				copy.push(o.data);
			});
			
			var bounds = null;
			var cx = this.map.game.camera.x;
			var cy = this.map.game.camera.y;
			
			var data = this.tools.om.multiCopy(copy);
			sel.clear();
			
			var sprite;
			for(var i=0; i<data.length; i++){
				sprite = this.map.getById(data[i].id);
				if(!sprite){
					continue;
				}
				sprite.object.updateTransform();
				sel.add(sprite);
				
			}
			if(data.length > 0){
				this.map.activeObject = this.map.getById(data[0].id);
				
				this.map.emit("select", this.map.settings);
				this.initMove(e);
			}
			
			
		},
		mouseMove: function(e){
			if(!this.mDown){
				return;
			}
			
			var x = e.x - this.map.offsetX;
			var y = e.y - this.map.offsetY;
			
			
			if(x > this.map.selection.sx){
				this.map.selection.width = x - this.map.selection.x;
			}
			else{
				this.map.selection.width = this.map.selection.sx - x;
				this.map.selection.x = x;
			}
			
			if(y > this.map.selection.sy){
				this.map.selection.height = y - this.map.selection.y;
			}
			else{
				this.map.selection.height = this.map.selection.sy - y;
				this.map.selection.y = y;
			}
			
			this.map.selectRect(this.map.selection, !e.shiftKey);
			
			if(this.map.selector.count !== 1){
				this.map.emit("select", this.map.settings);
				this.map.activeObject = null;
			}
			else{
				this.map.activeObject = this.map.selector.get(0);
				
			}
		},
		
		initMove: function(e){
			if(this.tools.activeTool != this){
				return;
			}
			
			this.checkAltKey(e);
			
			var that = this;
			
			this.map.updateMouseInfo(e);
			
			this.map.handleMouseMove = function(e){
				that.map.handleMouseMove = that.map._objectMove;
			}
		},
		_lastMD: 0,
		doubleClick: function(){
			if(!this.map.activeObject){
				return false;
			}
			
			var mt = this.map.activeObject.data;
			var tmp;
			for(var i=0; i<this.map.loadedObjects.length; i++){
				tmp = this.map.loadedObjects[i];
				if(tmp.data.assetId == mt.assetId && tmp.data.type == mt.type && tmp.isVisible && !tmp.isLocked){
					this.map.selector.add(tmp);
				}
			}
			
			return true;
		},
		
		mDown: false,
		
		mouseUp: function(e){
			if(this.map.activeObject){
				this.map.activeObject.mouseUp(e.x - this.map.ox, e.y - this.map.oy, e);
			}
			
			this.mDown = false;
			var x = e.x - this.map.offsetXCam;
			var y = e.y - this.map.offsetYCam;
			
			var map = this.tools.map;
			
			map.selectRect(map.selection);
			
			map.selection.width = 0;
			map.selection.height = 0;
			
			if(this.map.activeObject){
				this.map.activeObject.mouseUp(e.x - this.map.ox, e.y - this.map.oy, e);
			}
			
			this.checkAltKey(e);
			
			map.handleMouseMove = this.mouseMoveFree;
		},
		
		mouseDown: function(e){
			this.mDown = true;
			if(Date.now() - this._lastMD < 300){
				if(this.doubleClick()){
					return;
				}
			}
			
			this._lastMD = Date.now();
			
			var x = e.x - this.map.ox;
			var y = e.y - this.map.oy;
			
			var dx = e.x - this.map.offsetXCam;
			var dy = e.y - this.map.offsetYCam;
			
			if(e.altKey){
				this.altKeyReady = true;
			}
			
			if(this.map.activeObject && this.map.activeObject.activeHandle != -1){
				this.map.activeObject.mouseDown(x, y, e);
				return;
			}
			
			
			var shift = (e.shiftKey ? true : false);
			
			var obj = this.map.pickObject(dx, dy);
			if(!obj){
				var that = this;
				this.map.handleMouseMove = function(e){
					that.mouseMove(e);
				};
				this.map.selection.x = e.x - this.map.offsetX;
				this.map.selection.y = e.y - this.map.offsetY;
				
				this.map.selection.sx = e.x - this.map.offsetX;
				this.map.selection.sy = e.y - this.map.offsetY;
				
				this.map.selection.width = 0;
				this.map.selection.height = 0;
				
				if(!shift){
					this.map.selector.clear();
					this.map.activeObject = null;
					this.map.emit("select", this.map.settings);
				}
				return;
			}
			
			if(!shift){
				if(!this.map.selector.is(obj)){
					this.map.selector.clear();
				}
			}
			else{
				if(this.map.selector.is(obj)){
					this.map.selector.remove(obj);
					return;
				}
			}
			
			this.map.selector.add(obj);
			
			if(this.map.selector.count == 1){
				this.map.activeObject = obj;
				obj.mouseDown(x, y, e);
			}
			else{
				this.map.activeObject = null;
				this.map.emit("select", this.map.settings);
				this.altKeyReady = e.altKey;
				this.initMove(e);
			}
		}
	}
);
//MT/ui/List.js
MT.namespace('ui');
MT.require("ui.Panel");
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.List = function(list, ui, autohide){
		MT.ui.DomElement.call(this);
		this._items = [];
		this.ui = ui;
		this.setAbsolute();
		this.addClass("ui-list");
		
		this.panel = new MT.ui.Panel("", ui.events);
		this.panel.removeHeader();
		
		
		this.panel.content.style.overflow = "initial";
		this.panel.style.position = "relative";
		this.panel.show(this.el);
		
		
		this.panel.content.style.position = "relative";
		var that = this;
		
		var hasSubList = function(list, el){
			var sub, l;
			for(var i=0; i<list.list.length; i++){
				l = list.list[i];
				if(l._list){
					sub = hasSubList(l._list, el);
					if(sub){
						return sub;
					}
				}
				if(l.button.el == el){
					return true;
				}
			}
			return false;
		};
		
		ui.events.on("mouseup", function(e){
			for(var i=0; i<that.panel.buttons.length; i++){
				if(that.panel.buttons[i].el == e.target){
					return;
				}
			}
			if(MT.ui.hasParent(e.target, that.el)){
				return;
			}
			if(that.isVisible && autohide){
				if(hasSubList(that, e.target)){
					return;
				}
				
				that.hide();
			}
		}, true);
		
		this.isVisible = false;
		this.list = list;
		this.origList = list;
		this.update();
		
		this.addChild(this.panel).show();
	},
	{
		filter: function(cb){
			this.list = this.origList.filter(cb);
			this.update();
		},
		update: function(){
			//this.clear();
			while(this._items.length){
				this._items.pop().remove();
			}
			for(var i=0; i<this.list.length; i++){
				this.addItem(this.list[i]);
			}
		},
		reset: function(){
			this.list = this.origList;
			this.panel.buttons.length = 0;
			this.panel.children.length = 0;
			this.update();
		},
		addItem: function(item){
			if(item.check && !item.check()){
				return;
			}
			var b;
			if (item.contents) {
				var that = this;
				item._list = new MT.ui.List(item.contents, this.ui, true);
				item._list.__parent = this;
				item.cb = function (e) {
					item._list.show();
					
					var bounds = b.bounds;
					item._list.x = bounds.left + bounds.width;
					item._list.y = bounds.top;
					e.preventDefault();
					e.stopPropagation();
				};
			}

			b = this.panel.addButton(item.label, item.className, item.cb);
			b.el.title = item.title || item.label;
			b.style.position = "relative";
			b.addClass("ui-list-button");
			
			if(item.create){
				item.create(b);
			}

			if(item.contents) {
				b.addClass("has-menu");
			}

			this._items.push(b);
			item.button = b;
		},
		
		removeItem: function(item){
			
		},
		
		show: function(parent){
			this.shown = Date.now();
			this.reset();
			this.isVisible = true;
			MT.ui.DomElement.show.call(this, parent);
			this.emit("show");
			if(this.x + this.width > window.innerWidth){
				this.x -= this.width;
			}
			if(this.y + this.height > window.innerHeight){
				if(this.y - this.height < 0){
					this.el.style["min-height"] = "350px";
				}
				else{
					this.y -= this.height;
				}
			}
			
		},
		
		hide: function(){
			// prevent instant show/hide
			if(Date.now() - this.shown < 100){
				return;
			}
			if(!this.isVisible){
				return;
			}
			this.isVisible = false;
			MT.ui.DomElement.hide.call(this);
			this.emit("hide");
		}
	}
);

//MT/ui/Input.js
MT.namespace('ui');
/**
 * usage new MT.ui.Input(MT.events, key, object);
 */

"use strict";
MT.require("core.keys");
MT.require("ui.ColorPicker");
MT.extend("ui.DomElement").extend("core.Emitter")(
	MT.ui.Input = function(ui, properties, obj, callback){
		var events = ui.events;
		MT.ui.DomElement.call(this);
		MT.core.Emitter.call(this);
		
		
		this.object = obj;
		this.key = "";
		this.step = 1;
		
		this.min = -Infinity;
		this.max = Infinity;
		
		this.type = "number";
		
		this.properties = properties;
		if(typeof properties === "string"){
			this.key = properties;
		}
		else{
			this.key = properties.key;
			this.step = properties.step || this.step;
			if(properties.min != void(0)){
				this.min = properties.min;
			}
			if(properties.max != void(0)){
				this.max = properties.max;
			}
			if(properties.type != void(0)){
				this.type = properties.type;
			}
		}
		
		// create button? 
		if(this.type == "bool"){
			this.type = "number";
			this.min =  0;
			this.max =  1;
			this.step = 1;
		}
		
		if(this.type == "number"){
			this.addClass("ui-input-number");
		}
		
		
		this.label = new MT.ui.DomElement();
		this.label.addClass("ui-input-label");
		//this.label.setAbsolute();
		
		this.addChild(this.label).show();
		
		this.addClass("ui-input");
		this.label.el.innerHTML = properties.label || this.key;
		this.label.style.bottom = "initial";
		this.label.style.right = "50%";
		
		this.value = new MT.ui.DomElement("a");
		this.value.style.bottom = "initial";
		this.value.style.left = "initial";
		this.value.style.right = 0;
		this.value.addClass("ui-input-value");
		
		this.node = document.createTextNode("");
		this.value.el.appendChild(this.node);
		
		if(this.type == "select"){
			
			this.options = [];
			var sel = document.createElement("div");
			this.selectInput = sel;
			var options = properties.options;
			var opt;
			for(var i=0; i<options.length; i++){
				opt = document.createElement("div");
				sel.appendChild(opt);
				
				if(typeof options[i] == "string"){
					opt.innerHTML = options[i];
				}
				else{
					opt.innerHTML = options[i].label;
					opt.value = options[i].value;
					if(options[i].title){
						opt.title = options[i].title;
					}
				}
				
				this.options.push(opt);
			}
			
			this.setValue(this.object[this.key], true);
			
			sel.className = "ui-input-dropdown";
			
			this.selectInput.onmousedown = function(e){
				if(e.target == sel){
					return;
				}
				that.selectedValue = e.target.innerHTML;
			};
			
		}
		
		var input = this.input = this.inputBox = document.createElement("input");
		
		
		var that = this;
		if(this.type == "upload"){
			this.input.type = "file";
			this.addClass("upload");
			if(properties.accept){
				this.input.setAttribute("accept", properties.accept);
			}
			this.input.onchange = function(e){
				that.emit("change", e, that.object);
				this.value = "";
			};
			
			this.label.style.right = "0";
			this.label.el.onclick = function(e){
				that.input.click();
			};
			/*if(this.object[this.key] !== void(0)){
				this.setValue(this.object[this.key], true);
				this.addChild(this.value).show();
				
			}*/
			return;
		}
		
		
		this.addChild(this.value).show();
		this.value.style.bottom = "initial";
		this.value.style.left = "initial";
		this.value.style.right = 0;
		this.value.addClass("ui-input-value");
		
		if(this.type == "color"){
			this.value.style.float = "right";
			this.value.style.position = "relative";
			this.span = document.createElement("span");
			this.el.appendChild(this.span);
			this.span.className = "ui-input-color-pick";
			this.span.style.backgroundColor = this.object[this.key];
			
			var that = this;
			this.span.onclick = function(){
				ui.colorPicker.setColor(that.object[that.key]);
				ui.colorPicker.show();
				ui.colorPicker.on("change", function(val){
					that.setValue(val);
				});
			};
		}
		
		this.setValue(this.object[this.key], true);
		this.setTabIndex();
		
		this.events = events;
		
		
		//input.style.position = "absolute";
		input.type = "text";
		if(this.type == "password"){
			input.setAttribute("type", "password");
		}
		input.className = "ui-input";
		input.isVisible = false;
		input.style.textAlign = "right";
		input.style.paddingRight = "10px";
		
		//input.setAttribute("tabindex", parseInt(this.value.el.getAttribute("tabindex")));
		//input.setAttribute("tabstop", "false");
		
		var origTab = 0;
		
		var enableInput = function(){
			if(!that.value.el.offsetParent){
				return;
			}
			
			
			var w = that.value.el.parentNode.parentNode.offsetWidth*0.5;
			input.style.width = w + "px";
			
			input.style.top = ( that.value.calcOffsetY(that.value.el.offsetParent) - 9 ) + "px";
			input.style.left = ( that.value.calcOffsetX(that.value.el.offsetParent) - w + that.value.el.offsetWidth - 25) + "px";
			input.value = that.object[that.key];
			
			input.isVisible = true;
			input.width = that.value.offsetWidth + "px";
			
			origTab = that.value.el.getAttribute("tabindex");
			that.value.el.setAttribute("tabindex", -1);
			
			
			that.value.style.visibility = "hidden";
			
			//that.node.nodeValue = "";
			
			that.value.el.offsetParent.appendChild(input);
			input.focus();
			if(input.type != "color"){
				input.setSelectionRange(0, input.value.length);
			}
			
			if(properties.options){
				that.showOptions();
			}
		};
		
		this.value.el.onkeydown = function(){
			enableInput();
		};
		
		this.value.el.setAttribute("draggable", "false");
		
		//this.value.el.onfocus = enableInput;
		this.enableInput = function(){
			enableInput();
		};
		var down = false;
		this.value.el.onmousedown = function(e){
			that.needEnalbe = true;
			down = true;
			e.preventDefault();
			e.stopPropagation();
		};
		this.on("change", function(){
			that.needEnalbe = false;
		});
		this.value.el.onmouseup = function(e){
			if(that.needEnalbe == true){
				enableInput();
			}
		};
		
		
		this.value.el.onfocus = function(){
			enableInput();
		};
		
		var startVal;
		input.onfocus = function(){
			startVal = that.object[that.key];
		};
		
		input.onblur = function(){
			//return;
			input.parentNode.removeChild(input);
			input.isVisible = false;
			
			if(that.selectedValue){
				input.value = that.selectedValue;
			}
			var val = that.evalValue(input.value);
			that.setValue(val);
			that.emit("change", val, val);
			
			if(properties.options){
				that.hideOptions();
			}
			that.value.el.setAttribute("tabindex", origTab);
			//that.setTabIndex()
		};
		
		input.onkeydown = function(e){
			if(e.which == MT.keys.DELETE){
				e.stopPropagation();
			}
			if(e.which == MT.keys.ESC){
				
				input.value = startVal;
				input.blur();
				e.stopPropagation();
			}
		};
		
		
		input.onkeyup = function(e){
			if(!input.isVisible){
				return;
			}
			var w = e.which;
			var hideval = true;
			
			if(w == MT.keys.ESC){
				hideval = false;
				input.value = that.object[that.key];
				input.blur();
			}
			
			if(w == MT.keys.ENTER){
				if(that.selectedValue != ""){
					input.value = that.selectedValue;
					that.setValue(that.selectedValue);
				}
				hideval = false;
				input.blur();
			}
			else if(w == MT.keys.DOWN){
				that.showNextOption();
			}
			else if(w == MT.keys.UP){
				that.showPrevOption();
			}
			
			if(that.object[that.key] != input.value){
				var val = that.evalValue(input.value);
				that.setValue(val, true);
				if(hideval){
					that.value.style.visibility = "hidden";
					//that.node.nodeValue = "";
				}
			}
			
			if(properties.options){
				that.showOptions(true);
			}
			e.preventDefault();
			e.stopPropagation();
		};
		
		input.onmousedown = function(e){
			e.stopPropagation();
		};
		//this.keyup = events.on("keyup", 
		
		if(this.type == "number"){
		
			this.wheel = input.onwheel = events.on("wheel", function(e){
				if(e.target !== that.value.el){
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				var d = ( (e.wheelDelta || -e.deltaY) > 0 ? 1 : -1);
				var val = that.object[that.key] + d*that.step;
				that.setValue(val);
			}, true);
			
			this.mouseup = events.on("mouseup",function(){
				down = false;
				that.needEnalbe = false;
			});
			
			this.el.onmouseup = this.mouseup;
			
			this.mousemove = events.on("mousemove",function(e){
				if(!down){
					return;
				}
				var val = that.object[that.key] - events.mouse.my*that.step;
				that.setValue(val, false);
			});
		}
		
		if(callback){
			this.on("change", callback);
		}
		
	},
	{
		selectedValue: "",
		showOptions: function(filter){
			while(this.selectInput.firstChild){
				this.selectInput.removeChild(this.selectInput.firstChild);
			}
			var val = this.inputBox.value;
			
			for(var i=0; i<this.options.length; i++){
				if(!filter){
					this.selectInput.appendChild(this.options[i]);
					continue;
				}
				
				if(this.options[i].innerHTML.toLowerCase().indexOf(val.toLowerCase()) > -1){
					this.selectInput.appendChild(this.options[i]);
				}
			}
			
			document.body.appendChild(this.selectInput);
			
			var rect = this.inputBox.getBoundingClientRect();
			
			this.selectInput.style.top = (rect.top + rect.height) + "px";
			this.selectInput.style.left = rect.left + "px";
			
			
			var bounds = this.selectInput.getBoundingClientRect();
			if(bounds.right > window.innerWidth){
				this.selectInput.style.left = (window.innerWidth - bounds.width)+"px";
			}
			
			if(bounds.bottom > window.innerHeight){
				this.selectInput.style.top = (rect.top - bounds.height)+"px";
			}
		},
		
		hideOptions: function(){
			this.currOption = -1;
			if(this.activeOption){
				this.activeOption.className = "";
			}
			
			while(this.selectInput.firstChild){
				this.selectInput.removeChild(this.selectInput.firstChild);
			}
			
		},
		
		currOption: -1,
		activeOption: null,
		showNextOption: function(){
			if(!this.selectInput){
				return;
			}
			if(this.activeOption){
				this.activeOption.className = "";
			}
			
			this.currOption++;
			if(this.currOption > this.selectInput.children.length -1){
				this.currOption = 0;
			}
			if(this.currOption < 0){
				this.currOption = this.selectInput.children.length - 1;
			}
			
			if(!this.selectInput.children.length){
				return;
			}
			this.activeOption = this.selectInput.children[this.currOption];
			this.activeOption.className = "active";
			this.selectedValue = this.activeOption.innerHTML;
			
			this.activeOption.scrollIntoView(false);
		},
		
		showPrevOption: function(){
			if(!this.selectInput){
				return;
			}
			if(this.activeOption){
				this.activeOption.className = "";
			}
			
			this.currOption--;
			if(this.currOption < 0){
				this.currOption = this.selectInput.children.length - 1;
			}
			if(this.currOption > this.selectInput.children.length -1){
				this.currOption = 0;
			}
			if(!this.selectInput.children.length){
				return;
			}
			
			this.activeOption = this.selectInput.children[this.currOption];
			this.activeOption.className = "active";
			this.selectedValue = this.activeOption.innerHTML;
			
			this.activeOption.scrollIntoView(true);
		},
		
		remove: function(){
			this.events.off(this.mousemove);
			this.events.off(this.mouseup);
			this.events.off(this.keyup);
			this.events.off(this.onwheel);
			if(this.el.parentNode){
				this.el.parentNode.removeChild(this.el);
			}
		},
		
		update: function(){
			this.setValue(this.object[this.key], true);
		},
		
		setObject: function(obj, show){
			
			this.object = obj;
			this.update();
			if(show){
				this.show();
			}
		},
		
		getValue: function(){
			return this.object[this.key];
		},
		setValue: function(val, silent){
			if(this.type == "upload"){
				return;
			}
			
			
			
			this.needEnalbe = false;
			var oldValue = this.object[this.key];
			
			if(val < this.min){
				val = this.min;
			}
			
			if(val > this.max){
				val = this.max;
			}
			
			this.object[this.key] = val;
			
			if(typeof val == "number"){
				this.node.nodeValue = parseFloat(val.toFixed(4));
			}
			else if(this.type == "password"){
				var stars = "";
				for(var i=0; i<val.length; i++){
					stars += "&#9679;";
				}
				
				this.value.el.innerHTML = stars;
			}
			else if(this.type == "color"){
				this.span.style.backgroundColor = val;
				this.node.nodeValue = val;
			}
			else{
				this.node.nodeValue = val;
			}
			this.value.style.visibility = "visible";
			if(!silent){
				if(oldValue != val){
					this.emit("change", val, oldValue);
				}
			}
		},
		
		evalValue: function(val){
			if(this.type != "number"){
				return val;
			}
			var ret = null;
			try{
				ret = eval(val);
			}
			catch(e){
				ret = val;
			}
			
			/*if(this.properties.step){
				ret = Math.round(val/this.properties.step)*this.properties.step;
			}*/
			return ret;
		},
		
		setTabIndex: function(val){
			val = val || 1;
			MT.ui.Input.tabindex += val;
			this.value.el.setAttribute("tabindex", MT.ui.Input.tabindex);
			this.input.setAttribute("tabindex", MT.ui.Input.tabindex);
			this.value.el.setAttribute("href", "javascript:;");
			//this.value.el.setAttribute("tabstop", "true");
		}
		
		
		
		
		
		
	}
);
MT.ui.Input.tabindex = 0;



//MT/core/MagicObject.js
MT.namespace('core');
"use strict";
//MT.require("core.mat");

MT(
	MT.core.MagicObject = function(data, parent, map){
		this.data = data;
		this.parent = parent;
		this.map = map;
		this.project = this.map.project;
		this.settings = this.project.plugins.settings;
		this.manager = this.project.plugins.objectmanager;

		this.game = map.game;
		this.isRemoved = false;

		/*
		 * activeHandle
		 * 0 && > 0 - index in handles
		 * -1 - nothing
		 * < -1 - special cases
		 * -2 - move anchor
		 * -3 - rotate
		 */
		this.activeHandle = -1;

		this.handles = [];

		this.mouseInfo = {
			down: false,
			x: 0,
			y: 0
		};

		this.rotator = {
			x: 0,
			y: 0
		};

		this.create();

		this.activeFrame = -1;

		this.activeMovie = "";

		this.tmpData = {
			x: 0,
			y: 0,
			alpha: 1,
			angle: 0,
			scaleX: 1,
			scaleY: 1,
			anchorX: 0,
			anchorY: 0
		};

		// debug only - so we know what is missing
		Object.seal(this);
	},
	{
		radius: 3,
		activeRadius: 5,
		/* interpolation */
		changeMovieFrame: function(movie, frame, skipChildren){
			this.activeMovie = movie;
			this.activeFrame = frame;
			this.loadMovieFrame();

			if(skipChildren){
				return;
			}
			this.changeChildrenMovieFrame(movie, frame);
		},

		changeChildrenMovieFrame: function(movie, frame){
			for(var i=0; i<this.object.children.length; i++){
				this.object.children[i].magic.changeMovieFrame(movie, frame);
			}
		},

		loadMovieFrame: function(){
			if(!this.data.movies){
				return;
			}
			var movie = this.data.movies[this.activeMovie];
			if(!movie){
				return;
			}

			var frameData = movie.frames;
			if(!frameData || frameData.length === 0){
				return;
			}

			var frame;
			var start = frameData[0], end;
			end = frameData[frameData.length-1];
			if(end.keyframe < this.activeFrame){
				this.update(end);
				return;
			}

			for(var i=0; i<frameData.length; i++){
				frame = frameData[i];
				if(frame.keyframe < this.activeFrame){
					start = frame;
				}
				if(frame.keyframe > this.activeFrame){
					end = frame;
					break;
				}
				if(frame.keyframe == this.activeFrame){
					this.update(frame);
					return;
				}
			}
			if(start == end){
				this.update(end);
				return;
			}

			this.prepareInterpolate(start, end);
		},

		prepareInterpolate: function(start, end){
			var t = (this.activeFrame - start.keyframe) / (end.keyframe - start.keyframe);
			var med = this.buildTmpVals(t, start, end);
			this.update(this.tmpData);
		},

		buildTmpVals: function(t, start, end){

			var tmp = this.tmpData;
			if(end.easings == void(0)){
				tmp.x = this.getInt(t, start.x, end.x);
				tmp.y = this.getInt(t, start.y, end.y);

				tmp.angle = this.getInt(t, start.angle, end.angle);
				tmp.alpha = this.getInt(t, start.alpha, end.alpha);

				tmp.scaleX = this.getInt(t, start.scaleX, end.scaleX);
				tmp.scaleY = this.getInt(t, start.scaleY, end.scaleY);
				if(this.data.type != MT.objectTypes.GROUP){
					tmp.anchorX = this.getInt(t, start.anchorX, end.anchorX);
					tmp.anchorY = this.getInt(t, start.anchorY, end.anchorY);
				}
			}
			else{
				tmp.x = this.getInt(t, start.x, end.x, end.easings.x);
				tmp.y = this.getInt(t, start.y, end.y, end.easings.y);

				tmp.angle = this.getInt(t, start.angle, end.angle, end.easings.angle);
				tmp.alpha = this.getInt(t, start.alpha, end.alpha, end.easings.alpha);

				tmp.scaleX = this.getInt(t, start.scaleX, end.scaleX, end.easings.scaleX);
				tmp.scaleY = this.getInt(t, start.scaleY, end.scaleY, end.easings.scaleY);

				if(this.data.type != MT.objectTypes.GROUP){
					tmp.anchorX = this.getInt(t, start.anchorX, end.anchorX, end.easings.anchorX);
					tmp.anchorY = this.getInt(t, start.anchorY, end.anchorY, end.easings.anchorY);
				}
			}
		},

		getInt: function(t, a, b, easing){
			var tfin = t;
			if(easing){
				tfin = this.resolve(easing, t);
			}

			if(isNaN(a) || isNaN(b)){
				return;
			}

			return (1 - tfin) * a + tfin * b;
		},

		resolve: function(ea, t){
			if(ea == "NONE"){
				return 0;
			}
			var sp = ea.split(".");
			var start = Phaser.Easing;
			for(var i=0; i<sp.length && start; i++){
				start = start[sp[i]];
			}

			if(start){
				return start(t);
			}
			return t;
		},
		/* interpolation::end */

		create: function(){
			// fix old groups
			if(this.data.type == void(0)){
				if(this.data.contents){
					this.data.type = MT.objectTypes.GROUP;
				}
			}

			if(this.data.type == MT.objectTypes.GROUP){
				this.createGroup();
			}
			if(this.data.type == MT.objectTypes.SPRITE){
				this.createSprite();
				this.width = this.object.width;
				this.height= this.object.height;
			}
			if(this.data.type == MT.objectTypes.TEXT){
				this.createText();
			}
			if(this.data.type == MT.objectTypes.TILE_LAYER){
				this.createTileLayer();
			}
			this.object.magic = this;
		},

		createTileLayer: function(){

			// hack for phaser - might be problematic if canvas exceeds max bitmap size
			var gm = this.game.width;
			var gh = this.game.height;

			this.game.width = 99999;
			this.game.height = 99999;


			this.createTileMap();
			this.object = this.tilemap.createBlankLayer(this.data.name, this.data.widthInTiles, this.data.heightInTiles, this.data.tileWidth, this.data.tileHeight, this.parent);
			this.object.fixedToCamera = this.data.isFixedToCamera;
			this.map.project.plugins.tools.tools.tiletool.updateLayer(this);
			this.map.tileLayers.push(this.object);
			this.map.resort();

			this.game.width = gm;
			this.game.height = gh;
			if(!this.data.isVisible){
				this.hide();
			}

			this.object.scrollFactorX = 0;
			this.object.scrollFactorY = 0;

		},

		createTileMap: function(){
			var tileWidth = this.data.tileWidth || 64;
			var tileHeight = this.data.tileHeight || 64;
			this.tilemap = this.game.add.tilemap(null, tileWidth, tileHeight, this.data.widthInTiles, this.data.heightInTiles);
		},

		createGroup: function(){
			this.object = this.game.add.group();
			this.appendToParent();
		},

		createSprite: function(){
			if(!this.data.contents){
				this.data.contents = [];
			}
			/*if(!PIXI.BaseTextureCache[this.data.assetId]){
				this.data.assetId = "__missing";
			}*/
			if(this.parent.type == Phaser.GROUP){
				this.object = this.parent.create(this.data.x, this.data.y, this.data.assetId);
			}
			else{
				this.object = this.parent.game.add.sprite(this.data.x, this.data.y, this.data.assetId);

				this.game.world.removeChild(this.object);
				this.appendToParent();

			}

			this.object.inputEnabled = true;
			this.object.input.pixelPerfectOver = true;
			//this.object.input.stop();

			this.createBox();
			this.update();
		},

		createText: function(){
			this.object = this.game.add.text(this.data.x, this.data.y, this.data.text, this.data.style);
			this.appendToParent();
			this.object.inputEnabled = true;
			this.object.input.pixelPerfectOver = false;


			this.createBox();

			this.update();
		},

		appendToParent: function(){
			if(this.parent.type == Phaser.GROUP){
				this.parent.add(this.object);
			}
			else{
				this.parent.addChild(this.object);
			}
		},

		updateText: function(){
			this.object.text = this.data.text;

			if(this.data.style){
				this.object.style = this.data.style;
			}
			else{
				this.data.style = {};
			}
			this.wordWrap = this.data.wordWrap;
			this.wordWrapWidth = this.data.wordWrapWidth;

			this.object.fontSize = this.data.style.fontSize || 32;
			this.object.font = this.data.style.fontFamily || "Arial";
			this.object.fontWeight = this.data.style.fontWeight || "";
			this.object.style.fill = this.fill;

			if(!this.data.shadow){
				this.data.shadow = {};
			}
			this.object.anchor.x = this.data.anchorX;
			this.object.anchor.y = this.data.anchorY;
		},

		updateSprite: function(){
			// sometimes gets deleted - Alt -> click -> delete
			if(!this.object.game){
				return;
			}
			this.object.anchor.x = this.data.anchorX;
			this.object.anchor.y = this.data.anchorY;
			this.object.loadTexture(this.data.assetId);
			this.object.frame = this.data.frame;
		},

		hide: function(){
			this.object.visible = false;
		},
		show: function(){
			this.object.visible = true;
		},
		remove: function(){
			if(this.type == MT.objectTypes.TILE_LAYER){
				this.removeLayer();
			}
			else{
				this.object.destroy();
			}
			this.isRemoved = true;
		},

		createBox: function(){

			this.handles[0] = {
				x: 0,
				y: 0,
				opx: 1,
				opy: 3
			};

			this.handles[1] = {
				x: 0,
				y: 0,
				opx: 0,
				opy: 2
			};

			this.handles[2] = {
				x: 0,
				y: 0,
				opx: 3,
				opy: 1
			};

			this.handles[3] = {
				x: 0,
				y: 0,
				opx: 2,
				opy: 0
			};

			// horizontal handles
			this.handles[4] = {
				x: 0,
				y: 0,
				opx: 6,
				opy: 0
			};

			this.handles[5] = {
				x: 0,
				y: 0,
				opx: 7,
				opy: 7
			};

			this.handles[6] = {
				x: 0,
				y: 0,
				opx: 4,
				opy: 0
			};

			this.handles[7] = {
				x: 0,
				y: 0,
				opx: 2,
				opy: 5
			};

			this.updateBox();
		},

		update: function(data, parent){

			if(data){
				for(var i in data){
					this.data[i] = data[i];
				}

			}

			if(parent && parent != this.parent){
				// remove before
				if(this.parent.type == Phaser.Sprite){
					this.parent.removeChild(this.object);
				}

				if(parent.type == Phaser.GROUP){
					parent.add(this.object, true);
				}
				else{
					parent.addChild(this.object);
				}

				this.parent = parent;
			}

			this.updateBox();


			if(!this.data.isVisible){
				this.hide();
			}
			else{
				this.show();
			}

			if(this.data.type == MT.objectTypes.TEXT){
				this.updateText();
			}

			if(this.data.type == MT.objectTypes.SPRITE){
				this.updateSprite();
			}

			if(this.data.type == MT.objectTypes.TILE_LAYER){
				this.removeLayer();
				this.createTileLayer();
				this.object.visible = this.isVisible;
			}


			this.object.x = this.data.x;
			this.object.y = this.data.y;
			this.object.alpha = this.data.alpha;

			this.object.angle = this.data.angle;

			if(this.data.scaleX){
				this.object.scale.x = this.scaleX;
				this.object.scale.y = this.scaleY;
			}

			this.map.resort();

			if(this.map.activeObject == this){
				this.settings.update();
			}

			this.object.dirty = true;
		},

		updateBox: function(){
			if( this.data.type == MT.objectTypes.TILE_LAYER || !this.map || !this.map.scale){
				return;
			}
			var obj = this.object;
			obj.updateTransform();

			var mat = obj.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;

			var angle = this.getOffsetAngle();
			var x, y, dx, dy;
			var rx = ax;
			var ry = ay - 60;


			if(this.data.type == MT.objectTypes.GROUP){
				if(this.activeHandle != -3){
					this.rotator.x = this.rpx(this.object.rotation, rx, ry, ax, ay);
					this.rotator.y = this.rpy(this.object.rotation, rx, ry, ax, ay);
				}
				return;
			}

			rx = ax;
			ry = ay - this.object.height * this.map.scale.x * 0.6 - 20;


			if(this.activeHandle != 0){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) ;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) ;
				this.rp(angle, x, y, ax, ay, this.handles[0]);
			}

			if(this.activeHandle != 1){
				x = mat.tx + obj.width * (1 - obj.anchor.x) * this.map.scale.x;
				y = mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[1]);
			}

			if(this.activeHandle != 2){
				x = mat.tx + obj.width * (1 - obj.anchor.x) * this.map.scale.x;
				y = mat.ty + obj.height * (1 - obj.anchor.y) * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[2]);
			}

			if(this.activeHandle != 3){
				x = mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x;
				y = mat.ty + obj.height * (1 - obj.anchor.y) * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[3]);
			}
			// sides
			// left
			//if(this.activeHandle != 4){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) ;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) + obj.height*0.5 * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[4]);
			//}

			// right
			if(this.activeHandle != 6){
				x = mat.tx + obj.width * (1 - obj.anchor.x) * this.map.scale.x;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) + obj.height*0.5 * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[6]);
			}

			// top
			if(this.activeHandle != 5){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) + obj.width*0.5 * this.map.scale.x;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) ;
				this.rp(angle, x, y, ax, ay, this.handles[5]);
			}
			// bottom
			if(this.activeHandle != 7){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) + obj.width*0.5 * this.map.scale.x;
				y = mat.ty + obj.height * (1 - obj.anchor.y) * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[7]);
			}



			if(this.activeHandle != -3){
				this.rotator.x = this.rpx(this.object.rotation, rx, ry, ax, ay);
				this.rotator.y = this.rpy(this.object.rotation, rx, ry, ax, ay);
			}
		},

		highlight: function(ctx){
			if(this.isRemoved || !this.isVisible){
				return;
			}
			var mat = this.object.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;
			ctx.save();
			ctx.translate(0.5, 0.5);

			ctx.strokeStyle = "#ffaa00";

			if(this.data.type == MT.objectTypes.GROUP){
				if(this.activeHandle != -3){
					var rx = ax;
					var ry = ay - 60;

					this.rotator.x = this.rpx(this.object.rotation, rx, ry, ax, ay);
					this.rotator.y = this.rpy(this.object.rotation, rx, ry, ax, ay);
				}

				var bounds = this.object.getBounds();
				ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
				this.drawGroupHandle(ctx, this.object);

				if(this.map.activeObject == this){
					ctx.strokeStyle = "#ffee22";

					// rotate
					ctx.beginPath();
					if(this.activeHandle == -3){
						ctx.arc(this.rotator.x, this.rotator.y, this.activeRadius, 0, 2*Math.PI);

					}
					else{
						ctx.arc(this.rotator.x, this.rotator.y, this.radius, 0, 2*Math.PI);
					}
					grd = ctx.createRadialGradient(this.rotator.x, this.rotator.y, 0, this.rotator.x, this.rotator.y, this.radius);
					grd.addColorStop(0,"rgba(255, 255, 255, 0)");
					grd.addColorStop(1,"rgba(0, 70, 70, 1)");
					ctx.fillStyle = grd;

					ctx.fill();
					ctx.stroke();
				}



				ctx.restore();
				return;
			}

			if(this.data.type == MT.objectTypes.TILE_LAYER){

				var bounds = this.object.getBounds();
				ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
				this.drawGroupHandle(ctx, this.parent);
				ctx.restore();
				return;
			}

			/*if(this.data.type == MT.objectTypes.TEXT){
				var bounds = this.object.getBounds();
				ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
				this.drawGroupHandle(ctx, this.object.parent);

				this.updateBox();

				ctx.restore();
				return;
			}*/

			this.drawGroupHandle(ctx, this.parent);
			this.updateBox();

			var h1 = this.handles[0];

			ctx.beginPath();
			ctx.moveTo(h1.x, h1.y);

			var h, grd;
			for(var i=1; i<4; i++){
				h = this.handles[i];
				ctx.lineTo(h.x, h.y);
			}

			ctx.lineTo(h1.x, h1.y);
			ctx.stroke();

			if(this.map.activeObject == this){
				ctx.strokeStyle = "#ff0000";

				ctx.fillStyle = grd;//"rgba(255,255,255,0.1)";
				for(var i=0; i<this.handles.length; i++){
					h = this.handles[i];

					ctx.beginPath();

					if(this.activeHandle == i){
						ctx.arc(h.x, h.y, this.activeRadius, 0, 2*Math.PI);
					}
					else{
						ctx.arc(h.x, h.y, this.radius, 0, 2*Math.PI);
					}
					grd = ctx.createRadialGradient(h.x, h.y, 0, h.x,h.y, this.radius);
					grd.addColorStop(0,"rgba(255, 255, 255, 0)");
					grd.addColorStop(1,"rgba(0, 70, 70, 1)");
					ctx.fillStyle = grd;

					ctx.fill();
					ctx.stroke();
				}


				ctx.strokeStyle = "#ffee22";

				// rotate
				ctx.beginPath();
				if(this.activeHandle == -3){
					ctx.arc(this.rotator.x, this.rotator.y, this.activeRadius, 0, 2*Math.PI);

				}
				else{
					ctx.arc(this.rotator.x, this.rotator.y, this.radius, 0, 2*Math.PI);
				}
				grd = ctx.createRadialGradient(this.rotator.x, this.rotator.y, 0, this.rotator.x, this.rotator.y, this.radius);
				grd.addColorStop(0,"rgba(255, 255, 255, 0)");
				grd.addColorStop(1,"rgba(0, 70, 70, 1)");
				ctx.fillStyle = grd;

				ctx.fill();
				ctx.stroke();

				// connect anchor and rotator
				ctx.beginPath();
				ctx.moveTo(this.rotator.x, this.rotator.y);
				ctx.lineTo(ax, ay);
				ctx.stroke();


				// anchor
				ctx.strokeStyle = "#000000";
				ctx.beginPath();
				if(this.activeHandle == -2){
					ctx.arc(ax, ay, this.activeRadius, 0, 2*Math.PI);
				}
				else{
					ctx.arc(ax, ay, this.radius, 0, 2*Math.PI);
				}
				grd = ctx.createRadialGradient(ax, ay, 0, ax, ay, this.radius);
				grd.addColorStop(0,"rgba(255, 255, 255, 0)");
				grd.addColorStop(1,"rgba(0, 70, 70, 1)");
				ctx.fillStyle = grd;

				ctx.fill();
				ctx.stroke();
			}

			ctx.restore();

		},
		drawGroupHandle: function(ctx, obj){
			var mat = obj.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;

			var dx = 0;
			var dy = - this.radius*3;

			ctx.save();
			ctx.translate(ax, ay);
			ctx.rotate(obj.rotation);

			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = 1.5;

			ctx.strokeRect(- this.radius + 0.5, - this.radius + 0.5, this.radius*2, this.radius * 2);
			ctx.beginPath();
			ctx.moveTo(0.5, 0.5);
			ctx.lineTo(dx + 0.5, dy + 0.5);
			ctx.stroke();

			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 1;
			ctx.strokeRect(- this.radius, - this.radius, this.radius*2, this.radius * 2);
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(dx, dy);
			ctx.stroke();


			ctx.restore();
		},
		mouseDown: function(x, y, e){
			this.mouseInfo.down = true;
			this.mouseInfo.x = x;
			this.mouseInfo.y = y;

			if(this.activeHandle != -1){
				//document.body.style.cursor = "none";
			}
		},

		mouseUp: function(e){
			this.mouseInfo.down = false;
			//document.body.style.cursor = "auto";
		},

		mouseMove: function(x, y, e){
			var mi = this.mouseInfo;

			if(!this.isVisible){
				return;
			}

			if(this.type == MT.objectTypes.TILE_LAYER){
				var tools = this.map.project.plugins.tools;
				if(tools.activeTool == tools.tools.tiletool){
					tools.tools.tiletool.mouseMove(e);
					return;
				}
			}

			if(this.mouseInfo.down){
				if(this.activeHandle != -1){
					this.moveHandle(x, y, e);
				}
				else{
					this.moveObject(x, y, e);
				}
				return;
			}

			mi.x = x;
			mi.y = y;


			this.updateBox();
			var dx, dy, h;
			var mat = this.object.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;

			dx = Math.abs(ax - x);
			dy = Math.abs(ay - y);

			var rad = this.radius;

			if(this.activeHandle == -2){
				rad = this.activeRadius;
			}
			if(dx < rad && dy < rad){
				this.activeHandle = -2;
				return;
			}

			rad = this.radius;

			dx = Math.abs(this.rotator.x - x);
			dy = Math.abs(this.rotator.y - y);

			if(this.activeHandle == -3){
				rad = this.activeRadius;
			}

			if(dx < rad && dy < rad){
				this.activeHandle = -3;
				return;
			}

			for(var i=0; i<this.handles.length; i++){
				rad = this.radius;
				h = this.handles[i];

				dx = Math.abs(h.x - x);
				dy = Math.abs(h.y - y);

				if(this.activeHandle == i){
					rad = this.activeRadius;
				}

				if(dx < rad && dy < rad){
					this.activeHandle = i;
					return;
				}
			}
			this.activeHandle = -1;
			this.updateBox();
		},

		moveObject: function(x, y, e){
			var mi = this.mouseInfo;
			var dx = (mi.x - x) / this.map.scale.x;
			var dy = (mi.y - y) / this.map.scale.y;
			var angle = this.getParentAngle();

			var invX = this.offsetScaleX();

			if(invX < 0){
				dx *= -1;
			}

			if(this.offsetScaleY() < 0){
				dy *= -1;
			}

			var dxt = this.rpx(-angle, dx, dy, 0, 0);
			var dyt = this.rpy(-angle, dx, dy, 0, 0);



			this.x -= dxt;
			mi.x = x;

			this.y -= dyt;
			mi.y = y;

			if(e.ctrlKey && angle % Math.PI*2 == 0){
				var gx = this.map.settings.gridX;
				var gy = this.map.settings.gridY;

				var tx = Math.round(this.x / gx) * gx;
				var ty = Math.round(this.y / gy) * gy;

				if(invX > 0){
					mi.x += (tx - this.x) * this.map.scale.x;
				}
				else{
					mi.x -= (tx - this.x) * this.map.scale.x;
				}
				mi.y += (ty - this.y) * this.map.scale.x;

				this.x = tx;
				this.y = ty;

			}


			this.update();
		},

		moveHandle: function(x, y, e){

			var mi = this.mouseInfo;
			var obj = this.object;
			var mat = obj.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;

			var angle = this.getOffsetAngle();

			var h, dx, dy;

			dx = mi.x - x;
			dy = mi.y - y;
			// rotate
			if(this.activeHandle == -3){

				this.rotator.x -= dx;
				this.rotator.y -= dy;


				var rot = Math.atan2( mat.ty - this.rotator.y, mat.tx - this.rotator.x) - Math.PI * 0.5;

				var diff = rot - Phaser.Math.degToRad(this.angle);

				mi.x = x;
				mi.y = y;

				while(diff > Math.PI){
					diff = diff - Math.PI*2;
				}
				while(diff < -Math.PI){
					diff = Math.PI*2 + diff;
				}
				this.angle += Phaser.Math.radToDeg(diff);

				if(e.ctrlKey){
					this.data.angle = Math.round(this.data.angle / 15)*15;
				}

				this.update();
				return;
			}

			// move anchor
			if(this.activeHandle == -2){

				if(this.data.type == MT.objectTypes.GROUP){
					dx /= this.map.scale.x
					dy /= this.map.scale.x

					var sx = this.x;
					var sy = this.y;

					this.moveObject(x, y, e);

					dx = sx - this.x;
					dy = sy - this.y;


					var o;
					var rx = this.rpx(-this.object.rotation, dx , dy, 0, 0);
					var ry = this.rpy(-this.object.rotation, dx, dy, 0, 0);

					for(var i=0; i<this.object.children.length; i++){
						o = this.object.children[i].magic;
						o.move(o.x + rx, o.y + ry);
					}
					return;
				}


				var sx = this.anchorX;
				var sy = this.anchorY;

				this.translateAnchor(-dx, -dy);
				mi.x = x;
				mi.y = y;


				if(e.ctrlKey){
					this.moveAnchor(Math.round(this.anchorX * 10) * 0.1, Math.round(this.anchorY * 10) * 0.1);
						var angle = this.getOffsetAngle();

						var ddx = this.width * (this.anchorX - sx) * this.map.scale.x;
						var ddy = this.height * (this.anchorY - sy) * this.map.scale.y;

						var drx = this.rpx(angle, ddx, ddy, 0, 0);
						var dry = this.rpy(angle, ddx, ddy, 0, 0);

						mi.x = x + dx + drx;
						mi.y = y + dy + dry;

				}
				this.update();
				return;
			}


			dx = mi.x - x;
			dy = mi.y - y;
			h = this.handles[this.activeHandle];


			var dw = this.handles[h.opx];
			var dh = this.handles[h.opy];

			var sigX, sigY;

			var tx = this.rpx(-angle, h.x, h.y, ax, ay);
			var ty = this.rpy(-angle, h.x, h.y, ax, ay);

			var wtx = this.rpx(-angle, dw.x, dw.y, ax, ay);
			var wty = this.rpy(-angle, dw.x, dw.y, ax, ay);

			var htx = this.rpx(-angle, dh.x, dh.y, ax, ay);
			var hty = this.rpy(-angle, dh.x, dh.y, ax, ay);


			sigX = (wtx - tx) > 0 ? 1 : -1;
			sigY = (hty - ty) > 0 ? 1 : -1;
			if(this.activeHandle < 4){
				h.x -= dx;
				h.y -= dy;

				var pWidth = this.width;
				var pHeight = this.height;

				var nWidth = Math.sqrt(Math.pow(dw.x - h.x, 2) + Math.pow(dw.y - h.y, 2)) / this.map.scale.x;
				var nHeight = Math.sqrt(Math.pow(dh.x - h.x, 2) + Math.pow(dh.y - h.y, 2)) / this.map.scale.y;


				if(this.activeHandle == 1 || this.activeHandle == 2){
					sigX *= -1;
				}

				if(this.activeHandle == 2 || this.activeHandle == 3){
					sigY *= -1;
				}


				this.width = nWidth;
				this.scaleX = this.object.scale.x * sigX;

				this.scaleY = this.object.scale.y * sigY;
				this.height = nHeight;

				this.updateBox();
				if(e.ctrlKey){
					this.scaleX = Math.round(this.scaleX/0.1)*0.1;
					this.scaleY = Math.round(this.scaleY/0.1)*0.1;
				}

				if(e.shiftKey){
					this.scaleX = this.scaleY;
				}
			}
			else{
				// side handles
				/*
				 * 4 - left
				 * 5 - top
				 * 6 - right
				 * 7 - bottom
				 */
				if(this.activeHandle == 4 && this.anchorX == 0){
					return;
				}
				if(this.activeHandle == 5 && this.anchorY == 0){
					return;
				}
				if(this.activeHandle == 6 && this.anchorX == 1){
					return;
				}
				if(this.activeHandle == 7 && this.anchorY == 1){
					return;
				}


				if(this.activeHandle % 2 == 0){
					if(this.activeHandle == 6){
						sigX *= -1;
					}
					h.x -= dx;
					h.y -= dy;

					var width = sigX * Math.sqrt(Math.pow(dw.x - h.x, 2) + Math.pow(dw.y - h.y, 2)) / this.map.scale.x;

					if(this.data.type == MT.objectTypes.TEXT && this.data.wordWrap){

						this.wordWrapWidth = Math.round(width);
					}
					else{
						this.width = width;
					}
					//this.height = sigY * Math.sqrt(Math.pow(dh.x - h.x, 2) + Math.pow(dh.y - h.y, 2)) / this.map.scale.y;

					this.scaleX = this.object.scale.x;
					//this.scaleY = this.object.scaleY;

					this.updateBox();

					if(e.ctrlKey){
						this.scaleX = Math.round(this.scaleX/0.1)*0.1;
					}

					if(e.shiftKey){
						this.scaleY = this.scaleX;
					}


					this.data.scaleX = this.object.scale.x;
					this.updateBox();
				}
				else{
					h.y -= dy;
					h.x -= dx;
					if(this.activeHandle == 7){
						sigY *= -1;
					}

					//this.width = sigX * Math.sqrt(Math.pow(dw.x - h.x, 2) + Math.pow(dw.y - h.y, 2)) / this.map.scale.x;
					this.height = sigY * Math.sqrt(Math.pow(dh.x - h.x, 2) + Math.pow(dh.y - h.y, 2)) / (this.map.scale.y);

					//this.scaleX = this.object.scaleX;
					this.scaleY = this.object.scale.y;

					this.updateBox();

					if(e.ctrlKey){
						//this.scaleX = Math.round(this.scaleX/0.1)*0.1;
						this.scaleY = Math.round(this.scaleY/0.1)*0.1;
					}

					if(e.shiftKey){
						this.scaleX = this.object.scale.x;
					}


					this.data.scaleY = this.object.scale.y;
					this.updateBox();
				}
			}

			mi.x = x;
			mi.y = y;
			this.update();
		},

		bringToTop: function(){
			this.parent.bringToTop(this.object);
		},

		moveAnchor: function(ax, ay){
			var sx = this.width * this.anchorX;
			var sy = this.height * this.anchorY;

			var parrot = this.getOffsetAngle() - this.getParentAngle();

			this.anchorX = ax;
			this.anchorY = ay;


			var dx = this.width *ax - sx;
			var dy = this.height *ay - sy;


			this.x += this.rpx(parrot, dx, dy, 0, 0);
			this.y += this.rpy(parrot, dx, dy, 0, 0);
		},

		translateAnchor: function(x, y){

			var angle = this.getOffsetAngle();
			var rot = this.object.rotation;
			var mat = this.object.worldTransform;
			var parrot = this.getParentAngle();

			var dxrt =  -x;
			var dyrt =  -y;

			this.object.rotation -= angle;


			this.updateBox();

			var h = this.handles[0];

			var dxr = this.rpx(-parrot, dxrt, dyrt, 0, 0);
			var dyr = this.rpy(-parrot, dxrt, dyrt, 0, 0);

			var dx = this.rpx(-rot, dxr, dyr, 0, 0);
			var dy = this.rpy(-rot, dxr, dyr, 0, 0);

			var hx = h.x;
			var hy = h.y;

			var adx = mat.tx - dx;
			var nax = (adx - hx)/(this.object.width * this.map.scale.x);

			var ady = mat.ty - dy;
			var nay = (ady - hy)/(this.object.height * this.map.scale.x);

			var anx = this.anchorX;
			var any = this.anchorY;

			this.anchorX = nax;
			this.anchorY = nay;

			var nx = (nax - anx) * this.object.width;
			var ny = (nay - any) * this.object.height;

			this.x += this.rpx(rot, nx, ny, 0, 0);
			this.y += this.rpy(rot, nx, ny, 0, 0);

			this.object.rotation = rot;

			this.update();
		},


		move: function(x, y){
			var angle = this.getParentAngle();
			this.x = x;
			this.y = y;
		},

		rpx: function(angle, x, y, cx, cy){

			var sin = Math.sin(angle);
			var cos = Math.cos(angle);

			return (x - cx)*cos - (y - cy)*sin + cx;
		},

		rpy: function(angle, x, y, cx, cy){
			var sin = Math.sin(angle);
			var cos = Math.cos(angle);

			return (y - cy)*cos + (x - cx)*sin + cy;
		},

		rp: function(angle, x, y, cx, cy, ref){
			var sin = Math.sin(angle);
			var cos = Math.cos(angle);
			ref.x = (x - cx)*cos - (y - cy)*sin + cx;
			ref.y = (y - cy)*cos + (x - cx)*sin + cy;
		},

		getOffsetAngle: function(){
			return this.object.rotation + this.getParentAngle();
		},

		offsetScaleX: function(){
			var par = this.object.parent;
			var scale = 1;
			while(par){
				scale *= par.scale.x;
				par = par.parent;
			}
			return scale;
		},
		offsetScaleY: function(){
			var par = this.object.parent;
			var scale = 1;
			while(par){
				scale *= par.scale.y;
				par = par.parent;
			}
			return scale;
		},
		getParentAngle: function(){
			var par = this.object.parent;
			var angle = 0;
			while(par){
				angle += par.rotation;
				par = par.parent;
			}
			return angle;
		},

		hasParent: function(parent){
			var p = parent.object;
			var t = this.object.parent;
			while(t){
				if(t == p){
					return true;
				}
				t = t.parent;
			}
			return false;
		},

		putTile: function(id, x, y){
			this.object.map.putTile(id, x, y, this.object);
			//layer.tilemap.putTile(id, x, y, layer.object);
		},
		getTile: function(x, y, tile){
			return this.object.map.getTileWorldXY(x, y, void(0), void(0), this.object);
		},

		get isHidden(){
			return this.object.visible;
		},

		set x(x){
			if(isNaN(x)){
				return;
			}
			if(this.data.x == x){
				return;
			}
			if(this.project.data.roundPosition){
				x = Math.floor(x);
			}
			this.object.x = x;
			this.data.x = x;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);

		},
		get x(){
			return this.data.x || 0;
		},

		set y(y){
			if(isNaN(y)){
				return;
			}
			if(this.data.y == y){
				return;
			}
			if(this.project.data.roundPosition){
				y = Math.floor(y);
			}
			this.object.y = y;
			this.data.y = y;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get y(){
			return this.data.y;
		},

		set angle(val){
			if(this.data.angle == val){
				return;
			}
			if(isNaN(val)){
				return;
			}
			this.object.angle = val;
			this.data.angle = val;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get angle(){
			return this.data.angle;
		},

		set anchorX(val){
			if(this.data.anchorX == val){
				return;
			}
			this.object.anchor.x = val || 0;
			this.data.anchorX = this.object.anchor.x;
			this.data.width = this.object.width;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get anchorX(){
			return this.data.anchorX || 0;
		},

		set anchorY(val){
			if(this.data.anchorY == val){
				return;
			}
			this.object.anchor.y = val || 0;
			this.data.anchorY = val;
			this.data.height = this.object.height;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get anchorY(){
			return this.data.anchorY || 0;
		},

		set width(val){
			val = parseFloat(val);
			if(isNaN(val)){
				return;
			}
			if(this.data.width == val){
				return;
			}

			this.object.width = val;
			this.data.width = val;
			this.data.scaleX = this.object.scale.x;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get width(){
			return this.data.width;
		},
		set height(val){
			val = parseFloat(val);
			if(isNaN(val)){
				return;
			}
			if(this.data.height == val){
				return;
			}

			this.object.height = val;
			this.data.height = val;
			this.data.scaleY = this.object.scale.y;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get height(){
			return this.data.height;
		},

		set scaleX(val){
			val = parseFloat(val);
			if(isNaN(val)){
				return;
			}

			if(this.data.scaleX == val){
				return;
			}
			this.object.scale.x = val;
			this.data.scaleX = val;
			this.updateBox();
			this.data.width = this.object.width;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get scaleX(){
			return this.data.scaleX;
		},

		set scaleY(val){
			val = parseFloat(val);
			if(isNaN(val)){
				return;
			}

			if(this.data.scaleY == val){
				return;
			}
			this.object.scale.y = val;
			this.data.scaleY = val;
			this.updateBox();
			this.data.height = this.object.height;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get scaleY(){
			return this.data.scaleY;
		},

		get assetId(){
			return this.data.assetId;
		},

		set assetId(id){
			/*if(isNaN(this.data.assetId)){
				throw new Error("Err");
			}*/

			if(this.data.assetId == id){
				return;
			}
			this.data.assetId = id;
			this.object.loadTexture(id);
			
			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},

		set alpha(val){
			if(this.data.alpha == val){
				return;
			}
			if(isNaN(val)){
				return;
			}
			this.object.alpha = val;
			this.data.alpha = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get alpha(){
			return this.data.alpha == void(0) ? 1 : this.data.alpha;
		},

		set frame(val){
			if(this.data.frame == val){
				return;
			}
			this.data.frame = val;
			this.object.frame = val;

			var frameData = this.map.game.cache.getFrameData(this.assetId);//_images[this.assetId];
			if(frameData.total > 1){
				this.data.frameName = frameData.getFrame(val).name;
			}
			else{
				delete this.data.frameName;
			}

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get frame(){
			if(this.data.frameName){
				var frameData = this.map.game.cache.getFrameData(this.assetId);
				var frame = frameData.getFrameByName(this.data.frameName);
				if(frame && this.data.frame != frame.index){
					console.log("Frame changed by name!");
					this.frame = frame.index;
				}

				return this.data.frame;
			}


			return this.data.frame;
		},

		set isFixedToCamera(val){
			if(this.data.isFixedToCamera == val){
				return;
			}
			this.object.fixedToCamera = val;
			this.data.isFixedToCamera = val;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get isFixedToCamera(){
			return this.data.isFixedToCamera;
		},

		/* text */
		set wordWrapWidth(val){
			if(this.data.wordWrapWidth == val){
				return;
			}
			this.object.wordWrapWidth = val;
			this.data.wordWrapWidth = val;
			this.updateBox();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get wordWrapWidth(){
			return this.data.wordWrapWidth || 100;
		},

		set wordWrap(val){
			if(this.data.wordWrap == val){
				return;
			}
			this.data.wordWrap = val;
			this.object.wordWrap = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get wordWrap(){
			return this.data.wordWrap;
		},

		set style(val){
			return;
			this.data.style = val;
			this.object.style = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get style(){
			return this.data.style || {};
		},

		set font(val){
			if(this.data.style.font == this.object.font){
				return;
			}
			this.object.font = val;
			this.data.style.font = this.object.font;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},

		get font(){
			return this.object.style.font;
		},

		set fontFamily(val){
			if(this.data.style.fontFamily == val){
				return;
			}
			this.object.font = val;
			this.data.style.fontFamily = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get fontFamily(){
			return this.data.style.fontFamily;

		},

		set fontWeight(val){
			if(this.data.style.fontWeight == val){
				return;
			}

			this.object.fontWeight = val;
			this.data.style.fontWeight = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get fontWeight(){
			return this.data.style.fontWeight;
		},
		set fontSize(val){
			if(this.data.style.fontSize == val){
				return;
			}

			var scaleX = this.object.scale.x;
			var scaleY = this.object.scale.y;

			this.object.fontSize = parseInt(val);
			this.data.style.fontSize = this.object.fontSize;

			this.scaleX = scaleX;
			this.scaleY = scaleY;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get fontSize(){
			if(!this.data.style.fontSize){
				this.data.style.fontSize = this.object.fontSize;
			}
			return this.data.style.fontSize;
		},

		set align(val){
			if(this.data.align == val){
				return;
			}
			this.data.align = val;
			this.object.align = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},

		get align(){
			return this.data.align;
		},

		set fill(val){
			if(this.data.fill == val){
				return;
			}
			this.object.fill = val;
			this.data.fill = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get fill(){
			return this.data.fill || "#000000";
		},

		set stroke(val){
			if(this.data.stroke == val){
				return;
			}
			this.object.stroke = val;
			this.data.stroke = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get stroke(){
			return this.data.stroke || "#000000";
		},

		set strokeThickness(val){
			if(this.data.strokeThickness == val){
				return;
			}
			this.object.strokeThickness = val;
			this.data.strokeThickness = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},

		get strokeThickness(){
			return this.data.strokeThickness || 0;
		},

		setShadow: function(x, y, color, blur){
			if(!this.data.shadow){
				this.data.shadow = {};
			}
			else{
				if(this.data.shadow.x == x && this.data.shadow.y == y &&
					this.data.shadow.color == color && this.data.shadow.blur == blur){
					return;
				}
			}
			this.data.shadow.x = x;
			this.data.shadow.y = y;
			this.data.shadow.color = color;
			this.data.shadow.blur = blur;

			this.object.setShadow(x, y, color, blur);

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},

		get shadowColor(){
			return this.data.shadow.color || "#000000";
		},
		get shadowOffsetX(){
			return this.data.shadow.x || 0;
		},
		get shadowOffsetY(){
			return this.data.shadow.y || 0;
		},
		get shadowBlur(){
			return this.data.shadow.blur || 0;
		},


		set text(val){
			if(this.object.text == val){
				return;
			}
			this.object.text = val;
			this.data.text = val;

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get text(){
			return this.data.text;
		},

		/* tilelayer */

		set widthInTiles(val){
			if(this.data.widthInTiles == val){
				return;
			}
			this.data.widthInTiles = val;
			this.removeLayer();
			this.createTileLayer();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get widthInTiles(){
			return this.data.widthInTiles;
		},
		set heightInTiles(val){
			if(this.data.heightInTiles == val){
				return;
			}
			this.data.heightInTiles = val;
			this.removeLayer();
			this.createTileLayer();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get heightInTiles(){
			return this.data.heightInTiles;
		},
		set tileWidth(val){
			if(this.data.tileWidth == val){
				return;
			}
			this.data.tileWidth = val;
			this.removeLayer();
			this.createTileLayer();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get tileWidth(){
			return this.data.tileWidth;
		},
		set tileHeight(val){
			if(this.data.tileHeight == val){
				return;
			}
			this.data.tileHeight = val;
			this.removeLayer();
			this.createTileLayer();

			this.manager.emit(MT.OBJECT_UPDATED_LOCAL, this);
		},
		get tileHeight(){
			return this.data.tileHeight;
		},
		getTileXY: function(x, y, point){
			return this.object.getTileXY(x, y, point);
		},
		removeLayer: function(){
			this.object.destroy();
			var i = this.map.tileLayers.indexOf(this.object);
			this.map.tileLayers.splice(i, 1);
		},

		get isVisible(){
			var o = this;
			while(o.parent.magic){
				if(!o.data.isVisible){
					return false;
				}
				o = o.parent.magic;
			}

			return o.data.isVisible;
		},

		get isLocked(){
			if(this.data.isLocked){
				return true;
			}
			var o = this.parent.magic;
			while(o){
				if(o.data.isLocked){
					return true;
				}
				o = o.parent.magic;
			}

			return false;
		},

		get id(){
			return this.data.id;
		},

		get type(){
			return this.data.type;
		},

		getBounds: function(){
			return this.object.getBounds();
		},

		_mapSettings: {},
		get mapSettings(){
			if(this.data.type != MT.objectTypes.TILE_LAYER){
				return null;
			}
			else{
				this._mapSettings.gridX = this.tileWidth;
				this._mapSettings.gridY = this.tileHeight;
				this._mapSettings.gridOffsetX = this.x;
				this._mapSettings.gridOffsetY = this.y;
			}
		}

	}
);

//MT/core/Selector.js
MT.namespace('core');
MT.extend("core.Emitter")(
	MT.core.Selector = function(){
		this._selected = [];
	},
	{
		add: function(obj, silent){
			if(obj === void(0)){
				return;
			}
			if(!this.is(obj)){
				this._selected.push(obj);
				if(!silent){
					this.emit("select", obj);
				}
			}
			
			
		},
		
		get count(){
			return this._selected.length;
		},
		
		remove: function(obj){
			var o = null;
			for(var i=0; i<this._selected.length; i++){
				if(this._selected[i] == obj){
					this.emit("unselect", obj);
					this._selected.splice(i, 1);
					return;
				}
			}
		},
		
		is: function(obj){
			for(var i=0; i<this._selected.length; i++){
				if(this._selected[i] == obj){
					return true;
				}
			}
			return false;
		},
		
		get min(){
			return Math.min.apply(Math, this._selected);
		},
		get max(){
			return Math.max.apply(Math, this._selected);
		},
		forEach: function(cb, scope){
			if(!this._selected){
				return;
			}
			var last = false;
			for(var i=0; i<this._selected.length; i++){
				if(i == this._selected.length - 1){
					last = true;
				}
				if(scope){
					cb.call(scope, this._selected[i], last);
				}
				else{
					cb(this._selected[i], last);
				}
			}
		},
		
		sortAsc: function(){
			this._selected.sort();
		},
		
		clear: function(){
			for(var i=0; i<this._selected.length; i++){
				this.emit("unselect", this._selected[i]);
			}
			this._selected.length = 0;
			this.emit("clear");
		},
		
		get: function(index){
			return this._selected[index];
		},
		
		sort: function(cb){
			this._selected.sort(cb);
		}
		
		
		
	}
);
//MT/core/Helper.js
MT.namespace('core');
/* small useful functions collected over the net */
"use strict";
MT.namespace("core");
MT(
	MT.core.Helper = function(){

	},
	{
		isImage: function(path){
			var ext = this.getExt(path);
			return (ext == "png" || ext == "jpg" || ext == "gif" || ext == "jpeg");
		},
		
		// default upload - managed by source editor
		isSource: function(path){
			return !this.isImage(path);
		},
   
		isFont: function(path){
			var ext = this.getExt(path);
			return (ext == "ttf" || ext == "otf" || ext == "eot" || ext == "woff" || ext == "woff2");
		},
   
		htmlEntities: function(str) {
			return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		},
   
		isAudio: function(path){
			var ext = this.getExt(path);
			return (ext == "mp3" || ext == "wav" || ext == "ogg" || ext == "aac");
		},
   
		getExt: function(path){
			return path.split(".").pop().toLowerCase();
		},

		strToBuff: function(str) {
			var buf = new ArrayBuffer(str.length * 2);
			var bufView = new Uint16Array(buf);
			for (var i = 0; i < str.length; i++) {
				bufView[i] = str.charCodeAt(i);
			}
			return buf;
		},
		select: function(el) {
			var range = document.createRange();
			range.selectNodeContents(el);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		},
		clearSelection: function(){
			window.getSelection().removeAllRanges();
		},
		uuid: function(){
			var d = new Date().getTime();
			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = (d + Math.random()*16)%16 | 0;
				d = Math.floor(d/16);
				return (c=='x' ? r : (r&0x3|0x8)).toString(16);
			});
			return uuid;
		},
		setCookie: function(cname, cvalue, exdays){
			var expires = "";
			if(exdays){
				var d = new Date();
				d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
				var expires = "expires="+d.toUTCString();
			}
			
			document.cookie = cname + "=" + cvalue + "; " + expires;
		},
		getCookie: function(cname){
			var name = cname + "=";
			var ca = document.cookie.split(';');
			for(var i=0; i<ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1);
				if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
			}
			return "";
		},
   
		updateObject: function(obj, data){
			for(var i in data){
				if(typeof data[i] == "object"){
					if(obj[i] == void(0)){
						obj[i] = data[i];
					}
					else{
						this.updateObject(obj[i], data[i]);
					}
				}
				else{
					obj[i] = data[i];
				}
			}
		},
   
		loadSwf: function(url, parent){
			parent = parent || document.body;
			var objElement = document.createElement('object');
			objElement.setAttribute('type', 'application/x-shockwave-flash');
			objElement.setAttribute('data', url);
			parent.appendChild(objElement);
			
			return objElement;
		},
		
		dowload: function(title, content){
			var a = document.createElement("a");
			var b = new Blob([content]);
			a.style.cssText = "position: fixed; top - 1000";
			a.download = title;
			a.href = window.URL.createObjectURL(b);
			
			document.body.appendChild(a);
			
			a.click();
			
			document.body.removeChild(a);
		},
   
	}
);
(function(){
/* A JavaScript implementation of the Secure Hash Algorithm, SHA-256
 * Version 0.3 Copyright Angel Marin 2003-2004 - http://anmar.eu.org/
 * Distributed under the BSD License
 * Some bits taken from Paul Johnston's SHA-1 implementation
 */
var chrsz = 16; /* bits per input character. 8 - ASCII; 16 - Unicode */
function safe_add (x, y) {
	var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	return (msw << 16) | (lsw & 0xFFFF);
}
function S (X, n) {return ( X >>> n ) | (X << (32 - n));}
function R (X, n) {return ( X >>> n );}
function Ch(x, y, z) {return ((x & y) ^ ((~x) & z));}
function Maj(x, y, z) {return ((x & y) ^ (x & z) ^ (y & z));}
function Sigma0256(x) {return (S(x, 2) ^ S(x, 13) ^ S(x, 22));}
function Sigma1256(x) {return (S(x, 6) ^ S(x, 11) ^ S(x, 25));}
function Gamma0256(x) {return (S(x, 7) ^ S(x, 18) ^ R(x, 3));}
function Gamma1256(x) {return (S(x, 17) ^ S(x, 19) ^ R(x, 10));}
function core_sha256 (m, l) {
		var K = new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);
		var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
		var W = new Array(64);
		var a, b, c, d, e, f, g, h, i, j;
		var T1, T2;
		/* append padding */
		m[l >> 5] |= 0x80 << (24 - l % 32);
		m[((l + 64 >> 9) << 4) + 15] = l;
		for ( var i = 0; i<m.length; i+=16 ) {
				a = HASH[0]; b = HASH[1]; c = HASH[2]; d = HASH[3]; e = HASH[4]; f = HASH[5]; g = HASH[6]; h = HASH[7];
				for ( var j = 0; j<64; j++) {
						if (j < 16) W[j] = m[j + i];
						else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
						T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
						T2 = safe_add(Sigma0256(a), Maj(a, b, c));
						h = g; g = f; f = e; e = safe_add(d, T1); d = c; c = b; b = a; a = safe_add(T1, T2);
				}
				HASH[0] = safe_add(a, HASH[0]); HASH[1] = safe_add(b, HASH[1]); HASH[2] = safe_add(c, HASH[2]); HASH[3] = safe_add(d, HASH[3]); HASH[4] = safe_add(e, HASH[4]); HASH[5] = safe_add(f, HASH[5]); HASH[6] = safe_add(g, HASH[6]); HASH[7] = safe_add(h, HASH[7]);
		}
		return HASH;
}
function str2binb (str) {
	var bin = Array();
	var mask = (1 << chrsz) - 1;
	for(var i = 0; i < str.length * chrsz; i += chrsz)
		bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
	return bin;
}
function binb2hex (binarray) {
	var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase */
	var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	var str = "";
	for (var i = 0; i < binarray.length * 4; i++) {
		str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) + hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8)) & 0xF);
	}
	return str;
}
function hex_sha256(s){return binb2hex(core_sha256(str2binb(s),s.length * chrsz));}
MT.core.Helper.sha256 = hex_sha256;


MT.helper = MT.core.Helper;
})();
//MT/ui/TreeView.js
MT.namespace('ui');
"use strict";
/*
 * Needs to be reviewed - too many hacks already
 */
MT.require("ui.DomElement");
MT.extend("core.Emitter")(
	MT.ui.TreeView = function(data, options){
		// first instance will create canvas used for small thumbs
		if(!MT.ui.TreeView.canvas){
			MT.ui.TreeView.canvas = document.createElement("canvas");
			MT.ui.TreeView.canvas.ctx = MT.ui.TreeView.canvas.getContext("2d");
			MT.ui.TreeView.canvas.width = 64;
			MT.ui.TreeView.canvas.height = 64;
		}
		this.canvas = MT.ui.TreeView.canvas;
		
		
		MT.core.Emitter.call(this);
		this.options = {};
		
		for(var i in options){
			this.options[i] = options[i];
		}
		
		this.tree = null;
		this.items = [];
		this.rootPath = options.root;
		
		if(data != void(0)){
			this.create(data);
		}
		
		this._onDrop = [];
	},
	{
		// static - all correct
		cache: {},
		
		onDrop: function(cb){
			this._onDrop.push(cb);
		},
		
		create: function(data){
			this.tree = new MT.ui.DomElement();
			this.tree.style.position = "relative";
			this.tree.addClass("ui-treeview");
			
			this.updateFullPath(data);
			
			this.createObject(data, this.tree);
		},

		createObject: function(data, parent){
			var d;
			for(var i =0; i<data.length; i++){
				d = data[i];
				// folder
				if(d.contents !== void(0)){
					var p = this.addItem(d, parent, i);
					this.createObject(d.contents, p);
					continue;
				}
				
				this.addItem(d, parent, i);
				
			}
		},
		
		getData: function(parent, data){
			
			parent = parent || this.tree;
			var c = null;
			var data = [];
			for(var i=0; i<parent.children.length; i++){
				c = parent.children[i];
				if(c.data.contents){
					c.data.contents = this.getData(c);
				}
				data.push(c.data);
			}
			return data;
		},
		
		update: function(data){
			if(!data){
				this.merge(this.getData());
				return;
			}
			//this.tree.el.innerHTML = "";
			this.merge(data, this.tree);
		},
		
		_nextId: 1,
		mkid: function(){
			return ++this._nextId;
		},
		
		addItem: function(data, parent, index, isVirtual){
			var item = this.checkExistingItem(data, parent, index, isVirtual);
			
			if(item){
				return item;
			}
			
			var that = this;
			var type = (data.contents ? "folder" : "item");
			var el = new MT.ui.DomElement();
			el.options = {};
			el.index = index;
			
			el.style.position = "relative";
			el.addClass("ui-treeview-"+type);
			
			el.visible = true;
			
			el.data = data;
			el.fullPath = data.fullPath;
			
			
			var head = new MT.ui.DomElement();
			var label = new MT.ui.DomElement();
			
			head.label = label;
			
			head.addChild(label).show();
			
			label.el.innerHTML = data.name;
			head.style.position = "relative";
			label.addClass("ui-treeview-label");
			
			label.style.position = "relative";
			label.style.paddingLeft = "30px";
			label.style.paddingRight = "23px";
			
			head.show(el.el);
			
			el.head = head;
			head.parent = el;
			
			
			head.addClass("ui-treeview-item-head");
			
			if(isVirtual){
				el.show(parent.el);
				return el;
			}
			
			parent.addChild(el, el.index);
			if(parent.data){
				if(parent.data.isClosed === false){
					el.show();
				}
			}
			else{
				el.show();
			}
			
			
			if(type == "folder"){
				head.addClass("ui-treeview-folder-head");
				if(data.isClosed || data.isClosed === void(0)){
					el.addClass("close");
					el.visible = false;
				}
				else{
					el.addClass("open");
				}
				
				head.label.el.onclick = function(e){
					if(el.isFolder && e.offsetX > 30){
						return;
					}
					
					e.stopPropagation();
					e.preventDefault();
					el.visible = !el.visible;
					if(el.visible){
						el.addClass("open");
						el.removeClass("close");
						for(var i=0; i<el.children.length; i++){
							el.children[i].show();
						}
						el.data.isClosed = false;
						that.emit("open", el);
					}
					else{
						el.data.isClosed = true;
						el.addClass("close");
						el.removeClass("open");
						for(var i=0; i<el.children.length; i++){
							el.children[i].hide();
						}
						that.emit("close", el);
					}
					
				};
				el.show();
				el.isFolder = true;
			}
			
			
			if(type == "item"){
				el.isFolder = false;
				if(!data.type){
					
				}
				
				if(data.type == "input"){
					var input = new MT.ui.DomElement("span");
					input.el.innerHTML = "88"
					
					input.x = 50;
					
					head.addChild(input);
					el.head = input;
					
				}
			}
			
			var im;
			if(data.__image){
				this.addImage(el, data);
			}
			
			if(this.options.showHide){
				el.addClass("show-hide-enabled");
				var b = this._mkShowHide(el);
				if(!data.isVisible){
					b.addClass("hidden");
				}
				el.options.showHide = b;
			}
			
			if(this.options.lock){
				el.addClass("lock-enabled");
				var b = this._mkLock(el);
				if(!data.isLocked){
					b.addClass("locked");
				}
				el.options.lock = b;
			}
			
			
			label.el.ondblclick = function(e){
				if(el.isFolder && e.offsetX < 30){
					return;
				}
				
				that.emit("dblclick", e, el);
				that.enableRename(el, e);
				
				e.stopPropagation();
				e.preventDefault();
				
			};
			
			el.el.onmouseover = function(e){
				that.emit("mouseover", e, el);
			};
			el.el.onmouseout = function(e){
				that.emit("mouseout", e, el);
			};
			this.items.push(el);
			el.needRemove = false;
			el.tvItem = true;
			if(parent.hasClass("close")){
				el.hide();
			}
			return el;
		},
		
		addImage: function(el, data){
			var im;
			el.head.addClass("has-image");
			
			im = document.createElement("img");
			im.style.pointerEvents = "none";
			
			this.loadAndDrawImage(im, this.rootPath + "/" +data.__image, data);
			
			
			el.head.el.appendChild(im);
			el.img = im;
		},
		
		loadAndDrawImage: function(im, src, data){
			var that = this;
			if(data.updated && im.updated == data.updated){
				return;
			}
			
			if(that.cache[src] && im.updated == data.updated){
				if(im.src !== im.origSource){
					im.src = im.origSource = that.cache[src];
				}
				return;
			}
			
			var img = new Image();
			im.updated = data.updated;
			
			img.onload = function(){
				var asr = this.width / this.height;
				that.canvas.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
				if(asr > 1){
					that.canvas.ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, that.canvas.width, that.canvas.width / asr);
				}
				else{
					var w = that.canvas.width * asr;
					that.canvas.ctx.drawImage(this, 0, 0, this.width, this.height, (that.canvas.width - w)*0.5, 0, w, that.canvas.width);
				}
				im.src = that.cache[src] = that.canvas.toDataURL("image/png");
			};
			
			img.src = im.origSource = src;
		},
		
		removeImage: function(el){
			el.head.removeClass("has-image");
			if(!el.img){
				return;
			}
			el.head.el.removeChild(el.img);
			el.img = null;
		},
		
		checkExistingItem: function(data, parent, index, isVirtual){
			var item, p;
			for(var i=0; i<this.items.length; i++){
				if(data.id == void(0)){
					data.id = this.mkid();
				}
				if(this.items[i].data.id == data.id){
					this.items[i].needRemove = false;
					item = this.items[i];
					p = item.parent;
					
					if(p){
						p.removeChild(item);
						p.addChild(item, index).show();
					}
					
					
					for(var k in data){
						item.data[k] = data[k];
					}
					
					if(parent.hasClass("close")){
						item.hide();
					}
					
					if(item._parent != parent.el){
						if(item.el.parentNode){
							item.el.parentNode.removeChild(item.el);
						}
						item.parent.removeChild(item);
						parent.addChild(item).show();
						
						
						if(!parent.visible){
							item.hide();
						}
					}
					
					if(item.options.showHide){
						if(!data.isVisible){
							item.options.showHide.addClass("hidden");
						}
						else{
							item.options.showHide.removeClass("hidden");
						}
					}
					
					if(item.options.lock){
						if(!data.isLocked){
							item.options.lock.addClass("locked");
						}
						else{
							item.options.lock.removeClass("locked");
						}
					}
					
					if(data.__image){
						if(item.img){
							this.loadAndDrawImage(item.img, this.rootPath + "/" + data.__image, data);
						}
						else{
							this.addImage(item, data);
						}
					}
					else{
						this.removeImage(item);
						
					}
					
					item.head.label.el.innerHTML = data.name;
					
					return item;
				}
			}
		},
		addShowHide: function(){
			for(var i=0; i<this.items.length; i++){
				this._mkShowHide(this.items[i]);
				
			}
		},
		
		_mkShowHide: function(item){
			var that = this;
			var b = new MT.ui.Button("", "show-hide", null,  function(e){
				item.data.isVisible = !item.data.isVisible;
				
				if(item.data.isVisible){
					e.target.ctrl.removeClass("hidden")
				}
				else{
					e.target.ctrl.addClass("hidden")
				}
				
				
				that.emit("show", item);
				
				e.stopPropagation();
				e.preventDefault();
			});
			item.head.el.appendChild(b.el);
			b.parent = item;
			return b;
		},
		
		addLock: function(){
			for(var i=0; i<this.items.length; i++){
				this._mkLock(this.items[i]);
				
			}
		},
		_mkLock: function(item){
			var that = this;
			var b = new MT.ui.Button("", "lock", null, function(e){
				item.data.isLocked = !item.data.isLocked;
				
				if(item.data.isLocked){
					e.target.ctrl.removeClass("locked")
				}
				else{
					e.target.ctrl.addClass("locked")
				}
				
				
				that.emit("lock", item);
				e.stopPropagation();
			});
			item.head.el.appendChild(b.el);
			b.parent = item;
			return b;
		},
		
		
		enableInput: function(ev){
			var that = this;
			var ditem = null;
			
			ev.on("mousedown", function(e){
				// ????
				if(!e.target.parentNode){
					return;
				}
				ditem = that.getOwnItem(e.target.parentNode.parentNode);
			});
			
			ev.on("mouseup", function(e){
				
				if(!e.target.ctrl){
					return;
				}
				
				if(!e.target.ctrl.hasParent(that.tree)){
					return;
				}
				
				if(that.dragged){
					return;
				}

				var item = that.getOwnItem(e.target.parentNode.parentNode);
				// sometimes happens when browser freezes for few ms
				if(!item){
					return;
				}
				if(item.isFolder && e.offsetX < 30){
					return;
				}
				
				if(item && item == ditem){
					if(e.button == 0){
						that.emit("click", item.data, item);
					}
					else if(e.button == 2){
						that.emit("context", e, item);
					}
				}
			});
			
			
		},
		
		sortable: function(ev){
			
			var dragHelper = this.addItem({name: "&nbsp;", skip: true}, this.tree, 0, true);
			
			dragHelper.style.position = "absolute";
			dragHelper.style.pointerEvents = "none";
			dragHelper.style.bottom = "auto";
			dragHelper.style.opacity = 0.8;
			dragHelper.style.border = "solid 2px #000";
			dragHelper.style.zindex = 9999;
			dragHelper.style.backgroundColor = "#f00";
			
			var dd = new MT.ui.DomElement("div");
			dd.style.position = "absolute";
			dd.style.height = "4px";
			//dd.style.border = "solid 1px #000";
			dd.style.pointerEvents = "none";
			dd.style.display = "none";
			dd.style.zIndex = 9999;
			
			
			var p = dragHelper.el.parentNode;
			dragHelper.addClass("active ui-wrap");
			p.appendChild(dragHelper.el);
			dragHelper.style.display = "none";
			
			document.body.appendChild(dd.el);
			
			
			var pe = null;
			var that = this;
			var mdown = false;
			
			var mx = 0;
			var my = 0;
			
			var item = null;
			
			var scrollTop = 0;
			
			var dragged = false;
			var last = null;
			var bottom = false;
			var inFolder = false;
			
			var dropItem = function(item, last){
				
				if(item.el.parentNode){
					item.el.parentNode.removeChild(item.el);
				}
				
				item.parent.removeChild(item);
				
				if(inFolder){
					last.addChild(item, -1);
					//last.show();//){
					//	item.hide();
					//}
				}
				else{
					if(bottom){
						last.parent.addChild(item, last.index );
					}
					else{
						last.parent.addChild(item, last.index - 1);
					}
					if(item.parent.hasClass("close")){
						item.hide();
					}
				}
				
			};
			
			this.enableInput(ev);
			var startDragPos = {x: 0, y: 0};
			
			ev.on("mousedown", function(e){
				if(!e.target.parentNode){
					return;
				}
				item = that.getOwnItem(e.target.parentNode.parentNode);
				if( !item ){
					return;
				}
				
				that.emit("dragstart", e, item);
				
				mdown = true;
				scrollTop = that.tree.el.scrollTop;
				
				
				
				var y = (item.calcOffsetY(that.tree.el));
				dragHelper.y = y;
				dragHelper.style.left = "0";
				dragHelper.style.right = "0";
				
				my = y - ev.mouse.y;
				startDragPos.x = ev.mouse.x;
				startDragPos.y = ev.mouse.y;
			});
			
			
			
			ev.on("mouseup", function(e){
				if(e.target.isFolder && e.offsetX > 30){
					return;
				}
				dragHelper.style.display = "none";
				dd.style.display = "none";
				dragHelper.y = 0;
				
				if(!mdown){
					return;
				}
				mdown = false;
				that.emit("dragend", e, item);
				
				if(!dragged){
					return;
				}
				dragged = false;
				
				
				for(var i=0; i<that._onDrop.length; i++){
					if(that._onDrop[i](e, item, last) === false){
						return;
					}
				}
				
				
				
				if(!last || last == item || last.hasParent(item)){
					last = null;
					return;
				}
 				
				dropItem(item, last);
				if(item.hasClass("selected")){
					for(var i=0; i<that.items.length; i++){
						var it = that.items[i];
						if(!it.hasClass("selected")){
							continue;
						}
						if(item == it || last == it){
							continue;
						}
						dropItem(it, last);
					}
				}
				that.updateFullPath(that.getData(), null, true);
				
				
			});
			
			ev.on("mousemove", function(e){
				if(!mdown || !item){
					return;
				}
				
				if(Math.abs(startDragPos.x - ev.mouse.x) < 5 && Math.abs(startDragPos.y - ev.mouse.y) < 5 ){
					return;
				}
				
				dragged = true;
				
				that.emit("dragmove", e, item);
				if(e.isPropagationStopped || !MT.ui.hasParent(e.target, that.tree.el)){
					dragHelper.style.display = "none";
					dd.style.display = "none";
					dragHelper.y = 0;
					dragged = false;
					return;
				}
				
				dragHelper.style.zIndex = 9999
				dragHelper.style.display = "block";
				dragHelper.head.el.innerHTML = "&nbsp;";
				
				var bounds = dragHelper.bounds;
				var top = ev.mouse.y;
				
				dragHelper.y = top  - bounds.height*0.5 - that.tree.bounds.top  + that.tree.el.scrollTop;
				dragHelper.style.height = "auto";
				//dd.style.backgroundColor = "#f00";
				
				dd.style.display = "block";
				dd.style.top = top - bounds.height*0.5 + "px";
				
				dd.style.left = bounds.left + "px";
				dd.style.width = bounds.width + "px";
				dd.style.height = bounds.height + "px";
				
				bounds = dd.bounds;
				
				var currItem, head;
				var maxHeight = 0;
				
				last = null;
				
				for(var it, i=0; i<that.items.length; i++){
					currItem = that.items[i];
					head = currItem.head;
					
					it = currItem.head.bounds;
					
					if(maxHeight < it.top + it.height){
						maxHeight = it.top + it.height;
					}
					
					if(top > it.top && top < it.top + it.height + 5){
						last = currItem;
						if(last == item){
							return;
						}
						dragHelper.y = it.top - that.tree.bounds.top  + that.tree.el.scrollTop;
						
						inFolder = currItem.isFolder;
						bottom = false;
						
						if(!inFolder){
							// move over
							if(top - it.top < it.top + it.height - top){
								inFolder = false;
								
								dragHelper.y = it.top - that.tree.bounds.top  + that.tree.el.scrollTop;
								dragHelper.style.height = dragHelper.height*0.5;
								dragHelper.y -= dragHelper.height*0.5;
								
							}
							
							// move under
							else{
								inFolder = false;
								bottom = true;
								
								dragHelper.y = it.top - that.tree.bounds.top + it.height  + that.tree.el.scrollTop;
								dragHelper.style.height = dragHelper.height *0.5;
								dragHelper.y -= dragHelper.height*0.5;
								
							}
							return;
						}
						
						
						// move over
						if(top - it.top < 10){
							inFolder = false;
							
							dragHelper.y = it.top - that.tree.bounds.top  + that.tree.el.scrollTop;
							dragHelper.style.height = dragHelper.height*0.5;
							dragHelper.y -= dragHelper.height*0.5;
						}
						
						// move under
						if(it.top + it.height - top < 5 && last.data.isClosed === true){
							inFolder = false;
							bottom = true;
							
							dragHelper.y = it.top - that.tree.bounds.top + it.height  + that.tree.el.scrollTop;
							dragHelper.style.height = dragHelper.height *0.5;
							dragHelper.y -= dragHelper.height*0.5;
						}
						return;
					}
				}
				
				
				var firstLevel = that.tree.children;
				
				if(that.items.length){
					// most bottom
					if(top > maxHeight){
						dragHelper.y = maxHeight - that.tree.bounds.top + 5  + that.tree.el.scrollTop;
						dragHelper.style.height = dragHelper.height *0.5;
						bottom = true;
						inFolder = false;
						last = firstLevel[firstLevel.length - 1];
					}
					// most top
					else if(top - that.tree.bounds.top < 20){
						dragHelper.y = - dragHelper.height * 0.25;
						dragHelper.style.height = dragHelper.height *0.5;
						last = firstLevel[0];
					}
				}
			});
		},
		
		disableRename: function(){
			this.renameEnabled = false;
		},
		
		renameEnabled: true,
		enableRename: function(el){
			if(!this.renameEnabled){
				return;
			}
			var that = this;
			this.emit("renameStart");
			
			if(!this.input){
				this.input = document.createElement("input");
				this.input.className = "ui-input";
			}
			
			var left = (el.head.calcOffsetX(document.body));
			if(el.img){
				left += 20;
			}
			this.input.style.left = (left)+"px";
			this.input.style.top = (el.calcOffsetY(document.body) - 2) + "px"; // check padding here instead of 2 :)
			
			this.input.value = el.data.name;
			var lastValue = el.data.name;
			
			this.input.type = "text";
			
			el.head.label.el.innerHTML = "&nbsp;"
			document.body.appendChild(this.input);
			
			var needSave = true;
			this.input.onblur = function(){
				try{
					if(this.parentNode){
						this.parentNode.removeChild(this);
					}
				}
				catch(e){}
				
				if(needSave && this.value != ""){
					that.rename(el, this.value);
				}
				else{
					el.head.label.el.innerHTML = lastValue;
				}
			};
			
			this.input.onkeyup = function(e){
				if(e.which == MT.keys.ESC){
					needSave = false;
					this.blur();
				}
				if(e.which == MT.keys.ENTER){
					this.blur();
				}
				e.preventDefault();
				e.stopPropagation();
			};
			
			
			
			
			this.input.focus();
			
			var tmp = el.data.name.split(".");
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

		rename: function(el, name){
			var that = this;
			var part = "";
			if(el.parent.data){
				part = el.parent.data.fullPath;
			}

			var op = el.data.name;

			el.data.fullPath = part+"/"+name;
			el.data.name = name;
			el.head.label.el.innerHTML = name;

			var o = part + "/" + op;
			var n = part + "/" + this.value;

			if(o !== n){
				that.emit("change", part + "/" + op, part + "/" + name);
				that.emit("rename", el, op);
			}
		},

		remove: function(){
			this.tree.hide();
		},
		
		merge: function(data, oldData){
			this.data = data;
			var scroll = this.tree.el.scrollTop;
			this.tree.hide();
			
			var p = this.tree.el.parentNode;
			this.updateFullPath(data);
			
			for(var i=0; i<this.items.length; i++){
				this.items[i].needRemove = true;
			}
			
			this.createObject(data, this.tree);
			
			for(var i=0; i<this.items.length; i++){
				if(this.items[i].needRemove){
					this.items[i].parent.removeChild(this.items[i]);
					this.items[i].hide();
					this.items.splice(i,1);
					i--;
					this.emit("deleted", this.items[i]);
				}
			}
			
			if(data.length !== 0){
				this.tree.show();
				this.tree.children.forEach(function(c){c.show();});
			}
			this.tree.el.scrollTop = scroll;
		},
   
		getOwnItem: function(it){
			var item = it;
			while(item){
				if(item.ctrl && item.ctrl.tvItem){
					break;
				}
				item = item.parentElement;
			}
			
			if(!item){
				return null;
			}
			
			for(var i=0; i<this.items.length; i++){
				if(item == this.items[i].el){// || it == this.items[i].el.parentNode){
					return this.items[i];
				}
			}
			
			return null;
		},
		
		updateFullPath: function(data, path, shouldNotify, skipGlobalNotify){
			path = path || "";
			for(var i=0; i<data.length; i++){
				var fullPath = path + "/" + data[i].name;
				var op = data[i].fullPath;
				data[i].fullPath = fullPath;
				
				if(op != fullPath){
					if(shouldNotify){
						this.emit("change", op, fullPath);
					}
				}
				
				if(data[i].contents){
					this.updateFullPath(data[i].contents, data[i].fullPath, shouldNotify, true);
				}
			}
			
			if(shouldNotify && !skipGlobalNotify){
				this.emit("change", null, null);
			}
			
		},
		
		select: function(id, silent){
			for(var i=0; i<this.items.length; i++){
				if(id == this.items[i].data.id){
					if(silent){
						return this.items[i];
					}
					this.emit("select", this.items[i].data,  this.items[i]);
					return;
				}
			}
			
		},
		
		getById: function(id){
			for(var i=0; i<this.items.length; i++){
				if(id == this.items[i].data.id){
					return this.items[i];
				}
			}
			
		},
		
		show: function(par){
			this.tree.show(par);
		}
		
	}
);

//MT/ui/DomElement.js
MT.namespace('ui');
MT(
	MT.ui.DomElement = function(type){
		type = type || "div";
		this.el = document.createElement(type);
		this.style = this.el.style;
		this.el.ctrl = this;
		
		this.index = 0;
		this.isVisible = false;
		
		// this is confusing, but handy... 
		// probably should rename to something else
		// used only by treeView
		this.children = [];
	},
	{
		_parent: null,
		appendChild: function(el, index){
			el.parent = this;
			el.show(this.el);
			return el;
		},
		
		hasParent: function(parent){
			var p = this.parent;
			while(p){
				if(p == parent){
					return true;
				}
				p = p.parent;
			}
		},
		
		isParentTo: function(el){
			var p = el;
			
			while(p){
				if(p == this.el){
					return true;
				}
				p = p.parentNode;
			}
			return false;
		},
   
		remove: function(){
			if(this.el.parentNode){
				this.el.parentNode.removeChild(this.el);
			}
		},

		show: function(parent){
			
			if(parent == void(0)){
				if(this.parent){
					this._parent = this.parent.el;
				}
				if(!this._parent){
					this._parent = document.body;
				}
			}
			else{
				this._parent = parent;
			}
			
			this._parent.appendChild(this.el);
			this.isVisible = true;
		},
   
		hide: function(){
			if(!this.el.parentNode){
				return this;
			}
			this.el.parentNode.removeChild(this.el);
			this.isVisible = false;
			return this;
		},
   
		hideToTop: function(){
			this.y = -this.height;
		},
   
		addClass: function(cls){
			var cl = cls.split(".");
			if(cl.length > 1){
				for(var i=0; i<cl.length; i++){
					this.addClass(cl[i]);
				}
				return;
			}
			cl = cls.split(" ");
			if(cl.length > 1){
				for(var i=0; i<cl.length; i++){
					this.addClass(cl[i]);
				}
				return;
			}
			
			if(!this.hasClass(cls)){
				this.el.className = (this.el.className + " " + cls).trim();
			}
			return this;
		},
		
		removeClass: function(cls){
			var cl = cls.split(".");
			if(cl.length > 1){
				for(var i=0; i<cl.length; i++){
					this.removeClass(cl[i]);
				}
				return;
			}
			cl = cls.split(" ");
			if(cl.length > 1){
				for(var i=0; i<cl.length; i++){
					this.removeClass(cl[i]);
				}
				return;
			}
			
			var c = this.el.className.split(" ");
			for(var i=0; i<c.length; i++){
				if(cls == c[i]){
					c[i] = c[c.length-1];
					c.length = c.length - 1;
				}
			}
			this.el.className = c.join(" ");
			
			return this;
		},
		
		hasClass: function(cls){
			var c = this.el.className.split(" ");
			for(var i=0; i<c.length; i++){
				if(cls == c[i]){
					return true;
				}
			}
			return false;
		},
		
		_x: 0,
		set x(val){
			this.setX(val);
		},
		
		setX: function(val){
			this._x = val;
			this.style.left = val+"px";
			//this.width = this._width;
			//this.style.transform =  "translate(" + this.y + "px," + this.y + "px)";
		},
   
		get x(){
			if(this.isFitted){
				return this.calcOffsetX();
			}
			return this._x;
		},
   
		_y: 0,
		set y(val){
			this.setY(val);
		},
		
		setY: function(val){
			this._y = val;
			this.style.top = val+"px";
			//this.style.transform =  "translate(" + this.x + "px," + this.y + "px)";
		},
   
		get y(){
			if(this.isFitted){
				return this.calcOffsetY();
			}
			return this._y;
		},
   
		_height: 0,
		get height(){
			if(this.isFitted){
				return this.el.offsetHeight;
			}
			
			if(this._height){
				return this._height;
			}
			return this.el.offsetHeight;
		},
		set height(val){
			this.setHeight(val);
		},
		
		setHeight: function(val){
			
			this._height = val;
			if(val == 0){
				this.style.height = "auto";
			}
			else{
				this.style.height = val+"px";
			}
		},
   
		_width: 0,
		get width(){
			if(this.isFitted){
				return this.el.offsetWidth;
			}
			if(this._width){
				return this._width;
			}
			return this.el.offsetWidth;
		},
		set width(val){
			this.setWidth(val);
		},
   
		setWidth: function(val){
			if(!val){
				return;
			}
			
			this._width = val;
			this.style.width = val+"px";
		},
   
		resize: function(w, h){
			this.width = w || this._width;
			this.height = h || this._height;
		},
		
		calcOffsetY: function(upTo){
			upTo = upTo || document.body;
			var ret = this.el.offsetTop;
			p = this.el.offsetParent;
			while(p){
				if( p == upTo ){
					break;
				}
				ret += p.offsetTop - p.scrollTop;
				p = p.offsetParent;
			}
			
			return ret;
		},
		calcOffsetX: function(upTo){
			upTo = upTo || document.body;
			var ret = this.el.offsetLeft;
			p = this.el.offsetParent;
			while(p && p != upTo){
				ret += p.offsetLeft - p.scrollLeft;
				p = p.offsetParent;
				
			}
			return ret;
		},
		ox: 0,
		oy: 0,
   
		setAbsolute: function(bottom, right){
			this.style.position = "absolute";
			if(bottom){
				this.style.bottom = 0;
			}
			else{
				this.style.top = 0;
			}
			
			if(right){
				this.style.right = 0;
			}
			else{
				this.style.left = 0;
			}
		},
		
		isFitted: false,
		fitIn: function(){
			this.style.position = "absolute";
			this.style.top = 0;
			this.style.right = 0;
			this.style.bottom = 0;
			this.style.left = 0;
			this.style.height = "auto";
			this.style.width = "auto";
			this.isFitted = true;
		},
		
		unfit: function(){
			this.isFitted = false;
		},
   
		inheritSize: function(el){
			this.x = el.x;
			this.y = el.y;
			this.width = el.width;
			this.height = el.height;
		},
   
		getStyle: function(){
			return window.getComputedStyle(this.el);
		},
   
		sort: function(a,b){
			return a.index - b.index;
		},
		
		addChildFast: function(child, index){
			if(index !== void(0)){
				child.index = index;
			}
			this.children.push(child);
			return child;
		},
		addChild: function(child, index){
			child.index = index;
			this.children.push(child);
			this.children.sort(this.sort);
			
			if(index !== void(0)){
				var ch = null;
				for(var i=0; i<this.children.length; i++){
					ch = this.children[i];
					ch.index = i;
					if(ch.el.parentNode){
						ch.el.parentNode.removeChild(ch.el);
					}
					// ugly hack for tree view
					if(this.data && this.data.isClosed){
						//ch.isVisible = false;
						continue;
					}
					
					if(ch.isVisible){
						this.el.appendChild(ch.el);
					}
				}
			}
			else{
				if(child.isVisible){
					if(child.el.parentNode && child.el.parentNode != this.el){
						child.el.parentNode.removeChild(child.el);
					}
					if(child.el.parentNode !== this.el){
						this.el.appendChild(child.el);
					}
				}
			}
			child.parent = this;
			return child;
		},
		
		removeChild: function(child){
			if(child.el.parentNode == this.el){
				this.el.removeChild(child.el);
			}
			
			for(var i=0; i<this.children.length; i++){
				if(this.children[i] == child){
					this.children.splice(i, 1);
					return;
				}
			}
		},
   
		_index: 0,
		get index(){
			return this._index;
		},
		
		set index(idx){
			this._index = idx;
		},
		
		clear: function(){
			while(this.el.children.length){
				if(this.el.children[0].ctrl){
					this.el.children[0].ctrl.hide();
				}
				else{
					this.el.removeChild(this.el.children[0]);
				}
			}
		},
   
		get bounds(){
			return this.el.getBoundingClientRect();
		}
		
	}
);
//MT/ui/PanelHead.js
MT.namespace('ui');
MT.extend("ui.DomElement")(
	MT.ui.PanelHead = function(panel){
		MT.ui.DomElement.call(this);
		this.addClass("ui-panel-header");
		this.panel = panel;
		this.el.panel = panel;
		this.tabs = [];
	},
	{
		addTab: function(title, cb){
			var tab = new MT.ui.DomElement("span");
			
			tab.addClass("panel-head-tab");
			
			tab.title = document.createElement("span");
			tab.title.innerHTML = title;
			tab.el.setAttribute("title", title);
			tab.el.appendChild(tab.title);
			
			tab.panel = tab.el.panel = this.panel;
			
			var that = this;
			tab.el.data = {
				panel: this.panel
			};
			if(this.tabs.length == 0){
				tab.addClass("active");
			}
			
			this.tabs.push(tab);
			this.appendChild(tab);
			return tab;
		},
		
		allowRename: function(){
			
			
		},
		
		removeTab: function(tab){
			for(var i=0; i<this.tabs.length; i++){
				if(this.tabs[i] == tab){
					this.tabs.splice(i, 1);
					return;
				}
			}
			
		},
		
		setTabs: function(tabs){
			for(var i=0; i<this.tabs.length; i++){
				this.tabs[i].remove();
			}
			
			this.tabs = tabs;
			
			var width = (100/this.tabs.length);
			this.showTabs();
			
		},
		
		showTabs: function(){
			if(!this.tabs.length){
				console.error("TABELEES");
			}
			
			
			var width = (100/this.tabs.length);
			
			for(var i=0; i<this.tabs.length; i++){
				this.appendChild(this.tabs[i]);
				this.tabs[i].style.width = width+"%";
				if(this.tabs[i].panel == this.panel){
					this.setActiveTab(this.tabs[i]);
				}
			}
			
		},
		
		
		updateTabs: function(){
			for(var i=0; i<this.tabs.length; i++){
				this.tabs[i].remove();
				this.appendChild(this.tabs[i]);
			}
		},
		
		
		setActiveTab: function(tab){
			tab = tab || this.panel.mainTab;
			var t = null;
			for(var i=0; i<this.tabs.length; i++){
				t = this.tabs[i];
				if(t == tab){
					t.addClass("active");
					continue;
				}
				t.removeClass("active");
			}
		},
		
		setActiveIndex: function(index){
			var t = null;
			for(var i=0; i<this.tabs.length; i++){
				t = this.tabs[i];
				if(i == index){
					t.addClass("active");
					continue;
				}
				t.removeClass("active");
			}
		}




	}
);
//MT/ui/Button.js
MT.namespace('ui');
MT.extend("ui.DomElement")(
	MT.ui.Button = function(text, className, events, cb, tooltip){
		MT.ui.DomElement.call(this);
		if(tooltip){
			this.el.setAttribute("data-tooltip", tooltip);
		}
		this.addClass("ui-button");
		
		if(className){
			this.addClass(className);
		}
		
		if(text != void(0)){
			this.text = text;
		}
		
		if(cb){
			this.el.onclick = cb;
		}
		
	},
	{
		set text(val){
			this.el.innerHTML = val;
		},
		get text(){
			return this.el.innerHTML;
		}
		
		
		
	}
);

//MT/core/Emitter.js
MT.namespace('core');
MT(
	MT.core.Emitter = function(){
		this.callbacks = {};
	},
	{
		on: function(action, cb, priority){
			
			if(action == void(0)){
				console.error("undefined action");
				return;
			}
			
			if(typeof cb != "function"){
				console.error("event",action,"not a function:",cb);
				return;
			}
			if(Array.isArray(action)){
				for(var i=0; i<action.length; i++){
					this.on(action[i], cb);
				}
				return;
			}
			
			if(!this.callbacks){
				this.callbacks = {};
			}
			
			if(!this.callbacks[action]){
				this.callbacks[action] = [];
			}
			
			
			this.callbacks[action].push(cb);
			cb.priority = priority || this.callbacks[action].length;
			this.callbacks[action].sort(function(a, b){
				return a.priority - b.priority;
			});
			
			return cb;
		},
		
		once: function(action, cb){
			if(typeof cb != "function"){
				console.error("event", action, "not a function:", cb);
				return;
			}
			
			if(Array.isArray(action)){
				for(var i=0; i<action.length; i++){
					this.once(action[i], cb);
				}
				return;
			}
			
			var that = this;
			var fn = function(action1, data){
				cb(action1, cb);
				that.off(action, fn);
			};
			
			this.on(action, fn);
			
		},
   
		off: function(type, cb){
			if(cb === void(0)){
				cb = type; type = void(0);
			}
			
			if(type && !this.callbacks[type]){
				return;
			}
			
			if(type){
				this._off(cb, type);
				return;
			}
			
			for(var i in this.callbacks){
				if(cb == void(0)){
					this.callbacks[i].length = 0;
					continue;
				}
				this._off(cb, i);
			}
		},
		
		_off: function(cb, type){
			var i=0, cbs = this.callbacks[type];
			for(i=0; i<cbs.length; i++){
				if(cbs[i] === cb){
					cbs.splice(i, 1);
				}
			}
			return cb;
		},
		
		emit: function(type, action, data){
			if(!this.callbacks){
				return;
			}
			
			if(!this.callbacks[type]){
				return;
			}
			
			var cbs = this.callbacks[type];
			
			
			
			for(var i=0; i<cbs.length; i++){
				cbs[i](action, data);
			}
		},
   
		debug: function(type){
			try{
				throw new Error();
			}catch(e){
				var stack = e.stack.split("\n");
				//remove self and emit
				stack.splice(0, 3);
				console.log("EMIT: ", type);
				console.log(stack.join("\n"));
			}
			
		}
	}
);
//MT/core/BasicPlugin.js
MT.namespace('core');
MT(
	MT.core.BasicPlugin = function(channel){
		this.channel = channel;
	},
	{
		
		initUI: function(ui){
			this.ui = ui;
		},
		
		initSocket: function(socket){
			if(this.channel == void(0)){
				return;
			}
			
			if(this.socket == socket){
				return;
			}
			
			this.dealys = {};
			var that = this;
			this.socket = socket;
			
			this.socket.on(this.channel, function(action, data){
				var act = "a_"+action;
				if(that[act]){
					that[act](data);
				}
				else{
					console.warn("unknown action", that.channel + "["+act+"]", data);
				}
			});
		},
		send: function(action, data, cb){
			this.socket.send(this.channel, action, data, cb);
		},
		sendDelayed: function(action, data, timeout){
			var that = this;
			if(this.dealys[action]){
				window.clearTimeout(this.dealys[action]);
			}
			
			this.dealys[action] = window.setTimeout(function(){
				that.send(action, data);
				that.dealys[action] = 0;
			}, timeout);
			
		}
	}
);

//MT/ui/InputCollection.js
MT.namespace('ui');
MT(
	MT.ui.InputCollection = function(ui, props, object){
		this.object = object || {};
		this.inputs = {};
		for(var i in props){
			if(!props[i].key){
				props[i].key = i;
			}
			this.inputs[i] = new MT.ui.Input(ui, props[i], this.object);
		}
		
	},
	{
		show: function(par){
			for(var i in this.inputs){
				this.inputs[i].show(par);
			}
		},
		hide: function(){
			for(var i in this.inputs){
				this.inputs[i].hide();
			}
		}
	}
);
//MT/ui/FrameControl.js
MT.namespace('ui');
MT.extend("core.Emitter")(
	MT.ui.FrameControl = function(mm){
		this.mm = mm;
		this.el = new MT.ui.DomElement("div");
		
		this.el.addClass("ui-frame-control");
		
		this.sepHolder = document.createElement("div");
		this.sepHolder.className = "ui-frame-sep-holder";
		
		this.el.el.appendChild(this.sepHolder);
		this.el.style.position = "absolute";
		this.handle = document.createElement("div");
		this.handle.className = "ui-frame-handle";
		
		
		this.background = document.createElement("div");
		this.background.className = "ui-frame-background";
		
		this.el.el.appendChild(this.background);
		
		
		this.sliderContainer = document.createElement("div");
		this.sliderContainer.className = "ui-frame-control-slider-container";
		
		this.slh = new MT.ui.SliderHelper(0, 0, Infinity);
		
		this.slider = document.createElement("div");
		this.slider.className = "ui-frame-control-slider";
		
		this.sliderContainer.appendChild(this.slider);
		
		this.showSlider();
		
		var mdown = false;
		var that = this;
		
		var minWidth = 150;
		
		var startWidth = 150;
		this.slider.style.width = startWidth + "px";
		
		
		this.slider.onmousedown = function(e){
			mdown = true;
			//startWidth = e.target.offsetWidth;
			minWidth = startWidth + 50;
		};
		
		var ev = this.mm.ui.events;
		var scale = 1;
		
		var impact = 0;
		
		ev.on(ev.MOUSEMOVE, function(e){
			if(!mdown){
				return;
			}
			
			that.slh.change(ev.mouse.mx);
			
			var max = that.sliderContainer.offsetWidth - minWidth;
			
			if(that.slh < max){
				that.slider.style.left = that.slh + "px";
			}
			else{
				impact = (that.slh - max) * 0.01;
				/*var w = startWidth / impact;
				if(w < 20){
					w = 20;
				}*/
				/*if(w < startWidth){
					that.slider.style.left = max + startWidth - w + "px";
					//that.slider.style.width = w + "px";
				}*/
				//else{
					w = startWidth;
				//}
			}
			
			that.emit("change", that.slh.value * (1 + impact), scale);
			
			var overflow = that.slider.offsetLeft + that.slider.offsetWidth;
			
			that.mm.changeFrame();
		});
		
		ev.on(ev.MOUSEUP, function(){
			mdown = false;
			that.slh.reset();
			
		});
		
		this.builtSpans = [];
		this.builtDivs = [];
		
		this.labels = [];
	},
	{
		buildtm: 0,
		
		buildDelay:function(){
			var that = this;
			if(this.buildtm){
				window.clearTimeout(this.build);
			}
			this.buildtm = window.setTimeout(function(){
				that.buildtm = 0;
				that._build();
			}, 100);
			
		},
		
		build: function(){
			this.clear();
			var m = this.mm.keyframes;
			var len = m.getLastFrame();
			var framesize = this.mm.frameSize;
			
			var drawOffset = Math.floor(this.mm.frameOffset + framesize*0.5);
			
			var width = this.mm.rightPanel.width;
			
			var totFrames = Math.ceil(width / framesize);
			
			var fps = m.getFps();
			var totTime = Math.ceil(totFrames / fps);
			
			var start = Math.floor(this.mm.startFrame / fps);
			
			var el;
			var inc = Math.floor(1.5/this.mm.scale);
			if(inc < 1){
				inc = 1;
			}
			
			
			var k = 0;
			var round = 5;
			var info;
			var ind = 0;
			
			for(var i=0; i<totFrames; i += inc){
				el = this.builtSpans[i];
				if(!el){
					el = document.createElement("span");
					this.builtSpans.push(el);
				}
				else{
					if(el.parentNode){
						el.parentNode.removeChild(el);
					}
					el.removeAttribute("data-seconds");
				}
				el.className = "ui-frame-sep";
				el.style.left = i*framesize + drawOffset + "px";
				
				this.sepHolder.appendChild(el);
				info = i + this.mm.startFrame;
				
				if((info+"").length > 2){
					round = 10;
				}
				else{
					round = 5;
				}
				
				if( (k % round) == 0 ){
					el.className = "ui-frame-sep ui-frame-sep-long";
					if(i + this.mm.startFrame > 180){
						var sec = Math.round( 10 * (i + this.mm.startFrame) / fps ) / 10;
						if(sec > 60){
							var m = Math.round(sec / 60);
							sec = m + "m " + Math.round( sec % 60 ) + "s";
						}
						else{
							sec += "s";
						}
						
						el.setAttribute("data-seconds", sec);
					}
					else{
						el.setAttribute("data-seconds", i + this.mm.startFrame);
					}
				}
				k++;
			}
			
			var off = 0;
			var rightBorder = 0;
			for(var i=0; i<totTime + start+5; i++){
				
				if( (i) % 2){
					off += framesize*fps ;
					continue;
				}
				
				rightBorder = framesize*(fps) + (-this.mm.startFrame*framesize + off);
				if(rightBorder < -40){
					off += framesize*fps ;
					continue;
				}
				el = this.builtDivs[i];
				if(!el){
					el = document.createElement("div");
					this.builtDivs.push(el);
					if(el.parentNode){
						el.parentNode.removeChild(el);
					}
				}
				el.className = "ui-frame-seconds";
				el.style.width = framesize*(fps) + "px";
				el.style.left = -this.mm.startFrame*framesize + off + drawOffset + "px";
				
				this.background.appendChild(el);
				
				off += framesize*fps;
			}
			
			
			
			this.sepHolder.appendChild(this.handle);
			this.adjustHandle();
			
			
			this.showSlider();
		},
		
		adjustHandle: function(){
			this.handle.style.left = this.mm.slider.x  - this.handle.offsetWidth*0.5 + this.mm.slider.width*0.5 + "px";
			if(this.mm.activeFrame > 180){
				
			}
			this.handle.innerHTML = this.mm.activeFrame;
		},
		
		hide: function(){
			if(this.el.el.parentNode){
				this.el.el.parentNode.removeChild(this.el.el);
			}
			this.clear();
		},
		
		clear: function(){
			this.sepHolder.innerHTML = "";
			this.background.innerHTML = "";
			
			if(this.handle.parentNode){
				this.handle.parentNode.removeChild(this.handle);
			}
			
			this.hideSlider();
		},
		
		showSlider: function(){
			this.mm.rightPanel.el.appendChild(this.sliderContainer);
		},
		
		hideSlider: function(){
			if(!this.sliderContainer.parentNode){
				return;
			}
			this.sliderContainer.parentNode.removeChild(this.sliderContainer);
		},
	}
);
//MT/ui/MovieLayer.js
MT.namespace('ui');
"use strict";

MT.extend("ui.Keyframes")(
	MT.ui.MovieLayer = function(mm){
		MT.ui.Keyframes.call(this, mm);
	},
	{
		setData: function(data){
			this.hide();
			
			this.data = data;
			this.activeMovie = "__main";
			this.buildData();
			this.tv.merge(data.contents);
			this.updateFrames();
		},
		sortFrames: function(){
			var item, movie;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				for(var m in item.movies){
					movie = item.movies[m];
					movie.frames.sort(function(a,b){
						return a.keyframe - b.keyframe;
					});
				}
				return;
			}
		},
		drawFrame: function(frames, index, track, movie, item){
			if(!item.submovie){
				MT.ui.Keyframes.drawFrame.call(this, frames, index, track, movie);
				return;
			}
			
			
			var item = frames[index];
			var startFrame = this.mm.startFrame;
			var w = this.mm.frameSize;
			
			if(frames[index].keyframe < this.mm.startFrame - item.length){
				return;
			}
			
			var el = this.getFrameElement();
			el.style.width = item.length * w + "px";
			el.style.left = (item.keyframe * w + this.mm.frameOffset) - startFrame * w + "px";
			el.frameInfo = {
				frames: frames,
				index: index
			};
			
			
			if(this.mm.selectedFrame == item){
				el.className = "ui-kf-frame active ui-kf-frame-main";
			}
			else{
				el.className = "ui-kf-frame ui-kf-frame-main";
			}
			track.appendChild(el);
		},
		
		changeFrame: function(frame){
			var mo, o;
			
			var sinfo, name, movie, subMovies, sframe, childFrame;
			for(var i=0; i<this.data.contents.length; i++){
				o = this.data.contents[i];
				mo = this.mm.map.getById(o.objectId);
				if(!mo){
					var that = this;
					window.setTimeout(function(){
						that.changeFrame(frame);
					}, 100);
					return;
					continue;
				}
				mo.changeMovieFrame(this.activeMovie, frame, true);
				subMovies = o.contents;
				for(var j=0; j<subMovies.length; j++){
					sinfo = subMovies[j];
					name = sinfo.name;
					movie = sinfo.movies[this.activeMovie];
					if(!movie){
						continue;
					}
					
					var frames = movie.frames;
					if(frames.length === 0){
						continue;
					}
					childFrame = frame;
					for(var f=0; f<frames.length; f++){
						sframe = frames[f];
						if(sframe.keyframe <= frame && sframe.keyframe + sframe.length > frame){
							childFrame = frame - sframe.keyframe;
							mo.changeChildrenMovieFrame(sinfo.name, childFrame);
							break;
						}
					}
				}
			}
		},
		
		saveActiveFrame: function(all){
			if(!this.active){
				return;
			}
			var data = this.active.data;
			
			if(!data.submovie){
				MT.ui.Keyframes.saveActiveFrame.call(this, all);
				return;
			}
			
			var movie = this.active.data.movies[this.activeMovie];
			var frames = movie.frames;
			var frame;
			for(var i=0; i< frames.length; i++){
				frame = frames[i];
				if(frame.keyframe < this.mm.activeFrame && frame.length > this.mm.activeFrame){
					return;
				}
				
			}
			
			if(!data.info){
				data.info = {};
			}
			
			frames.push({keyframe: this.mm.activeFrame, length: data.info.lastFrame});
			
			this.mm.sortFrames(frames);
			this.mm.redrawAll();
			this.mm.om.sync();
		}
	}
);

//MT/ui/Keyframes.js
MT.namespace('ui');
"use strict";

MT.extend("core.Emitter")(
	MT.ui.Keyframes = function(mm){
		this.panelCollections = {};
		
		var ui = mm.ui;
		var d1 = mm.leftPanel.content;
		var d2 = mm.rightPanel.content;
		
		this.createdFrames = [];
		this.autoAddButtons = [];
		
		this.frameHolderWrapper = document.createElement("div");
		this.frameHolderWrapper.className = "ui-frameHolderWrapper";
		
		
		
		this.mm = mm;
		this.om = this.mm.project.plugins.objectmanager;
		
		var that = this;
		this.data = {};
		
		this.tv = new MT.ui.TreeView([], {root: pp.path});
		this.tv.tree.addClass("ui-keyframes-tree");
		
		this.tv.on("dblclick", function(e, item){
			//that.emit("select",item.data);
			var d = item.data;
			var movie;
			if(d.submovie){
				movie = d.name;
			}
			mm.selectObjectForce(mm.om.getById(d.objectId || d.id));
			mm.keyframes.setActiveMovie(movie);
		});
		
		
		this.scrollTop = 0;
		this.tv.tree.el.onscroll = function(){
			that.scrollTop = that.tv.tree.el.scrollTop;
			that.hideFrames();
			that.showFrames();
			
		};
		
		this.lastSelect = [];
		var select = function(data, el){
			that.lastSelect.push([select, data, el]);
			if(data.isMovie){
				that.unselect();
				that.active = el;
				el.addClass("active");
				return;
			}
			
			if(!data.isMovie || that.activeMovie == data.name){
				that.hideFrames();
				that.emit("select",data);
				that.showFrames();
				return;
			}
			
			
			that.activeMovie = data.name;
			that.markFirstFrame();
			
			that.hideFrames();
			that.showFrames();
			
			that.updateTree(data);
		};
		
		this.tv.on("click", function(data, el){
			select(data, el);
		});
		
		this.tv.on("open", function(el){
			select(el.data, el);
		});
		
		this.tv.on("close", function(el){
			that.hideFrames();
			
			//that.buildData();
			//that.tv.merge(that.data);
			
			that.showFrames();
		});
		
		this.tv.enableInput(ui.events);
		
		this.tv.disableRename();
		
		this.ui = ui;
		
		this.el = document.createElement("div");
		this.el.className = "ui-kf-container";
		
		this.label = document.createElement("div");
		this.label.innerHTML = this.name;
		this.label.className = "ui-kf-label";
		
		this.framesHolders = [];
		
		this.buildFrames();
		this.frames = frames;
		this.frameElements = [];
		
		this.d1 = d1;
		this.d2 = d2;
		
		this.addControls();
		
		this.show();
	},
	{
		activeMovie: "",
		reactivate: function(){
			var sel = this.lastSelect.pop();
			if(sel){
				sel[0](sel[1], sel[2]);
			}
		},
		getMovie: function(){
			if(!this.data || !this.data.movies){
				return null;
			}
			return this.data.movies[this.activeMovie];
		},
		get panels(){
			if(!this.panelCollections[this.data.id]){
				this.panelCollections[this.data.id] = {};
			}
			return this.panelCollections[this.data.id];
		},
		
		setData: function(data){
			this.hide();
			
			this.data = data;
			this.activeMovie = "";
			this.buildData();
			
			this.tv.merge([data]);//.contents);
			this.updateFrames();
		},
		
		buildData: function(){
			var movies = this.data.movies;
			var pp;
			for(var key in movies){
				if(key == this.mm.mainName){
					continue;
				}
				if(this.activeMovie == ""){
					this.activeMovie = key;
				}
				if(pp){
					this.createPanel(key, pp);
				}
				else{
					pp = this.createPanel(key, pp);
				}
			}
			if(this.activeMovie == ""){
				return;
			}
			this.fpsInput.setObject(this.data.movies[this.activeMovie].info);
		},
		
		rebuildData: function(){
			var pp;
			var p;
			for(var key in this.dataIn.movies){
				if(!this.panels[key]){
					p = this.createPanel(key, pp);
					p.show();
				}
				else if(!pp){
					pp = this.panels[key];
				}
			}
			this.show();
			this.panels[this.activeMovie].show();
		},
		
		updateTree: function(data){
			this.data = data;
			this.buildData();
			this.tv.merge(this.data);
			
			this.hideFrames();
			this.showFrames();
		},
		
		update: function(){
			this.hideFrames();
			this.showFrames();
		},
		createPanel: function(name, pp){
			var p = this.panels[name];
			if(p){
				p.hide();
				return p;
			}
			p = new MT.ui.Panel(name);
			p.name = name;
			this.panels[name] = p;
			p.fitIn();
			p.hide();
			if(pp){
				pp.addJoint(p);
			}
			else{
				p.show(this.mm.panel.content.el);
				p.fitIn();
			}
			p.el.style.height = "18px";
			p.el.style.paddingLeft = "70px";
			var that = this;
			p.on("show", function(){
				that.setActiveMovie(p.name, true);
			});
			p.on("rename", function(n, o){
				that.rename(n, o);
			});
			p.isRenamable = true;
			p.removeBorder();
			return p;
		},
		
		rename: function(newName, oldName){
			var item, movie;
			if(newName == "__main"){
				newName += "1";
			}
			
			for(var i in this.mm.items){
				item = this.mm.items[i];
				if(item.movies[newName]){
					continue;
				}
				
				movie = item.movies[oldName];
				delete item.movies[oldName];
				item.movies[newName] = movie;
			}
			
			var p = this.panels[oldName];
			delete this.panels[oldName];
			this.panels[newName] = p;
			p.name = newName;
			
			if(this.activeMovie == oldName){
				this.activeMovie = newName;
			}
			this.updateFrames();
			this.mm.om.sync();
		},
		
		removeConf: function(name){
			var pop = new MT.ui.Popup("Delete movie?", "Are you sure you want to delete movie: " + MT.core.Helper.htmlEntities(name) + "?");
			var that = this;
			pop.addButton("no", function(){
				pop.hide();
			});
			
			pop.addButton("yes", function(){
				that.remove(name);
				pop.hide();
			});
			
			pop.showClose();
		},
		
		remove: function(name){
			var item, movie;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				movie = item.movies[name];
				delete item.movies[name];
			}
			if(this.panels[name]){
				this.panels[name].close();
			}
			
			var k = Object.keys(this.data.movies);
			if(!k.length || (k.length == 1 && k[0] == "__main") ){
				this.mm.clear();
				this.activeMovie = null;
				this.mm.activeMovie = null;
				this.om.sync();
				
				this.mm.setActive(this.mm.data);
				return;
			}
			
			this.activeMovie = k[0];
			this.mm.redrawAll();
			
			this.om.sync();
			return 
		},
		
		isVisible: false,
		hide: function(){
			if(!this.isVisible){
				return;
			}
			this.isVisible = false;
			this.tv.tree.hide();
			this.hideFrames();
			if(this.controlsHolder.parentNode){
				this.controlsHolder.parentNode.removeChild(this.controlsHolder);
			}
			
			for(var key in this.panels){
				this.panels[key].hide();
			}
			this.mm.leftPanel.style.borderRightStyle = "none";
		},
		hideFrames: function(){
			if(this.frameHolderWrapper.parentNode){
				this.frameHolderWrapper.parentNode.removeChild(this.frameHolderWrapper);
			}
			
			for(var i=0; i<this.framesHolders.length; i++){
				this.framesHolders[i].hide();
			}
		},
		show: function(){
			if(this.isVisible){
				return;
			}
			this.isVisible = true;
			this.tv.tree.show(this.d1.el);
			
			if(this.panels[this.activeMovie]){
				this.panels[this.activeMovie].show();
			}
			this.mm.leftPanel.style.borderRightStyle = "solid";
			this.mm.leftPanel.content.el.appendChild(this.controlsHolder);
			this.showFrames();
		},
		
		showFrames: function(){
			this.d2.el.appendChild(this.frameHolderWrapper);
			
			var wrap = this.frameHolderWrapper;
			var it, f, b;
			var t = 7;
			var db = this.d2.bounds;
			var top;
			for(var i=0; i<this.tv.items.length; i++){
				f = this.framesHolders[i];
				if(!f){
					f = this.addFrameHolder();
				}
				var data = this.tv.items[i].data
				it = this.tv.items[i].head;
				if(this.active == this.tv.items[i]){
					f.addClass("active");
				}
				else{
					f.removeClass("active");
				}
				
				if(!it.isVisible){
					return;
				}
				
				b = it.bounds;
				
				if(data.unselectable){
					f.addClass("unselectable");
				}
				
				if(i==0){
					f.addClass("top");
					f.style.height = b.height + 2 +"px";
					top = (b.top - db.top + this.d2.el.scrollTop -1 - wrap.offsetTop);
				}
				else{
					f.removeClass("top");
					f.style.height = b.height + "px";
					 top = (b.top - db.top + this.d2.el.scrollTop +1 - wrap.offsetTop);
				}
				
				f.style.top = top + "px";
				f.el.data = data;
				
				if(b.height > 0){
					wrap.appendChild(f.el);
				}
				else{
					f.hide();
				}
			}
			
			this.tv.tree.el.scrollTop = this.scrollTop;
		},
		active: null,
		setActiveObject: function(id){
			this.unselect();
			var item = this.tv.getById(id);
			if(!item){
				return;
			}
			item.addClass("active");
			this.active = item;
			
		},
		
		unselect: function(){
			if(this.active){
				this.active.removeClass("active");
				this.active = null;
			}
		},
		buildFrames: function(){
			var it = this.tv.items;
			var f;
			for(var i=0; i<it.length; i++){
				f = this.addFrameHolder();
				this.markFrames(it[i], f.el);
			}
			
			this.firstFrame = this.framesHolders[0];
			this.makeControls();
		},
		
		addFrameHolder: function(){
			var f = new MT.ui.DomElement("div");
			f.addClass("ui-kf-frames");
			f.style.position = "absolute";
			this.framesHolders.push(f);
			f.el.innerHTML = "";
			return f;
		},
		
		updateFrames: function(){
			this.lastFrameAccessed = 0;
			this.autoAddInc = 0;
			
			
			var it = this.tv.items;
			var f;
			for(var i=0; i<it.length; i++){
				f = this.framesHolders[i];
				if(!f){
					f = this.addFrameHolder();
				}
				
				while(f.el.firstChild){
					f.el.removeChild(f.el.firstChild);
				}
				this.markFrames(it[i], f.el);
			}
			
			this.firstFrame = this.framesHolders[0];
		},
		
		makeControls: function(){
			
		},
		
		
		markFrames: function(item, track){
			if(!this.activeMovie){
				return;
			}
			
			var mo = item.data;
			if(!mo.movies || !mo.movies[this.activeMovie]){
				this.mm.addMovie(mo, this.activeMovie);
			}
			var movie = mo.movies[this.activeMovie];
			var frames = movie.frames;
			if(!frames){
				this.mm.addMovie(mo, this.activeMovie);
				movie = mo.movies[this.activeMovie];
				frames = movie.frames;
			}
			
			this.addAutoFrame(item.data, movie, track);
			for(var i=0; i<frames.length; i++){
				this.drawFrame(frames, i, track, movie, item.data);
			}
		},
		
		lastFrameAccessed: 0,
		getFrameElement: function(){
			var el = this.createdFrames[this.lastFrameAccessed];
			this.lastFrameAccessed++;
			if(!el){
				el = document.createElement("span");
				this.createdFrames.push(el);
			}
			else{
				if(el.parentNode){
					el.parentNode.removeChild(el);
				}
			}
			return el;
		},
		
		drawFrame: function(frames, index, track, item){
			if(frames[index].keyframe < this.mm.startFrame - 1){
				return;
			}
			
			var el = this.getFrameElement();
			var item = frames[index];
			var startFrame = this.mm.startFrame;
			if(this.mm.selectedFrame == item){
				el.className = "ui-kf-frame active";
			}
			else{
				el.className = "ui-kf-frame";
			}
			track.appendChild(el);
			
			var w = this.mm.frameSize;
			
			el.style.width = w + "px";
			el.style.left = (item.keyframe * w + this.mm.frameOffset) - startFrame * w + "px";

			el.frameInfo = {
				frames: frames,
				index: index
			};
		},
		autoAddInc: 0,
		addAutoFrame: function(item, movie, track){
			if(item.unselectable){
				return;
			}
			var butt = this.autoAddButtons[this.autoAddInc];
			this.autoAddInc++;
			if(!butt){
				butt = new MT.ui.DomElement("span");
				this.autoAddButtons.push(butt);
			}
			else{
				if(butt.el.parentNode){
					butt.el.parentNode.removeChild(butt.el);
				}
			}
			
			butt.addClass("ui-autoFrame ui-button style2");
			butt.el.autoframe = item;
			if(item.autoframe){
				butt.addClass("active");
			}
			track.appendChild(butt.el);
		},
		
		controlsHolder: null,
		stop: null,
		_looptm: 0,
		addControls: function(){
			this.controlsHolder = document.createElement("div");
			this.controlsHolder.className = "ui-keyframes-controls";
			var c = {};
			
			c.play = document.createElement("div");
			c.play.className = "ui-keyframes-play";
			
			c.stop = document.createElement("div");
			c.stop.className = "ui-keyframes-stop";
			
			this.d1.el.appendChild(this.controlsHolder);
			
			c.delete = document.createElement("div");
			c.delete.className = "ui-keyframes-delete";
			
			var fps = {fps: 60};
			this.fpsInput = new MT.ui.Input(this.ui, {key: "fps", min: 1}, fps);
			this.fpsInput.el.className += " keyframes-fps";
			this.controlsHolder.appendChild(this.fpsInput.el);
			var that = this;
			this.fpsInput.on("change", function(val){
				var mov = that.getMovie();
				if(!mov){
					return;
				}
				mov.info.fps = val;
				
				that.mm.redrawAll();
			});
			
			for(var k in c){
				this.controlsHolder.appendChild(c[k]);
			}
			
			var isPlaying = false;
			var currFrame = this.mm.activeFrame;
			var that = this;
			
			
			var playStartFrame = 0;
			
			var next;
			
			var start = Date.now();
			
			
			var settings = this.mm.project.data;
			
			
			var loop = function(reset){
				if(reset){
					start = Date.now();
				}
				if(!isPlaying){
					return;
				}
				if(settings.timeline.skipFrames){
					loopSkipFrames();
					return;
				}
				
				next = that.mm.activeFrame + 1;
				if(next > that.getLastFrame()){
					next = 0;
				}
				
				that.mm.changeFrame(next);
				that.looptm = window.setTimeout(loop, 1000/that.getFps());
			};
			
			var loopSkipFrames = function(reset){
				if(reset){
					start = Date.now();
				}
				if(!isPlaying){
					return;
				}
				
				next = that.mm.activeFrame + 1;
				if(next > that.getLastFrame()){
					next = 0;
				}
				
				that.mm.changeFrame(next);
				var step = 1000/that.getFps();
				var tm = step - (Date.now() - start);
				while(tm < 0){
					tm += step;
					that.mm.activeFrame++;
				}
				start = Date.now();
				that.looptm = window.setTimeout(loop, tm);
			};
			
			var playPause = function(){
				if(!isPlaying){
					c.play.className = "ui-keyframes-pause";
					isPlaying = true;
					playStartFrame = that.mm.activeFrame;
					loop(true);
				}
				else{
					isPlaying = false;
					c.play.className = "ui-keyframes-play";
				}
			};
			
			var stop = this.stop = function(){
				if(!isPlaying){
					playStartFrame = 0;
				}
				isPlaying = false;
				that.mm.changeFrame(playStartFrame);
				c.play.className = "ui-keyframes-play";
			};
			
			
			this.controlsHolder.onmousedown = function(e){
				e.preventDefault();
				e.stopPropagation();
			};
			
			this.controlsHolder.onclick = function(e){
				if(e.target == c.play){
					playPause();
					e.preventDefault();
					e.stopPropagation();
				}
				if(e.target == c.stop){
					stop();
					e.preventDefault();
					e.stopPropagation();
				}
				if(e.target == c.delete){
					that.removeConf(that.activeMovie);
				}
			};
			this.controls = c;
		},
		
		hideDelete: function(){
			console.log("hide DELETE!");
			this.controls.delete.style.display = "none";
		},
		
		getLastFrame: function(){
			
			var movie = this.getMovie();
			if(!movie){
				return 60;
			}
			
			if(movie.info.lastFrame){
				return movie.info.lastFrame;
			}
			
			var max = 0;
			var items = this.mm.items;
			var m, l, mov;
			
			for(var key in items){
				m = items[key].movies;
				if(!m || !m[this.activeMovie]){
					continue;
				}
				mov = m[this.activeMovie].frames;
				if(!mov.length){
					continue;
				}
				l = mov[mov.length - 1];
				if(max < l.keyframe){
					max = l.keyframe;
				}
			}
			
			movie.info.lastFrame = max || 60;
			return max;
		},
		getFps: function(){
			if(this.activeMovie == "" || !this.data || !this.data.movies || !this.data.movies[this.activeMovie]){
				return 60;
			}
			
			
			return this.data.movies[this.activeMovie].info.fps;
		},
		
		markFirstFrame: function(){
			this.mm.changeFrame(0);
			var item, frameData;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				
				if(!item.movies){
					this.mm.addMovie(item, this.activeMovie);
				}
				
				frameData = item.movies[this.activeMovie].frames[0];
				if(frameData){
					if(frameData.keyframe == void(0)){
						frameData.keyframe = 0;
					}
					this.mm.loadState(i, frameData, 0);
				}
				else{
					frameData = this.mm.collect(item);
					frameData.keyframe = 0;
					item.movies[this.activeMovie] = [frameData];
				}
			}
			
			this.updateFrames();
		},
		
		saveActiveFrame: function(ni, all){
			if(!this.activeMovie){
				return;
			}
			var item, frameData;
			var movie;
			var found = false;
			var needSave = false;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				if(this.parent == item){
					//continue;
				}
				if(!all && this.active && this.active.data.id && this.active.data.id != item.id){
					continue;
				}
				if(!item.movies){
					this.mm.addMovie(item, this.activeMovie);
				}
				movie = item.movies[this.activeMovie];
				if(!movie){
					this.mm.clear();
					return;
				}
				found = false;
				for(var j=0; j<movie.frames.length; j++){
					frameData = movie.frames[j];
					if(frameData.keyframe == this.mm.activeFrame){
						movie.frames[j] = this.mm.collect(item, this.mm.activeFrame, movie.frames[j]);
						needSave = true;
						found = true;
						break;
					}
				}
				if(!found && !ni){
					frameData = this.mm.collect(item, this.mm.activeFrame);
					movie.frames.push(frameData);
					needSave = true;
				}
			}
			this.sortFrames();
			this.updateFrames();
			if(needSave){
				this.om.sync();
			}
		},
		
		sortFrames: function(){
			var item, movie;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				for(var m in item.movies){
					movie = item.movies[m];
					movie.frames.sort(function(a,b){
						return a.keyframe - b.keyframe;
					});
				}
			}
		},
		
		removeFrame: function(){
			if(this.mm.activeFrame === 0){
				return;
			}
			var item, frameData;
			var movie;
			var found = false;
			for(var i in this.mm.items){
				item = this.mm.items[i];
				movie = item.movies[this.activeMovie];
				found = false;
				for(var j=0; j<movie.length; j++){
					frameData = movie[j];
					if(frameData.keyframe  == this.mm.activeFrame){
						movie.splice(j, 1);
						break;
					}
				}
			}
			
			
			this.updateFrames();
		},
		changeFrame: function(frame){
			
			var item, frameData;
			var movie, frames;
			var found = false;
			var start = 0;
			var end = 0;
			
			for(var i in this.mm.items){
				item = this.mm.items[i];
				if(!item.movies){
					continue;
				}
				
				movie = item.movies[this.activeMovie];
				if(!movie){
					continue;
				}
				frames = movie.frames;
				found = false;
				start = end = 0; 
				// check keyframe
				for(var j=0; j<frames.length; j++){
					frameData = frames[j];
					if(frameData.keyframe  < frame){
						start = j;
					}
					
					if(frameData.keyframe  == frame){
						found = true;
						this.mm.loadState(i, frameData, frameData.keyframe );
						break;
					}
					
					if(frameData.keyframe  > frame){
						end = j;
						break;
					}
				}
				
				if(found){
					continue;
				}
				
				// only 1 frame has been found
				if(start == end){
					this.mm.loadState(i, frames[start], start);
					continue;
				}
				
				// final frame
				if(start > end){
					this.mm.loadState(i, frames[start], start);
					continue;
				}
				
				// interpolate between frames
				this.mm.interpolate(i, frames[start], frames[end], frame);
				
				
				
			}
		},
		
		markActive: function(data){
			
		},
		
		addEvents: function(){
			
		},
		
		setActiveFrame: function(index){
			if(this.active > -1){
				this.frameElements[this.active].removeClass("active");
			}
			
			this.active = index;
			this.frameElements[this.active].addClass("active");
			
			this.emit("frameChanged", this.active);
		},
		
		setActiveMovie: function(name, fromPanel){
			if(!this.data.movies || !this.data.movies[name]){
				console.log("SHOW?", this.panels);
				return;
			}
			
			this.activeMovie = name;
			this.mm.changeFrame(0);
			this.fpsInput.setObject(this.data.movies[this.activeMovie].info);
			this.updateFrames();
			if(!fromPanel){
				this.panels[name].show();
			}
		},


	}
);
//MT/plugins/MapEditor.js
MT.namespace('plugins');
"use strict";
(function(){
	var phaserSrc = "js/phaser/";
	//var pixiSrc = phaserSrc;
	phaserSrc += (window.release ? "phaser-arcade-physics.min-2.4.4.js" : "phaser-arcade-physics-2.4.4.js");
	//pixiSrc += (window.release ? "pixi.min.js" : "pixi.js");

	MT.requireFilesSync([
		phaserSrc, "js/phaser/phaserHacks.js"
	]);

	/*
	MT.requireFile(phaserSrc, function(){
		MT.requireFile("js/phaser/pixi.js");
		MT.requireFile("js/phaser/geom.js", function(){
			MT.requireFile("js/phaser/components.js", function(){
				MT.requireFile("js/phaser/text.js");
				MT.requireFile("js/phaserHacks.js");
			});
		});
	});
	*/
})();
MT.require("core.Helper");
MT.require("core.Selector");
MT.require("core.MagicObject");

MT.MAP_OBECTS_ADDED = "MAP_OBECTS_ADDED";
MT.SYNC = "SYNC";


MT.plugins.MapEditor = MT.extend("core.Emitter").extend("core.BasicPlugin")(
	function(project){
		MT.core.BasicPlugin.call(this, "map");

		this.project = project;

		this.assets = [];

		this.objects = [];
		this.tmpObjects = [];
		this.oldObjects = [];

		this.groups = [];
		this.oldGroups = [];


		this.loadedObjects = [];

		this.tileLayers = [];

		this.dist = {};
		this.cache = {};

		this.selection = new Phaser.Rectangle();

		this.selector = new MT.core.Selector();

		this.helperBoxSize = 6;


		this.settings = {
			cameraX: 0,
			cameraY: 0,

			worldWidth: 800,
			worldHeight: 480,

			viewportWidth: 800,
			viewportHeight: 480,

			scaleMode: "SHOW_ALL",

			gridX: 32,
			gridY: 32,

			gridOffsetX: 0,
			gridOffsetY: 0,

			showGrid: 1,
			gridOpacity: 0.3,
			backgroundColor: "#111111",

			movieInfo: {
				fps: 60,
				lastFrame: 60
			},
			pixelPerfectPicking: 1
		};


		this.zoom = 1;

		window.map = this;
	},
	{
		_mousedown: false,

		setZoom: function(zoom){
			this.zoom = 1/zoom;
			this.resize();

		},

		/* basic pluginf fns */
		initUI: function(ui){
			this.ui = ui;

			var that = this;

			this.panel = ui.createPanel("Map editor");
			this.panel.on("show", function(){
				that.ui.refresh();
			});
			ui.setCenter(this.panel);

			this.ui.on(ui.events.RESIZE,function(){
				that.resize();
			});

			this.selector.on("unselect", function(obj){
				that.emit(MT.OBJECT_UNSELECTED, obj);
			});

			this.createMap();

			var tools = this.project.plugins.tools;
			var om = this.project.plugins.objectmanager;

			var mdown = false;

			ui.events.on(ui.events.MOUSEDOWN, function(e){
				if(e.target != game.canvas){
					return;
				}
				mdown = true;
				that.handleMouseDown(e);
			});

			this.isCtrlDown = false;

			ui.events.on(ui.events.MOUSEUP, function(e){
				that.handleMouseUp(e);
				mdown = false;
			});


			var dx = 0;
			var dy = 0;

			ui.events.on(ui.events.MOUSEMOVE, function(e){
				if( e.target != game.canvas && e.button != 2 && !mdown){
					return;
				}

				//strange chrome bug
				if(that.handleMouseMove === void(0)){
					return;
				}

				that.handleMouseMove(e);
			});

			ui.events.on(ui.events.KEYDOWN, function(e){
				var w = e.which;

				if(e.ctrlKey){
					that.isCtrlDown = true;
				}

				if( (e.target != game.canvas && e.target != document.body) ){
					return;
				}

				//escape
				if(w == MT.keys.ESC){
					that.activeObject = null;
					that.selector.clear();
					return;
				}

				that.selector.forEach(function(obj){
					that.moveByKey(e, obj);
				});
			});

			ui.events.on(ui.events.KEYUP, function(e){
				that.isCtrlDown = false;

				if(e.which == MT.keys.G){
					var first = that.selector.get(0)
					if(first && first.parent && first.parent.magic){
						that.activeObject = first.parent.magic;
						that.selector.clear();
						that.selector.add(that.activeObject);
					}
				}
				om.sync();
			});

		},

		installUI: function(){
			var that = this;

			this.tools = this.project.plugins.tools;

			this.project.plugins.assetmanager.on(MT.ASSETS_UPDATED, function(data){
				that.addAssets(data);
			});

			this.project.plugins.objectmanager.on(MT.OBJECTS_UPDATED, function(data){
				that.addObjects(data);
			});

			this.project.plugins.objectmanager.on(MT.OBJECT_DELETED, function(id){
				var tmp;
				for(var i=0; i<that.loadedObjects.length; i++){
					tmp = that.loadedObjects[i];

					if(tmp.id == id){
						that.loadedObjects.splice(i, 1);
						that.cache[id] = null;
						tmp.remove();
						if(that.activeObject == tmp){
							that.activeObject = null;
						}
						return;
					}
				}

			});

			this.tools.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				if(that.activeObject){
					that.activeObject.frame = frame;
					that.sync();
				}
			});

		},

		createMap: function(){

			if(this.game){
				this.game.canvas.parentNode.removeChild(this.game.canvas);
				this.game.destroy();
			}

			var that = this;
			this.activeObject = null;

			var canvas, ctx = null, FG = null;
			var drawObjects = function(obj){
				obj.highlight(ctx);
			};

			var mode = Phaser.CANVAS;
			if(this.project.data.webGl){
				mode = Phaser.AUTO;
			}

			var game = this.game = window.game = new Phaser.Game(800, 600, mode, '', {
				preload: function(){
					game.stage.disableVisibilityChange = true;
					var c = game.canvas;
					if(!c.parentNode){
						return;
					}
					c.parentNode.removeChild(c);
					that.panel.content.el.appendChild(c);
					c.style.position = "relative";
					that.panel.content.style.overflow = "hidden";

				},
				create: function(){
					that.resize();
					that.scale = game.camera.scale;

					that.setCameraBounds();
					that.postUpdateSetting();

					// create canvas for grid BG
					that.fgcanvas = canvas = document.createElement("canvas");
					canvas.width = game.canvas.width;
					canvas.height = game.canvas.height;
					game.cache.addImage("__gridBG","__gridBG", canvas);
					ctx = canvas.getContext("2d");
					ctx.fillStyle = "#ff0000";
					ctx.fillRect(10, 10, 40, 50);
					// end grid canvas
					// grid sprite
					FG = window.FG = game.add.sprite(0, 0, "__gridBG", 0);
					FG.fixedToCamera = true;
					FG.bringToTop();
					// end grid sprite


					var graphics = window.graphics = new Phaser.Graphics();
					// begin a green fill..
					graphics.beginFill(0xffffff);
					// top
					graphics.drawRect(0, 0, that.game.canvas.width, -that.game.camera.y);
					// right
					graphics.drawRect(that.settings.viewportWidth, -that.game.camera.y, that.game.canvas.width, that.settings.viewportHeight);
					// bottom
					graphics.drawRect(0, that.settings.viewportWidth, that.game.canvas.width, that.game.canvas.height);
					// left
					graphics.drawRect(0, -that.game.camera.y, -that.game.camera.x, that.settings.viewportHeight);
					// end the fill
					graphics.endFill();
					graphics.alpha = 0.05;

					// TODO: bug
					game.stage.addChild(graphics);
					graphics.game = game;

					//graphics.postUpdate = graphics.preUpdate = function(){};

					graphics._update = function(){
						//graphics.x = -that.game.camera.x;
						//graphics.y = -that.game.camera.y;
						var shape;
						//update top
						//graphics.graphicsData[0].points[2] = that.game.canvas.width;
						//graphics.graphicsData[0].points[3] = -that.game.camera.y;
						shape = graphics.graphicsData[0].shape;
						shape.width = that.game.canvas.width;
						shape.height = -that.game.camera.y;

						// update right

						/*graphics.graphicsData[1].points[0] = (that.settings.viewportWidth* that.game.camera.scale.x - that.game.camera.x) ;
						graphics.graphicsData[1].points[1] = -that.game.camera.y;
						graphics.graphicsData[1].points[2] = that.game.canvas.width + that.game.camera.x;
						graphics.graphicsData[1].points[3] = that.settings.viewportHeight* that.game.camera.scale.y;
						*/


						shape = graphics.graphicsData[1].shape;
						shape.x = (that.settings.viewportWidth* that.game.camera.scale.x - that.game.camera.x);
						shape.y = -that.game.camera.y;
						shape.width = that.game.canvas.width + that.game.camera.x;
						shape.height = that.settings.viewportHeight* that.game.camera.scale.y;



						// update bottom
						/*graphics.graphicsData[2].points[1] = that.settings.viewportHeight* that.game.camera.scale.y - that.game.camera.y;
						graphics.graphicsData[2].points[2] = that.game.canvas.width;
						graphics.graphicsData[2].points[3] = that.game.canvas.height + that.game.camera.y;
						*/
						shape = graphics.graphicsData[2].shape;
						shape.y = that.settings.viewportHeight* that.game.camera.scale.y - that.game.camera.y;
						shape.width = that.game.canvas.width;
						shape.height = that.game.canvas.height + that.game.camera.y;


						// update left
						/*
						graphics.graphicsData[3].points[1] = -that.game.camera.y;
						graphics.graphicsData[3].points[2] = -that.game.camera.x;
						graphics.graphicsData[3].points[3] = that.settings.viewportHeight* that.game.camera.scale.y;
						*/
						shape = graphics.graphicsData[3].shape;
						shape.y = -that.game.camera.y;
						shape.width = -that.game.camera.x;
						shape.height = that.settings.viewportHeight* that.game.camera.scale.y;
						//graphics.drawRect(0, 0, that.settings.width, that.settings.height);

						// buggy buggy
						graphics.webGLDirty = true;
						graphics.clearDirty = true;
					};

					// add it the stage so we see it on our screens..

					//graphics.parent = map.game.stage;

				},


				preRender: function(){
					//return;

					//FG.width = canvas.width;
					//FG.height = canvas.height;
					//console.log("PRE render");
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					that.drawGrid(ctx);


					that.selector.forEach(drawObjects);

					that.drawSelection(ctx);

					that.highlightDublicates(ctx);

					that.drawPhysics(ctx);

					FG.bringToTop();
					FG.texture.baseTexture.unloadFromGPU();
					//FG.loadTexture("__gridBG")
					FG.scale.set(1/game.camera.scale.x, 1/game.camera.scale.y);
					// force PIXI to reload Texture

					//
					graphics._update();
				},

				update: function(){

				},
			});


		},
		update: function(){
			var tmp;
			return;
			for(var i=0; i<this.loadedObjects.length; i++){
				tmp = this.loadedObjects[i];
				tmp.updateBox();
			}
		},

		resize: function(){
			if(!this.game || !this.game.world){
				return;
			}

			this.game.width = this.panel.content.el.offsetWidth;
			this.game.height = this.panel.content.el.offsetHeight;

			if(window.FG){
				this.fgcanvas.width = FG.texture.baseTexture.width = this.game.canvas.width;// / game.camera.scale.x;
				this.fgcanvas.height = FG.texture.baseTexture.height = this.game.canvas.height;//  / game.camera.scale.y;
				FG.texture.frame.width = FG.texture.crop.width = this.game.width;
				FG.texture.frame.height = FG.texture.crop.height = this.game.height;
			}

			this.game.renderer.resize(this.game.width, this.game.height);

			this.setCameraBounds();
			this.reloadObjectsDelayed();
		},
		_reloadDelay: 0,
		reloadObjectsDelayed: function(){
			if(this._reloadDelay){
				window.clearTimeout(this._reloadDelay);
			}
			var that = this;
			this._reloadDelay = window.setTimeout(function(){
				that._reloadDelay = 0;
				that.reloadObjects();
			}, 500);
		},
		setCameraBounds: function(){

			this.game.camera.bounds.x = -Infinity;
			this.game.camera.bounds.y = -Infinity;
			this.game.camera.bounds.width = Infinity;
			this.game.camera.bounds.height = Infinity;


			//this.game.canvas.style.width = "100%";
			//this.game.canvas.style.height = "100%";

			this.game.camera.view.width = this.game.canvas.width/this.game.camera.scale.x;
			this.game.camera.view.height = this.game.canvas.height/this.game.camera.scale.y;

		},

		updateSettings: function(obj){
			if(!obj){
				return;
			}

			for(var i in obj){
				this.settings[i] = obj[i];
			}

			if(!this.game.isBooted || !this.game.width){
				return;
			}

			this.postUpdateSetting();
			this.project.plugins.settings.update();
		},

		postUpdateSetting: function(){
			this.game.width = this.settings.worldWidth;
			this.game.height = this.settings.worldHeight;
			this.setCameraBounds();

			this.game.camera.x = this.settings.cameraX;
			this.game.camera.y = this.settings.cameraY;

			var tmp = this.settings.backgroundColor.substring(1);
			var bg = parseInt(tmp, 16);

			if(this.game.stage.backgroundColor != bg){
				this.game.stage.setBackgroundColor(bg);
			}

			this.update();
		},

		/* drawing fns */
		drawGrid: function(ctx){
			if(!this.settings.showGrid || this.settings.gridOpacity == 0){
				return;
			}

			var alpha = ctx.globalAlpha;

			var g = 0;
			var game = this.game;


			ctx.globalAlpha = this.settings.gridOpacity;

			ctx.save();

			ctx.scale(this.game.camera.scale.x, this.game.camera.scale.y);

			ctx.beginPath();

			var bg = game.stage.backgroundColor;
			var inv = 0xffffff;//parseInt("FFFFFF", 16);
			var xx = (inv - bg).toString(16);
			while(xx.length < 6){
				xx = "0"+xx;
			}

			if(parseInt(xx, 16) - bg < 10){
				xx = "#000000";
			}

			ctx.strokeStyle = "#"+xx;

			var offx = this.settings.gridOffsetX % this.settings.gridX - this.settings.gridX;
			var offy = this.settings.gridOffsetY % this.settings.gridY - this.settings.gridY;

			var ox = game.camera.x/this.scale.x % this.settings.gridX - offx;
			var oy = game.camera.y/this.scale.y % this.settings.gridY - offy;

			var width = game.canvas.width/game.camera.scale.x - offx;
			var height = game.canvas.height/game.camera.scale.y - offy;



			g = this.settings.gridX;

			ctx.lineWidth = 0.2;

			ctx.shadowColor = '#000';
			ctx.shadowBlur = 0;
			ctx.shadowOffsetX = 0.5;
			ctx.shadowOffsetY = 0;


			ctx.beginPath();
			for(var i = -ox; i<width; i += g){
				if(i < 0){
					continue;
				}
				ctx.moveTo(i+0.5, 0.5);
				ctx.lineTo(i+0.5, height+0.5);
			}
			ctx.stroke();

			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0.5;

			ctx.beginPath();
			g = this.settings.gridY;
			for(var j = -oy; j<height; j += g){
				if(j < 0){
					continue;
				}
				ctx.moveTo(0.5, j+0.5);
				ctx.lineTo(width+0.5, j+0.5);
			}
			ctx.stroke();

			ctx.lineWidth = 0.5;
			ctx.beginPath();

			ctx.moveTo(0, -game.camera.y/this.scale.y);
			ctx.lineTo(width, -game.camera.y/this.scale.y);

			ctx.moveTo(-game.camera.x/this.scale.x, 0);
			ctx.lineTo(-game.camera.x/this.scale.x, height);


			ctx.stroke();
			ctx.restore();

			ctx.globalAlpha = alpha;
		},

		highlightObject: function(ctx, obj){
			if(!obj){
				return;
			}

			if(!obj.game || !obj.parent){
				obj = this.getById(obj.id);
				if(!obj){
					return;
				}
			}

			if(!this.isVisible(obj)){
				return;
			}

			/*var matrix = obj.xxx.matrix;
			if(!matrix){
				matrix = [1, 0, 0, 1, 0, 0, 0, 0];
				obj.xxx.matrix = matrix;

			}*/

			var alpha = ctx.globalAlpha;

			var bounds = obj.getBounds();
			var group = null;

			if(obj.type == MT.objectTypes.GROUP){
				group = obj;
			}
			else{
				group = obj.parent || game.world;
			}

			var x = this.getObjectOffsetX(group);
			var y = this.getObjectOffsetY(group);


			ctx.save();

			ctx.translate(0.5,0.5);

			if(this.activeObject == obj){
				ctx.strokeStyle = "rgb(255,0,0)";
				ctx.lineWidth = 1;


				var off = this.helperBoxSize;
				var sx = bounds.x-off*0.5 | 0;
				var dx = sx + bounds.width | 0;

				var sy = bounds.y-off*0.5 | 0;
				var dy = sy + bounds.height | 0;

				if(obj.data.type == MT.objectTypes.TEXT){
					var width = bounds.width;
					if(obj.wordWrap){
						width = obj.wordWrapWidth*this.game.camera.scale.x | 0;

						ctx.strokeRect(bounds.x - off | 0, sy + bounds.height*0.5 | 0, off, off);
						ctx.strokeRect(bounds.x + width | 0, sy + bounds.height*0.5 | 0, off, off);

					}

					ctx.strokeRect(bounds.x | 0, bounds.y | 0, width | 0, bounds.height | 0);
				}
				else{
					if(obj.type == Phaser.SPRITE){
						obj.updateTransform();
						var mat = obj.worldTransform;
						var ax = mat.tx;
						var ay = mat.ty;
						var angle = obj.rotation;
						var par = obj.parent;
						while(par){
							angle += par.rotation;
							par = par.parent;
						}

						var x, y, dx, dy;

						ctx.strokeStyle = "#ffee22";
						ctx.beginPath();
						ctx.arc(ax, ay, 5, 0, 2*Math.PI);
						ctx.stroke();


						ctx.strokeStyle = "#ff0000";
						// top left
						x = mat.tx - obj.width*(obj.anchor.x);
						y = mat.ty - obj.height*(obj.anchor.y);

						dx = this.rpx(angle, x, y, ax, ay);
						dy = this.rpy(angle, x, y, ax, ay);
						ctx.beginPath();
						ctx.arc(dx, dy, 5, 0, 2*Math.PI);
						ctx.stroke();


						// top right
						x = mat.tx + obj.width*(1-obj.anchor.x);
						y = mat.ty - obj.height*(obj.anchor.y);

						dx = this.rpx(angle, x, y, ax, ay);
						dy = this.rpy(angle, x, y, ax, ay);
						ctx.beginPath();
						ctx.arc(dx, dy, 5, 0, 2*Math.PI);
						ctx.stroke();


						// bottom left
						x = mat.tx - obj.width*(obj.anchor.x);
						y = mat.ty + obj.height*(1 - obj.anchor.y);

						dx = this.rpx(angle, x, y, ax, ay);
						dy = this.rpy(angle, x, y, ax, ay);
						ctx.beginPath();
						ctx.arc(dx, dy, 5, 0, 2*Math.PI);
						ctx.stroke();

						// bottom right
						x = mat.tx + obj.width*(1- obj.anchor.x);
						y = mat.ty + obj.height*(1- obj.anchor.y);

						dx = this.rpx(angle, x, y, ax, ay);
						dy = this.rpy(angle, x, y, ax, ay);
						ctx.beginPath();
						ctx.arc(dx, dy, 5, 0, 2*Math.PI);
						ctx.stroke();

						return;

						/*
						ctx.beginPath();
						ctx.moveTo(sx + off, bounds.y);
						ctx.lineTo(dx, bounds.y);

						ctx.moveTo(sx + off, bounds.y + bounds.height);
						ctx.lineTo(dx, bounds.y + bounds.height);

						ctx.moveTo(bounds.x, sy + off);
						ctx.lineTo(bounds.x, dy);

						ctx.moveTo(bounds.x + bounds.width, sy + off);
						ctx.lineTo(bounds.x + bounds.width, dy);

						ctx.stroke();

						//if(this.tools.activeTool.resize){
							ctx.strokeRect(sx, sy, off, off);
							ctx.strokeRect(sx, dy, off, off);
							ctx.strokeRect(dx, sy, off, off);
							ctx.strokeRect(dx, dy, off, off);
						/*}
						else{
							var d =  Math.sqrt((dx - sx)*(dx - sx) + (dy - sy)*(dy - sy)) * 0.02;

							sx += off*0.5 + d;
							sy += off*0.5 + d;
							dx += off*0.5 - d;
							dy += off*0.5 - d;


							ctx.beginPath();
							ctx.arc(sx, sy, 10, 1*Math.PI, 1.5*Math.PI);
							ctx.stroke();

							ctx.beginPath();
							ctx.arc(sx, dy, 10, 0.5*Math.PI, 1.0*Math.PI);
							ctx.stroke();

							ctx.beginPath();
							ctx.arc(dx, sy, 10, 1.5*Math.PI, 2*Math.PI);
							ctx.stroke();

							ctx.beginPath();
							ctx.arc(dx, dy, 10, 0*Math.PI, 0.5*Math.PI);
							ctx.stroke();
						}

						var ax = obj.scale.x > 0 ? obj.anchor.x : 1 - obj.anchor.x;
						var ay = obj.scale.y > 0 ? obj.anchor.y : 1 - obj.anchor.y;

						var tx = (obj.x* this.scale.x) - this.game.camera.x;
						var ty = (obj.y* this.scale.x) - this.game.camera.y ;

						/*
						tx = tx;
						ty = ty * this.scale.x;

						ctx.save()
						ctx.beginPath();
						//ctx.scale(this.scale.x, this.scale.x);
						ctx.translate(tx, ty);
						ctx.rotate(obj.rotation);

						ctx.strokeStyle = "#ffaa00";
						ctx.fillStyle = "rgba(0,0,0,0.5)";

						ctx.arc(0 , 0, off*0.5, 0, 2*Math.PI);
						ctx.fill();
						ctx.stroke();

						var h = -obj.height*this.scale.x*0.5;
						var w = -obj.width*this.scale.x*0.5
						var height = -50 - Math.sqrt(h*h+w*w);

						ctx.beginPath();
						ctx.moveTo(0, 0);
						ctx.lineTo(0, height + off*0.5);
						ctx.stroke();

						ctx.strokeRect(-off*0.5, height - off*0.5, off, off);



						ctx.restore();

						*/

					}

					else{ //(obj.type == Phaser.GROUP ){
						ctx.strokeRect(bounds.x | 0, bounds.y | 0, bounds.width | 0, bounds.height | 0);
					}
					if(obj.type != Phaser.TILE_LAYER){
					//	ctx.strokeRect((bounds.x  - this.game.camera.x) | 0, (bounds.y - this.game.camera.y) | 0 , bounds.width | 0, bounds.height | 0);
					}



				}
			}
			else{
				ctx.strokeStyle = "rgb(255,100,0)";
				ctx.strokeRect(bounds.x | 0, bounds.y | 0, bounds.width, bounds.height);
			}




			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = 1;



			var par = group.parent;
			var oo = [];
			while(par){
				oo.push({x: par.x, y: par.y, r: par.rotation});
				par = par.parent;
			}

			while(oo.length){
				var p = oo.pop();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.r);
				ctx.translate(-p.x, -p.y);
			}

			ctx.translate(x, y);
			ctx.rotate(group.rotation);
			ctx.translate(-x, -y);

			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x, y - 16);
			ctx.stroke();
			ctx.strokeRect(x - 4, y - 4, 8, 8);


			ctx.globalAlpha = alpha;
			ctx.restore();
		},

		drawPhysics: function(ctx){
			if(!this.enabledPhysics){
				return;
			}
			for(var i=0; i<this.loadedObjects.length; i++){
				this.drawPhysicsBody(ctx, this.loadedObjects[i]);
			}
		},

		drawPhysicsBody: function(ctx, obj){

			if(!obj){
				return;
			}

			if(!obj.game || !obj.parent){
				obj = this.getById(obj.id);
				if(!obj){
					return;
				}
			}

			if(!obj.isVisible){
				return;
			}
			if(obj.type == MT.objectTypes.GROUP){
				return;
			}

			var p = obj.data.physics;
			if(!p || !p.enable){
				var pp = obj.object.parent;
				if(obj.parent == obj.game.world){
					pp = this.settings.physics;
				}
				else{
					pp = pp.magic.data.physics;
				}
				if(!pp || !pp.enable){
					return;
				}
				p = pp;
			}


			var alpha = ctx.globalAlpha;
			//this.object.updateTransform();

			var mat = obj.object.worldTransform

			var x = mat.tx;
			var y = mat.ty;

			ctx.save();

			ctx.fillStyle = "rgb(100,200,70)";
			ctx.globalAlpha = 0.2;

			var w = obj.width;
			var h = obj.height;

			if(p.size.width > 0){
				w = p.size.width;
			}
			if(p.size.height > 0){
				h = p.size.height;
			}

			w = w * obj.scaleX;
			h = h * obj.scaleY;

			ctx.translate(mat.tx, mat.ty);
			ctx.rotate(obj.object.rotation);
			ctx.scale(this.scale.x, this.scale.y);

			//ctx.setTransform(mat.a, -mat.b, -mat.c, mat.d, mat.tx, mat.ty);

			ctx.fillRect(-w*obj.object.anchor.x + p.size.offsetX,-h*obj.object.anchor.y + p.size.offsetY, w, h);
			ctx.restore();
		},

		drawSelection: function(ctx){

			if(this.selection.empty){
				return;
			}

			ctx.save();

			ctx.strokeStyle = "rgba(0,70, 150, 0.8)";
			ctx.fillStyle = "rgba(0,70, 150, 0.2)";

			ctx.strokeRect(this.selection.x - this.game.camera.x, this.selection.y - this.game.camera.y, this.selection.width, this.selection.height);
			ctx.fillRect(this.selection.x - this.game.camera.x, this.selection.y - this.game.camera.y, this.selection.width, this.selection.height);

			ctx.restore();

		},

		highlightDublicates: function(ctx){
			if(!this.isCtrlDown){
				return;
			}
			var o1 = null;
			var o2 = null;
			var bounds = null;
			ctx.save();
			ctx.fillStyle = "rgba(150, 70, 20, 0.3)";
			for(var j=0; j<this.loadedObjects.length; j++){
				o1 = this.loadedObjects[j];
				if(!o1.isVisible || o1.type == MT.objectTypes.GROUP){
					continue;
				}
				for(var i=j; i<this.loadedObjects.length; i++){
					o2 = this.loadedObjects[i];
					if(o1 == o2){
						continue;
					}
					if(o1.x == o2.x && o1.y == o2.y && o1.assetId == o2.assetId && o1.width == o2.width && o1.data.type == o2.data.type){
						if(o1.parent == o2.parent){
							bounds = o1.object.getBounds();
							ctx.fillRect(bounds.x | 0, bounds.y | 0, bounds.width | 0, bounds.height | 0);
						}
					}
				}
			}
			ctx.restore();
		},


		/* assets n objects */
		isAssetsAdded: false,
		assetsTimeout: 0,
		addAssets: function(assets, inDepth){
			if(!this.game.isBooted || !this.game.width){
				var that = this;
				window.clearTimeout(this.assetsTimeout);
				this.assetsTimeout = window.setTimeout(function(){
					that.addAssets(assets);
				}, 100);
				return;
			}

			window.clearTimeout(this.assetsTimeout);

			var game = this.game;
			var that = this;
			var asset = null;
			if(!inDepth){
				this.isAssetsAdded = !assets.length;
			}
			for(var i=0; i<assets.length; i++){
				this.addAsset(assets[i], function(){
					that.assetsToLoad--;
					if(that.assetsToLoad == 0){
						that.isAssetsAdded = true;
						that.reloadObjects();
					}
				});
			}
		},

		assetsToLoad: 0,
		addAsset: function(asset, cb){
			this.assetsToLoad++;
			if(asset.contents){
				this.addAssets(asset.contents, true);
				if(typeof cb == "function"){
					window.setTimeout(cb, 0);
				}
				return;
			}

			var game = this.game;
			var path = this.project.path + "/" + asset.__image;
			if(!MT.core.Helper.isImage(path)){
				if(typeof cb === "function"){
					cb();
				}
				return;
			}

			var that = this;
			if(asset.atlas){
				this.addAtlas(asset, null, null, cb);
				return;
			}

			this.loadImage(path + "?" + Date.now(), function(){
				if(asset.width != asset.frameWidth || asset.width != asset.frameHeight){
					that.game.cache.addSpriteSheet(asset.id, asset.__image, this, asset.frameWidth, asset.frameHeight, asset.frameMax, asset.margin, asset.spacing);
				}
				else{
					that.game.cache.addImage(asset.id, asset.__image, this);
					console.log("added", asset.id);
				}
				cb();
			});

		},
		// from Phaser source
		parseXML: function(data){
			var xml;
			try {
				if (window['DOMParser']) {

					var domparser = new DOMParser();
					xml = domparser.parseFromString(data, "text/xml");
				}
				else {
					xml = new ActiveXObject("Microsoft.XMLDOM");
					xml.async = 'false';
					xml.loadXML(data);
				}
			}
			catch (e) {
				xml = void(0);
			}

			if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length){
				throw new Error("Phaser.Loader. Invalid Texture Atlas XML given");
			}

			return xml;
		},

		parseJSON: function(data){
			var json = null;
			try{
				json = JSON.parse(data);
			}
			catch(e){
				console.error(e);
				json = null;
			}

			return json;
		},

		ajax: function(src, cb){
			var xhr = new XMLHttpRequest();
			xhr.open('get', src);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4){
					cb(xhr.responseText);
				}
			};
			xhr.onerror = function(){
				console.error("couldn't load asset", src);
				cb();
			};
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.send(null);
		},

		loadImage: function(src, cb){
			var image = new Image();
			image.onload = cb;
			image.onerror = function(){
				console.error("couldn't load asset", src);
				cb();
			};
			image.src = src;
		},



		addAtlas: function(asset, atlasImage, atlasData, cb){
			var ext = asset.atlas.split(".").pop().toLowerCase();
			var that = this;
			var path = this.project.path + "/" + asset.__image;


			var setImage = function(data, type, image){
				that.game.cache.addTextureAtlas(asset.id, asset.__image, image, data, type);
				that.findAtlasNames(asset.id);
				if(asset.type != type){
					asset.type = type;
					that.project.plugins.assetmanager.updateData();
				}
				if(cb){
					cb();
				}
			};


			var setData = function(dataString){
				var data = null;
				var type = Phaser.Loader.TEXTURE_ATLAS_XML_STARLING;
				/*
					* Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY
					* Phaser.Loader.TEXTURE_ATLAS_JSON_HASH
					* Phaser.Loader.TEXTURE_ATLAS_XML_STARLING
					*/
				if(ext == "json"){
					data = that.parseJSON(dataString);
					if(Array.isArray(data.frames)){
						type = Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY;
					}
					else{
						type = Phaser.Loader.TEXTURE_ATLAS_JSON_HASH;
					}

				}
				else{
					data = that.parseXML(dataString);
				}

				if(!data){
					console.error("failed to parse atlas");
				}
				else{
					if(atlasImage == void(0)){
						that.loadImage(path + "?" + Date.now(), function(){
							setImage(data, type, this);
						});
					}
					else{
						setImage(data, type);
					}
				}
			};

			if(atlasData == void(0)){
				MT.loader.get(that.project.path + "/" + asset.atlas+"?"+Date.now(), setData);
			}
			else{
				setData(atlasData);
			}
		},


		atlasNames: {},

		findAtlasNames: function(id){
			if(!this.game.cache.checkImageKey(id)){
				console.error("Failed to parse atlas image");
				return;
			}
			else if( !this.game.cache.getFrameData(id) ){
				console.error("Failed to parse atlas frame data");
				return;
			}
			var frameData = this.game.cache.getFrameData(id);
			var names = Object.keys(frameData._frameNames);

			var name = "";
			var possibleNames = {};
			var shortName = "";
			var frame = 0;
			var lastName = "";

			for(var i=0; i<names.length; i++){
				name = names[i] || "unnamed";

				shortName = name.substring(0, name.indexOf(0));
				if(!shortName){
					shortName = name;
				}

				if(possibleNames[shortName] === void(0)){
					possibleNames[shortName] = {
						start: frame,
						end: frame
					};
				}

				if(lastName && lastName != shortName){
					possibleNames[lastName].end = frame;
				}

				lastName = shortName;

				frame++;
			}
			if(names.length == 0){
				possibleNames["unnamed"] = {
						start: 0,
						end: 0
					};
			}
			else{
				possibleNames[lastName].end = frame;

			}

			possibleNames["all_frames"] = {
					start: 0,
					end: frameData._frames.length
			};
			this.atlasNames[id] = possibleNames;
			this.project.plugins.assetmanager.selectActiveAsset();

			this.atlasNames[id] = possibleNames;
			this.project.plugins.assetmanager.selectActiveAsset();
		},

		cleanImage: function(id){
			// hack
			//this.game.cache._images[id];
			this.game.cache.removeImage(id, false);

			var img = PIXI.BaseTextureCache[id];
			if(img){
				img.destroy();
			}

			delete this.atlasNames[id];
		},

		checkId: function(){
			var o = null;
			for(var i=0; i<this.objects.length; i++){
				o = this.objects[i];
				for(var j=0; j<this.objects.length; j++){
					if(o == this.objects[j]){
						continue;
					}
					if(o.id == this.objects[j].id){
						console.error("dublicate id");
					}
				}
			}
		},

		_addTimeout: 0,
		lastAddedObjects: null,
		addObjects: function(objs, group){

			this.lastAddedObjects = objs;

			// check if assets is loaded - if not - call again this method after a while
			if(!this.isAssetsAdded){
				var that = this;
				if(this._addTimeout){
					window.clearTimeout(this._addTimeout);
					this._addTimeout = 0;
				}

				this._addTimeout = window.setTimeout(function(){
					that.addObjects(objs, group);
					that._addTimeout = 0;
				}, 100);
				return;
			}
			var tmp;
			for(var i=0; i< this.loadedObjects.length; i++){
				tmp = this.loadedObjects[i];
				tmp.isRemoved = true;
			}

			group = group || game.world;
			this._addObjects(objs, group);

			if(this.tools.tmpObject){
				this.tools.tmpObject.bringToTop();
			}

			for(var i=0; i< this.loadedObjects.length; i++){
				tmp = this.loadedObjects[i];
				if(tmp.isRemoved){
					this.loadedObjects.splice(i, 1);
					this.cache[tmp.id] = null;
					tmp.remove();
					i--;
				}
			}
			this.emit(this, MT.MAP_OBECTS_ADDED);
			return;
		},

		_destroyObject: function(object){
			object.destroy(true);
		},

		_addObjects: function(objs, group){
			var tmp, k=0, o;

			for(var i=objs.length-1; i>-1; i--){
				o = objs[i];
				tmp = this.getById(o.id);

				if(!tmp ){
					tmp = new MT.core.MagicObject(o, group, this);
					this.cache[o.id] = tmp;
					this.loadedObjects.push(tmp);
				}

				tmp.isRemoved = false;
				tmp.update(o.data, group);

				tmp.object.visible = tmp.isVisible;
				//tmp.object.z = i;

				tmp.bringToTop();
				// handle group and parents
				if(tmp.data.contents){
					this._addObjects(tmp.data.contents, tmp.object);
				}
			}
		},

		resort: function(){
			var tmp;
			/*for(var i=0; i<this.loadedObjects.length; i++){
				tmp = this.loadedObjects[i];
				tmp.bringToTop();
			}*/

			if(this.tools.tmpObject){
				this.tools.tmpObject.bringToTop();
			}
		},

		addGroup: function(obj){
			console.error("removed");
			return;

			var group = this.game.add.group();
			group = obj;

			this.groups.push(group);

			group.x = obj.x;
			group.y = obj.y;

			if(obj.angle){
				group.angle = obj.angle;
			}

			group.visible = !!obj.isVisible;

			//group.fixedToCamera = !!obj.isFixedToCamera;

			return group;
		},


		/* TODO: clean up - and seperate object types by corresponding tools*/
		addObject: function(obj, group){
			console.error("removed - addObject");
			return;
			var oo = null;
			var od = null;
			for(var i=0; i<this.oldObjects.length; i++){
				od = this.oldObjects[i];
				oo = this.oldObjects[i].xxx;
				if(!od.parent){
					continue;
				}

				if(oo.id == obj.id ){
					// fix this - workaround for older projects
					if(oo.type == void(0)){
						oo.type = MT.objectTypes.SPRITE;
					}

					if(oo.type == MT.objectTypes.SPRITE){
						od.loadTexture(oo.assetId, oo.frame);
					}

					if(oo.type == MT.objectTypes.TEXT){
						od.text = obj.text || obj.name;
						od.setStyle(obj.style);
					}

					if(oo.type == MT.objectTypes.TILE_LAYER){
						od = this.updateTileMap(obj, od);
						od.xxx = obj;
						this.project.plugins.tools.tools.tiletool.updateLayer(od);
						this.tileLayers.push(od);
					}

					this.objects.push(od);
					group.add(od);

					if(od.bringToTop){
						od.bringToTop();
					}
					else{
						if(od.parent.bringToTop){
							od.parent.bringToTop(od);
						}
					}
					return od;
				}
			}

			if(obj.type == MT.objectTypes.TEXT){
				var t = this.addText(obj, group);
				t.xxx = obj;
				this.objects.push(t);
				return t;
			}

			if(obj.type == MT.objectTypes.TILE_LAYER){
				var t = this.addTileLayer(obj);
				t.xxx = obj;
				this.objects.push(t);
				this.project.plugins.tools.tools.tiletool.updateLayer(t);
				this.tileLayers.push(t);
				return t;
			}

			var sp = this.createSprite(obj, group);
			this.objects.push(sp);

			return sp;
		},

		reloadObjects: function(){
			if(this.lastAddedObjects  && !this._addTimeout){
				this.addObjects(this.lastAddedObjects);
			}
		},

		_activeObject: null,
		_justSelected: null,

		get activeObject(){
			if(!this._activeObject){
				return null;
			}

			if(!this._activeObject.game){
				this._activeObject = this.getById(this._activeObject.xxx.id);
			}

			return this._activeObject;
		},
		savedSettings: null,
		set activeObject(val){
			this._activeObject = val;
		},

		get offsetX(){
			return this.panel.content.calcOffsetX() - this.game.camera.x;
		},

		get offsetY(){
			return this.panel.content.calcOffsetY() - this.game.camera.y;
		},

		get offsetXCam(){
			return this.panel.content.calcOffsetX() + this.game.camera.x;
		},

		get offsetYCam(){
			return this.panel.content.calcOffsetY() + this.game.camera.y;
		},

		get ox(){
			return this.panel.content.calcOffsetX();
		},

		get oy(){
			return this.panel.content.calcOffsetY();
		},

		/* input handling */
		handleMouseDown: function(e){
			if(e.button == 0){
				for(var i in this.dist){
					this.dist[i].x = 0;
					this.dist[i].y = 0;
				}
			}
			this.tools.mouseDown(e);
		},

		handleMouseUp: function(e){
			this.tools.mouseUp(e);
		},

		emptyFn: function(){},

		_handleMouseMove: function(){

		},

		set handleMouseMove(val){
			this._handleMouseMove = val;
		},

		get handleMouseMove(){
			return this._handleMouseMove;
		},


		_cameraMove: function(e){
			this.game.camera.x -= this.ui.events.mouse.mx;
			this.game.camera.y -= this.ui.events.mouse.my;
			this.settings.cameraX = this.game.camera.x;
			this.settings.cameraY = this.game.camera.y;

			this.project.plugins.settings.updateScene(this.settings);

			this.update();
		},


		dist: null,

		updateMouseInfo: function(e){
			var that = this;
			this.selector.forEach(function(obj){
				obj.mouseInfo.x = e.x;// - that.ox;
				obj.mouseInfo.y = e.y;// - that.oy;
			});

		},

		_objectMove: function(e, mo){

			if(!mo){
				var that = this;
				this.selector.forEach(function(obj){
					that._objectMove(e, obj);
				});
				return;
			}
			var x = this.ui.events.mouse.mx + this.ox;
			var y = this.ui.events.mouse.my + this.oy;

			var m = this.ui.events.mouse;

			//mo.mouseInfo.x = m.x
			//mo.mouseInfo.y = m.y

			mo.moveObject(m.x + m.mx, m.y + m.my, e);

			return;
		},

		enabledPhysics: false,
		enablePhysics: function(){
			this.enabledPhysics = true;
		},
		disablePhysics: function(){
			this.enabledPhysics= false;
		},

		moveByKey: function(e, object){
			var w = e.which;
			var inc = 1;

			if(e.ctrlKey){
				if(w == 37 || w == 39){
					inc = this.settings.gridX;
				}
				else{
					inc = this.settings.gridY;
				}
			}
			else if(e.shiftKey){
				inc *= 10;
			}


			if(w == MT.keys.LEFT){
				object.x -= inc;
			}
			if(w == MT.keys.UP){
				object.y -= inc;
			}
			if(w == MT.keys.RIGHT){
				object.x += inc;
			}
			if(w == MT.keys.DOWN){
				object.y += inc;
			}

			//this.project.plugins.settings.updateObjects(object);
			//this.sync(object);
		},

		_followMouse: function(e, snapToGrid){

			if(!this.activeObject){
				return;
			}

			this.activeObject.x = (e.x - this.ox + this.game.camera.x)/this.scale.x;
			this.activeObject.y = (e.y - this.oy + this.game.camera.y)/this.scale.y;

			if(e.ctrlKey || snapToGrid){
				this.activeObject.x = Math.round(this.activeObject.x / this.settings.gridX) * this.settings.gridX;
				this.activeObject.y = Math.round(this.activeObject.y / this.settings.gridY) * this.settings.gridY;
			}

		},

		/* helper fns */

		sync: function(sprite, obj){
			this.sendDelayed("updateData", this.settings, 100);
		},

		createObject: function(obj){
			var sprite = this.createSprite(obj);
			this.tmpObjects.push(sprite);

			return sprite;
		},

		removeObject: function(obj){
			for(var i=0; i<this.tmpObjects.length; i++){
				if(this.tmpObjects[i] == obj){
					this.tmpObjects.splice(i,1)[0].destroy();
					i--;
				}
			}
		},

		updateScene: function(obj){
			this.updateSettings(obj);
			this.sendDelayed("updateData", this.settings, 100);
		},


		received: false,
		a_receive: function(obj){
			if( this.received ){
				return;
			}
			this.received = true;
			this.updateSettings(obj);
			this.emit("update");
		},

		createActiveObject: function(obj){
			this.activeObject = this.addObject(obj, this.game.world, true);
			return this.activeObject;
		},

		pickObject: function(x, y){
			x += this.game.camera.x;
			y += this.game.camera.y;
			var obj;

			// chek if we are picking already selected object
			if(this.activeObject){
				if(this.activeObject.type == MT.objectTypes.GROUP){
				//if(!this.ui.events.mouse.lastEvent.shiftKey){
					if(this.checkBounds(this.activeObject, x, y)){
						return this.activeObject;
					}
				}

				if(this.activeObject.type == MT.objectTypes.SPRITE || this.activeObject.type == MT.objectTypes.TEXT){
					obj = this._pick(this.activeObject, x, y);
					if(obj){
						return obj;
					}
				}
			}

			var p = new Phaser.Point(0,0);
			var pointer = this.game.input.activePointer;

			for(var i=this.loadedObjects.length-1; i>-1; i--){
				obj = this.loadedObjects[i];
				var ret = this._pick(obj, x, y, true);
				if(ret){
					return ret;
				}
			}

			return null;
		},

		_pick: function(obj, x, y, checkGroup){
			var bounds;
			if(!obj.isVisible){
				return null;;
			}
			if(obj.type == MT.objectTypes.GROUP){
				return null;;
			}
			if(obj.isLocked){
				return null;;
			}

			var ob = this.checkBounds(obj, x, y);

			if(!ob){
				return null;
			}
			// check bounds
			if(!obj.object.input || !this.settings.pixelPerfectPicking){
				return ob;
			}

			if( obj.object.input.checkPointerOver(this.game.input.activePointer)){
				/*if(this.ui.events.mouse.lastEvent.ctrlKey && !this.activeObject && checkGroup){
					if(obj.parent && obj.parent.magic){
						this.activeObject = obj.parent.magic;
					}
					else{
						this.activeObject = obj;
					}
					return this.activeObject
				}*/

				this.activeObject = obj;
				return obj;
			}
			return null;

		},

		checkBounds: function(obj, x, y){
			var bounds = obj.object.getBounds();
			if(bounds.contains(x, y)){
				if(obj.data.type == MT.objectTypes.TILE_LAYER){
					if(obj.getTile(x + this.game.camera.x, y + this.game.camera.y)){
						return obj;
					}
					return null;
				}
				return obj;
			}
			return null;
		},


		selectRect: function(rect, clear){
			rect.x -= this.game.camera.x;
			rect.y -= this.game.camera.y;

			var box = null;
			var obj = null;

			for(var i=0; i<this.loadedObjects.length; i++){
				obj = this.loadedObjects[i];
				if(obj.data.type == MT.objectTypes.GROUP){
					continue;
				}
				var sprite = obj.object;

				if(obj.type == MT.objectTypes.GROUP){
					continue;
				}

				if(!obj.isVisible){
					continue;
				}
				if(obj.isLocked){
					continue;
				}


				box = sprite.getBounds();
				if(box.intersects(rect)){
					this.selector.add(obj);
				}
				else if(clear){
					this.selector.remove(obj);
				}
			}

			rect.x += this.game.camera.x;
			rect.y += this.game.camera.y;

		},

		isGroupHandle: function(x,y){
			return null;

			var bounds = null;

			for(var i=0; i<this.groups.length; i++){
				if(this.isGroupSelected(this.groups[i])){
					var ox = this.getObjectOffsetX(this.groups[i]);
					var oy = this.getObjectOffsetY(this.groups[i]);

					if(Math.abs(ox - x) < 10 && Math.abs(oy - y) < 10){
						return this.groups[i];
					}
				}
			}
		},

		createSprite: function(obj, group){
			var game = this.game;
			group = group || game.world;

			var sp = null;
			if(!game.cache.getImage(obj.assetId)){
				obj.assetId = "__missing";
			}


			sp = group.create(obj.x, obj.y, obj.assetId);
			return sp;
		},

		isGroupSelected: function(group){
			return false;
		},

		/* TODO: refactor so all can use MagicObject */
		getById: function(id){

			return this.cache[id];

			/*for(var i=0; i<this.loadedObjects.length; i++){
				if(!this.loadedObjects[i].data){
					console.warn("smth wrong");
					continue;
				}
				if(this.loadedObjects[i].data.id == id){
					return this.loadedObjects[i];
				}
			}*/
		}
	}
);

//MT/misc/tooltips.js
MT.namespace('misc');
MT.misc.tooltips = {
	selectTool: {
		title: "Select tool",
		desc: "object selection, rectangle selection, object transformation",
		tips: [
			"Hold down <i><b>ctrl</b></i> key - to snap objects to the grid while moving",
			"You can easily clone object by holding <i>Alt</i> key before drag"
		]
	},
	
	stampTool: {
		title: "Stamp tool",
		desc: "put objects on the map one by one",
		tips: [
			"Hold down <i><b>ctrl</b></i> key - to snap objects to the grid",
		]
	},
	
	brushTool: {
		title: "Brush tool",
		desc: "put multiple objects on the map like drawing tiles"
	},
	
	textTool: {
		title: "Text tool",
		desc: "create text object"
	},
	
	tileToolsTool: {
		title: "Tile tool",
		desc: "allows to put tiles on the tilemap",
		errors: [
			"You must select <i><b>tileLayer</b></i> object - to use <b>Tile tool</b>"
		]
	},
	
	physicsTool: {
		title: "Physics tool",
		desc: "enable to highlight physics bodies"
	}
};
//MT/ui/TableView.js
MT.namespace('ui');
MT.require("ui.InputHelper");

MT.extend("ui.DomElement").extend("core.Emitter")(
	MT.ui.TableView = function(data, header){
		MT.ui.DomElement.call(this);
		
		this.table = document.createElement("table");
		this.el.appendChild(this.table);
		
		var tr, td, tmp;
		
		this.header = header;
		if(data){
			this.setData(data, header);
		}
		
		
		var that = this;
		
		this.input = new MT.ui.InputHelper();
		
		this.input.on("change", function(value){
			that.input.el.innerHTML = value;
			
		});
		
		this.input.on("blur", function(){
			that.updateData(that.input.el);
		});
		
		this.input.on("tab", function(e){
			var el = that.input.el;
			that.input.blur();
			that.jumpToNext(el, e.shiftKey);
		});
		
		this.input.on("enter", function(e){
			var el = that.input.el;
			that.input.blur();
			that.jumpToNext(el, e.shiftKey);
		});
		
		this.table.onclick = function(e){
			e.preventDefault();
			e.stopPropagation();
			if(!e.target.data){
				return;
			}
			that.input.show(e.target);
		};
		
	},
	{
		size: 0,
		isKeyValue: false,
		
		toKeyValue: function(){
			
		},
		
		setData: function(data, header){
			
			this.table.innerHTML = "";
			this._created = false;
			this._allowEmpty = true;
			
			
			this.origData = data;
			
			this.data = _.cloneDeep(data);
			this.header = this.header || header;
			
			
			if(!Array.isArray(this.data)){
				this.isKeyValue = true;
				
				tmp = this.data;
				this.data = [];
				for(var k in tmp){
					this.data.push([k, tmp[k]]);
				}
			}
			
			this.createTable();
			
		},
		
		jumpToNext: function(el, reverse){
			if(!reverse){
				if(el.nextSibling){
					this.input.show(el.nextSibling);
				}
				else if(el.parentNode.nextSibling){
					this.input.show(el.parentNode.nextSibling.firstChild);
				}
			}
			else{
				if(el.previousSibling){
					this.input.show(el.previousSibling);
				}
				else if(el.parentNode.previousSibling){
					// check header
					if(el.parentNode.previousSibling.lastChild.data){
						this.input.show(el.parentNode.previousSibling.lastChild);
					}
				}
			}
		},
		updateData: function(el){
			var row = el.data.row;
			var cell = el.data.index;
			var val = el.innerHTML;
			
			// is new value added ?
			if(row == -1){
				// ignore values without keys
				if(this.isKeyValue && (cell > 0 || val == "")){
					this.createTable();
					return;
				}
				
				var nn = [];
				var tmp = "";
				for(var i=0; i<this.size; i++){
					if(i == cell){
						nn.push(val);
					}
					else{
						nn.push(tmp);
					}
				}
				
				row = this.data.length;
				this.data.push(nn);
				this.allowEmpty = true;
			}
			
			// bug?
			if(!this.data[row]){
				return;
			}
			this.data[row][cell] = val;
			
			if(this.isKeyValue){
				// was key deleted?
				if(val == "" && cell == 0){
					this.data.splice(row, 1);
					if(this.header){
						this.table.removeChild(this.table.children[row+1]);
					}
					else{
						this.table.removeChild(this.table.children[row]);
					}
				}
				
				
				// recreate all object - because indexes will mess up
				for(var key in this.origData){
					delete this.origData[key];
				}
				
				
				for(var i=0; i<this.data.length; i++){
					this.origData[this.data[i][0]] = this.data[i][1];
				}
				
				
			}
			else{
				this.origData.length = 0;
				for(var i=0; i<this.data.length; i++){
					this.origData[i] = [];
					for(var j=0; j<this.data[i].length; j++){
						this.origData[j] = this.data[i][j];
					}
				}
			}
			
			this.createTable();
			this.emit("change", this.origData);
		},
		
		_allowEmpty: true,
		set allowEmpty(val){
			this._allowEmpty = val;
		},
		get allowEmpty(){
			return this._allowEmpty;
		},
		_created: false,
		createTable: function(){
			var tr, td, tmp;
			var i, j;
			var nextTr = this.table.firstChild;
			
			if(this.header){
				j = this.header.length;
				if(!this._created){
					tr = document.createElement("tr");
					this.table.appendChild(tr);
				}
				else{
					tr = nextTr;
					nextTr = tr.nextSibling;
				}
				for(var i=0; i<this.header.length; i++){
					td = tr.children[i] || document.createElement("th");
					td.innerHTML = this.header[i];
					if(!td.parentNode){
						tr.appendChild(td);
					}
				}
			}
		
			for(i=0; i<this.data.length; i++){
				if(!this._created){
					tr = document.createElement("tr");
					this.table.appendChild(tr);
				}
				else{
					tr = nextTr;
					nextTr = tr.nextSibling;
				}
				
				//internaly we will use array for objects also: 0 - key, 1 - value
				if(!Array.isArray(this.data[i]) ){
					this.isKeyValue = true;
					
					tmp = this.data[i];
					this.data[i] = [];
					for(var k in tmp){
						this.data[i].push(k);
						this.data[i].push(i);
					}
				}
				
				tmp = this.data[i];
				for(j=0; j<tmp.length; j++){
					this.addCell(tr, i, j, tmp[j]);
				}
				
			}
			
			this.size = j;
			
			if(this.allowEmpty){
				tr = document.createElement("tr");
				this.table.appendChild(tr);
				
				tmp = this.data[i];
				for(var l=0; l<j; l++){
					this.addCell(tr, -1, l, "");
				}
			}
			this.allowEmpty = false;
			this._created = true;
			
		},
		addCell: function(row, rowNum, cellIndex, text){
			var cell = row.children[cellIndex] || document.createElement("td");
			if(!cell.parentNode){
				row.appendChild(cell);
			}
			cell.data = {
				row: rowNum,
				index: cellIndex
			};
			cell.innerHTML = text;
			cell.setAttribute("width", 100);
			return cell;
		}

	}
);
//MT/plugins/Analytics.js
MT.namespace('plugins');
MT.extend("core.BasicPlugin")(
	MT.plugins.Analytics = function(project){
		MT.core.BasicPlugin.call(this, "Analytics");
		this.project = project;
	},
	{
		installUI: function(ui){
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
			
			ga('create', 'UA-23132569-11');
			if(this.project.id){
				document.title += " - " + this.project.data.title + " (" + this.project.id + ")";
			}
			
			ga('send', 'pageview');
			
			this.lastUpdate = Date.now();
			
			
			var that = this;
			this.project.plugins.tools.on(MT.OBJECT_SELECTED, function(tool){
				that.send('tool-selected', tool);
			});
			
			this.project.plugins.assetmanager.on(MT.ASSET_ADDED, function(image){
				that.send('image-added', image);
			});
			
			this.project.plugins.objectmanager.on(MT.OBJECT_ADDED, function(obj){
				that.send('object-added', obj);
			});
			
			this.project.plugins.objectmanager.on(MT.OBJECTS_SYNC, function(){
				lastUpdate = Date.now();
				that.send('working-with-map', "sync");
			});
			
			this.minute = 1000*60;
			window.setInterval(function(){
				that.send('idle', that.project.id);
			}, this.minute);
		},
		
		send: function(name, data){
			if(this.lastUpdate > Date.now() - this.minute){
				return;
			}
			
			this.lastUpdate = Date.now();
			window.ga('send', 'event', name, data);
		}
	}
);
//MT/plugins/DataLink.js
MT.namespace('plugins');
MT.extend("core.BasicPlugin")(
	MT.plugins.DataLink = function(project){
		MT.core.BasicPlugin.call(this, "DataLink");
		this.project = project;
		
	},
	{ 
		selectElementContents: function(el) {
			var range = document.createRange();
			range.selectNodeContents(el);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		},
		initUI: function(ui){
			var that = this;
			
			var link = window.location.origin;
			link += "/"+this.project.path+"/phaser/js/lib/mt.data.js";
			
			
			var b = this.project.panel.addButton(link, "datalink", function(e){
				that.selectElementContents(b.el);
				e.preventDefault();
			});
			
			b.el.onmouseleave = function(){
				window.getSelection().removeAllRanges();
			};
			
			b.style.left = "auto";
			b.style.right = 0;
			b.style.position = "absolute";
		}
		
		
	}
);
//MT/plugins/UndoRedo.js
MT.namespace('plugins');
MT.extend("core.BasicPlugin")(
	MT.plugins.UndoRedo = function(project){
		this.project = project;
		this.buffer = [];
		
		this.name = "UndoRedo";
		
		this._step = 0;
		
		this.max = 20;
		
		this.undos = 0;
		
		window.ur = this;
		this.capacity = 0;
		this.currentOffset = 0;
		
		
		var that = this;
		this.onKeyDown = function(e){
			if(!e.ctrlKey){
				return;
			}
			if(e.which !== "Z".charCodeAt(0)){
				return;
			}
			
			if(!e.shiftKey){
				if(that.step > 0){
					that.step--;
					console.log(that.step);
					var data = that.buffer[that.step-1];
					if(data){
						that.om.a_receive(JSON.parse(data), true);
					}
					else{
						that.step++;
					}
				}
				else{
					//console.log("nothing to undo");
				}
				return;
			}
			
			if(that.step < that.buffer.length){
				var data = that.buffer[that.step];
				if(data){
					
					that.om.a_receive(JSON.parse(data), true);
					that.step++;
				}
				else{
					console.log("nothing to redo - no data?");
				}
			}
			else{
				console.log("nothing to redo");
			}
		};
		
		
		this.checkLocalStorageCapacity();
	},
	{
		set step(val){
			this._step = val;
		},
		
		get step(){
			return this._step;
		},
		
		disable: function(){
			this.ui.events.off(this.ui.events.KEYDOWN, this.onKeyDown);
		},
		enable: function(){
			this.ui.events.on(this.ui.events.KEYDOWN, this.onKeyDown);
		},
		reset: function(){
			this.buffer = [];
			this.data = {};
			this.step = 0;
			this.currentOffset = 0;
			localStorage.removeItem(this.name);
			this.save();
		},
		installUI: function(){
			var that = this;
			
			var stored = localStorage.getItem(this.name);
			
			if(!stored){
				this.data = {};
			}
			else{
				this.data = JSON.parse(stored);
			}

			if(this.data[this.project.id]){
				this.buffer = this.data[this.project.id];
			}
			
			
			this.step = this.buffer.length;
			this.data[this.project.id] = this.buffer;
			
			this.om = this.project.plugins.objectmanager;
			this.om.on(MT.OBJECTS_SYNC, function(data){
				
				var str = JSON.stringify(data);
				
				if(that.buffer[that.step-1] == str){
					return;
				}
				
				if(that.step > that.max){
					that.buffer.shift();
					that.step--;
				}
				
				that.buffer[that.step] = str;
				that.step++;
				that.buffer.length = that.step;
				that.save();
			});
			
			this.om.on(MT.OBJECTS_UPDATED, function(data){
				if(that.buffer.length == 0){
					that.buffer.push(JSON.stringify(data));
					that.step++;
				}
			});
			
			
			this.enable();
			
		},
		// cleanup up something from older projects
		cleanUp: function(){
			for(var i in this.data){
				this.data[i].shift();
			}
			this.checkLocalStorageCapacity();
			this.currentOffset = 0;
		},
		lastSave: 0,
		save: function(){
			
			if(Date.now() - this.lastSave > 100){
				this._save();
				this.lastSave = Date.now();
			}
			console.log("save");
		},
		
		_save: function(){
			var str = JSON.stringify(this.buffer);
			var off = this.currentOffset;
			
			if(this.step - off <= 0){
				this.cleanUp();
				off = this.currentOffset;
			}
			
			while(str.length > this.capacity && off < this.step){
				off++;
				str = JSON.stringify(this.buffer.slice(off, this.step));
			}
			this.currentOffset = off;
			
			try{
				localStorage.setItem(this.name, JSON.stringify(this.data) );
			}
			catch(e){
				off++;
				this.buffer.slice(this.step - off, this.step);
				this.save();
			}
		},
		
		checkLocalStorageCapacity: function(){
			var str = "x";
			var ret = 0;
			var koef = 1;
			
			while(true){
				str += str.substring(0, str.length*koef | 0);
				try{
					localStorage.setItem("test", str);
					ret = str.length;
				}
				catch(e){
					koef -= 0.1;
					if(koef < 0.1){
						break
					}
					
					str = str.substring(0, ret);
				}
			}
			
			
			
			localStorage.removeItem("test");
			
			this.capacity = ret;
		}

	}
);


//MT/plugins/Tools.js
MT.namespace('plugins');
"use strict";

MT.require("ui.List");
MT.require("plugins.tools.Select");
MT.require("plugins.tools.Stamp");
MT.require("plugins.tools.Brush");
MT.require("plugins.tools.Text");
MT.require("plugins.tools.TileTool");
MT.require("plugins.tools.Physics");

MT.TOOL_SELECTED = "TOOL_SELECTED";


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.Tools = function(project){
		MT.core.Emitter.call(this);
		
		this.project = project;
		
		this.tools = {};
		
		//var tools = MT.plugins.tools;
		this.toolsAvailable = {
			"select": MT.plugins.tools.Select,
			"Stamp": MT.plugins.tools.Stamp,
			"Brush": MT.plugins.tools.Brush,
			"Text": MT.plugins.tools.Text,
			"TileTool": MT.plugins.tools.TileTool,
			"Physics": MT.plugins.tools.Physics
		};
		
		this.tmpObject = null;
		this.activeAsset = null;
		this.activeFrame = 0;
	},
	{
		
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("toolbox",this.ui.left);
			this.panel.addClass("toolbox");
			this.panel.removeHeader();
			this.panel.width = 40;
			this.panel.isResizeable = false;
			this.panel.isDockable = true;
			
			
			ui.dockToLeft(this.panel);
		},
		
		installUI: function(){
			var that = this;
			var am = this.project.plugins.assetmanager;
			var map = this.map = this.project.plugins.mapeditor;
			var om = this.om = this.project.plugins.objectmanager;
			
			for(var i in this.toolsAvailable){
				this.tools[i.toLowerCase()] = new this.toolsAvailable[i](this);
			}
			
			
			am.on(MT.ASSET_SELECTED, function(asset, element){
				that.activeAsset = asset;
				that.activeFrame = am.activeFrame;
				that.emit(MT.ASSET_SELECTED, asset);
			});
			
			am.on(MT.ASSET_UNSELECTED, function(asset){
				that.activeAsset = null;
				that.emit(MT.ASSET_UNSELECTED, asset);
			});
			
			am.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				that.activeAsset = asset;
				that.activeFrame = frame;
				that.emit(MT.ASSET_FRAME_CHANGED, asset, frame);
			});
			
			var select =  function(object){
				if(!object){
					console.error("Failed to select an object");
					return;
				}
				that.select(object);
			};
			
			map.on(MT.TOOL_SELECTED, select);
			
			om.on(MT.OBJECT_SELECTED, function(data){
				select(map.getById(data.id));
			});
			
			map.selector.on("select", function(obj){
				that.emit(MT.OBJECT_SELECTED, obj);
			});
			
			map.selector.on("unselect", function(obj){
				that.emit(MT.OBJECT_UNSELECTED, obj);
				
				if(map.selector.count !== 1){
					window.setTimeout(function(){
						if(map.selector.count == 1){
							var obj = map.selector.get(0);
							this.map.activeObject = null;
							map.selector.emit("select", obj);
							this.map.activeObject = obj;
						}
					}, 0);
				}
			});
			
			om.on(MT.OBJECTS_UPDATED, function(){
				that.emit(MT.OBJECTS_UPDATED);
			});
			
			var lastKey = 0;
			
			var toCopy = [];
			this.ui.events.on(this.ui.events.KEYDOWN, function(e){
				if(e.target == document.body && e.ctrlKey && e.which == MT.keys.D){
					e.preventDefault();
					e.stopPropagation();
				}
			});
			this.ui.events.on(this.ui.events.KEYUP, function(e){
				
				if(lastKey == MT.keys.ESC){
					that.setTool(that.tools.select);
					window.getSelection().removeAllRanges();
					lastKey = 0;
					return;
				}
				
				
				if(e.which == MT.keys.DELETE){
					var ap = that.ui.pickPanelGlobal();
					if(!ap){
						return;
					}
					
					if(ap == that.map.panel || ap == om.panel){
						var data = om.tv.getData();
						
						that.map.selector.forEach(function(obj){
							om.deleteObj(obj.id, true, data);
							om.selector.clear();
						});
						
						om.tv.merge(data);
						
						om.sync();
						om.update();
						return;
					}
					if(ap === am.panel){
						am.confirmDeleteSelected();
					}
					
					return;
				}
				
				lastKey = e.which;
				
				window.setTimeout(function(){
					lastKey = 0;
				}, 500);
				
				if(e.which === MT.keys.ESC){
					that.activeTool.deactivate();
				}
				
				
				var copyStarted = {
					x: 0,
					y: 0
				};
				
				// copy / paste
				if(e.ctrlKey){
					if(e.which === MT.keys.C){
						toCopy.length = 0;
						
						map.selector.forEach(function(obj){
							toCopy.push(obj);
						});
						
						toCopy.sort(function(a, b){
							return (map.loadedObjects.indexOf(a) - map.loadedObjects.indexOf(b));
						});
						return;
					}
					
					if(e.which === MT.keys.V && e.target == document.body){
						var x = that.ui.events.mouse.lastEvent.x;
						var y = that.ui.events.mouse.lastEvent.y;
						
						var bounds = null;
						var midX = 0;
						var midY = 0;
						
						for(var i=0; i<toCopy.length; i++){
							bounds = toCopy[i].getBounds();
							midX += bounds.x;
							midY += bounds.y;
						}
						
						midY /= toCopy.length;
						midX /= toCopy.length;
						that.map.selector.clear();
						var cop = null;
						for(var i=0; i<toCopy.length; i++){
							
							if(!e.shiftKey){
								bounds = toCopy[i].getBounds();
								cop = that.copy(toCopy[i].data, bounds.x - midX + (x - map.offsetX) / map.scale.x, bounds.y - midY + (y - map.offsetY) / map.scale.y);
							}
							else{
								cop = that.copy(toCopy[i].data, toCopy[i].data.x, toCopy[i].data.y);
							}
							
							that.map.selector.add(cop);
						}
					}
					
					if(e.which == MT.keys.D && e.target == document.body){
						that.duplicate();
						e.preventDefault();
					}
					
					
				}
				else if(e.target.tagName != "INPUT" && e.target.tagName != "TEXTAREA") {
					var tools = Object.keys(that.tools);
					if(e.which == "1".charCodeAt(0)){
						that.setTool(that.tools[tools[0]]);
					}
					if(e.which == "2".charCodeAt(0)){
						that.setTool(that.tools[tools[1]]);
					}
					if(e.which == "3".charCodeAt(0)){
						that.setTool(that.tools[tools[2]]);
					}
					if(e.which == "4".charCodeAt(0)){
						that.setTool(that.tools[tools[3]]);
					}
					if(e.which == "5".charCodeAt(0)){
						that.setTool(that.tools[tools[4]]);
					}
				}
			});
			
			for(var i in this.tools){
				this.tools[i].initUI(this.ui);
			}
			
			this.setTool(this.tools.select);
		},
		
		lastAsset: null,
		
		duplicate: function(){
			var tcp = [], cop, that = this, map = this.map;
			map.selector.forEach(function(obj){
				tcp.push(obj);
			});
			tcp.sort(function(a, b){
				return (map.loadedObjects.indexOf(a) - map.loadedObjects.indexOf(b));
			});
			
			that.map.selector.clear();
			for(var i=0; i<tcp.length; i++){
				cop = that.copy(tcp[i].data, tcp[i].data.x, tcp[i].data.y);
				that.map.selector.add(cop);
			}
		},
		
		select: function(object){
			this.tools.select.select(object);
			if(this.activeTool != this.tools.select){
				this.activeTool.select(object);
			}
		},
		
		copy: function(toCopy, x, y){
			if(Array.isArray(toCopy)){
				for(var i=0; i<toCopy.length; i++){
					this.copy(toCopy[i], x, y);
				}
				return;
			}
			
			
			
			var tc = this.om.copy(toCopy, x, y);
			var sprite = this.map.getById(tc.id);
			
			
			
			this.om.sync();
			
			return sprite;
		},
		
		setTool: function(tool, skipNotify){
			if(this.activeTool == tool){
				return;
			}
			var oldTool = null;
			if(this.activeTool){
				oldTool = this.activeTool;
				this.activeTool = null;
				oldTool.button.removeClass("active");
			}
			
			this.activeTool = tool;
			this.activeTool.button.addClass("active");
			
			if(oldTool){
				oldTool.deactivate();
			}
			
			
			this.activeTool.init(skipNotify);
			this.emit(MT.TOOL_SELECTED, tool);
		},
		
		mouseDown: function(e){
			if(e.button === 2){
				this.previousMouseMove = this.map.handleMouseMove;
				this.mouseDown_hand(e);
				return;
			}
			
			this.activeTool.mouseDown(e);
		},
		
		mouseUp: function(e){
			
			if(e.button == 2){
				this.map.handleMouseMove = this.previousMouseMove;
				return;
			}
			
			this.activeTool.mouseUp(e);
		},
		
		mouseMove: function(e){
			this.activeTool.mouseMove(e);
		},
		
		lastSelected: null,
		
		selectObject: function(obj, clear){
			/*if(this.lastSelected && this.lastSelected == obj && this.map.activeObject){
				return;
			}
			this.lastSelected = obj;*/
			if(clear){
				this.map.selector.clear();
			}
			
			this.map.activeObject = obj;
			this.map.selector.add(obj);
			
			// next line will be launched from selector listeer
			// this.emit(MT.OBJECT_SELECTED, obj);
		},
		
		
		initTmpObject: function(asset){
			
			asset = asset || this.lastAsset;
			this.lastAsset = asset;
			
			
			
			var x = this.ui.events.mouse.x;
			var y = this.ui.events.mouse.y;
			var om = this.project.plugins.objectmanager;
			
			var dx = 0;
			var dy = 0;
			
			if(this.tmpObject){
				dx = this.tmpObject.x;
				dy = this.tmpObject.y;
			}
			
			if(!this.tmpObject){
				this.tmpObject = new MT.core.MagicObject(om.createObject(asset), this.map.game.world, this.map);
			}
			else{
				this.tmpObject.update(om.createObject(asset));
			}
			//this.tmpObject =  this.map.createObject();
			this.map.activeObject = this.tmpObject;
			
			
			this.tmpObject.x = dx || x;
			this.tmpObject.y = dy || y;
			
			this.tmpObject.bringToTop();
		},
		
		removeTmpObject: function(){
			if(this.tmpObject){
				this.tmpObject.hide();
			}
			
			if(this.map.activeObject == this.tmpObject){
				this.map.activeObject = null;
			}
			this.tmpObject = null;
		},

		
		
		
		mouseDown_hand: function(e){
			this.map.handleMouseMove = this.map._cameraMove;
		},
		

		

		unselectObjects: function(){
			var toUnselect = [];
			this.map.selector.forEach(function(obj){
				if(!obj.data.contents){
					toUnselect.push(obj);
				}
			});
			
			for(var i=0; i<toUnselect.length; i++){
				this.map.selector.remove(toUnselect[i]);
			}
			this.map.activeObject = null;
		},
		
		hide: function(){
			this.object.visible = false;
		},
	}
);
//MT/plugins/Import.js
MT.namespace('plugins');
MT.extend("core.Emitter").extend("core.BasicPlugin")(
	MT.plugins.Import = function(project){
		MT.core.BasicPlugin.call(this, "Import");
		this.project = project;
	},
	{}
);
//MT/plugins/Export.js
MT.namespace('plugins');
MT.requireFile("js/qrcode.min.js");

MT.extend("core.Emitter").extend("core.BasicPlugin")(
	MT.plugins.Export = function(project){
		MT.core.BasicPlugin.call(this, "Export");
		this.project = project;
	},
	{
		get path(){
			return "data/build/" + this.project.id + "/" + this.project.data.rev;
		},
		
		initUI: function(ui){
			var that = this;
			this.list = new MT.ui.List([
				{
					label: "Phaser.io (.js)",
					title: "Phaser.io Project",
					className: "",
					cb: function () {
						var not = that.project.plugins.notification.show("Exporting project...", that.project.data.title);
						that.export("phaser", {
							zip: 1
						},
						function (data) {
							window.location = that.path + "/" + data.file;
							not.hide();
						});
					}
				},
				{
                    label: "Web App (Phaser.io minified)",
					title: "Minified project sources based on Phaser.io framework",
                    className: "",
                    cb: function () {
						that.minify();
                    }
				},
				{
					label: "Android",
					contents: [
						{
							label: "Crosswalk",
							contents: [
								{
									label: "Debug (ARM)",
									title: "most android phones uses arm processors",
									className: "",
									cb: function () {
										that.crosswalk("arm");
									}
								},
								{
									label: "Debug (x86)",
									title: "some phones and tablets uses intel atom or similar cpus",
									className: "",
									cb: function () {
										that.crosswalk("x86");
									}
								},
								{
									label: "Release (ARM)",
									title: "most android phones uses arm processors",
									className: "",
									cb: function () {
										that.crosswalk("arm", true);
									}
								},
								{
									label: "Release (x86)",
									title: "some phones and tablets uses intel atom or similar cpus",
									className: "",
									cb: function () {
										that.crosswalk("x86", true);
									}
								}
							]
						},
						{
							label: "Cordova",
							contents: [
								{
									label: "Debug",
									cb: function () {
										that.cordova();
									}
								},
								{
									label: "Release",
									cb: function () {
										that.cordova(1);
									}
								}
							]
						}
					]
				},
				
				{
					label: "data only - js",
					title: "data generated by editor - javascript format",
					className: "",
					cb: function () {
						that.export("phaserDataOnly", function (data) {
							that.openDataLink(data, "js");
						});
					}
				},
				{
					label: "data only - json",
					title: "data generated by editor - JSON format",
					className: "",
					cb: function () {
						that.export("phaserDataOnly", function (data) {
							that.openDataLink(data, "json");
						});
					}
				}
				], ui, true);

			var b = this.button= this.project.panel.addButton("Export", null, function(e){
				that.showList();
			});
			var om = this.project.plugins.objectmanager;

			this.openGame = this.project.panel.addButton("Open Game", null, function(e){
				om.sync();
				that.openLink("_open_game");
			});
		},

		export: function(dest, data, cb){
			if(typeof data == "function"){
				cb = data;
				data = null;
			}
			this.send(dest, data, cb);
		},

		showList: function(){
			this.list.width = 250;
			this.list.y = this.button.el.offsetHeight;
			this.list.x = this.button.el.offsetLeft-5;
			this.list.el.style.bottom = "initial";
			this.list.show(document.body);
		},

		openDataLink: function(data, json){
			if(json == "json"){
				data.file += "on";
			}
			var w = window.innerWidth*0.5;
			var h = window.innerHeight*0.8;
			var l = (window.innerWidth - w)*0.5;
			var t = (window.innerHeight - h)*0.5;

			window.open(this.path + "/" + data.file,"","width="+w+",height="+h+",left="+l+",top="+t+"");
		},

		openLink: function(name){
			var w = window.open("about:blank",name || Date.now());
			w.focus();
			//w.opener = null;

			var path = this.path;
			this.export("phaser", {
				zip: 0
			},
			function(data){
				if(w.location){
					w.location.href = path + "/" +data.name + "/index.html";
					w.focus();
				}
			});
		},
		
		popWithDots: function(label){
			var dots = "...";
			
			var pop = new MT.ui.Popup("Export", label + dots);
			
			pop.y = 150;
			var interval = window.setInterval(function(){
				dots += ".";
				if(dots.length > 3){
					dots = "";
				}
				pop.content.innerHTML = label + dots;
			}, 300);
			
			pop.clear = function(){
				window.clearInterval(interval);
			};
			
			return pop;
		},
		
		crosswalk: function(arch, release){
			var that = this;
			
			if( !this.project.data.package ){
				this.project.updateProject(function(props){
					that.crosswalk(arch, release);
				});
				return;
			}
			
			var pop = this.popWithDots("Building apk");
			that.export("crosswalk", {arch: arch, rel: release}, function (data) {
				pop.clear();
				
				if(data.requireProLevel){
					pop.showClose();
					pop.content.innerHTML = "Only subscribers can use this feature!";
					pop.addButton("OK", function(){pop.hide();});
					return;
				}
				
				if(data.requireSignature){
					pop.hide();
					that.genKeystoreForm(function(){
						that.crosswalk(arch, release);
					});
					return;
				}
				
				if(data.requirePackage){
					pop.hide();
					that.project.updateProject(function(props){
						that.crosswalk(arch, release);
					});
					return;
				}
				
				pop.showClose();
				pop.addButton("Done", function(){pop.hide();});
				
				if(data.serr && data.serr.length){
					pop.content.innerHTML = "Please review errors and try again!<br />";
					var list = '<ul class="error-list">';
					for(var i=0; i<data.serr.length; i++){
						list += "<li>"+data.serr[i].trim()+"</li>";
					}
					pop.content.innerHTML += list + "</ul>";
					
				}
				else{
					pop.content.innerHTML = "DONE!";
					that.linkWithQR(pop.content, "Download", data.link);
				}
			});
		},
		
		cordova: function(release){
			if( !this.project.data.package ){
				this.project.updateProject(function(props){
					that.cordova();
				});
				return;
			}
			
			var that = this;
			var pop = this.popWithDots("Building apk");
			that.export("cordova", {rel: release}, function (data) {
				pop.clear();
				pop.showClose();
				
				if(data.requireProLevel){
					pop.content.innerHTML = "Only subscribers can use this feature!";
					pop.addButton("OK", function(){pop.hide();});
					return;
				}
				
				pop.showClose();
				pop.addButton("Done", function(){pop.hide();});
				if(data.serr && data.serr.length){
					pop.content.innerHTML = "Please review errors and try again!<br />";
					var list = '<ul class="error-list">';
					for(var i=0; i<data.serr.length; i++){
						list += "<li>"+data.serr[i].trim()+"</li>";
					}
					pop.content.innerHTML += list + "</ul>";
					
				}
				else{
					pop.content.innerHTML = "DONE!";
					that.linkWithQR(pop.content, "Download", data.link);
				}
			});
		},
		cordovaProject: function(){
			
		},
		genKeystoreForm: function(cb){
			var that = this;
			
			var info = {
				CN: "John Smith",
				OU: "Mobile Games", 
				O: "My Company", 
				L: "My Town",
				ST: "My State",
				C: "UN"
			};
			
			var names = {
				CN: "First and Last Name (CN)",
				OU: "Organizational Unit (OU)", 
				O: "Organization (O)", 
				L: "City or Location (L)",
				ST: "State or Province (ST)",
				C: "Country Code (XX) (C)"
			};
			
			var pop = new MT.ui.Popup("Keystore", "");
			pop.showClose();
			var input;
			for(var i in info){
				input = new MT.ui.Input(this.project.ui, {key: i, label: names[i], type: "text"}, info, function(n,o){
					//console.log("xxx", n, o);
				});
				input.show(pop.content);
			}
			pop.show();
			
			pop.addButton("Next", function(){
				pop.hide();
				that.send("genKeystore", info, function(error){
					if(error){
						console.error(error);
						return;
					}
					if(cb){
						cb();
					}
				});
				
			});
		},
		
		linkWithQR: function(parent, label, link){
			var div = document.createElement("div");
			div.className = "table";
			
			var a = document.createElement("a");
			a.style.width = "90px";
			a.setAttribute("target", "_blank");
			a.setAttribute("href", link);
			a.appendChild(document.createTextNode(label));
			
			var input = document.createElement("input");
			input.value = link;
			input.style.cssText = "padding: 3px; width: 100%";
			
			var qr = document.createElement("div");
			var qrcode = new QRCode(qr, {
				text: link,
				width: 256,
				height: 256,
				colorDark : "#000000",
				colorLight : "#ffffff",
				correctLevel : QRCode.CorrectLevel.H
			});
			
			div.appendChild(a);
			div.appendChild(input);
			
			parent.appendChild(div);
			parent.appendChild(qr);
		},
		
		
		minify: function(){
			var that = this;
			var label = "Export in progress";
			
			
			var pop = this.popWithDots(label);
			
			
			this.export("phaserMinify", function (data) {
				pop.clear();
				
				pop.showClose();
				pop.addButton("Done", function(){pop.hide();});
				
				var base = window.location.origin + "/" + that.path + "/" + data.file;
				
				var link1 = base + "-minified/index.html";
				var link2 = base + '.min.zip';
				
				pop.content.innerHTML = '<div class="table">'+
					'<a href="' + link1 + '" style="width: 90px" target="_blank">Open</a><input value="'+link1+'"  style="padding: 3px; width: 100%" /></div><div id="link1"></div>';
				pop.content.innerHTML += '<div class="table">'+
					'<a href="' + link2 + '" style="width: 90px" target="_blank">Download</a><input value="'+link2+'"  style="padding: 3px; width: 100%" /></div><div id="link2"></div>';
				
				var x = document.getElementById("link1");
				var qrcode = new QRCode(x, {
					text: link1,
					width: 256,
					height: 256,
					colorDark : "#000000",
					colorLight : "#ffffff",
					correctLevel : QRCode.CorrectLevel.H
				});
				
				var img1 = x.lastChild;
				img1.style.cursor = "pointer";
				img1.width = 32;
				img1.height = 32;
				img1.onmouseup = function(e){
					if(this.width < 256){
						this.width = 256;
						this.height = 256;
						
						img2.width = 32;
						img2.height = 32;
					}
					else{
						this.width = 32;
						this.height = 32;
						
						img2.width = 256;
						img2.height = 256;
					}
				};
				
				
				x = document.getElementById("link2");
				qrcode = new QRCode(x, {
					text: link2,
					width: 256,
					height: 256,
					colorDark : "#000000",
					colorLight : "#ffffff",
					correctLevel : QRCode.CorrectLevel.H
				});
				
				var img2 = x.lastChild;
				img2.style.cursor = "pointer";
				//img2.width = 32;
				//img2.height = 32;
				img2.onmouseup = function(e){
					if(this.width < 256){
						this.width = 256;
						this.height = 256;
						
						img1.width = 32;
						img1.height = 32;
					}
					else{
						this.width = 32;
						this.height = 32;
						
						img1.width = 256;
						img1.height = 256;
						
					}
				};
				
			});
		},
		
		a_complete: function(data){
			this.emit("done", data);
		}

	}
);

//MT/plugins/Settings.js
MT.namespace('plugins');
MT.require("ui.Input");

MT(
	MT.plugins.Settings = function(project){
		
		this.project = project;
		this.inputs = [];
		
		
		this.objects = {};
		
		this.activeId = 0;
	},
	{
		initUI: function(ui){
			this.panel = ui.createPanel("Settings");
			this.panel.setFree();
			var that = this;
			this.panel.header.addClass("ui-wrap");
		},
		
		installUI: function(){
			var that = this;
			
			this.project.plugins.assetmanager.on([MT.ASSET_FRAME_CHANGED, MT.ASSET_SELECTED], function(obj, frame){
				if(obj){
					that.handleAssets(obj);
				}
				else{
					that.clear();
				}
			});
			
			/*this.project.plugins.tools.on(MT.ASSET_FRAME_CHANGED, function(obj, frame){
				if(obj){
					that.handleAssets(obj);
				}
				else{
					that.clear();
				}
			});*/
			this.project.plugins.tools.on(MT.OBJECT_SELECTED, function(obj){
				that.handleObjects(that.project.plugins.mapeditor.getById(obj.id));
				that.active = obj.id;
			});
			this.project.plugins.tools.on(MT.OBJECT_UNSELECTED, function(obj){
				that.clear();
			});
			
			var map = this.project.plugins.mapeditor;
			map.on("select", function(obj){
				that.handleScene(map.settings);
			});
			
			/*
			this.project.plugins.moviemaker.on(MT.FRAME_SELECTED, function(obj){
				console.log("FRAME", obj);
				that.addEasingOptions(obj);
			});
			*/
		},
		handleClick: function(obj){
			
			
		},
		clear: function(){
			var stack = this.inputs[this.stack];
			for(var i in stack){
				stack[i].hide();
			}
			this.stack = "";
			this.lastObj = null;
			return;
			
			this.panel.title = "Settings";
			for(var i=0; i<this.inputs.length; i++){
				this.inputs[i].remove();
			}
			this.inputs.length = 0;
			
		},
		
		addInput: function(key, object, right, cb){
			if(!this.inputs[this.stack]){
				this.inputs[this.stack] = {};
			}
			
			var stack = this.inputs[this.stack];
			var k = key;
			if(typeof key !== "string"){
				k = key.key;
			}
			if(stack[k]){
				stack[k].setObject(object);
				stack[k].show();
				return stack[k];
			}
			
			
			var p = this.panel.content;
			
			var fw = new MT.ui.Input(this.project.ui, key, object);
			fw.show(p.el);
			
			fw.style.position = "relative";
			fw.style.height = "20px";
			
			stack[k] = fw;
			
			fw.on("change", cb);
			return fw;
		},
		
   
		lastObj: null,
		handleAssets: function(obj){
			this.ooo = obj;
			if(obj.contents !== void(0)){
				return;
			}
			
			if(this.lastObj == obj){
				return;
			}
			this.lastObj = obj;
			
			this.clear();
			
			//this.panel.title = obj.name;
			
			var that = this;
			var cb = function(){
				that.project.am.updateData();
			};
			
			if(!obj.key){
				obj.key = obj.fullPath;
			}
			
			this.stack = "assets";
			this.addInput( {key: "key", type: "text"}, obj, false, cb);
			this.addInput( {key: "frameWidth", step: 1, min: 1}, obj, false, cb);
			this.addInput( {key: "frameHeight", step: 1, min: 1}, obj, true, cb);
			this.addInput( "frameMax", obj, false, cb);
			this.addInput( {key: "margin", step: 1, min: 0} , obj, true, cb);
			this.addInput( {key: "spacing", step: 1, min: 0}, obj, false, cb);
			this.addInput( {key: "anchorX", step: 0.5}, obj, true, cb);
			this.addInput( {key: "anchorY", step: 0.5}, obj, true, cb);
			this.addInput( {key: "fps", step: 1}, obj, true, cb);
			
			this.addInput( {key: "atlas", value: obj.atlas, accept: MT.const.DATA, type: "upload"}, obj, true, function(e, asset){
				if(e.target.files.length === 0){
					return;
				}
				that.project.am.addAtlas(asset, e);
			});
			
			this.addInput( {key: "update", type: "upload", accept: MT.const.IMAGES}, obj, true, function(e, asset){
				that.project.am.updateImage(asset, e);
			});
			
			
		},
   
		/* TODO: add this to input class*/
		addEasingOptions: function(obj){
			
			var buff = [];
			
			var eas = Phaser.Easing;
			this.genEasings(eas, "Phaser.Easing", buff);
			
			obj.easing = obj.easing || buff[0].label;
			
			this.addInput({key: "easing", type: "select", options: buff}, obj); 
			
			
			return;
			var div = document.createElement("div");
			div.className = "ui-input";
			
			var label = document.createElement("div");
			label.style.right = "50%";
			label.innerHTML = "easing";
			div.appendChild(label);
			
			
			var sel = document.createElement("select");
			sel.className = "ui-input-value";
			
			var opt;
			for(var i=0; i<buff.length; i++){
				opt = document.createElement("option");
				opt.innerHTML = buff[i].label;
				opt.value = buff[i].label;
				
				sel.appendChild(opt);
			}
			
			sel.onchange = function(){
				//console.log("change", this.value);
			};
			
			div.appendChild(sel);
			
			this.panel.content.el.appendChild(div);
			
		},
   
		genEasings: function(eas, label, buffer){
			buffer = buffer || [];
			var lab = label;
			for(var k in eas){
				if(typeof eas[k] == "object"){
					this.genEasings(eas[k], label+"."+k, buffer);
					continue;
				}
				
				buffer.push({
					label: label + "." + k,
					value: label + "." + k
				});
			}
			
			return buffer;
			
		},
   
		handleObjects: function(obj){
			/*if(!MO){
				return;
			}
			var obj = MO;
			*/
			
			if(this.lastObj == obj){
				return;
			}
			this.lastObj = obj;
			
			this.clear();
			//this.panel.title = obj.data.name;
			var that = this;
			var cb = function(){
				that.project.om.update();
			};
			//group
			if(obj.data.type == MT.objectTypes.GROUP){
				this.stack = "group";
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				this.objects.angle = this.addInput( "angle", obj, true, cb);
				if(obj.isFixedToCamera === void(0)){
					obj.isFixedToCamera = 0;
				}
				this.objects.isFixedToCamera = this.addInput({key:"isFixedToCamera", min: 0, max: 1, step: 1}, obj, true, cb);
				
				this.objects.scaleX = this.addInput( {
					key: "scaleX",
					step: 0.1
				}, obj, true, cb)
				this.objects.scaleY = this.addInput( {
					key: "scaleY",
					step: 0.1
				}, obj, true, cb);
			}
			// tile layer
			else if(obj.data.type == MT.objectTypes.TILE_LAYER){
				
				this.stack = "layer";
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				this.addInput("widthInTiles", obj, true, cb);
				this.addInput("heightInTiles", obj, true, cb);
				this.addInput("tileWidth", obj, true, cb);
				this.addInput("tileHeight", obj, true, cb);
				
				
				this.addInput({key:"isFixedToCamera", min: 0, max: 1, step: 1}, obj, true, cb);
				
				this.addInput( {
					key: "anchorX",
					step: 0.1
				}, obj, true, cb);
				this.addInput( {
					key: "anchorY",
					step: 0.1
				}, obj, true, cb);
				
			
			}
			// tile text
			else if(obj.data.type == MT.objectTypes.TEXT){
				this.stack = "sprite";
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				
				if(obj._framesCount){
					this.objects.frame = this.addInput( "frame", obj, true, function(){
						
						if(obj.frame >= obj._framesCount){
							obj.frame = 0;
						}
						
						if(obj.frame < 0){
							obj.frame = obj._framesCount - 1;
						}
						
						that.objects.frame.setValue(obj.frame, true);
						
						cb();
					});
				}
				this.objects.angle = this.addInput( "angle", obj, true, cb);
				this.objects.anchorX = this.addInput( {
					key: "anchorX",
					step: 0.1
				}, obj, true, cb);
				this.objects.anchorY = this.addInput( {
					key: "anchorY",
					step: 0.1
				}, obj, true, cb);
				
				this.objects.width = this.addInput( {
					key: "width",
					step: 1,
				}, obj, true, function(width, oldWidth){
					var ow = oldWidth / obj.scaleX;
					var scale = width / ow;
					that.objects.scaleX.setValue(scale);
					cb();
					that.objects.width.setValue(parseInt(width, 10), true);
				});
				this.objects.wordWrapWidth = this.addInput( {
					key: "wordWrapWidth",
					step: 1,
				}, obj, true, cb);
				
				this.objects.height = this.addInput( {
					key: "height",
					step: 1,
				}, obj, true, function(height, oldHeight){
					var ov = oldHeight / obj.scaleY;
					var scale = height / ov;
					that.objects.scaleY.setValue(scale);
					cb();
					that.objects.height.setValue(parseInt(height, 10), true);
				});
				
				this.objects.scaleX = this.addInput( {
					key: "scaleX",
					step: 0.1
				}, obj, true, cb)
				this.objects.scaleY = this.addInput( {
					key: "scaleY",
					step: 0.1
				}, obj, true, cb);
			}
			//sprite
			else{
				this.stack = "sprite";
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				
				if(obj._framesCount){
					this.objects.frame = this.addInput( "frame", obj, true, function(){
						
						if(obj.frame >= obj._framesCount){
							obj.frame = 0;
						}
						
						if(obj.frame < 0){
							obj.frame = obj._framesCount - 1;
						}
						
						that.objects.frame.setValue(obj.frame, true);
						
						cb();
					});
				}
				this.objects.angle = this.addInput( "angle", obj, true, cb);
				this.objects.anchorX = this.addInput( {
					key: "anchorX",
					step: 0.1
				}, obj, true, cb);
				this.objects.anchorY = this.addInput( {
					key: "anchorY",
					step: 0.1
				}, obj, true, cb);
				
				this.objects.width = this.addInput( {
					key: "width",
					step: 1,
				}, obj, true, function(width, oldWidth){
					var ow = oldWidth / obj.scaleX;
					var scale = width / ow;
					that.objects.scaleX.setValue(scale);
					cb();
					that.objects.width.setValue(parseInt(width, 10), true);
				});
				
				
				this.objects.height = this.addInput( {
					key: "height",
					step: 1,
				}, obj, true, function(height, oldHeight){
					var ov = oldHeight / obj.scaleY;
					var scale = height / ov;
					that.objects.scaleY.setValue(scale);
					cb();
					that.objects.height.setValue(parseInt(height, 10), true);
				});
				
				this.objects.scaleX = this.addInput( {
					key: "scaleX",
					step: 0.1
				}, obj, true, cb)
				this.objects.scaleY = this.addInput( {
					key: "scaleY",
					step: 0.1
				}, obj, true, cb);
			}
			
			this.objects.alpha = this.addInput( {key: "alpha", min: 0, max: 1, step: 0.1}, obj, true, cb);
			
		},
		
		update: function(){
			for(var i in this.objects){
				this.objects[i].update();
			}
		},
   
		updateObjects: function(obj){
			if(obj.id != this.activeId){
				//return;
			}
			for(var i in this.objects){
				this.objects[i].obj = obj;
				this.objects[i].setValue(obj[i], true);
			}
		},
   
		handleScene: function(obj){
			this.clear();
			
			this.stack = "scene";
			var that = this;
			var cb = function(){
				that.project.plugins.mapeditor.updateScene(obj);
			};
			this.scene = {};
			
			this.scene.cameraX = this.addInput( {key: "cameraX"}, obj, true, cb);
			this.scene.cameraY = this.addInput( {key: "cameraY"}, obj, true, cb);
			
			this.scene.worldWidth  = this.addInput( {key: "worldWidth"}, obj, true, cb);
			this.scene.worldHeight = this.addInput( {key: "worldHeight"}, obj, true, cb);
			
			this.scene.viewportWidth  = this.addInput( {key: "viewportWidth"}, obj, true, cb);
			this.scene.viewportHeight = this.addInput( {key: "viewportHeight"}, obj, true, cb);
			
			
			var scaleMode = [
				{
					label: "NO_SCALE",
					value: "NO_SCALE",
					title: "A scale mode that prevents any scaling"
				},{
					label: "SHOW_ALL",
					value: "SHOW_ALL",
					title: "A scale mode that shows the entire game while maintaining proportions"
				},{
					label: "EXACT_FIT",
					value: "EXACT_FIT",
					title: "A scale mode that stretches content to fill all available space"
				},{
					label: "RESIZE",
					value: "RESIZE",
					title: "A scale mode that causes the Game size to change"
				},{
					label: "USER_SCALE",
					value: "USER_SCALE",
					title: "A scale mode that allows a custom scale factor"
				}
			];
			
			this.scene.scaleMode = this.addInput({key: "scaleMode", options: scaleMode, type: "select"}, obj, true, cb)
			
			this.scene.gridX = this.addInput( {key: "gridX", min: 2}, obj, true, cb);
			this.scene.gridY = this.addInput( {key: "gridY", min: 2}, obj, true, cb);
			this.scene.showGrid = this.addInput( {key: "showGrid", min: 0, max: 1}, obj, true, cb);
			this.scene.gridOpacity = this.addInput( {key: "gridOpacity", min: 0, max: 1, step: 0.1}, obj, true, cb);
			this.scene.backgroundColor = this.addInput( {key: "backgroundColor", type: "color" }, obj, true, cb);
			this.scene.pixelPerfectPicking = this.addInput( {key: "pixelPerfectPicking", type: "bool" }, obj, true, cb);
			
		},
   
		updateScene: function(obj){
			for(var i in this.scene){
				this.scene[i].obj = obj;
				this.scene[i].setValue(obj[i]);
			}
		},




	}
);
//MT/plugins/ObjectManager.js
MT.namespace('plugins');
/* TODO: 
 * - seperate by object types
 * - optimize - so only changed object gets updated not all object chunk
 * - set correct id instead of tmpXXXXX - probably add event on server side
 */

"use strict";

MT.require("ui.TreeView");
MT.require("ui.List");
MT.require("core.Selector");

MT.objectTypes = {
	SPRITE: 0,
	GROUP: 1,
	TEXT: 2,
	TILE_LAYER: 3,
	MOVIE_CLIP: 4
};

MT.OBJECT_ADDED = "OBJECT_ADDED";
MT.OBJECT_SELECTED = "OBJECT_SELECTED";
MT.OBJECT_UNSELECTED = "OBJECT_UNSELECTED";
MT.OBJECT_DELETED = "OBJECT_DELETED";
MT.OBJECT_UPDATED = "OBJECT_UPDATED";
MT.OBJECT_UPDATED_LOCAL = "OBJECT_UPDATED_LOCAL";
MT.OBJECTS_RECEIVED = "OBJECTS_RECEIVED";

MT.OBJECTS_UPDATED = "OBJECTS_UPDATED";
MT.OBJECTS_SYNC = "OBJECTS_SYNC";

MT.requireFile("js/lodash.js");
MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.ObjectManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "om");
		this.project = project;
		
		this.selector = new MT.core.Selector();
		
		this.id = Date.now();
		
		this._activeGroup = null;
	},
	{
		
		set activeGroup(val){
			this._activeGroup = val;
		},
		get activeGroup(){
			return this._activeGroup;
		},
		
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("Objects");
			this.panel.setFree();
			this.panel.content.style.overflow = "initial";
			
			var that = this;
			
			this.panel.addButtons([
				{
					label: "Add Group",
					className: "add-group",
					cb: function(){
						that.createGroup();
					}
				},
				{
					label: "Duplicate selected object (ctrl + D)",
					className: "duplicate",
					cb: function(){
						that.project.plugins.tools.duplicate();
					}
				},
				/*{
					label: "Add Movie Clip",
					className: "",
					cb: function(){
						that.createMovieClip();
					}
				},*/
				{
					label: "Add TileLayer",
					className: "add-tilelayer",
					cb: function(){
						that.createTileLayer();
					}
				},
				{
					label: "Group Selected Objects",
					className: "Group-selected",
					cb: function(){
						that.groupSelected();
					}
				},
				{
					label: "Delete Selected Objects",
					className: "delete-selected",
					cb: function(){
						that.deleteSelected();
					}
				}
			], ui, true);
			
			
			this.tv = new MT.ui.TreeView([], {
				root: this.project.path,
				showHide: true,
				lock: true
			});
			
			this.tv.on("change", function(oldItem, newItem){
				that.update();
				that.sync();
			});
			
			this.tv.sortable(this.ui.events);
			this.tv.tree.show(this.panel.content.el);
			
			
			this.tv.on(["lock", "open", "close", "show"], function(item){
				that.update();
				that.sync();
			});
			
			this.tv.on(["click", "select"], function(data, el){
				that.emit(MT.OBJECT_SELECTED, data);
			});
			
			var timeouts = {};
			this.on(MT.OBJECT_UPDATED_LOCAL, function(mo){
				if(!mo.id){
					return;
				}
				
				if(timeouts[mo.id]){
					window.clearTimeout(timeouts[mo.id]);
				}
				timeouts[mo.id] = window.setTimeout(function(){
					that.emit(MT.OBJECT_UPDATED, mo);
				}, 500);
			});
			
			this.on(MT.OBJECT_UPDATED, function(mo){
				that.saveObject(mo.data);
				that.update();
			});
		},
		
		
		installUI: function(ui){
			var that = this;
			var tools = this.project.plugins.tools;
			
			tools.on(MT.OBJECT_SELECTED, function(obj){
				var el = that.tv.getById(obj.id);
				
				if(el){
					if(el.isFolder && el.data.type == MT.objectTypes.GROUP){
						that.activeGroup = el.data;
					}
					else{
						if(obj.parent && obj.parent.magic){
							that.activeGroup = obj.parent.magic.data;
						}
					}
					el.addClass("selected.active");
					that.selector.add(el);
				}
			});
			
			tools.on(MT.OBJECT_UNSELECTED, function(obj){
				that.activeGroup = null;
				// deleted
				if(!obj){
					return;
				}
				var el = that.tv.getById(obj.id);
				if(el){
					if(that.activeGroup && that.activeGroup.id == obj.id){
						that.activeGroup = null;
					}
					el.removeClass("selected.active");
					that.selector.remove(el);
				}
			});

			/*ui.events.on(ui.events.MOUSEUP, function(e){
				that.sync();
			});*/
			
			tools.on(MT.ASSET_FRAME_CHANGED, function(obj){
				that.updateTree();
			});
			
			this.tv.on("deleted", function(o){
				that.selector.remove(o);
				that.activeGroup = null;
			});
			
		},
		
		
		received: false,
		
		a_receive: function(data, silent){
			
			if(this.received && !silent){
				this.update();
				return;
			}
			
			this.received = true;
			this.tv.merge(data);
			
			if(!silent){
				this.emit(MT.OBJECTS_UPDATED, this.tv.getData());
			}
			this.update();
		},
		
		getData: function(){
			return this.tv.getData();
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		//add object from asset
		addObject: function( e, obj ){
			if(obj.type == MT.GROUP){
				return;
			}
			var no = this.createObject(obj, e.offsetX, e.offsetY);
			this.insertObject(no);
		},
		
		
		insertObject: function(obj, silent, data, skipActive){
			data = data || this.tv.getData();
			//var data = this.tv.getData();
			var map = this.project.plugins.mapeditor;
			
			var active, cont;
			if(this.activeGroup){
				cont = this.activeGroup.contents;
				active = this.activeGroup;
			}
			else{
				cont = data;
			}
			
			
			if(!skipActive && active){
				active = map.getById(active.id);
				while(active){
					obj.x -= active.x;
					obj.y -= active.y;
					active = active.parent;
					if(active){
						active = active.magic;
					}
				}
			}
			
			obj.id = "tmp"+this.mkid();
			
			obj.tmpName = obj.tmpName || obj.name;
			
			obj.name = obj.tmpName + this.getNewNameId(obj.tmpName, cont, 0);
			
			cont.unshift(obj);
			
			obj.index = -1;
			
			/*map.loadedObjects.forEach(function(o, index){
				o.object.z = index;
			});
			*/
			
			if(!silent){
				this.tv.rootPath = this.project.path
				this.tv.merge(data);
				this.update();
				this.sync();
				this.emit(MT.OBJECT_ADDED, obj);
			}
			
			
			return obj;
		},
		
		updateTree: function(){
			this.tv.merge(this.tv.getData());
		},
		
		createObject: function(asset, x, y){
			x = x || 0;
			y = y || 0;
			
			
			var data = this.tv.getData();
			var name;
			if(asset.atlas){
				if(this.project.plugins.assetmanager.tmpName){
					name = this.project.plugins.assetmanager.tmpName;
				}
			}
			if(!name){
				name = asset.name.split(".");
				name.pop();
				name = name.join("");
			}
			
			return  {
				assetId: asset.id,
				__image: asset.__image,
				x: x,
				y: y,
				type: MT.objectTypes.SPRITE,
				anchorX: asset.anchorX,
				anchorY: asset.anchorY,
				userData: _.cloneDeep((asset.userData || {})),
				physics: _.cloneDeep((asset.physics || {})),
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				alpha: 1,
				tmpName: name,
				frame: 0,
				isVisible: 1,
				isLocked: 0,
				contents: []
			};
		},
		
		createTextObject: function(x, y){
			x = x || 0;
			y = y || 0;

			var name = "Text";
			return  {
				x: x,
				y: y,
				type: MT.objectTypes.TEXT,
				anchorX: 0,
				anchorY: 0,
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				alpha: 1,
				tmpName: name,
				wordWrapWidth: 100,
				style: {
					fontFamily: "Arial",
					fontSize: 32
				},
				align: "left",
				wordWrap: 0,
				isVisible: 1,
				isLocked: 0
			};
			
		},
		
		createGroup: function(silent, isRoot){
			var cont;
			var data = this.tv.getData();
			var map = this.project.plugins.mapeditor;
			if(!isRoot && map.activeObject && map.activeObject.type == MT.objectTypes.GROUP){
				cont = map.activeObject.data.contents;
			}
			else{
				cont = data;
			}
			
			var tmpName= "Group";
			var name = tmpName;
			for(var i=0; i<cont.length; i++){
				if(cont[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			var group = {
				id: "tmp"+this.mkid(),
				name: name,
				x: 0,
				y: 0,
				type: MT.objectTypes.GROUP,
				angle: 0,
				contents: [],
				isVisible: 1,
				isLocked: 0,
				isFixedToCamera: 0,
				isClosed: 0,
				scaleX: 1,
				scaleY: 1,
				alpha: 1
			};
			
			cont.unshift(group);
			
			this.tv.merge(data);
			
			if(!silent){
				this.update();
				this.sync();
			}
			return group;
		},
		
		createTileLayer: function(silent){
			var data = this.tv.getData();
			
			var tmpName= "Tile Layer";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			var obj = {
				id: "tmp"+this.mkid(),
				type: MT.objectTypes.TILE_LAYER,
				name: name,
				x: 0,
				y: 0,
				anchorX: 0,
				anchorY: 0,
				angle: 0,
				data: [],
				isVisible: 1,
				isLocked: 0,
				isFixedToCamera: 0,
				tileWidth: 32,
				tileHeight: 32,
				widthInTiles: 10,
				heightInTiles: 10,
				alpha: 1
			};
			
			data.unshift(obj);
			
			this.tv.merge(data);
			
			if(!silent){
				this.update();
				this.sync();
			}
			
			return obj;
		},
		
		copy: function(obj, x, y, name, silent){
			
			name = name || obj.name + this.getNewNameId(obj.name, this.tv.getData());
			var clone = _.cloneDeep(obj);
			clone.name = name;
			clone.x = x;
			clone.y = y;
			
			this.cleanUpClone(clone);
			
			
			this.insertObject(clone, silent);
			return clone;
		},
		
		multiCopy: function(arr, cb){
			console.log("multiCopy!");
			
			var data = this.tv.getData();
			var name, obj, clone;
			var out = [];
			
			
			
			var parent = this.activeGroup;
			this.activeGroup = null;
			
			for(var i=0; i<arr.length; i++){
				obj = arr[i];
				name = obj.name + this.getNewNameId(obj.name, data);
				clone = _.cloneDeep(obj);
				clone.name = name;
				if(parent && obj.id != parent.id){
					console.log("WILL HAVE PARENT", parent);
					this.activeGroup = parent;
				}
				
				
				this.cleanUpClone(clone);
				
				if(cb){
					cb(clone);
				}
				
				out.push(clone);
				
				
				this.insertObject(clone, true, data, true);
				this.activeGroup = null;
			}
			
			this.tv.rootPath = this.project.path
			this.tv.merge(data);
			
			this.update();
			this.sync();
			
			return out;
		},
		
		cleanUpClone: function(obj, inc){
			inc = inc || 0;
			inc++;
			
			if(obj.contents){
				for(var i=0; i<obj.contents.length; i++){
					this.cleanUpClone(obj.contents[i], inc);
				}
			}
			obj.id = "tmp"+this.mkid();
		},
		
		
		deleteSelected: function(){
			var data = this.tv.getData();
			this.selector.forEach(function(obj){
				this.deleteObj(obj.data.id, true, data);
			}, this);
			
			
			this.selector.clear();
			this.tv.merge(data);
			this.ui.events.simulateKey(MT.keys.ESC);
			this.sync();
		},
		
		deleteObj: function(id, silent, data){
			var datax = data || this.tv.getData();
			this._delete(id, datax);
			if(!data){
				this.tv.merge(datax);
			}
			//if using silent.. you should call manually sync
			if(!silent){
				this.ui.events.simulateKey(MT.keys.ESC);
				this.sync();
				this.update();
			}
			
			this.emit(MT.OBJECT_DELETED, id);
		},
		
		_delete: function(id, data){
			for(var i=0; i<data.length; i++){
				if(data[i].id == id){
					data.splice(i, 1)[0];
					break;
				}
				if(data[i].contents){
					this._delete(id, data[i].contents);
				}
			}
		},
		
		getNewNameId: function(name, data, id){
			id = id || 0;
			var tmpName = name;
			if(id > 0){
				tmpName += id;
			}
			
			
			for(var i=0; i<data.length; i++){
				if(data[i].name == tmpName){
					id++;
					id = this.getNewNameId(name, data, id);
				}
			}
			
			return (id > 0 ? id : "");
		},
		
		buildObjectsTree: function(list){
			var that = this;
			this.tv.rootPath = this.project.path;
			this.tv.merge(list);
			
			this.tv.tree.show(this.panel.content.el);
		},
		
		moveFile: function(a, b){
			this.send("moveFile", {
				a: a,
				b: b
			});
		},
		
		update: function(){
			this.emit(MT.OBJECTS_UPDATED, this.tv.getData());
		},
		
		select: function(id){
			this.tv.select(id);
		},
		
		mkid: function(){
			this.id++;
			return this.id;
		},
		
		groupSelected: function(){
			
			var folder = this.createGroup(true, true);
			folder.isClosed = false;
			var that = this;
			
			var data = this.tv.getData();
			
			var map = this.project.plugins.mapeditor;
			map.selector.sort(function(a, b){
				return (b.object.z - a.object.z);
			});
			map.selector.forEach(function(me){
				console.log("GROUP:", me.data.name);
				
				var o = me.data;
				this._delete(o.id, data);
				folder.contents.push(o);
			}, this);
			
			this.tv.merge(data);
			this.sync();
			this.update();
		},
		
		_syncTm: 0,
		sync: function(silent){
			if(this._syncTm){
				window.clearTimeout(this._syncTm);
				this._syncTm = 0;
			}
			var that = this;
			
			this._syncTm = window.setTimeout(function(){
				var data = that.tv.getData();
				var json = JSON.stringify(data);
				if(this._lastData == json){
					that._syncTm = 0;
					return;
				}

				that._lastData = json;
				if(!silent){
					that.emit(MT.OBJECTS_SYNC, data);
				}
				
				that.send("updateData", data);
				that._syncTm = 0;
				that.updateTree();
			}, 100);
		},
		
		_saveTm: 0,
		saveObject: function(obj){
			
			if(this._saveTm){
				window.clearTimeout(this._saveTm);
				this._saveTm = 0;
			}
			var that = this;
			this._saveTm = window.setTimeout(function(){
				that.send("save", obj);
				that.emit(MT.OBJECTS_SYNC, that.tv.getData());
				that.updateTree();
			}, 1000);
		},
		
		getById: function(id){
			var items = this.tv.items;
			for(var i=0; i<items.length; i++){
				if(items[i].data.id == id){
					return items[i].data;
				}
			}
			
			return null;
		}
	}
);

//MT/plugins/AssetManager.js
MT.namespace('plugins');
"use strict";
/* TODO: split this file in submodules
 * more time spending to scroll than coding
 */
MT.require("ui.TreeView");
MT.require("ui.List");


MT.ASSET_ADDED = "ASSET_ADDED";
MT.ASSET_SELECTED = "ASSET_SELECTED";
MT.ASSET_UNSELECTED = "ASSET_UNSELECTED";
MT.ASSET_UPDATED = "ASSET_UPDATED";
MT.ASSET_DELETED = "ASSET_DELETED";
MT.ASSET_FRAME_CHANGED= "ASSET_FRAME_CHANGED";
MT.ASSETS_RECEIVED = "ASSETS_RECEIVED";
MT.ASSETS_UPDATED = "ASSETS_UPDATED";


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.AssetManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "assets");
		
		this.selector = new MT.core.Selector();
		
		this.project = project;
		
		this.active = null;
		this.knownFrames = {};
		
		this.list = {};
		
		this.__previewCache = {};
		
		this.panels = {};
		
		this.scale = 0;
		
		//hack
		this.pendingFrame = -1;
		
		this.tmpName = "";
	},
	{
		
		get activeFrame(){
			if(!this.active){
				return 0;
			}
			var id = this.active.data.id;
			if(this.knownFrames[id] != void(0)){
				return this.knownFrames[id];
			}
			return 0;
		},
		
		set activeFrame(frame){
			if(!this.active){
				return;
			}
			
			var id = this.active.data.id;
			this.knownFrames[id] = frame;
		},
		
		initUI: function(ui){
			var that = this;
			
			this.ui = ui;
			
			this.panel = ui.createPanel("Assets");
			this.panel.setFree();
			this.panel.content.style.padding = 0;
			
			this.panel.addButtons([
				{
					label: "New Folder",
					className: "new-folder",
					cb: function(){
						that.newFolder();
					}
				},
				{
					label: "Upload File",
					className: "upload-file",
					cb: function(){
						that.upload();
					}
				},
				{
					label: "Upload Folder",
					className: "upload-folder",
					cb: function(){
						that.uploadFolder();
					},
					check: function(){
						if(window.navigator.userAgent.indexOf("WebKit") > -1){
							return true;
						}
					}
				},
				{
					label: "Delete Selected",
					className: "delete-selected",
					cb: function(){
						that.confirmDeleteSelected();
					}
				}
			]);
			
			this.panel.content.el.setAttribute("hint", "Drop assets here to upload");
			
			
			this.tv = new MT.ui.TreeView([], this.project.path);
			
			this.tv.sortable(this.ui.events);
			
			this.tv.tree.show(this.panel.content.el);
			
			
			var select = function(data, element){
				if(that.active == element){
					return;
				}
				
				if(that.active){
					that.active.removeClass("selected");
				}
				
				that.active = element;
				
				// hack - debug this
				if(that.pendingFrame > -1){
					that.activeFrame = that.pendingFrame
					that.pendingFrame = -1;
				}
				
				that.active.addClass("selected");
				//that.emit(MT.ASSET_SELECTED, that.active.data);
				//that.emit(MT.ASSET_FRAME_CHANGED, that.active.data, that.activeFrame);
				
				
				if(data.contents){
					return;
				}
				//that.emit(MT.ASSET_SELECTED, that.active.data, that.activeFrame);
				that.setPreviewAssets(that.active.data);
			};
			
			var update = function(){
				that.updateData();
			};
			
			this.tv.on("click", function(data, element){
				
				var shift = false;
				if(that.ui.events.mouse.lastClick && that.ui.events.mouse.lastClick.shiftKey){
					shift = true;
				}
				
				if(shift){
					if(that.selector.is(element)){
						that.selector.remove(element);
						element.removeClass("selected.active");
					}
					else{
						that.selector.add(element);
						element.addClass("selected");
					}
					//that.emit(MT.ASSET_FRAME_CHANGED, null, null);
					return;
				}
				else{
					
					//if(data.contents){
					//	return;
					//}
					that.selector.forEach(function(el){
						el.removeClass("active.selected");
					});
					that.selector.clear();
				}
				
				if(that.active && !shift){
					that.active.removeClass("active.selected");
					that.selector.remove(element);
				}
				
				that.selector.add(element);
				that.active = element;
				that.active.addClass("active.selected");
				
				//that.emit(MT.ASSET_FRAME_CHANGED, that.active.data, that.activeFrame);
				that.emit(MT.ASSET_SELECTED, that.active.data, that.activeFrame);
				that.setPreviewAssets(data);
			});
			
			this.tv.on("select", select);
			
			
			
			var list = new MT.ui.List([
				{
					label: "Make active",
					cb: function(){
						that.emit(MT.ASSET_FRAME_CHANGED, that.active.data, that.activeFrame);
					}
					
				},
				{
					label: "Download image",
					cb: function(){
						window.open(that.active.img.origSource);
					}
					
				},
				{
					label: "Delete",
					cb: function(){
						that.confirmDeleteAsset(that.active.data.id);
						list.hide();
					}
					
				}
			], this.ui, true);
			list.width = 250;
			
			
			this.tv.on("context", function(e, item){
				select(item.data, item);
				list.x = e.pageX;
				list.y = e.pageY;
				list.show();
			});
			
			
			this.tv.on("change", function(oldItem, newItem){
				if(oldItem && newItem){
					that.moveFile(oldItem, newItem);
				}
			});
			
			this.tv.on("open", update);
			this.tv.on("close", update);
			
			
			
			
			
			this.preview = ui.createPanel("assetPreview");
			this.preview.setFree();
			
			
			this.scale = 1;
			
			//this.preview.addOptions(this.mkScaleOptions());
			var pce = window.pce = this.preview.content;
			
			ui.events.on(ui.events.WHEEL, function(e){
				if(!pce.isParentTo(e.target)){
					return;
				}
				if(!e.shiftKey){
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				
				that.scale += 0.1*(e.wheelDelta/Math.abs(e.wheelDelta));
				if(that.scale > 2){
					that.scale = 0;
				}
				if(that.scale < 0.1){
					that.scale = 0.1;
				}
				that.setPreviewAssets();
			});
			
			this.project.on(MT.DROP, function(e, data){
				if(!MT.core.Helper.isImage(data.path)){
					return;
				}
				
				if(!e){
					that.createImage(data);
					return;
				}
				
				var item = that.tv.getOwnItem(e.target);
				if(item && item.data.contents){
					data.path = item.data.fullPath + data.path;
				}
				
				that.createImage(data);
			});
			
			ui.events.on(ui.events.KEYDOWN, function(e){
				var w = e.which;
				
				if(w == MT.keys.ESC){
					that.unselectAll();
				}
			});
		},
		
		
		mkScaleOptions: function(){
			var ret = [];
			var o;
			for(var i=100; i>0; i-=10){
				o = {
					label: i,
					className: "",
					cb: this._mkZoomCB(i)
				};
				ret.push(o);
			}
			return ret;
		},
		
		_mkZoomCB: function(zoom){
			var that = this;
			return function(){
				that.scale = zoom*0.01;
				that.preview.options.list.hide();
				that.setPreviewAssets();
			};
		},
		
		unselectAll: function(){
			var that = this;
			this.selector.forEach(function(obj){
				obj.removeClass("active.selected");
				that.emit(MT.ASSET_UNSELECTED, obj);
			});
			this.selector.clear();
			this.preview.content.clear();
			
			if(!this.active){
				return;
			}
			
			this.active.removeClass("active.selected");
			that.emit(MT.ASSET_UNSELECTED, this.active);
			this.active = null;
			return;
		},
		
		_previewCache: null,
		setPreviewAssets: function(asset){
			if(asset.contents){
				this.preview.content.clear();
				return;
			}
			
			// tiletool uses his own preview
			var tools = this.project.plugins.tools;
			if( tools && tools.activeTool && tools.activeTool == tools.tools.tiletool){
				tools.tools.tiletool.updatePreview(asset);
				return;
			}
				
			if(asset == void(0)){
				if(this.active){
					asset = this.active.data;
				}
			}
			if(asset == void(0) || asset.contents){
				return;
			}
			//this.preview.content.clear();
			
			var map = this.project.plugins.mapeditor;
			var panels;
			if(this.panels[asset.id] == void(0)){
				panels = [];
			}
			else{
				panels = this.panels[asset.id];
			}
			var found = false;
			var panel;
			var pp;
			
			
			if(asset.atlas){
				var images = map.atlasNames[asset.id];
				
				// called while loading new atlas
				if(!images){
					return;
				}
				
				if(images.all_frames){
					panel = this.createPreviewPanel("all_frames", panels, asset, images, true);
					this.drawAtlasImage(panel);
					
					
					
				}
				
				for(var i in images){
					panel = this.createPreviewPanel(i || "xxx", panels, asset, images, true);
					this.drawAtlasImage(panel);

					
				}
			}
			else{
				if(panels.length > 0){
					this.drawSpritesheet(panels[0]);
					panels.active = panels[0];
					this.preview.content.clear();
				}
				else{
					panel = new MT.ui.Panel(asset.name);
					panels.push(panel);
					panel.fitIn();
					panel.addClass("borderless");
					
					
					var image = this.project.plugins.mapeditor.game.cache.getImage(asset.id+"");
					// called while loading
					if(!image){
						return;
					}
					var canvas = document.createElement("canvas");
					canvas.width = image.width;
					canvas.height = image.height;
				
					var ctx = canvas.getContext("2d");
					
					
					panel.data = {
						asset: asset,
						group: panels,
						canvas: canvas,
						ctx: ctx,
						image: image
					};
					
					panel.content.el.appendChild(panel.data.canvas);
					
					
					this.drawSpritesheet(panel);
					this.addSpriteEvents(panel);
				}
			}
			
			
			if(panels.length == 0){
				return;
			}
			
			if(!panels.active){
				panels.active = panels[0];
			}
			//panels.active.hide();
			panels.active.show(this.preview.content.el);
			
			
			/*if(panels.active.data.scrollLeft){
				panels.active.content.el.scrollLeft = panels.active.data.scrollLeft;
			}
			if(panels.active.data.scrollTop){
				panels.active.content.el.scrollTop = panels.active.data.scrollTop;
			}*/
			
			this.panels[asset.id] = panels;
		},
		
		createPreviewPanel: function(name, panels, asset, images, isAtlas){
			var panel = null;
			
			for(var j=0; j<panels.length; j++){
				if(panels[j].title == name){
					panel = panels[j];
					panel.data.frames = images[name];
					
					return panel;
				}
			}

			panel = new MT.ui.Panel(name);
			
			var pp = panels[panels.length - 1];
			
			
			panels.push(panel);
			panel.fitIn();
			panel.addClass("borderless");
			
			panel.data = {
				frames: images[name],
				asset: asset,
				group: panels,
				canvas: document.createElement("canvas"),
				ctx: null
			};
			panel.data.ctx = panel.data.canvas.getContext("2d");
			if(pp){
				pp.addJoint(panel);
			}
			
			if(isAtlas){
				this.addAtlasEvents(panel);
			}
			else{
				this.addSpriteEvents(panel);
			}
			
			return panel;
		},
		
		
		drawAtlasImage: function(panel){
			var asset = panel.data.asset;
			var isxml = (asset.atlas.split(".").pop().toLowerCase().indexOf("xml") !== -1);
			this.drawAtlasJSONImage(panel);
			
			panel.data.canvas.style.cssText = "width: "+(panel.data.canvas.width*this.scale)+"px";//"transform: scale("+this.scale+","+this.scale+"); transform-origin: 0 0;";
		},
		
		drawAtlasJSONImage: function(panel){
			var map = this.project.plugins.mapeditor;
			var game = map.game;
			var cache = game.cache.getImage(panel.data.asset.id);//game.cache._images[panel.data.asset.id];
			var ctx = null;
			
			ctx = panel.data.ctx;
			
			var frames = game.cache.getFrameData(panel.data.asset.id);//cache.frameData;
			panel.data.frameData = frames;
			
			var src = cache;//.data;
			
			var frame;
			var startX = 0;
			
			var width = 0;
			var height = 0;
			var pixi;
			panel.data.rectangles = [];
			var active = panel.data.group.active;
			
			// old spritesheet
			if(active && !active.data.frames){
				active.unjoin();
				active.remove();
				var index = panel.data.group.indexOf(active);
				panel.data.group.splice(index, 1);
			}
			
			
			if(panel.title == "all_frames"){
				var image = cache;//.data;
				
				panel.data.canvas.width = image.width;
				panel.data.canvas.height = image.height;
				
				ctx.clearRect(0, 0, image.width, image.height);
				
				ctx.drawImage(image, 0, 0);
				
				ctx.strokeStyle = "rgba(0,0,0,0.5);"
				
				
				for(var i=0; i<frames._frames.length; i++){
					
					frame = frames.getFrame(i);
					pixi = frame;//PIXI.TextureCache[frame.uuid];
					
					panel.data.rectangles.push(new Phaser.Rectangle(frame.x, frame.y, pixi.width, pixi.height));
					if(this.activeFrame == i){
						ctx.fillStyle = "rgba(0,0,0,0.5)";
						
						ctx.fillRect(frame.x,  frame.y, pixi.width, pixi.height);
						
						if(!active || !active.data.frames || i < active.data.frames.start ||  i > active.data.frames.end){
							panel.data.group.active = panel;
						}
						
					}
					
					ctx.strokeRect(frame.x+0.5,  frame.y+0.5, pixi.width, pixi.height);
					
				}
				
				panel.content.el.appendChild(panel.data.canvas);
				return;
			}
			
			
			for(var i=panel.data.frames.start; i<panel.data.frames.end; i++){
				frame = frames.getFrame(i);
				pixi = frame;//PIXI.TextureCache[frame.uuid];
				
				width += pixi.width;
				if(height < pixi.height){
					height = pixi.height;
				}
			}
			
			if(panel.data.canvas.width != width){
				panel.data.canvas.width = width;
				panel.data.canvas.height = height;
			}
			
			
			
			ctx.clearRect(0, 0, width, height);
			
			for(var i=panel.data.frames.start; i<panel.data.frames.end; i++){
				frame = frames.getFrame(i);
				var r = frame.getRect();
				pixi = frame;//PIXI.TextureCache[frame.uuid];
				
				//src = frame;//pixi.baseTexture.source;
				var x = 0;
				var y = 0;
				if(pixi.trim){
					x = pixi.trim.x;
					y = pixi.trim.y;
				}
				
				
				ctx.drawImage(src, frame.x , frame.y, pixi.width, pixi.height, startX, 0, pixi.width, pixi.height);
				
				panel.data.rectangles.push(new Phaser.Rectangle(startX, 0, pixi.width, pixi.height));
				
				
				if(this.activeFrame == i){
					ctx.fillStyle = "rgba(0,0,0,0.5)";
					ctx.fillRect(startX, 0, pixi.width, height);
					if(!active || i < active.data.frames.start ||  i > active.data.frames.end){
						panel.data.group.active = panel;
					}
				}
				
				startX += pixi.width;
				ctx.beginPath();
				ctx.moveTo(startX+0.5, 0);
				ctx.lineTo(startX+0.5, height);
				ctx.stroke();
			}
			
			panel.content.el.appendChild(panel.data.canvas);
		},
		
		drawSpritesheet: function(panel){
			var image = this.project.plugins.mapeditor.game.cache.getImage(panel.data.asset.id+"");
			var ctx = panel.data.ctx;
			if(!image){
				var that = this;
				window.setTimeout(function(){
					that.drawSpritesheet(panel);
				}, 100);
				return;
			}
			
			var imgData = panel.data.asset;
			ctx.canvas.width = image.width;
			ctx.canvas.height = image.height;
			
			ctx.clearRect(0, 0, image.width, image.height);
			
			
			ctx.drawImage(image, 0, 0, image.width, image.height);
			ctx.beginPath();
			
			// vertical lines
			for(var i = imgData.frameWidth + imgData.margin; i<image.width; i += imgData.frameWidth + imgData.spacing){
				ctx.moveTo(i+0.5, imgData.margin);
				ctx.lineTo(i+0.5, image.height);
			}
			
			// horizontal lines
			for(var i = imgData.frameHeight + imgData.margin; i<image.height; i += imgData.frameHeight + imgData.spacing){
				ctx.moveTo(imgData.margin, i+0.5);
				ctx.lineTo(image.width, i+0.5);
			}
			ctx.stroke();
			
			
			var off = imgData.margin + imgData.spacing * Math.floor( image.width / imgData.frameWidth - imgData.spacing );
			
			var widthInFrames = (image.width - off) / (imgData.frameWidth );
			var dx = this.getTileX(this.activeFrame, widthInFrames);
			var dy = this.getTileY(this.activeFrame, widthInFrames);
			
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.fillRect(
					imgData.margin + imgData.frameWidth  * dx + dx * imgData.spacing + 0.5,
					imgData.margin + imgData.frameHeight * dy + dy * imgData.spacing + 0.5,
				
				
							imgData.frameWidth+0.5, imgData.frameHeight+0.5
				);
			
			
		},
		
		getTileX: function(tile, widthInFrames){
			
			return tile % widthInFrames;
		},
		
		getTileY: function(tile, widthInFrames){
			return tile / widthInFrames | 0;
		},
		
		addSpriteEvents: function(panel){
			var that = this;
			var canvas = panel.data.canvas;
			var mdown = false;
			
			var lastAsset = null;
			
			var select = function(e){
				
				if(e.offsetX == void(0)){
					e.offsetX = e.layerX;
					e.offsetY = e.layerY;
				}
				
				var frame = that.getFrame(panel.data.asset, e.offsetX, e.offsetY);
				if(frame == that.activeFrame && that.active == panel.data.asset){
					return;
				}
				
				// released mouse outside canvas?
				var asset = panel.data.asset;
				var maxframe = Math.floor(  (asset.width / asset.frameWidth) * (asset.height /asset.frameHeight) - 1) ;
				if(maxframe < frame){
					return;
				}
				/*
				panel.data.scrollTop = panel.content.el.scrollTop;
				panel.data.scrollLeft = panel.content.el.scrollLeft;
				*/
				that.activeFrame = frame;
				that.emit(MT.ASSET_FRAME_CHANGED, that.active.data, that.activeFrame);
			};
			
			canvas.onmousedown = function(e){
				mdown = true;
				select(e);
			};
			
			canvas.onmousemove = function(e){
				if(!mdown){
					return;
				}
				
				select(e);
			};
			
			this.ui.events.on(this.ui.events.MOUSEUP, function(e){
				if(!mdown){
					return;
				}
				mdown = false;
				select(e);
			});
		},
		
		addAtlasEvents: function(panel){
			var that = this;
			var mdown = false;
			
			var select = function(e){
				var total = panel.data.frames.end - panel.data.frames.start  - 1;
				var width = panel.data.canvas.width;
				if(e.offsetX == void(0)){
					e.offsetX = e.layerX;
					e.offsetY = e.layerY;
				}
				var x = e.offsetX / that.scale;
				var y = e.offsetY / that.scale;
				var frame = panel.data.frames.start;
				var found = false;
				
				for(var i=0; i<panel.data.rectangles.length; i++){
					if(panel.data.rectangles[i].contains(x, y)){
						frame += i;
						found = true;
						break;
					}
				}
				if(!found){
					return;
				}
				
				if(frame == that.activeFrame && that.active == panel.data.asset){
					return;
				}
				/*
				panel.data.scrollTop = panel.content.el.scrollTop;
				panel.data.scrollLeft = panel.content.el.scrollLeft;
				*/
				panel.data.group.active = panel;
				
				
				if(panel.title == "all_frames"){
					var g = panel.data.group, p;
					for(var i=1; i<g.length; i++){
						p = g[i];
						if(p.data.frames.start <= frame && p.data.frames.end > frame){
							that.tmpName = p.title;
							break;
						}
					}
					
				}
				else{
					that.tmpName = panel.title;
				}
				
				/*var frameInfo = panel.data.frameData.getFrame(frame);

				if(frameInfo.name){
					frame = frameInfo.name;
				}*/
				
				that.activeFrame = frame;
				that.emit(MT.ASSET_FRAME_CHANGED, panel.data.asset, frame);
			};
			panel.data.canvas.oncontextmenu = function(e){
				return false;
			};
			
			panel.data.canvas.onmousedown = function(e){
				e.preventDefault();
				if(e.button != 0){
					return;
				}
				mdown = true;
				select(e);
			};
			
			panel.data.canvas.onmousemove = function(e){
				if(e.button == 2){
					this.parentNode.scrollTop -= that.ui.events.mouse.my;
					this.parentNode.scrollLeft -= that.ui.events.mouse.mx;
					return;
				}
				if(!mdown){
					return;
				}
				
				select(e);
			};
			
			this.ui.events.on(this.ui.events.MOUSEUP, function(e){
				if(!mdown || e.button != 0){
					return;
				}
				mdown = false;
				select(e);
			});
			
		},
		
		installUI: function(ui){
			
			var that = this;
			var tools = this.project.plugins.tools;
			
			var click = function(data, element){
				
				var shift = false;
				if(that.ui.events.mouse.lastClick && that.ui.events.mouse.lastClick.shiftKey){
					shift = true;
				}
				
				if(shift){
					that.selector.add(element);
					element.addClass("selected");
				}
				else{
					
					if(data.contents){
						return;
					}
					that.selector.forEach(function(el){
						el.removeClass("active.selected");
						that.emit(MT.ASSET_UNSELECTED, data);
					});
					that.selector.clear();
				}
				
				
				if(that.active && !shift){
					that.active.removeClass("active.selected");
					that.selector.remove(element);
					that.emit(MT.ASSET_UNSELECTED, data);
				}
				
				that.selector.add(element);
				
				that.active = element;
				that.active.addClass("active.selected");
				
				that.project.map.selector.forEach(function(o){
					o.data.assetId = data.id;
					o.data.__image = data.__image;
				});
				that.project.plugins.objectmanager.update();
				that.project.plugins.objectmanager.sync();
				
				
				//that.setPreviewAssets(data);
			};
			
			
			tools.on(MT.OBJECT_SELECTED, function(obj){
				if(obj){
					that.pendingFrame = obj.frame;
					var asset = that.selectAssetById(obj.data.assetId);
					
					var p = that.panels[obj.data.assetId]
					
					
					//that.setPreviewAssets(asset);
				}
			});
			
			tools.on(MT.OBJECT_UNSELECTED, function(obj){
				
				if(!obj){
					that.unselectAll();
					return;
				}
				
				var asset = that.tv.getById(obj.assetId);
				that.emit(MT.ASSET_UNSELECTED, asset);
				
				if(that.active){
					that.active.removeClass("selected.active");
					that.active = null;
					that.unselectAll();
				}
				
				if(that.selector.is(asset)){
					asset.removeClass("selected.active");
					that.selector.remove(asset);
					
				}
			});
			
			this.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				that.setPreviewAssets(asset);
				if(tools.activeTool != tools.tools.select){
					return;
				}
				
				that.project.map.selector.forEach(function(o){
					if(asset){
						o.data.assetId = asset.id;
						o.data.__image = asset.__image;
					}
					else{
						delete o.data.assetId;
						delete o.data.__image;
						
						if(frame != void(0)){
							o.frame = 0;
						}
						that.activeFrame = 0;
					}
					that.project.plugins.objectmanager.update();
					that.project.plugins.objectmanager.sync();
				});
				
				
			});
			
			
			var map = this.project.plugins.mapeditor;
			
			var shouldEnd = false;
			
			this.tv.on("dragmove", function(e, item){
				if(e.target !== map.game.canvas){
					tools.removeTmpObject();
					return;
				}
				
				shouldEnd = true;
				tools.tools.stamp.init(item.data);
			});
			
			this.tv.on("dragend", function(e, item){
				if(shouldEnd == false){
					return;
				}
				
				shouldEnd = false;
				if(e.target !== map.game.canvas){
					tools.removeTmpObject();
					return;
				}
				tools.tools.stamp.mouseDown(e);
				tools.removeTmpObject();
			});
			
			
		},
		
		selectAssetById: function(id, redraw){
			var asset = this.tv.getById(id);
			this.tv.select(id);
			this.selector.add(asset);
			if(redraw){
				this.setPreviewAssets(asset);
			}
			return asset;
		},
		
		selectActiveAsset: function(active){
			if(active == void(0) && !this.active){
				return;
			}
			//this.emit(MT.ASSET_SELECTED, this.active.data);
			this.emit(MT.ASSET_FRAME_CHANGED, this.active.data, this.activeFrame);
			this.setPreviewAssets(this.active.data);
		},
		
		updateImage: function(asset, e){
			
			var notify = this.project.plugins.notification.show("Updating image", asset.name);
			
			var that = this;
			this.project.plugins.mapeditor.cleanImage(asset.id);
			
			var img = new Image();
			
			
			this.readFile(e.target.files[0], function(fr){
				var data = Array.prototype.slice.call(new Uint8Array(fr.result));
				img.onload = function(){
					//asset.frameWidth = img.width;
					//asset.frameHeight= img.height;
					asset.width = img.width;
					asset.height = img.height;
					asset.updated = Date.now();
					
					that.guessFrameWidth(asset);
					that.emit(MT.ASSET_FRAME_CHANGED, asset, that.activeFrame);
					that.active.data = asset;
					that.send("updateImage", {asset: asset, data: data});
					if(asset.atlas){
						that.project.plugins.mapeditor.addAtlas(asset, null, null, function(){
							notify.hide();
						});
					}
					else{
						notify.hide();
					}
				};
				img.src = that.toPng(fr.result);
			});
		},
		
		addAtlas: function(asset, e){
			var that = this;
			
			var file = e.target.files[0];
			var ext = file.name.split(".").pop();
			
			if(MT.const.DATA.indexOf(ext) === -1){
				var popup = new MT.ui.Popup("Incorrect format","Atlas loading canceled"+"<br /><br />");
				popup.showClose();
				popup.addButton("OK", function(){
					popup.hide();
				});
				return;
			}
			
			var notify = this.project.plugins.notification.show("Updating atlas", file.name);
			this.readFile(file, function(fr){
				asset.updated = Date.now();
				that.send("addAtlas", {id: asset.id, ext: ext, data: Array.prototype.slice.call(new Uint8Array(fr.result)) }, function(){
					notify.hide();
				});
			});
			
		},
		
		getFrame: function(o, x, y){
			var dx = (x - o.margin);
			var dy = (y - o.margin);
			
			if(dx < 0){
				dx = 0;
			}
			if(dy < 0){
				dy = 0;
			}
			var gx = Math.floor( dx /(o.frameWidth + o.spacing));
			var gy = Math.floor( dy /(o.frameHeight + o.spacing));
			
			var maxX = Math.floor( o.width / o.frameWidth);
			
			var frame = gx + maxX * gy;
			return frame;
		},
		
		update: function(){
			var data = this.tv.getData();
			if(this.active){
				this.setPreviewAssets(this.active.data);
			}
			this.emit(MT.ASSETS_UPDATED, data);
		},
		
		a_receiveFileList: function(list){
			
			//this._syncData(list);
			
			this.buildAssetsTree(list);
			this.buildList(list);
			this.update();
			this.updateNotifications(list);
		},
		
		buildList: function(list){
			for(var i=0; i<list.length; i++){
				if(list[i].contents){
					this.buildList(list[i].contents);
					continue;
				}
				this.list[list[i].id] = list[i];
			}
		},
		
		handleDrop: function(e){
			var that = this;
			var files = e.dataTransfer.files;
			this.handleFiles(files, e.dataTransfer);
		},
		
		handleFiles: function(files, dataTransfer){
			var entry = null;
			for(var i=0; i<files.length; i++){
				//chrome
				if(dataTransfer){
					entry = (dataTransfer.items[i].getAsEntry ? dataTransfer.items[i].getAsEntry() : dataTransfer.items[i].webkitGetAsEntry());
					this.handleEntry(entry);
				}
				//ff
				else{
					this.handleFile(files.item(i));
				}
			}
		},
		
		handleFile: function(file){
			var path = file.webkitRelativePath || file.path || file.name;
			//folder
			if(file.size == 0){
				this.send("newFolder", path);
			}
			//file
			else{
				this.uploadImage(file, path);
			}
		},
		
		upload: function(){
			
			var that = this;
			var input = document.createElement("input");
			input.setAttribute("type", "file");
			input.onchange = function(e){
				that.handleFiles(this.files);
			};
			input.onclick = function(){
				console.log("Clicked!;");
			};
			input.click();
		},
		
		uploadFolder: function(){
			var that = this;
			
			var input = document.createElement("input");
			input.type = "file";
			input.setAttribute("webkitdirectory","");
			input.setAttribute("directory","");
			input.value = "";
			
			input.onchange = function(e){
				that.handleFiles(this.files);
			};
			input.click();
		},
		
		handleEntry: function(entry){
			var that = this;
			
			if (entry.isFile) {
				entry.file(function(file){
					that.uploadImage(file, entry.fullPath);
					
				});
			} else if (entry.isDirectory) {
				this.send("newFolder", entry.fullPath);
				
				var reader = entry.createReader();
				reader.readEntries(function(ev){
					for(var i=0; i<ev.length; i++){
						that.handleEntry(ev[i]);
					}
				});
			}
		},
		
		updateData: function(){
			this.send("updateData", this.tv.getData());
		},
   
		buildAssetsTree: function(list){
			var that = this;
			list.sort(function(a,b){
				var inca = ( a.contents ? 1000 : 0);
				var incb = ( b.contents ? 1000 : 0);
				var res = (a.name > b.name ? 1 : -1);
				return res + incb-inca;
			});
			

			this.tv.rootPath = this.project.path;
			this.tv.merge(list);
		},
		
		moveFile: function(a, b){
			this.send("moveFile", {
				a: a,
				b: b
			});
			this.updateData();
		},
		
		newFolder: function(){
			var data = this.tv.getData();
			
			var tmpName= "new folder";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			data.unshift({
				name: name,
				contents: []
			});
			
			this.send("newFolder", name);
			
			this.tv.merge(data);
		},
		
		deleteSelected: function(){
			this.selector.forEach(function(obj, last){
				this.deleteAsset(obj.data.id, !last);
			}, this);
		},
		
		deleteAsset: function(id, silent){
			this.project.plugins.mapeditor.cleanImage(id);
			
			this.send("delete", id);
			this.emit(MT.ASSET_DELETED, id);
			
			//if using silent.. you should call manually sync
			if(!silent){
				this.ui.events.simulateKey(MT.keys.ESC);
			}
		},
		
		confirmDeleteAsset: function(id){
			var that = this;
			
			var pop = new MT.ui.Popup("Delete Asset?", "Do you really want to delete asset?");
			pop.addButton("no", function(){
				pop.hide();
			});
			pop.addButton("yes", function(){
				that.deleteAsset(id);
				pop.hide();
			});
			pop.showClose();
		},
		confirmDeleteSelected: function(){
			if(!this.selector.count){
				return;
			}
			var that = this;
			
			var pop = new MT.ui.Popup("Delete selected assets?", "Do you really want to delete selected assets?");
			pop.addButton("no", function(){
				pop.hide();
			});
			pop.addButton("yes", function(){
				that.deleteSelected();
				pop.hide();
			});
			pop.showClose();
		},
		getById: function(id){
			var items = this.tv.items;
			for(var i=0; i<items.length; i++){
				if(items[i].data.id == id){
					return items[i].data;
				}
			}
			
			return null;
		},
		
		
		readFile: function(file, cb){
			var fr  = new FileReader();
			fr.onload = function(){
				cb(fr);
			};
			fr.readAsArrayBuffer(file);
		},
		
		
		uploadImage: function(file, path){
			if(path.substring(0, 1) != "/"){
				path = "/" + path;
			}
			var that = this;
			this.project.readFile(file, path);
			return;
			this.readFile(file, function(fr){
				that.createImage({
					src: fr.result,
					path: path
				});
			});
		},
		
		notifications: [],
		
		createImage: function(fileObj){
			var path = fileObj.path;
			var src = fileObj.src;
			var name = path.split("/").pop();
			var img = new Image();
			var that = this;
			var imgData = Array.prototype.slice.call(new Uint8Array(src));
			
			img.onload = function(){
				var data = {
					data: imgData,
					id: MT.core.Helper.uuid(),
					name: name,
					path: path,
					fullPath: path,
					key: path,
					width: img.width,
					height: img.height,
					frameWidth: img.width,
					frameHeight: img.height,
					frameMax: -1,
					margin: 0,
					spacing: 0,
					anchorX: 0,
					anchorY: 0,
					fps: 10,
					updated: Date.now(),
					atlas: ""
				};
				
				that.guessFrameWidth(data);
				
				that.send("newImage", data);
				that.emit(MT.ASSET_ADDED, path);
				
				var nota = that.project.plugins.notification.show(path, "Upload in progress...", 999999);
				that.notifications[path] = nota;
			};
			img.src = that.toPng(src);
		},
		
		updateNotifications: function(list){
			for(var i =0; i<list.length; i++){
				if(this.notifications[list[i].key]){
					this.notifications[list[i].key].hide();
					return;
				}
				if(list[i].contents){
					this.updateNotifications(list[i].contents);
				}
			}
			
		},
		
		toPng: function(src){
			var str = "";// = String.fromCharCode.apply(null, src);
			
			var buff = new Uint8Array(src);
			for(var i=0; i<buff.length; i++){
				str += String.fromCharCode(buff[i]);
			}
			
			
			return "data:image/png;base64,"+btoa(str);
		},
		
		guessFrameWidth: function(data){
			var basename = data.name.split(".");
			//throw away extension
			basename.pop();
			
			var tmp = basename.join(".").split("_").pop();
			var dimensions = null;
			if(tmp){
				dimensions = tmp.split("x");
				var w = parseInt(dimensions[0], 10);
				var h = parseInt(dimensions[1], 10);
				if(w && !isNaN(w) && h && !isNaN(h)){
					data.frameWidth = w;
					data.frameHeight = h;
				}
			}
			
			
		}
		
	}
);

//MT/ui/Panel.js
MT.namespace('ui');
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

//MT/ui/Events.js
MT.namespace('ui');
"use strict";
(function(){
	if(typeof Event === "undefined"){
		return;
	}
	var overriddenStop =  Event.prototype.stopPropagation;
	Event.prototype.stopPropagation = function(){
		this.isPropagationStopped = true;
		overriddenStop.call(this);
	};
})();

MT(
	MT.ui.Events = function(){
		if(window.MT.events){
			console.warn("events already initialized");
			return window.MT.events;
		}
		window.MT.events = this;
		
		this.events = {
			mousemove: [],
			mouseup: [],
			mousedown: [],
			drop: [],
			dragend: [],
			drag: [],
			dragover:[],
			click: [],
			resize: [],
			wheel: []
		};
		
		this._cbs = [];
		
		this.enable();
		
		this.mouse = {
			x: 0,
			y: 0,
			mx: 0,
			my: 0,
			down: false,
			lastEvent: {x:0, y:0},
			lastClick: {x:0, y:0}
		};
	},
	{
		MOUSEMOVE: "mousemove",
		MOUSEUP: "mouseup",
		MOUSEDOWN: "mousedown",
		RESIZE: "resize",
		KEYDOWN: "keydown",
		KEYUP: "keyup",
		DROP: "drop",
		WHEEL: "wheel",
		DBLCLICK: "dblclick",
		
		enable: function(){
			for(var i in this.events){
				this.addEvent(i);
			}
		},
		
		disable: function(){
			for(var i in this.events){
				document.body.removeEventListener(this._cbs[i].type, this._cbs[i]);
			}
		},
		on: function(type, cb, shift){
			if(!this.events[type]){
				console.warn("new Event:", type);
				this.events[type] = [];
				this.addEvent(type);
			}
			var that = this;
			window.setTimeout(function(){
				if(shift){
					that.events[type].unshift(cb);
				}
				else{
					that.events[type].push(cb);
				}
			}, 0);
			return cb;
		},
		once: function(type, cb, shift){
			var that = this;
			var fn;
			fn =  function(e){cb(e);that.off(type, fn);};
			this.on(type, fn, shift);
		},
   
		addEvent: function(i){
			var cb = this._mk_cb(i);
			this._cbs.push(cb);
			window.addEventListener(i, cb, false);
		},
		
		off: function(type, cb){
			var ev = null, j=0;
			
			if(cb !== void(0)){
				ev = this.events[type];
				for(j=0; j<ev.length; j++){
					if(ev[j] == cb){
						ev[j] = ev[ev.length-1];
						ev.length = ev.length-1;
					}
				}
				return;
			}
			
			for(var i in this.events){
				ev = this.events[i];
				for(j=0; j<ev.length; j++){
					if(ev[j] == cb){
						ev[j] = ev[ev.length-1];
						ev.length = ev.length-1;
					}
				}
			}
		},
   
		simulateKey: function(which){
			this.emit(this.KEYDOWN,{
				which: which,
				target: document.body
			});
			
		},
		
		emit: function(type, data){
			if(!this.events[type]){
				console.warn("unknown event", type);
			}
			var ev = this.events[type];
			for(var i=0; i<ev.length; i++){
				if(data instanceof Event){
					if(data.isPropagationStopped){
						break;
					}
				}
				ev[i](data);
			}
		},
   
		
		_mk_mousemove: function(){
			
			var that = this;
			var cb = function(e){
				if(e.x == void(0)){
					Object.defineProperties(e, {
						x: {
							get: function(){
								return e.pageX;
							}
						},
						y: {
							get: function(){
								return e.pageY;
							}
						}
					});
					//e.x = e.pageX;
					//e.y = e.pageY;
				}
				if(e.offsetX === void(0)){
					Object.defineProperties(e, {
						offsetX: {
							get: function(){
								return e.layerX;
							}
						},
						layerY: {
							get: function(){
								return e.layerY;
							}
						}
					});
					//e.offsetX = e.layerX;
					//e.offsetY = e.layerY;
				}
				
				that.mouse.mx = e.pageX - that.mouse.x;
				that.mouse.my = e.pageY - that.mouse.y;
				
				if(that.mouse.mx == 0 && that.mouse.my == 0){
					return;
				}
				
				that.mouse.x = e.pageX;
				that.mouse.y = e.pageY;
				
				that.mouse.lastEvent = e;
				
				that.emit(that.MOUSEMOVE, e);
			};
			cb.type = that.MOUSEMOVE;
			return cb;
			
		},
		_mk_mousedown: function(){
			
			var that = this;
			var cb = function(e){
				if(e.x == void(0)){
					Object.defineProperties(e, {
						x: {
							get: function(){
								return e.pageX;
							}
						},
						y: {
							get: function(){
								return e.pageY;
							}
						}
					});
				}
				that.mouse.down = true;
				that.mouse.lastClick = e;
				
				that.emit(that.MOUSEDOWN, e);
			};
			cb.type = that.MOUSEDOWN;
			return cb;
		},
   
		_mk_mouseup: function(){
			var that = this;
			var cb = function(e){
				if(e.x == void(0)){
					Object.defineProperties(e, {
						x: {
							get: function(){
								return e.pageX;
							}
						},
						y: {
							get: function(){
								return e.pageY;
							}
						}
					});
				}
				that.mouse.down = false;
				that.mouse.lastClick = e;
				
				that.emit(that.MOUSEUP, e);
			};
			cb.type = that.MOUSEUP;
			return cb;
		},
   
		_mk_cb: function(type){
			if(type == this.MOUSEMOVE){
				return this._mk_mousemove();
			}
			
			if(type == this.MOUSEUP){
				return this._mk_mouseup();
			}
			
			if(type == this.MOUSEDOWN){
				return this._mk_mousedown();
			}
			
			var that = this;
			var cb = function(e){
				e = e || event;
				if(e.ctrlKey){
					Object.defineProperties(e, {
						metaKey: {
							get: function(){
								return this.metaKey;
							}
						}
					});
				}
				
				if(type.indexOf("drop") > -1 || type.indexOf("drag") > -1 ){
					e.preventDefault();
				}
				if(e.ctrlKey && e.altKey){
					console.log(e, type);
				}
				that.emit(type, e);
			};
			cb.type = type;
			return cb;
		},
		
		_mk_drop: function(e){
			e.preventDefault();
		}
		
	}
);

//MT/plugins/Auth.js
MT.namespace('plugins');
"use strict";
MT.requireFile("MT/misc/validation.js");
MT.require("ui.InputCollection");
MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.Auth = function(project){
		MT.core.BasicPlugin.call(this, "Auth");
		this.project = project;
		this.sessionCookie = "MightyEditor";
		this.currency = "$";
	},
	{
		_isLogged: false,
		set isLogged(val){
			this._isLogged = val;
		},
		
		get isLogged(){
			return this._isLogged;
		},
		
		initSocket: function(socket, cb){
			if(this.socket){
				return;
			}
			MT.core.BasicPlugin.initSocket.call(this, socket);
			this.onstart = cb;
			this.checkSession();
		},
		
		signOut: function(){
			MT.core.Helper.setCookie(this.sessionCookie, "");
			this.send("logout");
			window.location = window.location.toString().split("#")[0];
		},
		
		// server requests login to open a project
		a_login: function(cmd){
			this.showLogin(true);
			var that = this;
			this.onlogin = function(){
				that.execCmd(cmd);
			}
		},
		execCmd: function(cmd){
			this.hideLoading();
			this.hideLogin();
			
			if(typeof cmd == "function"){
				cmd();
				return;
			}
			
			if(this[cmd.domain]){
				this[cmd.domain][cmd.action].apply(this[cmd.domain], cmd.arguments);
			}
		},
		a_permissionChanged: function(){
			console.log("project permissions has changed");
		},
		standAlone: false,
		showLogin: function(standAlone){
			if(standAlone){
				this.standAlone = true;
				document.body.appendChild(this.loginContainer);
				MT.ui.addClass(this.loginContainer, "standAlone");
				MT.ui.addClass(document.body, "login");
				
				this.showLogo();
				return;
			}
			else{
				this.hideLogo();
				MT.ui.removeClass(this.loginContainer, "standAlone");
				MT.ui.removeClass(document.body, "login");
			}
			
			if(this.loginContainer.parentNode == document.body){
				document.body.removeChild(this.loginContainer);
				if(this.mainButton){
					this.mainButton.removeClass("active");
				}
				MT.core.Helper.clearSelection();
				return;
			}
			document.body.appendChild(this.loginContainer);
			
			var that = this;
			
			this.ui.events.once("click", function(){
				that.hideLogin();
			});
			
			this.mainButton.addClass("active");
			return;
		},
		hideLogin: function(){
			if(this.loginContainer.parentNode){
				this.loginContainer.parentNode.removeChild(this.loginContainer);
				if(this.mainbutton){
					this.mainButton.removeClass("active");
				}
				MT.core.Helper.clearSelection();
			}
		},
		
		showLogo: function(){
			this.hideLogo();
			this.loginContainer.firstChild.insertBefore(this.logo, this.loginContainer.firstChild.firstChild);
		},
		hideLogo: function(){
			if(this.logo.parentNode){
				this.logo.parentNode.removeChild(this.logo);
			}
		},
		showProperties: function(){
			if(!this.propContainer){
				this.buildPropContainer();
			}
			
			if(this.propContainer.parentNode == document.body){
				document.body.removeChild(this.propContainer);
				this.mainButton.removeClass("active");
				MT.core.Helper.clearSelection();
				return;
			}
			
			var that = this;
			this.mainButton.addClass("active");
			var up = this.mouseUp = function(e){
				if(e && MT.ui.hasParent(e.target, that.propContainer)){
					return;
				}
				if(that.propContainer.parentNode){
					that.propContainer.parentNode.removeChild(that.propContainer);
					that.mainButton.removeClass("active");
					MT.core.Helper.clearSelection();
					that.emit("hideProperties", that.propPanels.projects);
				}
				that.ui.events.off("mouseup", up);
				
			};
			this.ui.events.on("mouseup", up);
			
			document.body.appendChild(this.propContainer);
			if(this.logoutButton.el.parentNode){
				this.logoutButton.el.parentNode.removeChild(this.logoutButton.el);
			}
			this.propContainer.appendChild(this.logoutButton.el);
			
			this.emit("showProperties", this.propPanels.projects);
			
			this.propPanels.projects.hide();
			
		},
		initUI: function(ui){
			this.ui = ui;
			var that = this;
			var title = "My Mighty";
			if(!this.isLogged){
				title = "Sign In";
			}
			
			this.mainButton = this.project.panel.addButton(title, "ui-login", function(e){
				if(!that.isLogged){
					that.showLogin();
				}
				else{
					that.showProperties();
				}
			});
		},
		
		buildPropContainer: function(){
			var that = this;
			this.propContainer = document.createElement("div");
			this.propContainer.panel = this.panel;
			this.propContainer.onclick = function(e){
				e.stopPropagation();
			};
			
			this.propContainer.className = "ui-mysettings";
			// create panels
			
			this.propPanels = {};
			
			this.propPanels.share = this.ui.createPanel("Share Project");
			this.propPanels.share.hide();
			this.propPanels.share.fitIn();
			
			this.buildShareOptions(this.propPanels.share.content.el);
			
			this.propPanels.projects = this.buildMyProjects();
			this.propPanels.projects.fitIn();
			
			this.propPanels.share.addJoint(this.propPanels.projects);
			this.propPanels.share.show(this.propContainer);
		},
		
		_myProjectsPanel: null,
		buildMyProjects: function(){
			if(this._myProjectsPanel){
				return this._myProjectsPanel;
			}
			var p = this.ui.createPanel("My Projects");
			
			
			var list = this.project.makeProjectList(this.projects, function(id, cb){
				that.deleteProject(id, cb);
			});
			p.content.el.appendChild(list);
			
			return p;
		},
		
		buildShareOptions: function(el){
			var that = this;
			this.send("getShareOptions", null, function(options){
				if(options == void(0)){
					that.buildCopyToAccessPermissions(el);
					return;
				}
				
				that.userId = options.userId;
				if(!options){
					console.log("cannot get options", options);
					return;
				}
				
				if(options.action == "goPro"){
					that.buildGoPro(el);
					return;
				}
				
				if(options.action == "pending"){
					that.buildPending(el);
					return;
				}
				
				that.shareOptions = options;
				that.buildShareEmailOptions(el, that.shareOptions.emails);
				that.buildAllowCopy(el);
				that.buildProjectLink(el);
			});
		},
		
		
		buildProjectLink: function(el){
			var f = document.createElement("fieldset");
			
			var leg = document.createElement("legend");
			leg.innerHTML = "Share by link";
			f.appendChild(leg);
			
			var link = document.createElement("span");
			link.appendChild(document.createTextNode(window.location));
			link.className = "selectable";
			
			link.onclick = function(e){
				MT.core.Helper.select(link);
				e.stopPropagation();
			};
			var help = document.createElement("div");
			help.className = "help-text";
			help.appendChild(document.createTextNode("This option grants access to the project for everyone with the link"));
			f.appendChild(help);
			
			var checkbox = document.createElement("input");
			checkbox.setAttribute("type", "checkbox");
			checkbox.className = "project-link";
			f.appendChild(checkbox);
			
			if(this.shareOptions.shareWithLink){
				checkbox.setAttribute("checked","checked");
				f.appendChild(link);
			}
			var that = this;
			checkbox.onchange = function(){
				if(this.checked){
					f.appendChild(link);
					MT.core.Helper.select(link);
				}
				else if(link.parentNode){
					f.removeChild(link);
				}
				that.shareOptions.shareWithLink = this.checked ? 1 : 0;
				that.saveProjectShareOptions();
			};
			
			el.appendChild(f);
		},
		
		buildAllowCopy: function(el){
			var f = document.createElement("fieldset");
			
			var leg = document.createElement("legend");
			leg.innerHTML = "Allow copy";
			f.appendChild(leg);
			
			var link = document.createElement("span");
			link.appendChild(document.createTextNode(window.location.toString()+"-copy"));
			
			link.className = "selectable";
			
			link.onclick = function(e){
				MT.core.Helper.select(link);
				e.stopPropagation();
			};
			
			var help = document.createElement("div");
			help.className = "help-text";
			help.appendChild(document.createTextNode("This option allows to make a copy of your project without affecting your project. e.g. if you are creating tutorial"));
			f.appendChild(help);
			
			var checkbox = document.createElement("input");
			checkbox.setAttribute("type", "checkbox");
			
			checkbox.className = "project-link";
			f.appendChild(checkbox);
			
			if(this.shareOptions.allowCopy){
				checkbox.setAttribute("checked","checked");
				f.appendChild(link);
			}
			var that = this;
			checkbox.onchange = function(){
				if(this.checked){
					f.appendChild(link);
					MT.core.Helper.select(link);
				}
				else if(link.parentNode){
					f.removeChild(link);
				}
				
				that.shareOptions.allowCopy = this.checked ? 1 : 0;
				that.saveProjectShareOptions();
			};
			
			el.appendChild(f);
		},
		
		buildShareEmailOptions: function(el, emails){
			
			var f = document.createElement("fieldset");
			f.onclick = function(e){
				e.preventDefault();
				e.stopPropagation();
				input.focus();
			};
			var leg = document.createElement("legend");
			leg.innerHTML = "Share by email";
			f.appendChild(leg);
			
			var help = document.createElement("div");
			help.className = "help-text";
			help.appendChild(document.createTextNode("Enter list of email addresses - to allow access to your project"));
			f.appendChild(help);
			
			var list = document.createElement("span");
			this.buildEmailList(list, emails);
			f.appendChild(list);
			
			var input = document.createElement("input");
			input.className = "share-email-input";
			input.onmousedown = function(e){
				e.stopPropagation();
			};
			var that = this;
			input.onkeydown = function(e){
				if(e.which == MT.keys.ENTER || e.which == MT.keys.TAB){
					if(!input.value){
						return;
					}
					that.addEmail(list, input.value);
					input.value = "";
					e.preventDefault();
				}
				else if(e.which == MT.keys.ESC){
					input.value = "";
				}
			};
			f.appendChild(input);
			
			/*
			var button = new MT.ui.Button("Invite", "small", null, function(){
				console.log("send Invitation");
			});
			f.appendChild(button.el);
			*/
			el.appendChild(f);
		},
		addEmail: function(list, email){
			if(this.shareOptions.emails.indexOf(email) > -1){
				return;
			}
			
			list.appendChild(this.buildEmail(email));
			this.shareOptions.emails.push(email);
			this.saveProjectShareOptions();
		},
		removeEmail: function(el, email){
			if(el.parentNode){
				el.parentNode.removeChild(el);
			}
			var index = this.shareOptions.emails.indexOf(email);
			this.shareOptions.emails.splice(index, 1);
			this.saveProjectShareOptions();
		},
		saveProjectShareOptions: function(){
			this.send("saveProjectShareOptions", this.shareOptions);
		},
		
		buildEmailList: function(list, emails){
			while(list.firstChild){
				list.removeChild(list.firstChild);
			}
			for(var i=0; i<emails.length; i++){
				list.appendChild(this.buildEmail(emails[i]));
			}
		},
		
		buildEmail: function(value){
			var h = document.createElement("span");
			var em = document.createElement("span");
			var rem = document.createElement("span");
			var that = this;
			
			h.appendChild(em);h.appendChild(rem);
			h.className = "email-entered";
			rem.className = "remove-button fa";
			em.appendChild(document.createTextNode(value));
			rem.innerHTML = "&#xf00d;";
			rem.onclick = function(){
				that.removeEmail(h, value);
			};
			var isValid = MT.misc.validation;
			if(!isValid.email(value)){
				h.className += " error"
			}
			
			return h;
		},
		
		
		buildPending: function(el){
			var pro = document.createElement("div");
			pro.className = "goPro";
			var top = document.createElement("div");
			top.className = "top";
			var title = document.createElement("div");
			title.className = "title";
			title.appendChild(document.createTextNode("Pending approval"));
			
			var desc = document.createElement("div");
			desc.className = "description";
			desc.appendChild(document.createTextNode("We haven't received payment approval from paypal. Please wait."));
			
			
			top.appendChild(title);
			top.appendChild(desc);
			
			pro.appendChild(top);
			el.appendChild(pro);
		},
		
		buildCopyToAccessPermissions: function(el){
			var pro = document.createElement("div");
			pro.className = "goPro";
			var top = document.createElement("div");
			top.className = "top";
			var title = document.createElement("div");
			title.className = "title";
			title.appendChild(document.createTextNode("This is not your project"));
			
			var desc = document.createElement("div");
			desc.className = "description";
			desc.innerHTML = 'This project belongs to another user - or has been created by an annonymous user. '+
														'You can <a href="'+window.location.origin+'/#'+this.project.id+'-copy" />clone</a> this project to make your own copy of this project.';
			
			
			top.appendChild(title);
			top.appendChild(desc);
			
			pro.appendChild(top);
			el.appendChild(pro);
		},
		
		buildGoPro: function(el){
			var pro = document.createElement("div");
			pro.className = "goPro";
			
			var top = document.createElement("div");
			top.className = "top";
			
			var title = document.createElement("div");
			title.className = "title";
			title.appendChild(document.createTextNode("Get a pro account"));
			
			
			var desc = document.createElement("div");
			desc.className = "description";
			desc.appendChild(document.createTextNode("To share projects privately and to change other project properties you should get a subscription. "+
													"If you choose to subscribe you will get all kinds of awesome goodies."));
			
			var middle = document.createElement("div");
			middle.className = "middle";
			
			var basic = this.buildSide("Basic", ["Game Hosting", "Advanced Sharing", "Never Expiring Projects"], 5, "basic");
			var advanced = this.buildSide("Advanced", ["All of the Basic", "Support", "Feature Request Priority"], 20, "advanced");
			
			top.appendChild(title);
			top.appendChild(desc);
			
			middle.appendChild(basic);
			middle.appendChild(advanced);
			var clear = document.createElement("div");
			clear.style.clear = "both";
			middle.appendChild(clear);
			
			
			pro.appendChild(top);
			pro.appendChild(middle);
			el.appendChild(pro);
		},
		
		buildSide: function(title, parts, price, extra){
			var cont = document.createElement("div");
			cont.className = "side "+extra;
			var label = document.createElement("div");
			label.className = "label";
			label.appendChild(document.createTextNode(title));
			cont.appendChild(label);
			
			
			
			var p;
			for(var i=0; i<parts.length; i++){
				p = document.createElement("div");
				p.appendChild(document.createTextNode(parts[i]));
				cont.appendChild(p);
			}
			
			var pr = document.createElement("div");
			pr.className = "price";
			pr.appendChild(document.createTextNode(price+this.currency));
			cont.appendChild(pr);
			
			var that = this;
			/*var button = new MT.ui.Button("Subscribe", "subscribe "+extra, null, function(){
				that.subscribe(price);
			});*/
			
			//5$ - Y4PZXZMZFA8NQ
			//test - WULA9EQ248NKS
			var ppbutton = document.createElement("div");
			ppbutton.className = "subscribe "+extra;
			if(price == 5){
				ppbutton.innerHTML = '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">'+
										'<input type="hidden" name="cmd" value="_s-xclick">'+
										'<input type="hidden" name="hosted_button_id" value="Y4PZXZMZFA8NQ">'+
										'<input type="hidden" name="custom" value="'+this.userId+'">'+
										'<input type="hidden" name="notify_url" value="'+document.location.origin+'/paypal">'+
										'<input type="hidden" name="return" value="'+document.location.origin + '/return/paypal/'+this.userId+'/'+this.project.id+'">'+
										'<input type="hidden" name="invoice_id" value="'+Date.now()+'">'+
										'<input type="hidden" name="charset" value="utf-8">'+
										'<input type="image" src="http://mightyfingers.com/wp-content/uploads/2014/12/button_paypal.png" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">'+
									'</form>';
			}
			else{
				ppbutton.innerHTML = '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">'+
										'<input type="hidden" name="cmd" value="_s-xclick">'+
										'<input type="hidden" name="hosted_button_id" value="Y433GXUFDCNNE">'+
										'<input type="hidden" name="custom" value="'+this.userId+'">'+
										'<input type="hidden" name="notify_url" value="'+document.location.origin+'/paypal">'+
										'<input type="hidden" name="return" value="'+document.location.origin + '/return/paypal/'+this.userId+'/'+this.project.id+'">'+
										'<input type="hidden" name="invoice_id" value="'+Date.now()+'">'+
										'<input type="hidden" name="charset" value="utf-8">'+
										'<input type="image" src="http://mightyfingers.com/wp-content/uploads/2014/12/button_paypal_2.png" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">'+
									'</form>';
			}
			
			cont.appendChild(ppbutton);
			
			//cont.appendChild(button.el);
			
			return cont;
		},
		
		
		deleteProject: function(id, cb){
			var that = this;
			var pop = new MT.ui.Popup("Delete Project?", "Do you really want to delete project?");
			
			pop.addButton("no", function(){
				pop.hide();
				cb(false);
			});
			
			pop.addButton("yes", function(){
				that.send("deleteProject", id);
				pop.hide();
				cb(true);
			});
			
			pop.showClose();
		},
		
		installUI: function(ui, pop){
			if(this.panel){
				
				if(this.project.id && this.userLevel === 0){
					this.showProperties();
				}
				
				return;
			}
			
			this.ui = ui;
			this.loginContainer = document.createElement("div");
			this.logo = document.createElement("div");
			this.logo.className = "login logo";
			
			this.loginContainer.onclick = function(e){
				e.stopPropagation();
			};
			
			this.loginContainer.className = "ui-mysettings";
			var that = this;
			
			var loginPanel = this.panel = this.ui.createPanel("Sign in");
			this.loginContainer.panel = this.panel;
			
			loginPanel.fitIn();
			loginPanel.removeBorder();
			loginPanel.hide();
			loginPanel.content.style.overflow = "hidden";
			loginPanel.content.style.perspective = "1000";
			
			
			this.signUpEl = new MT.ui.DomElement("div");
			this.signUpEl.addClass("signup");
			loginPanel.content.el.appendChild(this.loginContainer);
			this.loginContainer.appendChild(this.signUpEl.el);
			
			var form = document.createElement("form");
			form.onsubmit = function(e){
				e.preventDefault();
				e.stopPropagation();
				return false;
			};

			var prop = {
				email: "email",
				password: "password",
				passwordR: "password"
			};
			
			this.signUpEl.el.appendChild(form);
			
			var input = {};
			input.email = new MT.ui.Input(this.ui, {key: "email", type: "text"}, prop);
			input.email.show(form);
			input.email.input.id = "email";
			input.email.input.name = "email";
			
			input.password = new MT.ui.Input(this.ui, {key: "password", type: "password"}, prop);
			input.password.show(form);
			
			input.password.value.el.innerHTML = "Password";
			
			
			input.passwordR = new MT.ui.Input(this.ui, {key: "passwordR", type: "password"}, prop);
			input.passwordR.value.el.innerHTML = "Repeat Password";
			
			loginPanel.on("show", function(){
				input.email.enableInput();
			});
			
			var isRegProcess = false;
			var isResetInProgress = false;
			
			var submit = function(){
				if(isResetInProgress){
					that.resetPassword(input);
					return;
				}
				that.signIn(input, isRegProcess);
			};
			
			
			this.loginButton = new MT.ui.Button("Sign in", "login.mainbutton", null, submit);
			this.loginButton.show(form);
			
			input.password.input.onkeydown = input.passwordR.input.onkeydown = function(e){
				if(e.which == MT.keys.ENTER){
					submit();
				}
			};
			
			
			var flipped = false;
			
			this.flipBack = function(e, forceSignIn){
				that.signUpEl.removeClass("flipBack").addClass("flip");
				window.setTimeout(function(){
					that.signUpEl.removeClass("flip").addClass("flipBack");
					
					if(forceSignIn && !isResetInProgress){
						return;
					}
					
					
					if(isResetInProgress){
						that.loginButton.text = "Sign in";
						that.registerButton.text = "Need an account?";
						
						input.email.el.parentNode.insertBefore(input.password.el, input.email.el.nextSibling);
						isResetInProgress = false;
						isRegProcess = false;
					}
					else{
						
						
						if(!isRegProcess){
							input.password.el.parentNode.insertBefore(input.passwordR.el, input.password.el.nextSibling);
							//input.passwordR.e(that.signUpEl.el);
							that.registerButton.text = "Back";
							that.loginButton.text = "Register";
							
							isRegProcess = true;
						}
						else{
							input.passwordR.hide();
							that.registerButton.text = "Need an account?";
							that.loginButton.text = "Sign in";
							
							isRegProcess = false;
						}
					}
					
					window.setTimeout(function(){
						that.signUpEl.removeClass("flipBack");
					}, 500);
					
				}, 250);
				
				input.email.value.removeClass("error");
				input.password.value.removeClass("error");
			};
			
			this.registerButton = new MT.ui.Button("Need an account?", "register", null, this.flipBack);
			this.registerButton.show(form);
			
			
			this.forgotPassButton = new MT.ui.Button("Forgot password?", "resetPassword", null, function(){
				that.signUpEl.removeClass("flipBack").addClass("flip");
				window.setTimeout(function(){
					that.signUpEl.removeClass("flip").addClass("flipBack");
					
					if(!isResetInProgress){
						input.password.hide();
						input.passwordR.hide();
						
						that.registerButton.text = "Back";
						that.loginButton.text = "Reset";
						
						isResetInProgress = true;
					}
					else{
						input.email.el.parentNode.insertBefore(input.password.el, input.email.el.nextSibling);
						that.loginButton.text = "Sign in";
						isResetInProgress = false;
					}
					
					window.setTimeout(function(){
						that.signUpEl.removeClass("flipBack");
					}, 500);
					
				}, 250);
				
				input.email.value.removeClass("error");
				input.password.value.removeClass("error");
			});
			
			this.forgotPassButton.show(form);
			
			
			
			this.logoutButton = new MT.ui.Button("Sign out", "login.mainbutton.logout", null, function(){
				that.signOut(input);
			});
			
			this.errorMessage = document.createElement("div");
			this.errorMessage.className = "errorMessage";
			this.signUpEl.el.appendChild(this.errorMessage);
			
			
			this.social = new MT.ui.DomElement("div");
			this.social.addClass("social");
			
			var that = this;
			
			this.send("getSocialConfig", null, function(config){
				that.config = config;
				for(var i in config){
					that[i+"Button"] = that.addSocialButton(config[i], that.social.el);
				}
			});
			
			this.fPass = ForgotPassword(this.signUpEl.el);
			
			this.loginContainer.appendChild(this.social.el);
		},
		setError: function(msg){
			if(!this.errorMessage){
				return;
			}
			this.error(msg);
		},
		addSocialButton: function(config, parent){
			
			var url = this.buildUrl(config);
			var that = this;
			var b = new MT.ui.Button(config.label, "login."+config.name, null, function(){
				var conf = config;
				var w = conf.width;
				var h = conf.height;
				var l = (window.innerWidth - w)*0.5;
				var t = (window.innerHeight - h)*0.5;
				window.auth = function(data){
					that.send("checkSession", data);
					window.auth = null;
					that.showLoading();
				};
				var win = window.open(url, "signIn", "width=" + w + ", height=" + h + ", left=" + l + ", top=" + t);
				win.focus();
			});
			parent.appendChild(b.el);
			return b;
		},
		
		buildUrl: function(conf){
			var url = conf.url + "?";
			for(var i in conf.params){
				url += i + "=" + conf.params[i]+"&";
			}
			url = url.substring(0, url.length - 1);
			return url;
		},
		
		hideContainer: function(){
			
			if( this.loginContainer && this.loginContainer.parentNode){
				this.loginContainer.parentNode.removeChild(this.loginContainer);
			}
		},
		
		showLoading: function(){
			window.showLoading();
		},
		hideLoading: function(){
			window.hideLoading();
		},
		
		show: function(panel, show){
			panel.addJoint(this.panel);
			if(show){
				this.panel.show();
			}
		},
		
		showMainScreen: function(){
			// is visible?
			if(this.loginContainer.parentNode){
				return;
			}
			if(this.standAlone){
				document.body.appendChild(this.loginContainer);
			}
			else{
				this.panel.content.el.appendChild(this.loginContainer);
			}
		},
		
		error: function(msg){
			var par = this.errorMessage.parentNode;
			this.errorMessage.setAttribute("data-msg", msg);
			this.errorMessage.className = "errorMessage";
			
			par.removeChild(this.errorMessage);
			par.appendChild(this.errorMessage);
			
			var that = this;
			window.setTimeout(function(){
				that.errorMessage.className += " active";
			}, 1000);
		},
		
		signIn: function(input, signUp){
			var email = input.email.getValue();
			var pass = input.password.getValue();
			var passR = input.passwordR.getValue();
			
			input.email.value.removeClass("error");
			input.password.value.removeClass("error");
			
			var isValid = MT.misc.validation;
			
			var errors = false;
			if(!isValid.email(email)){
				input.email.value.addClass("error");
				input.email.value.el.setAttribute("data-error", "check email");
				errors = true;
				
				if(!input.email.validateFirstTime){
					input.email.validateFirstTime = true;
					input.email.on("change", function(val){
						if(isValid.email(val)){
							input.email.value.removeClass("error");
						}
						else{
							input.email.value.addClass("error");
						}
					});
				}
			}
			
			if(!isValid.password(pass)){
				input.password.value.addClass("error");
				input.password.value.el.setAttribute("data-error", "at least one number and at least six characters");
				errors = true;
				if(!input.password.validateFirstTime){
					input.password.validateFirstTime = true;
					input.password.on("change", function(val){
						if(isValid.password(val)){
							input.password.value.removeClass("error");
						}
						else{
							input.password.value.addClass("error");
						}
					});
				}
			}
			
			if(signUp){
				if(pass !== passR){
					input.passwordR.value.addClass("error");
					input.passwordR.value.el.setAttribute("data-error", "passwords don't match");
					errors = true;
				}
			}
			
			if(errors){
				return;
			}
			this.errorMessage.className = "errorMessage";
			this.showLoading();
			
			// no ssl - better than nothing
			pass = MT.core.Helper.sha256(pass);
			
			var that = this;
			this.send("register", {email: email, password: pass, signup: signUp}, function(isOK){
				that.hideLoading();
				if(!isOK){
					that.showMainScreen();
					that.error("Sign in failed!");
				}
				console.log(isOK ? "register success" : "register failed");
			});
			
		},
		
		resetPassword: function(input){
			var that = this;
			
			var email = input.email.getValue();
			var isValid = MT.misc.validation;
			
			if(!isValid.email(email)){
				input.email.value.addClass("error");
				input.email.value.el.setAttribute("data-error", "check email");
				
				if(!input.email.validateFirstTime){
					input.email.validateFirstTime = true;
					input.email.on("change", function(val){
						if(isValid.email(val)){
							input.email.value.removeClass("error");
						}
						else{
							input.email.value.addClass("error");
						}
					});
				}
				return;
			}
			
			this.send("resetPassword", email, function(err){
				that.hideLoading();
				if(err){
					that.showMainScreen();
					that.error("Unknown email address");
				}
				else{
					that.error("Instructions has sent to the provided email!");
					window.setTimeout(function(){
						that.flipBack(null, true);
					}, 2000);
				}
				
			});
			
		},
		
		checkSession: function(){
			this.send("checkSession", sessionId);
			if(this.onstart){
				this.onstart();
				this.onstart = null;
			}
			return;
			var sessionId = MT.core.Helper.getCookie(this.sessionCookie);
			if(sessionId){
				this.send("checkSession", sessionId);
				return;
			}
			else{
				if(this.onstart){
					this.onstart();
					this.onstart = null;
				}
			}
		},
		
		a_sessionId: function(id){
			MT.core.Helper.setCookie(this.sessionCookie, id);
			
			if(this.onlogin){
				this.onlogin();
				this.onlogin = null;
			}
		},
		
		a_needLogin: function(msg){
			if(this.isLogged){
				this.project.a_goToHome();
			}
			if(this.onstart){
				this.onstart();
				this.onstart = null;
			}
			else{
				this.showLogin(true);
				if(msg){
					this.setError(msg);
				}
			}
		},
		
		a_loggedIn: function(data){
			var projects = this.projects = data.projects;
			this.userLevel = data.level;
			this.userId = data.userId;
			this.isLogged = true;
			
			if(!this.project.isReady){
				if(this.onstart){
					this.onstart();
					this.onstart = null;
				}
				this.standAlone = false;
				return;
			}
			// first login call
			if(this.onstart){
				this.onstart();
				this.onstart = null;
			}
			
			if(!this.panel){
				return;
			}
			
			
			this.hideLoading();
			this.hideContainer();
			this.panel.title = "My Projects";
			
			if(projects && projects.length > 0){
				var that = this;
				var list = this.project.makeProjectList(projects, function(id, cb){
					that.deleteProject(id, cb);
				});
				
				list.className += " myprojects";
				
				this.panel.content.el.appendChild(list);
				if(!this.project.id){
					this.panel.show();
				}
			}
			
			if(this.userLevel == 0){
				if(this.panel && this.project.id){
					this.showProperties();
				}
				else{
					this.subscribe = this.ui.createPanel("Go Pro");
					this.subscribe.mainTab.addClass("goprotab");
					this.subscribe.mainTab
					this.subscribe.hide();
					this.subscribe.fitIn();
					this.subscribe.removeBorder();
					this.panel.addJoint(this.subscribe);
					this.subscribe.show();
					this.buildGoPro(this.subscribe.content.el);
				}
			}
			this.panel.content.el.appendChild(this.logoutButton.el);
		}
	}
);


var ForgotPassword = function(parent){
	
	
};
ForgotPassword.prototype = {
	
};






























































//MT/plugins/MovieMaker.js
MT.namespace('plugins');
"use strict"
MT.require("plugins.MapEditor");
MT.require("ui.Keyframes");
MT.require("ui.MovieLayer");
MT.require("ui.FrameControl");
//MT.require("ui.MainMovie");

MT.FRAME_SELECTED = "FRAME_SELECTED";

MT.extend("core.Emitter")(
	MT.plugins.MovieMaker = function(project){
		this.project = project;
		MT.core.BasicPlugin.call(this, "movie");
	
		this.activeFrame = 0;
		this.startFrame = 0;
		this.scale = 1;
		
		this.keys = ["x", "y", "angle", "anchorX", "anchorY", "scaleX", "scaleY", "alpha", "frame", "assetId"];
		this.roundKeys = [];
		this.inputs = {};
		
	},
	{
		_frameSize: 5,
		get frameSize(){
			return this._frameSize*this.scale;
		},
		
		_keyframes: null,
		set keyframes(val){
			this._keyframes = val;
			if(val == this.keyframesMain){
				this.location.style.display = "none";
			}
			else{
				this.location.style.display = "block";
			}
			
		},
		get keyframes(){
			return this._keyframes;
		},
		
		initUI: function(ui){
			this.ui = ui;
			this.panel = this.ui.createPanel("timeline");
			this.panel.addClass("timeline");
			this.panel.setFree();
			this.panel.content.el.style.overflow = "hidden";
			this.el = this.panel.content;
			var that = this;
			
			this.panel.addOptions([
				{
					label: "Add movie",
					className: "",
					cb: function(){
						that.addMovie();
						that.panel.options.list.hide();
					}
				}
			]);
			this.panel.options.list.width = 150;
			this.panel.options.list.style.left = "auto";
			
			this.panel.on("show", function(){
				that.hide();
				that.setActive(that.data);
			});
			
			this.settings = this.ui.createPanel("Easing");
			this.settings.setFree();
			
			this.location = document.createElement("div");
			this.location.className = "ui-movie-location";
			this.location.innerHTML = "Back";
			this.location.style.display = "none";
			
			this.panel.content.el.appendChild(this.location);
			
			this.location.onclick = function(){
				that.location.style.display.block;
				var selected = that.map.activeObject;
				
				var d = that.data;
				
				that.clear();
				that.createMainMovie();
				that.keyframes.reactivate();
				
			};
			
			
			
		},
		
		genEasings: function(eas, label, buffer){
			buffer = buffer || [];
			var lab = label;
			for(var k in eas){
				if(label != ""){
					lab = label + ".";
				}
				
				if(typeof eas[k] == "object"){
					this.genEasings(eas[k], lab + k, buffer);
					continue;
				}
				
				buffer.push({
					label: lab + k,
					value: lab + k
				});
			}
			
			return buffer;
			
		},
		
		addInput: function(key, frame, options){
			var el = this.settings.content.el;
			if(this.inputs[key]){
				this.inputs[key].setObject(frame.easings);
				el.appendChild(this.inputs[key].el);
				return;
			}
			
			var input = new MT.ui.Input(this.ui, {
				key: key,
				options: options,
				type: "select"
			}, frame.easings);
			
			this.inputs[key] = input;
			el.appendChild(input.el);
		},
		
		showFrameSettings: function(frame){
			if(!frame.easings){
				frame.easings = {};
			}
			
			var easings = this.genEasings(Phaser.Easing, "", [{label: "NONE", value: "none"}]);
			
			for(var k in frame){
				if(k == "easings"){
					continue;
				}
				
				this.addInput(k, frame, easings);
			}
		},
		hideFrameSettings: function(){
			var el = this.settings.content.el;
			while(el.firstChild){
				el.removeChild(el.firstChild);
			}
			
		},
		
		installUI: function(){
			var span = null, div = null;
			var that = this;
			var ev = this.ui.events;
			this.layers = [];
			this.tools = this.project.plugins.tools;
			
			this.om = this.project.plugins.objectmanager;
			this.map = this.project.plugins.mapeditor;
			
			this.tools.on(MT.OBJECT_SELECTED, function(obj){
				that.selectObject(obj.data);
			});
			this.tools.on(MT.OBJECT_UNSELECTED, function(obj){
				if(!that.items || !that.items[obj.id]){
					return;
				}
				
				if(that.newMovieButton){
					return;
				}
				that.show(obj);
				that.keyframes.unselect(obj.id);
			});
			
			
			this.tools.on(MT.OBJECTS_UPDATED, function(obj){
				that.saveActiveFrame();
				
				if(!that.data){
					that.createMainMovie();
				}
			});
			
			
			this.om.on(MT.OBJECT_UPDATED, function(obj){
				if(obj.data.autoframe){
					that.addFrame();
				}
			});
			
			ev.on(ev.KEYDOWN, function(e){
				if(e.which == MT.keys.ESC){
					
					var oldF = that.keyframes;
					that.clear();
					that.createMainMovie();
					if(that.keyframes != oldF){
						that.keyframes.reactivate();
					}
					return;
				}
			});
			
			
			ev.on(ev.WHEEL, function(e){
				if(e.target !== that.frameControl.sepHolder){
					
					var found = false;
					var par = e.target.parentNode;
					while(par){
						if(par == that.panel.el){
							found = true;
							break;
						}
						par = par.parentNode;
					}
					if(!found){
						return;
					}
					
					if(e.wheelDelta > 0){
						that.keyframes.tv.tree.el.scrollTop -= 30;
					}
					else{
						that.keyframes.tv.tree.el.scrollTop += 30;
					}
					
					return;
				}
				
				
				if(e.wheelDelta > 0){
					that.scale += 0.1;
				}
				else{
					that.scale -= 0.1;
				}
				
				if(that.scale < 0.01){
					that.scale = 0.01;
				}
				that.changeFrame();
			});
			
			
			
			this.addPanels();
			
			this.slider = new MT.ui.DomElement("div");
			this.slider.addClass("ui-movie-slider");
			this.slider.setAbsolute();
			
			this.movieLength = new MT.ui.DomElement("div");
			this.movieLength.addClass("ui-movie-slider ui-movie-length");
			this.movieLength.setAbsolute();
			
			this.movieLengthTip = new MT.ui.DomElement("div");
			this.movieLengthTip.addClass("ui-movie-slider ui-movie-length tip");
			this.movieLengthTip.setAbsolute();
			
			var tipDown = false;
			this.movieLengthTip.el.onmousedown = function(e){
				tipDown = true;
				that.tipH.reset(that.movieLength.x);
				e.preventDefault();
				e.stopPropagation();
			};
			
			this.tipH = new MT.ui.SliderHelper(0, 0, Infinity);
			
			ev.on("mousemove", function(e){
				if(!tipDown){
					return;
				}
				that.tipH.change(ev.mouse.mx);
				var info = that.keyframes.getMovie().info;
				info.lastFrame = Math.floor(that.calcFrame(that.tipH));
				if(info.lastFrame < 0){
					info.lastFrame = 0;
				}
				that.changeFrame();
				that.map.sync();
			});
			
			ev.on("mouseup", function(e){
				tipDown = false;
			});
			
			
			
			this.sidebar = new MT.ui.DomElement("div");
			this.sidebar.addClass("ui-movie-sidebar");
			this.sidebar.setAbsolute();
			
			this.frameControl = new MT.ui.FrameControl(this);
			
			this.frameControl.on("change", function(offset){
				that.startFrame = Math.floor(offset / that.frameSize);
				that.changeFrame();
			});
			
			this.buttons = {
				saveKeyFrame: new MT.ui.Button("", "ui-movie-saveKeyFrame", null, function(e){
					that.addFrame(true);
					e.preventDefault();
					e.stopPropagation();
				})
			};
			this.buttons.saveKeyFrame.show(this.sidebar.el);
			
			this.keyframes = this.keyframesSub = new MT.ui.Keyframes(this, 60);
			this.keyframesSub.on("select", function(data){
				that.forwardObjectSelect(data);
			});
			
			
			this.keyframesMain = new MT.ui.MovieLayer(this, 60);
			this.keyframesMain.hideDelete();
			
			this.keyframesMain.on("select", function(data){
				that.forwardObjectSelect(data);
			});
			
			this.clear();
			
			this.om = this.project.plugins.objectmanager;
			
			this.map.on("update", function(){
				if(that.keyframes == that.keyframesMain){
					that.createMainMovie();
				}
			});
			
			this.ui.on(ev.RESIZE,function(){
				that.redrawAll();
			});
			
		},
		ignoreSelect: false,
		forwardObjectSelect: function(data){
			/*if(data.unselectable){
				return;
			}*/
			if(data.objectId){
				this.selectObject(data);
				this.ignoreSelect = true;
				this.om.emit(MT.OBJECT_SELECTED, this.map.getById(data.objectId));
				this.ignoreSelect = false;
				return;
			}
			
			var id = data.id;
			if(!id){
				return;
			}
			var obj = this.om.getById(id);
			if(!obj){
				return;
			}
			this.om.emit(MT.OBJECT_SELECTED, obj);
		},
		redrawAll: function(){
			if(!this.hasMovies()){
				return;
			}
			
			this.keyframes.updateFrames();
			this.frameControl.build();
		},
		show: function(obj){
			
			this.keyframes.show();
			if(obj){
				this.keyframes.setActiveObject(obj.id);
			}
			
			this.showHelpers();
			this.keyframes.showFrames();
			
		},
		hide: function(){
			
			this.keyframesMain.hide();
			this.keyframesSub.hide();
			this.Keyframes = this.keyframesSub;
			this.hideHelpers();
			if(this.newMovieButton){
				this.newMovieButton.hide();
			}
		},
   
		showHelpers: function(){
			this.slider.show(this.rightPanel.content.el);
			this.movieLength.show(this.rightPanel.content.el);
			this.movieLengthTip.show(this.rightPanel.content.el);
			
			
			this.sidebar.show(this.rightPanel.content.el);
			
			this.sidebar.width = this.frameOffset;
			
			this.frameControl.build();
			this.frameControl.el.show(this.rightPanel.content.el);
			
			//this.panel.content.el.appendChild(this.location.el);
			
		},
		hideHelpers: function(){
			this.keyframes.hide();
			this.slider.hide();
			this.movieLength.hide();
			this.movieLengthTip.hide();
			
			this.frameControl.hide();
			
			this.sidebar.hide();
			//this.location.hide();
		},
   
		clear: function(){
			this.changeFrame(0);
			
			this.keyframes = this.keyframesSub;
			this.keyframes.tv.merge([]);
			this.items = {};
			this.hide();
			
			this.keyframesMain.stop();
			this.keyframesSub.stop();
		},
   
		addPanels: function(){
			
			this.panel.content.style.paddingTop = "19px";
			
			this.leftPanel = this.ui.createPanel("me-layers");
			this.rightPanel = this.ui.createPanel("me-frames");
			
			this.leftPanel.addClass("borderless");
			this.leftPanel.hide().show(this.el.el);
			
			this.leftPanel.fitIn();
			this.leftPanel.width = 270;
			this.leftPanel.style.top = 19+"px";
			this.leftPanel.style.setProperty("border-right", "none 1px #000");
			this.leftPanel.isResizeable = true;
			this.leftPanel.removeHeader();
			this.leftPanel.removeClass("animated");
			
			this.rightPanel.addClass("borderless");
			this.rightPanel.hide().show(this.el.el);
			
			this.rightPanel.fitIn();
			this.rightPanel.style.left = 270+"px";
			this.rightPanel.style.top = 19+"px";
			this.rightPanel.style.width = "auto";
			this.rightPanel.removeHeader();
			this.rightPanel.removeClass("animated");
			
			
			this.leftPanel.content.style.overflow = "visible";
			this.rightPanel.content.style.overflow = "visible";
			
			var activeFrame = null;
			
			var down = false;
			var target;
			
			// 0 - nothing;
			// 1 - moveFrame;
			var action = 0;
			
			this.ui.events.on(this.ui.events.KEYUP, function(e){
				var p = that.ui.pickPanelGlobal();
				if(p != that.panel && p != that.leftPanel && p != that.rightPanel){
					return;
				}
				
				
				if(e.which == MT.keys.DELETE){
					that.removeFrame(activeFrame);
					e.preventDefault();
					e.stopPropagation();
				}
				if(e.which == MT.keys.SPACE){
					that.addFrame();
					e.preventDefault();
					e.stopPropagation();
				}
				
				if(e.which == MT.keys.RIGHT){
					that.changeFrame(that.activeFrame + 1);
					e.preventDefault();
					e.stopPropagation();
				}
				
				if(e.which == MT.keys.LEFT){
					that.changeFrame(that.activeFrame - 1);
					e.preventDefault();
					e.stopPropagation();
				}
				
				if(e.ctrlKey){
					if(e.which == MT.keys.C){
						//copy frame;
						that.copyFrame(activeFrame);
						e.preventDefault();
						e.stopPropagation();
					}
					if(e.which == MT.keys.X){
						//copy frame;
						that.cutFrame(activeFrame);
						e.preventDefault();
						e.stopPropagation();
					}
					if(e.which == MT.keys.V){
						that.pasteFrame();
						e.preventDefault();
						e.stopPropagation();
					}
				}
			}, true);
			
			// global shortcuts
			this.ui.events.on(this.ui.events.KEYUP, function(e){
				if(e.ctrlKey){
					if(e.which == MT.keys.SPACE){
						that.addFrame();
						e.preventDefault();
						e.stopPropagation();
					}
				}
			});
			/*
			this.rightPanel._input.onfocus = function(){
				console.log("focus");
			};
			*/
			var that = this;
			var sl = this.sliderHelper = new MT.ui.SliderHelper(0, 0, Infinity);
			
			var width = that.leftPanel.width;
			this.leftPanel.on("resize", function(w, h){
				if(w < width){
					that.leftPanel.width = width;
					return;
				}
				that.rightPanel.style.left = w +"px";
			});
			
			this.selectedFrame = null;
			
			var startFrame;
			this.rightPanel.content.el.onmousedown = function(e){
				
				if(e.target.autoframe){
					e.target.autoframe.autoframe = !e.target.autoframe.autoframe;
					if(e.target.autoframe.autoframe){
						e.target.ctrl.addClass("active");
					}
					else{
						e.target.ctrl.removeClass("active");
					}
					return;
				}
				
				if(e.target.frameInfo){
					target = e.target.parentNode;
					activeFrame = e.target.frameInfo;
					action = 1;
					that.selectedFrame = activeFrame.frames[activeFrame.index];
					
					
					that.showFrameSettings(that.selectedFrame);
				}
				else{
					action = 0;
					activeFrame = null;
					target = e.target;
					that.selectedFrame = null;
					that.hideFrameSettings();
				}
				
				if(target.data){
					that.forwardObjectSelect(target.data);
				}
				
				var off = e.offsetX;
				if(e.target != that.rightPanel.content.el){
					off += e.target.offsetLeft;
				}
				
				sl.reset(off);
				var f = that.calcFrame(sl);
				if(f > -1){
					down = true;
					that.changeFrame(f);
				}
				startFrame = that.activeFrame;
				that.redrawAll();
			};
			
			this.rightPanel.content.el.onmouseup = function(e){
				down = false;
			};
			
			this.ui.events.on("mousemove", function(e){
				if(!down){
					return;
				}
				
				sl.change(that.ui.events.mouse.mx);
				that.changeFrame((sl - that.frameOffset) / that.frameSize + that.startFrame);
				if(action == 1 && activeFrame){
					if(that.moveFrame(that.selectedFrame, activeFrame, that.selectedFrame.keyframe - (startFrame - that.activeFrame))){
						startFrame = that.activeFrame;
					}
				}
				
			});
			
			this.ui.events.on("mouseup", function(e){
				down = false;
			});
			
		},

		showNewMovie: function(){
			this.hide();
			
			this.newMovieButton = new MT.ui.DomElement("div");
			this.newMovieButton.addClass("ui-new-movie-wrapper");
			
			var that = this;
			this.newMovieButton.button = new MT.ui.Button("New Movie", "ui-new-movie style2", null, function(){
				that.addMovie();
			});
			
			this.newMovieButton.button.show(this.newMovieButton.el);
			
			this.newMovieButton.show(this.panel.content.el);
			
		},
   
		selectObject: function(obj){
			if(this.ignoreSelect){
				return;
			}
			if(this.items && this.items[obj.id]){
				if( !this.hasMovies() ){
					this.hide();
					this.showNewMovie();
				}
				else{
					this.show(obj);
				}
				return;
			}
			this.selectObjectForce(obj);
			
			
			
			//this.location.el.innerHTML = obj.name;
			/*var p = this.keyframes.panels[this.keyframes.activeMovie];
			if(p){
				p.x = this.location.width;
			}*/
		},
		
		selectObjectForce: function(obj){
			this.hide();
			this.keyframes = this.keyframesSub;
			this.setActive(obj);
		},
		
		addMovie: function(item, name){
			
			if(item && name){
				this.__addMovie(item, name);
				return;
			}
			
			if(!this.data){
				return;
			}
			
			var name = "NewMovie";
			var tmpName = name;
			var inc = 1;
			while(this.data.movies[name]){
				name = tmpName + inc;
				inc++;
			}
			
			this._addMovie(name);
			
			this.om.sync();
		},
		_addMovie: function(name, data){
			for(var i in this.items){
				data = this.items[i];
				this.__addMovie(data, name);
			}
			this.keyframes = this.keyframesSub;
			this.setActive(this.data);
			this.showHelpers();
			this.keyframes.setActiveMovie(name);
			var that = this;
			window.setTimeout(function(){
				that.keyframes.update();
			});
		},
   
		__addMovie: function(item, name){
			if(!item.movies){
				item.movies = {};
			}
			if(item.movies[name]){
				return;
			}
			item.movies[name] = {
				frames: [],
				info: {
					fps: 60
				}
			};
		},
		
		items: null,
		setActive: function(obj){
			if(this.newMovieButton){
				this.newMovieButton.hide();
			}
			
			this.items = {};
			this.data = obj;
			
			// deleted?
			if(!this.data){
				this.keyframes.setData(null);
				this.hideHelpers();
				return;
			}
			
			if(!this.data.movies){
				this.data.movies = {};
			}
			
			if( !this.hasMovies() ){
				this.hide();
				this.showNewMovie();
				this.collectItems();
				return;
			}
			
			this.collectItems();
			this.keyframes.setData(this.data);
			
			this.show(this.data);
			
			if(!this.activeFrame){
				this.changeFrame(0);
			}
			else{
				this.changeFrame(this.activeFrame);
			}
		},
		
		hasMovies: function(){
			if(!this.data){
				return false;
			}
			var total = Object.keys(this.data.movies).length;
			return !( (total == 0 && this.state != 1) || (total == 1 && this.data.movies[this.mainName] != void(0) && this.keyframes != this.keyframesMain) );
		},
		
		collectItems: function(){
			this._collectItems(this.data);
		},
		_collectItems: function(data){
			this.items[data.id] = data;
			if(!data.contents){
				return;
			}
			
			for(var i=0; i<data.contents.length; i++){
				this._collectItems(data.contents[i]);
			}
		},
		
		frameOffset: 40,
		
		calcFrame: function(px){
			var ret = (px - this.frameOffset) / this.frameSize  + this.startFrame;
			return ret;
		},
		calcFrameLoc: function(frame){
			return frame * this.frameSize + (this.frameSize - this.slider.width)*0.5 + this.frameOffset - this.startFrame * this.frameSize;
		},
   
		changeFrame: function(frameApprox){
			if(frameApprox == void(0)){
				frameApprox = this.activeFrame;
			}
			
			var sl = this.sliderHelper;
			var frame = Math.floor(frameApprox);
			if(frame < 0){
				frame = 0;
			}
			
			var x = this.calcFrameLoc(frame);
			
			if(x < this.frameOffset){
				this.slider.style.visibility = "hidden";
			}
			else{
				this.slider.style.visibility = "visible";
			}
			this.slider.x = x;
			
		
			
			
			var mov = this.keyframes.getMovie();
			if(!mov){
				return;
			}
			
			x = this.calcFrameLoc(mov.info.lastFrame);
			
			if(x < this.frameOffset){
				this.movieLength.style.visibility = "hidden";
				this.movieLengthTip.style.visibility = "hidden";
				
			}
			else{
				this.movieLength.style.visibility = "visible";
				this.movieLengthTip.style.visibility = "visible";
			}
			
			if(mov.info.lastFrame == void(0)){
				mov.info.lastFrame = 60;
			}
			this.movieLength.x = this.calcFrameLoc(mov.info.lastFrame);
			this.movieLengthTip.x = this.movieLength.x;
			
			
			
			this.keyframes.changeFrame(frame);
			
			this.activeFrame = frame;
			this.redrawAll();
		},
		
		addFrame: function(all){
			this.keyframes.saveActiveFrame(null, all);
		},
		
		moveFrame: function(selected, fi, frame){
			if(frame == void(0)){
				 frame = this.activeFrame;
			}
			else{
				frame = Math.round(frame);
				if(frame < 0){
					frame = 0;
				}
			}
			
			if(selected.keyframe == frame){
				return false;
			}
			
			var subframe;
			if(selected.length){
				for(var i=0; i<fi.frames.length; i++){
					subframe = fi.frames[i];
					if(subframe == selected){
						continue;
					}
					if(subframe.keyframe < frame && subframe.keyframe + subframe.length > frame){
						return;
					}
				}
			}
			
			selected.keyframe = frame;
			this.sortFrames(fi.frames);
			this.changeFrame();
			return true;
		},
		
		frameBuffer: null,
		framesToCopy: null,
		cutFrame: function(fi){
			if(fi){
				this.copyFrame(fi);
				fi.frames.splice(fi.index, 1);
				this.framesToCopy = null;
			}
			else{
				this.collectFramesToCopy(true);
			}
			this.changeFrame();
		},
		copyFrame: function(fi){
			if(fi){
				this.frameBuffer = fi;
				this.framesToCopy = null;
			}
			else{
				this.collectFramesToCopy();
			}
		},
		
		collectFramesToCopy: function(cut){
			this.framesToCopy = [];
			var frames, data;
			for(var key in this.items){
				data = this.items[key].movies[this.keyframes.activeMovie]
				frames = data.frames;
				for(var f=0; f<frames.length; f++){
					if(frames[f].keyframe == this.activeFrame){
						this.framesToCopy.push({
							frame: frames[f],
							data: data
						});
						if(cut){
							frames.splice(f, 1);
							f--;
						}
					}
					
				}
			}
			
		},
		pasteFrame: function(){
			var frame, info;
			if(this.framesToCopy){
				for(var i=0; i<this.framesToCopy.length; i++){
					info = this.framesToCopy[i];
					frame = _.cloneDeep(info.frame);
					frame.keyframe = this.activeFrame;
					info.data.frames.push(frame);
					this.sortFrames(info.data.frames);
				}
				this.changeFrame();
				return;
			}
			
			
			if(!this.frameBuffer){
				return;
			}
			var frames = this.frameBuffer.frames;
			frame = _.cloneDeep(frames[this.frameBuffer.index]);
			
			frame.keyframe = this.activeFrame;
			frames.push( frame );
			
			this.sortFrames(frames);
			
			
			this.changeFrame();
		},
		
		sortFrames: function(frames){
			frames.sort(function(a,b){
				return a.keyframe - b.keyframe ;
			});
		},
   
		removeFrame: function(fi){
			if(!fi){
				// debug this
				return;
			}
			fi.frames.splice(fi.index, 1);
			
			this.changeFrame();
			
			this.om.sync();
		},
		
		saveActiveFrame: function(){
			this.keyframes.saveActiveFrame(true);
		},
   
		buildKeyFrames: function(obj){
			//this.tv.merge(obj.contents);
		},
		
		getById: function(id){
			var mo = this.project.plugins.mapeditor.getById(id);
			if(mo){
				return mo.data;
			}
			return;
		},
   
		collect: function(dataref, kf, ref){
			var id = dataref.id;
			var obj, data;
			if(dataref.objectId){
				obj = this.map.getById(dataref.objectId);
				
			}
			else{
				obj = this.map.getById(id);
			}
			
			var out = ref || {};
			if(!obj){
				return out;
			}
			
			data = obj.data;
			var k;
			for(var i=0; i<this.keys.length; i++){
				k = this.keys[i];
				if(data[k] != void(0)){
					out[k] = data[k];
				}
			}
			out.keyframe = kf;
			return out;
		},
   
		updateScene: function(){
			var d = this.data.kf[this.activeFrame];
			if(d){
				this.updateObjects(d);
			}
			else{
				this.interpolate();
			}
		},
		
		loadState: function(id, data, frame){
			frame = frame || 0;
			
			var mo = this.project.plugins.mapeditor.getById(id);
			if(!mo){
				return;
			}
			mo.update(data);
		},
		
		
		interpolate: function(id, start, end, frame){
			var t = (frame - start.keyframe) / (end.keyframe - start.keyframe);
			var mo = this.project.plugins.mapeditor.getById(id);
			// deleted?
			if(!mo){
				return;
			}
			
			var med = this.buildTmpVals(t, start, end);
			mo.update(med);
		},
   
		buildTmpVals: function(t, d1, d2){
			if(!d2){
				return d1;
			}
			var tmp = {};
			var k;
			for(var i=0; i<this.keys.length; i++){
				k = this.keys[i];
				if(k == "frame" || k == "assetId"){
					tmp[k] = d1[k];
					continue;
				}
				tmp[k] = this.getInt(t, d1[k], d2[k], (d2.easings ? d2.easings[k] : null) );
			}
			
			for(var i=0; i<this.roundKeys.length; i++){
				k = this.roundKeys[i];
				tmp[k] = Math.floor(this.getInt(t, d1[k], d2[k]));
			}
			return tmp;
		},
   
		getInt: function(t, a, b, easing){
			if(isNaN(a)){
				return b;
			}
			if(isNaN(b)){
				return a;
			}
			var tfin = t;
			if(easing){
				tfin = this.resolve(easing, t);
			}
			
			
			return (1 - tfin) * a + tfin * b;
		},
		
		resolve: function(ea, t){
			if(ea == "NONE"){
				return 0;
			}
			var sp = ea.split(".");
			var start = Phaser.Easing;
			for(var i=0; i<sp.length && start; i++){
				start = start[sp[i]];
			}
			
			if(start){
				return start(t);
			}
			return t;
		},
		
		mainMovie: null,
		mainName: "__main",
		createMainMovie: function(){
			this.keyframes.hide();
			this.keyframes = this.keyframesMain;
			
			//this.location.el.innerHTML = "Main Timeline";
			
			this.mainMovie = {
				name: this.mainName,
				id: 0,
				contents: [],
				movies: {}
			};
			
			var info = this.map.settings.movieInfo;
			
			this.mainMovie.movies[this.mainName] = {
				frames: [],
				info: info
			};
			
			var data = this.om.getData();
			this.collectMovies(data, this.mainMovie.contents, 0);
			
			this.setActive(this.mainMovie);
		},
		
		collectMovies: function(data, contents, id){
			var movies, currMovie, tmp, movieContents, frames;
			
			var mainName = this.mainName;
			
			var mdata;
			
			main:
			for(var i=0; i<data.length; i++){
				if(!data[i].movies){
					data[i].movies = {};
				}
				
				movies = data[i].movies;
				if(!movies[mainName]){
					this.__addMovie(data[i], mainName);
				}
				
				tmp = {};
				tmp.id = ++id;
				tmp.objectId = data[i].id;
				
				tmp.movies = data[i].movies;
				tmp.name = data[i].name;
				tmp.isClosed = true;
				
				var mainMovie = tmp.movies[mainName];
				if(!mainMovie.subdata){
					mainMovie.subdata = [];
				}
				movieContents = mainMovie.subdata;
				tmp.contents = movieContents;
				
				// clean deleted movies
				clean:
				for(var j=0; j<movieContents.length; j++){
					for(var key in movies){
						if(movieContents[j].name == key){
							continue clean;
						}
					}
					movieContents.splice(j, 1);
				}
				
				scan:
				for(var key in movies){
					if(key == mainName){
						continue;
					}
					tmp.isClosed = false;
					for(var j = 0; j<movieContents.length; j++){
						if(movieContents[j].name == key){
							mdata = movieContents[j];
							mdata.info = movies[key].info;
							continue scan;
						}
					}
					mdata = {};
					
					mdata[mainName] = {
						frames: [],
						info: movies[key].info
					};
					
					movieContents.push({
						id: Math.random(),
						objectId: data[i].id,
						name: key,
						movies: mdata,
						submovie: true
					});
				}
				contents.push(tmp);
			}
		}
	}
);

//MT/plugins/Notification.js
MT.namespace('plugins');
"use strict";
MT.require("misc.tooltips");
MT(
	MT.plugins.Notification = function(project){
		this.project = project;
		var that = this;
		this.Notification = function(){
			this.el = new MT.ui.DomElement();
			this.el.addClass("ui-notification");
			this.el.el.innerHTML = "Testing....";
		};
		this.Notification.prototype.hide = function(){
			that.hide(this);
		};
		this.Notification.prototype.show = function(p){
			this.el.show(p);
		};
		this.notifications = [];
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.parent = this.ui.centerBottomRightBox;
			
			var p = this.project.plugins;
			var that = this;
			p.assetmanager.on(MT.ASSETS_UPDATED, function(data){
				that.enabled = true;
				if(data.length <= 1){
					that.showIntro();
				}
			});
		},
   
		installUI: function(){
			
		},
		show: function(label, text, tm){
			var that = this;
			var n = new this.Notification();
			//n.style.width = 1;
			
			n.el.el.onclick = function(){
				n.hide();
			};
			
			n.el.el.innerHTML = '<p class="label">'+label+'</p>'+'<p>'+text+'</p>';
			n.show(this.parent);
			window.setTimeout(function(){
				n.el.style.opacity = 1;
			}, 100);
			//n.style.width = "auto";
			
			var idx = this.notifications.push(n);
			this.align(n, idx-1);
			
			if(isFinite(tm)){
				window.setTimeout(function(){
					n.hide();
				}, tm);
			}
			
			
			
			return n;
		},
		showToolTips: function(tool, no, isError){
			var p = this.project.plugins;
			if(!this.enabled){
				
				return;
			}
			
			
			var info = MT.misc.tooltips[tool.tooltip];
			if(!info){
				return;
			}
			
			var tip;
			if(isError){
				tip = info.errors[no];
			}
			else{
				tip = info.tips[no];
			}
			
			this.show(info.title, tip, 3000);
		},
   
		showIntro: function(){
			
		},
   
		hide: function(n){
			var that = this;
			n.el.style.opacity = 0;
			window.setTimeout(function(){
				that.hideNow(n);
			}, 300);
		},
		hideNow: function(n){
			var index = this.notifications.indexOf(n);
			var n = this.notifications.splice(index, 1)[0];
			if(n){
				n.el.hide();
			}
			for(var i = 0; i<this.notifications.length; i++){
				this.align(this.notifications[i], i);
				
			}
		},
		align: function(n, idx){
			var dec = idx;
			if(idx > 3){
				dec = Math.floor(3 + 3/idx);
			}
			n.el.style.bottom = (dec) * 20 + "px";
			n.el.style.width = 320 - (dec) * 10 + "px";
			n.el.style.zIndex = 999 - idx;
		},
	}
);   

//MT/plugins/TooltipManager.js
MT.namespace('plugins');
MT.require("misc.tooltips");

MT(
	MT.plugins.TooltipManager = function(){

	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.el = new MT.ui.DomElement("div");
			this.el.setAbsolute();
			this.el.style.zIndex = 1001;
			this.el.addClass("ui-tooltip");
		},

		installUI: function(){
			var that = this;
			var ev = this.ui.events;
			var lastTarget = null;
			var attr, info, bounds;
			ev.on(ev.MOUSEMOVE, function(e){
				if(e.target === lastTarget){
					return;
				}
				lastTarget = e.target;
				
				attr = e.target.getAttribute("data-tooltip");
				if(!attr){
					that.el.hide();
					return;
				}
				
				info = MT.misc.tooltips[attr];
				
				if(!info){
					info = {
						title: attr
					};
				}
				
				bounds = e.target.getBoundingClientRect();
				
				that.el.show(document.body);
				that.el.el.innerHTML = '<div class="ui-tooltip-label">'+info.title+'</div>';
				if(info.desc){
					that.el.el.innerHTML += '<div class="ui-tooltip-description">'+info.desc;
				}
				that.el.x = bounds.left + bounds.width;
				that.el.y = bounds.top + (bounds.height - that.el.height)*0.5;
				
			});
		}
	}
);
//MT/plugins/UserData.js
MT.namespace('plugins');
/* default view depends on settings plugin */

MT.require("ui.TableView");
MT(
	MT.plugins.UserData = function(project){
		this.project = project;
		this.table = new MT.ui.TableView(null, ["key", "value"]);
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("userData");
			this.panel.setFree();
			
		},
		installUI: function(){
			var plugins = this.project.plugins;
			var tools = plugins.tools;
			var that = this;
			this.activeObject = null;
			
			var updateData = function(obj){
				if(!obj){
					return;
				}
				if(!obj.userData){
					obj.userData = {};
				}
				that.table.setData(obj.userData);
				that.table.show(that.panel.content.el);
				that.activeObject = obj;
			};
			
			tools.on(MT.ASSET_FRAME_CHANGED, function(obj){
				
			});
			tools.on(MT.OBJECT_SELECTED, function(mo){
				updateData(mo.data);
				that.type = "object";
			});
			
			plugins.assetmanager.on(MT.ASSETS_UPDATED, function(){
				if(that.type == "asset"){
					updateData(plugins.assetmanager.getById(that.activeObject.id));
				}
			});
			
			
			var clear = function(){
				that.table.hide();
			};
			/*
			this.ui.events.on("keyup", function(e){
				if(e.which == MT.keys.ESC){
					clear();
				}
			});
			*/
			tools.on(MT.OBJECT_UNSELECTED, clear);
			
			
			this.ui.joinPanels(this.project.plugins.settings.panel, this.panel);
			this.project.plugins.settings.panel.show();
		}
	}
);
//MT/plugins/Physics.js
MT.namespace('plugins');
"use strict";
MT.extend("core.BasicPlugin")(
	MT.plugins.Physics = function(project){
		this.project = project;
		this.activeObject = null;
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("physics");
			this.panel.setFree();
			this.empty = new MT.ui.Input(ui, {type: "bool", key: "enable"}, {enable: 0});
			
			var that = this;
			this.empty.on("change", function(val){
				if(val){
					that.buildPropTree();
				}
				else{
					that.addEmptyInput();
				}
				om.sync();
			});
			
			var om = this.project.plugins.objectmanager;
			var cb = function(val){
				that.change(val);
				that.buildPropTree();
				om.sync();
			};
			
			var tmp = {};
			
			this.inputs = {
				immovable: new MT.ui.Input(ui, {
					key: "immovable",
					type: "bool",
				}, tmp),
				
				// gravity
				allowGravity: new MT.ui.Input(ui, {
					key: "allow",
					type: "bool",
				}, tmp),
				
				gravityX: new MT.ui.Input(ui, {
					key: "x",
					type: "number",
				}, tmp),
				gravityY: new MT.ui.Input(ui, {
					key: "y",
					type: "number",
				}, tmp),
				
				bounceX: new MT.ui.Input(ui, {
					key: "x",
					type: "number",
					min: 0,
					step: 0.1
				}, tmp),
				
				bounceY: new MT.ui.Input(ui, {
					key: "y",
					type: "number",
					min: 0,
					step: 0.1
				}, tmp),
				
				// rotation
				allowRotation: new MT.ui.Input(ui, {
					key: "allowRotation",
					type: "bool"
				}, tmp),
				maxAngular: new MT.ui.Input(ui, {
					key: "maxAngular",
					type: "number",
				}, tmp),
				
				
				// body
				width: new MT.ui.Input(ui, {
					key: "width",
					type: "number",
				}, tmp),
				height: new MT.ui.Input(ui, {
					key: "height",
					type: "number",
				}, tmp),
				offsetX: new MT.ui.Input(ui, {
					key: "offsetX",
					type: "number",
				}, tmp),
				offsetY: new MT.ui.Input(ui, {
					key: "offsetY",
					type: "number",
				}, tmp),
				
				mass: new MT.ui.Input(ui, {
					key: "mass",
					type: "number",
				}, tmp),
				
				collideWorldBounds: new MT.ui.Input(ui, {
					key: "collideWorldBounds",
					type: "number",
				}, tmp),
				
				// limits
				maxVelocity: new MT.ui.Input(ui, {
					key: "maxVelocity",
					type: "number",
				}, tmp),
				
			};
			
			
			for(var i in this.inputs){
				this.inputs[i].on("change", cb);
			}
			
			
			this.createFieldset("gravity");
			this.createFieldset("size");
			this.createFieldset("rotation");
		},
		getTemplate: function(isFull){
			if(isFull == void(0)){
				return {
					enable: 0
				};
			}
			
			return {
				enable: 1,
				immovable: 1,
				bounce: {
					x: 1,
					y: 1
				},
				gravity: {
					allow: 1,
					x: 0,
					y: 0
				},
				size: {
					width: -1,
					height: -1,
					offsetX: 0,
					offsetY: 0
				},
				rotation: {
					allowRotation: 0,
					maxAngular: 0
				},
				maxVelocity: 0,
				mass: 1,
				collideWorldBounds: 0
			}
			
		},
		
		addEmptyInput: function(){
			// remove all inputs;
			this.clear();
			this.empty.show(this.panel.content.el);
		},
		
		change: function(val){
			
		},
		_gravityBreak: null,
		get gravityBreak(){
			if(!this._gravityBreak){
				this._gravityBreak = document.createElement("br");
			}
			return this._gravityBreak;
		},
		buildPropTree: function(){
			this.clear();
			
			if(!this.activeObject.physics.enable){
				return;
			}
			
			if(this.activeObject.physics.immovable == void(0)){
				this.activeObject.physics = this.getTemplate(true);
			}
			
			var o = this.activeObject;
			var p = o.physics;
			var f;
			
			this.empty.setObject(p);
			this.empty.show(this.panel.content.el);
			
			this.inputs.immovable.setObject(p);
			this.inputs.immovable.show(this.panel.content.el);
			
			
			
			f = this.addFieldset("size");
			
			this.inputs.width.setObject(p.size);
			this.inputs.width.show(f);
			
			this.inputs.height.setObject(p.size);
			this.inputs.height.show(f);
			
			this.inputs.offsetX.setObject(p.size);
			this.inputs.offsetX.show(f);
			
			this.inputs.offsetY.setObject(p.size);
			this.inputs.offsetY.show(f);
			
			if(!p.immovable){
				
				f = this.addFieldset("bounce");
				if(typeof p.bounce != "object"){
					p.bounce = {x: 1, y: 1};
				}
				
				this.inputs.bounceX.setObject(p.bounce);
				this.inputs.bounceX.show(f);
				
				this.inputs.bounceY.setObject(p.bounce);
				this.inputs.bounceY.show(f);
				
				
				f = this.addFieldset("gravity");
				if(p.gravity.allow == void(0)){
					p.gravity.allow = 1;
				}
				this.inputs.allowGravity.setObject(p.gravity);
				this.inputs.allowGravity.show(f);
				if(p.gravity.allow){
					f.appendChild(this.gravityBreak);
					this.inputs.gravityX.setObject(p.gravity);
					this.inputs.gravityX.show(f);
				
					this.inputs.gravityY.setObject(p.gravity);
					this.inputs.gravityY.show(f);
				}
				else{
					if(this.gravityBreak.parentNode){
						this.gravityBreak.parentNode.removeChild(this.gravityBreak);
					}
				}
				f = this.addFieldset("rotation");
				
				this.inputs.allowRotation.setObject(p.rotation);
				this.inputs.allowRotation.show(f);
				
				this.inputs.maxAngular.setObject(p.rotation);
				this.inputs.maxAngular.show(f);
				
				this.inputs.maxVelocity.setObject(p);
				this.inputs.maxVelocity.show(this.panel.content.el);
				
				this.inputs.mass.setObject(p);
				this.inputs.mass.show(this.panel.content.el);
				
				
				if(p.collideWorldBounds == void(0)){
					p.collideWorldBounds = 0;
				}
				this.inputs.collideWorldBounds.setObject(p);
				this.inputs.collideWorldBounds.show(this.panel.content.el);
			}
		},
		
		sets: {},
		addFieldset: function(title){
			if(this.sets[title]){
				this.panel.content.el.appendChild(this.sets[title]);
				return this.sets[title];
			}
			
			var f = this.createFieldset(title);
			this.panel.content.el.appendChild(f);
			return f;
		},
		
		createFieldset: function(title){
			if(this.sets[title]){
				return;
			}
			var f = document.createElement("fieldset");
			var l = document.createElement("legend");
			f.appendChild(l);
			
			l.innerHTML = title;
			
		
			this.sets[title] = f;
			
			return f;
		},
		
		clear: function(){
			this.empty.hide();
			for(var i in this.inputs){
				this.inputs[i].hide();
			}
			for(var i in this.sets){
				if(this.sets[i].parentNode){
					this.sets[i].parentNode.removeChild(this.sets[i]);
				}
			}
		},
		
		installUI: function(){
			var plugins = this.project.plugins;
			var tools = plugins.tools;
			var that = this;
			var map = this.project.plugins.mapeditor;
			
			
			var updateData = function(obj){
				map.updateScene(map.settings);
				if(obj){
					that.activeObject = obj;
				}
				else{
					that.activeObject = null;
					return;
				}
				if(!obj.physics){
					obj.physics = that.getTemplate();
					that.empty.setObject(obj.physics);
					that.addEmptyInput();
				}
				else if(!obj.physics.enable){
					obj.physics.enable = 0;
					
					that.empty.setObject(obj.physics);
					that.addEmptyInput();
				}
				else{
					that.buildPropTree(obj.physics);
				}
			};
			
			this.ui.events.on("keyup", function(e){
				if(e.which == MT.keys.ESC){
					that.clear();
				}
			});
			
			map.on("select", function(obj){
				updateData(map.settings);
			});
			
			tools.on(MT.ASSET_FRAME_CHANGED, updateData);
			tools.on(MT.OBJECT_SELECTED, function(mo){
				updateData(mo.data);
			});
			
			tools.on(MT.OBJECT_UNSELECTED, function(){
				that.clear();
			});
			
			this.ui.joinPanels(this.project.plugins.settings.panel, this.panel);
			this.project.plugins.settings.panel.show();
			
		}
		
	}
);
//MT/plugins/GamePreview.js
MT.namespace('plugins');
MT.extend("core.BasicPlugin")(
	MT.plugins.GamePreview = function(project){
		this.project = project;
	},
	{
		initUI: function(ui){
			
			return;
			this.ui = ui;
			this.panel = this.ui.createPanel("GamePreview");
			this.el = this.panel.content;
		},

		installUI: function(){
			
			return;
			this.ui.joinPanels(this.project.plugins.mapeditor.panel, this.panel);
			this.project.plugins.mapeditor.panel.show();
			
			var that = this;
			var ampv = that.project.plugins.assetmanager.preview;
			var tools = that.project.plugins.tools;
			var zoombox = this.project.plugins.mapmanager.panel;
			var undoredo = this.project.plugins.undoredo;
			this.panel.on("show", function(){
				tools.panel.content.hide();
				zoombox.hide();
				ampv.hide();
				undoredo.disable();
				MT.events.simulateKey(MT.keys.ESC);
				
				that.addButtons(tools.panel);
			});
			this.panel.on("unselect", function(){
				tools.panel.content.show();
				zoombox.show();
				ampv.show();
				undoredo.enable();
				window.getSelection().removeAllRanges();
				
				that.removeButtons();
			});
		},
		
		addButtons: function(){
			
		},
		
		removeButtons: function(){
			
		}




	}
);
//MT/plugins/SourceEditor.js
MT.namespace('plugins');
var defs = [];
(function(){
	var cmPath = "js/cm";
	var addCss = function(src){
		var style = document.createElement("link");
		style.setAttribute("rel", "stylesheet");
		style.setAttribute("type", "text/css");
		style.setAttribute("href", src);
		document.head.appendChild(style);
	};
	
	var defFiles = ["js/tern/defs/ecma5.json", "js/tern/defs/ecma6.json", "js/tern/defs/browser.json"];
	
	for(var i=0; i<defFiles.length; i++){
		(function(i){
			MT.loader.get(defFiles[i], function(src){
				defs[i] = JSON.parse(src);
			});
		})(i);
	}
	
	
	/*MT.requireFile("js/acorn/acorn.js", function(){
		MT.requireFile("js/acorn/acorn_loose.js");
		MT.requireFile("js/acorn/util/walk.js");
		
		MT.requireFile("js/tern/lib/signal.js", function(){
			MT.requireFile("js/tern/lib/tern.js",function(){
				MT.requireFile("js/tern/lib/def.js", function(){
					MT.requireFile("js/tern/lib/comment.js");
					MT.requireFile("js/tern/lib/infer.js", function(){
						MT.requireFile("js/tern/plugin/doc_comment.js");
					});
				});
			});
		});
	});*/
	
	if(window.release){
		MT.requireFile(cmPath+"/lib/codemirror-full.js",function(){
			cmPath += "/addon";
			
			MT.requireFile(cmPath+"/tern/tern.js");
			MT.requireFile(cmPath+"/scroll/scrollpastend.min.js"); 
			//MT.requireFile("js/jshint.min.js");
			
			addCss("css/codemirror.css");
			addCss(cmPath+"/hint/show-hint.css");
			addCss(cmPath+"/fold/foldgutter.css");
			addCss(cmPath+"/dialog/dialog.css");
			addCss("css/cm-tweaks.css");
			addCss(cmPath+"/tern/tern.css");
		});
		return;
	}
	
	MT.requireFile(cmPath+"/lib/codemirror.js", function(){
		cmPath += "/addon";
		MT.requireFile(cmPath+"/comment/comment.js");
		
		MT.requireFile(cmPath+"/dialog/dialog.js");
		
		MT.requireFile(cmPath+"/edit/matchbrackets.js");
		
		MT.requireFile(cmPath+"/fold/brace-fold.js");
		MT.requireFile(cmPath+"/fold/foldgutter.js");
		MT.requireFile(cmPath+"/fold/foldcode.js");
		MT.requireFile(cmPath+"/fold/xml-fold.js");
		
		MT.requireFile(cmPath+"/hint/show-hint.js");
		MT.requireFile(cmPath+"/hint/anyword-hint.js");
		MT.requireFile(cmPath+"/hint/show-hint.js");
		MT.requireFile(cmPath+"/hint/javascript-hint.js");
		MT.requireFile(cmPath+"/hint/xml-hint.js");
		MT.requireFile(cmPath+"/hint/html-hint.js");
		
		MT.requireFile(cmPath+"/scroll/scrollpastend.js"); //!!
		
		MT.requireFile(cmPath+"/search/search.js");
		MT.requireFile(cmPath+"/search/goto-line.js");
		MT.requireFile(cmPath+"/search/searchcursor.js");
		MT.requireFile(cmPath+"/search/match-highlighter.js");
		MT.requireFile(cmPath+"/selection/active-line.js");
		
		
		//MT.requireFile("js/jshint.js");
		MT.requireFile(cmPath+"/tern/tern.js");

		
		addCss("css/codemirror.css");
		addCss(cmPath+"/hint/show-hint.css");
		addCss(cmPath+"/fold/foldgutter.css");
		addCss(cmPath+"/dialog/dialog.css");
		addCss(cmPath+"/tern/tern.css");
		addCss("css/cm-tweaks.css");
		
		
		var WORD = /[\w$]+/, RANGE = 500;
		CodeMirror.registerHelper("hint", "javascript", function(editor, options) {
			var word = options && options.word || WORD;
			var range = options && options.range || RANGE;
			var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
			var start = cur.ch, end = start;
			while (end < curLine.length && word.test(curLine.charAt(end))) ++end;
			while (start && word.test(curLine.charAt(start - 1))) --start;
			var curWord = start != end && curLine.slice(start, end);
			var list = [], seen = {};
			var re = new RegExp(word.source, "g");
			for (var dir = -1; dir <= 1; dir += 2) {
				var line = cur.line, endLine = Math.min(Math.max(line + dir * range, editor.firstLine()), editor.lastLine()) + dir;
				for (; line != endLine; line += dir) {
					var text = editor.getLine(line), m;
					while (m = re.exec(text)) {
						if (line == cur.line && m[0] === curWord) continue;
						if ((!curWord || m[0].lastIndexOf(curWord, 0) == 0) && !Object.prototype.hasOwnProperty.call(seen, m[0])) {
							seen[m[0]] = true;
							list.push(m[0]);
						}
					}
				}
			}
			return {list: list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
		});
		
	});
})();

MT.FILE_UPLOADED = "FILE_UPLOADED";
MT.FILE_LIST_RECEIVED = "FILE_LIST_RECEIVED";

MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.SourceEditor = function(project){
		MT.core.BasicPlugin.call(this, "source");
		this.project = project;
		this.documents = {};
		
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = this.ui.createPanel("SourceEditor");
			this.el = this.panel.content;
		},
		
		installUI: function(){
			this.ui.joinPanels(this.project.plugins.mapeditor.panel, this.panel);
			this.project.plugins.mapeditor.panel.show();
			
			
			this.addPanels();
			this.addTreeView();
			
			this.addEditor();
			
			var that = this;
			var ampv = that.project.plugins.assetmanager.preview;
			var timeline = that.project.plugins.moviemaker.panel;
			var tools = that.project.plugins.tools;
			var zoombox = this.project.plugins.mapmanager.panel;
			var undoredo = this.project.plugins.undoredo;
			
			
			this.buttonPanel = new MT.ui.DomElement();
			this.buttonPanel.addClass("ui-panel-content");
			
			this.buttons = {
				newFile: new MT.ui.Button("", "ui-button.tool.ui-new-file", null, function(){
					that.newFile();
				}),
				
				newFolder: new MT.ui.Button("", "ui-button.tool.ui-new-folder", null, function(){
					that.newFolder();
				}),
				
				save: new MT.ui.Button("", "ui-button.tool.ui-save-file", null, function(){
					that.save();
				}),
				
				deleteFile: new MT.ui.Button("", "ui-button.tool.ui-delete-file", null, function(){
					that.deleteFile();
				}),
			};
			
			for(var i in this.buttons){
				this.buttons[i].show(this.buttonPanel.el);
			}
			
			
			this.panel.on("show", function(){
				that.ui.loadLayout(null, 1);
				that.panel.show(that.panel._parent, false);
				
				tools.panel.content.hide();
				zoombox.hide();
				ampv.hide();
				timeline.hide();
				undoredo.disable();
				MT.events.simulateKey(MT.keys.ESC);
				
				that.addButtons(tools.panel);
				
				that.leftPanel.width = parseInt(that.leftPanel.style.width);
				//????
				window.setTimeout(function(){
					that.editor.refresh();
					that.editor.focus();
				},100);
				
				that.editor.refresh();
			});
			this.panel.on("unselect", function(){
				tools.panel.content.show();
				zoombox.show();
				ampv.show();
				timeline.show();
				undoredo.enable();
				window.getSelection().removeAllRanges();
				
				that.removeButtons();
				that.ui.loadLayout(null, 0);
			});
			
			this.project.on(MT.DROP, function(e, data){
				if(!MT.core.Helper.isSource(data.path)){
					return;
				}
				// not dropped file
				if(e){
					var item = that.tv.getOwnItem(e.target);
					if(item && item.data.contents){
						data.path = item.data.fullPath + data.path;
					}
				}
				
				that.uploadFile(data);
			});
			
			this.project.on("updateData", function(data){
				that.panel.el.style.fontSize = data.sourceEditor.fontSize+"px";
			});
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
			this.getFiles();
		},
		
		getFiles: function(){
			this.send("getFiles");
		},
		a_receiveFiles: function(files){
			this.tv.merge(files);
			this.emit(MT.FILE_LIST_RECEIVED, files);
			this.data = files;
			var fo;
			
			fo = this.getInData("/index.html");
			if(fo){
				this.loadDocument(fo);
			}
			fo = this.getInData("/js/state/play.js");
			if(fo){
				this.loadDocument(fo);
			}
			fo = this.getInData("/js/state/menu.js");
			if(fo){
				this.loadDocument(fo);
			}
			fo = this.getInData("/js/state/load.js");
			if(fo){
				this.loadDocument(fo);
			}
		},
		getInData: function(path, cont){
			cont = cont || this.data;
			for(var i=0; i<cont.length; i++){
				if(cont[i].fullPath == path){
					return cont[i];
				}
				
				if(cont[i].contents){
					var tmp = this.getInData(path, cont[i].contents);
					if(tmp){
						return tmp;
					}
				}
			}
		},
		uploadFile: function(data){
			var tmp = data.src;
			var that = this;
			var nota = this.project.plugins.notification.show(data.path, "Upload in progress...", 999999);
			
			data.src = Array.prototype.slice.call(new Uint8Array(data.src));
			this.send("uploadFile", data, function(){
				that.emit(MT.FILE_UPLOADED, data.path);
				nota.hide();
			});
		},
		
		save: function(panel){
			panel = panel || this.activePanel;
			
			if(!panel){
				return;
			}
			var data = panel.data;
			if(data.src == data.doc.getValue()){
				return;
			}
			data.src = data.doc.getValue();
			this.checkChanges();
			this.send("save", {
				path: panel.data.data.fullPath, 
				src: this.editor.getValue()
			});
		},
		restore: function(panel){
			panel = panel || this.activePanel;
			
			if(!panel){
				return;
			}
			var data = panel.data;
			if(data.src == data.doc.getValue()){
				return;
			}
			data.doc.setValue(data.src);
		},
		deleteFile: function(){
			var pop = new MT.ui.Popup("Delete file?", "Are you sure you want to delete file?");
			var that = this;
			pop.addButton("no", function(){
				pop.hide();
			});
			
			pop.addButton("yes", function(){
				that._deleteFile();
				pop.hide();
			});
			pop.showClose();
		},
		
		_deleteFile: function(){
			if(this.activeTreeItem){
				this.send("delete", this.activeTreeItem.data);
				if(!this.activeTreeItem.data.contents && this.activePanel){
					this.activePanel.close();
				}
				return;
				
			}
			if(!this.activePanel){
				return;
			}
			this.send("delete", this.activePanel.data.data);
			this.activePanel.close();
		},
		
		newFile: function(){
			this.send("newFile");
		},
		
		a_newFile: function(id){
			var parsedData = this.tv.getById(id);
			var panel = this.loadDocument(parsedData.data, false);
			panel.data.needFocus = false;
			this.tv.enableRename(parsedData);
		},
		
		newFolder: function(){
			this.send("newFolder");
		},
		
		a_newFolder: function(id){
			var parsedData = this.tv.getById(id);
			this.tv.enableRename(parsedData);
		},
		
		
		rename: function(o, n){
			this.send("rename", {
				o: o,
				n: n
			});
		},
		
		loadDocument: function(data, needFocus){
			var that = this;
			
			var panel = this.documents[data.fullPath];
			if(panel == void(0)){
				panel = new MT.ui.Panel(data.name);
				panel.data = {
					data: data,
					needFocus: true,
					opened: 0
				};
				
				panel.mainTab.el.setAttribute("title", data.fullPath);
				
				this.documents[data.fullPath] = panel;
				
				panel.on("show", function(){
					var el;
					if(that.activePanel){
						el = that.tv.getById(that.activePanel.data.data.id);
						if(el){
							el.removeClass("selected");
						}
					}
					that.activePanel = panel;
					
					el = that.tv.getById(panel.data.data.id);
					if(el){
						el.addClass("selected");
					}
					if(!panel.data.doc){
						return;
					}
					that.loadDoc(panel, needFocus);
					
				});
				
				panel.on("close", function(){
					that.checkChangesAndAskSave(panel);
					if(that.activePanel == panel){
						el = that.tv.getById(that.activePanel.data.data.id);
						if(el){
							el.removeClass("selected");
						}
					}
				});
				panel.isCloseable = true;
			}
			
			//
			panel.fitIn();
			panel.addClass("borderless");
			
			if(!this.activePanel){
				panel.show(this.rightPanel.content.el);
				this.activePanel = panel;
			}
			else{
				this.activePanel.addJoint(panel);
			}
			
			panel.show();
			if(Date.now() - panel.data.opened < 5*1000){
				return;
			}
			panel.data.opened = Date.now();
			
			
			if(MT.core.Helper.isAudio(data.name)){
				if(panel.audio){
					return;
				}
				var audio = document.createElement("audio");
				var src = document.createElement("source");
				src.setAttribute("src", that.project.path + "/src" + data.fullPath);
				src.setAttribute("type", "audio/"+MT.core.Helper.getExt(data.fullPath));
				audio.appendChild(src);
				audio.setAttribute("controls", "controls");
				panel.content.el.appendChild(audio);
				panel.audio = audio;
				audio.onended = function(){
					audio.load();
				};
			}
			else if(MT.core.Helper.isFont(data.name)){
				this.project.plugins.fontmanager.includeFont(data.fullPath);
				
				this.project.plugins.fontmanager.getFontInfo(data.fullPath, function(infostr){
					var info = {};
					var html = "";
					var char;
					
					if(infostr){
						info = JSON.parse(infostr);
					}
					var fontFamily = info["Family name"];
					var pangrams = "";
					
					for(var j=0; j<5; j++){
							
						var prev = '<div><span style="font-family: \''+fontFamily+'\'; font-size: '+(12+j*j)+'px">';
						for(var i=65; i<91; i++){
							char = String.fromCharCode(i);
							prev+= char.toLowerCase()+char+" ";
						}
						prev += '</span></div>';
						
						pangrams += prev;
					}
					
					pangrams += that.genPangram(fontFamily, 15);
					var table = "<table>";
					for(var k in info){
						table += "<tr><td>"+k+"</td><td>"+info[k]+"</td></tr>";
					}
					table += "</table>";
					
					html = '<div class="font-preview">' + table + pangrams + "</div>";
					panel.content.addClass("font-preview");
					panel.content.el.innerHTML = html;
				});
			}
			else{
				this.send("getContent", data);
			}
			
			return panel;
		},
		
		genPangram: function(fontFamily, size){
			var txt = "Zwölf Boxkämpfer jagen Victor quer über den großen Sylter Deich";
			return '<div><span style="font-family: \''+fontFamily+'\'; font-size: '+size+'px">'+txt+'</span></div>';
			
		},
		
		a_fileContent: function(data){
			var ext = data.name.split(".").pop();
			var mode = this.guessMode(ext);
			
			
			var that = this;
			this.loadMode(mode, function(){
				var doc = that.documents[data.fullPath].data.doc;
				that.documents[data.fullPath].data.src = data.src;
				var edmode = mode._mode || mode;
				if(!doc){
					doc = CodeMirror.Doc(data.src, edmode, 0);
					doc.name = data.fullPath;
					that.documents[data.fullPath].data.doc = doc;
				}
				
				that.editor.swapDoc(doc);
				that.documents[data.fullPath].show();
				that.loadDoc(that.documents[data.fullPath]);
				
			});
		},
		
		loadDoc: function(panel){
			panel.show();
			if(this.editorElement.parentNode){
				this.editorElement.parentNode.removeChild(this.editorElement);
			}
			panel.content.el.appendChild(this.editorElement);
			this.editor.swapDoc(panel.data.doc);
			
			var that = this;
			var si = this.editor.getScrollInfo();
			this.editor.scrollTo(si.left + 1, si.top);
			this.editor.scrollTo(si.left, si.top);
			window.setTimeout(function(){
				if(panel.data.needFocus !== false){
					that.editor.focus();
				}
			}, 300);
			
			this.updateHints();
		},
		
		addButtons: function(el){
			this.buttonPanel.show(el.el);
		},
		
		removeButtons: function(){
			this.buttonPanel.hide();
		},
		
		addPanels: function(){
			
			this.leftPanel = this.ui.createPanel("file-list-holder");
			this.rightPanel = this.ui.createPanel("source-editor");
			
			this.leftPanel.addClass("borderless");
			this.leftPanel.hide().show(this.el.el);
			
			this.leftPanel.fitIn();
			this.leftPanel.width = 200;
			this.leftPanel.style.setProperty("border-right", "solid 1px #000");
			this.leftPanel.isResizeable = true;
			this.leftPanel.removeHeader();
			
			var that = this;
			this.leftPanel.on("resize", function(w, h){
				that.rightPanel.style.left = w +"px";
			});
			
			
			this.rightPanel.addClass("borderless");
			this.rightPanel.hide().show(this.el.el);
			
			this.rightPanel.fitIn();
			this.rightPanel.style.left = 200+"px";
			this.rightPanel.style.width = "auto";
			this.rightPanel.removeHeader();
			
			this.rightPanel.content.style.overflow = "hidden";
		},
		
		activeTreeItem: null,
		addTreeView: function(){
			
			this.tv = new MT.ui.TreeView([], {
				root: this.project.path
			});
			this.tv.tree.show(this.leftPanel.content.el);
			
			var that = this;
			var select =  function(data, element){
				if(that.activeTreeItem){
					that.activeTreeItem.removeClass("selected");
				}
				that.activeTreeItem = element;
				element.addClass("selected");
				
				if(!data.contents){
					that.loadDocument(data);
				}
			};
			
			this.tv.on("click", select);
			this.tv.on("renameStart", function(){
				if(!that.activePanel){
					return;
				}
				that.activePanel.data.needFocus = false;
			});
			this.tv.on("change", function(a, b){
				if(!a || !b){
					// changed order
					that.saveData();
					return;
				}
				var doc = that.documents[a] || that.documents[b];
				
				if(!doc){
					that.rename(a, b);
					return;
				}
				doc.data.needFocus = true;
				
				var name = b.split("/").pop();
				that.documents[b] = doc;
				delete that.documents[a];
				doc.mainTab.el.setAttribute("title", b);
				doc.mainTab.title.innerHTML = name;
				var mode = that.guessMode(name.split(".").pop());
				that.loadMode(mode, function(){
					var el = that.tv.getById(doc.data.data.id);
					doc.data.needFocus = true;
					
					select(doc.data.data, el);
					
					if(doc.data.doc){
						doc.data.doc.getEditor().setOption("mode", mode);
					}
					
				});
				
				that.rename(a, b);
				
			});
			
			var saveState = function(el){
				that.send("updateFolder", {
					id: el.data.id,
					isClosed: el.data.isClosed
				});
			};
			
			this.tv.on("open", function(el){
				saveState(el);
			});
			
			this.tv.on("close", function(el){
				saveState(el);
			});
			
			this.tv.sortable(this.ui.events);
		},
		
		saveData: function(){
			this.send("update", this.tv.getData());
		},
		
		moveLine: function(ed, inc){
			var line = ed.state.activeLines[0];
			if(line == void(0)){
				return;
			}
			var c = ed.getCursor();
			
			var cLine = ed.getLine(c.line);
			var nLine = ed.getLine(c.line+inc);
			
			//ed.replaceRange(c.line, nLine);
			ed.replaceRange(nLine, {ch: 0, line: c.line}, {ch: cLine.length, line: c.line});
			c.line = c.line+inc;
			
			
			ed.replaceRange(cLine, {ch: 0, line: c.line}, {ch: nLine.length, line: c.line});
			
			ed.setSelection(c);
			ed.indentLine(c.line);
			
		},
		
		copyLine: function(ed, inc){
			var line = ed.state.activeLines[0];
			if(line == void(0)){
				return;
			}
			var c = ed.getCursor();
			var cch = c.ch;
			c.ch = line.text.length;
			
			ed.setCursor(c);
			ed.replaceSelection("\r\n"+line.text);
			
			c.line = c.line+inc;
			c.ch = cch;
			ed.setSelection(c);
			return;
			
		},
		
		addEditor: function(){
			var that = this;
			var defaultCfg = {
				indentUnit: 4,
				extraKeys: {
					"Ctrl-S": function(cm) {
						that.save();
					},
					"Cmd-S": function(cm) {
						that.save();
					},
					
					"Ctrl-/": "toggleComment",
					"Cmd-/": "toggleComment",
					
					"Ctrl-Space": function(cm){
						that.showHints();
						
						// server.complete(cm);
						
					},
					"Cmd-Space": function(){
						that.showHints();
					},
					
					"Alt-Up": function(ed, e){
						that.moveLine(ed, -1);
					},
					"Alt-Down": function(ed, e){
						that.moveLine(ed, 1);
					},
					"Ctrl-Alt-Up": function(ed){
						that.copyLine(ed, 0);
					},
					"Ctrl-Alt-Down": function(ed){
						that.copyLine(ed, 1);
					},
					"Ctrl-+": function(ed){
						alert();
					},
					"Cmd-Alt-Up": function(ed){
						that.copyLine(ed, 0);
					},
					"Cmd-Alt-Down": function(ed){
						that.copyLine(ed, 1);
					},
					"Cmd-+": function(ed){
						alert();
					},
					"Ctrl-L": "gotoLine",
					"Cmd-L": "gotoLine",
					"Ctrl-Alt-Right": function(cm) { server.jumpToDef(cm); },
					"Ctrl-Alt-Left": function(cm) { server.jumpBack(cm); },
				},
				gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-jslint"],
				highlightSelectionMatches: {showToken: /\w/},
				
				onCursorActivity: function(cm) {
					editor.matchHighlight("CodeMirror-matchhighlight");
					server.updateArgHints(cm);
				},
				
				tabMode: "shift",
				indentWithTabs: true,
				lineNumbers: true,
				
				foldGutter: true,
				styleActiveLine: true,
				matchBrackets: true,
				autofocus: true,
				dragDrop: true,
				showTabs: true,
				undoDepth: 500,
				scrollPastEnd: true,
				historyEventDelay: 200,
				tabSize: 4,
				cursorBlinkRate: 530
			};
			
			this.editorElement = null;
			var that = this;
			
			this.editor = CodeMirror(function(el){
				that.editorElement = el;
			}, defaultCfg);
			
			this.editor.on("change", function(){
				that.checkChanges();
				that.showHints(true);
			});
			this.editor.on("keyup", function(ed, e){
				
				//move up/down
				if(e.altKey && (e.which == MT.keys.UP || e.which == MT.keys.DOWN) ){
					var line = ed.state.activeLines[0];
					var c = ed.getCursor();
					e.preventDefault();
					return false;
				}
			});
			
			window.server = this.server = new CodeMirror.TernServer({
				defs: defs,
				plugins: {doc_comment: {
					fullDocs: true
				}, complete_strings: {
					maxLength: 15
				}},
				switchToDoc: function(name, doc) {
					if(that.documents[doc.name]){
						that.loadDoc(that.documents[doc.name]);
					}
				},

				workerDeps: ["../../../acorn/acorn.js", "../../../acorn/acorn_loose.js",
							"../../../acorn/util/walk.js", "../../../tern/lib/signal.js", "../../../tern/lib/tern.js",
							"../../../tern/lib/def.js", "../../../tern/lib/infer.js", "../../../tern/lib/comment.js",
							"../../../tern/plugin/doc_comment.js"],
				workerScript: "js/cm/addon/tern/worker.js",
				useWorker: true
			});
			
			
			MT.loader.get(this.project.path + "/src/js/lib/phaser.js", function(data){
				server.server.addFile("[phaser]", data);
			});
			MT.loader.get(this.project.path + "/src/js/lib/mt.helper.js", function(data){
				server.server.addFile("[helper]", data);
			});
			
			
			
			/*this.editor.on("keyHandled", function(ed, a,b,c){
				console.log(a,b,c);
				return;
				e.preventDefault();
				e.stopPropagation();
			});*/
		},
		
		showHints: function(autocall){
			if(this.__showHints){
				return;
			}
			
			if(autocall && !this.project.data.sourceEditor.autocomplete){
				return;
			}
			
			//skipSingle = true;
			var that = this;
			var sel = this.editor.doc.sel;
			var range = sel.ranges[0];
			if(!range){
				return;
			}
			var token = this.editor.getTokenAt(range.anchor);
			token.string = token.string.trim();
			if(autocall && token.string != "." && (!token.type || token.string == "" ) ){
				return;
			}
			
			var name = this.editor.doc.name;
			var n = name.substring(name.length -3, name.length)
			
			if(n != ".js"){
				this.__showHints = true;
				this.editor.showHint({completeSingle: !autocall, selectFirst: !autocall});
				window.setTimeout(function(){
					that.__showHints = false;
				}, 0);
				return;
			}
			
			server.getHint(this.editor, function(hints){
				
				if(autocall && token.string != "_"){
					hints.list = hints.list.filter(function(a){
						return (a.text.substring(0, 1) != "_");
					});
				}
				
				var list = hints.list;
				for(var i=0; i<list.length; i++){
					var hint = list[i];
					var data = hint.data;
					if(!data.doc){
						continue;
					}
					if(data.type.indexOf("fn") !== 0){
						continue;
					}
					
					
					data.doc = data.type.substring(2) + "\n\n" + data.doc;
					continue;
				}
				
				that.editor.showHint({hint: function(){return hints;}, completeSingle: !autocall, selectFirst: !autocall});
			});
			
		},
		
		updateHints: function(){
			var that = this;
			
			this.editor.operation(function(){
				that.editor.clearGutter("CodeMirror-jslint");
				if(that.editor.options.mode.name != "javascript"){
					return;
				}
				var conf = {
					browser: true,
					globalstrict: true,
					strict: "implied",
					undef: true,
					unused: true,
					loopfunc: true,
					predef: {
						"Phaser": false,
						"PIXI": false,
						"mt": false,
						"console": false
					},
					laxcomma: false
				};
				
				if(that.lastWorker){
					that.lastWorker.terminate();
				}
				
				var worker = new Worker("js/jshint-worker.js");
				that.lastWorker = worker;
				
				worker.onmessage = function(e) {
					var errors = e.data[0]
					for (var i = 0; i < errors.length; ++i) {
						var err = errors[i];
						if (!err) continue;
						
						var msg = document.createElement("a");
						msg.errorTxt = err.reason;
						var icon = msg.appendChild(document.createElement("span"));
						
						icon.innerHTML = "!";
						icon.className = "lint-error-icon";
						
						var text = msg.appendChild(document.createElement("span"));
						text.className = "lint-error-text";
						text.appendChild(document.createTextNode(err.reason));
						
						msg.className = "lint-error";
						that.editor.setGutterMarker(err.line - 1,"CodeMirror-jslint", msg);
						
						
						
						//var evidence = msg.appendChild(document.createElement("span"));
						//evidence.className = "lint-error-text evidence";
						//evidence.appendChild(document.createTextNode(err.evidence));
					}
				};
				worker.postMessage([that.editor.getValue(), conf ]);
			});
		},
		
		
		delay: 0,
		checkChanges: function(){
			if(!this.activePanel){
				return;
			}
			if(!this.delay){
				var that = this;
				this.delay = window.setTimeout(function(){
					that.updateHints();
					that.delay = 0;
				}, 100);
			}
			
			
			var data = this.activePanel.data;
			if(data.doc && data.src != data.doc.getValue()){
				this.activePanel.mainTab.title.innerHTML = data.data.name + "*";
			}
			else{
				this.activePanel.mainTab.title.innerHTML = data.data.name;
			}
		},
		
		
		checkChangesAndAskSave: function(panel){
			var data = panel.data;
			if(!data.doc){
				return;
			}
			if(data.src === data.doc.getValue()){
				return;
			}
			var that = this;
			var pop = new MT.ui.Popup("File changed", "File has been changed, do you want to save changes?");
			
			pop.addButton("no", function(){
				that.restore(panel);
				pop.hide();
			});
			
			pop.addButton("yes", function(){
				that.save(panel);
				pop.hide();
			});
			pop.showClose();
		},
		
		guessMode: function(ext){
			var mode = {
				ext: ext
			};
			if(ext == "js"){
				mode.name = "javascript";
				mode.hint = "javascript";
			}
			if(ext == "html"){
				mode.name = "htmlmixed";
				mode.hint = "html";
				mode.scriptTypes = [
						{
							matches: /\/x-handlebars-template|\/x-mustache/i,
							mode: null
						},
						{
							matches: /(text|application)\/(x-)?vb(a|script)/i,
							mode: "vbscript"
						}
				]
			}
			if(ext == "css"){
				mode.name = "css";
				mode.hint = "css";
			}
			if(ext == "json"){
				mode.name = "javascript";
				mode._mode = "application/ld+json";
			}
			return mode;
		},
		_loadedModes: {},
		loadMode: function(mode, cb){
			if(!mode || !mode.name){
				cb();
				return;
			}
			if(!this._loadedModes[mode.name]){
				
				var loadMode = function(){
					if(mode.name == "htmlmixed"){
						MT.requireFile("js/cm/mode/xml/xml.js", function(){
							MT.requireFile("js/cm/mode/" + mode.name + "/" + mode.name + ".js", cb);
						});
					}
					else{
						MT.requireFile("js/cm/mode/" + mode.name + "/" + mode.name + ".js", cb);
					}
				};
				if(mode.hint){
					MT.requireFile("js/cm/addon/hint/" + mode.hint + "-hint.js", loadMode);
				}
				else{
					loadMode();
				}
			}
			else{
				cb();
			}
		}
		
	}
);

//MT/plugins/MapManager.js
MT.namespace('plugins');
/*
	adds panel with zoom and locate buttons
*/

MT.extend("core.BasicPlugin")(
	MT.plugins.MapManager = function(project){
		MT.core.BasicPlugin.call(this, "MapManager");
		this.project = project;
	},
	{
		installUI: function(ui){
			var that = this;
			
			this.panel = this.ui.createPanel("Map Manager");
			this.panel.isDockable = true;
			this.panel.isJoinable = false;
			this.panel.isResizeable = false;
			
			this.panel.removeHeader();
			this.panel.height = 25;
			ui.dockToBottom(this.panel);
			
			this.locateObject = this.panel.addButton("", "map-locate", function(){
				that.locate();
			});
			
			this.map = this.project.plugins.mapeditor;
			
			this.locateObject.width = "auto";
			
			this.zoom = new MT.ui.Dropdown({
				list: [
					200,
					150,
					100,
					90,
					80,
					70,
					60,
					50
				],
				button: {
					class: "text-size",
					width: "auto"
				},
				listStyle: {
					width: 70
				},
				value: 100
			}, ui);
			
			this.zoom.button.el.setAttribute("data-text", "%");
			
			this.zoom.on("change", function(val){
				that.setZoom(val);
			});
			this.zoom.on("show", function(val){
				that.zoom.button.el.setAttribute("data-text", "");
			});
			this.zoom.on("hide", function(val){
				that.zoom.button.el.setAttribute("data-text", "%");
			});
			
			
			
			this.panel.addButton(this.zoom.button);
			
			this.panel.addClass("map-manager-panel");
			this.panel.alignButtons();
			
			this.panel.style.marginLeft = 0;
			
			this.ui.events.on("wheel", function(e){
				if(e.target != that.map.game.canvas){
					return;
				}
				
				if(e.wheelDelta > 0){
					that.incZoom(e.offsetX, e.offsetY);
				}
				else{
					that.decZoom(e.offsetX, e.offsetY);
				}
				
				
			});
			
		},
		
		setZoom: function(val){
			
			this._setZoom(val*0.01);
		},
		_setZoom: function(val, x, y){
			var cam = this.map.game.camera;
			this.map.resize();
			
			var ox = cam.x/cam.scale.x + cam.view.halfWidth;
			var oy = cam.y/cam.scale.y + cam.view.halfHeight;
			
			
			if(x !== void(0)){
				var dx = x/cam.scale.x + cam.x/cam.scale.x;
				var dy = y/cam.scale.y + cam.y/cam.scale.y;
				
				var ndx = x/val + cam.x/val;
				var ndy = y/val + cam.y/val;
					
				var ddx = (ndx - dx)*val;
				var ddy = (ndy - dy)*val;
			}
			
			cam.scale.setTo(val, val);
			this.map.resize();

			if(x !== void(0)){
				cam.x -= ddx;
				cam.y -= ddy;
			}
			else{
				this.locateXY(ox, oy);
			}
			
			if(!this.zoom.list.isVisible){
				this.zoom.button.text = (val*100).toFixed(0);
			}
			
			this.map.settings.cameraX = cam.x;
			this.map.settings.cameraY = cam.y;
			this.project.plugins.settings.updateScene(this.map.settings);
			var that = this;
			window.setTimeout(function(){
				that.map.update();
			}, 10);
		},
		
		
		
		locate: function(){
			var cam = this.map.game.camera;
			if(!this.map.activeObject || this.map.activeObject.object){
				this.map.game.camera.x = 0;
				this.map.game.camera.y = 0;
				return;
			}
			
			var o = this.map.activeObject.object;
			this.locateXY(o.x + (o.width*(0.5 - o.anchor.x)), o.y + (o.height*(0.5 - o.anchor.y)));
		},
		
		locateXY: function(x, y){
			var cam = this.map.game.camera;
			cam.x = (x - cam.view.halfWidth)*cam.scale.x;
			cam.y = (y - cam.view.halfHeight)*cam.scale.y;
		},
		
		incZoom: function(x, y){
			var val = this.map.scale.x;
			if(val > 3){
				return;
			}
			this._setZoom(val + 0.1, x, y);
		},
		
		decZoom: function(x, y){
			var val = this.map.scale.x;
			if(val < 0.3){
				return;
			}
			this._setZoom(val - 0.1, x, y);
			
		}
	}
);
//MT/plugins/FontManager.js
MT.namespace('plugins');
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
//MT/plugins/HelpAndSupport.js
MT.namespace('plugins');
MT.extend("core.BasicPlugin")(
	MT.plugins.HelpAndSupport = function(project){
		MT.core.BasicPlugin.call(this, "HelpAndSupport");
		this.project = project;
	},
	{
		initUI: function(ui){
			var that = this;
			this.list = new MT.ui.List([
				{
					label: "About",
					className: "",
					cb: function(){
						that.openHomePage();
					}
				},
				{
					label: "Video Tutorial",
					className: "",
					cb: function(){
						that.openVideo();
					}
				},
				{
					label: "on HTML5 Game Devs Forum",
					className: "",
					cb: function(){
						that.openForum();
					}
				},
				{
					label: "google fonts",
					className: "",
					cb: function(){
						that.openFonts();
					}
				},
				{
					label: "Leshy SpriteSheet Tool",
					className: "",
					cb: function(){
						that.openLink("http://www.leshylabs.com/apps/sstool/");
					}
				},
				{
					label: "Found a bug? Report on github",
					className: "",
					cb: function(){
						that.openLink("https://github.com/TheMightyFingers/mightyeditor/issues/new");
					}
				}
			
			], ui, true);
			
			var b = this.project.panel.addButton("Help and Support", null, function(e){
				e.stopPropagation();
				that.list.show(document.body);
				
				that.list.y = b.el.offsetHeight;
				that.list.x = b.el.offsetLeft-5;
				that.list.el.style.bottom = "initial";
			});
			
			that.list.width = 300;
			
		},
		
		openForum: function(){
			//http://www.html5gamedevs.com/topic/6303-game-editor-on-phaser/
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="http://www.html5gamedevs.com/topic/6303-game-editor-on-phaser/";
		},
		
		openHomePage: function(){
			//http://mightyfingers.com/editor-features/
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="http://mightyfingers.com/editor-features/";
		},
		
		openVideo: function(){
			//https://www.youtube.com/watch?v=7dk2naCCePc
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="https://www.youtube.com/watch?v=gzGHMRx3yz0";
		},
		
		openFonts: function(){
			//https://www.youtube.com/watch?v=7dk2naCCePc
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="https://www.google.com/fonts";
		},
		
		openLink: function(link){
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href=link;
		}
	}
);

//MT/ui/Fieldset.js
MT.namespace('ui');
MT.extend("ui.DomElement")(
	MT.ui.Fieldset = function(title){
		MT.ui.DomElement.call(this, "fieldset");
		this.title = title;
	},
	{
		get title(){
			return this.title.innerHTML;
		},
		legend: null,
		set title(val){
			if(!this.legend){
				this.legend = document.createElement("legend");
				this.el.appendChild(this.legend);
			}
			if(val !== void(0) || val != ""){
				this.legend.innerHTML = val;
			}
		}
	}
);
//MT/ui/Popup.js
MT.namespace('ui');
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.Popup = function(title, content, cb){
		MT.ui.DomElement.call(this);
		this.addClass("ui-popup");
		
		this.head = document.createElement("div");
		this.head.className = "ui-popup-head";
		
		this.content = document.createElement("div");
		this.content.className = "ui-popup-content";
		
		this.el.appendChild(this.head);
		this.el.appendChild(this.content);
		
		this.head.innerHTML = title;
		this.content.innerHTML = content;
		
		this.bg = document.createElement("div");
		this.bg.className = "ui-wrapper";
		this.bg.style.zIndex = 9999;
		this.bg.onmousedown = this.bg.onmouseup = this.bg.onmousemove = function(e){
			e.preventDefault();
			e.stopPropagation();
			return false;
		};
		
		
		this.style.zIndex = 10000;
		
		this.y = window.innerHeight*0.3;
		this.style.bottom = "auto";
		
		this.addClass("ui-popup-with-head");
		
		this.show();
		
	},
	{

		showClose: function(){
			if(this.close){
				return;
			}
			this.close = document.createElement("div");
			this.close.className = "ui-popup-close";
			this.head.appendChild(this.close);
			var that = this;
			this.close.onclick = function(){
				that.hide(true);
			};
		},
		
		addButton: function(title, cb){
			if(!this.buttonBar){
				this.buttonBar = document.createElement("div");
				this.el.appendChild(this.buttonBar);
				this.buttonBar.className = "ui-button-bar";
			}
			this.buttons = this.buttons || {};
			var button = this.buttons[title] = document.createElement("div");
			button.className = "ui-popup-button";
			button.innerHTML = title;
			button.onclick = function(e){
				cb(e);
				e.stopPropagation();
			};
			
			this.buttonBar.appendChild(button);
			
			this.addClass("ui-has-buttons");
		},
		
		removeHeader: function(){
			if(this.head.parentNode){
				this.head.parentNode.removeChild(this.head);
				this.removeClass("ui-popup-with-head");
			}
		},
		
		hide: function(cancel){
			if(this.bg.parentNode){
				this.bg.parentNode.removeChild(this.bg);
			}
			if(this.el.parentNode){
				this.el.parentNode.removeChild(this.el);
			}
			
			this.emit("close", cancel);
		},
		
		show: function(){
			
			this.emit("show");
			document.body.appendChild(this.bg);
			document.body.appendChild(this.el);
		},
		
		center: function(){
			this.y = (window.innerHeight - this.height) * 0.5;
		}



	}
);
//MT/core/keys.js
MT.namespace('core');
"use strict";
MT.keys = MT.core.keys = {
	ESC: 27,
	ENTER: 13,
	UP: 38,
	LEFT: 37,
	RIGHT: 39,
	DOWN: 40,
	DELETE: 46,
	TAB: 9,
	SPACE: 32
};
// A-Z
for(var i=65; i<91; i++){
	MT.keys[String.fromCharCode(i)] = i;
}

MT.const = {
	IMAGES: "image/*",
	DATA: "application/json|application/xml",
	AUDIO: "mp3, ogg, wav"
};
//MT/plugins/list.js
MT.namespace('plugins');
MT.plugins.list = 1;

MT.require("plugins.AssetManager");
MT.require("plugins.ObjectManager");
MT.require("plugins.MapEditor");
MT.require("plugins.Settings");
MT.require("plugins.Export");
MT.require("plugins.Import");
MT.require("plugins.Tools");
MT.require("plugins.UndoRedo");
MT.require("plugins.DataLink");
MT.require("plugins.Analytics");

//MT/Socket.js
MT.namespace('');
"use strict";
MT.extend("core.Emitter")(
	MT.Socket = function(url, autoconnect){
		this.binary = false;
		if(url){
			this.url = url;
		}
		else{
			this.url = "ws://"+window.location.host+"/ws/";
		}
		
		if(autoconnect !== false){
			this.connect();
		}
		
		this.callbacks = {};
		this._toSend = [];
		
		this.sendObject = {
			channel: "",
			action: "",
			data: null,
			__cb: null
		};
	},
	{
		
		delay: 0,
		
		connect: function(url){
			if(url){
				this.url = url;
			}
			var that = this;
			
			this.ws = new WebSocket(this.url);
			this.ws.binaryType = "arraybuffer";
			
			this.ws.onopen = function(e){
				that.emit("core","open");
				that.startHeartbeat();
			};
			
			this.ws.onmessage = function (event) {
				var str;
				if( that.binary){
					str = UTF8ArrToStr(event.data);
				}
				else{
					str = event.data;
				}
				var data = JSON.parse(str);
				if(data.action === "___"){
					MT.Socket.__callbacks[data.__cb](data.data);
					delete MT.Socket.__callbacks[data.__cb];
					return;
				}
				that.emit(data.channel, data.action, data.data);
			};
			
			this.ws.onerror = function(err){
				
				console.error(err);
			};
			
			this.ws.onclose = function(){
				that.emit("core","close");
				window.setTimeout(function(){
					that.connect();
				},1000);
			};
			
			return;
		},
		lastBeat: 0,
		heartBeatInterval: 25,
		startHeartbeat: function(){
			var diff = Date.now() - this.lastBeat;
			if(diff > this.heartBeatInterval * 1000){
				this.send("HeartBeat");
			}
			
			var that = this;
			window.setTimeout(function(){
				that.startHeartbeat();
			}, (this.heartBeatInterval - diff)*1000);
		},
		send: function(channel, action, data, cb){
			if(this.ws.readyState == this.ws.OPEN){
				this.lastBeat = Date.now();
				this.sendObject.channel = channel;
				this.sendObject.action = action;
				this.sendObject.data = data;
				this.sendObject.__cb = void(0);
				
				if(cb){
					this.sendObject.__cb = MT.Socket.genCallback(cb);
				}
				
				var str = JSON.stringify(this.sendObject);
				if(this.binary){
					this.ws.send(strToUTF8Arr(str));
				}
				else{
					this.ws.send(str);
				}
				return;
			}
			
			this._toSend.push([channel, action, data]);
			if(this.delay === 0){
				var that = this;
				this.delay = window.setTimeout(function(){
					that.sendDelayed();
				}, 100);
			}
		},
		
		sendDelayed: function(){
			if(this.ws.readyState !== this.ws.OPEN){
				var that = this;
				this.delay = window.setTimeout(function(){
					that.sendDelayed();
				}, 100);
				return;
			}
			
			for(var i=0; i<this._toSend.length; i++){
				this.send.apply(this, this._toSend[i]);
			}
			
		},
   
		emit: function(type, action, data){
			if(!this.callbacks[type]){
				console.warn("received unhandled data", type, data);
				return;
			}
			var cbs = this.callbacks[type];
			for(var i=0; i<cbs.length; i++){
				cbs[i](action, data);
			}
		},
		//static
		genCallback: function(cb){
			var self = MT.Socket;
			self.nextCB++;
			self.__callbacks[self.nextCB] = cb;
			return self.nextCB;
		}
	}
);

MT.Socket.TYPE = {
	open: "open",
	close: "close",
	message: "message",
	error: "error"
};

MT.Socket.__callbacks = {};
MT.Socket.nextCB = 0;


/* UTF-8 array to DOMString and vice versa */

function UTF8ArrToStr (buff) {
	return String.fromCharCode.apply(null, new Uint8Array(buff));
}

function strToUTF8Arr (sDOMStr) {

	var aBytes, nChr, nStrLen = sDOMStr.length, nArrLen = 0;

	/* mapping... */

	for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
		nChr = sDOMStr.charCodeAt(nMapIdx);
		nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
	}

	aBytes = new Uint8Array(nArrLen);

	/* transcription... */

	for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
		nChr = sDOMStr.charCodeAt(nChrIdx);
		if (nChr < 128) {
		/* one byte */
		aBytes[nIdx++] = nChr;
		} else if (nChr < 0x800) {
		/* two bytes */
		aBytes[nIdx++] = 192 + (nChr >>> 6);
		aBytes[nIdx++] = 128 + (nChr & 63);
		} else if (nChr < 0x10000) {
		/* three bytes */
		aBytes[nIdx++] = 224 + (nChr >>> 12);
		aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
		aBytes[nIdx++] = 128 + (nChr & 63);
		} else if (nChr < 0x200000) {
		/* four bytes */
		aBytes[nIdx++] = 240 + (nChr >>> 18);
		aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
		aBytes[nIdx++] = 128 + (nChr & 63);
		} else if (nChr < 0x4000000) {
		/* five bytes */
		aBytes[nIdx++] = 248 + (nChr >>> 24);
		aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
		aBytes[nIdx++] = 128 + (nChr & 63);
		} else /* if (nChr <= 0x7fffffff) */ {
		/* six bytes */
		aBytes[nIdx++] = 252 + (nChr >>> 30);
		aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
		aBytes[nIdx++] = 128 + (nChr & 63);
		}
	}

	return aBytes;

}


//MT/ui/Controller.js
MT.namespace('ui');
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

//MT/core/Project.js
MT.namespace('core');
MT.require("plugins.list");
MT.require("core.keys");
MT.require("ui.Popup");
MT.require("ui.Fieldset");

MT.require("plugins.HelpAndSupport");
MT.require("plugins.FontManager");
MT.require("plugins.MapManager");
MT.require("plugins.SourceEditor");
MT.require("plugins.GamePreview");
MT.require("plugins.Physics");
MT.require("plugins.UserData");
MT.require("plugins.TooltipManager");
MT.require("plugins.Notification");
MT.require("plugins.MovieMaker");
MT.require("plugins.Auth");

MT.DROP = "drop";

 
MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.core.Project = function(ui, socket){
		var that = this;
		MT.core.BasicPlugin.call(this, "Project");
		this.isReady = false;
		this.data = {
			backgroundColor: "#666666",
			webGl: 1,
			sourceEditor:{
				fontSize: 12,
				autocomplete: true
			},
			timeline: {
				skipFrames: 1
			},
			roundPosition: 0
		};
		this.defaultData = JSON.stringify(this.data);
		
		window.pp = this;
		
		this.plugins = {};
		
		this.pluginsEnabled = [
			"Auth",
			"AssetManager",
			"ObjectManager",
			"MapEditor",
			"Tools",
			"Settings",
			"Export",
			//"Import",
			
			"UndoRedo",
			//"DataLink",
			"Analytics",
			"HelpAndSupport",
			"FontManager",
			"MapManager",
			"SourceEditor",
			"GamePreview",
			"Physics",
			"UserData",
			"TooltipManager",
			"Notification",
			"MovieMaker",

		];
		
		for(var id=0, i=""; id<this.pluginsEnabled.length; id++){
			i = this.pluginsEnabled[id];
			this.plugins[i.toLowerCase()] = new MT.plugins[i](this);
		}
		
		this.am = this.plugins.assetmanager;
		this.om = this.plugins.objectmanager;
		this.map = this.plugins.mapeditor;
		
		this.ui = ui;
		
		this.sub = "";
		this.prefix = "p";
		if(window.location.hostname.substring(0, 3) == "us."){
			this.sub = "us";
			this.prefix = "u";
		}
		
		this.initSocket(socket);
		this.ui.events.on("hashchange", function(){
			if(!that.preventReload){
				window.location.reload();
			}
		});
		
		

		
		/*
		 console.log("before unload added");
		window.onbeforeunload = function(e){
			console.log("load", e);
			return "Are you really want to leave MightyEditor?";
		};*/
	},
	{
		preventReload: false,
		a_maintenance: function(data){
			var seconds = data.seconds;
			var content = "System will go down for maintenance in ";
			var desc = "<p>All your current work in progress has been saved.</p><p>Please wait. Editor will reload automatically.</p>";
			
			if(data.type == "new"){
				content = "System is being maintained.";
				desc = "<p>Please wait. Editor will reload automatically.</p>";
				if(data.seconds){
					content += " Be back in ";
				}
			}
			
			if(!data.seconds){
				var pop = new MT.ui.Popup("Maintenance", content + desc);
				return;
			}
			
			var pop = new MT.ui.Popup("Maintenance", content + '<span style="color: red">' + seconds +"</span> seconds." + desc);
			
			var int = window.setInterval(function(){
				seconds--;
				if(seconds < 0){
					window.clearInterval(int);
					return;
				}
				pop.content.innerHTML = content + '<span style="color: red">' + seconds +"</span> seconds." + desc;
			}, 1000);
		},
		
		a_purchaseComplete: function(){
			var pop = new MT.ui.Popup("Payment received",
									"Thank you for supporting MightyEditor!<br />Now you can change project access options.<br />"+
									"If you don't own the current project (e.g. you have created it without being logged in) you have to make a copy of this project.<br /><br />"+
									"Reload MightyEditor to make your subscription effective.");
			pop.showClose();
			pop.addButton("Reload Now", function(){
				window.location.reload();
			});
			pop.addButton("Later", function(){
				pop.hide(true);
			});
		},
		
		a_message: function(msg){
			throw new Error(msg);
		},
		
		a_selectProject: function(info){
			this.id = info.id;
			this.preventReload = true;
			window.location.hash = info.id + "/" + info.rev;
			
			var that = this;
			window.setTimeout(function(){
				that.preventReload = false;
			}, 1000);
			
			this.path = "data/projects/" + info.id + "/" + info.rev;
			
			this.a_getProjectInfo(info);
			
			this.initUI(this.ui);
			this.initPlugins();
			
			this.setUpData();
			
			localStorage.setItem(info.id, JSON.stringify(info));
			
			if(this.copyPopup){
				this.copyPopup.hide();
				this.copyPopup = null;
			}
		},
		
		a_newProject: function(){
			this.newProject();
		},
		
		a_needUpdate: function(){
			var that = this;
			this.showProjectInfo({
				cb: function(prop){
					that.send("updateProject", prop);
				},
				title: "Update project",
				description: "Enter project title",
				button: "Upate"
			});
		},
		
		a_getProjectInfo: function(data){
			MT.core.Helper.updateObject(this.data, data);
			var that = this;
			this.send("getOwnerInfo", null, function(data){
				that.setProjectTimer(data);
			});
		},
		
		a_goToHome: function(){
			window.location = window.location.toString().split("#").shift();
		},
		
		a_copyInProgress: function(){
			var content = "System is being maintained. Will be back in ";
			var desc = "<p>Please wait. Editor will load a project automatically.</p>";
			var pop = new MT.ui.Popup("Copy in progress", desc);
			pop.showClose();
			this.copyPopup = pop;
		},
		
		a_projectHasExpired: function(){
			// reset all
			document.body.innerHTML = "";
			var pop = new MT.ui.Popup("Your project has expired", "");
			this.plugins.auth.buildGoPro(pop.content);
			var t = this;
			pop.addButton("Home", function(){
				t.a_goToHome();
			});
			pop.center();
		},
		// find broken asstes and if images matches object images
		// set Asset name to corresponding object
		// fix due to bug related to the states 
		// reported by guys from: imaginemachine.com
		renameBrokenAssets: function(){
			var atv = pp.plugins.assetmanager.tv;
			atv.items.forEach(function(ii){
				var om = pp.plugins.objectmanager;
				var objs = om.tv.items;
				
				objs.forEach(function(ob){
					if(ii.img && ob.img && ii.img.src == ob.img.src){
						atv.rename(ii, ob.data.name + "." + ii.data.__image.split(".").pop());
						var ob = map.getById(ob.data.id);
						if(ob){
							ob.assetId = ii.data.id;
						}
					}
				});
			});
		},
		
		setUpData: function(){
			document.body.style.backgroundColor = this.data.backgroundColor;
			this.emit("updateData", this.data);
		},
		
		setProjectTimer: function(data){
			if(data.level > 0){
				return;
			}
			var button = this.plugins.auth.mainButton;
			var diff = Date.now() - data.now;
			
			//var 
			button.addClass("expires");
			button.el.title = "Project will expire";
			
			this.updateExpireTime(button, data.created, diff);
		},
		
		updateExpireTime: function(button, created, off){
			
			var second = 1000;
			var minute = 60 * second;
			var hour = 60 * minute;
			var day = 24 * hour;
			
			var expire = (30 * day + (created)) - Date.now() + off;
			if(expire < 0){
				this.a_projectHasExpired();
				return;
			}
			var dd = "", hh = "", mm = "", ss = "";
			
			var days = Math.floor(expire / day);
			if(days){
				dd = days + "";
			}
			
			var hoursR = (expire - days * day)
			
			var hours = Math.floor(hoursR / hour);
			
			hh = hours+"";
			while(hh.length < 2){
				hh = "0"+hh;
			}
			
			var minutesR = (hoursR - hours * hour);
			var minutes = Math.floor(minutesR / minute);
			mm = minutes + "";
			while(mm.length < 2){
				mm = "0"+mm;
			}
			
			
			var secondsR = (minutesR - minutes * minute);
			var seconds = Math.floor(secondsR / second);
			ss = seconds + "";
			while(ss.length < 2){
				ss = "0"+ss;
			}
			
			var ds = dd ? dd + "d" : "";
			button.el.setAttribute("data-expires", ds + " " + hh + ":" + mm + ":" + ss);
			
			var that = this;
			window.setTimeout(function(){
				that.updateExpireTime(button, created, off);
			}, 1000);
		},
		
		copyPopup: null,
		
		reload: function(){
			window.location.reload();
		},
		// user gets here without hash
		_newPop: null,
		newProject: function(){
			if(this._newPop){
				this._newPop.show();
				return;
			}
			if(!this.id){
				// enable Analytics
				this.plugins.analytics.installUI(this.ui);
			}
			
			var that = this;
			var pop = new MT.ui.Popup("Welcome to MightyEditor", "");
			pop.y = (window.innerHeight - 510)*0.45;
			//pop.showClose();
			pop.bg.style.backgroundColor = "rgba(10,10,10,0.3)";
			pop.addClass("starting-popup");
			
			var logo = document.createElement("div");
			logo.className = "logo";
			pop.content.appendChild(logo);
			
			var that = this;
			var newProject = new MT.ui.Button("Create New Project", "new-project", null, function(){
				that.newProjectNext();
				pop.off();
				pop.hide();
			});
			
			var docs = new MT.ui.Button("About MightyEditor","docs", null, function(){
				//http://mightyfingers.com/editor-features/
				var w = window.open("about:blank","_newTab");
				w.opener=null; w.location.href="http://mightyfingers.com/editor-features/";
			});
			
			newProject.show(pop.content);
			docs.show(pop.content)
			
			var recentPanel = this.ui.createPanel("Recent Projects");
			recentPanel.hide();
			recentPanel.fitIn();
			recentPanel.removeBorder();
			
			//recentPanel.show(pop.content);
			
			var projects = document.createElement("div");
			pop.content.appendChild(projects);
			projects.innerHTML = '<span class="label">Recent Projects</span>';
			projects.className = "project-list";
			
			recentPanel.show(projects);
			
			var tmp = null;
			var items = this.getLocalProjects();
			var list = this.makeProjectList(items);
			
			if(items.length == 0 && this.sub != ""){
				list.innerHTML = '<p>If you can\'t see you recent projects - try to click <a href="http://mightyeditor.mightyfingers.com/#no-redirect">here</a></p>';
			}
			
			recentPanel.content.el.appendChild(list);
			
			// enable Auth
			if(!this.id){
				this.plugins.auth.installUI(this.ui);
				this.plugins.auth.show(recentPanel, true);
				pop.on("close", function(){
					that.newProjectNext();
				});
			}
			else{
				this.plugins.auth.show(recentPanel, true);
				pop.showClose();
			}
			
			this._newPop = pop;
		},
		
		getLocalProjects: function(){
			var items = [];
			for(var i=0; i<localStorage.length; i++){
				key = localStorage.key(i);
				if(key.substring(0, this.prefix.length) == this.prefix){
					tmp = JSON.parse(localStorage.getItem(key));
					if(tmp.id){
						items.push(tmp);
					}
					else{
						items.push({
							id: key,
							title: key
						});
					}
				}
			}
			return items;
		},
		
		makeProjectList: function(items, ondelete, onclick){
			var list = document.createElement("div");
			list.className = "list-content";
			
			var p, del;
			for(var i=0; i<items.length; i++){
				p = document.createElement("div");
				p.className = "projectItem";
				if(items[i].id != items[i].title){
					p.innerHTML = items[i].title + " ("+items[i].id+") <span class=\"remove\"></span>";
				}
				else{
					p.innerHTML = items[i].title +" <span class=\"remove\"></span>";
				}
				p.project = items[i].id;
				p.item = items[i];
				
				
				list.appendChild(p);
			}
			
			var removeItem = function(e){
				localStorage.removeItem(e.target.parentNode.project);
				e.target.parentNode.parentNode.removeChild(e.target.parentNode);
			};
			
			list.onclick = function(e){
				if(e.target.className == "remove"){
					if(ondelete){
						ondelete(e.target.parentNode, function(remove){
							if(remove){
								removeItem(e);
							}
						});
					}
					else{
						removeItem(e);
					}
					return;
				}
				if(e.target.project){
					if(onclick){
						onclick(e.target, function(remove){
							if(remove){
								removeItem(e);
							}
						});
					}
					else{
						e.preventDefault();
						window.location.hash = e.target.project;
					}
				}
			};
			return list;
		},
		
		updateProject: function(cb){
			var that = this;
			this.showProjectInfo({
				cb: function(prop){
					that.send("updateProject", prop);
					if(cb){cb(prop);}
				},
				title: "Update project",
				desc: "please review project details and update uproject",
				button: "Update",
				showNamespace: false,
				props: that.data,
				hideNS: true
			});
		},
		
		newProjectNext: function(){
			var that = this;
			this.showProjectInfo({
				cb: function(prop){
					that.send("newProject", prop);
				},
				title: "New Project",
				button: "Create"
			});
		},
		
		showProjectInfo: function(options){
			
			var that = this;
			var pop = new MT.ui.Popup(options.title || "New Project", "");
			pop.removeHeader();
			
			pop.el.style.width = "50%";
			pop.el.style.height= "40%";
			pop.el.style["min-height"] = "200px"
			pop.el.style.top= "20%";
			
			
			var p = new MT.ui.Panel(options.title || "New Project");
			//p.removeHeader()
			
			p.hide().show(pop.content).fitIn();
			p.removeBorder();
			
			var cont = document.createElement("div");
			cont.innerHTML = options.desc || "Enter project title";
			cont.style.margin = "20px 10px";
			p.content.el.appendChild(cont);
			
			if(options.props){
				options.props.title = options.props.title || "New Game";
				options.props.namespace = options.props.namespace || "NewGame";
				options.props.package = options.props.package || "com."+this.getPackageName()+".newgame";
				
				var parts = options.props.package.split(".");
				var val = parts.pop();
				options.props.package = (parts.join(".") + "." + options.props.namespace.replace(/\W/g, '').toLowerCase());
			}
			var prop = options.props || {
				title: "New Game",
				namespace: "NewGame",
				package: "com."+this.getPackageName()+".newgame"
			};
			
			
			
			var iName = new MT.ui.Input(this.ui, {key: "title", type: "text"}, prop);
			var iNs;
			
			if(!options.hideNS){
				var iNs = new MT.ui.Input(this.ui, {key: "namespace", type: "text"}, prop);
			}
			
			var iPac = new MT.ui.Input(this.ui, {key: "package", type: "text"}, prop);
			
			iName.show(p.content.el);
			
			if(!options.hideNS){
				iNs.show(p.content.el);
			}
			
			iPac.show(p.content.el);
			
			
			iName.enableInput();
			iName.on("change", function(n, o){
				var strip = n.replace(/\W/g, '');
				
				if(!options.hideNS){
					iNs.setValue(strip);
				}
				
				var parts = prop.package.split(".");
				var val = parts.pop();
				iPac.setValue(parts.join(".") + "." + n.replace(/\W/g, '').toLowerCase());
			});
			
			
			pop.addButton(options.button || "Create", function(){
				options.cb(prop);
				pop.hide();
			});
		},
		
		loadProject: function(pid){
			this.send("loadProject", pid);
		},
		
		initUI: function(ui){
			var that = this;
			
			this.ui = ui;
			this.panel = ui.createPanel("Project");
			this.panel.height = 29;
			this.panel.removeHeader();
			this.panel.isDockable = true;
			this.panel.addClass("top");
			
			ui.dockToTop(this.panel);
			this.createSettings();
			
			this.panel.addButton(null, "logo",  function(e){
				window.location = window.location.toString().split("#")[0];
				//that.setPop.show();
			});
			
			/* TODO: move to config */
			
			
			this.list = new MT.ui.List([
				{
					label: "Save",
					className: "",
					cb: function(){
						that.send("saveState");
						that.list.hide();
						that.plugins.notification.show("Saved", "...", 1000);
					}
				},
				{
					label: "Save As...",
					className: "",
					cb: function(){
						that.saveAs();
						that.list.hide();
					}
				},
				{
					label: "Clone (eu)",
					className: "",
					cb: function(){
						that.clone();
					}
				},
				{
					label: "Clone (us)",
					className: "",
					cb: function(){
						that.clone(true);
					}
				}
			], ui, true);
			
			var b = this.button = this.panel.addButton("Project", null, function(e){
				e.stopPropagation();
				that.showList();
			});
			
		},
		
		saveAs: function(){
			var pop = new MT.ui.Popup("Save project state", "");
			pop.showClose();
			var that = this;
			
			var d = {name: ""};
			var inp = new MT.ui.Input(this.ui, {key: "name", type: "text", placeholder: "name"}, d, function(){
				
			});
			inp.addClass("full-size");
			inp.show(pop.content);
			inp.enableInput();
			inp.input.setAttribute("placeholder", "name");
			
			pop.addButton("Save", function(){
				that.send("saveState", d.name);
				that.plugins.notification.show("Saved", d.name, 1000);
				pop.hide();
			});
			
			pop.addButton("Cancel", function(){
				pop.hide();
			});
		},
		
		clone: function(us){
			var that = this;
			this.send("allowTmpCopy", null, function(allow){
				if(!allow){
					that.plugins.notification.show("Project copy", "access denied", 1000);
					return;
				}
				
				if(that.sub == "" && !us){
					window.location = window.location.toString()+"-copy";
					return;
				}
				if(that.sub == "us" && us){
					window.location = window.location.toString()+"-copy";
					return;
				}
				
				// alien servers
				// eu -> us
				if(that.sub == "" && us){
					
					var loc = window.location.toString()+"-copy";
					loc = loc.replace("://", "://us.");
					
					window.location = loc;
					return;
				}
				// us -> eu
				if(that.sub == "us" && !us){
					
					var loc = window.location.toString()+"-copy";
					loc = loc.replace("://us.", "://");
					
					window.location = loc;
					return;
				}
			});
		},
		getPackageName: function(){
			var dom = window.location.hostname.split(".").shift();
			var tmpProp = "me"+ dom.substring(0, 2);
			if(this.plugins.auth.userId){
				tmpProp += this.plugins.auth.userId;
			}
			else{
				tmpProp += Math.floor(Math.random()*1000);
			}
			
			return tmpProp;
		},
		createSettings: function(){
			var that = this;
			if(this.data.sourceEditor.autocomplete === void(0)){
				this.data.sourceEditor.autocomplete = 1;
			}
			
			if(!this.data.package){
				this.data.package = ("com."+this.getPackageName()+"." + this.data.namespace.replace(/\W/g, '').toLowerCase());
			}
			
			this.setInputs = {
				label: new MT.ui.Input(this.ui, {key: "title", type: "text"}, this.data),
				package: new MT.ui.Input(this.ui, {key: "package", type: "text"}, this.data),
				bgColor: new MT.ui.Input(this.ui, {key: "backgroundColor", type: "color"}, this.data),
				webGl: new MT.ui.Input(this.ui, {key: "webGl", type: "bool"}, this.data),
				srcEdFontSize: new MT.ui.Input(this.ui, {key: "fontSize", type: "number"}, this.data.sourceEditor),
				autocomplete: new MT.ui.Input(this.ui, {key: "autocomplete", type: "bool"}, this.data.sourceEditor),
													 
				skipFrames: new MT.ui.Input(this.ui, {key: "skipFrames", type: "bool"}, this.data.timeline),
				roundPosition: new MT.ui.Input(this.ui, {key: "roundPosition", type: "bool"}, this.data)
			};
			
			
			this.setInputs.bgColor.on("change", function(val){
				document.body.style.backgroundColor = val;
			});
			
			this.setInputs.srcEdFontSize.on("change", function(val){
				that.setUpData();
			});
			
			
			this.setFields = {
				project: new MT.ui.Fieldset("Project"),
				ui: new MT.ui.Fieldset("UI"),
				sourceEditor: new MT.ui.Fieldset("SourceEditor"),
				timeline: new MT.ui.Fieldset("Timeline"),
				misc: new MT.ui.Fieldset("Misc")
			};
			
			
			
			this.setPanel = new MT.ui.Panel("Properties");
			this.setPanel.removeBorder();
			this.setPanel.fitIn();
			
			MT.ui.addClass(this.setPanel.el, "editor-settings");
			
			this.setPanel.on("show", function(){
				lastData = JSON.stringify(that.data);
			});
			
			this.setButtons = {
				resetLayout: new MT.ui.Button("Reset Layout", "", null, function(){
					that.ui.resetLayout();
				}),
				reset: new MT.ui.Button("Reset", "", null, function(){
					MT.core.Helper.updateObject(that.data, JSON.parse(that.defaultData));
					that.send("saveProjectInfo", that.data);
					that.emit("updateData", that.data);
					that.setUpData();
					
					for(var i in that.setInputs){
						that.setInputs[i].update();
					}
					
				}),
				
				cancel: new MT.ui.Button("Cancel", "", null, function(){
					
					that.data = JSON.parse(lastData);
					that.setInputs.bgColor.setValue(that.data.backgroundColor);
					that.setInputs.srcEdFontSize.setValue(that.data.sourceEditor.fontSize);
					that.setUpData();
				})
			};
			
			this.setInputs.label.show(this.setFields.project.el);
			this.setInputs.package.show(this.setFields.project.el);
			
			this.setInputs.bgColor.show(this.setFields.ui.el);
			this.setInputs.webGl.show(this.setFields.ui.el);
			
			this.setButtons.resetLayout.show(this.setFields.ui.el);
			
			this.setInputs.srcEdFontSize.show(this.setFields.sourceEditor.el);
			this.setInputs.autocomplete.show(this.setFields.sourceEditor.el);
			
			this.setInputs.skipFrames.show(this.setFields.timeline.el);
			this.setInputs.roundPosition.show(this.setFields.misc.el);
			
			
			for(var i in this.setFields){
				this.setPanel.content.el.appendChild(this.setFields[i].el);
				this.setFields[i].addClass("full");
			}
			
			this.setPanel.content.el.appendChild(this.setButtons.reset.el);
			//this.setPanel.content.el.appendChild(this.setButtons.cancel.el);
			
			
			var that = this;
			
			
			var statePanel = new MT.ui.Panel("Saved states");
			statePanel.fitIn();
			this.plugins.auth.on("showProperties", function(panel){
				panel.addJoint(that.setPanel);
				lastData = JSON.stringify(that.data);
				
				panel.addJoint(statePanel);
				that.send("getSavedStates", null, function(states){
					for(var i=0; i<states.length; i++){
						states[i].title = states[i].name;
						states[i].id = states[i].date;
					}
					
					var list = that.makeProjectList(states, function(item, remove){
						console.log("DELETE:", item);
						that.send("removeState", item.item.name);
						remove(true);
					}, function(item, remove){
						console.log("LOAD:", item);
						that.send("loadState", item.item.name, function(){
							window.location.hash = that.id + "/0";
							window.location.reload();
						});
					});
					statePanel.content.el.innerHTML = "";
					statePanel.content.el.appendChild(list);
				});
				
			});
			
			this.plugins.auth.on("hideProperties", function(){
				that.send("saveProjectInfo", that.data);
				that.emit("updateData", that.data);
				that.setUpData();
			});
			
		},
		
		showList: function(){
			this.list.width = 150;
			this.list.y = this.button.el.offsetHeight;
			this.list.x = this.button.el.offsetLeft-5;
			this.list.el.style.bottom = "initial";
			this.list.show(document.body);
		},
		
		initPlugins: function(){
			
			for(var i in this.plugins){
				if(this.plugins[i].initSocket){
					this.plugins[i].initSocket(this.socket);
				}
			}
			
			for(var i in this.plugins){
				this.plugins[i].initUI(this.ui);
			}
			
			for(var i in this.plugins){
				if(this.plugins[i].installUI){
					this.plugins[i].installUI(this.ui);
				}
			}
			
			var that = this;
			var lastTarget = null;
			var className = "ui-dragover";
			
			this.ui.events.on("dragover", function(e){
				if(lastTarget){
					MT.ui.removeClass(lastTarget, className);
				}
				MT.ui.addClass(e.target, className);
				lastTarget = e.target;
			});
			
			var removeClass = function(){
				if(!lastTarget){
					return;
				}
				MT.ui.removeClass(lastTarget, className);
				lastTarget = null;
			};
			
			this.ui.events.on("dragend", removeClass);
			this.ui.events.on("dragleave", removeClass);
			this.ui.events.on(this.ui.events.DROP, function(e){
				that.handleDrop(e);
				removeClass();
			});
			
			this.ui.loadLayout();
			this.ui.isSaveAllowed = true;
			this.isReady = true;
		},
		
		addPlugin: function(name){
			MT.require("plugins."+name);
			var that = this;
			MT.onReady(function(){
				that.initPlugin(name);
			});
		},
		
		initPlugin: function(name){
			var p = new MT.plugins[name](this);
			this.plugins[name.toLowerCase()] = p;
			
			p.initSocket(this.socket);
			p.initUI(this.ui);
			p.installUI(this.ui);
		},
		
		handleDrop: function(e){
			var files = e.dataTransfer.files;
			this.handleFiles(files, e.dataTransfer, e);
		},
		
		handleFiles: function(files, dataTransfer, e){
			for(var i=0; i<files.length; i++){
				//chrome
				if(dataTransfer){
					entry = (dataTransfer.items[i].getAsEntry ? dataTransfer.items[i].getAsEntry() : dataTransfer.items[i].webkitGetAsEntry());
					this.handleEntry(entry, e);
				}
				//ff
				else{
					this.handleFile(files.item(i), e);
				}
			}
		},
		
		handleEntry: function(entry, e){
			var that = this;
			
			if (entry.isFile) {
				entry.file(function(file){
					that.readFile(file, entry.fullPath, e);
				});
			}
			else if (entry.isDirectory) {
				this.send("newFolder", entry.fullPath);
				
				var reader = entry.createReader();
				reader.readEntries(function(ev){
					for(var i=0; i<ev.length; i++){
						that.handleEntry(ev[i], e);
					}
				});
			}
		},
		
		handleFile: function(file){
			
		},
		
		readFile: function(file, path, e){
			var that = this;
			var fr  = new FileReader();
			fr.onload = function(){
				
				that.emit(MT.DROP, e, {
					src: fr.result,
					path: path
				});
			};
			fr.readAsArrayBuffer(file);
		},
		
		isAction: function(name){
			if(name.indexOf("need-login") === 0){
				if(!this.plugins.auth.isLogged){
					var that = this;
					window.setTimeout(function(){
						//
						that.plugins.auth.a_login(function(){
							window.close();
						});
					}, 0);
				}
				else{
					var redirect = name.substring(("need-login-").length);
					if(redirect){
						window.location.href = redirect;
					}
					else{
						window.close();
					}
				}
			}
			
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
			var that = this;
			var pid = window.location.hash.substring(1);
			var load = !(pid == "" || pid == "no-redirect");
			
			this.plugins.auth.initSocket(socket, function(loggedIn){
				if(that.isAction(pid)){
					return;
				}
				else if(load){
					that.loadProject(pid);
				}
			});
			
			if(!load){
				that.newProject();
				this.isReady = true;
			}
			
			this.plugins.auth.installUI(this.ui);
			this.plugins.auth.standAlone = true;
		}
	}
);

(function(window){
	"use strict";
	window.MT = createClass("MT");
	var hostInInterest = "tools.mightyfingers.com";
	if(window.release){
		hostInInterest = "mightyeditor.mightyfingers.com";
	}

	// hack for minimiser
	if(typeof document != "undefined"){
		var loading = document.createElement("div");
		loading.className = "loading";
		window.showLoading = function(){
			document.body.className = "login";
			document.body.appendChild(loading);
		};
		window.hideLoading = function(){
			document.body.className = "";
			if(loading.parentNode){
				loading.parentNode.removeChild(loading);
			}
		};
	}
	if(!window || !window.location) {
		load();
		return;
	}
		// -copy etc
	if(window.location.hash.indexOf("-") > 0){
		load();
		return;
	}

	// check if we need to redirect
	if(window.location.host == hostInInterest){
		if(window.location.hash == "" || window.location.hash.substring(1, 2) == "u"){
			var cb = function(obj, req){
				if(req.status != 202 && req.status != 200){
					load();
					return;
				}
				var parsed = JSON.parse(obj);
				if(parsed.continent_code == "NA"){
					window.location.host = "us."+window.location.host;
				}
				else{
					load();
				}
			};
			MT.loader.get("/geoip", cb);
		}
		else{
			load();
		}
	}
	else if(window.location.hash.substring(1,2) == "p" && window.location.host.substring(0, 3) == "us."){
		window.location.host = window.location.host.substring(3);
	}
	else{
		load();
	}
	var img;
	function main(){
		var socket = new MT.Socket();
		var hasClosed = false;
		var loaded = false;
		socket.on("core", function(type){
			if(type == "open"){
				if(hasClosed){
					window.location.reload();
					return;
				}
				window.hideLoading();
				new MT.core.Project(new MT.ui.Controller(), socket);
			}
			if(type == "close" && hasClosed === false){
				document.body.innerHTML = "";
				hasClosed = true;
				MT.core.Project.a_maintenance({type: "new"});
			}
		});
	}
	function load(){
		MT.require("core.Project");
		MT.require("ui.Controller");
		MT.require("Socket");
		MT.onReady(main);
		if(window.showLoading){
			window.showLoading();
		}
	};
})(window);
