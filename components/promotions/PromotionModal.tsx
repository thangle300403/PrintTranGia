
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Promotion } from '../../types';
import DatePicker from '../DatePicker';
import FormattedNumberInput from '../FormattedNumberInput';

interface PromotionModalProps {
    promotion: Partial<Promotion> | null;
    onClose: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ promotion, onClose }) => {
    const { addPromotion, updatePromotion } = useData();
    const [formData, setFormData] = useState<Partial<Promotion>>(
        promotion || {
            code: '', description: '', type: 'percentage', value: 0, status: 'active',
            startDate: new Date(), endDate: null, minOrderValue: 0, usageLimit: null
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: keyof Promotion, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleDateChange = (name: 'startDate' | 'endDate', dateString: string) => {
        const date = dateString ? new Date(dateString) : null;
        setFormData(prev => ({ ...prev, [name]: date }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            code: formData.code?.toUpperCase().trim(),
            value: Number(formData.value) || 0,
            minOrderValue: Number(formData.minOrderValue) || undefined,
            usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
            startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
            endDate: formData.endDate ? new Date(formData.endDate) : null,
        };
        if (!dataToSave.code || !dataToSave.description || dataToSave.value <= 0) {
            alert('Vui lòng điền Mã, Mô tả và Giá trị khuyến mãi.');
            return;
        }

        if (promotion?.id) {
            updatePromotion(dataToSave as Promotion);
        } else {
            addPromotion(dataToSave as Omit<Promotion, 'id' | 'timesUsed'>);
        }
        onClose();
    };

    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 border-gray-300";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl">
                <h3 className="text-xl font-bold mb-6">{promotion?.id ? 'Chỉnh sửa' : 'Tạo'} Chương trình Khuyến mãi</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Mã Khuyến mãi</label>
                            <input name="code" value={formData.code || ''} onChange={handleChange} className={`${inputClass} font-mono uppercase`} required />
                        </div>
                        <div>
                            <label className={labelClass}>Trạng thái</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                <option value="active">Đang hoạt động</option>
                                <option value="disabled">Tạm ngưng</option>
                                <option value="expired">Đã hết hạn</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Mô tả</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} className={inputClass} rows={2} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Loại khuyến mãi</label>
                            <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
                                <option value="percentage">Giảm theo %</option>
                                <option value="fixed">Giảm số tiền cố định</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Giá trị</label>
                            <FormattedNumberInput value={formData.value || ''} onChange={v => handleNumberChange('value', v)} className={inputClass} required />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Giá trị đơn hàng tối thiểu</label>
                            <FormattedNumberInput value={formData.minOrderValue || ''} onChange={v => handleNumberChange('minOrderValue', v)} className={inputClass} placeholder="Để trống nếu không có" />
                        </div>
                        <div>
                            <label className={labelClass}>Giới hạn lượt sử dụng</label>
                            <FormattedNumberInput value={formData.usageLimit || ''} onChange={v => handleNumberChange('usageLimit', v)} className={inputClass} placeholder="Để trống nếu không giới hạn"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Ngày bắt đầu</label>
                            <DatePicker value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''} onChange={v => handleDateChange('startDate', v)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Ngày kết thúc</label>
                            <DatePicker value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''} onChange={v => handleDateChange('endDate', v)} className={inputClass} placeholder="Để trống nếu không hết hạn" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
