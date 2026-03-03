
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { ProfitRule } from '../../types';
import { PencilIcon, TrashIcon } from '../../components/icons/Icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { Toast } from '../../components/Toast';

const RuleModal: React.FC<{
    rule: Partial<ProfitRule> | null;
    onClose: () => void;
    onSave: (rule: Omit<ProfitRule, 'id'> | ProfitRule) => void;
}> = ({ rule, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<ProfitRule>>(rule || { minCost: 0, markup: 0 });
    const [isMaxCostNull, setIsMaxCostNull] = useState(rule?.maxCost === null);

    const handleNumberChange = (name: keyof ProfitRule, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            maxCost: isMaxCostNull ? null : formData.maxCost
        }
        if ((finalData.minCost || 0) < 0 || (finalData.markup || 0) <= 0) {
            alert('Giá trị và lợi nhuận phải là số dương.');
            return;
        }
        onSave(finalData as ProfitRule);
        onClose();
    };

    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-6">{rule?.id ? 'Chỉnh sửa' : 'Thêm'} Quy tắc Lợi nhuận</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Giá vốn từ</label>
                            <FormattedNumberInput value={formData.minCost || 0} onChange={(val) => handleNumberChange('minCost', val)} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Giá vốn đến</label>
                            <FormattedNumberInput value={isMaxCostNull ? '' : (formData.maxCost || '')} onChange={(val) => handleNumberChange('maxCost', val)} className={inputClass} disabled={isMaxCostNull} />
                            <label className="flex items-center mt-2 text-sm">
                                <input type="checkbox" checked={isMaxCostNull} onChange={(e) => setIsMaxCostNull(e.target.checked)} className="h-4 w-4 rounded text-blue-600" />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Trở lên</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Lợi nhuận áp dụng (%)</label>
                        <FormattedNumberInput value={formData.markup || 0} onChange={(val) => handleNumberChange('markup', val)} className={inputClass} required />
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


const ProfitRulesPage: React.FC = () => {
    const { profitRules, addProfitRule, updateProfitRule, deleteProfitRule, currentUser, rolePermissions } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<ProfitRule | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');

    const canManage = useMemo(() => {
        if (!currentUser) return false;
        const permissions = rolePermissions[currentUser.roleId] || [];
        return permissions.includes('manage_profit_rules');
    }, [currentUser, rolePermissions]);

    const sortedRules = useMemo(() => [...profitRules].sort((a, b) => a.minCost - b.minCost), [profitRules]);

    if (!canManage) {
        return <div className="text-center p-8"><h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1></div>;
    }

    const handleSave = (ruleData: Omit<ProfitRule, 'id'> | ProfitRule) => {
        if ('id' in ruleData && ruleData.id) {
            updateProfitRule(ruleData as ProfitRule);
            setToastMessage('Cập nhật quy tắc thành công.');
        } else {
            addProfitRule(ruleData as Omit<ProfitRule, 'id'>);
            setToastMessage('Thêm quy tắc thành công.');
        }
        setIsModalOpen(false);
        setEditingRule(null);
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteProfitRule(itemToDelete);
            setToastMessage('Đã xóa quy tắc.');
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };
    
    const formatCostRange = (min: number, max: number | null) => {
        if (max === null) {
            return `Trên ${min.toLocaleString('vi-VN')} đ`;
        }
        return `Từ ${min.toLocaleString('vi-VN')} đ đến ${max.toLocaleString('vi-VN')} đ`;
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Quản lý Quy tắc Lợi nhuận</h1>
                    <button onClick={() => { setEditingRule(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">+ Thêm quy tắc</button>
                </div>

                 <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-200 p-4 rounded-r-lg" role="alert">
                    <p className="font-bold">Cách hoạt động:</p>
                    <p className="text-sm">Hệ thống sẽ tự động áp dụng % lợi nhuận tương ứng với tổng giá vốn của sản phẩm khi sử dụng Công cụ Tính giá thành.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Khung giá vốn</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">% Lợi nhuận</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedRules.map(rule => (
                                <tr key={rule.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800 dark:text-gray-100">{formatCostRange(rule.minCost, rule.maxCost)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-green-600">{rule.markup}%</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => { setEditingRule(rule); setIsModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(rule.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                             {sortedRules.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        Chưa có quy tắc nào. Hãy thêm một quy tắc để bắt đầu.
                                    </td>
                                </tr>
                            )}
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

export default ProfitRulesPage;
