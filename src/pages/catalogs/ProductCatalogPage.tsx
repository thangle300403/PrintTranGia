
import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Product, PricingModel } from '../../types';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { PencilIcon, TrashIcon, ImageIcon } from '../../components/icons/Icons';
import Pagination from '../../components/Pagination';
import CustomSelect from '../../components/CustomSelect';

const ProductModal: React.FC<{
  product: Partial<Product> | null;
  onClose: () => void;
  onSave: (product: (Omit<Product, 'id' | 'sku'> & { sku?: string }) | Product) => void;
}> = ({ product, onClose, onSave }) => {
  const { units, unitCategories } = useData();
  const [formData, setFormData] = useState<Partial<Product>>(
    product || { name: '', price: 0, pricingModel: PricingModel.Fixed, imageUrl: '', unit: 'cái' }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFixedPrice = formData.pricingModel === PricingModel.Fixed;
  
  const productCategoryIds = useMemo(() => 
      unitCategories
          .filter(c => c.name === 'Sản phẩm' || c.name === 'Bán hàng (POS)')
          .map(c => c.id),
  [unitCategories]);

  const productUnits = useMemo(() => {
      if (productCategoryIds.length === 0) return units; // Fallback
      return units.filter(u => u.categories?.some(catId => productCategoryIds.includes(catId)));
  }, [units, productCategoryIds]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNumberChange = (name: 'price' | 'initialStock' | 'lowStockThreshold', value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setFormData(prev => ({
          ...prev,
          imageUrl: loadEvent.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isFixed = formData.pricingModel === PricingModel.Fixed;
    if (!formData.name?.trim() || (isFixed && (formData.price === undefined || formData.price <= 0))) {
      alert('Vui lòng điền tên sản phẩm và giá (nếu là giá cố định).');
      return;
    }
    const dataToSave = { 
      ...formData, 
      price: isFixed ? formData.price : undefined,
      initialStock: Number(formData.initialStock) || 0,
      lowStockThreshold: Number(formData.lowStockThreshold) || 0,
      unit: formData.unit || 'cái',
    };
    // Cast to the expected type for onSave. 
    // If id exists, it matches Product. If not, it matches the create type.
    onSave(dataToSave as Product); 
    onClose();
  };
  
  const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
          {product?.id ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
                <label className={labelClass}>Hình ảnh sản phẩm</label>
                <div className="mt-1 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border dark:border-gray-600 text-gray-400">
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon />
                        )}
                    </div>
                    <div className="space-y-2">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1.5 rounded-md hover:bg-blue-200"
                        >
                            Chọn ảnh
                        </button>
                        {formData.imageUrl && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="text-sm font-semibold text-red-600 ml-3"
                            >
                                Xóa ảnh
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div>
              <label className={labelClass}>Tên sản phẩm</label>
              <input name="name" type="text" value={formData.name || ''} onChange={handleChange} className={inputClass} required autoFocus />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Mô hình Định giá</label>
                <select name="pricingModel" value={formData.pricingModel} onChange={handleChange} className={inputClass} required>
                  <option value={PricingModel.Fixed}>Giá Cố Định</option>
                  <option value={PricingModel.ByQuote}>Theo Báo Giá</option>
                </select>
              </div>
              <div>
                  <label className={labelClass}>Đơn vị tính</label>
                  <select name="unit" value={formData.unit || 'cái'} onChange={handleChange} className={inputClass}>
                      {productUnits.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
              </div>
            </div>
            
            {isFixedPrice && (
                <div>
                  <label className={labelClass}>Đơn giá (VND)</label>
                  <FormattedNumberInput value={formData.price || ''} onChange={(val) => handleNumberChange('price', val)} className={inputClass} required />
                </div>
            )}

            <div>
              <label className={labelClass}>Mã SKU</label>
              <input name="sku" type="text" value={formData.sku || ''} onChange={handleChange} className={`${inputClass} bg-gray-100 dark:bg-gray-700/50`} placeholder="(Để trống sẽ tự tạo)" />
            </div>

            <div className={`pt-4 border-t dark:border-gray-600 ${!isFixedPrice ? 'opacity-40' : ''}`}>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Quản lý kho</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Tồn kho đầu kỳ</label>
                    <FormattedNumberInput value={formData.initialStock || ''} onChange={(val) => handleNumberChange('initialStock', val)} className={inputClass} disabled={!isFixedPrice} />
                </div>
                <div>
                    <label className={labelClass}>Ngưỡng tồn kho thấp</label>
                    <FormattedNumberInput value={formData.lowStockThreshold || ''} onChange={(val) => handleNumberChange('lowStockThreshold', val)} className={inputClass} disabled={!isFixedPrice} />
                </div>
                </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductCatalogPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, currentUser, rolePermissions } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [pricingModelFilter, setPricingModelFilter] = useState<PricingModel | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


  const userPermissions = useMemo(() => {
    if (!currentUser) return { canView: false, canCreate: false, canEdit: false, canDelete: false };
    const permissions = rolePermissions[currentUser.roleId] || [];
    return {
        canView: permissions.includes('view_products'),
        canCreate: permissions.includes('create_products'),
        canEdit: permissions.includes('edit_products'),
        canDelete: permissions.includes('delete_products'),
    };
  }, [currentUser, rolePermissions]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(lowerSearch) || (product.sku || '').toLowerCase().includes(lowerSearch);
        const matchesModel = !pricingModelFilter || product.pricingModel === pricingModelFilter;
        return matchesSearch && matchesModel;
    });
  }, [products, searchTerm, pricingModelFilter]);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };


  if (!userPermissions.canView) {
      return (
          <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Bạn không có quyền truy cập trang này.</p>
          </div>
      );
  }

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSave = (productData: (Omit<Product, 'id' | 'sku'> & { sku?: string }) | Product) => {
    if ('id' in productData && productData.id) {
      updateProduct(productData as Product);
    } else {
      addProduct(productData as Omit<Product, 'id' | 'sku'> & { sku?: string });
    }
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      deleteProduct(productId);
    }
  };
  
  const modelOptions = [
    { value: '', label: 'Tất cả mô hình' },
    { value: PricingModel.Fixed, label: PricingModel.Fixed },
    { value: PricingModel.ByQuote, label: PricingModel.ByQuote },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Danh mục Sản phẩm (POS)</h1>
          {userPermissions.canCreate && (
            <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm">
              Thêm sản phẩm mới
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-4">
                 <input
                    type="text"
                    placeholder="Tìm theo Tên hoặc SKU..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700"
                />
                <CustomSelect
                    options={modelOptions}
                    value={pricingModelFilter}
                    onChange={value => { setPricingModelFilter(value as PricingModel | ''); setCurrentPage(1); }}
                    className="w-full md:w-auto md:min-w-48"
                />
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hình ảnh</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tên sản phẩm</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">SKU</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Mô hình Định giá</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Đơn giá</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ĐVT</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden text-gray-400">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon />
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.pricingModel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {product.pricingModel === PricingModel.Fixed && product.price
                            ? `${(product.price).toLocaleString('vi-VN')} VND`
                            : <span className="text-xs italic text-gray-400">Theo Báo Giá</span>
                        }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.unit || 'cái'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      {userPermissions.canEdit && (
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full" title="Sửa">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                      )}
                      {userPermissions.canDelete && (
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full" title="Xóa">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            {filteredProducts.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            )}
        </div>
      </div>
      {isModalOpen && <ProductModal product={editingProduct} onClose={handleCloseModal} onSave={handleSave} />}
    </>
  );
};

export default ProductCatalogPage;
