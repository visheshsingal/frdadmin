import axios from 'axios';
import React, { useState } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Change password states
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [changePasswordStep, setChangePasswordStep] = useState(1);
    const [changePasswordLoading, setChangePasswordLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [adminToken, setAdminToken] = useState('');
    const [otpCountdown, setOtpCountdown] = useState(0);

    // Countdown timer for OTP resend
    React.useEffect(() => {
        let timer;
        if (otpCountdown > 0) {
            timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [otpCountdown]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { email, password };
            const response = await axios.post(backendUrl + '/api/user/admin', payload);
            if (response.data.success) {
                const token = response.data.token;
                setToken(token);
                setAdminToken(token);
                localStorage.setItem('adminToken', token);
                toast.success('Login successful!');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!currentPassword) {
            toast.error('Please enter current password');
            return;
        }

        // Check if we have a token
        const token = adminToken || localStorage.getItem('adminToken');
        if (!token) {
            toast.error('Please login first to change password');
            return;
        }

        // Prevent multiple clicks
        if (changePasswordLoading) return;

        setChangePasswordLoading(true);
        
        try {
            const response = await axios.post(
                backendUrl + '/api/user/admin/change-password/send-otp',
                { currentPassword },
                { 
                    headers: { token: token },
                    timeout: 25000
                }
            );
            
            if (response.data.success) {
                setChangePasswordStep(2);
                setOtpCountdown(30); // 30 second countdown for resend
                toast.success('OTP sent to vishesh.singal.contact@gmail.com');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log('OTP Error:', error);
            
            if (error.response?.status === 401) {
                if (error.response?.data?.message === 'Current password is incorrect') {
                    toast.error('Current password is incorrect');
                } else {
                    toast.error('Session expired. Please login again.');
                    setAdminToken('');
                    localStorage.removeItem('adminToken');
                    setShowChangePassword(false);
                }
            } else if (error.response?.status === 500) {
                toast.error(error.response?.data?.message || 'Server error. Please try again later.');
            } else {
                toast.error('Network error. Please check your connection and try again.');
            }
        } finally {
            setChangePasswordLoading(false);
        }
    };

    const handleVerifyOTPAndChangePassword = async () => {
        if (!otp) {
            toast.error('Please enter OTP');
            return;
        }
        if (!newPassword || !confirmPassword) {
            toast.error('Please enter new password and confirmation');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        // Enhanced password validation on frontend
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            let errorMessage = "Password must contain:";
            if (!passwordValidation.minLength) errorMessage += " at least 8 characters,";
            if (!passwordValidation.hasUpperCase) errorMessage += " one uppercase letter,";
            if (!passwordValidation.hasLowerCase) errorMessage += " one lowercase letter,";
            if (!passwordValidation.hasTwoSpecialChars) errorMessage += " at least two special characters,";
            errorMessage = errorMessage.slice(0, -1) + '.';
            toast.error(errorMessage);
            return;
        }

        const token = adminToken || localStorage.getItem('adminToken');
        if (!token) {
            toast.error('Please login first to change password');
            return;
        }

        setChangePasswordLoading(true);
        try {
            const response = await axios.post(
                backendUrl + '/api/user/admin/change-password/verify',
                {
                    currentPassword,
                    newPassword,
                    confirmPassword,
                    otp
                },
                { 
                    headers: { token: token },
                    timeout: 15000
                }
            );
            
            if (response.data.success) {
                toast.success('Password changed successfully!');
                setShowChangePassword(false);
                resetChangePasswordForm();
                setPassword('');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log('Change Password Error:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                setAdminToken('');
                localStorage.removeItem('adminToken');
                setShowChangePassword(false);
            } else if (error.code === 'ECONNABORTED') {
                toast.error('Request timeout. Please try again.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to change password');
            }
        } finally {
            setChangePasswordLoading(false);
        }
    };

    // Frontend password validation helper
    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const specialChars = password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
        const hasTwoSpecialChars = specialChars && specialChars.length >= 2;

        return {
            isValid: minLength && hasUpperCase && hasLowerCase && hasTwoSpecialChars,
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasTwoSpecialChars
        };
    };

    const resetChangePasswordForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setOtp('');
        setChangePasswordStep(1);
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setOtpCountdown(0);
    };

    const handleCancelChangePassword = () => {
        setShowChangePassword(false);
        resetChangePasswordForm();
    };

    const handleChangePasswordClick = () => {
        const token = adminToken || localStorage.getItem('adminToken');
        if (!token) {
            toast.error('Please login first to change password');
            return;
        }
        setShowChangePassword(true);
    };

    return (
        <div className='min-h-screen flex items-center justify-center w-full bg-white'>
            <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md border border-gray-200'>
                <h1 className='text-2xl font-bold mb-6 text-[#052659] text-center'>
                    {showChangePassword ? 'Change Admin Password' : 'Admin Panel Login'}
                </h1>

                {!showChangePassword ? (
                    // Login Form
                    <form onSubmit={onSubmitHandler}>
                        <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-[#052659]'
                                type="email"
                                placeholder='vishesh.singal.contact@gmail.com'
                                required
                            />
                        </div>

                        <div className='mb-6'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                            <div className='relative'>
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    className='rounded-md w-full px-3 py-2 pr-10 border border-gray-300 outline-none focus:ring-2 focus:ring-[#052659]'
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Admin password'
                                    required
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-600'
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <button
                            className='w-full py-2 px-4 rounded-md text-white bg-[#052659] hover:bg-[#041d47] transition disabled:opacity-50 font-medium mb-4'
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Logging in...
                                </div>
                            ) : (
                                'Login to Admin Panel'
                            )}
                        </button>

                        {(adminToken || localStorage.getItem('adminToken')) && (
                            <div className='text-center'>
                                <button
                                    type='button'
                                    onClick={handleChangePasswordClick}
                                    className='text-sm text-[#052659] hover:text-[#041d47] underline'
                                >
                                    Change Admin Password
                                </button>
                            </div>
                        )}
                    </form>
                ) : (
                    // Change Password Form
                    <div>
                        {changePasswordStep === 1 && (
                            <div>
                                <div className='mb-4'>
                                    <p className='text-sm font-medium text-gray-700 mb-2'>Current Password</p>
                                    <div className='relative'>
                                        <input
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className='rounded-md w-full px-3 py-2 pr-10 border border-gray-300 outline-none focus:ring-2 focus:ring-[#052659]'
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder='Enter current password'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className='absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-600'
                                        >
                                            {showCurrentPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>

                                <div className='flex gap-2'>
                                    <button
                                        type='button'
                                        onClick={handleSendOTP}
                                        disabled={changePasswordLoading || otpCountdown > 0}
                                        className='flex-1 py-2 px-4 rounded-md text-white bg-[#052659] hover:bg-[#041d47] transition disabled:opacity-50'
                                    >
                                        {changePasswordLoading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Sending OTP...
                                            </div>
                                        ) : otpCountdown > 0 ? (
                                            `Resend OTP in ${otpCountdown}s`
                                        ) : (
                                            'Send OTP'
                                        )}
                                    </button>
                                    <button
                                        type='button'
                                        onClick={handleCancelChangePassword}
                                        className='flex-1 py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition'
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {changePasswordStep === 2 && (
                            <div>
                                <div className='mb-4'>
                                    <p className='text-sm font-medium text-gray-700 mb-2'>
                                        OTP Sent to vishesh.singal.contact@gmail.com
                                        {otpCountdown > 0 && (
                                            <span className='text-xs text-gray-500 ml-2'>
                                                (Resend available in ${otpCountdown}s)
                                            </span>
                                        )}
                                    </p>
                                    <input
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-[#052659]'
                                        type="text"
                                        placeholder='Enter OTP'
                                        maxLength={6}
                                    />
                                </div>

                                <div className='mb-4'>
                                    <p className='text-sm font-medium text-gray-700 mb-2'>New Password</p>
                                    <div className='relative'>
                                        <input
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className='rounded-md w-full px-3 py-2 pr-10 border border-gray-300 outline-none focus:ring-2 focus:ring-[#052659]'
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder='Enter new password'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className='absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-600'
                                        >
                                            {showNewPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                    <p className='text-xs text-gray-500 mt-1'>
                                        Must contain: 8+ chars, uppercase, lowercase, and 2+ special characters
                                    </p>
                                </div>

                                <div className='mb-6'>
                                    <p className='text-sm font-medium text-gray-700 mb-2'>Confirm New Password</p>
                                    <div className='relative'>
                                        <input
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className='rounded-md w-full px-3 py-2 pr-10 border border-gray-300 outline-none focus:ring-2 focus:ring-[#052659]'
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder='Confirm new password'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className='absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-600'
                                        >
                                            {showConfirmPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>

                                <div className='flex gap-2'>
                                    <button
                                        type='button'
                                        onClick={handleVerifyOTPAndChangePassword}
                                        disabled={changePasswordLoading}
                                        className='flex-1 py-2 px-4 rounded-md text-white bg-[#052659] hover:bg-[#041d47] transition disabled:opacity-50'
                                    >
                                        {changePasswordLoading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Changing Password...
                                            </div>
                                        ) : (
                                            'Change Password'
                                        )}
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setChangePasswordStep(1)}
                                        disabled={changePasswordLoading}
                                        className='flex-1 py-2 px-4 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50'
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;