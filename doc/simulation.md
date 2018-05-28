# About hashnet network simulations

In hashnet, each peer decides how to connect to others; pulling events.
The codes for this bookmark demo are programmed as a peer.

The simulations tackles inter-peer relationships, not a single peer.
It simulates peer connectivity and path length of message propagations.

## Strategy by event context distance

One of our suggested strategies is using **event content relationships between peers** to reducing the path length.
Especially, using the "context" list in published events as a position of peers.
It would make clusters of peers with similar "context"s are used.

The example, [run-sim-context.js](../simulations/run-sim-context.js) tries to
simulate the distance between peers by "context"s.
Peers spawn events with probabilities proportional to the sent count.
Event contexts depend on their accepted event contexts such as:

- 50%: same of the last accepted event
- 25%: new event
    - 0-4 contexts: pick my events
    - 0-2 contexts: pick others events
    - 0-2 contexts: newly generated context

The example result [sim-result.txt](../simulations/sim-result.txt) shows "context" distances between peers that are clustered by the amount of events.

The strategy of peers subscribing "nearer peers" would work.
The example, [run-sim-cluster.js](../simulations/run-sim-cluster.js) tries to simulate
limited connections by the "context" distance to keep the network.

In the simulation, each 512 peers thinks of 8-peers as a cluster (peer list),
then subscribe 4-peer in the cluster.
The result [sim-cluster-result.txt](../simulations/sim-result.txt) shows events propagated through at most 5 paths
that the cluster covered 99.414...% of peers (3 peers in 512 not covered).

## Strategy by peer ID distance

The other strategy is using peer ID. The peer ID is a hash value of its public key.
It seems like it's almost a random number.
For each peer, 50% of peers are different at the top bit 0 or 1, then peers are reduced 
by half, 25%, 12.5%, ... etc.
that forms a neighborhood system: 50% peers are the most far neighborhoods, 25% are the second most far, with self being the nearest.

The strategy is subscribing one peer from each neighborhoods to keep the network connected.
The ID number can be thought of as a binary tree.

A 256-bit ID may be used, but the peer count will not be reached that size.
So the sizes are depend on log2 of peer count: subscribing size and worst path steps.

The example, [run-sim-huffman.js](../simulations/run-sim-huffman.js) simulates 1024 peers case of subscribing peer counts
that shows an average subscribing size of about 10.

## Mixed Strategies in each peer

On the code level it is difficult to say that any strategy is better.
The optimal strategy depends on the peer characteristics.
For example, when every peer quickly disconnects, getting the other peers to return to a full-mesh connection becomes difficult.
So the system must switch between several strategies or use multiple strategies.

In `hashnet`, the `hub` manages valid peer lists and pulling via the network,
and controls `automation`s as network strategy.
One of automation is the `full-mesh` connection that would stop when the peer count goes over the limit.
Other one is `iddist` that emulates the peer ID distance strategy but the pick up peer size in each neighborhood is not one.
For the much larger networks, we would prepare the "context" distance strategy `automation`.
