import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Add = ({ token }) => {

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Protein");
  const [subCategory, setSubCategory] = useState("Whey Protein");
  const [bestseller, setBestseller] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData()

      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)

      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)
      image4 && formData.append("image4", image4)

      const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice('')
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4 bg-white p-4 rounded shadow'>

      <div>
        <p className='mb-2 text-[#052659] font-medium'>Upload Product Images</p>
        <div className='flex gap-2'>
          {[image1, image2, image3, image4].map((img, index) => (
            <label key={index} htmlFor={`image${index + 1}`}>
              <img className='w-20 h-20 object-cover border rounded' src={!img ? assets.upload_area : URL.createObjectURL(img)} alt="" />
              <input onChange={(e) => {
                const file = e.target.files[0];
                if (index === 0) setImage1(file);
                if (index === 1) setImage2(file);
                if (index === 2) setImage3(file);
                if (index === 3) setImage4(file);
              }} type="file" id={`image${index + 1}`} hidden />
            </label>
          ))}
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2 text-[#052659] font-medium'>Supplement Name</p>
        <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659]' type="text" placeholder='e.g. Whey Protein Isolate' required />
      </div>

      <div className='w-full'>
        <p className='mb-2 text-[#052659] font-medium'>Description</p>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659]' placeholder='Brief description about the supplement' required />
      </div>

      <div className='flex flex-col sm:flex-row gap-4 w-full'>

        <div>
          <p className='mb-2 text-[#052659] font-medium'>Category</p>
          <select onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659]'>
            <option value="Protein">Protein</option>
            <option value="Pre Workout">Pre Workout</option>
            <option value="Post Workout">Post Workout</option>
            <option value="Vitamins">Vitamins</option>
          </select>
        </div>

        <div>
          <p className='mb-2 text-[#052659] font-medium'>Sub Category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659]'>
            <option value="Whey Protein">Whey Protein</option>
            <option value="Mass Gainer">Mass Gainer</option>
            <option value="BCAA">BCAA</option>
            <option value="Creatine">Creatine</option>
          </select>
        </div>

        <div>
          <p className='mb-2 text-[#052659] font-medium'>Price (₹)</p>
          <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659]' type="number" placeholder='Price in INR' />
        </div>

      </div>

      <div className='flex items-center gap-2 mt-2'>
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
        <label htmlFor="bestseller" className='text-[#052659] cursor-pointer'>Mark as Bestseller</label>
      </div>

      <button type="submit" className='w-32 py-2 mt-4 bg-[#052659] hover:bg-[#041d47] text-white rounded transition'>
        Add Supplement
      </button>

    </form>
  )
}

export default Add
