import { createRef, RefObject, useRef, useState } from "react";
import "./App.css";
import Drawer from "./utils/Drawer";
import WebRTC from "./utils/WebRTC";

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
        <WebRTC onMessage={onReceiveAction} ref={rtcRef} />
      </div>
      <div className="div-canvas">
        <Drawer onAction={onDrawAction} ref={drawerRef} />
      </div>
    </div>
  );
}

export default App;
