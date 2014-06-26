MT.extend("core.BasicPlugin")(
	MT.plugins.Analytics = function(project){
		MT.core.BasicPlugin.call(this, "Analytics");
		this.project = project;
	},
	{
		installUI: function(ui){
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
			ga('create', 'UA-23132569-11');
			ga('send', 'pageview');
			
			var lastUpdate = Date.now();
			var that = this;
			this.project.plugins.tools.on("select", function(tool){
				lastUpdate = Date.now();
				ga('send', 'event', 'tool-selected', tool);
			});
			
			this.project.plugins.assetsmanager.on("added", function(image){
				lastUpdate = Date.now();
				ga('send', 'event', 'image-added', image);
			});
			
			this.project.plugins.objectsmanager.on("added", function(obj){
				lastUpdate = Date.now();
				ga('send', 'event', 'object-added', obj);
			});
			
			this.project.plugins.objectsmanager.on("changed", function(obj){
				lastUpdate = Date.now();
				ga('send', 'event', 'object-changed', obj);
			});
			
			this.project.plugins.objectsmanager.on("beforeSync", function(){
				lastUpdate = Date.now();
				ga('send', 'event', 'working-with-map', "sync");
			});
			
			var minute = 1000*60;
			window.setInterval(function(){
				if(lastUpdate < Date.now() - minute){
					ga('send', 'event', 'idle', that.project.id);
				}
			}, minute);
		}
	}
);