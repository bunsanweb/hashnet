# Learn with building bookmark network

For understanding the hashnet architecture,
this article lists the commentaries
with each steps for playing the `hashnet` `bookmark` demo.

---

## Boot console UI and `me`

At first, **run console UI** as "alice"

```bash
$ npm run console -- --nickname=alice

> hashnet@0.0.1 console /somewhere/to/hashnet
> node bookmark/console "--nickname=alice"

alice(78f8867...)>
```

<!-- alice: 9313ce1c618d412ca6e1eeffc53e181c24e54249d045624bcc18302a9a178c7 -->

The "78f867..." is the **identity** (also called ID) fragment of alice.
The identity is stored on `me` object as:

```
alice(78f8867...)> me.id
URL {
  href: 'hash:78f886732fa66bef0ca83f571b1328986d308046cbbbed02c9c17fc87bd2b3ed',
  origin: 'null',
  protocol: 'hash:',
  username: '',
  password: '',
  host: '',
  hostname: '',
  port: '',
  pathname: '78f886732fa66bef0ca83f571b1328986d308046cbbbed02c9c17fc87bd2b3ed',
  search: '',
  searchParams: URLSearchParams {},
  hash: '' }
alice(78f8867...)>
```

The identity value is just **SHA256 hex digest** of the public key of `me" as:

```
alice(78f8867...)> crypto.createHash("sha256").update(me.pubkey).digest("hex")
'78f886732fa66bef0ca83f571b1328986d308046cbbbed02c9c17fc87bd2b3ed'
```

The key pair is randomly generated on boot time.
Or, you can use the own private key with the option `--me`
as `--me=9313ce1c618d412ca6e1eeffc53e181c24e54249d045624bcc18302a9a178c77`.

(The private key is yet revealed at `me.me.privkey`).

---

## "Put" an event via `bookmark.post()`

The console program includes **simple "Bookmark sharing" demo**.
It shares any URLs over the internet **as events** of the `hashnet`.

To share the `http://example.com/` as:

```
alice(78f8867...)> bookmark.post("http://example.com")
undefined
```

The `bookmark` object also notice arrived "bookmark" event as:

```
[http://example.com/ bookmarked by hash:78f886732fa66bef0ca83f571b1328986d308046cbbbed02c9c17fc87bd2b3ed]
```

Print out the notice as "[URL bookmarked by ID]".
It is the URL just shared before and alice's ID.

The `bookmark` is an application of `hashnet`.
The "event" for bookmarking example.com URL is listed in it.

```
alice(78f8867...)> hashnet.arrival
[ Event {} ]
```

### Note: About the `Event` structure

The **`Event` object** is a `Proxy` object of `DOMElement` for the event HTML data.
The raw DOM tree is available at the `event.$$.dom` property as:

```
alice(78f8867...)> hashnet.arrival[0].$$.dom.outerHTML
'<article class="hash-event" id="6f7c49828d0e5d7bd3e2911ddfae0edac967ddc9f4e531a4a869ce932f64ac86" pubkey="0425631f6cee3a496436ba99af719d785a99e11325f5ef43a725180a0589cbcb3ad9aaaaf1904ccf0f9d1ee863f32913ae731f226a05fa3e500effb4949cc91657" sign="30450221009f3404e78e02669222d7304a51ca7ed1e9a3fc429891200c167d6330b20d46e302203eb12dd8aed9d6c0c5d06fd6ee868c253ecde26690a84b1210e1f0173a320ac5">\n  <div>\n    <h1>bookmark to http://example.com</h1>\n    <div class="bookmark-note"></div>\n</div>\n  <div>\n    <a class="event-actor" href="hash:78f886732fa66bef0ca83f571b1328986d308046cbbbed02c9c17fc87bd2b3ed">alice</a>\n    <span class="event-action">bookmark</span>\n    to <a class="event-target" href="http://example.com/">http://example.com</a>\n    at: <span class="event-timestamp">2017-07-06T08:45:15.031Z</span>\n  </div>\n  <div>contexts: <span class="event-contexts">linklabel,bookmark</span></div>\n</article>'
```

The event format is **usual HTML DOM tree** as the `article` tag.
It embeds many **attributes** of the event information. For example:

- `id`: The event id based on the sha256 **hex digest of the `innerHTML`**
- `sign`: Digital **signature for the `id`** by the event publisher(called as **"actor"**)
- `pubkey`: Public key hex of the actor (**outside** of the signed data)
- `event-actor`: Identity URL of the actor (embedded **in** the signed data)
- `event-contexts`: denotes carried information on the event, called **contexts**.

