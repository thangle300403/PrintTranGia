
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { CostingRecord, QuoteItem } from '../../types';
import { EyeIcon, TrashIcon, DocumentAddIcon } from '../../components/icons/Icons';
import { CostingDetailModal } from '../../components/accounting/CostingDetailModal';
import { CostingToolModal } from '../../components/accounting/CostingToolModal';
import { ConfirmationModal } from '../../components/ConfirmationModal';

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(Math.round(value));

const CostingPage: React.FC = () => {
    const navigate = useNavigate();
    const { costingRecords, deleteCostingRecord } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);
    const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
    const [isToolOpen, setIsToolOpen] = useState(false);

    const filteredRecords = useMemo(() => {
        return costingRecords
            .filter(record => {
                if (!searchTerm) return true;
                const lowerSearch = searchTerm.toLowerCase();
                return record.id.toLowerCase().includes(lowerSearch) ||
                       record.inputs.productName.toLowerCase().includes(lowerSearch);
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [costingRecords, searchTerm]);

    const handleCreateQuote = (record: CostingRecord) => {
        const { inputs, costs } = record;
        const prefillItem: Partial<QuoteItem> = {
            productName: inputs.productName,
            productType: inputs.productType === 'bag' ? 'Túi giấy' : 'Tờ rơi',
            quantity: inputs.quantity,
            material: { id: inputs.selectedMaterialVariantId } as any, // Simplified for navigation
            processes: inputs.selectedProcessIds.map(id => ({ id } as any)), // Simplified
            printPriceConfigurationId: inputs.selectedPrintPriceConfigId,
            totalPrice: costs.totalPrice,
            details: {
                size: inputs.productType === 'bag' 
                    ? `${inputs.bagN}x${inputs.bagC}x${inputs.bagH}cm` 
                    : `${inputs.width}x${inputs.height}cm`,
            }
        };
        navigate('/quotes/new', { state: { prefillItems: [prefillItem] } });
    };

    const confirmDelete = () => {
        if (recordToDelete) {
            deleteCostingRecord(recordToDelete);
            setRecordToDelete(null);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lịch sử Tính giá thành</h1>
                    <button
                        onClick={() => setIsToolOpen(true)}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-px"
                    >
                        + Tính giá thành mới
                    </button>
                </div>
                
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <input
                        type="text"
                        placeholder="Tìm theo mã hoặc tên sản phẩm..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Mã TGT</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Ngày tính</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tên sản phẩm</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Số lượng</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Giá vốn</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Giá bán đề xuất</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredRecords.map(record => (
                                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">{record.id}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(record.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-6 py-4 font-semibold">{record.inputs.productName}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(record.inputs.quantity)}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(record.costs.totalCost)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(record.costs.totalPrice)}</td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            <button onClick={() => setViewingRecordId(record.id)} className="p-1 text-gray-500 hover:text-blue-600" title="Xem chi tiết"><EyeIcon /></button>
                                            <button onClick={() => handleCreateQuote(record)} className="p-1 text-gray-500 hover:text-green-600" title="Tạo báo giá"><DocumentAddIcon /></button>
                                            <button onClick={() => setRecordToDelete(record.id)} className="p-1 text-gray-500 hover:text-red-600" title="Xóa"><TrashIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRecords.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">Chưa có bản tính giá nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {isToolOpen && <CostingToolModal onClose={() => setIsToolOpen(false)} />}
            {viewingRecordId && <CostingDetailModal recordId={viewingRecordId} onClose={() => setViewingRecordId(null)} />}
            
            <ConfirmationModal
                isOpen={!!recordToDelete}
                onClose={() => setRecordToDelete(null)}
                onConfirm={confirmDelete}
                title="Xác nhận Xóa"
                message="Bạn có chắc chắn muốn xóa bản tính giá này không? Hành động này không thể hoàn tác."
            />
        </>
    );
};

export default CostingPage;
