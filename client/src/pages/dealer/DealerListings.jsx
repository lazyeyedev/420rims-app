import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DealerLayout from './DealerLayout';
import axiosInstance from '../../api/axiosInstance';

const PLACEHOLDER = 'https://via.placeholder.com/80x56/141414/444?text=No+Image';

const statusBadge = (l) => {
  if (!l.isActive)   return { label:'Inactive',        bg:'#e0525222', color:'#e05252' };
  if (!l.isApproved) return { label:'Pending Approval', bg:'#c9a84c22', color:'#c9a84c' };
  return                    { label:'Active',           bg:'#52c07a22', color:'#52c07a' };
};

const fmt = (n, cur) => cur==='USD' ? `$${Number(n).toLocaleString()}` : `GHS ${Number(n).toLocaleString()}`;

export default function DealerListings() {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();
  const LIMIT = 20;

  const fetch = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/listings/dealer/mine?page=${p}&limit=${LIMIT}`);
      setListings(data.listings);
      setTotal(data.total);
    } catch { toast.error('Failed to load listings'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetch(page); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this listing? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await axiosInstance.delete(`/listings/${id}`);
      toast.success('Listing removed');
      fetch(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setDeleting(null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <DealerLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700 }}>My Listings</h1>
          {!loading && <div style={{ color:'#555', fontSize:'0.8rem', marginTop:2 }}>{total} total</div>}
        </div>
        <Link to="/dealer/listings/create"
          style={{ background:'#c9a84c', color:'#0d0d0d', padding:'0.55rem 1.1rem',
            borderRadius:6, fontWeight:700, fontSize:'0.85rem', textDecoration:'none' }}>
          + Add New Listing
        </Link>
      </div>

      <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'#444' }}>Loading…</div>
        ) : listings.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'#555' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🚗</div>
            <div style={{ marginBottom:'1rem' }}>No listings yet.</div>
            <Link to="/dealer/listings/create"
              style={{ color:'#c9a84c', fontWeight:600, fontSize:'0.9rem' }}>
              Create your first listing →
            </Link>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #2a2a2a' }}>
                  {['Vehicle','Price','Status','Views','Enquiries','Date','Actions'].map(h => (
                    <th key={h} style={{ padding:'0.75rem 1rem', color:'#666', fontSize:'0.75rem',
                      fontWeight:700, textTransform:'uppercase', letterSpacing:0.5,
                      textAlign: h==='Actions' ? 'right' : 'left', whiteSpace:'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map(l => {
                  const badge = statusBadge(l);
                  return (
                    <tr key={l._id} style={{ borderBottom:'1px solid #1a1a1a' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#181818'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'0.75rem 1rem', display:'flex', alignItems:'center', gap:12 }}>
                        <img src={l.images?.[0] || PLACEHOLDER} alt={l.title}
                          style={{ width:70, height:48, objectFit:'cover', borderRadius:6,
                            border:'1px solid #2a2a2a', flexShrink:0 }}
                          onError={e=>{e.target.src=PLACEHOLDER;}} />
                        <div>
                          <div style={{ color:'#f0f0f0', fontSize:'0.85rem', fontWeight:600,
                            maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {l.title}
                          </div>
                          <div style={{ color:'#555', fontSize:'0.75rem', marginTop:2,
                            textTransform:'capitalize' }}>
                            {l.condition} · {l.bodyType}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'0.75rem 1rem', color:'#c9a84c', fontWeight:700,
                        fontSize:'0.88rem', whiteSpace:'nowrap' }}>
                        {fmt(l.price, l.currency)}
                      </td>
                      <td style={{ padding:'0.75rem 1rem' }}>
                        <span style={{ background:badge.bg, color:badge.color, fontSize:'0.72rem',
                          padding:'3px 9px', borderRadius:4, fontWeight:700 }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding:'0.75rem 1rem', color:'#888', fontSize:'0.85rem' }}>
                        {l.views || 0}
                      </td>
                      <td style={{ padding:'0.75rem 1rem', color:'#888', fontSize:'0.85rem' }}>
                        {l.enquiryCount || 0}
                      </td>
                      <td style={{ padding:'0.75rem 1rem', color:'#555', fontSize:'0.78rem',
                        whiteSpace:'nowrap' }}>
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding:'0.75rem 1rem', textAlign:'right', whiteSpace:'nowrap' }}>
                        <button onClick={() => navigate(`/dealer/listings/edit/${l._id}`)}
                          style={{ background:'#1e1e1e', border:'1px solid #2a2a2a', color:'#ccc',
                            borderRadius:5, padding:'4px 12px', fontSize:'0.78rem',
                            cursor:'pointer', marginRight:6 }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(l._id)} disabled={deleting===l._id}
                          style={{ background:'#2a1010', border:'1px solid #e0525244', color:'#e05252',
                            borderRadius:5, padding:'4px 12px', fontSize:'0.78rem',
                            cursor: deleting===l._id ? 'not-allowed' : 'pointer',
                            opacity: deleting===l._id ? 0.5 : 1 }}>
                          {deleting===l._id ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginTop:'1.5rem' }}>
          {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width:36, height:36, borderRadius:6, border:'1px solid',
                borderColor: p===page ? '#c9a84c' : '#2a2a2a',
                background:  p===page ? '#c9a84c' : '#1a1a1a',
                color:       p===page ? '#0d0d0d' : '#ccc',
                cursor:'pointer', fontSize:'0.85rem', fontWeight: p===page ? 700 : 400 }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </DealerLayout>
  );
}
