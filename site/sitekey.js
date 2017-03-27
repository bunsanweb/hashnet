"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  SiteKey: {enumerable: true, get: () => SiteKey},
}));

//TBD: site key signed by peer me
// - publisher generate its own keypair
// - owner signs site pubkey
// - site publishes: {owner pubkey, sign, site pubkey and requested hostname}
//   with its sign (by site private key)

const crypto = require("crypto");
const {URL} = require("url");
const {epochContexts, assignContext} = require("../context/def");
const {calcEventId} = require("../context/event");
const {Me} = require("../hash/me");
const {makeEvent} = require("../hash/event");
const {eventDom} = require("../util/dom");

class SiteKey {
  constructor(priv = crypto.randomBytes(32)) {
    this.me = new Me(priv);
    this.contexts = epochContexts();
  }

  get id() {
    return this.me.id;
  }

  selfSigned(host, timestamp = new Date()) {
    // use event format
    const dom = eventDom(`<h1>Site Key</h1>`);
    const $event = {
      actor: this.me.id,
      target: new URL(`http://${host}/`),
      action: "published",
      timestamp,
      contexts: ["$sitekey"],
    };
    assignContext(dom, this.contexts.$event, $event);
    assignContext(dom, this.contexts.$event, {id: calcEventId(dom)});
    return this.me.sign(makeEvent(dom, this.contexts));
  }
}
