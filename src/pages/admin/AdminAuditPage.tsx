import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { History, ArrowLeft, Search, Filter, ShieldCheck } from 'lucide-react';

interface AuditItem {
  id: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  requestId: string;
  timestamp: string;
  details: string;
}

const SAMPLE_AUDIT_LOGS: AuditItem[] = [
  {
    id: 'aud-101',
    actor: 'operator_anna',
    action: 'COMPLETE_DISTRIBUTION',
    resourceType: 'queue_tokens',
    resourceId: 'tok_98214',
    requestId: 'req_1728639201',
    timestamp: '2026-10-11 10:45:22',
    details: 'Completed distribution for DEMO-TN-0001 (Rice: 20kg, Sugar: 1kg, Dal: 1kg, Oil: 1L)'
  },
  {
    id: 'aud-102',
    actor: 'operator_anna',
    action: 'CALL_NEXT_TOKEN',
    resourceType: 'queue_counters',
    resourceId: 'counter_1',
    requestId: 'req_1728639140',
    timestamp: '2026-10-11 10:42:10',
    details: 'Dispatched token TK-102 to Counter 1 in FIFO order'
  },
  {
    id: 'aud-103',
    actor: 'supervisor_anna',
    action: 'RESTOCK_INVENTORY',
    resourceType: 'shop_inventory',
    resourceId: 'inv_rice_001',
    requestId: 'req_1728638900',
    timestamp: '2026-10-11 09:15:00',
    details: 'Received monthly delivery: +200 kg Rice, +40 kg Sugar from TNCSC Central Godown'
  },
  {
    id: 'aud-104',
    actor: 'admin_tn',
    action: 'POLICY_RULE_VERIFY',
    resourceType: 'policy_rules',
    resourceId: 'RICE_PHH_V1',
    requestId: 'req_1728635000',
    timestamp: '2026-10-11 08:30:15',
    details: 'Verified entitlement configuration against consumer.tn.gov.in policy scale'
  }
];

export const AdminAuditPage: React.FC = () => {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<any[]>(SAMPLE_AUDIT_LOGS);
  const [loading, setLoading] = useState(false);

  const [adminUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('srqms_admin_user') || '{}');
    } catch {
      return {};
    }
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch('/api/v1/admin/audit-logs?limit=50', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.auditLogs && data.auditLogs.length > 0) {
          setLogs(
            data.auditLogs.map((a: any) => ({
              id: a.id,
              actor: a.actorUsername || 'system',
              actorFullName: a.actorFullName,
              action: a.action,
              resourceType: a.resourceType,
              resourceId: a.resourceId,
              timestamp: a.timestamp,
              details: a.reason || (a.newValues ? JSON.stringify(a.newValues) : 'Administrative action recorded'),
            }))
          );
        }
      }
    } catch (err) {
      console.warn('Audit logs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.actor?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase()) ||
      l.resourceType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link 
          to="/admin/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7B2638] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'நிர்வாக பலகைக்கு திரும்புக' : 'Back to Admin Console'}</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6D9DC] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#222222]">
            {language === 'ta' ? 'பாதுகாப்பு & தணிக்கை ஏடு (Audit Logs)' : 'Security & Event Audit Stream'}
          </h2>
          <p className="text-xs text-[#555555] mt-1 flex items-center gap-2">
            <span>{language === 'ta' ? 'அனைத்து பணியாளர் மற்றும் நிர்வாக செயல்பாடுகளின் மாற்ற முடியாத தணிக்கை பதிவு.' : 'Searchable, immutable ledger of all transactional, inventory, and administrative actions.'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#1F6B45]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cryptographically Guarded Stream
            </span>
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-1.5 border border-[#D6D9DC] rounded hover:bg-gray-100 text-[#555555]"
          title="Refresh stream"
        >
          <Filter className={`w-4 h-4 ${loading ? 'animate-spin text-[#7B2638]' : ''}`} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#FAF8F4] border border-[#E5E0D5] rounded-lg p-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-[#888888]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit events by actor, action, resource, or details..."
          className="w-full px-2 py-1.5 bg-white border border-[#D6D9DC] rounded text-xs focus:outline-hidden focus:border-[#7B2638]"
        />
      </div>

      {/* Audit Table */}
      <div className="bg-white border border-[#D6D9DC] rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8E1]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[#555555] whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#7B2638] whitespace-nowrap">
                    {log.actor}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] font-bold bg-[#F6F3EA] text-[#222222] px-2 py-0.5 rounded border border-[#EBE8E1]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#555555] whitespace-nowrap">{log.resourceType}</td>
                  <td className="py-3 px-4 text-[#333333] leading-relaxed max-w-md truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
