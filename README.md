
# quin

**quin** is a dependency injector to make code for Q Promise chains a little cleaner.

Assume you have a scenario where some (but not all) steps in your promises chain require some sort additional dependency. Depending how you solve this, you can get promises that are very tightly coupled to each other or lots of inline functions.

**quin** looks to solve this by allowing you to inject dependencies into your promises chain in a fairly transparent manner.

```
npm install quin
```
### Example
Assume we have a ```messageService``` that we use to talk to a message queue. We want to retrieve a message, validate and delete it.

First, let's build some simple callbacks that's we'll make into promises:
```js
//needs the messageService so we pass it in at the start of the chain
function getIt(messageService, cb) {
  messageService.getMsg(function (err, msg) {
    cb(err, msg);
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
```
But we'd rather use promises, so let's make some:
```js
var Q = require("q");
var quin = require("quin");
var messageService = require("./whatever");

//plain old promises
var getMessage = Q.denodeify(getIt);
var validateMessage = Q.denodeify(validateIt);
var del = Q.denodeify(deleteIt);

//quin returns a promise proxy injecting the extra dependency
var deleteMessage = quin.inject(del, messageService);

//Now execute the promise chain
getMessage(messageService)
  .then(validateMessage)
  .then(deleteMessage)
  .done();
```
The purpose and the flow of the chain is easier to read now.
