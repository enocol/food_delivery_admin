import { useState } from 'react'
import './App.css'
import RestaurantForm from './components/RestaurantForm'

function App() {
  const [showForm, setShowForm] = useState(false)

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
          <RestaurantForm onBack={() => setShowForm(false)} />
        )}
      </main>
    </div>
  )
}

export default App

