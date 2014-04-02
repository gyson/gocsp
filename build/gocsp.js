
;(function goScript () {

    go.isNode = !!(typeof module !== "undefined" && module.exports);

    // set global variable
    (go.isNode ? global : window).go = go;

    // get script in String
    go.script = {
        // go core scirpt
        go: ";(" + goScript.toString() + "());",
        
        // merge all go components together
        get all () {
            // get go
            // get util
            // get module
            // get web
            return go.script.go
                + (go.script.util   || "")
                + (go.script.module || "")
                + (go.script.web    || "");
        }
    };

    //go.error = {};

    function go (g, safe) {
        // if is not generator object
        if (Object.prototype.toString.call(g) !== "[object Generator]") {
            // if it's generator function
            if (g && g.constructor && g.constructor.name === 'GeneratorFunction') g = g();
            else throw new Error("go() only accept generator object / function!"); 
        }

        var ret = g.ret = new Channel();

        g.isSafe = safe ? true : false;
        
        handle(g, "next", undefined);

        return ret;
    }


    go.safe = function (g) { return go(g, true); };

    // go.yield(new Channel, function (err, obj) { });
    go.yield = function (ch, cb) {
        // if ok 
        // put cb into channel store
        if (ch.length <= 0) {
            if (ch.isClosed) {
                cb(ch.closedMessage);
            } else {
                // push generator
                ch._store[ch.offset + ch.length] = cb;
                ch.length -= 1;
            }
            return;
        }

        var hasError = ch.offset in ch._error;

        var collection = hasError ? ch._error : ch._store;
        
        var item = collection[ch.offset];
        delete collection[ch.offset];

        ch.length -= 1;
        ch.offset += 1;

        if (hasError) {
            cb(item);
        } else {
            cb(null, item);
        }
    };

    function handle (g, action, item) {
        var result, ch, hasError, collection;

        // if g is cb
        // do it once
        if (typeof g === "function") {
            return action === "next" ? g(null, item) : g(item);
        }

        while (true) {
            if (g.isSafe) {
                try {
                    result = g[action](item);
                } catch (err) {
                    g.ret.throw(err);
                    break;
                }
            } else {
                result = g[action](item);
            }
            
            if (result.done) {
                g.ret.put(result.value);
                break;
            }

            ch = result.value;

            if (! (ch instanceof Channel) ) throw new Error("Can only yield Channel type!");

            if (ch.length <= 0) {
                if (ch.isClosed) {
                    action = "throw";
                    item = ch.closedMessage;
                    continue;
                } else {
                    // push generator
                    ch._store[ch.offset + ch.length] = g;
                    ch.length -= 1;
                    break;
                }
            }

            hasError = ch.offset in ch._error;

            collection = hasError ? ch._error : ch._store;
            
            item = collection[ch.offset];
            delete collection[ch.offset];

            ch.length -= 1;
            ch.offset += 1;

            action = hasError ? "throw" : "next";
        }
    };

    function Channel () {
        this.length = 0;
        this.offset = 0;
        this._store = {}; // store generators and items to put
        this._error = {}; // store error to throw
        this.isClosed = false;
    }
    go.Channel = Channel;

    // put item to the end of the queue
    Channel.prototype.put = function (item) {

        if (this.isClosed) throw new Error("channel is closed.");

        if (this.length < 0) {

            handle(this.take(), "next", item);
            
        } else {
            this._store[this.offset + this.length] = item;
            this.length += 1;
        }
    };

    // put item to the front of the queue
    Channel.prototype.putFront = function (item) {
        if (this.length <= 0) {
            this.put(item);
        } else {
            this._store[this.offset - 1] = item;
            this.length += 1;
        }
    }

    Channel.prototype.throw = function (err) {

        if (this.isClosed) throw new Error("channel is closed.");

        if (this.length < 0) {

            handle(this.take(), "throw", err);

        } else {
            this._error[this.offset + this.length] = err;
            this.length += 1;
        }
    };

    // disable to put / throw item into channel
    // only be able to take item out
    // throw error if yield a closed channel with length == 0
    // closed message
    Channel.prototype.close = function (info) {

        if (this.isClosed) return;

        this.isClosed = true;
        
        this.closedMessage = new Error("Channel is closed");
        this.closedMessage.info = info;

        // throw error to all waiting generator object
        while (this.length < 0) {
            handle(this.take(), "throw", this.closedMessage);
        }
    };

    // take a generator / cb from channel
    // assume this.length < 0
    Channel.prototype.take = function () {

        if (this.length >= 0) throw new Error("no generator to take");
        
        var g = this._store[this.offset];
        delete this._store[this.offset];

        this.length += 1;
        this.offset -= 1;

        return g;
    };


}());


