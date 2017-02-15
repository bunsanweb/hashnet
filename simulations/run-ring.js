"use strict";

const peer = require("./peer");
const utils = require("./utils");

const peers = utils.range(50000, _ => new peer.Peer());
const rights = utils.range(peers.length, i => utils.ringGet(peers, i + 1));
const lefts = utils.range(peers.length, i => utils.ringGet(peers, i - 1));

peers.forEach((p, i) => {
  p.subscribe(rights[i]);
  p.subscribe(lefts[i]);
});

console.log("spawn a event");
peers[0].spawn({title: "foo"});

setTimeout(_ => {
  // events propagate to all peers
  console.log("propagated", peers.every(p => p.queue.size === 1));
}, 100);
