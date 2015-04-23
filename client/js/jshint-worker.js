importScripts("jshint.min.js");

onmessage = function(e) {
	var str = e.data[0];
	var conf = e.data[1];
	JSHINT(str, conf);
	
	postMessage([JSHINT.errors]);
}
