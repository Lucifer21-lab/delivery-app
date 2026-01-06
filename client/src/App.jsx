import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { loadUser } from './redux/slices/authSlice';
import useSocket from './hooks/useSocket';

import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import CreateDelivery from './pages/CreateDelivery';
import AvailableDeliveries from './pages/AvailableDeliveries';
import MyDeliveries from './pages/MyDeliveries';
import DeliveryDetails from './pages/DeliveryDetails';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import Footer from './components/common/Footer';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, loading } = useSelector((state) => state.auth);

  useSocket();

  useEffect(() => {
    if (token) dispatch(loadUser());
  }, [dispatch, token]);

  if (loading) return <Loader />;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/success" element={<GoogleAuthSuccess />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-delivery" element={<ProtectedRoute><CreateDelivery /></ProtectedRoute>} />
          <Route path="/available-deliveries" element={<ProtectedRoute><AvailableDeliveries /></ProtectedRoute>} />
          <Route path="/my-deliveries" element={<ProtectedRoute><MyDeliveries /></ProtectedRoute>} />
          <Route path="/delivery/:id" element={<ProtectedRoute><DeliveryDetails /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
