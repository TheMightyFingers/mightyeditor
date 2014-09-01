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