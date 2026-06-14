import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DealerLayout from './DealerLayout';
import ListingForm from './ListingForm';
import axiosInstance from '../../api/axiosInstance';

export default function DealerCreateListing() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await axiosInstance.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Listing submitted — pending admin approval');
      navigate('/dealer/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DealerLayout>
      <div style={{ maxWidth:760, margin:'0 auto' }}>
        <h1 style={{ color:'#f0f0f0', fontSize:'1.4rem', fontWeight:700, marginBottom:'0.4rem' }}>
          Add New Listing
        </h1>
        <p style={{ color:'#666', fontSize:'0.85rem', marginBottom:'1.5rem' }}>
          Your listing will be reviewed by an admin before going live.
        </p>
        <ListingForm onSubmit={handleSubmit} submitLabel="Submit for Review" loading={loading} />
      </div>
    </DealerLayout>
  );
}
