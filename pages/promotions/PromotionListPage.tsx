

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Promotion } from '../../types';
import { PencilIcon, TrashIcon, GiftIcon } from '../../components/icons/Icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';
import { PromotionModal } from '../../components/promotions/PromotionModal';
import { Toast } from '../../components/Toast';

const getStatusClass = (status: 'active' | 'expired' | 'disabled') => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'expired': return 'bg-yellow-100 text-yellow-800';
        case 'disabled': return 'bg-gray-200 text-gray-800';
    }
};

const PromotionListPage: React.FC = () => {
    const { promotions, deletePromotion, currentUser, rolePermissions } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const canManage = useMemo(() => {
        if (!currentUser) return false;
        const permissions = rolePermissions[currentUser.roleId] || [];
        return permissions.includes('manage_promotions');
    }, [currentUser, rolePermissions]);

    const filteredPromotions = useMemo(() => {
        return promotions
            .filter(p => p.code.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    }, [promotions, searchTerm]);

    const paginatedPromotions = useMemo(() => {
        return filteredPromotions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredPromotions, currentPage, itemsPerPage]);

    if (!canManage) {
        return <div className="text-center p-8"><h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1></div>;
    }

    const handleOpenModal = (promo: Promotion | null) => {
        setEditingPromotion(promo);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deletePromotion(itemToDelete);
            setToastMessage('Đã xóa khuyến mãi thành công.');
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><GiftIcon /> Quản lý Khuyến mãi</h1>
                    <button onClick={() => handleOpenModal(null)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 shadow-sm">+ Thêm chương trình</button>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <input
                        type="text"
                        placeholder="Tìm theo Mã hoặc Mô tả..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50"
                    />
                </div>
                
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mô tả</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Giá trị</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Thời hạn</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Đã dùng</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedPromotions.map(promo => (
                                    <tr key={promo.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-mono font-bold text-blue-600">{promo.code}</td>
                                        <td className="px-6 py-4 text-sm">{promo.description}</td>
                                        <td className="px-6 py-4 text-sm font-semibold">{promo.type === 'percentage' ? `${promo.value}%` : `${promo.value.toLocaleString('vi-VN')}đ`}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(promo.startDate).toLocaleDateString('vi-VN')} - {promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center">{promo.timesUsed || 0} / {promo.usageLimit || '∞'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(promo.status)}`}>
                                                {promo.status === 'active' ? 'Hoạt động' : promo.status === 'disabled' ? 'Tạm ngưng' : 'Hết hạn'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            <button onClick={() => handleOpenModal(promo)} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(promo.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedPromotions.length === 0 && (
                                    <tr><td colSpan={7} className="text-center text-gray-500 py-10">Không có chương trình khuyến mãi nào.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                     {filteredPromotions.length > itemsPerPage && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredPromotions.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={() => {}}
                        />
                    )}
                </div>
            </div>
            {isModalOpen && <PromotionModal promotion={editingPromotion} onClose={() => setIsModalOpen(false)} />}
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDelete} title="Xác nhận Xóa" message="Bạn có chắc chắn muốn xóa khuyến mãi này không?" />
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

export default PromotionListPage;