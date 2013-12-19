/* 
    spawn(generator_iterator)

    Channel.send(object)

    yield* Channel.take(object)
*/

function handle(genIterator, result) {

    while (!result.done) {
        var chan = result.value;

        if (chan.storage.length <= 0) {
            chan.waiting.push(genIterator);
            break;
        }
        result = genIterator.next(chan.storage.shift());
    }
}

function spawn(genIterator) { handle(genIterator, genIterator.next()); }

function Channel() {
    this.storage = [];
    this.waiting = [];
}

Channel.prototype.send = function (obj) {
    this.storage.push(obj);
    
    if (this.waiting.length > 0) {
        handle(this.waiting.shift(), { value: this, done: false });
    }
}

Channel.prototype.take = function* () {

    return this.storage.length > 0 ? this.storage.shift() : yield this;
}

module.exports = {
    spawn:   spawn,
    Channel: Channel
}


