import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Activity, Company } from '../types';
import { Send, Bot, User, Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AICarbonCoachProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (text: string) => void;
  activities: Activity[];
  profile: Company;
}

export default function AICarbonCoach({ messages, loading, onSendMessage, activities, profile }: AICarbonCoachProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "What is my highest emission source and how do I offset it?",
    "Give me 5 simple swaps to lower my commuting footprint.",
    "Explain the carbon difference between gas & heat pump heating.",
    "Help me design a plant-based diet plan with low emissions."
  ];

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleQuickPromptClick = (text: string) => {
    if (loading) return;
    onSendMessage(text);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 flex flex-col h-[550px] shadow-sm overflow-hidden" id="carbon-ai-coach-card">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <Bot className="w-5 h-5 text-emerald-700 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">AI Carbon Intelligence Coach</h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-[11px] text-slate-400">Ask your eco-advisor about personal reductions & climate science</p>
          </div>
        </div>
        <span className="text-[9px] uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
          Gemini 3.5 Active
        </span>
      </div>

      {/* Messages Scroll Zone */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto p-4 space-y-4">
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Your Sustainable Advisor</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                "Hello! I am your environmental co-pilot. I analyze your profile settings and recent logs to help map carbon neutrality goals. What would you like to discuss today?"
              </p>
            </div>

            {/* Quick Suggestions Pills */}
            <div className="w-full space-y-2 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Suggested inquiries</span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPromptClick(p)}
                  className="w-full text-left bg-white hover:bg-emerald-50 border border-slate-100 font-medium text-[11px] text-slate-600 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs hover:border-emerald-200"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex space-x-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`p-1.5 rounded-lg shrink-0 w-8 h-8 flex items-center justify-center ${
                  m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble content */}
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-2xs'
                }`}>
                  <div className="markdown-body">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex space-x-3 max-w-[85%]">
                <div className="p-1.5 rounded-lg shrink-0 w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-800">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 bg-white border border-slate-100 text-slate-500 rounded-2xl rounded-tl-none flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span className="text-xs font-medium font-sans animate-pulse">Consulting Climate Database...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input controls and prompt submitters */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 shrink-0 bg-white" id="coach-message-sender-form">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="flex-1 text-slate-800 text-xs px-3.5 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder-slate-400"
            placeholder={loading ? "Carbon Coach is formulating advice..." : "Ask: 'Which food emits the most carbon?' or design offsets..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all shrink-0 cursor-pointer disabled:bg-slate-300"
            disabled={!inputText.trim() || loading}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
