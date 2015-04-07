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
			
			var address = httpd.getIp(req);
			res.writeHead(200);
			try{
				country.lookup(address, function(err, country_obj){
					if(!country_obj){
						country_obj = {};
					}
					country_obj.ip = address;
					res.end(JSON.stringify(country_obj));
				});

			}
			catch(e){
				MT.log("GEO IP lookup failed", address);
				res.end("{}");
			}
			return false;
		});
	}
	catch(e){
		console.warn("geoip checks will be skipped", e);
	}
};