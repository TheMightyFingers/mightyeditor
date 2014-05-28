(function(global){

global.mt = {
	
	assets: {},
	objects: {},
 
	assetsPath: "assets",
	game: null,
 
	//to be filled
	data: null,
	
	preload: function(game){
		this.game = game;
		this.game.load.crossOrigin = "Anonymous";
		
		this._loadAssets(this.data.assets.contents, this.assets, "");
	},
 
	create: function(){
		this._loadObjects(this.data.objects.contents, this.objects, "");
	},
	
	_loadAssets: function(data, container, path){
		path = path !== "" ? path+"." : path;
		
		var asset = null;
		
		for(var i = 0, l = data.length; i<l; i++){
			asset = data[i];
			if(asset.contents && asset.contents.length){
				if(container[asset.name] === void(0)){
					container[asset.name] = {};
				}
				this._loadAssets(asset.contents, container[asset.name], path + asset.name);
			}
			else{
				this._addAsset(asset, container, path);
			}
		}
	},
 
	_addAsset: function(asset, container, path){
		
		if(asset.width != asset.frameWidth || asset.height != asset.frameHeight){
			game.load.spritesheet(asset.path, this.assetsPath + asset.path, asset.frameWidth, asset.frameHeight, asset.frameMax, asset.margin, asset.spacing);
		}
		else{
			game.load.image(asset.path, this.assetsPath + asset.path);
		}
		
		Object.defineProperty(container, asset.name, {
			get : function(){ 
				return game.cache.getImage(path+asset.name);
			}
		});
		
	},
	
	_loadObjects: function(data, container, path, group){
		group = group || this.game.world;
		path = path !== "" ? "." + path : path;
		
		var object = null;
		var tmpGroup = null;
		
		for(var i = data.length - 1; i > -1; i--){
			object = data[i];
			if(object.contents && object.contents.length){
				tmpGroup = this._addGroup(object, container);
				
				if(!container[object.name]){
					container[object.name] = {
						get self(){
							return tmpGroup
						}
					};
				}
				
				
				group.add(tmpGroup);
				
				this._loadObjects(object.contents, container[object.name], path + object.name, tmpGroup );
			}
			else{
				this._addObject(object, container, group);
			}
		}
		
	},
	
	_addGroup: function(object){
		var group = this.game.add.group();

		group.x = object.x;
		group.y = object.y;
		
		if(object.angle){
			group.angle = object.angle;
		}
		
		return group;
	},
   
	_addObject: function(object, container, group){
		
		var sp = null;
		
		sp = group.create(object.x, object.y, object.assetPath);
		
		if(object.angle){
			sp.angle = object.angle;
		}
		
		sp.anchor.x = object.anchorX;
		sp.anchor.y = object.anchorY;
		
		
		sp.x = object.x;
		sp.y = object.y;
		
		Object.defineProperty(container, object.name, {
			get : function(){ 
				return sp;
			}
		});
		
		
		return sp;
	},
	
	
};

})(typeof window == "undefined" ? global : window);