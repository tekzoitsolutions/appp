import React, { useState } from 'react';
import { X, Send, Bot, CheckCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ChatModal = ({ isOpen, onClose, doctor }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'doctor',
      text: `Hello! I am ${doctor?.full_name || 'Doctor'}. How may I assist you today?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { addToast } = useToast();

  if (!isOpen || !doctor) return null;

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Auto-reply simulation
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'doctor',
          text: `Thank you for reaching out. Please note that for emergency medical attention, contact the hospital directly at ${doctor.hospital || 'clinic'}. My clinic timings are: ${doctor.available_timings || 'Mon-Fri 10am-5pm'}. Our front desk will confirm your slot shortly.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  const quickPrompts = [
    'Consultation inquiry',
    'Clinical referral inquiry',
    'Available clinic timings?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full h-[580px] flex flex-col shadow-2xl border border-[#E0E6EF] overflow-hidden">
        {/* Header */}
        <div className="bg-[#008F8F] text-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={doctor.avatar_url}
                alt={doctor.full_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/80"
              />
              {doctor.is_online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] border-2 border-[#008F8F] rounded-full" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                {doctor.full_name}
              </h4>
              <p className="text-[11px] text-white/80">
                {doctor.specialty_name} • {doctor.city}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F9FC]">
          <div className="text-center my-1">
            <span className="text-[10px] uppercase font-semibold text-[#94A3B8] bg-white px-2.5 py-1 rounded-full border border-[#E0E6EF]">
              Encrypted Professional Chat
            </span>
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-[#E3060B] text-white rounded-br-none'
                    : 'bg-white text-[#111827] border border-[#E0E6EF] rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-[#94A3B8] mt-1 px-1 flex items-center gap-1">
                {m.time}
                {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-[#008F8F]" />}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] italic">
              <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full animate-bounce delay-200" />
              <span>{doctor.full_name} is typing...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-3 py-2 bg-white border-t border-[#E0E6EF] flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#EFFAFA] text-[#008F8F] hover:bg-[#008F8F] hover:text-white transition-colors shrink-0 border border-[#008F8F]/20"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-[#E0E6EF] flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#F7F9FC] border border-[#E0E6EF] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#008F8F] text-[#111827]"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-[#008F8F] text-white flex items-center justify-center hover:bg-[#007C7C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
