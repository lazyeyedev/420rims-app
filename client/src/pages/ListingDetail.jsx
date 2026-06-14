import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BoostBadge from '../components/BoostBadge';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const PLACEHOLDER = 'https://via.placeholder.com/800x520/141414/444?text=No+Image';
const fmt = (n, cur) => cur === 'USD' ? `$${Number(n).toLocaleString()}` : `GHS ${Number(n).toLocaleString()}`;

const guestSchema = yup.object({
  guestName:  yup.string().required('Name is required'),
  guestEmail: yup.string().email('Enter a valid email').required('Email is required'),
  guestPhone: yup.string().required('Phone is required'),
  message:    yup.string().required('Message is required'),
  type:       yup.string(),
});

const authSchema = yup.object({
  message: yup.string().required('Message is required'),
  type:    yup.string(),
});

const DetailRow = ({ label, value }) => value ? (
  <div style={{ display:'flex', justifyContent:'space-between', padding:'0.65rem 0',
    borderBottom:'1px solid #1e1e1e' }}>
    <span style={{ color:'#666', fontSize:'0.88rem' }}>{label}</span>
    <span style={{ color:'#f0f0f0', fontSize:'0.88rem', fontWeight:500,
      textTransform:'capitalize' }}>{value}</span>
  </div>
) : null;

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing,  setListing]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [mainImg,  setMainImg]  = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isGuest = !user;
  const schema  = isGuest ? guestSchema : authSchema;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { type: 'general' },
  });

  useEffect(() => {
    axiosInstance.get(`/listings/${id}`)
      .then(r => { setListing(r.data); setMainImg(0); })
      .catch(() => setError('Listing not found or no longer available.'))
      .finally(() => setLoading(false));
  }, [id]);

  const onEnquiry = async (data) => {
    setSubmitting(true);
    try {
      await axiosInstance.post(`/listings/${id}/enquiry`, data);
      toast.success('Enquiry sent! The dealer will contact you soon.');
      reset({ type:'general' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0d0d0d' }}>
      <Navbar />
      <div style={{ maxWidth:1100, margin:'3rem auto', padding:'0 1.5rem' }}>
        <div style={{ height:460, background:'#141414', borderRadius:10, animation:'pulse 1.4s infinite' }} />
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:'100vh', background:'#0d0d0d' }}>
      <Navbar />
      <div style={{ textAlign:'center', padding:'6rem 1.5rem', color:'#666' }}>
        <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🚫</div>
        <p>{error}</p>
        <Link to="/listings" style={{ color:'#c9a84c', marginTop:'1rem', display:'inline-block' }}>
          ← Back to listings
        </Link>
      </div>
    </div>
  );

  const images  = listing.images?.length ? listing.images : [PLACEHOLDER];
  const dealer  = listing.dealer;
  const inp = { width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:6,
    padding:'0.65rem 0.9rem', color:'#f0f0f0', fontSize:'0.88rem', outline:'none',
    boxSizing:'border-box', marginBottom:2 };

  return (
    <div style={{ minHeight:'100vh', background:'#0d0d0d', display:'flex', flexDirection:'column' }}>
      <style>{`input:focus,select:focus,textarea:focus{border-color:#c9a84c!important;box-shadow:0 0 0 2px rgba(201,168,76,0.12)}`}</style>
      <Navbar />

      <main style={{ maxWidth:1200, margin:'0 auto', width:'100%', padding:'2rem 1.5rem', flex:1 }}>
        {/* Breadcrumb */}
        <div style={{ color:'#555', fontSize:'0.82rem', marginBottom:'1.25rem' }}>
          <Link to="/" style={{ color:'#555' }}>Home</Link> {' › '}
          <Link to="/listings" style={{ color:'#555' }}>Cars</Link> {' › '}
          <span style={{ color:'#888' }}>{listing.title}</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'2rem', alignItems:'start' }}
          className="detail-grid">

          {/* Left — images + details */}
          <div>
            {/* Main image */}
            <div style={{ borderRadius:10, overflow:'hidden', background:'#141414',
              marginBottom:'0.75rem', aspectRatio:'16/10', position:'relative' }}>
              <img src={images[mainImg]} alt={listing.title}
                style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e=>{e.target.src=PLACEHOLDER;}} />
              {listing.isBoosted && <div style={{ position:'absolute', top:12, left:12 }}><BoostBadge /></div>}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setMainImg(i)}
                    style={{ width:72, height:52, borderRadius:6, overflow:'hidden', cursor:'pointer',
                      border:`2px solid ${i===mainImg?'#c9a84c':'#2a2a2a'}`, flexShrink:0 }}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e=>{e.target.src=PLACEHOLDER;}} />
                  </div>
                ))}
              </div>
            )}

            {/* Title + price */}
            <h1 style={{ color:'#f0f0f0', fontSize:'1.5rem', fontWeight:800, marginBottom:'0.4rem' }}>
              {listing.title}
            </h1>
            <div style={{ color:'#c9a84c', fontSize:'1.7rem', fontWeight:800, marginBottom:'1.5rem' }}>
              {fmt(listing.price, listing.currency)}
            </div>

            {/* Details table */}
            <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10,
              padding:'1.25rem', marginBottom:'1.5rem' }}>
              <h3 style={{ color:'#f0f0f0', fontSize:'0.95rem', fontWeight:700,
                marginBottom:'0.75rem' }}>Vehicle Details</h3>
              <DetailRow label="Make"         value={listing.make} />
              <DetailRow label="Model"        value={listing.model} />
              <DetailRow label="Year"         value={listing.year} />
              <DetailRow label="Condition"    value={listing.condition} />
              <DetailRow label="Body Type"    value={listing.bodyType} />
              <DetailRow label="Transmission" value={listing.transmission} />
              <DetailRow label="Fuel Type"    value={listing.fuelType} />
              <DetailRow label="Color"        value={listing.color} />
              <DetailRow label="Mileage"      value={listing.mileage ? `${Number(listing.mileage).toLocaleString()} ${listing.mileageUnit||'km'}` : null} />
              <DetailRow label="Region"       value={listing.region} />
              <DetailRow label="Location"     value={listing.location} />
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, padding:'1.25rem' }}>
                <h3 style={{ color:'#f0f0f0', fontSize:'0.95rem', fontWeight:700, marginBottom:'0.75rem' }}>
                  Description
                </h3>
                <p style={{ color:'#aaa', fontSize:'0.9rem', lineHeight:1.75, whiteSpace:'pre-wrap' }}>
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          {/* Right — dealer card + enquiry */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            {/* Dealer card */}
            {dealer && (
              <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, padding:'1.25rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.9rem', marginBottom:'1rem' }}>
                  {dealer.logo
                    ? <img src={dealer.logo} alt={dealer.businessName}
                        style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover', border:'2px solid #2a2a2a' }} />
                    : <div style={{ width:52, height:52, borderRadius:'50%', background:'#1e1e1e',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:'#c9a84c', fontWeight:800, fontSize:'1.1rem', border:'2px solid #2a2a2a',
                        flexShrink:0 }}>
                        {dealer.businessName?.[0]}
                      </div>
                  }
                  <div>
                    <div style={{ color:'#f0f0f0', fontWeight:700, fontSize:'0.95rem', display:'flex',
                      alignItems:'center', gap:6 }}>
                      {dealer.businessName}
                      {dealer.isVerified && (
                        <span title="420Rims Verified" style={{ background:'#c9a84c22', color:'#c9a84c',
                          fontSize:'0.7rem', padding:'1px 6px', borderRadius:4, fontWeight:700 }}>
                          ✓ VERIFIED
                        </span>
                      )}
                    </div>
                    <div style={{ color:'#666', fontSize:'0.8rem', marginTop:2 }}>📍 {dealer.region}</div>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {dealer.phone && (
                    <a href={`tel:${dealer.phone}`} style={{ display:'flex', alignItems:'center', gap:8,
                      background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:6,
                      padding:'0.6rem 0.9rem', color:'#f0f0f0', fontSize:'0.85rem', textDecoration:'none' }}>
                      📞 {dealer.phone}
                    </a>
                  )}
                  {dealer.whatsapp && (
                    <a href={`https://wa.me/${dealer.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                      style={{ display:'flex', alignItems:'center', gap:8, background:'#1a3a1a',
                        border:'1px solid #2a4a2a', borderRadius:6, padding:'0.6rem 0.9rem',
                        color:'#5cba5c', fontSize:'0.85rem', textDecoration:'none' }}>
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Enquiry form */}
            <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, padding:'1.25rem' }}>
              <h3 style={{ color:'#f0f0f0', fontSize:'0.95rem', fontWeight:700, marginBottom:'1rem' }}>
                Send Enquiry
              </h3>
              <form onSubmit={handleSubmit(onEnquiry)} noValidate>
                {isGuest && (
                  <>
                    <input {...register('guestName')} placeholder="Your name" style={inp} />
                    {errors.guestName && <div style={{ color:'#e05252', fontSize:'0.75rem', marginBottom:8 }}>{errors.guestName.message}</div>}
                    <input {...register('guestEmail')} type="email" placeholder="Email address" style={inp} />
                    {errors.guestEmail && <div style={{ color:'#e05252', fontSize:'0.75rem', marginBottom:8 }}>{errors.guestEmail.message}</div>}
                    <input {...register('guestPhone')} type="tel" placeholder="Phone number" style={inp} />
                    {errors.guestPhone && <div style={{ color:'#e05252', fontSize:'0.75rem', marginBottom:8 }}>{errors.guestPhone.message}</div>}
                  </>
                )}
                {user && (
                  <div style={{ background:'#1a1a1a', borderRadius:6, padding:'0.6rem 0.9rem',
                    marginBottom:8, color:'#888', fontSize:'0.82rem' }}>
                    Sending as <span style={{ color:'#f0f0f0' }}>{user.name}</span>
                  </div>
                )}
                <select {...register('type')} style={{ ...inp, cursor:'pointer', marginBottom:8 }}>
                  <option value="general">General Enquiry</option>
                  <option value="price">Price Negotiation</option>
                  <option value="test_drive">Test Drive</option>
                  <option value="finance">Finance / Loan</option>
                </select>
                <textarea {...register('message')} rows={4} placeholder="Your message to the dealer..."
                  style={{ ...inp, resize:'vertical', lineHeight:1.6, marginBottom:4 }} />
                {errors.message && <div style={{ color:'#e05252', fontSize:'0.75rem', marginBottom:8 }}>{errors.message.message}</div>}
                <button type="submit" disabled={submitting}
                  style={{ width:'100%', background:'#c9a84c', color:'#0d0d0d', border:'none',
                    borderRadius:6, padding:'0.75rem', fontWeight:700, fontSize:'0.9rem',
                    cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                    marginTop:4 }}>
                  {submitting ? 'Sending…' : 'Send Enquiry'}
                </button>
              </form>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:'1rem' }}>
              <div style={{ flex:1, background:'#141414', border:'1px solid #2a2a2a', borderRadius:8,
                padding:'0.75rem', textAlign:'center' }}>
                <div style={{ color:'#c9a84c', fontWeight:700, fontSize:'1.1rem' }}>{listing.views || 0}</div>
                <div style={{ color:'#555', fontSize:'0.72rem' }}>Views</div>
              </div>
              <div style={{ flex:1, background:'#141414', border:'1px solid #2a2a2a', borderRadius:8,
                padding:'0.75rem', textAlign:'center' }}>
                <div style={{ color:'#c9a84c', fontWeight:700, fontSize:'1.1rem' }}>{listing.enquiryCount || 0}</div>
                <div style={{ color:'#555', fontSize:'0.72rem' }}>Enquiries</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <style>{`
        @media(max-width:900px){.detail-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
