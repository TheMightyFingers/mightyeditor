var host = "http://localhost";
this.config = {
	root: "../client",
	hostname: host,
	host: "localhost",
	port: "8080", // undefined for socket connection
	shutdownTimeout: 0.5,
	index: "index.html",
	prefix: "p",
	servers: {
		p: "localhost"
	},
	projectsPath: "../client/data/projects",
	buildDir: "../client/data/build",
	dbName: ".db.json",
	email: {
		from: "info@mightyfingers.com",
		auth: {
			user: "info@mightyfingers.com",
			pass: "********"
		}
	},
	tools:{
		// path to fontforge - or executable if it's in the path
		fontforge: "fontforge",
		// script that makes APKs
		mobile: "mobile"
	},
	auth: {
		// one week
		sessionLifeTime: 1000*60*60*24*7,
		hashRounds: 12
	}
};