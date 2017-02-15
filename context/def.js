"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  epochContexts: {enumerable: true, get: () => epochContexts},
  updateContexts: {enumerable: true, get: () => updateContexts},
  scanContext: {enumerable: true, get: () => scanContext},
  assignContext: {enumerable: true, get: () => assignContext},
}));

// import _url from "module"; const URL = _url.URL;
const URL = require("url").URL;
const {epochContexts} = require("./boot");


//export
function updateContexts(events, contexts = epochContexts()) {
  const current = Object.assign({}, contexts);
  for (const event of events) {
    const contextAttrs = current["hash:context-added"];
    const attrs = scanContext(event, contextAttrs);
    // TBD: check in attrs.attributes: label, selector, value, type, default
    current[attrs.label] = attrs.attributes;
  }
  return current;
}


//export
function scanContext(event, contextAttributes) {
  const attrs = {};
  for (const attr of contextAttributes) {
    const node = resolveNode(event, attr);
    const value = node ? getValue(node, attr) : attr.default;
    attrs[attr.label] = getValue(node, attr);
  }
  return attrs;
}

//export
function assignContext(event, contextAttributes, attributes) {
  for (const attr of contextAttributes) {
    if (!Reflect.has(attributes, attr.label)) continue;
    const node = resolveNode(event, attr);
    putValue(node, attr, attributes[attr.label]);
  }
  return event;
}

// utils

function resolveNode(node, attr) {
  return attr.selector ? node.querySelector(attr.selector) : node;
}

function getValue(node, attr) {
  const textValue = !node ? attr.default :
        attr.value === "textContent" ? node.textContent :
        node.getAttribute(attr.value);
  return parseValue(textValue, attr);
}

function putValue(node, attr, value) {
  const textValue = encodeValue(value, attr);
  if (attr.value === "textContent") {
    node.textContent = textValue;
  } else {
    node.setAttribute(attr.value, textValue);
  }
}

function parseValue(value, attr) {
  try {
    switch (attr.type) {
    case "string": return String(value);
    case "number": return Number(value);
    case "boolean": return Boolean(value);
    case "strings": return String(value).split(",");
    case "hex": return Buffer.from(value, "hex");
    case "JSON": return JSON.parse(value);
    case "Date": return new Date(value);
    case "URL": return new URL(value);
    }
  } catch (err) {}
  return "";
}

function encodeValue(value, attr) {
  try {
    switch (attr.type) {
    case "string": return value;
    case "number": return String(value);
    case "boolean": return String(value);
    case "strings": return String(value);
    case "hex": return value.toString("hex");
    case "JSON": return JSON.stringify(value);
    case "Date": return value.toISOString();
    case "URL": return String(value);
    }
  } catch (err) {}
  return attr.default;
}
