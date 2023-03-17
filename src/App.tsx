import "./App.css";
import "@chatui/core/es/styles/index.less";
import "@chatui/core/dist/index.css";
// import Setting from "./components/Setting";
import ChatBoard from "./components/ChatBoard";
import { useEffect, useState } from "react";
import { Chat } from "./lib";
import { Modal, Input, Typography, Space, Button } from "antd";

const chat = new Chat();

function App() {
  const [open, setOpen] = useState(true);
  const [data, setData] = useState({
    send: "点击 ‘生成’, 并把生成的 key 发送给你的好友，或者在文本框内填入好友的 key，并点击 ‘连接’，将生成 key 发送给好友 ",
    recv: "",
  });

  const handleCreateKey = async () => {
    const key = await chat.createKey();
    setData({ ...data, send: key });
  };

  const handleReceiveKey = async () => {
    console.log(typeof data.recv, data.recv)
    const key = await chat.receiveKey(data.recv);
    if (key) setData({ ...data, send: key });
  };
  useEffect(() => {
    chat.onConnected = () => setOpen(false);
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
    </div>
  );
}

export default App;
