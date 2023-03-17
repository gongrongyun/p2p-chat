import Chatbox, { Bubble, useMessages } from "@chatui/core";
import { useEffect, useRef, useState } from "react";
import { Chat } from "../../lib";
import "./index.css";

interface IProps {
  chat: Chat;
  ready: boolean
}

interface IMessage {
  type: "message" | "event";
  val: string | "typing" | "typed" | "online" | "offline";
}

export default function ChatBoard({ chat, ready }: IProps) {
  const [online, setOnline] = useState(true)
  const { messages, appendMsg, setTyping } = useMessages([]);
  const idRef = useRef<number | null>(null)

  const handleSend = (type: string, val: string) => {
    if (type === "text" && val.trim()) {
      chat.send(
        JSON.stringify({
          type: "message",
          val,
        })
      );
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right",
      });
    }
  };

  const renderMessageContent = (msg: any) => {
    const { content } = msg;
    return <Bubble content={content.text} />;
  };

  useEffect(() => {
    chat.onReceive = (data: string) => {
      const message: IMessage = JSON.parse(data);
      if (message.type === "message") {
        appendMsg({
          type: "text",
          content: { text: message.val },
          position: "left",
        });
      } else {
        switch (message.val) {
          case "typing":
            setTyping(true);
            break;
          case "typed":
            setTyping(false);
            break;
          case "offline":
            setOnline(false);
            break;
          case "online":
            setOnline(true);
            break;
          default:
            break;
        }
      }
    };
    // const sendOnlineEvent = () => {
    //   if (ready) chat.send(JSON.stringify({ type: 'event', val: 'online' }))
    // }
    // const sendOfflineEvent = () => {
    //   if (ready) chat.send(JSON.stringify({ type: 'event', val: 'offline' }))
    // }
    // window.addEventListener('focus', sendOnlineEvent)
    // window.addEventListener('blur', sendOfflineEvent)

    return () => {
      if (idRef.current) {
        window.clearTimeout(idRef.current)
      }
      // window.removeEventListener('focus', sendOnlineEvent)
      // window.removeEventListener('blur', sendOfflineEvent)
    }
  }, [ready]);

  return (
    <div className="chat-container">
      <Chatbox
        navbar={{ title: `Chat [${online ? 'online' : 'offline'}]` }}
        messages={messages}
        renderMessageContent={renderMessageContent}
        onSend={handleSend}
        onInputChange={() => {
          if (!ready) return
            chat.send(JSON.stringify({ type: "event", val: "typing" }))
            if (idRef.current !== null) {
              clearTimeout(idRef.current)
            }
            idRef.current = window.setTimeout(() => {
              chat.send(JSON.stringify({ type: 'event', val: 'typed' }))
            })
          }
        }
        onInputBlur={() => {
          if (ready) chat.send(JSON.stringify({ type: "event", val: "typed" }));
        }}
      />
    </div>
  );
}
