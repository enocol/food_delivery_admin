import { useState } from 'react'
import './App.css'
import RestaurantForm from './components/RestaurantForm'
import EditDataPage from './components/EditDataPage'

function App() {
  const [showForm, setShowForm] = useState(false)
  const [showEditPage, setShowEditPage] = useState(false)

  return (
    <div className="app">
      <header className="header">
        <h1>MBOLO EATS DASHBOARD</h1>
      </header>
      <main className="main">
        {showForm ? (
          <RestaurantForm onBack={() => setShowForm(false)} />
        ) : showEditPage ? (
          <EditDataPage onBack={() => setShowEditPage(false)} />
        ) : (
          <section className="home">
            <p>Welcome to the Mbolo Eats admin dashboard.</p>
            <hr className="divider" />
            <div className="home-actions">
              <button className="primary-btn" onClick={() => setShowForm(true)}>
                Add Data
              </button>
              <button className="secondary-btn" onClick={() => setShowEditPage(true)}>
                Edit Data
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App

