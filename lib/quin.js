var Q = require("q");
function denodeify(fnc) {
    var input = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        input[_i - 1] = arguments[_i];
    }
    var promise = Q.denodeify(fnc);
    return _inject(promise, input);
}
exports.denodeify = denodeify;
function inject(promise) {
    var input = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        input[_i - 1] = arguments[_i];
    }
    return _inject(promise, input);
}
exports.inject = inject;
function wrap(promise) {
    if (promise == null)
        return null;
    var qt = new Quintainer(promise);
    return qt.inject.bind(qt);
}
exports.wrap = wrap;
//export function all(promises: any[], ...input: any[]) {
//  var mapped = promises.map(promise => {
//    console.log(promise);
//    return _inject(promise, input);
//  });
//  console.log(mapped[0], mapped[1]);
//  return Q.all(promises);
//}
function _inject(promise, input) {
    if (promise == null)
        return null;
    var qt = new Quintainer(promise, input);
    var fnc = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        qt.args = qt.args.concat(args);
        return qt.resolve();
    };
    return fnc;
}
var Quintainer = (function () {
    function Quintainer(promise, args) {
        this.promise = promise;
        this.args = args != null ? args : [];
    }
    Quintainer.prototype.resolve = function () {
        if (this.promise == null)
            return null;
        return this.promise.apply(this.promise, this.args);
    };
    Quintainer.prototype.inject = function () {
        var restOfParams = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            restOfParams[_i - 0] = arguments[_i];
        }
        var qt = this;
        qt.args = qt.args.concat(restOfParams);
        var fnc = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            qt.args = qt.args.concat(args);
            return qt.resolve();
        };
        return fnc;
    };
    return Quintainer;
})();
//# sourceMappingURL=quin.js.map