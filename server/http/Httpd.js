"use strict";

SF(
	SF.http.Httpd = function(root, port, host){
		this.root = root;
		
		this.http = require("http");
		this.path = require("path");
		this.fs = require("fs");
		this.mimes = require("./mimes").mimes;
		
		var that = this;
		
		this.cache = {};
		
		this.server = this.http.createServer();
		
		this.server.on("request", function(req, res) {
			
			if(req.method != "GET"){
				that.sendAway(res);
				return;
			}
			
			if(req.headers.connection == "keep-alive"){
				res.setHeader("connection","keep-alive");
			}
			req.url = that.path.normalize(that.root + req.url);
			
			
			that.serve(req, res);
		});
		
		if(port != void(0)){
			this.listen(port, host);
		}
		
		this.sockets = [];
		this.forbidden = ["server"];
		
		this.openSocket();
	},
	{
		openSocket: function(){
			var WebSocketServer = require("ws").Server;
			var that = this;
			
			this.wss = new WebSocketServer({server: this.server});
			this.wss.on('connection', function(ws){
				var int = 0;
				that.sockets.push(ws);
				
				setInterval(function(){
						ws.send(JSON.stringify({action: "Sock", data: {test: 1}}), function() { /* ignore errors */ });
				}, 1500);
				
				ws.on('close', function() {
					console.log("connection closed");
					clearInterval(int);
					that.removeSocket(ws);
				})
				console.log("connection opened, total:", that.sockets.length);
			});
			
		},
		removeSocket: function(ws){
			for(var i=0; i<this.sockets.length; i++){
				if(this.sockets[i] == ws){
					this.sockets[i] = this.sockets[this.sockets.length-1];
					this.sockets.length = this.sockets.length - 1;
					return;
				}
			}
		},
		
		listen: function(port, host){
			this.server.listen(port, host);
		},
		
		serve: function(req, res){
			var that = this;
			
			/*if(this.cache[req.url]){
				res.setHeader("content-length", this.cache[req.url].stats.size);
				res.setHeader("content-type", this.cache[req.url].mime);
				
				res.writeHead(200);
				res.end(this.cache[req.url].content);
				return;
			}*/
			
			this.fs.stat(req.url, function(err, stats){
				if(err){
					that.notFound(req, res, err);
					return;
				}
				
				if(stats.isDirectory()){
					req.url += "index.html";
					that.serve(req, res);
					return;
				}
				
				that.proceed(stats, req, res);
			});
			
		},
		
		sendAway: function(req, res){
			res.writeHead(401);
			res.end('goodbye: '+"\n" + req.url);
		},
		notFound: function(req, res, err){
			console.log("not found!: " + req.url);
			res.writeHead(404);
			res.end('not found: ' + "\n" + req.url);
		},
		
		proceed: function(stats, req, res){
			if(stats.size < 1024){
				this.sendFile(req, res, stats);
				return;
			}
			
			this.streamFile(req, res);
		},
		
		/* big files */
		streamFile: function(req, res){
			var readStream = this.fs.createReadStream(req.url);
			var mime = this.mimes[req.url.split(".").pop()];
			if(mime){
				res.setHeader("content-type", mime);
			}
			
			
			readStream.on('open', function () {
				res.writeHead(200);
				readStream.pipe(res);
				return;
			});
			
			readStream.on('error', function(err) {
				res.writeHead(404);
				res.end("ERROR");
				return;
			});
		},
		
		/*small files */
		sendFile: function(req, res, stats){
			var that = this;
			this.fs.readFile(req.url, function(err, content){
				res.setHeader("content-length", stats.size);
				var mime = that.mimes[req.url.split(".").pop()];
				if(mime){
					res.setHeader("content-type", mime);
				}
				
				
				res.writeHead(200);
				res.end(content);
				
				/*
				that.cache[req.url] = {
					stats: stats,
					content: content,
					mime: mime
				};
				*/
			});
		}
		
	}
);


var mimes = {
	
};