MT(
	MT.core.SocketManager = function(socket, channel){
		this.socket = socket;
		this.channel = channel;
		
		var that = this;
		this.socket.on(channel, function(action, data){
			if(typeof that[action] == "function"){
				that[action](data);
			}
		});
	},
	{
		send: function(action, data){
			this.socket.send(this.chanel, action, data);
		},
		
		sendAll: function(action, data){
			this.socket.sendAll(this.chanel, action, data);
		},
		
		sendGroup: function(group, action, data){
			this.socket.sendGroup(this.channel, group, action, data);
		}
	}
);
