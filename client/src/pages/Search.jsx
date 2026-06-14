import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CarCard from '../components/CarCard';
import FilterPanel from '../components/FilterPanel';
import axiosInstance from '../api/axiosInstance';

const SORT_OPTIONS = [
  { value: 'createdAt_desc',  label: 'Newest First' },
  { value: 'price_asc',       label: 'Price: Low to High' },
  { value: 'price_desc',      label: 'Price: High to Low' },
  { value: 'views_desc',      label: 'Most Viewed' },
];

const Skeleton = () => (
  <div style={{ background:'#141414', border:'1px solid #1e1e1e', borderRadius:10, overflow:'hidden' }}>
    <div style={{ aspectRatio:'16/10', background:'#1e1e1e', animation:'pulse 1.4s infinite' }} />
    <div style={{ padding:'0.9rem', display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ height:14, background:'#1e1e1e', borderRadius:4, width:'70%' }} />
      <div style={{ height:18, background:'#1e1e1e', borderRadius:4, width:'45%' }} />
    </div>
  </div>
);

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [sort,     setSort]     = useState('createdAt_desc');
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    make:         searchParams.get('make')         || '',
    model:        searchParams.get('model')        || '',
    region:       searchParams.get('region')       || '',
    bodyType:     searchParams.get('bodyType')     || '',
    condition:    searchParams.get('condition')    || '',
    transmission: searchParams.get('transmission') || '',
    fuelType:     searchParams.get('fuelType')     || '',
    minPrice:     searchParams.get('minPrice')     || '',
    maxPrice:     searchParams.get('maxPrice')     || '',
    yearMin:      searchParams.get('yearMin')      || '',
    yearMax:      searchParams.get('yearMax')      || '',
  });

  const LIMIT = 20;
  const totalPages = Math.ceil(total / LIMIT);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      Object.entries(filters).forEach(([k,v]) => { if (v) params.set(k, v); });
      const [sortField, sortDir] = sort.split('_');
      params.set('sortField', sortField);
      params.set('sortDir',   sortDir);
      const { data } = await axiosInstance.get(`/listings?${params}`);
      setListings(data.listings);
      setTotal(data.total);
    } catch { setListings([]); }
    finally  { setLoading(false); }
  }, [filters, page, sort]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleFilters = (next) => {
    setFilters(next);
    setPage(1);
    const p = new URLSearchParams();
    Object.entries(next).forEach(([k,v]) => { if (v) p.set(k,v); });
    setSearchParams(p);
  };

  const clearFilters = () => handleFilters({
    make:'',model:'',region:'',bodyType:'',condition:'',
    transmission:'',fuelType:'',minPrice:'',maxPrice:'',yearMin:'',yearMax:'',
  });

  return (
    <div style={{ minHeight:'100vh', background:'#0d0d0d', display:'flex', flexDirection:'column' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <Navbar />

      <div style={{ maxWidth:1280, margin:'0 auto', width:'100%', padding:'2rem 1.5rem', flex:1 }}>
        {/* Header row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          flexWrap:'wrap', gap:'1rem', marginBottom:'1.5rem' }}>
          <div>
            <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700 }}>Browse Cars</h1>
            {!loading && (
              <div style={{ color:'#666', fontSize:'0.82rem', marginTop:3 }}>
                {total.toLocaleString()} listing{total !== 1 ? 's' : ''} found
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
            <button onClick={()=>setShowFilter(p=>!p)}
              style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', color:'#ccc',
                borderRadius:6, padding:'0.5rem 1rem', fontSize:'0.85rem', cursor:'pointer' }}
              className="filter-toggle">
              {showFilter ? 'Hide Filters' : 'Filters'}
            </button>
            <select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}
              style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', color:'#ccc',
                borderRadius:6, padding:'0.5rem 0.75rem', fontSize:'0.85rem', cursor:'pointer', outline:'none' }}>
              {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'1.5rem', alignItems:'start' }}
          className="search-layout">

          {/* Filter sidebar */}
          <div className="filter-sidebar" style={{ display: showFilter ? 'block' : 'block' }}>
            <FilterPanel filters={filters} onChange={handleFilters} onClear={clearFilters} />
          </div>

          {/* Results */}
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1.25rem' }}>
              {loading
                ? Array(8).fill(0).map((_,i)=><Skeleton key={i} />)
                : listings.length === 0
                  ? <div style={{ color:'#555', gridColumn:'1/-1', textAlign:'center', padding:'4rem 0', fontSize:'1rem' }}>
                      No listings match your filters.
                    </div>
                  : listings.map(l=><CarCard key={l._id} listing={l} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem',
                marginTop:'2.5rem', flexWrap:'wrap' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width:38, height:38, borderRadius:6, border:'1px solid',
                      borderColor: p === page ? '#c9a84c' : '#2a2a2a',
                      background: p === page ? '#c9a84c' : '#1a1a1a',
                      color: p === page ? '#0d0d0d' : '#ccc',
                      fontWeight: p === page ? 700 : 400,
                      cursor:'pointer', fontSize:'0.85rem' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <style>{`
        @media(max-width:768px){
          .search-layout{grid-template-columns:1fr!important}
          .filter-sidebar{display:none}
          .filter-sidebar.open{display:block}
        }
      `}</style>
    </div>
  );
}
