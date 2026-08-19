import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import ListingForm from '../dealer/ListingForm';
import axiosInstance from '../../api/axiosInstance';
import { getPlaceholder } from '../../utils/placeholder';

const PLACEHOLDER = getPlaceholder(600, 400);
const fmt = (n, cur) => (cur === 'USD' ? `$${Number(n).toLocaleString()}` : `GHS ${Number(n).toLocaleString()}`);

const Badge = ({ label, bg, color }) => (
  <span style={{ background: bg, color, fontSize: '0.7rem', padding: '2px 8px',
    borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>{label}</span>
);

const ActionBtn = ({ label, onClick, color = '#ccc', bg = '#1e1e1e', disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background: bg, border: '1px solid #2a2a2a', color, borderRadius: 5,
      padding: '5px 14px', fontSize: '0.8rem', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1, fontWeight: 600 }}>
    {label}
  </button>
);

const Field = ({ label, value }) => (
  <div style={{ marginBottom: '0.9rem' }}>
    <div style={{ color: '#555', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
    <div style={{ color: '#ececec', fontSize: '0.88rem' }}>{value || <span style={{ color: '#333' }}>—</span>}</div>
  </div>
);

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 10,
        padding: '1.75rem', maxWidth: 400, width: '100%' }}>
        <div style={{ color: '#ececec', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>{title}</div>
        <div style={{ color: '#888', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>{message}</div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel}
            style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#ccc',
              borderRadius: 6, padding: '0.55rem 1.25rem', cursor: 'pointer', fontSize: '0.88rem' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            style={{ background: '#e05252', border: 'none', color: '#fff', borderRadius: 6,
              padding: '0.55rem 1.25rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminListingDetail() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [acting, setActing]   = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/admin/listings/${listingId}`);
      setListing(data);
    } catch {
      toast.error('Failed to load listing');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => { load(); }, [load]);

  const act = async (endpoint, successMsg, update) => {
    setActing(endpoint);
    try {
      await axiosInstance.put(`/admin/listings/${listingId}/${endpoint}`);
      setListing((prev) => ({ ...prev, ...update }));
      toast.success(successMsg);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  const confirmDelete = async () => {
    setDeleteModal(false);
    setActing('delete');
    try {
      await axiosInstance.delete(`/admin/listings/${listingId}`);
      toast.success('Listing permanently deleted');
      navigate('/admin/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
      setActing(null);
    }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const { data } = await axiosInstance.put(`/admin/listings/${listingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setListing(data);
      setEditing(false);
      toast.success('Listing updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>Loading…</div>
      </AdminLayout>
    );
  }

  if (!listing) {
    return (
      <AdminLayout>
        <div style={{ padding: '3rem', textAlign: 'center', color: '#555' }}>
          Listing not found.
          <div style={{ marginTop: '1rem' }}>
            <Link to="/admin/listings" style={{ color: '#c41e2a' }}>← Back to listings</Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {deleteModal && (
        <ConfirmModal
          title="Delete Listing"
          message="This will permanently delete the listing and all its images from Cloudinary. This cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(false)}
        />
      )}

      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link to="/admin/listings" style={{ color: '#555', fontSize: '0.82rem' }}>← Back to Listings</Link>
        {editing && (
          <button onClick={() => setEditing(false)}
            style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#ccc', borderRadius: 5,
              padding: '5px 14px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
            Cancel Edit
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ maxWidth: 760 }}>
          <h1 style={{ color: '#ececec', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Edit Listing
          </h1>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Editing as admin. Approval status is unaffected by these changes.
          </p>
          <ListingForm
            defaultValues={listing}
            existingImages={listing.images || []}
            onSubmit={handleSave}
            submitLabel="Save Changes"
            loading={saving}
          />
        </div>
      ) : (
        <>
          {/* Header card */}
          <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 10, overflow: 'hidden', marginBottom: '1.25rem' }}>
            <img src={listing.images?.[0] || PLACEHOLDER} alt="" onError={(e) => { e.target.src = PLACEHOLDER; }}
              style={{ width: '100%', height: 260, objectFit: 'cover' }} />
            <div style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={{ color: '#ececec', fontSize: '1.3rem', fontWeight: 700 }}>{listing.title}</h1>
                  {listing.isApproved
                    ? <Badge label="Approved" bg="#52c07a22" color="#52c07a" />
                    : listing.isActive
                      ? <Badge label="Pending" bg="#c41e2a22" color="#c41e2a" />
                      : <Badge label="Rejected" bg="#e0525222" color="#e05252" />}
                  {listing.isBoosted && <Badge label="Boosted" bg="#c41e2a22" color="#c41e2a" />}
                </div>
                <div style={{ color: '#c41e2a', fontWeight: 700, fontSize: '1.05rem', marginTop: 6 }}>
                  {fmt(listing.price, listing.currency)}
                </div>
                <div style={{ color: '#666', fontSize: '0.82rem', marginTop: 4 }}>
                  {listing.dealer?.businessName || '—'} · {listing.region} · {listing.views || 0} views
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <ActionBtn label="Edit Listing" color="#0d0d0d" bg="#c41e2a" onClick={() => setEditing(true)} disabled={!!acting} />
                {!listing.isApproved && (
                  <ActionBtn label={acting === 'approve' ? '…' : 'Approve'} color="#52c07a"
                    onClick={() => act('approve', 'Listing approved', { isApproved: true, isActive: true })} disabled={!!acting} />
                )}
                {listing.isApproved && (
                  <ActionBtn label={acting === 'reject' ? '…' : 'Reject'} color="#e05252"
                    onClick={() => act('reject', 'Listing rejected', { isApproved: false, isActive: false })} disabled={!!acting} />
                )}
                <ActionBtn label={acting === 'delete' ? '…' : 'Delete'} color="#e05252"
                  onClick={() => setDeleteModal(true)} disabled={!!acting} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }} className="detail-cols">
            <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 10, padding: '1.25rem' }}>
              <div style={{ color: '#c41e2a', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e1e1e' }}>
                Vehicle Details
              </div>
              <Field label="Make / Model" value={`${listing.make} ${listing.model}`} />
              <Field label="Year" value={listing.year} />
              <Field label="Condition" value={<span style={{ textTransform: 'capitalize' }}>{listing.condition}</span>} />
              <Field label="Body Type" value={<span style={{ textTransform: 'capitalize' }}>{listing.bodyType}</span>} />
              <Field label="Transmission" value={<span style={{ textTransform: 'capitalize' }}>{listing.transmission}</span>} />
              <Field label="Fuel Type" value={<span style={{ textTransform: 'capitalize' }}>{listing.fuelType}</span>} />
              <Field label="Mileage" value={listing.mileage ? `${Number(listing.mileage).toLocaleString()} ${listing.mileageUnit}` : null} />
              <Field label="Color" value={listing.color} />
            </div>

            <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 10, padding: '1.25rem' }}>
              <div style={{ color: '#c41e2a', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e1e1e' }}>
                Listing Info
              </div>
              <Field label="Dealer" value={listing.dealer
                ? <Link to={`/admin/dealers/${listing.dealer._id}`} style={{ color: '#c41e2a' }}>{listing.dealer.businessName}</Link>
                : null} />
              <Field label="Region" value={listing.region} />
              <Field label="Location / Area" value={listing.location} />
              <Field label="Views" value={listing.views || 0} />
              <Field label="Enquiries" value={listing.enquiryCount || 0} />
              <Field label="Listed On" value={new Date(listing.createdAt).toLocaleDateString()} />
              <Field label="Last Updated" value={new Date(listing.updatedAt).toLocaleDateString()} />
            </div>
          </div>

          <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 10, padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ color: '#c41e2a', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
              marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e1e1e' }}>
              Description
            </div>
            <div style={{ color: '#ccc', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {listing.description || <span style={{ color: '#333' }}>No description provided.</span>}
            </div>
          </div>

          {listing.images && listing.images.length > 1 && (
            <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 10, padding: '1.25rem' }}>
              <div style={{ color: '#c41e2a', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e1e1e' }}>
                All Images ({listing.images.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {listing.images.map((url) => (
                  <img key={url} src={url} alt="" onError={(e) => { e.target.src = PLACEHOLDER; }}
                    style={{ width: 130, height: 92, objectFit: 'cover', borderRadius: 6, border: '1px solid #2a2a2a' }} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@media(max-width:800px){.detail-cols{grid-template-columns:1fr!important}}`}</style>
    </AdminLayout>
  );
}
