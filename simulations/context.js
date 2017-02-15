"use strict";

// set utility
function union(s1, s2) {
  return new Set([...s1, ...s2]);
}
function intersection(s1, s2) {
  const r = new Set();
  for (const e of s2) if (s1.has(e)) r.add(e);
  return r;
}

// event structure: {peer: "idhash", contexts: ["c1", "c2", ...], ...}

// TBD example distance by context set
function distance(c1, c2) {
  return 1 - intersection(c1, c2).size / union(c1, c2).size;
}
function distance(c1, c2) {
  // 1 - cos: 1 - dot(normalize(c1), normalize(c2))
  return 1 - intersection(c1, c2).size /
    (Math.sqrt(c1.size) * Math.sqrt(c2.size));
}

function computeDistances(peer, dist = distance) {
  const idMap = new Map();
  for (const event of peer.queue.values()) {
    const s = idMap.get(event.peer);
    if (s) {
      for (let c of event.contexts) s.add(c);
    } else {
      idMap.set(event.peer, new Set(event.contexts));
    }
  }

  const me = idMap.get(peer.id) || new Set();
  const result = [];
  for (const [id, contexts] of idMap) {
    const d = dist(me, contexts);
    const i = result.findIndex(r => d < r.distance);
    result.splice(i < 0 ? result.length : i, 0, {id, distance: d});
  }
  return result;
}

exports.computeDistances = computeDistances;
exports.defaultDistance = distance;
