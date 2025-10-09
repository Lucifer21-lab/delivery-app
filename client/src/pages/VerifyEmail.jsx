// In client/src/pages/VerifyEmail.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyEmail } from '../redux/slices/authSlice';
import { resendOtp } from '../api/auth.api';
import { toast } from 'react-toastify';
import { FaPaperPlane } from 'react-icons/fa';

const VerifyEmail = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // FIX: Read the email directly from session storage
    const email = sessionStorage.getItem('emailForVerification');

    useEffect(() => {
        // Redirect if the email is not found (e.g., user navigates directly)
        if (!email) {
            toast.error("Please register first.");
            navigate('/register');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            await dispatch(verifyEmail({ email, otp })).unwrap();

            // FIX: Clean up session storage on success
            sessionStorage.removeItem('emailForVerification');

            toast.success('Email verified successfully! Welcome!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await resendOtp({ email });
            toast.success('A new OTP has been sent to your email.');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <FaPaperPlane className="text-5xl text-indigo-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800">Verify Your Email</h1>
                    <p className="text-gray-600 mt-2">
                        An OTP has been sent to <strong>{email}</strong>. Please enter it below.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="otp" className="sr-only">OTP</label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full text-center text-2xl tracking-[1rem] py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="------"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {loading ? 'Verifying...' : 'Verify & Complete Registration'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Didn't receive the code?{' '}
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="font-semibold text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
                        >
                            {resending ? 'Sending...' : 'Resend OTP'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;