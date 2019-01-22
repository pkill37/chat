# chat

A chat web application that randomly matches clients (connected to a server) for a private one-to-one conversation (inspired by Omegle and Chat Roulette).

Clients communicate with the server and vice versa over WebSockets. The server maintains an in-memory mapping of clients and follows a simple protocol with 3 types of messages (`pair`, `unpair`, `message`) which allows for simple state management on the client side. On every `connection` event, the server tries to pair (using a naive pairing algorithm) the new client with existing clients which are not currently paired up and, if two clients are matched, a `pair` message is sent to both. On every `close` event, the server unpairs the clients, sends an `unpair` message to the unpaired client and attempts to re-pair the unpaired client immediately afterwards (otherwise it would have to wait for a new connection to be re-paired). When both clients are paired, they can send messages of type `message` to the server and the server will know who to route the message to by indexing the pairs mapping to obtain the destination's socket which can then be easily used to send the message.

The server is written in Node.js which is the natural choice for a clearly I/O-bound chat application that should be programmed asynchronously. It uses the performant [websockets/ws](https://github.com/websockets/ws) library rather than a bloated library like socket.io which introduces unnecessary network overhead negotiating which protocol to fallback on if the client does not support WebSockets, while also providing no educational value.

## Client

1. Run an HTTP server.

```
npm install -g http-server
cd client/
http-server
```

## Server

1. Install dependencies.

```
cd server/
npm install
```

2. Run the server.

```
node server/index.js
```
