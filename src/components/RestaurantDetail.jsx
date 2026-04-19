import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getRestaurantsWithMenus } from '../api'
import '../App.css'

function RestaurantDetail() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
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
    load()
  }, [id])

  if (loading) return <p className="loading-text">Loading…</p>
  if (error) return <p className="form-message">{error}</p>
  if (!restaurant) return null

  const menus = restaurant.menus ?? restaurant.menuItems ?? []

  return (
    <div className="detail-page">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RestaurantDetail
