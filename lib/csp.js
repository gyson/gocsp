
/*
    push item:
        ch[ch.offset + ch.length] = item
        ch.length += 1

    shift item:
        var item = ch[ch.offset];
        delete ch[ch.offset];
        ch.length -= 1;
        ch.offset += 1;

    push generator:
        ch[ch.offset + ch.length] = generator;
        ch.length -= 1;

    shift generator:
        var generator = ch[ch.offset];
        delete ch[ch.offset];
        ch.length += 1;
        ch.offset -= 1;
*/

/****************** core part *********************/

// using core_2.js now

function handle(generator, ch) {

    do {
        if (!isChannel(ch)) {
           throw new Error("In csp, you can only yield Channel type");
        } 

        if (ch.length <= 0) {
            // push generator
            ch[ch.offset + ch.length] = generator;
            ch.length -= 1;
            break;
        }

        // shift items
        var item = ch[ch.offset];
        delete ch[ch.offset];
        ch.length -= 1;
        ch.offset += 1;

        var result = generator.next(item);

        ch = result.value;
    
    } while (!result.done);
}

function spawn(generator) {

    if (isGeneratorFunction(generator)) {

        generator = generator();
    
    } else if (!isGenerator(generator)) {
    
        throw new Error("spawn() only handle generator object!");
    
    } 

    var result = generator.next();

    if (!result.done) handle(generator, result.value);
}

function Channel() {
    this.length = 0;
    this.offset = 0;
};

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
    yield* sleep(time_to_sleep)
*/

function* sleep(timeout) {
    var chan = new Channel();
    
    setTimeout(function () {
        chan.send(null);
    }, timeout);
    
    return yield chan;
}

/*

// accept an array, return an original array
results = yield* parallel([
    fs.readFile("xxx1"),
    fs.readFile("xxx2"),
    fs.writeFile("xxx3"),
    ...    
]);

// accept an object, return an original object
results = yield* parallel({
    f1: fs.readFile("f1.txt"),
    f2: fs.readFile("f2.txt"),
    f3: fs.readFile("f3.txt")
})

*/

function* parallel_helper(generators, index, chan) {

    generators[index] = yield* generators[index];

    chan.send(null);
}

function* parallel(generators) {

    var chan = new Channel();
    var wait = 0;

    for (var index in generators) {

        if (!isGenerator(generators[index])) {
            throw new Error("parallel() only handle Task / generator object");
        }

        wait += 1;
        spawn( parallel_helper(generators, index, chan) );
    }

    while (wait > 0) {
        wait -= 1;
        yield chan; 
    }

    return generators;
}

/*

result = yield* wait(1000, chan.take())

result = yield* wait(1000, parallel([
    fs.readFile("xxx"),
    fs.readFile("aaa")
]))

*/

function* wait_helper(generator, chan) {

    chan.send({ timeout: false, value: yield* generator });
}

function* wait(timeout, generator) {

    if (!isGenerator(generator)) {
        throw new Error("wait() only handle generator object");
    }

    var chan = new Channel();

    setTimeout(function() {
        chan.send({ timeout: true, channel: chan })
    }, timeout);
    
    spawn( wait_helper(generator, chan) );

    return yield chan;
}

/*
    ret = yield* select([
        chan1,
        chan2
    ])

    ret = yield* select({
        "channel 1": chan1,
        "channel 2": chan2
    })
*/

function* select_helper(from, index, to) {

    var item = yield from;

    if (to.selected) {

        if (from.length < 0) {
            
            // shift generator
            var generator = from[from.offset];
            delete from[from.offset];
            from.length += 1;
            from.offset -= 1;

            var result = generator.next(item);
            if (!result.done) handle(generator, result.value);   
        
        } else {
            // unshift item
            if (from.length > 0) from.offset -= 1;

            from[from.offset] = item;
            from.length += 1;
        }

    } else {
        to.selected = true;
        to.send({ index: index, value: item });
    }
}

function* select(channels) {

    for (var index in channels) {

        var ch = channels[index];

        if (!isChannel(ch)) {
            throw new Error("select() only handle Channel type");
        }

        if (ch.length > 0) {

            // shift item
            var item = ch[ch.offset];
            delete ch[ch.offset];
            ch.length -= 1;
            ch.offset += 1;

            return { index: index, value: item };
        }
    }

    var chan = new Channel();
    chan.selected = false;

    for (var index in channels) {
        spawn( select_helper(channel[index], index, chan) );
    }

    return yield chan;
}

module.exports = {
    spawn:   spawn,
    Channel: Channel,

    wait:     wait,
    sleep:    sleep,
    select:   select,
    parallel: parallel
}


