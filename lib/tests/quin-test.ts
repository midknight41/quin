import nodeunit = require("nodeunit");
import Q = require("q");
import quin = require("../quin");

var testGroup = {
  setUp: function (callback: nodeunit.ICallbackFunction): void {
    callback();
  },
  tearDown: function (callback: nodeunit.ICallbackFunction): void {
    callback();
  },
  "wrap() returns a wrapper function when supplied a promise": function (test: nodeunit.Test): void {
    var one: any = Q.denodeify(oneInput);

    //quin promise wrappers
    var validateMessage = quin.wrap(one);
    test.equal(typeof validateMessage, "function");

    test.done();

  },
  "inject() returns a wrapper function when supplied a promise": function (test: nodeunit.Test): void {
    var one: any = Q.denodeify(oneInput);

    //quin promise wrappers
    var validateMessage = quin.inject(one);
    test.equal(typeof validateMessage, "function");

    test.done();

  },
  "inject() can deal with no injected values": function (test: nodeunit.Test): void {
    var one: any = Q.denodeify(oneInput);

    var hasOne = quin.inject(one);

    one("in")
      .then(hasOne)
      .done(() => { test.done(); });

  },
  "inject() can deal with one injected value": function (test: nodeunit.Test): void {
    var one: any = Q.denodeify(oneInput);
    var expected = "value";

    var hasTwo = quin.inject(Q.denodeify(verifyExtra), expected);

    one("in")
      .then(hasTwo)
      .done(injected => {
      test.equal(expected, injected);
      test.done();
    });


  },
  "inject() can deal with more than one injected value": function (test: nodeunit.Test): void {
    var one: any = Q.denodeify(oneInput);

    var hasThree = quin.inject(Q.denodeify(returnsExtraAndMore), "extra", "more");

    one("in")
      .then(hasThree)
      .done(obj => {
      test.equal(obj.more, "more");
      test.equal(obj.extra, "extra");
      test.done();
    });

  },
  "inject() can deal with a null injected value": function (test: nodeunit.Test): void {
    var one: any = Q.denodeify(oneInput);
    var expected = null;

    var hasTwo = quin.inject(Q.denodeify(verifyExtra), expected);

    one("in")
      .then(hasTwo)
      .done(injected => {
      test.equal(expected, injected);
      test.done();
    });

  },
  "inject() returns a null  if a null promise was provided": function (test: nodeunit.Test): void {
    var one: any = Q.denodeify(oneInput);
    var expected = null;

    var hasTwo = quin.inject(null, expected);

    one("in")
      .then(hasTwo)
      .done(() => { test.done(); });

  },
  "inject() returns a function that can be called at the base of a promise chain": function (test: nodeunit.Test): void {
    var expected = "value";

    var one: any = Q.denodeify(oneInput);
    var two: any = quin.denodeify(verifyExtra, expected);

    var newBase = quin.inject(one, "in");

    newBase()
      .then(two)
      .done(() => { test.done(); });

  },
  "inject() returns a function that can be called at the base of a promise chain with a parameter": function (test: nodeunit.Test): void {
    var expected = "value";

    var one: any = Q.denodeify(oneInput);
    var verify: any = quin.denodeify(verifyExtra, expected);

    var newBase = quin.inject(one);

    newBase("in")
      .then(verify)
      .done(() => { test.done(); });

  },
  "denodify() returns a promise if a standard callback is provided": function (test: nodeunit.Test): void {
    var expected = "validated";

    var one = quin.denodeify(oneInput);
    var two = quin.denodeify(oneInput);
    var verify = quin.denodeify(verifyChain, test, expected);

    one(expected)
      .then(two)
      .then(verify)
      .done();

  },
  //"all() injects dependency into all items in array": function (test: nodeunit.Test): void {
  //  var expected = "validated";

  //  var one = quin.denodeify(oneInput);
  //  var promise = Q.denodeify(twoInputs);
  //  var two = quin.all([promise, promise], "injected");
  //  var verify = quin.denodeify(verifyChain, test, expected);

  //  one(expected)
  //    .then(two)
  //    .then(verify)
  //    .done();

  //},
  "Input from the top of the chain gets to the bottom with wrap": function (test: nodeunit.Test): void {

    //plain promises
    var getMessage: any = Q.denodeify(oneInput);
    var validate: any = Q.denodeify(twoInputs);

    //quin promise wrappers
    var validateMessage = quin.wrap(validate);
    var deleteMessage = quin.wrap(Q.denodeify(threeInputs));
    var complete = quin.wrap(Q.denodeify(verifyChain));

    getMessage("finished")
      .then(validateMessage("a"))
      .then(deleteMessage("a", "b"))
      .then(complete(test, "finished"))
      .done();

  },
  "Input from the top of the chain gets to the bottom with inject": function (test: nodeunit.Test): void {
    var context = console;

    //plain promises
    var getMessage: any = Q.denodeify(oneInput);
    var validate: any = Q.denodeify(twoInputs);
    var del = Q.denodeify(threeInputs);
    var final = Q.denodeify(verifyChain);

    //quin promises
    var validateMessage = quin.inject(validate, "a");
    var deleteMessage = quin.inject(del, "a", "b");
    var complete = quin.inject(final, test, "finished");

    getMessage("finished")
      .then(validateMessage)
      .then(deleteMessage)
      .then(complete)
      .done();
  },
  "README example works": function (test: nodeunit.Test): void {

    var messageService = new MockService();
    
    //plain old promises
    var getMessage = Q.denodeify(getIt);
    var validateMessage = Q.denodeify(validateIt);
    var del = Q.denodeify(deleteIt);

    //quin returns a promise proxy injecting the extra dependency
    var deleteMessage = quin.inject(del, messageService);

    //The purpose and the flow of the chain is easier to read now.
    getMessage(messageService)
      .then(validateMessage)
      .then(deleteMessage)
      .done(() => { test.done(); });

  }
}

exports.activityTests = testGroup;

//Test Functions
function showResults(writer: Console, result: string, cb: (err) => void) {
  cb(null);
}

function oneInput(input: string, cb: (err, data) => void) {
  cb(null, input);
}

function twoInputs(extra: string, input: string, cb: (err, data) => void) {
  cb(null, input);
}

function threeInputs(extra: string, more: string, input: string, cb: (err, data) => void) {
  cb(null, input);
}

function verifyChain(test: nodeunit.Test, expected: string, actual: string, cb: (err, data) => void) {

  test.equal(expected, actual);
  test.done();
  cb(null, "");
}

function verifyExtra(extra: string, input: string, cb: (err, data) => void) {
  cb(null, extra);
}

function returnsExtraAndMore(extra: string, more: string, input: string, cb: (err, data) => void) {
  cb(null, { extra: extra, more: more });
}

//README functions

//needs the messageService so we pass it in at the start of the chain
function getIt(messageService, cb) {
  messageService.getMsg(function (err, msg) {
    cb(null, msg);
  });
}

//this function does not know or care about the messageService
function validateIt(msg, cb) {

  if (msg.isGood == false) {
    cb(new Error("INVALID"), null);
  }

  cb(null, msg);
}

//this function needs the messageService to do it's work
function deleteIt(messageService, msg, cb) {

  messageService.deleteMsg(msg, function () {
    cb(null, msg);
  });
}

class MockService {

  public getMsg(cb) {
    cb(null, { id: "abc", isGood: true });
  }
  public deleteMsg(msg, cb) {
    cb(null);
  }

}
