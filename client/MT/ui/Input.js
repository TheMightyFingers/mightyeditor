MT.extend("ui.DomElement").extend("core.Emitter")(
	MT.ui.Input = function(events, properties, obj){
		MT.ui.DomElement.call(this);
		MT.core.Emitter.call(this);
		
		this.obj = obj;
		this.key = "";
		this.step = 1;
		
		this.min = -Infinity;
		this.max = Infinity;
		
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
		}
		
		
		this.input = document.createElement("input");
		this.addClass("ui-input");
		
		this.label = new MT.ui.DomElement();
		this.addChild(this.label).show();
		
		this.label.el.innerHTML = this.key;
		this.label.style.bottom = "initial";
		this.label.style.right = "50%";
		
		
		this.value = new MT.ui.DomElement();
		this.addChild(this.value).show();
		
		this.value.el.innerHTML = obj[this.key];
		this.value.style.bottom = "initial";
		this.value.style.left = "initial";
		this.value.style.right = 0;
		this.value.addClass("ui-input-value");
		
		
		
		var that = this;
		
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
			document.body.appendChild(input);
			input.style.top = ( that.value.calcOffsetY(input.parentNode) - 10 ) + "px";
			input.style.left = ( that.value.calcOffsetX(input.parentNode) - that.value.el.parentNode.offsetWidth*0.5 + 30) + "px";
			input.style.width = that.value.el.parentNode.parentNode.offsetWidth*0.5 + "px";
			input.value = that.obj[that.key];
			input.focus();
			input.isVisible = true;
			input.width = that.value.offsetWidth + "px";
			
			input.setSelectionRange(0, input.value.length);
			that.value.el.innerHTML = "";
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
			
			if(w == MT.keys.esc){
				input.value = obj[that.key];
				input.blur();
			}
			
			if(w == MT.keys.enter){
				input.blur();
			}
			
			
		});
		
		this.onwheel = events.on("wheel", function(e){
			if(e.target == that.value.el){
				var d = (e.wheelDelta > 0 ? 1 : -1);
				that.obj[that.key] += d*that.step;
				that.setValue(obj[that.key]);
			}
			
		});
		
		this.mouseup = events.on("mouseup",function(){
			down = false;
		});
		
		this.mousemove = events.on("mousemove",function(){
			if(!down){
				return;
			}
			that.obj[that.key] -= events.mouse.my*that.step;
			that.setValue(that.obj[that.key]);
		});
		
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
		
		setValue: function(val, silent){
			
			if(val < this.min){
				val = this.min;
			}
			
			if(val > this.max){
				val = this.max;
			}
			
			this.obj[this.key] = val;
			this.value.el.innerHTML = val;
			if(!silent){
				this.emit("change", val);
			}
		},
		
		evalValue: function(val){
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
