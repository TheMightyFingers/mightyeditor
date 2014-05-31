"use strict";
require("../client/js/eClass.js");
createClass("MT", global, require("path").resolve(""));

MT.require("http.Httpd");
MT.require("core.Socket");
MT.require("core.Project");

var config = require("./config.js").config;

var maintenance = false;
var server = new MT.http.Httpd("../client", config.port, config.host);
var handler = server.openSocket(function(socket){
	var s = new MT.core.Socket(socket);
	
	if(maintenance){
		s.send("Project", "maintenance", {
			seconds: tm + 1,
			type: "new"
		});
		return;
	}
	var project = new MT.core.Project(s);
});


var tm = config.shutdownTimeout;
function gracefulExit(){
	maintenance = true;
	MT.core.Socket.sendAll("Project", "maintenance", {
		seconds: tm + 1,
		type: "old"
	});
	setTimeout(function(){
		process.exit();
	}, tm*1000);
	setInterval(function(){
		tm--;
	},1000);
}

function errorShutdown(error){
	console.error("SERVER SHUTDOWN", error);
	gracefulExit();
}

process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit); 

process.on('uncaughtException', errorShutdown);



