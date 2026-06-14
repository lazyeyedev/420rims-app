import { useNavigate } from 'react-router-dom';
import BoostBadge from './BoostBadge';

const PLACEHOLDER = 'https://via.placeholder.com/400x260/141414/444?text=No+Image';

const fmt = (n, currency) =>
  currency === 'USD'
    ? `$${Number(n).toLocaleString()}`
    : `GHS ${Number(n).toLocaleString()}`;

export default function CarCard({ listing }) {
  const navigate = useNavigate();
  const img = listing.images?.[0] || PLACEHOLDER;

  return (
    <div onClick={() => navigate(`/listings/${listing._id}`)}
      style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10,
        overflow:'hidden', cursor:'pointer', transition:'transform 0.18s,border-color 0.18s',
        display:'flex', flexDirection:'column' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.borderColor='#c9a84c44';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='#2a2a2a';}}>

      {/* Image */}
      <div style={{ position:'relative', aspectRatio:'16/10', overflow:'hidden', background:'#0d0d0d' }}>
        <img src={img} alt={listing.title}
          style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={e=>{e.target.src=PLACEHOLDER;}} />
        {listing.isBoosted && (
          <div style={{ position:'absolute', top:8, left:8 }}><BoostBadge /></div>
        )}
        <div style={{ position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,0.7)',
          color:'#fff', fontSize:'0.72rem', padding:'2px 7px', borderRadius:4 }}>
          {listing.condition}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'0.9rem', flex:1, display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ fontWeight:700, fontSize:'0.95rem', color:'#f0f0f0',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {listing.title}
        </div>

        <div style={{ color:'#c9a84c', fontWeight:800, fontSize:'1.05rem' }}>
          {fmt(listing.price, listing.currency)}
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginTop:2 }}>
          {[
            listing.year,
            listing.mileage ? `${Number(listing.mileage).toLocaleString()} ${listing.mileageUnit || 'km'}` : null,
            listing.transmission,
          ].filter(Boolean).map((tag, i) => (
            <span key={i} style={{ background:'#1e1e1e', color:'#aaa', fontSize:'0.72rem',
              padding:'2px 8px', borderRadius:4 }}>
              {tag}
            </span>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginTop:'auto', paddingTop:8, borderTop:'1px solid #1e1e1e' }}>
          <div style={{ color:'#666', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:4 }}>
            📍 {listing.region || 'Ghana'}
          </div>
          {listing.dealer && (
            <div style={{ color:'#888', fontSize:'0.75rem', display:'flex', alignItems:'center', gap:4 }}>
              {listing.dealer.businessName}
              {listing.dealer.isVerified && (
                <span title="Verified Dealer" style={{ color:'#c9a84c', fontSize:'0.75rem' }}>✓</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
