"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Watcher: {enumerable: true, get: () => Watcher},
}));

class Watcher {
  constructor(hub) {
    this.hub = hub;
    watch(this);
  }
}

function watch(watcher) {
  const myId = `${watcher.hub.me.id}`;
  const channel = watcher.hub.hashnet.makeChannel({
    $event$contexts: ctxs => ctxs.includes("$peer$added"),
    $event$actor: actor => `${actor}` !== myId,
  });
  channel.pull().then(function loop(added) {
    const peer = String(added.$event$target);
    watcher.hub.add(peer);
    return channel.pull().then(loop);
  });
}
