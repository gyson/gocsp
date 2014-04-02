
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
                    //console.log(chunk);
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

