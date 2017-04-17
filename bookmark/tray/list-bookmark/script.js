"use strict";

window.addEventListener("load", ev => {
  const {DialogRenderer} = require("../dialog");
  const url = document.getElementById("url");
  const bookmarks = document.getElementById("bookmarks");
  const dialog = new DialogRenderer(data => {
    url.textContent = data.url;
    bookmarks.innerHTML = "";
    if (data.bookmarks.length === 0) {
      bookmarks.innerHTML = `No Bookmarks`;
    } else {
      data.bookmarks.forEach(html => {
        const iframe = document.createElement("iframe");
        iframe.src = `data:text/html,${html}`;
        bookmarks.appendChild(iframe);
      });
    }
  });
  document.getElementById("ok").addEventListener("click", () => {
    dialog.resolve({closed: true});
  }, false);
}, false);
