import { FaMapMarkerAlt, FaClock, FaBox, FaUser, FaDollarSign } from 'react-icons/fa';
import { formatDateTime, formatPrice, getTimeRemaining } from '../../utils/formatters';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';

const DeliveryDetails = ({ delivery }) => {
    if (!delivery) return null;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{delivery.title}</h2>
                    <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[delivery.status]}`}>
                            {STATUS_LABELS[delivery.status]}
                        </span>
                        {delivery.packageDetails?.fragile && (
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                ⚠️ Fragile
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-3xl font-bold text-green-600">{formatPrice(delivery.price)}</p>
                </div>
            </div>

            {/* Description */}
            <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{delivery.description}</p>
            </div>

            {/* Locations */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                        <FaMapMarkerAlt className="text-primary-600 mr-2" />
                        <h3 className="font-bold text-gray-800">Pickup Location</h3>
                    </div>
                    <p className="text-gray-700 text-sm">{delivery.pickupLocation.address}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                        <FaMapMarkerAlt className="text-green-600 mr-2" />
                        <h3 className="font-bold text-gray-800">Delivery Location</h3>
                    </div>
                    <p className="text-gray-700 text-sm">{delivery.deliveryLocation.address}</p>
                </div>
            </div>

            {/* Package Details */}
            {delivery.packageDetails && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-3">
                        <FaBox className="text-primary-600 mr-2" />
                        <h3 className="font-bold text-gray-800">Package Details</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {delivery.packageDetails.weight && (
                            <div>
                                <p className="text-gray-600">Weight</p>
                                <p className="font-semibold text-gray-800">{delivery.packageDetails.weight} kg</p>
                            </div>
                        )}
                        {delivery.packageDetails.dimensions && (
                            <div>
                                <p className="text-gray-600">Dimensions</p>
                                <p className="font-semibold text-gray-800">{delivery.packageDetails.dimensions}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-gray-600">Fragile</p>
                            <p className="font-semibold text-gray-800">
                                {delivery.packageDetails.fragile ? '⚠️ Yes' : 'No'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Deadlines */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                        <FaClock className="text-orange-600 mr-2" />
                        <h3 className="font-bold text-gray-800">Accept Deadline</h3>
                    </div>
                    <p className="text-gray-700 text-sm">{formatDateTime(delivery.acceptDeadline)}</p>
                    {delivery.status === 'pending' && (
                        <p className="text-orange-600 font-semibold text-sm mt-1">
                            {getTimeRemaining(delivery.acceptDeadline)}
                        </p>
                    )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                        <FaClock className="text-blue-600 mr-2" />
                        <h3 className="font-bold text-gray-800">Delivery Deadline</h3>
                    </div>
                    <p className="text-gray-700 text-sm">{formatDateTime(delivery.deliveryDeadline)}</p>
                </div>
            </div>

            {/* Requester Info */}
            <div className="border-t pt-6">
                <div className="flex items-center mb-2">
                    <FaUser className="text-gray-600 mr-2" />
                    <h3 className="font-bold text-gray-800">Requested By</h3>
                </div>
                <div className="flex items-center">
                    {delivery.requester?.avatar ? (
                        <img
                            src={delivery.requester.avatar}
                            alt={delivery.requester.name}
                            className="w-12 h-12 rounded-full mr-3"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-semibold">
                                {delivery.requester?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-gray-800">{delivery.requester?.name}</p>
                        <p className="text-sm text-gray-600">
                            ⭐ {delivery.requester?.rating?.toFixed(1) || 'New'} • {delivery.requester?.completedDeliveries || 0} deliveries
                        </p>
                    </div>
                </div>
            </div>

            {/* Images */}
            {delivery.images && delivery.images.length > 0 && (
                <div className="border-t pt-6 mt-6">
                    <h3 className="font-bold text-gray-800 mb-3">Package Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {delivery.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Package ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryDetails;