import { useState } from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import DeliveryManagement from '../components/admin/DeliveryManagement';
import { FaChartLine, FaUsers, FaTruck } from 'react-icons/fa';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: FaChartLine, component: AdminDashboard },
        { id: 'users', label: 'Users', icon: FaUsers, component: UserManagement },
        { id: 'deliveries', label: 'Deliveries', icon: FaTruck, component: DeliveryManagement }
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdminDashboard;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                <div className="container mx-auto px-4">
                    <div className="flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 border-b-2 transition ${activeTab === tab.id
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                <tab.icon />
                                <span className="font-semibold">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <ActiveComponent />
            </div>
        </div>
    );
};

export default AdminPanel;