var MT = createClass("MT");

MT.require("core.Project");
MT.require("ui.Controller");
MT.require("Socket");

MT.onReady(main);

function main(){
	var socket = new MT.Socket();
	var hasClosed = false;
	var loaded = false;
	var img = new Image();
	img.onload = function(){
		if(!loaded){
			document.body.appendChild(img);
		}
	};
	img.src = "img/icons/loadingbar.gif";
	img.className = "loadingImage";
	
	
	socket.on("core", function(type){
		if(type == "open"){
			if(hasClosed){
				window.location.reload();
				return;
			}
			if(img.parentNode){
				img.parentNode.removeChild(img);
			}
			
			new MT.core.Project(new MT.ui.Controller(), socket);
		}
		if(type == "close"){
			document.body.innerHTML = "";
			hasClosed = true;
		}
	});
}