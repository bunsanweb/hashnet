"use strict";

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

function makeConsole(vars) {
  const hashid = vars.bookmark.me.id.pathname.slice(0, 7);
  const prompt = `${vars.bookmark.nickname}(${hashid}...)> `;
  const server = repl.start({prompt, useGlobal: true});
  Object.assign(server.context, vars);
}

function main() {
  const argv = yargs.string("nickname").argv;

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
  makeConsole({hub, publisher, attending, web, bookmark});
}

main();
