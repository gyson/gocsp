/*
    yield* sleep(time_to_sleep)
    
    yield* fs.readFile(...)
    yield* fs.writeFile(...)
    yield* fs.appendFile(...)
    yield* fs.exists(...)
*/

var Channel = require("./csp.js").Channel;

function* sleep(timeout) {
    var ch = new Channel();
    
    setTimeout(function () {
        ch.send(null);
    }, timeout);
    
    return yield* ch.take();
}


var fs = {
    readFile: function* (filename, options) {
        var ch = new Channel();
        require("fs").readFile(filename, options, function (err, data) {
            if (err) throw err;
            ch.send(data);
        });
        return yield* ch.take();
    },

    writeFile: function* (filename, data, options) {
        var ch = new Channel();
        require("fs").writeFile(filename, data, options, function (err) {
            if (err) throw err;
            ch.send(null);
        })
        return yield* ch.take();
    },
    
    appendFile: function* (filename, data, options) {
        var ch = new Channel();
        require("fs").appendFile(filename, data, options, function (err) {
            if (err) throw err;
            ch.send(null);
        })
        return yield* ch.take();
    },
    
    exists: function* (path) {
        var ch = new Channel();
        require("fs").exists(path, function (exists) {
            ch.send(exists);
        })
        return yield* ch.take();
    }
}

module.exports = {
	fs:    fs,
	sleep: sleep
}


