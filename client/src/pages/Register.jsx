import RegisterForm from '../components/auth/RegisterForm';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import { Link } from 'react-router-dom';

const Register = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join our delivery platform today</p>
                </div>

                <div className="bg-white rounded-lg shadow-xl p-8">
                    <RegisterForm />

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <GoogleAuthButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;