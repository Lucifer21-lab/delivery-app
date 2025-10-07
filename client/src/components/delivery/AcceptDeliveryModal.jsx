import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { acceptDelivery } from '../../redux/slices/deliverySlice';
import { toast } from 'react-toastify';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import { formatDateTime, formatPrice } from '../../utils/formatters';

const AcceptDeliveryModal = ({ delivery, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        setLoading(true);
        try {
            await dispatch(acceptDelivery(delivery._id)).unwrap();
            toast.success('Delivery accepted successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error || 'Failed to accept delivery');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Accept Delivery</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                        <p className="text-blue-700 font-medium">
                            ⚠️ By accepting this delivery, you agree to complete it by the specified deadline.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{delivery.title}</h3>
                        <p className="text-gray-600">{delivery.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Pickup From</p>
                            <p className="font-semibold text-gray-800">{delivery.pickupLocation.address}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Deliver To</p>
                            <p className="font-semibold text-gray-800">{delivery.deliveryLocation.address}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Delivery Deadline</p>
                            <p className="font-semibold text-gray-800">{formatDateTime(delivery.deliveryDeadline)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Payment</p>
                            <p className="font-semibold text-green-600 text-xl">{formatPrice(delivery.price)}</p>
                        </div>
                    </div>

                    {delivery.packageDetails?.fragile && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="text-red-700 font-medium">⚠️ Fragile Item - Handle with care</p>
                        </div>
                    )}

                    {/* Images */}
                    {delivery.images && delivery.images.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Package Images</p>
                            <div className="grid grid-cols-3 gap-2">
                                {delivery.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Package ${idx + 1}`}
                                        className="w-full h-24 object-cover rounded-lg"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 flex space-x-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAccept}
                        disabled={loading}
                        className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
                    >
                        <FaCheckCircle />
                        <span>{loading ? 'Accepting...' : 'Accept Delivery'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AcceptDeliveryModal;