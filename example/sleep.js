
var sleep = require("../lib/csp.js").sleep;
var spawn = require("../lib/csp.js").spawn;



function* go_sleep(name) {
    for (var i = 0; i < 20; i++) {
        yield* sleep(1000);
        console.log(name + ": " + i);
    }
}

spawn( go_sleep("A") )

spawn( go_sleep("B") )

