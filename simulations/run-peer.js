"use strict";

const peer = require("./peer");

// simple case
const p1 = new peer.Peer();
const p2 = new peer.Peer();

// NOTE: non advertising (manual networking)
p1.subscribe(p2);
p2.subscribe(p1);

p1.spawn({title: "event1"});
p2.spawn({title: "event2"});

setTimeout(_ => {
  console.log(p1.queue);
  console.log(p2.queue);
}, 100);
