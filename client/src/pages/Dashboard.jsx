import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyDeliveries } from '../redux/slices/deliverySlice';
import { FaTruck, FaPlus, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import { formatPrice } from '../utils/formatters';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/constants';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { myDeliveries } = useSelector((state) => state.delivery);
    const [stats, setStats] = useState({
        requested: 0,
        delivering: 0,
        completed: 0,
        totalEarned: 0
    });

    useEffect(() => {
        dispatch(fetchMyDeliveries());
    }, [dispatch]);

    useEffect(() => {
        if (myDeliveries.length > 0) {
            const requested = myDeliveries.filter(d => d.requester?._id === user?.id);
            const delivering = myDeliveries.filter(d => d.deliveryPerson?._id === user?.id);
            const completed = delivering.filter(d => d.status === 'completed');
            const totalEarned = completed.reduce((sum, d) => sum + d.price, 0);

            setStats({
                requested: requested.length,
                delivering: delivering.length,
                completed: completed.length,
                totalEarned
            });
        }
    }, [myDeliveries, user]);

    const quickStats = [
        {
            title: 'My Requests',
            value: stats.requested,
            icon: FaClipboardList,
            color: 'bg-blue-500',
            link: '/my-deliveries?type=requested'
        },
        {
            title: 'Delivering',
            value: stats.delivering,
            icon: FaTruck,
            color: 'bg-yellow-500',
            link: '/my-deliveries?type=delivering'
        },
        {
            title: 'Completed',
            value: stats.completed,
            icon: FaCheckCircle,
            color: 'bg-green-500',
            link: '/my-deliveries'
        },
        {
            title: 'Total Earned',
            value: formatPrice(stats.totalEarned),
            icon: FaTruck,
            color: 'bg-purple-500',
            link: '/profile'
        }
    ];

    const recentDeliveries = myDeliveries.slice(0, 5);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-gray-600">Here's what's happening with your deliveries</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickStats.map((stat, index) => (
                    <Link
                        key={index}
                        to={stat.link}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} p-4 rounded-full`}>
                                <stat.icon className="text-white text-2xl" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Link
                    to="/create-delivery"
                    className="bg-gradient-to-r from-red-300 to-red-500 text-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
                >
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-500 bg-opacity-20 p-4 rounded-full">
                            <FaPlus className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-1 ">Create Delivery Request</h3>
                            <p className="text-primary-100">Post a new delivery request</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/available-deliveries"
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
                >
                    <div className="flex items-center space-x-4">
                        <div className="bg-black bg-opacity-20 p-4 rounded-full">
                            <FaTruck className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-1">Browse Deliveries</h3>
                            <p className="text-green-100">Find deliveries to accept</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Deliveries */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
                    <Link to="/my-deliveries" className="text-primary-600 hover:text-primary-700 font-semibold">
                        View All
                    </Link>
                </div>

                {recentDeliveries.length === 0 ? (
                    <div className="text-center py-12">
                        <FaTruck className="text-gray-300 text-6xl mx-auto mb-4" />
                        <p className="text-gray-500 text-lg mb-4">No deliveries yet</p>
                        <Link
                            to="/create-delivery"
                            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
                        >
                            Create Your First Request
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentDeliveries.map((delivery) => (
                            <Link
                                key={delivery._id}
                                to={`/delivery/${delivery._id}`}
                                className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 mb-1">{delivery.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-1">{delivery.description}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                            <span>From: {delivery.pickupLocation.address}</span>
                                            <span>→</span>
                                            <span>To: {delivery.deliveryLocation.address}</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-right">
                                        <p className="text-xl font-bold text-green-600 mb-2">
                                            {formatPrice(delivery.price)}
                                        </p>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[delivery.status]}`}>
                                            {STATUS_LABELS[delivery.status]}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;