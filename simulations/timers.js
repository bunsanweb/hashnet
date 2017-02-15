"use strict";

const channels = require("./channels");
const filter = require("./filter");

// Timeout node: someone to send Date to pub, then reached, spawn to sub
function Timeout(pub, sub) {
  return new filter.Filter(timeout => {
    const msec = timeout instanceof Date ?
          timeout.getTime() - Date.now() : timeout;
    return new Promise(f => setTimeout(() => f(timeout), msec));
  }, pub, sub);
}

exports.Timeout = Timeout;
