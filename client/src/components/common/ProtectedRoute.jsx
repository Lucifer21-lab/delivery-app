import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

    if (loading) return <Loader />;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

    return children;
};

export default ProtectedRoute;
