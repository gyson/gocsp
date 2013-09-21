var csp = require("../src/csp.js");

var spawn  = csp.spawn
  , send   = csp.send
  , take   = csp.take
  , select = csp.select
  , sleep  = csp.sleep;

var chan_0 = "I am a channel";
var chan_1 = "I am a channel, too";

function* get() {
	while (true) {
		var x = yield select([chan_0, chan_1], 500);
	
		if (x == null) {
			console.log("timeout");
		} else {
			console.log("get: ", x);
		}
	}
}

function* put() {
	yield sleep(1000);
	send(chan_0, 123);
	
	yield sleep(2000);
	send(chan_1, 456);
}

spawn(get());
spawn(put());
