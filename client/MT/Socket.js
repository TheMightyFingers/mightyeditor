MT.extend("core.Emitter")(
	MT.Socket = function(url, autoconnect){
		if(url){
			this.url = url;
		}
		else{
			this.url = "ws://"+window.location.host;
		}
		
		if(autoconnect !== false){
			this.connect();
		}
		
		this.callbacks = {};
		
		this._onopen = [];
		this._onclose = [];
		this._onerror = [];
		this._onmessage = [];
		
		this._toSend = [];
		
		this.sendObject = {
			channel: "",
			action: "",
			data: null
		};
	},
	{
		
		delay: 0,
		
		connect: function(url){
			if(url){
				this.url = url;
			}
			var that = this;
			
			this.ws = new WebSocket(this.url);
			
			
			this.ws.onopen = function(e){
				console.log("WS connected",e);
			};
			
			this.ws.onmessage = function (event) {
				var data = JSON.parse(event.data);
				that.emit(data.channel, data.action, data.data);
			};
			
			this.ws.onerror = function(err){
				console.error(err);
			};
			
			this.ws.onclose = function(){
				console.log("WS close");
				that.onClose();
			};
			
			return this.connection;
		},
		
		send: function(channel, action, data){
			if(this.ws.readyState == this.ws.OPEN){
				this.sendObject.channel = channel;
				this.sendObject.action = action;
				this.sendObject.data = data;
				this.ws.send(JSON.stringify(this.sendObject));
				return;
			}
			
			this._toSend.push([channel, action, data]);
			if(this.delay === 0){
				var that = this;
				this.delay = window.setTimeout(function(){
					that.sendDelayed();
				}, 100);
			}
		},
		sendDelayed: function(){
			if(this.ws.readyState !== this.ws.OPEN){
				var that = this;
				this.delay = window.setTimeout(function(){
					that.sendDelayed();
				}, 100);
				return;
			}
			
			for(var i=0; i<this._toSend.length; i++){
				this.send.apply(this, this._toSend[i]);
			}
			
		},
		
		onOpen: function(){
			for(var i=0; i<this._onopen.length; i++){
				this._onopen[i]();
			}
		},
   
		onMessage: function(){
			for(var i=0; i<this._onmessage.length; i++){
				this._onmessage[i]();
			}
		},
		
		onError: function(){
			for(var i=0; i<this._onerror.length; i++){
				this._onerror[i]();
			}
		},
		
		onClose: function(){
			for(var i=0; i<this._onclose.length; i++){
				this._onclose[i]();
			}
		},
   
		emit: function(type, action, data){
			if(!this.callbacks[type]){
				console.warn("received unhandled data", type, data);
				return;
			}
			var cbs = this.callbacks[type];
			for(var i=0; i<cbs.length; i++){
				cbs[i](action, data);
			}
			
		}
		
	}
);

MT.Socket.TYPE = {
	open: "open",
	close: "close",
	message: "message",
	error: "error"
};