"use strict";
MT.require("ui.Button");
MT.require("ui.ColorPalette");


MT.extend("ui.Panel")(
	MT.ui.TextColorPicker = function(ui){
		var that = this;
		
		
		this.data = {
			stroke: "#000000",
			fill: "#000000",
			shadow: "#000000"
		};
		
		MT.ui.Panel.call(this, "", ui.events);
		this.ui = ui;
		
		
		this.stroke = new MT.ui.Button("Stroke", "ui-text-colorpicker-stroke", null, function(){
			that.select("stroke");
		});
		this.stroke.width = "auto";
		
		
		this.fill = new MT.ui.Button("Fill", "ui-text-colorpicker-fill", null, function(){
			that.select("fill");
		});
		this.fill.width = "auto";
		this.fill.addClass("active");
		this.active = "fill";
		
		
		this.shadow = new MT.ui.Button("Shadow", "ui-text-colorpicker-shadow", null, function(){
			that.select("shadow");
		});
		this.shadow.width = "auto";
		
		
		this.addButton(this.fill);
		this.addButton(this.stroke);
		this.addButton(this.shadow);
		
		
		this.addClass("ui-text-colorpicker");
		
		this.width = 249;
		this.height = 350;
		
		
		this.colorPalette = new MT.ui.ColorPalette(function(color){
			console.log("picked color", color, that.active);
		});
		
		this.content.addChild(this.colorPalette);
		this.colorPalette.y = 25;
		this.colorPalette.height = 200;
		
	},
	{
		select: function(type){
			this.active = type;
			
			this.stroke.removeClass("active");
			this.fill.removeClass("active");
			this.shadow.removeClass("active");
			
			this[type].addClass("active");
			
		},


	}
);