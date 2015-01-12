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
