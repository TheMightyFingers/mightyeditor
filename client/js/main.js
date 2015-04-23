(function(window){
	"use strict";
	window.MT = createClass("MT");
	var hostInInterest = "tools.mightyfingers.com";
	if(window.release){
		hostInInterest = "mightyeditor.mightyfingers.com";
	}

	// hack for minimiser
	if(typeof document != "undefined"){
		var loading = document.createElement("div");
		loading.className = "loading";
		window.showLoading = function(){
			document.body.className = "login";
			document.body.appendChild(loading);
		};
		window.hideLoading = function(){
			document.body.className = "";
			if(loading.parentNode){
				loading.parentNode.removeChild(loading);
			}
		};
	}
	if(!window || !window.location) {
		load();
		return;
	}
		// -copy etc
	if(window.location.hash.indexOf("-") > 0){
		load();
		return;
	}

	// check if we need to redirect
	if(window.location.host == hostInInterest){
		if(window.location.hash == "" || window.location.hash.substring(1, 2) == "u"){
			var cb = function(obj, req){
				if(req.status != 202 && req.status != 200){
					load();
					return;
				}
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
				window.hideLoading();
				new MT.core.Project(new MT.ui.Controller(), socket);
			}
			if(type == "close" && hasClosed === false){
				document.body.innerHTML = "";
				hasClosed = true;
				MT.core.Project.a_maintenance({type: "new"});
			}
		});
	}
	function load(){
		MT.require("core.Project");
		MT.require("ui.Controller");
		MT.require("Socket");
		MT.onReady(main);
		if(window.showLoading){
			window.showLoading();
		}
	};
})(window);
