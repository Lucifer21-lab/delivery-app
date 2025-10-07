import { Link } from 'react-router-dom';
import { FaTruck, FaCheckCircle, FaDollarSign, FaClock } from 'react-icons/fa';

const Home = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white py-28">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
                        Request & Accept Deliveries <br /> Made Easy
                    </h1>
                    <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto drop-shadow-md">
                        Create delivery requests or accept deliveries from others. Fast, reliable, and secure platform for all your delivery needs.
                    </p>
                    <div className="flex justify-center flex-wrap gap-4">
                        <Link
                            to="/register"
                            className="bg-white text-blue-600 px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/available-deliveries"
                            className="border-2 border-white text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all transform hover:-translate-y-1"
                        >
                            Browse Deliveries
                        </Link>
                    </div>
                </div>

                {/* Decorative background shapes */}
                <div className="absolute inset-0 -z-0 overflow-hidden">
                    <span className="absolute w-96 h-96 bg-purple-400 rounded-full opacity-30 top-0 left-1/4 animate-pulse"></span>
                    <span className="absolute w-72 h-72 bg-blue-400 rounded-full opacity-20 bottom-0 right-1/3 animate-pulse"></span>
                </div>
            </section>


            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
                        How It Works
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTruck className="text-4xl text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Create Request</h3>
                            <p className="text-gray-600">
                                Post your delivery request with pickup and drop-off details
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaClock className="text-4xl text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Set Deadline</h3>
                            <p className="text-gray-600">
                                Set acceptance and delivery deadlines for your request
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaCheckCircle className="text-4xl text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Get Accepted</h3>
                            <p className="text-gray-600">
                                Other users can accept your delivery request
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaDollarSign className="text-4xl text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
                            <p className="text-gray-600">
                                Pay securely through Razorpay payment gateway
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-20 text-white overflow-hidden">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto drop-shadow-md">
                        Join thousands of users who trust our platform for their delivery needs
                    </p>
                    <Link
                        to="/register"
                        className="bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 inline-block"
                    >
                        Create Your Account
                    </Link>
                </div>

                {/* Decorative background shapes */}
                <div className="absolute inset-0 -z-0 overflow-hidden">
                    <span className="absolute w-96 h-96 bg-purple-400 rounded-full opacity-30 top-0 left-1/4 animate-pulse"></span>
                    <span className="absolute w-72 h-72 bg-pink-400 rounded-full opacity-20 bottom-0 right-1/3 animate-pulse"></span>
                </div>
            </section>

        </div>
    );
};

export default Home;
