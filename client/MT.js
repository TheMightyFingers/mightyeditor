window.MT = createClass('MT')
//MT/ui/ColorPalette.js
MT.namespace('ui');
"use strict";

MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.ColorPalette = function(onChange){
		MT.ui.DomElement.call(this);
		var that = this;
		this.addClass("ui-colorpalette");
		this.nodes = [];
		
		this.createPalette();
		this.el.onclick = function(e){
			console.log("clicked", e.target.style.backgroundColor);
			if(onChange && e.target.color){
				onChange(e.target.color);
				that.emit("change", e.target.color);
			}
		};
		/*this.el.onmousemove = function(e){
			console.log("clicked", e.target.style.backgroundColor);
			if(e.target.color){
				that.emit("hover", e.target.color);
			}
		};*/
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
//MT/core/BasicTool.js
MT.namespace('core');
MT(
	MT.core.BasicTool= function(tools){
		this.tools = tools;
		this.project = tools.project;
	},
	{
		// called once per tool - by default adds tool button on side panel
		initUI: function(ui){
			var that = this;
			this.ui = ui;
			this.button = this.tools.panel.addButton("", "tool."+this.name, function(){
				that.tools.setTool(that);
			});
			
		},
		// called when tool has been selected
		init: function(){
			console.log("TODO: init");
			this.activate();
		},
		// proxy for init - probably better naming
		activate: function(){
			
		},
		
		// called when object has been selected and tool is active
		select: function(object){
			console.log("TODO: select", object);
		},
		// on mouse down
		mouseDown: function(e){
			console.log("TODO: mousedown");
		},
		// on mouse up
		mouseUp: function(e){
			console.log("TODO: mouseup");
		},
		// on mouse move
		mouseMove: function(){
			console.log("TODO: mouse move");
		},
		// called before another tool has been selected
		deactivate: function(){
			console.log("TODO: deactivate");
			this.deinit();
		},
		
		// proxy to deactivate - probably better naming
		deinit: function(){
			
		}

	}
);
//MT/ui/TextColorPicker.js
MT.namespace('ui');
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
		this.height = 260;
		
		
		this.colorPalette = new MT.ui.ColorPalette(function(color){
			console.log("picked color", color, that.active);
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
		this.colorInput = new MT.ui.Input(MT.events, {key: "color", type: "color"}, this);
		this.colorInput.style.top = "auto";
		this.colorInput.style.bottom = "70px";
		this.colorInput.on("change", function(val){
			that.change();
		});
		this.addChild(this.colorInput);
		
		
		// add stroke options
		this.strokeThickness = 0;
		this.strokeThicknessInput = new MT.ui.Input(MT.events, {key: "strokeThickness", min: 0, step: 1}, this);
		this.strokeThicknessInput.style.top = "auto";
		this.strokeThicknessInput.style.bottom = "50px";
		this.strokeThicknessInput.on("change", function(val){
			that.change();
		});
		
		
		
		// add shadow options
		this.shadowX = 0;
		this.shadowXInput =  new MT.ui.Input(MT.events, {key: "shadowX", step: 1}, this);
		this.shadowXInput.style.top = "auto";
		this.shadowXInput.style.bottom = "50px";
		this.shadowXInput.on("change", function(val){
			that.change();
		});
		
		
		this.shadowY = 0;
		this.shadowYInput =  new MT.ui.Input(MT.events, {key: "shadowY", step: 1}, this);
		
		this.shadowYInput.style.top = "auto";
		this.shadowYInput.style.bottom = "30px";
		this.shadowYInput.on("change", function(val){
			that.change();
		});
		
		this.shadowBlur = 0;
		this.shadowBlurInput =  new MT.ui.Input(MT.events, {key: "shadowBlur", min: 0, step: 1}, this);
		
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
			}
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
//MT/ui/Dropdown.js
MT.namespace('ui');
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
				console.log(b);
				
				list.style.top = (b.top + b.height)+"px";
				list.style.left = b.left+"px";
				
				if(list.el.offsetTop + list.panel.content.el.offsetHeight > window.innerHeight){
					list.style.top = (b.top - list.panel.content.el.offsetHeight)+"px";
				}
				if(options.listStyle){
					list.width = options.listStyle.width;
				}
				
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
		
		if(options.value){
			button.text = options.value;
		}
		
		
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
//MT/plugins/tools/TileTool.js
MT.namespace('plugins.tools');
"use strict";

MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.TileTool = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "tileTools";
		this.active = null;
		this.activePanel = null;
		window.tileTool = this;
		this.panels = {};
	},{
		
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			this.panel = ui.createPanel("Tile tools");
			this.panel.setFree();
			this.panel.height = 300;
			ui.dockToBottom(this.panel);
			this.panel.hide();
			
			var that = this;
			this.tools.on("selectObject", function(obj){
				if(!obj){
					return;
				}
				that.select(obj);
			});
			this.tools.on("unselectedObject", function(){
				that.unselect();
			});
			
			this.selection = new MT.core.Selector();
			
			this.start = 0;
			this.stop = 0;
			
			
			this.tools.map.on("objectsAdded", function(map){
				if(map.activeObject){
					that.select(map.activeObject);
					that.update();
				}
			});
		},
		
		getImageFn: function(img){
			return function(){return img;};
		},
		
		
		
		createPanels: function(images){
			var p, pp;
			var obj = this.active.MT_OBJECT;
			var image = null;
			for(var id in images){
				if(this.panels[id]){
					if(!map){
						continue;
					}
					
					image = images[id];
					p = this.panels[id];
					p.data.widthInTiles = (p.data.image.width - image.margin*2) / (obj.tileWidth + image.spacing) | 0;
					p.data.heightInTiles = (p.data.image.height - image.margin*2) / (obj.tileHeight + image.spacing) | 0;
					
					continue;
				}
				
				p = new MT.ui.Panel(images[id].name);
				p.fitIn();
				p.addClass("borderless");
				
				if(pp){
					p.addJoint(pp);
				}
				
				this.createImage(p, images[id]);
				this.panels[id] = p;
				pp = p;
			}
			
			if(pp){
				this.activePanel = pp;
				pp.show(this.panel.content.el);
			}
		},
		
		createImage: function(panel, image){
			var that = this;
			var img = new Image();
			
			img.onload = function(){
				that.addCanvas(panel, this);
				that.drawImage(panel, this);
			};
			img.src = this.tools.project.path + "/" + image.__image;
			
			panel.data = {
				data: image,
				id: image.id,
				image: img,
				canvas: null,
				ctx: null
			};
			
			
		},
		
		
		addImage: function(image){
			var map = this.active.map;
			for(var i =0; i<map.tilesets.length; i++){
				if(map.tilesets[i].name == image.id){
					return map.tilesets[i].firstgid;
				}
			}
			
			var map = this.active.map;
			var nextId = 0;
			for(var i =0; i<map.tilesets.length; i++){
				nextId += map.tilesets[i].total+1;
			}
			
			//function (tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) {
			var key = ""+image.data.id;
			var tim = this.active.map.addTilesetImage(key, key, map.tileWidth, map.tileHeight, 0, 0, nextId);
			
			if(!this.active.MT_OBJECT.images){
				this.active.MT_OBJECT.images = [];
			}
			
			this.active.MT_OBJECT.images.push(image.id);
			
			return nextId;
			
		},
		
		addCanvas: function(panel, image){
			
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			
			var map = this.active.map;
			
			canvas.width = image.width;
			canvas.height = image.height;
			
			panel.data.canvas = canvas;
			panel.data.ctx = ctx;
			
			panel.data.widthInTiles = image.width / map.tileWidth | 0;
			panel.data.heightInTiles = image.height / map.tileHeight | 0;
			
			
			
			var mdown = false;
			var that = this;
			
			canvas.onmousedown = function(e){
				mdown = true;
				var tile = that.getTile(e.offsetX, e.offsetY, panel.data.image, panel.data.data);
				
				that.start = tile;
				that.stop = tile;
				that.drawImage(panel);
			};
			
			canvas.onmousemove = function(e){
				if(!mdown){
					return;
				}
				var tile = that.getTile(e.offsetX, e.offsetY, panel.data.image, panel.data.data);
				that.stop = tile;
				
				that.drawImage(panel);
			};
			
			canvas.onmouseup = function(e){
				mdown = false;
				that.stop = that.getTile(e.offsetX, e.offsetY, panel.data.image, panel.data.data);
				that.activePanel = panel;
			};
			panel.content.el.appendChild(canvas);
			
		},
		
		addSelection: function(tileId){
			this.selection.add(tileId);
		},
		
		selectAdditionalTiles: function(){
			var min = this.selection.min;
			var max = this.selection.max;
		},
		
		drawImage: function(panel){
			var that = this;
			
			var image = panel.data.image;
			var ctx = panel.data.ctx;
			//image is loading
			if(ctx == null){
				return;
			}
			
			var imgData = panel.data.data;
			
			var tx, ty;
			var widthInTiles = panel.data.widthInTiles;
			
			
			ctx.clearRect(0, 0, image.width, image.height);
			ctx.drawImage(image, 0, 0, image.width, image.height);
			
			var map = this.active.map;
			ctx.beginPath();
			
			for(var i = map.tileWidth; i<image.width; i += map.tileWidth + imgData.spacing){
				ctx.moveTo(imgData.margin + i+0.5, imgData.margin);
				ctx.lineTo(i+0.5, image.height);
			}
			for(var i = map.tileHeight; i<image.height; i += map.tileHeight + imgData.spacing){
				ctx.moveTo(imgData.margin + 0, imgData.margin + i+0.5);
				ctx.lineTo(image.width, i+0.5);
			}
			ctx.stroke();
			
			
			
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			
			tx = that.getTileX(this.start, widthInTiles);
			ty = that.getTileY(this.start, widthInTiles);
			
			this.selection.clear();
			
			if(this.start == this.stop){
				
				ctx.fillRect(imgData.margin + map.tileWidth * tx + tx * imgData.spacing + 0.5,
							imgData.margin + map.tileHeight * ty + ty * imgData.spacing + 0.5,
							map.tileWidth+0.5, map.tileHeight+0.5
				);
				this.selection.add({x: tx, y: ty, dx: 0, dy: 0});
			}
			else{
				
				
				var endx = that.getTileX(this.stop, widthInTiles);
				var endy = that.getTileY(this.stop, widthInTiles);
				
				var startx = Math.min(tx, endx);
				var starty = Math.min(ty, endy);
				
				endx =  Math.max(tx, endx);
				endy =  Math.max(ty, endy);
				
				for(var i=startx; i<=endx; i++){
					for(var j=starty; j<=endy; j++){
						ctx.fillRect(
							imgData.margin + map.tileWidth * i  + i * imgData.spacing + 0.5,
							map.tileHeight * j + j * imgData.spacing + 0.5,
							map.tileWidth + 0.5,
							map.tileHeight + 0.5
						);
						this.selection.add({x: i, y: j, dx: i-startx, dy: j-starty});
					}
				}
				
				
				
			}
		},
		
		getTileX: function(tile, width){
			
			return tile % width;
		},
		
		getTileY: function(tile, width){
			return tile / width | 0;
		},
		
		getSelection: function(panel, e){
			var image = panel.data.image;
			return this.getTile(e.offsetX, e.offsetY, image, panel.data.data);
		},
		
		getTile: function(x, y, image, imageData){
			var tx = (x + imageData.margin - imageData.spacing) / (this.active.map.tileWidth + imageData.spacing ) | 0;
			var ty = (y + imageData.margin - imageData.spacing) / (this.active.map.tileHeight + imageData.spacing ) | 0;
			return this.getId(tx, ty, image, imageData);
		},
		
		getId: function(tx, ty, image, imageData){
			var y = ty * ( (image.width + imageData.spacing) / (this.active.map.tileWidth + imageData.spacing) );
			var ret = (tx + y | 0);
			return ret;
		},
		
		mouseUp: function(e){
			if(e.target != this.tools.map.game.canvas){
				return;
			}
			this.mDown = false;
		},
		
		mouseDown: function(e){
			this.mDown = true;
			this.putTileFromMouse(e);
		},
		
		mouseMove: function(e){
			if(!this.mDown){
				return;
			}
			this.putTileFromMouse(e);
		},
		
		putTileFromMouse: function(e){
			if(e.target != this.tools.map.game.canvas){
				return;
			}
			
			var that = this;
			var activeLayer = this.active;
			var map = this.active.map;
			
			var scale = this.tools.map.game.camera.scale.x;
			var x = (e.x - this.active.x - this.tools.map.offsetX)/scale;
			var y = (e.y - this.active.y - this.tools.map.offsetY)/scale;
			
			if(this.active){
				var bounds = this.active.getBounds();
				if(!bounds.contains(e.x - this.tools.map.ox, e.y - this.tools.map.oy)){
					return;
				}
			}
			
			var p = this.active.getTileXY(x, y, {});
			
			if(e.ctrlKey){
				that.putTile(null, p.x, p.y, activeLayer);
				return;
			}
			if(!this.activePanel){
				return;
			}
			
			var id = this.addImage(this.activePanel.data);
			
			
			var oid = 0;
			this.selection.forEach(function(obj){
				oid = that.getId(obj.x, obj.y, that.activePanel.data.image, that.activePanel.data.data);
				that.putTile(
					id + oid, p.x + obj.dx, p.y + obj.dy, activeLayer
				);
			});
		},
		
		putTile: function(id, x, y, layer){
			if(!layer.MT_OBJECT.tiles){
				layer.MT_OBJECT.tiles = {};
			}
			if(!layer.MT_OBJECT.tiles[y]){
				layer.MT_OBJECT.tiles[y] = {};
			}
			layer.MT_OBJECT.tiles[y][x] = id;
			
			console.log("put tile", id);
			
			layer.map.putTile(id, x, y, layer);
		},
		
		oldSettings: {},
		init: function(){
			this.active = this.tools.map.activeObject;
			if(!this.active){
				this.tools.setTool(this.tools.tools.select);
				console.warn("not tilelayer selected!!!")
				return;
			}
			
			this.adjustSettings(this.active.MT_OBJECT);
			
			this.update();
			
			this.panel.show();
			if(this.activePanel){
				this.activePanel.hide();
				this.activePanel.show();
			}
		},
		
		restore: function(){
			if(this.oldSettings.gridX){
				this.tools.map.settings.gridX = this.oldSettings.gridX;
				this.tools.map.settings.gridY = this.oldSettings.gridY;
				this.tools.map.settings.gridOffsetX = 0;
				this.tools.map.settings.gridOffsetY = 0;
			}
			
			
		},
		
		adjustSettings: function(obj){
			this.restore();
			
			if(this.tools.activeTool != this){
				this.oldSettings.activeTool = this.tools.activeTool;
			}
			this.oldSettings.gridX = this.tools.map.settings.gridX;
			this.oldSettings.gridY = this.tools.map.settings.gridY;
			
			this.tools.map.settings.gridX = obj.tileWidth;
			this.tools.map.settings.gridY = obj.tileHeight;
			this.tools.map.settings.gridOffsetX = obj.x;
			this.tools.map.settings.gridOffsetY = obj.y;
		},
		
		unselect: function(){
			
			this.panel.hide();
			this.restore();
			console.log("unselect");
			if(this.tools.activeTool == this && this.oldSettings.activeTool && this.tools.activeTool != this.oldSettings.activeTool){
				this.tools.setTool(this.oldSettings.activeTool);
			}
		},
		
		deactivate: function(){
			this.restore();
			/*if(this.oldSettings.activeTool && this.tools.activeTool != this.oldSettings.activeTool){
				this.tools.setTool(this.oldSettings.activeTool);
			}*/
		},
		
		select: function(obj){
			if(obj.MT_OBJECT.type != MT.objectTypes.TILE_LAYER){
				this.restore();
				return;
			}
			this.active = obj;
			
			
			this.adjustSettings(this.active.MT_OBJECT);
			
			this.tools.setTool(this);
			this.panel.show();
			this.update();
		},
		
		update: function(){
			var images = this.tools.project.plugins.assetsmanager.list;
			if(this.active){
				this.createPanels(images);
			}
			if(this.activePanel){
				this.drawImage(this.activePanel);
			}
		},
		
		
		updateLayer: function(obj){
			var data = obj.MT_OBJECT;
			this.active = obj;
			if(!data.images || data.images.length == 0){
				return;
			}
			var map = obj.map;
			var nextId = 0;
			var tilesetImage = null;
			
			var images = this.tools.project.plugins.assetsmanager.list;
			var image = null;
			
			for(var i=0; i<data.images.length; i++){
				image = images[data.images[i]];
				if(!image){
					data.images.splice(i, 1);
					i--;
					continue;
				}
				//addTilesetImage(tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) → {Phaser.Tileset}
				tilesetImage = map.addTilesetImage(image.id, image.id, map.tileWidth, map.tileHeight, image.margin, image.spacing, nextId);
				nextId += tilesetImage.total;
			}
			
			var tiles = obj.MT_OBJECT.tiles;
			for(var y in tiles){
				for(var x in tiles[y]){
					if(tiles[y][x] >= nextId){
						delete tiles[y][x];
						console.warn("tile out of range: ", tiles[y][x]);
						continue;
					}
					
					obj.map.putTile(tiles[y][x], x, y, obj);
				}
			}
		}
	}
);
//MT/plugins/tools/Text.js
MT.namespace('plugins.tools');
"use strict";
MT.require("ui.Dropdown");
MT.require("ui.TextColorPicker");

MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Text = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "text";
		this.isInitialized = false;
		
		
		var that = this;
		var ui = tools.ui;
		this.tools = tools;
		
		
		this.tester = document.createElement("span");
		
		this.fonts = [
			"Arial",
			"Comic Sans MS",
			"Courier New",
			"Georgia",
			"Impact",
			"Times New Roman",
			"Trebuchet MS",
			"Verdana"
		];
		
	
		
		//this.fontSize = new MT.ui.Button(null, "font-size", 
		
		
		this.tools.on("selectObject", function(obj){
			that.select(obj);
		});
		
		this.tools.on("unselectedObject", function(){
			that.panel.hide();
		});
		
		this.manager = this.tools.project.plugins.fontmanager;
		
		var ready = function(){
			that.checkFonts();
			
			that.tools.map.off(ready);
		};
		this.tools.map.on("objectsAdded", ready);
		
		
		this.createPanel();
		
	},{
		
		createPanel: function(){
			var that = this;
			var ui = this.tools.ui;
			
			this.panel = ui.createPanel("Text");
			
			this.panel.style.height = this.project.panel.height+"px";
			this.panel.style.top = this.tools.map.panel.content.bounds.top+"px";
			this.panel.style.left = this.project.panel.width+"px";
			
			this.panel.addClass("text-tools");
			this.panel.removeHeader();
			
			this.panel.hide();
			
			var fonts = this.fonts;
			
			var fontList = [];
			for(var i=0; i<fonts.length; i++){
				fontList.push(this._mk_setFontSelect(fonts[i]));
			}
			
			this.fontFace = new MT.ui.Dropdown({
				list: fontList,
				button: {
					class: "text-font",
					width: "auto"
				},
				listStyle: {
					width: 200
				},
				onchange: function(val){
					that.setFontFamily(val);
				}
				
			}, ui);
			
			var fontSizes = [10, 11, 12, 14, 18, 24, 26, 28, 30, 32, 36, 48, 60, 72, 96];
			var fsList = [];
			for(var i=0; i<fontSizes.length; i++){
				fsList.push(this._mk_setFontSizeSelect(fontSizes[i]));
			}
			
			this.fontSize = new MT.ui.Dropdown({
				list: fsList,
				button: {
					class: "text-size",
					width: "auto"
				},
				listStyle: {
					width: 25
				},
				onchange: function(val){
					that.setFontSize(val);
				}
				
			}, ui);
			
			this.panel.addButton(this.fontFace.button);
			this.panel.addButton(this.fontSize.button);
			
			ui.on(ui.events.RESIZE, function(){
				
				that.panel.width = that.tools.map.panel.content.width;
				that.panel.height = 30;
				that.panel.style.top = that.tools.map.panel.content.bounds.top+"px";
				
			});
			
			
			this.bold = this.panel.addButton("B", "text-bold", function(){
				that.toggleBold();
			});
			this.bold.width = "auto";
			
			this.italic = this.panel.addButton("I", "text-italic", function(){
				that.toggleItalic();
			});
			this.italic.width = "auto";
			
			this.wordWrap = this.panel.addButton("Wx", "text-wrap", function(){
				that.toggleWordWrap();
			});
			this.wordWrap.width = "auto";
			
			this.wordWrapWidth = new MT.ui.Dropdown({
				button: {
					class: "word-wrap-width-size",
					width: "auto"
				},
				onchange: function(val){
					that.setWordWrapWidth(val);
				}
			}, ui);
			
			this.wordWrapWidth.on("show", function(show){
				that.wordWrapWidth.button.el.removeAttribute("px");
			});
			this.wordWrapWidth.on("hide", function(show){
				that.wordWrapWidth.button.el.setAttribute("px", "px");
			});
			this.panel.addButton(this.wordWrapWidth.button);
			
			this.left = this.panel.addButton("L", "text-left", function(){
				that.setAlign("left");
			});
			this.left.width = "auto";
			
			this.center = this.panel.addButton("C", "text-center", function(){
				that.setAlign("center");
			});
			this.center.width = "auto";
			
			this.right = this.panel.addButton("R", "text-right", function(){
				that.setAlign("right");
			});
			this.right.width = "auto";
			
			this.colorButton = this.panel.addButton("C", "text-color", function(){
				that.showColorPicker();
			});
			this.colorButton.width = "auto";
			
			this.colorPicker = new MT.ui.TextColorPicker(this.tools.ui);
			this.colorPicker.el.style.zIndex = 3;
			
			this.panel.on("hide", function(){
				that.colorPicker.hide();
			});
			
			this.colorPicker.on("fill", function(color){
				that.setFill(color);
			});
			this.colorPicker.on("stroke", function(obj){
				that.setStroke(obj);
			});
			this.colorPicker.on("shadow", function(obj){
				that.setShadow(obj);
			});
			
			
			
			this.textButton = this.panel.addButton("txt", "text-edit", function(){
				that.showTextEdit();
			});
			this.textButton.width = "auto";
			
			this.textPopup = new MT.ui.Popup("Edit Text", "");
			this.textPopup.hide();
			
			this.textPopup.showClose();
			this.textPopup.addButton("Done", function(){
				that.setText(that.textArea.value);
				that.textPopup.hide();
			});
			
			this.textArea = document.createElement("textarea");
			this.textPopup.content.appendChild(this.textArea);
			this.textArea.style.width = "100%";
			this.textArea.style.height = "200px";
			
		},
		
		showColorPicker: function(){
			if(this.colorPicker.isVisible){
				this.colorPicker.hide();
				return;
			}
			this.colorPicker.show(document.body);
			var r = this.colorButton.el.getBoundingClientRect();
			this.colorPicker.y = r.top + r.height;
			this.colorPicker.x = r.left;
			
			
		},
		
		_mk_setFontSelect: function(font){
			var that = this;
			return {
				label: font,
				cb: function(){
					that.setFontFamily(font);
				},
				create: function(element){
					element.style.fontFamily = font;
				}
			};
		},
		
		_mk_setFontSizeSelect: function(font){
			var that = this;
			return {
				label: font,
				cb: function(){
					that.setFontSize(font);
				}
			};
		},
		
		
		showTextEdit: function(shouldRemove){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			var obj = this.tools.map.activeObject;
			
			this.textArea.value = obj.text;
			
			this.textPopup.show();
			
			if(shouldRemove){
				var pop = this.textPopup;
				var that = this;
				var rem = function(cancel){
					pop.off("close", rem);
					if(cancel){
						that.tools.om.deleteObj(obj.MT_OBJECT.id);
					}
				};
				this.textPopup.on("close", rem);
			}
		},
		
		setText: function(val){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.map.activeObject.text = val;
			this.map.activeObject.MT_OBJECT.text = val;
			this.map.activeObject.MT_OBJECT.name = val;
			
		},
		
		change: function(e){
			console.log("TEXT:: change", e);
		},
		
		setFill: function(color){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.map.activeObject.fill = color;
			this.tools.om.sync();
		},
		
		setStroke: function(obj){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.map.activeObject.stroke = obj.color;
			this.map.activeObject.strokeThickness = obj.strokeThickness;
		},
		
		setShadow: function(obj){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.map.activeObject.setShadow(obj.x, obj.y, obj.color, obj.shadowBlur);
			
		},
		
		setAlign: function(pos){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.map.activeObject.align = pos;
			this.select(this.map.activeObject);
		},
		isUnknownFont: function(font, cb){
			for(var i=0; i<this.fonts.length; i++){
				if(this.fonts[i] == font){
					return false;
				}
			}
			return true;
		},
		
		addFont: function(font){
			if(this.isUnknownFont(font)){
				this.fonts.push(font);
				// might not be isInitialized yet
				if(this.fontFace){
					this.fontFace.addItem(this._mk_setFontSelect(font));
				}
			}
		},
		
		
		checkFonts: function(){
			var objects = this.tools.map.objects;
			var o = null;
			var that = this;
			var toLoad = 0;
			for(var i=0; i<objects.length; i++){
				o = objects[i];
				if(o.type == Phaser.TEXT){
					this._setFontFamily(o);
					
					if(this.isUnknownFont(o.font)){
						this.addFont(o.font);
						toLoad++;
						this.manager.loadFont(o.font, function(){
							toLoad--;
							if(toLoad != 0){
								return;
							}
							window.setTimeout(function(){
								that.updateTextObjects();
							}, 500);
						});
					}
				}
			}
		},
		
		updateTextObjects: function(fontIn){
			
			var objects = this.tools.map.objects;
			PIXI.Text.heightCache = {};
			for(var i=0; i<objects.length; i++){
				if(objects[i].type == Phaser.TEXT ){
					if(fontIn == void(0) || objects[i].font == fontIn || objects[i].style.font.indexOf(fontIn) > -1 ){ 
						objects[i].dirty = true;
					}
				}
			}
		},
		
		setFontFamily: function(fontIn){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			
			if(this.isUnknownFont(fontIn)){
				var that = this;
				var active = this.map.activeObject;
				this.addFont(fontIn);
				this.manager.loadFont(fontIn, function(){
					that.setFontFamily(fontIn);
					window.setTimeout(function(){
						that.updateTextObjects(fontIn);
					}, 1000);
				});
				return;
			}
			
			
			
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this._setFontFamily(this.map.activeObject);
			
			
			this.tester.style.font = this.map.activeObject.font || this.map.activeObject.style.font;
			this.tester.style.fontFamily = fontIn;
			
			
			
			var font = this.tester.style.fontFamily;
			font = font.replace(/'/gi, "");
			
			this.fontFace.button.style.fontFamily = font;
			this.map.activeObject.font = font;
			if(this.tester.style.fontSize){
				this.map.activeObject.fontSize = this.tester.style.fontSize;
			}
			
			this._setFontFamily(this.map.activeObject);
			
			this.select(this.map.activeObject);
			this.map.activeObject.dirty = true;
		},
		
		setFontSize: function(size){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			this.tester.style.font = this.map.activeObject.font || this.map.activeObject.style.font;
			
			
			this._setFontFamily(this.map.activeObject);
			this.tester.style.fontSize = size;
			
			this.map.activeObject.fontSize = this.tester.style.fontSize;
			
			this.select(this.map.activeObject);
			
		},
		
		toggleBold: function(){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			var w = this.map.activeObject.style.font;
			var att = this.getFontAttribs(w);
			var out = "";
			if(!att.bold){
				out = "bold";
			}
			if(att.italic){
				out += " italic";
			}
			
			
			out = out.trim();
			this._setFontFamily(this.map.activeObject);
			this.map.activeObject.fontWeight = out;
			this.select(this.map.activeObject);
		},
		
		toggleItalic: function(){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			var w = this.map.activeObject.style.font;
			var att = this.getFontAttribs(w);
			var out = "";
			
			if(att.bold){
				out += "bold";
			}
			if(!att.italic){
				out += " italic";
			}
			
			
			out = out.trim();
			
			
			this._setFontFamily(this.map.activeObject);
			
			this.map.activeObject.fontWeight = out;
			this.select(this.map.activeObject);
		},
		toggleWordWrap: function(){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			
			this.map.activeObject.wordWrap = !this.map.activeObject.wordWrap;
			var bounds = this.map.activeObject.getBounds();
			if(this.map.activeObject.wordWrapWidth < bounds.width - 10){
				this.map.activeObject.wordWrapWidth = parseInt(bounds.width, 10);
			}
			this.select(this.map.activeObject);
			
			
		},
		setWordWrapWidth: function(val){
			this.map = this.tools.map;
			if(!this.map.activeObject){
				return;
			}
			
			this.map.activeObject.wordWrapWidth = parseInt(val, 10);
			this.select(this.map.activeObject);
			
		},
		
		_setFontFamily: function(obj){
			obj = obj || this.map.activeObject;
			
			
			this.tester.style.font = obj.style.font;
			obj.font = this.tester.style.fontFamily.replace(/'/gi,"");
			obj.fontWeight = this.tester.style.fontWeight.replace(/normal/gi,'');
			if(this.tester.style.fontStyle == "italic"){
				console.log("italic");
				obj.fontWeight += " "+this.tester.style.fontStyle.replace(/normal/gi,"");;
			}
			obj.fontSize = this.tester.style.fontSize;
		},
		
		init: function(){
			console.log("init text");
			this.map = this.tools.map;
			
			if(this.isInitialized){
				return;
			}
			var that = this;
			this.tools.ui.events.on("keypress", function(e){
				that.change(e);
			});
			this.isInitialized = true;
			
			
		},
		
		showTools: function(){
			
			
		},
		
		select: function(obj){
			
			if(!obj || !obj.MT_OBJECT || obj.MT_OBJECT.type != MT.objectTypes.TEXT){
				this.panel.hide();
				return;
			}
			
			obj.MT_OBJECT.style = obj.style;
			this.tools.om.sync();
			
			if(obj.font){
				this.tester.style.fontFamily = obj.font;
			}
			else{
				this.tester.style.font = obj.style.font;
			}
			
			
			
			
			this.fontFace.value = this.tester.style.fontFamily.replace(/'/gi, "");;
			this.fontFace.button.style.fontFamily = this.tester.style.fontFamily;
			
			this.fontSize.value = obj.fontSize;
			
			var att = this.getFontAttribs(obj.style.font);
			if(att.bold){
				this.bold.style.fontWeight = "bold";
				this.bold.addClass("active");
			}
			else{
				this.bold.style.fontWeight = "normal";
				this.bold.removeClass("active");
			}
			if(att.italic){
				this.italic.style.fontStyle = "italic";
				this.italic.addClass("active");
			}
			else{
				console.log("not italic");
				
				this.italic.style.fontStyle = "normal";
				this.italic.removeClass("active");
			}
			
			if(obj.wordWrap){
				this.enableWordWrap(obj);
			}
			else{
				this.disableWordWrap(obj);
			}
			
			this.checkAlign(obj);
			
			
			this.colorPicker.setColors({
				stroke: obj.stroke,
				fill: obj.fill,
				shadow: obj.shadowColor
			});
			
			this.colorPicker.shadowXInput.setValue(obj.shadowOffsetX, true);
			this.colorPicker.shadowYInput.setValue(obj.shadowOffsetY, true);
			this.colorPicker.shadowBlurInput.setValue(obj.shadowBlur, true);
			
			this.colorPicker.strokeThicknessInput.setValue(obj.strokeThickness, true);
			
			this.panel.hide();
			
			
			
			this.panel.show(document.body);
			obj.dirty = true;
		},
		
		
		enableWordWrap: function(obj){
			this.wordWrap.addClass("active");
			this.wordWrapWidth.button.removeClass("hidden");
			this.wordWrapWidth.button.text = obj.wordWrapWidth;
			this.wordWrapWidth.button.el.setAttribute("px", "px");
			
			
			/*this.left.removeClass("hidden");
			this.center.removeClass("hidden");
			this.right.removeClass("hidden");*/
		},
		disableWordWrap: function(obj){
			this.wordWrap.removeClass("active");
			this.wordWrapWidth.button.addClass("hidden");
			
			/*this.left.addClass("hidden");
			this.center.addClass("hidden");
			this.right.addClass("hidden");*/
		},
		
		checkAlign: function(obj){
			if(obj.wordWrap || obj.text.split("\n").length > 1){
				this.left.removeClass("hidden active");
				this.center.removeClass("hidden active");
				this.right.removeClass("hidden active");
				
				
				if(obj.align == "left"){
					this.left.addClass("active");
				}
				if(obj.align == "right"){
					this.right.addClass("active");
				}
				if(obj.align == "center"){
					this.center.addClass("active");
				}
				
			}
			else{
				this.left.addClass("hidden");
				this.center.addClass("hidden");
				this.right.addClass("hidden");
			}
		},
		
		getFontAttribs: function(fontWeight){
			var t = fontWeight.split(" ");
			var bold = false;
			var italic = false;
			
			for(var i=0; i<t.length; i++){
				if(t[i].trim() == "bold"){
					bold = true;
				}
				if(t[i].trim() == "italic"){
					italic = true;
				}
			}
			
			return {
				bold: bold,
				italic: italic
			};
			
		},
		
		mouseDown: function(e){
			console.log("mouse down");
			
		},
		
		mouseUp: function(e){
			//this.tools.tools.select.mouseUp(e);
			if(e.target != this.map.game.canvas){
				return;
			}
			
			var x = e.offsetX + this.map.offsetXCam - this.map.ox;
			var y = e.offsetY + this.map.offsetYCam - this.map.oy;
			var obj = this.map.pickObject(e.x - this.map.offsetXCam, e.y - this.map.offsetYCam);
			
			if(obj && obj.MT_OBJECT.type == MT.objectTypes.TEXT){
				console.log("text selected", obj.MT_OBJECT);
				
				this.tools.tools.select.select(obj);
				this.tools.select(obj);
				this.tools.tools.text.showTextEdit();
			}
			else{
				
				var text = this.tools.om.createTextObject(x, y);
				this.tools.om.insertObject(text);
				obj = this.map.getById(text.id);
				this.tools.select(obj);
				
				this.tools.tools.text.showTextEdit(true);
			}
		},
		
		mouseMove: function(){
			
		}
	}

);
//MT/plugins/tools/Brush.js
MT.namespace('plugins.tools');
MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Brush = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "brush";
		this.activeFrame = 0;
	},{
		
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			this.activeFrame = 0;
			var that = this;
			this.tools.on("changeFrame", function(asset, frame){
				that.activeFrame = frame;
				if(that.tools.activeTool != that){
					return;
				}
				that.tools.initActiveObject(that.tools.activeAsset);
				that.tools.activeObject.frame = frame;
			});
		},
		
		lastX: 0,
		lastY: 0,
		
		init: function(asset){
			this.activeFrame = 0;
			
			this.tools.unselectObjects();
			asset = asset || this.tools.activeAsset;
			if(!asset){
				return;
			}
			
			console.log("init brush");
			if(asset.contents){
				return;
			}
			this.tools.initActiveObject(asset);
			this.tools.setTool(this);
			
			var that = this;
			this.tools.map.handleMouseMove = function(e){
				that.mouseMove(e);
			}
		},
		
		
		mouseDown: function(e){
			
			if(!this.tools.activeObject){
				if(!this.tools.map.activeObject){
					return;
				}
				if(!this.tools.lastAsset){
					this.tools.lastAsset = this.project.plugins.assetsmanager.getById(this.tools.map.activeObject.MT_OBJECT.assetId);
				}
				this.init(this.tools.lastAsset);
				return;
			}
			this.insertObject();
		},
		
		mouseMove: function(e){
			
			if(e.target != this.tools.map.game.canvas){
				return;
			}
			
			var x = this.tools.activeObject.x;
			var y = this.tools.activeObject.y;
			
			this.tools.map._followMouse(e, true);
			
			if(this.ui.events.mouse.down){
				
				if(this.tools.activeObject.x != this.lastX || this.tools.activeObject.y != this.lastY){
					this.insertObject();
				}
			}
		},
		
		insertObject: function(){
			var om = this.project.plugins.objectsmanager;
			this.tools.map.sync(this.tools.activeObject, this.tools.activeObject.MT_OBJECT);
			
			this.tools.activeObject.MT_OBJECT.frame = this.activeFrame;
			om.insertObject(this.tools.activeObject.MT_OBJECT);
			
			this.lastX = this.tools.activeObject.x;
			this.lastY = this.tools.activeObject.y;
			this.tools.initActiveObject();
			
			this.tools.activeObject.frame = this.activeFrame;
			this.tools.unselectObjects();
		},
		
		mouseUp: function(e){
			console.log("upp", e);
			
		},
		
		
		deactivate: function(){
			
			if(this.tools.activeObject){
				this.tools.map.removeObject(this.tools.activeObject);
				this.tools.activeObject = null;
				this.tools.lastAsset = null;
			}
			
			
			this.tools.map.handleMouseMove = this.tools.map.emptyFn;
			this.project.plugins.objectsmanager.update();
		},
		
		

	}
);
//MT/plugins/tools/Stamp.js
MT.namespace('plugins.tools');
MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Stamp = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "stamp";
		this.activeFrame = 0;
	},{
		
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			var that = this;
			this.tools.on("assetSelected", function(asset){
				if(that.tools.activeTool != that){
					return;
				}
				that.init(asset);
			});
			
			this.activeFrame = 0;
			this.tools.on("changeFrame", function(asset, frame){
				console.log("change Frame");
				that.activeFrame = frame;
				if(that.tools.activeTool != that){
					return;
				}
				
				that.tools.initActiveObject(that.tools.activeAsset);
				that.tools.activeObject.frame = frame;
			});
			
			this.tools.on("update", function(){
				if(that.tools.activeTool != that){
					return;
				}
			});
		},
		
		init: function(asset){
			
			this.map = this.tools.map;
			
			this.tools.unselectObjects();
			asset = asset || this.tools.activeAsset;
			
			if(!asset || asset.contents){
				return;
			}
			this.activeFrame = 0;
			this.tools.initActiveObject(asset);
			
			this.map.handleMouseMove = this.map._followMouse;
		},
		
		mouseDown: function(e){
			
			if(!this.tools.activeObject){
				if(!this.map.activeObject){
					if(this.project.plugins.assetsmanager.active){
						this.tools.lastAsset = this.project.plugins.assetsmanager.active.data;
					}
					return;
				}
				if(!this.tools.lastAsset){
					this.tools.lastAsset = this.project.plugins.assetsmanager.getById(this.map.activeObject.MT_OBJECT.assetId);
				}
				this.init(this.tools.lastAsset);
				return;
			}
			
			var om = this.project.plugins.objectsmanager;
			
			this.map.sync(this.tools.activeObject);
			
			this.tools.activeObject.MT_OBJECT.frame = this.activeFrame;
			om.insertObject(this.tools.activeObject.MT_OBJECT);
			
			this.tools.initActiveObject();
			this.tools.activeObject.frame = this.activeFrame;
			this.tools.unselectObjects();
		},
		
		mouseUp: function(e){
			console.log("upp", e);
		},
		
		deactivate: function(){
			
			if(this.tools.activeObject){
				this.map.removeObject(this.tools.activeObject);
				this.tools.activeObject = null;
				this.tools.lastAsset = null;
			}
			
			this.map.handleMouseMove = this.map.emptyFn;
			this.project.plugins.objectsmanager.update();
		},
	}
);
//MT/plugins/tools/Select.js
MT.namespace('plugins.tools');
MT.extend("core.BasicTool").extend("core.Emitter")(
	MT.plugins.tools.Select = function(tools){
		MT.core.BasicTool.call(this, tools);
		this.name = "select";
		
		this.activeState = this.states.NONE;
		
		
		this.startMove = {
			x: 0,
			y: 0
		};
	},{
		
		states: {
			NONE: 0,
			RW: 1,
			RE: 2,
			RN: 3,
			RS: 4,
		},
		initUI: function(ui){
			MT.core.BasicTool.initUI.call(this, ui);
			
			this.map = this.tools.map;
		},
		init: function(){
			this.map.handleMouseMove = this.mouseMoveFree;
		},
		
		deactivate: function(){
			this.mDown = false;
			console.log("select deactivated");
			this.map.handleMouseMove = this.mouseMoveFree;
		},
		
		select: function(obj){
			
			var shift = (this.ui.events.mouse.lastEvent && this.ui.events.mouse.lastEvent.shiftKey ? true : false);
			if(shift){
				if(this.map.selector.is(obj)){
					this.map.selector.remove(obj);
					return;
				}
				
				this.map.selector.add(obj);
				return;
			}
			
			this.tools.selectObject(obj, true);
		},
		
		/* !!! this functions runs in map scope */
		mouseMoveFree: function(e){
			
			if(!this.activeObject){
				return;
			}
			var self = this.project.plugins.tools.tools.select;
			
			if(this.ui.events.mouse.down && self.activeState != self.states.NONE){
				self.resizeObject(this.activeObject, this.ui.events.mouse);
				return;
			}
			
			var bounds = this.activeObject.getBounds();
			var type = this.activeObject.MT_OBJECT.type;
			
			var off = this.helperBoxSize;
			
			var x = e.x - this.ox;
			var y = e.y - this.oy;
			
			var obj = this.activeObject;
			var scale = this.game.camera.scale.x;
			
			if(type == MT.objectTypes.TEXT){
				
				var my = bounds.y + bounds.height * 0.5 - off*0.5;
				
				var width = this.activeObject.wordWrapWidth * scale;
				
				if(y > my && y < my + off){
					if(x > bounds.x - off | 0 && x < bounds.x ){
						document.body.style.cursor = "w-resize";
						self.activeState = self.states.RW;
						self.startMove.x = obj.x;
					}
					else if(x > bounds.x + width && x < bounds.x + width + off){
						document.body.style.cursor = "e-resize";
						self.activeState = self.states.RE;
						self.startMove.x = obj.x;
					}
					else{
						document.body.style.cursor = "auto";
						self.activeState = self.states.NONE;
					}
				}
				else{
					document.body.style.cursor = "auto";
					self.activeState = self.states.NONE;
				}
			}
			if(this.tools.activeTool !== self){
				this.tools.mouseMove(e);
			}
		},
		
		resizeObject: function(obj, mouse){
			obj = obj || this.map.activeObject;
			var scale = this.map.game.camera.scale.x;
			var x = mouse.mx/scale;
			
			if(this.activeState == this.states.RW){
				obj.wordWrapWidth -= x;
				obj.x = (this.startMove.x) + x * (1-obj.anchor.x);
				this.startMove.x = obj.x;
				
				
			}
			if(this.activeState == this.states.RE){
				obj.wordWrapWidth += x;
				obj.x += x*obj.anchor.x;
			}

			this.tools.tools.text.select(obj);
			
			this.map.sync();
		},
		
		
		mouseMove: function(e){
			if(!this.mDown){
				return;
			}
			
			var x = e.x - this.map.offsetX;
			var y = e.y - this.map.offsetY;
			
			
			if(x > this.map.selection.sx){
				this.map.selection.width = x - this.map.selection.x;
			}
			else{
				this.map.selection.width = this.map.selection.sx - x;
				this.map.selection.x = x;
			}
			
			if(y > this.map.selection.sy){
				this.map.selection.height = y - this.map.selection.y;
			}
			else{
				this.map.selection.height = this.map.selection.sy - y;
				this.map.selection.y = y;
			}
			
			this.map.selectRect(this.map.selection, !e.shiftKey);
		},
		
		mouseUp: function(e){
			this.mDown = false;
			var map = this.tools.map;
			
			map.selectRect(map.selection);
			
			map.selection.width = 0;
			map.selection.height = 0;
			
			map.handleMouseMove = this.mouseMoveFree;
		},
		
		initMove: function(e){
			this.map.handleMouseMove = this.map._objectMove;
			
			if(e.altKey){
				var copy = [];
				var sel = this.map.selector;
				sel.forEach(function(o){
					copy.push(o.MT_OBJECT);
				});
				
				
				
				var bounds = null;
				var cx = this.map.game.camera.x;
				var cy = this.map.game.camera.y;
				
				
				
				var data = this.tools.om.multiCopy(copy);
				sel.clear();
				
				
				var sprite;
				for(var i=0; i<data.length; i++){
					sprite = this.map.getById(data[i].id);
					bounds = sprite.getBounds();
					data[i].x = bounds.x + cx;
					data[i].y = bounds.y + cy;
					
					sel.add(sprite);
				}
				
				
				
			}
			
		},
		_lastMD: 0,
		doubleClick: function(){
			if(!this.map.activeObject){
				return false;
			}
			
			var mt = this.map.activeObject.MT_OBJECT;
			for(var i=0; i<this.map.objects.length; i++){
				if(this.map.objects[i].MT_OBJECT.assetId == mt.assetId){
					this.map.selector.add(this.map.objects[i]);
				}
			}
			
			return true;
		},
		
		mDown: false,
		mouseDown: function(e){
			
			this.mDown = true;
			if(this.activeState !== this.states.NONE){
				return;
			}
			if(Date.now() - this._lastMD < 300){
				
				if(this.doubleClick()){
					return;
				}
			}
			
			this._lastMD = Date.now();
			
			var that = this;
			var shift = (e.shiftKey ? true : false);
			
			var x = e.x - this.map.offsetXCam;
			var y = e.y - this.map.offsetYCam;
			
			var obj = this.map.pickObject(x, y);
			var group = this.map.pickGroup(x, y);
			
			if(group && (this.map.selector.is(group) || group == this.map.activeObject) ){
				this.initMove(e);
				return;
			}
			
			if(obj){
				if(!shift){
					if(this.map.selector.is(obj)){
						this.initMove(e);
					}
					else{
						if(this.map.selector.is(obj)){
							this.initMove(e);
						}
						this.select(obj);
					}
				}
				else{
					this.select(obj);
				}
			}
			else{
				this.map.handleMouseMove = function(e){
					that.mouseMove(e);
				};
				
				this.map.selection.x = e.x - this.map.offsetX;
				this.map.selection.y = e.y - this.map.offsetY;
				
				this.map.selection.sx = e.x - this.map.offsetX;
				this.map.selection.sy = e.y - this.map.offsetY;
				
				this.map.selection.width = 0;
				this.map.selection.height = 0;
				
				if(!shift){
					this.map.selector.clear();
					this.map.activeObject = null;
					this.tools.project.plugins.settings.handleScene(this.map.settings);
				}
			}
		}
	}
);
//MT/ui/List.js
MT.namespace('ui');
MT.require("ui.Panel");
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.List = function(list, ui, autohide){
		MT.ui.DomElement.call(this);
		this.setAbsolute();
		this.addClass("ui-list");
		
		this.panel = new MT.ui.Panel("", ui.events);
		this.panel.removeHeader();
		
		
		this.panel.content.style.overflow = "initial";
		this.panel.style.position = "relative";
		this.panel.show(this.el);
		
		
		this.panel.content.style.position = "relative";
		var that = this;
		
		ui.events.on("mouseup", function(e){
			for(var i=0; i<that.panel.buttons.length; i++){
				if(that.panel.buttons[i].el == e.target){
					return;
				}
			}
			if(that.isVisible && autohide){
				that.hide();
			}
		});
		
		this.isVisible = false;
		
		this.update(list);
		
		this.addChild(this.panel).show();
	},
	{
		update: function(list){
			this.clear();
			this.list = list;
			
			for(var i=0; i<list.length; i++){
				this.addItem(list[i]);
			}
		},
		
		addItem: function(item){
			var b = this.panel.addButton(item.label, item.className, item.cb);
			b.style.position = "relative";
			b.addClass("ui-list-button");
			
			if(item.create){
				item.create(b);
			}
		},
		
		show: function(parent){
			if(this.isVisible){
				return;
			}
			this.isVisible = true;
			MT.ui.DomElement.show.call(this, parent);
			this.emit("show");
		},
		
		hide: function(){
			if(!this.isVisible){
				return;
			}
			this.isVisible = false;
			MT.ui.DomElement.hide.call(this);
			this.emit("hide");
		}
	}
);

//MT/ui/Input.js
MT.namespace('ui');
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
		
		
		this.input = document.createElement("input");
		this.addClass("ui-input");
		
		this.label = new MT.ui.DomElement();
		this.label.setAbsolute();
		
		this.addChild(this.label).show();
		
		this.label.el.innerHTML = this.key;
		this.label.style.bottom = "initial";
		this.label.style.right = "50%";
		
		
		this.value = new MT.ui.DomElement();
		this.value.setAbsolute();
		
		this.addChild(this.value).show();
		
		this.setValue(this.object[this.key], true);
		
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

//MT/core/Selector.js
MT.namespace('core');
MT.extend("core.Emitter")(
	MT.core.Selector = function(){
		this._selected = [];
	},
	{
		add: function(obj, silent){
			if(obj === void(0)){
				return;
			}
			if(!this.is(obj)){
				this._selected.push(obj);
				if(!silent){
					this.emit("select", obj);
				}
			}
			
			
		},
		
		get count(){
			return this._selected.length;
		},
		
		remove: function(obj){
			var o = null;
			for(var i=0; i<this._selected.length; i++){
				if(this._selected[i] == obj){
					this._selected.splice(i, 1);
					this.emit("unselect", obj);
					return;
				}
			}
		},
		
		is: function(obj){
			for(var i=0; i<this._selected.length; i++){
				if(this._selected[i] == obj){
					return true;
				}
			}
			return false;
		},
		
		get min(){
			return Math.min.apply(Math, this._selected);
		},
		get max(){
			return Math.max.apply(Math, this._selected);
		},
		forEach: function(cb, scope){
			if(!this._selected){
				return;
			}
			for(var i=0; i<this._selected.length; i++){
				if(scope){
					cb.call(scope, this._selected[i]);
				}
				else{
					cb(this._selected[i]);
				}
			}
		},
		
		sortAsc: function(){
			this._selected.sort();
		},
		
		clear: function(){
			for(var i=0; i<this._selected.length; i++){
				this.emit("unselect", this._selected[i]);
			}
			this._selected.length = 0;
			this.emit("clear");
		}
		
		
		
	}
);
//MT/core/Helper.js
MT.namespace('core');
MT(
	MT.core.Helper = function(){

	},
	{
		isImage: function(imgPath){
			var ext = imgPath.split(".").pop();
			return (ext == "png" || ext == "jpg" || ext == "gif" || ext == "jpeg");
		}
	}
);
//MT/ui/TreeView.js
MT.namespace('ui');
"use strict";
/*
 * Needs to be reviewed - too many hacks already
 */
