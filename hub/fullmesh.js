"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  FullMesh: {enumerable: true, get: () => FullMesh},
}));


class FullMesh {
  constructor(minMsec = 1000, maxMsec = 16000, limit = 100) {
    this.minMsec = minMsec;
    this.maxMsec = maxMsec;
    this.limit = limit;
    this.troubledPeers = new Set();
  }

  added(peer) {
    watch(this, peer, {last: "", msec: this.minMsec});
  }
  troubled(peer) {
    this.troubledPeers.add(peer);
  }

  start(hub) {
    this.hub = hub;
    hub.peers.forEach(peer => {
      watch(this, peer, {last: "", msec: this.minMsec});
    });
  }
}


function watch(fullmesh, peer, conf) {
  if (fullmesh.limit < fullmesh.hub.peers.length) return;
  const msec = fullmesh.troubledPeers.has(peer) ? fullmesh.maxMsec :
        conf.msec / 2 * (1 + Math.random());
  wait(msec).then(() => fullmesh.hub.pullItems(peer, conf.last)).then(last => {
    fullmesh.troubledPeers.delete(peer);
    const next = last === conf.last ? conf.msec * 2 : conf.msec / 2;
    const msec = Math.min(Math.max(fullmesh.minMsec, next), fullmesh.maxMsec);
    return watch(fullmesh, peer, {last, msec});
  });
}

function wait(msec, value = null) {
  return new Promise(f => setTimeout(f, msec, value));
}
