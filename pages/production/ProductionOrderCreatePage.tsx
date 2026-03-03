
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ProductionOrder } from '../../types';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import DatePicker from '../../components/DatePicker';
import CustomSelect from '../../components/CustomSelect';

const ProductionOrderCreatePage: React.FC = () => {
    const { users, addProductionOrder, currentUser, getProductionOrderById, updateProductionOrder, products } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const [formData, setFormData] = useState<Partial<ProductionOrder>>({});
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (isEditMode && id) {
            const existingOrder = getProductionOrderById(id);
            if (existingOrder) {
                setFormData({
                    ...existingOrder,
                    // Ensure dates are Date objects if they exist
                    orderDate: existingOrder.orderDate ? new Date(existingOrder.orderDate) : new Date(),
                    deliveryDate: existingOrder.deliveryDate ? new Date(existingOrder.deliveryDate) : undefined,
                });
            } else {
                alert('Không tìm thấy lệnh sản xuất!');
                navigate('/production-orders');
            }
        } else {
            const prefillData = location.state as Partial<ProductionOrder>;
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
                ...prefillData, // Spread prefillData last to overwrite defaults
                // Ensure dates from prefill (if strings) are converted
                deliveryDate: prefillData?.deliveryDate ? new Date(prefillData.deliveryDate) : undefined,
            });
        }
    }, [id, isEditMode, getProductionOrderById, location.state, navigate, currentUser]);


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

    const filteredProducts = useMemo(() => {
        const term = (formData.productName || '').toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
    }, [products, formData.productName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.productName || !formData.quantity) {
            alert('Vui lòng điền tên sản phẩm và số lượng.');
            return;
        }
        
        if (isEditMode) {
            updateProductionOrder(formData as ProductionOrder);
            alert('Cập nhật Lệnh sản xuất thành công!');
        } else {
            const { id, status, orderDate, ...submissionData } = formData;
            addProductionOrder({
                ...submissionData,
                orderDate: formData.orderDate || new Date(),
            } as Omit<ProductionOrder, 'id' | 'status'>); // status is handled in addProductionOrder
            alert('Tạo Lệnh sản xuất thành công!');
        }
        navigate('/production-orders');
    };

    const inputClass = "w-full p-2 border rounded-lg bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'Chỉnh sửa Lệnh sản xuất (LSX)' : 'Tạo Lệnh sản xuất (LSX)'}
            </h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Column 1 */}
                    <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Mã đơn hàng (PO)</label>
                                <input 
                                    type="text" 
                                    name="orderId" 
                                    value={formData.orderId || ''} 
                                    onChange={handleChange} 
                                    className={`${inputClass} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 font-semibold`} 
                                    placeholder="DH..." 
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Loại sản phẩm</label>
                                <CustomSelect 
                                    options={categoryOptions}
                                    value={formData.category || ''}
                                    onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                />
                            </div>
                        </div>
                        
                        <div className="relative">
                            <label className={labelClass}>Sản phẩm <span className="text-red-500">*</span></label>
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
                                autoComplete="off"
                                placeholder="Nhập tên hoặc chọn từ danh mục..."
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

                        <div>
                            <label className={labelClass}>Kích thước</label>
                            <input type="text" name="size" value={formData.size || ''} onChange={handleChange} className={inputClass} placeholder="VD: 21x29.7 cm"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Số lượng <span className="text-red-500">*</span></label>
                                <FormattedNumberInput name="quantity" value={formData.quantity || ''} onChange={(val) => handleNumberChange('quantity', val)} className={inputClass} required />
                            </div>
                             <div>
                                <label className={labelClass}>Đơn vị tính</label>
                                <input type="text" name="unit" value={formData.unit || ''} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Chất liệu</label>
                            <input type="text" name="material" value={formData.material || ''} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Màu in</label>
                            <input type="text" name="printColor" value={formData.printColor || ''} onChange={handleChange} className={inputClass} placeholder="VD: 4/4, 4/0..." />
                        </div>
                        <div>
                            <label className={labelClass}>Thiết kế</label>
                            <input type="text" name="design" value={formData.design || ''} onChange={handleChange} className={inputClass} placeholder="VD: Mới, cũ, file của khách..." />
                        </div>
                         <div>
                            <label className={labelClass}>Ghi chú</label>
                            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className={inputClass}></textarea>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Nhân viên KD</label>
                            <select name="salespersonId" value={formData.salespersonId || ''} onChange={handleChange} className={inputClass}>
                                <option value="">-- Chọn nhân viên --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className={labelClass}>Ngày đặt hàng</label>
                                <input type="text" value={formData.orderDate ? new Date(formData.orderDate).toLocaleDateString('vi-VN') : ''} readOnly className={`${inputClass} bg-gray-100 dark:bg-gray-900`} />
                            </div>
                            <div>
                                <label className={labelClass}>Ngày giao hàng</label>
                                <DatePicker 
                                    value={formData.deliveryDate ? new Date(formData.deliveryDate).toISOString().split('T')[0] : ''} 
                                    onChange={(val) => setFormData(prev => ({...prev, deliveryDate: val ? new Date(val) : undefined}))}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                         <div>
                            <label className={labelClass}>Số trang/mặt in</label>
                            <FormattedNumberInput name="pages" value={formData.pages || ''} onChange={(val) => handleNumberChange('pages', val)} className={inputClass} placeholder="VD: 24" />
                        </div>
                        <div>
                            <label className={labelClass}>Phương thức in</label>
                            <input type="text" name="printMethod" value={formData.printMethod || ''} onChange={handleChange} className={inputClass} placeholder="VD: Offset, KTS..." />
                        </div>
                         <div>
                            <label className={labelClass}>Gia công</label>
                            <input type="text" name="finishing" value={formData.finishing || ''} onChange={handleChange} className={inputClass} placeholder="VD: Cán màng, ép kim..." />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t dark:border-gray-600 flex justify-end space-x-3">
                    <button type="button" onClick={() => navigate('/production-orders')} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
                    <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">
                        {isEditMode ? 'Lưu thay đổi' : 'Lưu Lệnh sản xuất'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ProductionOrderCreatePage;
