"use strict";

const diff = (a, b) => {
  const r = new Set();
  for (const v of a) if (!b.has(v)) r.add(v);
  return r;
};

function huffmanDistance(hexA, hexB) {
  // compare from upper(big) bytes and upper bits
  const a = Buffer.from(hexA, "hex");
  const b = Buffer.from(hexB, "hex");
  console.assert(a.length === b.length);

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

function huffmanCluster(peers) {
  const peerIds = peers.map(p => p.id);
  let cluster = new Set([peerIds[0]]);
  while (true) {
    const next = new Set([].concat(...Array.from(
      cluster,
      id => {
        const dists = peerIds.map(pid => huffmanDistance(id, pid));
        const bins = Array(id.length * 4);
        dists.forEach((d, i) => {
          bins[d] = peerIds[i];
        });
        return bins.filter(_ => true);
      })));
    if (cluster.size === next.size) break;
    cluster = next;
  }

  //console.log("huffman cluster", cluster.size, cluster);
  console.log("huffman cluster", cluster.size);
  const all = new Set(peerIds);
  const excluded = diff(all, cluster);
  //console.log("diff", cluster.size / all.size, excluded);
  console.log("diff", cluster.size / all.size);
}
exports.huffmanCluster = huffmanCluster;
