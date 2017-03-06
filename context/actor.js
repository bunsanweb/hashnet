"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  newActor: {enumerable: true, get: () => newActor},
  idFromPubkey: {enumerable: true, get: () => idFromPubkey},
  signEvent: {enumerable: true, get: () => signEvent},
  verifySign: {enumerable: true, get: () => verifySign},
  verifyEvent: {enumerable: true, get: () => verifyEvent},
  verifyEventSign: {enumerable: true, get: () => verifyEventSign},
}));

// actor functions
// - keypair as an actor itself
// - hash(pubkey) as a actor id
// - pubkey propagate via event
// - sign an event with its privkey

// sign to an event
// - data: utf8 bytes of  event.innerHTML
// - pubkey: from actor in event content
// - sign: hex string embeded as event attribute `hash-sign`
// - alg: "ecdsa-secp256k1-sha256" as default

// actor resolver
// - map of actor id and pubkey
// - published by actor event
//     - self signed event
// - get from actor URL
//     - content as self signed event

// secp256k1: standard ellitic curve parameters
// - 256bit=32byte positive integer size
//     - p, a, b and x, y of G: fixed value
//         - n: n*G=0
//     - random private key: non zero
//         - pubkey: (pbx, pby) = privkey * G
//             - pubkey buffer: [0x04, ...pbx, ...pby] (65byte)

const {randomBytes, createHash} = require("crypto");
const {URL} = require("url");
const eccrypto = require("eccrypto");

const {scanContext, assignContext} = require("./def");
const {scanEvent, calcEventId} = require("./event");

// Generate Key pair
//export
function newActor(privkey = randomBytes(32)) {
  const pubkey = eccrypto.getPublic(privkey);
  const id = idFromPubkey(pubkey);
  return {id, privkey, pubkey};
}

function hash(buf) {
  return createHash("sha256").update(buf).digest();
}

// single hash ID from pubkey
//export
function idFromPubkey(pubkey) {
  return new URL(`hash:${hash(pubkey).toString("hex")}`);
}

// sign to an event body with private key: pass to new signed DOM tree
//export
function signEvent(me, event, contexts) {
  const clone = event.cloneNode(true);
  const data = Buffer.from(clone.innerHTML, "utf8");
  return eccrypto.sign(me.privkey, hash(data)).then(signBuf => {
    const attrs = {sign: signBuf, pubkey: me.pubkey};
    return assignContext(clone, contexts.$sign, attrs);
  });
}

// verify an event with pubkey: valid or error
//export
function verifySign(actor, event, contexts) { // for test
  const {sign} = scanContext(event, contexts.$sign);
  return verifyDomSign(event, sign, actor.pubkey);
}

// scan actor data from event
//export
function verifyEvent(event, contexts) { // for test
  const {id, actor} = scanEvent(event, contexts);
  const {sign, pubkey} = scanContext(event, contexts.$sign);
  return verifyId(event, id).
    then(_ =>verifyPubkey(actor, pubkey)).
    then(_ => verifyDomSign(event, sign, pubkey)).
    then(_ => ({id: actor, pubkey}));
}

//export
function verifyEventSign(event, eventAttrs, signAttrs) {
  const {id, actor} = eventAttrs;
  const {pubkey, sign} = signAttrs;
  return verifyId(event, id).
    then(_ => verifyPubkey(actor, pubkey)).
    then(_ => verifyDomSign(event, sign, pubkey));
}

function verifyId(dom, id) {
  if (id === calcEventId(dom)) return Promise.resolve(id);
  return Promise.reject(Error(`Invalid event ID: ${id}`));
}
function verifyPubkey(actor, pubkey) {
  if (`${actor}` === `${idFromPubkey(pubkey)}`) return Promise.resolve(pubkey);
  return Promise.reject(Error(`Invalid Pubkey of the actor ID: ${actor}`));
}
function verifyDomSign(dom, sign, pubkey) {
  const data = Buffer.from(dom.innerHTML, "utf8");
  return eccrypto.verify(pubkey, hash(data), sign);
}
