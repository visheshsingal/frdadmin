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
  const [image6, setImage6] = useState(false);
  const [image7, setImage7] = useState(false);
  const [image8, setImage8] = useState(false);
  const [image9, setImage9] = useState(false);
  const [image10, setImage10] = useState(false);

  // Add video states
  const [video1, setVideo1] = useState(false);
  const [video2, setVideo2] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [manufacturerDetails, setManufacturerDetails] = useState('');
  const [manufacturerLabel, setManufacturerLabel] = useState('Manufacturer Details');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  // flat variants editor removed; variants are added inside variantGroups now
  // variantGroups: [{ label, variants: [ { name, price, stock, imageIndex, discount } ] }]
  const [variantGroups, setVariantGroups] = useState([{ label: 'Flavour', variants: [] }]);
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
  if (manufacturerDetails) formData.append('manufacturerDetails', manufacturerDetails);
  if (manufacturerLabel) formData.append('manufacturerLabel', manufacturerLabel);
      formData.append('price', price.toString());
      formData.append('discount', (discount || 0).toString());
      // Variants are provided inside variantGroups; backend will flatten them. No flat 'variants' payload is sent.
      
      // Use custom category if provided, otherwise use selected category
      const finalCategory = showCustomCategory && customCategory ? customCategory : mainCategory;
      formData.append('category', finalCategory);
      
  formData.append('subCategory', tagCategory);
  formData.append('variantGroups', JSON.stringify(variantGroups));
      formData.append('bestseller', bestseller.toString());

    // Append images (now up to 10)
  if (image1) formData.append('image1', image1);
  if (image2) formData.append('image2', image2);
  if (image3) formData.append('image3', image3);
  if (image4) formData.append('image4', image4);
  if (image5) formData.append('image5', image5);
  if (image6) formData.append('image6', image6);
  if (image7) formData.append('image7', image7);
  if (image8) formData.append('image8', image8);
  if (image9) formData.append('image9', image9);
  if (image10) formData.append('image10', image10);

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
  setManufacturerDetails('');
        setPrice('');
        setDiscount('');
    setVariantGroups([{ label: 'Flavour', variants: [] }]);
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
  setImage6(false);
    setImage7(false);
    setImage8(false);
    setImage9(false);
    setImage10(false);
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
            <p className="mb-3 text-[#052659] font-medium">Upload Product Images (Up to 10)</p>
          <div className="flex gap-4 flex-wrap">
            {[image1, image2, image3, image4, image5, image6, image7, image8, image9, image10].map((img, index) => (
              <label key={index} htmlFor={`image${index + 1}`} className="cursor-pointer">
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-1 hover:border-[#052659] transition-colors">
                  {img ? (
                    <img
                      className="w-24 h-24 object-cover rounded"
                      src={URL.createObjectURL(img)}
                      alt=""
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center bg-gray-50 rounded text-xs text-gray-500">Image {index + 1}</div>
                  )}
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
                    if (index === 5) setImage6(file);
                    if (index === 6) setImage7(file);
                    if (index === 7) setImage8(file);
                    if (index === 8) setImage9(file);
                    if (index === 9) setImage10(file);
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

          {/* Manufacturer Label + Details (optional) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-[#052659] font-medium">Manufacturer Label</p>
              <input
                type="text"
                value={manufacturerLabel}
                onChange={(e) => setManufacturerLabel(e.target.value)}
                placeholder="e.g. Manufacturer Details, Brand Info"
                className="w-full max-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052659] focus:border-transparent"
              />
            </div>
            <div>
              <p className="mb-2 text-[#052659] font-medium">Manufacturer Details (optional)</p>
              <textarea
                value={manufacturerDetails}
                onChange={(e) => setManufacturerDetails(e.target.value)}
                placeholder="Manufacturer name, address, other notes (optional)"
                rows="2"
                className="w-full max-w-[500px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052659] focus:border-transparent"
              />
            </div>
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

        {/* Discount Percentage */}
        <div className="w-full max-w-sm">
          <p className="mb-2 text-[#052659] font-medium">Discount (%)</p>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="e.g. 10 for 10%"
            min="0"
            max="100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052659] focus:border-transparent"
          />
        </div>

        {/* Variant Groups Editor */}
        <div className="w-full">
          <div className="flex items-center justify-between">
            <p className="mb-2 text-[#052659] font-medium">Variant Groups</p>
            <button
              type="button"
              onClick={() => setVariantGroups(prev => ([...prev, { label: 'New Group', variants: [] }]))}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              ➕ Add Group
            </button>
          </div>

          <div className="space-y-3">
            {variantGroups.map((g, gi) => (
              <div key={gi} className="p-3 border border-gray-200 rounded">
                <div className="flex gap-2 items-center mb-2">
                  <input
                    type="text"
                    value={g.label}
                    onChange={(e) => setVariantGroups(prev => { const cp = [...prev]; cp[gi].label = e.target.value; return cp; })}
                    className="px-3 py-2 border border-gray-300 rounded w-48"
                  />
                  <button type="button" onClick={() => setVariantGroups(prev => { const cp = [...prev]; cp.splice(gi,1); return cp; })} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Remove Group</button>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Variants for "{g.label || 'Group'}"</p>
                    <button type="button" onClick={() => setVariantGroups(prev => { const cp = [...prev]; cp[gi].variants.push({ name: '', price: '', stock: '', imageIndex: '', discount: '' }); return cp; })} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">➕ Add Variant</button>
                  </div>

                  {g.variants && g.variants.length === 0 && (
                    <p className="text-xs text-gray-400 mt-2">No variants added under this label.</p>
                  )}

                  <div className="space-y-2 mt-2">
                    {g.variants && g.variants.map((vv, vi) => (
                      <div key={vi} className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                        <input
                          type="text"
                          placeholder="Variant name (e.g. Chocolate)"
                          value={vv.name}
                          onChange={(e) => setVariantGroups(prev => { const cp = [...prev]; cp[gi].variants[vi].name = e.target.value; return cp; })}
                          className="px-2 py-1 border rounded w-full md:w-48"
                        />
                        <input
                          type="number"
                          placeholder="Price (optional)"
                          value={vv.price}
                          onChange={(e) => setVariantGroups(prev => { const cp = [...prev]; cp[gi].variants[vi].price = e.target.value; return cp; })}
                          className="px-2 py-1 border rounded w-full md:w-32"
                          min="0"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={vv.stock}
                          onChange={(e) => setVariantGroups(prev => { const cp = [...prev]; cp[gi].variants[vi].stock = e.target.value; return cp; })}
                          className="px-2 py-1 border rounded w-full md:w-24"
                          min="0"
                        />
                        <select
                          value={vv.imageIndex || ''}
                          onChange={(e) => setVariantGroups(prev => { const cp = [...prev]; cp[gi].variants[vi].imageIndex = e.target.value; return cp; })}
                          className="px-2 py-1 border rounded w-full md:w-40"
                        >
                          <option value="">Use product default image</option>
                          <option value="1">Placeholder 1</option>
                          <option value="2">Placeholder 2</option>
                          <option value="3">Placeholder 3</option>
                          <option value="4">Placeholder 4</option>
                          <option value="5">Placeholder 5</option>
                          <option value="6">Placeholder 6</option>
                          <option value="7">Placeholder 7</option>
                          <option value="8">Placeholder 8</option>
                          <option value="9">Placeholder 9</option>
                          <option value="10">Placeholder 10</option>
                        </select>
                        {/* Preview for selected placeholder image */}
                        <div className="w-20 h-20 flex items-center justify-center border rounded text-xs text-gray-500">
                          {vv.imageIndex ? (
                            (() => {
                              const sel = parseInt(vv.imageIndex, 10) - 1;
                              const imgs = [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10];
                              const file = imgs[sel];
                              if (file) {
                                try {
                                  return <img className="w-20 h-20 object-cover rounded" src={URL.createObjectURL(file)} alt="variant" />;
                                } catch (e) {
                                  return <div className="text-xs">Preview</div>;
                                }
                              }
                              return <div className="text-xs text-gray-400">No image</div>;
                            })()
                          ) : (
                            <div className="text-xs text-gray-400">No image</div>
                          )}
                        </div>
                        <input
                          type="number"
                          placeholder="Discount %"
                          value={vv.discount || ''}
                          onChange={(e) => setVariantGroups(prev => { const cp = [...prev]; cp[gi].variants[vi].discount = e.target.value; return cp; })}
                          className="px-2 py-1 border rounded w-full md:w-32"
                          min="0"
                          max="100"
                        />
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setVariantGroups(prev => { const cp = [...prev]; cp[gi].variants.splice(vi,1); return cp; })} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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