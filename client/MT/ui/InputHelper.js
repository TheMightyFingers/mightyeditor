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
