
/****************** core part *********************/

function handle(generator, result) {
    while (true) {
        
        if (result.done) {
            generator.return(result.value);
            break;
        }

        var ch = result.value;

        if (!isChannel(ch)) {
            throw new Error("Can only yield Channel type!");
        }

        if (ch.length <= 0) {
            // push generator
            ch[ch.offset + ch.length] = generator;
            ch.length -= 1;
            break;
        }

        result = generator.next(shiftItem(ch));
    }
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
    var chan = new Channel();
    var result = generator.next();

    generator.return = function (value) {
        chan.send(value);
    }
    
    handle(generator, result);
    
    return chan;
}

function Channel() {
    this.length = 0;
    this.offset = 0;
};

// put item to the end of the queue
Channel.prototype.put = function (item) {
    if (this.length < 0) {
        // shift generator
        var generator = this[this.offset];
        delete this[this.offset];
        this.length += 1;
        this.offset -= 1;

        handle(generator, generator.next(item));
        
    } else {
        this[this.offset + this.length] = item;
        this.length += 1;
    }
}

// put item to the front of the queue
Channel.prototype.putFront = function (item) {
    if (this.length <= 0) {
        this.put(item);
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

[result, timeout] = yield wait(1000, join([
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
        chan.put([null, isTimeout]);
    }, timeout);
    
    spawn(function* () {
        var item = yield channel;

        if (isTimeout) {
            channel.putFront(item)
        } else {
            clearTimeout(timeoutId);
            ret.put([item, isTimeout])
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
        ret.put(null);
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
            ret.put([shiftItem(ch), index]);
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
        from.putFront(item);
    } else {
        ret.selected = true;
        ret.put([item, index]);
    }
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

// use 'join' ?
function join(channels) {
    var ret = new Channel();

    spawn( join_helper(channels, ret) );

    return ret;
}

function* join_helper(channels, ret) {
    var objs = Array.isArray(channels) ? [] : {};

    for (var index in channels) {        
        if (!isChannel(channels[index])) {
            throw new Error("join() only handle Task / generator object")
        }
        objs[index] = yield channels[index];
    }
    chan.put(objs);
}

module.exports = {
    spawn:   spawn,
    Channel: Channel,

    join:    join,
    wait:    wait,
    sleep:   sleep,
    select:  select
}


