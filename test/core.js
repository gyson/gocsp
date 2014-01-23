
var assert = require("assert");

var csp = require("../lib/csp.js");

var spawn   = csp.spawn;
var Channel = csp.Channel;

var chan = new Channel();

var shared = "shared 0";

spawn(function* () {

	var item = "item 0";

	chan.send(item);

	assert(chan.length == 1);

	console.log("item: " + (yield chan));

	console.log("shared: " + (yield chan));

	yield chan;

}())

spawn(function* () {

	chan.send(shared);

	console.log(chan.length);

}())

