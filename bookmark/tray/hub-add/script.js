"use strict";

window.addEventListener("load", ev => {
  const {DialogRenderer} = require("../dialog");
  const input = document.getElementById("url");
  const dialog = new DialogRenderer(data => {
    input.value = "";
  });
  document.getElementById("ok").addEventListener("click", () => {
    if (!input.validity.valid) return;
    try {
      const url = new URL(input.value);
      dialog.resolve({add: true, url: `${url}`});
    } catch (err) {}
  }, false);
  document.getElementById("cancel").addEventListener("click", () => {
    dialog.reject({canceled: true});
  }, false);
}, false);
