import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = ({ delivery }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect after 5 seconds
        const timer = setTimeout(() => {
            navigate('/my-deliveries');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                    Your payment has been processed successfully.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600">Delivery Request</p>
                    <p className="font-bold text-lg">{delivery?.title}</p>
                </div>
                <button
                    onClick={() => navigate('/my-deliveries')}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700"
                >
                    View My Deliveries
                </button>
                <p className="text-sm text-gray-500 mt-4">
                    Redirecting in 5 seconds...
                </p>
            </div>
        </div>
    );
};

export default PaymentSuccess;