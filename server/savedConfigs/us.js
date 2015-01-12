var host = "http://us.mightyeditor.mightyfingers.com";
this.config = {
	root: "../client",
	hostname: host,
	host: "198.100.30.134",
	port: 80,
	shutdownTimeout: 30,
	index: "index.rel.html",
	prefix: "u",
	servers: {
		p: "mightyeditor.mightyfingers.com",
		u: "us.mightyeditor.mightyfingers.com"
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
