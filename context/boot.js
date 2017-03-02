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
      value: "textContent",
      type: "URL",
      default: "hash:",
    },
    {
      label: "target",
      selector: ".event-actor",
      value: "textContent",
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
  ],
};

//export
function epochContexts() {
  return fromJS(initialContexts).toJS();
}
