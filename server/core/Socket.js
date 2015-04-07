function UTF8ArrToStr (aBytes) {

  var sView = "";

  for (var nPart, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
    nPart = aBytes[nIdx];
    sView += String.fromCharCode(
      nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */
        /* (nPart - 252 << 30) may be not so safe in ECMAScript! So...: */
        (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */
        (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */
        (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */
        (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */
        (nPart - 192 << 6) + aBytes[++nIdx] - 128
      : /* nPart < 127 ? */ /* one byte */
        nPart
    );
  }

  return sView;

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
MT.core.sockets = [];
MT(
	MT.core.Socket = function(socket){
		MT.core.sockets.push(this);
		
		this.binary = false;
		
		this.socket = socket;
		
		this.sendObject = {
			channel: "",
			action: "",
			data: null,
			__cb: null
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
			var data, cb;
			var that = this;
			// nasty ppl
			try{
				if(this.binary){
					data = JSON.parse(UTF8ArrToStr(msg));
				}
				else{
					data = JSON.parse(msg);
				}
			}
			// not json? someone wants to chat with server :P
			catch(e){
				try{
					MT.log("Hacking:", that.socket.upgradeReq.connection.remoteAddress);
					that.send("Project","message", msg + "@" + that.socket.upgradeReq.connection.remoteAddress);
				}
				catch(e){}
				return;
			}
			if(data.channel == "HeartBeat"){
				return;
			}
			
			if(data.__cb){
				cb = this.__mkcb(data.channel, data.__cb);
			}
			this.emit(data.channel, data.action, data.data, cb);
		},
		__mkcb: function(channel, cb){
			var that = this;
			return function(data){
				that.send(channel, "___", data, cb); 
			};
		},
		send: function(channel, action, data, cb){
			if(this.socket.readyState != this.socket.OPEN){
				MT.log("socket not ready", this.socket.readyState);
				return;
			}
			this.sendObject.channel = channel;
			this.sendObject.action = action;
			this.sendObject.data = data;
			this.sendObject.__cb = cb;
			
			var str = JSON.stringify(this.sendObject);
			
			if(this.binary){
				this.socket.send(strToUTF8Arr(str));
			}
			else{
				this.socket.send(str);
			}
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
		off: function(channel, cb){
			if(this.channels[channel] === void(0)){
				return;
			}
			var chns = this.channels[channel];
			for(var i=0; i<chns.length; i++){
				if(chns[i] == cb){
					chns[i] = chns[chns.length -1];
					chns.length = chns.length - 1;
					return;
				}
			}
		},
		emit: function(channel, action, data, cb){
			if(!this.channels[channel]){
				MT.error("Socket::Unknown channel", channel,":",data);
				return;
			}
			var chns = this.channels[channel];
			for(var i=0; i<chns.length; i++){
				chns[i](action, data, cb);
			}
			
		}
	}
);
