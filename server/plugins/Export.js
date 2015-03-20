MT.require("core.FS");
var exec = require('child_process').exec;
MT.extend("core.BasicPlugin")(
	MT.plugins.Export = function(project){
		MT.core.BasicPlugin.call(this, project, "Export");

		this.fs = MT.core.FS;

		this.index = "index.html";
		this.phaserSrc = "phaser.js";
		this.phaserMinSrc = "phaser.min.js";

		var p = this.fs.path.sep;
		this.tplPath = "templates"+p+"default"+p;
		
		this.importFile = "mt.helper.js";
		this.dataFile = "mt.data.js";
		this.jsonFile = "mt.data.json";
		this.exampleFile = "index.html";
		this.hacksFiles = ["phaserHacks2.0.7.js", "phaserHacks2.1.3.js", "phaserHacks.js"];

		
		
		this.phaserPath = "phaser";
		this.assetsPath = "assets";

		this.sep = this.fs.path.sep;

		this.idList = {};
	},
	{
		get dir(){
			return this.project.path + this.sep + this.name;
		},
		_name: undefined,
		get name(){
			if(!this._name){
				var info = this.project.getProjectInfo();
				var name = info.namespace;
				name = name.replace(/\W+/g, "_");
				this._name = name;
			}
			return this._name;
		},
		
		a_phaserDataOnly: function(data, cb){
			var that = this;
			this.phaserDataOnly(function(err, localFilePath, filePath){
				cb({
					file: localFilePath,
					action: "phaserDataOnly"
				});
			});
		},

		_cleanUp: function(o){
			delete o.__image;
			delete o.source;
			delete o.path;
			delete o.tmpName;
			delete o._framesCount;
		},

		phaserDataOnly: function(cb, contents){
			this.zipName = this.name + ".zip";
			var that = this;
			this.fs.mkdir(this.dir);
			var data;

			if(contents == void(0)){
				data = JSON.parse(JSON.stringify({
					assets: this.project.db.get("assets"),
					objects: this.project.db.get("objects"),
					map: this.project.db.get("map").contents[0]
				}, null, "\t"));
			}
			else{
				data = contents;
			}

			this.createIdList(data.assets.contents, this.dir + this.sep + this.assetsPath);
			this.parseAssets(data.assets.contents);
			this.parseObjects(data.objects.contents);

			contents = JSON.stringify(data, null, "\t");
			
			
			var p = this.fs.path.sep;
			
			var srcPath = this.dir + this.sep;
			var libsPath = srcPath + "js/lib/";
			var tplPath = this.tplPath + "src" + p + "js" + p + "lib" + p;
			var localFilePath = this.name + "/js/lib/" +  this.dataFile;
			var filePath = libsPath + this.dataFile;
			
			that.fs.copy(this.project.path + this.sep + "src", this.dir);

			that.fs.copy(tplPath + this.importFile, libsPath + this.importFile);

			for(var i=0; i<this.hacksFiles.length; i++){
				that.fs.copy(tplPath + this.hacksFiles[i], libsPath + this.hacksFiles[i]);
			}

			that.fs.writeFile(libsPath + this.jsonFile, contents);
			that.fs.writeFile(libsPath + this.dataFile, "window.mt = window.mt || {}; window.mt.data = "+contents+";\r\n", function(err){
				if(cb){
					cb(err, localFilePath, filePath);
				}
			});
		},

		copyData: function(data, path, num, cb){
			num = num || 0;

			var scanAgain = [];

			for(var i=0; i<data.length; i++){
				if(data[i].contents){
					scanAgain.push(data[i].contents);
					continue;
				}

				num++;
				this.copyFile(data[i], path, function(){
					num--;
					if(num == 0){
						cb();
					}
				});
			}

			for(var i=0; i<scanAgain.length; i++){
				this.createSources(scanAgain[i], info, num, cb);
			}
		},

		copyFile: function(info, path, cb){

		},
		
		a_phaser: function(data, cb){
			MT.log("Export phaser", this.project.id);
			
			var that = this;
			var dd = this.dir;
			
			this.fs.rmdir(this.dir);
			this.fs.mkdir(this.dir + this.sep + this.assetsPath);
			
			this.phaser(function(error, stdout, stderr){
				if(data.zip){
					that.zip(that.name, that.dir, function(zipName){
						cb({
							file: zipName,
							name: that.name,
							action: "phaser"
						});
					});
				}
				else{
					cb({
						file: that.zipName,
						name: that.name,
						action: "phaser"
					});
				}
			});
		},
		
		/*
		{
			email: ...
			template: ...
			cmd: ...
			env: ...
		}
		*/
		
		a_genKeystore: function(info, cb){
			var that = this;
			var auth = this.project.auth;
			if(!auth.user.id){
				cb();
				MT.log("genKeystore: BAD AUTH");
				return;
			}
			
			var p = this.fs.path.sep;
			var path = "secret" + p + auth.user.id;
			var keystore = path + p + "keystore";
			
			args = [info.CN, info.OU, info.O, info.L, info.ST, info.C];
			for(var i=0; i<args.length; i++){
				if(args[i] == void(0)){
					cb();
					return;
				}
				args[i] = args[i].replace(/"/gi, '\"');
			}
			
			var astr = '"' + args.join('" "') + '"';
			
			this.fs.mkdir(path, function(){
				
				var password = auth.randomMD5();
				auth.setKeystorePassword(password)
				
				MT.core.Queue({
						cmd: that.project.config.tools.crosswalk + " keystore " + astr,
						env: {
							cwd: path,
								env:{
									PASSWORD: password
								}
						}
					},
					function(){
						cb();
					}
				);
			});
			
			
		},
		
		a_crosswalk: function(opts, cb){
			var that = this;
			var auth = this.project.auth;
			if(!auth.user || !auth.user.level){
				cb({requireProLevel: 1});
				return;
			}
			
			
			var arch = opts.arch;
			
			this.info = this.project.getProjectInfo();
			
			if(!this.info.package){
				cb({requirePackage: 1});
				return;
			}
			
			var config = this.project.config;
			var p = this.fs.path.sep;
			var path = "secret" + p + auth.user.id;
			var keystore = this.fs.path.resolve(path + p + "keystore");
			
			var getName = function(json, package){
				var name = package.split(".").pop();
				name = name.substring(0, 1).toUpperCase() + name.substring(1);
				if(json.version){
					name += "_" + json.version;
				}
				else if(json.xwalk_version){
					name += "_" + json.xwalk_version;
				}
				
				name += "_"+arch+".apk";
				return name;
			};
			
			var proceed = function(el, dir, name, launcher){
				var after = function(password){
					var base = that.project.config.hostname + "/data/projects/" + that.project.id + "/" + that.name;
					var link = base + "-minified/build/" + name;
			
					that.fs.after(function(){
						var d = that.fs.path.resolve(dir);
						var settings = {
							cmd: that.project.config.tools.crosswalk + " make " + that.info.package + " ./manifest.json " + arch +" "+ keystore,
							env: {
								cwd: d,
								env:{
									PASSWORD: password
								},
							},
							password: password,
							email: auth.user.email,
							template: opts.rel ? "appIsReadySigned" : "appIsReadyDebug",
							link: link
						};
						
						if(opts.rel){
							settings.attachments = [{ path: keystore }];
						}
						
						
						MT.core.Queue(settings, function(err, serr){
							cb({
								file: name,
								title: that.name,
								err: err,
								serr: serr,
								action: "phaser"
							});
						});
					});
				};
				
				if(!el){
					that.fs.copy(that.tplPath + "launcher.png", launcher);
				}
				if(opts.rel){
					auth.getKeystorePassword(function(password){
						if(!password){
							MT.error("BAD password");
							cb();
							return;
						}
						after(password);
						
					});
				}
				else{
					after();
				}
			};
			
			var minify = function(){
				that.phaserMinify(function(name, dir){
					var manifest = dir + p + "manifest.json";
					var launcher = dir + p + "assets" + p + "launcher.png";
					
					that.fs.exists(manifest, function(em){
						that.fs.exists(launcher, function(el){
							if(!em){
								that.fs.readFile(that.tplPath + "src" + p + "manifest.json", function(e, c){
									var json = JSON.parse(c);
									json.name = that.info.title;
									
									that.fs.writeFile(manifest, JSON.stringify(json));
									proceed(el, dir, getName(json, that.info.package), launcher);
								}, "UTF-8");
							}
							else{
								that.fs.readFile(manifest, function(e, c){
									var json = JSON.parse(c);
									proceed(el, dir, getName(json, that.info.package), launcher);
								});
							}
						});
					});
				});
			};
			if(opts.rel){
				MT.log("Exporting release apk", that.project.id);
				this.fs.exists(keystore, function(y){
					if(!y){
						cb({requireSignature: 1});
						return;
					}
					minify();
				});
			}
			else{
				MT.log("Exporting debug apk", that.project.id);
				minify();
			}
			
			
			
		},
		
		a_phaserMinify: function(data, cb){
			var that = this;
			this.phaserMinify(function(name, dir){
				that.zip(name, dir, function(){
					cb({
						file: name,
						name: name + "-minified",
						action: "phaser"
					});
				})
			});
		},
		
		phaserMinify: function(cb){
		    var that = this;
		    this.fs.rmdir(this.dir);
			var info = this.info = this.project.getProjectInfo();
			
			this.zipName = this.name + ".min.zip";
			
			
		    this.fs.rm(this.project.path + this.sep + this.zipName);


		    this.fs.mkdir(this.dir);
		    this.fs.mkdir(this.dir + this.sep + this.assetsPath);
			
			
			
		    this.phaser(function (error, stdout, stderr) {
		        that.minify(function(dir){
					cb(that.name, dir);
		        });
		    });
		},
		
		zip: function(name, dir, cb){
			var zipName = name+ ".min.zip";
			this.fs.rm(dir + this.fs.path.sep + ".."+ this.fs.path.sep + zipName, function(){
				exec("zip -9 -r ../" + zipName + " ./", { cwd: dir }, function(){
					if(cb){
						cb(zipName, dir);
					}
				});
			});
		},


		minify: function(cb){
			var index = this.dir + this.sep + this.index;
			var that = this;
			var info = this.info;
			var name = info.namespace;
			name = name.replace(/\W+/g, "_");


			var cssFileName = name + ".min.css";
			var jsFileName = name + ".min.js";
			var indexFile = "index.html";


			var miniPath = MT.core.FS.path.normalize(this.project.path + this.sep + name + "-minified" + this.sep);
			this.fs.rm(miniPath);

			this.fs.readFile(index, function(err, cont){
				if(err){
					MT.log("ERROR!", err);
					if(cb){cb();}
					return;
				}
				var Parser = require("../lib/HTMLWalker.js").HTMLWalker;
				var scripts = [],
					styles = [];

				var html = "";

				var currentTag = "";

				var linkAttribs = {};
				var scriptAttribs = {};
				var tags = [];

				var linkAdded = false;
				var scriptAdded = false;

				new Parser(cont.toString("UTF-8"), {
					ontagopen: function(tag){
						tags.push(tag);
						if(tag !== "script" && tag !== "link"){
							html += "<" + tag;
						}
					},
					onattribute: function(attr, value, q){
						currentTag = tags[tags.length - 1];
						if(currentTag == "script"){
							if(value){
								scriptAttribs[attr] = value.trim();
							}
							return;
						}
						if(currentTag == "link"){
							if(value){
								linkAttribs[attr] = value.trim();
							}
							return;
						}
						if(value){
							html += " "+attr+"="+q+value+q;
						}
						else{
							html += " "+attr;
						}
					},
					ontagleave: function(tag){
						currentTag = tags[tags.length - 1];
						if(currentTag === "script" || currentTag === "link") {
							return;
						}
						html += ">";
					},
					ontagclose: function(tag, auto){
						currentTag = tags.pop();

						if(currentTag == "link"){
							var h = linkAttribs.href;
							
							if(h && h.substring(h.length - 3) === "css" && h.substring(h.length - 7, h.length - 4) !== "min" && h.substring(0, 4) != "http"){
								styles.push(h);
								return;
							}
							html += "<link ";
							for(var i in linkAttribs){
								html += (i + '="'+linkAttribs[i] + '"');
							}
							html += " />";
							return;
						}

						if(currentTag == "script"){
							var s = scriptAttribs.src;
							if(s && s.substring(s.length - 6, s.length - 3) !== "min" && s.substring(0, 4) != "http"){
								scripts.push(that.dir + that.fs.path.sep + s);
								return;
							}

							html += "<script ";
							for(var i in scriptAttribs){
								html += (i + '="'+scriptAttribs[i] + '"');
							}
							html += "></script>";
							return;
						}

						if(!scriptAdded && tag == "body"){
							html += '<script type="text/javascript" src="'+jsFileName+'"></script>';
						}

						if(auto){
							html += " />";
						}
						else{
							html += "</"+tag+">";
						}
						
						if(!linkAdded && tag == "title"){
							html += '<link rel="stylesheet" type="text/css" href="'+cssFileName+'" />';
						}

					},
					ontext: function(text){
						// we can trim head;
						if(tags.indexOf("head") > -1){
							html += text.trim();
						}
						else{
							html += text;
						}
					}
				});

				var UglifyJS = require("uglify-js");
				var CleanCSS = require('clean-css');

				var toplevel = null;
				var css;

				var todo = 0;
				var done = function(){
					todo--;
					if(todo !== 0) {
						return;
					}
					toplevel.figure_out_scope();
					var compressor = UglifyJS.Compressor();
					var compressed_ast = toplevel.transform(compressor);
					compressed_ast.figure_out_scope();
					compressed_ast.compute_char_frequency();
					compressed_ast.mangle_names();

					var stream = UglifyJS.OutputStream();
					compressed_ast.print(stream);
					var code = stream.toString();

					MT.core.FS.copy(that.dir, miniPath);
					MT.core.FS.writeFile(miniPath + jsFileName, code);
					MT.core.FS.writeFile(miniPath + cssFileName, css);
					MT.core.FS.writeFile(miniPath + indexFile, html, function(){
						if(cb){cb(miniPath);}
					});
				};
				todo++;

				new CleanCSS({root: that.dir}).minify(styles, function(e, min){
					css = min.styles;
					done();
				});


				scripts.forEach(function(file){
					todo++;
					MT.core.FS.readFile(file, function(e, code){
						if(e){
							MT.log("Export -> Minify Error:", e);
							//process.exit();
						}
						toplevel = UglifyJS.parse(code.toString("UTF-8"), {
							filename: file,
							toplevel: toplevel
						});

						done();
					});
				});
			});
		},
		
		phaser: function(cb){
			var that = this;

			this.dir = this.project.path + this.sep + this.phaserPath;
			this.fs.mkdir(this.dir);

			this.assets = JSON.parse( JSON.stringify(this.project.db.get("assets")) );
			this.objects = JSON.parse( JSON.stringify(this.project.db.get("objects")) );

			if(this.project.db.get("map").contents && this.project.db.get("map").contents.length > 0){
				this.map = JSON.parse( JSON.stringify(this.project.db.get("map").contents[0]) );
			}
			else{
				this.map = {};
			}
			this.parseAssets(this.assets.contents);

			var contents = {
					assets: this.assets,
					objects: this.objects,
					map: this.map
			};

			this.phaserDataOnly(function (err, local, pub) {
			    if(cb){
			        cb();
			    }
			}, contents);
		},

		createIdList: function(assets, path){
			path = path || this.project.path;
			var asset = null;
			for(var i=0; i<assets.length; i++){
				asset = assets[i];

				if(asset.contents){
					this.createIdList(asset.contents, path + asset.name);

					this._cleanUp(asset);
					continue;
				}

				this._cleanUp(asset);
				this.idList[asset.id] = asset.key;
			}
		},

		parseAssets: function(assets, path){
			path = path || this.dir + this.sep + this.assetsPath;
			this.fs.mkdir(path);

			var asset = null;
			for(var i=0; i<assets.length; i++){
				asset = assets[i];

				if(asset.contents){
					if(!asset.name || asset.name == "NaN"){
						MT.log("unknow name", asset);
						continue;
					}
					this.parseAssets(asset.contents, path + this.sep + asset.name);
					continue;
				}

				var source = path + this.sep + asset.name;
				if(asset.__image){
					this.fs.copy(this.project.path + this.sep + asset.__image, source);
				}
				if(asset.atlas){
					var aext = asset.atlas.split(".").pop();
					this.fs.copy(this.project.path + this.sep + asset.id + "." + aext, source + "." + aext);
					asset.atlas = asset.name + "." + aext;
				}
			}
		},

		parseObjects: function(objects){
			var object = null;
			var tmp = null;

			for(var i=0; i<objects.length; i++){
				object = objects[i];
				if(object.contents){
					this.parseObjects(object.contents);
					object.assetKey = this.idList[object.assetId];
					this._cleanUp(object);
					continue;
				}

				object.assetKey = this.idList[object.assetId];

				this._cleanUp(object);
			}

		}

	}
);
