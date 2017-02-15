"use strict";

const crypto = require("crypto");
const peer = require("./peer");
const utils = require("./utils");
const context = require("./context");
const sim = require("./sim-context");
const simCluster = require("./sim-cluster");
const huffmandistance = require("./huffmandistance");

const peers = utils.range(1024, _ => new peer.Peer());
const rights = utils.range(peers.length, i => utils.ringGet(peers, i + 1));
const lefts = utils.range(peers.length, i => utils.ringGet(peers, i - 1));
peers.forEach((p, i) => {
  p.subscribe(rights[i]);
  p.subscribe(lefts[i]);
});
//console.log(peers.map(p => p.id));
huffmandistance.huffmanCluster(peers);

/*
console.log("spawn events...");
const last = new Date();
last.setMinutes(last.getMinutes() + 1); // 1 minutes later for stop
//last.setSeconds(last.getSeconds() + 30);
let count = 0;

utils.gasync(function* () {
  for (const p of peers) {
    yield p.spawn(sim.newEvent(p)).then(_ => utils.delay(10));
    count++;
  }
  while (Date.now() < last) {
    const cc = count;
    const rs = crypto.randomBytes(peers.length);
    for (let i = 0; i < peers.length; i++) {
      const p = peers[i], r = rs[i] / 256;
      // more sent, more spawn
      if (r < p.sent / cc) {
        yield p.spawn(sim.newEvent(p)).then(_ => utils.delay(10));
        count++;
      }
    }
    //console.log(count);
  }

})().then(_ => {
  // events propagate to all peers
  console.log("total events", count);
  console.log("propagated", peers.every(p => p.queue.size === count));
  //console.log(peers.map(p => p.queue.size));
  simCluster.checkCluster(peers, 8, 4);
}).catch(err => console.error(err));
*/
