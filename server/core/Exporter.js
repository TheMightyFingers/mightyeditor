MT.core.Exporter = function(server, auth, config){
	var exec = require('child_process').exec;
	var route = "/export/";
	server.addRoute(route, function(req, res, httpd){
		var projectId = req.url.substring(route.length).split("/");
		projectId = projectId.shift();
		
		if(!projectId){
			console.log("cannot find project", projectId);
			return true;
		}
		console.log("exporting:", projectId);
		auth.db.get("SELECT P.access, U.level FROM projects AS P LEFT JOIN users AS U ON P.user_id == U.id WHERE P.link = ?", projectId, function(err, row){
			
			if(err){
				MT.log("Export failed", err);
				return;
			}
			
			if(!row){
				MT.log("Export failed - no info", err);
				httpd.notFound(req, res);
				return;
			}
			
			console.log("ACCESS:", row);
			if(row.level == 0){
				row.access = 3;
			}
			var acc = auth.getProjectAccess(row.access);
			if(!acc.allowCopy){
				MT.log("Export failed - copying not allowed", err);
				httpd.notFound(req, res);
				return;
			}
			
			var projectPath = config.projectsPath+"/"+projectId;
			
			var src = process.cwd() + "/" + projectPath;
			var targetFile = projectId+".mighty.zip";
			var t = process.cwd() + "/../client/" + targetFile;
			var cmd = "zip -9 -r " + t + " ./";

			exec(cmd, { cwd: src }, function(err){
				if(err){
					httpd.notFound(req, res);
				}
				else{
					httpd.redirect("/"+targetFile, req, res);
				}
			});
		});
		
		return false;
	});
};
