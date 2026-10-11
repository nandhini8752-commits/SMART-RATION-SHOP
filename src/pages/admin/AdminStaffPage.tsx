import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Users, ArrowLeft, Plus, ShieldCheck, CheckCircle2, XCircle, RefreshCw, X } from 'lucide-react';

interface StaffUserItem {
  id: string;
  username: string;
  fullName: string;
  role: 'SHOP_OPERATOR' | 'SHOP_SUPERVISOR' | 'SYSTEM_ADMIN';
  shopId?: string;
  shopCode?: string;
  shopName?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

const FALLBACK_STAFF: StaffUserItem[] = [
  { id: 'usr-1', username: 'operator_anna', fullName: 'K. Rajavel', role: 'SHOP_OPERATOR', shopCode: 'DEMO-CHN-001', isActive: true, createdAt: '2026-10-11' },
  { id: 'usr-2', username: 'supervisor_anna', fullName: 'M. Shanthi', role: 'SHOP_SUPERVISOR', shopCode: 'DEMO-CHN-001', isActive: true, createdAt: '2026-10-11' },
  { id: 'usr-3', username: 'admin_tn', fullName: 'TNPDS State System Administrator', role: 'SYSTEM_ADMIN', shopCode: 'ALL (System-Wide)', isActive: true, createdAt: '2026-10-11' }
];

export const AdminStaffPage: React.FC = () => {
  const { language } = useLanguage();
  const [staffList, setStaffList] = useState<StaffUserItem[]>(FALLBACK_STAFF);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('StaffPass@123');
  const [newRole, setNewRole] = useState<'SHOP_OPERATOR' | 'SHOP_SUPERVISOR'>('SHOP_OPERATOR');
  const [newShopId, setNewShopId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [adminUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('srqms_admin_user') || '{}');
    } catch {
      return {};
    }
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const [usersRes, shopsRes] = await Promise.all([
        fetch('/api/v1/admin/users', { headers }),
        fetch('/api/v1/admin/shops', { headers }),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        if (data.users && data.users.length > 0) {
          setStaffList(data.users);
        }
      }

      if (shopsRes.ok) {
        const sData = await shopsRes.json();
        setShops(sData.shops || []);
        if (sData.shops?.length > 0 && !newShopId) {
          setNewShopId(sData.shops[0].id);
        }
      }
    } catch (err) {
      console.warn('Staff fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: StaffUserItem) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch(`/api/v1/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (res.ok) {
        await fetchUsers();
      } else {
        setStaffList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
        );
      }
    } catch {
      setStaffList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      );
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminUser?.token) {
        headers['Authorization'] = `Bearer ${adminUser.token}`;
      }

      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          username: newUsername.trim(),
          fullName: newFullName.trim(),
          password: newPassword,
          role: newRole,
          shopId: newShopId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to create user');
      }

      await fetchUsers();
      setShowAddModal(false);
      setNewUsername('');
      setNewFullName('');
    } catch (err: any) {
      setFormError(err.message || 'Creation failed');
    } finally {
      setSubmitting(false);
    }
  };

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
            {language === 'ta' ? 'பணியாளர் கணக்குகள் & பாத்திரங்கள் (RBAC)' : 'Staff Accounts & Role-Based Access'}
          </h2>
          <p className="text-xs text-[#555555] mt-1 flex items-center gap-2">
            <span>{language === 'ta' ? 'விற்பனையாளர், மேற்பார்வையாளர் மற்றும் கணினி நிர்வாகி கணக்குகள்.' : 'Manage operator, supervisor, and administrator roles with shop-scoped authorizations.'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#1F6B45]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bcrypt Guarded Staff RBAC
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-1.5 border border-[#D6D9DC] rounded hover:bg-gray-100 text-[#555555]"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7B2638]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#7B2638] hover:bg-[#591A28] text-white text-xs font-bold px-3.5 py-2 rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'புதிய பணியாளர் சேர்க்க' : 'Add Staff Member'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#D6D9DC] rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F4] border-b border-[#D6D9DC] text-[#555555] font-bold">
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Full Name</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Shop Scope</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE8E1]">
            {staffList.map((user) => (
              <tr key={user.id} className="hover:bg-[#FAF8F4]/50 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-[#7B2638]">{user.username}</td>
                <td className="py-3 px-4 font-semibold text-[#222222]">{user.fullName}</td>
                <td className="py-3 px-4">
                  <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                    user.role === 'SYSTEM_ADMIN'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : user.role === 'SHOP_SUPERVISOR'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-[#1F6B45] border-emerald-200'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-[#555555]">{user.shopCode || 'System-Wide'}</td>
                <td className="py-3 px-4">
                  {user.isActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F6B45]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A12622]">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Inactive</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {user.role !== 'SYSTEM_ADMIN' && (
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`text-[10px] font-bold px-2 py-1 rounded border shadow-xs ${
                        user.isActive
                          ? 'bg-red-50 text-[#A12622] border-red-200 hover:bg-red-100'
                          : 'bg-emerald-50 text-[#1F6B45] border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D6D9DC] shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE8E1] pb-2">
              <h3 className="font-bold text-sm text-[#222222]">Register Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#888888] hover:text-[#222222]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-[#A12622] rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-[#222222]">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. operator_tvm"
                  className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#222222]">Full Name</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. S. Meenakshi"
                  className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#222222]">Initial Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-[#222222]">Role</label>
                  <select
                    value={newRole}
                    onChange={(e: any) => setNewRole(e.target.value)}
                    className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5 bg-white font-semibold"
                  >
                    <option value="SHOP_OPERATOR">SHOP_OPERATOR</option>
                    <option value="SHOP_SUPERVISOR">SHOP_SUPERVISOR</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#222222]">Assigned Shop</label>
                  <select
                    value={newShopId}
                    onChange={(e) => setNewShopId(e.target.value)}
                    className="w-full border border-[#D6D9DC] rounded px-2.5 py-1.5 bg-white font-semibold"
                    required
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shopCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded border border-[#D6D9DC] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 font-bold bg-[#7B2638] hover:bg-[#591A28] text-white rounded shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
