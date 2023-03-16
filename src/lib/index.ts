import { useState } from 'react';
import Chat from './chat'

export default function useChat(receiver: (message: string) => void) {
  // const [chat] = useState(new Chat(receiver))


}

export {  Chat };