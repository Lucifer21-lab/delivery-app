import { useEffect, useState } from 'react';
import axios from '../../api/axios.conf';
import { FaUsers, FaTruck, FaDollarSign, FaChartLine } from 'react-icons/fa';
import { formatPrice } from '../../utils/formatters';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/admin/dashboard');
            setStats(response.data.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: FaUsers,
            color: 'bg-blue-500'
        },
        {
            title: 'Total Deliveries',
            value: stats?.totalDeliveries || 0,
            icon: FaTruck,
            color: 'bg-green-500'
        },
        {
            title: 'Pending Deliveries',
            value: stats?.pendingDeliveries || 0,
            icon: FaChartLine,
            color: 'bg-yellow-500'
        },
        {
            title: 'Total Revenue',
            value: formatPrice(stats?.totalRevenue || 0),
            icon: FaDollarSign,
            color: 'bg-purple-500'
        }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} p-4 rounded-full`}>
                                <stat.icon className="text-white text-2xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Completed Deliveries</h3>
                    <p className="text-3xl font-bold text-green-600">{stats?.completedDeliveries || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Cancelled Deliveries</h3>
                    <p className="text-3xl font-bold text-red-600">{stats?.cancelledDeliveries || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Active Users</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats?.activeUsers || 0}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;