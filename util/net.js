"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  hostInterfaces: {enumerable: true, get: () => hostInterfaces},
  hostAddresses: {enumerable: true, get: () => hostAddresses},
}));

const os = require("os");

function hostInterfaces() {
  const ifs = os.networkInterfaces();
  return [].concat(...Object.keys(ifs).map(name => ifs[name].map(
    ifd => Object.assign({name}, ifd))));
}

function hostAddresses(family = "IPv4") {
  return hostInterfaces().filter(d => !d.internal && d.family === family).map(
    d => d.address);
}
