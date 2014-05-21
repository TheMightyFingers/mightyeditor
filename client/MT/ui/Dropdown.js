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
			if(e.which == MT.keys.enter){
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
				catch(e){}
				
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
			list = this.list = new MT.ui.List(options.list, ui, true);
			
			if(options.listStyle){
				list.width = options.listStyle.width;
			}
			
			
			list.on("show", function(){
				var b = button.el.getBoundingClientRect();
				console.log(b);
				
				list.style.top = (b.top + b.height)+"px";
				list.style.left = b.left+"px";
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

		
		
	},
	{
		set value(val){
			this.button.text = val;
			this.input.value = val;
		},
		
		get value(val){
			return this.button.text;
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