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
		}
	}
);