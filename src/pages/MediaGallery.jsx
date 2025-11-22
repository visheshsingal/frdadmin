import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const MediaGalleryAdmin = ({ token }) => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/media/list`);
      if (res.data.success) setMedia(res.data.media || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetch(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error('Select image');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', image);
      fd.append('caption', caption);
      const res = await axios.post(`${backendUrl}/api/media/add`, fd, { headers: { token, 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) { toast.success('Uploaded'); setImage(null); setCaption(''); fetch(); }
      else toast.error(res.data.message || 'Failed');
    } catch (err) { toast.error(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this image?')) return;
    try {
      const res = await axios.delete(`${backendUrl}/api/media/${id}`, { headers: { token } });
      if (res.data.success) { toast.success('Deleted'); fetch(); }
      else toast.error(res.data.message || 'Failed');
    } catch (e) { toast.error(e.response?.data?.message || e.message); }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-[#052659] mb-4">Media Gallery</h2>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block mb-1 font-medium">Image</label>
          <input type="file" accept="image/*" onChange={(e)=>setImage(e.target.files[0])} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Caption (optional)</label>
          <input value={caption} onChange={(e)=>setCaption(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <button disabled={loading} className="px-4 py-2 bg-[#052659] text-white rounded">{loading? 'Uploading...':'Upload'}</button>
        </div>
      </form>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map(m => (
          <div key={m._id} className="bg-white p-2 rounded shadow relative">
            <img src={m.image} alt={m.caption || 'media'} className="w-full h-28 object-cover rounded" />
            <div className="mt-2 text-xs text-gray-600">{m.caption}</div>
            <button onClick={()=>del(m._id)} className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs">Del</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGalleryAdmin;
