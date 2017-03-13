"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: true},
  Me: {enumerable: true, get: () => Me},
  verifyText: {enumerable: true, get: () => verifyText},
}));

const crypto = require("crypto");
const eccrypto = require("eccrypto");
const {newActor, signEvent} = require("../context/actor");
const {makeEvent} = require("./event");

class Me {
  constructor(priv = crypto.randomBytes(32)) {
    this.me = newActor(priv);
  }
  get id() {return this.me.id;}
  get pubkey() {return this.me.pubkey;}
  sign(event) {
    return signEvent(this.me, event.$$.dom, event.$$.contexts).
      then(dom => makeEvent(dom, event.$$.contexts));
  }
  signText(text) {
    const data = Buffer.from(text, "utf8");
    const hash = crypto.createHash("sha256").update(data).digest();
    return eccrypto.sign(this.me.privkey, hash);
  }
}

function verifyText(pubkey, text, sign) {
  const data = Buffer.from(text, "utf8");
  const hash = crypto.createHash("sha256").update(data).digest();
  return eccrypto.verify(pubkey, hash, sign);
}
