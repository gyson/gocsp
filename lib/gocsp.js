
/****************** core part *********************/

function go (g) {
    
    if (isGeneratorFunction(g)) {
        g = g();
    } else if (!isGenerator(g)) {
        throw new Error("go() only accept generator object / function!");
    }

    var ret = g.ret = new Channel();
    
    handle(g, "next", undefined);

    return ret;
}

go.safe = function (g) {
    if (isGeneratorFunction(g)) g = g();
    g.isSafe = true;
    return go(g);
};

function handle (g, action, item) {
    var result, ch, hasError, collection;

    while (true) {

        if (g.isSafe) {
            try {
                result = g[action](item);
            } catch (err) {
                g.ret.throw(err);
                break;
            }
        } else {
            result = g[action](item);
        }
        
        if (result.done) {
            g.ret.put(result.value);
            break;
        }

        ch = result.value;

        if (!isChannel(ch)) {
            throw new Error("Can only accept Channel type!");
        }

        if (ch.length <= 0) {
            // push generator
            ch._store[ch.offset + ch.length] = g;
            ch.length -= 1;
            break;
        }

        hasError = ch.offset in ch._error;

        collection = hasError ? ch._error : ch._store;
        
        item = collection[ch.offset];
        delete collection[ch.offset];

        ch.length -= 1;
        ch.offset += 1;

        action = hasError ? "throw" : "next";
    }
}

function Channel () {
    this.length = 0;
    this.offset = 0;
    this._store = {}; // store generators and items to put
    this._error = {}; // store error to throw
}
go.Channel = Channel;

// put item to the end of the queue
Channel.prototype.put = function (item) {
    if (this.length < 0) {
        
        var g = this._store[this.offset];
        delete this._store[this.offset];

        this.length += 1;
        this.offset -= 1;

        handle(g, "next", item);
        
    } else {
        this._store[this.offset + this.length] = item;
        this.length += 1;
    }
}

// put item to the front of the queue
// Channel.prototype.putFront = function (item) {
//     if (this.length <= 0) {
//         this.put(item);
//     } else {
//         this._store[this.offset - 1] = item;
//         this.length += 1;
//     }   
// }

Channel.prototype.throw = function (err) {
    if (this.length < 0) {

        var g = this._store[this.offset];
        delete this._store[this.offset];

        this.length += 1;
        this.offset -= 1;

        handle(g, "throw", err);

    } else {
        this._error[this.offset + this.length] = err;
        this.length += 1;
    }
}

function isGenerator (obj) {
    return Object.prototype.toString.call(obj) === "[object Generator]";
}

function isGeneratorFunction (obj) {
    return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}

function isChannel (obj) {
    return obj instanceof Channel;
}
go.isChannel = isChannel;

/****************** util functions ***********************/

/*
util.js: sleep, wait, select, join
web.js: connect, get, request
fm.js: readFile, writeFile ...
module.js: require, define, load
    $require
    $fork
    __filename
    __dirname
*/

/*

result = yield wait(1000, chan)

[result, timeout] = yield wait(1000, join([
    fs.readFile("xxx"),
    fs.readFile("aaa")
]))

*/

// go.wait = function (timeout, ch) {
//     if (!isChannel(ch)) {
//         throw new Error("wait() only wait Channel object");
//     }

//     var ret = new Channel();

//     // no need to wait, get it now.
//     if (ch.length > 0) {
//         ret.put([ch.take(), false]);
//         return ret;
//     }

//     var isTimeout = false;

//     var timeoutId = setTimeout(function () {
//         isTimeout = true;
//         ret.put([undefined, true]); // time out
//     }, timeout);
    
//     // go.safe
//     go(function* () {
//         var item = yield ch;
//         if (isTimeout) {
//             ch.putFront(item);
//         } else {
//             clearTimeout(timeoutId);
//             ret.put([item, false]); // not timeout
//             // return [item, false]; 
//         }
//         // return item
//     });

//     return ret;
// }

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

// go.select = function (channels) {

//     var ret = new Channel();

//     for (var index in channels) {
//         var ch = channels[index];

//         if (!isChannel(ch)) {
//             throw new Error("select() only handle Channel type!");
//         }

//         if (ch.length > 0) {
//             ret.put([ch.take(), index]);
//             return ret;
//         }
//     }

//     var isSelected = false;

//     var worker = function* (index) {
//         var from = channels[index];
//         var item = yield from;
//         if (isSelected) {
//             from.putFront(item);
//         } else {
//             isSelected = true;
//             ret.put([item, index]);
//         }
//     }

//     for (var index in channels) {
//         go( worker(index) );
//     }

//     return ret;
// }

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
});

*/

// go.join = function (channels) {
//     //var ret = new Channel();

//     return go.safe(function* () {
//         //try
//         var objs = Array.isArray(channels) ? [] : {};

//         for (var index in channels) {
//             if (!isChannel(channels[index])) {
//                 throw new Error("join() only handle generator object")
//             }
//             //try
//             objs[index] = yield channels[index];
//             // catch
//         }
//         ret.put(objs);
//         //return objs;
//         // catch // bind this to new Channel, ret.put or ret.set
//         // throw { finish: objs, throw: err }
//     });

//     // return ret;
//     // $export()
// }


// go.connect

// go.request
// go.get




module.exports = go;

