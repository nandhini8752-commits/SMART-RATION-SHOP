import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Bot, Send, Sparkles, RefreshCw, HelpCircle, ShieldCheck, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  en: [
    "What is the monthly rice entitlement under NFSA?",
    "What are the subsidized prices of sugar, pulses, and oil?",
    "How does the Smart FIFO token queue work?",
    "What are the Fair Price Shop standard timings?",
    "What is the official PDS grievance helpline number?"
  ],
  ta: [
    "இந்த மாதம் குடும்ப அட்டைக்கு எவ்வளவு இலவச அரிசி கிடைக்கும்?",
    "சர்க்கரை, பருப்பு, சமையல் எண்ணெயின் அரசு விலை என்ன?",
    "ஸ்மார்ட் டோக்கன் வரிசை முறை எவ்வாறு செயல்படுகிறது?",
    "நியாயவிலைக் கடை இயங்கும் நேரம் மற்றும் விடுமுறை என்ன?",
    "ரேஷன் குறைதீர்க்கும் கட்டணமில்லா உதவி எண் என்ன?"
  ],
  te: [
    "ఈ నెలలో నాకు ఎంత ఉచిత బియ్యం వస్తుంది?",
    "చక్కెర, కందిపప్పు, వంట నూనె ప్రభుత్వ ధరలు ఎంత?",
    "స్మార్ట్ టోకెన్ క్యూ ఎలా పనిచేస్తుంది?",
    "రేషన్ దుకాణం పని వేళలు ఏమిటి?",
    "జాతీయ మరియు రాష్ట్ర టోల్ ఫ్రీ సహాయ నంబర్లు ఏమిటి?"
  ],
  hi: [
    "इस महीने मुझे कितना मुफ्त चावल मिलेगा?",
    "चीनी, दाल और खाद्य तेल के सरकारी दाम क्या हैं?",
    "स्मार्ट टोकन FIFO कतार कैसे काम करती है?",
    "उचित मूल्य दुकान का समय क्या है?",
    "राशन शिकायत हेतु आधिकारिक टोल-फ्री नंबर क्या है?"
  ]
};

export const AiAssistant: React.FC = () => {
  const { t, language } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: language === 'ta'
        ? "வணக்கம்! நான் உங்கள் ஸ்மார்ட் ரேஷன் AI உதவியாளர். ரேஷன் கார்டு உரிமைகள், விலை விவரங்கள், டோக்கன் முறை, அல்லது அரசு விதிகள் குறித்து எதையும் கேளுங்கள்."
        : language === 'te'
        ? "నమస్కారం! నేను మీ స్మార్ట్ రేషన్ AI సహాయకుడిని. రేషన్ కార్డు అర్హతలు, ధరలు లేదా క్యూ నియమాలపై ఏవైనా ప్రశ్నలు అడగండి."
        : language === 'hi'
        ? "नमस्ते! मैं आपका स्मार्ट राशन AI सहायक हूँ। राशन कार्ड पात्रता, वस्तुओं के मूल्य, या दुकान के नियमों से संबंधित कोई भी प्रश्न पूछें।"
        : "Namaste! I am your Smart Ration AI Assistant. Feel free to ask questions regarding ration card entitlements, subsidized pricing, queue rules, or government PDS guidelines.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          language
        })
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || "Information currently unavailable. Please contact toll-free 1967.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "Could not retrieve response from Civil Supplies knowledge base. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const currentSuggested = SUGGESTED_QUESTIONS[language] || SUGGESTED_QUESTIONS.en;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* AI Header Card */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-teal-800/40">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {t.aiTitle}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                Gemini 3.8 Flash • Multilingual
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {t.aiSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
          {t.quickQuestionsTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {currentSuggested.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="text-xs bg-slate-50 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 text-left transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-teal-500 flex-shrink-0" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Panel */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col h-[460px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-line leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none font-medium'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-teal-700 text-xs font-semibold p-3 bg-teal-50 rounded-xl border border-teal-200 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>{t.thinking}</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={t.aiPlaceholder}
              className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-900/20 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t.askBtn}</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            {t.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
