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
		
		this._onClose = [];
	},
	{
		addBindings: function(){
			var that = this;
			this.socket.on("message", function(msg){
				that.handleMessage(msg);
			});
			
			this.socket.on('close', function() {
				that.removeSocket();
				while(that._onClose.length){
					that._onClose.pop()();
				}
			});
		},
		
		onClose: function(cb){
			this._onClose.push(cb);
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
		},
   
		send: function(channel, action, data){
			if(this.socket.readyState != this.socket.OPEN){
				MT.log("socket not ready", this.socket.readyState);
				return;
			}
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
			for(var i=0; i<sockets.length; i++){
				if(!sockets[i].inGroup(group)){
					continue;
				}
				sockets[i].send(channel, action, data);
			}
		},
		
		sendMyGroup: function(channel, action, data){
			var sockets = MT.core.sockets;
			for(var i=0; i<sockets.length; i++){
				for(var j=0; j<this.groups.length; j++){
					if(!sockets[i].inGroup(this.groups[j])){
						continue;
					}
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
				MT.error("Socket::Unknown channel", channel);
				return;
			}
			var chns = this.channels[channel];
			for(var i=0; i<chns.length; i++){
				chns[i](action, data);
			}
			
		}
	}
);
