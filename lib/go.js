
;(function goScript () {

    var isNode = go.isNode = !!(typeof module !== "undefined" && module.exports);

    // set global variable
    (isNode ? global : window).go = go;

    // get script in String
    go.script = {
        // go core scirpt
        go: ";(" + goScript.toString() + "());",
        
        // merge all go components together
        get all () {
            // get go, util, module, web
            return go.script.go
                + (go.script.util   || "")
                + (go.script.module || "")
                + (go.script.web    || "");
        }
    };

    //go.error = {};
    go.isGenerator = function (obj) {
        return Object.prototype.toString.call(obj) === "[object Generator]";
    }
    
    go.isGeneratorFunction = function (obj) {
        return obj && obj.constructor && obj.constructor.name === "GeneratorFunction";
    };
    
    function go (g, safe) {
        // if is not generator object
        if (!go.isGenerator(g)) {
            // then it must be generator function
            go.assert(go.isGeneratorFunction(g));
            g = g();
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
            // push generator
            ch._store[ch.offset + ch.length] = cb;
            ch.length -= 1;
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

            go.assert(ch instanceof Channel, "Can only yield Channel type!");

            if (ch.length <= 0) {
                // push generator
                ch._store[ch.offset + ch.length] = g;
                ch.length -= 1;
                break;
            }

            hasError = ch.offset in ch._error;

            collection = hasError ? ch._error : ch._store;
            
            item = go.delete(collection, ch.offset);

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
    }
    go.Channel = Channel;

    Channel.prototype._push = function (action, store, obj) {
        if (this.length < 0) {
            // take a generator / cb from channel
            var g = go.delete(this._store, this.offset);
            this.length += 1;
            this.offset -= 1;
            handle(g, action, obj);
        } else {
            this[store][this.offset + this.length] = obj;
            this.length += 1;
        }
    };

    Channel.prototype._unshift = function (action, store, obj) {
        if (this.length <= 0) {
            this[action](obj);
        } else {
            this[store][this.offset - 1] = obj;
            this.length += 1;
        }
    };

    Channel.prototype._flush = function (action, obj) {
        if (this.length >= 0) return;
        for (var i = 0, len = -this.length; i < len; i++) {
            this[action](obj);
        }
    };

    Channel.prototype.put = function (item) {
        this._push("next", "_store", item);
    };
    Channel.prototype.putAll = function (item) {
        this._flush("put", item);
    };
    Channel.prototype.putFront = function (item) {
        this._unshift("put", "_store", item);
    };
    Channel.prototype.throw = function (err) {
        this._push("throw", "_error", err);
    };
    Channel.prototype.throwAll = function (err) {
        this._flush("throw", err);
    };
    Channel.prototype.throwFront = function (err) {
        this._unshift("throw", "_error", err);
    };

}());

