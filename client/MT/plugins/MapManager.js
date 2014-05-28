/*
	adds panel with zoom and locate buttons
*/

MT.extend("core.BasicPlugin")(
	MT.plugins.MapManager = function(project){
		MT.core.BasicPlugin.call(this, "MapManager");
		this.project = project;
	},
	{
		installUI: function(){
			var that = this;
			
			this.panel = new MT.ui.Panel(null, this.ui.events);
			this.ui.bottom.addPanel(this.panel);
			
			this.locateObject = this.panel.addButton("", "map-locate", function(){
				that.locate();
			});
			
			
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
			
			ui.events.on("click", function(e){
				var cam = that.map.game.camera;
				console.log(e.offsetX / cam.scale.x + cam.x/cam.scale.x, e.offsetY / cam.scale.y + cam.y/cam.scale.y);
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
				
				console.log(ddx, val);
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
			
			this.zoom.button.text = (val*100).toFixed(0);
			
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