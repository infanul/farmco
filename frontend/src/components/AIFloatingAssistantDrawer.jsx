import React, { useState } from 'react';
import { api } from '../api';
import { Sparkles, Send, X, CheckCircle2, Sprout } from 'lucide-react';

export default function AIFloatingAssistantDrawer({ selectedCenterId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState(null);

  const quickQuestions = [
    "When should I visit?",
    "Which day is less crowded?",
    "Will Friday be busy?",
    "Which procurement center is less crowded?",
    "What is the expected waiting time tomorrow?"
  ];

  const handleAsk = async (qText) => {
    const targetQ = qText || question;
    if (!targetQ) return;

    setLoading(true);
    try {
      const res = await api.askAiAssistant(targetQ, selectedCenterId || 1);
      setAiAnswer(res);
      setQuestion('');
    } catch (err) {
      console.error('AI assistant error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating AI Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-3 rounded-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black text-xs shadow-md flex items-center space-x-2.5 transition-all transform hover:scale-105 cursor-pointer border border-[#C8E6C9]"
        >
          <div className="relative flex items-center justify-center">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="tracking-wider uppercase">✦ AI QUEUE ASSISTANT</span>
        </button>
      )}

      {/* Floating Compact AI Assistant Light Drawer */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white p-5 rounded-3xl border-2 border-[#2E7D32] shadow-xl space-y-4 text-xs relative text-[#1A1A1A]">
          
          {/* Drawer Header */}
          <div className="flex justify-between items-center pb-3 border-b border-[#C8E6C9]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center text-[#2E7D32]">
                <Sparkles className="w-4 h-4 text-[#2E7D32]" />
              </div>
              <div>
                <h3 className="font-black text-[#1A1A1A] tracking-wide text-xs">✦ AI QUEUE ASSISTANT</h3>
                <span className="text-[10px] text-[#2E7D32] font-bold">Personal Timing Assistant</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-[#555555] hover:text-[#1A1A1A] p-1 rounded-lg bg-[#F1F8E9]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Prompt Suggestion Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#555555] uppercase tracking-widest block">
              Quick Timing Questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  className="px-2.5 py-1 rounded-full bg-[#F1F8E9] hover:bg-[#E8F5E9] text-[#1A1A1A] hover:text-[#2E7D32] border border-[#C8E6C9] text-[10px] font-bold transition text-left"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>

          {/* Input Row */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask about queue timing..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              className="flex-1 bg-[#F1F8E9] border border-[#C8E6C9] rounded-xl px-3 py-2 text-xs font-medium text-[#1A1A1A] focus:outline-none"
            />
            <button
              onClick={() => handleAsk()}
              disabled={loading}
              className="p-2 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* AI Response Display Area */}
          {loading && (
            <div className="bg-[#F1F8E9] p-4 rounded-2xl border border-[#C8E6C9] text-center text-[#2E7D32] space-y-1 font-mono text-[11px]">
              <Sparkles className="w-5 h-5 animate-spin mx-auto text-[#2E7D32]" />
              <span>Analyzing historical queue patterns...</span>
            </div>
          )}

          {aiAnswer && !loading && (
            <div className="bg-[#F1F8E9] p-4 rounded-2xl border border-[#C8E6C9] space-y-3">
              <div className="flex justify-between items-center border-b border-[#C8E6C9] pb-2">
                <span className="text-[10px] font-black uppercase text-[#2E7D32] tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                  AI Forecast Answer
                </span>
                <span className="text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#C8E6C9]">
                  {aiAnswer.confidence_score}% Confidence
                </span>
              </div>

              <p className="text-[#1A1A1A] text-xs leading-relaxed font-semibold">
                {aiAnswer.response_text}
              </p>

              <div className="bg-white p-2.5 rounded-xl border border-[#C8E6C9] flex justify-between items-center text-[11px]">
                <span className="text-[#555555] font-bold">Suggested Arrival:</span>
                <span className="font-extrabold text-[#F57F17]">{aiAnswer.suggested_arrival_window}</span>
              </div>

              <span className="text-[9px] text-[#555555] block italic text-center">
                * Estimated AI prediction. Capacity information subject to operational changes.
              </span>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
