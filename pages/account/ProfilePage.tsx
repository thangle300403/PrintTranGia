



import React, { useState, useRef, useEffect } from 'react';
// FIX: Add 'roles' to the useData import
import { useData } from '../../context/DataContext';
import { User } from '../../types';
import { UploadIcon, PencilIcon, UserCircleIcon, CheckIcon, EyeIcon, EyeSlashIcon } from '../../components/icons/Icons';
import { Toast } from '../../components/Toast';

const ProfilePage: React.FC = () => {
    // FIX: Destructure 'roles' from useData
    const { currentUser, updateUser, changePassword, roles } = useData();
    const [profileData, setProfileData] = useState<Partial<User>>(currentUser || {});
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [toastMessage, setToastMessage] = useState('');
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    useEffect(() => {
        setProfileData(currentUser || {});
    }, [currentUser]);

    if (!currentUser) {
        return <div>Đang tải thông tin người dùng...</div>;
    }

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileData(prev => ({ ...prev, avatarUrl: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser(profileData as User);
        setToastMessage('Cập nhật thông tin thành công!');
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordData.new || passwordData.new !== passwordData.confirm) {
            alert('Mật khẩu mới không khớp hoặc bị bỏ trống. Vui lòng kiểm tra lại.');
            return;
        }
        if (passwordData.new.length < 6) {
            alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        const success = changePassword(passwordData.current, passwordData.new);

        if (success) {
            setToastMessage('Đã cập nhật mật khẩu thành công!');
            setPasswordData({ current: '', new: '', confirm: '' });
        } else {
            alert('Mật khẩu hiện tại không đúng. Vui lòng thử lại.');
        }
    };

    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const inputClass = "w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm";
    const readOnlyClass = "w-full p-2.5 border rounded-lg bg-gray-100 dark:bg-gray-900/50 border-gray-300 dark:border-gray-600 text-sm text-gray-500";


    return (
        <>
        <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thông tin tài khoản</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Information */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Thông tin cá nhân</h2>
                    <form onSubmit={handleProfileSave} className="space-y-6">
                        <div className="flex items-center gap-6">
                             <div className="relative w-24 h-24 rounded-full group flex-shrink-0">
                                {profileData.avatarUrl ? (
                                    <img src={profileData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <UserCircleIcon className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                                <div 
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <PencilIcon className="w-6 h-6 text-white" />
                                </div>
                                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            </div>
                            <div className="flex-grow">
                                <label className={labelClass}>Họ và tên</label>
                                <input name="name" value={profileData.name || ''} onChange={handleProfileChange} className={inputClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" value={profileData.email || ''} readOnly className={readOnlyClass} />
                            </div>
                             <div>
                                <label className={labelClass}>Số điện thoại</label>
                                <input name="phone" value={profileData.phone || ''} onChange={handleProfileChange} className={inputClass} />
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Vai trò</label>
                                {/* FIX: Display role name based on roleId */}
                                <input value={roles.find(r => r.id === profileData.roleId)?.name || ''} readOnly className={readOnlyClass} />
                            </div>
                             <div>
                                <label className={labelClass}>Ngày tham gia</label>
                                <input value={profileData.joiningDate ? new Date(profileData.joiningDate).toLocaleDateString('vi-VN') : ''} readOnly className={readOnlyClass} />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                            <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm">
                                <CheckIcon className="w-5 h-5"/>
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Change */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                     <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Đổi mật khẩu</h2>
                     <form onSubmit={handlePasswordSave} className="space-y-4">
                         <div>
                            <label className={labelClass}>Mật khẩu hiện tại</label>
                            <div className="relative">
                                <input name="current" type={showCurrentPassword ? 'text' : 'password'} value={passwordData.current} onChange={handlePasswordChange} className={`${inputClass} pr-10`} required />
                                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                         </div>
                         <div>
                            <label className={labelClass}>Mật khẩu mới</label>
                            <div className="relative">
                                <input name="new" type={showNewPassword ? 'text' : 'password'} value={passwordData.new} onChange={handlePasswordChange} className={`${inputClass} pr-10`} required />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    {showNewPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                         </div>
                         <div>
                            <label className={labelClass}>Xác nhận mật khẩu mới</label>
                            <div className="relative">
                                <input name="confirm" type={showConfirmPassword ? 'text' : 'password'} value={passwordData.confirm} onChange={handlePasswordChange} className={`${inputClass} pr-10`} required />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                         </div>
                         <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                            <button type="submit" className="w-full px-5 py-2.5 rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition">
                                Cập nhật mật khẩu
                            </button>
                        </div>
                     </form>
                </div>
            </div>
        </div>
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

export default ProfilePage;
