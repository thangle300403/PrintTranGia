
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { WastageRule } from '../../types';
import { PencilIcon, TrashIcon } from '../../components/icons/Icons';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';

const RuleModal: React.FC<{
    rule: Partial<WastageRule> | null;
    onClose: () => void;
    onSave: (rule: Omit<WastageRule, 'id'> | WastageRule) => void;
}> = ({ rule, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<WastageRule>>(
        rule || { threshold: 0, sheets: 0 }
    );

    const handleChange = (name: keyof WastageRule, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((formData.threshold || 0) <= 0 || (formData.sheets || 0) <= 0) {
            alert('Vui lòng nhập giá trị lớn hơn 0 cho các trường.');
            return;
        }
        onSave(formData as WastageRule);
        onClose();
    };

    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-6">{rule?.id ? 'Chỉnh sửa' : 'Thêm'} Quy tắc Bù hao</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Số tờ in dưới (Threshold)</label>
                        <FormattedNumberInput value={formData.threshold || ''} onChange={(val) => handleChange('threshold', val)} className={inputClass} required />
                    </div>
                    <div>
                        <label className={labelClass}>Số tờ bù hao</label>
                        <FormattedNumberInput value={formData.sheets || ''} onChange={(val) => handleChange('sheets', val)} className={inputClass} required />
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

const WastageRulesPage: React.FC = () => {
    const { wastageRules, addWastageRule, updateWastageRule, deleteWastageRule, currentUser, rolePermissions } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<WastageRule | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');

    const userPermissions = useMemo(() => {
        if (!currentUser) return { canManage: false };
        const permissions = rolePermissions[currentUser.roleId] || [];
        return { canManage: permissions.includes('manage_costing_rules') };
    }, [currentUser, rolePermissions]);

    if (!userPermissions.canManage) {
        return <div className="text-center p-8"><h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1></div>;
    }

    const handleSave = (ruleData: Omit<WastageRule, 'id'> | WastageRule) => {
        if ('id' in ruleData && ruleData.id) {
            updateWastageRule(ruleData as WastageRule);
            setToastMessage('Cập nhật quy tắc thành công.');
        } else {
            addWastageRule(ruleData as Omit<WastageRule, 'id'>);
            setToastMessage('Thêm quy tắc thành công.');
        }
    };
    
    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteWastageRule(itemToDelete);
            setToastMessage('Đã xóa quy tắc.');
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Quản lý Quy tắc Bù hao</h1>
                    <button onClick={() => { setEditingRule(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">+ Thêm quy tắc</button>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border overflow-hidden">
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Số tờ in dưới</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Số tờ bù hao</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {wastageRules.map(rule => (
                                <tr key={rule.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{rule.threshold.toLocaleString('vi-VN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{rule.sheets.toLocaleString('vi-VN')}</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => { setEditingRule(rule); setIsModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(rule.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <RuleModal rule={editingRule} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDelete} title="Xác nhận Xóa" message="Bạn có chắc muốn xóa quy tắc này?" />
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

export default WastageRulesPage;
