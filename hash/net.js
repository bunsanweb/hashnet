"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  HashNet: {enumerable: true, get: () => HashNet},
}));


const {epochContexts, assignContext} = require("../context/def");
const {calcEventId} = require("../context/event");

const {Joint} = require("./channels");
const {Event, makeEvent, verifyEvent} = require("./event");


//TBD: context updater
//TBD: hide channel and hashnet detail with WeakMap

class HashNet {
  constructor(contexts = epochContexts()) {
    this.contexts = epochContexts();
    this.arrival = [];
    this.valids = new Map();
    this.channels = new Set();
    this.contexts = contexts;
  }

  put(eventOrDom) {
    const event = eventOrDom instanceof Event ? eventOrDom :
          makeEvent(eventOrDom, this.contexts);
    return verifyEvent(event).then(event => {
      if (this.valids.has(event.$event$id)) return true;
      this.valids.set(event.$event$id, event);
      this.arrival.push(event);
      return Promise.all(Array.from(
        this.channels, channel => channel.filter.pass(event).then(
          ev => channel.joint.post(ev)).catch(_ => true)
      ));
    });
  }

  has(id) {
    return this.valids.has(id);
  }
  get(id) {
    return this.valids.get(id);
  }

  makeChannel(filter = {}) {
    return new Channel(this, new Filter(filter));
  }

  makeEvent(dom, attrs={}) {
    //complete event data
    const clone = dom.cloneNode(true);
    Object.keys(attrs).forEach(key => {
      const contextAttrs = this.contexts[key] || [];
      assignContext(clone, contextAttrs, attrs[key]);
    });
    const contexts = Object.keys(attrs).filter(tag => !tag.startsWith("$"));
    assignContext(clone, this.contexts.$event, {contexts});
    // assign event id
    const id = calcEventId(clone);
    assignContext(clone, this.contexts.$event, {id});
    return makeEvent(clone, this.contexts);
  }
}

class Filter {
  constructor(desc) {
    this.desc = desc;
  }
  pass(event) {
    return Promise.all(
      Object.keys(this.desc).map(key => this.desc[key](event[key]))
    ).then(vs => vs.every(v => v) ? Promise.resolve(event) : Promise.reject());
  }
}

// event pulling only
class Channel {
  constructor(hashnet, filter) {
    hashnet.channels.add(this);
    this.hashnet = hashnet;
    this.filter = filter;
    this.joint = new Joint();
    //push arrived events
    this.hashnet.arrival.forEach(
      event => this.filter.pass(event).
        then(event => this.joint.post(event)).catch(_ => true));
  }

  pull() {
    return this.joint.get();
  }

  close() {
    this.hashnet.channels.delete(this);
  }
}
