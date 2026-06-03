"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  context?: string;
  placeholder?: string;
  onStandardExtracted?: (data: { main_title: string; sub_title: string; details: string }) => void;
}

export default function AIChat({ context, placeholder, onStandardExtracted }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "مرحباً! أنا مساعد الذكاء الاصطناعي لشركة الاماني. يمكنني مساعدتك في إنشاء معايير الجودة ومواصفات المواد. كيف يمكنني مساعدتك اليوم؟",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context,
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content || "عذراً، حدث خطأ في المعالجة",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Try to extract standard data if callback provided
      if (onStandardExtracted && data.extractedStandard) {
        onStandardExtracted(data.extractedStandard);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "عذراً، حدث خطأ في الاتصال بالمساعد الذكي" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "اقترح معيار لجودة الخرسانة",
    "ما هي مواصفات حديد التسليح؟",
    "معايير سلامة العمال في البناء",
    "مواصفات مواد العزل الحراري",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"} animate-fade-in`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-alamani-gold/20 border border-alamani-gold/40 flex items-center justify-center text-sm flex-shrink-0 ml-2 mt-1">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user" ? "chat-user" : "chat-ai"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-alamani-gold/30 border border-alamani-gold/50 flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-1">
                👤
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-end">
            <div className="w-8 h-8 rounded-full bg-alamani-gold/20 border border-alamani-gold/40 flex items-center justify-center text-sm flex-shrink-0 ml-2 mt-1">
              🤖
            </div>
            <div className="chat-ai px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-alamani-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-alamani-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-alamani-gold animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <div className="text-xs text-gray-600 mb-2">اقتراحات سريعة:</div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="text-xs bg-alamani-navy-mid border border-alamani-gold/20 text-gray-400 hover:text-alamani-gold hover:border-alamani-gold/50 rounded-lg px-3 py-1.5 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-alamani-gold/10">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "اكتب رسالتك هنا..."}
            rows={2}
            className="flex-1 bg-alamani-navy border border-alamani-gold/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-alamani-gold focus:ring-1 focus:ring-alamani-gold/30 resize-none transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn-gold px-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span className="text-xl">←</span>
          </button>
        </div>
        <div className="text-xs text-gray-700 mt-2 text-center">
          اضغط Enter للإرسال أو Shift+Enter لسطر جديد
        </div>
      </div>
    </div>
  );
}
