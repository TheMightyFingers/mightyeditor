MT(
	MT.core.ShutdownManager = function(config){
		this.tm = config.shutdownTimeout;
		var that = this;
		function gracefulExit(){
			that.maintenance = true;
			MT.core.Socket.sendAll("Project", "maintenance", {
				seconds: that.tm + 1,
				type: "old"
			});
			
			setTimeout(function(){
				process.exit();
			}, that.tm*1000);
			
			setInterval(function(){
				that.tm--;
			}, 1000);
		}

		function errorShutdown(error){
			MT.debug(error, "SERVER SHUTDOWN");
			gracefulExit();
		}

		process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit); 
		process.on('uncaughtException', errorShutdown);
	},
	{
		maintenance: false
	}
);
