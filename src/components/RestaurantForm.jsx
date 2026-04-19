import { useState } from 'react'
import MenuItemCard from './MenuItemCard'
import { doualaAreas, initialFormData, initialMenuItem } from '../constants'
import { uploadToCloudinary, createRestaurant, createMenuItems } from '../api'
import '../App.css'
function RestaurantForm() {
  const [formData, setFormData] = useState(initialFormData)
  const [menuItems, setMenuItems] = useState([{ ...initialMenuItem }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

      const handleChange = (event) => {
      const { name, value, type, checked, files } = event.target

    if (name === 'image') {
      console.log('selected files:', files)
      console.log('first file:', files?.[0])
      setFormData((prev) => ({ ...prev, image: files?.[0] ?? null }))
      
      return
    }

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'address' && value !== 'Other' ? { manualAddress: '' } : {})
    }))
  }

  const handleMenuItemChange = (index, event) => {
    const { name, value, type, checked, files } = event.target
    setMenuItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        if (name === 'image') return { ...item, image: files?.[0] ?? null }
        return { ...item, [name]: type === 'checkbox' ? checked : value }
      })
    )
  }

  const addMenuItem = () => setMenuItems((prev) => [...prev, { ...initialMenuItem }])

  const removeMenuItem = (index) =>
    setMenuItems((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitMessage('')
    setSuccessMessage('')

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      setSubmitMessage(
        'Missing Cloudinary setup. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file, then restart the dev server.'
      )
      return
    }

    console.log('Submitting form with data:', formData, 'and menu items:', menuItems)

    if (!formData.image) {
      setSubmitMessage('Please select an image before submitting.')
      return
    }

    try {
      setIsSubmitting(true)

      const image_url = await uploadToCloudinary(formData.image, cloudName, uploadPreset)

      const restaurantPayload = {
        restaurant_name: formData.restaurantName,
        cuisine: formData.cuisine,
        rating: Number(formData.rating),
        address: formData.address === 'Other' ? formData.manualAddress : formData.address,
        delivery_fee: Number(formData.deliveryFee),
        delivery_time_minutes: Number(formData.deliveryTimeMinutes),
        is_open: formData.is_open,
        image_url
      }

      const restaurantData = await createRestaurant(restaurantPayload)
      const restaurantId = restaurantData.restaurant.id

      const menuItemsWithImages = await Promise.all(
        menuItems.map(async (item) => {
          let image_url = null
          if (item.image) {
            image_url = await uploadToCloudinary(item.image, cloudName, uploadPreset)
          }
          return { ...item, image_url }
        })
      )

      await createMenuItems(restaurantId, menuItemsWithImages)

      setFormData(initialFormData)
      setMenuItems([{ ...initialMenuItem }])
      
    } catch (error) {
      setSubmitMessage(error.message || 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
      setSuccessMessage('Restaurant and menu items added successfully!')
    }
  }

 

  return (
    <section className="form-page">
        <div className="page-header">
            <h1>Add Restaurant and Menu Items</h1>
        </div>
       
      <form className="data-form" onSubmit={handleSubmit}>
        <label htmlFor="restaurantName">Restaurant Name</label>
        <input
          id="restaurantName"
          name="restaurantName"
          type="text"
          value={formData.restaurantName}
          onChange={handleChange}
          required
        />

        <label htmlFor="cuisine">Cuisine</label>
        <select
          id="cuisine"
          name="cuisine"
          value={formData.cuisine}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select cuisine</option>
          <option value="Traditional">Traditional</option>
          <option value="African">African</option>
          <option value="European">European</option>
          <option value="Locals dishes">Locals dishes</option>
        </select>

        <label htmlFor="image">Image</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleChange}
          required
        />

        <label htmlFor="rating">Rating</label>
        <input
          id="rating"
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={formData.rating}
          onChange={handleChange}
          required
        />

        <label htmlFor="address">Address (Douala area)</label>
        <select
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select area</option>
          {doualaAreas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
          <option value="Other">Other (type manually)</option>
        </select>

        {formData.address === 'Other' && (
          <>
            <label htmlFor="manualAddress">Full Address</label>
            <input
              id="manualAddress"
              name="manualAddress"
              type="text"
              placeholder="Enter full Douala address"
              value={formData.manualAddress}
              onChange={handleChange}
              required
            />
          </>
        )}

        <label htmlFor="deliveryFee">Delivery Fee (XAF)</label>
        <input
          id="deliveryFee"
          name="deliveryFee"
          type="number"
          min="0"
          step="1"
          value={formData.deliveryFee}
          onChange={handleChange}
          required
        />

        <label htmlFor="deliveryTimeMinutes">Delivery Time (minutes)</label>
        <input
          id="deliveryTimeMinutes"
          name="deliveryTimeMinutes"
          type="number"
          min="1"
          step="1"
          value={formData.deliveryTimeMinutes}
          onChange={handleChange}
          required
        />

        <div className="checkbox-row">
          <input
            id="is_open"
            name="is_open"
            type="checkbox"
            checked={formData.is_open}
            onChange={handleChange}
          />
          <label htmlFor="is_open">Restaurant Open</label>
        </div>

        <hr className="section-divider" />
        <div className="section-header-row">
          <h3 className="section-heading">Menu Items</h3>
          <button type="button" className="add-item-btn" onClick={addMenuItem}>
            + Add Menu Item
          </button>
        </div>

        {menuItems.map((item, index) => (
          <MenuItemCard
            key={index}
            index={index}
            item={item}
            totalItems={menuItems.length}
            onChange={(e) => handleMenuItemChange(index, e)}
            onRemove={() => removeMenuItem(index)}
          />
        ))}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Uploading...' : 'Save'}
          </button>
        
        </div>

        {submitMessage && <p className="form-message">{submitMessage}</p>}
        {successMessage && <p className="form-success-message">{successMessage}</p>}
      </form>
    </section>
  )
}

export default RestaurantForm
