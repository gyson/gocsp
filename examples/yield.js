

var go = require("gocsp");

var ch = new go.Channel();

var cb = function (err, obj) {
	console.log(err ? ("err: " + err) : ("obj: " + obj));
};

go.yield(ch, cb);

ch.put("hello");

ch.throw("llll");

go.yield(ch, cb);

["define", 'load', 'require'].forEach(function (method) {
	go.on(method, function (filename) {
		console.log(method, filename);
	})
});

go.define("/xxx.js", "console.log('hhhhhh'); return 'from xxx.js'");

go.yield(go.require("/xxx.js"), cb);

go.yield(go.require("/xxx.js"), cb);

go.yield(go.load("/xxx.js"), cb);

