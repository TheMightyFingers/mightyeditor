console.log("Hello World!");

var MT = createClass("MT", "js");
MT.require("Core");
MT.require("Socket");
MT.require("ui.Controller");
MT.onReady(main);


function main(){
	var socket = new MT.Socket();
	var ui = window.ui = new MT.ui.Controller();
	
	socket.on("open", function(){
		console.log("connection opened");
	});
	
	socket.onMessage(function(data){
		console.log("message:", data);
	});
	
	socket.on("Sock", function(data){
		//console.log("Sock", data);
	});
}