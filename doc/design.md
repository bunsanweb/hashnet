# hashnet design



## Events and contexts

On hashnet, the primary object is an **"event"**.
Events carries information over the network.

An event is a HTML DOM element tree that embeds the attributes of
the event.
Other objects in hashnet are made around events.

- An `Event` is a HTML DOM tree.
- An `Event` is a bundle of information attributes.

The subset of the information attributes are called **"context"**.
An `Event` is formed by multiple "context"s.

Each context defines the attributes: name, value type, default value and
its locator on the DOM(CSS Selector and value accessors, e.g. `href`, `textContent`).

- An `Event` has multiple "context"s
- "context" is a set of information attributes
- Each attribute is defined as: name, value type, default value, and locator

### Core contexts

Several predefined contexts are required
The first one is the **context for defining contexts** as "$context$added" context.
The "context"s are extensible with the "$context$added" events in the hashnet
(with the system interpreted the events).

The attribute of **"$context$added"** is:

- "label": string
- "attributes": JSON

The JSON value of self defined "$context$added" "attributes" as:

```js
[
  {
    label: "label",
    selector: ".context-label",
    value: "textContent",
    type: "string",
    default: "",
  },
  {
    label: "attributes",
    selector: ".context-attributes",
    value: "textContent",
    type: "JSON",
    default: "[]",
  },
]
```

The core `Event` attributes are also defined as **"$event"** contexts:

- "id": string
- "actor": URL
- "target": URL
- "action": string
- "timestamp": Date
- "contexts": strings (list of string)

Every event has an "$event" context. "event" is not required in "contexts" attribute.

The hashnet API can access the "context"s and their attribute values.
The systems in hashnet extends the "context"s for carrying system information.

The first system of hashnet is signed event features.

### Event attribute interface

An `Event` object can access its context and attributes with object properties with:
`event.contest.attribute` or `event.context$attribute` style.
The latter style is applied for channel filtering descriptions.

For example, accessing the event "target" is `event.$event$target` which is `URL` object.


### Event ID as a content

The event **"id" is based on its content value**. just as a hash digest hex.
The "id" is an universal identity, that is,
the event is identical its content as value, not depend on its location.

Events are transparent over the network.
If the event is in local memory or over the network,
these events are the same when their contents are the same value.

When merged the `hashnet` of two peers, each `hashnet` consists of the same events with no conflicts.
It can form an universal event network in a bottom up / decentralized manner.

### Actor, target and Signed Event

For using `Event` as a system information,
it can verify that the Event is valid as published:

- That it was made a valid publisher.
- That the content was not modified by others.
- ...

Using public key system as digital signature,
the hashnet "actor" becomes a valid event publisher.

Each actor has a key pair.
The "actor" URL in event content is based on the **hash digest value of their public key** as:

- "hash:78f886732fa66bef0ca83f571b1328986d308046cbbbed02c9c17fc87bd2b3ed"

The "target" URL and "action" is also in the event content.
Signing the event content with the "actor"'s public key,
the event means:

- "actor"'s "action" to the "target" URL with other attributes

is valid information for the "actor".

For example, the "actor" wants to say "I am a owner of the web resource".
The web resource shows "my owner is the actor" with their public key at the "target" URL,
then the actor signs it as "Event".

## 'hashnet' and `me`

The `hashnet` object manages the "event"s and "context"s in each peer.
It keeps valid events in local and provides as `channel`s to event applications.

The origin of events in `hashnet` are:

- (Applications) Put a local "actor" (called "me") signed events into the `hashnet`
- ("hashnet" Systems) Put arrived valid events over network into the `hashnet`

(NOTE: The latter says `hashnet` accepts valid events to get from network anyways.)

The `me` object is managing a key pair, and signing to newly created events.
Applications use `me` to publishing their events.
Events loops to applications as:

- Applications =raw event=> `me` =signed event=> `hashnet` =signed event=> `channel` =signed event=> Applications

The systems of sharing events to others are also hashnet applications:

- (sharing to network): `hashnet` =signed event=> `channel` =signed event=> Web Server
- (shared from network): Web Server =signed event=> `hashnet`

### `channel` interface

The hashnet applies "Pull style" event processing, not "push" as register and callback many times.
Processing events controls in client application timings.

The `channel` can pull an event each time as ECMAScript `Promise`.
You can use `channel`s with recursive promise handlers or `async` functions.

