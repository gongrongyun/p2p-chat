import './App.css';
import '@chatui/core/es/styles/index.less';
import '@chatui/core/dist/index.css';
import Setting from './components/Setting';
import ChatBoard from './components/ChatBoard';
import { createContext, useContext, useEffect, useState } from 'react';
import { Chat } from './lib';
import { Modal, Input, Typography, Space, Button } from 'antd';

const chat = new Chat()

function App() {
  const [open, setOpen] = useState(true);
  const [key, setKey] = useState('')
  const [answer, setAnswer] = useState('')

  const handleCreateKey = async () => {
    console.log('createkey')
    const key = await chat.createKey()
    console.log(key)
    setKey(key)
  }

  const handleReceiveKey = async () => {
    const genkey = await chat.receiveKey(answer)
    if (genkey) setKey(genkey)
  }
  useEffect(() => {
    chat.onConnected = () => setOpen(false)
  }, [])

  return (
    <div className="App">
      <Modal
        open={open}
        title="Title"
        closable={false}
        maskClosable={false}
        footer={
          <Space>
            <Button type='primary' onClick={handleCreateKey} >生成</Button>
            <Button type='primary' onClick={handleReceiveKey}>连接</Button>
          </Space>
        }
      >
        <Input.TextArea value={answer} onChange={(e) => setAnswer(e.target.value)}/>
        <Typography.Text copyable={{format: 'text/plain'}}>{key}</Typography.Text>
      </Modal>
      <Setting />
      <ChatBoard chat={chat} />
    </div>
  );
}

export default App;
