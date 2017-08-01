# About hashnet network simulations

In hashnet, each peer decides how to connect to others; pulling events.
The codes for bookmark demo are programmed as a peer.

The simulations tackle, not for a peer, for inter peers relationship.
It simulates for peer connectivity and path length of message propagations.

## Strategy by event context distance

One of our suggested strategy is using **event content relationship between peers** to reducing the path length.
Especially, "context" list in published events is used as a position of peers.
It would make clusters of peers with similar "context"s are used.

The [run-sim-context.js](../simulations/run-sim-context.js) tries to
simulate the distance between peers by "context"s.
Peers spawn events with probabilities proportional to sent count.
Event contexts depend on their accepted event contexts as:

- 50%: same of the last accepted event
- 25%: new event
    - 0-4 contexts: pick my events
    - 0-2 contexts: pick others events
    - 0-2 contexts: newly generated context

The example result [sim-result.txt](../simulations/sim-result.txt) shows "context" distances between peers that clustered by the amount of events.

The strategy of  peer subscribing "nearer peers" would work.
The [run-sim-cluster.js](../simulations/run-sim-cluster.js) tries to simulate
limited connections by the "context" distance  keeps the network.

In the simulation, each 512 peer thinks 8-peer as a cluster (peer list),
then subscribe 4-peer in the cluster.
The result [sim-cluster-result.txt](../simulations/sim-result.txt) shows event propagated at most 5 paths
that the cluster covered 99.414...% peers (3 peers in 512 not covered).

## Strategy by peer ID distance

The other strategy is using peer ID. The peer ID is a hash value of its public key.
It seems as almost random number.
For each peer, 50% of peers are different at the top bit 0 or 1, then peers are reduced as 25%, 12.5%, ...
that forms neighborhood system: 50% peers are the most far neighborhoods, 25% are the second most far, self is the nearest.

The strategy is subscribing one peer from each neighborhoods to keep the network connected.
It thought the ID number as a binary tree.

The 256-bit ID may be used, but peer count would not be reached the size.
So the sizes are depend on log2 of peer count: subscribing size and worst path steps.

The [run-sim-huffman.js](../simulations/run-sim-huffman.js) simulates 1024 peers case of subscribing peer counts
that shows about 10 in average of subscribing size.

## Mixed Strategies in each peer

It cannot say the what strategy is better on the code level.
It depends on the peer characteristics.
For example, when every peers quickly disconnected, others return to full-mesh connection wouldn't work.
So the system requires to switch several strategies or to use multiple strategies.

In `hashnet`, `hub` manages valid peer list and pulling via network,
and controls `automation`s as network strategy.
One of automation is `full-mesh` connection that would stop when the peer count over the limit.
Other one is `iddist` that emulates the peer ID distance strategy but the pick up peer size in each neighborhood is not one.
For the much larger network, we would prepare the "context" distance strategy `automation`.
