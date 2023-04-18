import "./App.css";
import "@chatui/core/es/styles/index.less";
import "@chatui/core/dist/index.css";
// import Setting from "./components/Setting";
import ChatBoard from "./components/ChatBoard";
import { useEffect, useRef, useState } from "react";
import { Chat } from "./lib";
import { Modal, Input, Typography, Space, Button, Switch } from "antd";

const chat = new Chat();
let senders = []

function App() {
  const [open, setOpen] = useState(true);
  const [switchable, setSwitchable] = useState(true)
  const [data, setData] = useState({
    send: "点击 ‘生成’, 并把生成的 key 发送给你的好友，或者在文本框内填入好友的 key，并点击 ‘连接’，将生成 key 发送给好友 ",
    recv: "",
  });

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const handleCreateKey = async () => {
    const key = await chat.createKey();
    if (key) {
      setData({ ...data, send: key });
      setSwitchable(false)
    }
  };

  const handleReceiveKey = async () => {
    const key = await chat.receiveKey(data.recv);
    if (key) {
      setData({ ...data, send: key });
      setSwitchable(false)
    }
  };

  const handleSwitchVideo = async (enable: boolean) => {
    if (enable) {
      const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
      stream.getTracks().forEach(track => {
        senders.push(chat.publish(track, stream))
      })
      if (localVideoRef.current) {
        localVideoRef.current.classList.remove('hidden')
        localVideoRef.current.srcObject = stream
      }
    } else {
      chat.removeTracks()
      if (localVideoRef.current) {
        localVideoRef.current.classList.add('hidden')
      }
    }
  }

  useEffect(() => {
    chat.onConnected = () => {
      setOpen(false);
    }
    chat.onTrack = (stream) => {
      console.log('onTrack')
      if (remoteVideoRef.current) {
        remoteVideoRef.current.classList.remove('hidden')
        remoteVideoRef.current.srcObject = stream
      }
    }
  }, []);

  return (
    <div className="App">
      <Modal
        open={open}
        title="交换 Key"
        closable={false}
        maskClosable={false}
        footer={
          <Space>
            <Button type="primary" onClick={handleCreateKey}>
              生成
            </Button>
            <Button type="primary" onClick={handleReceiveKey}>
              连接
            </Button>
          </Space>
        }
      >
        开启视频:
        <Switch disabled={!switchable} onChange={handleSwitchVideo} />
        <Input.TextArea
          value={data.recv}
          onChange={(e) => setData({ ...data, recv: e.target.value })}
        />
        <Typography.Paragraph ellipsis={{ rows: 4 }} copyable={{ format: "text/plain" }}>
          {data.send}
        </Typography.Paragraph>
      </Modal>
      {/* <Setting /> */}
      <ChatBoard chat={chat} ready={open} />
      <video id='remote' className="hidden" autoPlay ref={remoteVideoRef} />
      <video id='local' className="hidden" autoPlay ref={localVideoRef} />
    </div>
  );
}

export default App;
