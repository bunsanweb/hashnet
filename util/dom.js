"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  fetchDom: {enumerable: true, get: () => fetchDom},
  eventDom: {enumerable: true, get: () => eventDom},
}));

const fetch = require("node-fetch");
const jsdom = require("jsdom");

function fetchDom(urlText) {
  return fetch(urlText).
    then(res => res.ok ? res.text() : Promise.reject(res)).
    then(src => jsdom.jsdom(src, {url: urlText}));
}

function eventDom(bodyText) {
  return jsdom.jsdom(`<body>
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
</body>`).querySelector("article");
}
