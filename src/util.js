/*
    yield* sleep(time_to_sleep)
    
    yield* fs.readFile(...)
    yield* fs.writeFile(...)
    yield* fs.appendFile(...)
    yield* fs.exists(...)
*/

var Channel = require("./csp.js").Channel;
var spawn   = require("./csp.js").spawn;

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


function* parallelHelper(gen, chan, i) {
    chan.send({ value: yield* gen, index: i });
}

/*

results = yield* parallel([
    fs.readFile("xxx1"),
    fs.readFile("xxx2"),
    fs.writeFile("xxx3"),
    ...    
]);

*/

function* parallel(genIters) {

    var chan = new Channel();

    for (var i = 0; i < genIters.length; i++) {
        spawn( parallelHelper(genIters[i], chan, i) );
    }

    var retval = [];

    for (var i = 0; i < genIters.length; i++) {
        var ret = yield* chan.take();
        retval[ret.index] = ret.value;
    }

    return retval;
}

/*

result = yield* wait(1000, chan.take())

result = yield* wait(1000, parallel([
    fs.readFile("xxx"),
    fs.readFile("aaa")
]))

*/

function* waitHelper(action, channel) {
    channel.send(yield* action);
}

function* wait(timeout, action) {
    var chan = new Channel();
    
    setTimeout(function() {
        chan.send(null)
    }, timeout);
    
    spawn( execute(action, chan) );

    return yield* chan.take();
}

function* selectHelper(from, to) {

    var item = yield* from.take();

    if (to.selected) {
        from.untake(item);        
    } else {
        to.selected = true;
        to.send(item);
    }
}

function* select(channels) {
    var chan = new Channel();

    chan.selected = false;

    for (var i = 0; i < channels.length; i++) {
        spawn( selectHelper(channels[i], chan) )
    }

    return yield* chan.take();
}

module.exports = {
    fs:       fs,
    wait:     wait,
    sleep:    sleep,
    select:   select,
    parallel: parallel
}


