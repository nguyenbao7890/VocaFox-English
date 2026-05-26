import React, { useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface AIChatBoxProps {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  chatInput: string;
  setChatInput: (val: string) => void;
  chatMessages: Array<{ sender: "user" | "ai"; text: string }>;
  chatLoading: boolean;
  handleSendChatMessage: () => void;
}

export default function AIChatBox({
  chatOpen,
  setChatOpen,
  chatInput,
  setChatInput,
  chatMessages,
  chatLoading,
  handleSendChatMessage
}: AIChatBoxProps) {
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [chatOpen, chatMessages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  const handleQuickQuestionClick = (prompt: string) => {
    setChatInput(prompt);
  };

  const quickQuestions = [
    "Cú pháp phân biệt phát âm đuôi -ed?",
    "Công thức viết câu ao ước loại 2 là gì?",
    "Mẹo giải quyết bài đọc hiểu điền từ?",
    "Giúp học thuộc động từ bất quy tắc?"
  ];

  if (!chatOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 select-none font-sans animate-fade-in flex items-center gap-[12px]">
        {/* Support status label displayed to the left of the button */}
        <div className="bg-white/95 backdrop-blur-sm border border-[#e8edf5] shadow-[0_8px_24px_rgba(16,33,63,0.06)] rounded-full px-4 py-2.5 flex items-center text-[13.5px] font-[700] text-[#10213f] font-sans">
          <span>Trợ lý học tập: <span className="font-[900] text-[#ff8a00]">FoxieAI</span></span>
        </div>

        <button
          id="ai_floating_chat_box"
          onClick={() => setChatOpen(true)}
          className="w-[72px] h-[72px] border-0 rounded-[26px] bg-gradient-to-br from-[#ff8a00] to-[#e85f00] text-white shadow-[0_14px_36px_rgba(255,138,0,0.34)] hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center select-none outline-none"
        >
          <span className="text-[20px] font-[900] tracking-[-0.04em] leading-none mb-0.5">AI</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none font-sans flex flex-col items-end gap-3 animate-fade-in">
      
      {/* 2. CHATBOX PANEL (only visible when chatOpen is true) */}
      <div className="w-[330px] bg-white border border-[#e8edf5] shadow-[0_24px_70px_rgba(16,33,63,0.18)] rounded-[26px] overflow-hidden flex flex-col select-none">
        
        {/* Chat header matching Ảnh 2 exactly */}
        <div className="p-[18px] bg-[#10213f] text-white flex items-center justify-between select-none shrink-0 border-0">
          <div className="text-left font-sans">
            <h4 className="font-sans font-[800] text-[17px] tracking-tight m-0 p-0 text-white leading-tight">
              FoxieAI
            </h4>
            <p className="text-[11px] text-[rgba(255,255,255,0.72)] font-[600] mt-1.5 leading-none">
              Trợ lý học tiếng Anh của VocaFox
            </p>
          </div>
          
          <button 
            onClick={() => setChatOpen(false)}
            className="w-[28px] h-[28px] flex items-center justify-center text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors cursor-pointer border-0 bg-transparent outline-none m-0 p-0 text-xs font-bold"
          >
            ❌
          </button>
        </div>

        {/* Message body list in Ảnh 2 style with `#f8fbff` background for AI messages */}
        <div className="flex-1 overflow-y-auto p-[18px] space-y-4 select-text bg-[#ffffff] h-[260px] max-h-[260px]">
          {chatMessages.map((msg, index) => {
            const isAI = msg.sender === "ai";
            return (
              <div 
                key={index}
                className={`flex items-start gap-2.5 max-w-[90%] ${isAI ? "self-start text-left" : "ml-auto flex-row-reverse text-right"}`}
              >
                <div 
                  className={`p-[13px_14px] rounded-[18px] text-[13.5px] font-[600] leading-[1.55] select-text shadow-sm border ${
                    isAI 
                      ? "bg-[#f8fbff] border-[#e8edf5] text-[#53627a] rounded-tl-none text-left" 
                      : "bg-[#ff8a00] border-[#ff8a00] text-white rounded-tr-none whitespace-pre-wrap text-left"
                  }`}
                >
                  {isAI ? <MarkdownRenderer content={msg.text} /> : msg.text}
                </div>
              </div>
            );
          })}
          
          {chatLoading && (
            <div className="flex items-center gap-2 select-none">
              <div className="p-[13px_14px] bg-[#f8fbff] border border-[#e8edf5] text-[#53627a]/60 font-[600] text-[12px] rounded-[18px] rounded-tl-none flex items-center gap-2 animate-pulse">
                <span className="animate-spin text-xs">⏳</span> FoxieAI đang phân tích lời giải...
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>

        {/* Quick starter queries */}
        <div className="px-[18px] py-[10px] bg-[#f8fbff]/50 border-t border-[#e8edf5] flex gap-1.5 overflow-x-auto whitespace-nowrap shrink-0 max-w-full select-none">
          {quickQuestions.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleQuickQuestionClick(prompt)}
              className="px-3 py-1.5 bg-white border border-[#e8edf5] text-[10px] font-[800] text-[#5c687e] rounded-xl hover:border-[#ff8a00] hover:text-[#ff8a00] transition-colors cursor-pointer shrink-0 shadow-sm outline-none"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message write panel with layout matches `flex gap-[8px] p-[0_18px_18px]` */}
        <div className="p-[0_18px_18px] bg-white flex items-center gap-[8px] shrink-0 select-none">
          <input
            type="text"
            placeholder="Nhập câu hỏi của bạn..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-[11px] bg-white border border-[#e8edf5] focus:border-[#ff8a00]/70 text-[13px] font-[600] rounded-full focus:outline-none transition-all outline-none text-[#10213f] placeholder-[#94a3b8]"
          />
          
          <button
            onClick={handleSendChatMessage}
            disabled={!chatInput.trim() || chatLoading}
            className="h-[42px] px-5 bg-[#ff8a00] disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-full font-[950] tracking-wider transition-colors cursor-pointer select-none border-0 flex items-center justify-center shrink-0 active:scale-95 shadow-[0_4px_12px_rgba(255,138,0,0.18)] text-[14px]"
          >
            Gửi
          </button>
        </div>

      </div>

      {/* 1. BOTTOM TRIGGER ROW */}
      <div className="flex items-center gap-[12px] select-none">
        {/* Support status label displayed to the left of the button */}
        <div className="bg-white/95 backdrop-blur-sm border border-[#e8edf5] shadow-[0_8px_24px_rgba(16,33,63,0.06)] rounded-full px-4 py-2.5 flex items-center text-[13.5px] font-[700] text-[#10213f] font-sans">
          <span>Trợ lý học tập: <span className="font-[900] text-[#ff8a00]">FoxieAI</span></span>
        </div>

        <button
          id="ai_floating_chat_box"
          onClick={() => setChatOpen(false)}
          className="w-[72px] h-[72px] border-0 rounded-[26px] bg-gradient-to-br from-[#ff8a00] to-[#e85f00] text-white shadow-[0_14px_36px_rgba(255,138,0,0.34)] hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center select-none outline-none"
        >
          <span className="text-[20px] font-[900] tracking-[-0.04em] leading-none mb-0.5">AI</span>
        </button>
      </div>

    </div>
  );
}
