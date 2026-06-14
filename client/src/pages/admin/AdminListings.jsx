import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import axiosInstance from '../../api/axiosInstance';

const PLACEHOLDER = 'https://via.placeholder.com/72x52/141414/444?text=No+Image';
const FILTERS = [
  { label:'All',     value:''      },
  { label:'Pending', value:'false' },
  { label:'Approved',value:'true'  },
];
const fmt = (n, cur) => cur==='USD' ? `$${Number(n).toLocaleString()}` : `GHS ${Number(n).toLocaleString()}`;

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10,
        padding:'1.75rem', maxWidth:400, width:'100%' }}>
        <div style={{ color:'#f0f0f0', fontWeight:700, fontSize:'1rem', marginBottom:'0.75rem' }}>{title}</div>
        <div style={{ color:'#888', fontSize:'0.88rem', lineHeight:1.6, marginBottom:'1.5rem' }}>{message}</div>
        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
          <button onClick={onCancel}
            style={{ background:'#1e1e1e', border:'1px solid #2a2a2a', color:'#ccc',
              borderRadius:6, padding:'0.55rem 1.25rem', cursor:'pointer', fontSize:'0.88rem' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            style={{ background:'#e05252', border:'none', color:'#fff', borderRadius:6,
              padding:'0.55rem 1.25rem', cursor:'pointer', fontWeight:700, fontSize:'0.88rem' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminListings() {
  const [listings,  setListings]  = useState([]);
  const [filter,    setFilter]    = useState('');
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [acting,    setActing]    = useState({});
  const [deleteModal, setDeleteModal] = useState(null);
  const searchTimer = useRef(null);
  const LIMIT = 20;

  const fetchListings = useCallback(async (p=1, f=filter, s=search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:p, limit:LIMIT });
      if (f !== '') params.set('approved', f);
      if (s)        params.set('search', s);
      const { data } = await axiosInstance.get(`/admin/listings?${params}`);
      setListings(data.listings || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load listings'); }
    finally  { setLoading(false); }
  }, [filter, search]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchListings(page, filter, search); }, [page, filter]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); fetchListings(1, filter, val); }, 500);
  };

  const act = async (id, endpoint, successMsg, update) => {
    setActing(p => ({ ...p, [id]: endpoint }));
    try {
      await axiosInstance.put(`/admin/listings/${id}/${endpoint}`);
      setListings(prev => prev.map(l => l._id===id ? { ...l, ...update } : l));
      toast.success(successMsg);
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setActing(p => ({ ...p, [id]: null })); }
  };

  const confirmDelete = async () => {
    const id = deleteModal;
    setDeleteModal(null);
    setActing(p => ({ ...p, [id]: 'delete' }));
    try {
      await axiosInstance.delete(`/admin/listings/${id}`);
      setListings(prev => prev.filter(l => l._id !== id));
      setTotal(t => t - 1);
      toast.success('Listing permanently deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setActing(p => ({ ...p, [id]: null })); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout>
      {deleteModal && (
        <ConfirmModal
          title="Delete Listing"
          message="This will permanently delete the listing and all its images from Cloudinary. This cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700 }}>Listings</h1>
          <div style={{ color:'#555', fontSize:'0.8rem', marginTop:3 }}>{total} total</div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
          <input value={search} onChange={e=>handleSearch(e.target.value)} placeholder="Search title, make…"
            style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:6,
              padding:'0.45rem 0.9rem', color:'#f0f0f0', fontSize:'0.85rem', outline:'none', width:220 }} />
          <div style={{ display:'flex', gap:'0.4rem' }}>
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
                style={{ background: filter===f.value?'#c9a84c':'#1a1a1a',
                  color: filter===f.value?'#0d0d0d':'#888', border:'1px solid #2a2a2a',
                  borderRadius:6, padding:'0.45rem 0.85rem', fontSize:'0.82rem', cursor:'pointer',
                  fontWeight: filter===f.value?700:400 }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, overflow:'hidden' }}>
        {loading ? <div style={{ padding:'3rem', textAlign:'center', color:'#444' }}>Loading…</div>
        : listings.length === 0
          ? <div style={{ padding:'3rem', textAlign:'center', color:'#555' }}>No listings found.</div>
          : <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #2a2a2a' }}>
                    {['Vehicle','Dealer','Price','Region','Status','Views','Date','Actions'].map(h => (
                      <th key={h} style={{ padding:'0.7rem 1rem', color:'#555', fontSize:'0.72rem',
                        fontWeight:700, textTransform:'uppercase', letterSpacing:0.5,
                        textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.map(l => (
                    <tr key={l._id} style={{ borderBottom:'1px solid #1a1a1a' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#181818'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <img src={l.images?.[0]||PLACEHOLDER} alt=""
                            style={{ width:70, height:48, objectFit:'cover', borderRadius:5,
                              border:'1px solid #2a2a2a', flexShrink:0 }}
                            onError={e=>{e.target.src=PLACEHOLDER;}} />
                          <div>
                            <div style={{ color:'#f0f0f0', fontSize:'0.82rem', fontWeight:600,
                              maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {l.title}
                            </div>
                            <div style={{ color:'#555', fontSize:'0.72rem', textTransform:'capitalize' }}>
                              {l.condition}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'0.8rem 1rem', color:'#888', fontSize:'0.82rem' }}>
                        {l.dealer?.businessName || '—'}
                      </td>
                      <td style={{ padding:'0.8rem 1rem', color:'#c9a84c', fontWeight:700,
                        fontSize:'0.82rem', whiteSpace:'nowrap' }}>
                        {fmt(l.price, l.currency)}
                      </td>
                      <td style={{ padding:'0.8rem 1rem', color:'#888', fontSize:'0.82rem' }}>{l.region}</td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        {l.isApproved
                          ? <span style={{ background:'#52c07a22',color:'#52c07a',fontSize:'0.7rem',padding:'2px 8px',borderRadius:4,fontWeight:700 }}>Approved</span>
                          : l.isActive
                            ? <span style={{ background:'#c9a84c22',color:'#c9a84c',fontSize:'0.7rem',padding:'2px 8px',borderRadius:4,fontWeight:700 }}>Pending</span>
                            : <span style={{ background:'#e0525222',color:'#e05252',fontSize:'0.7rem',padding:'2px 8px',borderRadius:4,fontWeight:700 }}>Rejected</span>}
                      </td>
                      <td style={{ padding:'0.8rem 1rem', color:'#888', fontSize:'0.82rem' }}>
                        {l.views||0}
                      </td>
                      <td style={{ padding:'0.8rem 1rem', color:'#555', fontSize:'0.75rem', whiteSpace:'nowrap' }}>
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <div style={{ display:'flex', gap:'0.4rem' }}>
                          {!l.isApproved && (
                            <button onClick={() => act(l._id,'approve','Listing approved',{isApproved:true,isActive:true})}
                              disabled={!!acting[l._id]}
                              style={{ background:'#c9a84c',border:'none',color:'#0d0d0d',borderRadius:4,
                                padding:'3px 10px',fontSize:'0.75rem',cursor:'pointer',fontWeight:700,
                                opacity:acting[l._id]?0.4:1 }}>
                              {acting[l._id]==='approve'?'…':'Approve'}
                            </button>
                          )}
                          {l.isApproved && (
                            <button onClick={() => act(l._id,'reject','Listing rejected',{isApproved:false,isActive:false})}
                              disabled={!!acting[l._id]}
                              style={{ background:'#1e1e1e',border:'1px solid #2a2a2a',color:'#e05252',
                                borderRadius:4,padding:'3px 10px',fontSize:'0.75rem',cursor:'pointer',
                                opacity:acting[l._id]?0.4:1 }}>
                              {acting[l._id]==='reject'?'…':'Reject'}
                            </button>
                          )}
                          <button onClick={() => setDeleteModal(l._id)} disabled={!!acting[l._id]}
                            style={{ background:'#1e1e1e',border:'1px solid #e0525244',color:'#e05252',
                              borderRadius:4,padding:'3px 10px',fontSize:'0.75rem',cursor:'pointer',
                              opacity:acting[l._id]?0.4:1 }}>
                            {acting[l._id]==='delete'?'…':'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
      </div>

      {totalPages > 1 && !loading && (
        <div style={{ display:'flex', gap:'0.5rem', marginTop:'1.25rem', flexWrap:'wrap' }}>
          {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>setPage(p)}
              style={{ width:36,height:36,borderRadius:6,border:'1px solid',
                borderColor:p===page?'#c9a84c':'#2a2a2a',
                background:p===page?'#c9a84c':'#1a1a1a',
                color:p===page?'#0d0d0d':'#ccc',cursor:'pointer',fontSize:'0.85rem' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