The "event-context" values in the event are "linklabel" and "bookmark".
You can access these attributes for the contexts as `Event` object properties like:

```
alice(78f8867...)> hashnet.arrival[0].bookmark
{ note: '' }
```

or directly attribute access with `context$attribute` navigation as:

```
alice(78f8867...)> hashnet.arrival[0].bookmark$note
''
```

The **system contexts** for the hashnet itself named as `$xxxx`.
For example, the context of the basic event properties is `$event"`


```
alice(78f8867...)> hashnet.arrival[0].$event
{ id: '6f7c49828d0e5d7bd3e2911ddfae0edac967ddc9f4e531a4a869ce932f64ac86',
  actor:
   URL {
     href: 'hash:78f886732fa66bef0ca83f571b1328986d308046cbbbed02c9c17fc87bd2b3ed',
     origin: 'null',
     protocol: 'hash:',
     username: '',
     password: '',
     host: '',
     hostname: '',
     port: '',
     pathname: '78f886732fa66bef0ca83f571b1328986d308046cbbbed02c9c17fc87bd2b3ed',
     search: '',
     searchParams: URLSearchParams {},
     hash: '' },
  target:
   URL {
     href: 'http://example.com/',
     origin: 'http://example.com',
     protocol: 'http:',
     username: '',
     password: '',
     host: 'example.com',
     hostname: 'example.com',
     port: '',
     pathname: '/',
     search: '',
     searchParams: URLSearchParams {},
     hash: '' },
  action: 'bookmark',
  timestamp: 2017-07-06T08:45:15.031Z,
  contexts: [ 'linklabel', 'bookmark' ] }
```

The properties are **typed data extended as: `URL`, `Date` `strings` and `JSON Object`**.
It can retrieved from the DOM tree and also set into it the same way.

The context attributes definitions are kept in `hashnet.contexts` as:

```
alice(78f8867...)> hashnet.contexts.$event
[ { label: 'id', value: 'id', type: 'string', default: '' },
  { label: 'actor',
    selector: '.event-actor',
    value: 'href',
    type: 'URL',
    default: 'hash:' },
  { label: 'target',
    selector: '.event-target',
    value: 'href',
    type: 'URL',
    default: 'hash:' },
  { label: 'action',
    selector: '.event-action',
    value: 'textContent',
    type: 'string',
    default: 'nop' },
  { label: 'timestamp',
    selector: '.event-timestamp',
    value: 'textContent',
    type: 'Date',
    default: null },
  { label: 'contexts',
    selector: '.event-contexts',
    value: 'textContent',
    type: 'strings',
    default: '' } ]
```

If the value of an attributes is not embedded in the DOM tree,
the **`default` values** are implicitly applied.
For example, "timestamp"'s default is `null`,  but the type is `Date`,
so the default value becomes `new Date(null)`.

### Note: Process to put an event to the `hashnet`

To put an event to `hashnet` as:

1. Make an event as DOM Element with filling properties, especially **`actor` URL** as `me.id`
2. Calculate the **event ID** with the `innerHTML`
3. **Sign the ID** with `me`.
4. Embed the ID, signature, and public key into the event as attribute of the root element.
5. Put the signed event to the `hashnet`
6. `hashnet` notify to event subscribers with `channel`

For validating the every event as:

2. `id` is based on `innerHTML`
1. `actor` is based on `pubkey`
3. `sign` is based on `id` and `pubkey`

`hashnet` rejects invalid events.

### Note: Subscribe events with `channel`s

The `channel` is a filtered queue for **pull** style event processing.
A channel is made with `hashnet.makeChannel(filterDesc)`.
The `filterDesc` object as:

```js
const now = new Date();
const incomingBookmarks = hashnet.makeChannel({
  $event$timestamp: date => date > now,
  $event$actor: actor => `${actor}` !== `${me.id}`,
  $event$contexts: ctxs => ctxs.includes("bookmark"),
});
```

Events of the "`incomingBookmark`" channel are:

- events arrived after the channel made
- the actor is not me
- `"bookmark"` event only

The `filterDesc` is a list of pair of a property name of event and its value judgment function.
A channel can `pull()` events **passed the all** filter judgments.

Channel's `pull()` returns a Promise for an incoming event.
You should `pull()` again to get next events after processing the promise value.

