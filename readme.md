# Hashnet

"hashnet" is decentralized universal event system for
[anatta](https://github.com/anatta-project/anatta)

This project is a proof of concept code for building growing networks
with peers working on the hashnet architecture.

## How to setup

Preparing the code, clone with git then "npm install" to resolve dependencies.

```bash
$ git clone https://github.com/anatta-project/hashnet.git
$ cd hashnet
$ npm install
```

There are "URL bookmarking" demonstration in it.

### Console UI

Launching with console UI:

```bash
$ npm run console -- --nickname=alice

> hashnet@0.0.1 console /somewhere/to/hashnet
> node bookmark/console "--nickname=alice"

alice(f8e107e...)>
```

On the console,
you can handle all hashnet objects same style as JavaScript programming.

### System Tray GUI

Or, launching with system tray GUI:

```bash
$ npm run tray
```

After launching, "S!" icon shown on menu-bar.
Click it as menu "Network" - "nickname" to change the name.
For the tray UI, the configuration is stored.

## Next: Learn with playing on console UI

- Annotated step by step guide for bookmark demo: [doc/play.md](doc/play.md)

## For more detail

- About program design for `hashnet` objects: [doc/design.md](doc/design.md)
- About network simulation for `hashnet` strategies: [doc/simulations.md](doc/simulations.md)