When making a `channel`, you must set the filter conditions for processing events.
The filters can use event attribute values as:

- filter with specific "context"s
- filter with specific "actor"
- filter with specific attribute values

The filter is a list of pair of attribute name string and is filter function that returns `true` or `false`.

For example, the filter is:

```js
channel = hashnet.makeChannel({
  bookmark$note: note => note.length > 0,
});
```

Filter the event that the context "bookmark"'s "note" attribute is not empty.
The parameter `note` is always string because of the bookmark description "type".
When the events are not "bookmark" context, the filter rejects them.

## "site"

For sharing "to" network, the system calls "site".
The "site"  publish the events as a Web Server.

"site" forms several objects:

- `publisher`: manage events to publish from registered actors
- `web`: HTTP Server gateway
- `sitekey`: key pair for "site" itself (different from `me`)
- `sync`: Events from `hashnet`'s `channel` to `publisher` (with `me`'s sign).

The "site" itself has its own key pair called `sitekey` which functions are same as `me`.
It is for systems to validating "site" URLs itself from others.

At next section, `hub` checks whether the site is valid.
The validity is signed with the `sitekey` to the `hub`
requested URL: as its "HOST" header in HTTP requests.

The hash id of `sitekey`s become the identity of the "site"s.
IP address an domain name would be multiple to the "site" web server,
but its sitekey stays single.

## `hub`

For shared "from" network, handling the shared events to `hashnet` calls `hub`.
Core object of `hub` is:

- checking an adding "site" valid
- pick up event list and contents from added "site"s
- handle life cycling `automation`s

The `automation`s are strategy objects of

- which "sites" to pull events
- when to pull events

When a valid "site" added or accessing a "site" failed,
The `hub` notice the "site" to `automation`s.

An `iddist` automation is puck up sites as buckets with its sitekey's "id" distance clusters as:

```js
function distance(idA, idB) {
  // ID as "hash:xxxxx..." (64 hex)
  const a = Buffer.from(new URL(idA).pathname, "hex");
  const b = Buffer.from(new URL(idB).pathname, "hex");
  console.assert(a.length === 32 && b.length === 32, "ID should be 256 bits");
  // compare xor distance as little endian
  let clz256 = 0;
  for (let i = 31; i >= 0; i--) {
    const clz8 = Math.clz32(a[i] ^ b[i]) - 24;
    clz256 += clz8;
    if (clz8 < 8) return 256 - clz256;
  }
  console.assert(clz256 === 256);
  return 0;
}
```

### auto "site" adding with "$peer$added" event

The `hub` spawn a "$peer$added" system context event when a valid "site" URL added.
It can make other `hub`s know the "site" existence over network.

The `hub` also implements adding "site" from the **"$peer$added"** event arrivals.

It can make automatic hashnet network growth when one of existed peers accepted new one.
(It can also implements other type of automated peer managements as voting or rejection)


## `attending` system

Once over two peers added to their `hub` each other,
new peers accepted one of them are "attended" to the network.

For the new peers side, when they want to "attend" to,
they would "request" to existed ones.
These are called "attending" request.

The "attending" request is made also application system of "hashnet".

Flow of the attending system is:

- (New-peer adds the Existed-peer to their `hub`)
- New-peer's "site" publishes a signed event **"$peer$attending"** for request to attending to the network with:
   - New-peer's self URL
   - The requesting Existed-peer's "site" URL
- New-peer's "site" does HTTP request to the requesting Existed-peer's "site"
   - "POST" request
   - special path to "/hash/attending"
   - with "REFERER" header as the signed attending event URL
- The Existing-peer's "site" checks the HTTP request
   - fetch the signed event by the REFERER URL
   - the signed event is valid
   - the URL of self URL based on the HOST header
   - fetch the New-peer's sitekey, then check it same with the signed attending event's actor.
- The Existing-peer's "site" publishes a signed event **"$peer$attended"** with
   - the New-peer's site URL
   - NOTE: the "$peer$added" made by "site" automatically (not "me")
- The other-peers in the network get the "$peer$attended" signed event, then
   - `hub`s watch the "$peer$attended" events to add their peer list (same way as "$peer$added" events handling).

The important point is, "site"s just announce an existence of a  New-peer to the network,
then the judgments to join it are done by each `hub` as an agent of `me` (not by "site").

It is able to adding more negotiation of consensus for joining new-peers as a peer strategy;
e.g. adding after several existed-peers approved (by signed events).
