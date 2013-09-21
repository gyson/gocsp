var csp = require("../src/csp.js");

var spawn  = csp.spawn
  , send   = csp.send
  , take   = csp.take
  , select = csp.select
  , sleep  = csp.sleep;

var chans = [0, 1, 3.14, "e", "hello"];

function* select_from_channels() {
	while(true) {
		console.log("get: ", yield select(chans));
	}
}

spawn( select_from_channels() );

for (var i = 0; i < chans.length; i++) {

	send(chans[i], i);

}
