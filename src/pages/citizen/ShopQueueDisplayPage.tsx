import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Tv, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowLeft,
  BellRing,
  Sparkles
} from 'lucide-react';

interface DisplayData {
  shop: {
    id: string;
    shopCode: string;
    name: string;
    district: string;
    address: string;
  };
  queue: {
    waitingCount: number;
    servingCount: number;
    completedCount: number;
    currentlyServing: Array<{
      tokenNumber: string;
      counterNo: number;
      servingStartedAt?: string;
    }>;
    nextWaiting: Array<{
      tokenNumber: string;
      sequenceNo: number;
      createdAt?: string;
    }>;
  };
  timestamp: string;
}

export const ShopQueueDisplayPage: React.FC = () => {
  const { shopId = 'DEMO-CHN-001' } = useParams<{ shopId: string }>();
  const { language, setLanguage } = useLanguage();

  const [data, setData] = useState<DisplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastAnnouncedToken, setLastAnnouncedToken] = useState<string | null>(null);

  const prevServingRef = useRef<string>('');

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio chime generator using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };

      // Government Electronic Chime: Ding-Dong sequence (523Hz C5 -> 659Hz E5 -> 784Hz G5)
      playTone(523.25, 0, 0.4);
      playTone(659.25, 0.25, 0.4);
      playTone(783.99, 0.5, 0.7);
    } catch (e) {
      console.warn('Audio chime playback omitted', e);
    }
  };

  // Poll live shop display queue data
  useEffect(() => {
    let active = true;

    const fetchQueue = async () => {
      try {
        const res = await fetch(`/api/v1/shops/${shopId}/availability`);
        if (res.ok) {
          const json = await res.json();
          if (active && json.shop) {
            setData(json);

            // Check if newly served token changed
            const servingTokens = json.queue?.currentlyServing || [];
            const currentServingKey = servingTokens.map((s: any) => `${s.counterNo}:${s.tokenNumber}`).sort().join('|');

            if (prevServingRef.current && prevServingRef.current !== currentServingKey && servingTokens.length > 0) {
              const latestToken = servingTokens[0]?.tokenNumber;
              setLastAnnouncedToken(latestToken);
              playChime();
            }
            prevServingRef.current = currentServingKey;
          }
        }
      } catch (err) {
        console.warn('Shop queue display poll error', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 3000); // 3-second rapid refresh for waiting halls
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [shopId, soundEnabled]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Build 3 counter slots (default counters 1, 2, 3)
  const counters = [1, 2, 3].map((counterNum) => {
    const active = data?.queue?.currentlyServing?.find((s) => s.counterNo === counterNum);
    return {
      counterNo: counterNum,
      tokenNumber: active?.tokenNumber || null,
      servingStartedAt: active?.servingStartedAt,
      isServing: !!active,
    };
  });

  return (
    <div className="min-h-screen bg-[#111625] text-white flex flex-col font-sans select-none">
      {/* Top Banner / Masthead */}
      <header className="bg-[#1A2238] border-b-2 border-[#C49A3A] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F4] flex items-center justify-center p-1 border-2 border-[#C49A3A] shadow-inner">
            <span className="text-[#7B2638] font-black text-xl">TN</span>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-[#E6C665] font-semibold flex items-center gap-2">
              <span>தமிழ்நாடு அரசு • நியாயவிலைக் கடை நேரடி வரிசைத் திரை</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">GOVT OF TAMIL NADU • DIGITAL TOKEN DISPLAY</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">
              {data?.shop?.name || `Fair Price Shop — ${shopId}`}
            </h1>
            <div className="text-xs text-gray-300 flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[#E6C665] font-bold">FPS CODE: {data?.shop?.shopCode || shopId}</span>
              <span>•</span>
              <span>{data?.shop?.district || 'Chennai'} District</span>
            </div>
          </div>
        </div>

        {/* Live Clock & Screen Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-mono font-black text-[#52E098] tracking-wider">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] text-gray-300 font-medium">
              {currentTime.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute announcement chime' : 'Enable announcement chime'}
              className={`p-2.5 rounded-lg border transition-all ${
                soundEnabled 
                  ? 'bg-[#1F6B45] text-white border-emerald-400 shadow-md' 
                  : 'bg-gray-800 text-gray-400 border-gray-600'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setLanguage(language === 'ta' ? 'en' : 'ta')}
              className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-xs font-bold text-[#E6C665] transition-colors"
            >
              {language === 'ta' ? 'English' : 'தமிழ்'}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white transition-colors"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            <Link
              to={`/shops/${shopId}`}
              title="Return to Shop Portal"
              className="p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Calling Stage */}
      <main className="flex-1 p-6 md:p-8 flex flex-col justify-between max-w-7xl mx-auto w-full space-y-6">
        {/* Flash Announcement Banner if newly called */}
        {lastAnnouncedToken && (
          <div className="bg-[#7B2638] border-2 border-[#E6C665] text-white px-6 py-3 rounded-xl flex items-center justify-between shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <BellRing className="w-6 h-6 text-[#E6C665]" />
              <span className="text-sm md:text-base font-bold">
                {language === 'ta'
                  ? `கவனம்: டோக்கன் எண் ${lastAnnouncedToken} வழங்கல் கவுண்டருக்கு அழைக்கப்பட்டுள்ளது!`
                  : `ATTENTION: Token ${lastAnnouncedToken} called to distribution counter!`}
              </span>
            </div>
            <button
              onClick={() => setLastAnnouncedToken(null)}
              className="text-xs text-gray-200 hover:text-white underline font-mono"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Counter Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {counters.map((c) => (
            <div
              key={c.counterNo}
              className={`rounded-2xl border-4 p-6 flex flex-col justify-between transition-all duration-300 shadow-2xl ${
                c.isServing
                  ? 'bg-gradient-to-b from-[#162721] to-[#0D1C17] border-[#52E098] ring-4 ring-[#52E098]/30 shadow-[#52E098]/20'
                  : 'bg-[#181F33] border-gray-700 opacity-80'
              }`}
            >
              {/* Counter Header */}
              <div className="flex items-center justify-between border-b border-gray-700/80 pb-3">
                <div className="space-y-0.5">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                    {language === 'ta' ? `வழங்கல் கவுண்டர் ${c.counterNo}` : `DISPENSING COUNTER ${c.counterNo}`}
                  </span>
                  <div className="text-xl font-black text-white">
                    {language === 'ta' ? `கவுண்டர் ${c.counterNo}` : `COUNTER ${c.counterNo}`}
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                  c.isServing 
                    ? 'bg-[#52E098] text-[#0A2618]' 
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${c.isServing ? 'bg-[#0A2618] animate-ping' : 'bg-gray-400'}`}></span>
                  <span>{c.isServing ? (language === 'ta' ? 'அழைக்கப்படுகிறது' : 'SERVING NOW') : (language === 'ta' ? 'தயார் நிலை' : 'READY')}</span>
                </span>
              </div>

              {/* Big Token Number Body */}
              <div className="py-8 text-center my-auto">
                {c.isServing ? (
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-widest text-[#E6C665] font-bold">
                      {language === 'ta' ? 'அழைக்கப்படும் டோக்கன் எண்' : 'CALLED TOKEN NUMBER'}
                    </span>
                    <div className="text-6xl md:text-7xl font-mono font-black text-[#52E098] tracking-wider drop-shadow-md">
                      {c.tokenNumber}
                    </div>
                    <div className="text-xs text-gray-300">
                      {language === 'ta' ? 'தயவுசெய்து கவுண்டருக்கு வரவும்' : 'Please proceed to counter with card'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="text-4xl font-mono font-bold text-gray-500">
                      ---
                    </div>
                    <div className="text-xs text-gray-400">
                      {language === 'ta' ? 'அடுத்த டோக்கனுக்காக காத்திருக்கிறது' : 'Standing by for next token'}
                    </div>
                  </div>
                )}
              </div>

              {/* Counter Footer */}
              <div className="border-t border-gray-700/80 pt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{language === 'ta' ? 'பொது விநியோக சேவை' : 'PDS Ration Service'}</span>
                {c.isServing && (
                  <span className="font-mono text-[#52E098]">Active</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lower Section: Upcoming Waiting Queue + Metrics Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Waiting Tokens Strip (3 columns wide) */}
          <div className="lg:col-span-3 bg-[#1A2238] border-2 border-gray-700 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E6C665]" />
                <h2 className="text-base font-bold text-white tracking-wide">
                  {language === 'ta' ? 'அடுத்த வரிசை டோக்கன்கள் (FIFO முறைப்படி)' : 'UPCOMING IN QUEUE (STRICT FIFO ORDER)'}
                </h2>
              </div>
              <span className="text-xs text-[#E6C665] font-mono font-bold bg-[#263152] px-3 py-1 rounded-full border border-gray-600">
                {data?.queue?.waitingCount || 0} {language === 'ta' ? 'டோக்கன்கள் காத்திருக்கின்றன' : 'tokens waiting'}
              </span>
            </div>

            {data?.queue?.nextWaiting && data.queue.nextWaiting.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.queue.nextWaiting.map((item, idx) => (
                  <div
                    key={item.tokenNumber}
                    className="bg-[#111625] border border-gray-700 p-3.5 rounded-xl flex items-center justify-between hover:border-[#E6C665] transition-colors"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">
                        #{idx + 1} {language === 'ta' ? 'அடுத்து' : 'Next'}
                      </span>
                      <div className="text-xl font-mono font-black text-white">
                        {item.tokenNumber}
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm italic bg-[#111625]/60 rounded-xl border border-dashed border-gray-700">
                {language === 'ta' ? 'தற்போது காத்திருக்கும் டோக்கன்கள் ஏதுமில்லை.' : 'No waiting tokens in line at this moment.'}
              </div>
            )}
          </div>

          {/* Today's Distribution Summary Card (1 column wide) */}
          <div className="bg-[#1A2238] border-2 border-gray-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div className="border-b border-gray-700 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#52E098]" />
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                {language === 'ta' ? 'இன்றைய விநியோக சுருக்கம்' : 'TODAY’S METRICS'}
              </h3>
            </div>

            <div className="space-y-4 my-auto">
              <div className="bg-[#111625] p-3.5 rounded-xl border border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-300">{language === 'ta' ? 'வழங்கப்பட்டவை' : 'Completed'}</span>
                <span className="text-2xl font-mono font-black text-[#52E098]">
                  {data?.queue?.completedCount || 0}
                </span>
              </div>

              <div className="bg-[#111625] p-3.5 rounded-xl border border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-300">{language === 'ta' ? 'தற்போது கவுண்டரில்' : 'Serving Now'}</span>
                <span className="text-2xl font-mono font-black text-[#E6C665]">
                  {data?.queue?.servingCount || 0}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 text-center border-t border-gray-700 pt-3">
              {language === 'ta' ? 'நிகழ்நேர தகவல் 3 நொடிகளுக்கு ஒருமுறை புதுப்பிக்கப்படுகிறது' : 'Automatic real-time sync every 3s'}
            </div>
          </div>
        </div>
      </main>

      {/* Screen Footer */}
      <footer className="bg-[#0C101A] border-t border-gray-800 px-6 py-2.5 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <span>Department of Food and Consumer Protection • தமிழ்நாடு அரசு</span>
        </div>
        <div className="font-mono text-[11px] text-gray-400">
          SRQMS Smart Fair Price Shop Waiting Hall Display System
        </div>
      </footer>
    </div>
  );
};
