"use strict";

window.addEventListener("load", ev => {
  const {DialogRenderer} = require("../dialog");
  const input = document.getElementById("nickname");
  const dialog = new DialogRenderer(data => {
    input.value = data.nickname;
  });
  document.getElementById("ok").addEventListener("click", () => {
    if (!input.validity.valid) return;
    dialog.resolve({update: true, nickname: input.value});
  }, false);
  document.getElementById("cancel").addEventListener("click", () => {
    dialog.reject({canceled: true});
  }, false);
}, false);
