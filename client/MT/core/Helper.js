MT(
	MT.core.Helper = function(){

	},
	{
		isImage: function(path){
			var ext = this.getExt(path);
			return (ext == "png" || ext == "jpg" || ext == "gif" || ext == "jpeg");
		},
		
		isSource: function(path){
			return !this.isImage(path);
		},
   
		htmlEntities: function(str) {
			return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		},
   
		isAudio: function(path){
			var ext = this.getExt(path);
			return (ext == "mp3" || ext == "wav" || ext == "ogg" || ext == "aac");
		},
   
		getExt: function(path){
			return path.split(".").pop().toLowerCase();
		},

		strToBuff: function(str) {
			var buf = new ArrayBuffer(str.length * 2);
			var bufView = new Uint16Array(buf);
			for (var i = 0; i < str.length; i++) {
				bufView[i] = str.charCodeAt(i);
			}
			return buf;
		}
	}
);