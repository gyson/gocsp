
var assert = require('assert');
var LinkList = require('../lib/linklist');

describe('linklist', function () {

    it('should be FIFO', function () {
        var list = new LinkList();

        list.push(10);
        list.push(20);
        list.push(30);

        assert(list.shift() === 10);
        assert(list.shift() === 20);
        assert(list.shift() === 30);
        assert(list.isEmpty());
    })

    it('should be cancelable', function () {
        var list = new LinkList();

        list.push(1);
        list.push(2);

        var toCancel = list.push(3);
        list.push(4);

        LinkList.remove(toCancel);

        assert(list.shift() === 1);
        assert(list.shift() === 2);
        assert(list.shift() === 4);
        assert(list.isEmpty());
    })

})
