
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { PrintMethodGroup, PrintPriceConfiguration, PrintBatchRule } from '../../types';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { PencilIcon, TrashIcon, PlusCircleIcon } from '../../components/icons/Icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';

const PrintMethodGroupModal: React.FC<{
  group: Partial<PrintMethodGroup> | null;
  onClose: () => void;
  onSave: (group: Omit<PrintMethodGroup, 'id'> | PrintMethodGroup) => void;
}> = ({ group, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<PrintMethodGroup>>(group || { name: '', description: '' });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!formData.name?.trim()) return; onSave(formData as PrintMethodGroup); onClose(); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md"><h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{group?.id ? 'Chỉnh sửa' : 'Thêm'} Phương thức in</h3><form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên phương thức</label><input name="name" value={formData.name || ''} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700" required autoFocus /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label><textarea name="description" value={formData.description || ''} onChange={e => setFormData(p => ({...p, description: e.target.value}))} rows={3} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700" /></div><div className="mt-8 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600">Hủy</button><button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu</button></div></form></div>
        </div>
    );
};

const PrintPriceConfigModal: React.FC<{ 
    config: Partial<PrintPriceConfiguration> | null; 
    groupId: string; 
    onClose: () => void; 
    onSave: (config: Omit<PrintPriceConfiguration, 'id'> | PrintPriceConfiguration) => void;
}> = ({ config, groupId, onClose, onSave }) => {
    
    const [formData, setFormData] = useState<Partial<PrintPriceConfiguration>>(
        config || { 
            groupId, 
            name: '',
            numColors: 4,
            maxSheetWidth: 72, maxSheetHeight: 52,
            minSheetWidth: 30, minSheetHeight: 25,
            gripperEdge: 1.5,
            platePrice: 120000,
            setupPrice: 200000,
            impressionPrice: 300,
            fixedWastageSheets: 80,
            runningWastagePercent: 3,
            batchRules: []
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleNumberChange = (name: keyof PrintPriceConfiguration, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Batch Pricing Logic
    const handleAddBatchRule = () => {
        setFormData(prev => ({
            ...prev,
            batchRules: [...(prev.batchRules || []), { id: `br_${Date.now()}`, maxQuantity: 0, price: 0 }]
        }));
    };

    const handleRemoveBatchRule = (id: string) => {
        setFormData(prev => ({
            ...prev,
            batchRules: (prev.batchRules || []).filter(r => r.id !== id)
        }));
    };

    const handleBatchRuleChange = (id: string, field: keyof PrintBatchRule, value: number) => {
        setFormData(prev => ({
            ...prev,
            batchRules: (prev.batchRules || []).map(r => r.id === id ? { ...r, [field]: value } : r)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('Vui lòng nhập tên máy in.');
            return;
        }
        onSave(formData as PrintPriceConfiguration);
        onClose();
    };

    const labelClass="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const inputClass="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-sm";
  
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex-shrink-0">{config?.id ? 'Chỉnh sửa' : 'Thêm'} Cấu hình giá in</h3>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="space-y-6 overflow-y-auto pr-2 flex-1">
                        
                        {/* Card 1: Machine Specs */}
                        <div className="p-4 border rounded-lg shadow-sm">
                            <h4 className="font-semibold text-blue-700 mb-3">1. Thông số máy</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Tên máy in</label>
                                    <input name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} required autoFocus placeholder="VD: Heidelberg Speedmaster 52x72"/>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Số màu</label>
                                        <FormattedNumberInput value={formData.numColors || 0} onChange={v => handleNumberChange('numColors', v)} className={`${inputClass} text-right`} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelClass}>Khổ in tối đa (Rộng x Cao) cm</label>
                                        <div className="flex items-center gap-2">
                                            <FormattedNumberInput value={formData.maxSheetWidth || 0} onChange={v => handleNumberChange('maxSheetWidth', v)} className={`${inputClass} text-right`} />
                                            <span>x</span>
                                            <FormattedNumberInput value={formData.maxSheetHeight || 0} onChange={v => handleNumberChange('maxSheetHeight', v)} className={`${inputClass} text-right`} />
                                        </div>
                                    </div>
                                </div>
                                 <div className="grid grid-cols-3 gap-4">
                                     <div>
                                        <label className={labelClass}>Lề nhíp (cm)</label>
                                        <FormattedNumberInput value={formData.gripperEdge || 0} onChange={v => handleNumberChange('gripperEdge', v)} className={`${inputClass} text-right`} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelClass}>Khổ in tối thiểu (Rộng x Cao) cm</label>
                                        <div className="flex items-center gap-2">
                                            <FormattedNumberInput value={formData.minSheetWidth || 0} onChange={v => handleNumberChange('minSheetWidth', v)} className={`${inputClass} text-right`} />
                                            <span>x</span>
                                            <FormattedNumberInput value={formData.minSheetHeight || 0} onChange={v => handleNumberChange('minSheetHeight', v)} className={`${inputClass} text-right`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Costs */}
                        <div className="p-4 border rounded-lg shadow-sm">
                            <h4 className="font-semibold text-green-700 mb-3">2. Chi phí định mức (Công thức)</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Giá Kẽm (đ/tấm)</label>
                                    <FormattedNumberInput value={formData.platePrice || 0} onChange={v => handleNumberChange('platePrice', v)} className={`${inputClass} text-right`} />
                                </div>
                                <div>
                                    <label className={labelClass}>Phí ra bài/Setup (đ)</label>
                                    <FormattedNumberInput value={formData.setupPrice || 0} onChange={v => handleNumberChange('setupPrice', v)} className={`${inputClass} text-right`} />
                                </div>
                                <div>
                                    <label className={labelClass}>Giá In/Lượt (đ)</label>
                                    <FormattedNumberInput value={formData.impressionPrice || 0} onChange={v => handleNumberChange('impressionPrice', v)} className={`${inputClass} text-right`} />
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Wastage */}
                        <div className="p-4 border rounded-lg shadow-sm">
                            <h4 className="font-semibold text-orange-700 mb-3">3. Hao hụt</h4>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Bù hao cố định (tờ)</label>
                                    <FormattedNumberInput value={formData.fixedWastageSheets || 0} onChange={v => handleNumberChange('fixedWastageSheets', v)} className={`${inputClass} text-right`} />
                                </div>
                                <div>
                                    <label className={labelClass}>Bù hao khi chạy (%)</label>
                                    <FormattedNumberInput value={formData.runningWastagePercent || 0} onChange={v => handleNumberChange('runningWastagePercent', v)} className={`${inputClass} text-right`} />
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Hybrid Pricing (Batch Pricing) */}
                        <div className="p-4 border rounded-lg shadow-sm bg-purple-50/50 border-purple-100">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-purple-700">4. Bảng giá theo Lô (Hybrid Pricing)</h4>
                                <button type="button" onClick={handleAddBatchRule} className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 flex items-center gap-1">
                                    <PlusCircleIcon className="w-3 h-3"/> Thêm dòng
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.batchRules && formData.batchRules.length > 0 ? (
                                    formData.batchRules.map((rule, index) => (
                                        <div key={rule.id} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-5 flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Số lượng đến:</span>
                                                <FormattedNumberInput 
                                                    value={rule.maxQuantity} 
                                                    onChange={v => handleBatchRuleChange(rule.id, 'maxQuantity', v)} 
                                                    className={`${inputClass} py-1 h-8`} 
                                                />
                                            </div>
                                            <div className="col-span-6 flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Giá trọn gói:</span>
                                                <FormattedNumberInput 
                                                    value={rule.price} 
                                                    onChange={v => handleBatchRuleChange(rule.id, 'price', v)} 
                                                    className={`${inputClass} py-1 h-8 font-semibold text-purple-700`} 
                                                />
                                            </div>
                                            <div className="col-span-1 text-center">
                                                <button type="button" onClick={() => handleRemoveBatchRule(rule.id)} className="text-red-500 hover:text-red-700 p-1">
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic text-center py-2">Chưa có quy tắc giá lô. Hệ thống sẽ sử dụng công thức tính chi tiết.</p>
                                )}
                            </div>
                        </div>

                    </div>
                    <div className="mt-8 flex justify-end space-x-3 border-t dark:border-gray-700 pt-4 flex-shrink-0">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PrintMethodCatalogPage: React.FC = () => {
    const { 
        printMethodGroups, printPriceConfigurations,
        addPrintMethodGroup, updatePrintMethodGroup, deletePrintMethodGroup,
        addPrintPriceConfiguration, updatePrintPriceConfiguration, deletePrintPriceConfiguration,
        currentUser, rolePermissions 
    } = useData();
    
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [modal, setModal] = useState<{ type: 'group' | 'config', data: any, groupId?: string } | null>(null);
    const [confirm, setConfirm] = useState<{ type: string, id: string } | null>(null);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (!selectedGroupId && printMethodGroups.length > 0) {
            setSelectedGroupId(printMethodGroups[0].id);
        }
    }, [printMethodGroups, selectedGroupId]);

    const userPermissions = useMemo(() => {
        if (!currentUser) return { canView: false, canCreate: false, canEdit: false, canDelete: false, canManageCosting: false };
        const permissions = rolePermissions[currentUser.roleId] || [];
        return {
            canView: permissions.includes('view_print_methods'),
            canCreate: permissions.includes('create_print_methods'),
            canEdit: permissions.includes('edit_print_methods'),
            canDelete: permissions.includes('delete_print_methods'),
            canManageCosting: permissions.includes('manage_costing_rules'),
        };
    }, [currentUser, rolePermissions]);

    const selectedGroupConfigs = useMemo(() => {
        if (!selectedGroupId) return [];
        return printPriceConfigurations.filter(c => c.groupId === selectedGroupId);
    }, [printPriceConfigurations, selectedGroupId]);

    if (!userPermissions.canView) return <div className="p-8 text-center text-red-600">Truy cập bị từ chối.</div>;

    const handleSave = (type: string, data: any) => {
        switch(type) {
            case 'group': data.id ? updatePrintMethodGroup(data) : addPrintMethodGroup(data); break;
            case 'config': data.id ? updatePrintPriceConfiguration(data) : addPrintPriceConfiguration(data); break;
        }
        setModal(null);
        setToast('Lưu thành công!');
    };

    const handleDelete = () => {
        if (!confirm) return;
        let success = true;
        switch(confirm.type) {
            case 'group': success = deletePrintMethodGroup(confirm.id); break;
            case 'config': success = deletePrintPriceConfiguration(confirm.id); break;
        }
        if (success) setToast('Đã xóa thành công!');
        setConfirm(null);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Phương thức in</h1>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Phương thức</h2>
                            {userPermissions.canCreate && <button onClick={() => setModal({ type: 'group', data: null })} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold shadow-sm">+ Thêm</button>}
                        </div>
                        <ul className="space-y-1.5 flex-1 overflow-y-auto -mr-2 pr-2">
                            {printMethodGroups.map(group => (
                                <li key={group.id} onClick={() => setSelectedGroupId(group.id)} className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${selectedGroupId === group.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    <p className="font-semibold text-sm">{group.name}</p>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                        {userPermissions.canEdit && <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'group', data: group }); }} className={`p-1.5 rounded-full hover:bg-white/20 ${selectedGroupId === group.id ? 'text-white/80 hover:text-white' : 'text-gray-500'}`}><PencilIcon className="w-4 h-4" /></button>}
                                        {userPermissions.canDelete && <button onClick={(e) => { e.stopPropagation(); setConfirm({ type: 'group', id: group.id }); }} className={`p-1.5 rounded-full hover:bg-white/20 ${selectedGroupId === group.id ? 'text-white/80 hover:text-white' : 'text-gray-500'}`}><TrashIcon className="w-4 h-4" /></button>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                        {selectedGroupId ? (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="font-bold text-lg">Cấu hình giá của "{printMethodGroups.find(g => g.id === selectedGroupId)?.name}"</h2>
                                    {userPermissions.canCreate && <button onClick={() => setModal({ type: 'config', data: null, groupId: selectedGroupId })} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Thêm cấu hình</button>}
                                </div>
                                <div className="overflow-y-auto flex-1 -mx-4 px-4">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 sticky top-0"><tr className="text-left text-xs uppercase"><th className="p-3 font-semibold">Tên máy</th><th className="p-3 font-semibold">Khổ Max</th><th className="p-3 font-semibold">Số màu</th><th className="p-3 font-semibold">Giá kẽm</th><th className="p-3 font-semibold">Giá/lượt</th><th className="p-3 w-20"></th></tr></thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {selectedGroupConfigs.map(config => (
                                            <tr key={config.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                                                <td className="p-3 font-semibold text-gray-800 dark:text-gray-100">
                                                    {config.name}
                                                    {config.batchRules && config.batchRules.length > 0 && (
                                                        <span className="ml-2 inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded border border-purple-200">Hybrid</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-gray-600 dark:text-gray-300">{config.maxSheetWidth}x{config.maxSheetHeight} cm</td>
                                                <td className="p-3 text-gray-600 dark:text-gray-300">{config.numColors}</td>
                                                <td className="p-3 text-gray-500 dark:text-gray-400">{config.platePrice.toLocaleString('vi-VN')}đ</td>
                                                <td className="p-3 text-gray-500 dark:text-gray-400">{config.impressionPrice.toLocaleString('vi-VN')}đ</td>
                                                <td className="p-3 text-right"><div className="opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1"><button onClick={() => setModal({type: 'config', data: config, groupId: selectedGroupId })} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><PencilIcon className="w-4 h-4 text-gray-600"/></button><button onClick={() => setConfirm({type: 'config', id: config.id})} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><TrashIcon className="w-4 h-4 text-red-500"/></button></div></td>
                                            </tr>
                                        ))}
                                        {selectedGroupConfigs.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-gray-400">Chưa có cấu hình giá nào.</td></tr>)}
                                    </tbody>
                                </table>
                                </div>
                            </>
                        ) : (<div className="flex items-center justify-center h-full text-gray-500">Chọn một phương thức in để xem.</div>)}
                    </div>
                </div>
            </div>
            {modal?.type === 'group' && <PrintMethodGroupModal group={modal.data} onClose={() => setModal(null)} onSave={(data) => handleSave('group', data)} />}
            {modal?.type === 'config' && <PrintPriceConfigModal config={modal.data} groupId={modal.groupId!} onClose={() => setModal(null)} onSave={(data) => handleSave('config', data)} />}
            <ConfirmationModal isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete} title="Xác nhận Xóa" message="Bạn có chắc chắn muốn xóa mục này?" />
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
};

export default PrintMethodCatalogPage;
