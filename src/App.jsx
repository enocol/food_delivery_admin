import './App.css'
import RestaurantForm from './components/RestaurantForm'
import EditDataPage from './components/EditDataPage'
import RestaurantDetail from './components/RestaurantDetail'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<RestaurantForm />} />
          <Route path="/edit" element={<EditDataPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

