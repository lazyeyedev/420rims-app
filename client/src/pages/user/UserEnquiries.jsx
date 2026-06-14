import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axiosInstance from '../../api/axiosInstance';

const PLACEHOLDER = 'https://via.placeholder.com/72x52/141414/444?text=No+Image';

const STATUS_STYLE = {
  new:       { bg:'#c9a84c22', color:'#c9a84c' },
  read:      { bg:'#88888822', color:'#888'     },
  responded: { bg:'#52c07a22', color:'#52c07a'  },
  closed:    { bg:'#33333322', color:'#555'      },
};

const TYPE_LABEL = {
  general:'General', price:'Price Negotiation', test_drive:'Test Drive', finance:'Finance'
};

export default function UserEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);

  useEffect(() => {
    axiosInstance.get('/users/enquiries')
      .then(r => setEnquiries(r.data.enquiries || []))
      .catch(() => toast.error('Failed to load enquiries'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div style={{ minHeight:'100vh', background:'#0d0d0d', display:'flex', flexDirection:'column' }}>
      <Navbar />
      <main style={{ flex:1, maxWidth:900, margin:'0 auto', width:'100%', padding:'2rem 1.5rem' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <div>
            <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700 }}>My Enquiries</h1>
            {!loading && (
              <div style={{ color:'#555', fontSize:'0.8rem', marginTop:3 }}>
                {enquiries.length} enquir{enquiries.length !== 1 ? 'ies' : 'y'} sent
              </div>
            )}
          </div>
          <Link to="/listings" style={{ background:'#c9a84c', color:'#0d0d0d', padding:'0.55rem 1.1rem',
            borderRadius:6, fontWeight:700, fontSize:'0.85rem', textDecoration:'none' }}>
            Browse Cars
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', color:'#444', padding:'4rem' }}>Loading…</div>
        ) : enquiries.length === 0 ? (
          <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10,
            padding:'3rem', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>💬</div>
            <div style={{ color:'#555', marginBottom:'1rem' }}>You haven't sent any enquiries yet.</div>
            <Link to="/listings" style={{ color:'#c9a84c', fontWeight:600 }}>Find a car →</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {enquiries.map(e => {
              const isOpen = expanded === e._id;
              const status = STATUS_STYLE[e.status] || STATUS_STYLE.new;
              const thumb  = e.listing?.images?.[0] || PLACEHOLDER;

              return (
                <div key={e._id}
                  style={{ background:'#141414', border:`1px solid ${isOpen?'#c9a84c44':'#2a2a2a'}`,
                    borderRadius:10, overflow:'hidden', transition:'border-color 0.2s' }}>

                  {/* Summary row */}
                  <div onClick={() => toggle(e._id)}
                    style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.25rem',
                      cursor:'pointer' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#181818'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>

                    <img src={thumb} alt=""
                      style={{ width:72, height:52, objectFit:'cover', borderRadius:6,
                        border:'1px solid #2a2a2a', flexShrink:0 }}
                      onError={ev=>ev.target.src=PLACEHOLDER} />

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:'#f0f0f0', fontSize:'0.88rem', fontWeight:600,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {e.listing?.title || 'Listing no longer available'}
                      </div>
                      <div style={{ color:'#666', fontSize:'0.76rem', marginTop:3, display:'flex', gap:8, flexWrap:'wrap' }}>
                        <span>{TYPE_LABEL[e.type] || e.type}</span>
                        <span>·</span>
                        <span>{e.dealer?.businessName}</span>
                        <span>·</span>
                        <span>{new Date(e.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</span>
                      </div>
                      <div style={{ color:'#555', fontSize:'0.78rem', marginTop:4,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {e.message}
                      </div>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end',
                      gap:8, flexShrink:0 }}>
                      <span style={{ background:status.bg, color:status.color, fontSize:'0.7rem',
                        padding:'2px 9px', borderRadius:4, fontWeight:700, textTransform:'uppercase' }}>
                        {e.status}
                      </span>
                      <span style={{ color:'#444', fontSize:'0.75rem', transition:'transform 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ borderTop:'1px solid #1e1e1e', padding:'1.25rem',
                      background:'#111', animation:'fadeIn 0.15s ease' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem',
                        marginBottom:'1rem' }}>
                        <div>
                          <div style={{ color:'#666', fontSize:'0.75rem', fontWeight:700,
                            textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>
                            Enquiry Type
                          </div>
                          <div style={{ color:'#f0f0f0', fontSize:'0.88rem' }}>
                            {TYPE_LABEL[e.type] || e.type}
                          </div>
                        </div>
                        <div>
                          <div style={{ color:'#666', fontSize:'0.75rem', fontWeight:700,
                            textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>
                            Dealer
                          </div>
                          <div style={{ color:'#f0f0f0', fontSize:'0.88rem' }}>
                            {e.dealer?.businessName || '—'}
                          </div>
                        </div>
                        <div style={{ gridColumn:'1/-1' }}>
                          <div style={{ color:'#666', fontSize:'0.75rem', fontWeight:700,
                            textTransform:'uppercase', letterSpacing:0.5, marginBottom:6 }}>
                            Your Message
                          </div>
                          <div style={{ background:'#1a1a1a', border:'1px solid #2a2a2a',
                            borderRadius:6, padding:'0.75rem 1rem', color:'#ccc',
                            fontSize:'0.88rem', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
                            {e.message}
                          </div>
                        </div>
                      </div>

                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                        <div style={{ color:'#555', fontSize:'0.78rem' }}>
                          Sent {new Date(e.createdAt).toLocaleString('en-GB', {
                            day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
                          })}
                        </div>
                        {e.listing?._id && (
                          <Link to={`/listings/${e.listing._id}`}
                            style={{ color:'#c9a84c', fontSize:'0.82rem', fontWeight:600 }}>
                            View Listing →
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
