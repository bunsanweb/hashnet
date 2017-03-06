"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Event: {enumerable: true, get: () => Event},
  makeEvent: {enumerable: true, get: () => makeEvent},
  verifyEvent: {enumerable: true, get: () => verifyEvent},
}));

const {scanContext} = require("../context/def");
const {verifyEventAttrs} = require("../context/event");
const {verifyEventSign} = require("../context/actor");

//export
class Event {
  // type for Proxy
  constructor(dom, contexts) {
    Object.defineProperty(this, "$$", {value: Object.freeze({dom, contexts})});
  }
}

//export
function makeEvent(dom, contexts) {
  const cache = new Map();
  return new Proxy(new Event(dom, contexts), {
    get(target, key, thisArg) {
      const value = Reflect.get(target, key,thisArg);
      if (value !== undefined) return value;

      if (typeof key !== "string") return undefined;
      const attrs = getContextData(key, dom, contexts, cache);
      if (attrs) return attrs;

      const split = key.lastIndexOf("$");
      // to remove "$foo" and "foo$" case
      if (1 <= split && split < key.length - 1) {
        const label = key.slice(0, split), attr = key.slice(split + 1);
        const attrs = getContextData(label, dom, contexts, cache);
        if (attrs) return attrs[attr];
      }
      return undefined;
    }
  });
}

function getContextData(label, dom, contexts, cache) {
  if (cache.has(label)) return cache.get(label);
  if (Reflect.has(contexts, label)) {
    const attrs = scanContext(dom, contexts[label]);
    cache.set(label, attrs);
    return attrs;
  }
  return undefined;
}

//export
function verifyEvent(event) {
  const basic = event.$event;
  const sign = event.$sign;
  return verifyBasicAttrs(basic).
    then(() => verifyEventSign(event.$$.dom, basic, sign)).
    then(() => event);
}

function verifyBasicAttrs(basicAttrs) {
  if (verifyEventAttrs(basicAttrs)) return Promise.resolve(basicAttrs);
  return Promise.reject(`lack of basic event attribute: ${basicAttrs}`);
}
