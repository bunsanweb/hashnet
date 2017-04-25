"use strict";

const {JSDOM} = require("jsdom");

const {
  updateContexts,
} = require("../context/def");
const {
  scanEvent, verifyEventAttrs, calcEventId, assignEventId,
} = require("../context/event");

const eventDefs = [{
  label: "id",
  value: "id",
  type: "string",
  default: "",
}, {
  label: "actor",
  selector: ".event-actor",
  value: "textContent",
  type: "URL",
  default: "hash:anonymous",
}, {
  label: "action",
  selector: ".event-action",
  value: "textContent",
  type: "string",
  default: "nop",
}, {
  label: "timestamp",
  selector: ".event-timestamp",
  value: "textContent",
  type: "Date",
  default: null,
}, {
  label: "contexts",
  selector: ".event-contexts",
  value: "textContent",
  type: "strings",
  default: "",
}];

const events = new JSDOM(`
<body>
<article class="hash-event" id="f0f0f0f0">
<h1><span class="context-label">hash:event</span> defined</h1>
<pre class="context-attributes">${JSON.stringify(eventDefs)}</pre>
<div>
  <a class="event-actor" href="hash:xxxxxx"
    >hash:xxxxxx</a>:
  <span class="event-action">published</span>
  at: <span class="event-timestamp"
    >Mon Jan 30 2017 12:00:00 GMT+0900 (JST)</span>
</div>
<div>contexts: <span class="event-contexts">hash:context-add</span></div>
</article>
</body>
`).window.document.querySelectorAll("article.hash-event");
events[0].id = calcEventId(events[0]);

const ctx = updateContexts(events);
//console.log(ctx);
const attrs = scanEvent(events[0], ctx);
console.log(attrs);

// update content and set new ID
const ev2 = events[0].cloneNode(true);
ev2.appendChild(ev2.ownerDocument.createElement("br"));
const ev3 = assignEventId(ev2, ctx);
console.log(ev3.id);
