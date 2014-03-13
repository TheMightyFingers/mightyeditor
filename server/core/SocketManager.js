MT(
	MT.core.SocketManager = function(socket, channel){
		this.socket = socket;
		this.channel = channel;
		
		console.log("channel:",channel);
		
		var that = this;
		this.socket.on(channel, function(action, data){
			if(typeof that["a_"+action] == "function"){
				that["a_"+action](data);
			}
			else{
				console.log("unknown function", channel, action);
			}
		});
	},
	{
		send: function(action, data){
			this.socket.send(this.channel, action, data);
		},
		
		sendAll: function(action, data){
			this.socket.sendAll(this.channel, action, data);
		},
		
		sendGroup: function(group, action, data){
			this.socket.sendGroup(group, this.channel, action, data);
		},
   
		sendMyGroup: function(action, data){
			this.socket.sendMyGroup(this.channel, action, data);
		}
	}
);
