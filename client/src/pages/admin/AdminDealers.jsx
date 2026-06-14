import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import axiosInstance from '../../api/axiosInstance';

const FILTERS = [
  { label:'All',       value:''      },
  { label:'Pending',   value:'false' },
  { label:'Approved',  value:'true'  },
];

const TIER_COLOR = { basic:'#666', pro:'#c9a84c', premium:'#e0c070' };

const Badge = ({ label, bg, color }) => (
  <span style={{ background:bg, color, fontSize:'0.7rem', padding:'2px 8px',
    borderRadius:4, fontWeight:700, textTransform:'uppercase' }}>{label}</span>
);

const ActionBtn = ({ label, onClick, color='#ccc', bg='#1e1e1e', disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background:bg, border:'1px solid #2a2a2a', color, borderRadius:4,
      padding:'3px 10px', fontSize:'0.75rem', cursor: disabled?'not-allowed':'pointer',
      opacity: disabled?0.4:1, fontWeight:600 }}>
    {label}
  </button>
);

export default function AdminDealers() {
  const [dealers,  setDealers]  = useState([]);
  const [filter,   setFilter]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [acting,   setActing]   = useState({});
  const LIMIT = 20;

  const fetch = useCallback(async (p=1, f=filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:p, limit:LIMIT });
      if (f !== '') params.set('approved', f);
      const { data } = await axiosInstance.get(`/admin/dealers?${params}`);
      setDealers(data.dealers || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load dealers'); }
    finally  { setLoading(false); }
  }, [filter]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(page, filter); }, [page, filter]);

  const act = async (id, endpoint, successMsg, update) => {
    setActing(p => ({ ...p, [id]: endpoint }));
    try {
      await axiosInstance.put(`/admin/dealers/${id}/${endpoint}`);
      setDealers(prev => prev.map(d => d._id === id ? { ...d, ...update } : d));
      toast.success(successMsg);
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    finally { setActing(p => ({ ...p, [id]: null })); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700 }}>Dealers</h1>
          <div style={{ color:'#555', fontSize:'0.8rem', marginTop:3 }}>{total} total</div>
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
              style={{ background: filter===f.value ? '#c9a84c' : '#1a1a1a',
                color: filter===f.value ? '#0d0d0d' : '#888',
                border:'1px solid #2a2a2a', borderRadius:6,
                padding:'0.45rem 0.9rem', fontSize:'0.82rem', cursor:'pointer',
                fontWeight: filter===f.value ? 700 : 400 }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, overflow:'hidden' }}>
        {loading ? <div style={{ padding:'3rem', textAlign:'center', color:'#444' }}>Loading…</div>
        : dealers.length === 0
          ? <div style={{ padding:'3rem', textAlign:'center', color:'#555' }}>No dealers found.</div>
          : <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #2a2a2a' }}>
                    {['Dealer','Owner','Region','Tier','Status','Actions'].map(h => (
                      <th key={h} style={{ padding:'0.7rem 1rem', color:'#555', fontSize:'0.72rem',
                        fontWeight:700, textTransform:'uppercase', letterSpacing:0.5,
                        textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dealers.map(d => (
                    <tr key={d._id} style={{ borderBottom:'1px solid #1a1a1a' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#181818'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          {d.logo
                            ? <img src={d.logo} alt="" style={{ width:36, height:36, borderRadius:'50%',
                                objectFit:'cover', border:'1px solid #2a2a2a', flexShrink:0 }} />
                            : <div style={{ width:36, height:36, borderRadius:'50%', background:'#1e1e1e',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                color:'#c9a84c', fontWeight:800, fontSize:'0.85rem',
                                border:'1px solid #2a2a2a', flexShrink:0 }}>
                                {d.businessName?.[0]}
                              </div>}
                          <div>
                            <div style={{ color:'#f0f0f0', fontSize:'0.85rem', fontWeight:600 }}>
                              {d.businessName}
                              {d.isVerified && <span style={{ color:'#c9a84c', marginLeft:5, fontSize:'0.72rem' }}>✓</span>}
                            </div>
                            <div style={{ color:'#555', fontSize:'0.72rem' }}>{d.businessAddress}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'0.8rem 1rem', color:'#888', fontSize:'0.82rem' }}>
                        {d.user?.name}<br />
                        <span style={{ color:'#444', fontSize:'0.72rem' }}>{d.user?.email}</span>
                      </td>
                      <td style={{ padding:'0.8rem 1rem', color:'#888', fontSize:'0.82rem' }}>{d.region}</td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <span style={{ color: TIER_COLOR[d.subscriptionTier] || '#888',
                          fontSize:'0.75rem', fontWeight:700, textTransform:'capitalize' }}>
                          {d.subscriptionTier}
                        </span>
                      </td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        {d.isApproved
                          ? <Badge label="Approved"  bg="#52c07a22" color="#52c07a" />
                          : <Badge label="Pending"   bg="#c9a84c22" color="#c9a84c" />}
                      </td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                          {!d.isApproved && (
                            <ActionBtn label={acting[d._id]==='approve'?'…':'Approve'}
                              onClick={() => act(d._id,'approve','Dealer approved',{ isApproved:true })}
                              bg="#c9a84c" color="#0d0d0d" disabled={!!acting[d._id]} />
                          )}
                          {d.isApproved && (
                            <ActionBtn label={acting[d._id]==='suspend'?'…':'Suspend'}
                              onClick={() => act(d._id,'suspend','Dealer suspended',{ isApproved:false })}
                              color="#e05252" disabled={!!acting[d._id]} />
                          )}
                          {!d.isVerified && (
                            <ActionBtn label={acting[d._id]==='verify'?'…':'Verify'}
                              onClick={() => act(d._id,'verify','Dealer verified',{ isVerified:true })}
                              color="#52c07a" disabled={!!acting[d._id]} />
                          )}
                          <ActionBtn label={acting[d._id]==='reject'?'…':'Reject'}
                            onClick={() => act(d._id,'reject','Dealer rejected',{ isApproved:false })}
                            color="#666" disabled={!!acting[d._id]} />
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
          {Array.from({ length:totalPages },(_,i)=>i+1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width:36, height:36, borderRadius:6, border:'1px solid',
                borderColor: p===page?'#c9a84c':'#2a2a2a',
                background:  p===page?'#c9a84c':'#1a1a1a',
                color:       p===page?'#0d0d0d':'#ccc',
                cursor:'pointer', fontSize:'0.85rem' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
