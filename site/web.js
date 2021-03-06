"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Web: {enumerable: true, get: () => Web},
}));

const http = require("http");
const {URL} = require("url");
const zlib = require("zlib");
const {JSDOM} = require("jsdom");
const {fetchDom} = require("../util/dom");
const {hostAddresses} = require("../util/net");
const {checkAttending} = require("./attending");

class Web {
  constructor(publisher, sitekey) {
    this.publisher = publisher;
    this.sitekey = sitekey;
    const handler = new WebHandler(this);
    this.server = http.createServer((req, res) => handler.handle(req, res));
  }

  peer(host = hostAddresses()[0]) {
    return `http://${host}:${this.address.port}/`;
  }
  get address() {
    return this.server.address();
  }
  start(...args) {
    this.server.listen(...args);
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
// - /hash/site: site pubkey and actor pubkey and actor sign
class WebHandler {
  constructor(web) {
    this.web = web;
    this.routes = [
      {method: "handleEvent", pattern: /^\/hash\/event\/([0-9a-f]{64})$/},
      {method: "handleItems", pattern: /^\/hash\/items\/([0-9a-f]{64})?$/},
      {method: "handleSiteKey", pattern: /^\/hash\/sitekey$/},
      {method: "handleAttending", pattern: /^\/hash\/attending$/},
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
    const dom = this.web.publisher.get(id);
    if (!dom) return this.handleNotFound(req, res);

    const timestamp = new Date(
      dom.querySelector(".event-timestamp").textContent);

    const doc = new JSDOM().window.document;
    doc.body.appendChild(doc.importNode(dom, true));

    return this.sendDoc(req, res, doc, timestamp, id);
  }

  handleItems(req, res, match) {
    // TBD: 304 not modified when "if-none-match" value == eventId
    const ids = this.web.publisher.list(match[1]);
    const timestamp = ids.length === 0 ? new Date() : new Date(
      this.web.publisher.get(ids.slice(-1)[0]).
        querySelector(".event-timestamp").textContent);

    const doc = new JSDOM(`<html><head><head><body>
  <h1>hash:events</h1>
  <ul class="hash-items"></ul>
<body>`).window.document;
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
      a.href = `/hash/items/${ids.slice(-1)[0]}`;
      a.textContent = "before";
      doc.body.appendChild(a);
    }

    return this.sendDoc(req, res, doc, timestamp);
  }

  handleSiteKey(req, res) {
    const timestamp = new Date();
    this.web.sitekey.selfSigned(req.headers.host, timestamp).then(event => {
      const doc = new JSDOM().window.document;
      doc.body.appendChild(doc.importNode(event.$$.dom, true));
      return this.sendDoc(req, res, doc, timestamp);
    }).catch(error => this.handleServerError(req, res, error));
  }

  handleAttending(req, res) {
    const {host, referer} = req.headers;
    checkAttending(this.web.sitekey, host, referer).
      then(peerUrl => this.web.sitekey.makeAttendedEvent(peerUrl)).
      then(event => this.web.publisher.putInside(event.$$.dom)).
      then(eventId => {
        const loc = new URL(`http://${host}/hash/event/${eventId}`);
        res.writeHead(201, {location: loc.href});
        res.end();
      }).catch(err => this.handleServerError(req, res, err));
  }

  handleNotFound(req, res) {
    res.writeHead(404);
    res.end(`Not Found: ${req.path}`);
  }
  handleBadRequest(req, res, reason="") {
    res.writeHead(400);
    res.end(`Bad Request: ${reason}`);
  }
  handleServerError(req, res, error) {
    console.error(req.url, req.headers, error);
    res.writeHead(500);
    res.end(`Not Found: ${req.path}`);
  }

  sendDoc(req, res, doc, timestamp, etag) {
    const encoding = (req.headers["accept-encoding"] || "").split(/\s*,\s*/);
    const raw = Buffer.from(doc.documentElement.outerHTML, "utf8");
    const header = {
      "content-type": "text/html;charset=utf-8",
      "date": timestamp.toUTCString(),
    };
    if (etag) header.etag = etag;
    if (encoding.includes("gzip")) {
      return zlib.gzip(raw, (err, gz) => {
        if (err || raw.length <= gz.length) {
          header["content-length"] = raw.length;
          res.writeHead(200, header);
          return res.end(raw);
        } else {
          //console.log(`gzip: ${raw.length} => ${gz.length}`);
          header["content-encoding"] = "gzip";
          header["content-length"] = gz.length;
          res.writeHead(200, header);
          return res.end(gz);
        }
      });
    } else {
      header["content-length"] = raw.length;
      res.writeHead(200, header);
      return res.end(raw);
    }
  }
}
