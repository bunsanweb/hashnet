"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Web: {enumerable: true, get: () => Web},
}));

const http = require("http");
const jsdom = require("jsdom");

class Web {
  constructor(publisher) {
    this.publisher = publisher;
    const handler = new WebHandler(this.publisher);
    this.server = http.createServer((req, res) => handler.handle(req, res));
  }

  get address() {
    return this.server.address();
  }
  start() {
    this.server.listen();
  }
  stop() {
    this.server.close();
  }
}

// path mapping
// - /: some page (TBD)
// - /hash/event/<ID>: get ID event body: querySelector("article.hash-event")
// - /hash/items/: ID list from begining: querySelectorAll(".hash-item")
// - /hash/items/<ID> ID list before the ID
// TBD
// - /hash/me: actor pubkey
// - /hash/actor/<Actor ID>: PUT pull request to our network
class WebHandler {
  constructor(publisher) {
    this.publisher = publisher;
    this.routes = [
      {method: "handleEvent", pattern: /^\/hash\/event\/([0-9a-f]{64})$/},
      {method: "handleItems", pattern: /^\/hash\/items\/([0-9a-f]{64})?$/},
    ];
  }

  handle(req, res) {
    for (const {method, pattern} of this.routes) {
      const match = pattern.exec(req.url);
      if (match) return this[method](req, res, match);
    }
    return this.handleBadRequest(req, res);
  }

  handleEvent(req, res, match) {
    const id = match[1];
    const dom = this.publisher.get(id);
    if (!dom) return this.handleNotFound(req, res);

    const timestamp = new Date(
      dom.querySelector(".event-timestamp").textContent);

    const doc = jsdom.jsdom();
    doc.body.appendChild(doc.importNode(dom, true));
    const data = Buffer.from(doc.documentElement.outerHTML, "utf8");

    res.writeHead(200, {
      "content-type": "text/html;charset=utf-8",
      "content-length": data.length,
      "date": timestamp.toUTCString(),
      "etag": id,
    });
    return res.end(data);
  }

  handleItems(req, res, match) {
    const ids = this.publisher.list(match[1]);
    const timestamp = ids.length === 0 ? new Date() : new Date(
      this.publisher.get(ids.slice(-1)[0]).
        querySelector(".event-timestamp").textContent);

    const doc = jsdom.jsdom(`<html><head><head><body>
  <h1>hash:events</h1>
  <ul class="hash-items"></ul>
<body>`);
    const ul = doc.querySelector(".hash-items");
    for (const id of ids) {
      const li = doc.createElement("li");
      const a = doc.createElement("a");
      a.className = "hash-item";
      a.href = `/hash/event/${id}`;
      a.textContent = id;
      li.appendChild(a);
      ul.appendChild(li);
    }
    if (ids.length > 0) {
      const a = doc.createElement("a");
      a.className = "hash-items-before";
      a.href = `/hash/items/${ids[0]}`;
      a.textContent = "before";
      doc.body.appendChild(a);
    }

    const data = Buffer.from(doc.documentElement.outerHTML, "utf8");

    res.writeHead(200, {
      "content-type": "text/html;charset=utf-8",
      "content-length": data.length,
      "date": timestamp.toUTCString(),
    });
    return res.end(data);
  }

  handleNotFound(req, res) {
    res.writeHead(404);
    res.end(`Not Found: ${req.path}`);
  }
  handleBadRequest(req, res, reason="") {
    res.writeHead(400);
    res.end(`Bad Request: ${reason}`);
  }
}
