import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const REGIONS = ['Greater Accra','Ashanti','Western','Eastern','Central','Northern',
  'Upper East','Upper West','Volta','Bono','Bono East','Ahafo','Savannah','North East','Oti','Western North'];
const BODY_TYPES = ['sedan','suv','pickup','hatchback','coupe','van','bus','convertible','truck'];
const CONDITIONS = ['new','foreign used','locally used'];

const sel = {
  background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:6,
  padding:'0.7rem 1rem', color:'#f0f0f0', fontSize:'0.88rem',
  outline:'none', cursor:'pointer', flex:1, minWidth:130,
};

export default function SearchBar({ initialValues = {} }) {
  const [make,      setMake]      = useState(initialValues.make || '');
  const [region,    setRegion]    = useState(initialValues.region || '');
  const [bodyType,  setBodyType]  = useState(initialValues.bodyType || '');
  const [condition, setCondition] = useState(initialValues.condition || '');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (make)      params.set('make', make);
    if (region)    params.set('region', region);
    if (bodyType)  params.set('bodyType', bodyType);
    if (condition) params.set('condition', condition);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div style={{ background:'rgba(0,0,0,0.5)', border:'1px solid #2a2a2a', borderRadius:10,
      padding:'1.25rem', display:'flex', flexWrap:'wrap', gap:'0.75rem', alignItems:'center',
      backdropFilter:'blur(8px)', maxWidth:860, margin:'0 auto', width:'100%' }}>
      <input value={make} onChange={e=>setMake(e.target.value)} placeholder="Make (e.g. Toyota)"
        style={{ ...sel, minWidth:160 }} onKeyDown={e=>e.key==='Enter'&&handleSearch()} />
      <select value={region} onChange={e=>setRegion(e.target.value)} style={sel}>
        <option value="">All Regions</option>
        {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
      </select>
      <select value={bodyType} onChange={e=>setBodyType(e.target.value)} style={sel}>
        <option value="">Body Type</option>
        {BODY_TYPES.map(b=><option key={b} value={b} style={{textTransform:'capitalize'}}>{b}</option>)}
      </select>
      <select value={condition} onChange={e=>setCondition(e.target.value)} style={sel}>
        <option value="">Condition</option>
        {CONDITIONS.map(c=><option key={c} value={c}>{c}</option>)}
      </select>
      <button onClick={handleSearch}
        style={{ background:'#c9a84c', color:'#0d0d0d', border:'none', borderRadius:6,
          padding:'0.7rem 1.5rem', fontWeight:700, fontSize:'0.9rem', cursor:'pointer',
          whiteSpace:'nowrap', flexShrink:0 }}>
        Search Cars
      </button>
    </div>
  );
}
