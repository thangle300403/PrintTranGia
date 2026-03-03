
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Gender, MaritalStatus, EmploymentStatus, PERMISSION_NAMES, Permission, OrderStatus } from '../../types';
import { UserCircleIcon, CheckCircleIcon, PlusIcon, CloseIcon, UploadIcon, UserGroupIcon, CreditCardIcon, DocumentTextIcon, CheckIcon, KeyIcon, CalculatorIcon, RevenueIcon } from '../icons/Icons';
import { useData } from '../../context/DataContext';
import DatePicker from '../DatePicker';
import FormattedNumberInput from '../FormattedNumberInput';

interface UserModalProps {
  user: Partial<User> | null;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'joiningDate'> | User, saveAndNew: boolean) => void;
}

type TabType = 'basic' | 'role' | 'profile';

// Helper to group permissions
const PERMISSION_GROUPS = {
    'Kinh doanh': ['create_quotes', 'approve_quotes', 'manage_orders', 'manage_customers', 'manage_promotions', 'manage_contracts', 'use_pos'],
    'Sản xuất & Kho': ['manage_production_orders', 'view_products', 'manage_inventory_conversion', 'view_materials', 'view_raw_materials', 'manage_purchasing', 'manage_bom'],
    'Kế toán': ['manage_invoices', 'view_accounting', 'manage_cash_fund', 'manage_costing_rules', 'view_commissions'],
    'Hệ thống': ['manage_users', 'manage_company_info', 'view_logs', 'manage_integration', 'manage_print_templates', 'manage_menu', 'manage_custom_modules']
};

