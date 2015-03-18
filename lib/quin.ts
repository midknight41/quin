export function inject(promise: any, ...input: any[]): any {

  if (promise == null) return null;

  var qt = new Quintainer(promise, input);

  var fnc = function (...args: any[]) {

    qt.args = qt.args.concat(args);

    return qt.resolve();

  }

  return fnc;
}

export function wrap(promise: any): any {

  if (promise == null) return null;

  var qt = new Quintainer(promise);
  return qt.inject.bind(qt);
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
