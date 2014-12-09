"use strict";
MT.keys = MT.core.keys = {
	ESC: 27,
	ENTER: 13,
	UP: 38,
	LEFT: 37,
	RIGHT: 39,
	DOWN: 40,
	DELETE: 46,
	TAB: 9,
	SPACE: 32
};
// A-Z
for(var i=65; i<91; i++){
	MT.keys[String.fromCharCode(i)] = i;
}

MT.const = {
	IMAGES: "image/*",
	DATA: "application/json|application/xml",
	AUDIO: "mp3, ogg, wav"
};