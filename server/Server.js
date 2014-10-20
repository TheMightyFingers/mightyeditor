"use strict";
require("../client/js/eClass.js");
createClass("MT", global, require("path").resolve(""));

MT.require("http.Httpd");
MT.require("core.Socket");
MT.require("core.Project");
MT.require("core.Logger");

var exec = require('child_process').exec;

var config = (process.env.RELEASE ? require("./config.js").config : require("./config-dev.js").config);

var maintenance = false;

var hostInIterest = "tools.mightyfingers.com:8080";
//var hostInIterest = "mightyeditor.mightyfingers.com";

var geoip, Country, country;
try{
	// ipv4 address lookup
	geoip = require('geoip');
	Country = geoip.Country;
	country = new Country('lib/GeoIP.dat');
}
catch(e){
	// ignore ip check
	console.warn("geoip checks will be skipped");
}

var server = new MT.http.Httpd(config, function(req, res, httpd){
	
	if(req.url.substring(0, 8) == "/export/"){
		
		var projectId = req.url.substring(8);
		var projectPath = config.projectsPath+"/"+projectId;
		var src = process.cwd() + "/" + projectPath;
		console.log("exporting", projectId);
		
		var targetFile = projectId+".zip";
		
		var t = process.cwd() + "/../client/" + targetFile;
		var cmd = "zip -9 -r " + t + " ./";

		exec(cmd, { cwd: src }, function(err){
			if(err){
				httpd.notFound(req, res);
			}
			httpd.redirect("/"+targetFile, req, res);
		});
		return false;
	}
	
	if(!geoip || req.headers.host != hostInIterest || req.url != "/geoip"){
		return true;
	}
	var address = httpd.server.address().address;
	
	address = "198.100.30.134";
	
	// Synchronous method(the recommended way):
	var country_obj = country.lookupSync(address);
	
	res.writeHead(200);
	res.end(JSON.stringify(country_obj));
	return false;
});

server.openSocket(function(socket){
	var s = new MT.core.Socket(socket);
	
	if(maintenance){
		s.send("Project", "maintenance", {
			seconds: tm + 1,
			type: "new"
		});
		return;
	}
	
	new MT.core.Project(s, config);
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
	MT.debug(error, "SERVER SHUTDOWN");
	gracefulExit();
}


process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit); 
process.on('uncaughtException', errorShutdown);


