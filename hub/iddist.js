"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  IdDistance: {enumerable: true, get: () => IdDistance},
}));

const {URL} = require("url");

// subscribe peers with distance of me id and site id
class IdDistance {
  constructor(siteId, spanMsec = 2000, bucketSize = 4) {
    console.assert(bucketSize > 0);
    this.siteId = siteId;
    this.spanMsec = spanMsec;
    this.bucketSize = bucketSize;
    this.dists = Array.from(Array(256 + 1), () => []);
    this.lasts = new Map();
  }

  start(hub) {
    this.started = true;
    this.hub = hub;
    hub.peers.forEach(peerUrl => this.added(peerUrl));
    watch(this);
  }

  added(peer) {
    const dist = distance(this.siteId, asSiteId(this.hub, peer));
    this.dists[dist] = this.dists[dist].concat([peer]);
  }

  troubled(peer) {
    const dist = distance(this.siteId, asSiteId(this.hub, peer));
    this.dists[dist] = this.dists[dist].filter(p => p !== peer);
    this.lasts.delete(peer);
  }
}


function distance(idA, idB) {
  // ID as "hash:xxxxx..." (64 hex)
  const a = Buffer.from(new URL(idA).pathname, "hex");
  const b = Buffer.from(new URL(idB).pathname, "hex");
  console.assert(a.length === 32 && b.length === 32, "ID should be 256 bits");
  // compare xor distance as little endien
  let clz256 = 0;
  for (let i = 31; i >= 0; i--) {
    const clz8 = Math.clz32(a[i] ^ b[i]) - 24;
    clz256 += clz8;
    if (clz8 < 8) return 256 - clz256;
  }
  console.assert(clz256 === 256);
  return 0;
}

function asSiteId(hub, peerUrl) {
  for (const [siteId, siteUrl] of hub.siteIds.entries()) {
    if (peerUrl === siteUrl) return new URL(siteId);
  }
  return null;
}

function* bucketPeers(iddist) {
  for (const peers of iddist.dists) {
    for (const peer of peers.slice(0, iddist.bucketSize)) yield peer;
  }
}

function wait(msec, value = null) {
  return new Promise(f => setTimeout(f, msec, value));
}

function watch(iddist) {
  // each time to pull bucket peers
  const next = Date.now() + iddist.spanMsec;
  return Promise.all(Array.from(
    bucketPeers(iddist),
    peer => iddist.hub.pullItems(peer, iddist.lasts.get(peer)).
      then(last => iddist.lasts.set(peer, last)))).
    then(() => wait(next - Date.now())).
    then(() => watch(iddist));
}
