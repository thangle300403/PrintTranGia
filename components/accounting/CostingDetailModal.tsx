import React from 'react';
import { useData } from '../../context/DataContext';

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(Math.round(value));

interface CostingDetailModalProps {
    recordId: string;
    onClose: () => void;
}

export const CostingDetailModal: React.FC<CostingDetailModalProps> = ({ recordId, onClose }) => {
    const { getCostingRecordById, materialVariants, processConfigurations, printPriceConfigurations } = useData();
    const record = getCostingRecordById(recordId);

    if (!record) return null;
    
    const { inputs, analysis, costs } = record;

    const material = materialVariants.find(v => v.id === inputs.selectedMaterialVariantId);
    const printConfig = printPriceConfigurations.find(pc => pc.id === inputs.selectedPrintPriceConfigId);
    const processes = processConfigurations.filter(p => inputs.selectedProcessIds.includes(p.id));

    const DetailRow: React.FC<{ label: string; value: React.ReactNode; isHeader?: boolean }> = ({ label, value, isHeader }) => (
        <div className={`flex justify-between items-start py-2 ${isHeader ? 'font-bold text-base border-t pt-3 mt-2' : 'text-sm'}`}>
            <span className="text-gray-500 dark:text-gray-400">{label}:</span>
            <span className="font-semibold text-right">{value}</span>
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chi tiết Tính giá #{record.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl p-1 leading-none">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Inputs */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <h3 className="font-bold mb-3 border-b pb-2">Thông số Đầu vào</h3>
                        <DetailRow label="Tên sản phẩm" value={inputs.productName} />
                        <DetailRow label="Số lượng" value={formatCurrency(inputs.quantity)} />
                        <DetailRow label="Kích thước" value={inputs.productType === 'bag' ? `${inputs.bagN}x${inputs.bagC}x${inputs.bagH}cm` : `${inputs.width}x${inputs.height}cm`} />
                        <DetailRow label="Chất liệu" value={material?.name || 'Không rõ'} />
                        <DetailRow label="In" value={`${inputs.printSides} mặt - ${inputs.printColors} - ${printConfig?.name}`} />
                         <DetailRow label="Gia công" value={processes.length > 0 ? processes.map(p => p.name).join(', ') : 'Không'} />
                        <DetailRow label="Lợi nhuận" value={`${inputs.markup}%`} />
                    </div>
                    {/* Right Column: Analysis & Costs */}
                    <div className="space-y-4">
                         <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                            <h3 className="font-bold mb-3 border-b pb-2">Phân tích Kỹ thuật</h3>
                            <DetailRow label="Kích thước TP" value={`${analysis.finalWidth.toFixed(1)} x ${analysis.finalHeight.toFixed(1)} cm`} />
                            <DetailRow label="Khổ vật tư" value={analysis.sheetSize} />
                            <DetailRow label="Số con / tờ" value={`${analysis.itemsPerSheet} con`} />
                            <DetailRow label="Số tờ in (net)" value={`${analysis.netSheets} tờ`} />
                            <DetailRow label="Bù hao" value={`${analysis.wastageSheets} tờ`} />
                            <DetailRow label="Tổng vật tư" value={`${analysis.totalSheets} tờ`} isHeader />
                        </div>
                         <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                            <h3 className="font-bold mb-3 border-b pb-2">Phân tích Chi phí</h3>
                            <DetailRow label="Chi phí vật tư" value={`${formatCurrency(costs.materialCost)} đ`} />
                            <DetailRow label="Chi phí in ấn" value={`${formatCurrency(costs.printCost)} đ`} />
                            <DetailRow label="Chi phí gia công" value={`${formatCurrency(costs.processCost)} đ`} />
                            <DetailRow label="TỔNG GIÁ VỐN" value={`${formatCurrency(costs.totalCost)} đ`} isHeader />
                            <DetailRow label="Giá bán đề xuất" value={<span className="text-green-600 dark:text-green-400">{formatCurrency(costs.totalPrice)} đ</span>} isHeader />
                             <DetailRow label="Đơn giá / SP" value={<span className="text-green-600 dark:text-green-400">{formatCurrency(costs.pricePerUnit)} đ</span>} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};