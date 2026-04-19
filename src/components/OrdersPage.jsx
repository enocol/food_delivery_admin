import { useState, useEffect } from 'react'
import { getOrders } from '../api'
import dashboardBg from '../assets/dashboard-bg.svg'
import '../App.css'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addresses, setAddresses] = useState({})

  function extractCoords(addr) {
    if (!addr) return null
    let obj = addr
    if (typeof addr === 'string') {
      try { obj = JSON.parse(addr) } catch { return null }
    }
    if (typeof obj === 'object') {
      const lat = obj.latitude ?? obj.lat
      const lng = obj.longitude ?? obj.lng
      if (lat != null && lng != null) return { lat: Number(lat), lng: Number(lng) }
    }
    return null
  }

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=en`,
        { headers: { 'User-Agent': 'MboloEatsAdmin/1.0' } }
      )
      if (!res.ok) return null
      const data = await res.json()
      if (data.error) return null
      const a = data.address || {}
      const parts = [
        a.road || a.pedestrian || a.neighbourhood || '',
        a.suburb || a.city_district || '',
        a.city || a.town || a.village || '',
        a.state || '',
        a.country || ''
      ].filter(Boolean)
      return parts.join(', ') || data.display_name || null
    } catch {
      return null
    }
  }

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrders()
        const list = Array.isArray(data) ? data : data.orders ?? []
        setOrders(list)
      } catch (err) {
        setError(err.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  useEffect(() => {
    if (orders.length === 0) return
    let cancelled = false

    async function resolveAddresses() {
      const resolved = {}
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i]
        const coords = extractCoords(order.deliveryAddress)
        if (coords) {
          // Nominatim rate limit: 1 request per second
          if (i > 0) await new Promise(r => setTimeout(r, 1100))
          let readable = await reverseGeocode(coords.lat, coords.lng)
          if (!readable) {
            await new Promise(r => setTimeout(r, 1100))
            readable = await reverseGeocode(coords.lat, coords.lng)
          }
          if (cancelled) return
          resolved[order.orderId] = readable || 'Address unavailable'
        } else {
          resolved[order.orderId] = typeof order.deliveryAddress === 'string'
            ? order.deliveryAddress
            : 'N/A'
        }
      }
      if (!cancelled) setAddresses(resolved)
    }

    resolveAddresses()
    return () => { cancelled = true }
  }, [orders])

  if (loading) return <p className="loading-text">Loading orders…</p>
  if (error) return <p className="form-message">{error}</p>

  return (
    <div className="orders-page" style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', minHeight: 'calc(100vh - 48px)' }}>
      <div className="page-header">
        <h1>All Orders</h1>
      </div>

      {orders.length === 0 ? (
        <p className="empty-text">No orders found.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="order-card-header">
                <span className="order-id">Order #{order.orderId}</span>
                <span className="order-payment-badge">{order.paymentMethod}</span>
              </div>

              <div className="order-card-body">
                <div className="order-section">
                  <h4 className="order-section-title">Customer</h4>
                  {/* <p className="order-detail">{order.user?.name}</p> */}
                  <p className="order-detail-sub">{order.user?.email}</p>
                  <p className="order-detail-sub">{order.user?.phone}</p>
                </div>

                <div className="order-section">
                  <h4 className="order-section-title">Delivery</h4>
                  <p className="order-detail">{addresses[order.orderId] || 'Resolving address…'}</p>
                </div>

                <div className="order-totals">
                  <div className="order-total-row">
                    <span>Subtotal</span>
                    <span>{order.subtotal} XAF</span>
                  </div>
                  <div className="order-total-row">
                    <span>Delivery Fee</span>
                    <span>{order.deliveryFee} XAF</span>
                  </div>
                  <div className="order-total-row order-grand-total">
                    <span>Total</span>
                    <span>{(Number(order.subtotal) + Number(order.deliveryFee))} XAF</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
