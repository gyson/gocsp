
/****************** core part *********************/

// handle err ?
/*

    go(function*() {
    
    }, function (err) {
        // handle error here
    })

*/

function go(g, errorHandler) {
    
    if (isGeneratorFunction(g)) {
        g = g();
    } else if (!isGenerator(g)) {
        throw new Error("go() only handle generator object / function!");
    }

    var ch = new Channel();
    var result = g.next();

    g.putResult = function (finalResult) {
        ch.put(finalResult);
    }
    
    handle(g, result);
    
    return ch;
}

function handle(g, result) {
    while (true) {
        
        if (result.done) {
            g.putResult(result.value);
            break;
        }

        var ch = result.value;

        if (!isChannel(ch)) {
            throw new Error("Can only yield Channel type!");
        }

        if (ch.length <= 0) {
            // push generator
            ch.store[ch.offset + ch.length] = g;
            ch.length -= 1;
            break;
        }

        result = g.next(ch.take());
    }
}

go.Channel = function Channel() {
    this.length = 0;
    this.offset = 0;
    this.store = {};
}

// put item to the end of the queue
Channel.prototype.put = function (item) {
    if (this.length < 0) {
        
        var g = this.takeGenerator();

        handle(g, g.next(item));
        
    } else {
        this.store[this.offset + this.length] = item;
        this.length += 1;
    }
}

// put item to the front of the queue
Channel.prototype.putFront = function (item) {
    if (this.length <= 0) {
        this.put(item);
    } else {
        this.store[this.offset - 1] = item;
        this.length += 1;
    }   
}

Channel.prototype.take = function () {
    
    if (this.length <= 0) throw new Error("no item to take");

    var item = this.store[this.offset];
    delete this.store[this.offset];

    this.length -= 1;
    this.offset += 1;

    return item;
}

Channel.prototype.takeGenerator = function () {

    if (this.length >= 0) throw new Error("no generator to take");

    var g = this.store[this.offset];
    delete this.store[this.offset];

    this.length += 1;
    this.offset -= 1;

    return g;
}

function isGenerator(obj) {
    return Object.prototype.toString.call(obj) === "[object Generator]";
}

function isGeneratorFunction(obj) {
    return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}

go.isChannel = function isChannel(obj) {
    return obj instanceof Channel;
}

/****************** util functions ***********************/

/*

result = yield wait(1000, chan)

[result, timeout] = yield wait(1000, join([
    fs.readFile("xxx"),
    fs.readFile("aaa")
]))

*/

go.wait = function (timeout, ch) {
    if (!isChannel(ch)) {
        throw new Error("wait() only wait Channel object");
    }

    var ret = new Channel();

    // no need to wait, get it now.
    if (ch.length > 0) {
        ret.put([ch.take(), false]);
        return ret;
    }

    var isTimeout = false;

    var timeoutId = setTimeout(function() {
        isTimeout = true;
        ret.put([undefined, true]); // time out
    }, timeout);
    
    go(function*() {
        var item = yield ch;
        if (isTimeout) {
            ch.putFront(item);
        } else {
            clearTimeout(timeoutId);
            ret.put([item, false;]); // not timeout
        }
    });

    return ret;
}

/*
    yield sleep(time_to_sleep)
*/

go.sleep = function (timeout) {
    var ret = new Channel();
    
    setTimeout(function () {
        ret.put(undefined);
    }, timeout);
    
    return ret;
}

/*
    [value, index] = yield select([
        chan1,
        chan2
    ])

    [value, index] = yield select({
        "channel 1": chan1,
        "channel 2": chan2
    })
*/

go.select = function (channels) {

    var ret = new Channel();

    for (var index in channels) {
        var ch = channels[index];

        if (!isChannel(ch)) {
            throw new Error("select() only handle Channel type!");
        }

        if (ch.length > 0) {
            ret.put([ch.take(), index]);
            return ret;
        }
    }

    var isSelected = false;

    var worker = function* (index) {
        var from = channels[index];
        var item = yield from;
        if (isSelected) {
            from.putFront(item);
        } else {
            isSelected = true;
            ret.put([item, index]);
        }
    }

    for (var index in channels) {
        go( worker(index) );
    }

    return ret;
}

/*

results = yield join([
    fs.readFile("xxx1"),
    fs.readFile("xxx2"),
    fs.writeFile("xxx3"),
    ...
])

results = yield join({
    xxx1: fs.readFile("xxx1"),
    xxx2: fs.readFile("xxx2"),
    xxx3: fs.writeFile("xxx3"),
    ...
})

*/

go.join = function (channels) {
    var ret = new Channel();

    go(function*() {
        var objs = Array.isArray(channels) ? [] : {};

        for (var index in channels) {
            if (!isChannel(channels[index])) {
                throw new Error("join() only handle generator object")
            }
            objs[index] = yield channels[index];
        }
        ret.put(objs);
    });

    return ret;
}


module.exports = go;

