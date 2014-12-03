"use strict";
window["%namespace%"].state.load = {
	preload: function(){
		// we have preloaded assets required for Loading group objects in the Boot state
		var loading = mt.create("Loading");
		var loadingGroup = loading;
		
		// get preload sprite
		var preload = loading.mt.children.preload;
		
		// check if we have preload object at all
		if(preload){
			// set it as preload sprite
			this.load.setPreloadSprite(preload);
			
			// update group transform - so we can get correct bounds
			loadingGroup.updateTransform();
			
			// get bounds
			var bounds = loadingGroup.getBounds();
			
			// move it to the center of the screen
			loadingGroup.x = this.game.camera.screenView.centerX - (bounds.width) * 0.5  - bounds.x;
			loadingGroup.y = this.game.camera.screenView.centerY - (bounds.height) - bounds.y;
		}
		
		// load all assets
		mt.preload();
	},
	
	create: function(){
		// loading has finished - proceed to demo state
		this.game.state.start("demo");
	}
};