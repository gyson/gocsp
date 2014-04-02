

(function moduleScript () {

	// assert go is defined as global variable
	console.assert(typeof go !== "undefined");

    var isNode = go.isNode;

    go.script.module = ";(" + moduleScript.toString() + "());";

    // path resolve

    // ("/file/path", "./name.js")
    // ("/file/path/xx.js", "../")
    // "http://xxxxx"
    go.resolve = function () {
        var isUrl = (arguments[0].slice(0, 7) === "http://");
        if (isUrl) arguments[0] = arguments[0].slice(7);
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
    	return (isUrl ? "http://" : "/") + path.join("/");
    };

    go.on('load', function (name) {
        // may support ws, http, https, ...
        if (name.slice(0, 7) === "http://" ||
            name.slice(0, 8) === "https://" ) {
            // http request
            go.yield(go.request(name), function (err, result) {
                if (err) throw err;
                if (result.statusCode !== 200) throw new Error("Cannot find: " + name);
                go.define(name, result.text);
            });
        }
    });

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

    var defined_modules = {};
    var defining_modules = {};

    // Module's
    go.define = function (filename, content) {
    	//console.log("go.define:", filename);
        // if it's defined, throw error
        if (filename in defined_modules) {
            throw new Error(filename + " is already defined!");
        }
        defined_modules[filename] = content;
        if (filename in defining_modules) {
            defining_modules[filename].forEach(function (chan) {
                chan.put(content);
            });
            delete defining_modules[filename];
        }
        go.emit("define", filename, content);
    };

    // over write load
    // var load = go.load;
    // go.load = function () { need(filename); return load(filename); };

    go.isLoaded = function (filename) { return filename in defined_modules; }

    // load other text-based file
    // $load("./xxx.html"), $load("./xxx.reml"), $load("./xxx.json")
    go.load = function (filename) {

        var ret = new go.Channel();
        // if it's not defined, waiting
        if (go.isLoaded(filename)) {
            ret.put(defined_modules[filename]);
        } else {
            defining_modules[filename] = defining_modules[filename] || [];
            defining_modules[filename].push(ret);
            go.emit("load", filename);
        }
        return ret;
    }

    go.isRequired = function (filename) { return filename in required_modules; }

    var required_modules = {};
    var requreing_modules = {};

    go.require = function (filename) {
    	//console.log("go.require:", filename);
        // go.emit("require", filename);

        var ret = new go.Channel();

        if (go.isRequired(filename)) {
            ret.put(required_modules[filename]);
        }
        else if (filename in requreing_modules) {
            // it's requiring, wait it
            requreing_modules[filename].push(ret);
        }
        else {
            // then it's not required before
            requreing_modules[filename] = [];
            requreing_modules[filename].push(ret);

            // $require, $fork, $dirname, $filename
            go.yield(go.load(filename), function (err, file) {


                var $dirname = go.resolve(filename, "../");
                var $filename = filename;

                var $require = function (path) { return go.require(go.resolve($dirname, path)); }
                var $load    = function (path) { return go.load(go.resolve($dirname, path)); }

                var cb = function (err, result) {
                    required_modules[filename] = result;
                    requreing_modules[filename].forEach(function (chan) {
                        chan.put(result);
                    });
                };

                // can only export once
                var isExported = false;
                var $export = function (obj) {
                    go.assert(!isExported, "Already export " + $filename + "!");
                    isExported = true;
                    required_modules[filename] = obj;
                    requreing_modules[filename].forEach(function (chan) {
                        chan.put(obj);
                    });
                };

                // script = (new Function(
                //     "return function* ($load, $require, __dirname, __filename, require) {" 
                //     + file + "}"))();

                // only for absolute file path, not for http one
                if (go.isNode && filename[0] === "/") {
                    var Module = require("module");
                    var $module = new Module(filename);
                    //go.yield(go(script($load, $require, $dirname, $filename, $module.require.bind($module))), cb);
                
                    var script = new Function("$load", "$require", "$export", "__dirname", "__filename", "require", file);
                    script($load, $require, $export, $dirname, $filename, $module.require.bind($module));

                } else {
                    //go.yield(go(script($load, $require, $dirname, $filename)), cb);
                    var script = new Function("$load", "$require", "$export", "__dirname", "__filename", file);
                    script($load, $require, $export, $dirname, $filename);
                }
            });
            // only emit for first-time require
            go.emit("require", filename);
        }
        return ret;
    };

    if (go.isNode) {
        var cp = require('child_process');

        // go.fork(filename, args) // go.args
        go.spawn = function (filename, args) {
            // define gocsp
            var worker = cp.fork(__dirname + "/worker.js");
            // go.loadfile
            worker.send(JSON.stringify([filename, args || null]));
            return worker;
        };
    } else {
        // use WebWorker (inline worker)
        var initScript = go.script.all;
        initScript += ";self.addEventListener('message', function init (msg) { "
                    + "     self.removeEventListener(init); "
                    + "     var msg = JSON.parse(msg); "
                    + "     go.self = new go.Socekt(self); "
                    + "     go.self.main = msg[0]; "
                    + "     go.self.args = msg[1]; "
                    + "     go.require(go.self.main); "
                    + " });"
        var blob = new Blob([initScript]);

        var blobURL = window.URL.createObjectURL(blob);

        go.spawn = function (filename, args) {
            // inline worker
            var worker = new Worker(blobURL);
            worker.postMessage(JSON.stringify([filename, args || null]));
            return worker;
        }
    }
    go.createWorker = go.fork = go.spawn;

}());


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
	*/