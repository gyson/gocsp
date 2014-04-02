
;(function goScript () {

    go.isNode = !!(typeof module !== "undefined" && module.exports);

    // set global variable
    (go.isNode ? global : window).go = go;

    // get script in String
    go.script = {
        // go core scirpt
        go: ";(" + goScript.toString() + "());",
        
        // merge all go components together
        get all () {
            // get go
            // get util
            // get module
            // get web
            return go.script.go
                + (go.script.util   || "")
                + (go.script.module || "")
                + (go.script.web    || "");
        }
    };

    //go.error = {};

    function go (g, safe) {
        // if is not generator object
        if (Object.prototype.toString.call(g) !== "[object Generator]") {
            // if it's generator function
            if (g && g.constructor && g.constructor.name === 'GeneratorFunction') g = g();
            else throw new Error("go() only accept generator object / function!"); 
        }

        var ret = g.ret = new Channel();

        g.isSafe = safe ? true : false;
        
        handle(g, "next", undefined);

        return ret;
    }


    go.safe = function (g) { return go(g, true); };

    // go.yield(new Channel, function (err, obj) { });
    go.yield = function (ch, cb) {
        // if ok 
        // put cb into channel store
        if (ch.length <= 0) {
            if (ch.isClosed) {
                cb(ch.closedMessage);
            } else {
                // push generator
                ch._store[ch.offset + ch.length] = cb;
                ch.length -= 1;
            }
            return;
        }

        var hasError = ch.offset in ch._error;

        var collection = hasError ? ch._error : ch._store;
        
        var item = collection[ch.offset];
        delete collection[ch.offset];

        ch.length -= 1;
        ch.offset += 1;

        if (hasError) {
            cb(item);
        } else {
            cb(null, item);
        }
    };

    function handle (g, action, item) {
        var result, ch, hasError, collection;

        // if g is cb
        // do it once
        if (typeof g === "function") {
            return action === "next" ? g(null, item) : g(item);
        }

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

            if (! (ch instanceof Channel) ) throw new Error("Can only yield Channel type!");

            if (ch.length <= 0) {
                if (ch.isClosed) {
                    action = "throw";
                    item = ch.closedMessage;
                    continue;
                } else {
                    // push generator
                    ch._store[ch.offset + ch.length] = g;
                    ch.length -= 1;
                    break;
                }
            }

            hasError = ch.offset in ch._error;

            collection = hasError ? ch._error : ch._store;
            
            item = collection[ch.offset];
            delete collection[ch.offset];

            ch.length -= 1;
            ch.offset += 1;

            action = hasError ? "throw" : "next";
        }
    };

    function Channel () {
        this.length = 0;
        this.offset = 0;
        this._store = {}; // store generators and items to put
        this._error = {}; // store error to throw
        this.isClosed = false;
    }
    go.Channel = Channel;

    // put item to the end of the queue
    Channel.prototype.put = function (item) {

        if (this.isClosed) throw new Error("channel is closed.");

        if (this.length < 0) {

            handle(this.take(), "next", item);
            
        } else {
            this._store[this.offset + this.length] = item;
            this.length += 1;
        }
    };

    // put item to the front of the queue
    Channel.prototype.putFront = function (item) {
        if (this.length <= 0) {
            this.put(item);
        } else {
            this._store[this.offset - 1] = item;
            this.length += 1;
        }
    }

    Channel.prototype.throw = function (err) {

        if (this.isClosed) throw new Error("channel is closed.");

        if (this.length < 0) {

            handle(this.take(), "throw", err);

        } else {
            this._error[this.offset + this.length] = err;
            this.length += 1;
        }
    };

    // disable to put / throw item into channel
    // only be able to take item out
    // throw error if yield a closed channel with length == 0
    // closed message
    Channel.prototype.close = function (info) {

        if (this.isClosed) return;

        this.isClosed = true;
        
        this.closedMessage = new Error("Channel is closed");
        this.closedMessage.info = info;

        // throw error to all waiting generator object
        while (this.length < 0) {
            handle(this.take(), "throw", this.closedMessage);
        }
    };

    // take a generator / cb from channel
    // assume this.length < 0
    Channel.prototype.take = function () {

        if (this.length >= 0) throw new Error("no generator to take");
        
        var g = this._store[this.offset];
        delete this._store[this.offset];

        this.length += 1;
        this.offset -= 1;

        return g;
    };


}());

