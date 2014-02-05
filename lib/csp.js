
/****************** core part *********************/

function handle(generator, ch) {
    do {
        if (!isChannel(ch)) {
            throw new Error("Can only yield Channel type!");
        }

        if (ch.length <= 0) {
            // push generator
            ch[ch.offset + ch.length] = generator;
            ch.length -= 1;
            break;
        }
        var result = generator.next(shiftItem(ch));
        ch = result.value;
    } while (!result.done);
}

// shift item from a channel, assume channel.length > 0
function shiftItem (channel) {
    var item = channel[channel.offset];
    delete channel[channel.offset];
    channel.length -= 1;
    channel.offset += 1;
    return item;
}

function spawn(generator) {
    if (isGeneratorFunction(generator)) {
        generator = generator();
    } else if (!isGenerator(generator)) {
        throw new Error("spawn() only handle generator object or function!");
    } 

    var result = generator.next();
    if (!result.done) handle(generator, result.value);
}

function Channel() {
    this.length = 0;
    this.offset = 0;
};

// send item to the end of the queue
Channel.prototype.send = function (item) {
    if (this.length < 0) {
        // shift generator
        var generator = this[this.offset];
        delete this[this.offset];
        this.length += 1;
        this.offset -= 1;

        var result = generator.next(item);
        if (!result.done) handle(generator, result.value);
    } else {
        this[this.offset + this.length] = item;
        this.length += 1;
    }
}

// send item to the front of the queue
Channel.prototype.sendFront = function (item) {
    if (this.length <= 0) {
        this.send(item);
    } else {
        this[this.offset - 1] = item;
        this.length += 1;
    }
}

function isGenerator(obj) {
    return Object.prototype.toString.call(obj) === "[object Generator]";
}

function isGeneratorFunction(obj) {
    return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}

function isChannel(obj) {
    return obj instanceof Channel;
}

/****************** util functions ***********************/

/*

result = yield wait(1000, chan)

[result, timeout] = yield wait(1000, parallel([
    fs.readFile("xxx"),
    fs.readFile("aaa")
]))

*/

function wait(timeout, channel) {
    if (!isChannel(channel)) {
        throw new Error("wait() only wait Channel object");
    }

    var ret = new Channel();
    var isTimeout = false;

    var timeoutId = setTimeout(function() {
        isTimeout = true;
        chan.send([null, isTimeout]);
    }, timeout);
    
    spawn(function* () {
        var item = yield channel;

        if (isTimeout) {
            channel.sendFront(item)
        } else {
            clearTimeout(timeoutId);
            ret.send([item, isTimeout])
        }
    });

    return ret;
}

/*
    yield sleep(time_to_sleep)
*/

function sleep(timeout) {
    var ret = new Channel();
    
    setTimeout(function () {
        ret.send(null);
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

function select(channels) {

    var ret = new Channel();

    for (var index in channels) {
        var ch = channels[index];

        if (!isChannel(ch)) {
            throw new Error("select() only handle Channel type!");
        }

        if (ch.length > 0) {
            ret.send([shiftItem(ch), index]);
            return ret;
        }
    }

    ret.selected = false;

    for (var index in channels) {
        spawn( select_helper(channel[index], index, ret) );
    }

    return ret;
}

function* select_helper(from, index, ret) {
    var item = yield from;

    if (ret.selected) {
        from.sendFront(item);
    } else {
        ret.selected = true;
        ret.send([item, index]);
    }
}

/*

results = yield parallel(
    fs.readFile("xxx1"),
    fs.readFile("xxx2"),
    fs.writeFile("xxx3"),
    ...
);

*/

function parallel() {
    var ret = new Channel();

    spawn( parallel_helper(arguments, ret) );

    return ret;
}

function* parallel_helper(channels, ret) {
    var objs = [];
    for (var i = 0; i < channels.length; i++) {        
        if (!isChannel(channels[i])) {
            throw new Error("parallel() only handle Task / generator object")
        }
        objs.push(yield channels[i]);
    }
    chan.send(objs);
}

module.exports = {
    spawn:    spawn,
    Channel:  Channel,

    wait:     wait,
    sleep:    sleep,
    select:   select,
    parallel: parallel
}


