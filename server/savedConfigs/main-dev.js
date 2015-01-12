var host = "http://85.31.102.57";
this.config = {
	root: "../client",
	hostname: host,
	host: "85.31.102.57",
	port: 80,
	shutdownTimeout: 3,
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
