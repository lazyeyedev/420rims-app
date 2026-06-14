import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DealerLayout from './DealerLayout';
import ListingForm from './ListingForm';
import axiosInstance from '../../api/axiosInstance';

export default function DealerEditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/listings/${id}`)
      .then(r => setListing(r.data))
      .catch(() => { toast.error('Listing not found'); navigate('/dealer/listings'); })
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await axiosInstance.put(`/listings/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Listing updated successfully');
      navigate('/dealer/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <DealerLayout>
      <div style={{ color:'#444', padding:'3rem', textAlign:'center' }}>Loading listing…</div>
    </DealerLayout>
  );

  if (!listing) return null;

  return (
    <DealerLayout>
      <div style={{ maxWidth:760, margin:'0 auto' }}>
        <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700, marginBottom:'0.4rem' }}>
          Edit Listing
        </h1>
        <p style={{ color:'#666', fontSize:'0.85rem', marginBottom:'1.5rem' }}>
          Changes will require re-approval before going live.
        </p>
        <ListingForm
          defaultValues={listing}
          existingImages={listing.images || []}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          loading={loading}
        />
      </div>
    </DealerLayout>
  );
}
