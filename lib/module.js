
// TODO
// go.register() to register a package in module system

(function moduleScript () {

	// assert go is defined as global variable
	console.assert(typeof go !== "undefined");

    go.script.module = ";(" + moduleScript.toString() + "());";

    // path resolve

    go.resolve = function (path) { return path; }

    var defined_modules = {};
    var defining_modules = {};

    // Module's
    go.define = function (filename, content) {
        // if it's defined, throw error
        if (filename in defined_modules) {
            throw new Error(filename + " is already defined!");
        }
        defined_modules[filename] = content;
        if (filename in defining_modules) {
            defining_modules[filename].forEach(function (chan) {
                chan.put(content);
            });
        }
    };

    // over write load
    // var load = go.load;
    // go.load = function () { need(filename); return load(filename); };

    go.isLoaded = function (filename) { return filename in defined_modules; }

    // load other text-based file
    // $load("./xxx.html"), $load("./xxx.reml"), $load("./xxx.json")
    go.load = function (filename) {
        var ret = new Channel();
        // if it's not defined, waiting
        if (go.isLoaded(filename)) {
            ret.put(defined_modules[filename]);
        } else {
            if (!(filename in defining_modules)) {
                defining_modules[filename] = [];
            }
            defining_modules[filename].push(ret);
        }
        return ret;
    }

    go.isRequired = function (filename) { return filename in required_modules; }

    var required_modules = {};
    var requreing_modules = {};

    go.require = function (filename) {

        var ret = new Channel();

        if (go.isRequired(filename)) {
            ret.put(required_modules[filename]);
            return ret;
        }

        if (filename in requreing_modules) {
            // it's requiring, wait it
            requreing_modules[filename].push(ret);
            return ret;
        }

        // then it's not required before
        go(function* () {

            requreing_modules[filename] = [];
            requreing_modules[filename].push(ret);

            // $require, $fork, $dirname, $filename
            var script = (new Function(
                "return function* ($load, $require, $fork, $dirname, $filename) {" 
                + (yield go.load(filename)) + "}"))();

            var $dirname = go.resolve(filename + "../");
            var $filename = filename;

            var $require = function (path) { return go.require(go.resolve($dirname + path)); }
            var $load    = function (path) { return go.load(go.resolve($dirname + path)); }
            var $fork    = function (path) { return go.fork(go.resolve($dirname + path)); }

            var result = yield go(script($load, $require, $fork, $dirname, $filename));
            
            required_modules[filename] = result;

            requreing_modules[filename].forEach(function (chan) {
                chan.put(result);
            });
        });

        return ret;
    };





	/*
	module.js: require, define, load
	    $require
	    $fork
	    $filename
	    $dirname
	*/

	// go.define(__filename, function* ($require, $fork) {

	// });

	/*

		var require = go.require;

		go.require = function () {
			
			if cached
				return it
			else
				list.push(chan)
				go.define(name, yield io.get("xxxx"));
				obj yield require
				for each channe: chan.put(obj);

		}
		
	*/

	go.define = function (filename, script) {

		//var mod = "function*($require, $fork, __dirname, __filename) {" + script + "}";
		//var mod = new Module(filename, script);
		var dirname = filename; // change later

		var $require = function (relative_path) {
			return go.require(dirname + relative_path);
		}

		var $fork = function (relative_path) {
			return go.fork(dirname + relative_path);
		}

		try {
			mod = eval(mod)($require, $fork, dirname, filename);
		} catch (e) {}

		return go.safe(mod);
	}

	// go.require
	// go.define
	// go.check: unload, loading, loaded, requiring, required

	go.require = function (filename) {
		var ret = new go.Channel();

		// check status of the module
		// if unload, load & add event listener
		// if loading, add to listening list
		// if finished, send result to ret

		return ret;
	}

	//var cp_fork = require("child_process").fork;


	// if is Node ...
	// if is browser ...
	go.fork = function (filename) {
		var worker = cp_fork(filename);

		worker.message = new go.Channel();
		
		worker.on("message", function (msg) {
			worker.message.put(msg);
		});

		worker.on("error", function (err) {

		});

		worker.on("exit", function () {});

		worker.on("close", function () {});

		worker.on("disconnect", function () {});

		// go.self in undefined if it's master
		// go.self to receive
		// go.self.message => process.on("message", function () {})
		// go.self.send    => process.send(object)
		// 

		
		return worker;
	}

}());


	// ***** old proposal *****

	// higher level api to do further ?
	// worker.send()
	// request / response
	// wrap fork and self



	// old files:


	/*
	define({
		
		name: "module-x",
		
		version: "0.0.1",
		
		main: "/lib/main.js",

		// executed when module is defined
		init: "/lib/init.js",
		
		dependency: {
			"module-y": "0.0.1",
			"module-z": ">= 1.2.3"
		},

		include: {
			
			"/lib/main.js": function* () {
				// internel require
				var x = yield "./helper.js"
				...

				return exports;
			},
			
			"/lib/helper.js": function* () {
				// external require
				var y = yield "module-x"
				...
			}
		},

	});

	// for nodejs
	require("rejs-define")({
		
		name: "..."

		version: "..."

		filepath: "....."

		module: module // for node to load module.exports

		// for node
		include: {
			"./lib/main.js"
		}

	})
	*/

	// "define" function

	// var packages = {};

	// throw error if detect cycle
	// var cycleError = new Error("Cycle Error Detected!");
	/*
	function requires (path, pack) {

		// check if already required
		if (pack.exports.hasOwnProperty)

		// if exists, return it (maybe undefined), otherwise then require it

		//
	}
	*/
	/*
	module.exports = function define (pack) {

		// assert all info is correct.

		// packages[pack.name] ?= {}
		packages[pack.name] = packages[pack.name] || {};

		packages[pack.name][pack.version] = pack;

		pack.exports = pack.exports || {};

		if (pack.init) {

			requires(pack.init, pack);

			var init = pack.include[pack.init]();

			var ret = init.next();

			while (!ret.done) {

				var require = 

			}

			pack.exports[pack.init] = ret.value;
		}
	}

	*/



	// function validateName()    {...}
	// function validateVersion() {...}
	// function validateInclude() {...}

	// function validateMain() {}
	// function validateInit() {}

	// function validateExports() {}

	/*
	define({
		name: "ok",
		version: "0.0.1",

		main: "./main.js",

		init: "./init.js",

		path: "/xxx/xxx/xxx", // could be http:xxx.xxx.xxx/xxx/xxx/xxx

		include: {
			"./main.js": function* (__dirname, __filename) {

				return "I am in main"
			},

			"./init.js": function* () {
				console.log( yield "./main.js" )
			}
		},
	})
	*/

	// if it's window, when generate path, it will be transfer to unix one

	// var packagePath = "/Users/xxx/my_package"

	// var files = {
	// 	"lib/main.js": function* (__dirname, __filename) {
	// 		var util = yield "./util.js"

	// 		console.log(util);
	// 	},

	// 	"lib/util.js": function* (__dirname, __filename) {
			
	// 		console.log(__dirname);

	// 		console.log(__filename);

	// 		return "Hello, I am util";
	// 	}
	// }

	// var loaded = {};

	// var path = require("path");

	// function imports(filePath) {
	// 	if (! (filePath in files)) throw new Error("file not found");

	// 	if (filePath in loaded) {
	// 		return loaded[filePath];
	// 	}

	// 	// init loaded, for cycle require, return undefined
	// 	loaded[filePath] = undefined;

	// 	var myPath = packagePath + "/" + filePath;

	// 	var f = files[filePath]( path.dirname(myPath), path.basename(myPath) );

	// 	var ret = f.next();

	// 	while (!ret.done) {
	// 		// require new file

	// 		// check if needs file or module

	// 		var p = path.normalize(path.dirname(filePath) + "/" + ret.value);



	// 		console.log("p is " + p);

	// 		// filePath/./../../filePath/filePath/p

	// 		ret = f.next(imports(p));
	// 	}

	// 	loaded[filePath] = ret.value;

	// 	return loaded[filePath];
	// }

	// var x = imports("lib/main.js");

	// console.log(x);

	// ## rejs-define

	// Library for asynchronous CommonJS module using ES6 generator (works for both client and server side).

	// #### example

	// you need to use ACMB (Asynchronous CommonJS Module Builder) to generate this file.

	// 	pkgman.define({
			
	// 		name: "module-x",
			
	// 		version: "0.0.1",
			
	// 		main: "/lib/main.js",
			
	// 		// executed when module is defined
	// 		init: "/lib/init.js",

	// 		dependency: {
	// 			"module-y": "0.0.1",
	// 			"module-z": ">= 1.2.3"
	// 		},

	// 		path: "/absolute/path/to/package.json",

	// 		include: {
				
	// 			"/lib/main.js": function* (__filename, __dirname) {
	// 				// internel require
	// 				var x = yield "./helper.js"
	// 				...
	// 			},
				
	// 			"/lib/helper.js": function* (__filename, __dirname) {
	// 				// external require
	// 				var y = yield "module-x"
	// 				...
	// 			},

	// 			"/package.json": {
	// 				...
	// 				...
	// 				...
	// 			}
	// 		}
	// 	});

	// 	(<- "pkgman").define()

	// 	define({

	// 		name: "module-y",
			
	// 		version: "0.0.1",
			
	// 		main: "...",

	// 		include: { ... }
	// 	});


	// #### for nodejs

	// 	var f = function* (require) {
	// 		yield ...

	// 		require ...

	// 		return ...
	// 	}(noda.require...);

	// 	var result = f.next();

	// 	while (!result.done) {
	// 		result = f.next(require(result.value))
	// 	}

	// 	if (result.value !== undefined) {
	// 		module.exports = result.value;
	// 	}


	// 	noda.require("path/to/file")

	// #### define

	// 	pkgman.define(...);

	// #### import

	// 	let file = yield http.get("xxx.xxx.xxx/xxx.js")
	// 	pkgman.load(file)

	// 	pkgman.import("http://xxx.xxxx.com/xxx.json", "optional-name");


	// 	// include name
	// 	pkgman.import("http://xxx.xxxx.com/xxx.js")

	// 	// return a channel
	// 	var xxx = yield pkgman.require("xxx-xxx")


	// 	io.require("xxx")
	// 	io.require("xxx")
	// 	io.require("xxx")

	// 	define("io", require("xxx.js"))

	// 	// find main.js, and
	// 	define({
	// 		name: "xxx",

	// 		version: "xxx.xxx.xxx",

	// 		main: "xxx.js",
	// 		init: "xxx.js",

	// 		include: {...}
	// 	})

	// 	mod.define("./xxxx.js")

	// 	var mod = new Mod(__dirname)

	// 	var mod = new io.Mod();

	// 	mod.load("./name-of-file1.js")
	// 	mod.load("./name-of-file2.js")
	// 	mod.define("./name.js", "script...")

	// 	mod.define("mod-name")

	// 	var mod = new Mod("name-of-mod");

	// 	// in nodejs, it will search ...
	// 	mod.require("name-of-mod")








