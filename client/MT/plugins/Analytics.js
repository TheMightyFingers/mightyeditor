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
			if(this.project.id){
				document.title += " - " + this.project.data.title + " (" + this.project.id + ")";
			}
			
			ga('send', 'pageview');
			
			this.lastUpdate = Date.now();
			
			
			var that = this;
			this.project.plugins.tools.on(MT.OBJECT_SELECTED, function(tool){
				that.send('tool-selected', tool);
			});
			
			this.project.plugins.assetmanager.on(MT.ASSET_ADDED, function(image){
				that.send('image-added', image);
			});
			
			this.project.plugins.objectmanager.on(MT.OBJECT_ADDED, function(obj){
				that.send('object-added', obj);
			});
			
			this.project.plugins.objectmanager.on(MT.OBJECTS_SYNC, function(){
				lastUpdate = Date.now();
				that.send('working-with-map', "sync");
			});
			
			this.minute = 1000*60;
			window.setInterval(function(){
				that.send('idle', that.project.id);
			}, this.minute);
		},
		
		send: function(name, data){
			if(this.lastUpdate > Date.now() - this.minute){
				return;
			}
			
			this.lastUpdate = Date.now();
			window.ga('send', 'event', name, data);
		}
	}
);