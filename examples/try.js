
var go = require("gocsp");

var ch = new go.Channel();
try {
	go.safe(function* () {
		yield ch;
	});

} catch (e) {

	console.log("catch: ", e)
}


ch.throw("kkkkkk");
