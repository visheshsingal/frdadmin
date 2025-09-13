import React, { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  const [image5, setImage5] = useState(false);

  // Add video states
  const [video1, setVideo1] = useState(false);
  const [video2, setVideo2] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mainCategory, setMainCategory] = useState('Protein');
  const [customCategory, setCustomCategory] = useState(''); // For custom category input
  const [showCustomCategory, setShowCustomCategory] = useState(false); // Toggle custom input
  const [tagCategory, setTagCategory] = useState('Popular');
  const [bestseller, setBestseller] = useState(false);
  const [loading, setLoading] = useState(false);

  const predefinedCategories = [
    'Protein',
    'Creatine',
    'BCAA',
    'Mass Gainer',
    'Pre Workout',
    'Post Workout',
    'Vitamins',
    'Other' // Added "Other" option to trigger custom input
  ];

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price.toString());
      
      // Use custom category if provided, otherwise use selected category
      const finalCategory = showCustomCategory && customCategory ? customCategory : mainCategory;
      formData.append('category', finalCategory);
      
      formData.append('subCategory', tagCategory);
      formData.append('bestseller', bestseller.toString());

      // Append images
      if (image1) formData.append('image1', image1);
      if (image2) formData.append('image2', image2);
      if (image3) formData.append('image3', image3);
      if (image4) formData.append('image4', image4);
      if (image5) formData.append('image5', image5);

      // Append videos
      if (video1) formData.append('video1', video1);
      if (video2) formData.append('video2', video2);

      const response = await axios.post(`${backendUrl}/api/product/add`, formData, {
        headers: { 
          token,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        // reset form
        setName('');
        setDescription('');
        setPrice('');
        setMainCategory('Protein');
        setCustomCategory('');
        setShowCustomCategory(false);
        setTagCategory('Popular');
        setBestseller(false);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setImage5(false);
        setVideo1(false);
        setVideo2(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setMainCategory(value);
    
    // Show custom input if "Other" is selected
    if (value === 'Other') {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
      setCustomCategory('');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#052659] mb-6">Add New Supplement</h2>
      
      <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-6 bg-white p-6 rounded-lg shadow-md">
        {/* Upload Images */}
        <div className="w-full">
          <p className="mb-3 text-[#052659] font-medium">Upload Product Images (Up to 5)</p>
          <div className="flex gap-4 flex-wrap">
            {[image1, image2, image3, image4, image5].map((img, index) => (
              <label key={index} htmlFor={`image${index + 1}`} className="cursor-pointer">
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-1 hover:border-[#052659] transition-colors">
                  <img
                    className="w-24 h-24 object-cover rounded"
                    src={!img ? assets.upload_area : URL.createObjectURL(img)}
                    alt=""
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {index + 1}
                  </div>
                </div>
                <input
                  type="file"
                  id={`image${index + 1}`}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && !file.type.startsWith('image/')) {
                      toast.error('Please select an image file');
                      return;
                    }
                    if (index === 0) setImage1(file);
                    if (index === 1) setImage2(file);
                    if (index === 2) setImage3(file);
                    if (index === 3) setImage4(file);
                    if (index === 4) setImage5(file);
                  }}
                  accept="image/*"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Upload Videos */}
        <div className="w-full">
          <p className="mb-3 text-[#052659] font-medium">Upload Product Videos (Up to 2)</p>
          <div className="flex gap-4">
            {[video1, video2].map((vid, index) => (
              <label key={index} htmlFor={`video${index + 1}`} className="cursor-pointer">
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-1 hover:border-[#052659] transition-colors">
                  <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded">
                    {!vid ? (
                      <span className="text-2xl">🎬</span>
                    ) : (
                      <span className="text-sm text-center">Video {index + 1}</span>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    Video {index + 1}
                  </div>
                </div>
                <input
                  type="file"
                  id={`video${index + 1}`}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && !file.type.startsWith('video/')) {
                      toast.error('Please select a video file');
                      return;
                    }
                    if (index === 0) setVideo1(file);
                    if (index === 1) setVideo2(file);
                  }}
                  accept="video/*"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Supplement Name */}
        <div className="w-full">
          <p className="mb-2 text-[#052659] font-medium">Supplement Name</p>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Whey Protein Isolate"
            className="w-full max-w-[500px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052659] focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div className="w-full">
          <p className="mb-2 text-[#052659] font-medium">Description</p>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description about the supplement"
            rows="3"
            className="w-full max-w-[500px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052659] focus:border-transparent"
          />
        </div>

        {/* Category + Tag + Price */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          {/* Category with custom input */}
          <div className="flex-1">
            <p className="mb-2 text-[#052659] font-medium">Main Category</p>
            <select
              value={mainCategory}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052659] focus:border-transparent mb-2"
            >
              {predefinedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            
            {/* Custom Category Input (shown only when "Other" is selected) */}
            {showCustomCategory && (
              <div className="mt-2">
                <p className="mb-2 text-[#052659] font-medium">Custom Category Name</p>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter your custom category"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052659] focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Tag */}
          <div className="flex-1">
            <p className="mb-2 text-[#052659] font-medium">Tag</p>
            <select
              value={tagCategory}
              onChange={(e) => setTagCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052659] focus:border-transparent"
            >
              <option value="Popular">Popular</option>
              <option value="Just Launched">Just Launched</option>
              <option value="Editor's Choice">Editor's Choice</option>
              <option value="Trending">Trending</option>
            </select>
          </div>

          {/* Price */}
          <div className="flex-1">
            <p className="mb-2 text-[#052659] font-medium">Price (₹)</p>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price in INR"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052659] focus:border-transparent"
            />
          </div>
        </div>

        {/* Bestseller Checkbox */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="bestseller"
            checked={bestseller}
            onChange={() => setBestseller((prev) => !prev)}
            className="w-4 h-4 text-[#052659] focus:ring-[#052659] border-gray-300 rounded"
          />
          <label htmlFor="bestseller" className="text-[#052659] cursor-pointer">Mark as Bestseller</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-40 py-3 mt-4 text-white rounded-lg transition font-medium ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#052659] hover:bg-[#041d47]'
          }`}
        >
          {loading ? 'Adding...' : 'Add Supplement'}
        </button>
      </form>
    </div>
  );
};

export default Add;