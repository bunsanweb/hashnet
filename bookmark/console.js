"use strict";

// console UI: direct object access
const repl = require("repl");
const yargs = require("yargs");

const {boot} = require("./boot");

function makeConsole(vars) {
  const hashid = vars.bookmark.me.id.pathname.slice(0, 7);
  const prompt = `${vars.bookmark.nickname}(${hashid}...)> `;
  const server = repl.start({prompt, useGlobal: true, useColor: true});
  Object.assign(server.context, vars);
  return server;
}

function main() {
  const argv = yargs.option("nickname", {
    type: "string",
    describe: "A nickname for bookmark event",
  }).option("port", {
    type: "number",
    describe: "A port number (>= 1000, < 65535) for site",
  }).option("me", {
    type: "string",
    describe: "The private key hex string (64 characters) for me",
  }).option("sitekey", {
    type: "string",
    describe: "The private key hex string (64 characters) for sitekey",
  }).config("config").help("help").argv;
  const vars = boot(argv);
  const server = makeConsole(vars);
  function output(...args) {
    console.log("");
    console.log(...args);
    console.log("");
    server.displayPrompt();
  }

  vars.bookmark.on("arrived", bk => {
    output(`[${bk.$event$target} bookmarked by ${bk.$event$actor}]`);
  });
  server.on("exit", () => {
    console.log("");
    process.exit(0);
  });
}

main();
