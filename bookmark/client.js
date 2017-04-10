"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Bookmark: {enumerable: true, get: () => Bookmark},
}));

// hashnet client for bookmark for UI
// - store in memory
// - query bookmarks
// - post my bookmark

// bookmark with me
const EventEmitter = require("events");
const {URL} = require("url");
const {eventDom} = require("../util/dom");

//export
class Bookmark extends EventEmitter {
  constructor(hashnet, me, nickname = "anonim") {
    super();
    this.hashnet = hashnet;
    this.me = me;
    this.nickname = nickname;
    this.urls = new Map(); // query Events
    watch(this);
  }

  post(url, note="", tags = []) {
    const dom = eventDom(`
    <h1>bookmark to ${url}</h1>
    <div class="bookmark-note"></div>
`);
    const attrs = {
      $event: {
        actor: this.me.id,
        action: "bookmark",
        timestamp: new Date(),
        target: new URL(url),
      },
      linklabel: {
        actor: this.nickname,
        target: String(url),
      },
      bookmark: {
        note: note,
      }
    };
    tags.forEach(tag => {
      attrs[tag] = {};
    });

    const event = this.hashnet.makeEvent(dom, attrs);
    this.me.sign(event).then(signed => this.hashnet.put(signed)).
      catch(error => this.emit("error", error));
  }

  query(url) {
    const wellform = String(new URL(url));
    return this.urls.has(wellform) ? this.urls.get(wellform) : [];
  }
}

function watch(bookmark) {
  const channel = bookmark.hashnet.makeChannel({
    $event$contexts: ctxs => ctxs.includes("bookmark")
  });
  channel.pull().then(function loop(bk) {
    const url = String(bk.$event$target);
    if (!bookmark.urls.has(url)) bookmark.urls.set(url, []);
    bookmark.urls.get(url).push(bk);
    bookmark.emit("arrived", bk);
    return channel.pull().then(loop);
  });
}
