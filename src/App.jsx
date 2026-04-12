import { useState } from 'react'
import './App.css'

const doualaAreas = [
  'Akwa',
  'Bali',
  'Bonaberi',
  'Bonadouma',
  'Bonadibong',
  'Bonamoussadi',
  'Bonanjo',
  'Bonapriso',
  'Bassa',
  'Beedi',
  'Cite Cicam',
  'Cite des Palmiers',
  'Deido',
  'Dibom',
  'Dibamba',
  'Dakar',
  'Dogbong',
  'Kotto',
  'Logbaba',
  'Makepe',
  'Mboppi',
  'Ndogbong',
  'Ndoghem',
  'Ndogpassi',
  'New Bell',
  'Nkongmondo',
  'PK 8',
  'PK 9',
  'PK 10',
  'PK 11',
  'PK 12',
  'PK 13',
  'PK 14',
  'PK 15',
  'Santa Barbara',
  'Village',
  'Yassa',
  'Youpwe'
]

const initialFormData = {
  restaurantName: '',
  cuisine: '',
  image: null,
  rating: '',
  deliveryFee: '',
  deliveryTimeMinutes: '',
  is_open: true,
  address: '',
  manualAddress: '',
  menuName: '',
  description: '',
  price: '',
  is_available: true
}

function App() {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [formData, setFormData] = useState(initialFormData)

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target

    if (name === 'image') {
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

  const handleSubmit = (event) => {
    event.preventDefault()

    setSubmitMessage('')

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      console.log("cloudName:", cloudName, "uploadPreset:", uploadPreset)
      // setSubmitMessage('Missing Cloudinary setup. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file, then restart the dev server.')
      return
    }

    if (!formData.image) {
      setSubmitMessage('Please select an image before submitting.')
      return
    }

    const uploadImage = async () => {
      const uploadFormData = new FormData()
      uploadFormData.append('file', formData.image)
      uploadFormData.append('upload_preset', uploadPreset)

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: uploadFormData
        }
      )

      if (!uploadResponse.ok) {
        throw new Error('Image upload failed')
      }

      const uploadResult = await uploadResponse.json()
      return uploadResult.secure_url
    }

    const submitRestaurant = async () => {
      try {
        setIsSubmitting(true)
        const imageUrl = await uploadImage()

        const restaurantPayload = {
          restaurantName: formData.restaurantName,
          cuisine: formData.cuisine,
          rating: Number(formData.rating),
          address: formData.address === 'Other' ? formData.manualAddress : formData.address,
          delivery_fee: Number(formData.deliveryFee),
          delivery_time_minutes: Number(formData.deliveryTimeMinutes),
          is_open: formData.is_open,
          imageUrl
        }

        // STEP 1: Post restaurant to your backend. Replace URL with your real endpoint.
        // Expected response: { id: <restaurant_id>, ...rest }
        const restaurantResponse = await fetch('http://localhost:5000/api/restaurants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(restaurantPayload)
        })
        console.log('Restaurant response status:', restaurantResponse.status)

        if (!restaurantResponse.ok) {
          throw new Error('Failed to save restaurant')
        }

        const restaurantData = await restaurantResponse.json()
        const restaurantId = restaurantData.restaurant.id
        console.log('Restaurant ID:', restaurantId)


        const menuPayload = {
          restaurant_id: restaurantId,
          menuName: formData.menuName,
          description: formData.description,
          price: Number(formData.price),
          is_available: formData.is_available
        }

        // STEP 2: Post menu linked to the restaurant via restaurant_id.
        // Replace URL with your real endpoint.
        const menuResponse = await fetch('http://localhost:5000/api/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(menuPayload)
        })

        if (!menuResponse.ok) {
          throw new Error('Failed to save menu')
        }

        console.log('Restaurant payload:', restaurantPayload)
        console.log('Menu payload:', menuPayload)
        setFormData(initialFormData)
        setShowForm(false)
        setSubmitMessage('')
      } catch (error) {
        setSubmitMessage(error.message || 'Submission failed. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }

    submitRestaurant()
  }

  return (
    <div className="app">
      <header className="header">
        <h1>MBOLO EATS DASHBOARD</h1>
      </header>
      <main className="main">
        {!showForm ? (
          <section className="home">
            <p>Welcome to the Mbolo Eats admin dashboard.</p>
            <hr className="divider" />
            <button className="primary-btn" onClick={() => setShowForm(true)}>
              Add Data
            </button>
          </section>
        ) : (
          <section className="form-page">
            <h2>Add Data Form</h2>
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
                <option value="" disabled>
                  Select cuisine
                </option>
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
                <option value="" disabled>
                  Select area
                </option>
                {doualaAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
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
              <h3 className="section-heading">Menu Details</h3>

              <label htmlFor="menuName">Menu Name</label>
              <input
                id="menuName"
                name="menuName"
                type="text"
                value={formData.menuName}
                onChange={handleChange}
                required
              />

              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
              />

              <label htmlFor="price">Price (XAF)</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={handleChange}
                required
              />
              <div className="checkbox-row">
                <input
                  id="is_available"
                  name="is_available"
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={handleChange}
                />
                <label htmlFor="is_available">Available</label>
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Save'}
                </button>
                <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>
                  Back
                </button>
              </div>

              {submitMessage && <p className="form-message">{submitMessage}</p>}
            </form>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
