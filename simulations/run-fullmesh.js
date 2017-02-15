"use strict";

const peer = require("./peer");
const utils = require("./utils");

const peers = utils.range(300, _ => new peer.Peer());
for (const p of peers) for (const o of peers) p.subscribe(o);

console.log("spawn a event");
peers[0].spawn({title: "foo"});

setTimeout(_ => {
  // events propagate to all peers
  console.log("propagated", peers.every(p => p.queue.size === 1));
}, 100);
