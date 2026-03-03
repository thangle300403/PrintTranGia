
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { ProductionOrder } from '../../types';
import FormattedNumberInput from '../FormattedNumberInput';
import DatePicker from '../DatePicker';
import CustomSelect from '../CustomSelect';

interface ProductionOrderModalProps {
    isOpen: boolean;
    order: Partial<ProductionOrder> | null;
    prefillData: Partial<ProductionOrder> | null;
    onClose: () => void;
    onSave: (data: Partial<ProductionOrder>) => void;
}

export const ProductionOrderModal: React.FC<ProductionOrderModalProps> = ({ isOpen, order, prefillData, onClose, onSave }) => {
    const { users, currentUser, units, products } = useData();
    const isEditMode = !!order?.id;

    const [formData, setFormData] = useState<Partial<ProductionOrder>>({});
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && order) {
                setFormData(order);
            } else {
                // Merge defaults with prefillData. 
                // Ensure prefillData overrides defaults for fields like orderId.
                setFormData({
                    orderId: '',
                    productName: '',
                    quantity: 0,
                    notes: '',
                    salespersonId: currentUser?.id || '',
                    orderDate: new Date(),
                    design: 'File của khách',
                    unit: 'cái',
                    category: '',
                    ...prefillData, // This spreads prefillData correctly
                });
            }
        }
    }, [isOpen, order, prefillData, isEditMode, currentUser]);

    const filteredProducts = useMemo(() => {
        const term = (formData.productName || '').toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
    }, [products, formData.productName]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNumberChange = (name: keyof ProductionOrder, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSelect = (product: any) => {
        setFormData(prev => ({
            ...prev,
            productName: product.name,
            unit: product.unit || prev.unit
        }));
        setShowSuggestions(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productName || !formData.quantity) {
            alert('Vui lòng điền tên sản phẩm và số lượng.');
            return;
        }
        onSave(formData);
    };

    const inputClass = "w-full py-1.5 px-3 text-sm border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    
    const categoryOptions = [
        { value: 'Tờ rơi', label: 'Tờ rơi' },
        { value: 'Catalogue', label: 'Catalogue' },
        { value: 'Hộp giấy', label: 'Hộp giấy' },
        { value: 'Túi giấy', label: 'Túi giấy' },
        { value: 'Tem nhãn', label: 'Tem nhãn' },
        { value: 'Bao thư', label: 'Bao thư' },
        { value: 'Khác', label: 'Khác' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[70] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 p-0 rounded-xl shadow-xl w-full max-w-4xl border border-gray-200 dark:border-gray-700 my-8" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-t-xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isEditMode ? 'Chỉnh sửa Lệnh sản xuất' : 'Tạo Lệnh sản xuất'}
                        </h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">&times;</button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        
                        {/* SECTION 1: GENERAL INFO */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <label className={labelClass}>Mã đơn hàng</label>
                                <input 
                                    type="text" 
                                    name="orderId" 
                                    value={formData.orderId || ''} 
                                    onChange={handleChange} 
                                    className={`${inputClass} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 font-semibold`} 
                                    placeholder="DH..." 
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className={labelClass}>Nhân viên KD</label>
                                <select name="salespersonId" value={formData.salespersonId || ''} onChange={handleChange} className={inputClass}>
                                    <option value="">-- Chọn --</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className={labelClass}>Ngày đặt hàng</label>
                                <input type="text" value={formData.orderDate ? new Date(formData.orderDate).toLocaleDateString('vi-VN') : ''} readOnly className={`${inputClass} bg-gray-100 dark:bg-gray-900`} />
                            </div>
                            <div className="md:col-span-1">
                                <label className={labelClass}>Ngày giao hàng</label>
                                <DatePicker 
                                    value={formData.deliveryDate ? new Date(formData.deliveryDate).toISOString().split('T')[0] : ''} 
                                    onChange={(val) => setFormData(prev => ({...prev, deliveryDate: val ? new Date(val) : undefined}))} 
                                    className={inputClass} 
                                />
                            </div>
                        </div>

                        {/* SECTION 2: PRODUCT DETAILS */}
                        <div className="bg-blue-50 dark:bg-gray-700/30 p-4 rounded-lg border border-blue-100 dark:border-gray-600">
                            <div className="flex justify-between mb-3">
                                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase">Thông tin Sản phẩm</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                 <div className="md:col-span-3">
                                    <label className={labelClass}>Loại</label>
                                    <CustomSelect 
                                        options={categoryOptions}
                                        value={formData.category || ''}
                                        onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                    />
                                </div>
                                <div className="md:col-span-5 relative">
                                    <label className={labelClass}>Tên sản phẩm <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="productName" 
                                        value={formData.productName || ''} 
                                        onChange={(e) => {
                                            handleChange(e);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        className={inputClass} 
                                        required 
                                        placeholder="Nhập tên sản phẩm..." 
                                        autoComplete="off"
                                    />
                                    {showSuggestions && filteredProducts.length > 0 && (
                                        <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                                            {filteredProducts.map(product => (
                                                <div 
                                                    key={product.id}
                                                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 text-sm border-b last:border-0 border-gray-100 dark:border-gray-600"
                                                    onClick={() => handleProductSelect(product)}
                                                >
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{product.sku}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Số lượng <span className="text-red-500">*</span></label>
                                    <FormattedNumberInput name="quantity" value={formData.quantity || ''} onChange={(val) => handleNumberChange('quantity', val)} className={inputClass} required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>ĐVT</label>
                                    <select name="unit" value={formData.unit || ''} onChange={handleChange} className={inputClass}>
                                        {units.map(u => (
                                            <option key={u.id} value={u.name}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="md:col-span-4">
                                    <label className={labelClass}>Kích thước</label>
                                    <input type="text" name="size" value={formData.size || ''} onChange={handleChange} className={inputClass} placeholder="VD: A4, 20x30cm..." />
                                </div>
                                <div className="md:col-span-6">
                                    <label className={labelClass}>Chất liệu</label>
                                    <input type="text" name="material" value={formData.material || ''} onChange={handleChange} className={inputClass} placeholder="VD: C150, Ford 100..." />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Số trang/mặt</label>
                                    <FormattedNumberInput name="pages" value={formData.pages || ''} onChange={(val) => handleNumberChange('pages', val)} className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: TECHNICAL & FINISHING */}
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase">Quy cách & Gia công</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Phương thức in</label>
                                    <input type="text" name="printMethod" value={formData.printMethod || ''} onChange={handleChange} className={inputClass} placeholder="VD: Offset, KTS..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Màu in</label>
                                    <input type="text" name="printColor" value={formData.printColor || ''} onChange={handleChange} className={inputClass} placeholder="VD: 4 màu, 1 màu đen..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Thiết kế</label>
                                    <input type="text" name="design" value={formData.design || ''} onChange={handleChange} className={inputClass} placeholder="VD: File khách, Thiết kế mới..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Gia công sau in</label>
                                    <input type="text" name="finishing" value={formData.finishing || ''} onChange={handleChange} className={inputClass} placeholder="VD: Cán màng, cấn, bế, đóng cuốn..." />
                                </div>
                            </div>
                        </div>

                        {/* NOTES */}
                        <div>
                            <label className={labelClass}>Ghi chú sản xuất</label>
                            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className={inputClass} placeholder="Ghi chú thêm cho bộ phận sản xuất..."></textarea>
                        </div>

                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end space-x-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">
                            {isEditMode ? 'Lưu thay đổi' : 'Lưu Lệnh sản xuất'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
