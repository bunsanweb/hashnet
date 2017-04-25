"use strict";

const {JSDOM} = require("jsdom");

const {
  epochContexts, updateContexts, scanContext, assignContext,
} = require("../context/def");

const events = new JSDOM(`
<body>

<article class="hash-event">
<h1 class="context-label">$context$added</h1>
<pre class="context-attributes">
[{
   "label": "label",
   "selector": ".context-label",
   "value": "textContent",
   "type": "string",
   "default": ""
},{
   "label": "attributes",
   "selector": ".context-attributes",
   "value": "textContent",
   "type": "JSON",
   "default": []
}]
</pre>
<div class="hash-context">$context-added</div>
</article>
</body>
`).window.document.querySelectorAll("article.hash-event");

const ctx0 = epochContexts();
const ctx1 = updateContexts(events, ctx0);
//console.log(ctx1);
console.log(scanContext(events[0], ctx1.$context$added));

// update values with context def
const ev2 = events[0].cloneNode(true);
const updateAttrs = {
  label: "$context$added2",
  attributes: [1, 2, 3],
};
assignContext(ev2, ctx1.$context$added, updateAttrs);
console.log(ev2.outerHTML);
