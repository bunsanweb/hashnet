"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  PeerListCache: {enumerable: true, get: () => PeerListCache},
}));


const fs = require("fs");
const {join} = require("path");
function promisify(func) {
  return (...argv) => new Promise(
      (f, r) => func(...argv, (err, data) => err ? r(err) : f(data)));
}
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

class PeerListCache {
  constructor(hub, path, name = ".bookmark.peerlist.js") {
    this.hub = hub;
    this.path = join(path, name);
  }

  load() {
    loadPeerList(this.path).then(peers => {
      peers.forEach(peer => this.hub.add(peer));
      this.hub.run(new Watcher(this));
    }).catch(console.error);
  }
}

function loadPeerList(path) {
  return readFile(path).
    then(buf => JSON.parse(buf.toString("utf8"))).catch(_ => []);
}
function storePeerList(path, peers) {
  return new Promise((f, r) => {
    const data = Buffer.from(JSON.stringify(peers), "utf8");
    writeFile(path, data).then(f, r);
  });
}


class Watcher {
  constructor(parent) {
    this.parent = parent;
  }

  start(hub) {
    this.hub = hub;
  }

  added(peer) {
    loadPeerList(this.parent.path).
      then(peers => peers.includes(peer) ? undefined :
           storePeerList(this.parent.path, peers.concat([peer]))).
      catch(console.error);
  }
  troubled(peer) {
    loadPeerList(this.parent.path).
      then(peers =>
           storePeerList(this.parent.path, peers.filter(p => p !== peer))).
      catch(console.error);
  }
}
