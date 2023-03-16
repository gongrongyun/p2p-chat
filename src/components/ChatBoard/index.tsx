import Chatbox, { Bubble, useMessages }  from '@chatui/core'
import { useEffect } from 'react';
import { Chat } from '../../lib';
import './index.css'


interface IProps {
  chat: Chat
}

export default function ChatBoard({chat}: IProps) {
  const { messages, appendMsg, setTyping } = useMessages([]);

  const handleSend = (type: string, val: string) => {
    if (type === 'text' && val.trim()) {
      chat.send(val)
      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
      });
    }
  }

  const renderMessageContent = (msg : any) => {
    const { content } = msg;
    return <Bubble content={content.text} />;
  }

  useEffect(() => {
    chat.onReceive = (msg: string) => {
      console.log(msg)
      appendMsg({
        type: 'text',
        content: { text: msg },
        position: 'left'
      })
    }
  }, [])

  return <div className='chat-container'>
      <Chatbox
    navbar={{title: 'Chat'}}
    messages={messages}
    renderMessageContent={renderMessageContent}
    onSend={handleSend}
   />
  </div>
}