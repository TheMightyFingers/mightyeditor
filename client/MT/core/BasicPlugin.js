MT(
	MT.core.BasicPlugin = function(name){
		this.name = name;
		
		
		
		
	},
	{
		
		initUI: function(ui){
			this.ui = ui;
		},
		
		initSocket: function(socket){
			var that = this;
			this.socket = socket;
			
			this.socket.on(this.name, function(action, data){
				if(that[action]){
					that[action](data);
				}
			});
		},
   
		send: function(action, data){
			this.socket.send(this.name, action, data);
		}
	}
);
