import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Banners = ({ token }) => {
  const [image, setImage] = useState(null);
  const [link, setLink] = useState('');
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/banner/list`);
      if (res.data.success) setBanners(res.data.banners || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error('Please select an image');
    setLoading(true);
    try {
  const fd = new FormData();
  fd.append('image', image);
  fd.append('link', link);

      const res = await axios.post(`${backendUrl}/api/banner/add`, fd, {
        headers: { token, 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Banner added');
        // clear form fields
        setImage(null);
        setLink('');
        fetchBanners();
      } else toast.error(res.data.message || 'Failed');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      const res = await axios.delete(`${backendUrl}/api/banner/${id}`, { headers: { token } });
      if (res.data.success) { toast.success('Deleted'); fetchBanners(); }
      else toast.error(res.data.message || 'Failed to delete');
    } catch (err) { toast.error(err.response?.data?.message || err.message); }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-[#052659] mb-4">Hero Banners</h2>

      <form onSubmit={onSubmit} className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block mb-1 font-medium">Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Product Link (product id or route)</label>
          <input value={link} onChange={(e)=>setLink(e.target.value)} placeholder="e.g. 64f... or /product/64f... or https://youtube.com/..." className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <button disabled={loading} className="px-4 py-2 bg-[#052659] text-white rounded">{loading? 'Uploading...':'Upload Banner'}</button>
        </div>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Existing Banners</h3>
        <div className="space-y-3">
          {banners.map(b => (
            <div key={b._id} className="flex items-center justify-between bg-white p-3 rounded shadow">
              <div className="flex items-center gap-3">
                <img src={b.image} alt={b.title || 'banner'} className="w-28 h-16 object-cover rounded" />
                <div>
                  <div className="text-sm text-gray-500">Link: {b.link || '(none)'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDelete(b._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banners;
