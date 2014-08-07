
module.exports = go;
function go (genFun) {
    assertType(isGeneratorFunction(genFun), 'go function only accept a generator function', genFun)
    return function () {
        var gen = genFun.apply(this, arguments);

        return new Promise(function (resolve, reject) {
            next();
            function next (obj, isError) {
                var result = gen[isError ? "throw" : "next"](obj);
                var value = result.value;
                if (result.done) {
                    resolve(value);
                } else {
                    assertType(isThenable(value), 'You may only yield a promise(thenable object)', value);
                    value.then(next, raise).catch(reject);
                }
            }
            function raise(reason) { next(reason, true); }
        })
    }
}

function isGeneratorFunction (obj) {
    return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction'
}

function isThenable (obj) {
    return obj && typeof obj.then === 'function'
}

function assertType (bool, message, obj) {
    if (!bool) {
        throw new TypeError(message + (arguments.length <= 2
            ? "" : ', but the following was passed: "' + String(obj) + '"'))
    }
}
