"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  Loader2,
  MinusCircle,
} from "lucide-react";
import { parseMarkdownToHTML } from "@/lib/markdown-parser";

interface Message {
  role: "user" | "bot";
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content:
        "Hello! I am the RugIntel Sentinel. How can I help you protect your assets today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "I apologize, I am having trouble connecting to the subnet right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:bg-cyan-400 transition-all group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600 to-magenta-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <MessageSquare className="w-6 h-6 text-black relative z-10" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-black border-2 border-cyan-400/50 flex flex-col transition-all duration-300 shadow-[0_0_40px_rgba(6,182,212,0.3)]
            ${isMinimized ? "h-14 w-64" : "h-[500px] w-[350px] md:w-[400px]"}`}
        >
          {/* Header */}
          <div className="p-4 border-b border-cyan-400/30 bg-cyan-900/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-cyan-400 font-mono text-sm font-bold tracking-widest">
                RUGINTEL_AI
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white transition"
              >
                <MinusCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-none border flex items-center justify-center
                      ${msg.role === "bot" ? "border-cyan-400 bg-cyan-950/50" : "border-magenta-400 bg-magenta-950/50"}`}
                    >
                      {msg.role === "bot" ? (
                        <Bot className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <User className="w-5 h-5 text-magenta-400" />
                      )}
                    </div>
                    <div
                      className={`p-3 text-sm font-mono max-w-[80%] 
                      ${msg.role === "bot" ? "bg-cyan-950/30 text-gray-200" : "bg-magenta-950/30 text-gray-200"}`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdownToHTML(msg.content),
                        }}
                        className="prose-invert prose-p:leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 border border-cyan-400 bg-cyan-950/50 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="p-3 bg-cyan-950/30 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span className="text-cyan-400/70 text-xs font-mono">
                        THINKING...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-cyan-400/30 bg-black">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type COMMAND..."
                    className="w-full bg-cyan-950/20 border border-cyan-400/30 p-3 pr-12 text-sm font-mono text-cyan-400 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="absolute right-2 p-2 text-cyan-400 hover:text-white transition disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[10px] text-cyan-900 mt-2 font-mono uppercase tracking-tighter">
                  Powered by Bittensor Subnet
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
