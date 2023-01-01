import {
  DeleteOutlined,
  HighlightOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Divider, Modal } from "antd";
import { useState } from "react";
import "./styles.css";

const HelpDialog = () => {
  const [isHidden, setHidden] = useState(true);
  return (
    <>
      <Button
        onClick={() => setHidden(false)}
        className="button-help"
        icon={<InfoCircleOutlined />}
      >
        Help
      </Button>
      <Modal
        title="Usage guide"
        open={!isHidden}
        footer={null}
        onCancel={() => setHidden(true)}
      >
        <h2>Connecting to peer</h2>
        <h3>Initiating party</h3>
        <ol>
          <li>Click on the connect button.</li>
          <li>Click "Generate Offer".</li>
          <li>Copy the entire offer and send it to the accepting party.</li>
          <li>
            Once the accepting party has accepted the offer, they will generate
            the answer. Obtain the accepting party's answer.
          </li>
          <li>
            Paste the answer in the answer text area and click "Accept answer".
          </li>
          <li>
            Once the answer is accepted both parties can start sending messages.
          </li>
        </ol>
        <h3>Accepting party</h3>
        <ol>
          <li>Click on the connect button.</li>
          <li>Wait for the initiating party's first offer.</li>
          <li>
            Copy the entire offer and paste it in the offer text area. Click
            "Accept offer".
          </li>
          <li>
            An already filled answer text area will appear. Copy the entire
            answer and send it to the initiating party.
          </li>
          <li>
            Once the initiating party accepts the answer both parties can start
            sending messages.
          </li>
        </ol>
        <Divider />
        <h2>Drawing</h2>
        <h3>Brushes</h3>
        <p>Currently only 2 brushes are supported:</p>
        <p>
          Standard brush{" "}
          <span>
            <HighlightOutlined />
          </span>
          : click and drag to draw.
        </p>
        <p>
          Eraser{" "}
          <span>
            <DeleteOutlined />
          </span>
          : Actually just a brush with white color and a thicker stroke. A
          future update will use a more relatable icon.
        </p>
        <h3>Brush settings</h3>
        <p>
          Brush settings can be found by clicking on the settings button{" "}
          <span>
            <SettingOutlined />
          </span>
          . Currently only brush color and stroke width are supported.
        </p>
        <Divider />
        <h2>Troubleshooting</h2>
        <p>
          In some cases, after STUN resolves a client's public IP, the router
          may still block who can connect to devices on a network. In this case,
          a TURN server is required to act as a relay, which is not supported in
          this app.
        </p>
      </Modal>
    </>
  );
};

export default HelpDialog;
