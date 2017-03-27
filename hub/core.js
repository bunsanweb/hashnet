"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Hub: {enumerable: true, get: () => Hub},
}));

const {URL} = require("url");
const {makeEvent, verifyEvent} = require("../hash/event");
const {fetchDom, eventDom} = require("../util/dom");

class Hub {
  constructor(hashnet, me) {
    this.hashnet = hashnet;
    this.me = me;
    this.peers = [];
    this.siteIds = new Map();
    this.automations = [];
  }

  addMySite(siteId) {
    this.siteIds.set(`${siteId}`, "");
  }

  run(automation) {
    this.automations.push(automation);
    automation.start(this);
  }

  add(peer) {
    checkSiteKey(this, peer).then(peerUrl => {
      this.peers.push(peerUrl);
      this.automations.forEach(automation => automation.added(peerUrl));
      spawnAdded(this, peerUrl);
    }).catch(error => {
      //console.log(error);
      // To be ignored
    });
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


function checkSiteKey(hub, peer) {
  const peerUrl = `${new URL(peer)}`;
  if (hub.peers.includes(peerUrl)) {
    return Promise.reject(Error(`peer already in list: ${peerUrl}`));
  }
  const keyUrl = new URL(peer);
  keyUrl.pathname = "hash/sitekey";
  const urlText = `${keyUrl}`;
  return fetchDom(urlText).then(doc => {
    //console.log(doc.documentElement.outerHTML);
    const dom = doc.querySelector(".hash-event");
    const event = makeEvent(dom, hub.hashnet.contexts);
    const siteId = `${event.$event.actor}`;
    const siteUrl = `${event.$event.target}`;
    if (hub.siteIds.has(siteId)) {
      return Promise.reject(Error(`peer already listed: ${siteId}`));
    }
    if (siteUrl !== peerUrl) {
      return Promise.reject(Error(`mismatched url ${peer} says ${siteUrl}`));
    }
    return verifyEvent(event).then(event => {
      hub.siteIds.set(siteId, siteUrl);
      return siteUrl;
    }, error => Promise.reject(Error(`Invalid Sign in sitekey`)));
  });
}

function spawnAdded(hub, peer) {
  const dom = eventDom(`<h1>peer added</h1>`);
  const attrs = {
    $event: {
      actor: hub.me.id,
      action: "peer added",
      timestamp: new Date(),
      target: new URL(peer),
    },
    $peer$added: {},
  };
  const event = hub.hashnet.makeEvent(dom, attrs);
  hub.me.sign(event).then(signed => hub.hashnet.put(signed)).
    catch(console.error);
}
