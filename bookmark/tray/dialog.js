"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  DialogMain: {enumerable: true, get: () => DialogMain},
  DialogRenderer: {enumerable: true, get: () => DialogRenderer},
  popupDataList: {enumerable: true, get: () => popupDataList},
}));


//export
class DialogMain {
  constructor(channelName = "--dialog") {
    const {BrowserWindow, ipcMain} = require("electron");
    this.channelName = channelName;
    this.frame = new BrowserWindow({
      center: true, show: false, frame: false, transparent: true,
    });
    this.ipcMain = ipcMain;

  }
  open(url, bounds, data = {}, withDevTools = false) {
    return new Promise((f, r) => {
      if (this.frame.isVisible()) {
        r(Error("[dialog] yet in-busy"));
        return;
      }
      this.ipcMain.once(this.channelName, (ev, msg) => {
        //capture result
        this.frame.hide();
        if (msg.isError) r(msg.error);
        else f(msg.value);
      });
      this.frame.webContents.once("did-finish-load", () => {
        this.frame.webContents.send(this.channelName, data);
        this.frame.show();
      });
      if (withDevTools) this.frame.openDevTools();
      if (Reflect.has(bounds, "width") &&
          Reflect.has(bounds, "height")) {
        const w = bounds.width + (withDevTools ? 900 : 0);
        const h = bounds.height + (withDevTools ? 600 : 0);
        this.frame.setSize(w, h);
      }
      if (Reflect.has(bounds, "x") && Reflect.has(bounds, "y")) {
        this.frame.setPosition(bounds.x, bounds.y);
      } else {
        this.frame.center();
      }
      this.frame.loadURL(url);
    });
  }
}

//export
class DialogRenderer {
  constructor(onInit = data => {}, channelName = "--dialog") {
    const {ipcRenderer} = require("electron");
    this.channelName = channelName;
    this.ipcRenderer = ipcRenderer;
    this.ipcRenderer.once(this.channelName, (ev, data) => {
      this.data = data;
      onInit(data);
    });
  }
  resolve(value) {
    if (!this.ipcRenderer) return;
    this.ipcRenderer.send(this.channelName, {value});
    this.ipcRenderer = null;
  }
  reject(error) {
    if (!this.ipcRenderer) return;
    this.ipcRenderer.send(this.channelName, {isError: true, error});
    this.ipcRenderer = null;
  }
}

//export
function popupDataList() {
  const {Menu} = require("electron").remote;
  Array.from(document.querySelectorAll("input[list]")).forEach(input => {
    input.addEventListener("click", (ev) => {
      const {width, height} = ev.target.getBoundingClientRect();
      if (ev.offsetX < width - height) return;
      const dataList = document.getElementById(ev.target.getAttribute("list"));
      if (!dataList) return;
      const menu = Array.from(dataList.querySelectorAll("option"), opt => ({
        label: opt.value,
        click() {ev.target.value = opt.value;},
      }));
      const popup = Menu.buildFromTemplate(menu);
      popup.popup();
    }, false);
  });
}
