MT(
	MT.core.BasicPlugin = function(channel){
		this.channel = channel;
	},
	{
		
		initUI: function(ui){
			this.ui = ui;
		},
		
		initSocket: function(socket){
			if(this.channel == void(0)){
				return;
			}
			
			if(this.socket == socket){
				return;
			}
			
			this.dealys = {};
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
		send: function(action, data, cb){
			this.socket.send(this.channel, action, data, cb);
		},
		sendDelayed: function(action, data, timeout){
			var that = this;
			if(this.dealys[action]){
				window.clearTimeout(this.dealys[action]);
			}
			
			this.dealys[action] = window.setTimeout(function(){
				that.send(action, data);
				that.dealys[action] = 0;
			}, timeout);
			
		}
	}
);
