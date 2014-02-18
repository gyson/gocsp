
var assert = require("assert");

var go = require("../lib/gocsp.js");

var chan = new go.Channel();

var shared = "shared 0";

go(function* () {

	var item = "item 0";

	chan.put(item);

	assert(chan.length == 1);

	console.log("item: " + (yield chan));

	console.log("shared: " + (yield chan));

	yield chan;

});

go(function* () {

	chan.put(shared);

	console.log(chan.length);

});

