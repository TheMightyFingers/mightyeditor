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
			else{
				that.emit("update", input.value);
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
				var top;
				
				if(list.el.offsetTop + list.panel.content.el.offsetHeight > window.innerHeight){
					top = b.top - list.panel.content.el.offsetHeight;
					if(top > 0){
						list.style.top = top+"px";
					}
					if(list.panel.content.el.offsetHeight > 0){
						list.style.maxHeight = "350px";
						list.style.overflow = "auto";
					}
					
				}
				if(options.listStyle){
					list.style.minWidth = options.listStyle.width;
				}
				
			});
			
			list.on("hide", function(){
				that.hide();
			});
			that.on("hide", function(){
				list.hide();
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
		
		
		this.on("show", function(){
			button.addClass("active");
		});
		
		this.on("hide", function(){
			button.removeClass("active");
		});
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