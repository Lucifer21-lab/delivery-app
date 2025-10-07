import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { formatPrice, getTimeRemaining } from '../../utils/formatters';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';

const DeliveryCard = ({ delivery, onAccept, showAcceptButton = true }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            {delivery.images && delivery.images[0] && (
                <img
                    src={delivery.images[0]}
                    alt={delivery.title}
                    className="w-full h-48 object-cover"
                />
            )}

            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800 flex-1">{delivery.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[delivery.status]}`}>
                        {STATUS_LABELS[delivery.status]}
                    </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{delivery.description}</p>

                <div className="space-y-2 mb-4">
                    <div className="flex items-start text-sm text-gray-600">
                        <FaMapMarkerAlt className="mt-1 mr-2 text-primary-600 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-gray-800">Pickup:</p>
                            <p className="line-clamp-1">{delivery.pickupLocation.address}</p>
                        </div>
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                        <FaMapMarkerAlt className="mt-1 mr-2 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-gray-800">Delivery:</p>
                            <p className="line-clamp-1">{delivery.deliveryLocation.address}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        {delivery.requester?.avatar ? (
                            <img
                                src={delivery.requester.avatar}
                                alt={delivery.requester.name}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                                <span className="text-primary-600 font-semibold">
                                    {delivery.requester?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{delivery.requester?.name}</p>
                            <p className="text-xs text-gray-500">
                                ⭐ {delivery.requester?.rating?.toFixed(1) || 'New'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{formatPrice(delivery.price)}</p>
                    </div>
                </div>

                {delivery.status === 'pending' && (
                    <div className="flex items-center justify-between text-sm mb-4 p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center text-orange-600">
                            <FaClock className="mr-2" />
                            <span className="font-semibold">Accept by:</span>
                        </div>
                        <span className="font-bold text-orange-700">
                            {getTimeRemaining(delivery.acceptDeadline)}
                        </span>
                    </div>
                )}

                {delivery.packageDetails?.fragile && (
                    <div className="mb-4">
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-semibold">
                            ⚠️ Fragile Item
                        </span>
                    </div>
                )}

                <div className="flex space-x-2">
                    <Link
                        to={`/delivery/${delivery._id}`}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 text-center"
                    >
                        View Details
                    </Link>
                    {showAcceptButton && delivery.status === 'pending' && (
                        <button
                            onClick={() => onAccept(delivery)}
                            className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700"
                        >
                            Accept
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryCard;
