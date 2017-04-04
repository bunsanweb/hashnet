"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Sync: {enumerable: true, get: () => Sync},
}));

class Sync {
  constructor(hashnet, me, publisher) {
    this.hashnet = hashnet;
    this.me = me;
    this.publisher = publisher;
    subpub(this);
  }
}

function subpub(sync) {
  const channel = sync.hashnet.makeChannel({
    $event$contexts: ctxs => !ctxs.includes("$site"),
  });
  channel.pull().then(function loop(event) {
    const dom = event.$$.dom;
    sync.me.signText(dom.outerHTML).
      then(sign => sync.publisher.put(dom, sign)).catch(console.error).
      then(() => channel.pull()).then(loop);
  }).catch(console.error);
}
