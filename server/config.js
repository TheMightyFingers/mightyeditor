var host = "http://tools.mightyfingers.com:8080";
this.config = {
	root: "../client",
	hostname: host,
	host: "123.123.123.123",
	port: 8080,
	shutdownTimeout: 3,
	index: "index.rel.html",
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
