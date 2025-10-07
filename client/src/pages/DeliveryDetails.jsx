import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeliveryById, updateDeliveryStatus, acceptDelivery } from '../redux/slices/deliverySlice';
import PaymentForm from '../components/payment/PaymentForm';
import { toast } from 'react-toastify';
import {
    FaMapMarkerAlt,
    FaClock,
    FaUser,
    FaPhone,
    FaEnvelope,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaBox
} from 'react-icons/fa';
import { formatDateTime, formatPrice, getTimeRemaining } from '../utils/formatters';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/constants';
import Loader from '../components/common/Loader';

const DeliveryDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentDelivery, loading } = useSelector((state) => state.delivery);
    const { user } = useSelector((state) => state.auth);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        dispatch(fetchDeliveryById(id));
    }, [dispatch, id]);

    if (loading || !currentDelivery) {
        return <Loader />;
    }

    const isRequester = currentDelivery.requester?._id === user?.id;
    const isDeliveryPerson = currentDelivery.deliveryPerson?._id === user?.id;
    const canAccept = currentDelivery.status === 'pending' && !isRequester;

    const handleAccept = async () => {
        try {
            await dispatch(acceptDelivery(id)).unwrap();
            toast.success('Delivery accepted successfully!');
            dispatch(fetchDeliveryById(id));
        } catch (error) {
            toast.error(error || 'Failed to accept delivery');
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            await dispatch(updateDeliveryStatus({ deliveryId: id, status: newStatus })).unwrap();
            toast.success('Status updated successfully');
            dispatch(fetchDeliveryById(id));
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handlePaymentSuccess = () => {
        setShowPayment(false);
        toast.success('Payment completed successfully!');
        dispatch(fetchDeliveryById(id));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{currentDelivery.title}</h1>
                            <div className="flex items-center space-x-3">
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[currentDelivery.status]}`}>
                                    {STATUS_LABELS[currentDelivery.status]}
                                </span>
                                {isRequester && (
                                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                        Your Request
                                    </span>
                                )}
                                {isDeliveryPerson && (
                                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                        You're Delivering
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                            <p className="text-4xl font-bold text-green-600">{formatPrice(currentDelivery.price)}</p>
                            {currentDelivery.paymentStatus && (
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${currentDelivery.paymentStatus === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {currentDelivery.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-700 mb-4">{currentDelivery.description}</p>

                    {/* Timeline */}
                    {currentDelivery.status === 'pending' && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                            <div className="flex items-center">
                                <FaClock className="text-orange-600 mr-3 text-xl" />
                                <div>
                                    <p className="text-orange-800 font-semibold">
                                        Waiting for acceptance - {getTimeRemaining(currentDelivery.acceptDeadline)}
                                    </p>
                                    <p className="text-orange-600 text-sm">
                                        Accept by: {formatDateTime(currentDelivery.acceptDeadline)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Location Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <div className="bg-primary-100 p-3 rounded-full mr-3">
                                <FaMapMarkerAlt className="text-primary-600 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Pickup Location</h3>
                        </div>
                        <p className="text-gray-700">{currentDelivery.pickupLocation.address}</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <div className="bg-green-100 p-3 rounded-full mr-3">
                                <FaMapMarkerAlt className="text-green-600 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Delivery Location</h3>
                        </div>
                        <p className="text-gray-700">{currentDelivery.deliveryLocation.address}</p>
                    </div>
                </div>

                {/* Package Details */}
                {currentDelivery.packageDetails && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center mb-4">
                            <FaBox className="text-primary-600 text-2xl mr-3" />
                            <h3 className="text-xl font-bold text-gray-800">Package Details</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {currentDelivery.packageDetails.weight && (
                                <div>
                                    <p className="text-sm text-gray-600">Weight</p>
                                    <p className="font-semibold text-gray-800">{currentDelivery.packageDetails.weight} kg</p>
                                </div>
                            )}
                            {currentDelivery.packageDetails.dimensions && (
                                <div>
                                    <p className="text-sm text-gray-600">Dimensions</p>
                                    <p className="font-semibold text-gray-800">{currentDelivery.packageDetails.dimensions} cm</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-600">Fragile</p>
                                <p className="font-semibold text-gray-800">
                                    {currentDelivery.packageDetails.fragile ? (
                                        <span className="text-red-600">⚠️ Yes</span>
                                    ) : (
                                        <span className="text-green-600">No</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Images */}
                {currentDelivery.images && currentDelivery.images.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Package Images</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {currentDelivery.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Package ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                                    onClick={() => setSelectedImage(image)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* User Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Requester */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Requester</h3>
                        <div className="flex items-center mb-4">
                            {currentDelivery.requester?.avatar ? (
                                <img
                                    src={currentDelivery.requester.avatar}
                                    alt={currentDelivery.requester.name}
                                    className="w-16 h-16 rounded-full mr-4"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                                    <span className="text-primary-600 font-bold text-xl">
                                        {currentDelivery.requester?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-gray-800 text-lg">{currentDelivery.requester?.name}</p>
                                <div className="flex items-center text-yellow-500 text-sm">
                                    ⭐ {currentDelivery.requester?.rating?.toFixed(1) || 'New'}
                                    <span className="text-gray-500 ml-2">
                                        ({currentDelivery.requester?.completedDeliveries || 0} deliveries)
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                                <FaEnvelope className="mr-2" />
                                <span>{currentDelivery.requester?.email}</span>
                            </div>
                            {currentDelivery.requester?.phone && (
                                <div className="flex items-center text-gray-600">
                                    <FaPhone className="mr-2" />
                                    <span>{currentDelivery.requester.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Person */}
                    {currentDelivery.deliveryPerson && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Delivery Person</h3>
                            <div className="flex items-center mb-4">
                                {currentDelivery.deliveryPerson.avatar ? (
                                    <img
                                        src={currentDelivery.deliveryPerson.avatar}
                                        alt={currentDelivery.deliveryPerson.name}
                                        className="w-16 h-16 rounded-full mr-4"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                        <span className="text-green-600 font-bold text-xl">
                                            {currentDelivery.deliveryPerson.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-800 text-lg">{currentDelivery.deliveryPerson.name}</p>
                                    <div className="flex items-center text-yellow-500 text-sm">
                                        ⭐ {currentDelivery.deliveryPerson.rating?.toFixed(1) || 'New'}
                                        <span className="text-gray-500 ml-2">
                                            ({currentDelivery.deliveryPerson.completedDeliveries || 0} deliveries)
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <FaEnvelope className="mr-2" />
                                    <span>{currentDelivery.deliveryPerson.email}</span>
                                </div>
                                {currentDelivery.deliveryPerson.phone && (
                                    <div className="flex items-center text-gray-600">
                                        <FaPhone className="mr-2" />
                                        <span>{currentDelivery.deliveryPerson.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Timeline</h3>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <div className="bg-green-500 text-white rounded-full p-2 mr-4">
                                <FaCheckCircle />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Request Created</p>
                                <p className="text-sm text-gray-600">{formatDateTime(currentDelivery.createdAt)}</p>
                            </div>
                        </div>

                        {currentDelivery.acceptedAt && (
                            <div className="flex items-center">
                                <div className="bg-blue-500 text-white rounded-full p-2 mr-4">
                                    <FaCheckCircle />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Accepted</p>
                                    <p className="text-sm text-gray-600">{formatDateTime(currentDelivery.acceptedAt)}</p>
                                </div>
                            </div>
                        )}

                        {currentDelivery.completedAt && (
                            <div className="flex items-center">
                                <div className="bg-green-600 text-white rounded-full p-2 mr-4">
                                    <FaCheckCircle />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Completed</p>
                                    <p className="text-sm text-gray-600">{formatDateTime(currentDelivery.completedAt)}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center">
                            <div className={`${currentDelivery.status === 'completed'
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                                } text-white rounded-full p-2 mr-4`}>
                                <FaClock />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Delivery Deadline</p>
                                <p className="text-sm text-gray-600">{formatDateTime(currentDelivery.deliveryDeadline)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    {canAccept && (
                        <button
                            onClick={handleAccept}
                            className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-700 flex items-center justify-center space-x-2"
                        >
                            <FaTruck />
                            <span>Accept This Delivery</span>
                        </button>
                    )}

                    {isDeliveryPerson && currentDelivery.status === 'accepted' && (
                        <button
                            onClick={() => handleStatusUpdate('in_progress')}
                            className="w-full bg-yellow-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-yellow-700 flex items-center justify-center space-x-2"
                        >
                            <FaTruck />
                            <span>Start Delivery</span>
                        </button>
                    )}

                    {isDeliveryPerson && currentDelivery.status === 'in_progress' && (
                        <button
                            onClick={() => handleStatusUpdate('completed')}
                            className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                        >
                            <FaCheckCircle />
                            <span>Mark as Completed</span>
                        </button>
                    )}

                    {isRequester && currentDelivery.status === 'completed' && currentDelivery.paymentStatus !== 'paid' && (
                        <button
                            onClick={() => setShowPayment(true)}
                            className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700"
                        >
                            Proceed to Payment
                        </button>
                    )}
                </div>

                {/* Payment Modal */}
                {showPayment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Complete Payment</h2>
                                <button
                                    onClick={() => setShowPayment(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimesCircle size={24} />
                                </button>
                            </div>
                            <PaymentForm delivery={currentDelivery} onSuccess={handlePaymentSuccess} />
                        </div>
                    </div>
                )}

                {/* Image Modal */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <img
                            src={selectedImage}
                            alt="Package"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryDetails;