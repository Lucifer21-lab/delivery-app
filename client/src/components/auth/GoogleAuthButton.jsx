import { FaGoogle } from 'react-icons/fa';

const GoogleAuthButton = () => {
    const handleGoogleAuth = () => {
        window.location.href = 'http://localhost:5000/api/auth/google';
    };

    return (
        <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
            <FaGoogle className="text-red-500" />
            <span>Continue with Google</span>
        </button>
    );
};

export default GoogleAuthButton;