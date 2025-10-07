import { useState } from 'react';
import { createPaymentOrder, verifyPayment } from '../../api/payment.api';
import { toast } from 'react-toastify';
import { formatPrice } from '../../utils/formatters';

const PaymentForm = ({ delivery, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error('Failed to load payment gateway');
                return;
            }

            // Create order
            const orderResponse = await createPaymentOrder(delivery._id);
            const { orderId, amount, currency, razorpayKeyId } = orderResponse.data;

            // Razorpay options
            const options = {
                key: razorpayKeyId,
                amount: amount,
                currency: currency,
                name: 'Delivery App',
                description: delivery.title,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // Verify payment
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        toast.success('Payment successful!');
                        onSuccess();
                    } catch (error) {
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: delivery.requester?.name || '',
                    email: delivery.requester?.email || '',
                    contact: delivery.requester?.phone || ''
                },
                theme: {
                    color: '#0ea5e9'
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response) {
                toast.error('Payment failed: ' + response.error.description);
            });

            razorpay.open();
        } catch (error) {
            toast.error('Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Payment Details</h3>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Amount:</span>
                    <span className="font-semibold">{formatPrice(delivery.price)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee:</span>
                    <span className="font-semibold">₹0</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-primary-600">{formatPrice(delivery.price)}</span>
                </div>
            </div>

            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400"
            >
                {loading ? 'Processing...' : 'Pay with Razorpay'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
                Secured by Razorpay
            </p>
        </div>
    );
};

export default PaymentForm;