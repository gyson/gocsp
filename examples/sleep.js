
var sleep = require("../src/util.js").sleep;
var spawn = require("../src/csp.js").spawn;

spawn(function*() {
    for (var i = 0; i < 10; i++) {
        yield* sleep(1000);
        console.log(i);
    }
}());


