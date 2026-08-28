import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Package, DollarSign, Clock, TrendingUp,
  Search, Download, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import supabase from '../lib/supabase.js';
import { refundOrder, fetchAnalytics } from '../lib/api.js';

import AdminClubsPanel    from '../components/admin/AdminClubsPanel.jsx';
import AdminUsersPanel    from '../components/admin/AdminUsersPanel.jsx';
import AdminListingsPanel from '../components/admin/AdminListingsPanel.jsx';
import AnalyticsPanel     from '../components/admin/AnalyticsPanel.jsx';
import DiscountCodesPanel from '../components/admin/DiscountCodesPanel.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n ?? 0).toLocaleString('en-CA', { minimumFractionDigits: 2 })}`;

function KpiCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const ring = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }[color];
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${ring}`}><Icon className="w-5 h-5" /></div>
      </div>
    </div>
  );
}

function Badge({ value }) {
  const styles = {
    none:    'bg-gray-100 text-gray-500',
    partial: 'bg-amber-100 text-amber-700',
    full:    'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[value] ?? 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  );
}

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'review',    label: 'Review Listings' },
  { key: 'clubs',     label: 'Organizations' },
  { key: 'users',     label: 'Users' },
  { key: 'orders',    label: 'Orders' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'discounts', label: 'Discount Codes' },
];

// ─── Main dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate  = useNavigate();
  const { user, profileName, signOut } = useAuth();

  const [tab, setTab]             = useState('review');
  const [orders, setOrders]       = useState([]);
  const [analytics, setAnalytics]       = useState(null);
  const [analyticsError, setAnalyticsError] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [dataLoading, setDataLoading]   = useState(false);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [refundingId, setRefundingId]   = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // ── Load orders + pending count ────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    setDataLoading(true);
    const [ordersRes, pendingRes] = await Promise.all([
      supabase
        .from('orders')
        .select('*, listings(title, club_id, price, clubs(name))')
        .order('created_at', { ascending: false }),
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]);
    if (ordersRes.error) setError(ordersRes.error.message);
    else setOrders(ordersRes.data ?? []);
    setPendingCount(pendingRes.count ?? 0);
    setDataLoading(false);
  }, []);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsError('');
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      setAnalyticsError(err.message);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => { if (tab === 'analytics') loadAnalytics(); }, [tab, loadAnalytics]);

  const handleLogout = async () => { await signOut(); navigate('/admin/login'); };

  const handleRefund = async (order_id) => {
    if (!window.confirm('Issue full refund for this order?')) return;
    setRefundingId(order_id);
    try {
      await refundOrder(order_id, 'full');
      alert('Refund initiated. Status will update via webhook shortly.');
    } catch (err) {
      setError(err.message);
    } finally {
      setRefundingId(null);
    }
  };

  const exportCSV = () => {
    const header = 'Order ID,Buyer,Email,Listing,Qty,Total Paid,Refund Status,Created\n';
    const rows = orders.map(o =>
      `${o.id},"${o.buyer_name}",${o.buyer_email},"${o.listings?.title ?? ''}",${o.quantity},${o.total_paid},${o.refund_status},${o.created_at}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredOrders = useMemo(() =>
    orders.filter(o =>
      !search ||
      o.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.listings?.title?.toLowerCase().includes(search.toLowerCase())
    ), [orders, search]);

  const totalRevenue = orders.reduce((s, o) => s + (o.total_paid ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm">Apparel Studio</span>
              <span className="text-gray-400 text-xs ml-2">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">{profileName || user?.user_metadata?.full_name || 'Account'}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto">✕</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Package}    label="Total Orders"     value={orders.length}   sub="all time"           color="blue"   />
          <KpiCard icon={DollarSign} label="Gross Revenue"    value={fmt(totalRevenue)} sub="before refunds"   color="green"  />
          <KpiCard icon={Clock}      label="Pending Review"   value={pendingCount}    sub="listings"           color="amber"  />
          <KpiCard icon={TrendingUp} label="Refunded Orders"  value={orders.filter(o => o.refund_status !== 'none').length} sub="partial or full" color="purple" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {t.key === 'review' && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Review Listings ─────────────────────────────────────────────── */}
        {tab === 'review' && <AdminListingsPanel />}

        {/* ── Clubs ────────────────────────────────────────────────────────── */}
        {tab === 'clubs' && <AdminClubsPanel />}

        {/* ── Users ────────────────────────────────────────────────────────── */}
        {tab === 'users' && <AdminUsersPanel />}

        {/* ── Orders ───────────────────────────────────────────────────────── */}
        {tab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search buyer or listing…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <button
                onClick={loadOrders}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Buyer', 'Listing', 'Qty', 'Total Paid', 'Refund', 'Date', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {dataLoading && <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td></tr>}
                    {!dataLoading && filteredOrders.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-10 text-gray-400">No orders found.</td></tr>
                    )}
                    {filteredOrders.map(order => (
                      <React.Fragment key={order.id}>
                        <tr
                          className="hover:bg-gray-50/70 cursor-pointer"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-gray-800">{order.buyer_name}</div>
                            <div className="text-xs text-gray-400">{order.buyer_email}</div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-700">{order.listings?.title ?? '—'}</td>
                          <td className="px-5 py-3.5 tabular-nums">{order.quantity}</td>
                          <td className="px-5 py-3.5 font-semibold tabular-nums">{fmt(order.total_paid)}</td>
                          <td className="px-5 py-3.5"><Badge value={order.refund_status} /></td>
                          <td className="px-5 py-3.5 text-gray-400 text-xs tabular-nums">{order.created_at?.slice(0, 10)}</td>
                          <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                            {order.refund_status !== 'full' && order.stripe_payment_intent && (
                              <button
                                onClick={() => handleRefund(order.id)}
                                disabled={refundingId === order.id}
                                className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-md hover:bg-red-100 disabled:opacity-50"
                              >
                                {refundingId === order.id ? 'Refunding…' : 'Refund'}
                              </button>
                            )}
                          </td>
                        </tr>
                        {expandedOrder === order.id && (
                          <tr className="bg-gray-50">
                            <td colSpan={7} className="px-5 py-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><span className="text-xs text-gray-400 uppercase">Student ID</span><p className="mt-0.5">{order.student_id || '—'}</p></div>
                                <div><span className="text-xs text-gray-400 uppercase">Size</span><p className="mt-0.5">{order.size || '—'}</p></div>
                                <div><span className="text-xs text-gray-400 uppercase">Refund Amount</span><p className="mt-0.5">{fmt(order.refund_amount)}</p></div>
                                <div><span className="text-xs text-gray-400 uppercase">Payment Intent</span><p className="mt-0.5 font-mono text-xs truncate">{order.stripe_payment_intent || '—'}</p></div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </div>
        )}

        {/* ── Analytics ────────────────────────────────────────────────────── */}
        {tab === 'analytics' && (
          <AnalyticsPanel analytics={analytics} loading={!analytics} error={analyticsError} />
        )}

        {/* ── Discount Codes ───────────────────────────────────────────────── */}
        {tab === 'discounts' && (
          <DiscountCodesPanel />
        )}
      </div>
    </div>
  );
}
