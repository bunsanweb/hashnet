"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: true},
  Me: {enumerable: true, get: () => Me},
}));

const crypto = require("crypto");
const {newActor, signEvent} = require("../context/actor");
const {makeEvent} = require("./event");

class Me {
  constructor(priv = crypto.randomBytes(32)) {
    this.me = newActor(priv);
  }
  get id() {return this.me.id;}
  sign(event) {
    return signEvent(this.me, event.$$.dom, event.$$.contexts).
      then(dom => makeEvent(dom, event.$$.contexts));
  }
}
