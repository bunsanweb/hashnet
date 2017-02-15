"use strict";

// more simple mechanism of channels with promise
class Joint0 {
  constructor () {
    this.polls = [];
    this.gets = [];
  }
  get() {
    return new Promise((f, r) => {
      if (this.polls.length > 0) this.polls.shift()(f);
      else this.gets.push(f);
    });
  }
  poll() {
    return new Promise((f, r) => {
      if (this.gets.length > 0) f(this.gets.shift());
      else this.polls.push(f);
    });
  }
  post(event) {
    return this.poll().then(evget => (evget(event), event));
  }
}
// Link list version
class LinkQueue {
  constructor() {
    this.first = {prev: null, next: null};
    this.last = {prev: this.first, next: null};
    this.first.next = this.last;
  }
  get empty() {return this.first.next === this.last;}
  shift() {
    const node = this.first.next;
    this.first.next = node.next;
    node.next.prev = node.prev;
    return node.value;
  }
  push(value) {
    const node = {value, prev: this.last.prev, next: this.last};
    this.last.prev.next = node;
    this.last.prev = node;
  }
}
class Joint1 {
  constructor () {
    this.polls = new LinkQueue();
    this.gets = new LinkQueue();
  }
  get() {
    return new Promise((f, r) => {
      if (!this.polls.empty) this.polls.shift()(f);
      else this.gets.push(f);
    });
  }
  poll() {
    return new Promise((f, r) => {
      if (!this.gets.empty) f(this.gets.shift());
      else this.polls.push(f);
    });
  }
  post(event) {
    return this.poll().then(evget => (evget(event), event));
  }
}
const Joint = Joint1;

class Pipe {
  constructor (pub = new Joint(), sub = new Joint()) {
    this.pub = pub;
    this.sub = sub;
    this.connected = false;
  }
  get() {return this.sub.get();}
  poll() {return this.pub.poll();}
  post(ev) {return this.pub.post(ev);}
  resume() {
    if (this.connected === true) return this;
    this.connected = true;
    const loop = (evget) => {
      this.pub.get().then(evget);
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

class InfQueue {
  constructor (queue, pub = new Joint(), sub = new Joint()) {
    this.queue = queue || [];
    this.pub = pub;
    this.sub = sub;
    this.reqs = [];
    this.connected = false;
  }
  get() {return this.sub.get();}
  poll() {return this.pub.poll();}
  post(ev) {return this.pub.post(ev);}
  resume() {
    if (this.connected === true) return this;
    this.connected = true;
    const getLoop = (ev) => {
      if (this.reqs.length > 0) this.reqs.shift()(ev);
      else this.queue.push(ev);
      if (this.connected) this.pub.get().then(getLoop);
    };
    const pollLoop = (evget) => {
      if (this.queue.length > 0) evget(this.queue.shift());
      else this.reqs.push(evget);
      if (this.connected) this.sub.poll().then(pollLoop);
    };
    this.pub.get().then(getLoop);
    this.sub.poll().then(pollLoop);
    return this;
  }
  suspend() {
    this.connected = false;
    return this;
  }
}

class Queue {
  constructor (limitOfAccept = 1 << 20, queue = [],
               pub = new Joint(), sub = new Joint()) {
    this.limit = limitOfAccept;
    this.queue = queue;
    this.pub = pub;
    this.sub = sub;
    this.reqs = [];
    this.connected = false;
  }
  get() {return this.sub.get();}
  poll() {return this.pub.poll();}
  post(ev) {return this.pub.post(ev);}
  resume() {
    if (this.connected === true) return this;
    this.connected = true;
    const wait = () =>
          this.queue.length >= this.limit && this.reqs.length === 0;
    const getLoop = (ev) => {
      if (this.reqs.length > 0) this.reqs.shift()(ev);
      else this.queue.push(ev);
      if (this.connected && !wait()) this.pub.get().then(getLoop);
    };
    const pollLoop = (evget) => {
      const waited = wait();
      if (this.queue.length > 0) evget(this.queue.shift());
      else this.reqs.push(evget);
      if (waited && !wait()) this.pub.get().then(getLoop);
      if (this.connected) this.sub.poll().then(pollLoop);
    };
    if (!wait()) this.pub.get().then(getLoop);
    this.sub.poll().then(pollLoop);
    return this;
  }
  suspend() {
    this.connected = false;
    return this;
  }
}


// Promise.race with index
function irace(promises) {
  return new Promise((fulfill, reject) => Array.from(
    promises, (p, index) => Promise.resolve(p).then(
      value => fulfill({index, value}),
      error => reject({index, error}))
  ));
}

class Join {
  constructor (pubs, sub) {
    this.pubs = pubs, this.sub = sub;
    this.race = null;
    this.connected = false;
  }
  resume() {
    if (this.connected === true) return this;
    this.connected = true;
    const loop = (evget) => {
      if (this.race === null) this.race = this.pubs.map(
        (pub, i) => pub.get().then(ev => ({i, ev})));
      irace(this.race).then(({index, value: {i, ev}}) => {
        evget(ev);
        this.race.splice(index, 1);
        this.race.push(this.pubs[i].get().then(ev => ({i, ev})));
        if (this.connected) this.sub.poll().then(loop);
      });
    };
    this.sub.poll().then(loop);
    return this;
  }
  suspend() {
    this.connected = false;
    return this;
  }
}

// get driven join
class Join2 {
  constructor (pubs, sub) {
    this.pubs = pubs, this.sub = sub;
    this.race = null;
    this.connected = false;
  }
  resume() {
    if (this.connected === true) return this;
    this.connected = true;
    if (this.race === null) this.race = this.pubs.map(
      (pub, i) => pub.get().then(ev => ({i, ev})));

    const loop = ({i, ev}) => this.sub.post(ev).then(_ => {
      this.race[i] = this.pubs[i].get().then(ev => ({i, ev}));
      if (this.connected) Promise.race(this.race).then(loop);
    });
    Promise.race(this.race).then(loop);
    return this;
  }
  suspend() {
    this.connected = false;
    return this;
  }
}


class Plex {
  constructor (pub, subs) {
    this.pub = pub, this.subs = subs;
    this.connected = false;
  }
  resume() {
    if (this.connected === true) return this;
    this.connected = true;
    const loop = () => {
      const polls = this.subs.map(sub => sub.poll());
      Promise.race(polls).then(_ => this.pub.get().then(ev => {
        polls.map(poll => poll.then(evget => evget(ev)));
        if (this.connected) loop();
      }));
    };
    loop();
    return this;
  }
  suspend() {
    this.connected = false;
    return this;
  }
}


class Mix {
  constructor (pubs, subs) {
    const joined = new Joint();
    this.join = new Join(pubs, joined);
    this.plex = new Plex(joined, subs);
  }
  resume() {
    this.join.resume();
    this.plex.resume();
  }
  suspend() {
    this.plex.suspend();
  }
}


exports.Joint = Joint;
exports.Pipe = Pipe;
exports.InfQueue = InfQueue;
exports.Queue = Queue;
exports.Join = Join;
exports.Plex = Plex;
exports.Mix = Mix;
