/**
 * usage new MT.ui.Input(MT.events, key, object);
 */

"use strict";

MT.extend("ui.DomElement").extend("core.Emitter")(
	MT.ui.Input = function(events, properties, obj){
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
		
		this.label = new MT.ui.DomElement();
		this.label.setAbsolute();
		
		this.addChild(this.label).show();
		
		this.input = document.createElement("input");
		this.addClass("ui-input");
		
		
		this.label.el.innerHTML = this.key;
		this.label.style.bottom = "initial";
		this.label.style.right = "50%";
		
		
		this.value = new MT.ui.DomElement();
		this.value.setAbsolute();
		
		
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
		
		this.setValue(this.object[this.key], true);
		
		this.addChild(this.value).show();
		this.value.style.bottom = "initial";
		this.value.style.left = "initial";
		this.value.style.right = 0;
		this.value.addClass("ui-input-value");
		
		
		var down = false;
		this.value.el.onmousedown = function(){
			down = true;
		};

		

		this.events = events;
		
		
		var input = document.createElement("input");
		input.style.position = "absolute";
		input.type = "text";
		input.className = "ui-input";
		input.isVisible = false;
		input.style.textAlign = "right";
		input.style.paddingRight = "10px";
		

		this.value.el.ondblclick = function(){
			
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
		
		input.onblur = function(){
			input.parentNode.removeChild(input);
			input.isVisible = false;
			
			var val = that.evalValue(input.value);
			that.setValue(val);
		};
		
		
		this.keyup = events.on("keyup", function(e){
			if(!input.isVisible){
				return;
			}
			var w = e.which;
			
			if(w == MT.keys.ESC){
				input.value = that.object[that.key];
				input.blur();
			}
			
			if(w == MT.keys.ENTER){
				input.blur();
			}
			
			
		});
		
		if(this.type == "number"){
		
			this.onwheel = events.on("wheel", function(e){
				if(e.target !== that.value.el){
					return;
				}
				var d = ( (e.wheelDelta || -e.deltaY) > 0 ? 1 : -1);
				var val = that.object[that.key] + d*that.step;
				that.setValue(val);
			});
			
			this.mouseup = events.on("mouseup",function(){
				down = false;
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
		
		setObject: function(obj){
			
			this.object = obj;
			this.update();
		},
		
		setValue: function(val, silent){
			if(val < this.min){
				val = this.min;
			}
			
			if(val > this.max){
				val = this.max;
			}
			
			var oldValue = this.object[this.key];
			
			this.object[this.key] = val;
			
			if(typeof val == "number"){
				this.value.el.innerHTML = parseFloat(val.toFixed(8));
			}
			else{
				this.value.el.innerHTML = val;
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
		}
		
		
		
		
		
		
	}
);
