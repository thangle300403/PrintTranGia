import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { OtherCost, OtherCostType } from '../../types';
import { PencilIcon, TrashIcon } from '../../components/icons/Icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import CustomSelect from '../../components/CustomSelect';

const OtherCostModal: React.FC<{
    cost: Partial<OtherCost> | null;
    onClose: () => void;
    onSave: (cost: Omit<OtherCost, 'id'> | OtherCost) => void;
}> = ({ cost, onClose, onSave }) => {
    const { units } = useData();
    const [formData, setFormData] = useState<Partial<OtherCost>>(
        cost || { name: '', defaultPrice: 0, unit: 'lần', type: OtherCostType.Fixed }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNumberChange = (value: number) => {
        setFormData(prev => ({ ...prev, defaultPrice: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim() || !formData.unit) {
            alert('Vui lòng điền đầy đủ tên chi phí và đơn vị tính.');
            return;
        }
        onSave(formData as OtherCost);
        onClose();
    };

    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    
    const unitOptions = units.map(u => ({ value: u.name, label: u.name }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-bold mb-6">{cost?.id ? 'Chỉnh sửa' : 'Thêm'} Chi phí khác</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Tên chi phí</label>
                        <input name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} required autoFocus />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Đơn giá mặc định</label>
                            <FormattedNumberInput value={formData.defaultPrice || 0} onChange={handleNumberChange} className={inputClass} required />
                        </div>
                        <div>
                             <label className={labelClass}>Đơn vị tính</label>
                             <CustomSelect options={unitOptions} value={formData.unit || ''} onChange={val => setFormData(p => ({ ...p, unit: val }))} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Loại chi phí</label>
                        <CustomSelect 
                            options={[{ value: OtherCostType.Fixed, label: 'Cố định' }, { value: OtherCostType.Variable, label: 'Biến đổi' }]} 
                            value={formData.type || OtherCostType.Fixed} 
                            onChange={val => setFormData(p => ({ ...p, type: val as OtherCostType }))} 
                        />
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


const OtherCostsPage: React.FC = () => {
    const { otherCosts, addOtherCost, updateOtherCost, deleteOtherCost } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCost, setEditingCost] = useState<OtherCost | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    const handleSave = (costData: Omit<OtherCost, 'id'> | OtherCost) => {
        if ('id' in costData && costData.id) {
            updateOtherCost(costData as OtherCost);
            setToast('Cập nhật chi phí thành công.');
        } else {
            addOtherCost(costData as Omit<OtherCost, 'id'>);
            setToast('Thêm chi phí mới thành công.');
        }
        setIsModalOpen(false);
        setEditingCost(null);
    };
    
    const confirmDelete = () => {
        if (confirmDeleteId) {
            deleteOtherCost(confirmDeleteId);
            setToast('Đã xóa chi phí.');
            setConfirmDeleteId(null);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danh mục Chi phí khác</h1>
                    <button onClick={() => { setEditingCost(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">+ Thêm chi phí</button>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Tên chi phí</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Đơn giá mặc định</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Loại</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {otherCosts.map(cost => (
                                <tr key={cost.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{cost.name}</td>
                                    <td className="px-6 py-4 text-right">{cost.defaultPrice.toLocaleString('vi-VN')} đ / {cost.unit}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cost.type === 'co_dinh' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {cost.type === 'co_dinh' ? 'Cố định' : 'Biến đổi'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => { setEditingCost(cost); setIsModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => setConfirmDeleteId(cost.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                             {otherCosts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        Chưa có chi phí nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <OtherCostModal cost={editingCost} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
            <ConfirmationModal isOpen={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} onConfirm={confirmDelete} title="Xác nhận Xóa" message="Bạn có chắc chắn muốn xóa chi phí này?" />
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
};

export default OtherCostsPage;