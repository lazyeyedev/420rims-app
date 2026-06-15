import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import DealerLayout from './DealerLayout';
import axiosInstance from '../../api/axiosInstance';

export default function DealerBoostSuccess() {
  const [searchParams] = useSearchParams();
  const reference      = searchParams.get('reference');

  const [status,  setStatus]  = useState('loading'); // loading | active | pending | error
  const [boost,   setBoost]   = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!reference) { setStatus('error'); setMessage('No payment reference found.'); return; }

    axiosInstance.get(`/boosts/verify/${reference}`)
      .then(({ data }) => {
        setStatus(data.status);
        if (data.boost) setBoost(data.boost);
        if (data.message) setMessage(data.message);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Could not verify payment.');
      });
  }, [reference]);

  const icon  = { active:'✅', pending:'⏳', error:'❌', loading:'⏳' }[status];
  const title = {
    active:  'Boost Activated!',
    pending: 'Payment Confirmed',
    error:   'Something Went Wrong',
    loading: 'Verifying Payment…',
  }[status];

  return (
    <DealerLayout>
      <div style={{ maxWidth:520, margin:'0 auto', textAlign:'center', padding:'3rem 1rem' }}>
        <div style={{ fontSize:'3.5rem', marginBottom:'1rem' }}>{icon}</div>
        <h1 style={{ color:'#f0f0f0', fontSize:'1.5rem', fontWeight:800, marginBottom:'0.75rem' }}>
          {title}
        </h1>

        {status === 'loading' && (
          <p style={{ color:'#555', fontSize:'0.9rem' }}>Please wait…</p>
        )}

        {status === 'active' && boost && (
          <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10,
            padding:'1.5rem', marginBottom:'1.5rem', textAlign:'left' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {[
                ['Listing',    boost.listing?.title || '—'],
                ['Boost Type', boost.boostType],
                ['Duration',   `${boost.durationDays} days`],
                ['Amount Paid', `GHS ${boost.amountPaid?.toLocaleString()}`],
                ['Start Date', new Date(boost.startDate).toLocaleDateString()],
                ['Expires',    new Date(boost.endDate).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ color:'#555', fontSize:'0.72rem', fontWeight:700,
                    textTransform:'uppercase', letterSpacing:0.5, marginBottom:3 }}>
                    {label}
                  </div>
                  <div style={{ color:'#f0f0f0', fontSize:'0.88rem', fontWeight:600,
                    textTransform:'capitalize' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'pending' && (
          <p style={{ color:'#888', fontSize:'0.88rem', lineHeight:1.7, marginBottom:'1.5rem' }}>
            {message} Your listing will be boosted within a few minutes once our system processes the payment.
          </p>
        )}

        {status === 'error' && (
          <p style={{ color:'#e05252', fontSize:'0.88rem', marginBottom:'1.5rem' }}>{message}</p>
        )}

        <Link to="/dealer/listings"
          style={{ display:'inline-block', background:'#c9a84c', color:'#0d0d0d',
            padding:'0.75rem 2rem', borderRadius:6, fontWeight:700, fontSize:'0.9rem',
            textDecoration:'none' }}>
          Back to My Listings
        </Link>
      </div>
    </DealerLayout>
  );
}
