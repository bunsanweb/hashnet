"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  promisify: {enumerable: true, get: () => promisify},
}));


function promisify(func) {
  return (...argv) => new Promise(
      (f, r) => func(...argv, (err, data) => err ? r(err) : f(data)));
}
