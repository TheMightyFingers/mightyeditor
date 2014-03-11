"use strict";
require("../client/js/eClass.js");
createClass("MT", global, require("path").resolve(""));

MT.require("http.Httpd");
MT.require("project.Socket");

MT.require("Project");


var server = new MT.http.Httpd("../client", 8080);
var handler = server.openSocket(function(socket){
	
	var s = new MT.project.Socket(socket);
	var project = new MT.Project(s);
});






