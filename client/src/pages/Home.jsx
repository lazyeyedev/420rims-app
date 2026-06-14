import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';
import axiosInstance from '../api/axiosInstance';

const Skeleton = () => (
  <div style={{ background:'#141414', border:'1px solid #1e1e1e', borderRadius:10, overflow:'hidden' }}>
    <div style={{ aspectRatio:'16/10', background:'#1e1e1e', animation:'pulse 1.4s infinite' }} />
    <div style={{ padding:'0.9rem', display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ height:14, background:'#1e1e1e', borderRadius:4, width:'70%', animation:'pulse 1.4s infinite' }} />
      <div style={{ height:18, background:'#1e1e1e', borderRadius:4, width:'45%', animation:'pulse 1.4s infinite' }} />
      <div style={{ height:10, background:'#1e1e1e', borderRadius:4, width:'55%', animation:'pulse 1.4s infinite' }} />
    </div>
  </div>
);

const grid = { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.25rem' };

export default function Home() {
  const [boosted,  setBoosted]  = useState([]);
  const [all,      setAll]      = useState([]);
  const [loadingB, setLoadingB] = useState(true);
  const [loadingA, setLoadingA] = useState(true);

  useEffect(() => {
    axiosInstance.get('/listings?isBoosted=true&limit=8')
      .then(r => setBoosted(r.data.listings))
      .catch(() => {})
      .finally(() => setLoadingB(false));

    axiosInstance.get('/listings?limit=12')
      .then(r => setAll(r.data.listings))
      .catch(() => {})
      .finally(() => setLoadingA(false));
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#0d0d0d', display:'flex', flexDirection:'column' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <Navbar />

      {/* Hero */}
      <section style={{ background:'linear-gradient(160deg,#0d0d0d 0%,#111 50%,#0d0d0d 100%)',
        padding:'5rem 1.5rem 4rem', textAlign:'center', borderBottom:'1px solid #1a1a1a',
        animation:'fadeIn 0.5s ease' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ color:'#c9a84c', fontSize:'0.8rem', fontWeight:700, letterSpacing:3,
            textTransform:'uppercase', marginBottom:'1rem' }}>
            Ghana's #1 Car Platform
          </div>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, color:'#f0f0f0',
            lineHeight:1.15, marginBottom:'1rem' }}>
            Ghana's Premier<br />
            <span style={{ color:'#c9a84c' }}>Car Marketplace</span>
          </h1>
          <p style={{ color:'#888', fontSize:'1.05rem', marginBottom:'2.5rem', maxWidth:520, margin:'0 auto 2.5rem' }}>
            Buy and sell quality vehicles across all sixteen regions. Trusted dealers, verified listings.
          </p>
          <SearchBar />
        </div>
      </section>

      <main style={{ flex:1, maxWidth:1280, margin:'0 auto', width:'100%', padding:'3rem 1.5rem' }}>

        {/* Featured listings */}
        {(loadingB || boosted.length > 0) && (
          <section style={{ marginBottom:'3.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
              <h2 style={{ color:'#f0f0f0', fontSize:'1.3rem', fontWeight:700 }}>Featured Listings</h2>
              <span style={{ background:'#c9a84c', color:'#0d0d0d', fontSize:'0.65rem',
                fontWeight:800, padding:'2px 8px', borderRadius:3, letterSpacing:0.5 }}>BOOSTED</span>
            </div>
            <div style={grid}>
              {loadingB ? Array(4).fill(0).map((_,i)=><Skeleton key={i} />) :
                boosted.map(l=><CarCard key={l._id} listing={l} />)}
            </div>
          </section>
        )}

        {/* All listings */}
        <section>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
            <h2 style={{ color:'#f0f0f0', fontSize:'1.3rem', fontWeight:700 }}>Latest Listings</h2>
            <Link to="/listings" style={{ color:'#c9a84c', fontSize:'0.88rem', fontWeight:600 }}>
              View All →
            </Link>
          </div>
          <div style={grid}>
            {loadingA ? Array(6).fill(0).map((_,i)=><Skeleton key={i} />) :
              all.length === 0
                ? <div style={{ color:'#555', gridColumn:'1/-1', textAlign:'center', padding:'3rem 0' }}>
                    No listings yet. Be the first to sell!
                  </div>
                : all.map(l=><CarCard key={l._id} listing={l} />)}
          </div>
          {!loadingA && all.length > 0 && (
            <div style={{ textAlign:'center', marginTop:'2rem' }}>
              <Link to="/listings" style={{ display:'inline-block', background:'transparent',
                border:'1px solid #c9a84c', color:'#c9a84c', padding:'0.7rem 2rem',
                borderRadius:6, fontWeight:600, fontSize:'0.9rem' }}>
                Browse All Cars
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
