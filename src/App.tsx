import { Button } from "antd";
import { useRef } from "react";
import "./App.css";
import logo from "./assets/logo.svg";
import AboutDialog from "./components/AboutDialog";
import Drawer from "./components/Drawer";
import HelpDialog from "./components/HelpDialog";
import WebRTC from "./components/WebRTC";

export interface CanParsePeer {
  parsePeer(message: string): void;
}

export interface CanSendMessage {
  sendMessage(message: string): void;
}

function App() {
  const drawerRef = useRef<CanParsePeer>(null);
  const rtcRef = useRef<CanSendMessage>(null);

  const onReceiveAction = (message: string) => {
    if (!drawerRef?.current?.parsePeer) return;

    drawerRef.current.parsePeer(message);
  };

  const onDrawAction = (action: string) => {
    if (!rtcRef?.current?.sendMessage) return;

    rtcRef.current.sendMessage(action);
  };

  return (
    <div className="App">
      <div className="div-header">
        <Button
          type="ghost"
          href="https://chang-ch.github.io"
          icon={<img src={logo} style={{ width: "100%", height: "100%" }} />}
          style={{
            display: "flex",
            flexDirection: "row",
            marginRight: "auto",
          }}
        >
          Draw2P
        </Button>
        <AboutDialog />
        <HelpDialog />
        <WebRTC onMessage={onReceiveAction} ref={rtcRef} />
      </div>
      <div className="div-canvas">
        <Drawer onAction={onDrawAction} ref={drawerRef} />
      </div>
    </div>
  );
}

export default App;
