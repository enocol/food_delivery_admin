import { useState, useEffect, Fragment } from 'react'
import {
  getRestaurantsWithMenus,
  // deleteRestaurant,
  // deleteMenuItem,
  // updateRestaurant,
  // updateMenuItem,
  uploadToCloudinary,
} from '../api'
import { doualaAreas } from '../constants'
import RestaurantForm from './RestaurantForm'
import '../App.css'
import { useNavigate } from 'react-router-dom'

function EditDataPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [modal, setModal] = useState(null) // { type: 'restaurant' | 'menuItem', data: {} }
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const navigate = useNavigate()



 async function loadAll() {
  try {
    setLoading(true)
    setPageError('')

    const data = await getRestaurantsWithMenus()

    const restaurantList = Array.isArray(data)
      ? data
      : Array.isArray(data.restaurants)
        ? data.restaurants
        : []

    setRestaurants(restaurantList)

    
    console.log('restaurantList:', restaurantList)
  } catch (err) {
    setPageError(err.message || 'Failed to load restaurants')
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    loadAll()
   
  }, [])
  console.log('data:', restaurants
  )



if (loading) {
  return <p className="loading-text edit-data-page">Loading…........................................</p>
}

if (restaurants.length === 0) {
  return (
    <section className="edit-data-page">


      <div className="page-header">
        <h2>All Restaurants</h2>
      </div>
      <p className="no-data-text">No restaurants found. Please add some restaurants first.</p>
    </section>
  )
}
  return (
  <div>
   <div className="page-header">
     <h1>View and Edit Restaurants</h1>
   </div>
  
    <div className='card-container'>
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="card" onClick={() => navigate(`/restaurant/${restaurant.id}`)} style={{ cursor: 'pointer' }}>
          <img src={restaurant.imageUrl} style={{width: "18rem", height: "18rem", objectFit: "cover"}} className="card-img-top" alt="..."/>
          <div className="card-body">
            <div className='title-container'>
            <h5 className="card-title">{restaurant.name}</h5>
            <p className="card-text">{restaurant.rating}</p>
            </div>
            <p className="card-text">{restaurant.cuisine}</p>
            <p className="card-text">{restaurant.deliveryTimeMinutes}Minutes</p>
            <p className="card-text">{restaurant.deliveryFee}</p>
          </div>
      </div>
      
      ))}
      </div>

  </div>
  )
}


export default EditDataPage
