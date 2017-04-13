"use strict";

// [run the app]
// $ npm install electron
// $ ./node_modules/.bin/electron .

const {URL} = require("url");
const {
  app, clipboard, globalShortcut, nativeImage,
  BrowserWindow, Menu, MenuItem, Tray,
} = require("electron");

const {hostInterfaces} = require("../../util/net");
const {boot} = require("../boot");
const {captureUrl} = require("./capture/index");
const {DialogMain} = require("./dialog");

let top = {}; // prevent gc to keep windows

// TBD: use stored config
const env = boot({});

if (app.dock) app.dock.hide();
app.once("ready", ev => {
  // hidden notification window
  top.notify = new BrowserWindow({show: false});
  top.notify.loadURL(`${new URL(`file:${__dirname}/notify.html`)}`);
  top.dialog = new DialogMain();

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
function addSubscribingPeer() {
  const src = `file://${__dirname}/hub-add/index.html`;
  const {x, y} = top.tray.getBounds();
  top.dialog.open(src, {x, y, width: 400, height: 200}).
    then(result => env.hub.add(result.url), error => {});
}


function buildMenuTemplate() {
  const port = env.web.address.port;
  const ifouts = hostInterfaces().filter(
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
    {
      label: "Network",
      submenu: [
        {
          label: "Add Subscribing Peer",
          click: (item, window, event) => {
            addSubscribingPeer();
          },
        }
      ],
    },
    {type: "separator"},
    {role: "quit"}, // "role": system prepared action menu
  ];
}