```js
incommingBookmark.pull().then(function loop(event) {
  console.log(`URL: ${event.$$.target}`);
  return incomingBookmark.pull().then(loop);
});
```

### Note: About the "site"

When launching console, a **Web server is also launched**.
The server is for sharing events in `hashnet`.
The sharing system calls **"site"**. Web server of the "site" is `web` object.

You can tell a URL for the "site" as:

```
alice(78f8867...)> web.peer()
'http://192.168.3.2:51618/'
```

Web Browser can get the **event list** HTML from:

- "http://192.168.3.2:51618/hash/items/".

And it can get an **event HTML**
with the ID(e.g. 6f7c49828d0e5d7bd3e2911ddfae0edac967ddc9f4e531a4a869ce932f64ac86) as:

- "http://192.168.3.2:51618/hash/event/6f7c49828d0e5d7bd3e2911ddfae0edac967ddc9f4e531a4a869ce932f64ac86"

Note that the sites have **own identity**, called `sitekey`. It is same as `me`'s public key system.

The site can **also spawn signed events**. These site events are for decentralized network systems.
The sitekey's public key is published at:

- "http://192.168.3.2:51618/hash/sitekey"

It is also **signed event HTML** format with embedding sitekey's public key as `pubkey` property:

```html
<html><head></head><body><article class="hash-event" id="c4ddf95418e2b2209b46af067d0d2a6d561746ced60dfc8759b84132e188a351" pubkey="042a608f20d5298c157ff6979ab3f51156cd6e043d0e73482859991948fa317be8d25d563fc5bc65012ee3e931ce085aba7634dd6bfb0cd8ecfb42acb6778a266e" sign="3045022100a7ebbf25fe7a4a725b26ccb1fde746a4ab1fa3bb6d64b29a7a8c9b41722a128f02202ec8deb7826830feadc4d1a2ddc6523cd50dfafd7ac6baaee450fbe996180a25">
  <div><h1>Site Key</h1></div>
  <div>
    <a class="event-actor" href="hash:708345721f2a94c34ee0dbb7be2ce805c8c1c05337ea38f5a3b79d637de256eb"></a>
    <span class="event-action">published</span>
    to <a class="event-target" href="http://192.168.3.2:51618/"></a>
    at: <span class="event-timestamp">2017-07-07T07:27:30.276Z</span>
  </div>
  <div>contexts: <span class="event-contexts">$site,$sitekey</span></div>
</article></body></html>
```

The site also has `me`'s public key list for checking their signed orders.

```
alice(78f8867...)> web.publisher.pubkeys
[ <Buffer 04 25 63 1f 6c ee 3a 49 64 36 ba 99 af 71 9d 78 5a 99 e1 13 25 f5 ef 43 a7 25 18 0a 05 89 cb cb 3a d9 aa aa f1 90 4c cf 0f 9d 1e e8 63 f3 29 13 ae 73 ... > ]
alice(78f8867...)> crypto.createHash("sha256").update(web.publisher.pubkeys[0]).digest("hex")
'78f886732fa66bef0ca83f571b1328986d308046cbbbed02c9c17fc87bd2b3ed'
```

As the site only accepts alice's order.

Synchronizing event list from `hashnet` to `site` is just **`hashnet` channel application** as:

- `pull()` hashnet events then put them into `site` with signed order, forever.


---

## Launch another console as Bob, and follow alice with `hub`

Launch bob the same way:

```
$ npm run console -- --nickname=bob

> hashnet@0.0.1 console /Users/bellbind/projects/hashnet
> node bookmark/console "--nickname=bob"

bob(5624b9e...)>
```

<!-- bob: 3aa6f382f5d1f7bf8416b8368c115cf71073f5b16250dbbf66fbf1262b7cc47a -->

To get the events of others into my `hashnet`, there is the `hub` object.
The `hub` do getting events from sites then putting into `hashnet` **autonomously**.
There are several **strategies** installed for the scheduling and selection of the sites.

- Distance of the sitekey ID as binary tree.
- Distance of the event contexts between sites.

Alice's site url is 'http://192.168.3.2:51618/' as above. Just do `hub.add(url)`:

```
bob(5624b9e...)> hub.add('http://192.168.3.2:51618/')
undefined
bob(5624b9e...)>
[http://example.com/ bookmarked by hash:78f886732fa66bef0ca83f571b1328986d308046cbbbed02c9c17fc87bd2b3ed]

bob(5624b9e...)>

```

