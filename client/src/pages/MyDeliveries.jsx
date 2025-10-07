import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchMyDeliveries, updateDeliveryStatus } from '../redux/slices/deliverySlice';
import { FaClipboardList, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { formatDateTime, formatPrice } from '../utils/formatters';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/constants';
import { toast } from 'react-toastify';

const MyDeliveries = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { myDeliveries } = useSelector((state) => state.delivery);
    const { user } = useSelector((state) => state.auth);
    const [filter, setFilter] = useState(searchParams.get('type') || 'all');

    useEffect(() => {
        const type = filter === 'all' ? '' : filter;
        dispatch(fetchMyDeliveries(type));
    }, [dispatch, filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        if (newFilter === 'all') setSearchParams({});
        else setSearchParams({ type: newFilter });
    };

    const handleStatusUpdate = async (deliveryId, newStatus) => {
        try {
            await dispatch(updateDeliveryStatus({ deliveryId, status: newStatus })).unwrap();
            toast.success('✅ Status updated successfully!');
            dispatch(fetchMyDeliveries(filter === 'all' ? '' : filter));
        } catch {
            toast.error('❌ Failed to update status');
        }
    };

    const filteredDeliveries = myDeliveries.filter((delivery) => {
        if (filter === 'requested') return delivery.requester?._id === user?.id;
        if (filter === 'delivering') return delivery.deliveryPerson?._id === user?.id;
        return true;
    });

    const tabs = [
        { id: 'all', label: 'All', icon: FaClipboardList },
        { id: 'requested', label: 'My Requests', icon: FaClipboardList },
        { id: 'delivering', label: 'Delivering', icon: FaTruck },
    ];

    return (
        <div className="container mx-auto px-6 py-10">
            <div className="mb-10 text-center">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-blue-500 text-transparent bg-clip-text mb-3">
                    My Deliveries
                </h1>
                <p className="text-gray-500 text-lg">
                    Track, manage, and complete your deliveries efficiently 🚚
                </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center space-x-6 mb-10 border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleFilterChange(tab.id)}
                        className={`flex items-center space-x-2 pb-4 text-lg font-semibold transition-all duration-300 
                            ${filter === tab.id
                                ? 'border-b-4 border-primary-600 text-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* No Deliveries */}
            {filteredDeliveries.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                    <FaTruck className="text-gray-300 text-7xl mx-auto mb-6" />
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">No Deliveries Found</h3>
                    <p className="text-gray-500 text-lg mb-8">
                        {filter === 'requested'
                            ? "You haven’t created any delivery requests yet."
                            : filter === 'delivering'
                                ? "You haven’t accepted any deliveries yet."
                                : "You currently don’t have any deliveries."}
                    </p>
                    <Link
                        to={filter === 'requested' || filter === 'all' ? '/create-delivery' : '/available-deliveries'}
                        className="bg-gradient-to-r from-primary-600 to-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                        {filter === 'requested' || filter === 'all' ? 'Create Request' : 'Browse Deliveries'}
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredDeliveries.map((delivery) => {
                        const isRequester = delivery.requester?._id === user?.id;
                        const isDeliveryPerson = delivery.deliveryPerson?._id === user?.id;

                        return (
                            <div
                                key={delivery._id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <h3 className="text-2xl font-bold text-gray-800">{delivery.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[delivery.status]}`}>
                                                {STATUS_LABELS[delivery.status]}
                                            </span>
                                            {isRequester && (
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                    Your Request
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm max-w-xl">{delivery.description}</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                                    <div>
                                        <p className="text-gray-500 text-sm">Pickup From</p>
                                        <p className="font-semibold text-gray-800">{delivery.pickupLocation.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Deliver To</p>
                                        <p className="font-semibold text-gray-800">{delivery.deliveryLocation.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Delivery Deadline</p>
                                        <p className="font-semibold text-gray-800">{formatDateTime(delivery.deliveryDeadline)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Price</p>
                                        <p className="font-semibold text-green-600 text-lg">{formatPrice(delivery.price)}</p>
                                    </div>
                                </div>

                                {delivery.deliveryPerson && (
                                    <div className="mt-5 bg-gray-50 p-4 rounded-lg flex items-center space-x-3">
                                        {(isRequester ? delivery.deliveryPerson : delivery.requester)?.avatar ? (
                                            <img
                                                src={(isRequester ? delivery.deliveryPerson : delivery.requester)?.avatar}
                                                alt="User"
                                                className="w-10 h-10 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                                                {((isRequester ? delivery.deliveryPerson : delivery.requester)?.name || '').charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-gray-600 text-sm">
                                                {isRequester ? 'Accepted by:' : 'Delivering for:'}
                                            </p>
                                            <p className="font-semibold text-gray-800">
                                                {(isRequester ? delivery.deliveryPerson : delivery.requester)?.name}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                    <Link
                                        to={`/delivery/${delivery._id}`}
                                        className="flex-1 bg-primary-600 text-black py-3 rounded-lg font-semibold text-center hover:bg-primary-700 transition"
                                    >
                                        View Details
                                    </Link>

                                    {isDeliveryPerson && delivery.status === 'accepted' && (
                                        <button
                                            onClick={() => handleStatusUpdate(delivery._id, 'in_progress')}
                                            className="flex-1 bg-yellow-500 text-black py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
                                        >
                                            Start Delivery
                                        </button>
                                    )}

                                    {isDeliveryPerson && delivery.status === 'in_progress' && (
                                        <button
                                            onClick={() => handleStatusUpdate(delivery._id, 'completed')}
                                            className="flex-1 bg-green-600 text-black py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-green-700 transition"
                                        >
                                            <FaCheckCircle />
                                            <span>Mark Complete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyDeliveries;
