"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Publisher: {enumerable: true, get: () => Publisher},
}));

const {calcEventId} = require("../context/event");
const {verifyText} = require("../hash/me");

class Publisher {
  constructor(pubkey) {
    this.pubkeys = [pubkey];
    this.events = new Map();
    this.arrived = []; // index only: order by arrived here (not timestamp)
  }

  put(eventDom, sign) {
    // return promise (verification event dom.outerHTML)
    const eventId = eventDom.id;
    //TBD: check hash id
    if (eventId !== calcEventId(eventDom)) {
      return Promise.reject(Error("Invalid event ID"));
    }
    const verifiers = this.pubkeys.map(
      pubkey => verifyText(pubkey, eventDom.outerHTML, sign));
    return some(verifiers).then(() => {
      this.events.set(eventId, eventDom);
      this.arrived.push(eventId);
      return eventId;
    }, err => Promise.reject(Error("Invalid Sign for my owners")));
  }

  get(eventId) {
    //return event dom
    return this.events.get(eventId);
  }

  list(eventId = "", length = 100) {
    if (this.events.has(eventId)) {
      // list up before eventId
      const last = this.arrived.findIndex(id => id === eventId);
      const start = last - length;
      return this.arrived.slice(start < 0 ? 0 : start, last).reverse();
    }
    return this.arrived.slice(-length).reverse();
  }
}

function some(promises) {
  return new Promise((f, r) => {
    const rejects = [];
    const rejector = err => {
      rejects.push(err);
      if (rejects.length === promises.length) r(rejects);
    };
    promises.forEach(p => Promise.resolve(p).then(f, rejector));
  });
}
