import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import axiosInstance from '../../api/axiosInstance';

const StatCard = ({ label, value, accent, loading }) => (
  <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10,
    padding:'1.2rem 1.4rem', flex:1, minWidth:120 }}>
    <div style={{ color: accent ? '#c9a84c' : '#f0f0f0', fontSize:'1.8rem',
      fontWeight:900, lineHeight:1, marginBottom:6 }}>
      {loading ? <span style={{ color:'#2a2a2a' }}>—</span> : (value ?? 0).toLocaleString()}
    </div>
    <div style={{ color:'#555', fontSize:'0.75rem', fontWeight:600,
      textTransform:'uppercase', letterSpacing:0.5 }}>{label}</div>
  </div>
);

const QUICK_LINKS = [
  ['/admin/dealers',  'Manage Dealers',  '◧'],
  ['/admin/listings', 'Manage Listings', '◉'],
  ['/admin/users',    'Manage Users',    '◎'],
  ['/admin/boosts',   'View Boosts',     '★'],
];

export default function AdminDashboard() {
  const [stats,    setStats]    = useState(null);
  const [pending,  setPending]  = useState({ dealers:[], listings:[] });
  const [loading,  setLoading]  = useState(true);
  const [approving, setApproving] = useState({});

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/admin/stats'),
      axiosInstance.get('/admin/dealers?approved=false&limit=5'),
      axiosInstance.get('/admin/listings?approved=false&limit=5'),
    ]).then(([s, d, l]) => {
      setStats(s.data);
      setPending({ dealers: d.data.dealers || [], listings: l.data.listings || [] });
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const approveDealer = async (id) => {
    setApproving(p => ({ ...p, [id]: true }));
    try {
      await axiosInstance.put(`/admin/dealers/${id}/approve`);
      setPending(p => ({ ...p, dealers: p.dealers.filter(d => d._id !== id) }));
      setStats(s => s ? { ...s, pendingDealers: s.pendingDealers - 1 } : s);
      toast.success('Dealer approved');
    } catch { toast.error('Approval failed'); }
    finally { setApproving(p => ({ ...p, [id]: false })); }
  };

  const approveListing = async (id) => {
    setApproving(p => ({ ...p, [id]: true }));
    try {
      await axiosInstance.put(`/admin/listings/${id}/approve`);
      setPending(p => ({ ...p, listings: p.listings.filter(l => l._id !== id) }));
      setStats(s => s ? { ...s, pendingListings: s.pendingListings - 1 } : s);
      toast.success('Listing approved');
    } catch { toast.error('Approval failed'); }
    finally { setApproving(p => ({ ...p, [id]: false })); }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth:1100 }}>
        <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700, marginBottom:'1.5rem' }}>
          Dashboard
        </h1>

        {/* Stats */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', marginBottom:'2rem' }}>
          <StatCard label="Total Users"       value={stats?.totalUsers}       loading={loading} />
          <StatCard label="Total Dealers"     value={stats?.totalDealers}     loading={loading} />
          <StatCard label="Pending Dealers"   value={stats?.pendingDealers}   loading={loading} accent />
          <StatCard label="Total Listings"    value={stats?.totalListings}    loading={loading} />
          <StatCard label="Pending Listings"  value={stats?.pendingListings}  loading={loading} accent />
          <StatCard label="Total Enquiries"   value={stats?.totalEnquiries}   loading={loading} />
          <StatCard label="Active Boosts"     value={stats?.activeBoosts}     loading={loading} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'1.5rem', alignItems:'start' }}
          className="dash-grid">

          {/* Pending dealers */}
          <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, overflow:'hidden' }}>
            <div style={{ padding:'0.9rem 1.25rem', borderBottom:'1px solid #1e1e1e',
              display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'#f0f0f0', fontWeight:700, fontSize:'0.88rem' }}>
                Pending Dealers
              </span>
              <Link to="/admin/dealers?approved=false" style={{ color:'#c9a84c', fontSize:'0.78rem' }}>
                View all
              </Link>
            </div>
            {loading ? <div style={{ padding:'2rem', color:'#333', textAlign:'center' }}>Loading…</div>
            : pending.dealers.length === 0
              ? <div style={{ padding:'2rem', color:'#444', textAlign:'center', fontSize:'0.85rem' }}>
                  No pending dealers ✓
                </div>
              : pending.dealers.map(d => (
                <div key={d._id} style={{ padding:'0.8rem 1.25rem', borderBottom:'1px solid #1a1a1a',
                  display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem' }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ color:'#f0f0f0', fontSize:'0.85rem', fontWeight:600,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {d.businessName}
                    </div>
                    <div style={{ color:'#555', fontSize:'0.75rem', marginTop:2 }}>
                      {d.user?.name} · {d.region}
                    </div>
                  </div>
                  <button onClick={() => approveDealer(d._id)} disabled={approving[d._id]}
                    style={{ background:'#c9a84c', color:'#0d0d0d', border:'none', borderRadius:5,
                      padding:'4px 12px', fontSize:'0.78rem', fontWeight:700, cursor:'pointer',
                      opacity: approving[d._id] ? 0.5 : 1, flexShrink:0 }}>
                    {approving[d._id] ? '…' : 'Approve'}
                  </button>
                </div>
              ))}
          </div>

          {/* Pending listings */}
          <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, overflow:'hidden' }}>
            <div style={{ padding:'0.9rem 1.25rem', borderBottom:'1px solid #1e1e1e',
              display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'#f0f0f0', fontWeight:700, fontSize:'0.88rem' }}>
                Pending Listings
              </span>
              <Link to="/admin/listings?approved=false" style={{ color:'#c9a84c', fontSize:'0.78rem' }}>
                View all
              </Link>
            </div>
            {loading ? <div style={{ padding:'2rem', color:'#333', textAlign:'center' }}>Loading…</div>
            : pending.listings.length === 0
              ? <div style={{ padding:'2rem', color:'#444', textAlign:'center', fontSize:'0.85rem' }}>
                  No pending listings ✓
                </div>
              : pending.listings.map(l => (
                <div key={l._id} style={{ padding:'0.8rem 1.25rem', borderBottom:'1px solid #1a1a1a',
                  display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem' }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ color:'#f0f0f0', fontSize:'0.85rem', fontWeight:600,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {l.title}
                    </div>
                    <div style={{ color:'#555', fontSize:'0.75rem', marginTop:2 }}>
                      {l.dealer?.businessName} · {l.region}
                    </div>
                  </div>
                  <button onClick={() => approveListing(l._id)} disabled={approving[l._id]}
                    style={{ background:'#c9a84c', color:'#0d0d0d', border:'none', borderRadius:5,
                      padding:'4px 12px', fontSize:'0.78rem', fontWeight:700, cursor:'pointer',
                      opacity: approving[l._id] ? 0.5 : 1, flexShrink:0 }}>
                    {approving[l._id] ? '…' : 'Approve'}
                  </button>
                </div>
              ))}
          </div>

          {/* Quick links */}
          <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10,
            padding:'1.1rem', display:'flex', flexDirection:'column', gap:'0.6rem', minWidth:180 }}>
            <div style={{ color:'#555', fontSize:'0.72rem', fontWeight:700,
              textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Quick Links</div>
            {QUICK_LINKS.map(([to, label, icon]) => (
              <Link key={to} to={to}
                style={{ display:'flex', alignItems:'center', gap:8, background:'#1a1a1a',
                  border:'1px solid #2a2a2a', borderRadius:6, padding:'0.55rem 0.9rem',
                  color:'#ccc', fontSize:'0.84rem', textDecoration:'none',
                  transition:'border-color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#c9a84c44'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#2a2a2a'}>
                <span style={{ color:'#c9a84c' }}>{icon}</span> {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.dash-grid{grid-template-columns:1fr!important}}`}</style>
    </AdminLayout>
  );
}
