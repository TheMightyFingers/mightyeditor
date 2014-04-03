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
	new MT.core.Project(ui, socket);
	socket.on("open", function(){
		console.log("connection opened");
		
	});
}