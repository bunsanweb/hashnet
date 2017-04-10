"use strict";

// [run the app]
// $ npm install electron
// $ ./node_modules/.bin/electron .

const os = require("os");
const {URL} = require("url");
const {
  app, clipboard, globalShortcut, nativeImage,
  BrowserWindow, Menu, MenuItem, Tray,
} = require("electron");

const {captureUrl} = require("./capture/index");
const {boot} = require("../boot");


let top = {}; // prevent gc to keep windows

// TBD: use stored config
const env = boot({});

if (app.dock) app.dock.hide();
app.once("ready", ev => {
  // hidden notification window
  top.notify = new BrowserWindow({show: false});
  top.notify.loadURL(`${new URL(`file:${__dirname}/notify.html`)}`);

  // spawn url as system notification
  env.bookmark.on("arrived", bk => {
    const url = `${bk.$event.target}`;
    const hash = `${bk.$event.actor.pathname.slice(0, 16)}...`;
    const nickname = bk.linklabel.actor;
    top.notify.webContents.send("notify", {url, hash, nickname});
  });

  // tray
  top.tray = new Tray(nativeImage.createEmpty());
  const menuTemplate = buildMenuTemplate();
  const menu = Menu.buildFromTemplate(menuTemplate);
  top.tray.setToolTip("Share Chrome URL");
  top.tray.setContextMenu(menu);

  // shortcut command
  globalShortcut.register("CmdOrCtrl+Shift+B", () => {
    captureToPost();
  });

  // Option: some animated web site to tray icon image
  // see: https://electron.atom.io/docs/tutorial/offscreen-rendering/
  top.icons = new BrowserWindow({
    show: false, width: 16, height: 16,
    webPreferences: {offscreen:true}});
  //top.icons.loadURL("https://trends.google.com/trends/hottrends/visualize");
  top.icons.loadURL(`${new URL(`file:${__dirname}/icon.svg`)}`);
  top.icons.webContents.on("paint", (event, dirty, image) => {
    if (top.tray) top.tray.setImage(image.resize({width: 16, height: 16}));
  });
});
app.on("before-quit", ev => {
  top = null;
  globalShortcut.unregisterAll();
});

function captureToPost() {
  captureUrl().then(result => {
    env.bookmark.post(result.url);
  }, err => null);
}

function buildMenuTemplate() {
  const port = env.web.address.port;
  const ifs = os.networkInterfaces();
  const ifouts = [].concat(...Object.keys(ifs).map(name => ifs[name].map(
    ifd => Object.assign({name}, ifd)))).filter(
      ifd => !ifd.internal && ifd.family === "IPv4"); //TBD: IPv6
  const hostnames = ifouts.map(ifd => {
    const urlAddr = ifd.family === "IPv6" ? `[${ifd.address}]`: ifd.address;
    const urlText = `http://${urlAddr}:${port}/`;
    return {
      label: `${ifd.name}: ${urlText}`,
      click: () => {
        clipboard.writeText(urlText);
      },
    };
  });

  return [
    {
      label: "Share URL",
      accelerator: "CmdOrCtrl+Shift+B",
      click: (item, window, event) => {
        captureToPost();
      },
    },
    {type: "separator"},
    {
      label: "Copy My hostname",
      submenu: hostnames,
    },
    {type: "separator"},
    {role: "quit"}, // "role": system prepared action menu
  ];
}
