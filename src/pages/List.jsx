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
    description: '',
    discount: '',
    category: '',
    subCategory: '',
    images: [null, null, null, null, null, null, null, null, null, null], // each slot: { url, file }
    manufacturerDetails: '',
    manufacturerLabel: 'Manufacturer Details'
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
          const products = res.data.products;
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
      description: product.description || '',
      price: product.price,
      discount: product.discount || 0,
      category: product.category,
      subCategory: product.subCategory,
      // load variantGroups for editing
      variantGroups: product.variantGroups && product.variantGroups.length > 0 ? product.variantGroups : [{ label: 'Flavour', variants: [] }],
      images: [
        product.image && product.image[0] ? { url: product.image[0], file: null } : null,
        product.image && product.image[1] ? { url: product.image[1], file: null } : null,
        product.image && product.image[2] ? { url: product.image[2], file: null } : null,
        product.image && product.image[3] ? { url: product.image[3], file: null } : null,
        product.image && product.image[4] ? { url: product.image[4], file: null } : null,
        product.image && product.image[5] ? { url: product.image[5], file: null } : null,
        product.image && product.image[6] ? { url: product.image[6], file: null } : null,
        product.image && product.image[7] ? { url: product.image[7], file: null } : null,
        product.image && product.image[8] ? { url: product.image[8], file: null } : null,
        product.image && product.image[9] ? { url: product.image[9], file: null } : null
      ],
      manufacturerDetails: product.manufacturerDetails || ''
      ,
      manufacturerLabel: product.manufacturerLabel || 'Manufacturer Details'
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      const updateData = new FormData();
      updateData.append('id', selectedProduct._id);
      updateData.append('name', formData.name);
  updateData.append('description', formData.description);
      updateData.append('price', formData.price);
      updateData.append('discount', formData.discount);
      updateData.append('category', formData.category);
      updateData.append('subCategory', formData.subCategory);
      // include variantGroups if present
      if (formData.variantGroups) {
        updateData.append('variantGroups', JSON.stringify(formData.variantGroups));
      }
      if (formData.manufacturerDetails) updateData.append('manufacturerDetails', formData.manufacturerDetails);
  if (formData.manufacturerLabel) updateData.append('manufacturerLabel', formData.manufacturerLabel);

      // Append only new/changed images and keep track of which ones to keep
      formData.images.forEach((imgObj, idx) => {
        if (imgObj && imgObj.file) {
          // send the uploaded file under imageN
          updateData.append(`image${idx + 1}`, imgObj.file);
        } else if (imgObj === null) {
          // Mark for removal of that slot
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
              // Prefer backend returned product.image if available (newer and ordered with slots)
              const updatedProduct = res.data.product || {};
              const updatedImages = Array.isArray(updatedProduct.image) ? updatedProduct.image : item.image;
              return {
                ...item,
                name: formData.name,
                description: formData.description,
                price: formData.price,
                discount: formData.discount,
                category: formData.category,
                subCategory: formData.subCategory,
                image: updatedImages,
                variantGroups: formData.variantGroups || item.variantGroups
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
              <div>
                <p className="font-medium">{item.name}</p>
                {item.manufacturerDetails && <p className="text-xs text-gray-500">{item.manufacturerDetails}</p>}
              </div>
              <p className="hidden md:block">{item.category}</p>
              <p className="hidden md:block">{item.subCategory}</p>
              <p>
                {item.discount > 0 && item.price ? (
                  <>
                    <span className="line-through text-gray-500">{currency}{item.price}</span>{' '}
                    <span className="text-blue-600 font-semibold">
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
                className="text-blue-600 border border-blue-600 px-2 py-1 text-xs rounded hover:bg-blue-600 hover:text-white transition"
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-[95%] max-w-4xl shadow-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-semibold text-[#052659] mb-4">Edit Product</h2>
            <div className="flex flex-col gap-3">

              {/* Images */}
              <p className="text-sm font-medium text-gray-700">Product Images</p>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((imgObj, idx) => (
                  <div key={idx} className="relative">
                    {imgObj ? (
                      <img
                        className="w-20 h-20 object-cover border rounded"
                        src={imgObj.url}
                        alt=""
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center border rounded text-xs text-gray-500">No image</div>
                    )}
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

              {/* Description */}
              <label className="text-sm font-medium text-gray-700">Description:</label>
              <textarea
                className="border px-3 py-2 rounded"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              {/* Manufacturer Details */}
              <label className="text-sm font-medium text-gray-700 mt-2">Manufacturer Label:</label>
              <input className="border px-3 py-2 rounded w-full max-w-sm mb-2" value={formData.manufacturerLabel} onChange={e => setFormData({ ...formData, manufacturerLabel: e.target.value })} />
              <label className="text-sm font-medium text-gray-700 mt-2">Manufacturer Details (optional):</label>
              <textarea
                className="border px-3 py-2 rounded"
                rows={2}
                value={formData.manufacturerDetails}
                onChange={e => setFormData({ ...formData, manufacturerDetails: e.target.value })}
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

              {/* Variant Groups Editor */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700">Variant Groups</p>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">Edit variant labels and variants for this product.</p>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, variantGroups: [...(prev.variantGroups||[]), { label: 'New Group', variants: [] }] }))} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">➕ Add Group</button>
                </div>
                <div className="space-y-3">
                  {(formData.variantGroups || []).map((g, gi) => (
                    <div key={gi} className="p-3 border border-gray-200 rounded min-w-0">
                      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center mb-2">
                        <input type="text" value={g.label} onChange={(e) => setFormData(prev => { const cp = [...(prev.variantGroups||[])]; cp[gi].label = e.target.value; return { ...prev, variantGroups: cp }; })} className="px-3 py-2 border border-gray-300 rounded w-full md:w-48 min-w-0" />
                        <button type="button" onClick={() => setFormData(prev => { const cp = [...(prev.variantGroups||[])]; cp.splice(gi,1); return { ...prev, variantGroups: cp }; })} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Remove Group</button>
                      </div>

                      <div className="mb-2">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                          <p className="text-sm text-gray-600">Variants for "{g.label || 'Group'}"</p>
                          <button type="button" onClick={() => setFormData(prev => { const cp = [...(prev.variantGroups||[])]; cp[gi].variants = cp[gi].variants || []; cp[gi].variants.push({ name: '', price: '', stock: '', imageIndex: '', discount: '' }); return { ...prev, variantGroups: cp }; })} className="px-2 py-1 bg-blue-600 text-white rounded text-xs mt-2 md:mt-0">➕ Add Variant</button>
                        </div>

                        <div className="space-y-2 mt-2">
                          {(g.variants || []).map((vv, vi) => (
                            <div key={vi} className="flex flex-col md:flex-row gap-2 items-start md:items-center min-w-0">
                              <input type="text" placeholder="Variant name (e.g. Chocolate)" value={vv.name} onChange={(e) => setFormData(prev => { const cp = [...(prev.variantGroups||[])]; cp[gi].variants[vi].name = e.target.value; return { ...prev, variantGroups: cp }; })} className="px-2 py-1 border rounded w-full md:w-48 min-w-0" />
                              <input type="number" placeholder="Price (optional)" value={vv.price} onChange={(e) => setFormData(prev => { const cp = [...(prev.variantGroups||[])]; cp[gi].variants[vi].price = e.target.value; return { ...prev, variantGroups: cp }; })} className="px-2 py-1 border rounded w-full md:w-32 min-w-0" min="0" />
                              <input type="number" placeholder="Stock" value={vv.stock} onChange={(e) => setFormData(prev => { const cp = [...(prev.variantGroups||[])]; cp[gi].variants[vi].stock = e.target.value; return { ...prev, variantGroups: cp }; })} className="px-2 py-1 border rounded w-full md:w-24 min-w-0" min="0" />
                              <select value={vv.imageIndex || ''} onChange={(e) => setFormData(prev => { const cp = [...(prev.variantGroups||[])]; cp[gi].variants[vi].imageIndex = e.target.value; return { ...prev, variantGroups: cp }; })} className="px-2 py-1 border rounded w-full md:w-40 min-w-0">
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
                              {/* Preview for selected placeholder image using formData.images */}
                              <div className="w-20 h-20 flex flex-col items-center justify-center border rounded text-xs text-gray-500">
                                {(() => {
                                  const imgs = formData.images || [];
                                  // compute selected index: if user explicitly selected a placeholder, use it, otherwise default to 0
                                  const sel = (vv && vv.imageIndex) ? Math.max(0, parseInt(vv.imageIndex, 10) - 1) : 0;

                                  let src = null;
                                  let sourceLabel = 'none';

                                  // prefer uploaded/edited image from formData
                                  const imgObj = imgs[sel];
                                  if (imgObj) {
                                    if (imgObj.url) {
                                      src = imgObj.url;
                                      sourceLabel = `uploaded (slot ${sel + 1})`;
                                    } else if (imgObj.file) {
                                      try {
                                        src = URL.createObjectURL(imgObj.file);
                                        sourceLabel = `uploaded-file (slot ${sel + 1})`;
                                      } catch (e) {
                                        src = null;
                                      }
                                    }
                                  }

                                  // fallback to saved product image
                                  if (!src && selectedProduct && Array.isArray(selectedProduct.image) && selectedProduct.image[sel]) {
                                    src = `${selectedProduct.image[sel]}?t=${Date.now()}`;
                                    sourceLabel = `saved (slot ${sel + 1})`;
                                  }

                                  if (src) {
                                    return (
                                      <>
                                        <img className="w-20 h-16 object-cover rounded" src={src} alt="variant" />
                                        <div className="text-[10px] text-gray-400 mt-1">{sourceLabel}</div>
                                      </>
                                    );
                                  }

                                  return (
                                    <>
                                      <div className="w-20 h-16 flex items-center justify-center text-xs text-gray-400">No image</div>
                                      <div className="text-[10px] text-gray-400 mt-1">{`slot ${sel + 1}`}</div>
                                    </>
                                  );
                                })()}
                              </div>
                              <input type="number" placeholder="Discount %" value={vv.discount || ''} onChange={(e) => setFormData(prev => { const cp = [...(prev.variantGroups||[])]; cp[gi].variants[vi].discount = e.target.value; return { ...prev, variantGroups: cp }; })} className="px-2 py-1 border rounded w-full md:w-32 min-w-0" min="0" max="100" />
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setFormData(prev => { const cp = [...(prev.variantGroups||[])]; cp[gi].variants.splice(vi,1); return { ...prev, variantGroups: cp }; })} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Remove</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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