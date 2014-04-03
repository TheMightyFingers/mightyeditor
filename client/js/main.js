console.log("Hello World!");

var MT = createClass("MT", "js");
MT.require("Core");
MT.require("Socket");
MT.require("ui.UIController");
MT.require("core.Project");

MT.onReady(main);


function main(){
	var socket = new MT.Socket();
	var ui = window.ui = new MT.ui.UIController();
	
	socket.on("core", function(type){
		if(type == "open"){
			console.log("connection opened");
			new MT.core.Project(ui, socket);
		}
	});
}