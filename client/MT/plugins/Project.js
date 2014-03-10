MT(
	MT.plugins.Project = function(){
		
		
	},
	{
		initUI: function(){
			
			
		},
		
		initSocket: function(){
			var that = this;
			this.socket = socket;
			socket.on("assets", function(list){
				that.handleSocket(list);
			});
			
			socket.send("assets","get");
		}
	}
);