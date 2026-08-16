'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ImageCropperModal from '@/components/ImageCropperModal';
import { uploadImage, createProduct } from '@/lib/api';

export default function AddProductPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pakistani Suit',
    stock: '10'
  });

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setRawImageSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (blob: Blob) => {
    setCroppedBlob(blob);
    setCroppedPreviewUrl(URL.createObjectURL(blob));
    setRawImageSrc(null); // Close the modal
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!croppedBlob) {
      setError('Please upload and crop an image for the product.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Upload the optimized WebP image
      const imageUrl = await uploadImage(croppedBlob);

      // 2. Create the product
      await createProduct({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: [imageUrl]
      });

      setSuccess('Product added successfully!');
      
      // Reset form
      setFormData({ name: '', description: '', price: '', category: 'Pakistani Suit', stock: '10' });
      setCroppedBlob(null);
      if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
      setCroppedPreviewUrl(null);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fffdf8', minHeight: '100vh', padding: '40px 16px', display: 'flex', justifyContent: 'center' }}>
      
      {/* Cropper Modal */}
      {rawImageSrc && (
        <ImageCropperModal
          imageSrc={rawImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setRawImageSrc(null)}
        />
      )}

      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 30px rgba(107, 25, 41, 0.06)', border: '1px solid rgba(184, 150, 62, 0.15)' }}>
        
        <header style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ justifySelf: 'start' }}>
            <button 
              onClick={() => router.push('/profile')} 
              style={{ background: '#f5f5f5', border: '1px solid #ebebeb', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#444', transition: 'all 0.2s ease' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#6b1929', margin: 0, textAlign: 'center' }}>Add Product</h1>
          <div style={{ justifySelf: 'end' }}></div>
        </header>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}
        {success && <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Image Upload Zone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#666', marginBottom: '8px' }}>PRODUCT IMAGE (3:4 RATIO)</label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '30px', border: '2px dashed #e0d5c1', borderRadius: '12px',
                  backgroundColor: '#fafaf8', cursor: 'pointer', transition: 'background-color 0.2s ease'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b8963e" strokeWidth="2" style={{ marginBottom: '10px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Click to upload photo</span>
                  <span style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>JPEG, PNG, WEBP</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Preview Box */}
              {croppedPreviewUrl && (
                <div style={{ width: '120px', height: '160px', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Image src={croppedPreviewUrl} alt="Preview" fill style={{ objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#666', marginBottom: '8px' }}>PRODUCT NAME</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleInputChange} required 
              placeholder="e.g. Royal Ivory Anarkali Suit"
              style={{ width: '100%', padding: '12px', border: '1px solid #e0d5c1', borderRadius: '8px', fontSize: '0.95rem' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#666', marginBottom: '8px' }}>PRICE (₹)</label>
              <input 
                type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0"
                placeholder="e.g. 18500"
                style={{ width: '100%', padding: '12px', border: '1px solid #e0d5c1', borderRadius: '8px', fontSize: '0.95rem' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#666', marginBottom: '8px' }}>STOCK</label>
              <input 
                type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="1"
                style={{ width: '100%', padding: '12px', border: '1px solid #e0d5c1', borderRadius: '8px', fontSize: '0.95rem' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#666', marginBottom: '8px' }}>CATEGORY</label>
            <select 
              name="category" value={formData.category} onChange={handleInputChange} required
              style={{ width: '100%', padding: '12px', border: '1px solid #e0d5c1', borderRadius: '8px', fontSize: '0.95rem', backgroundColor: '#fff' }}
            >
              <option value="Pakistani Suit">Pakistani Suit</option>
              <option value="Lehenga">Lehenga</option>
              <option value="Saree">Saree</option>
              <option value="Kurta Set">Kurta Set</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#666', marginBottom: '8px' }}>DESCRIPTION</label>
            <textarea 
              name="description" value={formData.description} onChange={handleInputChange} required rows={4}
              placeholder="Describe the fabric, embroidery, and care instructions..."
              style={{ width: '100%', padding: '12px', border: '1px solid #e0d5c1', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !croppedBlob}
            style={{ 
              marginTop: '10px', width: '100%', padding: '16px', backgroundColor: '#6b1929', color: '#fff', 
              border: 'none', borderRadius: '30px', fontSize: '1rem', fontWeight: 600, cursor: (loading || !croppedBlob) ? 'not-allowed' : 'pointer',
              opacity: (loading || !croppedBlob) ? 0.7 : 1, transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Uploading...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
