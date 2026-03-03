
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { BillOfMaterial } from '../../types';
import { PencilIcon, TrashIcon, BoxIcon } from '../../components/icons/Icons';
import { BOMModal } from '../../components/catalogs/BOMModal';
import Pagination from '../../components/Pagination';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';

const BOMPage: React.FC = () => {
    const { boms, products, addBOM, updateBOM, deleteBOM, currentUser, rolePermissions } = useData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBOM, setEditingBOM] = useState<BillOfMaterial | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [toast, setToast] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const canManage = useMemo(() => {
        if (!currentUser) return false;
        const perms = rolePermissions[currentUser.roleId] || [];
        return perms.includes('manage_bom');
    }, [currentUser, rolePermissions]);

    const filteredBOMs = useMemo(() => {
        return boms.filter(bom => {
            const product = products.find(p => p.id === bom.productId);
            const term = searchTerm.toLowerCase();
            return (
                (product?.name.toLowerCase().includes(term) || '') ||
                (product?.sku.toLowerCase().includes(term) || '') ||
                bom.id.toLowerCase().includes(term)
            );
        });
    }, [boms, products, searchTerm]);

    const paginatedBOMs = useMemo(() => {
        return filteredBOMs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredBOMs, currentPage, itemsPerPage]);

    if (!canManage) {
        return <div className="text-center p-8 text-red-600">Bạn không có quyền truy cập trang này.</div>;
    }

    const handleSave = (bomData: any) => {
        if (editingBOM) {
            updateBOM({ ...editingBOM, ...bomData });
            setToast('Cập nhật định mức thành công.');
        } else {
            addBOM(bomData);
            setToast('Thêm định mức mới thành công.');
        }
        setIsModalOpen(false);
        setEditingBOM(null);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteBOM(deleteId);
            setToast('Đã xóa định mức.');
            setIsConfirmOpen(false);
            setDeleteId(null);
        }
    };
    
    const getProductName = (id: string) => {
        const p = products.find(p => p.id === id);
        return p ? `${p.name} (${p.sku})` : 'Sản phẩm đã xóa';
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Định mức Vật tư (BOM)</h1>
                    <button 
                        onClick={() => { setEditingBOM(null); setIsModalOpen(true); }} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                    >
                        <BoxIcon className="w-5 h-5" /> Thêm Định mức
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên sản phẩm, mã SKU..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 p-2 border rounded-lg"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Mã BOM</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Sản phẩm</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Số thành phần</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Ngày cập nhật</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedBOMs.map(bom => (
                                <tr key={bom.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{bom.id}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{getProductName(bom.productId)}</td>
                                    <td className="px-6 py-4 text-sm text-center">{bom.items.length}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(bom.updatedAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => { setEditingBOM(bom); setIsModalOpen(true); }} className="p-1.5 text-gray-500 hover:text-blue-600 bg-gray-100 rounded hover:bg-blue-50"><PencilIcon className="w-4 h-4"/></button>
                                        <button onClick={() => { setDeleteId(bom.id); setIsConfirmOpen(true); }} className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-100 rounded hover:bg-red-50"><TrashIcon className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                             {paginatedBOMs.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Chưa có định mức nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {filteredBOMs.length > itemsPerPage && (
                    <Pagination 
                        currentPage={currentPage} 
                        totalItems={filteredBOMs.length} 
                        itemsPerPage={itemsPerPage} 
                        onPageChange={setCurrentPage} 
                        onItemsPerPageChange={setItemsPerPage} 
                    />
                )}
            </div>
            
            {isModalOpen && <BOMModal bom={editingBOM} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
            
            <ConfirmationModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)} 
                onConfirm={handleDelete} 
                title="Xóa Định mức" 
                message="Bạn có chắc chắn muốn xóa định mức này không?" 
            />
            
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
};

export default BOMPage;
