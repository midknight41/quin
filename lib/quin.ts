import Q = require("q");

export function denodeify(fnc: any, ...input: any[]): any {
  var promise = Q.denodeify(fnc);
  
  return _inject(promise, input);
}

export function inject(promise: any, ...input: any[]): any {
  return _inject(promise, input);
}

export function wrap(promise: any): any {

  if (promise == null) return null;

  var qt = new Quintainer(promise);
  return qt.inject.bind(qt);
}

//export function all(promises: any[], ...input: any[]) {

//  var mapped = promises.map(promise => {
//    console.log(promise);
//    return _inject(promise, input);
//  });
//  console.log(mapped[0], mapped[1]);
//  return Q.all(promises);

//}

function _inject(promise: any, input: any[]): any {

  if (promise == null) return null;

  var qt = new Quintainer(promise, input);

  var fnc = function (...args: any[]) {

    qt.args = qt.args.concat(args);

    return qt.resolve();

  }

  return fnc;
}

class Quintainer {

  public promise;
  public args: any[];

  constructor(promise: any, args?: any[]) {
    this.promise = promise;
    this.args = args != null ? args : [];
  }

  public resolve() {
    if (this.promise == null) return null;
    return this.promise.apply(this.promise, this.args);
  }

  public inject(...restOfParams: any[]): any {

    var qt = this;
    qt.args = qt.args.concat(restOfParams);

    var fnc = function (...args: any[]) {

      qt.args = qt.args.concat(args);
      return qt.resolve();

    }

    return fnc;
  }


}
