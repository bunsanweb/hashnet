"use strict";

const crypto = require("crypto");

// Simulation random Event generating
function newEvent(peer) {
  if (peer.queue.size > 0 && crypto.randomBytes(1)[0] > 128) {
    // retweet last
    const queue = [...peer.queue.values()];
    const last =  queue[queue.length - 1];
    return {contexts: last.contexts, title: last.title};
  }
  const myContexts = [];
  const otherContexts = [];
  for (const event of peer.queue.values()) {
    const ctxs = event.peer === peer.id ? myContexts : otherContexts;
    ctxs.splice(ctxs.length, 0, ...event.contexts);
  }

  // generate contexts;
  //0-4 me
  const c1 = randomPick(myContexts, crypto.randomBytes(1)[0] % 5);
  //0-2 other
  const c2 = randomPick(otherContexts, crypto.randomBytes(1)[0] % 3);
  //0-2 new
  const c3 = Array.from(
    Array(crypto.randomBytes(1)[0] % 3), _ => randomName());
  const c = new Set([...c1, ...c2, ...c3]);
  if (c.size === 0) c.add(randomName());
  return {contexts: [...c], title: randomName()};
}

function randomName() {
  const cset = "_abcderghijklmnopqrstuvwxyzaiueoaiueoaiueo";
  const len = 7 + crypto.randomBytes(1)[0] % 4;
  return Array.from(
    crypto.randomBytes(len), v => cset[v % cset.length]).join("");
}

function randomPick(array, n) {
  if (array.length === 0) return [];
  const rands = new Uint32Array(crypto.randomBytes(n * 4).buffer);
  return Array.from(rands, v => array[v % array.length]);
}

exports.newEvent = newEvent;
exports.randomName = randomName;
