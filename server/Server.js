"use strict";
require("../client/js/eClass.js");
createClass("MT", global, require("path").resolve(""));

MT.require("http.Httpd");
MT.require("core.Socket");
MT.require("core.Project");

var config = require("./config.js").config;

var server = new MT.http.Httpd("../client", 80, "123.123.22.22");
var handler = server.openSocket(function(socket){
	
	var s = new MT.core.Socket(socket);
	var project = new MT.core.Project(s);
});






