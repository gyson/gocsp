
var assert = require('assert');
var LinkList = require('../lib/linklist');

describe('linklist', function () {

    it('should be FIFO', function () {
        var list = new LinkList();

        list.push({ data: 10 });
        list.push({ data: 20 });
        list.push({ data: 30 });

        assert(list.shift().data === 10);
        assert(list.shift().data === 20);
        assert(list.shift().data === 30);
        assert(list.isEmpty());
    })

    it('should be cancelable', function () {
        var list = new LinkList();

        list.push({ data: 1 });
        list.push({ data: 2 });

        var toCancel = { data: 3 };

        list.push(toCancel);
        list.push({ data: 4 });

        LinkList.remove(toCancel);

        assert(list.shift().data === 1);
        assert(list.shift().data === 2);
        assert(list.shift().data === 4);
        assert(list.isEmpty());
    })

})
