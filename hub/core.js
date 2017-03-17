"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Hub: {enumerable: true, get: () => Hub},
}));

const {URL} = require("url");
const fetch = require("node-fetch");
const jsdom = require("jsdom");

class Hub {
  constructor(hashnet) {
    this.hashnet = hashnet;
    this.peers = [];
    this.automations = [];
  }

  run(automation) {
    this.automations.push(automation);
    automation.start(this);
  }

  add(peer) {
    this.peers.push(peer);
    this.automations.forEach(automation => automation.added(peer));
  }

  pullItems(peer, stopId = "", lastId = "", prevId = "") {
    // returns the last event id as stopId for next access
    // lastId and prevId is for recursive call inside
    const itemsUrl = new URL(peer);
    itemsUrl.pathname = `/hash/items/${prevId}`;
    const urlText = `${itemsUrl}`;

    return fetchDom(urlText).then(doc => {
      //console.log(doc.documentElement.outerHTML);
      const ids = Array.from(
        doc.querySelectorAll(".hash-item"), item => item.textContent);
      if (ids.length === 0) return lastId;

      const stopIndex = ids.findIndex(id => id === stopId);
      const idsFromStop = stopIndex < 0 ? ids : ids.slice(stopIndex + 1);
      const fetchingIds = idsFromStop.filter(id => !this.hashnet.has(id));
      return Promise.all(fetchingIds.map(id => this.pullItem(peer, id))).
        then(() => {
          // pick next items page
          const last = lastId ? lastId : ids[0];
          if (stopIndex >= 0) return last;
          const prev = ids.slice(-1)[0];
          return this.pullItems(peer, stopId, last, prev);
        });
    });
  }

  pullItem(peer, eventId) {
    //NOTE: ignore failure when pulling an event content
    const eventUrl = new URL(peer);
    eventUrl.pathname = `/hash/event/${eventId}`;
    const urlText = `${eventUrl}`;

    return fetchDom(urlText).then(doc => {
      //console.log(doc.documentElement.outerHTML);
      const article = doc.querySelector(".hash-event");
      return this.hashnet.put(article).then(event => true);
    }).catch(err => false);
  }
}

function fetchDom(urlText) {
  return fetch(urlText).
    then(res => res.ok ? res.text() : Promise.reject(res)).
    then(src => jsdom.jsdom(src, {url: urlText}));
}
