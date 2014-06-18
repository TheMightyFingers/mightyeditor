"use strict";

MT(
	MT.http.Httpd = function(config){
		this.root = config.root;
		console.log(config);
		
		this.http = require("http");
		this.path = require("path");
		this.fs = require("fs");
		
		this.config = require("./config");
		
		this.mimes = this.config.mimes;
		this.cors = this.config.cors;
		
		
		
		this.cache = {};
		
		this.server = this.http.createServer();
		
		
		this.config.index = config.index;
		
		
		var nRoot = this.path.normalize(this.root);
		var that = this;
		this.request = {
			parts: null
		};
		this.server.on("request", function(req, res) {
			
			if(req.method != "GET"){
				that.sendAway(req, res);
				return;
			}
			
			if(req.headers.connection == "keep-alive"){
				res.setHeader("connection","keep-alive");
			}
			
			that.request.parts = req.url.split("?");
			
			req.url = that.request.parts.shift();
			req.url = decodeURI(that.path.normalize(that.root + req.url));
			
			
			
			if(req.url.indexOf(that.root)  !== 0){
				console.log("bad request:", req.url, that.root);
				that.notFound(req, res);
				return;
			}
			
			that.serve(req, res);
		});
		
		this.listen(config.port, config.host);
	},
	{
		openSocket: function(handler){
			var WebSocketServer = require("ws").Server;
			var that = this;
			
			this.wss = new WebSocketServer({server: this.server});
			this.wss.on('connection', function(ws){
				handler(ws);
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
			this.setHeaders(req, res);
			
			
			this.fs.stat(req.url, function(err, stats){
				if(err){
					that.notFound(req, res, err);
					return;
				}
				
				if(stats.isDirectory()){
					req.url += that.config.index;
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
			console.log("not found: " + req.url);
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
				res.setHeader("xxx", "xxx");

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
		},
   
		setHeaders: function(req, res){
			var ext = req.url.split(".").pop();
			var mime = this.mimes[ext];
			if(mime){
				res.setHeader("content-type", mime);
			}
			var cors = this.cors[ext];
			if(cors){
				res.setHeader("Access-Control-Allow-Origin", cors);
			}
		}
		
	}
);

