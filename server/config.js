this.config = {
	root: "../client",
	host: "123.123.123.123",
	port: 8080,
	shutdownTimeout: 3,
	index: "index.rel.html",
	prefix: "p",
	servers: {
		p: "mightyeditor.mightyfingers.com",
		u: "us.mightyeditor.mightyfingers.com"
	},
	projectsPath: "../client/data/projects"
};

// ensure we are working with right server
this.config.servers[this.config.prefix] = this.config.host + ":" + this.config.port;
