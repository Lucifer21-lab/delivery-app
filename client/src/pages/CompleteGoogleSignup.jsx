const CompleteGoogleSignup = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ password: '', phone: '' });
    const googleData = JSON.parse(atob(searchParams.get('data')));

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Call a new backend endpoint (e.g., /api/auth/google/complete) 
        // passing googleData, formData.password, and formData.phone
        try {
            const response = await axios.post('/api/auth/google/complete', {
                ...googleData,
                ...formData
            });
            // Handle success: save tokens and navigate to dashboard
        } catch (err) {
            toast.error(err.response.data.error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Finish Signing Up, {googleData.name}</h2>
            <input type="tel" placeholder="Phone Number" required onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            <input type="password" placeholder="Create Password" required onChange={e => setFormData({ ...formData, password: e.target.value })} />
            <button type="submit">Create Account</button>
        </form>
    );
};

export default CompleteGoogleSignup;