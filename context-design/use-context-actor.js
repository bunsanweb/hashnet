// node --es_staging use-context-actor.js
"Use strict";

const jsdom = require("jsdom");

const {
  epochContexts, updateContexts,
} = require("../context/def");
const {
  scanEvent, verifyEventAttrs, calcEventId, assignEventId,
} = require("../context/event");
const {
  newActor, idFromPubkey, signEvent, verifySign, verifyEvent,
} = require("../context/actor");


// create me
const ctx = epochContexts();
const me = newActor(Buffer.from("cafe4c027decaffe".repeat(4), "hex"));
console.log(me);

// make signed event
const doc = jsdom.jsdom();
const eventSrc = doc.createElement("article");
eventSrc.class = "hash-event";
eventSrc.innerHTML = `
<h1>example published</h1>
<div>
  <a class="event-actor" href="${me.id}"
    >${me.id}</a>:
  <span class="event-action">published</span>
  at: <span class="event-timestamp"
    >Mon Jan 30 2017 12:00:00 GMT+0900 (JST)</span>
</div>
<div>contexts: <span class="event-contexts">example, </span></div>
`;
const eventUnsign = assignEventId(eventSrc, ctx);
//console.log(eventUnsign.outerHTML);

// sign and verify
(async function () {
  const eventSigned = await signEvent(me, eventUnsign, ctx);
  console.log(eventSigned.outerHTML);

  await verifySign(me, eventSigned, ctx);
  console.log("OK");

  const actor = await verifyEvent(eventSigned, ctx);
  console.log(actor);
})().catch(err => console.log(err));
