"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  Config: {enumerable: true, get: () => Config},
}));

const fs = require("fs");
const {join} = require("path");

function promissify(func) {
  return (...argv) => new Promise(
      (f, r) => func(...argv, (err, data) => err ? r(err) : f(data)));
}
const writeFile = promissify(fs.writeFile);


class Config {
  constructor(dir, name = ".bookmark.config.js") {
    this.path = join(dir, name);
  }
  load() {
    try {
      return JSON.parse(fs.readFileSync(this.path, "utf8"));
    } catch (err) {
      return {};
    }
  }
  store(conf) {
    return new Promise((f, r) => {
      const json = Buffer.from(JSON.stringify(conf, null, "  "), "utf8");
      writeFile(this.path, json).then(f, r);
    });
  }
  update(part) {
    return this.store(Object.assign(this.load(), part));
  }
  complement(part) {
    return this.store(Object.assign({}, part, this.load()));
  }
}
