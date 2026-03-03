import React, { useState, useEffect, useMemo } from 'react';
import { BillOfMaterial, BOMItem } from '../../types';
import { useData } from '../../context/DataContext';
import FormattedNumberInput from '../FormattedNumberInput';
import { TrashIcon, PlusCircleIcon, SearchIcon } from '../icons/Icons';
import CustomSelect from '../CustomSelect';

interface BOMModalProps {
    bom: Partial<BillOfMaterial> | null;
    onClose: () => void;
    onSave: (bom: Omit<BillOfMaterial, 'id' | 'createdAt' | 'updatedAt'> | BillOfMaterial) => void;
}

export const BOMModal: React.FC<BOMModalProps> = ({ bom, onClose, onSave }) => {
    const { products, materialVariants, rawMaterials, materialGroups, units } = useData();
    
    const [productId, setProductId] = useState(bom?.productId || '');
    const [items, setItems] = useState<BOMItem[]>(bom?.items || []);
    const [notes, setNotes] = useState(bom?.notes || '');
    
    // Search state for products
    const [productSearch, setProductSearch] = useState('');
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

    const productOptions = useMemo(() => {
        if (!productSearch.trim()) return products.slice(0, 10);
        const lower = productSearch.toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(lower) || p.sku.toLowerCase().includes(lower));
    }, [products, productSearch]);
    
    const selectedProduct = products.find(p => p.id === productId);

    const handleAddItem = () => {
        setItems([...items, {
            id: `item_${Date.now()}`,
            itemId: '',
            type: 'material',
            quantity: 0,
            unit: ''
        }]);
    };

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleItemChange = (id: string, field: keyof BOMItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                // Reset dependent fields if type changes
                if (field === 'type') {
                    updated.itemId = '';
                    updated.unit = '';
                }
                // Auto-set unit if item changes
                if (field === 'itemId') {
                    if (updated.type === 'material') {
                        const mat = materialVariants.find(m => m.id === value);
                        if (mat) updated.unit = mat.costingUnit;
                    } else {
                        const raw = rawMaterials.find(r => r.id === value);
                        if (raw) updated.unit = raw.unit;
                    }
                }
                return updated;
            }
            return item;
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId) {
            alert('Vui lòng chọn sản phẩm.');
            return;
        }
        if (items.length === 0) {
            alert('Vui lòng thêm ít nhất một thành phần.');
            return;
        }
        
        // Validate items
        for (const item of items) {
            if (!item.itemId || item.quantity <= 0) {
                alert('Vui lòng kiểm tra lại danh sách thành phần (chưa chọn vật tư hoặc số lượng <= 0).');
                return;
            }
        }

        const data = {
            id: bom?.id, // Pass ID if editing
            productId,
            items,
            notes
        };
        
        // TS workaround for save logic
        if (bom?.id) {
             onSave(data as BillOfMaterial);
        } else {
             onSave(data as Omit<BillOfMaterial, 'id' | 'createdAt' | 'updatedAt'>);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-0 rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-t-xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{bom?.id ? 'Chỉnh sửa Định mức (BOM)' : 'Thêm Định mức mới'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">
                        
                        {/* Product Selection */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Sản phẩm thành phẩm</label>
                            <div className="relative">
                                {selectedProduct ? (
                                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{selectedProduct.name}</p>
                                            <p className="text-xs text-gray-500">{selectedProduct.sku}</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setProductId('')}
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Thay đổi
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                                            <input 
                                                type="text"
                                                placeholder="Tìm kiếm sản phẩm..."
                                                value={productSearch}
                                                onChange={e => { setProductSearch(e.target.value); setIsProductDropdownOpen(true); }}
                                                onFocus={() => setIsProductDropdownOpen(true)}
                                                className="w-full pl-10 p-2 border rounded-lg"
                                            />
                                        </div>
                                        {isProductDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 shadow-lg rounded-lg max-h-60 overflow-y-auto z-10">
                                                {productOptions.map(p => (
                                                    <div 
                                                        key={p.id} 
                                                        onClick={() => { setProductId(p.id); setIsProductDropdownOpen(false); setProductSearch(''); }}
                                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b dark:border-gray-600 last:border-0"
                                                    >
                                                        <p className="font-medium text-gray-800 dark:text-gray-200">{p.name}</p>
                                                        <p className="text-xs text-gray-500">{p.sku}</p>
                                                    </div>
                                                ))}
                                                {productOptions.length === 0 && <div className="p-3 text-gray-500 text-center text-sm">Không tìm thấy sản phẩm.</div>}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Items List */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-gray-700 dark:text-gray-300">Thành phần định mức (Cho 1 đơn vị SP)</h4>
                                <button type="button" onClick={handleAddItem} className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                                    <PlusCircleIcon className="w-4 h-4"/> Thêm dòng
                                </button>
                            </div>
                            
                            <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                                        <tr>
                                            <th className="p-3 text-left w-32">Loại</th>
                                            <th className="p-3 text-left">Tên vật tư / Nguyên liệu</th>
                                            <th className="p-3 text-right w-24">Định mức</th>
                                            <th className="p-3 text-center w-20">ĐVT</th>
                                            <th className="p-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700 bg-white dark:bg-gray-800">
                                        {items.map((item, idx) => (
                                            <tr key={item.id}>
                                                <td className="p-2">
                                                    <select 
                                                        value={item.type} 
                                                        onChange={e => handleItemChange(item.id, 'type', e.target.value)}
                                                        className="w-full p-1.5 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                                                    >
                                                        <option value="material">Giấy (Kho)</option>
                                                        <option value="raw_material">Vật tư khác</option>
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <select 
                                                        value={item.itemId} 
                                                        onChange={e => handleItemChange(item.id, 'itemId', e.target.value)}
                                                        className="w-full p-1.5 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
                                                    >
                                                        <option value="">-- Chọn --</option>
                                                        {item.type === 'material' ? (
                                                            materialVariants.map(m => {
                                                                const g = materialGroups.find(grp => grp.id === m.groupId);
                                                                return <option key={m.id} value={m.id}>{m.name}</option>;
                                                            })
                                                        ) : (
                                                            rawMaterials.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                                                        )}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <FormattedNumberInput 
                                                        value={item.quantity} 
                                                        onChange={v => handleItemChange(item.id, 'quantity', v)}
                                                        className="w-full p-1.5 border rounded text-right"
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="p-2 text-center text-gray-500 bg-gray-50 dark:bg-gray-900/50">
                                                    {item.unit || '-'}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {items.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-400 italic">Chưa có thành phần nào. Nhấn "Thêm dòng" để bắt đầu.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Ghi chú</label>
                            <textarea 
                                value={notes} 
                                onChange={e => setNotes(e.target.value)} 
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                rows={2}
                                placeholder="Ghi chú thêm về quy trình..."
                            ></textarea>
                        </div>

                    </div>
                    
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 text-gray-700 dark:text-gray-200">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm">Lưu Định mức</button>
                    </div>
                </form>
            </div>
        </div>
    );
};