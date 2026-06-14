import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import axiosInstance from '../../api/axiosInstance';

const STATUS_STYLE = {
  active:  { bg:'#52c07a22', color:'#52c07a' },
  expired: { bg:'#33333322', color:'#555'     },
  pending: { bg:'#c9a84c22', color:'#c9a84c'  },
};

const BOOST_TYPE_COLOR = { featured:'#c9a84c', top:'#52a0e0', banner:'#c052e0' };

const fmt = (n) => `GHS ${Number(n).toLocaleString()}`;

export default function AdminBoosts() {
  const [boosts,  setBoosts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    const fetchBoosts = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/admin/boosts?page=${page}&limit=${LIMIT}`);
        setBoosts(data.boosts || []);
        setTotal(data.total || 0);
      } catch { toast.error('Failed to load boosts'); }
      finally  { setLoading(false); }
    };
    fetchBoosts();
  }, [page]);

  const totalPages = Math.ceil(total / LIMIT);
  const isExpired = (endDate) => new Date(endDate) < new Date();

  return (
    <AdminLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700 }}>Active Boosts</h1>
          <div style={{ color:'#555', fontSize:'0.8rem', marginTop:3 }}>{total} active</div>
        </div>
      </div>

      <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, overflow:'hidden' }}>
        {loading ? <div style={{ padding:'3rem', textAlign:'center', color:'#444' }}>Loading…</div>
        : boosts.length === 0
          ? <div style={{ padding:'3rem', textAlign:'center', color:'#555' }}>
              <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>★</div>
              No active boosts.
            </div>
          : <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #2a2a2a' }}>
                    {['Listing','Dealer','Type','Amount','Start','End','Status'].map(h => (
                      <th key={h} style={{ padding:'0.7rem 1rem', color:'#555', fontSize:'0.72rem',
                        fontWeight:700, textTransform:'uppercase', letterSpacing:0.5,
                        textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {boosts.map(b => {
                    const expired = isExpired(b.endDate);
                    const statusKey = expired ? 'expired' : b.status;
                    const st = STATUS_STYLE[statusKey] || STATUS_STYLE.pending;
                    const daysLeft = !expired
                      ? Math.ceil((new Date(b.endDate) - new Date()) / (1000*60*60*24))
                      : 0;

                    return (
                      <tr key={b._id} style={{ borderBottom:'1px solid #1a1a1a' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#181818'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'0.8rem 1rem' }}>
                          <div style={{ color:'#f0f0f0', fontSize:'0.82rem', fontWeight:600,
                            maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {b.listing?.title || '—'}
                          </div>
                          <div style={{ color:'#555', fontSize:'0.72rem', marginTop:2, textTransform:'capitalize' }}>
                            {b.listing?.make} {b.listing?.model} {b.listing?.year}
                          </div>
                        </td>
                        <td style={{ padding:'0.8rem 1rem', color:'#888', fontSize:'0.82rem' }}>
                          {b.dealer?.businessName || '—'}
                        </td>
                        <td style={{ padding:'0.8rem 1rem' }}>
                          <span style={{ color: BOOST_TYPE_COLOR[b.boostType] || '#888',
                            fontSize:'0.78rem', fontWeight:700, textTransform:'capitalize' }}>
                            {b.boostType}
                          </span>
                        </td>
                        <td style={{ padding:'0.8rem 1rem', color:'#c9a84c', fontWeight:700,
                          fontSize:'0.82rem', whiteSpace:'nowrap' }}>
                          {fmt(b.amountPaid)}
                        </td>
                        <td style={{ padding:'0.8rem 1rem', color:'#888', fontSize:'0.78rem',
                          whiteSpace:'nowrap' }}>
                          {new Date(b.startDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding:'0.8rem 1rem', whiteSpace:'nowrap' }}>
                          <div style={{ color:'#888', fontSize:'0.78rem' }}>
                            {new Date(b.endDate).toLocaleDateString()}
                          </div>
                          {!expired && daysLeft <= 3 && (
                            <div style={{ color:'#e05252', fontSize:'0.7rem', marginTop:1 }}>
                              {daysLeft}d left
                            </div>
                          )}
                        </td>
                        <td style={{ padding:'0.8rem 1rem' }}>
                          <span style={{ background:st.bg, color:st.color, fontSize:'0.7rem',
                            padding:'2px 8px', borderRadius:4, fontWeight:700,
                            textTransform:'uppercase' }}>
                            {statusKey}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
