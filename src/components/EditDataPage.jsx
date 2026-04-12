import { useState, useEffect } from 'react'
import {
  getRestaurants,
  getMenusByRestaurant,
  deleteRestaurant,
  deleteMenuItem,
  updateRestaurant,
  updateMenuItem,
  uploadToCloudinary,
} from '../api'
import { doualaAreas } from '../constants'

function EditDataPage({ onBack }) {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [modal, setModal] = useState(null) // { type: 'restaurant' | 'menuItem', data: {} }
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    try {
      setLoading(true)
      setPageError('')
      const raw = await getRestaurants()
      const list = Array.isArray(raw) ? raw : (raw.restaurants ?? [])

      const withMenus = await Promise.all(
        list.map(async (r) => {
          try {
            const menuRaw = await getMenusByRestaurant(r.id)
            const menus = Array.isArray(menuRaw) ? menuRaw : (menuRaw.menus ?? [])
            return { ...r, menus }
          } catch {
            return { ...r, menus: [] }
          }
        }),
      )
      setRestaurants(withMenus)
    } catch (err) {
      setPageError(err.message || 'Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteRestaurant(id) {
    if (!window.confirm('Delete this restaurant and all its menu items?')) return
    try {
      await deleteRestaurant(id)
      setRestaurants((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDeleteMenuItem(restaurantId, menuItemId) {
    if (!window.confirm('Delete this menu item?')) return
    try {
      await deleteMenuItem(menuItemId)
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === restaurantId
            ? { ...r, menus: r.menus.filter((m) => m.id !== menuItemId) }
            : r,
        ),
      )
    } catch (err) {
      alert(err.message)
    }
  }

  function openEditRestaurant(restaurant) {
    const isKnownArea = doualaAreas.includes(restaurant.address)
    setModal({
      type: 'restaurant',
      data: {
        id: restaurant.id,
        restaurant_name: restaurant.restaurant_name ?? '',
        cuisine: restaurant.cuisine ?? '',
        rating: String(restaurant.rating ?? ''),
        address: isKnownArea ? restaurant.address : 'Other',
        manualAddress: isKnownArea ? '' : (restaurant.address ?? ''),
        delivery_fee: String(restaurant.delivery_fee ?? ''),
        delivery_time_minutes: String(restaurant.delivery_time_minutes ?? ''),
        is_open: restaurant.is_open ?? true,
        image_url: restaurant.image_url ?? '',
        newImage: null,
      },
    })
    setModalError('')
  }

  function openEditMenuItem(menuItem) {
    setModal({
      type: 'menuItem',
      data: {
        id: menuItem.id,
        restaurant_id: menuItem.restaurant_id,
        menu_name: menuItem.menu_name ?? '',
        description: menuItem.description ?? '',
        price: String(menuItem.price ?? ''),
        is_available: menuItem.is_available ?? true,
      },
    })
    setModalError('')
  }

  function handleModalChange(e) {
    const { name, value, type, checked, files } = e.target
    setModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [name]:
          type === 'checkbox'
            ? checked
            : type === 'file'
              ? files?.[0] ?? null
              : value,
        ...(name === 'address' && value !== 'Other' ? { manualAddress: '' } : {}),
      },
    }))
  }

  async function handleSaveRestaurant(e) {
    e.preventDefault()
    setSaving(true)
    setModalError('')
    try {
      const { id, newImage, image_url, address, manualAddress, ...rest } = modal.data

      let finalImageUrl = image_url
      if (newImage) {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        finalImageUrl = await uploadToCloudinary(newImage, cloudName, uploadPreset)
      }

      const payload = {
        restaurant_name: rest.restaurant_name,
        cuisine: rest.cuisine,
        rating: Number(rest.rating),
        address: address === 'Other' ? manualAddress : address,
        delivery_fee: Number(rest.delivery_fee),
        delivery_time_minutes: Number(rest.delivery_time_minutes),
        is_open: rest.is_open,
        image_url: finalImageUrl,
      }

      await updateRestaurant(id, payload)

      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, ...payload } : r,
        ),
      )
      setModal(null)
    } catch (err) {
      setModalError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveMenuItem(e) {
    e.preventDefault()
    setSaving(true)
    setModalError('')
    try {
      const { id, restaurant_id, price, ...rest } = modal.data

      const payload = {
        menu_name: rest.menu_name,
        description: rest.description,
        price: Number(price),
        is_available: rest.is_available,
      }

      await updateMenuItem(id, payload)

      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === restaurant_id
            ? {
                ...r,
                menus: r.menus.map((m) =>
                  m.id === id ? { ...m, ...payload } : m,
                ),
              }
            : r,
        ),
      )
      setModal(null)
    } catch (err) {
      setModalError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="edit-data-page">
      <div className="edit-page-header">
        <h2>All Restaurants</h2>
        <button type="button" className="secondary-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      {loading && <p className="loading-text">Loading…</p>}
      {pageError && <p className="form-message">{pageError}</p>}
      {!loading && !pageError && restaurants.length === 0 && (
        <p className="empty-text">No restaurants found.</p>
      )}

      <div className="restaurant-list">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="restaurant-card">
            <div className="restaurant-card-header">
              <div className="restaurant-info">
                {restaurant.image_url && (
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.restaurant_name}
                    className="restaurant-thumb"
                  />
                )}
                <div className="restaurant-details">
                  <h3>{restaurant.restaurant_name}</h3>
                  <p className="restaurant-meta">
                    {restaurant.cuisine} &middot; {restaurant.address}
                  </p>
                  <p className="restaurant-meta">
                    &#11088; {restaurant.rating} &nbsp;&middot;&nbsp; XAF{' '}
                    {restaurant.delivery_fee} delivery &nbsp;&middot;&nbsp;{' '}
                    {restaurant.delivery_time_minutes} min
                  </p>
                  <span
                    className={`status-badge ${restaurant.is_open ? 'badge-open' : 'badge-closed'}`}
                  >
                    {restaurant.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
              <div className="card-actions">
                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => openEditRestaurant(restaurant)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDeleteRestaurant(restaurant.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="menu-section">
              <p className="menu-section-title">
                Menu Items ({restaurant.menus.length})
              </p>
              {restaurant.menus.length === 0 && (
                <p className="empty-text">No menu items.</p>
              )}
              {restaurant.menus.map((item) => (
                <div key={item.id} className="menu-item-row">
                  <div className="menu-item-info">
                    <span className="menu-item-name">{item.menu_name}</span>
                    <span className="menu-item-desc">{item.description}</span>
                    <span className="menu-item-price">XAF {item.price}</span>
                    <span
                      className={`status-badge small ${item.is_available ? 'badge-open' : 'badge-closed'}`}
                    >
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="edit-btn small"
                      onClick={() => openEditMenuItem(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-btn small"
                      onClick={() => handleDeleteMenuItem(restaurant.id, item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null)
          }}
        >
          <div className="modal-box">
            <div className="modal-header">
              <h3>
                {modal.type === 'restaurant' ? 'Edit Restaurant' : 'Edit Menu Item'}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModal(null)}
              >
                &times;
              </button>
            </div>

            {modal.type === 'restaurant' ? (
              <form className="data-form" onSubmit={handleSaveRestaurant}>
                <label htmlFor="edit-restaurant-name">Restaurant Name</label>
                <input
                  id="edit-restaurant-name"
                  name="restaurant_name"
                  type="text"
                  value={modal.data.restaurant_name}
                  onChange={handleModalChange}
                  required
                />

                <label htmlFor="edit-cuisine">Cuisine</label>
                <select
                  id="edit-cuisine"
                  name="cuisine"
                  value={modal.data.cuisine}
                  onChange={handleModalChange}
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

                <label htmlFor="edit-rating">Rating</label>
                <input
                  id="edit-rating"
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={modal.data.rating}
                  onChange={handleModalChange}
                  required
                />

                <label htmlFor="edit-address">Address (Douala area)</label>
                <select
                  id="edit-address"
                  name="address"
                  value={modal.data.address}
                  onChange={handleModalChange}
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
                  <option value="Other">Other (specify below)</option>
                </select>
                {modal.data.address === 'Other' && (
                  <>
                    <label htmlFor="edit-manualAddress">Specify Address</label>
                    <input
                      id="edit-manualAddress"
                      name="manualAddress"
                      type="text"
                      value={modal.data.manualAddress}
                      onChange={handleModalChange}
                      required
                    />
                  </>
                )}

                <label htmlFor="edit-delivery-fee">Delivery Fee (XAF)</label>
                <input
                  id="edit-delivery-fee"
                  name="delivery_fee"
                  type="number"
                  min="0"
                  value={modal.data.delivery_fee}
                  onChange={handleModalChange}
                  required
                />

                <label htmlFor="edit-delivery-time">
                  Delivery Time (minutes)
                </label>
                <input
                  id="edit-delivery-time"
                  name="delivery_time_minutes"
                  type="number"
                  min="1"
                  value={modal.data.delivery_time_minutes}
                  onChange={handleModalChange}
                  required
                />

                <div className="checkbox-row">
                  <input
                    id="edit-is-open"
                    name="is_open"
                    type="checkbox"
                    checked={modal.data.is_open}
                    onChange={handleModalChange}
                  />
                  <label htmlFor="edit-is-open">Is Open</label>
                </div>

                <label htmlFor="edit-new-image">Replace Image (optional)</label>
                <input
                  id="edit-new-image"
                  name="newImage"
                  type="file"
                  accept="image/*"
                  onChange={handleModalChange}
                />

                {modalError && <p className="form-message">{modalError}</p>}

                <div className="modal-actions">
                  <button type="submit" className="primary-btn" disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form className="data-form" onSubmit={handleSaveMenuItem}>
                <label htmlFor="edit-menu-name">Menu Name</label>
                <input
                  id="edit-menu-name"
                  name="menu_name"
                  type="text"
                  value={modal.data.menu_name}
                  onChange={handleModalChange}
                  required
                />

                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  value={modal.data.description}
                  onChange={handleModalChange}
                  required
                />

                <label htmlFor="edit-price">Price (XAF)</label>
                <input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="0"
                  value={modal.data.price}
                  onChange={handleModalChange}
                  required
                />

                <div className="checkbox-row">
                  <input
                    id="edit-is-available"
                    name="is_available"
                    type="checkbox"
                    checked={modal.data.is_available}
                    onChange={handleModalChange}
                  />
                  <label htmlFor="edit-is-available">Available</label>
                </div>

                {modalError && <p className="form-message">{modalError}</p>}

                <div className="modal-actions">
                  <button type="submit" className="primary-btn" disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default EditDataPage
