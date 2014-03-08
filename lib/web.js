
(function webScript () {

	console.assert(typeof go !== "undefined");

	go.script.web = ";(" + webScript.toString() + "());";

	var isNode = go.isNode;

	var WebSocket = isNode ? require("ws") : WebSocket;

	    // for web
	    // for node
	    if (isNode) {
	        var http = require("http");
	        go.get = function (url) {
	            var chan = new Channel();
	            http.get(url, function (res) {
	                if (res.statusCode !== 200) chan.throw("Error code: " + res.statusCode);
	                res.setEncoding("utf8");
	                var data = [];
	                res.on("data", function (chunk) {
	                    data.push(chunk);
	                });
	                res.on("end", function () {
	                    chan.put(data.join(""));
	                })
	            })
	            return chan;
	        };

	        go.request = function (options) {}

	        // need ws://...
	    }    
	    var WebSocket = isNode ? require("ws") : WebSocket;
	    go.connect = function (url) {
	        // return socket
	        // socket.error
	        // socket.reconnect
	        // socket.send
	        // 
	    }


	go.connect = function (url, options) {
		
		var ret = new go.Channel();

        if (url.slice(0, 5) !== "ws://") url = "ws://" + url;

		var ws = new WebSocket(url, options);

		// ws.readyState
		// CONNECTING  0
		// OPEN        1
		// CLOSING     2
		// CLOSED      3

		ws.message = new go.Channel();
		
		ws.onopen = function () {
			ret.put(ws);
			ret.close();
		};

		ws.onmessage = function (event) {
			ws.message.put(event.data);
		};

		ws.onerror = function (event) {
			ret.throw(event);
			ret.close();
			ws.message.close(event);
		};

		ws.onclose = function (code, reason) {
			ws.message.close({ code: code, reason: reason });
		};

		return ret;
	}

	// go.request
	/*
	options
	  * url
	  * method, default "get"
	  * headers
	  * body
	*/
	if (isNode) {
		var util = require("util");
		var parseUrl  = require("url").parse;
		var http = require("http");
		go.request = function (options) {
			if (util.isString(options)) {
				options = parseUrl(options);
			} else if (options.url) {
				var opt = parseUrl(options.url);
				for (var name in opt) {
					options[name] = opt[name];
				}
			} else { 
				throw new Error("invalid url");
			}

			var ret = new Channel();
			
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
			if (typeof options === "string") options = { url: options };

			var xhr = new XMLHttpRequest();

			xhr.open(options.method || "get", options.url, true);
			for (var name in options.headers) {
				xhr.setRequestHeader(name, options.headers[name]);
			}
			xhr.send(options.body || null);
			
			var ret = new Channel();

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

