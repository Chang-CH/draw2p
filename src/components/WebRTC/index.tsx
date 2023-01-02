import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Buffer } from "buffer";
import { CanSendMessage } from "../../App";
import { Button, Steps } from "antd";
import {
  ApiOutlined,
  ExportOutlined,
  ImportOutlined,
  LinkOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import Modal from "antd/es/modal/Modal";
import TextArea from "antd/es/input/TextArea";
import { STATUS } from "./constants";
import "./styles.css";

/**
 * WebRTC logic: See https://webrtc.org/getting-started/peer-connections.
 */
const WebRTC = forwardRef<
  CanSendMessage,
  { onMessage: (message: string) => void }
>(({ onMessage }, ref) => {
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

  const [isHidden, toggleHidden] = useState(true);

  const [offerValue, setOfferValue] = useState("");
  const [isOffered, setOffered] = useState(false);
  const [answerValue, setAnswerValue] = useState("");
  const [isAnswered, setAnswered] = useState(false);

  // TODO: use status value to decide disabled etc., show status in UI
  const [status, setStatus] = useState(STATUS.INIT);

  useEffect(() => {
    let connection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302", // Use STUN to get our ip address
        },
      ],
    });

    connection.ondatachannel = (e) => {
      e.channel.onopen = (e) => {
        setStatus(STATUS.OPENED);
        toggleHidden(true);
      };
      e.channel.onclose = (e) => {
        setStatus(STATUS.CLOSED);
      };
      e.channel.onmessage = (e) => onMessage(e.data);
      setDataChannel(e.channel);
    };

    setPeerConnection(connection);
  }, []);

  function generateOffer(callback: (message: string) => void) {
    if (!peerConnection) return;

    const dc = peerConnection.createDataChannel("draw");
    dc.onopen = (e) => {
      setStatus(STATUS.OPENED);
      toggleHidden(true);
    };
    dc.onclose = (e) => {
      setStatus(STATUS.CLOSED);
    };
    dc.onmessage = (e) => onMessage(e.data);
    setDataChannel(dc);

    peerConnection.createOffer().then((offer) => {
      if (!peerConnection?.setLocalDescription) return;
      peerConnection.setLocalDescription(offer);
    });

    peerConnection.onicecandidate = (e) => {
      if (e.candidate || !peerConnection?.localDescription) return;
      callback(
        Buffer.from(peerConnection.localDescription.sdp).toString("base64")
      );
      setStatus(STATUS.OFFERED);
    };
  }

  function acceptOffer(offer: string, callback: (sdp: string) => void) {
    if (!peerConnection) return;

    peerConnection
      .setRemoteDescription(
        new RTCSessionDescription({
          type: "offer",
          sdp: Buffer.from(offer, "base64").toString("utf8"),
        })
      )
      .then(() => {
        setStatus(STATUS.OFFERED);
        // @ts-ignore
        peerConnection.createAnswer();
      })
      // @ts-ignore
      .then((answer: RTCSessionDescriptionInit) => {
        if (!peerConnection?.setLocalDescription) return;
        peerConnection.setLocalDescription(answer);
        setStatus(STATUS.ANSWERED);
      });

    peerConnection.onicecandidate = (e) => {
      if (e.candidate || !peerConnection?.localDescription) return;
      callback(
        Buffer.from(peerConnection.localDescription.sdp).toString("base64")
      );
    };
  }

  function acceptAnswer(answer: string, callback: () => void) {
    if (!peerConnection) return;

    peerConnection
      .setRemoteDescription(
        new RTCSessionDescription({
          type: "answer",
          sdp: Buffer.from(answer, "base64").toString("utf8"),
        })
      )
      .then(() => {
        callback();
        setStatus(STATUS.ANSWERED);
      });
  }

  function sendMessage(message: string) {
    if (!dataChannel) return false;

    dataChannel.send(message);
    return true;
  }

  useImperativeHandle(ref, () => {
    return {
      sendMessage,
    };
  });

  if (isHidden) {
    return (
      <Button
        type="primary"
        icon={<LinkOutlined />}
        onClick={() => toggleHidden((isHidden: boolean) => !isHidden)}
      >
        Connect
      </Button>
    );
  }

  return (
    <>
      <Button
        type="primary"
        icon={<LinkOutlined />}
        onClick={() => toggleHidden((isHidden: boolean) => !isHidden)}
      >
        Connect
      </Button>
      <Modal
        title="Connect to peer"
        open={!isHidden}
        onOk={() => toggleHidden(true)}
        onCancel={() => toggleHidden(true)}
        footer={null}
      >
        <TextArea
          rows={4}
          placeholder="Paste offer here"
          value={offerValue}
          onChange={(event) => setOfferValue(event?.target?.value ?? "")}
          disabled={isOffered}
        />
        <Button
          onClick={() => {
            if (
              !peerConnection ||
              peerConnection.signalingState === "have-local-offer"
            )
              return;

            generateOffer((value) => {
              setOfferValue(value);
              setOffered(true);
            });
          }}
          disabled={isOffered}
          className="button-modal"
        >
          Generate Offer
        </Button>
        <Button
          onClick={() => {
            acceptOffer(offerValue, (answer) => {
              setAnswerValue(answer);
              setOffered(true);
              setAnswered(true);
            });
          }}
          disabled={isOffered}
          className="button-modal"
        >
          Accept Offer
        </Button>
        {isOffered ? (
          <>
            <TextArea
              rows={4}
              placeholder="Paste offer here"
              value={answerValue}
              onChange={(event) => setAnswerValue(event?.target?.value ?? "")}
              disabled={isAnswered}
            />
            <Button
              disabled={isAnswered}
              onClick={() => {
                acceptAnswer(answerValue, () => {
                  setAnswered(true);
                });
              }}
              className="button-modal"
            >
              Accept answer
            </Button>
          </>
        ) : null}
        <Steps
          items={[
            {
              title: "offer",
              status: status >= STATUS.OFFERED ? "finish" : "wait",
              icon:
                status === STATUS.INIT ? (
                  <LoadingOutlined />
                ) : (
                  <ExportOutlined />
                ),
            },
            {
              title: "answer",
              status: status >= STATUS.ANSWERED ? "finish" : "wait",
              icon:
                status === STATUS.OFFERED ? (
                  <LoadingOutlined />
                ) : (
                  <ImportOutlined />
                ),
            },
            {
              title: "connect",
              status:
                status === STATUS.OPENED
                  ? "finish"
                  : status === STATUS.CLOSED
                  ? "error"
                  : "wait",
              icon:
                status === STATUS.ANSWERED ? (
                  <LoadingOutlined />
                ) : (
                  <ApiOutlined />
                ),
            },
          ]}
        />
      </Modal>
    </>
  );
});

export default WebRTC;
