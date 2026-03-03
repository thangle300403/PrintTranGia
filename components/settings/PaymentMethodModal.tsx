
import React, { useState, useEffect } from 'react';
import { UserPaymentMethod } from '../../types';
import { CreditCardIcon, CalendarIcon } from '../icons/Icons';

interface PaymentMethodModalProps {
  method: Partial<UserPaymentMethod> | null;
  onClose: () => void;
  onSave: (data: Omit<UserPaymentMethod, 'id'> | UserPaymentMethod) => void;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ method, onClose, onSave }) => {
    const isEdit = !!method?.id;
    const [formData, setFormData] = useState({
        cardholderName: '',
        cardNumber: '',
        expiry: '', // MM/YY
        cvc: '',
        isDefault: method?.isDefault || false,
    });

    useEffect(() => {
        if (isEdit && method?.type === 'card') {
            setFormData({
                cardholderName: 'Nguyễn Văn Admin', // Mock name
                cardNumber: `**** **** **** ${method.card?.last4}`,
                expiry: `${String(method.card?.expiryMonth).padStart(2, '0')}/${String(method.card?.expiryYear).slice(-2)}`,
                cvc: '***',
                isDefault: method.isDefault,
            });
        }
    }, [method, isEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.cardholderName || !formData.cardNumber || !formData.expiry || !formData.cvc) {
            alert('Vui lòng điền đầy đủ thông tin thẻ.');
            return;
        }

        const [expiryMonth, expiryYear] = formData.expiry.split('/');
        
        const saveData: Omit<UserPaymentMethod, 'id'> = {
            type: 'card',
            isDefault: formData.isDefault,
            card: {
                brand: 'Visa', // Mock brand
                last4: formData.cardNumber.slice(-4),
                expiryMonth: parseInt(expiryMonth),
                expiryYear: 2000 + parseInt(expiryYear), // convert YY to YYYY
            }
        };

        if (isEdit) {
            onSave({ ...saveData, id: method!.id! });
        } else {
            onSave(saveData);
        }
    };
    
    const inputClass = "w-full p-2.5 border rounded-lg bg-gray-50 border-gray-300";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-6">{isEdit ? 'Chỉnh sửa' : 'Thêm'} Phương thức thanh toán</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Chủ thẻ</label>
                        <input name="cardholderName" value={formData.cardholderName} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>Số thẻ</label>
                         <div className="relative">
                            <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input name="cardNumber" value={formData.cardNumber} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="**** **** **** 4242" required />
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Hết hạn (MM/YY)</label>
                             <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input name="expiry" value={formData.expiry} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="12/28" required />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>CVC</label>
                            <input name="cvc" value={formData.cvc} onChange={handleChange} className={inputClass} placeholder="***" required />
                        </div>
                    </div>
                     <label className="flex items-center gap-2 pt-2">
                        <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="h-4 w-4 rounded text-blue-600" />
                        Đặt làm phương thức mặc định
                    </label>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-300">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
