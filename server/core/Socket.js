MT.core.sockets = [];
MT(
	MT.core.Socket = function(socket){
		MT.core.sockets.push(this);
		
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
			var sockets = MT.core.sockets;
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
			console.log("joined group", group);
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
		leaveAllGroups: function(){
			this.groups.length = 0;
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
			console.log("incoming:" ,data.channel, data.action);
		},
   
		send: function(channel, action, data){
			this.sendObject.channel = channel;
			this.sendObject.action = action;
			this.sendObject.data = data;
			
			this.socket.send(JSON.stringify(this.sendObject));
		},
   
		sendAll: function(channel, action, data){
			var sockets = MT.core.sockets;
			for(var i=0; i<sockets.length; i++){
				sockets[i].send(channel, action, data);
			}
		},
		
		sendGroup: function(group, channel, action, data){
			var sockets = MT.core.sockets;
			console.log("sending to group", sockets.length, arguments);
			
			
			for(var i=0; i<sockets.length; i++){
				if(!sockets[i].inGroup(group)){
					continue;
				}
				sockets[i].send(channel, action, data);
			}
		},
		
		sendMyGroup: function(channel, action, data){
			var sockets = MT.core.sockets;
			console.log("sending to group", sockets.length, this.groups);
			
			
			for(var i=0; i<sockets.length; i++){
				for(var j=0; j<this.groups.length; j++){
					if(!sockets[i].inGroup(this.groups[j])){
						continue;
					}
					console.log("sending to group", this.groups[j]);
					sockets[i].send(channel, action, data);
					break;
					
					
				}
				
				
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
