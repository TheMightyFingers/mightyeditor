MT.core.GeoIP = function(server, hostInIterest){
	var geoip, Country, country;
	try{
		// ipv4 address lookup
		geoip = require('geoip');
		Country = geoip.Country;
		country = new Country('lib/GeoIP.dat');
		
		server.addRoute("/geoip", function(req, res, httpd){
			if(req.headers.host != hostInIterest){
				return true;
			}
			var address = req.connection.remoteAddress;
			
			// address = "198.100.30.134";
			// Synchronous method(the recommended way):
			var country_obj = country.lookupSync(address);
			country_obj.ip = address;
			res.writeHead(200);
			res.end(JSON.stringify(country_obj));
			return false;
		});
	}
	catch(e){
		console.warn("geoip checks will be skipped", e);
	}
};