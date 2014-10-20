(function(window){
	"use strict";
	window.MT = createClass("MT");
	var hostInInterest = "tools.mightyfingers.com:8080";
	if(window.release){
		hostInInterest = "mightyeditor.mightyfingers.com";
	}
	
	if(window && window.location){
		// -copy etc
		if(window.location.hash.indexOf("-") > 0){
			load();
			return;
		}
		
		// check if we need to redirect
		if(window.location.host == hostInInterest){
			if(window.location.hash == "" || window.location.hash.substring(1, 2) == "u"){
				var cb =  function(obj){
					var parsed = JSON.parse(obj);
					if(parsed.continent_code == "NA"){
						window.location.host = "us."+window.location.host;
					}
					else{
						load();
					}
				};
				MT.loader.get("/geoip", cb);
			}
			else{
				load();
			}
		}
		else if(window.location.hash.substring(1,2) == "p" && window.location.host.substring(0, 3) == "us."){
			window.location.host = window.location.host.substring(3);
		}
		else{
			load();
		}
	}
	var img;
	function main(){
		var socket = new MT.Socket();
		var hasClosed = false;
		var loaded = false;
		
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
	
	function load(){
		MT.require("core.Project");
		MT.require("ui.Controller");
		MT.require("Socket");

		MT.onReady(main);
		
		var loaded = false;
		// hack for minimiser
		if(typeof document !== "undefined"){
			img = new Image();
			img.onload = function(){
				if(!loaded){
					document.body.appendChild(img);
				}
			};
			img.src = "img/icons/loadingbar.gif";
			img.className = "loadingImage";
		}
	};
	
})(window);
