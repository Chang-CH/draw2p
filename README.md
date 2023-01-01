# Peer to peer drawing app

## Motivation

One of the annoyances I have faced when discussing topics with my
peers is the lack of visual information. Google docs for example, just
isn't friendly to collaborative drawing. Hence this. For most cases
that require two way communication, usually a websocket would be used.
However in such cases we would need to manage a server, or pay for
cloud services. P2P is a thrifty alternative.

## Setting up
Install [pnpm](https://pnpm.io/). Then enter:
```sh
pnpm install
```

To serve the app, run:
```sh
pnpm dev
```

## Connecting to peers
### Initiating party

1. Click on the connect button.
1. Click "Generate Offer".
1. Copy the entire offer and send it to the accepting party.
1. Once the accepting party has accepted the offer, they will generate the answer. Obtain the accepting party's answer.
1. Paste the answer in the answer text area and click "Accept answer".
1. Once the answer is accepted both parties can start sending messages.
  
### Accepting party
1. Click on the connect button.
1. Wait for the initiating party's first offer.
1. Copy the entire offer and paste it in the offer text area. Click "Accept offer".
1. An already filled answer text area will appear. Copy the entire answer and send it to the initiating party.
1. Once the initiating party accepts the answer both parties can start sending messages.

## Troubleshooting

In some cases, after STUN resolves a client's public IP, the router
may still block who can connect to devices on a network. In this case,
a TURN server is required to act as a relay, which is not supported in
this app.

## Tech Stack

This app uses WebRTC, which enables us to do P2P connections from the
browser. The drawing app uses the HTML canvas element to render the
strokes.


This app also uses vite and react typescript, with ant design for UI.
However, the P2P connection and canvas app can be just as easily done
in vanilla HTML and js.

## WebRTC
### WebRTC: Locating peers

Each peer likely does not have a static public IP, and would have to
go through the router's NAT before we can reach the peer. Thus, we
need to find the IP of the peer we are communicating with. This is
accomplished with the stun server. In this app we use a public stun
server (google's). See a list of stun servers [here](https://gist.github.com/mondain/b0ec1cf5f60ae726202e)
.


This is like a whoami to get the public facing IP of our client. STUN
also checks for restrictions in our router to determine if we are
accessible behind the router's NAT. We can then exchange this
information with the connecting peer to directly connect with each
other.

### WebRTC: Setting up channels

After the P2P connection is set up, we still need a channel to send
and receive messages from. WebRTC allows us to transmit the usual
texts, but also includes video/audio (like teleconferencing). On our
offer generating peer, we create the data channel: 
`peerConnection.createDataChannel("draw");`. On our offer
accepting peer, we listen to when a data channel is added: 
`connection.ondatachannel = (e) =>; ...`. In our case
there is only 1 channel to set up. Once done we can send messages with 
`dataChannel.send(message);`
and receive messages with 
`channel.onmessage = (e) =>; onMessage(e.data);`.

### WebRTC: Transmitting data

Internally, WebRTC uses 
[ICE]("https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols")
to connect with peers. Open a new tab to `about:webrtc` 
(firefox) or `chrome://webrtc-internals/` (chrome) to view
the ice candidates and data transmitted. The data does not show up in
our network tab. Transport protocol may be either TCP or UDP.

### STUN: limitations

Sometimes, even though STUN can resolve our public IP, our firewall
may block incoming connections. In this case we would have to use a
TURN server in between the P2P connection (technically not P2P
anymore). There are public TURN servers as well, and WebRTC is
encrypted end to end so the TURN relays would not be able to read the
data.


