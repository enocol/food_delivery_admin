import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRestaurantsWithMenus, createMenuItems, uploadToCloudinary, deleteMenuItem, updateMenuItem } from '../api'
import { initialMenuItem } from '../constants'
import '../App.css'

function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalItems, setModalItems] = useState([{ ...initialMenuItem }])
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')
  const [editModal, setEditModal] = useState(null) // menu item being edited
  const [editForm, setEditForm] = useState({ menuName: '', description: '', price: '', is_available: true, image: null })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  async function loadRestaurant() {
    try {
      setLoading(true)
      const data = await getRestaurantsWithMenus()
      const list = Array.isArray(data) ? data : data.restaurants ?? []
      const found = list.find((r) => String(r.id) === id)
      if (!found) throw new Error('Restaurant not found')
      setRestaurant(found)
    } catch (err) {
      setError(err.message || 'Failed to load restaurant')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRestaurant()
  }, [id])

  const handleModalItemChange = (index, event) => {
    const { name, value, type, checked, files } = event.target
    setModalItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        if (name === 'image') return { ...item, image: files?.[0] ?? null }
        return { ...item, [name]: type === 'checkbox' ? checked : value }
      })
    )
  }

  const addModalItem = () => setModalItems((prev) => [...prev, { ...initialMenuItem }])

  const removeModalItem = (index) =>
    setModalItems((prev) => prev.filter((_, i) => i !== index))

  const handleModalSubmit = async (e) => {
    e.preventDefault()
    setModalError('')

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    try {
      setSubmitting(true)

      const itemsWithImages = await Promise.all(
        modalItems.map(async (item) => {
          let image_url = null
          if (item.image) {
            image_url = await uploadToCloudinary(item.image, cloudName, uploadPreset)
          }
          return { ...item, image_url }
        })
      )

      await createMenuItems(id, itemsWithImages)
      setShowModal(false)
      setModalItems([{ ...initialMenuItem }])
      await loadRestaurant()
    } catch (err) {
      setModalError(err.message || 'Failed to add menu items')
    } finally {
      setSubmitting(false)
    }
  }

  const openModal = () => {
    setModalItems([{ ...initialMenuItem }])
    setModalError('')
    setShowModal(true)
  }

  const openEditModal = (item) => {
    setEditForm({
      menuName: item.menuName || item.name || '',
      description: item.description || '',
      price: item.price ?? '',
      is_available: item.isAvailable ?? item.is_available ?? true,
      image: null,
    })
    setEditError('')
    setEditModal(item)
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked, files } = e.target
    if (name === 'image') {
      setEditForm((prev) => ({ ...prev, image: files?.[0] ?? null }))
      return
    }
    setEditForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditError('')
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    try {
      setEditSubmitting(true)
      let image_url = editModal.imageUrl || editModal.image_url || null
      if (editForm.image) {
        image_url = await uploadToCloudinary(editForm.image, cloudName, uploadPreset)
      }
      await updateMenuItem(editModal.id, {
        menu_name: editForm.menuName,
        description: editForm.description,
        price: Number(editForm.price),
        is_available: editForm.is_available,
        image_url,
      })
      setEditModal(null)
      await loadRestaurant()
    } catch (err) {
      setEditError(err.message || 'Failed to update menu item')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return
    try {
      await deleteMenuItem(itemId)
      await loadRestaurant()
    } catch (err) {
      alert(err.message || 'Failed to delete menu item')
    }
  }

  if (loading) return <p className="loading-text">Loading…</p>
  if (error) return <p className="form-message">{error}</p>
  if (!restaurant) return null

  const menus = restaurant.menus ?? restaurant.menuItems ?? []

  return (
    <div className="detail-page">
      <div className="detail-actions-bar">
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button type="button" className="btn btn-primary" onClick={openModal}>
          + Add Menu Items
        </button>
      </div>

      <div className="detail-header">
        {restaurant.imageUrl && (
          <img src={restaurant.imageUrl} alt={restaurant.name} className="detail-image" />
        )}
        <div className="detail-info">
          <h1 className="detail-name">{restaurant.name}</h1>
          <p className="detail-meta">{restaurant.cuisine}</p>
          <p className="detail-meta">⭐ {restaurant.rating}</p>
          <p className="detail-meta">📍 {restaurant.address}</p>
          <p className="detail-meta">🚚 {restaurant.deliveryFee} XAF · {restaurant.deliveryTimeMinutes} min</p>
          <span className={`status-badge ${restaurant.isOpen ? 'badge-open' : 'badge-closed'}`}>
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      <hr className="section-divider" />

      <h2 className="detail-section-title">Menu Items ({menus.length})</h2>

      {menus.length === 0 ? (
        <p className="empty-text">No menu items for this restaurant.</p>
      ) : (
        <div className="detail-menu-grid">
          {menus.map((item) => (
            <div key={item.id} className="detail-menu-card">
              {(item.imageUrl || item.image_url) && (
                <img src={item.imageUrl || item.image_url} alt={item.menuName || item.name} className="detail-menu-image" />
              )}
              <div className="detail-menu-body">
                <h3 className="detail-menu-name">{item.menuName || item.name}</h3>
                <p className="detail-menu-desc">{item.description}</p>
                <div className="detail-menu-footer">
                  <span className="detail-menu-price">{item.price} XAF</span>
                  <span className={`status-badge small ${item.isAvailable || item.is_available ? 'badge-open' : 'badge-closed'}`}>
                    {item.isAvailable || item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="detail-menu-actions">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(item)}>Edit</button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteMenuItem(item.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Menu Items</h2>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={handleModalSubmit}>
              {modalItems.map((item, index) => (
                <div key={index} className="menu-item-card">
                  <div className="menu-item-card-header">
                    <span className="menu-item-label">Item {index + 1}</span>
                    {modalItems.length > 1 && (
                      <button type="button" className="remove-item-btn" onClick={() => removeModalItem(index)}>
                        Remove
                      </button>
                    )}
                  </div>

                  <label htmlFor={`modal-menuName-${index}`}>Menu Name</label>
                  <input id={`modal-menuName-${index}`} name="menuName" type="text" value={item.menuName} onChange={(e) => handleModalItemChange(index, e)} required />

                  <label htmlFor={`modal-description-${index}`}>Description</label>
                  <textarea id={`modal-description-${index}`} name="description" rows={2} value={item.description} onChange={(e) => handleModalItemChange(index, e)} required />

                  <label htmlFor={`modal-price-${index}`}>Price (XAF)</label>
                  <input id={`modal-price-${index}`} name="price" type="number" min="0" step="1" value={item.price} onChange={(e) => handleModalItemChange(index, e)} required />

                  <label htmlFor={`modal-image-${index}`}>Image</label>
                  <input id={`modal-image-${index}`} name="image" type="file" accept="image/*" onChange={(e) => handleModalItemChange(index, e)} />

                  <div className="checkbox-row">
                    <input id={`modal-is_available-${index}`} name="is_available" type="checkbox" checked={item.is_available} onChange={(e) => handleModalItemChange(index, e)} />
                    <label htmlFor={`modal-is_available-${index}`}>Available</label>
                  </div>
                </div>
              ))}

              <button type="button" className="add-item-btn" onClick={addModalItem}>
                + Add Another Item
              </button>

              {modalError && <p className="form-message">{modalError}</p>}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save Menu Items'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Menu Item</h2>
              <button type="button" className="modal-close-btn" onClick={() => setEditModal(null)}>
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={handleEditSubmit}>
              <label htmlFor="edit-menuName">Menu Name</label>
              <input id="edit-menuName" name="menuName" type="text" value={editForm.menuName} onChange={handleEditChange} required />

              <label htmlFor="edit-description">Description</label>
              <textarea id="edit-description" name="description" rows={2} value={editForm.description} onChange={handleEditChange} required />

              <label htmlFor="edit-price">Price (XAF)</label>
              <input id="edit-price" name="price" type="number" min="0" step="1" value={editForm.price} onChange={handleEditChange} required />

              <label htmlFor="edit-image">Image (leave empty to keep current)</label>
              <input id="edit-image" name="image" type="file" accept="image/*" onChange={handleEditChange} />

              <div className="checkbox-row">
                <input id="edit-is_available" name="is_available" type="checkbox" checked={editForm.is_available} onChange={handleEditChange} />
                <label htmlFor="edit-is_available">Available</label>
              </div>

              {editError && <p className="form-message">{editError}</p>}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={editSubmitting}>
                  {editSubmitting ? 'Saving…' : 'Update'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditModal(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantDetail
