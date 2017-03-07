"use strict";

// console UI: direct object access
const repl = require("repl");
const {HashNet} = require("../hash/net");
const {Me} = require("../hash/me");
const {Bookmark} = require("./client");

function makeConsole(bookmark) {
  const hashid = bookmark.me.id.pathname.slice(0, 7);
  const prompt = `${bookmark.nickname}(${hashid}...)> `;
  const server = repl.start({prompt, useGlobal: true});
  server.context.bookmark = bookmark;
}

function main(nickname) {
  const hashnet = new HashNet();
  const me = new Me();
  const bookmark = new Bookmark(hashnet, me, nickname);
  makeConsole(bookmark);
}

main(process.argv[2] || "Taro");
