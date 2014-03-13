MT(
	MT.plugins.MapEditor = function(project){
		this.selectedObject = null;
		var that = this;
		this.project = project;
		
		
		
		
		MT.requireFile("js/phaser.min.js", function(){
			that.createMap();
			
		});
	},
	{
		
		createMap: function(){
			console.log("map loaded");
			var that = this;
			
			this.game = window.p = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: false, create: function(){
				console.log("canvas ready");
				var c = window.p.canvas;
				c.parentNode.removeChild(c);
				that.project.ui.center.appendChild(c);
				that.resize();
				that.project.ui.onResize(function(){
					that.resize();
				});
			}});
		},
		
		addObject: function(obj){
			if(obj.contents){
				console.log("group selected");
				return;
			}
			this.game.load.image(obj.name, this.project.path + obj.fullPath);
			
		},
   
   
		resize: function(){
			
			this.game.width = this.project.ui.center.offsetWidth;
			this.game.height = this.project.ui.center.offsetHeight;
			this.game.stage.bounds.width = this.game.width;
			this.game.stage.bounds.height = this.game.height;
			
			if (this.game.renderType === Phaser.WEBGL){
				this.game.renderer.resize(this.game.width, this.game.height);
			}
		},
   
   
		initUI: function(ui){
			this.panel = ui.addPanel("Map Objects");
		},
   
		move: function(){
			
			
		}
		
		
		
		
		
		
		
		
		
	}
);   
