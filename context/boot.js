"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  epochContexts: {enumerable: true, get: () => epochContexts},
}));

const {fromJS} = require("immutable");

const initialContexts = {
  $context$added: [
    {
      label: "label",
      selector: ".context-label",
      value: "textContent",
      type: "string",
      default: "",
    },{
      label: "attributes",
      selector: ".context-attributes",
      value: "textContent",
      type: "JSON",
      default: "[]",
    },
  ],
  $event: [
    {
      label: "id",
      value: "id",
      type: "string",
      default: "",
    },
    {
      label: "actor",
      selector: ".event-actor",
      value: "href",
      type: "URL",
      default: "hash:",
    },
    {
      label: "target",
      selector: ".event-target",
      value: "href",
      type: "URL",
      default: "hash:",
    },
    {
      label: "action",
      selector: ".event-action",
      value: "textContent",
      type: "string",
      default: "nop",
    },
    {
      label: "timestamp",
      selector: ".event-timestamp",
      value: "textContent",
      type: "Date",
      default: null,
    },
    {
      label: "contexts",
      selector: ".event-contexts",
      value: "textContent",
      type: "strings",
      default: "",
    },
  ],
  $sign: [
    {
      label: "pubkey",
      value: "pubkey",
      type: "hex",
      default: "",
    },
    {
      label: "sign",
      value: "sign",
      type: "hex",
      default: "",
    },
  ],
  // hashnet peer management events
  $peer$added: [
  ],
  // application context example
  linklabel: [
    {
      label: "actor",
      selector: ".event-actor",
      value: "textContent",
      type: "string",
      default: "",
    },
    {
      label: "target",
      selector: ".event-target",
      value: "textContent",
      type: "string",
      default: "",
    },
  ],
  bookmark: [
    {
      label: "note",
      selector: ".bookmark-note",
      value: "textContent",
      type: "string",
      default: "",
    }
  ],
};

//export
function epochContexts() {
  return fromJS(initialContexts).toJS();
}
