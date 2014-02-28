MT(
	MT.http.Socket = function(url){
		this.url = url;
	},
	{
		connect: function(url){
			if(url){
				this.url = url;
			}
			
			this.connection = new WebSocket(url)
			return this.connection;
		}
	}
);