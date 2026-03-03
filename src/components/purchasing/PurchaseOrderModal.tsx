
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { PurchaseOrder, PurchaseOrderStatus, RawMaterial, MaterialVariant, PaymentStatus, POItem } from '../../types';
import FormattedNumberInput from '../FormattedNumberInput';
import DatePicker from '../DatePicker';
import { TrashIcon, PlusCircleIcon, CheckCircleIcon, CreditCardIcon } from '../icons/Icons';
import CustomSelect from '../CustomSelect';

interface PurchaseOrderModalProps {
  po: Partial<PurchaseOrder> | null;
  onClose: () => void;
  onSave: (po: Omit<PurchaseOrder, 'id'> | PurchaseOrder) => void;
  isViewOnly?: boolean;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ po, onClose, onSave, isViewOnly = false }) => {
    const { suppliers, rawMaterials, rawMaterialGroups, materialVariants, materialGroups, printPriceConfigurations, printMethodGroups, processConfigurations, processGroups } = useData();
    const [formData, setFormData] = useState<Partial<PurchaseOrder>>(
        po || { supplierId: '', orderDate: new Date(), status: PurchaseOrderStatus.Draft, paymentStatus: PaymentStatus.Unpaid, paidAmount: 0 }
    );
    
    const [items, setItems] = useState<(POItem & { tempId: string })[]>(
        (po?.items || []).map(item => ({ 
            ...item, 
            tempId: crypto.randomUUID()
        }))
    );

    const isLocked = formData.status === PurchaseOrderStatus.Received || formData.status === PurchaseOrderStatus.Cancelled || isViewOnly;

    const totalAmount = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0), [items]);

    const supplierOptions = useMemo(() => ([
        { value: '', label: '-- Chọn NCC --' },
        ...suppliers.map(s => ({ value: s.id, label: s.name }))
    ]), [suppliers]);


    const handleMainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: 'orderDate' | 'expectedDeliveryDate', dateString: string) => {
        setFormData(prev => ({ ...prev, [name]: dateString ? new Date(dateString) : undefined }));
    };
    
    const handleAddItem = () => {
        setItems([...items, { 
            id: '', 
            tempId: crypto.randomUUID(), 
            type: 'material', 
            groupId: '', 
            materialId: '', 
            materialName: '', 
            quantity: 1, 
            unit: '', 
            unitPrice: 0,
            totalPrice: 0
        }]);
    };

    const handleRemoveItem = (tempId: string) => {
        setItems(items.filter(item => item.tempId !== tempId));
    };

    const handleItemChange = (tempId: string, field: keyof POItem, value: any) => {
        setItems(items.map(item => {
            if (item.tempId === tempId) {
                const updatedItem = { ...item, [field]: value };
                
                if (field === 'type') {
                    updatedItem.groupId = '';
                    updatedItem.materialId = '';
                    updatedItem.materialName = '';
                    updatedItem.unit = '';
                    updatedItem.unitPrice = 0;
                }

                if (field === 'groupId') {
                    updatedItem.materialId = '';
                    updatedItem.materialName = '';
                    updatedItem.unit = '';
                    updatedItem.unitPrice = 0;
                }

                if (field === 'materialId') {
                    if (updatedItem.type === 'material') {
                        const material = materialVariants.find(m => m.id === value);
                        if (material) {
                            updatedItem.materialName = material.name;
                            updatedItem.unit = material.purchaseUnit;
                            updatedItem.unitPrice = material.purchasePrice;
                        }
                    } else if (updatedItem.type === 'raw_material') {
                        const material = rawMaterials.find(m => m.id === value);
                        if (material) {
                            updatedItem.materialName = material.name;
                            updatedItem.unit = material.unit;
                            updatedItem.unitPrice = material.purchasePrice;
                        }
                    } else if (updatedItem.type === 'print_service') {
                        // Gia công ngoài
                        const config = processConfigurations.find(c => c.id === value);
                        if (config) {
                            updatedItem.materialName = config.name;
                            updatedItem.unit = config.pricingUnit;
                            updatedItem.unitPrice = config.unitPrice;
                        } else {
                            // Nếu không tìm thấy trong cấu hình gia công, thử tìm trong in ấn
                            const printPrice = printPriceConfigurations.find(c => c.id === value);
                            if (printPrice) {
                                updatedItem.materialName = printPrice.name;
                                updatedItem.unit = 'lượt';
                                updatedItem.unitPrice = printPrice.impressionPrice;
                            }
                        }
                    }
                }
                
                updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
                return updatedItem;
            }
            return item;
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) return;

        if (!formData.supplierId || items.length === 0) {
            alert('Vui lòng chọn Nhà cung cấp và thêm hàng hóa.');
            return;
        }

        const finalItems = items.map(({ tempId, ...rest }) => ({
            ...rest,
            totalPrice: rest.quantity * rest.unitPrice
        }));

        onSave({
            ...formData,
            items: finalItems,
            totalAmount
        } as PurchaseOrder);
    };

    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-200 disabled:cursor-not-allowed";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    
    const typeOptions = [
        { value: 'material', label: '📦 Giấy (Kho)' },
        { value: 'raw_material', label: '🛠️ Vật tư' },
        { value: 'print_service', label: '✂️ Gia công ngoài' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-0 rounded-xl shadow-xl w-full max-w-6xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isViewOnly ? `Chi tiết đơn #${po?.id}` : (po?.id ? `Sửa Đơn mua hàng ${po.id}` : 'Tạo Đơn mua hàng / Gia công')}
                    </h3>
                    <div className="flex gap-2">
                         {formData.paymentStatus === PaymentStatus.Paid ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/> Đã trả tiền</span>
                         ) : (
                             <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1"><CreditCardIcon className="w-4 h-4"/> {formData.paymentStatus}</span>
                         )}
                         {isLocked && <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/> {formData.status}</span>}
                    </div>
                </div>
                <form id="po-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Nhà cung cấp</label>
                            <CustomSelect
                                options={supplierOptions}
                                value={formData.supplierId || ''}
                                onChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}
                                disabled={isLocked}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Ngày đặt hàng</label>
                            <DatePicker value={formData.orderDate ? new Date(formData.orderDate).toISOString().split('T')[0] : ''} onChange={val => handleDateChange('orderDate', val)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Ngày giao dự kiến</label>
                            <DatePicker value={formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate).toISOString().split('T')[0] : ''} onChange={val => handleDateChange('expectedDeliveryDate', val)} className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 uppercase text-xs tracking-wider">Danh mục hàng hóa / Gia công</h4>
                        <div className="overflow-x-auto border rounded-lg dark:border-gray-600">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="p-2 w-40 text-left">Phân loại</th>
                                        <th className="p-2 w-48 text-left">Nhóm</th>
                                        <th className="p-2 text-left">Tên hàng / Dịch vụ</th>
                                        <th className="p-2 w-20">SL</th>
                                        <th className="p-2 w-20">ĐVT</th>
                                        <th className="p-2 w-32 text-right">Đơn giá</th>
                                        <th className="p-2 w-32 text-right">Thành tiền</th>
                                        <th className="p-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-600">
                                    {items.map(item => {
                                        let groupOptions: { value: string; label: string; }[] = [];
                                        let itemOptions: { value: string; label: string; }[] = [];
                                        
                                        if (item.type === 'material') {
                                            groupOptions = [{ value: '', label: '- Nhóm giấy -' }, ...materialGroups.map(g => ({ value: g.id, label: g.name }))];
                                            if (item.groupId) itemOptions = [{ value: '', label: '- Chọn giấy -' }, ...materialVariants.filter(m => m.groupId === item.groupId).map(m => ({ value: m.id, label: m.name }))];
                                        } else if (item.type === 'raw_material') {
                                            groupOptions = [{ value: '', label: '- Nhóm vật tư -' }, ...rawMaterialGroups.map(g => ({ value: g.id, label: g.name }))];
                                            if (item.groupId) itemOptions = [{ value: '', label: '- Chọn vật tư -' }, ...rawMaterials.filter(m => m.groupId === item.groupId).map(m => ({ value: m.id, label: m.name }))];
                                        } else if (item.type === 'print_service') {
                                            groupOptions = [
                                                { value: '', label: '- Chọn dịch vụ -' },
                                                ...printMethodGroups.map(g => ({ value: g.id, label: `In: ${g.name}` })),
                                                ...processGroups.map(g => ({ value: g.id, label: `GC: ${g.name}` }))
                                            ];
                                            
                                            // Lọc item dựa trên việc group là In hay Gia công sau in
                                            const isPrintGroup = printMethodGroups.some(g => g.id === item.groupId);
                                            if (isPrintGroup) {
                                                itemOptions = [{ value: '', label: '- Máy in -' }, ...printPriceConfigurations.filter(c => c.groupId === item.groupId).map(c => ({ value: c.id, label: c.name }))];
                                            } else {
                                                itemOptions = [{ value: '', label: '- Loại gia công -' }, ...processConfigurations.filter(c => c.groupId === item.groupId).map(c => ({ value: c.id, label: c.name }))];
                                            }
                                        }

                                        return (
                                        <tr key={item.tempId}>
                                            <td className="p-1">
                                                <CustomSelect 
                                                    value={item.type} 
                                                    onChange={v => handleItemChange(item.tempId, 'type', v)} 
                                                    options={typeOptions} 
                                                    disabled={isLocked} 
                                                    className="!py-1"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <CustomSelect 
                                                    value={item.groupId} 
                                                    onChange={v => handleItemChange(item.tempId, 'groupId', v)} 
                                                    options={groupOptions} 
                                                    disabled={isLocked} 
                                                    className="!py-1"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <CustomSelect 
                                                    value={item.materialId} 
                                                    onChange={v => handleItemChange(item.tempId, 'materialId', v)} 
                                                    options={itemOptions} 
                                                    disabled={isLocked || !item.groupId} 
                                                    className="!py-1"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <FormattedNumberInput 
                                                    value={item.quantity} 
                                                    onChange={v => handleItemChange(item.tempId, 'quantity', v)} 
                                                    className={`${inputClass} text-center !p-1.5`} 
                                                    disabled={isLocked} 
                                                />
                                            </td>
                                            <td className="p-1">
                                                <input 
                                                    value={item.unit} 
                                                    onChange={e => handleItemChange(item.tempId, 'unit', e.target.value)}
                                                    className={`${inputClass} text-center !p-1.5`} 
                                                    disabled={isLocked || item.type !== 'print_service'}
                                                />
                                            </td>
                                            <td className="p-1">
                                                <FormattedNumberInput 
                                                    value={item.unitPrice} 
                                                    onChange={v => handleItemChange(item.tempId, 'unitPrice', v)} 
                                                    className={`${inputClass} text-right !p-1.5 font-semibold`} 
                                                    disabled={isLocked} 
                                                />
                                            </td>
                                            <td className="p-1 text-right font-bold text-gray-800 dark:text-gray-200">
                                                {(item.quantity * item.unitPrice).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="p-1 text-center">
                                                {!isLocked && (
                                                    <button type="button" onClick={() => handleRemoveItem(item.tempId)} className="text-red-500 p-1 hover:bg-red-50 rounded transition">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                        {!isLocked && (
                            <button type="button" onClick={handleAddItem} className="mt-2 flex items-center gap-1 text-blue-600 text-sm font-semibold hover:text-blue-800 transition">
                                <PlusCircleIcon className="w-4 h-4" /> Thêm hàng hóa / Dịch vụ
                            </button>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Ghi chú đơn hàng</label>
                        <textarea name="notes" value={formData.notes || ''} onChange={handleMainChange} rows={2} className={inputClass} disabled={isLocked} placeholder="Quy cách in, yêu cầu đóng gói..."></textarea>
                    </div>

                    <div className="pt-4 border-t dark:border-gray-600 text-right flex items-center justify-end gap-3">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">TỔNG CỘNG: </span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalAmount.toLocaleString('vi-VN')} <span className="text-sm">đ</span></span>
                    </div>

                </form>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Đóng</button>
                    {!isLocked && (
                        <button type="submit" form="po-form" className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transform transition hover:-translate-y-px active:scale-95 flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" /> Lưu đơn hàng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
