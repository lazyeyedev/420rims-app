import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GOLD = '#c9a84c';

export default function Navbar() {
  const { user, isDealer, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dropOpen, setDropOpen]   = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); setDropOpen(false); navigate('/'); };

  const sellHref = !user ? '/register/dealer' : isDealer ? '/dealer/listings' : '/register/dealer';

  return (
    <nav style={{ background:'#0d0d0d', borderBottom:'1px solid #1e1e1e', position:'sticky',
      top:0, zIndex:100, padding:'0 1.5rem' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', height:60, display:'flex',
        alignItems:'center', justifyContent:'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ fontSize:'1.5rem', fontWeight:800, color:GOLD,
          letterSpacing:1, textDecoration:'none' }}>420RIMS</Link>

        {/* Desktop nav */}
        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}
          className="nav-desktop">
          <Link to="/listings" style={{ color:'#ccc', fontSize:'0.9rem', textDecoration:'none' }}
            onMouseEnter={e=>e.target.style.color=GOLD} onMouseLeave={e=>e.target.style.color='#ccc'}>
            Browse Cars
          </Link>
          <Link to={sellHref} style={{ color:'#ccc', fontSize:'0.9rem', textDecoration:'none' }}
            onMouseEnter={e=>e.target.style.color=GOLD} onMouseLeave={e=>e.target.style.color='#ccc'}>
            Sell Your Car
          </Link>

          {isAdmin && (
            <Link to="/admin/dashboard" style={{ color:GOLD, fontSize:'0.9rem',
              fontWeight:600, textDecoration:'none' }}>Admin Panel</Link>
          )}

          {!user ? (
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <Link to="/login" style={{ color:'#ccc', fontSize:'0.88rem', padding:'0.45rem 1rem',
                border:'1px solid #333', borderRadius:6, textDecoration:'none' }}
                onMouseEnter={e=>e.target.style.borderColor=GOLD}
                onMouseLeave={e=>e.target.style.borderColor='#333'}>
                Login
              </Link>
              <Link to="/register" style={{ background:GOLD, color:'#0d0d0d', fontSize:'0.88rem',
                padding:'0.45rem 1rem', borderRadius:6, fontWeight:700, textDecoration:'none' }}>
                Register
              </Link>
            </div>
          ) : (
            <div style={{ position:'relative' }} ref={dropRef}>
              <button onClick={() => setDropOpen(p=>!p)}
                style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:20,
                  padding:'0.3rem 0.75rem 0.3rem 0.4rem', display:'flex', alignItems:'center',
                  gap:8, cursor:'pointer', color:'#f0f0f0', fontSize:'0.85rem' }}>
                <span style={{ width:28, height:28, borderRadius:'50%', background:'#2a2a2a',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.75rem', color:GOLD, fontWeight:700 }}>
                  {user.name?.[0]?.toUpperCase()}
                </span>
                {user.name?.split(' ')[0]}
                <span style={{ color:'#666', fontSize:'0.7rem' }}>▼</span>
              </button>
              {dropOpen && (
                <div style={{ position:'absolute', right:0, top:'110%', background:'#1a1a1a',
                  border:'1px solid #2a2a2a', borderRadius:8, minWidth:180,
                  boxShadow:'0 8px 24px rgba(0,0,0,0.5)', overflow:'hidden', zIndex:200 }}>
                  {isDealer ? (
                    <>
                      <DropLink to="/dealer/dashboard" onClick={()=>setDropOpen(false)}>Dashboard</DropLink>
                      <DropLink to="/dealer/listings" onClick={()=>setDropOpen(false)}>My Listings</DropLink>
                      <DropLink to="/dealer/profile" onClick={()=>setDropOpen(false)}>Profile</DropLink>
                    </>
                  ) : (
                    <>
                      <DropLink to="/profile" onClick={()=>setDropOpen(false)}>Profile</DropLink>
                      <DropLink to="/profile/enquiries" onClick={()=>setDropOpen(false)}>My Enquiries</DropLink>
                    </>
                  )}
                  <div style={{ borderTop:'1px solid #2a2a2a' }} />
                  <button onClick={handleLogout} style={{ display:'block', width:'100%', textAlign:'left',
                    padding:'0.7rem 1rem', background:'none', border:'none', color:'#e05252',
                    fontSize:'0.88rem', cursor:'pointer' }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button onClick={()=>setMenuOpen(p=>!p)}
          style={{ display:'none', background:'none', border:'none', color:'#ccc',
            fontSize:'1.4rem', cursor:'pointer' }} className="nav-hamburger">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop:'1px solid #1e1e1e', padding:'1rem 0', display:'flex',
          flexDirection:'column', gap:'0.5rem' }} className="nav-mobile">
          <MobileLink to="/listings" onClick={()=>setMenuOpen(false)}>Browse Cars</MobileLink>
          <MobileLink to={sellHref} onClick={()=>setMenuOpen(false)}>Sell Your Car</MobileLink>
          {!user ? (
            <>
              <MobileLink to="/login" onClick={()=>setMenuOpen(false)}>Login</MobileLink>
              <MobileLink to="/register" onClick={()=>setMenuOpen(false)}>Register</MobileLink>
            </>
          ) : isDealer ? (
            <>
              <MobileLink to="/dealer/dashboard" onClick={()=>setMenuOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/dealer/listings" onClick={()=>setMenuOpen(false)}>My Listings</MobileLink>
            </>
          ) : (
            <>
              <MobileLink to="/profile" onClick={()=>setMenuOpen(false)}>Profile</MobileLink>
              <MobileLink to="/profile/enquiries" onClick={()=>setMenuOpen(false)}>My Enquiries</MobileLink>
            </>
          )}
          {user && (
            <button onClick={()=>{handleLogout();setMenuOpen(false);}}
              style={{ background:'none', border:'none', color:'#e05252', padding:'0.6rem 1.5rem',
                textAlign:'left', fontSize:'0.9rem', cursor:'pointer' }}>
              Logout
            </button>
          )}
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          .nav-desktop{display:none!important}
          .nav-hamburger{display:block!important}
        }
      `}</style>
    </nav>
  );
}

const DropLink = ({ to, children, onClick }) => (
  <Link to={to} onClick={onClick} style={{ display:'block', padding:'0.7rem 1rem',
    color:'#ccc', fontSize:'0.88rem', textDecoration:'none' }}
    onMouseEnter={e=>e.target.style.background='#222'}
    onMouseLeave={e=>e.target.style.background='none'}>
    {children}
  </Link>
);

const MobileLink = ({ to, children, onClick }) => (
  <Link to={to} onClick={onClick} style={{ padding:'0.6rem 1.5rem', color:'#ccc',
    fontSize:'0.9rem', textDecoration:'none', display:'block' }}>
    {children}
  </Link>
);
