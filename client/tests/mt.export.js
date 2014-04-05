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
mt.data = {
	"assets": {
		"name": "assets",
		"contents": [
			{
				"name": "Test",
				"contents": [
					{
						"__image": "3.png",
						"name": "main-back.png",
						"path": "/Test/main-back.png",
						"width": 256,
						"height": 100,
						"frameWidth": 256,
						"frameHeight": 100,
						"frameMax": -1,
						"margin": 0,
						"spacing": 0,
						"id": 3,
						"fullPath": "/Test/main-back.png",
						"source": "../client/data/projects/p7qe/tmp/assets/Test/main-back.png"
					},
					{
						"__image": "4.png",
						"name": "main-side-left.png",
						"path": "/Test/main-side-left.png",
						"width": 256,
						"height": 100,
						"frameWidth": 256,
						"frameHeight": 100,
						"frameMax": -1,
						"margin": 0,
						"spacing": 0,
						"id": 4,
						"fullPath": "/Test/main-side-left.png",
						"source": "../client/data/projects/p7qe/tmp/assets/Test/main-side-left.png"
					},
					{
						"__image": "5.png",
						"name": "main-side-right.png",
						"path": "/Test/main-side-right.png",
						"width": 256,
						"height": 100,
						"frameWidth": 256,
						"frameHeight": 100,
						"frameMax": -1,
						"margin": 0,
						"spacing": 0,
						"id": 5,
						"fullPath": "/Test/main-side-right.png",
						"source": "../client/data/projects/p7qe/tmp/assets/Test/main-side-right.png"
					},
					{
						"__image": "6.png",
						"name": "main-side.png",
						"path": "/Test/main-side.png",
						"width": 256,
						"height": 100,
						"frameWidth": 256,
						"frameHeight": 100,
						"frameMax": -1,
						"margin": 0,
						"spacing": 0,
						"id": 6,
						"fullPath": "/Test/main-side.png",
						"source": "../client/data/projects/p7qe/tmp/assets/Test/main-side.png"
					},
					{
						"__image": "7.png",
						"name": "main.png",
						"path": "/Test/main.png",
						"width": 256,
						"height": 100,
						"frameWidth": 64,
						"frameHeight": 100,
						"frameMax": -1,
						"margin": 0,
						"spacing": 0,
						"id": 7,
						"fullPath": "/Test/main.png",
						"source": "../client/data/projects/p7qe/tmp/assets/Test/main.png"
					}
				],
				"count": 0,
				"id": 2,
				"fullPath": "/Test"
			},
			{
				"name": "img",
				"contents": [
					{
						"name": "Test",
						"contents": [
							{
								"__image": "11.png",
								"name": "box.png",
								"path": "/img/Test/box.png",
								"width": 54,
								"height": 54,
								"frameWidth": 54,
								"frameHeight": 54,
								"frameMax": -1,
								"margin": 0,
								"spacing": 0,
								"id": 11,
								"fullPath": "/img/Test/box.png",
								"source": "../client/data/projects/p7qe/tmp/assets/img/Test/box.png"
							},
							{
								"__image": "12.png",
								"name": "bush1.png",
								"path": "/img/Test/bush1.png",
								"width": 54,
								"height": 54,
								"frameWidth": 54,
								"frameHeight": 54,
								"frameMax": -1,
								"margin": 0,
								"spacing": 0,
								"id": 12,
								"fullPath": "/img/Test/bush1.png",
								"source": "../client/data/projects/p7qe/tmp/assets/img/Test/bush1.png"
							},
							{
								"__image": "13.png",
								"name": "bush2.png",
								"path": "/img/Test/bush2.png",
								"width": 54,
								"height": 54,
								"frameWidth": 54,
								"frameHeight": 54,
								"frameMax": -1,
								"margin": 0,
								"spacing": 0,
								"id": 13,
								"fullPath": "/img/Test/bush2.png",
								"source": "../client/data/projects/p7qe/tmp/assets/img/Test/bush2.png"
							},
							{
								"__image": "14.png",
								"name": "food1.png",
								"path": "/img/Test/food1.png",
								"width": 28,
								"height": 28,
								"frameWidth": 28,
								"frameHeight": 28,
								"frameMax": -1,
								"margin": 0,
								"spacing": 0,
								"id": 14,
								"fullPath": "/img/Test/food1.png",
								"source": "../client/data/projects/p7qe/tmp/assets/img/Test/food1.png"
							},
							{
								"__image": "15.png",
								"name": "food2.png",
								"path": "/img/Test/food2.png",
								"width": 28,
								"height": 28,
								"frameWidth": 28,
								"frameHeight": 28,
								"frameMax": -1,
								"margin": 0,
								"spacing": 0,
								"id": 15,
								"fullPath": "/img/Test/food2.png",
								"source": "../client/data/projects/p7qe/tmp/assets/img/Test/food2.png"
							},
							{
								"__image": "16.png",
								"name": "grass.png",
								"path": "/img/Test/grass.png",
								"width": 108,
								"height": 108,
								"frameWidth": 108,
								"frameHeight": 108,
								"frameMax": -1,
								"margin": 0,
								"spacing": 0,
								"id": 16,
								"fullPath": "/img/Test/grass.png",
								"source": "../client/data/projects/p7qe/tmp/assets/img/Test/grass.png"
							},
							{
								"__image": "17.png",
								"name": "snake.png",
								"path": "/img/Test/snake.png",
								"width": 28,
								"height": 28,
								"frameWidth": 28,
								"frameHeight": 28,
								"frameMax": -1,
								"margin": 0,
								"spacing": 0,
								"id": 17,
								"fullPath": "/img/Test/snake.png",
								"source": "../client/data/projects/p7qe/tmp/assets/img/Test/snake.png"
							}
						],
						"count": 0,
						"id": 10,
						"fullPath": "/img/Test"
					}
				],
				"count": 1,
				"id": 9,
				"fullPath": "/img"
			}
		],
		"count": 17
	},
	"objects": {
		"name": "objects",
		"contents": [
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 64,
				"y": 64,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696048358",
				"name": "main",
				"fullPath": "/main",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 128,
				"y": 64,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696048515",
				"name": "main1",
				"fullPath": "/main1",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 256,
				"y": 64,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696048611",
				"name": "main3",
				"fullPath": "/main3",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 320,
				"y": 64,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696048667",
				"name": "main4",
				"fullPath": "/main4",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 448,
				"y": 64,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696048859",
				"name": "main6",
				"fullPath": "/main6",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 512,
				"y": 64,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696048899",
				"name": "main7",
				"fullPath": "/main7",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 640,
				"y": 64,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696048995",
				"name": "main9",
				"fullPath": "/main9",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 704,
				"y": 64,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696049059",
				"name": "main10",
				"fullPath": "/main10",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 64,
				"y": 128,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696050453",
				"name": "main11",
				"fullPath": "/main11",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 128,
				"y": 128,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696050563",
				"name": "main12",
				"fullPath": "/main12",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 256,
				"y": 128,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696050635",
				"name": "main14",
				"fullPath": "/main14",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 320,
				"y": 128,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696050659",
				"name": "main15",
				"fullPath": "/main15",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 448,
				"y": 128,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696050707",
				"name": "main17",
				"fullPath": "/main17",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 512,
				"y": 128,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696050731",
				"name": "main18",
				"fullPath": "/main18",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 640,
				"y": 128,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696050811",
				"name": "main20",
				"fullPath": "/main20",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 704,
				"y": 128,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696050891",
				"name": "main21",
				"fullPath": "/main21",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 64,
				"y": 192,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696051924",
				"name": "main22",
				"fullPath": "/main22",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 128,
				"y": 192,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696052011",
				"name": "main23",
				"fullPath": "/main23",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 256,
				"y": 192,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696052067",
				"name": "main25",
				"fullPath": "/main25",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 320,
				"y": 192,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696052091",
				"name": "main26",
				"fullPath": "/main26",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 448,
				"y": 192,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696052140",
				"name": "main28",
				"fullPath": "/main28",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 512,
				"y": 192,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696052171",
				"name": "main29",
				"fullPath": "/main29",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 640,
				"y": 192,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696052251",
				"name": "main31",
				"fullPath": "/main31",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 704,
				"y": 192,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696052883",
				"name": "main32",
				"fullPath": "/main32",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 64,
				"y": 256,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696054084",
				"name": "main33",
				"fullPath": "/main33",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 128,
				"y": 256,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696054187",
				"name": "main34",
				"fullPath": "/main34",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 256,
				"y": 256,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696054243",
				"name": "main36",
				"fullPath": "/main36",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 320,
				"y": 256,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696054267",
				"name": "main37",
				"fullPath": "/main37",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 448,
				"y": 256,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696054309",
				"name": "main39",
				"fullPath": "/main39",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 512,
				"y": 256,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696054331",
				"name": "main40",
				"fullPath": "/main40",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 640,
				"y": 256,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696054403",
				"name": "main42",
				"fullPath": "/main42",
				"assetPath": "/Test/main.png"
			},
			{
				"assetId": 7,
				"__image": "7.png",
				"x": 704,
				"y": 256,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "main",
				"frame": 0,
				"_framesCount": 4,
				"id": "tmp1396696054859",
				"name": "main43",
				"fullPath": "/main43",
				"assetPath": "/Test/main.png"
			},
			{
				"name": "Boxes",
				"x": 391,
				"y": 254,
				"angle": 0,
				"contents": [
					{
						"assetId": 11,
						"__image": "11.png",
						"x": -128,
						"y": 128,
						"anchorX": 0.5,
						"anchorY": 0.5,
						"angle": 0,
						"alpha": 1,
						"tmpName": "box",
						"frame": 0,
						"_framesCount": 0,
						"id": "tmp1396696157309",
						"name": "box",
						"fullPath": "/Boxes/box",
						"assetPath": "/img/Test/box.png"
					},
					{
						"assetId": 11,
						"__image": "11.png",
						"x": 0,
						"y": 128,
						"anchorX": 0.5,
						"anchorY": 0.5,
						"angle": 0,
						"alpha": 1,
						"tmpName": "box",
						"frame": 0,
						"_framesCount": 0,
						"id": "tmp1396696158429",
						"name": "box2",
						"fullPath": "/Boxes/box2",
						"assetPath": "/img/Test/box.png"
					},
					{
						"assetId": 11,
						"__image": "11.png",
						"x": -64,
						"y": 128,
						"anchorX": 0.5,
						"anchorY": 0.5,
						"angle": 0,
						"alpha": 1,
						"tmpName": "box",
						"frame": 0,
						"_framesCount": 0,
						"id": "tmp1396696157909",
						"name": "box1",
						"fullPath": "/Boxes/box1",
						"assetPath": "/img/Test/box.png"
					},
					{
						"assetId": 11,
						"__image": "11.png",
						"x": 64,
						"y": 128,
						"anchorX": 0.5,
						"anchorY": 0.5,
						"angle": 0,
						"alpha": 1,
						"tmpName": "box",
						"frame": 0,
						"_framesCount": 0,
						"id": "tmp1396696158893",
						"name": "box3",
						"fullPath": "/Boxes/box3",
						"assetPath": "/img/Test/box.png"
					}
				],
				"fullPath": "/Boxes",
				"id": 20,
				"assetId": 11,
				"__image": "11.png",
				"frame": 0
			},
			{
				"assetId": 11,
				"__image": "11.png",
				"x": 523,
				"y": 382,
				"anchorX": 0.5,
				"anchorY": 0.5,
				"angle": 0,
				"alpha": 1,
				"tmpName": "box",
				"frame": 0,
				"_framesCount": 0,
				"id": "tmp1396696464176",
				"name": "box",
				"fullPath": "/box",
				"assetPath": "/img/Test/box.png"
			}
		],
		"count": 20
	}
};
