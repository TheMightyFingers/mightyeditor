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