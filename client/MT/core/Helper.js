MT(
	MT.core.Helper = function(){

	},
	{
		isImage: function(imgPath){
			var ext = imgPath.split(".").pop();
			return (ext == "png" || ext == "jpg" || ext == "gif" || ext == "jpeg");
		},
		
		isSource: function(path){
			return !this.isImage(path);
		},
   
		htmlEntities: function(str) {
			return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		}
	}
);