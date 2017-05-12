"use strict";

// [run the app]
// $ npm install electron
// $ ./node_modules/.bin/electron .

const {URL} = require("url");
const electron = require("electron");
const {
  app, clipboard, globalShortcut, nativeImage,
  BrowserWindow, Menu, MenuItem, Tray,
} = require("electron");

const {hostInterfaces, hostAddresses} = require("../../util/net");
const {Config} = require("../config");
const {boot} = require("../boot");
const {captureUrl} = require("./capture/index");
const {DialogMain} = require("./dialog");

let top = {}; // prevent gc to keep windows

const config = new Config(app.getPath("userData"));
const env = boot(config.load(), () => {
  config.update({port: env.web.address.port}).catch(console.error);
});

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
  globalShortcut.register("CmdOrCtrl+Shift+B", captureToPost);
  globalShortcut.register("CmdOrCtrl+Shift+L", listURLBookmarks);

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


// tray dialog bounds: its width relative to the screen width
function trayDialogBounds(heightRate) {
  //NOTE: cannot access screen before app "ready"
  const screenWidth = electron.screen.getPrimaryDisplay().workAreaSize.width;
  const width = Math.round(screenWidth * 0.15);
  const height = Math.round(screenWidth * 0.15 * heightRate);
  const {x, y} = top.tray.getBounds();
  return {x, y, width, height};
}

// actions
function captureToPost() {
  captureUrl().then(result => {
    env.bookmark.post(result.url);
  }, err => null);
}
function listURLBookmarks() {
  const src = `file://${__dirname}/list-bookmark/index.html`;
  captureUrl().then(result => {
    const url = result.url;
    const bookmarks = env.bookmark.query(url).map(ev => ev.$$.dom.outerHTML);
    top.dialog.open(src, trayDialogBounds(2), {url, bookmarks}).
      then(result => {}, error => {});
  }, err => null);
}
function updateNickname() {
  const src = `file://${__dirname}/nickname/index.html`;
  const nickname = env.bookmark.nickname;
  top.dialog.open(src, trayDialogBounds(0.5), {nickname}).
    then(({nickname}) => {
      env.bookmark.nickname = nickname;
      config.update({nickname}).catch(console.error);
    }, error => {});
}
function addSubscribingPeer() {
  const src = `file://${__dirname}/hub-add/index.html`;
  top.dialog.open(src, trayDialogBounds(0.5)).
    then(result => env.hub.add(result.url), error => {});
}
function requestAttendingNetwork() {
  const src = `file://${__dirname}/attending-request/index.html`;
  const port = env.web.address.port;
  const meList = hostAddresses().map(host => `http://${host}:${port}/`);
  top.dialog.open(src, trayDialogBounds(0.75), {meList}).
    then(result => env.attending.request(result.peer, result.me), error => {});
}

// menu
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
      click: captureToPost,
    },
    {
      label: "List URL Bookmark",
      accelerator: "CmdOrCtrl+Shift+L",
      click: listURLBookmarks,
    },
    {type: "separator"},
    {
      label: "Network",
      submenu: [
        {
          label: "Nickname",
          click: updateNickname,
        },
        {
          label: "Add Subscribing Peer",
          click: addSubscribingPeer,
        },
        {
          label: "Request Attending Network",
          click: requestAttendingNetwork,
        },
        {type: "separator"},
        {
          label: "Copy My hostname",
          submenu: hostnames,
        },
      ],
    },
    {type: "separator"},
    {role: "quit"}, // "role": system prepared action menu
  ];
}
