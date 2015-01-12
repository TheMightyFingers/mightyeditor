MT(
	MT.core.BasicPlugin = function(project, channel){
		this.project = project;
		this.socket = project.socket;
		this.channel = this.name = channel;

		var that = this;
		this._cb = function(action, data, cb){
			if(typeof that["a_"+action] == "function"){
				that["a_"+action](data, cb);
			}
			else{
				MT.log("unknown function", channel, action);
			}
		};
		
		this.socket.on(channel, this._cb);
	},
	{
		_cb: null,
   
		unload: function(){
			this.socket.off(this.channel, this._cb);
		},
		
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
