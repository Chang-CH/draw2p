import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Divider, Modal } from "antd";
import { useState } from "react";
import "./styles.css";

const AboutDialog = () => {
  const [isHidden, setHidden] = useState(true);
  return (
    <>
      <Button
        onClick={() => setHidden(false)}
        className="button-help"
        icon={<QuestionCircleOutlined />}
      >
        About
      </Button>
      <Modal
        title="About"
        open={!isHidden}
        footer={null}
        onCancel={() => setHidden(true)}
      >
        <h2>Motivation</h2>
        <p>
          One of the annoyances I have faced when discussing topics with my
          peers is the lack of visual information. Google docs for example, just
          isn't friendly to collaborative drawing. Hence this. For most cases
          that require two way communication, usually a websocket would be used.
          However in such cases we would need to manage a server, or pay for
          cloud services. P2P is a thrifty alternative.
        </p>
        <Divider />
        <h2>Tech Stack</h2>
        <p>
          This app uses WebRTC, which enables us to do P2P connections from the
          browser. The drawing app uses the HTML canvas element to render the
          strokes. The code can be found{" "}
          <a href="https://github.com/Chang-CH/draw2p">here</a>
        </p>
        <p>
          This app also uses vite and react typescript, with ant design for UI.
          However, the P2P connection and canvas app can be just as easily done
          in vanilla HTML and js.
        </p>
        <Divider />
        <h2>WebRTC</h2>
        <h3>WebRTC: Locating peers</h3>
        <p>
          Each peer likely does not have a static public IP, and would have to
          go through the router's NAT before we can reach the peer. Thus, we
          need to find the IP of the peer we are communicating with. This is
          accomplished with the stun server. In this app we use a public stun
          server (google's). See a list of stun servers{" "}
          <a href="https://gist.github.com/mondain/b0ec1cf5f60ae726202e">
            here
          </a>
          .
        </p>
        <p>
          This is like a whoami to get the public facing IP of our client. STUN
          also checks for restrictions in our router to determine if we are
          accessible behind the router's NAT. We can then exchange this
          information with the connecting peer to directly connect with each
          other.
        </p>
        <h3>WebRTC: Setting up channels</h3>
        <p>
          After the P2P connection is set up, we still need a channel to send
          and receive messages from. WebRTC allows us to transmit the usual
          texts, but also includes video/audio (like teleconferencing). On our
          offer generating peer, we create the data channel:{" "}
          <code>peerConnection.createDataChannel("draw");</code>. On our offer
          accepting peer, we listen to when a data channel is added:{" "}
          <code>connection.ondatachannel = (e) =&gt; ...</code>. In our case
          there is only 1 channel to set up. Once done we can send messages with{" "}
          <code>dataChannel.send(message);</code>
          and receive messages with{" "}
          <code>channel.onmessage = (e) =&gt; onMessage(e.data);</code>.
        </p>
        <h3>WebRTC: Transmitting data</h3>
        <p>
          Internally, WebRTC uses{" "}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols">
            ICE
          </a>{" "}
          to connect with peers. Open a new tab to <code>about:webrtc</code>{" "}
          (firefox) or <code>chrome://webrtc-internals/</code> (chrome) to view
          the ice candidates and data transmitted. The data does not show up in
          our network tab. Transport protocol may be either TCP or UDP.
        </p>
        <h3>STUN: limitations</h3>
        <p>
          Sometimes, even though STUN can resolve our public IP, our firewall
          may block incoming connections. In this case we would have to use a
          TURN server in between the P2P connection (technically not P2P
          anymore). There are public TURN servers as well, and WebRTC is
          encrypted end to end so the TURN relays would not be able to read the
          data.
        </p>
      </Modal>
    </>
  );
};

export default AboutDialog;
