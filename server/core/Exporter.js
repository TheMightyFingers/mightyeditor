MT.core.Exporter = function(server, auth){
	var exec = require('child_process').exec;
	server.addRoute("/export/", function(req, res, httpd){
		var projectId = req.url.substring(8);
		
		auth.db.get("SELECT access FROM projects WHERE link = ?", function(err, row){
			
			if(err){
				MT.log("Export failed", err);
				return;
			}
			var acc = auth.getProjectAccess(row.access);
			if(!acc.allowCopy){
				return;
			}
			
			var projectPath = config.projectsPath+"/"+projectId;
			
			var src = process.cwd() + "/" + projectPath;
			var targetFile = projectId+".zip";
			var t = process.cwd() + "/../client/" + targetFile;
			var cmd = "zip -9 -r " + t + " ./";

			exec(cmd, { cwd: src }, function(err){
				if(err){
					httpd.notFound(req, res);
				}
				httpd.redirect("/"+targetFile, req, res);
			});
		});
		return false;
	});
};