"use strict";

window.addEventListener("load", ev => {
  const {DialogRenderer} = require("../dialog");
  const peer = document.getElementById("peer");
  const me = document.getElementById("me");
  const meList = document.getElementById("me-list");
  const dialog = new DialogRenderer(data => {
    data.meList.forEach(meUrl => {
      const option = document.createElement("option");
      option.value = meUrl;
      meList.appendChild(option);
    });
  });
  document.getElementById("ok").addEventListener("click", () => {
    if (!peer.validity.valid || !me.validity.valid) return;
    try {
      const peerUrl = new URL(peer.value);
      const meUrl = new URL(me.value);
      dialog.resolve({add: true, peer: `${peerUrl}`, me: `${meUrl}`});
    } catch (err) {}
  }, false);
  document.getElementById("cancel").addEventListener("click", () => {
    dialog.reject({canceled: true});
  }, false);
}, false);
