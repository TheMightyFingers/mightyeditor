"use strict";
MT.require("core.Logger");
MT(
	MT.http.Httpd = function(config){
		MT.log("Starting server", config);
		
		this.http = require("http");
		this.path = require("path");
		this.fs = require("fs");
		this.querystring = require('querystring');
		
		this.root = config.root.replace(/\//gi, this.path.sep);
		
		this.config = require("./config");
		
		this.mimes = this.config.mimes;
		this.cors = this.config.cors;
		
		this.cache = {};
		this.routes = [];
		this.callbacks = [];
		
		this.server = this.http.createServer();
		
		this.config.index = config.index;
		
		var nRoot = this.path.normalize(this.root);
		var that = this;
		this.request = {
			parts: null
		};
		
		this.req = null;
		this.res = null;
		
		var route;
		this.server.on("request", function(req, res) {
			that.req = req;
			that.res = res;
			for(var i=0; i<that.routes.length; i++){
				route = that.routes[i];
				if(req.url.indexOf(route) === 0){
					if(that.callbacks[i](req, res, that) === false){
						return;
					}
				}
			}
			
			if(req.method != "GET"){
				that.sendAway(req, res);
				return;
			}
			
			if(req.headers.connection == "keep-alive"){
				res.setHeader("connection", "keep-alive");
			}
			
			that.request.parts = req.url.split("?");
			
			req.url = that.request.parts.shift();
			req.url = decodeURI(that.path.normalize(that.root + req.url));
			
			if(req.url.indexOf(that.root)  !== 0){
				MT.log("bad request:", req.url, that.root);
				that.notFound(req, res);
				return;
			}
			
			that.serve(req, res);
		});
		
		this.listen(config.port, config.host);
	},
	{
		addRoute: function(path, cb){
			this.routes.push(path);
			this.callbacks.push(cb);
		},
		removeRoute: function(pathOrCb){
			var search = this.routes;
			if(typeof pathOrCb === "function"){
				search = this.callbacks;
			}
			for(var i=0; i<search.length; i++){
				if(search[i] === pathOrCb){
					this.routes.splice(i, 1);
					this.callbacks.splice(i, 1);
					return true;
				}
			}
			return false;
		},
		parseUrl: function(url){
			var out = {};
			var tmp = url.split("?").pop();
			var keyVal = tmp.split("&");
			var key, val;
			for(var i=0; i<keyVal.length; i++){
				tmp = keyVal[i].split("=");
				key = tmp[0];
				val = tmp[1];
				out[key] = val;
			}
			return out;
		},
		parse: function(str){
			this.querystring.parse(str);
		},
		stringify: function(str){
			this.querystring.stringify(str);
		},
		openSocket: function(handler){
			var WebSocketServer = require("ws").Server;
			var that = this;
			
			this.wss = new WebSocketServer({server: this.server});
			this.wss.on('connection', function(ws){
				handler(ws);
			});
			
		},
		cookies: function(request) {
			var list = {};
			var rc = request.headers.cookie;

			if(rc){
				rc.split(';').forEach(function( cookie ) {
					var parts = cookie.split('=');
					list[parts.shift().trim()] = decodeURI(parts.join('='));
				});
			}

			return list;
		},
		getIp: function(req){
			if(req.headers && req.headers['x-forwarded-for']){
				return req.headers['x-forwarded-for'];
			}
			if(req.connection){
				if(req.connection.remoteAddress){
					return req.connection.remoteAddress;
				}
				if(req.connection.socket && req.connection.socket.remoteAddress){
					return req.connection.socket.removeAddress;
				}
			}
			if(req.socket && req.socket.remoteAddress){
				return req.socket.remoteAddress
			}
			return "0.0.0.0";
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
			// unix socket
			if(port == void(0)){
				port = host;
				var that = this;
				this.fs.unlink(port, function(){
					that.server.listen(port);
					that.fs.chmod(port, "0777");
				});
				return;
			}
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
			MT.log("send away: " + this.getIp(req) +" "+ req.url);
			res.writeHead(401);
			res.end('goodbye: '+"\n" + req.url);
		},
		
		notFound: function(req, res, err){
			MT.log("not found: " + this.getIp(req) +" "+ req.url);
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
		},
   
		redirect: function(location, req, res){
			res.writeHead(302, {
				'Location': location
				//add other headers here...
			});
			res.end();
		},
		
   
		get: function(url, cb){
			if(cb == void(0)){
				return;
			}
			
			var that = this;
			this.http.get(url, function(res){
				that.getBody(res, cb);
			});
		},
		
		getBody: function(res, cb){
			if(cb == void(0)){
				return;
			}
			var body = "";
			var chunks = 0;
			res.on('data', function (data) {
				// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
				if (body.length > 1e6) { 
					MT.log("FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST");
					res.connection.destroy();
				}
				body += data;
			});
			
			
			res.on('end', function(){
				MT.log("res.ended");
				cb(body, res);
			});
		},

		download: function(url, file, cb){
			var fs = this.fs;
			var ws = fs.createWriteStream(file);
			
			var request = this.http.get(url, function(response) {
				response.pipe(ws);
				ws.on('finish', function(){
					ws.close(cb);
				});
			}).on('error', function(err){
				fs.unlink(ws);
				if(cb){
					cb(err);
				}
			});
		},
   
	}
);

