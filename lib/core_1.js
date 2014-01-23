
// recursion one

function spawn(task) {

    var result = task.next();

    if (!result.done) {
        //handle(task, result.value);
        result.value.bind(task);
    }
}

function Channel() {
    this.items = [];
    this.tasks = [];
    
    // this.length = 0;
    // this.offset = 0;
};

Channel.prototype.bind = function (task) {
    if (this.items.length <= 0) {
        this.tasks.push(task);
    } else {
        var result = task.next(this.items.shift())
        if (!result.done) result.value.bind(task);
    }
}

Channel.prototype.take = function* () {

    return this.items.length > 0 ? this.items.shift() : yield this;
}

Channel.prototype.untake = function (item) {

    this.items.unshift(item);

    if (this.tasks.length > 0) {
       this.bind(this.tasks.shift());
    }
}

Channel.prototype.send = function (item) {
    
    this.items.push(item);
    
    if (this.tasks.length > 0) {
        this.bind(this.tasks.shift());
    }
}

module.exports = { spawn: spawn, Channel: Channel }