(function utilScript () {

    // var go = window.go || {};
    // var go = global.go || {};
    // module.exports = go

    console.assert(typeof go !== "undefined");

    go.isWorker = go.isNode ? !!process.send : window.document === undefined;

    go.script.util = ";(" + utilScript.toString() + "());";

    go.assert = function (bool, message) {
        if (!bool) throw new Error(message);
    };


    // from underscore
    go.isObject = function (obj) { 
        return obj === Object(obj);
    };

    ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'].forEach(function(name) {
        var toString = Object.prototype.toString;
        var typeName = '[object ' + name + ']';
        go['is' + name] = function(obj) {
            return toString.call(obj) === typeName;
        };
    });

    go.supportGenerator = (function () {
        // try eval generator and yield

    }());


    go.delete = function (table, index) {
        var temp = table[index];
        delete table[index];
        return temp;
    };

    // return positive integer id
    go.insert = function (table, item) {
        while (true) {
            var id = Math.ceil(Math.random() * 1000000000000000);
            if (!(id in table)) {
                table[id] = item;
                return id;
            }
        }
    };

    // go.forever(function* () {

    //  var message = yield ws.message;

    //  throw // will break the loop

    // });

    // similar to as _.extend
    go.extend = function (obj) {
        var args = arguments;
        for (var i = 1; i < args.length; i++) {
            Object.keys(args[i]).forEach(function (prop) {
                obj[prop] = args[i][prop];
            });
        }
        return obj;
    };

    go.Events = function () {};

    go.extend(go.Events.prototype, {
        /* 
            // like once
            xxx.on("name", function self () {
                this.off("name", self);
                // do whatever you want ...
            });
        */
        on: function (name, listener) {
            if (typeof listener !== "function") {
                throw new Error("listener must be a function!");
            }
            this._events = this._events || {};
            this._events[name] = this._events[name] || [];
            this._events[name].push(listener)
            return this;
        },
        // events.off() - stop all
        // events.off("name") - stop all with name
        // events.off("name", oneListener) - stop one with name
        off: function (name, listener) {
            if (!this._events) return this;
            if (arguments.length === 0) {
                this._events = {};
            } else if (arguments.length === 1) {
                delete this._events[name]; // remove the event
            } else {
                var list = this._events && this._events[name];
                if (list === undefined) return this;
                for (var i = 0; i < list.length; i++) {
                    if (list[i] === listener) {
                        list.splice(i, 1); // remove that listener
                        break;
                    }
                };
            }
            return this;
        },
        // Returns number of listeners (0 if none)
        emit: function () {
            if (!this._events) return 0;
            var list = this._events[arguments[0]];
            if (list === undefined) return 0;
            for (var i = 1; i < arguments.length; i++) {
                arguments[i-1] = arguments[i];
            }
            arguments.length--;
            for (var i = 0; i < list.length; i++) {
                list[i].apply(this, arguments);
            }
            return list.length;
        }
    });

    // make go event...
    go.extend(go, go.Events.prototype);

    // go.loop(function* () {

    //     var message = yield ws.message;

    //     throw; // will break the loop
    //     return go.break;
    //     return go.continue;

    // });

    // go.forEach(ws.message, function (message) {

    // });

    // go.isChannel()
    // go.isArray()
    // go.isObject()
    // x could be array, object, channel
    /*
    go.each(x, function (value, key, array) {

        // return go.continue
        // return go.break

    });
    // iterate untill channel closed
    var ch = new go.Channel();
    go.each(ch, function (value, index, channel) {
    
    });
    go.forEach(arr, function* () {
        yield 
    });
    yield go.map(files, function* (file) {
        return yield fs.readFile(file)
    });
    go.every
    go.some
    */

    // go.break = {};
    // go.continue = undefined;

    // // go.forEach = go.each
    // go.each = function (obj, func, ctx) {
    //     if (!obj) return;
    //     if (Array.isArray(obj)) {
    //         for (var i = 0, len = obj.length; i < len; i++) {
    //             if (func.call(ctx, obj[i], i, obj) === go.break) return;
    //         }
    //     } else if (obj instanceof go.Channel) {
    //         go.safe(function* () {
    //             var index = 0;
    //             while (true) {
    //                 var value = yield obj;
    //                 if (func.call(ctx, value, index, obj) === go.break) return;
    //             }
    //         });
    //     } else {
    //         var keys = Object.keys(obj);
    //         for (var i = 0, len = keys.length; i < len; i++) {
    //             if (func.call(ctx, obj[keys[i]], keys[i], obj) === go.break) return;
    //         }
    //     } 
    // };

    /*
    go.loop(function () {
    
    });
    go.loop(function* () {
        yield go.Channel
        return go.break;
    });
    */
    // go.loop = function (func, ctx) {
    //     while ()

    // };

    /*

    result = yield wait(1000, chan)

    [result, timeout] = yield wait(1000, join([
        fs.readFile("xxx"),
        fs.readFile("aaa")
    ]))

    */

    // go.wait = function (timeout, ch) {
    //     if (!isChannel(ch)) {
    //         throw new Error("wait() only wait Channel object");
    //     }

    //     var ret = new Channel();

    //     // no need to wait, get it now.
    //     if (ch.length > 0) {
    //         ret.put([ch.take(), false]);
    //         return ret;
    //     }

    //     var isTimeout = false;

    //     var timeoutId = setTimeout(function () {
    //         isTimeout = true;
    //         ret.put([undefined, true]); // time out
    //     }, timeout);
        
    //     // go.safe
    //     go(function* () {
    //         var item = yield ch;
    //         if (isTimeout) {
    //             ch.putFront(item);
    //         } else {
    //             clearTimeout(timeoutId);
    //             ret.put([item, false]); // not timeout
    //             // return [item, false]; 
    //         }
    //         // return item
    //     });

    //     return ret;
    // }

    /*
        yield sleep(time_to_sleep)
    */

    go.sleep = function (timeout) {
        var ret = new go.Channel();
        
        setTimeout(function () {
            ret.put(undefined);
        }, timeout);
        
        return ret;
    }

    /*
        [value, index] = yield select([
            chan1,
            chan2
        ])

        [value, index] = yield select({
            "channel 1": chan1,
            "channel 2": chan2
        })
    */

    // go.select = function (channels) {

    //     var ret = new Channel();

    //     for (var index in channels) {
    //         var ch = channels[index];

    //         if (!isChannel(ch)) {
    //             throw new Error("select() only handle Channel type!");
    //         }

    //         if (ch.length > 0) {
    //             ret.put([ch.take(), index]);
    //             return ret;
    //         }
    //     }

    //     var isSelected = false;

    //     var worker = function* (index) {
    //         var from = channels[index];
    //         var item = yield from;
    //         if (isSelected) {
    //             from.putFront(item);
    //         } else {
    //             isSelected = true;
    //             ret.put([item, index]);
    //         }
    //     }

    //     for (var index in channels) {
    //         go( worker(index) );
    //     }

    //     return ret;
    // }

    /*

    results = yield join([
        fs.readFile("xxx1"),
        fs.readFile("xxx2"),
        fs.writeFile("xxx3"),
        ...
    ])

    results = yield join({
        xxx1: fs.readFile("xxx1"),
        xxx2: fs.readFile("xxx2"),
        xxx3: fs.writeFile("xxx3"),
        ...
    });

    */

    // go.join = function (channels) {
    //     //var ret = new Channel();

    //     return go.safe(function* () {
    //         //try
    //         var objs = Array.isArray(channels) ? [] : {};

    //         for (var index in channels) {
    //             if (!isChannel(channels[index])) {
    //                 throw new Error("join() only handle generator object")
    //             }
    //             //try
    //             objs[index] = yield channels[index];
    //             // catch
    //         }
    //         ret.put(objs);
    //         //return objs;
    //         // catch // bind this to new Channel, ret.put or ret.set
    //         // throw { finish: objs, throw: err }
    //     });

    //     // return ret;
    //     // $export()
    // }
}());




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
        if (name.slice(0, 7) === "http://") {
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
(function webScript () {

    console.assert(typeof go !== "undefined");

    var isNode = go.isNode;

    go.script.web = ";(" + webScript.toString() + "());";

    // isNode
    // isBrowser
    // isMaster
    // isWorker

    go.WebSocket = isNode ? require("ws") : window.WebSocket;

    // new go.Socket("ws://localhost:8080", options) -- websocket
    // new go.Socket(cp)
    go.Socket = function (conn, options) {
        this._conn = conn;
        this._queue = [];
        this._channels = [];
        this.isReady = false;
        this.isClosed = false;

        this._request = new go.Events();
        this._message = new go.Events();

        this.setup(conn, options);
    };

    go.extend(go.Socket.prototype, go.Events.prototype, {
        // may used for reconnect
        setup: function (conn, options) {
            if (typeof conn === "string") {
                // websocket
                var url = conn; // ws://localhost:8080
                conn = new go.WebSocket(url, options);
                this.type = "WebSocket";
                setupWebSocket(this, conn);
            }
            else if (conn instanceof go.WebSocket) {
                this.type = "WebSocket";
                setupWebSocket(this, conn);
            }
            else if (!isNode && conn instanceof Worker) {
                this.type = "WebWorker";
                setupWebWorker(this, conn);
            } 
            else if (isNode && conn.pid) {
                this.type = "ChildProcess";
                setupChildProcess(this, conn);
            }
            else {
                throw new Error("Type is not supported.");
            }
        },
        send: function (arg) {
            var message = JSON.stringify(arg);
            if (this.isReady) {
                if (this.type === "WebWorker") {
                    this._conn.postMessage(message);
                } else {
                    this._conn.send(message);
                }
            } else {
                this._queue.push(message);
            }
        },
        onMessage: function (topic, handler) {
            this._message.on(topic, handler);
        },
        offMessage: function (topic, handler) {
            this._message.off(topic, handler);
        },
        onRequest: function (topic, handler) {
            this._request.on(topic, handler);
        },
        offRequest: function (topic, handler) {
            this._request.off(topic, handler);
        },
        sendMessage: function (topic, data) {
            this.send([0, topic, data]);
        },
        // go.yield(c.sendRequest(topic, data), function (err, reply) {});
        sendRequest: function (topic, data) {
            var chan = new go.Channel();
            if (this.isClosed) {
                chan.throw(new Error("Connection closed."));
            }
            var id = go.insert(this._channels, chan);
            this.send([id, topic, data]);
            return chan;
        },
        flush: function (arg) {
            for (var i in this._channels) {
                this._channels[i].throw(arg);
            }
            this._channels = {};
        },
        close: function () {
            this.isClosed = true;
            this.flush();
            if (go.isMaster && this.type === "WebWorker") {
                this._conn.terminate();
            } else {
                this._conn.close();
            }
        }
    });

    function handleMessage (self, message) {
        // [msg_id, info]
        var data = JSON.parse(message);
        var msg_id = data[0];
        // check if it's request, message or reply
        // msg_id > 0:  "request"
        // msg_id = 0:  "message"
        // msg_id < 0:  "reply"
        // [id, topic, data]
        if (msg_id > 0) {
            // [msg_id, info]
            // self._request.emit(topic, request, response)
            self._request.emit(data[1], data[2], function (arg) {
                sendMessage(self, JSON.stringify([-msg_id, arg]));
            });
        } else if (msg_id === 0) {
            self.emit(data[1], data[2]);
        } else {
            // it's reply: [msg_id, reply]
            msg_id = -msg_id;
            if (msg_id in self._channels) {
                // [msg_id, reply]
                go.delete(self._channels, msg_id).put(data[1]);
            } else {
                console.log("Unknown message:", data);
            }
        }
    };

    // ready, error, close
    function setupWebSocket (self, ws) {  

        self.isReady = ws.readyState === 1;

        ws.onopen = function () {
            self.isReady = true;
            for (var i = 0; i < self._queue.length; i++) {
                ws.send(self._queue[i]);
            }
            self._queue = [];
            self.emit("ready");
        };
        ws.onerror = function (event) {
            self.emit("error", event.data);
        };
        ws.onclose = function (code, reason) {
            self.isClosed = true;
            self.emit("close", {code: code, reason: reason});
        };
        ws.onmessage = function (event) {
            handleMessage(self, event.data);
        };
    };

    function setupChildProcess (self, child) {

        self.isReady = true;

    };

    // worker on master side
    // self   on worker side
    function setupWebWorker (self, worker) {

        self.isReady = true;

        worker.addEventListener("message", function (event) {
            handleMessage(self, event.data);
        });
    };

    // go.request
    /*
    options
      * url
      * method, default "get"
      * headers
      * body
    */
    if (isNode) {
        var parseUrl  = require("url").parse;
        var http = require("http");
        go.request = function (options) {
            if (go.isString(options)) {
                options = parseUrl(options);
            } else if (options.url) {
                var opt = parseUrl(options.url);
                for (var name in opt) {
                    options[name] = opt[name];
                }
            } else { 
                throw new Error("invalid url");
            }

            var ret = new go.Channel();
            
            /*
            response
              * headers
              * statusCode
              * text
            */
            // send nodejs http request
            var req = http.request(options, function (res) {
                var result = {};
                result.statusCode = res.statusCode;
                result.headers = res.headers;

                res.setEncoding("utf8");
                
                var data = [];
                res.on("data", function (chunk) {
                    data.push(chunk);
                });
                res.on("end", function () {
                    result.text = data.join("");
                    ret.put(result);
                })
            }).on("error", function (e) {
                ret.throw(e);
            });

            req.write(options.body || "");
            req.end();

            return ret;
        }
    } else {
        go.request = function (options) {
            if (go.isString(options)) options = { url: options };

            var xhr = new XMLHttpRequest();

            xhr.open(options.method || "get", options.url, true);
            for (var name in options.headers) {
                xhr.setRequestHeader(name, options.headers[name]);
            }
            xhr.send(options.body || null);
            
            var ret = new go.Channel();

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    ret.put({
                        statusCode: xhr.status,
                        text: xhr.responseText,
                        headers: parseHeaders(xhr)
                    });
                }
            };

            return ret;
        }
    }

    // from: https://github.com/substack/http-browserify/blob/master/lib/response.js
    function parseHeaders (res) {
        var lines = res.getAllResponseHeaders().split(/\r?\n/);
        var headers = {};
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line === '') continue;
            
            var m = line.match(/^([^:]+):\s*(.*)/);
            if (m) {
                var key = m[1].toLowerCase(), value = m[2];
                
                if (headers[key] !== undefined) {
                
                    if (Array.isArray(headers[key])) {
                        headers[key].push(value);
                    }
                    else {
                        headers[key] = [ headers[key], value ];
                    }
                }
                else {
                    headers[key] = value;
                }
            }
            else {
                headers[line] = true;
            }
        }
        return headers;
    }

}());

