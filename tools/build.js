"use strict";
var path = require("path");
var fs = require("fs");

console.log(process.cwd());

require("../client/js/eClass.js");
var cc = global.createClass;


var ignore = [
	"js/phaser.js",
	"js/phaser-no-physics.js",
	"js/phaser-no-physics.min.js",
	"js/phaser.min.js",
	"js/phaserHacks.js",
	"js/cm/lib/codemirror.js"
];

var fileList = [];
var includes = [];

global.window = global;

//overwrite loder
var SourceLoader = function(name){
	this.source = "";
	this.fs = fs;
	this.cache = {};
	this.filename = name + ".min.js";
	this.loadings = 0;
	this.name = name;
};

SourceLoader.prototype = {
	getScript: function(script, cb, inc){
		console.log("get script", inc);
		if(!inc){
			console.log("Skipping:", script);
			return;
		}
		if(ignore.indexOf(script) > -1){
			console.log("ignored "+ script);
			// skip callback - as callback will be launched in release version
			//if(cb){cb();}
			return;
		}
		
		if(this.cache[script]) {
			var index = fileList.indexOf(script);
			if(index > 0){
				var p = fileList.splice(index, 1);
				fileList.unshift(p[0]);
				var inc = includes.splice(index, 1);
				includes.unshift(inc[0]);
			}
			if(cb){cb();}
			return;
		}
		var that = this;
		this.cache[script] = 1;
		this.loadings++;
		fileList.unshift(script);
		includes.unshift(inc);
		
		setTimeout(function(){
			require(path.resolve(script));
			
			if(cb){
				cb();
			}
			that.loadings--;
			
			if(that.loadings === 0){
				that.onReady();
			}
		}, 0);
		
	},
	
	get: function(src, cb){
		if(cb){cb("{}");}
	},
	
	onReady: function(cb){
		if(this.loadings !== 0){
			return;
		}
		var src = "";
		src += "window."+this.name+" = createClass('"+this.name+"')"+"\n";
		for(var i=0; i<fileList.length; i++){
			var scope = includes[i].split(".");
			scope.pop();
			scope = scope.join(".");
			console.log("including", fileList[i]);
			
			src += "//" + fileList[i] + "\n";
			src += this.name+".namespace('"+scope+"');" + "\n";
			src += fs.readFileSync(fileList[i])+"\n";
		}
		
		src += fs.readFileSync(file);
		
		fs.writeFileSync(this.name+".js", src);
		
		
		var UglifyJS = require("uglify-js");
		var result = UglifyJS.minify(this.name+".js", {outSourceMap: this.filename+".map"});
		
		
		fs.writeFile(this.filename, result.code);
		fs.writeFile(this.filename+".map", result.map);
		
	}
};
var file = process.cwd() + path.sep + process.argv[2];

var requires = [];

// create wrapper around createClass
global.createClass = function(className, classScope, basePath){
	var Class = cc(className, classScope, basePath);
	Class.loader = new SourceLoader(className);
	return Class;
};
console.log(file);
require(file);

var miscFiles = ["js/jshint", "js/cm/addon/scroll/scrollpastend", "js/eClass"];
var mapsFiles = ["jshint", "scrollpastend"];
var UglifyJS = require("uglify-js");
var result;
for(var i in miscFiles){
	console.log("minify: ", miscFiles[i]);
	result = UglifyJS.minify(miscFiles[i]+".js");
	fs.writeFile(miscFiles[i]+".min.js", result.code);
	fs.writeFile(miscFiles[i]+".min.js.map", result.map);
}

// expose version to the client
fs.createReadStream("../version").pipe(fs.createWriteStream('version'));
