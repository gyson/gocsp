/* 
    spawn(generator_iterator)

    Channel.send(object)

    yield* Channel.take(object)


    // util functions API

    yield* sleep(time_to_sleep)
    
    yield* fs.readFile(...)
    yield* fs.writeFile(...)
    yield* fs.appendFile(...)
    yield* fs.exists(...)
*/

// Goroutine and CSP Channel

function handle(genIterator, result) {

    while (!result.done) {
        var chan = result.value;

        if (chan.storage.length <= 0) {
            chan.waiting.push(genIterator);
            break;
        }
        result = genIterator.next(chan.storage.shift());
    }
}

function spawn(genIterator) { handle(genIterator, genIterator.next()); }

function Channel() {
    this.storage = [];
    this.waiting = [];
}

Channel.prototype.send = function (obj) {
    this.storage.push(obj);
    
    if (this.waiting.length > 0) {
        handle(this.waiting.shift(), { value: this, done: false });
    }
}

Channel.prototype.take = function* () {

    return this.storage.length > 0 ? this.storage.shift() : yield this;
}



// Util functions based on CSP

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
    fs:      fs,
    sleep:   sleep,
    spawn:   spawn,
    Channel: Channel
}

