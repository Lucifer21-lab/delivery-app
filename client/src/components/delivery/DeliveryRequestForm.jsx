import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createDelivery } from '../../redux/slices/deliverySlice';
import { validateDeliveryForm } from '../../utils/validation';
import FileUpload from '../common/FileUpload';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaClock, FaDollarSign, FaBox } from 'react-icons/fa';

const DeliveryRequestForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pickupAddress: '',
        deliveryAddress: '',
        acceptDeadline: '',
        deliveryDeadline: '',
        price: '',
        weight: '',
        dimensions: '',
        fragile: false
    });
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateDeliveryForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Please fix the errors in the form');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('pickupLocation', JSON.stringify({
            address: formData.pickupAddress
        }));
        formDataToSend.append('deliveryLocation', JSON.stringify({
            address: formData.deliveryAddress
        }));
        formDataToSend.append('packageDetails', JSON.stringify({
            weight: formData.weight,
            dimensions: formData.dimensions,
            fragile: formData.fragile
        }));
        formDataToSend.append('acceptDeadline', formData.acceptDeadline);
        formDataToSend.append('deliveryDeadline', formData.deliveryDeadline);
        formDataToSend.append('price', formData.price);

        images.forEach((image) => {
            formDataToSend.append('images', image);
        });

        setLoading(true);
        try {
            await dispatch(createDelivery(formDataToSend)).unwrap();
            toast.success('Delivery request created successfully!');
            navigate('/my-deliveries');
        } catch (error) {
            toast.error(error || 'Failed to create delivery request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Delivery Request</h2>

            {/* Title */}
            <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                    Title *
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="e.g., Deliver documents to office"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                    Description *
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Provide detailed information about the delivery"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Addresses */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                        <FaMapMarkerAlt className="inline mr-2" />
                        Pickup Address *
                    </label>
                    <input
                        type="text"
                        name="pickupAddress"
                        value={formData.pickupAddress}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.pickupAddress ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter pickup location"
                    />
                    {errors.pickupAddress && <p className="text-red-500 text-sm mt-1">{errors.pickupAddress}</p>}
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                        <FaMapMarkerAlt className="inline mr-2" />
                        Delivery Address *
                    </label>
                    <input
                        type="text"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter delivery location"
                    />
                    {errors.deliveryAddress && <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress}</p>}
                </div>
            </div>

            {/* Package Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                        <FaBox className="inline mr-2" />
                        Weight (kg)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="0.0"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                        Dimensions (L x W x H cm)
                    </label>
                    <input
                        type="text"
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., 30 x 20 x 10"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="fragile"
                        checked={formData.fragile}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 font-medium">Fragile Item</span>
                </label>
            </div>

            {/* Deadlines */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                        <FaClock className="inline mr-2" />
                        Accept Deadline *
                    </label>
                    <input
                        type="datetime-local"
                        name="acceptDeadline"
                        value={formData.acceptDeadline}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.acceptDeadline ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors.acceptDeadline && <p className="text-red-500 text-sm mt-1">{errors.acceptDeadline}</p>}
                    <p className="text-xs text-gray-500 mt-1">Last date for someone to accept</p>
                </div>

                <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                        <FaClock className="inline mr-2" />
                        Delivery Deadline *
                    </label>
                    <input
                        type="datetime-local"
                        name="deliveryDeadline"
                        value={formData.deliveryDeadline}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.deliveryDeadline ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors.deliveryDeadline && <p className="text-red-500 text-sm mt-1">{errors.deliveryDeadline}</p>}
                </div>
            </div>

            {/* Price */}
            <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                    <FaDollarSign className="inline mr-2" />
                    Price (₹) *
                </label>
                <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="0.00"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            {/* Images */}
            <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                    Package Images (Max 5)
                </label>
                <FileUpload onFilesSelected={setImages} maxFiles={5} />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-700 disabled:bg-gray-400 transition"
            >
                {loading ? 'Creating Request...' : 'Create Delivery Request'}
            </button>
        </form>
    );
};

export default DeliveryRequestForm;