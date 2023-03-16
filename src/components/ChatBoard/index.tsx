import Chatbox, { Bubble, useMessages } from "@chatui/core";
import { useEffect } from "react";
import { Chat } from "../../lib";
import "./index.css";

interface IProps {
  chat: Chat;
}

interface IMessage {
  type: "message" | "event";
  val: string | "typing" | "typed" | "online" | "offline";
}

export default function ChatBoard({ chat }: IProps) {
  const { messages, appendMsg, setTyping } = useMessages([]);

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
          case "online":
          default:
            break;
        }
      }
    };
  }, []);

  return (
    <div className="chat-container">
      <Chatbox
        navbar={{ title: "Chat" }}
        messages={messages}
        renderMessageContent={renderMessageContent}
        onSend={handleSend}
        onInputChange={() =>
          chat.send(JSON.stringify({ type: "event", val: "typing" }))
        }
        onInputBlur={() => {
          chat.send(JSON.stringify({ type: "event", val: "typed" }));
        }}
      />
    </div>
  );
}
