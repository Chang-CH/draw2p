import { InfoCircleOutlined } from "@ant-design/icons";
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
        <h1>Connecting to peer</h1>
        <h2>Initiating party</h2>
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
        <Divider />
        <h2>Accepting party</h2>
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
      </Modal>
    </>
  );
};

export default HelpDialog;
