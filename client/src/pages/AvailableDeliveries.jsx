import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableDeliveries } from '../redux/slices/deliverySlice';
import AcceptDeliveryModal from '../components/delivery/AcceptDeliveryModal';
import useDebounce from '../hooks/useDebounce';
import { FaSearch, FaMapMarkerAlt, FaClock, FaTruck } from 'react-icons/fa';
import { formatPrice, getTimeRemaining } from '../utils/formatters';

const AvailableDeliveries = () => {
    const dispatch = useDispatch();
    const { availableDeliveries, loading, totalPages, currentPage } = useSelector(
        (state) => state.delivery
    );

    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        minPrice: '',
        maxPrice: '',
        page: 1,
    });

    const debouncedSearch = useDebounce(filters.search, 500);

    useEffect(() => {
        dispatch(fetchAvailableDeliveries({
            ...filters,
            search: debouncedSearch,
        }));
    }, [dispatch, filters.page, debouncedSearch, filters.minPrice, filters.maxPrice]);

    const handleAcceptSuccess = () => {
        dispatch(fetchAvailableDeliveries(filters));
    };

    // Loading UI
    if (loading && availableDeliveries.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="flex flex-col items-center space-y-6">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg text-gray-600 font-medium">Fetching available deliveries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-10">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-5xl font-extrabold text-gray-800 mb-3">Available Deliveries</h1>
                <p className="text-gray-600 text-lg">Browse delivery requests and accept jobs in your area</p>
            </div>

            {/* Filters Section */}
            <div className="max-w-5xl mx-auto bg-white/60 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-gray-100 mb-12 transition hover:shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search deliveries..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        />
                    </div>
                    <input
                        type="number"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    />
                    <input
                        type="number"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    />
                </div>
            </div>

            {/* Deliveries */}
            <div className="max-w-6xl mx-auto px-4">
                {availableDeliveries.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-lg p-12 rounded-2xl shadow-lg text-center">
                        <FaTruck className="text-gray-300 text-7xl mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Deliveries Found</h3>
                        <p className="text-gray-600">Try adjusting your filters or check back later.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {availableDeliveries.map((delivery) => (
                                <div
                                    key={delivery._id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                                >
                                    {/* Image */}
                                    {delivery.images && delivery.images[0] ? (
                                        <img
                                            src={delivery.images[0]}
                                            alt={delivery.title}
                                            className="w-full h-52 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-52 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center text-gray-400 text-3xl font-bold">
                                            No Image
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{delivery.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{delivery.description}</p>

                                        {/* Locations */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-start text-sm text-gray-700">
                                                <FaMapMarkerAlt className="mt-1 mr-2 text-indigo-600" />
                                                <div>
                                                    <p className="font-semibold">Pickup:</p>
                                                    <p>{delivery.pickupLocation.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start text-sm text-gray-700">
                                                <FaMapMarkerAlt className="mt-1 mr-2 text-green-600" />
                                                <div>
                                                    <p className="font-semibold">Delivery:</p>
                                                    <p>{delivery.deliveryLocation.address}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* User + Price */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                {delivery.requester.avatar ? (
                                                    <img
                                                        src={delivery.requester.avatar}
                                                        alt={delivery.requester.name}
                                                        className="w-10 h-10 rounded-full mr-3 border-2 border-indigo-100"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                                        <span className="text-indigo-600 font-semibold">
                                                            {delivery.requester.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{delivery.requester.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        ⭐ {delivery.requester.rating?.toFixed(1) || 'New'} ({delivery.requester.completedDeliveries || 0} jobs)
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">{formatPrice(delivery.price)}</p>
                                            </div>
                                        </div>

                                        {/* Time Remaining */}
                                        <div className="flex items-center justify-between text-sm mb-4 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                                            <div className="flex items-center text-orange-600 font-medium">
                                                <FaClock className="mr-2" /> Accept by:
                                            </div>
                                            <span className="font-bold text-orange-700">
                                                {getTimeRemaining(delivery.acceptDeadline)}
                                            </span>
                                        </div>

                                        {/* Fragile Tag */}
                                        {delivery.packageDetails?.fragile && (
                                            <div className="mb-3">
                                                <span className="inline-block bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-semibold">
                                                    ⚠️ Fragile Item
                                                </span>
                                            </div>
                                        )}

                                        {/* Accept Button */}
                                        <button
                                            onClick={() => setSelectedDelivery(delivery)}
                                            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md"
                                        >
                                            Accept Delivery
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-10 space-x-3">
                                <button
                                    onClick={() => setFilters({ ...filters, page: Math.max(1, currentPage - 1) })}
                                    disabled={currentPage === 1}
                                    className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-semibold shadow-sm transition"
                                >
                                    Previous
                                </button>
                                <span className="px-6 py-3 bg-white border border-gray-300 rounded-xl font-semibold shadow-sm">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setFilters({ ...filters, page: Math.min(totalPages, currentPage + 1) })}
                                    disabled={currentPage === totalPages}
                                    className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-semibold shadow-sm transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Accept Modal */}
            {selectedDelivery && (
                <AcceptDeliveryModal
                    delivery={selectedDelivery}
                    onClose={() => setSelectedDelivery(null)}
                    onSuccess={handleAcceptSuccess}
                />
            )}
        </div>
    );
};

export default AvailableDeliveries;
