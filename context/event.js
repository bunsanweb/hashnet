"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  scanEvent: {enumerable: true, get: () => scanEvent},
  verifyEventAttrs: {enumerable: true, get: () => verifyEventAttrs},
  calcEventId: {enumerable: true, get: () => calcEventId},
  assignEventId: {enumerable: true, get: () => assignEventId},
}));

const {createHash} = require("crypto");
const {URL} = require("url");
const {scanContext, assignContext} = require("./def");

//NOTE: core attributes for "event" of hash
// - as an event existance for hash network
// - format of the attributes in DOM is defined by "hash:context-add" event
// - label and attribute list are defined here (as implementation in functions)

//export
function scanEvent(event, contexts) {
  const eventAttrs = contexts.$event; // special label as event
  return scanContext(event, eventAttrs);
}

//export
function verifyEventAttrs(attrs) {
  // event should have
  // - an ID: URL
  // - an actor: URL
  // - a timestamp: Date
  // - an action: string
  // - contexts: Array of string
  return attrs.id instanceof URL &&
    attrs.actor instanceof URL &&
    attrs.date instanceof Date &&
    typeof attrs.action === "string" &&
    Array.isArray(attrs.contexts) &&
    attrs.contexts.every(v => typeof v === "string");
}

//export
function calcEventId(event) {
  const data = Buffer.from(event.innerHTML, "utf8");
  const hash = createHash("sha256").update(data).digest();
  return hash.toString("hex");
}

//export
function assignEventId(event, contexts) {
  const updated = event.cloneNode(true);
  const id = calcEventId(updated);
  return assignContext(updated, contexts.$event, {id});
}
