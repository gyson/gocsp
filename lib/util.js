
(function utilScript () {

    // var go = window.go || {};
    // var go = global.go || {};
    // module.exports = go

    console.assert(typeof go !== "undefined");


    go.script.util = ";(" + utilScript.toString() + "());";

    go.assert = function (bool, message) {
        if (!bool) throw new Error(message);
    };


    go.supportGenerator = (function () {
        // try eval generator and yield

    }());


    go.delete = function (table, index) {
        var temp = table[index];
        delete table[index];
        return temp;
    };

    // return positive integer id
    go.insert = function (table, item) {
        while (true) {
            var id = Math.ceil(Math.random() * 1000000000000000);
            if (!(id in table)) {
                table[id] = item;
                return id;
            }
        }
    };

    // go.forever(function* () {

    //  var message = yield ws.message;

    //  throw // will break the loop

    // });

    go.Events = function () {};

    go.extend(go.Events.prototype, {
        /* 
            // like once
            xxx.on("name", function self () {
                this.off("name", self);
                // do whatever you want ...
            });
        */
        on: function (name, listener) {
            if (typeof listener !== "function") {
                throw new Error("listener must be a function!");
            }
            this._events = this._events || {};
            this._events[name] = this._events[name] || [];
            this._events[name].push(listener)
            return this;
        },
        // events.off() - stop all
        // events.off("name") - stop all with name
        // events.off("name", oneListener) - stop one with name
        off: function (name, listener) {
            if (!this._events) return this;
            if (arguments.length === 0) {
                this._events = {};
            } else if (arguments.length === 1) {
                delete this._events[name]; // remove the event
            } else {
                var list = this._events && this._events[name];
                if (list === undefined) return this;
                for (var i = 0; i < list.length; i++) {
                    if (list[i] === listener) {
                        list.splice(i, 1); // remove that listener
                        break;
                    }
                };
            }
            return this;
        },
        // Returns number of listeners (0 if none)
        emit: function () {
            if (!this._events) return 0;
            var list = this._events[arguments[0]];
            if (list === undefined) return 0;
            for (var i = 1; i < arguments.length; i++) {
                arguments[i-1] = arguments[i];
            }
            arguments.length--;
            for (var i = 0; i < list.length; i++) {
                list[i].apply(this, arguments);
            }
            return list.length;
        }
    });

    // make go event...
    go.extend(go, go.Events.prototype);

    // go.loop(function* () {

    //     var message = yield ws.message;

    //     throw; // will break the loop
    //     return go.break;
    //     return go.continue;

    // });

    // go.forEach(ws.message, function (message) {

    // });

    // x could be array, object, channel
    /*
    go.each(x, function (value, key, array) {

        // return go.continue
        // return go.break

    });
    // iterate untill channel closed
    var ch = new go.Channel();
    go.each(ch, function (value, index, channel) {
    
    });
    go.forEach(arr, function* () {
        yield 
    });
    yield go.map(files, function* (file) {
        return yield fs.readFile(file)
    });
    go.every
    go.some
    */

    // go.break = {};
    // go.continue = undefined;

    // // go.forEach = go.each
    // go.each = function (obj, func, ctx) {
    //     if (!obj) return;
    //     if (Array.isArray(obj)) {
    //         for (var i = 0, len = obj.length; i < len; i++) {
    //             if (func.call(ctx, obj[i], i, obj) === go.break) return;
    //         }
    //     } else if (obj instanceof go.Channel) {
    //         go.safe(function* () {
    //             var index = 0;
    //             while (true) {
    //                 var value = yield obj;
    //                 if (func.call(ctx, value, index, obj) === go.break) return;
    //             }
    //         });
    //     } else {
    //         var keys = Object.keys(obj);
    //         for (var i = 0, len = keys.length; i < len; i++) {
    //             if (func.call(ctx, obj[keys[i]], keys[i], obj) === go.break) return;
    //         }
    //     } 
    // };

    /*
    go.loop(function () {
    
    });
    go.loop(function* () {
        yield go.Channel
        return go.break;
    });
    */
    // go.loop = function (func, ctx) {
    //     while ()

    // };

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
        var ret = new go.Channel();
        
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
}());


