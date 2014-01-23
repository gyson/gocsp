
function handle(task, channel) {

    do {
        //if (! (channel instanceof Channel) ) {
        //    throw new Error("Can only handle Channel!");
        //} 

        // if channel ready ?
        if (channel.items.length <= 0) {
            channel.tasks.push(task);
            break;
        }

        // chanel.get()
        var result = task.next(channel.items.shift());

        channel = result.value;
    
    } while (!result.done);
}

function spawn(task) {

    var result = task.next();

    if (!result.done) {
        handle(task, result.value);
    }
}

function Channel() {
    this.items = [];
    this.tasks = [];
    
    // this.length = 0;
    // this.offset = 0;
};

Channel.prototype.take = function* () {

    return this.items.length > 0 ? this.items.shift() : yield this;
}

Channel.prototype.untake = function (item) {

    this.items.unshift(item);

    if (this.tasks.length > 0) {
       handle(this.tasks.shift(), this);
    }
}

Channel.prototype.send = function (item) {
    
    this.items.push(item);
    
    if (this.tasks.length > 0) {
        handle(this.tasks.shift(), this);
    }
}

// chan.wake
/*
Channel.prototype.wake = function () {

    if (this.tasks.length > 0) {
        
        var task = this.tasks.shift();
        var result = task.next();
        
        if (!result.done) {
            handle(task, result.value)
        }
    } else {
        this.items.push(null);
    }
}
*/

// some kind of locker, for one-time usage
// for sleep, parallel functons

// Sleep and wakeup

function Channel2(wait) { 
    this.wait = wait ? wait : 1; 
    this.task = false;
}

Channel2.prototype.wake = function () {
    this.wait -= 1;
    if (this.wait <= 0 && this.task) {
        // handle generator
        // handle(this.task, this);
    }
}

// any channel satisfy bind port will be ok.

Channel2.prototype.bind = function (task) {
    if (this.wait <= 0) {
        // handle(task, this)
    } else {
        this.task = task; // store it.
    }
}

function Channel3() {
    this.length = 0;
    // this.task = null;
}

// for fs.xxx, one time usage
Channel3.prototype.send = function (item) {
    // active the ...
}



module.exports = { spawn: spawn, Channel: Channel }


