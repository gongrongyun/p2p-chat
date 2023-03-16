import "./App.css";
import "@chatui/core/es/styles/index.less";
import "@chatui/core/dist/index.css";
import Setting from "./components/Setting";
import ChatBoard from "./components/ChatBoard";
import { createContext, useContext, useEffect, useState } from "react";
import { Chat } from "./lib";
import { Modal, Input, Typography, Space, Button } from "antd";

const chat = new Chat();

function App() {
  const [open, setOpen] = useState(true);
  const [data, setData] = useState({
    send: "",
    recv: "",
  });

  const handleCreateKey = async () => {
    const key = await chat.createKey();
    setData({ ...data, send: key });
  };

  const handleReceiveKey = async () => {
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
        title="Title"
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
        <Typography.Text copyable={{ format: "text/plain" }}>
          {data.send}
        </Typography.Text>
      </Modal>
      {/* <Setting /> */}
      <ChatBoard chat={chat} />
    </div>
  );
}

export default App;
