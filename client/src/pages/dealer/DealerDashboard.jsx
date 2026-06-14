import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DealerLayout from './DealerLayout';
import axiosInstance from '../../api/axiosInstance';

const StatCard = ({ label, value, accent }) => (
  <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10,
    padding:'1.25rem', flex:1, minWidth:130 }}>
    <div style={{ color: accent ? '#c9a84c' : '#666', fontSize:'0.75rem',
      fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>
      {label}
    </div>
    <div style={{ color:'#f0f0f0', fontSize:'1.9rem', fontWeight:800 }}>
      {value ?? <span style={{ color:'#333', fontSize:'1.2rem' }}>—</span>}
    </div>
  </div>
);

const statusColors = { new:'#c9a84c', read:'#888', responded:'#52c07a', closed:'#555' };
const typeLabel    = { general:'General', price:'Price', test_drive:'Test Drive', finance:'Finance' };

export default function DealerDashboard() {
  const [stats,     setStats]     = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [dealer,    setDealer]    = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/dealers/stats'),
      axiosInstance.get('/dealers/enquiries?limit=5'),
      axiosInstance.get('/dealers/profile'),
    ]).then(([s, e, d]) => {
      setStats(s.data);
      setEnquiries(e.data.enquiries?.slice(0,5) || []);
      setDealer(d.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <DealerLayout>
      {/* Pending approval banner */}
      {dealer && !dealer.isApproved && (
        <div style={{ background:'#2a1f00', border:'1px solid #c9a84c44', borderRadius:8,
          padding:'0.9rem 1.25rem', marginBottom:'1.5rem', display:'flex',
          alignItems:'center', gap:12 }}>
          <span style={{ fontSize:'1.2rem' }}>⏳</span>
          <div>
            <div style={{ color:'#c9a84c', fontWeight:700, fontSize:'0.88rem' }}>
              Account Pending Approval
            </div>
            <div style={{ color:'#a07830', fontSize:'0.82rem', marginTop:2 }}>
              Your account is pending admin approval. You can still create listings, but they won't be visible to buyers until your account is approved.
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700 }}>Dashboard</h1>
        <Link to="/dealer/listings/create"
          style={{ background:'#c9a84c', color:'#0d0d0d', padding:'0.55rem 1.1rem',
            borderRadius:6, fontWeight:700, fontSize:'0.85rem', textDecoration:'none' }}>
          + Add Listing
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'2rem' }}>
        <StatCard label="Total Listings"  value={loading ? '…' : stats?.totalListings}  />
        <StatCard label="Active Listings" value={loading ? '…' : stats?.activeListings} />
        <StatCard label="Total Views"     value={loading ? '…' : stats?.totalViews?.toLocaleString()} accent />
        <StatCard label="Total Enquiries" value={loading ? '…' : stats?.totalEnquiries} />
        <StatCard label="New Enquiries"   value={loading ? '…' : stats?.newEnquiries}   accent />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'1.5rem', alignItems:'start' }}
        className="dash-grid">

        {/* Recent enquiries */}
        <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, overflow:'hidden' }}>
          <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #1e1e1e',
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'#f0f0f0', fontWeight:700, fontSize:'0.92rem' }}>Recent Enquiries</span>
            <Link to="/dealer/enquiries" style={{ color:'#c9a84c', fontSize:'0.8rem' }}>View all</Link>
          </div>
          {loading ? (
            <div style={{ padding:'2rem', color:'#444', textAlign:'center' }}>Loading…</div>
          ) : enquiries.length === 0 ? (
            <div style={{ padding:'2rem', color:'#555', textAlign:'center', fontSize:'0.88rem' }}>
              No enquiries yet.
            </div>
          ) : enquiries.map(e => (
            <div key={e._id} style={{ padding:'0.9rem 1.25rem', borderBottom:'1px solid #1a1a1a',
              display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem' }}>
              <div style={{ minWidth:0 }}>
                <div style={{ color:'#f0f0f0', fontSize:'0.85rem', fontWeight:600,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {e.listing?.title || 'Listing removed'}
                </div>
                <div style={{ color:'#666', fontSize:'0.76rem', marginTop:2 }}>
                  {e.user?.name || e.guestName || 'Guest'} · {typeLabel[e.type] || e.type}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                <span style={{ background: statusColors[e.status]+'22',
                  color: statusColors[e.status], fontSize:'0.7rem',
                  padding:'2px 8px', borderRadius:4, fontWeight:700, textTransform:'uppercase' }}>
                  {e.status}
                </span>
                <span style={{ color:'#555', fontSize:'0.72rem' }}>
                  {new Date(e.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10,
          padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.75rem', minWidth:190 }}>
          <div style={{ color:'#f0f0f0', fontWeight:700, fontSize:'0.92rem', marginBottom:'0.25rem' }}>
            Quick Actions
          </div>
          {[
            ['/dealer/listings/create', '+ Add New Listing',   '#c9a84c', '#0d0d0d'],
            ['/dealer/listings',        '◧ View All Listings', '#1a1a1a', '#f0f0f0'],
            ['/dealer/profile',         '◉ Edit Profile',      '#1a1a1a', '#f0f0f0'],
          ].map(([to, label, bg, color]) => (
            <Link key={to} to={to} style={{ background:bg, color, border:'1px solid #2a2a2a',
              borderRadius:6, padding:'0.6rem 1rem', fontSize:'0.84rem', fontWeight:600,
              textDecoration:'none', textAlign:'center', display:'block' }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:900px){.dash-grid{grid-template-columns:1fr!important}}`}</style>
    </DealerLayout>
  );
}
