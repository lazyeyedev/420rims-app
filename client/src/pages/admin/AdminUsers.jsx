import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import axiosInstance from '../../api/axiosInstance';

const ROLE_COLOR = { admin:'#c9a84c', dealer:'#52a0e0', user:'#888' };

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [toggling, setToggling] = useState({});
  const searchTimer = useRef(null);
  const LIMIT = 20;

  const fetchUsers = async (p=1, s=search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:p, limit:LIMIT });
      if (s) params.set('search', s);
      const { data } = await axiosInstance.get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(page, search); }, [page]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); fetchUsers(1, val); }, 500);
  };

  const toggleStatus = async (id, current) => {
    setToggling(p => ({ ...p, [id]: true }));
    try {
      const { data } = await axiosInstance.put(`/admin/users/${id}/status`, { isActive: !current });
      setUsers(prev => prev.map(u => u._id === id ? data : u));
      toast.success(`User ${!current ? 'activated' : 'deactivated'}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setToggling(p => ({ ...p, [id]: false })); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700 }}>Users</h1>
          <div style={{ color:'#555', fontSize:'0.8rem', marginTop:3 }}>{total} total</div>
        </div>
        <input value={search} onChange={e=>handleSearch(e.target.value)}
          placeholder="Search name or email…"
          style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:6,
            padding:'0.5rem 0.9rem', color:'#f0f0f0', fontSize:'0.85rem',
            outline:'none', width:250 }} />
      </div>

      <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, overflow:'hidden' }}>
        {loading ? <div style={{ padding:'3rem', textAlign:'center', color:'#444' }}>Loading…</div>
        : users.length === 0
          ? <div style={{ padding:'3rem', textAlign:'center', color:'#555' }}>No users found.</div>
          : <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #2a2a2a' }}>
                    {['User','Email','Role','Joined','Active'].map(h => (
                      <th key={h} style={{ padding:'0.7rem 1rem', color:'#555', fontSize:'0.72rem',
                        fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, textAlign:'left' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom:'1px solid #1a1a1a' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#181818'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0,
                            background:'#1e1e1e', border:'1px solid #2a2a2a',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            color:'#c9a84c', fontSize:'0.8rem', fontWeight:800, overflow:'hidden' }}>
                            {u.avatar
                              ? <img src={u.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              : u.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ color:'#f0f0f0', fontSize:'0.85rem', fontWeight:500 }}>
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding:'0.8rem 1rem', color:'#888', fontSize:'0.82rem' }}>
                        {u.email}
                      </td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        <span style={{ color: ROLE_COLOR[u.role] || '#888',
                          fontSize:'0.75rem', fontWeight:700, textTransform:'capitalize' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding:'0.8rem 1rem', color:'#555', fontSize:'0.78rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding:'0.8rem 1rem' }}>
                        {/* Toggle switch */}
                        <button onClick={() => toggleStatus(u._id, u.isActive)}
                          disabled={toggling[u._id] || u.role === 'admin'}
                          title={u.role==='admin' ? 'Cannot deactivate admin' : undefined}
                          style={{ width:42, height:24, borderRadius:12, border:'none', cursor:
                            u.role==='admin'?'not-allowed':'pointer', position:'relative',
                            background: u.isActive ? '#c9a84c' : '#2a2a2a',
                            transition:'background 0.2s', flexShrink:0,
                            opacity: toggling[u._id] ? 0.5 : 1 }}>
                          <span style={{ position:'absolute', top:3,
                            left: u.isActive ? 21 : 3, width:18, height:18,
                            borderRadius:'50%', background:'#f0f0f0',
                            transition:'left 0.2s', display:'block' }} />
                        </button>
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
