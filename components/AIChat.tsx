
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithCoach } from '../services/geminiService';

interface AIChatProps {
  planContext?: string;
}

const AIChat: React.FC<AIChatProps> = ({ planContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial message based on context availability
    if (messages.length === 0) {
      if (planContext) {
        setMessages([{ 
          role: 'model', 
          text: '你好！我是你的专属碳循环助教。关于你的饮食计划或训练安排，有什么可以帮你的吗？', 
          timestamp: Date.now() 
        }]);
      } else {
        setMessages([{ 
          role: 'model', 
          text: '你好！我是智能碳循环助教。我可以帮你解答关于碳循环饮食和训练的疑问，或者协助你制定计划。', 
          timestamp: Date.now() 
        }]);
      }
    }
  }, [planContext, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Pass the existing history (before this new message) + the new message will be handled by the service call implicitly
    // We pass 'messages' which represents the history BEFORE the user's current input.
    const history = [...messages]; 
    
    const reply = await chatWithCoach(userMsg.text, history, planContext);
    
    setMessages(prev => [...prev, { role: 'model', text: reply, timestamp: Date.now() }]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[90vw] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-brand-500 p-1.5 rounded-full">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">AI 健身助教</h3>
                <p className="text-slate-400 text-xs flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> 在线
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center space-x-2 bg-slate-50 rounded-full px-4 py-2 border border-slate-200 focus-within:border-brand-300 transition-colors">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="问我关于饮食或训练的问题..." 
                className="flex-1 bg-transparent outline-none text-sm text-slate-800"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="text-brand-600 disabled:text-slate-400 hover:text-brand-700 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${isOpen ? 'bg-slate-700 text-slate-300' : 'bg-brand-600 text-white'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default AIChat;
