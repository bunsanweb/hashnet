"use strict";

const channels = require("./channels");

// async filter: post ev to pub => filter(ev) => sub
class Filter {
  constructor(filter, pub, sub) {
    this.filter = (ev) => new Promise(
      (f, r) => Promise.resolve(filter(ev)).then(f, r));
    this.pub = pub || new channels.Joint();
    this.sub = sub || new channels.Joint();
    this.connected = false;
  }
  get() {return this.sub.get();}
  poll() {return this.pub.poll();}
  post(ev) {return this.pub.post(ev);}
  resume() {
    if (this.connected === true) return this;
    this.connected = true;
    const loop = (evget) => {
      const retry = (ev) => this.filter(ev).then(evget, _ => {
        if (this.connected) this.pub.get().then(retry);
      });
      if (this.connected) this.pub.get().then(retry);
      if (this.connected) this.sub.poll().then(loop);
    };
    this.sub.poll().then(loop);
    return this;
  }
  suspend() {
    this.connected = false;
    return this;
  }
}


exports.Filter = Filter;
