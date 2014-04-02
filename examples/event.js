
var go = require("gocsp");

var evt = new go.Events();

evt.on("okk", function (msg) {
	console.log(msg)
});

evt.emit("okk", "ddd");

