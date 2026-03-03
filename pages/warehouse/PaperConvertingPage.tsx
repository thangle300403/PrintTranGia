
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { MaterialVariant } from '../../types';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { calculateOptimalLayout } from '../../utils/costing/layoutUtils';
import { RefreshIcon, ScissorsIcon } from '../../components/icons/Icons';

const PaperConvertingPage: React.FC = () => {
    const { materialVariants, materialGroups, addPaperConversion, paperConversions } = useData();
    
    // State
    const [sourceId, setSourceId] = useState('');
    const [sourceQty, setSourceQty] = useState<number>(0);
    
    const [targetId, setTargetId] = useState('');
    // We still keep dimensions state for calculation, but they populate from targetId
    const [targetSizeW, setTargetSizeW] = useState<number>(0);
    const [targetSizeH, setTargetSizeH] = useState<number>(0);
    
    const [notes, setNotes] = useState('');

    // Derived Data
    const sourceMaterial = useMemo(() => materialVariants.find(m => m.id === sourceId), [materialVariants, sourceId]);
    const targetMaterial = useMemo(() => materialVariants.find(m => m.id === targetId), [materialVariants, targetId]);

    // Helper to extract dimensions from properties or fallback to parsing name
    const getMaterialDimensions = (m: MaterialVariant) => {
        if (m.width && m.height) return { w: m.width, h: m.height };
        // Fallback to parsing name if width/height missing (legacy)
        const match = m.name.match(/(\d+(\.\d+)?)\s*[xX]\s*(\d+(\.\d+)?)/);
        if (match) {
            return { w: parseFloat(match[1]), h: parseFloat(match[3]) };
        }
        return { w: 0, h: 0 };
    };

    // Helper to extract GSM from properties or fallback to parsing name
    const getMaterialGsm = (m: MaterialVariant) => {
        if (m.gsm) return m.gsm;
        const match = m.name.match(/(\d+)\s*gsm/i) || m.name.match(/C(\d+)/i) || m.name.match(/B(\d+)/i) || m.name.match(/F(\d+)/i);
        return match ? parseInt(match[1]) : 0;
    };

    const filteredTargetMaterials = useMemo(() => {
        if (!sourceMaterial) return materialVariants;

        // 1. Filter by Group (Must be same type of paper)
        let candidates = materialVariants.filter(m => m.groupId === sourceMaterial.groupId);

        // 2. Filter by GSM (Must be same weight)
        const sourceGsm = getMaterialGsm(sourceMaterial);
        
        if (sourceGsm) {
            candidates = candidates.filter(m => getMaterialGsm(m) === sourceGsm);
        }

        // 3. Exclude the source itself
        candidates = candidates.filter(m => m.id !== sourceId);

        // 4. Filter by Dimensions (Target Area must be smaller than Source Area)
        const sourceDims = getMaterialDimensions(sourceMaterial);
        if (sourceDims.w && sourceDims.h) {
            const sourceArea = sourceDims.w * sourceDims.h;
            candidates = candidates.filter(m => {
                const targetDims = getMaterialDimensions(m);
                // If we can't determine dimensions, keep it safe or exclude. Let's exclude to be safe for calculation.
                if (!targetDims.w || !targetDims.h) return false; 

                const targetArea = targetDims.w * targetDims.h;
                
                // Check Area: Target must be smaller
                return targetArea < sourceArea;
            });
        }

        return candidates;
    }, [materialVariants, sourceMaterial, sourceId]);

    // Reset target when source changes (if current target becomes invalid)
    useEffect(() => {
        if (targetId && !filteredTargetMaterials.some(m => m.id === targetId)) {
            setTargetId('');
        }
    }, [sourceId, filteredTargetMaterials, targetId]);
    // -----------------------------

    // Auto-fill dimensions when target material is selected
    useEffect(() => {
        if (targetMaterial) {
            const dims = getMaterialDimensions(targetMaterial);
            if (dims.w && dims.h) {
                setTargetSizeW(dims.w);
                setTargetSizeH(dims.h);
            }
        } else {
            setTargetSizeW(0);
            setTargetSizeH(0);
        }
    }, [targetMaterial]);

    const calculation = useMemo(() => {
        if (!sourceMaterial || !targetSizeW || !targetSizeH || !sourceQty) return null;
        
        const dims = getMaterialDimensions(sourceMaterial);
        if (!dims.w || !dims.h) return null;
        const sourceW = dims.w;
        const sourceH = dims.h;

        const layout = calculateOptimalLayout(targetSizeW, targetSizeH, sourceW, sourceH);
        
        const totalOutput = sourceQty * layout.items;
        const wastePercentage = layout.paperEfficiency > 0 ? (100 - layout.paperEfficiency).toFixed(1) : '100';
        
        return {
            layout,
            totalOutput,
            wastePercentage
        };
    }, [sourceMaterial, targetSizeW, targetSizeH, sourceQty]);

    const handleSave = () => {
        if (!calculation || !sourceMaterial || !targetMaterial) {
            alert('Vui lòng chọn đầy đủ Giấy nguồn và Giấy đích.');
            return;
        }
        
        const sourceName = sourceMaterial.name;
        const targetName = targetMaterial.name;

        addPaperConversion({
            date: new Date(),
            sourceMaterialId: sourceId,
            sourceQuantity: sourceQty,
            sourceUnit: sourceMaterial.purchaseUnit || 'Ram',
            outputMaterialId: targetId, 
            outputQuantity: calculation.totalOutput,
            wastage: Number(calculation.wastePercentage),
            notes: `Cắt ${sourceName} -> ${targetName} (${calculation.layout.items} con/tờ). ${notes}`,
            performedBy: 'NV_KHO'
        });
        
        alert('Đã lưu lệnh cắt giấy. Kho đã được cập nhật.');
        setSourceQty(0);
        setNotes('');
    };

    const getMaterialName = (id: string) => {
        const variant = materialVariants.find(m => m.id === id);
        if (!variant) return id;
        const group = materialGroups.find(g => g.id === variant.groupId);
        return group ? `${group.name} ${variant.name}` : variant.name;
    };

    return (
        <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <ScissorsIcon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cắt giấy / Xả cuộn</h1>
                    <p className="text-sm text-gray-500">Chuyển đổi tồn kho từ giấy khổ lớn sang khổ nhỏ</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-5">
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white border-b pb-2 dark:border-gray-700">1. Thiết lập lệnh cắt</h2>
                    
                    {/* Source Selection */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                        <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Giấy nguồn (Kho đi)</label>
                        <select 
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600" 
                            value={sourceId} 
                            onChange={e => setSourceId(e.target.value)}
                        >
                            <option value="">-- Chọn giấy cuộn/khổ lớn --</option>
                            {materialVariants.map(m => {
                                const group = materialGroups.find(g => g.id === m.groupId);
                                return <option key={m.id} value={m.id}>{group?.name} - {m.name} ({m.purchaseUnit})</option>;
                            })}
                        </select>
                        <div className="mt-2">
                             <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Số lượng xuất</label>
                             <FormattedNumberInput 
                                value={sourceQty} 
                                onChange={setSourceQty} 
                                className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
                                placeholder="VD: 1 (Ram) hoặc 100 (tờ)" 
                            />
                        </div>
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-gray-200 dark:bg-gray-600 rounded-full p-1">
                            <ScissorsIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                        </div>
                    </div>

                    {/* Target Selection */}
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                        <label className="block text-sm font-bold text-green-800 dark:text-green-300 mb-1">Giấy đích (Kho đến)</label>
                        <select 
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-100 disabled:text-gray-400" 
                            value={targetId} 
                            onChange={e => setTargetId(e.target.value)}
                            disabled={!sourceId}
                        >
                            <option value="">
                                {!sourceId ? '-- Vui lòng chọn giấy nguồn trước --' : '-- Chọn thành phẩm sau cắt --'}
                            </option>
                            {filteredTargetMaterials
                                .map(m => {
                                    const group = materialGroups.find(g => g.id === m.groupId);
                                    return <option key={m.id} value={m.id}>{group?.name} - {m.name} ({m.purchaseUnit})</option>;
                                })
                            }
                        </select>
                        
                        {targetMaterial ? (
                            <div className="mt-2 text-xs text-green-700 dark:text-green-400 flex justify-between">
                                <span>Kích thước: <strong>{targetSizeW} x {targetSizeH}</strong></span>
                                <span>Đơn vị: <strong>{targetMaterial.purchaseUnit}</strong></span>
                            </div>
                        ) : (
                             <div className="mt-2 text-xs text-gray-500 italic">
                                {filteredTargetMaterials.length === 0 && sourceId 
                                    ? '* Không tìm thấy giấy đích phù hợp (Cùng loại, cùng GSM, khổ nhỏ hơn).' 
                                    : '* Đã lọc theo: Cùng loại giấy, Cùng định lượng, Khổ nhỏ hơn.'}
                             </div>
                        )}
                    </div>

                    <div>
                         <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Ghi chú</label>
                         <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" 
                            rows={2}
                            placeholder="Ghi chú lô hàng, số PO..."
                        ></textarea>
                    </div>
                    
                    <button 
                        onClick={handleSave} 
                        disabled={!calculation} 
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center gap-2"
                    >
                        {calculation ? 'Lưu & Cập nhật Kho' : 'Vui lòng nhập đủ thông tin'}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white mb-4">2. Kết quả tính toán & Lịch sử</h2>
                    
                    {calculation ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Số con / tờ lớn</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{calculation.layout.items}</p>
                                <p className="text-xs text-gray-400">({calculation.layout.cols} ngang x {calculation.layout.rows} dọc)</p>
                            </div>
                             <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Tổng thành phẩm</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{calculation.totalOutput.toLocaleString('vi-VN')}</p>
                                <p className="text-xs text-gray-400">{targetMaterial?.purchaseUnit || 'đv'}</p>
                            </div>
                             <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Hiệu suất giấy</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{calculation.layout.paperEfficiency.toFixed(1)}%</p>
                            </div>
                             <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Hao hụt (Lề)</p>
                                <p className="text-2xl font-bold text-red-500">{calculation.wastePercentage}%</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl mb-6 min-h-[150px]">
                            <div>
                                <RefreshIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                Chọn giấy nguồn và giấy đích để xem tính toán
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden flex flex-col">
                        <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Lịch sử cắt giấy gần đây</h3>
                        <div className="overflow-auto flex-1 border rounded-lg dark:border-gray-700">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 sticky top-0">
                                    <tr>
                                        <th className="p-3">Ngày</th>
                                        <th className="p-3">Nguồn (Xuất)</th>
                                        <th className="p-3">Đích (Nhập)</th>
                                        <th className="p-3 text-right">Hao hụt</th>
                                        <th className="p-3">Người thực hiện</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {paperConversions.slice().reverse().map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="p-3 text-gray-500">{new Date(c.date).toLocaleDateString('vi-VN')}</td>
                                            <td className="p-3">
                                                <span className="font-medium text-red-600">-{c.sourceQuantity} {c.sourceUnit}</span>
                                                <div className="text-xs text-gray-500">{getMaterialName(c.sourceMaterialId)}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className="font-medium text-green-600">+{c.outputQuantity}</span>
                                                <div className="text-xs text-gray-500">{getMaterialName(c.outputMaterialId)}</div>
                                            </td>
                                            <td className="p-3 text-right text-gray-500">{c.wastage}%</td>
                                            <td className="p-3 text-gray-500">{c.performedBy}</td>
                                        </tr>
                                    ))}
                                    {paperConversions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400">Chưa có dữ liệu lịch sử.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default PaperConvertingPage;
