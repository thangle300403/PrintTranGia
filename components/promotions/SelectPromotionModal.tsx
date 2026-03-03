
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Promotion } from '../../types';
import { SearchIcon } from '../icons/Icons';

interface SelectPromotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (promotion: Promotion) => void;
    currentOrderValue: number;
}

export const SelectPromotionModal: React.FC<SelectPromotionModalProps> = ({ isOpen, onClose, onApply, currentOrderValue }) => {
    const { promotions } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null);

    const checkEligibility = (promo: Promotion): { isEligible: boolean; reason?: string } => {
        if (promo.status !== 'active') return { isEligible: false, reason: 'Đã ngưng hoạt động' };
        
        const now = new Date();
        if (promo.startDate && new Date(promo.startDate) > now) return { isEligible: false, reason: 'Chưa đến ngày áp dụng' };
        if (promo.endDate && new Date(promo.endDate) < now) return { isEligible: false, reason: 'Đã hết hạn' };
        
        if (promo.usageLimit && (promo.timesUsed || 0) >= promo.usageLimit) return { isEligible: false, reason: 'Đã hết lượt sử dụng' };
        
        if (promo.minOrderValue && currentOrderValue < promo.minOrderValue) {
            return { isEligible: false, reason: `Đơn tối thiểu ${promo.minOrderValue.toLocaleString('vi-VN')}đ` };
        }

        return { isEligible: true };
    };

    const filteredPromotions = useMemo(() => {
        return promotions.filter(p => 
            p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        ).map(p => ({
            ...p,
            eligibility: checkEligibility(p)
        })).sort((a, b) => {
            // Sort eligible first
            if (a.eligibility.isEligible && !b.eligibility.isEligible) return -1;
            if (!a.eligibility.isEligible && b.eligibility.isEligible) return 1;
            return 0;
        });
    }, [promotions, searchTerm, currentOrderValue]);

    const handleApply = () => {
        if (selectedPromoId) {
            const promo = promotions.find(p => p.id === selectedPromoId);
            if (promo) {
                onApply(promo);
                onClose();
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh]">
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chương trình khuyến mãi</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                
                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm tên chương trình khuyến mãi..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredPromotions.length > 0 ? (
                        filteredPromotions.map(promo => (
                            <div 
                                key={promo.id} 
                                onClick={() => promo.eligibility.isEligible && setSelectedPromoId(promo.id === selectedPromoId ? null : promo.id)}
                                className={`relative border rounded-lg p-4 transition-all cursor-pointer flex items-start gap-4
                                    ${!promo.eligibility.isEligible ? 'opacity-60 bg-gray-100 cursor-not-allowed border-gray-200' : 
                                      selectedPromoId === promo.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300 bg-white'}
                                `}
                            >
                                <div className="pt-1">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedPromoId === promo.id}
                                        disabled={!promo.eligibility.isEligible}
                                        readOnly
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{promo.description}</h4>
                                        {promo.eligibility.isEligible ? (
                                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">Có thể áp dụng</span>
                                        ) : (
                                            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{promo.eligibility.reason}</span>
                                        )}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 gap-x-4 gap-y-1">
                                        <div>Mã: <span className="font-mono font-bold text-gray-700">{promo.code}</span></div>
                                        <div>Hình thức: {promo.type === 'percentage' ? `Giảm ${promo.value}%` : `Giảm ${promo.value.toLocaleString('vi-VN')}đ`}</div>
                                    </div>
                                    {promo.eligibility.reason && promo.eligibility.reason.includes('Đơn tối thiểu') && (
                                         <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-1.5 rounded">
                                            Cần mua thêm {(promo.minOrderValue! - currentOrderValue).toLocaleString('vi-VN')}đ để áp dụng
                                         </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">Không tìm thấy chương trình khuyến mãi nào.</div>
                    )}
                </div>

                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 bg-white dark:bg-gray-800 rounded-b-xl">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition">Đóng</button>
                    <button 
                        onClick={handleApply} 
                        disabled={!selectedPromoId}
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                    >
                        Đồng ý
                    </button>
                </div>
            </div>
        </div>
    );
};
