
/*
    push item:
        ch[ch.offset + ch.length] = item
        ch.length += 1

    shift item:
        var item = ch[ch.offset];
        delete ch[ch.offset];
        ch.length -= 1;
        ch.offset += 1;

    push task:
        ch[ch.offset + ch.length] = task;
        ch.length -= 1;

    shift task:
        var task = ch[ch.offset];
        delete ch[ch.offset];
        ch.length += 1;
        ch.offset -= 1;
*/

function handle(task, ch) {

    do {
        //if (! (ch instanceof Channel) ) {
        //    throw new Error("Can only handle Channel!");
        //} 

        // if (ch.items.length <= 0) {
        //     ch.tasks.push(task);
        //     break;
        // }

        if (ch.length <= 0) {
            // push task
            ch[ch.offset + ch.length] = task;
            ch.length -= 1;
            break;
        }

        // shift items
        var item = ch[ch.offset];
        delete ch[ch.offset];
        ch.length -= 1;
        ch.offset += 1;

        var result = task.next(item);

        ch = result.value;
    
    } while (!result.done);
}

function spawn(task) {

    var result = task.next();

    if (!result.done) handle(task, result.value);
}

function Channel() {
    // this.items = [];
    // this.tasks = [];
    
    this.length = 0;
    this.offset = 0;
};

Channel.prototype.take = function* () {
    
    // return this.items.length > 0 ? this.items.shift() : yield this;

    if (this.length > 0) {
        // shift item
        var item = this[this.offset];
        delete this[this.offset];
        this.length -= 1;
        this.offset += 1;

        return item;

    } else {
        return yield this;
    }
}

Channel.prototype.untake = function (item) {

    // this.items.unshift(item);

    // if (this.tasks.length > 0) {
    //    handle(this.tasks.shift(), this);
    // }

    if (this.length < 0) {
        // shift task
        var task = this[this.offset];
        delete this[this.offset];
        this.length += 1;
        this.offset -= 1;

        var result = task.next(item);
        if (!result.done) handle(task, result.value);
    
    } else {
        // unshift item
        if (this.length > 0) this.offset -= 1;

        this[this.offset] = item;
        this.length += 1;
    }

}

Channel.prototype.send = function (item) {
    
    // this.items.push(item);
    
    // if (this.tasks.length > 0) {
    //     handle(this.tasks.shift(), this);
    // }

    if (this.length < 0) {
        // shift task
        var task = this[this.offset];
        delete this[this.offset];
        this.length += 1;
        this.offset -= 1;

        var result = task.next(item);
        if (!result.done) handle(task, result.value);

    } else {
        this[this.offset + this.length] = item;
        this.length += 1;
    }
}

module.exports = { spawn: spawn, Channel: Channel }


