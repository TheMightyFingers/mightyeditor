"use strict";
require("../client/js/eClass.js");
createClass("MT", global, require("path").resolve(""));

MT.require("http.Httpd");
MT.require("project.Socket");

MT.require("plugins.AssetsManager");


var server = new MT.http.Httpd("../client", 8080);
var handler = server.openSocket(function(socket){
	
	var s = new MT.project.Socket(socket);
	new MT.plugins.AssetsManager(s);
});






