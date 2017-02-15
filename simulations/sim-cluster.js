"use strict";

const context = require("./context");

const diff = (a, b) => {
  const r = new Set();
  for (const v of a) if (!b.has(v)) r.add(v);
  return r;
};

function bins(a, binSize, binMax = binSize) {
  //console.assert(Number.isInteger(Math.log2(binSize)));
  let chunkSize = binSize;
  let index = 0;
  const bins = [];
  while (index < a.length) {
    bins.push(a.slice(index, index + binMax));
    index += chunkSize;
    chunkSize *= binSize;
  }
  return bins;
}


function checkCluster(peers, binSize, max = binSize) {
  const ordered = Array.from(peers);
  ordered.sort((a, b) => b.sent - a.sent);

  // ordered list of {id, distance}
  const distances = ordered.map(p => [p.id, context.computeDistances(p)]);
  const distancesMap = new Map(distances);

  let cluster = new Set([ordered[0].id]);
  let step = 0;
  while (true) {
    const next = new Set([].concat(...Array.from(
      cluster,
      id => {
        const ids = distancesMap.get(id).map(e => e.id).slice(1);
        const pickuped = [id].concat(...bins(ids, binSize, max));
        return pickuped;
      })));
    if (cluster.size === next.size) break;
    cluster = next;
    step++;
  }

  console.log("cluster", step, cluster.size, cluster);
  const all = new Set(peers.map(p => p.id));
  const excluded = diff(all, cluster);
  console.log("diff", cluster.size / all.size, excluded);
  for (const p of ordered) {
    console.log(p.id, p.sent);
  }
}
exports.checkCluster = checkCluster;
