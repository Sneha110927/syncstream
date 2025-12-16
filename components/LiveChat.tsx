import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, LogOut } from 'lucide-react';

interface Message {
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

interface LiveChatProps {
  isConnected: boolean;
  username: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onLogout: () => void;
}

export function LiveChat({ isConnected, username, messages, onSendMessage, onLogout }: LiveChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && isConnected) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-purple-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-pink-400" />
          <div>
            <h3 className="text-white">Live Chat</h3>
            <p className="text-gray-400 text-sm">
              {isConnected ? `Chatting as ${username}` : 'Connect to start chatting'}
            </p>
          </div>
        </div>
        {isConnected && (
          <button
            onClick={onLogout}
            className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={`${msg.timestamp}-${msg.userId}-${index}`} className="bg-gradient-to-r from-purple-900/30 to-pink-900/20 backdrop-blur-sm rounded-xl p-3 border border-purple-500/20">
              <div className="text-pink-400 text-sm mb-1">{msg.username}</div>
              <div className="text-white">{msg.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-500/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message…"
            disabled={!isConnected}
            className="flex-1 bg-slate-950/70 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !inputValue.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}