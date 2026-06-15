import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DealerLayout from './DealerLayout';
import axiosInstance from '../../api/axiosInstance';

const BOOST_INFO = {
  featured: {
    label: 'Featured',
    description: 'Appear at the top of search results with a Featured badge. Maximum visibility.',
  },
  top: {
    label: 'Top Listing',
    description: 'Pin your listing above all standard results on the homepage and search pages.',
  },
  banner: {
    label: 'Banner',
    description: 'Premium banner placement across the platform. Highest exposure.',
  },
};

const DURATIONS = [7, 14, 30];

export default function DealerBoost() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const listingId       = searchParams.get('listingId');

  const [listing,     setListing]     = useState(null);
  const [pricing,     setPricing]     = useState(null);
  const [boostType,   setBoostType]   = useState('featured');
  const [duration,    setDuration]    = useState(7);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    if (!listingId) { navigate('/dealer/listings'); return; }

    Promise.all([
      axiosInstance.get(`/listings/${listingId}`),
      axiosInstance.get('/boosts/pricing'),
    ]).then(([l, p]) => {
      setListing(l.data);
      setPricing(p.data);
    }).catch(() => {
      toast.error('Failed to load listing or pricing');
      navigate('/dealer/listings');
    }).finally(() => setLoading(false));
  }, [listingId, navigate]);

  const price = pricing?.[boostType]?.[duration] ?? 0;

  const handleProceed = async () => {
    setSubmitting(true);
    try {
      const { data } = await axiosInstance.post('/boosts/initialize', {
        listingId,
        boostType,
        durationDays: duration,
      });
      window.location.href = data.authorization_url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
      setSubmitting(false);
    }
  };

  const s = {
    card:   { background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, padding:'1.25rem', marginBottom:'1.25rem' },
    sectH:  { color:'#c9a84c', fontSize:'0.75rem', fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'1px solid #1e1e1e' },
    option: (selected) => ({
      border: `1px solid ${selected ? '#c9a84c' : '#2a2a2a'}`,
      background: selected ? 'rgba(201,168,76,0.08)' : '#1a1a1a',
      borderRadius:8, padding:'1rem', cursor:'pointer', transition:'all 0.15s',
    }),
    durBtn: (selected) => ({
      flex:1, padding:'0.65rem', borderRadius:6, border:`1px solid ${selected ? '#c9a84c' : '#2a2a2a'}`,
      background: selected ? '#c9a84c' : '#1a1a1a',
      color: selected ? '#0d0d0d' : '#888',
      fontWeight: selected ? 700 : 400, cursor:'pointer', fontSize:'0.9rem',
    }),
  };

  if (loading) return (
    <DealerLayout>
      <div style={{ color:'#444', textAlign:'center', padding:'3rem' }}>Loading…</div>
    </DealerLayout>
  );

  return (
    <DealerLayout>
      <div style={{ maxWidth:640, margin:'0 auto' }}>
        <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700, marginBottom:'0.4rem' }}>
          Boost Listing
        </h1>
        <p style={{ color:'#555', fontSize:'0.85rem', marginBottom:'1.75rem' }}>
          {listing?.title}
        </p>

        {/* Boost type */}
        <div style={s.card}>
          <div style={s.sectH}>Select Boost Type</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {Object.entries(BOOST_INFO).map(([type, info]) => (
              <div key={type} onClick={() => setBoostType(type)} style={s.option(boostType === type)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ color:'#f0f0f0', fontWeight:700, fontSize:'0.92rem', marginBottom:3 }}>
                      {info.label}
                    </div>
                    <div style={{ color:'#666', fontSize:'0.8rem', lineHeight:1.5 }}>
                      {info.description}
                    </div>
                  </div>
                  {pricing && (
                    <div style={{ color:'#c9a84c', fontWeight:800, fontSize:'0.9rem',
                      marginLeft:'1rem', flexShrink:0 }}>
                      from GHS {pricing[type][7]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div style={s.card}>
          <div style={s.sectH}>Select Duration</div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            {DURATIONS.map(d => (
              <button key={d} onClick={() => setDuration(d)} style={s.durBtn(duration === d)}>
                {d} days
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ ...s.card, borderColor:'#c9a84c33', background:'#1a1700' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ color:'#888', fontSize:'0.78rem', marginBottom:4 }}>
                {BOOST_INFO[boostType]?.label} · {duration} days
              </div>
              <div style={{ color:'#c9a84c', fontSize:'1.6rem', fontWeight:900 }}>
                GHS {price.toLocaleString()}
              </div>
            </div>
            <button onClick={handleProceed} disabled={submitting}
              style={{ background:'#c9a84c', color:'#0d0d0d', border:'none', borderRadius:8,
                padding:'0.85rem 1.75rem', fontWeight:800, fontSize:'0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Redirecting…' : 'Proceed to Payment'}
            </button>
          </div>
          <div style={{ color:'#444', fontSize:'0.75rem', marginTop:'0.75rem' }}>
            You will be redirected to Paystack to complete payment securely.
          </div>
        </div>
      </div>
    </DealerLayout>
  );
}
