"use strict";

// console UI: direct object access
const repl = require("repl");
const {HashNet} = require("../hash/net");
const {Me} = require("../hash/me");
const {Publisher} = require("../site/publisher");
const {Sync} = require("../site/sync");
const {Web} = require("../site/web");
const {Bookmark} = require("./client");

function makeConsole(vars) {
  const hashid = vars.bookmark.me.id.pathname.slice(0, 7);
  const prompt = `${vars.bookmark.nickname}(${hashid}...)> `;
  const server = repl.start({prompt, useGlobal: true});
  Object.assign(server.context, vars);
}

function main(nickname) {
  const hashnet = new HashNet();
  const me = new Me();
  const bookmark = new Bookmark(hashnet, me, nickname);
  const publisher = new Publisher(me.pubkey);
  const sync = new Sync(hashnet, me, publisher);
  const web = new Web(publisher);
  makeConsole({bookmark, publisher, web});
}

main(process.argv[2] || "Taro");
