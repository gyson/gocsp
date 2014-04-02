
var go = require("gocsp");

go.on("load", function (name) {
	console.log("loading:", name);
});

go(function* () {
	console.log(yield go.require("/world.js"));

	//console.log(yield go.load("hello"));
});

go.define("/world.js", " console.log(yield $require('./hello.js')); return 'world' ");
go.define("/hello.js", "return 'hello, ';");



