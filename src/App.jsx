import { useState } from 'react'
import './App.css'
import RestaurantForm from './components/RestaurantForm'
import EditDataPage from './components/EditDataPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<RestaurantForm />} />
        <Route path="/edit" element={<EditDataPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

