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

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mainCategory, setMainCategory] = useState('Protein'); // for UI
  const [tagCategory, setTagCategory] = useState('Popular');   // for UI
  const [bestseller, setBestseller] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price.toString());
      formData.append('category', mainCategory);         // sent as 'category'
      formData.append('subCategory', tagCategory);       // sent as 'subCategory'
      formData.append('bestseller', bestseller.toString());

      if (image1) formData.append('image1', image1);
      if (image2) formData.append('image2', image2);
      if (image3) formData.append('image3', image3);
      if (image4) formData.append('image4', image4);

      const response = await axios.post(`${backendUrl}/api/product/add`, formData, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        // reset form
        setName('');
        setDescription('');
        setPrice('');
        setMainCategory('Protein');
        setTagCategory('Popular');
        setBestseller(false);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-4 bg-white p-4 rounded shadow">
      {/* Upload Images */}
      <div>
        <p className="mb-2 text-[#052659] font-medium">Upload Product Images</p>
        <div className="flex gap-2">
          {[image1, image2, image3, image4].map((img, index) => (
            <label key={index} htmlFor={`image${index + 1}`}>
              <img
                className="w-20 h-20 object-cover border rounded"
                src={!img ? assets.upload_area : URL.createObjectURL(img)}
                alt=""
              />
              <input
                type="file"
                id={`image${index + 1}`}
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (index === 0) setImage1(file);
                  if (index === 1) setImage2(file);
                  if (index === 2) setImage3(file);
                  if (index === 3) setImage4(file);
                }}
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
          className="w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659]"
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
          className="w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659]"
        />
      </div>

      {/* Category + Tag + Price */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">

        {/* Category */}
        <div>
          <p className="mb-2 text-[#052659] font-medium">Main Category</p>
          <select
            value={mainCategory}
            onChange={(e) => setMainCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659]"
          >
            <option value="Protein">Protein</option>
            <option value="Creatine">Creatine</option>
            <option value="BCAA">BCAA</option>
            <option value="Mass Gainer">Mass Gainer</option>
            <option value="Pre Workout">Pre Workout</option>
            <option value="Post Workout">Post Workout</option>
            <option value="Vitamins">Vitamins</option>
          </select>
        </div>

        {/* Tag */}
        <div>
          <p className="mb-2 text-[#052659] font-medium">Tag</p>
          <select
            value={tagCategory}
            onChange={(e) => setTagCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659]"
          >
            <option value="Popular">Popular</option>
            <option value="Just Launched">Just Launched</option>
            <option value="Editor's Choice">Editor's Choice</option>
            <option value="Trending">Trending</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <p className="mb-2 text-[#052659] font-medium">Price (₹)</p>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price in INR"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659]"
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
        />
        <label htmlFor="bestseller" className="text-[#052659] cursor-pointer">Mark as Bestseller</label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-32 py-2 mt-4 bg-[#052659] hover:bg-[#041d47] text-white rounded transition"
      >
        Add Supplement
      </button>
    </form>
  );
};

export default Add;
