console.log("Hello World!");

var MT = createClass("MT", "js");
MT.require("Core");
MT.require("Socket");
MT.require("ui.UIController");
MT.require("core.Project");

MT.onReady(main);


function main(){
	var socket = new MT.Socket();
	socket.on("core", function(type){
		if(type == "open"){
			new MT.core.Project(new MT.ui.UIController(), socket);
		}
		if(type == "close"){
			document.body.innerHTML = "";
		}
	});
}