MT.require("ui.DomElement");
MT.extend("core.Emitter")(
	MT.ui.TreeView = function(data, options){
		MT.core.Emitter.call(this);
		this.options = {};
		
		for(var i in options){
			this.options[i] = options[i];
		}
		
		this.tree = null;
		this.items = [];
		this.rootPath = options.root;
		
		if(data != void(0)){
			this.create(data);
		}
		
		this._onDrop = [];
		
	},
	{
		
		onDrop: function(cb){
			this._onDrop.push(cb);
		},
		
		create: function(data){
			this.tree = new MT.ui.DomElement();
			this.tree.style.position = "relative";
			this.tree.addClass("ui-treeView");
			
			this.updateFullPath(data);
			
			this.createObject(data, this.tree);
		},

		createObject: function(data, parent){
			var d;
			for(var i =0; i<data.length; i++){
				d = data[i];
				// folder
				if(d.contents !== void(0)){
					var p = this.addItem(d, parent, i);
					this.createObject(d.contents, p);
					continue;
				}
				
				this.addItem(d, parent, i);
				
			}
		},
		
		getData: function(parent, data){
			
			parent = parent || this.tree;
			var c = null;
			var data = [];
			for(var i=0; i<parent.children.length; i++){
				c = parent.children[i];
				if(c.data.contents){
					c.data.contents = this.getData(c);
				}
				data.push(c.data);
			}
			return data;
		},
		
		/*getData: function(parent, data){
			
			//return this.data;
			
			parent = parent || this.tree;
			var c = null;
			var data = [];
			for(var i=0; i<parent.el.children.length; i++){
				c = parent.el.children[i];
				if(!c.ctrl || !c.ctrl.data || c.ctrl.data.skip){
					continue;
				}
				if(c.ctrl.data.contents){
					c.ctrl.data.contents = this.getData(c.ctrl);
				}
				data.push(c.ctrl.data);
			}
			return data;
		},*/
		
		update: function(data){
			this.tree.el.innerHTML = "";
			this.createObject(data, this.tree);
		},
   
		addItem: function(data, parent, index, isVirtual){
			
			for(var i=0; i<this.items.length; i++){
				if(this.items[i].data.id == data.id){
					this.items[i].needRemove = false;
					var item = this.items[i];
					var p = item.parent;
					
					if(p){
						p.removeChild(item);
						p.addChild(item, item.index).show();
					}
					
					
					for(var k in data){
						item.data[k] = data[k];
					}
					
					if(parent.hasClass("close")){
						item.hide();
					}
					
					if(item._parent != parent.el){
						if(item.el.parentNode){
							item.el.parentNode.removeChild(item.el);
						}
						item.parent.removeChild(item);
						parent.addChild(item).show();
						
						
						if(!parent.visible){
							item.hide();
						}
					}
					
					if(item.options.showHide){
						if(!data.isVisible){
							item.options.showHide.addClass("hidden");
						}
						else{
							item.options.showHide.removeClass("hidden");
						}
					}
					
					
					
					if(item.options.lock){
						if(!data.isLocked){
							item.options.lock.addClass("locked");
						}
						else{
							item.options.lock.removeClass("locked");
						}
					}
					
					
					return item;
				}
			}
			
			var that = this;
			var el = new MT.ui.DomElement();
			el.options = {};
			
			el.index = index;
			
			var type = "item";
			if(data.contents){
				type = "folder";
			}
			
			el.style.position = "relative";
			el.addClass("ui-treeview-"+type);
			
			el.visible = true;
			
			el.data = data;
			el.fullPath = data.fullPath;
			
			var head = new MT.ui.DomElement();
			var label = new MT.ui.DomElement();
			
			head.label = label;
			
			head.addChild(label).show();
			
			label.el.innerHTML = data.name;
			head.style.position = "relative";
			label.addClass("ui-treeview-label");
			
			label.style.position = "relative";
			label.style.paddingLeft = "30px";
			label.style.paddingRight = "23px";
			
			//el.addChild(head);
			head.show(el.el);
			
			el.head = head;
			head.parent = el;
			
			
			head.addClass("ui-treeview-item-head");
			
			if(isVirtual){
				el.show(parent.el);
				return el;
			}
			
			parent.addChild(el, el.index);
			if(!parent.data || !parent.data.isClosed){
				el.show();
			}
			
			
			if(type == "folder"){
				head.addClass("ui-treeview-folder-head");
				if(data.isClosed){
					el.addClass("close");
					el.visible = false;
				}
				else{
					el.addClass("open");
				}
				
				head.el.onclick = function(e){
					if(e.target != el.head.el && e.target != el.head.label.el){
						return;
					}
					
					if(el.isFolder && e.offsetX > 30){
						return;
					}
					
					e.stopPropagation();
					
					el.visible = !el.visible;
					if(el.visible){
						el.addClass("open");
						el.removeClass("close");
						for(var i=0; i<el.children.length; i++){
							el.children[i].show();
						}
						el.data.isClosed = false;
						that.emit("open", el);
					}
					else{
						el.data.isClosed = true;
						el.addClass("close");
						el.removeClass("open");
						for(var i=0; i<el.children.length; i++){
							el.children[i].hide();
						}
						that.emit("close", el);
					}
				};
				el.show();
				el.isFolder = true;
			}
			
			
			
			if(type == "item"){
				el.isFolder = false;
				if(!data.type){
					var im = document.createElement("img");
					if(data.__image){
						im.src = this.rootPath + "/" +data.__image;
					}
					
					
					head.el.appendChild(im);
					el.image = im;
					im.style.pointerEvents = "none";
				}
				
				if(data.type == "input"){
					var input = new MT.ui.DomElement("span");
					input.el.innerHTML = "88"
					
					input.x = 50;
					
					head.addChild(input);
					el.head = input;
					
				}
				
			}
			
			
			if(this.options.showHide){
				el.addClass("show-hide-enabled");
				var b = this._mkShowHide(el);
				if(!data.isVisible){
					b.addClass("hidden");
				}
				el.options.showHide = b;
			}
			
			if(this.options.lock){
				el.addClass("lock-enabled");
				var b = this._mkLock(el);
				if(!data.isLocked){
					b.addClass("locked");
				}
				el.options.lock = b;
			}
			
			
			head.el.ondblclick = function(e){
				if(el.isFolder && e.offsetX < 30){
					return;
				}
				that.enableRename(el,e);
				e.stopPropagation();
				e.preventDefault();
			};
			
			el.el.onmouseover = function(e){
				that.emit("mouseover", e, el);
			};
			el.el.onmouseout = function(e){
				that.emit("mouseout", e, el);
			};
			this.items.push(el);
			el.needRemove = false;
			return el;
		},
   
		addShowHide: function(){
			for(var i=0; i<this.items.length; i++){
				this._mkShowHide(this.items[i]);
				
			}
		},
		
		_mkShowHide: function(item){
			var that = this;
			var b = new MT.ui.Button("", "show-hide", null,  function(e){
				item.data.isVisible = !item.data.isVisible;
				
				if(item.data.isVisible){
					e.target.ctrl.removeClass("hidden")
				}
				else{
					e.target.ctrl.addClass("hidden")
				}
				
				
				that.emit("show", item);
				
				e.stopPropagation();
				
			});
			item.head.el.appendChild(b.el);
			b.parent = item;
			return b;
		},
		
		addLock: function(){
			for(var i=0; i<this.items.length; i++){
				this._mkLock(this.items[i]);
				
			}
		},
		_mkLock: function(item){
			var that = this;
			var b = new MT.ui.Button("", "lock", null, function(e){
				item.data.isLocked = !item.data.isLocked;
				
				if(item.data.isLocked){
					e.target.ctrl.removeClass("locked")
				}
				else{
					e.target.ctrl.addClass("locked")
				}
				
				
				that.emit("lock", item);
				e.stopPropagation();
			});
			item.head.el.appendChild(b.el);
			b.parent = item;
			return b;
		},
		
		
		
		
		sortable: function(ev){
			
			var dragHelper = this.addItem({name: "xxx", skip: true}, this.tree, 0, true);
			
			dragHelper.style.position = "absolute";
			dragHelper.style.pointerEvents = "none";
			dragHelper.style.bottom = "auto";
			dragHelper.style.opacity = 0.6;
			
			var dd = document.createElement("div");
			dd.style.position = "absolute";
			dd.style.height = "4px";
			dd.style.border = "solid 1px #000";
			dd.style.left = 0;
			dd.style.right = 0;
			dd.style.pointerEvents = "none";
			dd.style.display = "none";
			
			
			var p = dragHelper.el.parentNode;
			dragHelper.addClass("active ui-wrap");
			p.appendChild(dragHelper.el);
			dragHelper.style.display = "none";
			
			p.appendChild(dd);
			
			
			var pe = null;
			var that = this;
			var mdown = false;
			
			var mx = 0;
			var my = 0;
			
			var item = null;
			
			var scrollTop = 0;
			
			var dragged = false;
			var last = null;
			var bottom = false;
			var inFolder = false;
			
			var dropItem = function(item, last){
				
				if(item.el.parentNode){
					item.el.parentNode.removeChild(item.el);
				}
				
				item.parent.removeChild(item);
				
				if(inFolder){
					last.addChild(item);
					if(!last.visible){
						item.hide();
					}
				}
				else{
					if(bottom){
						last.parent.addChild(item, last.index );
					}
					else{
						last.parent.addChild(item, last.index - 1);
					}
					if(item.parent.hasClass("close")){
						item.hide();
					}
				}
				
			};
			
			ev.on("click", function(e){
				
				if(!e.target.ctrl){
					return;
				}
				
				if(!e.target.ctrl.hasParent(that.tree)){
					return;
				}
				
				if(that.dragged){
					return;
				}
				var item = that.getOwnItem(e.target.parentNode.parentNode);
				if(item){
					that.emit("click", item.data, item);
				}
			});
			
			ev.on("mousedown", function(e){
				item = that.getOwnItem(e.target.parentNode.parentNode);
				if( !item ){
					return;
				}
				mdown = true;
				scrollTop = that.tree.el.parentNode.scrollTop;
				
				var y = (item.calcOffsetY(that.tree.el));
				dragHelper.y = y;
				my = y - ev.mouse.y;
			});
			
			ev.on("mouseup", function(e){
				
				dragHelper.style.display = "none";
				dd.style.display = "none";
				dragHelper.y = 0;
				
				if(!mdown){
					return;
				}
				mdown = false;
				
				
				for(var i=0; i<that._onDrop.length; i++){
					if(that._onDrop[i](e, item, last) === false){
						return;
					}
				}
				
				
				if(!dragged){
					return;
				}
				dragged = false;
				
				
				if(!last || last == item || last.parent == item){
					last = null;
					return;
				}
// 				
				dropItem(item, last);
				if(item.hasClass("selected")){
					for(var i=0; i<that.items.length; i++){
						var it = that.items[i];
						if(!it.hasClass("selected")){
							continue;
						}
						if(item == it || last == it || last.parent == it){
							continue;
						}
						dropItem(it, last);
					}
				}
				that.updateFullPath(that.getData(), null, true);
				
			});
			
			ev.on("mousemove", function(e){
				if(!mdown){
					return;
				}
				
				var dy = my - ev.mouse.y;
				var p1 = dragHelper.y + ev.mouse.my - (scrollTop - that.tree.el.parentNode.scrollTop);
				
				scrollTop = that.tree.el.parentNode.scrollTop;
				var p2 = 0;
				var activeItem = that.getOwnItem(e.target.parentNode.parentNode);
				
				dragHelper.y = p1;
				
				if(!activeItem || !item  || activeItem == item || activeItem.hasParent(item) ){
					return;
				}
				
				
				dragHelper.style.display = "block";
				dragHelper.head.el.innerHTML = item.data.name;
				
				p2 = activeItem.calcOffsetY(dd.parentNode);
				if(Math.abs(p1-p2) > dragHelper.el.offsetHeight){
					return;
				}
				
				dragged = true;
				bottom = false;
				inFolder = false;
				
				
				dd.style.display = "block";
				dd.style.height = "4px";
				
				if(p2 < p1){
					p2 += dragHelper.el.offsetHeight;
					bottom = true;
				}
				
				if(Math.abs(p2-p1) < 16 && activeItem.isFolder){
					dd.style.height = dragHelper.el.offsetHeight+"px";
					dd.style.top = activeItem.el.offsetTop+"px";
					inFolder = true;
				}
				else{
					dd.style.top = (p2 - 2)+"px";
				}
				
				last = activeItem;
				
			});
			
		},
		
		enableRename: function(el, ev){
			var that = this;
			if(!this.input){
				this.input = document.createElement("input");
				this.input.className = "ui-input";
			}
			
			this.input.style.left = (el.head.calcOffsetX(document.body))+"px";
			this.input.style.top = (el.calcOffsetY(document.body)) + "px";
			
			this.input.value = el.data.name;
			var lastValue = el.data.name;
			
			this.input.type = "text";
			
			el.head.label.el.innerHTML = "&nbsp;"
			document.body.appendChild(this.input);
			
			var needSave = true;
			this.input.onblur = function(){
				try{
				if(this.parentNode){
					this.parentNode.removeChild(this);
				}}
				catch(e){}
				
				if(needSave && this.value != ""){
					var part = "";
					if(el.parent.data){
						part = el.parent.data.fullPath;
					}
					
					var op = el.data.name;
					
					el.data.fullPath = part+"/"+this.value;
					el.data.name = this.value;
					el.head.label.el.innerHTML = this.value;
					if(that.onChange){
						that.onChange(part + "/" + op, part+"/"+this.value);
					}
				}
				else{
					el.head.label.el.innerHTML = lastValue;
				}
			};
			
			this.input.onkeyup = function(e){
				if(e.which == 27){
					needSave = false;
					this.blur();
				}
				if(e.which == 13){
					this.blur();
				}
			};
			
			
			
			
			this.input.focus();
			
			var tmp = el.data.name.split(".");
			var len = 0;
			if(tmp.length == 1){
				len = tmp[0].length;
			}
			else{
				len = -1;
			}
			for(var i=0; i<tmp.length-1; i++){
				len += tmp[i].length+1;
			}
			
			
			
			this.input.setSelectionRange(0, len);
			
			
			this.inputEnabled = true;
			
		},
   
		remove: function(){
			this.tree.hide();
		},
		
		merge: function(data, oldData){
			this.data = data;
			var p = this.tree.el.parentNode;
			this.updateFullPath(data);
			
			for(var i=0; i<this.items.length; i++){
				this.items[i].needRemove = true;
			}
			
			this.createObject(data, this.tree);
			
			for(var i=0; i<this.items.length; i++){
				if(this.items[i].needRemove){
					this.items[i].parent.removeChild(this.items[i]);
					this.items[i].hide();
					this.items.splice(i,1);
					i--;
					this.emit("deleted", this.items[i]);
				}
			}
			
			//p.appendChild(this.tree.el);
			
		},
   
		getOwnItem: function(it){
			for(var i=0; i<this.items.length; i++){
				if(it == this.items[i].el){// || it == this.items[i].el.parentNode){
					return this.items[i];
				}
			}
			return null;
		},
		
		updateFullPath: function(data, path, shouldNotify){
			path = path || "";
			for(var i=0; i<data.length; i++){
				var fullPath = path + "/" + data[i].name;
				var op = data[i].fullPath;
				data[i].fullPath = fullPath;
				
				if(op != fullPath){
					if(shouldNotify && this.onChange){
						this.onChange(op, fullPath);
					}
					
				}
				
				if(data[i].contents){
					this.updateFullPath(data[i].contents, data[i].fullPath, shouldNotify);
				}
			}
			
			if(shouldNotify){
				this.emit("change", null, null);
			}
			
		},
		
		select: function(id, silent){
			for(var i=0; i<this.items.length; i++){
				if(id == this.items[i].data.id){
					if(silent){
						return this.items[i];
					}
					this.emit("select", this.items[i].data,  this.items[i]);
					return;
				}
			}
			
		},
		
		getById: function(id){
			for(var i=0; i<this.items.length; i++){
				if(id == this.items[i].data.id){
					return this.items[i];
				}
			}
			
		}
		
	}
);
//MT/ui/DomElement.js
MT.namespace('ui');
MT(
	MT.ui.DomElement = function(type){
		type = type || "div";
		this.el = document.createElement(type);
		this.style = this.el.style;
		this.el.ctrl = this;
		
		this.index = 0;
		this.isVisible = false;
		
		// this is confusing, but handy... 
		// probably should rename to something else
		// used only by treeView
		this.children = [];
	},
	{
		_parent: null,
		appendChild: function(el, index){
			el.parent = this;
			el.show(this.el);
			return el;
		},
		
		hasParent: function(parent){
			var p = this.parent;
			while(p){
				if(p == parent){
					return true;
				}
				p = p.parent;
			}
		},
		
		remove: function(){
			if(this.el.parentNode){
				this.el.parentNode.removeChild(this.el);
			}
		},

		show: function(parent){
			
			if(parent == void(0)){
				if(this.parent){
					this._parent = this.parent.el;
				}
				if(!this._parent){
					this._parent = document.body;
				}
			}
			else{
				this._parent = parent;
			}
			
			this._parent.appendChild(this.el);
			this.isVisible = true;
		},
   
		hide: function(){
			if(!this.el.parentNode){
				return;
			}
			this.el.parentNode.removeChild(this.el);
			this.isVisible = false;
		},
   
		hideToTop: function(){
			this.y = -this.height;
		},
   
		addClass: function(cls){
			var cl = cls.split(".");
			if(cl.length > 1){
				for(var i=0; i<cl.length; i++){
					this.addClass(cl[i]);
				}
				return;
			}
			cl = cls.split(" ");
			if(cl.length > 1){
				for(var i=0; i<cl.length; i++){
					this.addClass(cl[i]);
				}
				return;
			}
			
			if(!this.hasClass(cls)){
				this.el.className = (this.el.className + " " + cls).trim();
			}
		},
		
		removeClass: function(cls){
			var cl = cls.split(".");
			if(cl.length > 1){
				for(var i=0; i<cl.length; i++){
					this.removeClass(cl[i]);
				}
				return;
			}
			cl = cls.split(" ");
			if(cl.length > 1){
				for(var i=0; i<cl.length; i++){
					this.removeClass(cl[i]);
				}
				return;
			}
			
			var c = this.el.className.split(" ");
			for(var i=0; i<c.length; i++){
				if(cls == c[i]){
					c[i] = c[c.length-1];
					c.length = c.length - 1;
				}
			}
			this.el.className = c.join(" ");
		},
		
		hasClass: function(cls){
			var c = this.el.className.split(" ");
			for(var i=0; i<c.length; i++){
				if(cls == c[i]){
					return true;
				}
			}
			return false;
		},
		
		_x: 0,
		set x(val){
			this.setX(val);
		},
		
		setX: function(val){
			this._x = val;
			this.style.left = val+"px";
			this.width = this._width;
			
			//this.style.transform =  "translate(" + this.y + "px," + this.y + "px)";
		},
   
		get x(){
			return this._x;
		},
   
		_y: 0,
		set y(val){
			this.setY(val);
		},
		
		setY: function(val){
			this._y = val;
			this.style.top = val;
			//this.style.transform =  "translate(" + this.x + "px," + this.y + "px)";
		},
   
		get y(){
			return this._y;
		},
   
		_height: 0,
		get height(){
			if(this._height){
				return this._height;
			}
			return this.el.offsetHeight;
		},
		set height(val){
			this.setHeight(val);
		},
		
		setHeight: function(val){
			
			this._height = val;
			if(val == 0){
				this.style.height = "auto";
			}
			else{
				this.style.height = val+"px";
			}
		},
   
		_width: 0,
		get width(){
			if(this._width){
				return this._width;
			}
			return this.el.offsetWidth;
		},
		set width(val){
			this.setWidth(val);
		},
   
		setWidth: function(val){
			if(!val){
				return;
			}
			
			this._width = val;
			this.style.width = val+"px";
		},
   
		resize: function(w, h){
			this.width = w || this._width;
			this.height = h || this._height;
		},
		
		calcOffsetY: function(upTo){
			upTo = upTo || document.body;
			var ret = this.el.offsetTop;
			p = this.el.offsetParent;
			while(p && p != upTo){
				ret += p.offsetTop - p.scrollTop;
				p = p.offsetParent;
			}
			
			return ret;
		},
		calcOffsetX: function(upTo){
			upTo = upTo || document.body;
			var ret = this.el.offsetLeft;
			p = this.el.offsetParent;
			while(p && p != upTo){
				ret += p.offsetLeft - p.scrollLeft;
				p = p.offsetParent;
				
			}
			return ret;
		},
		ox: 0,
		oy: 0,
   
		setAbsolute: function(){
			this.style.position = "absolute";
			this.style.top = 0;
			this.style.left = 0;
		},
   
		fitIn: function(){
			this.style.position = "absolute";
			this.style.top = 0;
			this.style.right = 0;
			this.style.bottom = 0;
			this.style.left = 0;
			this.style.height = "auto";
		},
   
		inheritSize: function(el){
			this.x = el.x;
			this.y = el.y;
			this.width = el.width;
			this.height = el.height;
		},
   
		getStyle: function(){
			return window.getComputedStyle(this.el);
		},
   
		sort: function(a,b){
			return a.index - b.index;
		},
   
		addChild: function(child, index){
			child.index = index;
			this.children.push(child);
			this.children.sort(this.sort);
			
			if(index !== void(0)){
				var ch = null;
				for(var i=0; i<this.children.length; i++){
					ch = this.children[i];
					ch.index = i;
					if(ch.el.parentNode){
						ch.el.parentNode.removeChild(ch.el);
					}
					if(ch.isVisible){
						this.el.appendChild(ch.el);
					}
				}
			}
			else{
				if(child.isVisible){
					this.el.appendChild(child.el);
				}
			}
			child.parent = this;
			return child;
		},
		
		removeChild: function(child){
			if(child.el.parentNode == this.el){
				this.el.removeChild(child.el);
			}
			
			for(var i=0; i<this.children.length; i++){
				if(this.children[i] == child){
					this.children.splice(i, 1);
					return;
				}
			}
		},
   
		_index: 0,
		get index(){
			return this._index;
		},
		
		set index(idx){
			this._index = idx;
		},
		
		clear: function(){
			this.el.innerHTML = "";
		},
   
		get bounds(){
			return this.el.getBoundingClientRect();
		}
		
	}
);
//MT/core/Emitter.js
MT.namespace('core');
MT(
	MT.core.Emitter = function(){
		this.callbacks = {};
	},
	{
		on: function(action, cb){
			if(typeof cb != "function"){
				console.error("event",action,"not a function:",cb);
				return;
			}
			
			if(Array.isArray(action)){
				for(var i=0; i<action.length; i++){
					this.on(action[i], cb);
				}
				return;
			}
			
			if(!this.callbacks){
				this.callbacks = {};
			}
			
			if(!this.callbacks[action]){
				this.callbacks[action] = [];
			}
			
			this.callbacks[action].push(cb);
			return cb;
		},
		
		once: function(action, cb){
			if(typeof cb != "function"){
				console.error("event",action,"not a function:",cb);
				return;
			}
			
			if(Array.isArray(action)){
				for(var i=0; i<action.length; i++){
					this.once(action[i], cb);
				}
				return;
			}
			
			var that = this;
			var fn = function(action1, data){
				cb(action1, cb);
				that.off(action, fn);
			};
			
			this.on(action, fn);
			
		},
   
		off: function(type, cb){
			if(cb === void(0)){
				cb = type; type = void(0);
			}
			
			if(type && !this.callbacks[type]){
				return;
			}
			
			if(type){
				this._off(cb, type);
				return;
			}
			
			for(var i in this.callbacks){
				this._off(cb, i);
			}
		},
		
		_off: function(cb, type){
			var i=0, cbs = this.callbacks[type];
			for(i=0; i<cbs.length; i++){
				if(cbs[i] === cb){
					cbs.splice(i, 1);
				}
			}
			return cb;
		},
		
		emit: function(type, action, data){
			if(!this.callbacks){
				return;
			}
			if(!this.callbacks[type]){
				//console.warn("received unhandled data", type, data);
				return;
			}
			
			var cbs = this.callbacks[type];
			var cb = null;
			for(var i=0; i<cbs.length; i++){
				cb = cbs[i];
				cb(action, data);
			}
		}
	}
);
//MT/ui/PanelHead.js
MT.namespace('ui');
MT.extend("ui.DomElement")(
	MT.ui.PanelHead = function(panel){
		MT.ui.DomElement.call(this);
		this.addClass("ui-panel-header");
		this.panel = panel;
		this.el.panel = panel;
		this.tabs = [];
	},
	{
		addTab: function(title, cb){
			var tab = new MT.ui.DomElement("span");
			
			tab.addClass("panel-head-tab");
			tab.title = document.createElement("span");
			tab.title.innerHTML = title;
			tab.el.appendChild(tab.title);
			
			tab.panel = tab.el.panel = this.panel;
			
			var that = this;
			tab.el.data = {
				panel: this.panel
			};
			if(this.tabs.length == 0){
				tab.addClass("active");
			}
			
			this.tabs.push(tab);
			this.appendChild(tab);
			return tab;
		},
		
		
		removeTab: function(tab){
			for(var i=0; i<this.tabs.length; i++){
				if(this.tabs[i] == tab){
					this.tabs.splice(i,1);
					return;
				}
			}
			
		},
		
		setTabs: function(tabs){
			for(var i=0; i<this.tabs.length; i++){
				this.tabs[i].remove();
			}
			
			this.tabs = tabs;
			
			var width = (100/this.tabs.length);
			this.showTabs();
			
		},
		
		showTabs: function(){
			var width = (100/this.tabs.length);
			
			for(var i=0; i<this.tabs.length; i++){
				this.appendChild(this.tabs[i]);
				this.tabs[i].style.width = width+"%";
				if(this.tabs[i].panel == this.panel){
					this.setActiveTab(this.tabs[i]);
				}
			}
			
		},
		
		
		updateTabs: function(){
			for(var i=0; i<this.tabs.length; i++){
				this.tabs[i].remove();
				this.appendChild(this.tabs[i]);
			}
		},
		
		
		setActiveTab: function(tab){
			tab = tab || this.panel.mainTab;
			var t = null;
			for(var i=0; i<this.tabs.length; i++){
				t = this.tabs[i];
				if(t == tab){
					t.addClass("active");
					continue;
				}
				t.removeClass("active");
			}
		},
		setActiveIndex: function(index){
			var t = null;
			for(var i=0; i<this.tabs.length; i++){
				t = this.tabs[i];
				if(i == index){
					t.addClass("active");
					continue;
				}
				t.removeClass("active");
			}
		}




	}
);
//MT/ui/Button.js
MT.namespace('ui');
MT.extend("ui.DomElement")(
	MT.ui.Button = function(text, className, events, cb){
		MT.ui.DomElement.call(this);
		
		this.addClass("ui-button");
		
		if(className){
			this.addClass(className);
		}
		
		if(text != void(0)){
			this.text = text;
		}
		
		if(cb){
			//if(events == null){
				this.el.onclick = cb;
			//}
			/*else{
				var that = this;
				events.on("click", function(e){
					if(e.target === that.el){
						cb(e);
					}
				});
			}*/
		}
		
	},
	{
		set text(val){
			this.el.innerHTML = val;
		},
		get text(){
			return this.el.innerHTML;
		}
		
		
		
	}
);

//MT/core/BasicPlugin.js
MT.namespace('core');
MT(
	MT.core.BasicPlugin = function(channel){
		this.channel = channel;
		this.dealys = {};
	},
	{
		
		initUI: function(ui){
			this.ui = ui;
		},
		
		initSocket: function(socket){
			var that = this;
			this.socket = socket;
			
			this.socket.on(this.channel, function(action, data){
				var act = "a_"+action;
				if(that[act]){
					that[act](data);
				}
				else{
					console.warn("unknown action", that.channel + "["+act+"]", data);
				}
			});
		},
   
		send: function(action, data){
			this.socket.send(this.channel, action, data);
		},
   
		sendDelayed: function(action, data, timeout){
			var that = this;
			if(this.dealys[action]){
				window.clearTimeout(this.dealys[action]);
			}
			
			this.dealys[action] = window.setTimeout(function(){
				that.send(action, data);
				that.dealys[action] = 0;
			}, timeout);
			
		}
	}
);

//MT/plugins/Analytics.js
MT.namespace('plugins');
MT.extend("core.BasicPlugin")(
	MT.plugins.Analytics = function(project){
		MT.core.BasicPlugin.call(this, "Analytics");
		this.project = project;
	},
	{
		installUI: function(ui){
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
			ga('create', 'UA-23132569-11');
			ga('send', 'pageview');
			
			var lastUpdate = Date.now();
			var that = this;
			this.project.plugins.tools.on("select", function(tool){
				lastUpdate = Date.now();
				ga('send', 'event', 'tool-selected', tool);
			});
			
			this.project.plugins.assetsmanager.on("added", function(image){
				lastUpdate = Date.now();
				ga('send', 'event', 'image-added', image);
			});
			
			this.project.plugins.objectsmanager.on("added", function(obj){
				lastUpdate = Date.now();
				ga('send', 'event', 'object-added', obj);
			});
			
			this.project.plugins.objectsmanager.on("changed", function(obj){
				lastUpdate = Date.now();
				ga('send', 'event', 'object-changed', obj);
			});
			
			this.project.plugins.objectsmanager.on("beforeSync", function(){
				lastUpdate = Date.now();
				ga('send', 'event', 'working-with-map', "sync");
			});
			
			var minute = 1000*60;
			window.setInterval(function(){
				if(lastUpdate < Date.now() - minute){
					ga('send', 'event', 'idle', that.project.id);
				}
			}, minute);
		}
	}
);
//MT/plugins/DataLink.js
MT.namespace('plugins');
MT.extend("core.BasicPlugin")(
	MT.plugins.DataLink = function(project){
		MT.core.BasicPlugin.call(this, "DataLink");
		this.project = project;
		
	},
	{ 
		selectElementContents: function(el) {
			var range = document.createRange();
			range.selectNodeContents(el);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		},
		initUI: function(ui){
			var that = this;
			
			var link = window.location.origin;
			link += "/"+this.project.path+"/phaser/mt.data.js";
			
			
			var b = this.project.panel.addButton(link, "datalink", function(e){
				console.log("DataLink", e);
				that.selectElementContents(b.el);
				e.preventDefault();
			});
			
			b.el.onmouseleave = function(){
				window.getSelection().removeAllRanges();
				console.log("leave");
			};
			
			b.style.left = "auto";
			b.style.right = 0;
			b.style.position = "absolute";
		}
		
		
	}
);
//MT/plugins/UndoRedo.js
MT.namespace('plugins');
MT.extend("core.BasicPlugin")(
	MT.plugins.UndoRedo = function(project){
		this.project = project;
		this.buffer = [];
		this._step = 0;
		
		this.max = 100;
		
		this.undos = 0;
		
		window.ur = this;
		this.capacity = 0;
		this.currentOffset = 0;
		
		this.checkLocalStorageCapacity();
	},
	{
		set step(val){
			this._step = val;
		},
		
		get step(){
			return this._step;
		},
		
		installUI: function(){
			var that = this;
			
			var stored = localStorage.getItem(that.project.id);
			if(stored){
				this.buffer = JSON.parse(stored);
				this.step = this.buffer.length;
			}
			
			
			this.om = this.project.plugins.objectsmanager;
			this.om.on("beforeSync", function(data){
				
				var str = JSON.stringify(data);
				
				if(that.buffer[that.step-1] == str){
					//console.log("nothing changed", that.buffer.length);
					return;
				}
				
				if(that.step > that.max){
					that.buffer.shift();
					that.step--;
				}
				
				that.buffer[that.step] = str;
				that.step++;
				that.save();
			});
			
			this.om.on("afterSync", function(data){
				if(that.buffer.length == 0){
					that.buffer.push(JSON.stringify(data));
					that.step++;
				}
			});
			
			
			this.ui.events.on("keydown", function(e){
				if(e.which == "Z".charCodeAt(0)){
					if(!e.shiftKey){
							
							if(that.step > 0){
								that.step--;
								var data = that.buffer[that.step-1];
								if(data){
									that.om.a_receive(JSON.parse(data), true);
								}
								else{
									that.step++;
								}
							}
							else{
								console.log("nothing to undo");
							}
					}
					else{
						if(that.step < that.buffer.length){
							
							
							var data = that.buffer[that.step];
							if(data){
								
								that.om.a_receive(JSON.parse(data), true);
								that.step++;
							}
							else{
								console.log("nothing to redo - no data?");
							}
						}
						else{
							console.log("nothing to redo");
						}
					}
				}
			});
			
		},
		
		save: function(){
			
			var str = JSON.stringify(this.buffer);
			var off = this.currentOffset;
			
			while(str.length > this.capacity && off < this.step){
				off++;
				str = JSON.stringify(this.buffer.slice(off, this.step));
			}
			this.currentOffset = off;
			
			
			console.log("saved last",this.step - off,"steps");
			
			try{
				localStorage.setItem(this.project.id, str);
			}
			catch(e){
				off++;
				localStorage.setItem(this.project.id, JSON.stringify(this.buffer.slice(this.step - off, this.step)) );
			}
		},
		
		checkLocalStorageCapacity: function(){
			var str = "x";
			var ret = 0;
			var koef = 1;
			
			while(true){
				str += str.substring(0, str.length*koef | 0);
				try{
					localStorage.setItem("test", str);
					ret = str.length;
				}
				catch(e){
					koef -= 0.1;
					if(koef < 0.1){
						break
					}
					
					str = str.substring(0, ret);
				}
			}
			
			
			
			localStorage.removeItem("test");
			
			this.capacity = ret;
		}

	}
);


