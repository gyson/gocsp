
var go = require("../lib/csp.js");

function* go_sleep(name) {
    for (var i = 0; i < 20; i++) {
        yield go.sleep(1000);
        console.log(name + ": " + i);
    }
}

go( go_sleep("A") )

go( go_sleep("B") )