export const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
  const { roles, commissionPolicies, orders } = useData();
  const isEditMode = !!user?.id;
  const defaultRoleId = roles.length > 0 ? roles[roles.length - 1].id : ''; 
  
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState<Partial<User>>(
    user || { 
      name: '', email: '', phone: '', roleId: defaultRoleId, status: 'Active', 
      avatarUrl: '', allowAppAccess: true, maritalStatus: MaritalStatus.Single,
      gender: Gender.Male, employmentStatus: EmploymentStatus.Official,
      jobPosition: 'Nhân viên', salary: 0, deposit: 0
    }
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Commission Calculation State
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  const [calcStartDate, setCalcStartDate] = useState(firstDay);
  const [calcEndDate, setCalcEndDate] = useState(lastDay);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
        setFormData({
            ...user,
            maritalStatus: user.maritalStatus || MaritalStatus.Single,
            gender: user.gender || Gender.Male,
            employmentStatus: user.employmentStatus || EmploymentStatus.Official,
            allowAppAccess: user.allowAppAccess ?? true,
            jobPosition: user.jobPosition || 'Ban giám đốc',
            salary: user.salary || 0,
            deposit: user.deposit || 0
        });
    }
  }, [user]);

  const selectedRole = useMemo(() => roles.find(r => r.id === formData.roleId), [roles, formData.roleId]);

   // Calculate Commission Data
   const commissionData = useMemo(() => {
    if (!isEditMode || !formData.id || !formData.commissionPolicyId) return null;

    const policy = commissionPolicies.find(p => p.id === formData.commissionPolicyId);
    if (!policy) return null;

    const start = new Date(calcStartDate); start.setHours(0, 0, 0, 0);
    const end = new Date(calcEndDate); end.setHours(23, 59, 59, 999);

    const eligibleOrders = orders.filter(o => 
        o.customer.assignedToUserId === formData.id &&
        (o.status === OrderStatus.Paid || o.status === OrderStatus.Delivered) &&
        new Date(o.orderDate) >= start && 
        new Date(o.orderDate) <= end
    );

    const totalRevenue = eligibleOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    // Find applicable tier
    const applicableTier = [...policy.tiers]
        .sort((a, b) => b.revenueThreshold - a.revenueThreshold)
        .find(tier => totalRevenue >= tier.revenueThreshold);
    
    const commissionRate = applicableTier ? applicableTier.commissionRate : 0;
    const commissionAmount = totalRevenue * (commissionRate / 100);
    const baseSalary = formData.salary || 0;
    const totalIncome = baseSalary + commissionAmount;

    return {
        policyName: policy.name,
        orderCount: eligibleOrders.length,
        totalRevenue,
        commissionRate,
        commissionAmount,
        baseSalary,
        totalIncome
    };
  }, [formData.id, formData.commissionPolicyId, formData.salary, orders, commissionPolicies, calcStartDate, calcEndDate, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleNumberChange = (name: 'salary' | 'deposit', value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          avatarUrl: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
      setFormData(prev => ({ ...prev, avatarUrl: '' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleSave = (saveAndNew: boolean = false) => {
    if (!formData.name || !formData.id) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }
    
    const dataToSave = { ...formData };
    if (isResettingPassword || !isEditMode) {
        if (password && password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (password && password !== confirmPassword) {
            alert('Xác nhận mật khẩu không khớp.');
            return;
        }
        if (password) dataToSave.password = password;
    }

    onSave(dataToSave as User, saveAndNew);
    if (!saveAndNew) {
        onClose();
    } else {
        setFormData({ 
          name: '', email: '', phone: '', roleId: defaultRoleId, status: 'Active', 
          avatarUrl: '', allowAppAccess: true, maritalStatus: MaritalStatus.Single,
          gender: Gender.Male, employmentStatus: EmploymentStatus.Official,
          jobPosition: 'Ban giám đốc', salary: 0, deposit: 0
        });
        setPassword('');
        setConfirmPassword('');
        setActiveTab('basic');
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-shadow dark:bg-gray-700 dark:border-gray-600 dark:text-white";
  const labelClass = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide";
  const sectionTitleClass = "text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 border-b pb-2 dark:border-gray-700";

  const tabs = [
      { id: 'basic', label: 'Thông tin cơ bản' },
      { id: 'role', label: 'Vai trò & Quyền hạn' },
      { id: 'profile', label: 'Thông tin hồ sơ' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden max-h-[95vh] animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quản lý thông tin và quyền truy cập hệ thống</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><CloseIcon className="w-6 h-6"/></button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b dark:border-gray-700 px-6 bg-gray-50 dark:bg-gray-900/30">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`px-4 py-3 text-sm font-medium transition-all relative top-[1px] border-b-2 ${
                        activeTab === tab.id 
                        ? 'text-blue-600 border-blue-600 bg-white dark:bg-gray-800 rounded-t-lg' 
                        : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-gray-800">
            {activeTab === 'basic' && (
                <div className="flex flex-col-reverse lg:flex-row gap-8">
                    {/* Left Column: Inputs */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                         <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 text-center">
                            Mã nhân viên, Email hoặc SĐT có thể được sử dụng làm tên đăng nhập.
                        </div>

                        <div>
                            <label className={labelClass}>Mã nhân viên <span className="text-red-500">*</span></label>
                            <input name="id" value={formData.id || ''} onChange={handleChange} className={`${inputClass} font-mono`} required disabled={isEditMode} placeholder="VD: NV001" />
                        </div>
                        
                        <div>
                            <label className={labelClass}>Tên nhân viên <span className="text-red-500">*</span></label>
                            <input name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} required placeholder="VD: Nguyễn Văn A" />
                        </div>

                        <div>
                            <label className={labelClass}>Email</label>
                            <input name="email" value={formData.email || ''} onChange={handleChange} className={inputClass} placeholder="email@example.com" />
                        </div>
                        
                        <div>
                            <label className={labelClass}>Điện thoại</label>
                            <input name="phone" value={formData.phone || ''} onChange={handleChange} className={inputClass} placeholder="090..." />
                        </div>

                        <div>
                            <label className={labelClass}>Trạng thái làm việc</label>
                            <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className={inputClass}>
                                {Object.values(EmploymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Trạng thái tài khoản</label>
                             <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                <option value="Active">Đang hoạt động</option>
                                <option value="Disabled">Đã khóa</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 pt-2 border-t dark:border-gray-700">
                             <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-white">Thiết lập mật khẩu & Truy cập</h4>
                                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">
                                    <input name="allowAppAccess" type="checkbox" checked={formData.allowAppAccess} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                    Cho phép đăng nhập phần mềm
                                </label>
                             </div>
                             
                             {(isResettingPassword || !isEditMode) ? (
                                <div className="grid grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-all">
                                    <div>
                                        <label className={labelClass}>Mật khẩu mới</label>
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Xác nhận mật khẩu</label>
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} placeholder="••••••" />
                                    </div>
                                     {isEditMode && (
                                        <div className="col-span-2 text-right">
                                            <button type="button" onClick={() => { setIsResettingPassword(false); setPassword(''); setConfirmPassword(''); }} className="text-xs text-red-600 hover:underline">Hủy đổi mật khẩu</button>
                                        </div>
                                    )}
                                </div>
                             ) : (
                                 <button type="button" onClick={() => setIsResettingPassword(true)} className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
                                     <KeyIcon className="w-4 h-4" />
                                     Đổi mật khẩu đăng nhập
                                 </button>
                             )}
                        </div>

                         <div className="md:col-span-2 pt-2 border-t dark:border-gray-700">
                             <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Thông tin định danh</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Số CMND/CCCD</label>
                                    <input name="cmnd" value={formData.cmnd || ''} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Ngày sinh</label>
                                    <DatePicker value={formData.birthday || ''} onChange={v => setFormData(p => ({...p, birthday: v}))} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Giới tính</label>
                                    <div className="flex gap-4 items-center h-[38px]">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                                            <input type="radio" name="gender" value={Gender.Male} checked={formData.gender === Gender.Male} onChange={handleChange} className="text-blue-600 focus:ring-blue-500" /> Nam
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                                            <input type="radio" name="gender" value={Gender.Female} checked={formData.gender === Gender.Female} onChange={handleChange} className="text-blue-600 focus:ring-blue-500" /> Nữ
                                        </label>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>

                    {/* Right Column: Avatar */}
                    <div className="w-full lg:w-64 flex-shrink-0 flex flex-col items-center">
                        <label className={`${labelClass} text-center mb-3`}>Ảnh đại diện</label>
                        <div className="w-full aspect-[3/4] bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center overflow-hidden group relative transition-colors hover:border-blue-400">
                            {formData.avatarUrl ? (
                                <>
                                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-white rounded-full shadow-sm text-xs font-bold text-gray-700 hover:bg-gray-100">Thay ảnh</button>
                                        <button type="button" onClick={handleRemoveImage} className="px-3 py-1.5 bg-red-500 rounded-full shadow-sm text-xs font-bold text-white hover:bg-red-600">Xóa</button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-4" onClick={() => fileInputRef.current?.click()}>
                                    <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">Chưa có ảnh</p>
                                    <button type="button" className="mt-2 text-xs font-semibold text-blue-600 hover:underline">Tải ảnh lên</button>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-2 px-4">Định dạng: .jpg, .png. Dung lượng tối đa 2MB.</p>
                    </div>
                </div>
            )}

            {activeTab === 'role' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                     <div className="flex flex-col gap-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h4 className={sectionTitleClass}><UserGroupIcon className="w-5 h-5 text-blue-600"/> Vai trò Hệ thống</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Chọn Vai trò</label>
                                    <select name="roleId" value={formData.roleId} onChange={handleChange} className={inputClass}>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-sm">
                                    <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Mô tả vai trò:</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-400">
                                        {selectedRole?.description || 'Chưa có mô tả cho vai trò này.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h4 className={sectionTitleClass}><CreditCardIcon className="w-5 h-5 text-green-600"/> Chính sách Hoa hồng</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Áp dụng Chính sách</label>
                                    <select name="commissionPolicyId" value={formData.commissionPolicyId || ''} onChange={handleChange} className={inputClass}>
                                        <option value="">-- Không áp dụng --</option>
                                        {commissionPolicies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                {formData.commissionPolicyId && (
                                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800 text-sm">
                                        <p className="font-semibold text-green-800 dark:text-green-300 mb-1">Chi tiết chính sách:</p>
                                        <p className="text-xs text-green-700 dark:text-green-400">
                                            Doanh thu sẽ được tính toán tự động dựa trên các đơn hàng hoàn thành của nhân viên này để tính thưởng hoa hồng cuối kỳ.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                             <CheckIcon className="w-5 h-5 text-gray-600" />
                             Chi tiết Quyền hạn ({selectedRole?.name})
                        </h4>
                        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {Object.entries(PERMISSION_GROUPS).map(([groupName, perms]) => (
                                <div key={groupName} className="mb-4">
                                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">{groupName}</h5>
                                    <div className="space-y-2">
                                        {perms.map(permKey => {
                                            const hasPermission = selectedRole?.permissions.includes(permKey as Permission);
                                            return (
                                                <div key={permKey} className={`flex items-center justify-between p-2 rounded-lg text-sm ${hasPermission ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-600' : 'opacity-50'}`}>
                                                    <span className="text-gray-700 dark:text-gray-300">{PERMISSION_NAMES[permKey as Permission] || permKey}</span>
                                                    {hasPermission ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <span className="w-4 h-4 block rounded-full border border-gray-300"></span>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 italic mt-3 text-center">
                            * Quyền hạn được thiết lập trong phần Quản lý Vai trò (dành cho Admin).
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="space-y-8">
                     {/* Công việc */}
                    <div>
                         <h4 className={sectionTitleClass}><DocumentTextIcon className="w-5 h-5 text-indigo-600"/> Thông tin Công việc</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div>
                                <label className={labelClass}>Vị trí công việc</label>
                                <select name="jobPosition" value={formData.jobPosition} onChange={handleChange} className={inputClass}>
                                    <option value="Ban giám đốc">Ban giám đốc</option>
                                    <option value="Trưởng phòng">Trưởng phòng</option>
                                    <option value="Nhân viên kinh doanh">Nhân viên kinh doanh</option>
                                    <option value="Kỹ thuật / Thiết kế">Kỹ thuật / Thiết kế</option>
                                    <option value="Sản xuất">Sản xuất</option>
                                    <option value="Kế toán">Kế toán</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Ngày thử việc</label>
                                <DatePicker value={formData.probationDate || ''} onChange={v => setFormData(p => ({...p, probationDate: v}))} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Ngày chính thức</label>
                                <DatePicker value={formData.officialDate || ''} onChange={v => setFormData(p => ({...p, officialDate: v}))} className={inputClass} />
                            </div>
                         </div>
                    </div>

                    {/* Lương & Hồ sơ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className={sectionTitleClass}><CreditCardIcon className="w-5 h-5 text-orange-600"/> Chế độ Lương & Đặt cọc</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Lương cơ bản</label>
                                    <div className="relative">
                                        <FormattedNumberInput value={formData.salary || ''} onChange={v => handleNumberChange('salary', v)} className={`${inputClass} text-right pr-8`} />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">đ</span>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Tiền đặt cọc (Giữ chân)</label>
                                    <div className="relative">
                                        <FormattedNumberInput value={formData.deposit || ''} onChange={v => handleNumberChange('deposit', v)} className={`${inputClass} text-right pr-8`} />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                             <h4 className={sectionTitleClass}><DocumentTextIcon className="w-5 h-5 text-gray-600"/> Hồ sơ lưu trữ</h4>
                             <div>
                                <label className={labelClass}>Danh sách hồ sơ gốc đã nộp</label>
                                <textarea name="originalDocuments" value={formData.originalDocuments || ''} onChange={handleChange} className={inputClass} rows={3} placeholder="VD: Bằng đại học, Sơ yếu lý lịch, Hộ khẩu (photo)..." />
                            </div>
                        </div>
                    </div>

                    {/* Commission Calculation Section */}
                    {isEditMode && formData.commissionPolicyId && (
                        <div className="pt-4 border-t dark:border-gray-700">
                             <h4 className={sectionTitleClass}><CalculatorIcon className="w-5 h-5 text-green-600"/> Bảng tính Lương & Hoa hồng (Ước tính)</h4>
                             <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                                 <div className="flex items-center gap-4 mb-4">
                                     <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kỳ tính lương:</label>
                                     <DatePicker value={calcStartDate} onChange={setCalcStartDate} className="w-32 py-1.5 px-2 border rounded-lg bg-white text-sm" />
                                     <span className="text-gray-500">-</span>
                                     <DatePicker value={calcEndDate} onChange={setCalcEndDate} className="w-32 py-1.5 px-2 border rounded-lg bg-white text-sm" />
                                 </div>
                                 
                                 {commissionData ? (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Lương cứng</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{commissionData.baseSalary.toLocaleString('vi-VN')} đ</p>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Doanh thu ({commissionData.orderCount} đơn)</p>
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">{commissionData.totalRevenue.toLocaleString('vi-VN')} đ</p>
                                            <p className="text-xs text-green-600 mt-1 font-medium">Hoa hồng: {commissionData.commissionRate}%</p>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Tiền Hoa hồng</p>
                                            <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">{commissionData.commissionAmount.toLocaleString('vi-VN')} đ</p>
                                        </div>
                                         <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800">
                                            <p className="text-xs text-blue-800 dark:text-blue-300 uppercase font-bold">Tổng thu nhập</p>
                                            <p className="text-xl font-extrabold text-blue-700 dark:text-blue-200 mt-1">{commissionData.totalIncome.toLocaleString('vi-VN')} đ</p>
                                        </div>
                                    </div>
                                 ) : (
                                     <div className="text-center py-4 text-gray-500 text-sm italic">
                                         Không có dữ liệu hoặc nhân viên chưa được áp dụng chính sách hoa hồng.
                                     </div>
                                 )}
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                * Các trường đánh dấu sao là bắt buộc.
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition shadow-sm">
                    Hủy bỏ
                </button>
                <div className="flex gap-2">
                     <button onClick={() => handleSave(true)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition flex items-center gap-2">
                        <PlusIcon className="w-4 h-4" /> Lưu & Thêm mới
                    </button>
                    <button onClick={() => handleSave()} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition transform active:scale-95 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" /> Lưu nhân viên
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
