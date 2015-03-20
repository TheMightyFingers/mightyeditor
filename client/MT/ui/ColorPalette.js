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