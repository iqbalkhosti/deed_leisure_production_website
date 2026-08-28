import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Plus, LogOut, Clock, AlertTriangle,
  DollarSign, RefreshCw, X, BarChart2, Mail, Pencil,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import supabase from '../lib/supabase.js';
import PhotoUpload from '../components/PhotoUpload.jsx';
import { apiFetch } from '../lib/api.js';

const TABS = [
  { key: 'listings', label: 'My Listings' },
  { key: 'sales',    label: 'Sales' },
  { key: 'email',    label: 'Email Buyers' },
];

const STATUS_STYLES = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  closed:   'bg-gray-100 text-gray-500',
};

function Badge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function RefundBadge({ status }) {
  const styles = { none: 'bg-gray-100 text-gray-500', partial: 'bg-amber-100 text-amber-700', full: 'bg-red-100 text-red-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

const PRODUCT_TYPES = ['T-Shirt', 'Polo', 'Hoodie', 'Hat', 'Banner', 'Other'];
const fmt = (n) => `$${Number(n ?? 0).toFixed(2)}`;

const emptyForm = {
  title: '', description: '', product_type: 'T-Shirt',
  price: '', quantity_available: '', cost_per_unit: '',
  order_deadline: '', pickup_location: '', pickup_instructions: '', pickup_date: '',
  image_urls: [],
};

export default function ClubDashboard() {
  const { user, userClubId, profileName, signOut } = useAuth();

  const [tab, setTab]           = useState('listings');
  const [club, setClub]         = useState(null);
  const [listings, setListings] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // all orders for this club
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');

  // Email buyers state
  const [emailListingId, setEmailListingId] = useState('');
  const [emailSubject, setEmailSubject]     = useState('');
  const [emailMessage, setEmailMessage]     = useState('');
  const [emailSending, setEmailSending]     = useState(false);
  const [emailResult, setEmailResult]       = useState('');

  // Edit listing state
  const [editListing, setEditListing]   = useState(null);
  const [editForm, setEditForm]         = useState({});
  const [editSaving, setEditSaving]     = useState(false);
  const [editError, setEditError]       = useState('');

  // Load club, listings, and all orders for the club in one pass
  const loadData = useCallback(async () => {
    if (!userClubId) return;
    setLoading(true);
    setError('');
    try {
      const [clubRes, listingsRes] = await Promise.all([
        supabase.from('clubs').select('*').eq('id', userClubId).single(),
        supabase.from('listings').select('*').eq('club_id', userClubId).order('created_at', { ascending: false }),
      ]);
      if (clubRes.error) throw new Error(clubRes.error.message);
      if (listingsRes.error) throw new Error(listingsRes.error.message);
      setClub(clubRes.data);
      const listingData = listingsRes.data ?? [];
      setListings(listingData);

      // Fetch all orders for all this club's listings
      if (listingData.length > 0) {
        const listingIds = listingData.map(l => l.id);
        const { data: ordersData, error: ordersErr } = await supabase
          .from('orders')
          .select('*, listings(title)')
          .in('listing_id', listingIds)
          .order('created_at', { ascending: false });
        if (ordersErr) throw new Error(ordersErr.message);
        setAllOrders(ordersData ?? []);
      } else {
        setAllOrders([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userClubId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFieldChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.price || !form.quantity_available || !form.order_deadline) {
      return setFormError('Title, price, quantity, and deadline are required.');
    }
    setSubmitting(true);
    try {
      const { error: insertErr } = await supabase.from('listings').insert({
        club_id: userClubId,
        title: form.title,
        description: form.description || null,
        product_type: form.product_type,
        price: parseFloat(form.price),
        quantity_available: parseInt(form.quantity_available),
        cost_per_unit: parseFloat(form.cost_per_unit) || 0,
        order_deadline: new Date(form.order_deadline).toISOString(),
        pickup_location: form.pickup_location || null,
        pickup_instructions: form.pickup_instructions || null,
        pickup_date: form.pickup_date || null,
        image_urls: form.image_urls ?? [],
        status: 'pending',
      });
      if (insertErr) throw new Error(insertErr.message);
      setForm(emptyForm);
      setShowForm(false);
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (listing) => {
    setEditListing(listing);
    setEditError('');
    setEditForm({
      title:               listing.title,
      description:         listing.description ?? '',
      product_type:        listing.product_type,
      price:               listing.price,
      quantity_available:  listing.quantity_available,
      cost_per_unit:       listing.cost_per_unit ?? 0,
      order_deadline:      listing.order_deadline ? listing.order_deadline.slice(0, 16) : '',
      pickup_location:     listing.pickup_location ?? '',
      pickup_instructions: listing.pickup_instructions ?? '',
      pickup_date:         listing.pickup_date ?? '',
      image_urls:          listing.image_urls ?? [],
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError('');
    const isApproved = editListing.status === 'approved';
    const patch = {
      description:         editForm.description || null,
      image_urls:          editForm.image_urls ?? [],
      pickup_location:     editForm.pickup_location || null,
      pickup_instructions: editForm.pickup_instructions || null,
      pickup_date:         editForm.pickup_date || null,
      quantity_available:  parseInt(editForm.quantity_available),
    };
    // Allow editing structural fields only on pending listings
    if (!isApproved) {
      patch.title          = editForm.title;
      patch.product_type   = editForm.product_type;
      patch.price          = parseFloat(editForm.price);
      patch.cost_per_unit  = parseFloat(editForm.cost_per_unit) || 0;
      patch.order_deadline = editForm.order_deadline ? new Date(editForm.order_deadline).toISOString() : null;
    }
    const { error: err } = await supabase
      .from('listings')
      .update(patch)
      .eq('id', editListing.id);
    if (err) {
      setEditError(err.message);
    } else {
      setListings(prev => prev.map(l => l.id === editListing.id ? { ...l, ...patch } : l));
      setEditListing(null);
    }
    setEditSaving(false);
  };

  // Sales summary stats
  const totalRevenue  = allOrders.reduce((s, o) => s + (o.total_paid ?? 0), 0);
  const totalUnits    = allOrders.reduce((s, o) => s + (o.quantity ?? 0), 0);
  const totalRefunded = allOrders.filter(o => o.refund_status !== 'none').length;

  if (loading && !club) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading dashboard…</div>;
  }

  if (!userClubId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <h1 className="text-xl font-bold">No Club Assigned</h1>
        <p className="text-gray-500">Your account is not linked to a club. Contact an admin to assign you.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm">{club?.name ?? 'Club Dashboard'}</span>
              <span className="text-gray-400 text-xs ml-2">Vendor Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">{profileName || user?.user_metadata?.full_name || 'Account'}</span>
            <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto">✕</button>
          </div>
        )}

        {/* Tabs + actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
                {t.key === 'sales' && allOrders.length > 0 && (
                  <span className="ml-1.5 bg-gray-200 text-gray-600 text-xs rounded-full px-1.5 py-0.5">{allOrders.length}</span>
                )}
              </button>
            ))}
          </div>

          {tab === 'listings' && (
            <div className="flex gap-2">
              <button onClick={loadData} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => { setShowForm(s => !s); setFormError(''); }}
                className="flex items-center gap-1.5 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> New Listing
              </button>
            </div>
          )}
        </div>

        {/* ── LISTINGS TAB ─────────────────────────────────────────────────── */}
        {tab === 'listings' && (
          <>
            {/* Create listing form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-800">New Listing</h3>
                  <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {formError}
                  </div>
                )}

                <form onSubmit={handleCreateListing} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input type="text" required value={form.title} onChange={e => handleFieldChange('title', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="Engineering Hoodie 2026" />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea value={form.description} onChange={e => handleFieldChange('description', e.target.value)} rows={2}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                        placeholder="Colour, print details, sizing notes…" />
                    </div>

                    {/* Product type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                      <select value={form.product_type} onChange={e => handleFieldChange('product_type', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                        {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price per unit (CAD) *</label>
                      <input type="number" min="0" step="0.01" required value={form.price}
                        onChange={e => handleFieldChange('price', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="25.00" />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available *</label>
                      <input type="number" min="1" required value={form.quantity_available}
                        onChange={e => handleFieldChange('quantity_available', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="50" />
                    </div>

                    {/* Cost per unit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your cost per unit</label>
                      <input type="number" min="0" step="0.01" value={form.cost_per_unit}
                        onChange={e => handleFieldChange('cost_per_unit', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="12.00" />
                    </div>

                    {/* Order deadline */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Deadline *</label>
                      <input type="datetime-local" required value={form.order_deadline}
                        onChange={e => handleFieldChange('order_deadline', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                    </div>

                    {/* Pickup date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                      <input type="date" value={form.pickup_date}
                        onChange={e => handleFieldChange('pickup_date', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                    </div>

                    {/* Pickup location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                      <input type="text" value={form.pickup_location}
                        onChange={e => handleFieldChange('pickup_location', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="UC Building, Room 112" />
                    </div>

                    {/* Pickup instructions */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Instructions</label>
                      <textarea value={form.pickup_instructions}
                        onChange={e => handleFieldChange('pickup_instructions', e.target.value)} rows={2}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                        placeholder="Bring your student ID and order confirmation." />
                    </div>

                    {/* Photos */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Photos (up to 5)</label>
                      <PhotoUpload
                        urls={form.image_urls}
                        onChange={urls => handleFieldChange('image_urls', urls)}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                    Listing will be submitted as pending and must be approved by an admin before going live.
                  </p>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting}
                      className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-60 transition-colors">
                      {submitting ? 'Submitting…' : 'Submit for Approval'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Edit Modal ─────────────────────────────────────────────── */}
            {editListing && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                      <h2 className="font-bold text-gray-900">Edit Listing</h2>
                      {editListing.status === 'approved' && (
                        <p className="text-xs text-amber-600 mt-0.5">Approved — price, deadline, and product type are locked.</p>
                      )}
                    </div>
                    <button onClick={() => setEditListing(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6">
                    {editError && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {editError}
                      </div>
                    )}

                    <form onSubmit={handleEditSave} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Title — locked when approved */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                          <input
                            type="text" required
                            value={editForm.title}
                            disabled={editListing.status === 'approved'}
                            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                          />
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={editForm.description}
                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                          />
                        </div>

                        {/* Product type — locked when approved */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Product Type</label>
                          <select
                            value={editForm.product_type}
                            disabled={editListing.status === 'approved'}
                            onChange={e => setEditForm(f => ({ ...f, product_type: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                          >
                            {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>

                        {/* Price — locked when approved */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Price per unit (CAD)</label>
                          <input
                            type="number" min="0" step="0.01" required
                            value={editForm.price}
                            disabled={editListing.status === 'approved'}
                            onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                          />
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity Available</label>
                          <input
                            type="number" min="0" required
                            value={editForm.quantity_available}
                            onChange={e => setEditForm(f => ({ ...f, quantity_available: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        </div>

                        {/* Order deadline — locked when approved */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Order Deadline</label>
                          <input
                            type="datetime-local"
                            value={editForm.order_deadline}
                            disabled={editListing.status === 'approved'}
                            onChange={e => setEditForm(f => ({ ...f, order_deadline: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                          />
                        </div>

                        {/* Pickup location */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Location</label>
                          <input
                            type="text"
                            value={editForm.pickup_location}
                            onChange={e => setEditForm(f => ({ ...f, pickup_location: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        </div>

                        {/* Pickup date */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Date</label>
                          <input
                            type="date"
                            value={editForm.pickup_date}
                            onChange={e => setEditForm(f => ({ ...f, pickup_date: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        </div>

                        {/* Pickup instructions */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Instructions</label>
                          <textarea
                            rows={2}
                            value={editForm.pickup_instructions}
                            onChange={e => setEditForm(f => ({ ...f, pickup_instructions: e.target.value }))}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                          />
                        </div>

                        {/* Photos */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Photos (up to 5)</label>
                          <PhotoUpload
                            urls={editForm.image_urls}
                            onChange={urls => setEditForm(f => ({ ...f, image_urls: urls }))}
                            disabled={editSaving}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditListing(null)}
                          className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={editSaving}
                          className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-60 transition-colors"
                        >
                          {editSaving ? 'Saving…' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Listings list */}
            {listings.length === 0 && !loading ? (
              <div className="bg-white rounded-2xl border border-gray-100 px-8 py-12 text-center">
                <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No listings yet. Create your first one above.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Title', 'Status', 'Qty Left', 'Deadline', 'Link', ''].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {listings.map(l => (
                        <tr key={l.id} className="hover:bg-gray-50/70">
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-gray-800">{l.title}</div>
                            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                              <DollarSign className="w-3 h-3" />{fmt(l.price)} · {l.product_type}
                              {l.auto_closed && <span className="text-gray-400">(auto-closed)</span>}
                            </div>
                          </td>
                          <td className="px-5 py-3.5"><Badge status={l.status} /></td>
                          <td className="px-5 py-3.5 tabular-nums">{l.quantity_available}</td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs tabular-nums flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            {l.order_deadline ? new Date(l.order_deadline).toLocaleDateString('en-CA', { dateStyle: 'medium' }) : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            {l.status === 'approved' && (
                              <Link to={`/listings/${l.id}`} className="text-xs text-primary underline">
                                Public page
                              </Link>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {l.status !== 'closed' && (
                              <button
                                onClick={() => openEdit(l)}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-2.5 py-1 rounded-md transition-colors"
                              >
                                <Pencil className="w-3 h-3" /> Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── EMAIL BUYERS TAB ───────────────────────────────────────────────── */}
        {tab === 'email' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 max-w-xl">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Buyers</h3>
              <p className="text-sm text-gray-500">Send a message to everyone who ordered a specific listing.</p>
            </div>

            {emailResult && (
              <div className={`rounded-lg px-4 py-3 text-sm ${emailResult.startsWith('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                {emailResult}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing</label>
              <select
                value={emailListingId}
                onChange={e => setEmailListingId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">— Select a listing —</option>
                {listings.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder="Update on your order"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={emailMessage}
                onChange={e => setEmailMessage(e.target.value)}
                rows={5}
                placeholder="Hi! Your order is ready for pickup…"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              />
            </div>

            <button
              disabled={emailSending || !emailListingId || !emailSubject || !emailMessage}
              onClick={async () => {
                setEmailSending(true);
                setEmailResult('');
                try {
                  await apiFetch('/vendor/send-email', {
                    method: 'POST',
                    body: JSON.stringify({ listing_id: emailListingId, subject: emailSubject, message: emailMessage }),
                  });
                  setEmailResult('Emails sent successfully!');
                  setEmailSubject('');
                  setEmailMessage('');
                } catch (err) {
                  setEmailResult(`Error: ${err.message}`);
                } finally {
                  setEmailSending(false);
                }
              }}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              {emailSending ? 'Sending…' : 'Send Email to Buyers'}
            </button>
          </div>
        )}

        {/* ── SALES TAB ──────────────────────────────────────────────────────── */}
        {tab === 'sales' && (
          <div className="space-y-5">
            {/* Sales summary KPIs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{fmt(totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Units Sold</p>
                <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
              </div>
            </div>

            {/* Orders table */}
            {allOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 px-8 py-12 text-center">
                <BarChart2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No orders yet. Sales will appear here once your listings go live.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Buyer', 'Listing', 'Size', 'Qty', 'Total Paid', 'Refund', 'Date'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {allOrders.map(o => (
                        <tr key={o.id} className="hover:bg-gray-50/70">
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-gray-800">{o.buyer_name}</div>
                            <div className="text-xs text-gray-400">{o.buyer_email}</div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 text-xs">{o.listings?.title ?? '—'}</td>
                          <td className="px-5 py-3.5 text-gray-600">{o.size || '—'}</td>
                          <td className="px-5 py-3.5 tabular-nums">{o.quantity}</td>
                          <td className="px-5 py-3.5 font-semibold tabular-nums">{fmt(o.total_paid)}</td>
                          <td className="px-5 py-3.5"><RefundBadge status={o.refund_status} /></td>
                          <td className="px-5 py-3.5 text-gray-400 text-xs tabular-nums">{o.created_at?.slice(0, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
                  {allOrders.length} order{allOrders.length !== 1 ? 's' : ''} · {fmt(totalRevenue)} total · {totalUnits} units
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
