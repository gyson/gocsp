
var go = require("gocsp");

go.assert(go.resolve("http://gys.io/xxxx.js", "..") === "http://gys.io");

go(function* () {

	var mod = __dirname + "/sample.js";

	console.log(yield go.load(mod));

	console.log(yield go.require(mod));

	var json = __dirname + "/sample.json";

	console.log(yield go.load(json));

	console.log(yield go.require(json));
	
});

