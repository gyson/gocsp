
var spawn   = require("../lib/csp.js").spawn
var Channel = require("../lib/csp.js").Channel;


var chan = new Channel();

function* sequence_test() {
    
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
}

spawn( sequence_test() );

process.openStdin().addListener("data", function(d) {

    chan.send(parseInt(d));

});

