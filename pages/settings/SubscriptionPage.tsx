
import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { SubscriptionStatus, UserPaymentMethod } from '../../types';
import { CreditCardIcon, BankIcon, ClockIcon, CheckCircleIcon, PencilIcon, TrashIcon } from '../../components/icons/Icons';
import { PaymentMethodModal } from '../../components/settings/PaymentMethodModal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';

// Checkmark icon for features list
const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
    </svg>
);

// Mock Payment History Data
const MOCK_PAYMENT_HISTORY = [
    { id: 'inv_003', date: '2025-01-01', description: 'Gia hạn Gói Advanced (1 năm)', amount: 11988000, status: 'Thành công' },
    { id: 'inv_002', date: '2024-01-01', description: 'Gia hạn Gói Standard (1 năm)', amount: 5988000, status: 'Thành công' },
    { id: 'inv_001', date: '2023-01-01', description: 'Đăng ký mới Gói Standard (1 năm)', amount: 5988000, status: 'Thành công' },
];

const SubscriptionPage: React.FC = () => {
    const { companyInfo, plans, updateSubscriptionPlan, currentUser, rolePermissions, userPaymentMethods, addUserPaymentMethod, updateUserPaymentMethod, deleteUserPaymentMethod } = useData();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<Partial<UserPaymentMethod> | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [toast, setToast] = useState('');
    
    // Local state for Auto Renew simulation
    const [isAutoRenew, setIsAutoRenew] = useState(true);

    const canManage = useMemo(() => {
        if (!currentUser) return false;
        const perms = rolePermissions[currentUser.roleId] || [];
        return perms.includes('manage_subscription');
    }, [currentUser, rolePermissions]);

    if (!canManage) {
         return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Bạn không có quyền truy cập trang này.</p>
            </div>
        );
    }

    const handleSelectPlan = (planId: string) => {
        const selectedPlan = plans.find(p => p.id === planId);
        if (!selectedPlan) return;
        
        let confirmMessage = `Bạn có chắc chắn muốn chuyển sang gói "${selectedPlan.name}" không?`;
        // Renewal logic
        if (companyInfo.subscriptionStatus === SubscriptionStatus.Expired && planId === companyInfo.subscriptionPlanId) {
             confirmMessage = `Bạn có chắc chắn muốn gia hạn gói "${selectedPlan.name}" không?`;
        }

        if (window.confirm(confirmMessage)) {
            updateSubscriptionPlan(planId);
            alert('Đã cập nhật gói thành công!');
        }
    };
    
    // Determine button text, style, and action based on plan status
    const getButtonProps = (planId: string) => {
        const isCurrentPlan = companyInfo.subscriptionPlanId === planId;
        const isExpired = companyInfo.subscriptionStatus === SubscriptionStatus.Expired;
        
        let text: string;
        let className = 'w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 ease-in-out text-sm';
        let action = () => handleSelectPlan(planId);
        let disabled = false;
        
        const plan = plans.find(p => p.id === planId);

        if (isCurrentPlan) {
            if (isExpired) {
                text = 'Gia hạn ngay'; // Renewal text
                className += ' bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg';
            } else {
                text = 'Đang sử dụng';
                className += ' bg-green-100 text-green-700 cursor-default border border-green-200';
                disabled = true;
                action = () => {};
            }
        } else {
            text = 'Nâng cấp ngay'; 
            if (plan?.id === 'plan_support') {
                 text = 'Chọn gói này';
                 className += ' bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';
            } else if (plan?.popular) {
                 className += ' bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30';
            } else { // advanced
                 className += ' bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg';
            }
        }
        
        return { text, className, action, disabled };
    };

    const handleSavePaymentMethod = (data: Omit<UserPaymentMethod, 'id'> | UserPaymentMethod) => {
        if ('id' in data) {
            updateUserPaymentMethod(data as UserPaymentMethod);
            setToast('Cập nhật phương thức thanh toán thành công.');
        } else {
            addUserPaymentMethod(data as Omit<UserPaymentMethod, 'id'>);
            setToast('Đã thêm phương thức thanh toán mới.');
        }
        setIsPaymentModalOpen(false);
        setEditingMethod(null);
    };

    const handleDeletePaymentMethod = () => {
        if (confirmDeleteId) {
            deleteUserPaymentMethod(confirmDeleteId);
            setToast('Đã xóa phương thức thanh toán.');
            setConfirmDeleteId(null);
        }
    };

    const handleSetDefault = (method: UserPaymentMethod) => {
        if (!method.isDefault) {
            updateUserPaymentMethod({ ...method, isDefault: true });
            setToast('Đã đặt làm phương thức thanh toán mặc định.');
        }
    };

    const handleToggleAutoRenew = () => {
        const newValue = !isAutoRenew;
        setIsAutoRenew(newValue);
        setToast(newValue ? 'Đã BẬT tự động gia hạn.' : 'Đã TẮT tự động gia hạn.');
    };

    const currentPlan = plans.find(p => p.id === companyInfo.subscriptionPlanId);
    const isExpired = companyInfo.subscriptionStatus === SubscriptionStatus.Expired;

    return (
        <>
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Gói & Thanh toán</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Plan Overview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CheckCircleIcon className="w-32 h-32 text-blue-600" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Gói hiện tại</h2>
                            <div className="flex items-baseline gap-3 mb-4">
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{currentPlan?.name || 'Chưa đăng ký'}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {companyInfo.subscriptionStatus}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Ngày hết hạn</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                                        {new Date(companyInfo.subscriptionExpiryDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    
                                    {/* Auto Renew Toggle */}
                                    {!isExpired && (
                                        <div className="mt-4 flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 w-fit">
                                            <button 
                                                onClick={handleToggleAutoRenew}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isAutoRenew ? 'bg-blue-600' : 'bg-gray-300'}`}
                                            >
                                                <span className={`${isAutoRenew ? 'translate-x-4' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition`}/>
                                            </button>
                                            <div className="ml-3">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 block">
                                                    Tự động gia hạn: {isAutoRenew ? <span className="text-blue-600">BẬT</span> : <span className="text-gray-500">TẮT</span>}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Dung lượng lưu trữ</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-1">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                        <span>4.5 GB đã dùng</span>
                                        <span>10 GB tổng</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <CreditCardIcon className="w-5 h-5 text-gray-500"/> Phương thức thanh toán
                            </h2>
                            <button onClick={() => { setEditingMethod(null); setIsPaymentModalOpen(true); }} className="text-sm font-semibold text-blue-600 hover:text-blue-700">+ Thêm mới</button>
                        </div>
                        <div className="space-y-3">
                            {userPaymentMethods.map(method => (
                                <div key={method.id} className="group relative p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {method.type === 'card' ? (
                                                <>
                                                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600">{method.card?.brand.toUpperCase()}</div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{method.card?.brand} kết thúc bằng {method.card?.last4}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Hết hạn {method.card?.expiryMonth}/{method.card?.expiryYear}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-600"><BankIcon className="w-5 h-5"/></div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Chuyển khoản ngân hàng</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{method.bank?.bankName} ****{method.bank?.accountLast4}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {method.isDefault && (
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">Mặc định</span>
                                        )}
                                    </div>
                                    <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {method.type === 'card' && <button onClick={() => { setEditingMethod(method); setIsPaymentModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>}
                                        {!method.isDefault && <button onClick={() => handleSetDefault(method)} className="text-xs font-semibold text-gray-600 hover:text-green-600">Đặt làm mặc định</button>}
                                        {!method.isDefault && <button onClick={() => setConfirmDeleteId(method.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                     {/* Payment History */}
                     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                             <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <ClockIcon className="w-5 h-5 text-gray-500"/> Lịch sử thanh toán
                            </h2>
                            <button className="text-sm text-gray-500 hover:text-gray-700">Xem tất cả</button>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mô tả</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Số tiền</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {MOCK_PAYMENT_HISTORY.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.date).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{payment.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">{payment.amount.toLocaleString('vi-VN')} đ</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="lg:col-span-1">
                     <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Các gói dịch vụ</h2>
                     <div className="space-y-6">
                        {plans.map(plan => {
                            const buttonProps = getButtonProps(plan.id);
                            const isCurrent = companyInfo.subscriptionPlanId === plan.id;
                            return (
                                <div 
                                    key={plan.id} 
                                    className={`bg-white dark:bg-gray-800 rounded-xl p-6 transition-all duration-300 relative
                                        ${plan.popular ? 'border-2 border-blue-500 ring-4 ring-blue-50 shadow-xl z-10' : 'border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'}
                                        ${isCurrent ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}
                                    `}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                                            Khuyên dùng
                                        </div>
                                    )}

                                    <div className="text-center mb-4">
                                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{plan.name}</h3>
                                        <div className="mt-2 flex items-baseline justify-center gap-1">
                                            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{plan.price.toLocaleString('vi-VN')}</span>
                                            <span className="text-sm text-gray-500 font-medium">/tháng</span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">{plan.subtext[0]}</div>
                                    </div>
                                    
                                    <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>

                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                                <CheckIcon />
                                                <span className="ml-2 leading-tight">{feature.text} {feature.isNew && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1 font-bold">MỚI</span>}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button onClick={buttonProps.action} disabled={buttonProps.disabled} className={buttonProps.className}>
                                        {buttonProps.text}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
        {isPaymentModalOpen && <PaymentMethodModal method={editingMethod} onClose={() => setIsPaymentModalOpen(false)} onSave={handleSavePaymentMethod} />}
        <ConfirmationModal isOpen={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} onConfirm={handleDeletePaymentMethod} title="Xóa Phương thức" message="Bạn có chắc chắn muốn xóa phương thức thanh toán này?" />
        {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
};

export default SubscriptionPage;
