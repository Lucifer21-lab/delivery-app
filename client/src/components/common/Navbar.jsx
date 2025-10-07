import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { FaTruck, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { unreadCount } = useSelector((state) => state.notification);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <FaTruck className="text-blue-600 text-2xl" />
                        <span className="text-2xl font-bold text-gray-800">DeliveryApp</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/available-deliveries"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
                                >
                                    Available Deliveries
                                </Link>
                                <Link
                                    to="/my-deliveries"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
                                >
                                    My Deliveries
                                </Link>
                                <Link
                                    to="/create-delivery"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors duration-300 shadow-md hover:shadow-lg"
                                >
                                    Create Request
                                </Link>

                                {/* Notifications */}
                                <Link to="/notifications" className="relative">
                                    <FaBell className="text-2xl text-gray-700 hover:text-blue-600 transition-colors duration-300" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Menu */}
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-300"
                                    >
                                        <FaUser />
                                        <span className="font-medium">{user?.name}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors duration-300"
                                    >
                                        <FaSignOutAlt />
                                        <span>Logout</span>
                                    </button>
                                </div>

                                {user?.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-300"
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>

    );
};

export default Navbar;