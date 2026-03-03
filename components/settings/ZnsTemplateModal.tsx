
import React, { useState } from 'react';
import { ZnsTemplate } from '../../types';

interface ZnsTemplateModalProps {
    template: Partial<ZnsTemplate> | null;
    onClose: () => void;
    onSave: (template: Omit<ZnsTemplate, 'id'> | ZnsTemplate) => void;
}

const placeholderInfo = [
    { key: '{{customer_name}}', desc: 'Tên khách hàng' },
    { key: '{{order_id}}', desc: 'Mã đơn hàng' },
    { key: '{{total_amount}}', desc: 'Tổng tiền đơn hàng' },
    { key: '{{company_name}}', desc: 'Tên cửa hàng/công ty' }
];

export const ZnsTemplateModal: React.FC<ZnsTemplateModalProps> = ({ template, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<ZnsTemplate>>(
        template || { name: '', templateId: '', type: 'General', content: '' }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.templateId || !formData.content) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }
        onSave(formData as ZnsTemplate);
    };
    
    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-2xl">
                <h3 className="text-xl font-bold mb-6">{template?.id ? 'Chỉnh sửa' : 'Thêm'} Mẫu Zalo ZNS</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Tên mẫu (để quản lý)</label>
                            <input name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Template ID (từ Zalo)</label>
                            <input name="templateId" value={formData.templateId || ''} onChange={handleChange} className={inputClass} required />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Loại mẫu</label>
                        <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
                            <option value="OrderConfirmation">Xác nhận đơn hàng</option>
                            <option value="DeliveryUpdate">Cập nhật giao hàng</option>
                            <option value="PaymentReminder">Nhắc nhở thanh toán</option>
                            <option value="General">Thông báo chung</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Nội dung mẫu</label>
                        <textarea name="content" value={formData.content || ''} onChange={handleChange} className={inputClass} rows={5} placeholder="Nhập nội dung mẫu tin nhắn từ Zalo, sử dụng các biến số..." required></textarea>
                         <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Các biến số có thể sử dụng:</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {placeholderInfo.map(p => (
                                    <div key={p.key} className="text-xs">
                                        <code className="font-mono text-blue-600 dark:text-blue-400">{p.key}</code>
                                        <span className="text-gray-500">: {p.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
