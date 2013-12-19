
// let { sleep, spawn } = require("../src/csp.js")

var csp = require("../src/csp.js");

var sleep = csp.sleep;
var spawn = csp.spawn;

spawn(function*() {
    for (var i = 0; i < 20; i++) {
        yield* sleep(1000);
        console.log(i);
    }
}());
