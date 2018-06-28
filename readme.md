# Hashnet

"hashnet" is a decentralized universal event system for
[bunsanweb](https://github.com/bunsanweb/bunsanweb)

This repo is a proof of concept for building growing networks
with peers working on the hashnet architecture.

## Setup

Clone the repo and then run "npm install" to resolve dependencies.

```bash
$ git clone https://github.com/bunsanweb/hashnet.git
$ cd hashnet
$ npm install
```

A "URL bookmarking" demonstration is included.

### Console UI

Launching with console UI:

```bash
$ npm run console -- --nickname=alice

> hashnet@0.0.1 console /somewhere/to/hashnet
> node bookmark/console "--nickname=alice"

alice(f8e107e...)>
```

On the console,
you can handle all hashnet objects using JavaScript coding conventions.

### System Tray GUI

Launching the system tray GUI:

```bash
$ npm run tray
```

After launching, a "S!" icon will appear in the menubar.
Select menu "Network" - "Nickname" to change the name of your network.
The configuration for the tray UI, is stored.

## Next: Playing with the console UI

- Annotated step-by-step guide for bookmark demo: [doc/play.md](doc/play.md)

## For more details

- About program design for `hashnet` objects: [doc/design.md](doc/design.md)
- Network simulation for strategies `hashnet`: [doc/simulation.md](doc/simulation.md)