//MT/plugins/Tools.js
MT.namespace('plugins');
MT.require("ui.List");
MT.require("plugins.tools.Select");
MT.require("plugins.tools.Stamp");
MT.require("plugins.tools.Brush");
MT.require("plugins.tools.Text");
MT.require("plugins.tools.TileTool");


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.Tools = function(project){
		MT.core.Emitter.call(this);
		
		
		this.project = project;
		
		this.tools = {};
		
		//var tools = MT.plugins.tools;
		this.toolsAvailable = {
			"select": MT.plugins.tools.Select,
			"Stamp": MT.plugins.tools.Stamp,
			"Brush": MT.plugins.tools.Brush,
			"Text": MT.plugins.tools.Text,
			"TileTool": MT.plugins.tools.TileTool
		};
		


	},
	{
		
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("toolbox",this.ui.left);
			this.panel.addClass("toolbox");
			this.panel.removeHeader();
			this.panel.width = 40;
			this.panel.isResizeable = false;
			this.panel.isDockable = true;
			
			
			ui.dockToLeft(this.panel);
			return;
		},
		
		installUI: function(){
			var that = this;
			var am = this.project.plugins.assetsmanager;
			var map = this.map = this.project.plugins.mapeditor;
			var om = this.om = this.project.plugins.objectsmanager;
			
			for(var i in this.toolsAvailable){
				this.tools[i.toLowerCase()] = new this.toolsAvailable[i](this);
			}
			
			
			am.tv.on("click", function(asset, element){
				that.activeAsset = asset;
				that.emit("assetSelected", asset);
			});
			
			am.on("changeFrame", function(asset, frame){
				that.activeAsset = asset;
				that.emit("assetSelected", asset);
				that.emit("changeFrame", asset, frame);
			});
			
			var select =  function(object){
				if(!object){
					console.error("Failed to select an object");
					return;
				}
				that.select(object);
			};
			map.on("select",select);
			
			
			om.tv.on("click",function(data){
				//that.setTool(that.tools.select);
				select(map.getById(data.id));
			});
			
			
			
			map.selector.on("select", function(obj){
				that.emit("selectedObject", obj.MT_OBJECT.id);
			});
			
			map.selector.on("unselect", function(obj){
				that.emit("unselectedObject", obj.MT_OBJECT.id);
			});
			
			om.on("update", function(){
				if(map.activeObject){
					select(map.activeObject);
				}
				that.emit("update");
			});
			
			var lastKey = 0;
			
			var toCopy = [];
			
			this.ui.events.on("keyup", function(e){
				
				if(lastKey == MT.keys.ESC){
					that.setTool(that.tools.select);
					window.getSelection().removeAllRanges();
					lastKey = 0;
					return;
				}
				
				
				if(e.which == MT.keys.DELETE){
					
					var data = om.tv.getData();
					
					that.map.selector.forEach(function(obj){
						om.deleteObj(obj.MT_OBJECT.id, true, data);
						om.selector.clear();
					});
					
					om.tv.merge(data);
					
					om.sync();
					om.update();
					return;
				}
				
				lastKey = e.which;
				
				window.setTimeout(function(){
					lastKey = 0;
				}, 500);
				
				if(e.which === MT.keys.ESC){
					that.activeTool.deactivate();
				}
				
				
				var copyStarted = {
					x: 0,
					y: 0
				};
				
				if(e.ctrlKey){
					if(e.which === MT.keys.C){
						toCopy.length = 0;
						map.selector.forEach(function(obj){
							toCopy.push(obj);
						});
						return;
					}
					
					if(e.which === MT.keys.V && e.target == document.body){
						var x = that.ui.events.mouse.lastEvent.x;
						var y = that.ui.events.mouse.lastEvent.y;
						that.map.selector.clear();
						
						var bounds = null;
						var midX = 0;
						var midY = 0;
						
						for(var i=0; i<toCopy.length; i++){
							bounds = toCopy[i].getBounds();
							midX += bounds.x;
							midY += bounds.y;
						}
						
						midY /= toCopy.length;
						midX /= toCopy.length;
						
						for(var i=0; i<toCopy.length; i++){
							bounds = toCopy[i].getBounds();
							that.copy(toCopy[i].MT_OBJECT, bounds.x - midX + x - map.offsetX, bounds.y - midY + y - map.offsetY);
							that.map.selector.add(this.map.getById(toCopy[i].id));
						}
					}
				}
			});
			
			
			
			
			for(var i in this.tools){
				this.tools[i].initUI(this.ui);
			}
			
			
			this.setTool(this.tools.select);
			
		},
		
		lastAsset: null,
		
		
		select: function(object){
			this.tools.select.select(object);
			if(this.activeTool != this.tools.select){
				this.activeTool.select(object);
			}
			
		},
		
		copy: function(toCopy, x, y){
			if(Array.isArray(toCopy)){
				for(var i=0; i<toCopy.length; i++){
					this.copy(toCopy[i], x, y);
				}
				return;
			}
			
			
			
			var tc = this.om.copy(toCopy, x, y);
			var sprite = this.map.getById(tc.id);
			
			
			
			this.om.sync();
			
			return sprite;
		},
		
		setTool: function(tool){
			if(this.activeTool == tool){
				return;
			}
			
			if(this.activeTool){
				var oldTool = this.activeTool;
				this.activeTool = null;
				
				oldTool.button.removeClass("active");
				oldTool.deactivate();
			}
			
			this.activeTool = tool;
			this.activeTool.button.addClass("active");
			this.activeTool.init()
			this.emit("select", tool);
		},
		
		mouseDown: function(e){
			if(e.button === 2){
				this.previousMouseMove = this.map.handleMouseMove;
				this.mouseDown_hand(e);
				return;
			}
			
			this.activeTool.mouseDown(e);
		},
		
		mouseUp: function(e){
			
			if(e.button == 2){
				this.map.handleMouseMove = this.previousMouseMove;
				return;
			}
			
			this.activeTool.mouseUp(e);
		},
		
		mouseMove: function(e){
			this.activeTool.mouseMove(e);
		},
		
		lastSelected: null,
		
		selectObject: function(obj, clear){
			if(this.lastSelected == obj && this.map.activeObject){
				return;
			}
			this.lastSelected = obj;
			if(clear){
				this.map.selector.clear();
			}
			
			this.map.selector.add(obj);
			this.map.activeObject = obj;
			
			this.emit("selectObject", obj);
		},
		
		
		initActiveObject: function(asset){
			
			asset = asset || this.lastAsset;
			this.lastAsset = asset;
			
			if(this.activeObject){
				this.map.removeObject(this.activeObject);
			}
			
			var x = this.ui.events.mouse.x;
			var y = this.ui.events.mouse.y;
			var om = this.project.plugins.objectsmanager;
			
			var dx = 0;
			var dy = 0;
			
			if(this.activeObject){
				dx = this.activeObject.x;
				dy = this.activeObject.y;
			}
			
			this.activeObject =  this.map.createObject(om.createObject(asset));
			this.map.activeObject = this.activeObject;
			
			
			this.activeObject.x = dx || x;
			this.activeObject.y = dy || y;
			
			
		},
		
		

		
		
		
		mouseDown_hand: function(e){
			this.map.handleMouseMove = this.map._cameraMove;
		},
		

		

		unselectObjects: function(){
			var toUnselect = [];
			this.map.selector.forEach(function(obj){
				if(!obj.MT_OBJECT.contents){
					toUnselect.push(obj);
				}
			});
			
			for(var i=0; i<toUnselect.length; i++){
				this.map.selector.remove(toUnselect[i]);
			}
			
		},
		
		
	}
);
//MT/plugins/Export.js
MT.namespace('plugins');
MT.extend("core.Emitter").extend("core.BasicPlugin")(
	MT.plugins.Export = function(project){
		MT.core.BasicPlugin.call(this, "Export");
		this.project = project;
		
	},
	{
		initUI: function(ui){
			var that = this;
			this.list = new MT.ui.List([
				{
					label: "Phaser.io (.js)",
					className: "",
					cb: function(){
						that.export("phaser", function(data){
							window.location = that.project.path + "/"+ data.file;
						});
					}
				},
				{
					label: "Phaser.io (data only)",
					className: "",
					cb: function(){
						that.export("phaserDataOnly", function(data){
							that.openDataLink(data);
						});
					}
				},
				{
					label: "Open sample",
					className: "",
					cb: function(){
						that.openLink();
					}
				}
				/*,
				{
					label: "Tiled (.tml)",
					className: "",
					cb: function(){
						alert("in progress");
					}
				}*/
			
			], ui, true);
			
			var b = this.button= this.project.panel.addButton("Export", null, function(e){
				that.showList();
			});
			
			
			
			//this.list.removeHeader();
			//this.list.content.overflow = "initial";
			
		},
		
		export: function(dest, cb){
			console.log("export", dest);
			this.send(dest);
			this.once("done", cb);
		},
		
		showList: function(){
			this.list.width = 250;
			this.list.y = this.button.el.offsetHeight;
			this.list.x = this.button.el.offsetLeft-5;
			this.list.el.style.bottom = "initial";
			this.list.show(document.body);
		},
		
		openDataLink: function(data){
			var w = window.innerWidth*0.5;
			var h = window.innerHeight*0.8;
			var l = (window.innerWidth - w)*0.5;
			var t = (window.innerHeight - h)*0.5;
			
			window.open(this.project.path + "/" + data.file,"","width="+w+",height="+h+",left="+l+",top="+t+"");
		},
		
		openLink: function(){
			var w = window.open("about:blank",Date.now());
			w.opener = null;
			
			var path = this.project.path;
			this.export("phaser", function(data){
				if(w.location){
					w.location.href = path + "/phaser/example.html";
				}
			});
			
		},
		
		a_complete: function(data){
			console.log("data",data);
			this.emit("done", data);
		}
		
	}
);
//MT/plugins/Settings.js
MT.namespace('plugins');
MT.require("ui.Input");

MT(
	MT.plugins.Settings = function(project){
		
		this.project = project;
		this.inputs = [];
		
		
		this.objects = {};
		
		this.activeId = 0;
	},
	{
		initUI: function(ui){
			this.panel = ui.createPanel("Settings");
			this.panel.setFree();
			
			
			var that = this;
			ui.events.on("keyup", function(e){
				if(e.which == MT.keys.ESC){
					that.clear();
				}
			});
			
			this.panel.header.addClass("ui-wrap");
		},
		
		installUI: function(){
			
			var that = this;
			
			//return;
			
			this.assetsManager = this.project.plugins.assetsmanager.tv.on(["click"], function(obj){
				that.handleAssets(obj);
			});
			
			this.project.plugins.tools.on("selectObject", function(obj){
				that.handleObjects(obj.MT_OBJECT);
				that.active = obj.MT_OBJECT.id;
			});
			
			var map = this.project.plugins.mapeditor;
			map.on("select", function(obj){
				if(!obj){
					that.handleScene(map.settings);
				}
			});
			
		},
   
		handleClick: function(obj){
			
			
		},
   
		clear: function(){
			var stack = this.inputs[this.stack];
			for(var i in stack){
				stack[i].hide();
			}
			
			return;
			
			this.panel.title = "Settings";
			for(var i=0; i<this.inputs.length; i++){
				this.inputs[i].remove();
			}
			this.inputs.length = 0;
			
		},
		
		addInput: function(key, toControl, right, cb){
			if(!this.inputs[this.stack]){
				this.inputs[this.stack] = {};
			}
			
			var stack = this.inputs[this.stack];
			var k = key;
			if(typeof key !== "string"){
				k = key.key;
			}
			if(stack[k]){
				stack[k].setObject(toControl);
				stack[k].show();
				return stack[k];
			}
			
			
			var p = this.panel.content;
			
			var fw = new MT.ui.Input(this.project.ui.events, key, toControl);
			fw.show(p.el);
			
			fw.style.position = "relative";
			fw.style.height = "20px";
			
			stack[k] = fw;
			
			fw.on("change", cb);
			return fw;
		},
   
		handleAssets: function(obj){
			if(obj.contents !== void(0)){
				return;
			}
			
			this.clear();
			
			this.panel.title = obj.name;
			
			var that = this;
			var cb = function(){
				that.project.am.updateData();
			};
			
			if(!obj.key){
				obj.key = obj.fullPath;
			}
			
			this.stack = "assets";
			this.addInput( {key: "key", type: "text"}, obj, false, cb);
			this.addInput( {key: "frameWidth", step: 1}, obj, false, cb);
			this.addInput( "frameHeight", obj, true, cb);
			this.addInput( "frameMax", obj, false, cb);
			this.addInput( "margin", obj, true, cb);
			this.addInput( "spacing", obj, false, cb);
			this.addInput( {key: "anchorX", step: 0.5}, obj, true, cb);
			this.addInput( {key: "anchorY", step: 0.5}, obj, true, cb);
			this.addInput( {key: "fps", step: 1}, obj, true, cb);
			
		},
   
		handleObjects: function(obj){
			if(!obj){
				return;
			}
			this.clear();
			
			
			
			this.panel.title = obj.name;
			var that = this;
			var cb = function(){
				that.project.om.update();
			};
			//group
			if(obj.contents){
				this.stack = "group";
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				this.objects.angle = this.addInput( "angle", obj, true, cb);
				if(obj.isFixedToCamera === void(0)){
					obj.isFixedToCamera = 0;
				}
				this.objects.isFixedToCamera = this.addInput({key:"isFixedToCamera", min: 0, max: 1, step: 1}, obj, true, cb);
			}
			// tile layer
			else if(obj.type == MT.objectTypes.TILE_LAYER){
				
				this.stack = "layer";
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				this.addInput("widthInTiles", obj, true, cb);
				this.addInput("heightInTiles", obj, true, cb);
				this.addInput("tileWidth", obj, true, cb);
				this.addInput("tileHeight", obj, true, cb);
				
				
				this.addInput({key:"isFixedToCamera", min: 0, max: 1, step: 1}, obj, true, cb);
				
				this.addInput( {
					key: "anchorX",
					step: 0.1
				}, obj, true, cb);
				this.addInput( {
					key: "anchorY",
					step: 0.1
				}, obj, true, cb);
				
				
			}
			//sprite
			else{
				this.stack = "sprite";
				this.objects.x = this.addInput( "x", obj, true, cb);
				this.objects.y = this.addInput( "y", obj, true, cb);
				
				if(obj._framesCount){
					this.objects.frame = this.addInput( "frame", obj, true, function(){
						
						if(obj.frame >= obj._framesCount){
							obj.frame = 0;
						}
						
						if(obj.frame < 0){
							obj.frame = obj._framesCount - 1;
						}
						
						that.objects.frame.setValue(obj.frame, true);
						
						cb();
					});
				}
				this.objects.angle = this.addInput( "angle", obj, true, cb);
				this.objects.anchorX = this.addInput( {
					key: "anchorX",
					step: 0.1
				}, obj, true, cb);
				this.objects.anchorY = this.addInput( {
					key: "anchorY",
					step: 0.1
				}, obj, true, cb);
				
				this.objects.width = this.addInput( {
					key: "width",
					step: 1,
				}, obj, true, function(width, oldWidth){
					var ow = oldWidth / obj.scaleX;
					var scale = width / ow;
					that.objects.scaleX.setValue(scale);
					cb();
					that.objects.width.setValue(parseInt(width, 10), true);
				});
				
				
				this.objects.height = this.addInput( {
					key: "height",
					step: 1,
				}, obj, true, function(height, oldHeight){
					var ov = oldHeight / obj.scaleY;
					var scale = height / ov;
					that.objects.scaleY.setValue(scale);
					cb();
					that.objects.height.setValue(parseInt(height, 10), true);
				});
				
				this.objects.scaleX = this.addInput( {
					key: "scaleX",
					step: 0.1
				}, obj, true, cb)
				this.objects.scaleY = this.addInput( {
					key: "scaleY",
					step: 0.1
				}, obj, true, cb);
			}
			
		},
		
		update: function(){
			for(var i in this.objects){
				this.objects[i].update();
			}
		},
   
		updateObjects: function(obj){
			if(obj.id != this.activeId){
				return;
			}
			for(var i in this.objects){
				this.objects[i].obj = obj;
				this.objects[i].setValue(obj[i], true);
			}
		},
   
		handleScene: function(obj){
			this.clear();
			
			this.stack = "scene";
			var that = this;
			var cb = function(){
				that.project.plugins.mapeditor.updateScene(obj);
			};
			this.scene = {};
			
			this.scene.cameraX = this.addInput( {key: "cameraX"}, obj, true, cb);
			this.scene.cameraY = this.addInput( {key: "cameraY"}, obj, true, cb);
			this.scene.gridX = this.addInput( {key: "gridX", min: 2}, obj, true, cb);
			this.scene.gridY = this.addInput( {key: "gridY", min: 2}, obj, true, cb);
			this.scene.showGrid = this.addInput( {key: "showGrid", min: 0, max: 1}, obj, true, cb);
			this.scene.backgroundColor = this.addInput( {key: "backgroundColor", type: "text" }, obj, true, cb);
			
		},
   
		updateScene: function(obj){
			for(var i in this.scene){
				this.scene[i].obj = obj;
				this.scene[i].setValue(obj[i]);
			}
		},




	}
);
//MT/plugins/MapEditor.js
MT.namespace('plugins');
"use strict";
MT.requireFile("js/phaser.js", function(){
	MT.requireFile("js/phaserHacks.js");
	
});
MT.require("core.Helper");
MT.require("core.Selector");

