import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const NAV_ITEMS = [
  { to: '/dealer/dashboard',       icon: '◈', label: 'Dashboard'    },
  { to: '/dealer/listings',        icon: '◧', label: 'My Listings'  },
  { to: '/dealer/listings/create', icon: '+', label: 'Add Listing'  },
  { to: '/dealer/profile',         icon: '◉', label: 'Profile'      },
];

export default function DealerLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ minHeight:'100vh', background:'#0d0d0d', display:'flex', flexDirection:'column' }}>
      <Navbar />
      <div style={{ display:'flex', flex:1, maxWidth:1280, margin:'0 auto', width:'100%',
        padding:'1.5rem', gap:'1.5rem', alignItems:'flex-start' }}>

        {/* Sidebar */}
        <aside style={{ width:220, flexShrink:0, background:'#141414', border:'1px solid #2a2a2a',
          borderRadius:10, padding:'1.25rem 0', position:'sticky', top:80 }}>
          <div style={{ padding:'0 1.25rem 1rem', borderBottom:'1px solid #1e1e1e', marginBottom:'0.5rem' }}>
            <div style={{ color:'#c9a84c', fontSize:'0.7rem', fontWeight:700,
              letterSpacing:1, textTransform:'uppercase' }}>Dealer Portal</div>
            <div style={{ color:'#f0f0f0', fontSize:'0.88rem', fontWeight:600,
              marginTop:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {user?.name}
            </div>
          </div>

          <nav>
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} end={to==='/dealer/dashboard'}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:10, padding:'0.65rem 1.25rem',
                  color: isActive ? '#c9a84c' : '#888', textDecoration:'none', fontSize:'0.88rem',
                  fontWeight: isActive ? 700 : 400,
                  background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                  borderLeft: isActive ? '3px solid #c9a84c' : '3px solid transparent',
                  transition:'all 0.15s',
                })}>
                <span style={{ fontSize:'1rem', width:18, textAlign:'center' }}>{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>

          <div style={{ padding:'1rem 1.25rem 0', borderTop:'1px solid #1e1e1e', marginTop:'0.75rem' }}>
            <button onClick={handleLogout}
              style={{ background:'none', border:'none', color:'#e05252', fontSize:'0.85rem',
                cursor:'pointer', padding:0, display:'flex', alignItems:'center', gap:8 }}>
              ⏏ Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex:1, minWidth:0 }}>{children}</main>
      </div>

      <style>{`
        @media(max-width:768px){
          aside{ display:none; }
        }
      `}</style>
    </div>
  );
}
