"use strict";

const crypto = require("crypto");
const peer = require("./peer");
const utils = require("./utils");
const context = require("./context");
const sim = require("./sim-context");

const peers = utils.range(32, _ => new peer.Peer());
for (const p of peers) for (const o of peers) p.subscribe(o);

console.log("spawn events...");
const last = new Date();
last.setMinutes(last.getMinutes() + 1); // 1 minutes later for stop
const lastf = last.getTime();
let count = 0;
utils.gasync(function* () {
  for (const p of peers) {
    yield p.spawn(sim.newEvent(p));
    count++;
  }

  while (Date.now() < lastf) {
    const cc = count;
    const rs = crypto.randomBytes(peers.length);
    for (let i = 0; i < peers.length; i++) {
      const p = peers[i], r = rs[i] / 256;
      // more sent, more spawn
      if (r < p.sent / cc) {
        yield p.spawn(sim.newEvent(p));
        count++;
      }
    }
  }
})().then(_ => {
  // events propagate to all peers
  console.log("total events", count);
  console.log("propagated", peers.every(p => p.queue.size === count));
  const ordered = Array.from(peers);
  ordered.sort((a, b) => b.sent - a.sent);
  for (const p of ordered) {
    console.log(p.id, p.sent, context.computeDistances(p));
  }
}).catch(err => console.error(err));
