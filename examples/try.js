
var go = require("gocsp");



go(function* () {
	console.log(yield go.require("hello"));

	console.log(yield go.load("hello"));
})

go.define("hello", " return 'dddd' ");
