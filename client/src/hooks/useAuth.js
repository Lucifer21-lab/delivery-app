import { useSelector } from 'react-redux';

const useAuth = () => {
    const { user, isAuthenticated, loading, token } = useSelector((state) => state.auth);

    return {
        user,
        isAuthenticated,
        loading,
        token,
        isAdmin: user?.role === 'admin',
        isClient: user?.role === 'client'
    };
};

export default useAuth;
