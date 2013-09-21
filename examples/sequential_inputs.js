var csp = require("../src/csp.js");

var spawn  = csp.spawn
  , send   = csp.send
  , take   = csp.take
  , select = csp.select
  , sleep  = csp.sleep;


var chan = "I am a channel anyway.";

function* sequence_test() {
	
	var sequence = [3, 1, 4, 6, 8];
	
	var i = 0;
	while (i < sequence.length) {

		var input = yield take(chan);

		if (input == sequence[i]) {
			i++;
			console.log("right!");
		} else {
			console.log("wrong!");
		}

	}
	console.log("done!!!");
}

spawn( sequence_test() );

process.openStdin().addListener("data", function(d) {

	send(chan, parseInt(d));

});