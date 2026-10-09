import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QueueToken, StockInventory, StockLog } from '../types';
import {
  ShieldCheck,
  Lock,
  User,
  LogOut,
  Package,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  History,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface EmployeeUser {
  staffId: string;
  name: string;
  role: string;
  shopId: string;
}

export const EmployeePortal: React.FC = () => {
  const { t } = useLanguage();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<EmployeeUser | null>(() => {
    const saved = localStorage.getItem('smart_ration_employee');
    return saved ? JSON.parse(saved) : null;
  });

  const [staffIdInput, setStaffIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Stock State
  const [stock, setStock] = useState<StockInventory | null>(null);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [stockForm, setStockForm] = useState({
    riceKg: '',
    sugarKg: '',
    pulsesKg: '',
    oilPackets: '',
    reason: ''
  });
  const [savingStock, setSavingStock] = useState(false);
  const [stockUpdateMessage, setStockUpdateMessage] = useState<string | null>(null);

  // Queue State
  const [currentlyServing, setCurrentlyServing] = useState<QueueToken | null>(null);
  const [waitingQueue, setWaitingQueue] = useState<QueueToken[]>([]);
  const [waitingCount, setWaitingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [isDispensing, setIsDispensing] = useState(false);
  const [queueMessage, setQueueMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Tab within Employee Portal
  const [activeEmployeeTab, setActiveEmployeeTab] = useState<'queue' | 'stock'>('queue');

  // Handle Login
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: staffIdInput.trim() || 'EMP-101',
          password: passwordInput.trim() || '1234'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || t.loginError);
      }

      setCurrentUser(data.user);
      localStorage.setItem('smart_ration_employee', JSON.stringify(data.user));
    } catch (err: any) {
      setLoginError(err.message || t.loginError);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('smart_ration_employee');
  };

  // Quick fill test credentials
  const fillDemoCreds = (id: string, pass: string) => {
    setStaffIdInput(id);
    setPasswordInput(pass);
  };

  // Fetch Stock Data
  const fetchStock = useCallback(async () => {
    try {
      const res = await fetch('/api/employee/stock');
      if (res.ok) {
        const data = await res.json();
        setStock(data.stock);
        setStockLogs(data.logs || []);
        // Populate inputs with current stock values
        setStockForm(prev => ({
          ...prev,
          riceKg: String(data.stock.riceKg),
          sugarKg: String(data.stock.sugarKg),
          pulsesKg: String(data.stock.pulsesKg),
          oilPackets: String(data.stock.oilPackets),
        }));
      }
    } catch (err) {
      console.error('[Employee] Stock fetch error:', err);
    }
  }, []);

  // Fetch Queue Data
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/employee/queue');
      if (res.ok) {
        const data = await res.json();
        setCurrentlyServing(data.serving);
        setWaitingQueue(data.waiting || []);
        setWaitingCount(data.waitingCount || 0);
        setCompletedCount(data.completedCount || 0);
      }
    } catch (err) {
      console.error('[Employee] Queue fetch error:', err);
    }
  }, []);

  // Load data upon login & poll every 3 seconds for live FIFO queue synchronization
  useEffect(() => {
    if (!currentUser) return;
    fetchStock();
    fetchQueue();

    const interval = setInterval(() => {
      fetchQueue();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser, fetchStock, fetchQueue]);

  // Handle Stock Update Submit
  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSavingStock(true);
    setStockUpdateMessage(null);

    try {
      const res = await fetch('/api/employee/stock/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riceKg: Number(stockForm.riceKg),
          sugarKg: Number(stockForm.sugarKg),
          pulsesKg: Number(stockForm.pulsesKg),
          oilPackets: Number(stockForm.oilPackets),
          updatedBy: `${currentUser.staffId} (${currentUser.name})`,
          reason: stockForm.reason.trim() || 'Manual stock reconciliation / delivery inward'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update stock');
      }

      setStock(data.stock);
      setStockLogs(data.logs);
      setStockUpdateMessage(t.stockUpdateSuccess);
      setStockForm(prev => ({ ...prev, reason: '' }));
      setTimeout(() => setStockUpdateMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error updating stock');
    } finally {
      setSavingStock(false);
    }
  };

  // Call Next Token (FIFO)
  const handleCallNext = async () => {
    setIsCallingNext(true);
    setQueueMessage(null);

    try {
      const res = await fetch('/api/employee/queue/call-next', {
        method: 'POST'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to advance queue');
      }

      await fetchQueue();
      if (data.nextServing) {
        setQueueMessage({
          type: 'success',
          text: `Called Token #${data.nextServing.tokenNumber} (${data.nextServing.cardHolderName}). Telegram notification triggered.`
        });
      } else {
        setQueueMessage({
          type: 'success',
          text: t.emptyQueue
        });
      }
      setTimeout(() => setQueueMessage(null), 4500);
    } catch (err: any) {
      setQueueMessage({ type: 'error', text: err.message || 'Error calling next token' });
    } finally {
      setIsCallingNext(false);
    }
  };

  // Dispense Commodities for Currently Serving Beneficiary
  const handleDispenseAndComplete = async () => {
    if (!currentlyServing) return;

    setIsDispensing(true);
    setQueueMessage(null);

    try {
      const res = await fetch('/api/employee/queue/dispense', {
        method: 'POST'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || t.insufficientStockWarning);
      }

      setStock(data.stock);
      setQueueMessage({
        type: 'success',
        text: `Dispensed: ${data.message} Completed Token #${currentlyServing.tokenNumber}.`
      });
      await fetchQueue();
      fetchStock();
      setTimeout(() => setQueueMessage(null), 4500);
    } catch (err: any) {
      setQueueMessage({
        type: 'error',
        text: err.message || t.insufficientStockWarning
      });
    } finally {
      setIsDispensing(false);
    }
  };

  // Stock safety verification helper
  const isStockSufficient = (req: { riceKg: number; sugarKg: number; pulsesKg: number; oilPackets: number }) => {
    if (!stock) return true;
    return (
      stock.riceKg >= req.riceKg &&
      stock.sugarKg >= req.sugarKg &&
      stock.pulsesKg >= req.pulsesKg &&
      stock.oilPackets >= req.oilPackets
    );
  };

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-6 sm:my-12">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t.employeeLoginTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t.employeeLoginDesc}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.staffIdLabel}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={staffIdInput}
                  onChange={(e) => setStaffIdInput(e.target.value)}
                  placeholder="EMP-101"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.loginBtn}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 mb-2">Quick Demo Access:</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => fillDemoCreds('EMP-101', '1234')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-mono font-semibold"
              >
                EMP-101 (PIN: 1234)
              </button>
              <button
                type="button"
                onClick={() => fillDemoCreds('ADMIN', 'ration2026')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-mono font-semibold"
              >
                ADMIN (PIN: ration2026)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // LOGGED-IN EMPLOYEE DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Employee Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{currentUser.name}</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                {currentUser.staffId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentUser.shopId} • Counter 1 In-Charge
            </p>
          </div>
        </div>

        {/* View Switcher: Queue vs Stock */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveEmployeeTab('queue')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeEmployeeTab === 'queue'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Queue Management</span>
              {waitingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-900 text-emerald-200 rounded-full text-[10px]">
                  {waitingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveEmployeeTab('stock')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeEmployeeTab === 'stock'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Stock Inventory</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            title={t.logoutBtn}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {queueMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all shadow-sm ${
            queueMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-rose-50 text-rose-900 border border-rose-300'
          }`}
        >
          {queueMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{queueMessage.text}</span>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 1: FIFO QUEUE MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeEmployeeTab === 'queue' && (
        <div className="space-y-6">
          {/* Currently Serving Counter Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-md border-2 border-emerald-500 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  {t.currentlyServing}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Counter 1 Live Beneficiary
                </h3>
              </div>

              {/* Action buttons: Call Next */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCallNext}
                  disabled={isCallingNext || waitingCount === 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isCallingNext ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Calling Next...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>{t.callNextBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {currentlyServing ? (
              <div className="space-y-5">
                {/* Serving Beneficiary Details */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block uppercase">Token Number</span>
                    <span className="text-3xl font-black text-emerald-700 font-mono">
                      #{currentlyServing.tokenNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block uppercase">Cardholder</span>
                    <span className="text-base font-bold text-slate-900">
                      {currentlyServing.cardHolderName}
                    </span>
                    <span className="text-xs font-mono text-slate-500 block mt-0.5">
                      {currentlyServing.cardNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block uppercase">Card Category</span>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800">
                      {currentlyServing.cardType}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {currentlyServing.maskedMobile}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-500 block uppercase">Service Status</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block mt-1">
                      Active at Counter 1
                    </span>
                  </div>
                </div>

                {/* Items to Dispense according to valid entitlement rules */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Entitlement Allotment To Dispense:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white border border-emerald-200 rounded-xl">
                      <p className="text-xs text-slate-500">{t.rice}</p>
                      <p className="text-xl font-black text-emerald-900 font-mono">
                        {currentlyServing.entitlements.riceKg} <span className="text-xs font-normal">{t.kgUnit}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Available: {stock?.riceKg ?? 0} kg</p>
                    </div>

                    <div className="p-3 bg-white border border-amber-200 rounded-xl">
                      <p className="text-xs text-slate-500">{t.sugar}</p>
                      <p className="text-xl font-black text-amber-900 font-mono">
                        {currentlyServing.entitlements.sugarKg} <span className="text-xs font-normal">{t.kgUnit}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Available: {stock?.sugarKg ?? 0} kg</p>
                    </div>

                    <div className="p-3 bg-white border border-indigo-200 rounded-xl">
                      <p className="text-xs text-slate-500">{t.pulses}</p>
                      <p className="text-xl font-black text-indigo-900 font-mono">
                        {currentlyServing.entitlements.pulsesKg} <span className="text-xs font-normal">{t.kgUnit}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Available: {stock?.pulsesKg ?? 0} kg</p>
                    </div>

                    <div className="p-3 bg-white border border-rose-200 rounded-xl">
                      <p className="text-xs text-slate-500">{t.oil}</p>
                      <p className="text-xl font-black text-rose-900 font-mono">
                        {currentlyServing.entitlements.oilPackets} <span className="text-xs font-normal">{t.packetUnit}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Available: {stock?.oilPackets ?? 0} pkts</p>
                    </div>
                  </div>
                </div>

                {/* Stock safety check & Dispense action */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {isStockSufficient(currentlyServing.entitlements) ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Stock Safety Verified: All commodities in stock
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Stock Warning: Insufficient inventory!
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleDispenseAndComplete}
                    disabled={isDispensing || !isStockSufficient(currentlyServing.entitlements)}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isDispensing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t.dispensing}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t.dispenseAndCompleteBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-semibold text-sm">
                  {t.noCustomerServing}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Waiting beneficiaries in FIFO queue: {waitingCount}
                </p>
              </div>
            )}
          </div>

          {/* Waiting Queue List (Strict FIFO) */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {t.queueControlTitle}
                </h4>
                <p className="text-xs text-slate-500">
                  FIFO Order: First tokens generated are served first
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                  {waitingCount} {t.waitingQueueCount}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                  {completedCount} {t.completedTodayCount}
                </span>
              </div>
            </div>

            {waitingQueue.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider bg-slate-50/70">
                      <th className="py-2.5 px-3">Position</th>
                      <th className="py-2.5 px-3">Token #</th>
                      <th className="py-2.5 px-3">Beneficiary</th>
                      <th className="py-2.5 px-3">Card #</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Entitlement (Rice / Sugar / Pulse / Oil)</th>
                      <th className="py-2.5 px-3">Arrival</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {waitingQueue.map((tok, idx) => (
                      <tr key={tok.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-700 font-mono">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-sm">
                          #{tok.tokenNumber}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {tok.cardHolderName}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {tok.cardNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                            {tok.cardType}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {tok.entitlements.riceKg}kg / {tok.entitlements.sugarKg}kg / {tok.entitlements.pulsesKg}kg / {tok.entitlements.oilPackets}pkt
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-xs">
                          {new Date(tok.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                {t.emptyQueue}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: STOCK INVENTORY MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeEmployeeTab === 'stock' && (
        <div className="space-y-6">
          {/* Current Stock Snapshot Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rice */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">{t.rice}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                  {stock && stock.riceKg > 200 ? t.safeStockBadge : t.lowStockAlert}
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono">
                {stock?.riceKg ?? 0} <span className="text-sm font-semibold text-slate-500">{t.kgUnit}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Free NFSA / State grain</p>
            </div>

            {/* Sugar */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">{t.sugar}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">
                  {stock && stock.sugarKg > 50 ? t.safeStockBadge : t.lowStockAlert}
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono">
                {stock?.sugarKg ?? 0} <span className="text-sm font-semibold text-slate-500">{t.kgUnit}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">₹25/kg Subsidized</p>
            </div>

            {/* Pulses */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">{t.pulses}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-800">
                  {stock && stock.pulsesKg > 40 ? t.safeStockBadge : t.lowStockAlert}
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono">
                {stock?.pulsesKg ?? 0} <span className="text-sm font-semibold text-slate-500">{t.kgUnit}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Toor / Urad Dal (₹30/kg)</p>
            </div>

            {/* Cooking Oil */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">{t.oil}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800">
                  {stock && stock.oilPackets > 30 ? t.safeStockBadge : t.lowStockAlert}
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono">
                {stock?.oilPackets ?? 0} <span className="text-sm font-semibold text-slate-500">{t.packetUnit}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">1-Litre Sealed Packets</p>
            </div>
          </div>

          {/* Stock Update Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-200 space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {t.stockManagementTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.stockSubtitle}
              </p>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Rice Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    {t.rice} ({t.kgUnit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stockForm.riceKg}
                    onChange={(e) => setStockForm({ ...stockForm, riceKg: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Sugar Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    {t.sugar} ({t.kgUnit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={stockForm.sugarKg}
                    onChange={(e) => setStockForm({ ...stockForm, sugarKg: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Pulses Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    {t.pulses} ({t.kgUnit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={stockForm.pulsesKg}
                    onChange={(e) => setStockForm({ ...stockForm, pulsesKg: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Oil Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    {t.oil} ({t.packetUnit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stockForm.oilPackets}
                    onChange={(e) => setStockForm({ ...stockForm, oilPackets: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Reason / Invoice Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  {t.reasonForUpdate}
                </label>
                <input
                  type="text"
                  value={stockForm.reason}
                  onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                  placeholder={t.reasonPlaceholder}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {stockUpdateMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{stockUpdateMessage}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingStock}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-900/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {savingStock ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.savingStock}</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      <span>{t.updateStockBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Audit History Log */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              Stock Audit Trail & Transaction Log
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] bg-slate-50">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Commodity</th>
                    <th className="py-2.5 px-3">Previous</th>
                    <th className="py-2.5 px-3">New Value</th>
                    <th className="py-2.5 px-3">Net Change</th>
                    <th className="py-2.5 px-3">Updated By</th>
                    <th className="py-2.5 px-3">Reason / Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-bold uppercase text-slate-700">
                        {log.item}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {log.previousValue}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {log.newValue}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={log.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {log.change >= 0 ? `+${log.change}` : log.change}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {log.updatedBy}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 italic max-w-xs truncate">
                        {log.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
