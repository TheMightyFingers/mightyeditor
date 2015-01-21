MT.extend("core.BasicPlugin")(
	MT.plugins.HelpAndSupport = function(project){
		MT.core.BasicPlugin.call(this, "HelpAndSupport");
		this.project = project;
	},
	{
		initUI: function(ui){
			var that = this;
			this.list = new MT.ui.List([
				{
					label: "About",
					className: "",
					cb: function(){
						that.openHomePage();
					}
				},
				{
					label: "Video Tutorial",
					className: "",
					cb: function(){
						that.openVideo();
					}
				},
				{
					label: "on HTML5 Game Devs Forum",
					className: "",
					cb: function(){
						that.openForum();
					}
				},
				{
					label: "google fonts",
					className: "",
					cb: function(){
						that.openFonts();
					}
				},
				{
					label: "Leshy SpriteSheet Tool",
					className: "",
					cb: function(){
						that.openLink("http://www.leshylabs.com/apps/sstool/");
					}
				},
				{
					label: "Found a bug? Report on github",
					className: "",
					cb: function(){
						that.openLink("https://github.com/TheMightyFingers/mightyeditor/issues/new");
					}
				}
			
			], ui, true);
			
			var b = this.project.panel.addButton("Help and Support", null, function(e){
				e.stopPropagation();
				that.list.show(document.body);
				
				that.list.y = b.el.offsetHeight;
				that.list.x = b.el.offsetLeft-5;
				that.list.el.style.bottom = "initial";
			});
			
			that.list.width = 300;
			
		},
		
		openForum: function(){
			//http://www.html5gamedevs.com/topic/6303-game-editor-on-phaser/
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="http://www.html5gamedevs.com/topic/6303-game-editor-on-phaser/";
		},
		
		openHomePage: function(){
			//http://mightyfingers.com/editor-features/
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="http://mightyfingers.com/editor-features/";
		},
		
		openVideo: function(){
			//https://www.youtube.com/watch?v=7dk2naCCePc
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="https://www.youtube.com/watch?v=gzGHMRx3yz0";
		},
		
		openFonts: function(){
			//https://www.youtube.com/watch?v=7dk2naCCePc
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href="https://www.google.com/fonts";
		},
		
		openLink: function(link){
			var w = window.open("about:blank","_newTab");
			w.opener=null; w.location.href=link;
		}
	}
);
