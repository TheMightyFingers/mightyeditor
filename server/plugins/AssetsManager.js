MT.require("core.FS");


MT.extend("core.SocketManager")(
	MT.plugins.AssetsManager = function(socket){
		MT.core.SocketManager.call(this, socket, "assets");
		this.fs = MT.core.FS;
		
	},
	{
		sendFiles: function(path){
			var that = this;
			MT.core.FS.readdir(path, true, function(data){
				console.log("data", data);
				that.send("receiveFileList", {files: data});
				that.send("receiveFileList", {files: data});
			});
		},
		
		getAssets: function(data){
			this.send("receiveFileList",{
				files: [
					{
						name: "test1.png",
					},
					{
						name: "test2.png",
					},
					{
						name: "testFolder",
						contents: [
							{
								name: "subFile1.png"
							}
						]
					/*	contents: [
							{
								name: "subFile1.png"
							},
							{
								name: "subFolder",
								contents: [
									{
										name: "custom image1.png"
									},
									{
										name: "custom image3.png"
									},
									{
										name: "customxxx folder",
										contents: []
									}
								]
							}
						]
					},
					{
						name: "anotherFolder",
						contents: [
							{
								name: "subFile1.png"
							},
							{
								name: "subFolder",
								contents: [
									{
										name: "custom image1.png"
									},
									{
										name: "custom image3.png"
									},
									{
										name: "customxxx folder",
										contents: []
									}
								]
							}
						]*/
					}
				]
			});
		},
		
		newImage: function(data){
			console.log("SAVING IMAGE:");
			this.fs.writeFile("test.png", new Buffer(data.replace(/^data:image\/\w+;base64,/, ""), "base64"), function(){
				console.log("DONE");
			});
			
			return;
			var fs = require("fs");
			fs.writeFile("test.png", new Buffer(data.replace(/^data:image\/\w+;base64,/, ""), "base64"), function(){
				console.log("saved");
			});
			
			
		}
	}
);