MT.plugins.MapEditor = MT.extend("core.Emitter").extend("core.BasicPlugin")(
	function(project){
		MT.core.BasicPlugin.call(this, "MapEditor");
		
		this.project = project;
		
		this.assets = [];
		
		this.objects = [];
		this.tmpObjects = [];
		this.oldObjects = [];
		
		this.groups = [];
		this.oldGroups = [];
		
		this.tilemaps = {};
		
		this.dist = {};
		
		this.selection = new Phaser.Rectangle();
		
		this.selector = new MT.core.Selector();
		
		this.helperBoxSize = 6;
		
		
		this.settings = {
			cameraX: 0,
			cameraY: 0,
			gridX: 64,
			gridY: 64,
			
			gridOffsetX: 0,
			gridOffsetY: 0,
			
			showGrid: 1,
			backgroundColor: "#111111"
		};
		
		
		this.zoom = 1;
		
		window.map = this;
	},
	{
		_mousedown: false,
		
		createTestMap: function(img, x, y){
			x = x || 0;
			y = y || 0;
			if(!this.tm){
				var tm = this.tm = this.game.add.tilemap(null, 64, 100, 640, 500);
				tm.addTilesetImage(img);
				this.layer = tm.createBlankLayer("level1", 10, 10, 64, 100);
				this.layer.fixedToCamera = false;
			}
			this.tm.putTile(1, x, y, "level1");
			
		},
		
		getTileMap: function(obj){
			var tileWidth = obj.tileWidth || 64;
			var tileHeight = obj.tileHeight || 64;
			return this.game.add.tilemap(null, tileWidth, tileHeight, obj.widthInTiles, obj.heightInTiles);
		},
		
		addTileLayer: function(obj){
			console.log("tilemap");
			var tilemap = this.getTileMap(obj);
			
			var tl = tilemap.createBlankLayer(obj.name, obj.widthInTiles, obj.heightInTiles, obj.tileWidth, obj.tileHeight);
			tl.fixedToCamera = obj.isFixedToCamera;
			return tl;
		},
		
		updateTileMap: function(obj, oldLayer){
			oldLayer.destroy();
			
			return this.addTileLayer(obj);
		},
		
		setZoom: function(zoom){
			this.zoom = 1/zoom;
			this.resize();
			
		},
		
		/* basic pluginf fns */
		initUI: function(ui){
			this.ui = ui;
			
			var that = this;
			
			this.panel = ui.createPanel("Map editor");
			ui.setCenter(this.panel);
			
			this.project.ui.on(ui.events.RESIZE,function(){
				that.resize();
			});
			
			this.selector.on("unselect", function(obj){
				that.emit("unselect", obj);
			});
			
			this.createMap();
			
			var tools = this.project.plugins.tools;
			var om = this.project.plugins.objectsmanager;
			
			ui.events.on("mousedown", function(e){
				if(e.target != game.canvas){
					return;
				}
				that.handleMouseDown(e);
			});
			
			window.oncontextmenu = function(e){
				if(e.target == that.game.canvas){
					e.preventDefault();
				}
			};
			
			this.isCtrlDown = false;
			
			ui.events.on("mouseup", function(e){
				that.handleMouseUp(e);
			});
			
			
			var dx = 0;
			var dy = 0;
			ui.events.on("mousemove", function(e){
				that.handleMouseMove(e);
			});
			
			
			ui.events.on("keydown", function(e){
				var w = e.which;
				
				if(e.ctrlKey){
					that.isCtrlDown = true;
				}
				
				if( (e.target != game.canvas && e.target != document.body) ){
					return;
				}
				
				//escape
				if(w == MT.keys.ESC){
					that.activeObject = null;
					that.selector.clear();
					return;
				}
				
				
				that.selector.forEach(function(obj){
					that.moveByKey(e, obj);
				});
			});
			
			ui.events.on("keyup", function(e){
				that.isCtrlDown = false;
				om.sync();
			});
			
		},
		
		installUI: function(){
			var that = this;
			
			this.tools = this.project.plugins.tools;
			
			this.project.plugins.assetsmanager.on("update",function(data){
				that.addAssets(data);
			});
			
			this.project.plugins.objectsmanager.on("update", function(data){
				that.addObjects(data);
			});
			
		},
	
		createMap: function(){
			
			if(this.game){
				this.game.canvas.parentNode.removeChild(this.game.canvas);
				this.game.destroy();
			}
			
			var that = this;
			this.activeObject = null;
			
			var ctx = null;
			
			
			
			var drawObjects = function(obj){
				that.highlightObject(ctx, obj);
			};
			
			var game = this.game = window.game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { 
				preload: function(){
					game.stage.disableVisibilityChange = true;
					var c = game.canvas;
					c.parentNode.removeChild(c);
					that.panel.content.el.appendChild(c);
					c.style.position = "relative";
					that.panel.content.style.overflow = "hidden";
					
				},
				create: function(){
					that.resize();
					that.scale = game.camera.scale;
					if(!ctx){
						ctx = game.canvas.getContext("2d");
					}
					
					that.setCameraBounds();
					that.postUpdateSetting();
					
				},
				
				
				render: function(){
					
					that.drawGrid(ctx);
					
					that.selector.forEach(drawObjects);
					
					that.drawSelection(ctx);
					
					that.highlightDublicates(ctx);
					
				}
			});
			
			
		},
		
		
		resize: function(){
			if(!this.game || !this.game.world){
				return;
			}
			
			this.game.width = this.panel.content.el.offsetWidth;
			this.game.height = this.panel.content.el.offsetHeight;
			
			this.game.renderer.resize(this.game.width, this.game.height);
			
			this.setCameraBounds();
			
		},
		
		setCameraBounds: function(){
			
			this.game.camera.bounds.x = -Infinity;
			this.game.camera.bounds.y = -Infinity;
			this.game.camera.bounds.width = Infinity;
			this.game.camera.bounds.height = Infinity;
			
			
			//this.game.canvas.style.width = "100%";
			//this.game.canvas.style.height = "100%";
			
			this.game.camera.view.width = this.game.canvas.width/this.game.camera.scale.x;
			this.game.camera.view.height = this.game.canvas.height/this.game.camera.scale.y;
			
		},
		
		updateSettings: function(obj){
			if(!obj){
				return;
			}
			
			for(var i in obj){
				this.settings[i] = obj[i];
			}
			
			if(!this.game.isBooted){
				return;
			}
			
			this.postUpdateSetting();
		},
		
		postUpdateSetting: function(){
			
			
			this.game.width = this.settings.worldWidth;
			this.game.height = this.settings.worldHeight;
			
			//this.game.world.setBounds(0, 0, obj.worldWidth, obj.worldHeight);
			
			
			this.setCameraBounds();
			
			
			this.game.camera.x = this.settings.cameraX;
			this.game.camera.y = this.settings.cameraY;
			
			var tmp = this.settings.backgroundColor.substring(1);
			var bg = parseInt(tmp, 16);
			
			if(this.game.stage.backgroundColor != bg){
				this.game.stage.setBackgroundColor(bg);
			}
		},
		
		/* drawing fns */
		drawGrid: function(ctx){
			if(!this.settings.showGrid){
				return;
			}
			
			var alpha = ctx.globalAlpha;
			
			var g = 0;
			var game = this.game;
			
			
			ctx.save();
			
			ctx.scale(this.game.camera.scale.x, this.game.camera.scale.y);
			
			ctx.beginPath();
			
			var bg = game.stage.backgroundColor;
			var inv = parseInt("FFFFFF", 16);
			var xx = (inv - bg).toString(16);
			while(xx.length < 6){
				xx = "0"+xx;
			}
			
			if(parseInt(xx, 16) - bg < 10){
				xx = "#000000";
			}
			
			ctx.strokeStyle = "#"+xx;
			
			//ctx.strokeStyle = "rgba(255,255,255,0.1)";
			
			var offx = this.settings.gridOffsetX % this.settings.gridX - this.settings.gridX;
			var offy = this.settings.gridOffsetY % this.settings.gridY - this.settings.gridY;
			
			var ox = game.camera.x/this.scale.x % this.settings.gridX - offx;
			var oy = game.camera.y/this.scale.y % this.settings.gridY - offy;
			
			var width = game.canvas.width/game.camera.scale.x - offx;
			var height = game.canvas.height/game.camera.scale.y - offy;
			
			
			
			g = this.settings.gridX;
			
			ctx.lineWidth = 0.2;
			ctx.globalAlpha = 1;
			
			ctx.shadowColor = '#000';
			ctx.shadowBlur = 0;
			ctx.shadowOffsetX = 0.5;
			ctx.shadowOffsetY = 0;
			
			
			ctx.beginPath();
			for(var i = -ox; i<width; i += g){
				if(i < 0){
					continue;
				}
				ctx.moveTo(i+0.5, 0.5);
				ctx.lineTo(i+0.5, height+0.5);
			}
			ctx.stroke();
			
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0.5;
			
			ctx.beginPath();
			g = this.settings.gridY;
			for(var j = -oy; j<height; j += g){
				if(j < 0){
					continue;
				}
				ctx.moveTo(0.5, j+0.5);
				ctx.lineTo(width+0.5, j+0.5);
			}
			ctx.stroke();
			
			ctx.lineWidth = 0.5;
			ctx.globalAlpha = 1;
			
			
			// highlight x = 0; y = 0;
			
			ctx.beginPath();
			
			ctx.moveTo(0, -game.camera.y/this.scale.y);
			ctx.lineTo(width, -game.camera.y/this.scale.y);
			
			ctx.moveTo(-game.camera.x/this.scale.x, 0);
			ctx.lineTo(-game.camera.x/this.scale.x, height);
			
			
			ctx.stroke();
			
			
			
			
			ctx.globalAlpha = alpha;
			ctx.restore();
		},
		
		highlightObject: function(ctx, obj){
			
			if(!obj){
				return;
			}
			
			if(!obj.game || !obj.parent){
				obj = this.getById(obj.MT_OBJECT.id);
				if(!obj){
					return;
				}
			}
			
			if(!this.isVisible(obj)){
				return;
			}
			
			
			var alpha = ctx.globalAlpha;
			
			var bounds = obj.getBounds();
			var group = null;
			
			if(obj.MT_OBJECT.contents){
				group = obj;
			}
			else{
				group = obj.parent || game.world;
			}
			
			var x = this.getObjectOffsetX(group);
			var y = this.getObjectOffsetY(group);
			
			
			ctx.save();
			
			ctx.translate(0.5,0.5);
			
			if(this.activeObject == obj){
				ctx.strokeStyle = "rgb(255,0,0)";
				ctx.lineWidth = 1;
				
				
				var off = this.helperBoxSize;
				var sx = bounds.x-off*0.5 | 0;
				var dx = sx + bounds.width | 0;
				
				var sy = bounds.y-off*0.5 | 0;
				var dy = sy + bounds.height | 0;
					
				if(obj.MT_OBJECT.type == MT.objectTypes.TEXT){
					var width = bounds.width;
					if(obj.wordWrap){
						width = obj.wordWrapWidth*this.game.camera.scale.x | 0;
						
						ctx.strokeRect(bounds.x - off | 0, sy + bounds.height*0.5 | 0, off, off);
						ctx.strokeRect(bounds.x + width | 0, sy + bounds.height*0.5 | 0, off, off);
						
					}
					
					ctx.strokeRect(bounds.x | 0, bounds.y | 0, width | 0, bounds.height | 0);
				}
				else{
					if(obj.type != Phaser.GROUP){
						ctx.strokeRect(sx, sy, off, off);
						ctx.strokeRect(sx, dy, off, off);
						ctx.strokeRect(dx, sy, off, off);
						ctx.strokeRect(dx, dy, off, off);
						ctx.beginPath();
						ctx.moveTo(sx + off, bounds.y);
						ctx.lineTo(dx, bounds.y);
						
						ctx.moveTo(sx + off, bounds.y + bounds.height);
						ctx.lineTo(dx, bounds.y + bounds.height);
						
						ctx.moveTo(bounds.x, sy + off);
						ctx.lineTo(bounds.x, dy);
						
						ctx.moveTo(bounds.x + bounds.width, sy + off);
						ctx.lineTo(bounds.x + bounds.width, dy);
						
						
						ctx.stroke();
						
					}
					else{
						ctx.strokeRect(bounds.x | 0, bounds.y | 0, bounds.width | 0, bounds.height | 0);
					}
					
					
				
				}
			}
			else{
				ctx.strokeStyle = "rgb(255,100,0)";
				ctx.strokeRect(bounds.x | 0, bounds.y | 0, bounds.width, bounds.height);
			}
			
			
			
			
			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = 1;
			
			
			
			var par = group.parent;
			var oo = [];
			while(par){
				oo.push({x: par.x, y: par.y, r: par.rotation});
				par = par.parent;
			}
			
			while(oo.length){
				var p = oo.pop();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.r);
				ctx.translate(-p.x, -p.y);
			}
			
			ctx.translate(x, y);
			ctx.rotate(group.rotation);
			ctx.translate(-x, -y);
			
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x, y - 16);
			ctx.stroke();
			ctx.strokeRect(x - 4, y - 4, 8, 8);

			
			ctx.globalAlpha = alpha;
			ctx.restore();
		},
		
		
		drawSelection: function(ctx){
			
			if(this.selection.empty){
				return;
			}
			
			ctx.save();
			
			ctx.strokeStyle = "rgba(0,70, 150, 0.8)";
			ctx.fillStyle = "rgba(0,70, 150, 0.2)";
			
			ctx.strokeRect(this.selection.x - this.game.camera.x, this.selection.y - this.game.camera.y, this.selection.width, this.selection.height);
			ctx.fillRect(this.selection.x - this.game.camera.x, this.selection.y - this.game.camera.y, this.selection.width, this.selection.height);
			
			ctx.restore();
			
		},
		
		highlightDublicates: function(ctx){
			if(!this.isCtrlDown){
				return;
			}
			var o1 = null;
			var o2 = null;
			var bounds = null;
			ctx.save();
			ctx.fillStyle = "rgba(150, 70, 20, 0.2)";
			for(var j=0; j<this.objects.length; j++){
				o1 = this.objects[j];
				if(!this.isVisible(o1)){
					continue;
				}
				for(var i=0; i<this.objects.length; i++){
					o2 = this.objects[i];
					if(o1 == o2){
						continue;
					}
					if(o1.x == o2.x && o1.y == o2.y && o1.MT_OBJECT.assetId == o2.MT_OBJECT.assetId){
						bounds = o1.getBounds();
						ctx.fillRect(bounds.x | 0, bounds.y | 0, bounds.width | 0, bounds.height | 0);
					}
				}
			}
			ctx.restore();
		},
		
		
		/* assets n objects */
		isAssetsAdded: false,
		assetsTimeout: 0,
		addAssets: function(assets, inDepth){
			if(!this.game.isBooted){
				var that = this;
				window.clearTimeout(this.assetsTimeout);
				this.assetsTimeout = window.setTimeout(function(){
					that.addAssets(assets);
				}, 100);
				return;
			}
			
			window.clearTimeout(this.assetsTimeout);
			
			var game = this.game;
			var that = this;
			var asset = null;
			if(!inDepth){
				this.isAssetsAdded = !assets.length;
			}
			for(var i=0; i<assets.length; i++){
				this.addAsset(assets[i], function(){
					that.assetsToLoad--;
					if(that.assetsToLoad == 0){
						that.isAssetsAdded = true;
						that.reloadObjects();
					}
				});
			}
		},
		
		assetsToLoad: 0,
		addAsset: function(asset, cb){
			this.assetsToLoad++;
			if(asset.contents){
				this.addAssets(asset.contents, true);
				if(typeof cb == "function"){
					window.setTimeout(cb, 0);
				}
				return;
			}
			
			var game = this.game;
			var path = this.project.path + "/" + asset.__image;
			if(!MT.core.Helper.isImage(path)){
				if(typeof cb === "function"){
					cb();
				}
				return;
			}
			
			
			var image = new Image();
			image.onload = function(){
				if(asset.width != asset.frameWidth || asset.width != asset.frameHeight){
					game.cache.addSpriteSheet(asset.id, asset.__image, this, asset.frameWidth, asset.frameHeight, asset.frameMax, asset.margin, asset.spacing);
				}
				else{
					game.cache.addImage(asset.id, asset.__image, this);
				}
				
				
				if(typeof cb === "function"){
					cb();
				}
			};
			image.onerror = function(){
				console.error("couldn't load asset", path);
				if(typeof cb === "function"){
					cb();
				}
			};
			
			image.src = path;
		},
		
		checkId: function(){
			var o = null;
			for(var i=0; i<this.objects.length; i++){
				o = this.objects[i];
				for(var j=0; j<this.objects.length; j++){
					if(o == this.objects[j]){
						continue;
					}
					if(o.MT_OBJECT.id == this.objects[j].MT_OBJECT.id){
						console.error("dublicate id");
					}
				}
			}
			
			
		},
		
		_addTimeout: 0,
		addObjects: function(objs, group){
			this.addedObjects = objs;
			
			group = group || game.world;
			if(!this.isAssetsAdded){
				var that = this;
				if(this._addTimeout){
					window.clearTimeout(this._addTimeout);
					this._addTimeout = 0;
				}
				
				this._addTimeout = window.setTimeout(function(){
					that.addObjects(objs);
					this._addTimeout = 0;
				}, 100);
				return;
			}
			
			this.oldObjects.length = 0;
			this.oldObjects = this.objects.slice(0);
			
			for(var i=0; i<this.groups.length; i++){
				if(this.groups[i].parent){
					this.groups[i].destroy(false);
				}
			}
			
			
			//this.oldGroups.length = 0;
			//this.oldGroups = this.oldGroups.slice(0);
			
			
			this.objects.length = 0;
			this.groups.length = 0;
			
			
			this._addObjects(objs, group);
			
			var remove = true;
			for(var i=0; i<this.oldObjects.length; i++){
				remove = true;
				for(var j=0; j<this.objects.length; j++){
					
					if(this.oldObjects[i].MT_OBJECT.id == this.objects[j].MT_OBJECT.id){
						remove = false;
						break;
					}
				}
				if(remove){
					this._destroyObject(this.oldObjects[i]);
				}
			}
			
			
			
			for(var i=0; i<this.tmpObjects.length; i++){
				this.tmpObjects[i].bringToTop();
			}
			
			this.updateSelected();
			this.emit("objectsAdded", this);
			this._addTimeout = 0;
		},
		
		_destroyObject: function(object){
			object.destroy(true);
		},
		
		_addObjects: function(objs, group){
			
			for(var i=objs.length-1; i>-1; i--){
				if(objs[i].contents){
					
					var tmp = this.addGroup(objs[i]);
					group.add(tmp);
					
					this._addObjects(objs[i].contents, tmp);
					continue;
				}
				
				var obj = this.addObject(objs[i], group);
				//obj.bringToTop();
				this.inheritSprite(obj, objs[i]);
				obj.z = i;
			}
		},
		
		addGroup: function(obj){
			
			var group = this.game.add.group();
			group.MT_OBJECT = obj;
			
			this.groups.push(group);
			
			group.x = obj.x;
			group.y = obj.y;
			
			if(obj.angle){
				group.angle = obj.angle;
			}
			
			group.visible = !!obj.isVisible;
			
			group.fixedToCamera = !!obj.isFixedToCamera;
			
			return group;
		},
		
		
		/* TODO: clean up - and seperate object types by corresponding tools*/
		addObject: function(obj, group){
			var oo = null;
			var od = null;
			for(var i=0; i<this.oldObjects.length; i++){
				od = this.oldObjects[i];
				oo = this.oldObjects[i].MT_OBJECT;
				if(!od.parent){
					continue;
				}
					
				if(oo.id == obj.id ){
					// fix this - workaround for older projects
					if(oo.type == void(0)){
						oo.type = MT.objectTypes.SPRITE;
					}
					
					if(oo.type == MT.objectTypes.SPRITE){
						od.loadTexture(oo.assetId, oo.frame);
					}
					
					if(oo.type == MT.objectTypes.TEXT){
						od.text = obj.name;
						od.setStyle(obj.style);
					}
					
					if(oo.type == MT.objectTypes.TILE_LAYER){
						od = this.updateTileMap(obj, od);
						od.MT_OBJECT = obj;
						this.project.plugins.tools.tools.tiletool.updateLayer(od);
					}
					
					this.objects.push(od);
					group.add(od);
					
					if(od.bringToTop){
						od.bringToTop();
					}
					else{
						if(od.parent.bringToTop){
							od.parent.bringToTop(od);
						}
					}
					return od;
				}
			}
			
			if(obj.type == MT.objectTypes.TEXT){
				var t = this.addText(obj, group);
				t.MT_OBJECT = obj;
				this.objects.push(t);
				return t;
			}
			
			if(obj.type == MT.objectTypes.TILE_LAYER){
				var t = this.addTileLayer(obj);
				t.MT_OBJECT = obj;
				this.objects.push(t);
				this.project.plugins.tools.tools.tiletool.updateLayer(t);
				console.log("TILE",this.project);
				return t;
			}
			
			var sp = this.createSprite(obj, group);
			this.objects.push(sp);
			
			return sp;
		},
		
		addText: function(obj, group){
			group = group || this.game.world;
			var t = this.game.add.text(obj.x, obj.y, obj.name, obj.style);
			group.add(t);
			
			return t;
		},
		
		createSprite: function(obj, group){
			var game = this.game;
			group = group || game.world;
			
			var sp = null;
			if(!game.cache.getImage(obj.assetId)){
				obj.assetId = "__missing";
			}
			
			
			sp = group.create(obj.x, obj.y, obj.assetId);
			
			this.inheritSprite(sp, obj);
			
			
			var frameData = game.cache.getFrameData(obj.assetId);
			
			if(frameData){
				//sp.animations.add("default");
			}
			
			return sp;
		},
		
		inheritSprite: function(sp, obj){
			
			sp.MT_OBJECT = obj;
			
			sp.anchor.x = obj.anchorX;
			sp.anchor.y = obj.anchorY;
			
			sp.x = obj.x;
			sp.y = obj.y;
			
			sp.angle = obj.angle;
			
			obj._framesCount = 0;
			
			
			if(obj.frame){
				sp.frame = obj.frame;
			}
			
			/*if(obj.width && obj.height && sp.scale.x == obj.scaleX && sp.scale.y == obj.scaleY){
				if(obj.width != sp.width || obj.height != sp.height){
					sp.width = obj.width;
					sp.height = obj.height;
					
					obj.scaleX = sp.scale.x;
					obj.scaleY = sp.scale.y;
				}
			}*/
			
			if(obj.scaleX){
				if(sp.scale.x != obj.scaleX || sp.scale.y != obj.scaleY){
					sp.scale.x = obj.scaleX;
					sp.scale.y = obj.scaleY;
					obj.width = sp.width;
					obj.height = sp.height;
				}
			}
			
			
			
			sp.visible = !!obj.isVisible;
			
		},
		
		reloadObjects: function(){
			if(this.addedObjects && !this._addTimeout){
				this.addObjects(this.addedObjects);
			}
		},
		
		_activeObject: null,
		_justSelected: null,
		
		get activeObject(){
			if(!this._activeObject){
				return null;
			}
				
			if(!this._activeObject.game){
				this._activeObject = this.getById(this._activeObject.MT_OBJECT.id);
			}
			
			return this._activeObject;
		},
		
		set activeObject(val){
			this._activeObject = val;
		},
		
		get offsetX(){
			return this.panel.content.calcOffsetX() - this.game.camera.x;
		},
		
		get offsetY(){
			return this.panel.content.calcOffsetY() - this.game.camera.y;
		},
		
		get offsetXCam(){
			return this.panel.content.calcOffsetX() + this.game.camera.x;
		},
		
		get offsetYCam(){
			return this.panel.content.calcOffsetY() + this.game.camera.y;
		},
		
		get ox(){
			return this.panel.content.calcOffsetX();
		},
		
		get oy(){
			return this.panel.content.calcOffsetY();
		},
		
		/* input handling */
		handleMouseDown: function(e){
			if(e.button == 0){
				for(var i in this.dist){
					this.dist[i].x = 0;
					this.dist[i].y = 0;
				}
			}
			this.tools.mouseDown(e);
		},
		
		handleMouseUp: function(e){
			this.tools.mouseUp(e);
		},
		
		emptyFn: function(){},
		 
		_handleMouseMove: function(){
			
		},
		
		
		set handleMouseMove(val){
			this._handleMouseMove = val;
		},
		
		get handleMouseMove(){
			return this._handleMouseMove;
		},
		
		
		_cameraMove: function(e){
			this.game.camera.x -= this.ui.events.mouse.mx;
			this.game.camera.y -= this.ui.events.mouse.my;
			this.settings.cameraX = this.game.camera.x;
			this.settings.cameraY = this.game.camera.y;
			
			this.project.settings.updateScene(this.settings);
			
		},
		
		
		dist: null,
		
		_objectMove: function(e, object){
			
			if(!object){
				var that = this;
				this.selector.forEach(function(obj){
					that._objectMove(e, obj);
				});
				return;
			}
			
			var id = object.MT_OBJECT.id;
			if(!object.world){
				object = this.getById(id);
			}
			
			
			var angle = this.getOffsetAngle(object);
			
			var x = this.ui.events.mouse.mx/this.scale.x;
			var y = this.ui.events.mouse.my/this.scale.y;
			
			if(!this.dist[id]){
				this.dist[id] = {
					x: 0,
					y: 0
				};
			}
			var dist = this.dist[id];
			
			
			if(angle){
				x = this.rpx(angle, -this.ui.events.mouse.mx, -this.ui.events.mouse.my, 0, 0);
				y = this.rpy(angle, -this.ui.events.mouse.mx, -this.ui.events.mouse.my, 0, 0);
			}
			
			if(e.ctrlKey){
				
				dist.x += x;
				dist.y += y;
				
				var mx = Math.round( ( dist.x ) / this.settings.gridX) * this.settings.gridX;
				var my = Math.round( ( dist.y ) / this.settings.gridY) * this.settings.gridY;

				dist.x -= mx;
				dist.y -= my;
				
				object.x += mx;
				object.y += my;
				
				object.x = Math.round( object.x / this.settings.gridX ) * this.settings.gridX;
				object.y = Math.round( object.y / this.settings.gridY ) * this.settings.gridY;
				
			}
			else{
				dist.x = x;
				dist.y = y;
				
				object.x += dist.x;
				object.y += dist.y;
			}
			
			this.sync(object);
			this.project.settings.updateObjects(object.MT_OBJECT);
		},
		
		moveByKey: function(e, object){
			var w = e.which;
			var inc = 1;
			
			if(e.ctrlKey){
				if(w == 37 || w == 39){
					inc = this.settings.gridX;
				}
				else{
					inc = this.settings.gridY;
				}
			}
			
			if(w == MT.keys.LEFT){
				object.x -= inc;
			}
			if(w == MT.keys.UP){
				object.y -= inc;
			}
			if(w == MT.keys.RIGHT){
				object.x += inc;
			}
			if(w == MT.keys.DOWN){
				object.y += inc;
			}
			
			object.MT_OBJECT.x = object.x;
			object.MT_OBJECT.y = object.y;
			this.project.settings.updateObjects(object.MT_OBJECT);
			this.sync(object);
		},
		
		_followMouse: function(e, snapToGrid){
			
			if(!this.activeObject){
				return;
			}
			
			this.activeObject.x = e.x - this.ox + this.game.camera.x;
			this.activeObject.y = e.y - this.oy + this.game.camera.y;
			
			if(e.ctrlKey || snapToGrid){
				this.activeObject.x = Math.round(this.activeObject.x / this.settings.gridX) * this.settings.gridX;
				this.activeObject.y = Math.round(this.activeObject.y / this.settings.gridY) * this.settings.gridY;
			}
			
		},
		
		/* helper fns */
		
		getOffsetAngle: function(obj){
			var an = 0;
			var p = obj.parent;
			while(p){
				an += p.rotation;
				p = p.parent;
			}
			
			
			return an;
		},
		
		rpx: function(angle, x, y, cx, cy){
			
			var sin = Math.sin(angle);
			var cos = Math.cos(angle);
			
			return -(x - cx)*cos - (y - cy)*sin + cx;
		},
		
		rpy: function(angle, x, y, cx, cy){
			var sin = Math.sin(angle);
			var cos = Math.cos(angle);
			
			return -(y - cy)*cos + (x - cx)*sin + cy;
		},
		
		sync: function(sprite, obj){
			console.log("sync");
			sprite = sprite || this.activeObject;
			obj = obj || sprite.MT_OBJECT;
			
			obj.x = sprite.x;
			obj.y = sprite.y;
			
			obj.angle = sprite.angle;
			
			obj.scaleX = sprite.scale.x;
			obj.scaleY = sprite.scale.y;
			
			obj.width = sprite.width;
			obj.height = sprite.height;
			
			
			if(sprite == this.activeObject){
				this.project.settings.update();
			}
			
			this.emit("sync", this);
		},
   
		createObject: function(obj){
			var sprite = this.createSprite(obj);
			this.tmpObjects.push(sprite);
			
			return sprite;
		},
		
		removeObject: function(obj){
			for(var i=0; i<this.tmpObjects.length; i++){
				if(this.tmpObjects[i] == obj){
					this.tmpObjects.splice(i,1)[0].destroy();
					i--;
				}
			}
		},

		updateScene: function(obj){
			this.updateSettings(obj);
			
			//console.log("save settings");
			
			
			this.sendDelayed("updateData", this.settings, 100);
			//this.settingsgridX = obj.gridX;
		},
		
		received: false,
		a_receive: function(obj){
			if(this.received){
				return;
			}
			this.received = true;
			this.updateSettings(obj);
		},
		
		createActiveObject: function(obj){
			this.activeObject = this.addObject(obj, this.game.world, true);
			return this.activeObject;
		},
		
		
		getObjectOffsetX: function(obj){
			var off = obj.x;
			while(obj.parent){
				off += obj.parent.x;
				obj = obj.parent;
			}
			return off;
		},
		
		getObjectOffsetY: function(obj){
			var off = obj.y;
			while(obj.parent){
				off += obj.parent.y;
				obj = obj.parent;
			}
			return off;
		},
		
		
		pickObject: function(x, y){
			
			x += this.game.camera.x;
			y += this.game.camera.y;
			
			
			
			var ctrl = false;
			var shift = false;
			
			var lc = this.ui.events.mouse.lastClick;
			if(this.ui.events.mouse.lastClick){
				ctrl = lc.ctrlKey;
				shift = lc.shiftKey
			}
			
			
			for(var i=this.objects.length-1; i>-1; i--){
				if(!this.isVisible(this.objects[i])){
					continue;
				}
				if(this.isLocked(this.objects[i])){
					continue;
				}
				var box = this.objects[i].getBounds();
				if(box.contains(x,y)){
					return this.objects[i];
				}
			}
			
			for(var i=0; i<this.tmpObjects.length; i++){
				var box = this.tmpObjects[i].getBounds();
				if(box.contains(x,y)){
					return this.tmpObjects[i];
				}
			}
			var group = this.isGroupHandle(x, y);
			if(group){
				return group;
			}
			return null;
		},
		
		
		pickGroup: function(x,y){
			
			x += this.game.camera.x;
			y += this.game.camera.y;
			
			
			
			var ctrl = false;
			var shift = false;
			
			var lc = this.ui.events.mouse.lastClick;
			if(this.ui.events.mouse.lastClick){
				ctrl = lc.ctrlKey;
				shift = lc.shiftKey
			}
			
			
			var box = null;
			for(var i=0; i<this.groups.length; i++){
				if(!this.groups[i].visible){
					continue;
				}
				box = this.groups[i].getBounds();
				if(box.contains(x, y)){
					return this.groups[i];
				}
			}
			
			return null;
		},
		
		isVisible: function(obj){
			var o = obj;
			while(o.parent){
				if(!o.visible){
					return false;
				}
				o = o.parent;
			}
			
			return o.visible;
		},
		isLocked: function(obj){
			var o = obj;
			while(o.parent){
				if(!o.MT_OBJECT){
					break;
				}
				if(o.MT_OBJECT.isLocked){
					return true;
				}
				o = o.parent;
			}
			
			return false;
		},
		
		selectRect: function(rect, clear){
			rect.x -= this.game.camera.x;
			rect.y -= this.game.camera.y;
			
			var box = null;
			
			
			for(var i=0; i<this.objects.length; i++){
				if(!this.isVisible(this.objects[i])){
					continue;
				}
				if(this.isLocked(this.objects[i])){
					continue;
				}
				
				box = this.objects[i].getBounds();
				if(box.intersects(rect)){
					this.selector.add(this.objects[i]);
				}
				else if(clear){
					this.selector.remove(this.objects[i]);
				}
			}
			
			rect.x += this.game.camera.x;
			rect.y += this.game.camera.y;
			
		},
		
		isGroupHandle: function(x,y){
			return null;
			
			var bounds = null;
			for(var i=0; i<this.groups.length; i++){
				if(this.isGroupSelected(this.groups[i])){
					var ox = this.getObjectOffsetX(this.groups[i]);
					var oy = this.getObjectOffsetY(this.groups[i]);
					
					if(Math.abs(ox - x) < 10 && Math.abs(oy - y) < 10){
						return this.groups[i];
					}
				}
			}
		},
		
		isGroupSelected: function(group){
			return false;
		},
		
		updateSelected: function(){
			if(!this.activeObject){
				return;
			}
			this.activeObject = this.getById(this.activeObject.MT_OBJECT.id);
		},
		
		
		
		
		getById: function(id){
			for(var i=0; i<this.objects.length; i++){
				if(this.objects[i].MT_OBJECT.id == id){
					return this.objects[i];
				}
			}
			
			for(var i=0; i<this.groups.length; i++){
				if(this.groups[i].MT_OBJECT.id == id){
					return this.groups[i];
				}
			}
			
		}
	}
);   

//MT/plugins/ObjectsManager.js
MT.namespace('plugins');
/* TODO: 
 * - seperate by object types
 * - optimize - so only changed object gets updated not all object chunk
 * - set correct id instead of tmpXXXXX - probably add event on server side
 */

"use strict";

MT.require("ui.TreeView");
MT.require("ui.List");
MT.require("core.Selector");

MT.objectTypes = {
	SPRITE: 0,
	GROUP: 1,
	TEXT: 2,
	TILE_LAYER: 3
};


MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.ObjectsManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "ObjectsManager");
		this.project = project;
		
		this.selector = new MT.core.Selector();
		
		this.id = Date.now();
		
		this.activeGroup = null;
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("Objects");
			this.panel.setFree();
			
			var that = this;
			
			this.panel.addOptions([
				{
					label: "Add Group",
					className: "",
					cb: function(){
						that.createGroup();
						that.panel.options.list.hide();
					}
				},
				{
					label: "Add TileLayer",
					className: "",
					cb: function(){
						that.createTileLayer();
						that.panel.options.list.hide();
					}
				},
				{
					label: "Group Selected Objects",
					className: "",
					cb: function(){
						that.groupSelected();
						that.panel.options.list.hide();
					}
				},
				{
					label: "Delete Selected Objects",
					className: "",
					cb: function(){
						that.deleteSelected();
						that.panel.options.list.hide();
					}
				}
			], ui, true);
			
			
			this.tv = new MT.ui.TreeView([], {
				root: this.project.path,
				showHide: true,
				lock: true
			});
			
			this.tv.on("change", function(oldItem, newItem){
				that.update();
				that.sync();
			});
			
			this.tv.sortable(this.ui.events);
			this.tv.tree.show(this.panel.content.el);
			
			
			this.tv.on("show", function(item){
				that.update();
			});
			
			this.tv.on("lock", function(item){
				that.update();
			});
		},
		
		
		installUI: function(ui){
			var that = this;
			
			var tools = this.project.plugins.tools;
			
			
			tools.on("selectedObject", function(id){
				var el = that.tv.getById(id);
				
				if(el){
					if(el.isFolder){
						that.activeGroup = el.data;
					}
					el.addClass("selected.active");
					that.selector.add(el);
				}
			});
			
			tools.on("unselectedObject", function(id){
				var el = that.tv.getById(id);
				if(el){
					if(that.activeGroup && that.activeGroup.id == id){
						that.activeGroup = null;
					}
					el.removeClass("selected.active");
					that.selector.remove(el);
				}
			});

			this.ui.events.on("mouseup", function(e){
				that.sync();
			});
			
			this.tv.on("deleted", function(o){
				that.selector.remove(o);
			});
			
		},
		
		
		received: false,
		
		a_receive: function(data, silent){
			
			if(this.received && !silent){
				return;
			}
			
			this.received = true;
			this.tv.merge(data);
			
			if(!silent){
				this.emit("afterSync", this.tv.getData());
			}
			this.update();
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		//add object from asset
		addObject: function( e, obj ){
			if(obj.contents){
				return;
			}
			var no = this.createObject(obj, e.offsetX, e.offsetY);
			this.insertObject(no);
		},
		
		
		insertObject: function(obj, silent, data){
			data = data || this.tv.getData();
			
			
			obj.id = "tmp"+this.mkid();
			
			obj.tmpName = obj.tmpName || obj.name;
			
			var arr = data;
			if(this.activeGroup){
				arr = this.activeGroup.contents;
			}
			
			obj.name = obj.tmpName + this.getNewNameId(obj.tmpName, arr, 0);
			
			arr.splice(0,0,obj);
			
			if(!silent){
				this.tv.rootPath = this.project.path
				this.tv.merge(data);
				this.update();
				this.sync();
				this.emit("added", obj);
			}
			
			return data;
		},
		
		createObject: function(asset, x, y){
			x = x || 0;
			y = y || 0;
			
			
			var data = this.tv.getData();
			var name = asset.name.split(".");
			name.pop();
			name = name.join("");
			
			return  {
				assetId: asset.id,
				__image: asset.__image,
				x: x,
				y: y,
				type: MT.objectTypes.SPRITE,
				anchorX: asset.anchorX,
				anchorY: asset.anchorY,
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				alpha: 1,
				tmpName: name,
				frame: 0,
				isVisible: 1,
				isLocked: 0
			};
		},
		
		createTextObject: function(x, y){
			x = x || 0;
			y = y || 0;

			var name = "Text";
			return  {
				x: x,
				y: y,
				type: MT.objectTypes.TEXT,
				anchorX: 0,
				anchorY: 0,
				scaleX: 1,
				scaleY: 1,
				angle: 0,
				alpha: 1,
				tmpName: name,
				isVisible: 1,
				isLocked: 0
			};
			
		},
		
		createGroup: function(silent){
			var data = this.tv.getData();
			
			var tmpName= "Group";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			var group = {
				id: "tmp"+this.mkid(),
				name: name,
				x: 0,
				y: 0,
				angle: 0,
				contents: [],
				isVisible: 1,
				isLocked: 0,
				isFixedToCamera: 0
			};
			
			data.unshift(group);
			
			this.tv.merge(data);
			
			if(!silent){
				this.update();
				this.sync();
			}
			return group;
		},
		
		createTileLayer: function(silent){
			var data = this.tv.getData();
			
			var tmpName= "Tile Layer";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			var obj = {
				id: "tmp"+this.mkid(),
				type: MT.objectTypes.TILE_LAYER,
				name: name,
				x: 0,
				y: 0,
				anchorX: 0,
				anchorY: 0,
				angle: 0,
				data: [],
				isVisible: 1,
				isLocked: 0,
				isFixedToCamera: 0,
				tileWidth: 64,
				tileHeight: 64,
				widthInTiles: 10,
				heightInTiles: 10
			};
			
			data.unshift(obj);
			
			this.tv.merge(data);
			
			if(!silent){
				this.update();
				this.sync();
			}
			
			return obj;
		},
		
		
		copy: function(obj, x, y, name, silent){
			
			name = name || obj.name + this.getNewNameId(obj.name, this.tv.getData());
			var clone = JSON.parse(JSON.stringify(obj));
			clone.name = name;
			clone.x = x;
			clone.y = y;
			
			
			this.cleanUpClone(clone);
			
			
			this.insertObject(clone, silent);
			return clone;
		},
		
		multiCopy: function(arr, cb){
			var data = this.tv.getData();
			var name, obj, clone;
			var out = [];
			
			for(var i=0; i<arr.length; i++){
				obj = arr[i];
				name = obj.name + this.getNewNameId(obj.name, data);
				clone = JSON.parse(JSON.stringify(obj));
				clone.name = name;
				this.cleanUpClone(clone);
				
				if(cb){
					cb(clone);
				}
				
				out.push(clone);
				this.insertObject(clone, true, data);
			}
			
			this.tv.rootPath = this.project.path
			this.tv.merge(data);
			
			this.update();
			this.sync();
			
			return out;
		},
		
		cleanUpClone: function(obj, inc){
			inc = inc || 0;
			inc++;
			
			if(obj.contents){
				for(var i=0; i<obj.contents.length; i++){
					this.cleanUpClone(obj.contents[i], inc);
				}
			}
			obj.id = "tmp"+this.mkid();
		},
		
		
		deleteSelected: function(){
			var data = this.tv.getData();
			this.selector.forEach(function(obj){
				this.deleteObj(obj.data.id, true, data);
			}, this);
			
			
			this.selector.clear();
			this.tv.merge(data);
			this.ui.events.simulateKey(MT.keys.ESC);
			this.sync();
		},
		
		deleteObj: function(id, silent, data){
			var datax = data || this.tv.getData();
			this._delete(id, datax);
			if(!data){
				this.tv.merge(datax);
			}
			//if using silent.. you should call manually sync
			if(!silent){
				this.ui.events.simulateKey(MT.keys.ESC);
				this.sync();
				this.update();
			}
			
			this.emit("deleted", id);
		},
		
		_delete: function(id, data){
			for(var i=0; i<data.length; i++){
				if(data[i].id == id){
					data.splice(i, 1)[0];
					break;
				}
				if(data[i].contents){
					this._delete(id, data[i].contents);
				}
			}
		},
		
		getNewNameId: function(name, data, id){
			id = id || 0;
			var tmpName = name;
			if(id > 0){
				tmpName += id;
			}
			
			
			for(var i=0; i<data.length; i++){
				if(data[i].name == tmpName){
					id++;
					id = this.getNewNameId(name, data, id);
				}
			}
			
			return (id > 0 ? id : "");
		},
		
		buildObjectsTree: function(list){
			var that = this;
			this.tv.rootPath = this.project.path;
			this.tv.merge(list);
			
			this.tv.tree.show(this.panel.content.el);
		},
		
		moveFile: function(a, b){
			this.send("moveFile", {
				a: a,
				b: b
			});
		},
		
		update: function(){
			this.emit("update", this.tv.getData());
		},
		
		select: function(id){
			this.tv.select(id);
		},
		
		cleanSelection: function(){
			
		},
		
		mkid: function(){
			this.id++;
			
			return this.id;
		},
		
		groupSelected: function(){
			var folder = this.createGroup(true);
			var that = this;
			
			var data = this.tv.getData();
			
			this.selector.forEach(function(el){
				var o = el.data;
				this._delete(o.id, data);
				
				folder.contents.push(o);
				
			}, this);
			
			this.tv.merge(data);
			this.send("updateData", data);
		},
		
		_syncTm: 0,
		sync: function(silent){
			
			if(this._syncTm){
				window.clearTimeout(this._syncTm);
				this._syncTm = 0;
			}
			var that = this;
			
			
			this._syncTm = window.setTimeout(function(){
				var data = that.tv.getData();
				var json = JSON.stringify(data);
				if(this._lastData == json){
					this._syncTm = 0;
					return;
				}
				
				this._lastData = json;
				if(!silent){
					that.emit("beforeSync", data);
				}
				
				that.send("updateData", data);
				that._syncTm = 0;
			}, 100);
		},
		
		getById: function(id){
			var items = this.tv.items;
			for(var i=0; i<items.length; i++){
				if(items[i].data.id == id){
					return items[i].data;
				}
			}
			
			return null;
		}
	}
);

//MT/plugins/AssetsManager.js
MT.namespace('plugins');
MT.require("ui.TreeView");
MT.require("ui.List");

MT.extend("core.BasicPlugin").extend("core.Emitter")(
	MT.plugins.AssetsManager = function(project){
		MT.core.Emitter.call(this);
		MT.core.BasicPlugin.call(this, "Assets");
		
		this.selector = new MT.core.Selector();
		
		this.project = project;
		
		this.active = null;
		this.list = {};
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("Assets");
			this.panel.setFree();
			
			var that = this;
			
			this.panel.addOptions([
				{
					label: "new Folder",
					className: "",
					cb: function(){
						that.newFolder();
						that.panel.options.list.hide();
					}
				},
				{
					label: "delete selected",
					className: "",
					cb: function(){
						that.deleteAssets();
						that.panel.options.list.hide();
					}
				}
			]);
			
			
			ui.events.on("drop", function(e){
				that.handleFiles(e);
			});
			
			this.tv = new MT.ui.TreeView([], this.project.path);
			
			this.tv.on("change", function(oldItem, newItem){
				if(oldItem && newItem){
					that.moveFile(oldItem, newItem);
				}
			});
			
			this.tv.sortable(this.ui.events);
			this.panel.content.style.padding = 0;
			
			this.tv.tree.show(this.panel.content.el);
			
			
			this.tv.on("drop", function(e, item, last){
				if(e.target == that.project.map.game.canvas){
					that.project.om.addObject(e, item.data);
					return false;
				}
			});
			
			var select = function(data, element){
				
				if(data.contents){
					return;
				}
				
				if(that.active){
					that.active.removeClass("selected");
				}
				
				that.active = element;
				that.active.addClass("selected");
			};
			
			var click = function(data, element){
				
				var shift = false;
				if(that.ui.events.mouse.lastClick && that.ui.events.mouse.lastClick.shiftKey){
					shift = true;
				}
				
				if(shift){
					that.selector.add(element);
					element.addClass("selected");
				}
				else{
					
					if(data.contents){
						return;
					}
					that.selector.forEach(function(el){
						el.removeClass("active.selected");
					});
					that.selector.clear();
				}
				
				
				if(that.active && !shift){
					that.active.removeClass("active.selected");
					that.selector.remove(element);
				}
				
				that.selector.add(element);
				
				that.active = element;
				that.active.addClass("active.selected");
				
				that.project.map.selector.forEach(function(o){
					o.MT_OBJECT.assetId = data.id;
					o.MT_OBJECT.__image = data.__image;
				});
				that.project.plugins.objectsmanager.update();
				that.project.plugins.objectsmanager.sync();
				
			};
			
			this.tv.on("click", click);
			this.tv.on("select", select);
			
			var prev = new MT.ui.DomElement();
			prev.setAbsolute();
			prev.width = 200;
			prev.height = 200;
			prev.addClass("ui-preview");
			
			var grid = document.createElement("div");
			prev.el.appendChild(grid);
			grid.style.cssText = this.makeGridCss(200,200);
			
			var prevHideTm = 0;
			
			this.tv.on("mouseover", function(e, el){
				var data = el.data;
				if(data.__image){
					window.clearTimeout(prevHideTm);
					
					prev.show(document.body);
					prev.width = data.width;
					prev.height = data.height;
					grid.style.cssText = that.makeGridCss(data.frameWidth + data.spacing, data.frameHeight + data.spacing);
					
					prev.x = el.calcOffsetX() - data.width;
					prev.y = el.calcOffsetY() - (data.height*0.5 - el.el.offsetHeight*0.5);
					prev.style.backgroundImage = "url('"+that.project.path + "/" +data.__image+"')";
					if(prev.y < 0){
						prev.y = 0;
					}
					prev.el.setAttribute("data-size", data.width+"x"+data.height);
					
					prev.target = e.target;
					prev.data = data;
					prev.element = el;
				}
			});
			
			this.tv.on("mouseout", function(e, el){
				if(prevHideTm){
					window.clearTimeout(prevHideTm);
				}
				prevHideTm = window.setTimeout(function(){
					prev.hide();
				}, 300);
				
			});
			var update = function(){
				that.updateData();
			};
			
			this.tv.on("open", update);
			this.tv.on("close", update);
			
			prev.el.onmouseover = function(){
				if(prevHideTm){
					window.clearTimeout(prevHideTm);
				}
			};
			prev.el.onmouseout = function(){
				prev.hide();
			};
			
			prev.el.onclick = function(e){
				click(prev.data, prev.element);
				
				if(that.active.data != prev.data){
					return;
				}
				
				var data = prev.data;
				
				var frame = that.getFrame(prev.data, e.offsetX, e.offsetY);
				
				that.project.map.selector.forEach(function(o){
					o.MT_OBJECT.assetId = data.id;
					o.MT_OBJECT.__image = data.__image;
					o.MT_OBJECT.frame = frame;
					
				});
				
				that.project.plugins.objectsmanager.update();
				that.project.plugins.objectsmanager.sync();
				
				that.emit("changeFrame", data, frame);
				
			};
			
			ui.events.on("keydown", function(e){
				var w = e.which;
				if(w == MT.keys.ESC){
					that.selector.forEach(function(obj){
						obj.removeClass("active.selected");
					});
					that.selector.clear();
					
					if(!that.active){
						return;
					}
					that.active.removeClass("active.selected");
					that.active = null;
					return;
				}
			});
			
		},
		
		installUI: function(ui){
			
			var that = this;
			
			this.project.plugins.tools.on("selectedObject", function(objId){
				var obj = that.project.plugins.objectsmanager.getById(objId);
				if(obj){
					that.tv.select(obj.assetId);
					
					var asset = that.tv.getById(obj.assetId);
					
					that.selector.add(asset);
				}
				
			});
			
			this.project.plugins.tools.on("unselectedObject", function(objId){
				var obj = that.project.plugins.objectsmanager.getById(objId);
				
				if(obj){
					var asset = that.tv.getById(obj.assetId);
					
					if(that.active){
						that.active.removeClass("selected.active");
						that.active = null;
					}
					
					if(that.selector.is(asset)){
						asset.removeClass("selected.active");
						that.selector.remove(asset);
					}
				}
				
				
			});
			
			var select = function(obj){
				if(obj.contents){
					if(that.active){
						that.active.removeClass("selected");
						that.active = null;
						that.tv.select(null);
					}
					return;
				}
				that.tv.select(obj.assetId, true);
			};
			
			this.project.om.tv.on("click", select);
			this.project.om.tv.on("select", select);
		},
		
		makeGridCss: function(w, h, margin){
			margin = margin | 0;
			return "background-size: "+w+"px "+h+"px; \
					background-position: "+margin+"px "+margin+"px; \
					background-image:repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent "+h+"px),\
					repeating-linear-gradient(-90deg, #fff, #fff 1px, transparent 1px, transparent "+w+"px); width: 100%; height: 100%; position: absolute;";
		},
		
		getFrame: function(o, x, y){
			
			var gx = Math.floor(x/(o.frameWidth + o.spacing));
			var gy = Math.floor(y/(o.frameHeight + o.spacing));
			
			var maxX = Math.floor( o.width / o.frameWidth);
			
			var frame = gx + maxX*gy;
			
			console.log("getrame", frame);
			
			return frame;
		},
		
		
		update: function(){
			var data = this.tv.getData();
			this.emit("update", data);
		},
		
		a_receiveFileList: function(list){
			this.buildAssetsTree(list);
			this.buildList(list);
			this.update();
		},
		
		buildList: function(list){
			for(var i=0; i<list.length; i++){
				if(list[i].contents){
					this.buildList(list[i].contents);
					continue;
				}
				this.list[list[i].id] = list[i];
			}
		},
		
		handleFiles: function(e){
			var that = this;
			var files = e.dataTransfer.files;
			var entry = null;
			for(var i=0; i<files.length; i++){
				//chrome
				if(e.dataTransfer.items){
					entry = (e.dataTransfer.items[i].getAsEntry ? e.dataTransfer.items[i].getAsEntry() : e.dataTransfer.items[i].webkitGetAsEntry());
					this.handleEntry(entry);
				}
				//ff
				else{
					this.handleFile(files.item(i));
				}
			}
		},
		
		handleFile: function(file){
			var path = file.path || file.name;
			//folder
			if(file.size == 0){
				this.send("newFolder", path);
			}
			//file
			else{
				this.uploadImage(file, path);
			}
		},
		
		handleEntry: function(entry){
			var that = this;
			
			if (entry.isFile) {
				entry.file(function(file){
					that.uploadImage(file, entry.fullPath);
					
				});
			} else if (entry.isDirectory) {
				this.send("newFolder", entry.fullPath);
				
				var reader = entry.createReader();
				reader.readEntries(function(ev){
					for(var i=0; i<ev.length; i++){
						that.handleEntry(ev[i]);
					}
				});
			}
		},
		
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		updateData: function(){
			this.send("updateData", this.tv.getData());
		},
   
		buildAssetsTree: function(list){
			var that = this;
			list.sort(function(a,b){
				var inca = ( a.contents ? 1000 : 0);
				var incb = ( b.contents ? 1000 : 0);
				var res = (a.name > b.name ? 1 : -1);
				return res + incb-inca;
			});
			

			this.tv.rootPath = this.project.path;
			this.tv.merge(list);
		},
		
		moveFile: function(a, b){
			this.send("moveFile", {
				a: a,
				b: b
			});
		},
		
		newFolder: function(){
			var data = this.tv.getData();
			
			var tmpName= "new folder";
			var name = tmpName;
			for(var i=0; i<data.length; i++){
				if(data[i].name == name){
					name = tmpName+" "+i;
				}
			}
			
			data.unshift({
				name: name,
				contents: []
			});
			
			this.send("newFolder", name);
			
			this.tv.merge(data);
		},
		
		deleteAssets: function(){
			this.selector.forEach(function(obj){
				this.deleteAsset(obj.data.id);
			}, this);
		},
		
		deleteAsset: function(id, silent){
			this.send("delete", id);
			this.emit("deleted", id);
			//if using silent.. you should call manually sync
			if(!silent){
				this.ui.events.simulateKey(MT.keys.ESC);
			}
		},
		
		getById: function(id){
			var items = this.tv.items;
			for(var i=0; i<items.length; i++){
				if(items[i].data.id == id){
					return items[i].data;
				}
			}
			
			return null;
		},
		
		uploadImage: function(file, path){
			var fr  = new FileReader();
			var that = this;
			fr.onload = function(){
				var img = new Image();
				img.onload = function(){
					
					var data = {
						data: fr.result,
						name: file.name,
						path: path,
						fullPath: path,
						key: path,
						width: img.width,
						height: img.height,
						frameWidth: img.width,
						frameHeight: img.height,
						frameMax: -1,
						margin: 0,
						spacing: 0,
						anchorX: 0,
						anchorY: 0,
						fps: 10
					};
					
					that.guessFrameWidth(data);
					
					that.send("newImage", data);
					that.emit("added", path);
				};
				img.src = "data:image/png;base64,"+btoa(fr.result);
			};
			
			fr.readAsBinaryString(file);
		},
		
		guessFrameWidth: function(data){
			var basename = data.name.split(".");
			//throw away extension
			basename.pop();
			
			var tmp = basename.join(".").split("_").pop();
			var dimensions = null;
			if(tmp){
				dimensions = tmp.split("x");
				var w = parseInt(dimensions[0], 10);
				var h = parseInt(dimensions[1], 10);
				if(w && !isNaN(w) && h && !isNaN(h)){
					data.frameWidth = w;
					data.frameHeight = h;
				}
			}
			
			
		}
		
	}
);

//MT/ui/Panel.js
MT.namespace('ui');
"use strict";

MT.require("ui.Button");
MT.require("ui.PanelHead");
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.Panel = function(title, ui){
		MT.ui.DomElement.call(this);
		this.setAbsolute();
		
		this.header = new MT.ui.PanelHead(this);
		this.mainTab = this.header.addTab(title);
		
		this.content = new MT.ui.DomElement();
		this.appendChild(this.content);
		
		
		this.content.show(this.el);
		this.content.addClass("ui-panel-content");
		
		
		if(title){
			this.addHeader();
		}
		
		this.title = title;
		
		this.buttons = [];
		this.savedBox = {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};
		this.isVisible = false;
		
		this.joints = [this];
		
		this.addClass("ui-panel");
		
		
		this.top = null;
		this.right = null;
		this.bottom = null;
		this.left = null;
		
		this.ui = ui;
	},
	{
		isResizeable: false,
		isMovable: false,
		isDockable: false,
		isJoinable: false,
		acceptsPanels: false,
		isPickable: true,
		
		setFree: function(){
			this.isMoveable = true;
			this.isDockable = true;
			this.isJoinable = true;
			this.isDockable = true;
			this.isResizeable = true;
			this.acceptsPanels = true;
		},
		
		addOptions: function(options){
			this.options = {};
			var list = this.options.list = new MT.ui.List(options, this.ui, true);
			
			list.addClass("settings-list");
			list.fitIn();
			
			var that = this;
			
			var button = this.options.button = new MT.ui.Button(null, "ui-options", null, function(e){
				e.stopPropagation();
				
				if(!list.isVisible){
					list.show(that.header.el);
					button.addClass("selected");
				}
				else{
					list.hide();
					button.removeClass("selected");
				}
			});
			button.show(this.header.el);
			
			list.on("hide", function(){
				button.removeClass("selected");
			});
			
			this.header.addChild(this.options);
			list.fitIn();
			
			return this.options;
		},
		
		
		activate: function(){
			this.show();
		},

		setX: function(val){
			
			this.setClearX(val);
			
			if(this.top && this.top.x != val){
				this.top.setX(val);
			}
			if(this.bottom && this.bottom.x != val){
				this.bottom.setX(val);
			}
		},
		
		setClearX: function(val){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setX.call(this.joints[i], val);
			}
		},
		
		setWidth: function(val){
			
			this.setClearWidth(val)
			
			if(this.top && this.top.width != val){
				this.top.setWidth(val);
			}
			if(this.bottom && this.bottom.width != val){
				this.bottom.setWidth(val);
			}
		},
		
		setClearWidth: function(val){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setWidth.call(this.joints[i], val);
			}
		},
		
		setY: function(val){
			
			if(this.top){
				this.top.height += val - this.y;
			}
			
			
			this.setClearY(val);
		},
		
		setClearY: function(val){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setY.call(this.joints[i], val);
			}
		},
		
		setHeight: function(val){
			
			if(this.dockPosition == MT.TOP && this.bottom){
				this.bottom.setClearY(this.bottom.y + (val - this.height));
			}
			
			this.setClearHeight(val);
			
			if(this.left && this.left.height != val){
				this.left.setWidth(val);
			}
			if(this.right && this.right.width != val){
				this.right.setWidth(val);
			}
			
			
			
		},
		
		setClearHeight: function(val){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.setHeight.call(this.joints[i], val);
			}
		},
		
		show: function(parent, silent){
			if(this.isVisible){
				return;
			}
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].hide(false);
			}
			
			MT.ui.DomElement.show.call(this, parent);
			this.setAll("_parent", this._parent);
			
			if(silent !== false){
				this.emit("show");
			}
			
			this.header.showTabs();
			this.content.fitIn();
			this.content.y = this.header.el.offsetHeight;
		},
		
		addClass: function(className){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.addClass.call(this.joints[i], className);
			}
		},
		
		removeClass: function(className){
			for(var i=0; i<this.joints.length; i++){
				MT.ui.DomElement.removeClass.call(this.joints[i], className);
			}
		},
		
		setJoints: function(key, value){
			for(var i=0; i<this.joints.length; i++){
				this.joints[i][key] = value;
			}
			
		},
		
		setAll: function(key, value){
			this.setJoints(key, value);
		},
		
		setTop: function(key, value){
			this.setAll(key, value);
			if(this.top){
				this.top.setTop(key,value);
			}
		},
		
		setBottom: function(key, value){
			this.setAll(key, value);
			if(this.bottom){
				this.bottom.setBottom(key,value);
			}
		},
		
		setTopBottom: function(key, value){
			this.setTop(key, value);
			this.setBottom(key, value);
		},
		
		setLeftRight: function(key, value){
			//console.log("TODO");
		},
		
		unjoin: function(){
			if(this.joints.length == 1){
				this.breakSideJoints();
				return;
			}
			
			this.removeSideJoints();
			var oldJoints = this.joints;
			
			this.header.removeTab(this.mainTab);
			
			for(var i=0; i<oldJoints.length; i++){
				if(oldJoints[i] == this){
					continue;
				}
				oldJoints[i].removeJoint(this);
			}
			
			this.joints = [this];
			
			this.header.setTabs([this.mainTab]);
			
			for(var i=0; i<oldJoints.length; i++){
				if(oldJoints[i] != this){
					oldJoints[i].show();
					break;
				}
			}
		},
		
		_dockPosition: MT.NONE,
		set dockPosition(pos){
			var topMost = this.getTopMost();
			topMost.setDockPosition(pos);
		},
		
		setDockPosition: function(pos, skip){
			
			this.removeClassAll("docked-left");
			this.removeClassAll("docked-right");
			this.removeClassAll("docked-top");
			this.removeClassAll("docked-bottom");
			this.removeClassAll("docked-left-bottom");
			this.removeClassAll("docked-left-top");
			this.removeClassAll("docked-center");
			
			this.setAll("_dockPosition", pos);
			
			if(pos == MT.LEFT || pos == MT.RIGHT){
				if(!this.top){
					this.addClassAll("docked-left-top");
				}
				
				if(!this.bottom){
					this.addClassAll("docked-left-bottom");
				}
				
				if(pos == MT.LEFT){
					this.addClassAll("docked-left");
				}
				
				if(pos == MT.RIGHT){
					this.addClassAll("docked-right");
				}
			}
			
			if(pos == MT.TOP){
				this.addClassAll("docked-top");
			}
			if(pos == MT.BOTTOM){
				this.addClassAll("docked-bottom");
			}
			if(pos == MT.CENTER){
				this.addClassAll("docked-center");
			}
			if(this.bottom){
				this.bottom.setDockPosition(pos);
			}
		},
		
		getTopMost: function(){
			var top = this;
			while(top.top){
				top = top.top;
			}
			return top;
		},
		
		getBottomMost: function(){
			var bottom = this;
			while(bottom.bottom){
				bottom = bottom.bottom;
			}
			return bottom;
		},
		
		get dockPosition(){
			return this._dockPosition;
		},
		
		addClassAll: function(className){
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].addClass(className);
			}
		},
		
		removeClassAll: function(className){
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].removeClass(className);
			}
		},
		
		
		joinBottom: function(panel, noResize){
			if(panel == this.bottom){
				return;
			}
			if(!noResize){
				this.setClearHeight(this.height - panel.height);
				panel.setClearWidth(this.width);
				
				panel.setClearX(this.x);
				panel.setClearY(this.y + this.height);
			}
			
			if(this.bottom){
				this.bottom.setAll("top", panel);
				panel.setAll("bottom" , this.bottom);
			}
			
			this.setAll("bottom", panel);
			panel.setAll("top", this);
			
			panel.setAll("top", panel.top);
			panel.setAll("bottom", panel.bottom);
			
		},
		
		joinTop: function(panel, noResize){
			if(panel == this.top){
				return;
			}
			if(!noResize){
				this.setClearHeight(this.height - panel.height);
				panel.setClearWidth(this.width);
				
				panel.setClearX(this.x);
				
				
				var y = this.y + this.height;
				
				panel.setClearY(this.y);
				this.setClearY(y);
			}
			
			if(this.top){
				this.top.setAll("bottom", panel);
				panel.setAll("top", this.top);
			}
			
			this.setAll("top", panel);
			panel.setAll("bottom", this);
			
		},
		
		
		removeSideJoints: function(){
			if(this.joints.length > 1){
				var next = null;
				for(var i=0; i<this.joints.length; i++){
					next = this.joints[i];
					if(next != this){
						break;
					}
				}
				
				this.setAll("top", this.top);
				this.setAll("bottom", this.bottom);
				
				if(this.top){
					this.top.setAll("bottom", next);
				}
				if(this.bottom){
					this.bottom.setAll("top", next);
				}
				
				this.top = null;
				this.bottom = null;
				return;
			}
			
			
			if(this.top){
				this.top.setAll("bottom", this.bottom);
			}
			if(this.bottom){
				this.bottom.setAll("top", this.top);
			}
			
			this.top = null;
			this.bottom = null;
		},
		
		breakSideJoints: function(){
			var pos = this.dockPosition;
			if(this.bottom){
				if(this.top){
					this.top.setAll("bottom", this.bottom);
				}
				this.bottom.setAll("top", this.top);
				
				
				this.bottom.setClearHeight(this.bottom.height + this.height);
				this.bottom.setClearY(this.y);
				
				this.bottom.setDockPosition(pos);
				
			}
			else if(this.top){
				if(this.bottom){
					this.bottom.setAll("top", this.top);
				}
				this.top.setAll("bottom", this.bottom);
				
				this.top.setClearHeight(this.top.height + this.height);
			}
			
			
			this.setAll("top", null);
			this.setAll("bottom", null);
			this.setAll("left", null);
			this.setAll("right", null);
			
		},
		
		_isDocked: false,
		set isDocked(val){
			this.setAll("_isDocked", val);
		},
		
		get isDocked(){
			return this._isDocked;
		},
		
		addJoint: function(panel){
			panel.removeClass("animated");
			this.removeClass("animated");
			if(panel.joints == this.joints){
				return;
			}
			for(var i=0; i<panel.joints.length; i++){
				this.joints.push(panel.joints[i]);
			}
			
			
			if(this.header.tabs != panel.header.tabs){
				
				var tabs = panel.header.tabs;
				var needPush = true;
				for(var i=tabs.length-1; i>-1; i--){
					for(var j=0; j<this.header.tabs.length; j++){
						if(this.header.tabs[j] == tabs[i]){
							needPush = false;
							break;
						}
					}
					if(needPush){
						this.header.tabs.push(tabs[i]);
					}
				}
			}
			
			panel.setAll("joints", this.joints);
			
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].header.tabs = this.header.tabs;
			}
			
			
			this.setAll("top", this.top);
			this.setAll("bottom", this.bottom);
		},
		
		removeJoint: function(panel){
			var j = null;
			for(var i=0; i<this.joints.length; i++){
				j = this.joints[i];
				if(j == panel){
					this.joints.splice(i, 1);
					return;
				}
			}
		},
		
		vsBox: function(box){
			return !(this.x + this.width < box.x || this.y + this.height < box.y || this.x > box.x + box.width || this.y > box.y + box.height);
		},
		
		vsPoint: function(point){
			return !(this.x + this.width < point.x || this.y + this.height < point.y || this.x > point.x || this.y > point.y );
		},
		
		mouseDown: false,
		
		saveBox: function(shallow){
			if(this.isDocked){
				console.warn("saving docked panel");
				return;
			}
			
			this.savedBox.width = this.width;
			this.savedBox.height = this.height;
			if(shallow){
				return;
			}
			for(var i=0; i<this.joints.length; i++){
				this.joints[i].saveBox(true);
			}
		},
		
		loadBox: function(){
			this.width = this.savedBox.width;
			this.height = this.savedBox.height;
		},
		
		hide: function(silent){
			if(!this.isVisible){
				return;
			}
			MT.ui.DomElement.hide.call(this);
			if(silent !== false){
				this.emit("hide");
			}
		},
		
		addHeader: function(){
			this.appendChild(this.header);
			this.header.show(this.el);
		},
		
		removeHeader: function(){
			this.header.hide();
			this.content.y = 0;
		},
		
		addButton: function(title, className, cb){
			var b = null;
			
			if(title && typeof title == "object"){
				b = title;
			}
			else{
				b = new MT.ui.Button(title, className, this.events, cb);
			}
			this.content.addChild(b);
			this.buttons.push(b);
			b.show();
			
			return b;
		},
		
		alignButtons: function(){
			var off = 0;
			var c = null;
			for(var i=0; i<this.buttons.length; i++){
				c = this.buttons[i];
				c.x = off;
				off += c.width;
			}
		},
		
		addButtonV: function(title, className, cb){
			var b = new MT.ui.Button(title, className, this.events, cb);
			
			var off = 0;
			for(var i=0; i<this.content.children.length; i++){
				off += this.content.children[i].el.offsetHeight;
			}
			
			b.y += off;
			
			this.content.addChild(b);
			return b;
		},
		
		getJointNames: function(){
			var names = [];
			for(var i=0; i<this.joints.length; i++){
				if(this.joints[i] == this){
					continue;
				}
				names.push(this.joints[i].name);
			}
			
		},
		
	}
);

