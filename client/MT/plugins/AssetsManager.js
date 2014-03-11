MT.require("ui.TreeView");

MT.extend("core.BasicPlugin")(
	MT.plugins.AssetsManager = function(){
		this.name = "assets";
		
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
			MT.core.BasicPlugin.initSocket.call(this, socket);
		},
		
		receiveFileList: function(list){
			this.buildAssetsTree(list);
			
		},
		
		handleSocket: function(list){
			
			
		},
   
		buildAssetsTree: function(list){
			
			if(!this.tv){
				var tv = window.tv = this.tv = new MT.ui.TreeView(list.files);
			}
			else{
				this.tv.update(list.files);
			}
		
			this.tv.tree.show(this.panel.content.el);
			
			this.tv.sortable(this.ui.events);
			
		}
	}
);
