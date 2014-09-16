
var go = require('../index');

var rejected = Promise.reject("rejected!");

go(function* () {

    console.log("okk");
    yield go.sleep(1000);
    console.log("okk");
    yield go.sleep(1000);
    console.log("okk");

    try {
        yield rejected;
    } catch (e) {
        console.log("catch:", e)
        yield go.sleep(1000);
        console.log("continue")
        throw "throw inside"
    }

})()
.catch(function (err) {
    console.log("catch again:", err)
})

var ch = new go.Channel();

go(function* () {
    console.log(yield ch.read());
    console.log(yield ch);
    console.log(yield ch);
})();

ch.write("okkk to insert data to channel")
ch.close("info")
