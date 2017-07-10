# Hashnet

"hashnet" is decentralaized universal event system for
[anatta platform](https://github.com/anatta-project/anatta)

This project is a proof of cencept code of the hashnet.

## howto

Preparing the code, clone with git then "npn install" to resolve dependencies.

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

> hashnet@0.0.1 console /Users/bellbind/projects/hashnet
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

After launching, "S!" icon shown on menubar.
Click it as menu "Network" - "nickname" to change the name.
For the tray UI, the configuration is stored.

## Next: Learn with playing on console UI

see: [doc/play.md](doc/play.md)

## For more detail

see: [doc/design.md](doc/design.md)
