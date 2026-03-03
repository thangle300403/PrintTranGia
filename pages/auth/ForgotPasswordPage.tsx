
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';

const ForgotPasswordPage: React.FC = () => {
    const { requestPasswordReset, companyInfo } = useData();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            requestPasswordReset(email);
            // In a real app, you wouldn't navigate directly, but wait for the user to click an email link.
            // For this mock, we simulate success and move to the next step.
            setIsLoading(false);
            setSubmitted(true);
            // Simulate navigation to reset page
            setTimeout(() => navigate('/reset-password'), 1500);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <div className="text-center">
                    <img className="mx-auto h-12 w-auto" src={companyInfo.logoUrl} alt="Company Logo" />
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        Quên mật khẩu?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {submitted 
                            ? 'Yêu cầu đã được gửi. Chúng tôi đang chuyển hướng bạn...'
                            : 'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.'}
                    </p>
                </div>

                {!submitted ? (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Địa chỉ Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center text-green-600 bg-green-50 p-4 rounded-md">
                        <p>Nếu một tài khoản với email đó tồn tại, một liên kết đặt lại đã được gửi. Vui lòng kiểm tra email của bạn.</p>
                    </div>
                )}
                
                <div className="text-sm text-center">
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Quay lại trang Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
