


function Channel(size) {
    if (!(this instanceof Channel)) {
        return new Channel(obj);
    }

    var self = this;

    self._max = size || 0;
    self._closed = false;

    self._promise = new Promise(function (resolve) {
        self._resolve = resolve;
    });

    self[0] = self.readPort = new ReadPort(self);
    self[1] = self.writePort = new WritePort(self);
}

Channel.prototype = {
    constructor: Channel,

    read: read,
    then: then,
    pipe: pipe,

    write: write,
    close: close,

    get size() {
        return this._size
    }
};

function ReadPort(channel) {
    this._channel = channel;
}
ReadPort.prototype = {
    constructor: ReadPort,
    read: function () { return read.call(this._channel); },
    then: function (x) { return then.call(this._channel, x); },
    pipe: function (x) { return pipe.call(this._channel, x); },
    get size() { return this._channel._size; }
};

function WritePort(channel) {
    this._channel = channel;
}
WritePort.prototype = {
    constructor: WritePort,
    write: function (x) { return write.call(this._channel, x); },
    close: function (x) { return close.call(this._channel, x); },
    get size() { return this._channel._size; }
};

// read data
function read() {
    var self = this;
    return new Promise(function (resolve) {
        if (self._closed) {
            resolve({ done: true, value: self._message });
        } else {
            // check length...
        }
    });
}

// never going to throw error
function then(fn) {
    return this._promise.then(fn);
}

// pipe to Channel, writePort, function,
function pipe(obj) {
    // if its channel
}

// when channel accept it, resolve(true)
// when channel closed, reslove(false)
function write(data) {
    // if it's closed, throw exception
    var self = this;
    return new Promise(function (resolve, reject) {
        if (self._closed) {
            resolve(false);
        } else {
            // if it's ok to insert
            // resolve(true)
            // else, need pending
            // save it some where, resolve later
        }
    })
}

function close(message) {
    if (this._closed) return;
    this._closed = true;
    this._message = message;
    this._resolve(message);
}

// to compatible with Stream
// need
// .emit, .end, .write // ok

/*

use case:
1. http socket => DuplexStream
2. websocket   => DuplexStream
3. net socket  => DuplexStream

[readPort, writePort] = new Channel(10)

createReadChannel(fn writePort {

});

createReadChannel( readStream )

createWriteChannel(fn readPort {

});



fs.createReadChannel("...", ...)
.pipe(go take {
    while (true) {
        var chunk = yield take();
        console.log(chunk)
        yield put(chunk)
    }
})
.pipe(fs.createWriteChannel('...', ...))

var endStream = a.pipe(go @{

    var value = yield @take()

    b.put(value); // copy to stream b

    @catch(fn e: b.throw(e))

})
.done(go @{
    ...
});


#createChannel()
    .pipe(filter(fn: x > 10))
    .pipe(map(fn: x > 20))
    .pipe(go {
        while (x > 10) {

        }
    })
    .pipe(go readPort {
        @then(fn {...}, fn err {...})
        while ()
    })
    .pipe(go.createWriteChannel(go readPort {
        for e from readPort {
            // do something
        }
        // end
    }))


//
Channel.from(fs.createReadStream())


yield select(put())

value = yield select([
    select.put(channel, value),
    select.take(channel),
    Promise(value),
]); // if abc.length <= 1, then ok, default with obj

// for else condition, create a new promise! after previous few
Promise.resolve().then(...)

// promise


select (name)
case 'name':
    ...
    ...

    // return
    break;
case take abc:
    ...
    ...
case sleep:
    ...
    ...
else:
    ...
    ...
end

switch index
case 0:
    ...
    ...
case 1:
    ...
    ...
case 2:
    ...
    ...
else
    ...
    ...
end


web socket

var res = yield readPort.read()
if (not res.done) {
    continue ...
}


var

go(function* () {
    var res, ch = createWebSocketChannel(...);
    while (res = yield ch.read(), !res.done) {
        console.log(res.value);
    }
    if (res.value) {
        // error here
    }
})();

// readChannel, WriteChannel
[inport, outport] := createWebSocket(....);

while

yield inport.take()

yield outport.put()

.read .write .end .emit('error', ...) .close

.close() with something // if close with something
// if throw error, close with error
// convention that if not error, close with null or undefined

// if x is null / undefined, break
for x from channel {

}
var endMessage = yield channel.done()

[x, y] = new #Channel()

function Channel()

Inport: .put(.write) .close

Outport: .take(.read) .then(return a promise)

for x from outport {
    console.log()
}

// let __ref = yield outport
// if (__ref) { let closedInfo = __ref; ... }
if closedInfo := yield outport as error {
    // error here
}

#chan()

for msg from socketChan {

}
if yield socketChan as err {
    console.log(err)
}

// built in ?
// chan(1)
// new Channel()

for abc.next() as ok until ok.done {

}

for x, y in obj() as okk if okk.hasOwnProperty(x) {

}

select(
    ['c1', 'put', channel, 'value'],
    ['c2', 'take', channel])

select({
    'name': ['put', channel, 'value'],
    'name2': ['take', channel],
    'else': ['else', value]
})

go!(x > 10)

select()
go!(...)
#go(...)

defmacro!(
    name(list),
    print(abc) 'abc' ''

)

#defmacro print() {
    return 'console.log(' arguments ')'
}

#defmacro print {
when ():
    => 'console.log();'
    => 'for var i in b { ... }'
when (x, y, z):
    =>
    =>
when (a, b, c, e):

else:

}

loop! {

}

#defmacro loop(block) => ('while (true) {', block, '}')

#print(x, y, z)

var x = yield select
    .take()
    .put()
    .else()

go.chan()

switch (x.index) {
case 0:
    // do something
case 1:
    // do something
default:
    //...
}

select(function (take, put) {

})

s.take(channel).then(function() {return 'okk'})

while (yield outport.take())

if yield outport as error {
    console.log(error)
}

if err { return }

select {
when <-abc as f:

when value -> efg:

}

// select({ timeout: 10 }).take().put() ...


// you can close it, with something

for // done: true, value: value // abc.next()

while let x = abc.next(); not x.done {
    ...
    ...
}

for x from chan.outport {
    ...
    ...
    ...
}
yield chan.outport // then... it's thenable

select {
when <-channel as abc:

when abc -> channel:

when <-okk:

else
    console.log('nothing available')
}

through(go readPort, writePort {
    for x from inport {
        // ...
        value -> outport // statement yield outport.put(value)

        xyz := <-inport
    }

    select {
    when <-inport:
        c++;
    when value -> outport:
        c--;
    }

}, fn err {

})

<- sleep(500) // return a Channel yield .take() // close with something

createReadChannel(go put {
    while (n < 10) {
        yield sleep(100)
        put(0)
    }

    // when return, it's closed
})

*/
