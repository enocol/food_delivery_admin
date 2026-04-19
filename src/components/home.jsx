import React from 'react'
import '../App.css'
import homeBg from '../assets/home-bg.svg'

const Home = () => {
  return (
    <div className="home-page" style={{ backgroundImage: `url(${homeBg})` }}>
      <header className="home-header">
        <h1>MBOLO EATS DASHBOARD</h1>
      </header>
      <p className="home-welcome">Welcome! Use the sidebar to add or edit restaurants.</p>
    </div>
  )
}

export default Home