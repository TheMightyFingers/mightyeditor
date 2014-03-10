MT.project.sockets = [];
MT(
	MT.project.Socket = function(socket){
		MT.project.sockets.push(this);
		
		this.socket = socket;
		
		this.sendObject = {
			channel: "",
			action: "",
			data: null
		};
		
		this.channels = {};
		this.groups = [];
		
		this.addBindings();
	},
	{
		addBindings: function(){
			var that = this;
			this.socket.on("message", function(msg){
				that.handleMessage(msg);
			});
			
			this.socket.on('close', function() {
				that.removeSocket();
			});
		},
		removeSocket: function(){
			var sockets = MT.project.sockets;
			for(var i=0; i<sockets.length; i++){
				if(sockets[i] == this){
					sockets[i] = sockets[sockets.length-1];
					sockets.length = sockets.length-1;
					return;
				}
			}
		},
		
		joinGroup: function(group){
			if(this.inGroup(group)){
				return;
			}
			this.groups.push(group);
		},
		
		leaveGroup: function(group){
			for(var i=0; i<this.groups.length; i++){
				if(this.groups[i] == group){
					this.groups[i] = this.groups[this.groups.length-1];
					this.groups.length = this.groups.length-1;
					return;
				}
			}
		},
		
		inGroup: function(group){
			for(var i=0; i<this.groups.length; i++){
				if(this.groups[i] == group){
					return true;
				}
			}
			return false;
		},
   
		handleMessage: function(msg){
			var data = JSON.parse(msg);
			this.emit(data.channel, data.action, data.data);
		},
   
		send: function(channel, action, data){
			this.sendObject.channel = channel;
			this.sendObject.action = action;
			this.sendObject.data = data;
			
			this.socket.send(JSON.stringify(this.sendObject));
		},
   
		sendAll: function(channel, action, data){
			var sockets = MT.project.sockets;
			for(var i=0; i<sockets.length; i++){
				sockets[i].send(channel, action, data);
			}
		},
		
		sendGroup: function(group, channel, action, data){
			var sockets = MT.project.sockets;
			for(var i=0; i<sockets.length; i++){
				if(sockets[i].inGroup(group)){
					continue;
				}
				sockets[i].send(channel, action, data);
			}
		},
		
		
		on: function(channel, cb){
			if(this.channels[channel] === void(0)){
				this.channels[channel] = [];
			}
			this.channels[channel].push(cb);
		},
   
		emit: function(channel, action, data){
			if(!this.channels[channel]){
				console.error("Socket::Unknown channel", channel);
				return;
			}
			var chns = this.channels[channel];
			for(var i=0; i<chns.length; i++){
				chns[i](action, data);
			}
			
		}
	}
);
