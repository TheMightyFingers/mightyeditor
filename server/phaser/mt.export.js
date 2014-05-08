(function(global){
var data = null;

if(global.mt && global.mt.data){
	data = global.mt.data;
}
global.mt = {
	
	assets: {},
	objects: {},
 
	assetsPath: "assets",
	game: null,
 
	data: data,
	
	preload: function(game){
		this.game = game;
		this.game.load.crossOrigin = "anonymous";
		
		this._loadAssets(this.data.assets.contents, this.assets, "");
	},
 
	create: function(){
		this._loadObjects(this.data.objects.contents, this.objects, "");
	},
	
	getAssetPath: function(asset){
		return this.assetsPath + asset.fullPath;
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
		var that = this;
		
		if(asset.width != asset.frameWidth || asset.height != asset.frameHeight){
			this.game.load.spritesheet(asset.key, this.assetsPath + asset.fullPath, asset.frameWidth, asset.frameHeight, asset.frameMax, asset.margin, asset.spacing);
		}
		else{
			this.game.load.image(asset.key, this.assetsPath + asset.fullPath);
		}
		
		
		Object.defineProperty(container, asset.name, {
			get : function(){ 
				return asset;
			},
			enumerable: true
		});
		
	},
	
	_loadObjects: function(data, container, path, group){
		group = group || this.game.world;
		path = path !== "" ? "." + path : path;
		
		for(var i = data.length - 1; i > -1; i--){
			this._add(data[i], container, path, group);
		}
		
	},
	_add: function(object, container, path, group){
		
		if(object.contents){
			var tmpGroup = this._addGroup(object, container);
			group.add(tmpGroup);
			
			if(!container[object.name]){
				container[object.name] = {
					get self(){
						return tmpGroup
					}
				};
			}
			
			this._loadObjects(object.contents, container[object.name], path + object.name, tmpGroup );
		}
		else{
			this._addObject(object, container, group);
		}
	},
	
	_addGroup: function(object){
		var group = this.game.add.group();

		group.x = object.x;
		group.y = object.y;
		
		group.name = object.name;
		
		if(object.angle){
			group.angle = object.angle;
		}
		
		return group;
	},
 
	_addObject: function(object, container, group){
		
		var sp = null;
		group = group || this.game.world;
		
		sp = group.create(object.x, object.y, object.assetKey);
		
		var frameData = this.game.cache.getFrameData(object.assetKey);
		
		if(frameData){
			var arr = [];
			for(var i=0; i<frameData.total; i++){
				arr.push(i);
			}
			sp.animations.add("default", arr, (object.fps !== void(0) ? object.fps : 10) , false);
			sp.frame = object.frame;
		}
		
		
		if(object.angle){
			sp.angle = object.angle;
		}
		
		sp.anchor.x = object.anchorX;
		sp.anchor.y = object.anchorY;
		
		
		sp.x = object.x;
		sp.y = object.y;
		sp.scale.x = object.scaleX;
		sp.scale.y = object.scaleY;
		
		
		Object.defineProperty(container, object.name, {
			get : function(){ 
				return sp;
			},
			enumerable: true
		});
		
		
		return sp;
	},
	
	
};

})(typeof window == "undefined" ? global : window);
