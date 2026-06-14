import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background:'#111', borderTop:'1px solid #1e1e1e', padding:'3rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth:1280, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'2rem', marginBottom:'2.5rem' }}>

          <div>
            <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#c9a84c', marginBottom:'0.75rem' }}>420RIMS</div>
            <p style={{ color:'#666', fontSize:'0.85rem', lineHeight:1.7 }}>
              Ghana's premier marketplace for buying and selling quality vehicles. Trusted by dealers across all sixteen regions.
            </p>
          </div>

          <div>
            <div style={{ color:'#c9a84c', fontWeight:700, fontSize:'0.85rem', letterSpacing:1,
              textTransform:'uppercase', marginBottom:'1rem' }}>Quick Links</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {[['Browse Cars','/listings'],['Sell Your Car','/register/dealer'],
                ['Login','/login'],['Register','/register']].map(([label,to]) => (
                <Link key={to} to={to} style={{ color:'#888', fontSize:'0.85rem', textDecoration:'none' }}
                  onMouseEnter={e=>e.target.style.color='#c9a84c'}
                  onMouseLeave={e=>e.target.style.color='#888'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={{ color:'#c9a84c', fontWeight:700, fontSize:'0.85rem', letterSpacing:1,
              textTransform:'uppercase', marginBottom:'1rem' }}>Contact</div>
            <div style={{ color:'#888', fontSize:'0.85rem', lineHeight:1.9 }}>
              <div>📍 Accra, Ghana</div>
              <div>📧 hello@420rims.com</div>
              <div>📞 +233 XX XXX XXXX</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop:'1px solid #1e1e1e', paddingTop:'1.25rem',
          display:'flex', flexWrap:'wrap', justifyContent:'space-between',
          alignItems:'center', gap:'0.5rem' }}>
          <span style={{ color:'#555', fontSize:'0.8rem' }}>
            © 2026 420Rims. All rights reserved.
          </span>
          <span style={{ color:'#444', fontSize:'0.8rem' }}>
            A <span style={{ color:'#c9a84c' }}>TechSphere</span> / <span style={{ color:'#c9a84c' }}>Sevinity Holdings</span> product · Accra, Ghana
          </span>
        </div>
      </div>
    </footer>
  );
}
