"use strict";

module.exports = Object.freeze(Object.create(null, {
  __esModule: {value: true}, [Symbol.toStringTag]: {value: "Module"},
  boot: {enumerable: true, get: () => boot},
}));

// console UI: direct object access
const repl = require("repl");
const yargs = require("yargs");

const {HashNet} = require("../hash/net");
const {Me} = require("../hash/me");
const {Publisher} = require("../site/publisher");
const {SiteKey} = require("../site/sitekey");
const {Sync} = require("../site/sync");
const {Attending} = require("../site/attending");
const {Web} = require("../site/web");
const {Hub} = require("../hub/core");
const {Watcher} = require("../hub/watcher");
const {FullMesh} = require("../hub/fullmesh");
const {Bookmark} = require("./client");

function boot(argv = {}) {
  const hashnet = new HashNet();
  const me = new Me();
  const bookmark = new Bookmark(hashnet, me, argv.nickname);
  const publisher = new Publisher(me.pubkey);
  const sitekey = new SiteKey();
  const attending = new Attending(sitekey, publisher);
  const web = new Web(publisher, sitekey);
  const sync = new Sync(hashnet, me, publisher);
  const hub = new Hub(hashnet, me);
  hub.addMySite(sitekey.id);
  hub.run(new FullMesh());
  const watcher = new Watcher(hub);

  web.start();
  return {hashnet, me, hub, sitekey, publisher, web, attending, bookmark};
}
