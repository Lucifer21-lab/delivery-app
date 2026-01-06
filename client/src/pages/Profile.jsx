import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../redux/slices/authSlice';
import { changePassword } from '../api/auth.api';
import { toast } from 'react-toastify';
import {
    FaUser, FaEnvelope, FaPhone, FaLock, FaStar, FaTruck, FaEdit,
    FaSave, FaTimes, FaCalendar, FaShieldAlt, FaCheckCircle, FaVenusMars, FaInfoCircle
} from 'react-icons/fa';


const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    console.log(user);

    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        gender: '',
        dob: '',
        description: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                gender: user.gender || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                description: user.description || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            // FIX IS HERE: This object now correctly includes all the editable fields.
            // When you click "Save Changes", this is the data that gets sent.
            const { name, gender, dob, description, avatar } = formData;
            await dispatch(updateProfile({ name, gender, dob, description, avatar })).unwrap();
            console.log('page -> Profile -> ', name, gender, dob, description);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error(error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully!');
            setShowPasswordForm(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            gender: user?.gender || '',
            dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
            description: user?.description || ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-lg text-gray-600 mt-1">Manage your account and delivery statistics.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start mb-8 pb-8 border-b border-gray-200">
                        <div className="relative mb-4 md:mb-0 md:mr-8 flex-shrink-0">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover" />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-md">
                                    <span className="text-white font-bold text-5xl">{user?.name?.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
                            <p className="text-gray-500 text-lg mt-1">{user?.email}</p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
                                <span className="px-4 py-1.5 text-sm font-semibold text-indigo-800 bg-indigo-100 rounded-full">
                                    {user?.role === 'admin' ? '👑 Admin' : '👤 Client'}
                                </span>
                                {user?.isEmailVerified && (
                                    <span className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
                                        <FaCheckCircle /> Verified
                                    </span>
                                )}
                            </div>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-4 md:mt-0 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 font-semibold"
                            >
                                <FaEdit /> Edit Profile
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <StatCard icon={FaStar} title="Rating" value={user?.rating?.toFixed(1) || 'N/A'} color="yellow" />
                        <StatCard icon={FaTruck} title="Completed" value={`${user?.completedDeliveries || 0} Deliveries`} color="green" />
                        <StatCard icon={FaCalendar} title="Member Since" value={new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} color="blue" />
                    </div>
                    {isEditing ? (
                        <ProfileEditForm formData={formData} handleChange={handleChange} handleUpdateProfile={handleUpdateProfile} handleCancelEdit={handleCancelEdit} loading={loading} />
                    ) : (
                        <ProfileInfo user={user} />
                    )}
                </div>

                <SecuritySettings
                    showPasswordForm={showPasswordForm}
                    setShowPasswordForm={setShowPasswordForm}
                    passwordData={passwordData}
                    handlePasswordChange={handlePasswordChange}
                    handleChangePassword={handleChangePassword}
                    loading={loading}
                />
            </div>
        </div>
    );
};

// --- Sub-components ---

const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-xl text-center transition hover:shadow-md`}>
        <Icon className={`text-4xl text-${color}-600 mx-auto mb-3`} />
        <p className="text-4xl font-bold text-gray-900">{value}</p>
        <p className="text-gray-600 font-medium mt-1">{title}</p>
    </div>
);

const ProfileInfo = ({ user }) => (
    <div className="space-y-4">
        <InfoField icon={FaEnvelope} label="Email Address" value={user?.email} isLocked={true} />
        <InfoField icon={FaPhone} label="Phone Number" value={user?.phone || 'Not provided'} isLocked={true} />
        <InfoField icon={FaVenusMars} label="Gender" value={user?.gender || 'Not specified'} />
        <InfoField icon={FaCalendar} label="Date of Birth" value={user?.dob ? new Date(user.dob).toLocaleDateString('en-CA') : 'Not specified'} />
        <InfoField icon={FaInfoCircle} label="About Me" value={user?.description || 'Not provided'} />
    </div>
);

const InfoField = ({ icon: Icon, label, value, isLocked = false }) => (
    <div className={`flex items-start p-4 bg-gray-50 rounded-lg ${isLocked ? 'cursor-not-allowed' : ''}`} title={isLocked ? 'This field cannot be changed.' : ''}>
        <Icon className="text-gray-400 text-xl mr-4 mt-1" />
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800 break-words">{value}</p>
        </div>
    </div>
);

const ProfileEditForm = ({ formData, handleChange, handleUpdateProfile, handleCancelEdit, loading }) => (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
        <InputWithIcon icon={FaEnvelope} name="email" label="Email Address" value={formData.email} readOnly disabled title="Email cannot be changed." />
        <InputWithIcon icon={FaPhone} name="phone" label="Phone Number" value={formData.phone || 'Not provided'} readOnly disabled title="Phone cannot be changed." />
        <InputWithIcon icon={FaUser} name="name" label="Full Name" value={formData.name} onChange={handleChange} required />
        <div>
            <label htmlFor="gender" className="block text-gray-700 font-semibold mb-2">Gender</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaVenusMars className="text-gray-400" /></div>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        </div>
        <InputWithIcon icon={FaCalendar} name="dob" type="date" label="Date of Birth" value={formData.dob} onChange={handleChange} />
        <div>
            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">About Me</label>
            <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} maxLength="500" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" placeholder="Tell us a little about yourself..."></textarea>
            <p className="text-right text-sm text-gray-500 mt-1">{formData.description ? formData.description.length : 0}/500</p>
        </div>
        <div className="flex gap-4 pt-2">
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2 transition-colors">
                <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={handleCancelEdit} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 flex items-center justify-center gap-2 transition-colors">
                <FaTimes /> Cancel
            </button>
        </div>
    </form>
);

const SecuritySettings = ({ showPasswordForm, setShowPasswordForm, passwordData, handlePasswordChange, handleChangePassword, loading }) => (
    <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
                <FaShieldAlt className="text-indigo-600 text-3xl mr-4" />
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Security</h3>
                    <p className="text-gray-600">Manage your password and account security.</p>
                </div>
            </div>
            {!showPasswordForm && (
                <button onClick={() => setShowPasswordForm(true)} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-semibold flex items-center gap-2">
                    <FaLock /> Change Password
                </button>
            )}
        </div>
        {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-6 pt-4 border-t">
                <InputWithIcon icon={FaLock} name="currentPassword" type="password" label="Current Password" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
                <InputWithIcon icon={FaLock} name="newPassword" type="password" label="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} required minLength={6} />
                <InputWithIcon icon={FaLock} name="confirmPassword" type="password" label="Confirm New Password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                <div className="flex gap-4 pt-2">
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button type="button" onClick={() => setShowPasswordForm(false)} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        )}
    </div>
);

const InputWithIcon = ({ icon: Icon, name, label, disabled, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-gray-700 font-semibold mb-2">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className="text-gray-400" />
            </div>
            <input id={name} name={name} {...props} disabled={disabled} className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
        </div>
    </div>
);

export default Profile;