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
            break; // return / yield
        }
        result = genIterator.next(chan.storage.shift());
    }
    // return result.value
}

function spawn(genIterator) { handle(genIterator, genIterator.next()); }

function Channel() {
    this.storage = [];
    this.waiting = [];

    /*
    this.storage_start = 1;
    this.storage_end   = 1;

    this.waiting_start = -1;
    this.waiting_end   = -1;
    */
}

Channel.prototype.send = function (obj) {
    
    this.storage.push(obj);

    // this.storage_end += 1;
    // this[this.storage_end] = obj;
    
    if (this.waiting.length > 0) {
        handle(this.waiting.shift(), { value: this, done: false });
    }

    // if (this.waiting_end < this.waiting_start) {
    //     var toHandle = this[this.waiting_start];
        
    //     delete this[this.waiting_start];
    //     this.waiting_start -= 1;

    //     handle(toHandle, { value: this, done: false } )
    // }
}

Channel.prototype.untake = function (obj) {

    this.storage.unshift(obj);

    if (this.waiting.length > 0) {
       handle(this.waiting.shift(), { value: this, done: false });
    }
}

Channel.prototype.take = function* () {

    return this.storage.length > 0 ? this.storage.shift() : yield this;
}

// Channel.prototype.size = function* () {
//     return this.storage_start - this.storage_end;
// }


module.exports = {
    spawn:   spawn,
    Channel: Channel
}


