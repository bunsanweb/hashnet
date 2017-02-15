"use strict";

const crypto = require("crypto");

exports.gasync = (gfunc) => (...arg) => new Promise((f, r) => {
  const g = gfunc(...arg), n = r => g.next(r), t = r => g.throw(r);
  const step = item => item.done ? f(item.value) :
        Promise.resolve(item.value).then(n, t).then(step, r);
  step(n());
});

exports.irange = function* (n, f = i => i) {
  for (let i = 0; i < n; i++) yield f(i);
};
exports.range = (n, f = i => i) => Array.from(exports.irange(n, f));

exports.izip = function* (...as) {
  const its = as.map(a => a[Symbol.iterator]());
  for (let rs = its.map(it => it.next()); rs.every(r => !r.done);
       rs = its.map(it => it.next())) yield rs.map(r => r.value);
};
exports.zip = (...as) => Array.from(exports.izip(...as));

exports.ringGet = (a, i) => a[((i % a.length) + a.length) % a.length];
exports.ringSet = (a, i, v) => a[((i % a.length) + a.length) % a.length] = v;

exports.delay = (ms) => new Promise(f => setTimeout(f, ms, ms));
exports.timeout = (ms) => new Promise((f, r) => setTimeout(r, ms, ms));

exports.randomPick = (a) => a[
  new Uint32Array(crypto.randomBytes(4).buffer)[0] % a.length];
