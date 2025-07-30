import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    discount: '',
    category: '',
    subCategory: ''
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
      const response = await axios.get(`${backendUrl}/api/product/list?timestamp=${Date.now()}`);
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Error fetching products');
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Error removing product');
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      discount: product.discount || 0,
      category: product.category,
      subCategory: product.subCategory
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      const body = {
        id: selectedProduct._id,
        ...formData,
        discount: Number(formData.discount),
        price: Number(formData.price)
      };

      const response = await axios.put(`${backendUrl}/api/product/update`, body, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success('Product updated successfully');
        setShowModal(false);

        // Optimistic update without relying on discountedPrice
        setList(prevList =>
          prevList.map(item =>
            item._id === selectedProduct._id ? { ...item, ...body } : item
          )
        );

        await fetchList(); // sync with server
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Error updating product');
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="w-full bg-white p-4 rounded shadow">
      <p className="mb-4 text-[#052659] text-lg font-bold">All Supplements List</p>

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

        {list.map((item, index) => (
          <div key={index} className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-2 px-3 border rounded hover:bg-gray-50 text-sm transition">
            <img className="w-12 h-12 object-cover rounded" src={item.image[0]} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{item.subCategory}</p>
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
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-[#052659] mb-4">Edit Product</h2>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">Name:</label>
              <input
                type="text"
                className="border px-3 py-2 rounded"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />

              <label className="text-sm font-medium text-gray-700">Main Category:</label>
              <select
                className="border px-3 py-2 rounded"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {mainCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <label className="text-sm font-medium text-gray-700">Subcategory:</label>
              <select
                className="border px-3 py-2 rounded"
                value={formData.subCategory}
                onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
              >
                {subCategories.map(subCat => (
                  <option key={subCat} value={subCat}>{subCat}</option>
                ))}
              </select>

              <label className="text-sm font-medium text-gray-700">Price:</label>
              <input
                type="number"
                className="border px-3 py-2 rounded"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
{/* 
              <label className="text-sm font-medium text-gray-700">Description:</label>
              <textarea
                className="border px-3 py-2 rounded"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              /> */}

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
                <button 
                  type="button" 
                  className="bg-gray-300 px-4 py-2 rounded" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="bg-[#052659] text-white px-4 py-2 rounded" 
                  onClick={handleUpdate}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
