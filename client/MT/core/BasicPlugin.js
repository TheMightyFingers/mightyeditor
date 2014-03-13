MT(
	MT.core.BasicPlugin = function(channel){
		this.channel = channel;
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
		}
	}
);
