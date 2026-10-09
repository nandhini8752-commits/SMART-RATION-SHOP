import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { RationCard, QueueToken, QueueStatusResponse } from '../types';
import {
  CreditCard,
  CheckCircle2,
  Phone,
  Users,
  Clock,
  Sparkles,
  Send,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  BellRing,
  ArrowRight,
  XCircle,
  ShieldCheck
} from 'lucide-react';

const SAMPLE_CARDS = [
  { number: 'TN-02-PHH-8821', type: 'PHH (Priority)', name: 'M. Senthilkumar' },
  { number: 'TN-04-AAY-1092', type: 'AAY (Antyodaya)', name: 'Lakshmi Devi' },
  { number: 'TN-01-NPHH-5541', type: 'NPHH (General)', name: 'R. Rajesh Kumar' },
];

export const CustomerPortal: React.FC = () => {
  const { t, language } = useLanguage();

  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedCard, setVerifiedCard] = useState<RationCard | null>(null);

  // Active token in queue
  const [activeQueueStatus, setActiveQueueStatus] = useState<QueueStatusResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Telegram linked account
  const [telegramInput, setTelegramInput] = useState('');
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [telegramSavedSuccess, setTelegramSavedSuccess] = useState(false);

  // Verify Ration Card through Backend
  const handleVerify = async (cardToVerify?: string) => {
    const targetCard = (cardToVerify || cardNumber).trim().toUpperCase();
    if (!targetCard) {
      setError(t.errorCardNotFound);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/customer/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber: targetCard })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.errorCardNotFound);
      }

      setVerifiedCard(data.card);
      setTelegramInput(data.card.telegramChatId || '');

      if (data.activeToken) {
        setActiveQueueStatus(data.activeToken);
      } else {
        setActiveQueueStatus(null);
      }
    } catch (err: any) {
      setError(err.message || t.errorServer);
      setVerifiedCard(null);
      setActiveQueueStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate Token (Real FIFO)
  const handleGenerateToken = async () => {
    if (!verifiedCard) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/tokens/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: verifiedCard.cardNumber,
          telegramChatId: telegramInput.trim() || verifiedCard.telegramChatId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate token');
      }

      setActiveQueueStatus({
        token: data.token,
        position: data.position,
        customersAhead: data.customersAhead,
        estimatedWaitMinutes: data.estimatedWaitMinutes
      });
    } catch (err: any) {
      setError(err.message || t.errorServer);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save/Update Telegram Chat ID
  const handleSaveTelegram = async () => {
    if (!verifiedCard || !telegramInput.trim()) return;

    setIsSavingTelegram(true);
    try {
      const res = await fetch('/api/customer/update-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: verifiedCard.cardNumber,
          telegramChatId: telegramInput.trim()
        })
      });

      if (res.ok) {
        setTelegramSavedSuccess(true);
        setTimeout(() => setTelegramSavedSuccess(false), 3000);
        setVerifiedCard({
          ...verifiedCard,
          telegramChatId: telegramInput.trim()
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingTelegram(false);
    }
  };

  // Poll active token status every 3.5 seconds for real-time FIFO queue updates
  const pollActiveToken = useCallback(async () => {
    if (!activeQueueStatus?.token?.id) return;
    try {
      const res = await fetch(`/api/tokens/status/${activeQueueStatus.token.id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveQueueStatus(data);
      }
    } catch (err) {
      console.error('[Polling] Error fetching token status:', err);
    }
  }, [activeQueueStatus?.token?.id]);

  useEffect(() => {
    if (!activeQueueStatus?.token?.id) return;
    const interval = setInterval(pollActiveToken, 3500);
    return () => clearInterval(interval);
  }, [pollActiveToken, activeQueueStatus?.token?.id]);

  // Cancel Token
  const handleCancelToken = async () => {
    if (!activeQueueStatus?.token?.id) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/tokens/cancel/${activeQueueStatus.token.id}`, {
        method: 'POST'
      });
      if (res.ok) {
        setActiveQueueStatus(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title & Introduction */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.shopName} • {t.shopLocation}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.customerPortalTitle}
            </h2>
            <p className="mt-1 text-slate-300 text-sm sm:text-base max-w-2xl">
              {t.customerPortalDesc}
            </p>
          </div>
          <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-4 border border-slate-700/80 text-center min-w-[180px]">
            <p className="text-xs text-slate-400 font-medium">{t.liveStatus}</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">Counter 1</p>
            <p className="text-xs text-slate-400 mt-1">Strict FIFO Queue</p>
          </div>
        </div>
      </div>

      {/* Verification Card / Search Section */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          {t.rationCardLabel}
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <CreditCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder={t.rationCardPlaceholder}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all uppercase tracking-wider"
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
          </div>
          <button
            onClick={() => handleVerify()}
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-900/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.verifying}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.verifyCardBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Demo Pickers */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {t.sampleCardsLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_CARDS.map((card) => (
              <button
                key={card.number}
                type="button"
                onClick={() => {
                  setCardNumber(card.number);
                  handleVerify(card.number);
                }}
                className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-all font-mono flex items-center gap-1.5"
              >
                <span className="font-bold">{card.number}</span>
                <span className="text-slate-500 text-[11px]">({card.type})</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ACTIVE TOKEN DISPLAY (If beneficiary already has or just generated a token) */}
      {activeQueueStatus && (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl p-6 sm:p-8 border-2 border-emerald-400 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-200/80">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {t.alreadyHaveToken}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {activeQueueStatus.token.cardHolderName} ({activeQueueStatus.token.cardNumber})
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-sm ${
                  activeQueueStatus.token.status === 'SERVING'
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : activeQueueStatus.token.status === 'COMPLETED'
                    ? 'bg-blue-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {activeQueueStatus.token.status === 'SERVING'
                  ? t.statusServing
                  : activeQueueStatus.token.status === 'COMPLETED'
                  ? t.statusCompleted
                  : t.statusWaiting}
              </span>
            </div>
          </div>

          {/* Core Metrics: Token #, Position, Customers Ahead, Estimated Wait Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Token Number */}
            <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm flex flex-col justify-between text-center sm:text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t.yourTokenNumber}
              </span>
              <div className="my-2">
                <span className="text-4xl sm:text-5xl font-black text-emerald-700 font-mono tracking-tight">
                  #{activeQueueStatus.token.tokenNumber}
                </span>
              </div>
              <span className="text-xs text-emerald-600 font-medium">Counter 1</span>
            </div>

            {/* Queue Position */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between text-center sm:text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t.queuePosition}
              </span>
              <div className="my-2 flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 font-mono">
                  #{activeQueueStatus.position}
                </span>
                <span className="text-xs text-slate-500">in FIFO queue</span>
              </div>
              <span className="text-xs text-slate-500">First-In First-Out</span>
            </div>

            {/* Customers Ahead */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between text-center sm:text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t.customersAhead}
              </span>
              <div className="my-2 flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-3xl sm:text-4xl font-extrabold text-teal-700 font-mono">
                  {activeQueueStatus.customersAhead}
                </span>
                <span className="text-xs text-slate-500">beneficiaries</span>
              </div>
              <span className="text-xs text-slate-500">
                {activeQueueStatus.customersAhead <= 10 && activeQueueStatus.customersAhead > 0
                  ? '⚠️ Alert triggered!'
                  : 'Moving steadily'}
              </span>
            </div>

            {/* Estimated Wait Time */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between text-center sm:text-left">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {t.estimatedWaitTime}
              </span>
              <div className="my-2 flex items-baseline gap-1.5 justify-center sm:justify-start">
                <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-mono">
                  ~{activeQueueStatus.estimatedWaitMinutes}
                </span>
                <span className="text-xs font-medium text-slate-600">{t.minutes}</span>
              </div>
              <span className="text-[11px] text-slate-400">~3 mins per beneficiary</span>
            </div>
          </div>

          {/* Telegram Reminder Status Notice */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-sky-100 rounded-lg text-sky-700">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-sky-950 flex items-center gap-2">
                  {t.telegramAlertsActive}
                  {activeQueueStatus.token.telegramChatId && (
                    <span className="text-xs font-mono font-normal bg-sky-200/80 text-sky-800 px-2 py-0.5 rounded">
                      Linked: {activeQueueStatus.token.telegramChatId}
                    </span>
                  )}
                </p>
                <p className="text-xs text-sky-800 mt-0.5">
                  {t.telegramReminderNotice}
                </p>
              </div>
            </div>
            
            <button
              onClick={pollActiveToken}
              className="px-3 py-1.5 text-xs font-semibold bg-white text-sky-700 hover:bg-sky-100 border border-sky-300 rounded-lg transition-all flex items-center gap-1.5 self-end sm:self-center"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.refreshQueue}</span>
            </button>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-600 font-medium">
              {t.counterNotice}
            </p>
            
            {activeQueueStatus.token.status === 'WAITING' && (
              <button
                onClick={handleCancelToken}
                disabled={isCancelling}
                className="px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-300 rounded-lg transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>{isCancelling ? 'Cancelling...' : t.cancelTokenBtn}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* VERIFIED BENEFICIARY DETAILS & ENTITLEMENTS (When card is verified) */}
      {verifiedCard && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {t.cardVerifiedSuccess}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {t.cardDetailsTitle}
              </h3>
            </div>

            <span className="px-3.5 py-1 bg-slate-100 rounded-full text-xs font-mono font-bold text-slate-700 border border-slate-300 self-start sm:self-center">
              FPS ID: {verifiedCard.fpsShopId}
            </span>
          </div>

          {/* Verified Beneficiary Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {t.cardHolder}
              </span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {verifiedCard.cardHolderName}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {t.cardType}
              </span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800">
                {verifiedCard.cardType === 'AAY'
                  ? 'AAY (Antyodaya Anna Yojana)'
                  : verifiedCard.cardType === 'PHH'
                  ? 'PHH (Priority Household)'
                  : 'NPHH (Non-Priority)'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {t.registeredMobile}
              </span>
              {/* Securely display masked mobile number */}
              <span className="text-base font-mono font-bold text-emerald-700 mt-1 block">
                {verifiedCard.maskedMobile}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {t.familyMembers}
              </span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {verifiedCard.familyMembers} Persons
              </span>
            </div>
          </div>

          {/* Telegram Account Link for Notifications */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-sky-600" />
                {t.telegramAccount}
              </label>
              <span className="text-xs text-slate-500">
                {t.telegramOptionalHint}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={telegramInput}
                onChange={(e) => setTelegramInput(e.target.value)}
                placeholder={t.telegramInputPlaceholder}
                className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={handleSaveTelegram}
                disabled={isSavingTelegram}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSavingTelegram ? 'Saving...' : t.updateTelegramBtn}
              </button>
            </div>
            {telegramSavedSuccess && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Telegram linked successfully!
              </p>
            )}
          </div>

          {/* Entitlement Table (Compliant with NFSA rules) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              {t.monthlyEntitlements}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <p className="text-xs text-emerald-800 font-semibold">{t.rice}</p>
                <p className="text-2xl font-extrabold text-emerald-950 font-mono mt-1">
                  {verifiedCard.entitlements.riceKg} <span className="text-sm font-normal">{t.kgUnit}</span>
                </p>
                <p className="text-[11px] text-emerald-600 font-medium">₹0 / Free Quota</p>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-800 font-semibold">{t.sugar}</p>
                <p className="text-2xl font-extrabold text-amber-950 font-mono mt-1">
                  {verifiedCard.entitlements.sugarKg} <span className="text-sm font-normal">{t.kgUnit}</span>
                </p>
                <p className="text-[11px] text-amber-600 font-medium">Subsidized ₹25/kg</p>
              </div>

              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                <p className="text-xs text-indigo-800 font-semibold">{t.pulses}</p>
                <p className="text-2xl font-extrabold text-indigo-950 font-mono mt-1">
                  {verifiedCard.entitlements.pulsesKg} <span className="text-sm font-normal">{t.kgUnit}</span>
                </p>
                <p className="text-[11px] text-indigo-600 font-medium">Subsidized ₹30/kg</p>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl">
                <p className="text-xs text-rose-800 font-semibold">{t.oil}</p>
                <p className="text-2xl font-extrabold text-rose-950 font-mono mt-1">
                  {verifiedCard.entitlements.oilPackets} <span className="text-sm font-normal">{t.packetUnit}</span>
                </p>
                <p className="text-[11px] text-rose-600 font-medium">1L Sealed ₹25/pkt</p>
              </div>
            </div>
          </div>

          {/* Generate Token CTA */}
          {!activeQueueStatus && (
            <div className="pt-2">
              <button
                onClick={handleGenerateToken}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-emerald-950/20 disabled:opacity-60 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{t.generatingToken}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{t.generateTokenBtn}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
