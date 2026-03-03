
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { CompanyInfo, BankAccount } from '../../types';
import { 
    EnvelopeIcon, PhoneIcon, MapPinIcon, UploadIcon, 
    TrashIcon, PlusCircleIcon, BankIcon, CompanyIcon, PencilIcon, CheckIcon
} from '../../components/icons/Icons';

const CompanyInfoPage: React.FC = () => {
    const { companyInfo, updateCompanyInfo, currentUser, rolePermissions } = useData();
    const [formData, setFormData] = useState<CompanyInfo>(companyInfo);
    const [isDirty, setIsDirty] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Deep copy to avoid direct mutation issues, especially with nested bankAccounts array
        setFormData(JSON.parse(JSON.stringify(companyInfo)));
        setIsDirty(false);
    }, [companyInfo]);

    const hasPermission = currentUser && (rolePermissions[currentUser.roleId] || []).includes('manage_company_info');

    if (!hasPermission) {
        return <div className="text-red-500 text-center mt-10">Bạn không có quyền truy cập trang này.</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = value === '' ? 0 : Number(value);
        if (!isNaN(numValue)) {
            setFormData(prev => ({ ...prev, [name]: numValue }));
            setIsDirty(true);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setFormData(prev => ({ ...prev, logoUrl: loadEvent.target?.result as string }));
                setIsDirty(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddBankAccount = () => {
        const newAccount: BankAccount = { id: `bank_${Date.now()}`, bankName: '', accountNumber: '', accountHolder: '', bin: '', openingBalance: 0 };
        setFormData(prev => ({ ...prev, bankAccounts: [...prev.bankAccounts, newAccount] }));
        setIsDirty(true);
    };

    const handleBankChange = (index: number, field: keyof BankAccount, value: any) => {
        const newAccounts = [...formData.bankAccounts];
        newAccounts[index] = { ...newAccounts[index], [field]: value };
        setFormData(prev => ({ ...prev, bankAccounts: newAccounts }));
        setIsDirty(true);
    };
    
    const handleBankNumberChange = (index: number, field: keyof BankAccount, value: string) => {
        const numValue = value === '' ? 0 : Number(value.replace(/,/g, ''));
        if (!isNaN(numValue)) {
            handleBankChange(index, field, numValue);
        }
    };

    const handleRemoveBank = (index: number) => {
        setFormData(prev => ({ ...prev, bankAccounts: prev.bankAccounts.filter((_, i) => i !== index) }));
        setIsDirty(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateCompanyInfo(formData);
        setIsDirty(false);
        // Add toast feedback here if available
        alert('Đã cập nhật thông tin công ty thành công!');
    };
    
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const simpleInputClass = "w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm";
    const inputWrapperClass = "relative";
    const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400";


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thông tin công ty</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
                            <CompanyIcon className="w-6 h-6 text-blue-600"/>
                            Thông tin chung
                        </h2>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="name" className={labelClass}>Tên công ty / Cửa hàng</label>
                                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={simpleInputClass} placeholder="Nhập tên đầy đủ..." />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="taxCode" className={labelClass}>Mã số thuế</label>
                                    <input id="taxCode" name="taxCode" type="text" value={formData.taxCode} onChange={handleChange} className={simpleInputClass} placeholder="VD: 031..." />
                                </div>
                                 <div>
                                    <label htmlFor="phone" className={labelClass}>Số điện thoại</label>
                                    <div className={inputWrapperClass}>
                                        <PhoneIcon className={iconClass} />
                                        <input id="phone" name="phone" type="text" value={formData.phone} onChange={handleChange} className={`${simpleInputClass} pl-10`} placeholder="090..." />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className={labelClass}>Email liên hệ</label>
                                <div className={inputWrapperClass}>
                                    <EnvelopeIcon className={iconClass} />
                                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={`${simpleInputClass} pl-10`} placeholder="admin@example.com" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="address" className={labelClass}>Địa chỉ</label>
                                <div className={inputWrapperClass}>
                                    <MapPinIcon className={iconClass} />
                                    <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} className={`${simpleInputClass} pl-10`} placeholder="Số nhà, đường, quận..." />
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
                            <BankIcon className="w-6 h-6 text-green-600"/>
                            Tài chính & Ngân hàng
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                             <div>
                                <label className={labelClass}>Thuế VAT mặc định (%)</label>
                                <input type="number" name="vatRate" value={formData.vatRate} onChange={handleNumberChange} className={simpleInputClass} />
                            </div>
                             <div>
                                <label className={labelClass}>Chi phí quản lý (%)</label>
                                <input type="number" name="managementFeePercentage" value={formData.managementFeePercentage || ''} onChange={handleNumberChange} className={simpleInputClass} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300">Tài khoản ngân hàng</label>
                            {formData.bankAccounts.map((acc, index) => (
                                <div key={acc.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 relative group">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="Tên ngân hàng (VD: Vietcombank)" value={acc.bankName} onChange={(e) => handleBankChange(index, 'bankName', e.target.value)} className={simpleInputClass}/>
                                        <input type="text" placeholder="Mã BIN (VietQR)" value={acc.bin} onChange={(e) => handleBankChange(index, 'bin', e.target.value)} className={simpleInputClass}/>
                                        <input type="text" placeholder="Số tài khoản" value={acc.accountNumber} onChange={(e) => handleBankChange(index, 'accountNumber', e.target.value)} className={simpleInputClass}/>
                                        <input type="text" placeholder="Chủ tài khoản" value={acc.accountHolder} onChange={(e) => handleBankChange(index, 'accountHolder', e.target.value)} className={simpleInputClass}/>
                                    </div>
                                    <button type="button" onClick={() => handleRemoveBank(index)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddBankAccount} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition"><PlusCircleIcon className="w-5 h-5" /> Thêm tài khoản</button>
                        </div>

                        <div className="mt-6">
                            <label className={labelClass}>Mẫu nội dung chuyển khoản</label>
                            <input type="text" name="bankTransferContentTemplate" value={formData.bankTransferContentTemplate} onChange={handleChange} className={simpleInputClass} placeholder="VD: Thanh toan HD {orderId}" />
                            <p className="text-xs text-gray-500 mt-1">Sử dụng {`{orderId}`} để thay thế bằng mã đơn hàng tự động.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold mb-4">Logo Công ty</h2>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-48 h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 overflow-hidden group relative">
                                {formData.logoUrl ? <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <span className="text-gray-400 text-sm">Chưa có logo</span>}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-white rounded-full shadow-lg"><PencilIcon className="w-5 h-5 text-gray-700"/></button></div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange}/>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"><UploadIcon className="w-4 h-4"/> Tải lên logo</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {isDirty && (
                <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 flex justify-end z-20 -mx-6 -mb-8 lg:-mx-8 lg:-mb-8">
                    <div className="max-w-4xl mx-auto w-full flex justify-end">
                        <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition transform hover:-translate-y-0.5">
                            <CheckIcon className="w-5 h-5" />
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
};

export default CompanyInfoPage;
