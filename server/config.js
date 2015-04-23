// ensure we are working with right server
var host = "http://localhost:8080";

this.config = {
	root: "../client",
	host: "0.0.0.0",
	port: 8080,
	shutdownTimeout: 3,
	index: "index.rel.html",
	prefix: "p",
	servers: {
		p: "tools.mightyfingers.com"
	},
	projectsPath: "../client/data/projects",
	buildDir: "../client/data/build",
	dbName: ".db.json",
	email: {
		from: "info@mightyfingers.com",
		auth: {
			user: "info@mightyfingers.com",
			pass: "********"
		},
	},
	tools:{
		// path to fontforge - or executable if it's in the path
		fontforge: "fontforge",
		mobile: "/home/kaspars/compile"
	},
	auth: {
		// one week
		sessionLifeTime: 1000*60*60*24*7,
		hashRounds: 12
	}
};