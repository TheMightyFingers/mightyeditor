MT.require("ui.TreeView");

MT.extend("core.BasicPlugin")(
	MT.plugins.AssetsManager = function(){
		
		
	},
	{
		initUI: function(ui){
			this.ui = ui;
			this.panel = ui.addPanel("Assets");
			var that = this;
			
			//this.buildAssetsTree();
			ui.events.on("drop", function(e){
				
				console.log(e.dataTransfer.files);
				var im = new Image();
				var s = e.dataTransfer.items[0].getAsFile();
				var fr = URL.createObjectURL(s);
				
				im.src = fr;
				
				im.onload = function(){
					
					var c = document.createElement("canvas");
					var ctx = c.getContext("2d");
					ctx.drawImage(im, 0,0 );
						
					var data = c.toDataURL("image/png");
					console.log(data);
					
					that.socket.send("assets", "newImage", data);
				};
				
				
			});
		},
		
		initSocket: function(socket){
			var that = this;
			this.socket = socket;
			socket.on("assets", function(list){
				that.handleSocket(list);
			});
			
			socket.send("assets","get");
			
		},
		
		handleSocket: function(list){
			this.buildAssetsTree(list);
			
		},
   
		buildAssetsTree: function(list){
			
			
			
			
			var tv = window.tv = new MT.ui.TreeView(list.files);
			tv.tree.show(this.panel.content.el);
			
			tv.sortable(this.ui.events);
			
			console.log(tv.getData());
			
		}
	}
);