//MT/ui/Events.js
MT.namespace('ui');
MT(
	MT.ui.Events = function(){
		if(window.MT.events){
			console.warn("events already initialized");
			return window.MT.events;
		}
		window.MT.events = this;
		
		this.events = {
			mousemove: [],
			mouseup: [],
			mousedown: [],
			drop: [],
			dragend: [],
			drag: [],
			dragover:[],
			click: [],
			resize: []
		};
		
		this._cbs = [];
		
		this.enable();
		
		this.mouse = {
			x: 0,
			y: 0,
			mx: 0,
			my: 0,
			down: false,
			lastEvent: null,
			lastClick: null
		};
	},
	{
		MOUSEMOVE: "mousemove",
		MOUSEUP: "mouseup",
		MOUSEDOWN: "mousedown",
		RESIZE: "resize",
		
		enable: function(){
			var that = this;
			for(var i in this.events){
				
				this.addEvent(i);
			}
		},
		
		disable: function(){
			for(var i in this.events){
				document.body.removeEventListener(this._cbs[i].type, this._cbs[i]);
			}
		},
		on: function(type, cb){
			if(!this.events[type]){
				console.warn("new Event:", type);
				this.events[type] = [];
				this.addEvent(type);
			}
			
			this.events[type].push(cb);
			return cb;
		},
   
		addEvent: function(i){
			var cb = this._mk_cb(i);
			this._cbs.push(cb);
			window.addEventListener(i, cb, false);
			
		},
		
		off: function(cb){
			var ev = null;
			for(var i in this.events){
				ev = this.events[i];
				for(var j=0; j<ev.length; j++){
					if(ev[j] == cb){
						ev[j] = ev[ev.length-1];
						ev.length = ev.length-1;
					}
				}
			}
		},
   
		simulateKey: function(which){
			this.emit("keydown",{
				which: which,
				target: document.body
			});
			
		},
		
		emit: function(type, data){
			if(!this.events[type]){
				console.warn("unknown event", type);
			}
			var ev = this.events[type];
			var e = null;
			
			for(var i=0; i<ev.length; i++){
				e = ev[i];
				e(data);
			}
		},
   
		
		_mk_mousemove: function(){
			
			var that = this;
			var cb = function(e){
				e.x = e.x || e.pageX;
				e.y = e.y || e.pageY;
				
				that.mouse.mx = e.pageX - that.mouse.x;
				that.mouse.my = e.pageY - that.mouse.y;
				
				if(that.mouse.mx == 0 && that.mouse.my == 0){
					return;
				}
				
				that.mouse.x = e.pageX;
				that.mouse.y = e.pageY;
				
				that.mouse.lastEvent = e;
				
				that.emit("mousemove", e);
			};
			cb.type = "mousemove";
			return cb;
			
		},
		_mk_mousedown: function(){
			
			var that = this;
			var cb = function(e){
				e.x = e.x || e.pageX;
				e.y = e.y || e.pageY;
				that.mouse.down = true;
				that.mouse.lastClick = e;
				
				that.emit("mousedown", e);
			};
			cb.type = "mousedown";
			return cb;
		},
		_mk_mouseup: function(){
			
			var that = this;
			var cb = function(e){
				e.x = e.x || e.pageX;
				e.y = e.y || e.pageY;
				that.mouse.down = false;
				that.mouse.lastClick = e;
				
				that.emit("mouseup", e);
			};
			cb.type = "mouseup";
			return cb;
		},
   
   
		_mk_cb: function(type){
			if(type == "mousemove"){
				return this._mk_mousemove();
			}
			
			if(type == "mouseup"){
				return this._mk_mouseup();
			}
			
			if(type == "mousedown"){
				return this._mk_mousedown();
			}
			
			
			var that = this;
			var cb = function(e){
				e = e || event;
				
				if(type.indexOf("drop") > -1 || type.indexOf("drag") > -1 ){
					e.preventDefault();
				}
				if(e.ctrlKey && e.altKey){
					console.log(e, type);
				}
				that.emit(type, e);
			};
			cb.type = type;
			return cb;
		},
		
		_mk_drop: function(e){
			e.preventDefault();
			
		}
	   
	   
	}
);

//MT/plugins/MapManager.js
MT.namespace('plugins');
/*
	adds panel with zoom and locate buttons
*/

MT.extend("core.BasicPlugin")(
	MT.plugins.MapManager = function(project){
		MT.core.BasicPlugin.call(this, "MapManager");
		this.project = project;
	},
	{
		installUI: function(ui){
			var that = this;
			
			this.panel = this.ui.createPanel("Map Manager");
			
			this.locateObject = this.panel.addButton("", "map-locate", function(){
				that.locate();
			});
			this.panel.isDockable = true;
			this.panel.removeHeader();
			this.panel.height = 25;
			ui.dockToBottom(this.panel);
			
			this.map = this.project.plugins.mapeditor;
			
			this.locateObject.width = "auto";
			
			this.zoom = new MT.ui.Dropdown({
				list: [
					200,
					150,
					100,
					90,
					80,
					70,
					60,
					50
				],
				button: {
					class: "text-size",
					width: "auto"
				},
				listStyle: {
					width: 70
				},
				value: 100
			}, ui);
			
			this.zoom.button.el.setAttribute("data-text", "%");
			
			this.zoom.on("change", function(val){
				that.setZoom(val);
			});
			this.zoom.on("show", function(val){
				that.zoom.button.el.setAttribute("data-text", "");
			});
			this.zoom.on("hide", function(val){
				that.zoom.button.el.setAttribute("data-text", "%");
			});
			
			
			
			this.panel.addButton(this.zoom.button);
			
			this.panel.addClass("map-manager-panel");
			this.panel.alignButtons();
			
			this.panel.style.marginLeft = 0;
			
			this.ui.events.on("wheel", function(e){
				if(e.target != that.map.game.canvas){
					return;
				}
				
				if(e.wheelDelta > 0){
					that.incZoom(e.offsetX, e.offsetY);
				}
				else{
					that.decZoom(e.offsetX, e.offsetY);
				}
				
				
			});
			
		},
		
		setZoom: function(val){
			
			this._setZoom(val*0.01);
		},
		_setZoom: function(val, x, y){
			var cam = this.map.game.camera;
			this.map.resize();
			
			var ox = cam.x/cam.scale.x + cam.view.halfWidth;
			var oy = cam.y/cam.scale.y + cam.view.halfHeight;
			
			
			if(x !== void(0)){
				var dx = x/cam.scale.x + cam.x/cam.scale.x;
				var dy = y/cam.scale.y + cam.y/cam.scale.y;
				
				var ndx = x/val + cam.x/val;
				var ndy = y/val + cam.y/val;
					
				var ddx = (ndx - dx)*val;
				var ddy = (ndy - dy)*val;
			}
			
			cam.scale.setTo(val, val);
			this.map.resize();

			if(x !== void(0)){
				cam.x -= ddx;
				cam.y -= ddy;
			}
			else{
				this.locateXY(ox, oy);
			}
			
			if(!this.zoom.list.isVisible){
				this.zoom.button.text = (val*100).toFixed(0);
			}
		},
		
		
		
		locate: function(){
			var cam = this.map.game.camera;
			var o = this.map.activeObject;
			if(o){
				this.locateXY(o.x + (o.width*(0.5 - o.anchor.x)), o.y + (o.height*(0.5 - o.anchor.y)));
			}
			else{
				this.map.game.camera.x = 0;
				this.map.game.camera.y = 0;
			}
		},
		
		locateXY: function(x, y){
			var cam = this.map.game.camera;
			cam.x = (x - cam.view.halfWidth)*cam.scale.x;
			cam.y = (y - cam.view.halfHeight)*cam.scale.y;
		},
		
		incZoom: function(x, y){
			var val = this.map.scale.x;
			if(val > 3){
				return;
			}
			this._setZoom(val + 0.1, x, y);
		},
		
		decZoom: function(x, y){
			var val = this.map.scale.x;
			if(val < 0.3){
				return;
			}
			this._setZoom(val - 0.1, x, y);
			
		}
	}
);
//MT/plugins/FontManager.js
MT.namespace('plugins');
MT.extend("core.BasicPlugin")(
	MT.plugins.FontManager = function(project){
		MT.core.BasicPlugin.call(this, "Analytics");
		this.project = project;
	},
	{
		loadFont: function(font, cb){
			// <link href='http://fonts.googleapis.com/css?family=Faster+One' rel='stylesheet' type='text/css'>
			var fontUrl = font.replace(/ /gi, "+");
			var link = document.createElement("link");
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("type", "text/css");
			link.onload = function(e){
				var sp = document.createElement("span");
				sp.style.fontFamily = font;
				sp.innerHTML = "ignore";
				sp.style.visibility = "hidden";
				document.body.appendChild(sp);
				window.setTimeout(function(){
					document.body.removeChild(sp);
				}, 5000);
				cb(font);
			};
			
			link.href="//fonts.googleapis.com/css?family="+fontUrl;
			
			document.head.appendChild(link);
		}
	}
);
//MT/plugins/HelpAndSupport.js
MT.namespace('plugins');
MT.extend("core.BasicPlugin")(
	MT.plugins.HelpAndSupport = function(project){
		MT.core.BasicPlugin.call(this, "HelpAndSupport");
		this.project = project;
	},
	{
		initUI: function(ui){
			var that = this;
			this.list = new MT.ui.List([
				{
					label: "About",
					className: "",
					cb: function(){
						that.openHomePage();
					}
				},
				{
					label: "Video",
					className: "",
					cb: function(){
						that.openVideo();
					}
				},
				{
					label: "on HTML5 Game Devs Forum",
					className: "",
					cb: function(){
						that.openForum();
					}
				},
				{
					label: "google fonts",
					className: "",
					cb: function(){
						that.openFonts();
					}
				},
				{
					label: "Found a bug? Report on github",
					className: "",
					cb: function(){
						that.openLink("https://github.com/TheMightyFingers/mightyeditor/issues/new");
					}
				}
			
			], ui, true);
			
			var b = this.project.panel.addButton("Help and Support", null, function(e){
				e.stopPropagation();
				that.list.show(document.body);
				
				that.list.y = b.el.offsetHeight;
				that.list.x = b.el.offsetLeft-5;
				that.list.el.style.bottom = "initial";
			});
			
			that.list.width = 300;
			
		},
		
		openForum: function(){
			//http://www.html5gamedevs.com/topic/6303-game-editor-on-phaser/
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="http://www.html5gamedevs.com/topic/6303-game-editor-on-phaser/";
		},
		
		openHomePage: function(){
			//http://mightyfingers.com/editor-features/
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="http://mightyfingers.com/editor-features/";
		},
		
		openVideo: function(){
			//https://www.youtube.com/watch?v=7dk2naCCePc
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="https://www.youtube.com/watch?v=7dk2naCCePc";
		},
		
		openFonts: function(){
			//https://www.youtube.com/watch?v=7dk2naCCePc
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="https://www.google.com/fonts";
		},
		
		openLink: function(link){
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href=link;
		}
	}
);
//MT/ui/Popup.js
MT.namespace('ui');
MT.extend("core.Emitter").extend("ui.DomElement")(
	MT.ui.Popup = function(title, content, cb){
		MT.ui.DomElement.call(this);
		this.addClass("ui-popup");
		
		this.head = document.createElement("div");
		this.head.className = "ui-popup-head";
		
		this.content = document.createElement("div");
		this.content.className = "ui-popup-content";
		
		this.el.appendChild(this.head);
		this.el.appendChild(this.content);
		
		this.head.innerHTML = title;
		this.content.innerHTML = content;
		
		this.bg = document.createElement("div");
		this.bg.className = "ui-wrapper";
		this.bg.style.zIndex = 9999;
		this.style.zIndex = 10000;
		
		this.y = window.innerHeight*0.3;
		this.style.bottom = "auto";
		
		this.show();
		
	},
	{

		showClose: function(){
			if(this.close){
				return;
			}
			this.close = document.createElement("div");
			this.close.className = "ui-popup-close";
			this.head.appendChild(this.close);
			var that = this;
			this.close.onclick = function(){
				that.hide(true);
			};
		},
		
		addButton: function(title, cb){
			
			this.buttons = this.buttons || {};
			var button = this.buttons[title] = document.createElement("div");
			button.className = "ui-popup-button";
			button.innerHTML = title;
			button.onclick = cb;
			
			this.content.appendChild(button);
			
			this.addClass("ui-has-buttons");
		},
		
		hide: function(cancel){
			if(this.bg.parentNode){
				this.bg.parentNode.removeChild(this.bg);
			}
			if(this.el.parentNode){
				this.el.parentNode.removeChild(this.el);
			}
			
			this.emit("close", cancel);
		},
		
		show: function(){
			
			this.emit("show");
			document.body.appendChild(this.bg);
			document.body.appendChild(this.el);
		}



	}
);
//MT/core/keys.js
MT.namespace('core');
MT.keys = MT.core.keys = {
	ESC: 27,
	ENTER: 13,
	UP: 38,
	LEFT: 37,
	RIGHT: 39,
	DOWN: 40,
	DELETE: 46,
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	V: 86
};
//MT/plugins/list.js
MT.namespace('plugins');
MT.plugins.list = 1;

MT.require("plugins.AssetsManager");
MT.require("plugins.ObjectsManager");
MT.require("plugins.MapEditor");
MT.require("plugins.Settings");
MT.require("plugins.Export");
MT.require("plugins.Tools");
MT.require("plugins.UndoRedo");
MT.require("plugins.DataLink");
MT.require("plugins.Analytics");

//MT/Socket.js
MT.namespace('');
MT.extend("core.Emitter")(
	MT.Socket = function(url, autoconnect){
		if(url){
			this.url = url;
		}
		else{
			this.url = "ws://"+window.location.host;
		}
		
		if(autoconnect !== false){
			this.connect();
		}
		
		this.callbacks = {};

		
		this._toSend = [];
		
		this.sendObject = {
			channel: "",
			action: "",
			data: null
		};
	},
	{
		
		delay: 0,
		
		connect: function(url){
			if(url){
				this.url = url;
			}
			var that = this;
			
			this.ws = new WebSocket(this.url);
			
			this.ws.onopen = function(e){
				that.emit("core","open");
			};
			
			this.ws.onmessage = function (event) {
				var data = JSON.parse(event.data);
				that.emit(data.channel, data.action, data.data);
			};
			
			this.ws.onerror = function(err){
				console.error(err);
			};
			
			this.ws.onclose = function(){
				console.log("WS close");
				that.emit("core","close");
				window.setTimeout(function(){
					that.connect();
				},1000);
			};
			
			return this.connection;
		},
		
		send: function(channel, action, data){
			if(this.ws.readyState == this.ws.OPEN){
				this.sendObject.channel = channel;
				this.sendObject.action = action;
				this.sendObject.data = data;
				this.ws.send(JSON.stringify(this.sendObject));
				return;
			}
			
			this._toSend.push([channel, action, data]);
			if(this.delay === 0){
				var that = this;
				this.delay = window.setTimeout(function(){
					that.sendDelayed();
				}, 100);
			}
		},
		
		sendDelayed: function(){
			if(this.ws.readyState !== this.ws.OPEN){
				var that = this;
				this.delay = window.setTimeout(function(){
					that.sendDelayed();
				}, 100);
				return;
			}
			
			for(var i=0; i<this._toSend.length; i++){
				this.send.apply(this, this._toSend[i]);
			}
			
		},
   
		emit: function(type, action, data){
			if(!this.callbacks[type]){
				console.warn("received unhandled data", type, data);
				return;
			}
			var cbs = this.callbacks[type];
			for(var i=0; i<cbs.length; i++){
				cbs[i](action, data);
			}
		}
		
	}
);

MT.Socket.TYPE = {
	open: "open",
	close: "close",
	message: "message",
	error: "error"
};
//MT/ui/Controller.js
MT.namespace('ui');
/*
 * UI Controller .. atm. only panel controller
 * TODO: 
 * 		add joinLeft / joinRight - same way as joinTop / joinBottom works
 * 		save / load layout
 * 		create alternate small panel with icons only
 * 
 */

"use strict";



MT.require("ui.Events");
MT.require("ui.Panel");

MT.LEFT = 1;
MT.RIGHT = 2;
MT.TOP = 3;
MT.BOTTOM = 4;
MT.CENTER = 5;
MT.NONE = 0;

