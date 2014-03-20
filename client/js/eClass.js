/*
 * usage: createClass(scope, name, path);
 * 
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
		release: function(){
			if(!this.cbs.length){
				return;
			}
			while(this.cbs.length){
				this.cbs.shift()();
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
		
		Loader = function(className, accumulator){};
		
		Loader.prototype = {
			getScript: function(script, cb){
				require(path.resolve(script));
				if(cb){
					cb();
				}
			}
		};
	}
	else{
		Loader = function(className, accumulator) {
			this.loadings = 0;
			this.acc = new Accumulator();
			this.cache = {};
			this.className = className;
			this.accumulator = accumulator;
			
			var that = this;
		};
		
		Loader.prototype = {
			onReady: function(cb){
				if(this.loadings === 0){
					cb();
				}
				else{
					this.acc.push(cb);
				}
			},
			
			_onload: function(script){
				//this.loadings--;
				console.log("loadings", this.loadings, script);
				
				this.onScriptsLoaded();
			},
			
			getScript: function(url, cb){
				
				
				if(this.cache[url] && this.cache[url].status === 2){
					this.loadings -= this.cache[url].cbs.length;
					
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
			
			get: function(url, cb){
				var req = new XMLHttpRequest();
				req.onreadystatechange = function() {
					if (req.readyState !== 4){
						return;
					}
					console.log(req);
					cb(req.response);
				};
				req.open("GET", url, true);
				req.send(null);
			},
			onScriptsLoaded: function(){
				if(this.loadings == 0){
					var that = this;
					window.setTimeout(function(){
						that.accumulator.release();
						that.acc.release();
					},0);
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
		
		var final = function(){
			console.log("final class");
		};
		
		var resolvedBasePath = (basePath === void(0) ? "src" : basePath);
		
		var accumulator = new Accumulator();
		
		var checkRequire = function(parent, scope){
			if(typeof parent == 'function'){
				return true;
			}
			var pfn = parent.split(".").pop();
			console.log(scope[pfn]);
			
			
			return !!scope[pfn];
		};
		
		var define = function(name){
			if(scope[name]){
				console.warn("overwiting", name);
			}
			scope[name] = this;
			return this;
		};
		
		var resolve = function(str, scope){
			var namespaces = str.split(".");
			var baseinc = namespaces .pop();
			var ns = scope;
			var nsinc = "";
			
			
			
			for(var i=0; i<namespaces.length; i++){
				ns = ns[namespaces[i]];
			}
			
			return ns;
		}
		
		var require = function(include, path, cb){
			
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
				
				Class.loader.getScript(path, cb);
				return false;
			}
			else{
				if(cb){
					cb();
				}
			}
			return true;
			
		};
		
		var xx = function(fn, parentClass){
			if(parentClass.extend == final){
				console.log("Extending final class!!!");
			}
			
			var proto = fn.prototype;
			fn.prototype = Object.create(parentClass.prototype);
			
			for(var key in parentClass.prototype){
				if(fn[key] === void(0)){
					fn[key] = parentClass.prototype[key];
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
					Object.defineProperty(fn.prototype, key, {
						set: pd.set || (pdp ? pdp.set : void(0)) ,
						get: pd.get || (pdp ? pdp.get : void(0))
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
			
			//accumulator.release();
			
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
		
		Class.requireFile = function(include, cb){
			Class.loader.getScript(include, cb);
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
