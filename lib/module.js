

(function moduleScript () {

	// assert go is defined as global variable
	console.assert(typeof go !== "undefined");

    var isNode = go.isNode;

    go.script.module = ";(" + moduleScript.toString() + "());";

    // ["http://", "https://", "//", "/"]
    // return "" if not match
    // TODO: may handle more types...
    go.pathScheme = function (path) {
        var scheme = path.match(/((https?:)?\/?)?\//);
        return scheme ? scheme[0] : "";
    }

    // ("/file/path", "./name.js")
    // ("/file/path/xx.js", "../")
    go.resolve = function () {
        var scheme = go.pathScheme(arguments[0]);
        // take off scheme
        arguments[0] = arguments[0].slice(scheme.length);
    	var path = [];
    	for (var i = 0; i < arguments.length; i++) {
    		arguments[i].split("/").forEach(function (x) { 
    			if (x !== "" && x !== ".") {
    				if (x === "..") {
    					path.pop();
    				} else {
    					path.push(x);
    				}
    			}
    		});
    	}
    	return scheme + path.join("/");
    };



    var defined_modules   = {};
    var defining_modules  = {};
    var required_modules  = {};
    var requiring_modules = {};

    go.isLoaded   = function (filename) { return filename in defining_modules;  };
    go.isDefined  = function (filename) { return filename in defined_modules;   };
    go.isRequired = function (filename) { return filename in requiring_modules; };
    go.isExported = function (filename) { return filename in required_modules;  };

    // go.define("name", function () {
    //     $require()
    //     $export("name");
    // });

    // go.define("name", function* () {
    //     $require()
    //     $export(obj)
    // })

    // Module's
    go.define = function (filename, content) {
        go.assert(!go.isDefined(filename)); // should not over write defined modules or docs

        defined_modules[filename] = content;
        if (go.isLoaded(filename)) {
            defining_modules[filename].forEach(function (chan) {
                chan.put(content);
            });
            defining_modules[filename] = null; // free channels
        }
        go.emit("define", filename, content);
    };


    // load other text-based file
    // $load("./xxx.html"), $load("./xxx.reml"), $load("./xxx.json")
    go.load = function (filename) {

        var ret = new go.Channel();
        // if it's not defined, waiting
        if (go.isDefined(filename)) {
            ret.put(defined_modules[filename]);
        } else {
            defining_modules[filename] = defining_modules[filename] || [];
            defining_modules[filename].push(ret);
            go.emit("load", filename);
        }
        return ret;
    }

    go.require = function (filename) {
        var ret = new go.Channel();
        if (go.isExported(filename)) {
            ret.put(required_modules[filename]);
        }
        else if (go.isRequired(filename)) {
            requiring_modules[filename].push(ret); // it's requiring, wait it
        }
        else {
            requiring_modules[filename] = []; // then it's not required before
            requiring_modules[filename].push(ret);
            go.emit("require", filename); // only emit for first-time require
        }
        return ret;
    };

    // can only export each module once
    go.export = function (filename, obj) {
        go.assert(!(filename in required_modules));
        required_modules[filename] = obj;
        requiring_modules[filename].forEach(function (chan) {
            chan.put(obj);
        });
        requiring_modules[filename] = null; // free channels
    };

    // auto download files online (with http and https)
    go.on('load', function (name) {
        var scheme = go.pathScheme(name);
        if (scheme === "http://" || scheme === "https://" ) {
            // do http request
            go.yield(go.request(name), function (err, result) {
                if (err) throw err;
                if (result.statusCode !== 200) throw new Error("Cannot find: " + name);
                go.define(name, result.text);
            });
        }
    });

    // auto download local files
    if (isNode) {
        var fs = require('fs');
        go.on('load', function (name) {
            if (name[0] === "/") {
                fs.readFile(name, function (err, file) {
                    if (err) throw err;
                    go.define(name, file.toString());
                });
            }
        });
    }

    go.on('require', function (filename) {
        if (filename.slice(-3) === ".js") {
            // $require, $fork, $dirname, $filename
            go.yield(go.load(filename), function (err, file) {
                var $dirname = go.resolve(filename, "../");
                var $filename = filename;

                var $load    = function (path) { return go.load(go.resolve($dirname, path)); };
                var $require = function (path) { return go.require(go.resolve($dirname, path)); };
                var $export  = function (obj)  { go.export($filename, obj); };

                // only for absolute file path, not for http one
                if (isNode && filename[0] === "/") {
                    var Module = require("module");
                    var $module = new Module(filename);                
                    var script = new Function("$load", "$require", "$export", "__dirname", "__filename", "require", file);
                    script($load, $require, $export, $dirname, $filename, $module.require.bind($module));
                } else {
                    var script = new Function("$load", "$require", "$export", "__dirname", "__filename", file);
                    script($load, $require, $export, $dirname, $filename);
                }
            });
        }
    });

    go.on("require", function (filename) {
        if (filename.slice(-5) === ".json") {
            go.yield(go.load(filename), function (err, file) {
                go.export(filename, JSON.parse(file));
            });
        }
    });

    if (isNode) {
        var cp = require('child_process');

        // go.fork(filename, args) // go.args
        go.fork = function (filename, args) {
            // define gocsp
            var worker = cp.fork(__dirname + "/worker.js");
            // go.loadfile
            worker.send(JSON.stringify([filename, args || null]));
            return worker;
        };
    } else {
        // use WebWorker (inline worker)
        var initScript = go.script.all
                       + ";self.addEventListener('message', function init (msg) { "
                       + "     self.removeEventListener(init); "
                       + "     var msg = JSON.parse(msg); "
                       + "     go.self = new go.Socekt(self); " // may not init here
                       + "     go.self.main = msg[0]; "
                       + "     go.self.args = msg[1]; "
                       + "     go.require(go.self.main); "
                       + " });"
        var blob = new Blob([initScript]);

        var blobURL = window.URL.createObjectURL(blob);

        go.fork = function (filename, args) {
            // inline worker
            var worker = new Worker(blobURL);
            worker.postMessage(JSON.stringify([filename, args || null]));
            return worker;
        }
    }
}());

    // go.register("name", "path");

    // go.register("jquery", "http://cdn.google.com/jquery...");

    // go.on("register", function (name, path) { });

    // go.require() 
    // 1. check if isExported
    // 2. check if isRequired
    // 3. check if loaded
    // 4. check if isRegistered

	// TODO
	// go.register() to register a package in module system
	/*
	go.register({
		name: "module-x",
		
		version: "0.0.1",
		
		main: "/lib/main.js",

		path: "/path/"
		
		dependency: {
			"module-y": "0.0.1",
			"module-z": ">= 1.2.3"
		},
	});
	*/