The alice's bookmark event arrives to bob's `hashnet`.

Bob follows alice's events now.
But alice does not follow bob yet because alice does not know bob.
When bob made the bookmark event, no event arrive on alice:

```
bob(5624b9e...)> bookmark.post("http://example.net", "Hello")
undefined
bob(5624b9e...)>
[http://example.net/ bookmarked by hash:5624b9e9990f6732209f5134185f5e48bf35e140fb7e33db71d0686677492fd0]

```

To arrive the bob's events, alice should add bob to their `hub`:

```
alice(78f8867...)> hub.add('http://192.168.3.2:52286/');
undefined
alice(78f8867...)>
[http://example.net/ bookmarked by hash:5624b9e9990f6732209f5134185f5e48bf35e140fb7e33db71d0686677492fd0]

```

---

## Make `hashnet` as a network

On two peers connected, the hashnet forms as a full featured network.
It is enabled  `attending` system for new actors that can request
to add them into the hashnet.
Actors in the hashnet know new sites then adds to `hub` automatically

For new actor carol, can do the request with the `attending` object as:

```
$ npm run console -- --nickname=carol

> hashnet@0.0.1 console /Users/bellbind/projects/hashnet
> node bookmark/console "--nickname=carol"

carol(61499f5...)> self = web.peer()
'http://192.168.3.2:54365/'
carol(61499f5...)> alice = 'http://192.168.3.2:51618/'
'http://192.168.3.2:51618/'
carol(61499f5...)> attending.request(alice, self)
undefined
carol(61499f5...)> 201 'http://192.168.3.2:51618/hash/event/a6c9037d092977844884abc947d5934063ead98dbd71c6f563817bbbfb8ec5b1'

```
<!-- carol: d8e44f52c9f833d55a74ba727224721804cedad7be69d4bb9dfca0beea9e365d -->

After that  carol posts a bookmark, it arrives to alice and bob.

Carol:

```
carol(61499f5...)> bookmark.post("http://example.org", "from carol")
undefined
carol(61499f5...)>
[http://example.org/ bookmarked by hash:61499f567da7ad1e69d2b4cb9913289ceb2c83530c1ac84a1bcd08167ffb5080]


```

Alice:

```
alice(7396f14...)>
[http://example.org/ bookmarked by hash:61499f567da7ad1e69d2b4cb9913289ceb2c83530c1ac84a1bcd08167ffb5080]

```

Bob:

```
bob(5624b9e...)>
[http://example.org/ bookmarked by hash:61499f567da7ad1e69d2b4cb9913289ceb2c83530c1ac84a1bcd08167ffb5080]

```

The `attending` requests to  make an hashnet event at alice's site **(at existed site)**.
The alice's site checks carol's request is valid.
As a result `201` (Created) response with the url of a new event "Alice attended Carol" returned:

```html
<html><head></head><body><article class="hash-event" id="a6c9037d092977844884abc947d5934063ead98dbd71c6f563817bbbfb8ec5b1" pubkey="042a608f20d5298c157ff6979ab3f51156cd6e043d0e73482859991948fa317be8d25d563fc5bc65012ee3e931ce085aba7634dd6bfb0cd8ecfb42acb6778a266e" sign="3045022100957251f016708e22af576ec2be73457bb97977b1826e1a6a086c81cffb1e262f02201629818a20f6b7da5d4dd34d9aae76bc622afba2c0e6157ad952010800cb7701">
  <div><h1>Attended</h1></div>
  <div>
    <a class="event-actor" href="hash:708345721f2a94c34ee0dbb7be2ce805c8c1c05337ea38f5a3b79d637de256eb"></a>
    <span class="event-action">attended</span>
    to <a class="event-target" href="http://192.168.3.2:54365/"></a>
    at: <span class="event-timestamp">2017-07-10T05:12:04.069Z</span>
  </div>
  <div>contexts: <span class="event-contexts">$site,$peer$attended</span></div>
</article></body></html>
```

The "event-target" is Carol's URL, Note that the event actor is `sitekey` not `me`.

When the event arrived to Bob, Bob add Carol to their `hub`.
Bob's added is also as an event "Bob add Carol", then Alice also add Carol to their `hub`.

## Summary

- Hashnet is a system based on signed events on actors
- The event carries any information for decentralized systems (e.g. bookmark sharing)
- Decentralized systems run with each ends: event producers and event consumers
- Networking for Hashnet itself is made on the event system(`site`, `hub`, `attending`)
