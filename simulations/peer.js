"use strict";

const crypto = require("crypto");
const channels = require("./channels");

class Peer {
  constructor(peerId = crypto.randomBytes(4).toString("hex")) {
    this.id = peerId;
    this.queue = new Map(); // local infinite queue: id => event
    this.subs = new WeakMap(); // subscribing peer => pipe
    this.pubs = new Map(); // published to peer => pipe
    this.sent = 0;
  }
  spawn(event) {
    const peer = this.id, date = new Date().toISOString();
    const complete = Object.assign({peer, date}, event);
    const hmac = crypto.createHmac("sha256", crypto.randomBytes(32));
    const id = hmac.update(JSON.stringify(complete)).digest("hex");
    this.sent += 1;
    return this.spawnEvent(Object.assign({id}, complete));
  }
  subscribe(peer) {
    if (peer === this) return;
    const pipe = new channels.Pipe().resume();
    this.addPub(peer, pipe);
    peer.addSub(this, pipe);
  }
  unsubscribe(peer) {
    if (peer === this) return;
    const pipe = this.subs.get(peer);
    if (!pipe) return;
    pipe.suspend();
    this.pubs.delete(peer);
    peer.subs.delete(this);
  }

  // functions
  spawnEvent(completeEvent) {
    if (this.queue.has(completeEvent.id)) return Promise.resolve();
    //console.log(this.id, completeEvent.id);
    this.queue.set(completeEvent.id, completeEvent);
    // TBD: do something arrived event
    // pubs
    return Array.from(this.pubs.values()).reduce(
      (prev, pipe) => prev.then(_ => pipe.post(completeEvent)),
      Promise.resolve()).catch(err => console.log("spawn", err));
  }
  addPub(peer, pipe) {
    this.pubs.set(peer, pipe);
    // post past events to pull
    return Array.from(this.queue.values()).reduce(
      (prev, event) => prev.then(_ => pipe.post(event)), Promise.resolve())
      .catch(err => console.log("pub", err));
  }
  addSub(peer, pipe) {
    this.subs.set(peer, pipe);
    // consume event inifinitly
    const loop = () =>
          pipe.get().then(event => this.spawnEvent(event),
                          err => console.log("sub", err)).then(loop);
    return loop();
  }
}

exports.Peer = Peer;
