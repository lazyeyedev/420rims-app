import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import DealerLayout from './DealerLayout';
import axiosInstance from '../../api/axiosInstance';

const GHANA_REGIONS = ['Greater Accra','Ashanti','Western','Eastern','Central','Northern','Upper East','Upper West','Volta','Bono','Bono East','Ahafo','Savannah','North East','Oti','Western North'];

const TIER_COLORS = { basic:'#888', pro:'#c9a84c', premium:'#e0c070' };

const label = { display:'block', color:'#888', fontSize:'0.78rem', marginBottom:5, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 };
const inp   = { width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:6, padding:'0.65rem 0.9rem', color:'#f0f0f0', fontSize:'0.88rem', outline:'none', boxSizing:'border-box' };
const sect  = { background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, padding:'1.25rem', marginBottom:'1.25rem' };
const sectH = { color:'#c9a84c', fontSize:'0.75rem', fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:'1rem', paddingBottom:'0.5rem', borderBottom:'1px solid #1e1e1e' };
const row2  = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' };

export default function DealerProfile() {
  const [dealer,  setDealer]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  const [form, setForm] = useState({
    businessName:'', businessAddress:'', region:'', phone:'', whatsapp:'', description:'',
  });

  const [logoFile,  setLogoFile]  = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const logoRef  = useRef(null);
  const coverRef = useRef(null);

  useEffect(() => {
    axiosInstance.get('/dealers/profile')
      .then(r => {
        setDealer(r.data);
        setForm({
          businessName:    r.data.businessName    || '',
          businessAddress: r.data.businessAddress || '',
          region:          r.data.region          || '',
          phone:           r.data.phone           || '',
          whatsapp:        r.data.whatsapp        || '',
          description:     r.data.description     || '',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleImagePick = (file, setFile, setPreview) => {
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (logoFile)  fd.append('logo',       logoFile);
      if (coverFile) fd.append('coverImage', coverFile);
      const { data } = await axiosInstance.put('/dealers/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDealer(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DealerLayout>
      <div style={{ color:'#444', textAlign:'center', padding:'3rem' }}>Loading…</div>
    </DealerLayout>
  );

  const tier = dealer?.subscriptionTier || 'basic';

  return (
    <DealerLayout>
      <div style={{ maxWidth:700, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700 }}>Dealer Profile</h1>
          <span style={{ background: TIER_COLORS[tier]+'22', color: TIER_COLORS[tier],
            fontSize:'0.72rem', fontWeight:800, padding:'4px 12px', borderRadius:4,
            textTransform:'uppercase', letterSpacing:0.5 }}>
            {tier} plan
          </span>
        </div>

        <form onSubmit={handleSave} noValidate>
          <style>{`input:focus,select:focus,textarea:focus{border-color:#c9a84c!important;box-shadow:0 0 0 2px rgba(201,168,76,0.12)} select option{background:#1a1a1a}`}</style>

          {/* Images */}
          <div style={sect}>
            <div style={sectH}>Profile Images</div>

            {/* Cover image */}
            <div style={{ marginBottom:'1.25rem' }}>
              <label style={label}>Cover Image</label>
              <div onClick={() => coverRef.current?.click()}
                style={{ width:'100%', height:140, borderRadius:8, overflow:'hidden', cursor:'pointer',
                  background:'#1a1a1a', border:'2px dashed #2a2a2a', position:'relative',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                {coverPreview || dealer?.coverImage
                  ? <img src={coverPreview || dealer.coverImage} alt="Cover"
                      style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ color:'#444', fontSize:'0.85rem' }}>Click to upload cover image</span>}
                <div style={{ position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,0.7)',
                  color:'#ccc', fontSize:'0.72rem', padding:'3px 8px', borderRadius:4 }}>
                  Change
                </div>
              </div>
              <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
                onChange={e => handleImagePick(e.target.files[0], setCoverFile, setCoverPreview)} />
            </div>

            {/* Logo */}
            <div>
              <label style={label}>Logo</label>
              <div style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
                <div onClick={() => logoRef.current?.click()}
                  style={{ width:90, height:90, borderRadius:'50%', overflow:'hidden', cursor:'pointer',
                    background:'#1a1a1a', border:'2px dashed #2a2a2a', flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  {logoPreview || dealer?.logo
                    ? <img src={logoPreview || dealer.logo} alt="Logo"
                        style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ color:'#444', fontSize:'1.5rem' }}>+</span>}
                </div>
                <div style={{ color:'#555', fontSize:'0.8rem', lineHeight:1.6 }}>
                  Square image recommended.<br />
                  JPEG, PNG, or WebP · Max 5MB
                  <br />
                  <button type="button" onClick={() => logoRef.current?.click()}
                    style={{ background:'none', border:'none', color:'#c9a84c', fontSize:'0.8rem',
                      cursor:'pointer', padding:0, marginTop:4 }}>
                    Upload logo →
                  </button>
                </div>
              </div>
              <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
                onChange={e => handleImagePick(e.target.files[0], setLogoFile, setLogoPreview)} />
            </div>
          </div>

          {/* Business details */}
          <div style={sect}>
            <div style={sectH}>Business Information</div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={label}>Business / Dealership Name</label>
              <input value={form.businessName} onChange={e=>setForm(p=>({...p,businessName:e.target.value}))}
                style={inp} />
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={label}>Business Address</label>
              <input value={form.businessAddress} onChange={e=>setForm(p=>({...p,businessAddress:e.target.value}))}
                placeholder="e.g. Ring Road Central, Accra" style={inp} />
            </div>
            <div style={{ ...row2, marginBottom:'1rem' }}>
              <div>
                <label style={label}>Region</label>
                <select value={form.region} onChange={e=>setForm(p=>({...p,region:e.target.value}))}
                  style={{ ...inp, cursor:'pointer' }}>
                  <option value="">Select Region</option>
                  {GHANA_REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Phone</label>
                <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}
                  type="tel" placeholder="0244000000" style={inp} />
              </div>
            </div>
            <div>
              <label style={label}>WhatsApp Number</label>
              <input value={form.whatsapp} onChange={e=>setForm(p=>({...p,whatsapp:e.target.value}))}
                type="tel" placeholder="0244000000 (optional)" style={inp} />
            </div>
          </div>

          {/* Description */}
          <div style={sect}>
            <div style={sectH}>About Your Dealership</div>
            <textarea value={form.description}
              onChange={e=>setForm(p=>({...p,description:e.target.value}))}
              rows={4} maxLength={500}
              placeholder="Tell buyers about your dealership, specialties, and services…"
              style={{ ...inp, resize:'vertical', lineHeight:1.65 }} />
            <div style={{ textAlign:'right', color:'#555', fontSize:'0.75rem', marginTop:4 }}>
              {form.description.length}/500
            </div>
          </div>

          {/* Subscription note */}
          <div style={{ ...sect, borderColor:'#c9a84c22', background:'#1a1700' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ color:'#c9a84c', fontWeight:700, fontSize:'0.88rem' }}>
                  Subscription: {tier.charAt(0).toUpperCase()+tier.slice(1)} Plan
                </div>
                <div style={{ color:'#666', fontSize:'0.8rem', marginTop:3 }}>
                  To upgrade your plan, contact support at hello@420rims.com
                </div>
              </div>
              {dealer?.subscriptionExpiry && (
                <div style={{ color:'#555', fontSize:'0.75rem', textAlign:'right' }}>
                  Expires<br />{new Date(dealer.subscriptionExpiry).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={saving}
            style={{ width:'100%', background:'#c9a84c', color:'#0d0d0d', border:'none',
              borderRadius:8, padding:'0.9rem', fontWeight:800, fontSize:'1rem',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </DealerLayout>
  );
}
