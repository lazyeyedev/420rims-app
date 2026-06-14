import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin/dashboard', icon: '◈', label: 'Dashboard'  },
  { to: '/admin/dealers',   icon: '◧', label: 'Dealers'    },
  { to: '/admin/listings',  icon: '◉', label: 'Listings'   },
  { to: '/admin/users',     icon: '◎', label: 'Users'      },
  { to: '/admin/boosts',    icon: '★', label: 'Boosts'     },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ minHeight:'100vh', background:'#0d0d0d', display:'flex' }}>
      {/* Sidebar */}
      <aside style={{ width:230, flexShrink:0, background:'#0a0a0a', borderRight:'1px solid #1e1e1e',
        display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', overflow:'auto' }}>

        <div style={{ padding:'1.4rem 1.25rem', borderBottom:'1px solid #1e1e1e' }}>
          <div style={{ color:'#c9a84c', fontWeight:900, fontSize:'1.15rem', letterSpacing:1 }}>
            420RIMS
          </div>
          <div style={{ color:'#555', fontSize:'0.72rem', fontWeight:600, letterSpacing:1,
            textTransform:'uppercase', marginTop:2 }}>Admin Panel</div>
        </div>

        <div style={{ padding:'0.75rem 0', flex:1 }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to==='/admin/dashboard'}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:10,
                padding:'0.7rem 1.25rem', textDecoration:'none',
                color:      isActive ? '#c9a84c' : '#666',
                background: isActive ? 'rgba(201,168,76,0.07)' : 'transparent',
                borderLeft: isActive ? '3px solid #c9a84c' : '3px solid transparent',
                fontSize:'0.88rem', fontWeight: isActive ? 700 : 400,
                transition:'all 0.15s',
              })}>
              <span style={{ width:18, textAlign:'center', fontSize:'0.95rem' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>

        <div style={{ padding:'1rem 1.25rem', borderTop:'1px solid #1e1e1e' }}>
          <div style={{ color:'#444', fontSize:'0.75rem', marginBottom:8 }}>{user?.email}</div>
          <button onClick={handleLogout}
            style={{ background:'none', border:'none', color:'#e05252', fontSize:'0.82rem',
              cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:6 }}>
            ⏏ Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        <header style={{ background:'#0a0a0a', borderBottom:'1px solid #1e1e1e',
          padding:'0 1.75rem', height:56, display:'flex', alignItems:'center',
          justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <span style={{ color:'#c9a84c', fontWeight:700, fontSize:'0.88rem',
            letterSpacing:0.5 }}>420Rims Admin Panel</span>
          <span style={{ color:'#333', fontSize:'0.78rem' }}>
            {new Date().toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
          </span>
        </header>
        <main style={{ flex:1, padding:'1.75rem', overflowX:'auto' }}>{children}</main>
      </div>
    </div>
  );
}
