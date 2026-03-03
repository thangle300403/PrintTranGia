
import React, { useState, useEffect } from 'react';
import type { Customer } from '../../types';
import { Gender } from '../../types';
import FormattedNumberInput from '../FormattedNumberInput';
import { useData } from '../../context/DataContext';
import DatePicker from '../DatePicker';
import CustomSelect from '../CustomSelect';

interface CustomerModalProps {
  customer: Partial<Customer> | null;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id'> | Customer, saveAndNew: boolean) => void;
  showSaveAndNew?: boolean;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ customer, onClose, onSave, showSaveAndNew = true }) => {
  const { customerGroups, users } = useData();
  
  const getInitialFormData = (): Partial<Customer> => {
    // For new customers, ID will be generated on save.
    if (!customer) return {
      name: '',
      phone: '',
      email: '',
      gender: Gender.Other,
      address: { province: '', district: '', ward: '', street: '' },
      company: { name: '', taxId: '', address: '' }
    };
    // For existing customers, use their data
    return {
        ...customer,
        address: customer.address || { province: '', district: '', ward: '', street: '' },
        company: customer.company || { name: '', taxId: '', address: '' }
    };
  };

  const [formData, setFormData] = useState<Partial<Customer>>(getInitialFormData);

  useEffect(() => {
    setFormData(getInitialFormData());
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
            ...prev,
            [parent]: { ...(prev as any)[parent], [child]: value }
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    }
  };

  const handleNumberChange = (name: keyof Customer, value: number) => {
    setFormData(prev => ({...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value as Gender }));
  };

  const handleSubmit = (e: React.FormEvent, saveAndNew: boolean = false) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Vui lòng nhập Tên khách hàng và Điện thoại.");
      return;
    }
    onSave(formData as Customer, saveAndNew);
    if (saveAndNew) {
        setFormData(getInitialFormData()); 
    }
  };

  const inputClass = "w-full py-1.5 px-3 border rounded-lg bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  
  const groupOptions = [
      { value: '', label: '-- Chọn nhóm --' },
      ...customerGroups.map(g => ({ value: g.id, label: g.name }))
  ];
  
  const userOptions = [
      { value: '', label: '-- Chọn nhân viên --' },
      ...users.map(user => ({ value: user.id, label: user.name }))
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white p-0 rounded-lg shadow-xl w-full max-w-4xl border border-gray-200 my-8">
        <div className="flex justify-between items-center px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-gray-900">
            {customer ? 'Chỉnh sửa khách hàng' : 'Thêm mới khách hàng'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={(e) => handleSubmit(e, false)}>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* THÔNG TIN CƠ BẢN */}
                <div>
                    <h4 className="font-semibold text-gray-800 mb-4">THÔNG TIN CƠ BẢN</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                        <div>
                            <label className={labelClass}>Mã khách hàng <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.id || '(Mã sẽ được tạo tự động)'} name="id" className={`${inputClass} bg-gray-200`} required readOnly />
                        </div>
                        <div className="md:col-span-3">
                            <label className={labelClass}>Tên khách hàng <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.name || ''} onChange={handleChange} name="name" className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Nhóm khách hàng</label>
                            <CustomSelect
                                options={groupOptions}
                                value={formData.customerGroupId || ''}
                                onChange={(value) => setFormData(prev => ({...prev, customerGroupId: value}))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                             <label className={labelClass}>Điện thoại <span className="text-red-500">*</span></label>
                            <input type="tel" value={formData.phone || ''} onChange={handleChange} name="phone" className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Số nợ tối đa</label>
                            <FormattedNumberInput value={formData.maxDebt || ''} onChange={(val) => handleNumberChange('maxDebt', val)} name="maxDebt" className={inputClass} />
                        </div>
                        <div>
                             <label className={labelClass}>Hạn nợ (ngày)</label>
                            <FormattedNumberInput value={formData.dueDays || ''} onChange={(val) => handleNumberChange('dueDays', val)} name="dueDays" className={inputClass} />
                        </div>
                        <div className="md:col-span-4">
                            <label className={labelClass}>Địa chỉ</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                               <input type="text" placeholder="Tỉnh thành" value={formData.address?.province || ''} onChange={handleChange} name="address.province" className={inputClass}/>
                               <input type="text" placeholder="Quận/Huyện" value={formData.address?.district || ''} onChange={handleChange} name="address.district" className={inputClass}/>
                               <input type="text" placeholder="Phường/Xã" value={formData.address?.ward || ''} onChange={handleChange} name="address.ward" className={inputClass}/>
                            </div>
                            <input type="text" placeholder="Số nhà, đường phố" value={formData.address?.street || ''} onChange={handleChange} name="address.street" className={`${inputClass} mt-2`}/>
                        </div>
                         <div>
                            <label className={labelClass}>Email</label>
                            <input type="email" value={formData.email || ''} onChange={handleChange} name="email" className={inputClass} />
                        </div>
                        <div>
                             <label className={labelClass}>Ngày sinh</label>
                            <DatePicker 
                                value={formData.birthday || ''} 
                                onChange={(val) => setFormData(prev => ({...prev, birthday: val}))} 
                                className={inputClass} 
                            />
                        </div>
                        <div className="md:col-span-2">
                             <label className={labelClass}>Giới tính</label>
                             <div className="flex items-center space-x-6 mt-2">
                                <label className="flex items-center"><input type="radio" name="gender" value={Gender.Male} checked={formData.gender === Gender.Male} onChange={handleRadioChange} className="form-radio text-blue-600 bg-gray-200" /> <span className="ml-2 text-sm">Nam</span></label>
                                <label className="flex items-center"><input type="radio" name="gender" value={Gender.Female} checked={formData.gender === Gender.Female} onChange={handleRadioChange} className="form-radio text-blue-600 bg-gray-200" /> <span className="ml-2 text-sm">Nữ</span></label>
                                <label className="flex items-center"><input type="radio" name="gender" value={Gender.Other} checked={formData.gender === Gender.Other} onChange={handleRadioChange} className="form-radio text-blue-600 bg-gray-200" /> <span className="ml-2 text-sm">Không xác định</span></label>
                             </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Nhân viên phụ trách</label>
                            <CustomSelect
                                options={userOptions}
                                value={formData.assignedToUserId || ''}
                                onChange={(value) => setFormData(prev => ({...prev, assignedToUserId: value}))}
                                className="mt-1"
                            />
                        </div>
                        <div className="md:col-span-4">
                            <label className={labelClass}>Ghi chú</label>
                            <textarea name="note" value={formData.note || ''} onChange={handleChange} rows={3} className={inputClass}></textarea>
                        </div>
                    </div>
                </div>

                {/* THÔNG TIN CÔNG TY */}
                <div>
                    <h4 className="font-semibold text-gray-800 mb-4">THÔNG TIN CÔNG TY</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                         <div>
                            <label className={labelClass}>Tên công ty</label>
                            <input type="text" name="company.name" value={formData.company?.name || ''} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                             <label className={labelClass}>Mã số thuế/CCCD</label>
                            <input type="text" name="company.taxId" value={formData.company?.taxId || ''} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Địa chỉ công ty</label>
                            <input type="text" name="company.address" value={formData.company?.address || ''} onChange={handleChange} className={inputClass} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end items-center space-x-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition">Hủy bỏ</button>
                {showSaveAndNew && (
                    <button type="button" onClick={(e) => handleSubmit(e, true)} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">Lưu và thêm mới</button>
                )}
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition shadow-sm">Lưu</button>
            </div>
        </form>
      </div>
    </div>
  );
};
