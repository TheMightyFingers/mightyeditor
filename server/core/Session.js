MT(
	MT.core.Session = function(auth){
		this.id = "";
		this.created = 0;
		this.data = null;
		this.auth = auth;
	},
	{
		create: function(){
			this.id = this.genId();
			this.created = Date.now();
		},
		genId: function(){
			var crypto = require("crypto");
			var md5 = crypto.createHash("md5");
			return md5.update(Date.now()+"").digest('hex');
		},
		update: function(sessionId, created){
			this.created = created || Date.now();
			this.id = sessionId;
		},
		expire: function(){
			this.created = 0;
			this.id = 0;
		},
		isValid: function(sessionId){
			return true;
		},
		save: function(cb){
			
		},
		restore: function(cb){
			if(cb){
				cb();
			}
		},
		prolong: function(){
			
		},
	}
);
