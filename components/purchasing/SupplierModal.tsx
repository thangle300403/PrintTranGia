
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Supplier, SupplierBankAccount, DocumentType } from '../../types';
import { useData } from '../../context/DataContext';
import FormattedNumberInput from '../FormattedNumberInput';
import CustomSelect from '../CustomSelect';
import { CloseIcon, UserCircleIcon, UploadIcon } from '../icons/Icons';

interface SupplierModalProps {
  supplier: Partial<Supplier> | null;
  onClose: () => void;
  onSave: (supplier: Omit<Supplier, 'id' | 'totalDebt'> | Supplier, saveAndNew?: boolean) => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({ supplier, onClose, onSave }) => {
    const { supplierGroups, numberingRules } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const nextId = useMemo(() => {
        if (supplier?.id) return null;
        const rule = numberingRules.find(r => r.type === DocumentType.Supplier);
        if (!rule) return '';
        const numberStr = String(rule.nextNumber).padStart(rule.numberLength, '0');
        return `${rule.prefix}${numberStr}${rule.suffix}`;
    }, [numberingRules, supplier]);

    const getInitialData = (): Partial<Supplier> => {
        const defaultData: Partial<Supplier> = {
            type: 'organization',
            name: '',
            phone: '',
            email: '',
            address: '',
            bankAccounts: [{ id: `new_${Date.now()}`, bankName: '', accountNumber: '', bankBranch: '', accountHolder: '' }],
            dueDays: 0,
            maxDebt: 0,
            avatarUrl: '',
            // FIX: Add default status to align with the required property on the Supplier type.
            status: 'active',
        };

        if (supplier) {
            return {
                ...defaultData,
                ...supplier,
                bankAccounts: supplier.bankAccounts?.length ? [...supplier.bankAccounts] : defaultData.bankAccounts,
            };
        }
        return defaultData;
    };

    const [formData, setFormData] = useState<Partial<Supplier>>(getInitialData());

    useEffect(() => {
        setFormData(getInitialData());
    }, [supplier]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'type') {
             setFormData(prev => ({ ...prev, [name]: value as 'organization' | 'individual' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleNumberChange = (name: keyof Supplier, value: number) => {
        setFormData(prev => ({...prev, [name]: value }));
    };

    const handleBankChange = (index: number, field: keyof SupplierBankAccount, value: string) => {
        setFormData(prev => {
            const newBankAccounts = [...(prev.bankAccounts || [])];
            if (newBankAccounts.length === 0) {
                 newBankAccounts.push({ id: `ba_${Date.now()}`, bankName: '', accountNumber: '', accountHolder: '' });
            }
            newBankAccounts[index] = { ...newBankAccounts[index], [field]: value };
            return { ...prev, bankAccounts: newBankAccounts };
        });
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
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleSubmit = (e: React.FormEvent, saveAndNew: boolean = false) => {
        e.preventDefault();
        if (!formData.name?.trim()) {
            alert('Vui lòng nhập Tên nhà cung cấp.');
            return;
        }
        onSave(formData as Omit<Supplier, 'id' | 'totalDebt'> | Supplier, saveAndNew);
        if (saveAndNew) {
            setFormData(getInitialData());
        }
    };

    const inputClass = "w-full py-2 px-3 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-colors";
    const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1";
    
    const supplierGroupOptions = [
        { value: '', label: 'Nhập để tìm kiếm' },
        ...supplierGroups.map(group => ({ value: group.id, label: group.name }))
    ];

    const contactTitleOptions = [
        { value: 'Ông', label: 'Ông' },
        { value: 'Bà', label: 'Bà' },
        { value: 'Anh', label: 'Anh' },
        { value: 'Chị', label: 'Chị' }
    ];

    const renderImageUpload = () => (
        <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded border bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-gray-300 dark:border-gray-600 overflow-hidden">
                {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Logo/Ảnh" className="w-full h-full object-cover" />
                ) : (
                    <UserCircleIcon className="w-6 h-6 text-gray-400" />
                )}
            </div>
            <div className="flex items-center gap-3">
                 <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                 <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                    <UploadIcon className="w-3 h-3"/> Tải ảnh
                 </button>
                 {formData.avatarUrl && (
                    <button 
                        type="button" 
                        onClick={handleRemoveImage} 
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                    >
                        Xóa
                    </button>
                 )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-0 md:p-4">
            <div className="bg-white dark:bg-gray-800 p-0 rounded-none md:rounded-xl shadow-xl w-full h-full md:h-auto md:max-h-[95vh] max-w-5xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all">
                <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl flex-shrink-0">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                            {supplier?.id ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm mới Nhà cung cấp'}
                        </h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><CloseIcon className="w-6 h-6"/></button>
                    </div>

                    <div className="p-4 md:p-6 space-y-3 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/10">
                        <div className="flex items-center gap-x-8 mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="type" value="organization" checked={formData.type === 'organization'} onChange={handleChange} className="form-radio h-4 w-4 text-blue-600" />
                                <span className="ml-2 font-semibold text-gray-700 dark:text-gray-200">Tổ chức</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="type" value="individual" checked={formData.type === 'individual'} onChange={handleChange} className="form-radio h-4 w-4 text-blue-600" />
                                <span className="ml-2 font-semibold text-gray-700 dark:text-gray-200">Cá nhân</span>
                            </label>
                        </div>
                        
                        {formData.type === 'organization' ? (
                        <>
                            {/* ORGANIZATION FORM */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h4 className="font-bold text-base text-blue-600 dark:text-blue-400 uppercase tracking-wider border-b pb-2 mb-3">Thông tin cơ bản</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
                                    {/* Row 1 */}
                                    <div>
                                        <label className={labelClass}>Mã nhà cung cấp <span className="text-gray-400 text-xs">(Tự động)</span></label>
                                        <input type="text" value={formData.id || nextId || '(Hệ thống tự sinh)'} className={`${inputClass} bg-gray-100 dark:bg-gray-700/50 font-mono text-gray-500`} readOnly />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Tên nhà cung cấp <span className="text-red-500">*</span></label>
                                        <input name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} required />
                                    </div>
                                    {/* Row 2 */}
                                    <div className="md:col-span-3">
                                        <label className={labelClass}>Địa chỉ</label>
                                        <input name="address" value={formData.address || ''} onChange={handleChange} className={inputClass} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 pt-2">
                                    {/* Row 3 */}
                                    <div><label className={labelClass}>Mã số thuế</label><input type="text" name="taxId" value={formData.taxId || ''} onChange={handleChange} className={inputClass} /></div>
                                    <div><label className={labelClass}>Điện thoại</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className={inputClass} /></div>
                                    <div><label className={labelClass}>Nhóm nhà cung cấp</label><CustomSelect options={supplierGroupOptions} value={formData.supplierGroupId || ''} onChange={(v) => setFormData(p => ({ ...p, supplierGroupId: v }))} /></div>
                                    
                                    {/* Row 4 */}
                                    <div><label className={labelClass}>Số nợ tối đa</label><FormattedNumberInput value={formData.maxDebt || 0} onChange={v => handleNumberChange('maxDebt', v)} className={`${inputClass} text-right`} /></div>
                                    <div><label className={labelClass}>Hạn nợ (ngày)</label><FormattedNumberInput value={formData.dueDays || 0} onChange={v => handleNumberChange('dueDays', v)} className={`${inputClass} text-right`} /></div>
                                    <div><label className={labelClass}>Ngân hàng</label><input value={formData.bankAccounts?.[0]?.bankName || ''} onChange={(e) => handleBankChange(0, 'bankName', e.target.value)} className={inputClass} /></div>

                                    {/* Row 5 - Image Integrated */}
                                    <div><label className={labelClass}>Số tài khoản</label><input value={formData.bankAccounts?.[0]?.accountNumber || ''} onChange={(e) => handleBankChange(0, 'accountNumber', e.target.value)} className={inputClass} /></div>
                                    <div><label className={labelClass}>Chi nhánh NH</label><input value={formData.bankAccounts?.[0]?.bankBranch || ''} onChange={(e) => handleBankChange(0, 'bankBranch', e.target.value)} className={inputClass} /></div>
                                    <div>
                                        <label className={labelClass}>Logo / Ảnh</label>
                                        {renderImageUpload()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h4 className="font-bold text-base text-blue-600 dark:text-blue-400 uppercase tracking-wider border-b pb-2 mb-3">Thông tin người liên hệ</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                    <div><label className={labelClass}>Họ và tên</label><div className="flex items-center gap-2"><CustomSelect options={contactTitleOptions} value={formData.contactTitle || 'Ông'} onChange={v => setFormData(p => ({...p, contactTitle: v as any}))} className="w-24 flex-shrink-0"/><input name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} className={inputClass} /></div></div>
                                    <div><label className={labelClass}>Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputClass} /></div>
                                    <div><label className={labelClass}>Điện thoại</label><input type="tel" name="contactPhone" value={formData.contactPhone || ''} onChange={handleChange} className={inputClass} /></div>
                                    <div><label className={labelClass}>Chức danh</label><input name="contactPosition" value={formData.contactPosition || ''} onChange={handleChange} className={inputClass} /></div>
                                    <div className="md:col-span-2"><label className={labelClass}>Địa chỉ</label><input name="contactAddress" value={formData.contactAddress || ''} onChange={handleChange} className={inputClass} /></div>
                                </div>
                            </div>
                        </>
                        ) : (
                        <>
                            {/* INDIVIDUAL FORM */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <h4 className="font-bold text-base text-blue-600 dark:text-blue-400 uppercase tracking-wider border-b pb-2 mb-3">Thông tin cơ bản</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                    <div>
                                        <label className={labelClass}>Mã nhà cung cấp <span className="text-gray-400 text-xs">(Tự động)</span></label>
                                        <input type="text" value={formData.id || nextId || '(Hệ thống tự sinh)'} className={`${inputClass} bg-gray-100 dark:bg-gray-700/50 font-mono text-gray-500`} readOnly />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Họ và tên <span className="text-red-500">*</span></label>
                                        <input name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Địa chỉ</label>
                                        <textarea name="address" value={formData.address || ''} onChange={handleChange} className={inputClass} rows={2}/>
                                    </div>
                                    <div><label className={labelClass}>Email</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={inputClass} /></div>
                                    <div><label className={labelClass}>Điện thoại</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className={inputClass} /></div>
                                    <div>
                                        <label className={labelClass}>Nhóm nhà cung cấp</label>
                                        <CustomSelect options={supplierGroupOptions} value={formData.supplierGroupId || ''} onChange={(value) => setFormData(prev => ({ ...prev, supplierGroupId: value }))} />
                                    </div>
                                    <div><label className={labelClass}>Số nợ tối đa</label><FormattedNumberInput value={formData.maxDebt || 0} onChange={v => handleNumberChange('maxDebt', v)} className={`${inputClass} text-right`} /></div>
                                    <div><label className={labelClass}>Hạn nợ (ngày)</label><FormattedNumberInput value={formData.dueDays || 0} onChange={v => handleNumberChange('dueDays', v)} className={`${inputClass} text-right`} /></div>
                                    <div><label className={labelClass}>Số tài khoản</label><input value={formData.bankAccounts?.[0]?.accountNumber || ''} onChange={(e) => handleBankChange(0, 'accountNumber', e.target.value)} className={inputClass} /></div>
                                    <div><label className={labelClass}>Ngân hàng</label><input value={formData.bankAccounts?.[0]?.bankName || ''} onChange={(e) => handleBankChange(0, 'bankName', e.target.value)} className={inputClass} /></div>
                                    
                                    {/* Image and Branch Row */}
                                    <div><label className={labelClass}>Chi nhánh NH</label><input value={formData.bankAccounts?.[0]?.bankBranch || ''} onChange={(e) => handleBankChange(0, 'bankBranch', e.target.value)} className={inputClass} /></div>
                                    <div>
                                        <label className={labelClass}>Ảnh đại diện</label>
                                        {renderImageUpload()}
                                    </div>
                                </div>
                             </div>
                        </>
                        )}
                    </div>
                    
                    <div className="px-4 md:px-6 py-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex flex-col md:flex-row justify-end items-center gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="w-full md:w-auto px-6 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy bỏ</button>
                        <button type="button" onClick={(e) => handleSubmit(e, true)} className="w-full md:w-auto px-6 py-2.5 text-sm font-semibold rounded-lg bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 transition shadow-sm dark:bg-gray-700 dark:border-gray-500 dark:text-gray-100 dark:hover:bg-gray-600">+ Lưu và thêm mới</button>
                        <button type="submit" className="w-full md:w-auto px-8 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};