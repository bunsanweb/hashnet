"use strict";

// [run the app]
// $ npm install electron
// $ ./node_modules/.bin/electron .

const {URL} = require("url");
const {app, globalShortcut, nativeImage, Tray, Menu, BrowserWindow} =
      require("electron");

const {captureUrl} = require("./capture/index");
const {boot} = require("../boot");


let top = {}; // prevent gc to keep windows

// TBD: use stored config
const env = boot({});

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
  const menu = Menu.buildFromTemplate([
    {
      label: "Share URL (\u{2318}\u{21e7}B)",
      click: (item, window, event) => {
        captureToPost();
      },
    },
    {type: "separator"},
    {role: "quit"}, // "role": system prepared action menu
  ]);
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
