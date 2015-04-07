"use strict";
MT.extend("core.Emitter")(
	MT.Socket = function(url, autoconnect){
		this.binary = false;
		if(url){
			this.url = url;
		}
		else{
			this.url = "ws://"+window.location.host+"/ws/";
		}
		
		if(autoconnect !== false){
			this.connect();
		}
		
		this.callbacks = {};
		this._toSend = [];
		
		this.sendObject = {
			channel: "",
			action: "",
			data: null,
			__cb: null
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
			this.ws.binaryType = "arraybuffer";
			
			this.ws.onopen = function(e){
				that.emit("core","open");
				that.startHeartbeat();
			};
			
			this.ws.onmessage = function (event) {
				var str;
				if( that.binary){
					str = UTF8ArrToStr(event.data);
				}
				else{
					str = event.data;
				}
				var data = JSON.parse(str);
				if(data.action === "___"){
					MT.Socket.__callbacks[data.__cb](data.data);
					delete MT.Socket.__callbacks[data.__cb];
					return;
				}
				that.emit(data.channel, data.action, data.data);
			};
			
			this.ws.onerror = function(err){
				
				console.error(err);
			};
			
			this.ws.onclose = function(){
				that.emit("core","close");
				window.setTimeout(function(){
					that.connect();
				},1000);
			};
			
			return;
		},
		lastBeat: 0,
		heartBeatInterval: 25,
		startHeartbeat: function(){
			var diff = Date.now() - this.lastBeat;
			if(diff > this.heartBeatInterval * 1000){
				this.send("HeartBeat");
			}
			
			var that = this;
			window.setTimeout(function(){
				that.startHeartbeat();
			}, (this.heartBeatInterval - diff)*1000);
		},
		send: function(channel, action, data, cb){
			if(this.ws.readyState == this.ws.OPEN){
				this.lastBeat = Date.now();
				this.sendObject.channel = channel;
				this.sendObject.action = action;
				this.sendObject.data = data;
				this.sendObject.__cb = void(0);
				
				if(cb){
					this.sendObject.__cb = MT.Socket.genCallback(cb);
				}
				
				var str = JSON.stringify(this.sendObject);
				if(this.binary){
					this.ws.send(strToUTF8Arr(str));
				}
				else{
					this.ws.send(str);
				}
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
   
		emit: function(type, action, data){
			if(!this.callbacks[type]){
				console.warn("received unhandled data", type, data);
				return;
			}
			var cbs = this.callbacks[type];
			for(var i=0; i<cbs.length; i++){
				cbs[i](action, data);
			}
		},
		//static
		genCallback: function(cb){
			var self = MT.Socket;
			self.nextCB++;
			self.__callbacks[self.nextCB] = cb;
			return self.nextCB;
		}
	}
);

MT.Socket.TYPE = {
	open: "open",
	close: "close",
	message: "message",
	error: "error"
};

MT.Socket.__callbacks = {};
MT.Socket.nextCB = 0;


/* UTF-8 array to DOMString and vice versa */

function UTF8ArrToStr (buff) {
	return String.fromCharCode.apply(null, new Uint8Array(buff));
}

function strToUTF8Arr (sDOMStr) {

	var aBytes, nChr, nStrLen = sDOMStr.length, nArrLen = 0;

	/* mapping... */

	for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
		nChr = sDOMStr.charCodeAt(nMapIdx);
		nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
	}

	aBytes = new Uint8Array(nArrLen);

	/* transcription... */

	for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
		nChr = sDOMStr.charCodeAt(nChrIdx);
		if (nChr < 128) {
		/* one byte */
		aBytes[nIdx++] = nChr;
		} else if (nChr < 0x800) {
		/* two bytes */
		aBytes[nIdx++] = 192 + (nChr >>> 6);
		aBytes[nIdx++] = 128 + (nChr & 63);
		} else if (nChr < 0x10000) {
		/* three bytes */
		aBytes[nIdx++] = 224 + (nChr >>> 12);
		aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
		aBytes[nIdx++] = 128 + (nChr & 63);
		} else if (nChr < 0x200000) {
		/* four bytes */
		aBytes[nIdx++] = 240 + (nChr >>> 18);
		aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
		aBytes[nIdx++] = 128 + (nChr & 63);
		} else if (nChr < 0x4000000) {
		/* five bytes */
		aBytes[nIdx++] = 248 + (nChr >>> 24);
		aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
		aBytes[nIdx++] = 128 + (nChr & 63);
		} else /* if (nChr <= 0x7fffffff) */ {
		/* six bytes */
		aBytes[nIdx++] = 252 + (nChr >>> 30);
		aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
		aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
		aBytes[nIdx++] = 128 + (nChr & 63);
		}
	}

	return aBytes;

}

