const REGIONS = ['Greater Accra','Ashanti','Western','Eastern','Central','Northern',
  'Upper East','Upper West','Volta','Bono','Bono East','Ahafo','Savannah','North East','Oti','Western North'];
const CONDITIONS   = ['new','foreign used','locally used'];
const TRANSMISSIONS = ['automatic','manual'];
const FUEL_TYPES   = ['petrol','diesel','electric','hybrid'];
const BODY_TYPES   = ['sedan','suv','pickup','hatchback','coupe','van','bus','convertible','truck'];

const label = { display:'block', color:'#888', fontSize:'0.78rem', marginBottom:5,
  fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 };
const inp = { width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:6,
  padding:'0.55rem 0.75rem', color:'#f0f0f0', fontSize:'0.85rem', outline:'none', boxSizing:'border-box' };
const sel = { ...inp, cursor:'pointer' };

export default function FilterPanel({ filters, onChange, onClear }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, padding:'1.25rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <span style={{ color:'#f0f0f0', fontWeight:700, fontSize:'0.9rem' }}>Filters</span>
        <button onClick={onClear} style={{ background:'none', border:'none', color:'#666',
          fontSize:'0.78rem', cursor:'pointer', textDecoration:'underline' }}>
          Clear all
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        <div>
          <label style={label}>Make</label>
          <input value={filters.make||''} onChange={set('make')} placeholder="e.g. Toyota" style={inp} />
        </div>
        <div>
          <label style={label}>Model</label>
          <input value={filters.model||''} onChange={set('model')} placeholder="e.g. Camry" style={inp} />
        </div>
        <div>
          <label style={label}>Year</label>
          <div style={{ display:'flex', gap:6 }}>
            <input type="number" value={filters.yearMin||''} onChange={set('yearMin')}
              placeholder="From" style={{ ...inp, width:'50%' }} />
            <input type="number" value={filters.yearMax||''} onChange={set('yearMax')}
              placeholder="To" style={{ ...inp, width:'50%' }} />
          </div>
        </div>
        <div>
          <label style={label}>Price (GHS)</label>
          <div style={{ display:'flex', gap:6 }}>
            <input type="number" value={filters.minPrice||''} onChange={set('minPrice')}
              placeholder="Min" style={{ ...inp, width:'50%' }} />
            <input type="number" value={filters.maxPrice||''} onChange={set('maxPrice')}
              placeholder="Max" style={{ ...inp, width:'50%' }} />
          </div>
        </div>
        <div>
          <label style={label}>Region</label>
          <select value={filters.region||''} onChange={set('region')} style={sel}>
            <option value="">All Regions</option>
            {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Condition</label>
          <select value={filters.condition||''} onChange={set('condition')} style={sel}>
            <option value="">Any</option>
            {CONDITIONS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Transmission</label>
          <select value={filters.transmission||''} onChange={set('transmission')} style={sel}>
            <option value="">Any</option>
            {TRANSMISSIONS.map(t=><option key={t} value={t} style={{textTransform:'capitalize'}}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Fuel Type</label>
          <select value={filters.fuelType||''} onChange={set('fuelType')} style={sel}>
            <option value="">Any</option>
            {FUEL_TYPES.map(f=><option key={f} value={f} style={{textTransform:'capitalize'}}>{f}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Body Type</label>
          <select value={filters.bodyType||''} onChange={set('bodyType')} style={sel}>
            <option value="">Any</option>
            {BODY_TYPES.map(b=><option key={b} value={b} style={{textTransform:'capitalize'}}>{b}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
