
var LinkList = require('../lib/linklist');
var Benchmark = require('benchmark');

var k = 10;

function test(l) {
    var x = 1;
    for (var i = 0; i < k; i++) {
        l.push(function () {
            return x++;
        });
        l.push(function () {
            return x--;
        });
    }
    for (var i = 0; i < k; i++) {
        l.shift()();
        l.shift()();
    }
    return x;
}

new Benchmark.Suite()

.add('linklist', function () {
    test(new LinkList())
})

.add('array', function () {
    test([])
})

.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run({ 'async': true });
