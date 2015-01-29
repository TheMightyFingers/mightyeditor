var host = "http://tools.mightyfingers.com:8080";
this.config = {
	root: "../client",
	hostname: host,
	host: "0.0.0.0",
	port: 8080,
	shutdownTimeout: 0.5,
	index: "index.html",
	prefix: "p",
	servers: {
		p: "tools.mightyfingers.com"
	},
	projectsPath: "../client/data/projects",
	dbName: ".db.json",
	email: {
		from: "info@mightyfingers.com"
	},
	auth: {
		// one week
		sessionLifeTime: 1000*60*60*24*7,
		hashRounds: 12
	}
};
