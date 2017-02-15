"use strict";

const crypto = require("crypto");

const peers = Array.from(Array(1024), _ => crypto.randomBytes(8));

function dist(a, b) {
  let len = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) len += 8;
    else {
      len += Math.clz32(a[i] ^ b[i]) - 24;
      break;
    }
  }
  return a.length * 8 - len;
}

function refCount(id, peers) {
  return new Set(peers.map(oid => dist(id, oid))).size - 1;
}

function makeBins(peers) {
  const peerBins = new Map();
  for (const id of peers) {
    const bins = new Map();
    for (const oid of peers) {
      bins.set(dist(id, oid), oid);
    }
    peerBins.set(id, Array.from(bins.values()));
  }
  return peerBins;
}
function steps(peers) {
  const peerBins = makeBins(peers);
  return peers.map(id => {
    const propagated = new Set();
    let next = new Set([id]);
    let step = 0;
    while (next.size > 0) {
      for (const oid of next) propagated.add(oid);
      const newids = new Set();
      for (const oid of next) {
        for (const nid of peerBins.get(oid)) {
          if (!propagated.has(nid)) newids.add(nid);
        }
      }
      next = newids;
      step++;
    }
    return step;
  });
}


function* hist(sorted) {
  if (sorted.length === 0) return;
  let h = {value: sorted[0], count: 0};
  for (const v of sorted) {
    if (h.value !== v) {
      yield h;
      h = {value: v, count: 1};
    } else h.count++;
  }
  yield h;
}

const refs = peers.map(id => refCount(id, peers)).sort((a, b) => a - b);
const h = Array.from(hist(refs));
console.log(h);

// stats of bins
const ave = h.reduce((s, h) => s + h.value * h.count, 0) / peers.length;
const dis = h.reduce(
  (s, h) => s + Math.pow(ave - h.value, 2) * h.count, 0) / peers.length;
console.log("average", ave);
console.log("distribution", dis);

// propagated steps from each peer
const ss = steps(peers).sort((a, b) => a - b);
const sh = Array.from(hist(ss));
console.log(sh);
