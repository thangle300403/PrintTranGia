import React, { useState } from 'react';
import { NumberingRule } from '../../types';
import FormattedNumberInput from '../FormattedNumberInput';

interface NumberingRuleModalProps {
    rule: NumberingRule | null;
    onClose: () => void;
    onSave: (rule: NumberingRule) => void;
}

export const NumberingRuleModal: React.FC<NumberingRuleModalProps> = ({ rule, onClose, onSave }) => {
    const [formData, setFormData] = useState<NumberingRule | null>(rule);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleNumberChange = (name: keyof NumberingRule, value: number) => {
        setFormData(prev => prev ? ({...prev, [name]: value }) : null);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
        }
    };
    
    const generateExample = () => {
        const numberStr = String(formData.nextNumber).padStart(formData.numberLength, '0');
        return `${formData.prefix}${numberStr}${formData.suffix || ''}`;
    };

    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chỉnh sửa Quy tắc: {rule?.type}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Tiền tố</label>
                                <input type="text" name="prefix" value={formData.prefix} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Hậu tố</label>
                                <input type="text" name="suffix" value={formData.suffix} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Độ dài phần số</label>
                                <FormattedNumberInput name="numberLength" value={formData.numberLength} onChange={(val) => handleNumberChange('numberLength', val)} className={inputClass} min="1" max="10" />
                            </div>
                            <div>
                                <label className={labelClass}>Số bắt đầu</label>
                                <FormattedNumberInput name="nextNumber" value={formData.nextNumber} onChange={(val) => handleNumberChange('nextNumber', val)} className={inputClass} min="1" />
                            </div>
                        </div>
                        <div className="pt-2">
                             <label className={labelClass}>Xem trước</label>
                             <p className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg font-mono text-center text-lg">{generateExample()}</p>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
