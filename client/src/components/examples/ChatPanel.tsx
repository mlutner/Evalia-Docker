import ChatPanel from '../ChatPanel';
import { useState } from 'react';

export default function ChatPanelExample() {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant' as const, content: 'Hello! I can help you refine your survey. What would you like to change?' },
    { id: '2', role: 'user' as const, content: 'Add 3 open-ended questions about training effectiveness' },
    { id: '3', role: 'assistant' as const, content: "I've added three open-ended questions focusing on training effectiveness. Would you like me to adjust anything else?" }
  ]);

  return (
    <div className="h-[600px] max-w-md p-4">
      <ChatPanel 
        messages={messages} 
        onSendMessage={(msg) => {
          setMessages([...messages, { id: Date.now().toString(), role: 'user', content: msg }]);
          console.log('Message sent:', msg);
        }} 
      />
    </div>
  );
}
