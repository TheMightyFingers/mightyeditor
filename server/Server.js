"use strict";
require("../client/js/eClass.js");
createClass("MT", global, process.cwd());

MT.require("http.Httpd");
MT.require("core.Socket");
MT.require("core.Project");
MT.require("core.Logger");
MT.require("core.ShutdownManager");
MT.require("core.GeoIP");
MT.require("core.Exporter");
MT.require("plugins.Auth");
MT.require("plugins.Postman");


var config = (process.env.RELEASE ? require("./config.js").config : require("./config-dev.js").config);

var sm = new MT.core.ShutdownManager(config),
	server = new MT.http.Httpd(config),
	auth = MT.plugins.Auth;

auth.init(server, config);

MT.core.Project.started = Date.now();

server.openSocket(function(socket){
	var s = new MT.core.Socket(socket);
	if(sm.maintenance){
		s.send("Project", "maintenance", {
			seconds: sm.tm + 1,
			type: "new"
		});
		return;
	}
	
	new MT.core.Project(s, config, server);
});


// some good stuff
new MT.core.Exporter(server, auth);
new MT.core.GeoIP(server, "mightyeditor.mightyfingers.com");

