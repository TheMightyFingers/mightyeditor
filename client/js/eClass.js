/*
 * usage: createClass(scope, name, path);
 */

(function(scope){
	"use strict";
	
	//check if we are running under nodejs
	var isNodejs = (typeof global !== "undefined" && global == scope);
	
	var buffer = [];
	
	var Accumulator = function(){
		this.cbs = [];
	};
	Accumulator.prototype = {
		release: function(data){
			if(!this.cbs.length){
				return;
			}
			while(this.cbs.length){
				this.cbs.shift()(data);
			}
		},
		push: function(cb){
			this.cbs.push(cb);
		},
		get length(){
			return this.cbs.length;
		}
	};
	
	var Loader;
	
	if(isNodejs){
		
		var fs = require("fs");
		var path = require("path");
		
		Loader = function(className, accumulator){
			this.loading = 0;
			this.acc = new Accumulator();
		};
		
		Loader.prototype = {
			getScript: function(script, cb){
				
				require(path.resolve(script));
				if(cb){
					cb();
				}
				this.onReady();
			},
			onReady: function(cb){
				this.acc.push(cb);
			}
		};
	}
	else{
		var isDomReady = false;
		
		window.addEventListener('DOMContentLoaded', function(){
			isDomReady = true;
		}, false);
		
		Loader = function(className, accumulator) {
			this.loadings = 0;
			this.acc = new Accumulator();
			this.cache = {};
			this._cache = {};
			this.className = className;
			this.accumulator = accumulator;
		};
		
		Loader.prototype = {
			onReady: function(cb){
				if(this.loadings === 0){
					if(isDomReady){
						cb();
					}
					else{
						window.addEventListener('DOMContentLoaded', function(){
							cb();
						}, false);
					}
				}
				else{
					this.acc.push(cb);
				}
			},
			
			_onload: function(script){
				this.onScriptsLoaded();
			},
			
			getScript: function(url, cb){
				if(this.cache[url] && this.cache[url].status === 2){
					this.loadings -= this.cache[url].cbs.length;
					if(typeof cb === "function"){
						cb();
					}
					this.cache[url].cbs.release();
					this._onload(this);
					return;
				}
				
				if(this.cache[url]){
					if(typeof cb === "function"){
						this.loadings++;
						this.cache[url].cbs.push(cb);
					}
					return;
				}
				
				this.cache[url] = {
					status: 1,
					cbs: new Accumulator()
				};
				
				if(typeof cb === "function"){
					this.loadings++;
					this.cache[url].cbs.push(cb);
				}
				
				this.loadings++;
				var script = window.script = document.createElement("script");
				script.setAttribute("data-origin", this.className);
				script.setAttribute("async", "async");
				var that = this;
				script.onload = function(){
					that.loadings -= that.cache[url].cbs.length + 1;
					
					that.cache[url].cbs.release();
					that.cache[url].status++;
					that._onload(this);
				};
				
				script.onreadystatechange = function(a,b,c){
					console.log("script",a,b,c,this);
				};
				
				
				script.onerror = function(){
					console.error("FATAL ERROR - onReady won't be called", script.src);
				};
				
				script.src = url;
				document.head.appendChild(script);
			},
			serialize: function(obj, prefix) {
				var str = [];
				for(var p in obj) {
					if (obj.hasOwnProperty(p)) {
					var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
					str.push(typeof v == "object" ?
						this.serialize(v, k) :
						encodeURIComponent(k) + "=" + encodeURIComponent(v));
					}
				}
				return str.join("&");
			},
			
			getCached: function(url, cb){
				var that = this;
				if(this._cache[url] && this._cache[url].status === 2){
					this.loadings -= this._cache[url].cbs.length;
					this._cache[url].cbs.push(cb);
					window.setTimeout(function(){
						that._cache[url].cbs.release(that._cache[url].data);
					}, 0)
					return;
				}
				
				if(this._cache[url]){
					if(typeof cb === "function"){
						this._cache[url].cbs.push(cb);
					}
					return;
				}
				
				this._cache[url] = {
					status: 1,
					cbs: new Accumulator(),
					data: null
				};
				
				this._cache[url].cbs.push(cb);
				var that = this;
				this.get(url, function(data){
					that._cache[url].cbs.release(data);
					that._cache[url].status++;
					that._cache[url].data = data;
				});
			},
 
			get: function(url, cb){
				var req = new XMLHttpRequest();
				req.onreadystatechange = function() {
					if (req.readyState !== 4){
						return;
					}
					cb(req.response, req);
				};
				req.open("GET", url, true);
				req.send(null);
			},
			post: function(url, data, cb){
				var req = new XMLHttpRequest();
				req.onreadystatechange = function() {
					if (req.readyState !== 4){
						return;
					}
					cb(req.response, req);
				};
				req.open("POST", url, true);
				req.send(JSON.stringify(data));
			},
			onScriptsLoaded: function(){
				if(this.loadings == 0){
					var that = this;
					if(isDomReady){
						window.setTimeout(function(){
							that.accumulator.release();
							that.acc.release();
						},0);
					}
					else{
						window.addEventListener('DOMContentLoaded', function(){
							that.accumulator.release();
							that.acc.release();
						}, false);
					}
				}
			}
		};
	}

	scope.createClass = function(className, classScope, basePath){
		
		if(classScope == void(0)){
			classScope = scope;
		}
		
		if(basePath == void(0)){
			basePath = className;
		}
		
		if(classScope[className]){
			
			console.warn("Not redefined");
			return classScope[className];
		}
		
		
		var final = function(){
			console.log("final class");
		};
		
		var resolvedBasePath = (basePath === void(0) ? "src" : basePath);
		
		var accumulator = new Accumulator();
		
		var define = function(name){
			if(scope[name]){
				console.warn("overwiting", name);
			}
			scope[name] = this;
			return this;
		};
		
		var resolve = function(str, scope){
			var namespaces = str.split(".");
			var ns = scope;
			
			namespaces.pop();
			
			for(var i=0; i<namespaces.length; i++){
				ns = ns[namespaces[i]];
			}
			
			return ns;
		}
		
		var require = function(include, path, cb){
			if(isNodejs){
				requireGo(include, path, cb);
				return;
			}
			Class.loader.loadings++;
			setTimeout(function(){
				Class.loader.loadings--;
				requireGo(include, path, function(){
					if(cb){cb();}
					Class.loader.onScriptsLoaded();
				});
			}, 0);
		};
		
		var requireGo = function(include, path, cb){
			var namespaces = include.split(".");
			var baseinc = namespaces .pop();
			var ns = Class;
			var nsinc = "";
			path = path || "";
			
			
			for(var i=0; i<namespaces.length; i++){
				ns[namespaces[i]] = ns[namespaces[i]] || {};
				ns = ns[namespaces[i]];
			}
			
			if(!ns[baseinc]){
				nsinc = namespaces.length > 0 ? namespaces.join("/")+"/" : "";
				path = path + Class.basePath + "/" + nsinc + baseinc + ".js";
				
				Class.loader.getScript(path, cb, include);
				return;
			}
			
			if(cb){
				cb();
			}
		};
		
		var xx = function(fn, parentClass){
			if(parentClass.extend == final){
				console.log("Extending final class!!!");
			}
			
			var proto = fn.prototype;
			
			var desc = {};
			for(var key in parentClass.prototype){
				var pd = Object.getOwnPropertyDescriptor(parentClass.prototype, key)
				desc[key] = pd;
			}
			
			
			fn.prototype = Object.create(parentClass.prototype, desc);
			
			for(var key in parentClass.prototype){
				pd = Object.getOwnPropertyDescriptor(parentClass.prototype, key);
				if(pd == void(0)){
					fn[key] = parentClass.prototype[key];
					continue;
				}
				if(pd.value !== void(0) ){
					fn[key] = pd.value
					continue;
				}
				
			}
			
			for(var key in proto){
				var pd = null;
				pd = Object.getOwnPropertyDescriptor(proto, key);
				if(!pd){
					fn.prototype[key] = proto[key];
					continue;
				}
				
				if(pd.value !== void(0) ){
					fn.prototype[key] = pd.value;
					continue;
				}
				
				if(pd.set || pd.get){
					var pdp = Object.getOwnPropertyDescriptor(parentClass.prototype, key);
					var pdset = pd.set;
					
					if(pdset === void(0)){
						pdset = pdp ? pdp.set : void(0);
					}
					
					var pdget = pd.get;
					if(pdget === void(0)){
						pdget = pdp ? pdp.get : void(0);
					}
					
					
					Object.defineProperty(fn.prototype, key, {
						set: pdset,
						get: pdget,
						enumerable: true
					});
				}
			}
			fn.__extended = true;
		};
		
		var extend = function(fn){
			var scope = Class;
			return function(parent){
				
				if(typeof parent == 'function'){
					xx(fn, parent);
					return fn;
				}
				var onrequire =  function(){
					var parentClass;
					var cScope = resolve(parent, scope);
					parentClass = cScope[parent.split(".").pop()];
					
					if(!parentClass || !parentClass.__extended ){
						//console.error("failed to resolve", parent);
						accumulator.push(onrequire);
						return;
					}
					
					xx(fn, parentClass);
				};
				require(parent, null, onrequire);
				return fn;
			};
		};
		
		var addBindings = function(fn){
			fn.extend = extend(fn);
			fn.final = Class.final;
		};
		
		var removeBindings = function(fn){
			delete fn.extend;
		};
		
		var Class = function(fn, proto){
			
			if(proto){
				var pd;
				for(var key in proto){
					pd = Object.getOwnPropertyDescriptor(proto, key);
					if(typeof(pd.value) === "function"){
						fn[key] = proto[key];
						continue;
					}
				}
				fn.prototype = proto;
			}
			addBindings(fn);
			
			fn.__extended = false;
			if(!buffer.length){
				fn.__extended = true;
			}
			while(buffer.length){
				fn.extend(buffer.shift());
			}
			
			return fn;
		};
		
		Class.basePath = resolvedBasePath;
		Class.emptyFn = function(){};
		
		Class.scope = classScope;
		Class.scopeName = "";
		
		Class.require = function(include, path, cb){
			require(include, path, cb);
			return this;
		};
		Class.include = function(include, path, cb){
			require(include, path, cb);
			return this;
		};
		Class.requireFile = function(include, cb){
			Class.loader.getScript(include, cb);
			return this;
		};
		
		Class.requireFiles = function(includes, cb){
			for(var i=0; i<includes.length - 1; i++){
				Class.loader.getScript(includes[i]);
			}
			Class.loader.getScript(includes[include.length -1], cb);
			return this;
		};
		
		Class.requireFilesSync = function(includes, cb){
			var out = function(){
				var inc = includes.shift();
				console.log("getting", inc);
				if(includes.length > 0){
					Class.loader.getScript(inc, out);
				}
				else{
					Class.loader.getScript(inc, cb);
				}
			};
			out();
			return this;
		};
		
		Class.namespace = function(s){
			var namespaces = s.split(".");
			var ns = Class;
			for(var i=0; i<namespaces.length; i++) {
				ns[namespaces[i]] = ns[namespaces[i]] || {};
				ns = ns[namespaces[i]];
			}
			Class.scopeName = namespaces[i-1];
			Class.scope = ns;
		};
		Class.removeDebug = function(){
			var scripts = document.getElementsByTagName("script");
			for(var i=0; i<scripts.length; i++){
				var s = scripts[i];
				var o = s.getAttribute("data-origin");
				if(o == className){
					scripts[i].parentNode.removeChild(scripts[i]);
					i--;
				}
			}
			
			delete scope.Class;
		};
		
		Class.extend = function(parent){
			buffer.push(parent);
			return this;
		};
		
		Class.loader = new Loader(className, accumulator);
		Class.onReady = function(cb){
			Class.loader.onReady(cb);
		};
		
		Class.final = function(){
			this.extend = final;
		};
		
		Class.define = Class;
		
		classScope[className] = Class;
		return Class;
	};
})(typeof window == "undefined" ? global : window);
