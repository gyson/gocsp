
(function utilScript () {

    console.assert(typeof go !== "undefined");

    go.script.util = "(" + utilScript.toString() + "());";

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
}());