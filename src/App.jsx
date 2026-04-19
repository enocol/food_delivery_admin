import './App.css'
import RestaurantForm from './components/RestaurantForm'
import EditDataPage from './components/EditDataPage'
import RestaurantDetail from './components/RestaurantDetail'
import OrdersPage from './components/OrdersPage'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './components/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<RestaurantForm />} />
            <Route path="/edit" element={<EditDataPage />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

