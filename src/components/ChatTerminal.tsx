import { FC, useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatTerminal: FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Replace with your actual AI API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
      {/* Chat messages - even smaller height */}
      <div className="h-[120px] overflow-y-auto p-2 space-y-1.5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-2 py-1 rounded-md ${
                message.role === 'user'
                  ? 'bg-white/10 text-white'
                  : 'bg-white/5 text-gray-300'
              }`}
            >
              <p className="text-xs">{message.content}</p>
              <p className="text-[9px] text-gray-500 mt-0.5">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-gray-300 px-2 py-1 rounded-md">
              <p className="text-xs">typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form - even more compact */}
      <form onSubmit={handleSubmit} className="p-1.5 border-t border-white/20">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message AIORA..."
            className="flex-1 bg-black/30 text-xs text-white placeholder-gray-500 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white/30"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-2 py-1 bg-white/10 text-xs text-white rounded-md hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}; 