MT.extend("core.Emitter")(
	MT.ui.Controller = function(){
		this.events = new MT.ui.Events();
		this.panels = [];
		
		this._centerPanels = [];
		
		
		this.additionalBorder = 4;
		
		this.helper = new MT.ui.DomElement();
		this.helper.addClass("ui-main-helper");
		this.helper.setAbsolute();
		
		// TODO: update this properly
		this.helper.style.zIndex = 99999;
		
		this.box = {
			x: 0,
			y: 0,
			width: window.innerWidth,
			height: window.innerHeight
		};
		
		this.snapPx = 20;
		var that = this;
		var mDown = false;
		
		var activePanel = null;
		var needResize = false;
		var toTop = null;
		
		this.oldScreenSize.width = window.innerWidth;
		this.oldScreenSize.height = window.innerHeight;
		
		//transitionend
		var transitionend = "transitionend";
		if(window.navigator.userAgent.indexOf("Chrome") > 1){
			transitionend = "webkitTransitionEnd";
		}
		var animEnd = function(aa){
			that.update();
			this.removeEventListener(transitionend, animEnd);
			window.setTimeout(function(){
				document.addEventListener(transitionend, animEnd, false);
			}, 1);
		};
		
		document.addEventListener(transitionend, animEnd, false);
		
		this.events.on(this.events.RESIZE, function(e){
			that.reloadSize(e);
		});
		
		this.events.on(this.events.MOUSEMOVE, function(e){
			if(!mDown){
				var panel = that.pickPanel(e);
				if(!panel){
					that.resetResizeCursor();
					activePanel = null;
					return;
				}
				toTop = panel;
				needResize = that.checkResize(panel, e);
				if(!e.target.panel && !needResize && !e.altKey){
					activePanel = null;
					return;
				}
				activePanel = panel;
				return;
			}
			
			if(!activePanel){
				return;
			}
			
			if(needResize){
				that.resizePanel(activePanel, e);
				return;
			}
			
			
			if(!that.tryUnjoin(activePanel, e)){
				return;
			}
			
			that.movePanel(activePanel, e);
		});
		
		this.events.on(this.events.MOUSEDOWN, function(e){
			if(e.button != 0){
				return;
			}
			mDown = true;
			
			
			if(!activePanel){
				if(toTop && !toTop.isDocked){
					that.updateZ(toTop);
				}
				return;
			}
			
			if(e.target.data && e.target.data.panel){
				activePanel = e.target.data.panel;
				activePanel.isNeedUnjoin = true;
				activePanel.show(null);
			}
			else{
				activePanel.isNeedUnjoin = false;
			}
			
			activePanel.removeClass("animated");
			that.updateZ(activePanel);
		});
		
		this.events.on(this.events.MOUSEUP, function(e){
			mDown = false;
			
			if(!activePanel){
				return;
			}
			
			activePanel.addClass("animated");
			activePanel.isNeedUnjoin = true;
			activePanel.mdown = false;
			
			
			if(activePanel.toJoinWith){
				that.joinPanels(activePanel.toJoinWith, activePanel);
				activePanel.setAll("toJoinWith", null);
				activePanel.isDockNeeded = false;
			}
			
			that.hideDockHelper(activePanel);
			
			activePanel.ox = 0;
			activePanel.oy = 0;
			
			that.sortPanels();
			that.update();
		});
	},
	{
   
		toResize: {
			TOP: false,
			RIGHT: false,
			BOTTOM: false,
			LEFT: false
		},
   
		zIndex: 1,
		
		setCenter: function(panel){
			
			if(this._centerPanels.length > 0){
				this._centerPanels.join(panel);
			}
			
			this._centerPanels.push(panel);
			
			panel.isDocked = true;
			panel.isPickable = false;
			panel.dockPosition = MT.CENTER;
			
			this.sortPanels();
			this.updateCenter();
		},
		
		createPanel: function(name, width, height){
			if(!name){
				console.error("bad name");
			}
			var p = new MT.ui.Panel(name, this);
			this.panels.push(p);
			
			p.width = width || 250;
			p.height = height || 400;
			
			p.x = this.box.x;
			p.y = this.box.y;
			
			p.show();
			
			p.name = name;
			p.style.zIndex = 1;
			
			var that = this;
			
			p.on("hide", function(){
				that.beforeHide(p);
			});
			p.on("show", function(){
				console.log("show");
				that.beforeShow(p);
			});
			p.addClass("animated");
			
			return p;
		},
		
		beforeHide: function(panel){
			panel.cache = {
				dockPosition: panel.dockPosition,
				isDocked: panel.isDocked,
				width: panel.width,
				height: panel.height
			};
			
			if(!panel.isDocked){
				panel.saveBox();
				return;
			}
			this.undock(panel);
			this.update();
		},
		beforeShow: function(panel){
			if(!panel.cache || !panel.cache.isDocked){
				return;
			}
			panel.width = panel.cache.width;
			panel.height = panel.cache.height;
			
			this.helper.dockPosition = panel.cache.dockPosition;
			this.helper.isDocked = true;
			
			if(this.helper.dockPosition == MT.TOP){
				this.showDockHelperTop(panel);
			}
			if(this.helper.dockPosition == MT.LEFT){
				this.showDockHelperLeft(panel);
			}
			if(this.helper.dockPosition == MT.RIGHT){
				this.showDockHelperRight(panel);
			}
			if(this.helper.dockPosition == MT.BOTTOM){
				this.showDockHelperBottom(panel);
			}
			
			this.dockToHelper(panel);
			this.helper.hide();
		},
		
		sortPanels: function(){
			
			this.panels.sort(function(a,b){
				return a.style.zIndex - b.style.zIndex;
			});
			
		},
		
		updateZ: function(panel){
			
			this.sortPanels();
			var p = null;
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				if(!p.isDocked){
					p.style.zIndex = i+10;
				}
				else{
					p.style.zIndex = i;
				}
			}
			this.zIndex = this.panels.length;
			if(panel){
				panel.style.zIndex = this.zIndex + 1;
			}
		},
		
		removePanel: function(panel){
			this.disableMoveable(panel);
			for(var i=0; i<this.panels.length; i++){
				if(this.panels[i] == panel){
					return this.panels.splice(i, 1);
				}
			}
			return null;
		},
		   
		checkResize: function(panel, e){
			if(!panel.isResizeable){
				this.setResizeCursor(true);
				return false;
			}
			var borderV = 0;
			var borderH = 0;
			var style = panel.getStyle();
			
			var hor = (e.x - panel.x);
			var ver = (e.y - panel.y);
			
			var needResize = false;
			
			if(hor/panel.width < 0.5){
				borderH = parseInt(style.borderLeftWidth) ;
				if(borderH && hor < borderH + this.additionalBorder){
					this.toResize.LEFT = true;
					needResize = true;
				}
			}
			else{
				borderH = parseInt(style.borderRightWidth);
				if(borderH &&  panel.width - hor < borderH  + this.additionalBorder){
					this.toResize.RIGHT = true;
					needResize = true;
				}
			}
			if(ver/panel.height < 0.5){
				borderV = parseInt(style.borderTopWidth);
				if(borderV && ver < borderV  + this.additionalBorder){
					this.toResize.TOP = true;
					needResize = true;
				}
			}
			else{
				borderV = parseInt(style.borderBottomWidth );
				if(borderV &&  panel.height - ver < borderV  + this.additionalBorder){
					this.toResize.BOTTOM = true;
					needResize = true;
				}
			}
			
			this.setResizeCursor(!needResize);
			
			
			return needResize;
		},
   
		setResizeCursor: function(reset){
			if(reset){
				this.resetResizeCursor();
				return;
			}
			
			
			var r = "";
			if(this.toResize.TOP){
				r += "n";
			}
			if(this.toResize.BOTTOM){
				r += "s";
			}
			
			if(this.toResize.RIGHT){
				r += "e";
			}
			
			if(this.toResize.LEFT){
				r += "w";
			}
			
			document.body.style.setProperty("cursor",r+"-resize","important");
		},
		
		resetResizeCursor: function(){
			this.toResize.TOP = false;
			this.toResize.RIGHT = false;
			this.toResize.BOTTOM = false;
			this.toResize.LEFT = false;
			document.body.style.removeProperty("cursor","auto","important");
		},
		
		resizePanel: function(panel, e){
			var mx = this.events.mouse.mx;
			var my = this.events.mouse.my;
			if(this.toResize.RIGHT){
				panel.width += mx;
				
				if(panel.dockPosition == MT.LEFT){
					this.resizeSidePanelsFromLeft(panel, mx);
				}
			}
			
			if(this.toResize.BOTTOM){
				panel.height += my;
				if(panel.dockPosition == MT.TOP){
					this.resizeSidePanelsFromTop(panel, my);
				}
			}
			
			if(this.toResize.LEFT){
				panel.x += mx;
				panel.width = panel.width - mx;
				
				if(panel.dockPosition == MT.RIGHT){
					this.resizeSidePanelsFromRight(panel, mx);
				}
			}
			
			if(this.toResize.TOP){
				panel.y += my;
				panel.height -= my;
				if(panel.dockPosition == MT.BOTTOM){
					this.resizeSidePanelsFromBottom(panel, my);
				}
			}
			
			if(panel.isDocked){
				this.moveDocks();
			}
		},
   
		resizeSidePanelsFromLeft: function(panel, dx){
			var p = null;
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				p.setTopBottom("justUpdated", false);
			}
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				if(p.justUpdated){
					continue;
				}
				
				if(p.dockPosition == MT.TOP || p.dockPosition == MT.BOTTOM){
					if(panel.x >= p.x){
						continue;
					}
					
					p.x = ( p.x + dx );
					p.width = (p.width - dx);
					p.setTopBottom("justUpdated", true);
				}
				
			}
		},
		
		resizeSidePanelsFromRight: function(panel, dx){
			var p = null;
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				p.setTopBottom("justUpdated", false);
			}
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				if(p.justUpdated){
					continue;
				}
				
				if(p.dockPosition == MT.TOP || p.dockPosition == MT.BOTTOM){
					if(panel.x + panel.width <= p.x + p.width){
						continue;
					}
					
					//p.x = ( p.x + dx );
					p.width = (p.width + dx);
					p.setTopBottom("justUpdated", true);
				}
				
			}
		},
   
		resizeSidePanelsFromTop: function(panel, dy){
			var p = null;
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				p.setAll("justUpdated", false);
			}
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				if(p.justUpdated){
					continue;
				}
				
				if(p.dockPosition != MT.LEFT && p.dockPosition != MT.RIGHT){
					continue;
				}
				
				if(p.top){
					continue;
				}
				if(panel.y >= p.y){
					continue;
				}
				
				p.y = ( p.y + dy );
				p.height = (p.height - dy);
				p.setAll("justUpdated", true);
				
			}
		},
   
		resizeSidePanelsFromBottom: function(panel, dy){
			var p = null;
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				p.setAll("justUpdated", false);
			}
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				if(p.justUpdated){
					continue;
				}
				if(p.dockPosition != MT.LEFT && p.dockPosition != MT.RIGHT){
					continue;
				}
				if(p.bottom){
					continue;
				}
				if(p.y + p.height >= panel.y + panel.height || p.bottom){
					continue;
				}
				
				p.setClearHeight(p.height + dy);
				p.setAll("justUpdated", true);
				
			}
		},
   
		
		
		
		
		dockToLeft: function(panel){
			if(!panel.isDockable){
				console.error("trying to dock undockable panel");
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			else{
				this.undock(panel);
			}
			
			panel.x = this.box.x;
			panel.y = this.box.y;
			panel.setAll("height", this.box.height);
			panel.dockPosition = MT.LEFT;
			panel.isDocked = true;
			this.moveDocksLeft();
		},
   
		dockToRight: function(panel){
			if(!panel.isDockable){
				console.error("trying to dock undockable panel");
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			else{
				this.undock(panel);
			}
			
			panel.x = this.box.width - panel.width;
			panel.y = this.box.y;
			panel.setAll("height", this.box.height);
			panel.dockPosition = MT.RIGHT;
			panel.isDocked = true;
			
			this.moveDocksRight();
		},

		dockToTop: function(panel){
			if(!panel.isDockable){
				console.error("trying to dock undockable panel");
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			else{
				this.undock(panel);
			}
			
			panel.y = this.box.y;
			panel.x = this.box.x;
			panel.width = this.box.width;
			this.box.y += panel.height;
			this.box.height -= panel.height;
			
			
			panel.dockPosition = MT.TOP;
			panel.isDocked = true;
			
			this.moveDocksTop();
		},
   
		dockToBottom: function(panel){
			
			if(!panel.isDockable){
				console.error("trying to dock undockable panel");
				return;
			}
			if(!panel.isDocked){
				panel.saveBox();
			}
			else{
				this.undock(panel);
			}

			panel.x = this.box.x;
			panel.y = this.box.height - panel.height;
			panel.width =  this.box.width;
			this.box.height -= panel.height;
			
			
			panel.dockPosition = MT.BOTTOM;
			panel.isDocked = true;
			
			this.moveDocksBottom();
			
		},
		
		update: function(){
			this.moveDocks();
			this.updateZ();
		},
		
		/* adjust midddle box */
		moveDocks: function(){
			this.moveDocksLeft();
			this.moveDocksRight();
			this.moveDocksTop();
			this.moveDocksBottom();
			this.updateCenter();
			return;
		},
		
		moveDocksLeft: function(panel){
			
			var tmp = this.panels.slice(0);
			
			tmp.sort(function(a, b){
				return a.x - b.x;
			});
			
			var p = null;
			this.box.x = 0;
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				p.setTopBottom("justUpdated", false);
			}
			
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				if(!p.isDocked || p.dockPosition != MT.LEFT || !p.isVisible){
					continue;
				}
				if(p.justUpdated){
					continue;
				}
				p.x = this.box.x;
				this.box.x += p.width;
				this.box.width -= p.width;
				p.setTopBottom("justUpdated", true);
			}
			
		},
   
		moveDocksRight: function(panel){
			var tmp = this.panels.slice(0);
			
			tmp.sort(function(a, b){
				return -(a.x + a.width) + (b.x + b.width);
			});
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				p.setTopBottom("justUpdated", false);
			}
			
			
			var p = null;
			this.box.width = window.innerWidth;
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				if(!p.isDocked || p.dockPosition != MT.RIGHT || !p.isVisible){
					continue;
				}
				if(p.justUpdated){
					continue;
				}
				
				p.x = this.box.width - p.width;
				this.box.width -= p.width;
				p.setTopBottom("justUpdated", true);
			}
			
		},
		
		moveDocksTop: function(panel){
			var tmp = this.panels.slice(0);
			
			tmp.sort(function(a, b){
				return a.y - b.y;
			});
			
			var p = null;
			this.box.y = 0;
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				p.setLeftRight("justUpdated", false);
			}
			
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				if(!p.isDocked || p.dockPosition != MT.TOP || !p.isVisible){
					continue;
				}
				if(p.justUpdated){
					continue;
				}
				p.y = this.box.y;
				this.box.y += p.height;
				//this.box.height -= p.height;
				p.setLeftRight("justUpdated", true);
			}
		},
		
		moveDocksBottom: function(panel){
			var tmp = this.panels.slice(0);
			
			tmp.sort(function(a, b){
				return (b.y + b.height) - (a.y + a.height);
			});
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				p.setTopBottom("justUpdated", false);
			}
			
			
			var p = null;
			this.box.height = window.innerHeight;
			
			for(var i=0; i<tmp.length; i++){
				p = tmp[i];
				if(!p.isDocked || p.dockPosition != MT.BOTTOM || !p.isVisible){
					continue;
				}
				if(p.justUpdated || p.bottom){
					continue;
				}
				
				p.y = this.box.height - p.height;
				this.box.height -= p.height;
				p.setLeftRight("justUpdated", true);
			}
		},
		
		updateCenter: function(skipEmit){
			if(this._centerPanels.length == 0){
				return
			}
			
			var centerPanel = this._centerPanels[0];
			/*
			 * Joints will automatically update rest panels
			 */
			centerPanel.x = this.box.x;
			centerPanel.y = this.box.y;
			centerPanel.width = this.box.width - this.box.x;
			centerPanel.height = this.box.height - this.box.y;
			
			if(!skipEmit){
				this.emit(this.events.RESIZE);
			}
		},
		
		
		tryUnjoin: function(panel, e){
			
			if(panel.joints.length === 1){
				return true;
			}
			
			if(!panel.isJoinable){
				return true;
			}
			if(!panel.isNeedUnjoin){
				return true;
			}
			
			var mx = this.events.mouse.mx;
			var my = this.events.mouse.my;
			
			panel.ox += mx;
			panel.oy += my;
			
			if(Math.abs(panel.ox) < this.snapPx && Math.abs(panel.oy) < this.snapPx){
				return false;
			}
			
			
			
			panel.unjoin();
			panel.isNeedUnjoin = false;
			
			
			if(!panel.isDocked){
				panel.x += panel.ox;
				panel.y += panel.oy;
				panel.ox = 0;
				panel.oy = 0;
			}
			panel.isDocked = false;
			panel.dockPosition = MT.NONE;
			panel.loadBox();
			
			return true;
		},
   
		movePanel: function(panel, e){
			if(!panel.isMoveable){
				return;
			}
			
			var hideHelper = true;
			
			var over = this.vsPanels(e, panel);
			
			if(over && over.acceptsPanels){
				var percX = (e.x - over.x) / over.width;
				var percY = (e.y - over.y) / over.height;
				this.showHelperOverPanel(over, percX, percY);
				hideHelper = false;
			}
			
			var mx = this.events.mouse.mx;
			var my = this.events.mouse.my;
			
			if(panel.isDocked){
				panel.ox += mx;
				panel.oy += my;
				
				if(Math.abs(panel.ox) < this.snapPx && Math.abs(panel.oy) < this.snapPx){
					return;
				}
				this.undock(panel);
				panel.x += panel.ox;
				panel.y += panel.oy;
				
				panel.ox = 0;
				panel.oy = 0;
			}
			
			
			panel.x += mx;
			panel.y += my;
			
			if(hideHelper){
				
				
				if( /* this.box.x + panel.width < window.innerWidth*0.5 && */ Math.abs(e.x - this.box.x) < this.snapPx && !over){
					this.showDockHelperLeft(panel);
					hideHelper = false;
				}
				else if( /*this.box.width - panel.width > window.innerWidth*0.5 && */ Math.abs(e.x - this.box.width) < this.snapPx && !over){
					this.showDockHelperRight(panel);
					hideHelper = false;
				}
				else if(Math.abs(e.y - this.box.y) < this.snapPx && !over){
					this.showDockHelperTop(panel);
					hideHelper = false;
				}
				else if(Math.abs(e.y - this.box.height) < this.snapPx && !over){
					this.showDockHelperBottom(panel);
					hideHelper = false;
				}
				else{
					panel.isDockNeeded = false;
				}
			}
			if(hideHelper){
				this.helper.hide();
			}
		},
		
		showDockHelperLeft: function(panel){
			
			this.helper.show();

			this.helper.width = panel.width;
			this.helper.height = this.box.height - this.box.y;
			this.helper.x = this.box.x;
			this.helper.y = this.box.y;
			
			this.helper.dockPosition = MT.LEFT;
			
			panel.isDockNeeded = true;
			this.helper.toJoinWith = null;
		},
		
		showDockHelperRight: function(panel){
			
			this.helper.show();

			this.helper.width = panel.width;
			this.helper.height = this.box.height - this.box.y;
			this.helper.x = this.box.width - panel.width;
			this.helper.y = this.box.y;
			
			this.helper.dockPosition = MT.RIGHT;
			
			panel.isDockNeeded = true;
			this.helper.toJoinWith = null;
		},
		
		showDockHelperTop: function(panel){
			
			this.helper.show();

			this.helper.width = this.box.width - this.box.x;
			this.helper.height = panel.height;
			this.helper.x = this.box.x;
			this.helper.y = this.box.y;
			
			this.helper.dockPosition = MT.TOP;
			
			panel.isDockNeeded = true;
			this.helper.toJoinWith = null;
		},
   
		showDockHelperBottom: function(panel){
			
			this.helper.show();

			this.helper.width = this.box.width - this.box.x;
			this.helper.height = panel.height;
			this.helper.x = this.box.x;
			this.helper.y = this.box.height - panel.height;
			
			this.helper.dockPosition = MT.BOTTOM;
			
			panel.isDockNeeded = true;
			this.helper.toJoinWith = null;
		},
   
		showHelperOverPanel: function(panel, percX, percY){
			if(!panel.acceptsPanels){
				return;
			}
			this.helper.width = panel.width;
			this.helper.x = panel.x;
			this.helper.toJoinWith = panel;
			
			if(panel.isDocked){
				if(percY < 0.3){
					this.helper.y = panel.y;
					this.helper.height = panel.height*0.5;
					this.helper.joinPosition = MT.TOP;
				}
				
				else if(percY > 0.7){
					this.helper.height = panel.height*0.5;
					this.helper.y = panel.y + panel.height - this.helper.height;
					this.helper.joinPosition = MT.BOTTOM;
				}
				else{
					this.helper.y = panel.y;
					this.helper.height = panel.height;
					this.helper.joinPosition = MT.CENTER;
				}
			}
			else{
				this.helper.y = panel.y;
				this.helper.height = panel.height;
				this.helper.joinPosition = MT.CENTER;
			}
			
			
			this.helper.show();
		},
   
		hideDockHelper: function(panel){
			if(!this.helper.isVisible){
				return;
			}
			if(this.helper.toJoinWith){
				panel.saveBox();
				
				panel.height = this.helper.height;
				var join = this.helper.toJoinWith;
				if(this.helper.joinPosition == MT.CENTER){
					this.joinPanels(join, panel);
				}
				if(this.helper.joinPosition == MT.BOTTOM){
					join.joinBottom(panel);
					if(join.isDocked){
						panel.dockPosition = join.dockPosition;
						panel.isDocked = true;
					}
				}
				if(this.helper.joinPosition == MT.TOP){
					join.joinTop(panel);
					if(join.isDocked){
						panel.dockPosition = join.dockPosition;
						panel.isDocked = true;
					}
				}
				
				
				this.helper.toJoinWith = null;
				this.helper.hide();
				return;
			}
			
			
			if(panel && panel.isDockNeeded && !panel.isDocked){
				this.dockToHelper(panel);
			}
			
			this.helper.hide();
		},
		
		joinPanels: function(target, panel){
			console.log("join");
			panel.inheritSize(target);
			target.addJoint(panel);
			target.removeClass("active");
			panel.removeClass("active");
			
			target.hide(false);
			
			if(target.isDocked){
				this.dockToHelper(panel, target);
			}
			
			panel.header.setActiveIndex(0);
			panel.header.showTabs();
			
			panel.isDockNeeded = false;
		},
		
		vsPanels: function(point, panel){
			var p = null;
			for(var i=this.panels.length-1; i>-1; i--){
				p = this.panels[i];
				if(p == panel || !p.isVisible || !p.isPickable){
					continue;
				}
				
				if(p.vsPoint(point)){
					return p;
				}
			}
			return null;
		},
		pickPanel: function(point){
			var p = null
			for(var i=this.panels.length-1; i>-1; i--){
				p = this.panels[i];
				if(!p.isVisible || !p.isPickable){
					continue;
				}
				
				if(p.vsPoint(point)){
					return p;
				}
			}
			return null;
		},
		
		dockToHelper: function(panel, helper){
			if(panel.isDocked){
				return;
			}
			
			helper = helper || this.helper;
			console.log("dock");
			if(!helper.isDocked){
				panel.saveBox();
			}
			
			panel.inheritSize(helper);
			
			panel.setAll("isDocked", true);
			panel.setAll("isDockNeeded", false);
			panel.style.zIndex = 0;
			
			
			panel.dockPosition = helper.dockPosition;
			
			this.moveDocks();
		},
   
		undock: function(panel){
			if(!panel.isDocked){
				console.log("not docked");
				return;
			}
			console.log("undock");
			
			var p = null;
			
			panel.isDocked = false;
			
			var needUpdate = true;
			if(panel.top || panel.bottom){
				needUpdate = false;
			}
			
			var top = panel.getTopMost();
			if(top == panel){
				top = panel.bottom;
			}
			
			
			panel.breakSideJoints();
			
			
			if(needUpdate){
				if(panel.dockPosition == MT.LEFT){
					for(var i=0; i<this.panels.length; i++){
						p = this.panels[i];
						if(p.dockPosition == MT.BOTTOM || p.dockPosition == MT.TOP){
							if(panel.x + panel.width == p.x){
								p.x -= panel.width;
								p.width += panel.width;
							}
						}
					}
				}
				if(panel.dockPosition == MT.RIGHT){
					for(var i=0; i<this.panels.length; i++){
						p = this.panels[i];
						if(p.dockPosition == MT.BOTTOM || p.dockPosition == MT.TOP){
							if(panel.x == p.x + p.width){
								//p.x -= panel.width;
								p.width += panel.width;
							}
						}
					}
				}
				if(panel.dockPosition == MT.TOP){
					for(var i=0; i<this.panels.length; i++){
						p = this.panels[i];
						if(p.dockPosition == MT.LEFT || p.dockPosition == MT.RIGHT){
							if(panel.y + panel.height == p.y){
								p.y -= panel.height;
								p.height += panel.height;
							}
						}
					}
				}
				if(panel.dockPosition == MT.BOTTOM){
					for(var i=0; i<this.panels.length; i++){
						p = this.panels[i];
						if(p.dockPosition == MT.LEFT || p.dockPosition == MT.RIGHT){
							if(panel.y == p.y + p.height){
								p.height += panel.height;
							}
						}
					}
				}
			}
			
			
			panel.loadBox();
			panel.dockPosition = MT.NONE;
			if(panel.x > this.events.mouse.x || panel.x + panel.width < this.events.mouse.x){
				panel.x = this.events.mouse.x - panel.width*0.3;
			}
			this.moveDocks();
		},
		
		loadLayout: function(layout){
			console.log("todo");
			var toLoad = layout || JSON.parse(localStorage.getItem("ui"));
			if(!toLoad){
				this.resetLayout();
				return;
			}
			
			
			var obj = null;
			var panel = null;
			this.box = toLoad.__box;
			this.oldScreenSize.width = toLoad.__oldScreenSize.width;
			this.oldScreenSize.height = toLoad.__oldScreenSize.height;
			
			
			for(var i in toLoad){
				obj = toLoad[i];
				panel = this.getByName(i);
				
				if(!panel){
					console.log("cannot find panel", i);
					continue;
				}
				
				
				panel.dockPosition = obj.dockPosition;
				panel.isDocked = obj.isDocked;
				
				panel.isResizeable = obj.isResizeable;
				panel.isDockable = obj.isDockable;
				panel.isJoinable = obj.isJoinable;
				panel.isPickable = obj.isPickable;
				panel.isVisible = obj.isVisible;
				panel.acceptsPanels = obj.acceptsPanels;
			
				panel.savedBox = obj.savedBox;
				
				for(var j=0; j<obj.joints; j++){
					panel.addJoint(this.getByName(obj.joints[i]));
				}
				
				var p = this.getByName(obj.bottom);
				if(p){
					panel.joinBottom(p, true);
				}
				
				p = this.getByName(obj.top);
				if(p){
					panel.joinTop(p, true);
				}
				
				
				panel.setClearX(obj.x);
				panel.setClearY(obj.y);
				panel.setClearWidth(obj.width);
				panel.setClearHeight(obj.height);
				
			}
			
			this.reloadSize();
			/*this.update();*/
		},
		
		
		resetLayout: function(){
			console.log("todo");
			var toLoad =  {"__box":{"x":40,"y":29,"width":650,"height":534},"__oldScreenSize":{"width":900,"height":560},"Project":{"x":0,"y":0,"width":900,"height":29,"dockPosition":3,"isDocked":true,"isResizeable":false,"isDockable":true,"isJoinable":false,"isPickable":true,"isVisible":true,"acceptsPanels":false,"savedBox":{"x":0,"y":0,"width":250,"height":29},"top":null,"bottom":null},"Assets":{"x":650,"y":29,"width":250,"height":193.25,"dockPosition":2,"isDocked":true,"isResizeable":true,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":true,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":250,"height":400},"top":null,"bottom":"Objects"},"Objects":{"x":650,"y":222.25,"width":250,"height":168.25,"dockPosition":2,"isDocked":true,"isResizeable":true,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":true,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":250,"height":400},"top":"Assets","bottom":"Settings"},"Map editor":{"x":40,"y":29,"width":610,"height":505,"dockPosition":5,"isDocked":true,"isResizeable":false,"isDockable":false,"isJoinable":false,"isPickable":false,"isVisible":true,"acceptsPanels":false,"savedBox":{"x":0,"y":0,"width":0,"height":0},"top":null,"bottom":null},"toolbox":{"x":0,"y":29,"width":40,"height":531,"dockPosition":1,"isDocked":true,"isResizeable":false,"isDockable":true,"isJoinable":false,"isPickable":true,"isVisible":true,"acceptsPanels":false,"savedBox":{"x":0,"y":0,"width":40,"height":400},"top":null,"bottom":null},"Settings":{"x":650,"y":390.5,"width":250,"height":169.5,"dockPosition":2,"isDocked":true,"isResizeable":true,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":true,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":250,"height":400},"top":"Objects","bottom":null},"Map Manager":{"x":40,"y":534,"width":610,"height":26,"dockPosition":4,"isDocked":true,"isResizeable":true,"isDockable":true,"isJoinable":true,"isPickable":true,"isVisible":true,"acceptsPanels":true,"savedBox":{"x":0,"y":0,"width":250,"height":26},"top":null,"bottom":null},"Text":{"x":40,"y":29,"width":610,"height":30,"dockPosition":0,"isDocked":false,"isResizeable":false,"isDockable":false,"isJoinable":false,"isPickable":true,"isVisible":false,"acceptsPanels":false,"savedBox":{"x":0,"y":0,"width":0,"height":0},"top":null,"bottom":null}};
			this.loadLayout(toLoad);
			this.saveLayout();
		},
		
		saveLayout: function(){
		
			var toSave = {
				__box: this.box,
				__oldScreenSize: this.oldScreenSize
			};
			var p = null;
			
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				toSave[p.name] = {
					x: p.x,
					y: p.y,
					width: p.width,
					height: p.height,
					dockPosition: p.dockPosition,
					
					isDocked: p.isDocked,
					isResizeable: p.isResizeable,
					isDockable: p.isDockable,
					isJoinable: p.isJoinable,
					isPickable: p.isPickable,
					isVisible: p.isVisible,
					acceptsPanels: p.acceptsPanels,
					savedBox: p.savedBox,
					
					
					joints: p.getJointNames(),
					top: (p.top ? p.top.name : null),
					bottom: (p.bottom ? p.bottom.name : null)
				};
			}
			
			var str = JSON.stringify(toSave);
			localStorage.setItem("ui", str);
			console.log("toLoad = ", str);
			
		},
		
		oldScreenSize: {
			width: 0,
			height: 0
		},
		
		reloadSize: function(){
			var dx = window.innerWidth - this.oldScreenSize.width;
			var dy = window.innerHeight - this.oldScreenSize.height;
			
			this.oldScreenSize.width = window.innerWidth;
			this.oldScreenSize.height = window.innerHeight;
			
			this.box.width += dx;
			this.box.height += dy;
			
			var p = null;
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				p.setTopBottom("justUpdated", false);
			}
			
			for(var i=0; i<this.panels.length; i++){
				p = this.panels[i];
				if(p.justUpdated){
					continue;
				}
				
				
				
				if(p.dockPosition == MT.LEFT || p.dockPosition == MT.RIGHT){
					if(p.bottom){
						continue;
					}
					p.height += dy;
				}
				if(p.dockPosition == MT.BOTTOM){
					p.y += dy;
				}
				
				if(p.dockPosition == MT.TOP || p.dockPosition == MT.BOTTOM){
					p.width += dx;
				}
				
				if(p.dockPosition == MT.RIGHT){
					p.x += dx;
				}
				p.setAll("justUpdated", true);
				p.setTopBottom("justUpdated", true);
				
			}
			
			this.moveDocks();
		},
		getByName: function(name){
			for(var i=0; i<this.panels.length; i++){
				if(this.panels[i].name == name){
					return this.panels[i];
				}
			}
			
			return null;
		}
	}
);

//MT/core/Project.js
MT.namespace('core');
MT.require("plugins.list");
MT.require("core.keys");
MT.require("ui.Popup");

MT.require("plugins.HelpAndSupport");
MT.require("plugins.FontManager");
MT.require("plugins.MapManager");

MT.extend("core.BasicPlugin")(
	MT.core.Project = function(ui, socket){
		MT.core.BasicPlugin.call(this, "Project");
		
		window.pp = this;
		
		this.plugins = {};
		
		this.pluginsEnabled = [
			"AssetsManager",
			"ObjectsManager",
			"MapEditor",
			"Tools",
			"Settings",
			"Export",
			
			"UndoRedo",
			"DataLink",
			"Analytics",
			"HelpAndSupport",
			"FontManager",
			"MapManager"
		];
		
		for(var id=0, i=""; id<this.pluginsEnabled.length; id++){
			i = this.pluginsEnabled[id];
			this.plugins[i.toLowerCase()] = new MT.plugins[i](this);
		}
		
		
		
		
		this.am = this.plugins.assetsmanager;
		this.om = this.plugins.objectsmanager;
		this.map = this.plugins.mapeditor;
		this.settings = this.plugins.settings;
		
		this.initUI(ui);
		this.initSocket(socket);
		
	},
	{
		a_maintenance: function(data){
			var seconds = data.seconds;
			var content = "System will go down for maintenance in ";
			var desc = "<p>All your current work in progress has been saved.</p><p>Please wait. Editor will reload automatically.</p>";
			
			if(data.type == "new"){
				content = "System is being maintained. Will be back in ";
				desc = "<p>Please wait. Editor will reload automatically.</p>";
			}
			
			
			var pop = new MT.ui.Popup("Maintenance", content + '<span style="color: red">' + seconds +"</span> seconds." + desc);
			
			var int = window.setInterval(function(){
				seconds--;
				if(seconds < 0){
					window.clearInterval(int);
					return;
				}
				pop.content.innerHTML = content + '<span style="color: red">' + seconds +"</span> seconds." + desc;
			}, 1000);
			
			
		},
		
		a_selectProject: function(id){
			this.id = id;
			window.location.hash = id;
			this.path = "data/projects/"+id;
			
			this.initPlugins();
		},
		
		newProject: function(){
			this.send("newProject");
		},
		
		loadProject: function(pid){
			this.send("loadProject", pid);
		},
		
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.createPanel("Project");
			this.panel.height = 29;
			this.panel.removeHeader();
			this.panel.isDockable = true;
			this.panel.addClass("top");
			
			ui.dockToTop(this.panel);
			
			this.panel.addButton(null, "logo",  function(e){
				console.log("clicked", e);
			});
			
			
			var that = this;
			this.list = new MT.ui.List([
				{
					label: "New",
					className: "",
					cb: function(){
						window.location = window.location.toString().split("#")[0];
					}
				},
				{
					label: "Clone",
					className: "",
					cb: function(){
						window.location = window.location.toString()+"-copy";
						window.location.reload();
					}
				}
			], ui, true);
			
			var b = this.button = this.panel.addButton("Project", null, function(e){
				e.stopPropagation();
				that.showList();
			});
			
			
			
		},
		
		showList: function(){
			this.list.width = 150;
			this.list.y = this.button.el.offsetHeight;
			this.list.x = this.button.el.offsetLeft-5;
			this.list.el.style.bottom = "initial";
			this.list.show(document.body);
		},
		
		initPlugins: function(){
			
			for(var i in this.plugins){
				this.plugins[i].initUI(this.ui);
			}
			
			
			for(var i in this.plugins){
				if(this.plugins[i].installUI){
					this.plugins[i].installUI(this.ui);
				}
			}
			
			for(var i in this.plugins){
				if(this.plugins[i].initSocket){
					this.plugins[i].initSocket(this.socket);
				}
			}
			
			//this.ui.update();
			this.ui.loadLayout();
		},
		
		initSocket: function(socket){
			MT.core.BasicPlugin.initSocket.call(this, socket);
			
			var pid = window.location.hash.substring(1);
			if(pid != ""){
				this.loadProject(pid);
			}
			else{
				this.newProject();
			}
		}
	}
);
var MT = createClass("MT");

MT.require("core.Project");
MT.require("ui.Controller");
MT.require("Socket");

MT.onReady(main);

function main(){
	var socket = new MT.Socket();
	var hasClosed = false;
	
	socket.on("core", function(type){
		if(type == "open"){
			if(hasClosed){
				window.location.reload();
				return;
			}
			new MT.core.Project(new MT.ui.Controller(), socket);
		}
		if(type == "close"){
			document.body.innerHTML = "";
			hasClosed = true;
		}
	});
}