"use strict";

const {URL} = require("url");
const {jsdom} = require("jsdom");
const {HashNet} = require("./hash/net");
const {Me} = require("./hash/me");

const hashnet = new HashNet();
const me = new Me(Buffer.from("cafe4c027decaffe".repeat(4), "hex"));
console.log(String(me.id));

// get loop
const channel = hashnet.makeChannel({
  $event$actor: (id) => id.toString() === me.id.toString(),
});
channel.pull().then(function loop(arrivedEvent) {
  console.log(arrivedEvent.$event);
  console.log(arrivedEvent.$event.actor); // access via context property
  console.log(arrivedEvent.$event$contexts); // access as a property
  return channel.pull().then(loop);
}).catch(console.error);

// build event (assign hash id) to sign me then post to hashnet
const event1 = hashnet.makeEvent(rawEventDOM("<h1>Hello World!</h1>"), {
  //context: props
  $event: { //system context
    actor: me.id,
    action: "book",
    timestamp: new Date(),
    target: new URL("hash:"),
  },
  linklabel: {
    actor: "Taro",
    target: "epoch",
  },
  bookmark: {}, // application context
});
console.log(event1.$$.dom.outerHTML);
//console.log(event1.$event);
me.sign(event1).then(signed => hashnet.put(signed)).catch(console.error);

function rawEventDOM(body) {
  return jsdom(`<body>
<article class="hash-event" id="" pubkey="" sign="">
  <div>${body}</div>
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
