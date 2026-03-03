
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { PlatePrice } from '../../types';
import { PencilIcon, TrashIcon } from '../../components/icons/Icons';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';

const PriceModal: React.FC<{
    priceItem: Partial<PlatePrice> | null;
    onClose: () => void;
    onSave: (item: Omit<PlatePrice, 'id'> | PlatePrice) => void;
}> = ({ priceItem, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<PlatePrice>>(
        priceItem || { machineSize: '', price: 0 }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNumberChange = (name: keyof PlatePrice, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.machineSize || (formData.price || 0) <= 0) {
            alert('Vui lòng nhập đầy đủ thông tin.');
            return;
        }
        onSave(formData as PlatePrice);
        onClose();
    };

    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-6">{priceItem?.id ? 'Chỉnh sửa' : 'Thêm'} Bảng giá Kẽm</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Kích thước máy</label>
                        <input name="machineSize" value={formData.machineSize || ''} onChange={handleChange} className={inputClass} placeholder="VD: 79x109cm" required />
                    </div>
                    <div>
                        <label className={labelClass}>Đơn giá (VND)</label>
                        <FormattedNumberInput value={formData.price || ''} onChange={(val) => handleNumberChange('price', val)} className={inputClass} required />
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

const PlatePricesPage: React.FC = () => {
    const { platePrices, addPlatePrice, updatePlatePrice, deletePlatePrice, currentUser, rolePermissions } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PlatePrice | null>(null);
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

    const handleSave = (itemData: Omit<PlatePrice, 'id'> | PlatePrice) => {
        if ('id' in itemData && itemData.id) {
            updatePlatePrice(itemData as PlatePrice);
            setToastMessage('Cập nhật giá thành công.');
        } else {
            addPlatePrice(itemData as Omit<PlatePrice, 'id'>);
            setToastMessage('Thêm giá thành công.');
        }
    };
    
    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deletePlatePrice(itemToDelete);
            setToastMessage('Đã xóa giá kẽm.');
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Quản lý Bảng giá Kẽm</h1>
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">+ Thêm giá mới</button>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border overflow-hidden">
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Kích thước máy</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Đơn giá</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {platePrices.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{item.machineSize}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.price.toLocaleString('vi-VN')} VND</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <PriceModal priceItem={editingItem} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDelete} title="Xác nhận Xóa" message="Bạn có chắc muốn xóa mục này?" />
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

export default PlatePricesPage;
