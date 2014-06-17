var MT = createClass("MT");

MT.require("core.Project");
MT.require("ui.Controller");
MT.require("Socket");

MT.onReady(main);

function main(){
	var socket = new MT.Socket();
	var hasClosed = false;
	
	socket.on("core", function(type){
		if(type == "open"){
			if(hasClosed){
				window.location.reload();
				return;
			}
			new MT.core.Project(new MT.ui.Controller(), socket);
		}
		if(type == "close"){
			document.body.innerHTML = "";
			hasClosed = true;
		}
	});
}