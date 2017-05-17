!function () {
"use strict";

// Workaround for "datalist" popup for "input" element in Electron
// - unsolved issue: https://github.com/electron/electron/issues/360

function popupListener(ev) {
    const {remote} = require("electron");
    const {Menu, getCurrentWindow} = remote;
    const {left, bottom, width, height} = ev.target.getBoundingClientRect();
    // popup only in right square
    if (ev.offsetX < width - height) return;
    const id = ev.target.getAttribute("list");
    if (!id) return;
    const query = `datalist#${id} > option`;
    const menu = Array.from(document.querySelectorAll(query), opt => ({
        label: opt.value,
        click() {ev.target.value = opt.value;},
    }));
    const popup = Menu.buildFromTemplate(menu);
    //NOTE: popup position must cast to int (client rect is float)
    const options = {x: left|0, y: bottom|0, async: false}; 
    ev.preventDefault();
    popup.popup(remote.getCurrentWindow(), options);
}

// inject existing inputs
Array.from(document.querySelectorAll("input")).forEach(input => {
    input.addEventListener("click", popupListener, false);
});

// future inputs by using mutation observer
const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
        if (m.type !== "childList") return;
        Array.from(m.addedNodes).forEach(node => {
            if (node.nodeType !== 1 || node.tagName !== "INPUT") return;
            node.addEventListener("click", popupListener, false);
        });
        Array.from(m.removedNodes).forEach(node => {
            if (node.nodeType !== 1 || node.tagName !== "INPUT") return;
            node.removeEventListener("click", popupListener, false);
        });
    });
});
observer.observe(document.body, {childList: true, subtree: true});
}();
