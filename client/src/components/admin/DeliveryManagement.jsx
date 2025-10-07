import { useEffect, useState } from 'react';
import axios from '../../api/axios.conf';
import { toast } from 'react-toastify';
import { FaTrash, FaEye } from 'react-icons/fa';
import { formatDateTime, formatPrice } from '../../utils/formatters';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';

const DeliveryManagement = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchDeliveries();
    }, [page, statusFilter]);

    const fetchDeliveries = async () => {
        try {
            const response = await axios.get('/admin/deliveries', {
                params: { page, status: statusFilter, limit: 20 }
            });
            setDeliveries(response.data.data.deliveries);
            setTotalPages(response.data.data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch deliveries');
        } finally {
            setLoading(false);
        }
    };

    const deleteDelivery = async (deliveryId) => {
        if (!window.confirm('Are you sure you want to delete this delivery?')) return;

        try {
            await axios.delete(`/admin/deliveries/${deliveryId}`);
            toast.success('Delivery deleted successfully');
            fetchDeliveries();
        } catch (error) {
            toast.error('Failed to delete delivery');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Delivery Management</h2>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                </select>
            </div>

            {/* Deliveries Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Person</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {deliveries.map((delivery) => (
                            <tr key={delivery._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">{delivery.title}</div>
                                    <div className="text-sm text-gray-500 line-clamp-1">{delivery.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-800">{delivery.requester?.name}</div>
                                    <div className="text-xs text-gray-500">{delivery.requester?.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {delivery.deliveryPerson ? (
                                        <>
                                            <div className="text-sm text-gray-800">{delivery.deliveryPerson.name}</div>
                                            <div className="text-xs text-gray-500">{delivery.deliveryPerson.email}</div>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">Not assigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-semibold text-green-600">
                                    {formatPrice(delivery.price)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[delivery.status]}`}>
                                        {STATUS_LABELS[delivery.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {formatDateTime(delivery.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => window.open(`/delivery/${delivery._id}`, '_blank')}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            title="View"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => deleteDelivery(delivery._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 bg-white border rounded-lg">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeliveryManagement;