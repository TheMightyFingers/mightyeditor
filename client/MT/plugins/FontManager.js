MT.extend("core.BasicPlugin")(
	MT.plugins.FontManager = function(project){
		MT.core.BasicPlugin.call(this, "Analytics");
		this.project = project;
	},
	{
		loadFont: function(font, cb){
			// <link href='http://fonts.googleapis.com/css?family=Faster+One' rel='stylesheet' type='text/css'>
			var fontUrl = font.replace(/ /gi, "+");
			var link = document.createElement("link");
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("type", "text/css");
			link.onload = function(e){
				var sp = document.createElement("span");
				sp.style.fontFamily = font;
				sp.innerHTML = "ignore moi";
				sp.style.visibility = "hidden";
				document.body.appendChild(sp);
				window.setTimeout(function(){
					document.body.removeChild(sp);
				}, 5000);
				cb(font);
			};
			
			link.href="//fonts.googleapis.com/css?family="+fontUrl;
			
			document.head.appendChild(link);
		}
	}
);