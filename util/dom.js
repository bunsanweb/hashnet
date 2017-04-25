"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Request: {enumerable: true, get: () => Request},
  Headers: {enumerable: true, get: () => Headers},
  fetch: {enumerable: true, get: () => fetch},
  fetchDom: {enumerable: true, get: () => fetchDom},
  eventDom: {enumerable: true, get: () => eventDom},
}));

const fetch = require("node-fetch");
const {Request, Headers} = fetch;
const {JSDOM} = require("jsdom");

function fetchDom(req) {
  if (typeof req === "string") req = new Request(req);
  return fetch(req).
    then(res => res.ok ? res.text() : Promise.reject(res)).
    then(src => new JSDOM(src, {url: req.url}).window.document);
}

function eventDom(bodyText) {
  return new JSDOM(`<body>
<article class="hash-event" id="" pubkey="" sign="">
  <div>${bodyText}</div>
  <div>
    <a class="event-actor" href=""></a>
    <span class="event-action"></span>
    to <a class="event-target" href=""></a>
    at: <span class="event-timestamp"></span>
  </div>
  <div>contexts: <span class="event-contexts"></span></div>
</article>
</body>`).window.document.querySelector("article");
}
