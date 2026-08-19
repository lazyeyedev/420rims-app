import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import ListingForm from '../dealer/ListingForm';
import axiosInstance from '../../api/axiosInstance';

const Badge = ({ label, bg, color }) => (
  <span style={{ background: bg, color, fontSize: '0.7rem', padding: '2px 8px',
    borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>{label}</span>
);

export default function AdminListingEdit() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    axiosInstance.get(`/admin/listings/${listingId}`)
      .then((r) => setListing(r.data))
      .catch(() => { toast.error('Listing not found'); navigate('/admin/listings'); })
      .finally(() => setFetching(false));
  }, [listingId, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.put(`/admin/listings/${listingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setListing(data);
      toast.success('Listing updated');
      navigate('/admin/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div style={{ color: '#444', padding: '3rem', textAlign: 'center' }}>Loading listing…</div>
      </AdminLayout>
    );
  }

  if (!listing) return null;

  const statusBadge = listing.isApproved
    ? <Badge label="Approved" bg="#52c07a22" color="#52c07a" />
    : listing.isActive
      ? <Badge label="Pending" bg="#c41e2a22" color="#c41e2a" />
      : <Badge label="Rejected" bg="#e0525222" color="#e05252" />;

  return (
    <AdminLayout>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <Link to="/admin/listings" style={{ color: '#555', fontSize: '0.82rem' }}>← Back to Listings</Link>
        </div>

        {/* Summary / view section */}
        <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ color: '#ececec', fontSize: '1.3rem', fontWeight: 700 }}>{listing.title}</h1>
                {statusBadge}
                {listing.isBoosted && <Badge label="Boosted" bg="#c41e2a22" color="#c41e2a" />}
              </div>
              <div style={{ color: '#666', fontSize: '0.82rem', marginTop: 4 }}>
                {listing.currency === 'USD' ? '$' : 'GHS '}{Number(listing.price).toLocaleString()} · {listing.region}
              </div>
            </div>
            {listing.dealer && (
              <Link to={`/admin/dealers/${listing.dealer._id}`} style={{ color: '#c41e2a', fontSize: '0.82rem' }}>
                {listing.dealer.businessName} →
              </Link>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #1e1e1e', flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Views</div>
              <div style={{ color: '#ececec', fontWeight: 700, fontSize: '1.1rem' }}>{listing.views || 0}</div>
            </div>
            <div>
              <div style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Enquiries</div>
              <div style={{ color: '#ececec', fontWeight: 700, fontSize: '1.1rem' }}>{listing.enquiryCount || 0}</div>
            </div>
            <div>
              <div style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Posted</div>
              <div style={{ color: '#ececec', fontWeight: 700, fontSize: '1.1rem' }}>{new Date(listing.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <h2 style={{ color: '#ececec', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Edit Listing</h2>
        <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Editing as admin — changes save immediately and do not require re-approval.
        </p>

        <ListingForm
          defaultValues={listing}
          existingImages={listing.images || []}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
}
