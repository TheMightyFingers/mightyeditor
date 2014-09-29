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
		/*this.el.onmousemove = function(e){
			console.log("clicked", e.target.style.backgroundColor);
			if(e.target.color){
				that.emit("hover", e.target.color);
			}
		};*/
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
			this.button = this.tools.panel.addButton("", "tool."+this.name, function(){
				that.tools.setTool(that);
			});
			
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
				
				if(list.el.offsetTop + list.panel.content.el.offsetHeight > window.innerHeight){
					list.style.top = (b.top - list.panel.content.el.offsetHeight)+"px";
				}
				if(options.listStyle){
					list.width = options.listStyle.width;
				}
				
			});
			
			list.on("hide", function(){
				that.hide();
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
			mdown = false;
			that.isBase = false;
			that.baseHandle.reset();
			that.handleX.reset();
			that.handleY.reset();
			that.input.focus();
		});
		
		
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
			console.log(key);
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
			console.log(bounds);
			
			var style = window.getComputedStyle(this.el);
			for(var i in style){
				this.input.style[i] = style[i];
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
			});
			
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
			
			this.tools.on(MT.ASSET_SELECTED, function(asset){
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
				
				p = new MT.ui.Panel(images[id].name);
				p.fitIn();
				p.addClass("borderless");
				
				if(pp){
					p.addJoint(pp);
				}
				
				this.createImage(p, images[id]);
				this.panels[id] = p;
				pp = p;
			}
			
			if(pp){
				this.activePanel = pp;
				pp.show(this.panel.content.el);
			}
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
			
			for(var i = imgData.frameWidth; i<image.width; i += imgData.frameWidth + imgData.spacing){
				ctx.moveTo(imgData.margin + i+0.5, imgData.margin);
				ctx.lineTo(i+0.5, image.height);
			}
			for(var i = imgData.frameHeight; i<image.height; i += imgData.frameHeight + imgData.spacing){
				ctx.moveTo(imgData.margin + 0, imgData.margin + i+0.5);
				ctx.lineTo(image.width, i+0.5);
			}
			ctx.stroke();
			
			
			
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			
			tx = that.getTileX(this.start, widthInTiles);
			ty = that.getTileY(this.start, widthInTiles);
			
			this.selection.clear();
			
			if(this.start == this.stop){
				
				ctx.fillRect(imgData.margin + imgData.frameWidth * tx + tx * imgData.spacing + 0.5,
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
							imgData.frameHeight * j + j * imgData.spacing + 0.5,
							imgData.frameWidth + 0.5,
							imgData.frameHeight + 0.5
						);
						this.selection.add({x: i, y: j, dx: i-startx, dy: j-starty});
					}
				}
			}
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
		
		getTile: function(x, y, image, imageData){
			var tx = (x + imageData.margin - imageData.spacing) / (imageData.frameWidth + imageData.spacing ) | 0;
			var ty = (y + imageData.margin - imageData.spacing) / (imageData.frameHeight + imageData.spacing ) | 0;
			return this.getId(tx, ty, image, imageData);
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
			var p = this.active.getTileXY(x, y, {});
			
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
			//layer.tilemap.putTile(id, x, y, layer.object);
		},
		
		oldSettings: {},
		init: function(){
			this.active = this.tools.map.activeObject;
			if(!this.active){
				this.tools.setTool(this.tools.tools.select);
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
				this.tools.setTool(this.oldSettings.activeTool);
			}
			else{
				this.tools.setTool(this.tools.tools.select);
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
		
		update: function(){
			var images = this.tools.project.plugins.assetmanager.list;
			if(this.active){
				this.createPanels(images);
			}
			if(this.activePanel){
				this.drawImage(this.activePanel);
			}
		},
		
		
		updateLayer: function(mo){
			
			this.active = mo;
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
				//addTilesetImage(tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) → {Phaser.Tileset}
				tilesetImage = map.addTilesetImage(image.id, image.id, image.frameWidth, image.frameHeight, image.margin, image.spacing, nextId);
				nextId += tilesetImage.total;
			}
			
			var tiles = data.tiles;
			for(var y in tiles){
				for(var x in tiles[y]){
					if(tiles[y][x] >= nextId){
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
		
		this.manager = this.tools.project.plugins.fontmanager;
		
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
					width: 50
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
			
			
			this.textArea = document.createElement("textarea");
			this.textPopup.content.appendChild(this.textArea);
			this.textArea.style.width = "100%";
			this.textArea.style.height = "200px";
			
			this.textPopup.addButton("Done", function(){
				that.setText(that.textArea.value);
				that.textPopup.hide();
			});
			
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
			//console.log("TEXT:: change", e);
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
					//this._setFontFamily(o);
					
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
		
		setFontFamily: function(fontFamily){
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
						that.updateTextObjects(fontFamily);
					}, 1000);
				});
				return;
			}
			
			
			
			this.map = this.tools.map;
			if(!obj){
				return;
			}
			this._setFontFamily(obj, fontFamily);
			obj.object.dirty = true;
			this.select(obj);
			
			return;
			
			this.tester.style.font = obj.font || obj.style.font;
			this.tester.style.fontFamily = fontFamily;
			
			
			
			var font = this.tester.style.fontFamily;
			font = font.replace(/'/gi, "");
			
			this.fontFace.button.style.fontFamily = font;
			obj.font = font;
			if(this.tester.style.fontSize){
				obj.fontSize = this.tester.style.fontSize;
			}
			
			this._setFontFamily(obj);
			
			this.select(obj);
			obj.object.dirty = true;
		},
		
		setFontSize: function(size){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			var obj = this.map.activeObject;
			
			this.tester.style.font = obj.font || obj.style.font;
			
			
			//this._setFontFamily(obj);
			this.tester.style.fontSize = size;
			
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
		
		_setFontFamily: function(obj, fontFamily){
			obj = obj || this.map.activeObject;
			
			this.tester.style.font = obj.style.font;
			this.tester.style.fontFamily = fontFamily;
			
			obj.fontFamily = this.tester.style.fontFamily.replace(/'/gi,"");
			obj.fontWeight = this.tester.style.fontWeight.replace(/normal/gi,'');
			if(this.tester.style.fontStyle == "italic"){
				obj.fontWeight += " "+this.tester.style.fontStyle.replace(/normal/gi,"");;
			}
			obj.fontSize = parseInt(this.tester.style.fontSize);
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
			//console.log("mouse down");
		},
		
		mouseUp: function(e){
			//this.tools.tools.select.mouseUp(e);
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
				
				that.tools.initTmpObject(that.tools.activeAsset);
				that.tools.tmpObject.frame = that.tools.activeFrame;
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
			om.insertObject(JSON.parse(JSON.stringify(this.tools.tmpObject.data)));
			
			this.lastX = this.tools.tmpObject.x;
			this.lastY = this.tools.tmpObject.y;
			this.tools.initTmpObject();
			
			this.tools.tmpObject.frame = this.tools.activeFrame;
			this.tools.tmpObject.x = this.lastX;
			this.tools.tmpObject.y = this.lastY;
			this.tools.tmpObject.object.bringToTop();
		},
		
		mouseUp: function(e){
			//console.log("upp", e);
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
			});
			
			this.tools.on(MT.ASSET_FRAME_CHANGED, function(asset, frame){
				if(that.tools.activeTool != that){
					return;
				}
				
				that.tools.initTmpObject(that.tools.activeAsset);
				that.tools.tmpObject.frame = frame;
			});
			
			this.tools.on(MT.TOOL_SELECTED, function(){
				if(that.tools.activeTool != that){
					return;
				}
			});
		},
		
		init: function(asset){
			
			this.map = this.tools.map;
			this.tools.unselectObjects();
			
			asset = asset || this.tools.activeAsset;
			
			this.map.handleMouseMove = this.map._followMouse;
			
			if(!asset || asset.contents){
				return;
			}
			this.tools.initTmpObject(asset);
			this.tools.tmpObject.frame = this.tools.activeFrame;
			
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
			
			var newObj = om.insertObject(JSON.parse(JSON.stringify(this.tools.tmpObject.data)));
			
			this.tools.initTmpObject();
			this.tools.tmpObject.frame = this.tools.activeFrame;
			
			this.tools.tmpObject.x = newObj.x;
			this.tools.tmpObject.y = newObj.y;
			
			
			this.tools.tmpObject.object.bringToTop();
			
			//this.tools.unselectObjects();
		},
		
		mouseUp: function(e){
			//console.log("upp", e);
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
		init: function(){
			this.mDown = false;
			this.map.handleMouseMove = this.mouseMoveFree;
		},
		
		deactivate: function(){
			this.mDown = false;
			this.map.handleMouseMove = this.mouseMoveFree;
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
			
			obj.mouseMove(x, y, e);
			return;
			
			
			if(this.ui.events.mouse.down && self.activeState != self.states.NONE){
				self.resizeObject(this.activeObject, this.ui.events.mouse);
				return;
			}
			
			var type = this.activeObject.data.type;
			
			var obj = this.activeObject;
			var scale = this.game.camera.scale.x;
			var x = e.x - this.ox;
			var y = e.y - this.oy;
			
			if(this.tools.activeTool !== self){
				this.tools.mouseMove(e);
			}
		},
		
		mouseMove: function(e){
			/*if(this.map.activeObject){
				var x = e.x - this.map.ox;
				var y = e.y - this.map.oy;
				
				this.map.activeObject.mouseMove(x, y, e);
				return;
			}*/
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
			
			var that = this;
			
			this.map.updateMouseInfo(e);
			
			this.map.handleMouseMove = function(e){
				that.map.handleMouseMove = that.map._objectMove;
			}
			
			
			if(e.altKey){
				var copy = [];
				var sel = this.map.selector;
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
					sprite.updateTransform();
					
					bounds = sprite.getBounds();
					data[i].x = bounds.x + cx;
					data[i].y = bounds.y + cy;
					
					sel.add(sprite);
				}
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
			this.mDown = false;
			var x = e.x - this.map.offsetXCam;
			var y = e.y - this.map.offsetYCam;
			
			var map = this.tools.map;
			
			map.selectRect(map.selection);
			
			map.selection.width = 0;
			map.selection.height = 0;
			
			if(this.map.activeObject){
				this.map.activeObject.mouseUp(e.x - this.map.ox, e.y - this.map.oy, e);
				//this.initMove(e);
				//return;
			}
			
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
				console.log(this.map.selector.count);
				this.map.activeObject = null;
				this.map.emit("select", this.map.settings);
				this.initMove(e);
			}
			
			
			
			return;
			
			
			
			
			
			var that = this;
			var shift = (e.shiftKey ? true : false);
			
		
			
			var obj = this.map.pickObject(x, y);
			var group = this.map.pickGroup(x, y);
			
			if(group && (this.map.selector.is(group) || group == this.map.activeObject) ){
				this.initMove(e);
				return;
			}
			
			if(obj){
				if(!shift){
					if(this.map.selector.is(obj)){
						this.initMove(e);
					}
					else{
						if(this.map.selector.is(obj)){
							this.initMove(e);
						}
						this.select(obj);
						this.initMove(e);
					}
				}
				else{
					this.select(obj);
				}
			}
			else{
				
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
		
		this.setAbsolute();
		this.addClass("ui-list");
		
		this.panel = new MT.ui.Panel("", ui.events);
		this.panel.removeHeader();
		
		
		this.panel.content.style.overflow = "initial";
		this.panel.style.position = "relative";
		this.panel.show(this.el);
		
		
		this.panel.content.style.position = "relative";
		var that = this;
		
		ui.events.on("mouseup", function(e){
			for(var i=0; i<that.panel.buttons.length; i++){
				if(that.panel.buttons[i].el == e.target){
					return;
				}
			}
			if(that.isVisible && autohide){
				that.hide();
			}
		});
		
		this.isVisible = false;
		this.list = list;
		this.update();
		
		this.addChild(this.panel).show();
	},
	{
		update: function(){
			//this.clear();
			while(this._items.length){
				this._items.pop().remove();
			}
			for(var i=0; i<this.list.length; i++){
				this.addItem(this.list[i]);
			}
		},
		
		addItem: function(item){
			if(item.check && !item.check()){
				return;
			}
			
			var b = this.panel.addButton(item.label, item.className, item.cb);
			b.style.position = "relative";
			b.addClass("ui-list-button");
			
			if(item.create){
				item.create(b);
			}
			this._items.push(b);
		},
		
		show: function(parent){
			if(this.isVisible){
				return;
			}
			this.update();
			this.isVisible = true;
			MT.ui.DomElement.show.call(this, parent);
			this.emit("show");
		},
		
		hide: function(){
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

MT.require("ui.ColorPicker");
MT.extend("ui.DomElement").extend("core.Emitter")(
	MT.ui.Input = function(ui, properties, obj){
		var events = ui.events;
		MT.ui.DomElement.call(this);
		MT.core.Emitter.call(this);
		
		
		this.object = obj;
		this.key = "";
		this.step = 1;
		
		this.min = -Infinity;
		this.max = Infinity;
		
		this.type = "number";
		
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
		//this.label.setAbsolute();
		
		this.addChild(this.label).show();
		
		
		
		
		this.input = document.createElement("input");
		this.addClass("ui-input");
		
		
		this.label.el.innerHTML = this.key;
		this.label.style.bottom = "initial";
		this.label.style.right = "50%";
		
		
		this.value = new MT.ui.DomElement("a");
		//this.value.setAbsolute();
		
		
		var that = this;
		if(this.type == "upload"){
			this.input.type = "file";
			this.addClass("upload");
			if(properties.accept){
				this.input.setAttribute("accept", properties.accept);
			}
			this.input.onchange = function(e){
				that.emit("change", e, that.object);
			};
			
			this.label.style.right = "0";
			this.label.el.onclick = function(e){
				that.input.click();
			};
			if(this.object[this.key] !== void(0)){
				this.setValue(this.object[this.key], true);
				this.addChild(this.value).show();
				this.value.style.bottom = "initial";
				this.value.style.left = "initial";
				this.value.style.right = 0;
				this.value.addClass("ui-input-value");
			}
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
		
		
		var input = document.createElement("input");
		//input.style.position = "absolute";
		input.type = "text";
		input.className = "ui-input";
		input.isVisible = false;
		input.style.textAlign = "right";
		input.style.paddingRight = "10px";
		
		input.setAttribute("tabindex", parseInt(this.value.el.getAttribute("tabindex")) +1);
		//input.setAttribute("tabstop", "false");
		
		var enableInput = function(){
			var w = that.value.el.parentNode.parentNode.offsetWidth*0.5;
			input.style.width = w + "px";
			
			input.style.top = ( that.value.calcOffsetY(that.value.el.offsetParent) - 9 ) + "px";
			input.style.left = ( that.value.calcOffsetX(that.value.el.offsetParent) - w + that.value.el.offsetWidth - 25) + "px";
			input.value = that.object[that.key];
			
			input.isVisible = true;
			input.width = that.value.offsetWidth + "px";
			
			
			that.value.el.innerHTML = "";
			
			that.value.el.offsetParent.appendChild(input);
			input.focus();
			if(input.type != "color"){
				input.setSelectionRange(0, input.value.length);
			}
		};
		
		this.value.el.onkeydown = function(){
			enableInput();
		};
		
		this.value.el.setAttribute("draggable", "false");
		
		//this.value.el.onfocus = enableInput;
		this.value.el.onmouseup = function(){
			if(that.needEnalbe){
				enableInput();
			}
		}
		this.enableInput = function(){
			enableInput();
		};
		var down = false;
		this.value.el.onmousedown = function(){
			that.needEnalbe = true;
			down = true;
		};
		
		
		var startVal;
		input.onfocus = function(){
			startVal = that.object[that.key];
		};
		
		input.onblur = function(){
			input.parentNode.removeChild(input);
			input.isVisible = false;
			
			var val = that.evalValue(input.value);
			that.setValue(val);
			that.emit("change", val, val);
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
				e.stopPropagation();
				input.blur();
			}
			
			if(w == MT.keys.ENTER){
				
				hideval = false;
				e.stopPropagation();
				input.blur();
			}
			
			if(that.object[that.key] != input.value){
				var val = that.evalValue(input.value);
				that.setValue(val, true);
				if(hideval){
					that.value.el.innerHTML = "";
				}
			}
		};
		
		//this.keyup = events.on("keyup", 
		
		if(this.type == "number"){
		
			this.onwheel = events.on("wheel", function(e){
				if(e.target !== that.value.el){
					return;
				}
				e.preventDefault();
				var d = ( (e.wheelDelta || -e.deltaY) > 0 ? 1 : -1);
				var val = that.object[that.key] + d*that.step;
				that.setValue(val);
			});
			
			this.mouseup = events.on("mouseup",function(){
				down = false;
				that.needEnalbe = false;
			});
			
			this.mousemove = events.on("mousemove",function(e){
				if(!down){
					return;
				}
				var val = that.object[that.key] - events.mouse.my*that.step;
				that.setValue(val, false);
			});
		}
	},
	{
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
		
		setValue: function(val, silent){
			if(this.type == "upload"){
				return;
			}
			
			
			this.needEnalbe = false;
			var oldValue = this.object[this.key];
			
			if(val == oldValue && !silent){
				this.value.el.innerHTML = val;
				return;
			}
			if(val < this.min){
				val = this.min;
			}
			
			if(val > this.max){
				val = this.max;
			}
			
			
			
			
			
			this.object[this.key] = val;
			
			if(typeof val == "number"){
				this.value.el.innerHTML = parseFloat(val.toFixed(8));
			}
			else{
				this.value.el.innerHTML = val;
			}
			if(this.type == "color"){
				this.span.style.backgroundColor = val;
			}
			if(!silent){
				this.emit("change", val, oldValue);
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
			
			
			return ret;
		},
		
		setTabIndex: function(){
			MT.ui.Input.tabindex += 1;
			this.value.el.setAttribute("tabindex", MT.ui.Input.tabindex);
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
		this.settings = this.map.project.plugins.settings;
		
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
		
		// debug only - so we know what is missing
		Object.seal(this);
	},
	{
		radius: 3,
		activeRadius: 5,
		
		create: function(){
			
			if(this.data.contents){
				this.createGroup();
			}
			if(this.data.type == MT.objectTypes.SPRITE){
				this.createSprite();
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
			
			
			// hack for phaser
			var gm = this.game.width;
			var gh = this.game.height;
			
			this.game.width = 99999;
			this.game.height = 99999;
			
			
			this.createTileMap();
			this.object = this.tilemap.createBlankLayer(this.data.name, this.data.widthInTiles, this.data.heightInTiles, this.data.tileWidth, this.data.tileHeight);
			this.object.fixedToCamera = this.data.isFixedToCamera;
			this.map.project.plugins.tools.tools.tiletool.updateLayer(this);
			this.map.tileLayers.push(this.object);
			this.map.resort();
			
			this.game.width = gm;
			this.game.height = gm;
			if(!this.data.isVisible){
				this.hide();
			}
			
		},
		
		createTileMap: function(){
			var tileWidth = this.data.tileWidth || 64;
			var tileHeight = this.data.tileHeight || 64;
			this.tilemap = this.game.add.tilemap(null, tileWidth, tileHeight, this.data.widthInTiles, this.data.heightInTiles);
		},
   
		createGroup: function(){
			this.object = this.game.add.group();
			this.parent.add(this.object);
		},
		
		createSprite: function(){
			this.object = this.parent.create(this.data.x, this.data.y, this.data.assetId);
			
			this.object.inputEnabled = true;
			this.object.input.pixelPerfectOver = true;
			//this.object.input.stop();
			
			this.createBox();
			this.update();
		},
   
		createText: function(){
			this.object = this.game.add.text(this.data.x, this.data.y, this.data.text, this.data.style);
			this.parent.add(this.object);
			this.object.inputEnabled = true;
			this.object.input.pixelPerfectOver = false;
			
			
			this.createBox();
			
			this.update();
		},
		updateText: function(){
			this.object.text = this.data.text;
			
			if(this.data.style){
				this.object.style = this.data.style;
			}
			this.wordWrap = this.data.wordWrap;
			this.wordWrapWidth = this.data.wordWrapWidth;
			
			this.object.fontSize = this.data.style.fontSize || 32;
			this.object.font = this.data.style.fontFamily || "Arial";
			this.object.fontWeight = this.data.style.fontWeight || "";
			
			if(!this.data.shadow){
				this.data.shadow = {};
			}
			this.object.anchor.x = this.data.anchorX;
			this.object.anchor.y = this.data.anchorY;
		},
   
		updateSprite: function(){
			this.object.anchor.x = this.data.anchorX;
			this.object.anchor.y = this.data.anchorY;
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
			
			if(parent){
				this.parent = parent;
				this.parent.add(this.object);
				
			}
			
			this.updateBox();
			if(this.map.activeObject == this){
				this.settings.update();
			}
			
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
			}
			
		
			this.object.x = this.data.x;
			this.object.y = this.data.y;
			
			this.object.angle = this.data.angle;
			
			if(this.data.scaleX){
				this.object.scale.x = this.data.scaleX;
				this.object.scale.y = this.data.scaleY;
			}
			
			this.map.resort();
		},
   
		updateBox: function(){
			if(this.data.contents || this.data.type == MT.objectTypes.TILE_LAYER){
				return;
			}
			
			var obj = this.object;
			obj.updateTransform();
			var mat = obj.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;
			
			var angle = this.getOffsetAngle();
			var x, y, dx, dy;
			
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
			if(this.activeHandle != 4){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) ;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) + obj.height*0.5;
				this.rp(angle, x, y, ax, ay, this.handles[4]);
			}
			
			// right
			if(this.activeHandle != 6){
				x = mat.tx + obj.width * (1 - obj.anchor.x) * this.map.scale.x;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) + obj.height*0.5;
				this.rp(angle, x, y, ax, ay, this.handles[6]);
			}
			
			// top
			if(this.activeHandle != 5){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) + obj.width*0.5;
				y = (mat.ty - obj.height * (obj.anchor.y) * this.map.scale.x) ;
				this.rp(angle, x, y, ax, ay, this.handles[5]);
			}
			// bottom
			if(this.activeHandle != 7){
				x = (mat.tx - obj.width * (obj.anchor.x) * this.map.scale.x) + obj.width*0.5;
				y = mat.ty + obj.height * (1 - obj.anchor.y) * this.map.scale.x;
				this.rp(angle, x, y, ax, ay, this.handles[7]);
			}
			
			var rx = ax;
			var ry = ay - this.object.height * this.map.scale.x * 0.6 - 20;
			
			if(this.activeHandle != -3){
				this.rotator.x = this.rpx(this.object.rotation, rx, ry, ax, ay);
				this.rotator.y = this.rpy(this.object.rotation, rx, ry, ax, ay);
				
				for(var i=0; i<this.handles.length; i++){
					
				}
				
			}
		},
		
		highlight: function(ctx){
			if(this.isRemoved){
				return;
			}
			var mat = this.object.worldTransform;
			var ax = mat.tx;
			var ay = mat.ty;
			ctx.save();
			ctx.translate(0.5, 0.5);
			
			ctx.strokeStyle = "#ffaa00";
			
			if(this.data.contents){
				var bounds = this.object.getBounds();
				ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
				this.drawGroupHandle(ctx, this.object);
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
			ctx.save();
			ctx.translate(ax, ay);
			ctx.rotate(obj.rotation);
			
			ctx.strokeStyle = "#ffffff";
			
			ctx.strokeRect(- this.radius, - this.radius, this.radius*2, this.radius * 2);
			ctx.beginPath();
			ctx.moveTo(0, 0);
			
			var dx = 0;
			var dy = - this.radius*3;
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
			
		},
		
		moveObject: function(x, y, e){
			
			var mi = this.mouseInfo;
			var dx = (mi.x - x) / this.map.scale.x;
			var dy = (mi.y - y) / this.map.scale.y;
			var angle = this.getParentAngle();
			
			
			
			var dxt = this.rpx(-angle, dx, dy, 0, 0);
			var dyt = this.rpy(-angle, dx, dy, 0, 0);
			
			this.x -= dxt;
			mi.x = x;
				
			this.y -= dyt;
			mi.y = y;
			
			if(e.ctrlKey && angle == 0){
				var gx = this.map.settings.gridX;
				var gy = this.map.settings.gridY;
				
				var tx = Math.round(this.x / gx) * gx;
				var ty = Math.round(this.y / gy) * gy;
				
				
				mi.x += (tx - this.x) * this.map.scale.x;
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
			// rotate
			if(this.activeHandle == -3){
				dx = mi.x - x;
				dy = mi.y - y;
				this.rotator.x -= dx;
				this.rotator.y -= dy;
				
				
				var rot = Math.atan2( mat.ty - this.rotator.y, mat.tx - this.rotator.x) - Math.PI * 0.5;
				mi.x = x;
				mi.y = y;
				
				this.object.rotation = rot;
				this.data.angle = this.object.angle;
				
				if(e.ctrlKey){
					console.log(Math.abs(this.object.rotation - rot));
					this.object.angle = Math.round(this.object.angle / 15)*15;
					this.data.angle = this.object.angle;
				}
				
				this.update();
				return;
			}
			
			// move anchor
			if(this.activeHandle == -2){
				
				this.moveAnchor((x - mi.x), (y - mi.y) );
				mi.x = x;
				mi.y = y;
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
				this.height = nHeight;
				
				this.updateBox();
				
				this.scaleX = this.object.scale.x * sigX;
				this.scaleY = this.object.scale.y * sigY;
				
				if(e.ctrlKey){
					this.scaleX = Math.round(this.scaleX/0.1)*0.1;
					this.scaleY = Math.round(this.scaleY/0.1)*0.1;
				}
				
				if(e.shiftKey){
					this.scaleX = this.scaleY;
				}
				
				this.data.scaleX = this.object.scale.x;
				this.data.scaleY = this.object.scale.y;
			}
			else{
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
					
					this.scaleX = this.object.scaleX;
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
					this.scaleY = this.object.scaleY;
					
					this.updateBox();
					
					if(e.ctrlKey){
						//this.scaleX = Math.round(this.scaleX/0.1)*0.1;
						this.scaleY = Math.round(this.scaleY/0.1)*0.1;
					}
					
					if(e.shiftKey){
						this.scaleX = this.scaleY;
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
   
		moveAnchor: function(x, y){
			
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
		
		getParentAngle: function(){
			var par = this.object.parent;
			var angle = 0;
			while(par){
				angle += par.rotation;
				par = par.parent;
			}
			return angle;
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
			
			if(x == void(0) || isNaN(x)){
				throw new Error("x = nan?");
				return;
			}
			
			this.object.x = x;
			this.data.x = x;
			this.updateBox();
		},
		get x(){
			return this.data.x;
		},
		
		set y(y){
			this.object.y = y;
			this.data.y = y;
			this.updateBox();
		},
		get y(){
			return this.data.y;
		},
   
		set angle(val){
			this.object.angle = val;
			this.data.angle = val;
			this.updateBox();
		},
		get angle(){
			return this.data.angle;
		},
   
		set anchorX(val){
			this.object.anchor.x = val;
			this.data.anchorX = val;
			this.updateBox();
		},
		get anchorX(){
			return this.data.anchorX;
		},
		
		set anchorY(val){
			this.object.anchor.y = val;
			this.data.anchorY = val;
			this.data.width = this.object.width;
			this.updateBox();
		},
		get anchorY(){
			return this.data.anchorY;
		},
		
		set width(val){
			if(isNaN(val)){
				return;
			}
			this.object.width = val;
			this.data.width = val;
			this.data.scaleX = this.object.scale.x;
			this.updateBox();
		},
		get width(){
			return this.data.width;
		},
		set height(val){
			if(isNaN(val)){
				return;
			}
			this.object.height = val;
			this.data.height = val;
			this.data.scaleY = this.object.scale.y;
			this.updateBox();
		},
		get height(){
			return this.data.height;
		},
		
		set scaleX(val){
			if(isNaN(val)){
				return;
			}
			this.object.scale.x = val;
			this.data.scaleX = val;
			this.updateBox();
			this.data.width = this.object.width;
		},
		get scaleX(){
			return this.data.scaleX;
		},
   
		set scaleY(val){
			if(isNaN(val)){
				return;
			}
			this.object.scale.y = val;
			this.data.scaleY = val;
			this.updateBox();
			this.data.height = this.object.height;
		},
		get scaleY(){
			return this.data.scaleY;
		},
		
		set alpha(val){
			if(isNaN(val)){
				return;
			}
			this.object.alpha = val;
			this.data.alpha = val;
		},
		get alpha(){
			return this.data.alpha == void(0) ? 1 : this.data.alpha;
		},
		
		set frame(val){
			this.data.frame = val;
			this.object.frame = val;
		},
		get frame(){
			return this.data.frame;
		},
   
		set isFixedToCamera(val){
			this.object.fixedToCamera = val;
			this.data.isFixedToCamera = val;
			this.updateBox();
		},
		get isFixedToCamera(){
			return this.data.isFixedToCamera;
		},
		
		/* text */
		set wordWrapWidth(val){
			this.object.wordWrapWidth = val;
			this.data.wordWrapWidth = val;
			this.updateBox();
		},
		get wordWrapWidth(){
			return this.data.wordWrapWidth || 100;
		},
		
		set wordWrap(val){
			this.data.wordWrap = val;
			this.object.wordWrap = val;
		},
		get wordWrap(){
			return this.data.wordWrap;
		},
		
		set style(val){
			console.log("do not se style");
			return;
			this.data.style = val;
			this.object.style = val;
		},
		get style(){
			return this.data.style;
		},
		
		set font(val){
			this.object.font = val;
			this.data.style.font = this.object.font;
		},
   
		get font(){
			return this.object.style.font;
		},
   
		set fontFamily(val){
			this.object.font = val;
			this.data.style.fontFamily = val;
		},
		get fontFamily(){
			return this.data.style.fontFamily;
			
		},
   
		set fontWeight(val){
			this.object.fontWeight = val;
			this.data.style.fontWeight = val;
		},
		get fontWeight(){
			this.data.style.fontWeight = val;
		},
		set fontSize(val){
			var scaleX = this.object.scale.x;
			var scaleY = this.object.scale.y;
			
			this.object.fontSize = parseInt(val);
			this.data.style.fontSize = this.object.fontSize;
			
			this.scaleX = scaleX;
			this.scaleY = scaleY;
			
		},
		get fontSize(){
			if(!this.data.style.fontSize){
				this.data.style.fontSize = this.object.fontSize;
			}
			return this.data.style.fontSize;
		},
		
		set align(val){
			this.data.align = val;
			this.object.align = val;
		},
   
		get align(){
			return this.data.align;
		},
		
		set fill(val){
			this.object.fill = val;
			this.data.fill = val;
		},
		get fill(){
			return this.data.fill || "#000000";
		},
		
		set stroke(val){
			this.object.stroke = val;
			this.data.stroke = val;
		},
		get stroke(){
			return this.data.stroke || "#000000";
		},
		
		set strokeThickness(val){
			this.object.strokeThickness = val;
			this.data.strokeThickness = val;
		},
   
		get strokeThickness(){
			return this.data.strokeThickness || 0;
		},
		
		setShadow: function(x, y, color, blur){
			if(!this.data.shadow){
				this.data.shadow = {};
			}
			
			this.data.shadow.x = x;
			this.data.shadow.y = y;
			this.data.shadow.color = color;
			this.data.shadow.blur = blur;
			
			this.object.setShadow(x, y, color, blur);
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
			this.object.text = val;
			this.data.text = val;
		},
		get text(){
			return this.data.text;
		},
		
		/* tilelayer */
		
		set widthInTiles(val){
			this.data.widthInTiles = val;
			this.removeLayer();
			this.createTileLayer();
		},
		get widthInTiles(){
			return this.data.widthInTiles;
		},
		set heightInTiles(val){
			this.data.heightInTiles = val;
			this.removeLayer();
			this.createTileLayer();
		},
		get heightInTiles(){
			return this.data.heightInTiles;
		},
		set tileWidth(val){
			this.data.tileWidth = val;
			this.removeLayer();
			this.createTileLayer();
		},
		get tileWidth(){
			return this.data.tileWidth;
		},
		set tileHeight(val){
			this.data.tileHeight = val;
			this.removeLayer();
			this.createTileLayer();
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
			if(this.data.isVisible){
				return true;
			}
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
		}
		
		
		
	}
);
//MT/core/Helper.js
MT.namespace('core');
MT(
	MT.core.Helper = function(){

	},
	{
		isImage: function(imgPath){
			var ext = imgPath.split(".").pop();
			return (ext == "png" || ext == "jpg" || ext == "gif" || ext == "jpeg");
		},
		
		isSource: function(path){
			return !this.isImage(path);
		}
	}
);
//MT/ui/TreeView.js
MT.namespace('ui');
"use strict";
/*
 * Needs to be reviewed - too many hacks already
 */
MT.require("ui.DomElement");
MT.extend("core.Emitter")(
	MT.ui.TreeView = function(data, options){
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
		
		onDrop: function(cb){
			this._onDrop.push(cb);
		},
		
		create: function(data){
			this.tree = new MT.ui.DomElement();
			this.tree.style.position = "relative";
			this.tree.addClass("ui-treeView");
			
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
			this.tree.el.innerHTML = "";
			this.createObject(data, this.tree);
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
			if(!parent.data || !parent.data.isClosed){
				el.show();
			}
			
			
			if(type == "folder"){
				head.addClass("ui-treeview-folder-head");
				if(data.isClosed){
					el.addClass("close");
					el.visible = false;
				}
				else{
					el.addClass("open");
				}
				
				head.el.onclick = function(e){
					if(e.target != el.head.el && e.target != el.head.label.el){
						return;
					}
					
					if(el.isFolder && e.offsetX > 30){
						return;
					}
					
					e.stopPropagation();
					
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
					var im = document.createElement("img");
					if(data.__image){
						im.src = this.rootPath + "/" +data.__image;
					}
					
					
					head.el.appendChild(im);
					im.style.pointerEvents = "none";
					el.img = im;
				}
				
				if(data.type == "input"){
					var input = new MT.ui.DomElement("span");
					input.el.innerHTML = "88"
					
					input.x = 50;
					
					head.addChild(input);
					el.head = input;
					
				}
				
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
							item.img.src = this.rootPath + "/" + data.__image + "?"+Date.now();
						}
						else{
							console.log("WHERE IS IMG?");
						}
							
						
						
					}
					
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
		
		
		
		
		sortable: function(ev){
			
			var dragHelper = this.addItem({name: "xxx", skip: true}, this.tree, 0, true);
			
			dragHelper.style.position = "absolute";
			dragHelper.style.pointerEvents = "none";
			dragHelper.style.bottom = "auto";
			dragHelper.style.opacity = 0.6;
			
			var dd = document.createElement("div");
			dd.style.position = "absolute";
			dd.style.height = "4px";
			dd.style.border = "solid 1px #000";
			dd.style.left = 0;
			dd.style.right = 0;
			dd.style.pointerEvents = "none";
			dd.style.display = "none";
			
			
			var p = dragHelper.el.parentNode;
			dragHelper.addClass("active ui-wrap");
			p.appendChild(dragHelper.el);
			dragHelper.style.display = "none";
			
			p.appendChild(dd);
			
			
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
					last.addChild(item);
					if(!last.visible){
						item.hide();
					}
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
			
			ev.on("click", function(e){
				
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
				if(item){
					that.emit("click", item.data, item);
				}
			});
			
			ev.on("mousedown", function(e){
				if(!e.target.parentNode){
					return;
				}
				item = that.getOwnItem(e.target.parentNode.parentNode);
				if( !item ){
					return;
				}
				mdown = true;
				scrollTop = that.tree.el.parentNode.scrollTop;
				
				var y = (item.calcOffsetY(that.tree.el));
				dragHelper.y = y;
				my = y - ev.mouse.y;
			});
			
			ev.on("mouseup", function(e){
				
				dragHelper.style.display = "none";
				dd.style.display = "none";
				dragHelper.y = 0;
				
				if(!mdown){
					return;
				}
				mdown = false;
				
				
				for(var i=0; i<that._onDrop.length; i++){
					if(that._onDrop[i](e, item, last) === false){
						return;
					}
				}
				
				
				if(!dragged){
					return;
				}
				dragged = false;
				
				
				if(!last || last == item || last.parent == item){
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
						if(item == it || last == it || last.parent == it){
							continue;
						}
						dropItem(it, last);
					}
				}
				that.updateFullPath(that.getData(), null, true);
				
			});
			
			ev.on("mousemove", function(e){
				if(!mdown){
					return;
				}
				
				var dy = my - ev.mouse.y;
				var p1 = dragHelper.y + ev.mouse.my - (scrollTop - that.tree.el.parentNode.scrollTop);
				
				scrollTop = that.tree.el.parentNode.scrollTop;
				var p2 = 0;
				var activeItem = that.getOwnItem(e.target);
				
				dragHelper.y = p1;
				
				if(!activeItem || !item  || activeItem == item || activeItem.hasParent(item) ){
					return;
				}
				
				
				dragHelper.style.display = "block";
				dragHelper.head.el.innerHTML = item.data.name;
				
				p2 = activeItem.calcOffsetY(dd.parentNode);
				
				if(Math.abs(p1-p2) > dragHelper.el.offsetHeight){
					return;
				}
				
				dragged = true;
				bottom = false;
				inFolder = false;
				
				
				dd.style.display = "block";
				dd.style.height = "4px";
				
				if(p2 < p1){
					p2 += dragHelper.el.offsetHeight;
					bottom = true;
				}
				
				dd.style.top = (p2 - 2)+"px";
				if(Math.abs(p2-p1) < 16 && activeItem.isFolder){
					dd.style.height = dragHelper.el.offsetHeight+"px";
					inFolder = true;
				}
				
				last = activeItem;
				
			});
			
		},
		
		
		
		enableRename: function(el){
			var that = this;
			this.emit("renameStart");
			
			if(!this.input){
				this.input = document.createElement("input");
				this.input.className = "ui-input";
			}
			
			this.input.style.left = (el.head.calcOffsetX(document.body))+"px";
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
					var part = "";
					if(el.parent.data){
						part = el.parent.data.fullPath;
					}
					
					var op = el.data.name;
					
					el.data.fullPath = part+"/"+this.value;
					el.data.name = this.value;
					el.head.label.el.innerHTML = this.value;
					
					var o = part + "/" + op;
					var n = part + "/" + this.value;
					
					if(o !== n){
						that.emit("change", part + "/" + op, part + "/" + this.value);
					}
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
   
		remove: function(){
			this.tree.hide();
		},
		
		merge: function(data, oldData){
			this.data = data;
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
			}
			
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
		
		updateFullPath: function(data, path, shouldNotify){
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
					this.updateFullPath(data[i].contents, data[i].fullPath, shouldNotify);
				}
			}
			
			if(shouldNotify){
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
			this.style.top = val;
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
			while(p && p != upTo){
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
   
		setAbsolute: function(){
			this.style.position = "absolute";
			this.style.top = 0;
			this.style.left = 0;
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
	MT.ui.Button = function(text, className, events, cb){
		MT.ui.DomElement.call(this);
		
		this.addClass("ui-button");
		
		if(className){
			this.addClass(className);
		}
		
		if(text != void(0)){
			this.text = text;
		}
		
		if(cb){
			//if(events == null){
				this.el.onclick = cb;
			//}
			/*else{
				var that = this;
				events.on("click", function(e){
					if(e.target === that.el){
						cb(e);
					}
				});
			}*/
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
			if(value == ""){
				console.log("should remove");
			}
			
			
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
			console.log(e.target.data);
			
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
			
			this.data = JSON.parse(JSON.stringify(data));
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
			console.log(row, cell, val);
			
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
//MT/core/BasicPlugin.js
MT.namespace('core');
MT(
	MT.core.BasicPlugin = function(channel){
		this.channel = channel;
		this.dealys = {};
	},
	{
		
		initUI: function(ui){
			this.ui = ui;
		},
		
		initSocket: function(socket){
			if(this.channel == void(0)){
				return;
			}
			
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
   
		send: function(action, data){
			this.socket.send(this.channel, action, data);
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
			
			//this.debug(type);
			
			//console.log("emit:", type, action);
			if(!this.callbacks){
				return;
			}
			
			if(!this.callbacks[type]){
				//console.warn("received unhandled data", type, data);
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
			document.title += " - " + this.project.id;
			ga('send', 'pageview');
			
			var lastUpdate = Date.now();
			var that = this;
			this.project.plugins.tools.on("select", function(tool){
				lastUpdate = Date.now();
				ga('send', 'event', 'tool-selected', tool);
			});
			
			this.project.plugins.assetmanager.on("added", function(image){
				lastUpdate = Date.now();
				ga('send', 'event', 'image-added', image);
			});
			
			this.project.plugins.objectmanager.on("added", function(obj){
				lastUpdate = Date.now();
				ga('send', 'event', 'object-added', obj);
			});
			
			this.project.plugins.objectmanager.on("changed", function(obj){
				lastUpdate = Date.now();
				ga('send', 'event', 'object-changed', obj);
			});
			
			this.project.plugins.objectmanager.on("beforeSync", function(){
				lastUpdate = Date.now();
				ga('send', 'event', 'working-with-map', "sync");
			});
			
			var minute = 1000*60;
			window.setInterval(function(){
				if(lastUpdate < Date.now() - minute){
					ga('send', 'event', 'idle', that.project.id);
				}
			}, minute);
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
		
		save: function(){
			
			var str = JSON.stringify(this.buffer);
			var off = this.currentOffset;
			
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
				localStorage.setItem(this.name, JSON.stringify(this.data) );
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
			
			
			/*om.tv.on("click",function(data){
				//that.setTool(that.tools.select);
				select(map.getById(data.id));
			});
			*/
			
			
			map.selector.on("select", function(obj){
				//if(map.selector.count == 1){
					that.emit(MT.OBJECT_SELECTED, obj);
				//}
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
			
			this.ui.events.on(this.ui.events.KEYUP, function(e){
				
				if(lastKey == MT.keys.ESC){
					that.setTool(that.tools.select);
					window.getSelection().removeAllRanges();
					lastKey = 0;
					return;
				}
				
				
				if(e.which == MT.keys.DELETE){
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
				
				if(e.ctrlKey){
					if(e.which === MT.keys.C){
						toCopy.length = 0;
						map.selector.forEach(function(obj){
							toCopy.push(obj);
						});
						return;
					}
					
					if(e.which === MT.keys.V && e.target == document.body){
						var x = that.ui.events.mouse.lastEvent.x;
						var y = that.ui.events.mouse.lastEvent.y;
						that.map.selector.clear();
						
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
						
						var cop = null;
						for(var i=0; i<toCopy.length; i++){
							bounds = toCopy[i].getBounds();
							cop = that.copy(toCopy[i].data, bounds.x - midX + x - map.offsetX, bounds.y - midY + y - map.offsetY);
							that.map.selector.add(cop);
						}
					}
				}
			});
			
			for(var i in this.tools){
				this.tools[i].initUI(this.ui);
			}
			
			this.setTool(this.tools.select);
			
			
		},
		
		lastAsset: null,
		
		
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
		
		setTool: function(tool){
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
			
			
			this.activeTool.init();
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
			if(this.lastSelected && this.lastSelected == obj && this.map.activeObject){
				return;
			}
			this.lastSelected = obj;
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
			
			//this.tmpObject =  this.map.createObject();
			this.map.activeObject = this.tmpObject;
			
			
			this.tmpObject.x = dx || x;
			this.tmpObject.y = dy || y;
			
			
		},
		
		removeTmpObject: function(){
			if(this.tmpObject){
				this.tmpObject.hide();
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
//MT/plugins/Export.js
MT.namespace('plugins');
MT.extend("core.Emitter").extend("core.BasicPlugin")(
	MT.plugins.Export = function(project){
		MT.core.BasicPlugin.call(this, "Export");
		this.project = project;
		
	},
	{
		initUI: function(ui){
			var that = this;
			this.list = new MT.ui.List([
				{
					label: "Phaser.io (.js)",
					className: "",
					cb: function(){
						that.export("phaser", function(data){
							window.location = that.project.path + "/"+ data.file;
						});
					}
				},
				{
					label: "Phaser.io (data only) js",
					className: "",
					cb: function(){
						that.export("phaserDataOnly", function(data){
							that.openDataLink(data, "js");
						});
					}
				},
				{
					label: "Phaser.io (data only) json",
					className: "",
					cb: function(){
						that.export("phaserDataOnly", function(data){
							that.openDataLink(data, "json");
						});
					}
				}
			
			], ui, true);
			
			var b = this.button= this.project.panel.addButton("Export", null, function(e){
				that.showList();
			});
			
			this.openGame = this.project.panel.addButton("Open Game", null, function(e){
				that.openLink();
			});
			
			//this.list.removeHeader();
			//this.list.content.overflow = "initial";
			
		},
		
		export: function(dest, data, cb){
			if(typeof data == "function"){
				cb = data;
				data = null;
			}
			this.send(dest, data);
			this.once("done", cb);
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
			
			window.open(this.project.path + "/" + data.file,"","width="+w+",height="+h+",left="+l+",top="+t+"");
		},
		
		openLink: function(){
			var w = window.open("about:blank",Date.now());
			w.opener = null;
			
			var path = this.project.path;
			this.export("phaser", function(data){
				if(w.location){
					w.location.href = path + "/phaser/index.html";
				}
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
			this.project.plugins.tools.on(MT.ASSET_FRAME_CHANGED, function(obj, frame){
				that.handleAssets(obj);
			});
			this.project.plugins.tools.on(MT.OBJECT_SELECTED, function(obj){
				that.handleObjects(obj);
				that.active = obj.id;
			});
			this.project.plugins.tools.on(MT.OBJECT_UNSELECTED, function(obj){
				that.clear();
			});
			
			var map = this.project.plugins.mapeditor;
			map.on("select", function(obj){
				that.handleScene(map.settings);
			});
			
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
			
			this.panel.title = obj.name;
			
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
			this.panel.title = obj.name;
			var that = this;
			var cb = function(){
				that.project.om.update();
			};
			//group
			if(obj.data.contents){
				this.stack = "group";
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				this.objects.angle = this.addInput( "angle", obj, true, cb);
				if(obj.isFixedToCamera === void(0)){
					obj.isFixedToCamera = 0;
				}
				this.objects.isFixedToCamera = this.addInput({key:"isFixedToCamera", min: 0, max: 1, step: 1}, obj, true, cb);
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
			
			
			this.scene.gridX = this.addInput( {key: "gridX", min: 2}, obj, true, cb);
			this.scene.gridY = this.addInput( {key: "gridY", min: 2}, obj, true, cb);
			this.scene.showGrid = this.addInput( {key: "showGrid", min: 0, max: 1}, obj, true, cb);
			this.scene.backgroundColor = this.addInput( {key: "backgroundColor", type: "color" }, obj, true, cb);
			
		},
   
		updateScene: function(obj){
			for(var i in this.scene){
				this.scene[i].obj = obj;
				this.scene[i].setValue(obj[i]);
			}
		},




	}
);
//MT/plugins/MapEditor.js
MT.namespace('plugins');
"use strict";
MT.requireFile("js/phaser.js", function(){
	MT.requireFile("js/phaserHacks.js");
});
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
			
			gridX: 64,
			gridY: 64,
			
			gridOffsetX: 0,
			gridOffsetY: 0,
			
			showGrid: 1,
			backgroundColor: "#111111"
		};
		
		
		this.zoom = 1;
		
		window.map = this;
	},
	{
		_mousedown: false,
		
		getTileMap: function(obj){
			var tileWidth = obj.tileWidth || 64;
			var tileHeight = obj.tileHeight || 64;
			return this.game.add.tilemap(null, tileWidth, tileHeight, obj.widthInTiles, obj.heightInTiles);
		},
		
		addTileLayer: function(obj){
			var tilemap = this.getTileMap(obj);
			
			var tl = tilemap.createBlankLayer(obj.name, obj.widthInTiles, obj.heightInTiles, obj.tileWidth, obj.tileHeight);
			tl.fixedToCamera = obj.isFixedToCamera;
			return tl;
		},
		
		updateTileMap: function(obj, oldLayer){
			oldLayer.destroy();
			
			return this.addTileLayer(obj);
		},
		
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
			
			window.oncontextmenu = function(e){
				if(e.target == that.game.canvas){
					e.preventDefault();
				}
			};
			
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
					console.log("chrome bugging");
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
				console.log("deleted", id);
				var tmp;
				for(var i=0; i<that.loadedObjects.length; i++){
					tmp = that.loadedObjects[i];
					
					if(tmp.id == id){
						that.loadedObjects.splice(i, 1);
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
			
			var ctx = null;
			var drawObjects = function(obj){
				obj.highlight(ctx);
			};
			
			var game = this.game = window.game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { 
				preload: function(){
					game.stage.disableVisibilityChange = true;
					var c = game.canvas;
					c.parentNode.removeChild(c);
					that.panel.content.el.appendChild(c);
					c.style.position = "relative";
					that.panel.content.style.overflow = "hidden";
					
				},
				create: function(){
					that.resize();
					that.scale = game.camera.scale;
					if(!ctx){
						ctx = game.canvas.getContext("2d");
					}
					
					that.setCameraBounds();
					that.postUpdateSetting();
					//return;
					that.game.plugins.add({
						postUpdate: function(){
							for(var i=0; i<that.tileLayers.length; i++){
								var layer = that.tileLayers[i];
								if(layer.fixedToCamera){
									continue;
								}
								if(layer._mc.x || layer._mc.y){
									layer._ox = layer._mc.x;
									layer._oy = layer._mc.y;
									layer.x += layer._mc.x;
									layer.y += layer._mc.y;
								}
								
							}
						},
						
						postRender: function(){
							
							for(var i=0; i<that.tileLayers.length; i++){
								var layer = that.tileLayers[i];
								if(layer.fixedToCamera){
									continue;
								}
								if(layer._ox !== void(0)){
									layer.x -= layer._ox;
									layer._ox = void(0);
								}
								if(layer._oy !== void(0)){
									layer.y -= layer._oy;
									layer._oy = void(0);
								}
								
							}
						}
						
					});
					
					
					var graphics = window.graphics = new PIXI.Graphics();
					
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
					
					graphics.postUpdate = graphics.preUpdate = function(){};

					graphics.update = function(){
						//graphics.x = -that.game.camera.x;
						//graphics.y = -that.game.camera.y;
						
						//update top
						graphics.graphicsData[0].points[2] = that.game.canvas.width;
						graphics.graphicsData[0].points[3] = -that.game.camera.y;
						
						// update right
						graphics.graphicsData[1].points[0] = (that.settings.viewportWidth* that.game.camera.scale.x - that.game.camera.x) ;
						graphics.graphicsData[1].points[1] = -that.game.camera.y;
						graphics.graphicsData[1].points[2] = that.game.canvas.width + that.game.camera.x;
						graphics.graphicsData[1].points[3] = that.settings.viewportHeight* that.game.camera.scale.y;
						
						// update bottom
						graphics.graphicsData[2].points[1] = that.settings.viewportHeight* that.game.camera.scale.y - that.game.camera.y;
						graphics.graphicsData[2].points[2] = that.game.canvas.width;
						graphics.graphicsData[2].points[3] = that.game.canvas.height + that.game.camera.y;
						
						
						// update left
						graphics.graphicsData[3].points[1] = -that.game.camera.y;
						graphics.graphicsData[3].points[2] = -that.game.camera.x;
						graphics.graphicsData[3].points[3] = that.settings.viewportHeight* that.game.camera.scale.y;
						
						//graphics.drawRect(0, 0, that.settings.width, that.settings.height);
					};

					// add it the stage so we see it on our screens..
					map.game.stage.children.unshift(graphics);
					graphics.parent = map.game.stage;
				},
				
				
				render: function(){
					ctx.globalAlpha = 1;
					that.drawGrid(ctx);
					
					that.selector.forEach(drawObjects);
					
					that.drawSelection(ctx);
					
					that.highlightDublicates(ctx);
					
					that.drawPhysics(ctx);
					
				}
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
			if(!this.settings.showGrid){
				return;
			}
			
			var alpha = ctx.globalAlpha;
			
			var g = 0;
			var game = this.game;
			
			
			ctx.save();
			
			ctx.scale(this.game.camera.scale.x, this.game.camera.scale.y);
			
			ctx.beginPath();
			
			var bg = game.stage.backgroundColor;
			var inv = parseInt("FFFFFF", 16);
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
			ctx.globalAlpha = 1;
			
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
			ctx.globalAlpha = 1;
			
			
			// highlight x = 0; y = 0;
			
			ctx.beginPath();
			
			ctx.moveTo(0, -game.camera.y/this.scale.y);
			ctx.lineTo(width, -game.camera.y/this.scale.y);
			
			ctx.moveTo(-game.camera.x/this.scale.x, 0);
			ctx.lineTo(-game.camera.x/this.scale.x, height);
			
			
			ctx.stroke();
			
			
			
			
			ctx.globalAlpha = alpha;
			ctx.restore();
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
			
			if(obj.data.contents){
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
			for(var i=0; i<this.objects.length; i++){
				this.drawPhysicsBody(ctx, this.objects[i]);
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
			
			if(!this.isVisible(obj)){
				return;
			}
			if(obj.data.contents){
				return;
			}
			
			var p = obj.data.physics;
			if(!p || !p.enable){
				var pp = obj.parent;
				if(obj.parent == obj.game.world){
					pp = this.settings.physics;
				}
				else{
					pp = pp.data.physics;
				}
				if(!pp || !pp.enable){
					return;
				}
				p = pp;
			}
			
			
			var alpha = ctx.globalAlpha;
			var bounds = obj.getBounds();
			var group = obj.parent;
			
		
			
			var x = this.getObjectOffsetX(group);
			var y = this.getObjectOffsetY(group);
			
			ctx.save();
			
			ctx.fillStyle = "rgb(100,200,70)";
			ctx.globalAlpha = 0.2;
			
			var w = bounds.width;
			var h = bounds.height;
			
			if(p.size.width > 0){
				w = p.size.width * this.scale.x;
			}
			if(p.size.height > 0){
				h = p.size.height * this.scale.y;
			}
			
			
			
			ctx.fillRect((bounds.x + p.size.offsetX*this.scale.x) | 0, (bounds.y + p.size.offsetY*this.scale.y) | 0, w, h);
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
			ctx.fillStyle = "rgba(150, 70, 20, 0.2)";
			for(var j=0; j<this.objects.length; j++){
				o1 = this.objects[j];
				if(!this.isVisible(o1)){
					continue;
				}
				for(var i=0; i<this.objects.length; i++){
					o2 = this.objects[i];
					if(o1 == o2){
						continue;
					}
					if(o1.x == o2.x && o1.y == o2.y && o1.assetId == o2.assetId && o1.width == o2.width){
						bounds = o1.getBounds();
						ctx.fillRect(bounds.x | 0, bounds.y | 0, bounds.width | 0, bounds.height | 0);
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
				var ext = asset.atlas.split(".").pop().toLowerCase();
				
				MT.loader.get(that.project.path + "/" + asset.atlas+"?"+Date.now(), function(dataString){
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
						that.loadImage(path + "?" + Date.now(), function(){
							that.game.cache.addTextureAtlas(asset.id, asset.__image, this, data, type);
							that.findAtlasNames(asset.id);
							cb();
						});
					}
				});
				return;
			}
			
			this.loadImage(path + "?" + Date.now(), function(){
				if(asset.width != asset.frameWidth || asset.width != asset.frameHeight){
					that.game.cache.addSpriteSheet(asset.id, asset.__image, this, asset.frameWidth, asset.frameHeight, asset.frameMax, asset.margin, asset.spacing);
				}
				else{
					that.game.cache.addImage(asset.id, asset.__image, this);
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
		
		atlasNames: {},
		
		findAtlasNames: function(id){
			if(!this.game.cache._images[id] || !this.game.cache._images[id].frameData){
				console.error("Failed to parse atlas");
				return;
			}
			
			var frameData = this.game.cache._images[id].frameData;
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
			this.game.cache.removeImage(id);
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
		addObjects: function(objs, group){
			// check if assets is loaded - if not - call again this method after a while
			if(!this.isAssetsAdded){
				var that = this;
				if(this._addTimeout){
					window.clearTimeout(this._addTimeout);
					this._addTimeout = 0;
				}
				
				this._addTimeout = window.setTimeout(function(){
					that.addObjects(objs, group);
					this._addTimeout = 0;
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
			
			for(var i=0; i< this.loadedObjects.length; i++){
				tmp = this.loadedObjects[i];
				if(tmp.isRemoved){
					this.loadedObjects.splice(i, 1);
					tmp.remove();
					i--;
				}
			}
			
			return;
		},
		
		_destroyObject: function(object){
			object.destroy(true);
		},
		
		_addObjects: function(objs, group){
			
			var tmp;
			var k = 0;
			for(var i=objs.length-1; i>-1; i--){
				tmp = this.getById(objs[i].id);
				
				if(!tmp ){
					tmp = new MT.core.MagicObject(objs[i], group, this);
					this.loadedObjects.push(tmp);
				}
				tmp.bringToTop();
				tmp.isRemoved = false;
				tmp.update(objs[i], group);
				
				// handle group
				if(objs[i].contents){
					this._addObjects(objs[i].contents, tmp.object);
					continue;
				}
			}
		},
		
		resort: function(){
			var tmp;
			for(var i=0; i<this.loadedObjects.length; i++){
				tmp = this.loadedObjects[i];
				tmp.bringToTop();
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
			console.log("removed - addObject");
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
			if(this.loadedObjects && !this._addTimeout){
				this.addObjects(this.loadedObjects);
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
			
			
			//console.log("move");
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
			if(this.activeObject && (this.activeObject.type == MT.objectTypes.SPRITE || this.activeObject.type == MT.objectTypes.TEXT) ){
				obj = this._pick(this.activeObject, x, y);
				if(obj){
					return obj;
				}
			}
			
			
			var p = new Phaser.Point(0,0);
			var pointer = this.game.input.activePointer;
			
			for(var i=this.loadedObjects.length-1; i>-1; i--){
				obj = this.loadedObjects[i];
				var ret = this._pick(obj, x, y);
				if(ret){
					return ret;
				}
			}
			
			return null;
		},
		
		_pick: function(obj, x, y){
			var bounds;
			if(!obj.isVisible){
				return null;;
			}
			if(obj.data.contents){
				return null;;
			}
			if(obj.isLocked){
				return null;;
			}
			
			// check bounds
			if(!obj.object.input){
				bounds = obj.object.getBounds();
				if(bounds.contains(x, y)){
					if(obj.data.type == MT.objectTypes.TILE_LAYER){
						if(obj.getTile(x + this.game.camera.x, y + this.game.camera.y)){
							return obj;
						}
						return null;
					}
					return obj;
				}
				return null;;
			}
			
			if(obj.object.input.checkPointerOver(this.game.input.activePointer)){
				this.activeObject = obj;
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
				
				if(!obj.isVisible){
					continue;
				}
				if(obj.isLocked){
					continue;
				}
				if(obj.data.contents){
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
			
			this.inheritSprite(sp, obj);
			
			
			var frameData = game.cache.getFrameData(obj.assetId);
			
			if(frameData){
				//sp.animations.add("default");
			}
			
			return sp;
		},
		
		inheritSprite: function(sp, obj){
			console.log("removed");
			return;
			sp.xxx = obj;
			
			sp.anchor.x = obj.anchorX;
			sp.anchor.y = obj.anchorY;
			
			sp.x = obj.x;
			sp.y = obj.y;
			
			sp.angle = obj.angle;
			if(obj.alpha == void(0)){
				sp.alpha = 1;
			}
			
			obj._framesCount = 0;
			
			
			if(obj.frame){
				sp.frame = obj.frame;
			}
			
			/*if(obj.width && obj.height && sp.scale.x == obj.scaleX && sp.scale.y == obj.scaleY){
				if(obj.width != sp.width || obj.height != sp.height){
					sp.width = obj.width;
					sp.height = obj.height;
					
					obj.scaleX = sp.scale.x;
					obj.scaleY = sp.scale.y;
				}
			}*/
			
			if(obj.scaleX != void(0)){
				if(sp.scale.x != obj.scaleX || sp.scale.y != obj.scaleY){
					sp.scale.x = obj.scaleX;
					sp.scale.y = obj.scaleY;
					//obj.width = sp.width;
					//obj.height = sp.height;
				}
			}
			
			
			
			sp.visible = !!obj.isVisible;
			
		},
		
		
		isGroupSelected: function(group){
			return false;
		},
		
		updateSelected: function(){
			console.log("removed");
			
			
			return;
			if(!this.activeObject){
				return;
			}
			this.activeObject = this.getById(this.activeObject.id);
		},
		
		/* TODO: refactor so all can use MagicObject */
		getById: function(id){
			for(var i=0; i<this.loadedObjects.length; i++){
				if(this.loadedObjects[i].data.id == id){
					return this.loadedObjects[i];
				}
			}
		}
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
	TILE_LAYER: 3
};

MT.OBJECT_ADDED = "OBJECT_ADDED";
MT.OBJECT_SELECTED = "OBJECT_SELECTED";
MT.OBJECT_UNSELECTED = "OBJECT_UNSELECTED";
MT.OBJECT_DELETED = "OBJECT_DELETED";
MT.OBJECT_UPDATED = "OBJECT_UPDATED";
MT.OBJECTS_RECEIVED = "OBJECTS_RECEIVED";

MT.OBJECTS_UPDATED = "OBJECTS_UPDATED";
MT.OBJECTS_SYNC = "OBJECTS_SYNC";


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.ObjectManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "om");
		this.project = project;
		
		this.selector = new MT.core.Selector();
		
		this.id = Date.now();
		
		this.activeGroup = null;
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("Objects");
			this.panel.setFree();
			
			var that = this;
			
			this.panel.addOptions([
				{
					label: "Add Group",
					className: "",
					cb: function(){
						that.createGroup();
						that.panel.options.list.hide();
					}
				},
				{
					label: "Add TileLayer",
					className: "",
					cb: function(){
						that.createTileLayer();
						that.panel.options.list.hide();
					}
				},
				{
					label: "Group Selected Objects",
					className: "",
					cb: function(){
						that.groupSelected();
						that.panel.options.list.hide();
					}
				},
				{
					label: "Delete Selected Objects",
					className: "",
					cb: function(){
						that.deleteSelected();
						that.panel.options.list.hide();
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
			
			
			this.tv.on("show", function(item){
				that.update();
			});
			
			this.tv.on("lock", function(item){
				that.update();
			});
			
			this.tv.on("click", function(data, el){
				that.emit(MT.OBJECT_SELECTED, data);
			});
			
			
		},
		
		
		installUI: function(ui){
			var that = this;
			
			var tools = this.project.plugins.tools;
			
			tools.on(MT.OBJECT_SELECTED, function(obj){
				var el = that.tv.getById(obj.id);
				
				if(el){
					if(el.isFolder){
						that.activeGroup = el.data;
					}
					el.addClass("selected.active");
					that.selector.add(el);
				}
			});
			
			tools.on(MT.OBJECT_UNSELECTED, function(obj){
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

			ui.events.on(ui.events.MOUSEUP, function(e){
				that.sync();
			});
			
			this.tv.on("deleted", function(o){
				that.selector.remove(o);
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
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		//add object from asset
		addObject: function( e, obj ){
			if(obj.contents){
				return;
			}
			var no = this.createObject(obj, e.offsetX, e.offsetY);
			this.insertObject(no);
		},
		
		
		insertObject: function(obj, silent, data){
			data = data || this.tv.getData();
			
			
			obj.id = "tmp"+this.mkid();
			
			obj.tmpName = obj.tmpName || obj.name;
			
			var arr = data;
			if(this.activeGroup){
				arr = this.activeGroup.contents;
			}
			
			obj.name = obj.tmpName + this.getNewNameId(obj.tmpName, arr, 0);
			
			arr.splice(0, -1, obj);
			
			obj.index = -1;
			
			if(!silent){
				this.tv.rootPath = this.project.path
				this.tv.merge(data);
				this.update();
				this.sync();
				this.emit(MT.OBJECT_ADDED, obj);
			}
			
			console.log(obj);
			
			return obj;
		},
		
		createObject: function(asset, x, y){
			x = x || 0;
			y = y || 0;
			
			
			var data = this.tv.getData();
			var name = asset.name.split(".");
			name.pop();
			name = name.join("");
			
			return  {
				assetId: asset.id,
				__image: asset.__image,
				x: x,
				y: y,
				type: MT.objectTypes.SPRITE,
				anchorX: asset.anchorX,
				anchorY: asset.anchorY,
				userData: JSON.parse(JSON.stringify(asset.userData || {})),
				physics: JSON.parse(JSON.stringify(asset.physics || {})),
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				alpha: 1,
				tmpName: name,
				frame: 0,
				isVisible: 1,
				isLocked: 0
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
		
		createGroup: function(silent){
			var data = this.tv.getData();
			
			var tmpName= "Group";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			var group = {
				id: "tmp"+this.mkid(),
				name: name,
				x: 0,
				y: 0,
				angle: 0,
				contents: [],
				isVisible: 1,
				isLocked: 0,
				isFixedToCamera: 0,
				alpha: 1
			};
			
			data.unshift(group);
			
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
				tileWidth: 64,
				tileHeight: 64,
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
			var clone = JSON.parse(JSON.stringify(obj));
			clone.name = name;
			clone.x = x;
			clone.y = y;
			
			
			this.cleanUpClone(clone);
			
			
			this.insertObject(clone, silent);
			return clone;
		},
		
		multiCopy: function(arr, cb){
			var data = this.tv.getData();
			var name, obj, clone;
			var out = [];
			
			for(var i=0; i<arr.length; i++){
				obj = arr[i];
				name = obj.name + this.getNewNameId(obj.name, data);
				clone = JSON.parse(JSON.stringify(obj));
				clone.name = name;
				this.cleanUpClone(clone);
				
				if(cb){
					cb(clone);
				}
				
				out.push(clone);
				this.insertObject(clone, true, data);
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
		
		cleanSelection: function(){
			
		},
		
		mkid: function(){
			this.id++;
			
			return this.id;
		},
		
		groupSelected: function(){
			var folder = this.createGroup(true);
			var that = this;
			
			var data = this.tv.getData();
			
			this.selector.forEach(function(el){
				var o = el.data;
				this._delete(o.id, data);
				
				folder.contents.push(o);
				
			}, this);
			
			this.tv.merge(data);
			this.send("updateData", data);
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
					this._syncTm = 0;
					return;
				}
				
				this._lastData = json;
				if(!silent){
					that.emit(MT.OBJECTS_SYNC, data);
				}
				
				that.send("updateData", data);
				that._syncTm = 0;
			}, 100);
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
			
			this.panel.addOptions([
				{
					label: "new Folder",
					className: "",
					cb: function(){
						that.newFolder();
						that.panel.options.list.hide();
					}
				},
				{
					label: "delete selected",
					className: "",
					cb: function(){
						that.deleteSelected();
						that.panel.options.list.hide();
					}
				},
				{
					label: "upload file",
					className: "",
					cb: function(){
						that.upload();
					}
				},
				{
					label: "upload directory",
					className: "",
					cb: function(){
						that.uploadFolder();
					},
					check: function(){
						if(window.navigator.userAgent.indexOf("WebKit") > -1){
							return true;
						}
					}
				}
			]);
			
			this.panel.content.el.setAttribute("hint", "Drop assets here to upload");
			
			
			this.tv = new MT.ui.TreeView([], this.project.path);
			
			this.tv.sortable(this.ui.events);
			
			this.tv.tree.show(this.panel.content.el);
			
			
			var select = function(data, element){
				
				if(data.contents){
					return;
				}
				
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
					that.selector.add(element);
					element.addClass("selected");
				}
				else{
					
					if(data.contents){
						return;
					}
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
				
				that.emit(MT.ASSET_FRAME_CHANGED, that.active.data, that.activeFrame);
				// tiletool uses his own preview
				var tools = that.project.plugins.tools;
				if( tools && tools.activeTool && tools.activeTool != tools.tools.tiletool){
					that.setPreviewAssets(data);
				}
			});
			
			this.tv.on("select", select);
			
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
			
			this.preview.addOptions(this.mkScaleOptions());
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
			
			
			/*
			moved to project globally
			ui.events.on(ui.events.DROP, function(e){
				that.handleDrop(e);
			});
			*/
			
			this.project.on(MT.DROP, function(e, data){
				if(!MT.core.Helper.isImage(data.path)){
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
			panels.active.hide();
			panels.active.show(this.preview.content.el);
			if(panels.active.data.scrollLeft){
				panels.active.content.el.scrollLeft = panels.active.data.scrollLeft;
			}
			if(panels.active.data.scrollTop){
				panels.active.content.el.scrollTop = panels.active.data.scrollTop;
			}
			
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
			var cache = game.cache._images[panel.data.asset.id];
			var ctx = null;
			
			ctx = panel.data.ctx;
			
			var frames = cache.frameData;
			var src = cache.data;
			
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
				var image = cache.data;
				
				panel.data.canvas.width = image.width;
				panel.data.canvas.height = image.height;
				
				ctx.clearRect(0, 0, image.width, image.height);
				
				ctx.drawImage(image, 0, 0);
				
				ctx.strokeStyle = "rgba(0,0,0,0.5);"
				
				
				for(var i=0; i<frames._frames.length; i++){
					
					frame = frames.getFrame(i);
					pixi = PIXI.TextureCache[frame.uuid];
					
					panel.data.rectangles.push(new Phaser.Rectangle(frame.x, frame.y, pixi.width, pixi.height));
					if(this.activeFrame == i){
						ctx.fillStyle = "rgba(0,0,0,0.5);"
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
				pixi = PIXI.TextureCache[frame.uuid];
				
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
				pixi = PIXI.TextureCache[frame.uuid];
				
				src = pixi.baseTexture.source;
				var x = 0;
				var y = 0;
				if(pixi.trim){
					x = pixi.trim.x;
					y = pixi.trim.y;
				}
				
				
				ctx.drawImage(src, frame.x , frame.y, pixi.width, pixi.height, startX, 0, pixi.width, pixi.height);
				
				panel.data.rectangles.push(new Phaser.Rectangle(startX, 0, pixi.width, pixi.height));
				
				
				if(this.activeFrame == i){
					ctx.fillStyle = "rgba(0,0,0,0.5);"
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
			
			for(var i = imgData.frameWidth; i<image.width; i += imgData.frameWidth + imgData.spacing){
				ctx.moveTo(imgData.margin + i+0.5, imgData.margin);
				ctx.lineTo(i+0.5, image.height);
			}
			for(var i = imgData.frameHeight; i<image.height; i += imgData.frameHeight + imgData.spacing){
				ctx.moveTo(imgData.margin + 0, imgData.margin + i+0.5);
				ctx.lineTo(image.width, i+0.5);
			}
			ctx.stroke();
			
			
			var off = imgData.margin + imgData.spacing*Math.floor(image.width / imgData.frameWidth  - imgData.spacing);
			
			var widthInFrames = (image.width - off) / (imgData.frameWidth )    
			
			
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
			
			var select = function(e){
				var frame = that.getFrame(panel.data.asset, e.offsetX, e.offsetY);
				if(frame == that.activeFrame){
					return;
				}
				
				// released mouse outside canvas?
				var asset = panel.data.asset;
				var maxframe = Math.floor(  (asset.width / asset.frameWidth) * (asset.height /asset.frameHeight) - 1) ;
				if(maxframe < frame){
					return;
				}
				
				panel.data.scrollTop = panel.content.el.scrollTop;
				panel.data.scrollLeft = panel.content.el.scrollLeft;
				
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
				
				if(frame == that.activeFrame){
					return;
				}
				
				panel.data.scrollTop = panel.content.el.scrollTop;
				panel.data.scrollLeft = panel.content.el.scrollLeft;
				
				that.activeFrame = frame;
				panel.data.group.active = panel;
				
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
				
				
				that.setPreviewAssets(data);
			};
			
			
			this.project.plugins.tools.on(MT.OBJECT_SELECTED, function(obj){
				if(obj){
					that.pendingFrame = obj.frame;
					that.selectAssetById(obj.data.assetId);
					
					//that.setPreviewAssets(obj);
				}
			});
			
			this.project.plugins.tools.on(MT.OBJECT_UNSELECTED, function(obj){
				
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
				that.project.map.selector.forEach(function(o){
					o.data.assetId = asset.id;
					o.data.__image = asset.__image;
					o.frame = frame;
					
					that.activeFrame = frame;
					that.project.plugins.objectmanager.update();
					that.project.plugins.objectmanager.sync();
				});
				
				that.setPreviewAssets(asset);
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
			var that = this;
			this.project.plugins.mapeditor.cleanImage(asset.id);
			
			var img = new Image();
		
			this.readFile(e.target.files[0], function(fr){
				
				img.onload = function(){
					asset.frameWidth = img.width;
					asset.frameHeight= img.height;
					asset.width = img.width;
					asset.height = img.height;
					
					asset.updated = Date.now();
					
					that.guessFrameWidth(asset);
				 
					that.send("updateImage", {asset: asset, data: fr.result});
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
			
			this.readFile(file, function(fr){
				that.send("addAtlas", {id: asset.id, ext: ext, data: fr.result});
			});
			
		},
		
		getFrame: function(o, x, y){
			
			var gx = Math.floor(x/(o.frameWidth + o.spacing));
			var gy = Math.floor(y/(o.frameHeight + o.spacing));
			
			var maxX = Math.floor( o.width / o.frameWidth);
			
			var frame = gx + maxX * gy;
			
			console.log(frame, "frame");
			
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
			input.type = "file";
			input.onchange = function(e){
				that.handleFiles(this.files);
			};
			input.click();
			
			this.panel.options.list.hide();
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
			
			this.panel.options.list.hide();
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
		
		
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
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
			fr.readAsBinaryString(file);
		},
		
		
		uploadImage: function(file, path){
			if(path.substring(0, 1) != "/"){
				path = "/" + path;
			}
			var that = this;
			this.readFile(file, function(fr){
				that.createImage({
					src: fr.result,
					path: path
				});
			});
		},
		
		createImage: function(fileObj){
			var path = fileObj.path;
			var src = fileObj.src;
			var name = path.split("/").pop();
			var img = new Image();
			var that = this;
			img.onload = function(){
				
				var data = {
					data: src,
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
			};
			img.src = that.toPng(src);
		},
		
		toPng: function(src){
			return "data:image/png;base64,"+btoa(src);
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
		isCloaseable: false,
		
		setFree: function(){
			this.isMovable = true;
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
		
		removeBorder: function(){
			this.addClass("borderless");
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
					console.log("recursivity warning");
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
					console.log("recursivity warning");
					break;
				}
				if(next == this || (next == val && next != this._top)){
					console.log("recursivity warning");
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
			console.log("smth is broken");
			this.show(this._parent, false);
			
			return this;
		},
		hide: function(silent, noEmit){
			if(!this.isVisible){
				return this;
			}
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
				names.push(this.joints[i].name);
			}
			return names;
		},
		
	}
);

//MT/ui/Events.js
MT.namespace('ui');
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
			lastEvent: null,
			lastClick: null
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
		
		enable: function(){
			var that = this;
			for(var i in this.events){
				
				this.addEvent(i);
			}
		},
		
		disable: function(){
			for(var i in this.events){
				document.body.removeEventListener(this._cbs[i].type, this._cbs[i]);
			}
		},
		on: function(type, cb){
			if(!this.events[type]){
				console.warn("new Event:", type);
				this.events[type] = [];
				this.addEvent(type);
			}
			var that = this;
			window.setTimeout(function(){
				that.events[type].push(cb);
			}, 0);
			return cb;
		},
   
		addEvent: function(i){
			var cb = this._mk_cb(i);
			this._cbs.push(cb);
			window.addEventListener(i, cb, false);
			
		},
		
		off: function(type, cb){
			var ev = null;
			
			if(cb !== void(0)){
				ev = this.events[type];
				for(var j=0; j<ev.length; j++){
					if(ev[j] == cb){
						ev[j] = ev[ev.length-1];
						ev.length = ev.length-1;
					}
				}
				return;
			}
			
			for(var i in this.events){
				ev = this.events[i];
				for(var j=0; j<ev.length; j++){
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

				ev[i](data);
			}
		},
   
		
		_mk_mousemove: function(){
			
			var that = this;
			var cb = function(e){
				e.x = e.x || e.pageX;
				e.y = e.y || e.pageY;
				
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
				e.x = e.x || e.pageX;
				e.y = e.y || e.pageY;
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
				e.x = e.x || e.pageX;
				e.y = e.y || e.pageY;
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
				if(!obj.userData){
					obj.userData = {};
				}
				that.table.setData(obj.userData);
				that.table.show(that.panel.content.el);
				that.activeObject = obj;
			};
			
			tools.on(MT.ASSET_FRAME_CHANGED, function(obj){
				updateData(obj);
				that.type = "asset";
				console.log("asset GO");
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
			});
			
			
			var cb = function(val){
				that.change(val);
				that.buildPropTree();
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
(function(){
	var cmPath = "js/cm";
	MT.requireFile(cmPath+"/lib/codemirror.js",function(){
		
		
		
		cmPath += "/addon";
		MT.requireFile(cmPath+"/fold/foldcode.js");
		MT.requireFile(cmPath+"/fold/foldgutter.js");
		MT.requireFile(cmPath+"/fold/brace-fold.js");
		MT.requireFile(cmPath+"/fold/xml-fold.js");
		MT.requireFile(cmPath+"/edit/matchbrackets.js");
		MT.requireFile(cmPath+"/search/searchcursor.js");
		MT.requireFile(cmPath+"/search/search.js");
		MT.requireFile(cmPath+"/dialog/dialog.js");
		
		
		MT.requireFile(cmPath+"/search/match-highlighter.js");
		MT.requireFile(cmPath+"/hint/show-hint.js");
		MT.requireFile(cmPath+"/hint/javascript-hint.js");
		MT.requireFile(cmPath+"/hint/anyword-hint.js");
		MT.requireFile(cmPath+"/comment/comment.js");
		MT.requireFile(cmPath+"/selection/active-line.js");
		MT.requireFile(cmPath+"/scroll/scrollpastend.js");
		MT.requireFile(cmPath+"/hint/show-hint.js");
		MT.requireFile(cmPath+"/hint/anyword-hint.js");
		
		MT.requireFile("js/jshint.js");
		
		
		var addCss = function(src){
			var style = document.createElement("link");
			style.setAttribute("rel", "stylesheet");
			style.setAttribute("type", "text/scc");
			style.setAttribute("href", src);
			document.head.appendChild(style);
		};
		
		
		addCss("css/codemirror.css");
		addCss(cmPath+"/hint/show-hint.css");
		addCss(cmPath+"/fold/foldgutter.css");
		addCss(cmPath+"/dialog/dialog.css");
		
		addCss("css/cm-tweaks.css");
		
	});
})();

MT.extend("core.BasicPlugin")(
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
				undoredo.disable();
				MT.events.simulateKey(MT.keys.ESC);
				
				that.addButtons(tools.panel);
				
				that.leftPanel.width = parseInt(that.leftPanel.style.width);
				
				//window.setTimeout(function(){
					
				//}, 1);
				
			});
			this.panel.on("unselect", function(){
				tools.panel.content.show();
				zoombox.show();
				ampv.show();
				undoredo.enable();
				window.getSelection().removeAllRanges();
				
				that.removeButtons();
				//window.setTimeout(function(){
					that.ui.loadLayout(null, 0);
				//}, 1);
			});
			
			this.project.on(MT.DROP, function(e, data){
				if(!MT.core.Helper.isSource(data.path)){
					return;
				}
				console.dir(e.target);
				var item = that.tv.getOwnItem(e.target);
				if(item && item.data.contents){
					data.path = item.data.fullPath + data.path;
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
			var data = this.tv.getData();
		},
		
		uploadFile: function(data){
			this.send("uploadFile", data);
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
					needFocus: true
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
			
			this.send("getContent", data);
			return panel;
		},
		
		a_fileContent: function(data){
			var ext = data.name.split(".").pop();
			var mode = this.guessMode(ext);
			
			
			var that = this;
			this.loadMode(mode, function(){
				var doc = that.documents[data.fullPath].data.doc;
				that.documents[data.fullPath].data.src = data.src;
				
				if(!doc){
					doc = CodeMirror.Doc(data.src, mode, 0);
					that.documents[data.fullPath].data.doc = doc;
				}
				
				that.editor.swapDoc(doc);
				that.documents[data.fullPath].show();
				that.loadDoc(that.documents[data.fullPath]);
				
			});
		},
		
		loadDoc: function(panel){
			
			if(this.editorElement.parentNode){
				this.editorElement.parentNode.removeChild(this.editorElement);
			}
			panel.content.el.appendChild(this.editorElement);
			this.editor.swapDoc(panel.data.doc);
			
			var that = this;
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
					
					"Ctrl-/": "toggleComment",
					
					"Ctrl-Space": "autocomplete",
					
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
					}
				},
				gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-jslint"],
				highlightSelectionMatches: {showToken: /\w/},
				
				onCursorActivity: function() {
					editor.matchHighlight("CodeMirror-matchhighlight");
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
			});
			this.editor.on("keyup", function(ed, e){
				
				//move up/down
				if(e.altKey && (e.which == MT.keys.UP || e.which == MT.keys.DOWN) ){
					var line = ed.state.activeLines[0];
					var c = ed.getCursor();
					if(e.ctrlKey){
						
					}
					
					
					
					e.preventDefault();
					return false;
				}
			});
			
			this.editor.on("keyHandled", function(ed, a,b,c){
				console.log(a,b,c);
				return;
				e.preventDefault();
				e.stopPropagation();
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
					loopfunc: true,
					predef: {
						"Phaser": Phaser,
						"mt": false,
						"console": false
					},
					laxcomma: false
				};
				
				
				
				/*for(var i in Import){
					conf.predef[i] = false;
				}*/
				
				/*var globalScope = that.sourceEditor.content.plugins.Map.map;
				if(globalScope){
					for(var i in globalScope){
						conf.predef[i] = false;
					}
				}*/
				
				JSHINT(that.editor.getValue(), conf);
				
				for (var i = 0; i < JSHINT.errors.length; ++i) {
					var err = JSHINT.errors[i];
					if (!err) continue;
					
					var msg = document.createElement("a");
					msg.errorTxt = err.reason;
					
					/*msg.addEventListener("click",function(){
						copyToClipboard(this.errorTxt);
					});*/
					
					var icon = msg.appendChild(document.createElement("span"));
					
					icon.innerHTML = "!";
					icon.className = "lint-error-icon";
					
					var text = msg.appendChild(document.createElement("span"));
					text.className = "lint-error-text";
					text.appendChild(document.createTextNode(err.reason));
					
					//var evidence = msg.appendChild(document.createElement("span"));
					//evidence.className = "lint-error-text evidence";
					//evidence.appendChild(document.createTextNode(err.evidence));
					
					msg.className = "lint-error";
					that.editor.setGutterMarker(err.line - 1,"CodeMirror-jslint", msg);
				}
			});
		},
		
		checkChanges: function(){
			if(!this.activePanel){
				return;
			}
			this.updateHints();
			var data = this.activePanel.data;
			if(data.src != data.doc.getValue()){
				this.activePanel.mainTab.title.innerHTML = data.data.name + "*";
			}
			else{
				this.activePanel.mainTab.title.innerHTML = data.data.name;
			}
			
			
		},
		
		
		checkChangesAndAskSave: function(panel){
			var data = panel.data;
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
			var mode = {};
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
			var o = this.map.activeObject.object;
			if(o){
				this.locateXY(o.x + (o.width*(0.5 - o.anchor.x)), o.y + (o.height*(0.5 - o.anchor.y)));
			}
			else{
				this.map.game.camera.x = 0;
				this.map.game.camera.y = 0;
			}
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
MT.extend("core.BasicPlugin")(
	MT.plugins.FontManager = function(project){
		MT.core.BasicPlugin.call(this, "Analytics");
		this.project = project;
	},
	{
		loadFont: function(font, cb){
			// <link href='http://fonts.googleapis.com/css?family=Faster+One' rel='stylesheet' type='text/css'>
			var fontUrl = font.replace(/ /gi, "+");
			var link = document.createElement("link");
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("type", "text/css");
			link.onload = function(e){
				var sp = document.createElement("span");
				sp.style.fontFamily = font;
				sp.innerHTML = "ignore";
				sp.style.visibility = "hidden";
				document.body.appendChild(sp);
				window.setTimeout(function(){
					document.body.removeChild(sp);
				}, 5000);
				cb(font);
			};
			
			link.href="//fonts.googleapis.com/css?family="+fontUrl;
			
			document.head.appendChild(link);
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
					label: "Video",
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
			w.opener=null; w.location.href="https://www.youtube.com/watch?v=7dk2naCCePc";
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
			button.onclick = cb;
			
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
		}



	}
);
//MT/core/keys.js
MT.namespace('core');
MT.keys = MT.core.keys = {
	ESC: 27,
	ENTER: 13,
	UP: 38,
	LEFT: 37,
	RIGHT: 39,
	DOWN: 40,
	DELETE: 46,
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	V: 86,
	TAB: 9
};

MT.const = {
	IMAGES: "image/*",
	DATA: "application/json|application/xml"
};
//MT/plugins/list.js
MT.namespace('plugins');
MT.plugins.list = 1;

MT.require("plugins.AssetManager");
MT.require("plugins.ObjectManager");
MT.require("plugins.MapEditor");
MT.require("plugins.Settings");
MT.require("plugins.Export");
MT.require("plugins.Tools");
MT.require("plugins.UndoRedo");
MT.require("plugins.DataLink");
MT.require("plugins.Analytics");

//MT/Socket.js
MT.namespace('');
MT.extend("core.Emitter")(
	MT.Socket = function(url, autoconnect){
		if(url){
			this.url = url;
		}
		else{
			this.url = "ws://"+window.location.host;
		}
		
		if(autoconnect !== false){
			this.connect();
		}
		
		this.callbacks = {};

		
		this._toSend = [];
		
		this.sendObject = {
			channel: "",
			action: "",
			data: null
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
			
			this.ws.onopen = function(e){
				that.emit("core","open");
			};
			
			this.ws.onmessage = function (event) {
				var data = JSON.parse(event.data);
				that.emit(data.channel, data.action, data.data);
			};
			
			this.ws.onerror = function(err){
				console.error(err);
			};
			
			this.ws.onclose = function(){
				console.log("WS close");
				that.emit("core","close");
				window.setTimeout(function(){
					that.connect();
				},1000);
			};
			
			return this.connection;
		},
		
		send: function(channel, action, data){
			if(this.ws.readyState == this.ws.OPEN){
				this.sendObject.channel = channel;
				this.sendObject.action = action;
				this.sendObject.data = data;
				this.ws.send(JSON.stringify(this.sendObject));
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
		}
		
	}
);

MT.Socket.TYPE = {
	open: "open",
	close: "close",
	message: "message",
	error: "error"
};
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
			
			window.x = activePanel;
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
			that.saveLayout();
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
		}, 2000);
		
		
		this.colorPicker = new MT.ui.ColorPicker(this);
		this.colorPicker.hide();
	},
	{
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
			if(!panel.isMovable){
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
		
		loadLayout: function(layout, slot){
			if(slot != void(0)){
				this.saveSlot = slot;
			}
			console.log("loading from slot", this.saveSlot);
			
			layout = layout || JSON.parse(localStorage.getItem("ui-"+this.saveSlot));
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
		
		
		resetLayout: function(slot){
			var toLoad = {"__box":{"x":40,"y":29,"width":719,"height":612},"__oldScreenSize":{"width":990,"height":938},
				"SourceEditor":{
					"x":40,"y":29,"width":679,"height":583, "dockPosition":5,"isVisible":false,"isDocked":true,
					"savedBox": {"x":0, "y":0, "width":0, "height":0}
				},
				"Settings": {
					"x":719,"y":580.125,"width":271,"height":357.875,"dockPosition":2,"isVisible":true,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":250,"height":400},"joints":["Settings","physics","userData"], "top":"Objects", "bottom":null
				},
				"Assets":{
					"x":719,"y":29,"width":271,"height":193.25,"dockPosition":2,"isVisible":true,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":250,"height":400},
					"joints":[],"top":null,"bottom":"Objects"
				},
				"assetPreview":{
					"x":40,"y":612,"width":679,"height":300,"dockPosition":4,"isVisible":true,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":250,"height":400},
					"joints":[],"top":null,"bottom":null
				},
				"Objects":{
					"x":719,"y":222.25,"width":271,"height":357.875,"dockPosition":2,"isVisible":true,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":250,"height":400},"joints":[],"top":"Assets","bottom":"Settings"
				},
				"Map editor":{
					"x":40,"y":29,"width":679,"height":583,"dockPosition":5,"isVisible":true,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":0,"height":0},"joints":["Map editor","SourceEditor"],"top":null,"bottom":null
				},
				"toolbox":{
					"x":0,"y":29,"width":40,"height":909,"dockPosition":1,"isVisible":true,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":40,"height":400},"joints":[],"top":null,"bottom":null
				},
				"Project":{
					"x":0,"y":0,"width":990,"height":29,"dockPosition":3,"isVisible":true,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":250,"height":29},"joints":[],"top":null,"bottom":null
				},
				"physics":{
					"x":719,"y":580.125,"width":271,"height":357.875,"dockPosition":2,"isVisible":false,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":0,"height":0},"joints":["Settings","physics","userData"],"top":"Objects","bottom":null
				},
				"userData":{
					"x":719,"y":580.125,"width":271,"height":357.875,"dockPosition":2,"isVisible":false,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":0,"height":0},"joints":["Settings","physics","userData"],"top":"Objects","bottom":null
				},
				"Map Manager":{
					"x":40,"y":912,"width":679,"height":26,"dockPosition":4,"isVisible":true,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":250,"height":26},"joints":[],"top":null,"bottom":null
				},
				"color":{
					"x":656,"y":411,"width":305,"height":200,"dockPosition":0,"isVisible":false,"isDocked":false,
					"savedBox":{"x":0,"y":0,"width":305,"height":200},"joints":[],"top":null,"bottom":null
				},
				"Text":{
					"x":40,"y":29,"width":679,"height":30,"dockPosition":0,"isVisible":false,"isDocked":false,
					"savedBox":{"x":0,"y":0,"width":944,"height":30},"joints":[],"top":null,"bottom":null
				},
				"file-list-holder":{
					"x":0,"y":0,"width":0,"height":0,"dockPosition":0,"isVisible":true,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":250,"height":400},"joints":[],"top":null,"bottom":null
				},
				"source-editor":{"x":0,"y":0,"width":0,"height":0,"dockPosition":0,"isVisible":true,"isDocked":true,
					"savedBox":{"x":0,"y":0,"width":250,"height":400},"joints":[],"top":null,"bottom":null
				}
			};
			
			var str = JSON.stringify(toLoad);
			if(slot != void(0)){
				localStorage.setItem("ui-"+slot, str);
			}
			else{
				var key;
				for(var i=0; i<localStorage.length; i++){
					key = localStorage.key(i);
					if(key.substring(0, 3) == "ui-"){
						localStorage.setItem(key, str);
					}
				}
			}
			
			this.loadLayout();
		},
		
		saveLayout: function(slot){
			this.refresh();
			if(slot != void(0)){
				this.saveSlot = slot;
			}
			
			console.log("saving in slot", this.saveSlot);
			
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
			localStorage.setItem("ui-"+this.saveSlot, str);
		},
		
		getSavedLayout: function(){
			console.log("toLoad = ", localStorage.getItem("ui-"+this.saveSlot) );
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

MT.DROP = "drop";


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.core.Project = function(ui, socket){
		MT.core.BasicPlugin.call(this, "Project");
		
		this.data = {
			backgroundColor: "#666666",
			sourceEditor:{
				fontSize: 12
			}
		};
		
		window.pp = this;
		
		this.plugins = {};
		
		this.pluginsEnabled = [
			"AssetManager",
			"ObjectManager",
			"MapEditor",
			"Tools",
			"Settings",
			"Export",
			
			"UndoRedo",
			"DataLink",
			"Analytics",
			"HelpAndSupport",
			"FontManager",
			"MapManager",
			"SourceEditor",
			"GamePreview",
			"Physics",
			"UserData"
		];
		
		for(var id=0, i=""; id<this.pluginsEnabled.length; id++){
			i = this.pluginsEnabled[id];
			this.plugins[i.toLowerCase()] = new MT.plugins[i](this);
		}
		
		this.am = this.plugins.assetmanager;
		this.om = this.plugins.objectmanager;
		this.map = this.plugins.mapeditor;
		//this.settings = this.plugins.settings;
		
		this.ui = ui;
		
		//this.initUI(ui);
		this.initSocket(socket);
		
	},
	{
		a_maintenance: function(data){
			var seconds = data.seconds;
			var content = "System will go down for maintenance in ";
			var desc = "<p>All your current work in progress has been saved.</p><p>Please wait. Editor will reload automatically.</p>";
			
			if(data.type == "new"){
				content = "System is being maintained. Will be back in ";
				desc = "<p>Please wait. Editor will reload automatically.</p>";
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
		
		a_selectProject: function(info){
			this.id = info.id;
			window.location.hash = info.id;
			this.path = "data/projects/"+info.id;
			
			this.a_getProjectInfo(info);
			
			this.initUI(this.ui);
			this.initPlugins();
			
			this.setUpData();
			
			localStorage.setItem(info.id, JSON.stringify(info));
			
			
		},
		
		setUpData: function(){
			document.body.style.backgroundColor = this.data.backgroundColor;
			
			this.emit("updateData", this.data);
		},
		
		a_newProject: function(){
			this.newProject();
		},
		
		a_needUpdate: function(){
			var that = this;
			var pop = new MT.ui.Popup("Update Project", "");
			pop.removeHeader();
			
			pop.el.style.width = "50%";
			pop.el.style.height= "40%";
			pop.el.style["min-height"] = "200px"
			pop.el.style.top= "20%";
			
			
			var p = new MT.ui.Panel("Update Project");
			//p.removeHeader()
			
			p.hide().show(pop.content).fitIn();
			p.removeBorder();
			
			var cont = document.createElement("div");
			cont.innerHTML = "Enter project title";
			cont.style.margin = "20px 10px";
			p.content.el.appendChild(cont);
			
			
			
			var prop = {
				title: "New Game",
				namespace: "NewGame"
			};
			
			var iName = new MT.ui.Input(this.ui, {key: "title", type: "text"}, prop);
			var iNs = new MT.ui.Input(this.ui, {key: "namespace", type: "text"}, prop);
			
			iName.show(p.content.el);
			iNs.show(p.content.el);
			
			iName.enableInput();
			
			iName.on("change", function(n, o){
				iNs.setValue(n.replace(/\W/g, ''));
			});
			
			
			pop.addButton("Update", function(){
				that.send("updateProject", prop);
				pop.hide();
			});
			
		},
		
		a_getProjectInfo: function(data){
			for(var i in data){
				this.data[i] = data[i];
			}
		},
		
		// user get here without hash
		newProject: function(){
			var that = this;
			var pop = new MT.ui.Popup("Welcome to MightyEditor", "");
			pop.y = (window.innerHeight - 510)*0.45;
			pop.showClose();
			
			pop.bg.style.backgroundColor = "rgba(10,10,10,0.3)";
			
			pop.addClass("starting-popup");
			var logo = document.createElement("div");
			pop.content.appendChild(logo);
			logo.className = "logo";
			
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
			
			
			var projects = document.createElement("div");
			pop.content.appendChild(projects);
			projects.innerHTML = '<span class="label">Recent Projects</span>';
			projects.className = "project-list";
			
			
			var list = document.createElement("div");
			list.className = "list-content";
			var items = [];
			var tmp = null;
			for(var i=0; i<localStorage.length; i++){
				key = localStorage.key(i);
				if(key.substring(0, 3) !== "ui-" && key != "UndoRedo"){
					tmp = JSON.parse(localStorage.getItem(key));
					if(tmp.id){
						items.push(tmp );
					}
					else{
						items.push({
							id: key,
							title: key
						});
					}
				}
			}
			
			var p;
			for(var i=0; i<items.length; i++){
				p = document.createElement("div");
				p.className = "projectItem"
				p.innerHTML = items[i].title + " ("+items[i].id+")";
				p.project = items[i].id;
				
				list.appendChild(p);
			}
			list.onclick = function(e){
				e.preventDefault();
				if(e.target.project){
					window.location.hash = e.target.project;
					window.location.reload();
				}
				
			};
			
			projects.appendChild(list);
			
			pop.on("close", function(){
				that.newProjectNext();
			});
		},
		
		newProjectNext: function(){
			var that = this;
			var pop = new MT.ui.Popup("New Project", "");
			pop.removeHeader();
			
			pop.el.style.width = "50%";
			pop.el.style.height= "40%";
			pop.el.style["min-height"] = "200px"
			pop.el.style.top= "20%";
			
			
			var p = new MT.ui.Panel("New Project");
			//p.removeHeader()
			
			p.hide().show(pop.content).fitIn();
			p.removeBorder();
			
			var cont = document.createElement("div");
			cont.innerHTML = "Enter project title";
			cont.style.margin = "20px 10px";
			p.content.el.appendChild(cont);
			
			
			
			var prop = {
				title: "New Game",
				namespace: "NewGame"
			};
			
			var iName = new MT.ui.Input(this.ui, {key: "title", type: "text"}, prop);
			var iNs = new MT.ui.Input(this.ui, {key: "namespace", type: "text"}, prop);
			
			iName.show(p.content.el);
			iNs.show(p.content.el);
			
			iName.enableInput();
			
			iName.on("change", function(n, o){
				iNs.setValue(n.replace(/\W/g, ''));
			});
			
			
			pop.addButton("Create", function(){
				that.send("newProject", prop);
				pop.hide();
			});
			//this.send("newProject");
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
				
				that.setPop.show();
			});
			
			
			this.list = new MT.ui.List([
				{
					label: "Home",
					className: "",
					cb: function(){
						window.location = window.location.toString().split("#")[0];
					}
				},
				{
					label: "Clone",
					className: "",
					cb: function(){
						window.location = window.location.toString()+"-copy";
						window.location.reload();
					}
				}
			], ui, true);
			
			var b = this.button = this.panel.addButton("Project", null, function(e){
				e.stopPropagation();
				that.showList();
			});
			
			this.ui.events.on("hashchange", function(){
				console.log("hash changed", "reload?");
				window.location.reload();
			});
			
		},
		
		createSettings: function(){
			var that = this;
			var lastData;
			
			
			this.setPop = new MT.ui.Popup("","");
			this.setPop.removeHeader();
			
			this.setPop.style.height = "50%";
			this.setPop.style.width = "70%";
			this.setPop.y = 200;
			
			
			this.setInputs = {
				bgColor: new MT.ui.Input(this.ui, {key: "backgroundColor", type: "color"}, this.data),
				srcEdFontSize: new MT.ui.Input(this.ui, {key: "fontSize", type: "number"}, this.data.sourceEditor)
				
			};
			
			
			this.setInputs.bgColor.on("change", function(val){
				document.body.style.backgroundColor = val;
			});
			
			this.setInputs.srcEdFontSize.on("change", function(val){
				that.setUpData();
			});
			
			this.setFields = {
				ui: new MT.ui.Fieldset("UI"),
				sourceEditor: new MT.ui.Fieldset("SourceEditor")
			};
			
			
			
			
			this.setPop.on("show", function(){
				console.log("pop show");
				lastData = JSON.stringify(that.data);
			});
			
			this.setPanel = new MT.ui.Panel("Editor Properties");
			this.setPanel.removeBorder();
			
			this.setPanel.hide().show(this.setPop.content).fitIn();
			
			this.setPop.hide();
			
			
			this.setPop.addButton("Save", function(){
				that.setPop.hide();
				that.send("saveProjectInfo", that.data);
				that.emit("updateData", that.data);
			});
			this.setPop.addButton("Cancel", function(){
				that.setPop.hide();
				that.data = JSON.parse(lastData);
				
				that.setInputs.bgColor.setValue(that.data.backgroundColor);
				that.setInputs.srcEdFontSize.setValue(that.data.sourceEditor.fontSize);
				that.setUpData();
			});
			
			this.setButtons = {
				resetLayout: new MT.ui.Button("Reset Layout", "", null, function(){
					that.ui.resetLayout();
				})
			};
			
			
			this.setInputs.bgColor.show(this.setFields.ui.el);
			this.setButtons.resetLayout.show(this.setFields.ui.el);
			
			this.setInputs.srcEdFontSize.show(this.setFields.sourceEditor.el);
			
			
			
			for(var i in this.setFields){
				this.setPanel.content.el.appendChild(this.setFields[i].el);
				this.setFields[i].addClass("full");
			}
			
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
			fr.readAsBinaryString(file);
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
			
			var pid = window.location.hash.substring(1);
			if(pid != ""){
				this.loadProject(pid);
			}
			else{
				this.newProject();
			}
		}
	}
);
(function(window){
	"use strict";
	
	window.MT = createClass("MT");
	MT.require("core.Project");
	MT.require("ui.Controller");
	MT.require("Socket");

	MT.onReady(main);
	
	var loaded = false;
	// hack for minimiser
	if(typeof document !== "undefined"){
		var img = new Image();
		img.onload = function(){
			if(!loaded){
				document.body.appendChild(img);
			}
		};
		img.src = "img/icons/loadingbar.gif";
		img.className = "loadingImage";
	}

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
				if(img.parentNode){
					img.parentNode.removeChild(img);
				}
				
				new MT.core.Project(new MT.ui.Controller(), socket);
			}
			if(type == "close"){
				document.body.innerHTML = "";
				hasClosed = true;
			}
		});
	}
	
})(window);
