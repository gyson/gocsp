
var go = require("../lib/csp.js");

var chan = new go.Channel();

go(function* () {
    
    var sequence = [3, 1, 4, 6, 8];
    
    var i = 0;
    while (i < sequence.length) {

        var input = yield chan;

        if (input == sequence[i]) {
            i++;
            console.log("right!");
        } else {
            console.log("wrong!");
        }

    }
    console.log("done!!!");
});

process.openStdin().addListener("data", function(d) {

    chan.put(parseInt(d));

});


