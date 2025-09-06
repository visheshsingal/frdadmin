import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount: '',
    category: '',
    subCategory: '',
    images: [null, null, null, null] // each slot: { url, file }
  });

  const mainCategories = [
    'Protein', 'Creatine', 'BCAA', 'Mass Gainer',
    'Pre Workout', 'Post Workout', 'Vitamins'
  ];

  const subCategories = [
    'Popular', 'Just Launched', "Editor's Choice", 'Trending'
  ];

  const fetchList = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/product/list?timestamp=${Date.now()}`);
      if (res.data.success) {
        const products = res.data.products.reverse();
        setList(products);
        setFilteredList(products);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching products');
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery) {
      const filtered = list.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subCategory.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredList(filtered);
    } else {
      setFilteredList(list);
    }
  }, [searchQuery, list]);

  const removeProduct = async (id) => {
    try {
      const res = await axios.post(`${backendUrl}/api/product/remove`, { id }, { headers: { token } });
      if (res.data.success) {
        toast.success(res.data.message);
        await fetchList();
      } else toast.error(res.data.message);
    } catch (err) {
      toast.error('Error removing product');
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      discount: product.discount || 0,
      category: product.category,
      subCategory: product.subCategory,
      images: [
        product.image && product.image[0] ? { url: product.image[0], file: null } : null,
        product.image && product.image[1] ? { url: product.image[1], file: null } : null,
        product.image && product.image[2] ? { url: product.image[2], file: null } : null,
        product.image && product.image[3] ? { url: product.image[3], file: null } : null
      ]
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      const updateData = new FormData();
      updateData.append('id', selectedProduct._id);
      updateData.append('name', formData.name);
      updateData.append('price', formData.price);
      updateData.append('discount', formData.discount);
      updateData.append('category', formData.category);
      updateData.append('subCategory', formData.subCategory);

      // Append only new/changed images and keep track of which ones to keep
      formData.images.forEach((imgObj, idx) => {
        if (imgObj && imgObj.file) {
          updateData.append(`image${idx + 1}`, imgObj.file);
        } else if (imgObj === null) {
          // Mark for removal
          updateData.append(`removeImage${idx + 1}`, 'true');
        }
      });

      const res = await axios.put(`${backendUrl}/api/product/update`, updateData, {
        headers: { token, 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Product updated successfully');

        // Update the local list state immediately
        setList(prevList =>
          prevList.map(item => {
            if (item._id === selectedProduct._id) {
              // Use the updated images from backend response if available
              const updatedImages = res.data.updatedImages || item.image;
              return { 
                ...item, 
                name: formData.name,
                price: formData.price,
                discount: formData.discount,
                category: formData.category,
                subCategory: formData.subCategory,
                image: updatedImages 
              };
            }
            return item;
          })
        );

        setShowModal(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Error updating product');
    }
  };

  const handleImageChange = (idx, file) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[idx] = { url: URL.createObjectURL(file), file };
      return { ...prev, images: newImages };
    });
  };

  const handleImageRemove = (idx) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[idx] = null;
      return { ...prev, images: newImages };
    });
  };

  return (
    <div className="w-full bg-white p-4 rounded shadow">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <p className="text-[#052659] text-lg font-bold">All Supplements List</p>
        <div className="relative mt-2 md:mt-0">
          <input
            type="text"
            placeholder="Search products..."
            className="border px-4 py-2 rounded-lg w-full md:w-64 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center py-2 px-3 bg-[#052659] text-white text-sm font-medium rounded">
          <span>Image</span>
          <span>Name</span>
          <span>Category</span>
          <span>Subcategory</span>
          <span>Price</span>
          <span className="text-center">Action</span>
          <span className="text-center">Edit</span>
        </div>

        {filteredList.length > 0 ? (
          filteredList.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-2 px-3 border rounded hover:bg-gray-50 text-sm transition">
              <img className="w-12 h-12 object-cover rounded" src={`${item.image[0]}?t=${Date.now()}`} alt={item.name} />
              <p>{item.name}</p>
              <p className="hidden md:block">{item.category}</p>
              <p className="hidden md:block">{item.subCategory}</p>
              <p>
                {item.discount > 0 && item.price ? (
                  <>
                    <span className="line-through text-gray-500">{currency}{item.price}</span>{' '}
                    <span className="text-green-600 font-semibold">
                      {currency}{Math.round(item.price - (item.price * item.discount / 100))}
                    </span>
                  </>
                ) : (
                  <span>{currency}{item.price}</span>
                )}
              </p>
              <button
                onClick={() => removeProduct(item._id)}
                className="text-[#052659] border border-[#052659] px-2 py-1 text-xs rounded hover:bg-[#052659] hover:text-white transition"
              >
                Remove
              </button>
              <button
                onClick={() => handleEditClick(item)}
                className="text-green-600 border border-green-600 px-2 py-1 text-xs rounded hover:bg-green-600 hover:text-white transition"
              >
                Edit
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No products found matching your search' : 'No products available'}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-semibold text-[#052659] mb-4">Edit Product</h2>
            <div className="flex flex-col gap-3">

              {/* Images */}
              <p className="text-sm font-medium text-gray-700">Product Images</p>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((imgObj, idx) => (
                  <div key={idx} className="relative">
                    <img
                      className="w-20 h-20 object-cover border rounded"
                      src={imgObj ? imgObj.url : assets.upload_area}
                      alt=""
                    />
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files[0]) handleImageChange(idx, e.target.files[0]);
                      }}
                    />
                    {(imgObj && imgObj.url) && (
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        onClick={() => handleImageRemove(idx)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Name */}
              <label className="text-sm font-medium text-gray-700">Name:</label>
              <input
                type="text"
                className="border px-3 py-2 rounded"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />

              {/* Main Category */}
              <label className="text-sm font-medium text-gray-700">Main Category:</label>
              <select
                className="border px-3 py-2 rounded"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {mainCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              {/* Subcategory */}
              <label className="text-sm font-medium text-gray-700">Subcategory:</label>
              <select
                className="border px-3 py-2 rounded"
                value={formData.subCategory}
                onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
              >
                <option value="">Select Subcategory</option>
                {subCategories.map(subCat => <option key={subCat} value={subCat}>{subCat}</option>)}
              </select>

              {/* Price */}
              <label className="text-sm font-medium text-gray-700">Price:</label>
              <input
                type="number"
                className="border px-3 py-2 rounded"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />

              {/* Discount */}
              <label className="text-sm font-medium text-gray-700">Discount %:</label>
              <input
                type="number"
                min="0"
                max="100"
                className="border px-3 py-2 rounded"
                value={formData.discount}
                onChange={e => {
                  const discountValue = Math.min(100, Math.max(0, e.target.valueAsNumber || 0));
                  setFormData({ ...formData, discount: discountValue });
                }}
              />

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" className="bg-[#052659] text-white px-4 py-2 rounded" onClick={handleUpdate}>Save Changes</button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default List;