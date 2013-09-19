var csp = require("../src/csp.js");

var spawn  = csp.spawn
  ,	send   = csp.send
  , take   = csp.take
  , select = csp.select
  , sleep  = csp.sleep;


function* ok_to_sleep(i, to_print) {
	var sum = 0;
	while (true) {
		console.log(to_print, sum++);
		yield sleep(i * 1000);	
	}
}

spawn( ok_to_sleep(1, "***") );
spawn( ok_to_sleep(2, "*********") );
spawn( ok_to_sleep(4, "***************") );

