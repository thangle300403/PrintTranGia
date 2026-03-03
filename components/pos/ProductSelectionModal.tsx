


import React, { useState, useMemo } from 'react';
import type { Product } from '../../types';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (items: { productId: string; quantity: number }[]) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({ isOpen, onClose, products, onAddToCart }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lowerSearch = searchTerm.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(lowerSearch) || p.sku.toLowerCase().includes(lowerSearch));
  }, [products, searchTerm]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: quantity >= 0 ? quantity : 0,
    }));
  };

  const handleConfirm = () => {
    const itemsToAdd = Object.entries(quantities)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([productId, quantity]) => ({ productId, quantity: Number(quantity) }));

    if (itemsToAdd.length > 0) {
      onAddToCart(itemsToAdd);
    }
    setQuantities({});
    setSearchTerm('');
    onClose();
  };
  
  const handleClose = () => {
    setQuantities({});
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chọn hàng hóa</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">&times;</button>
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2 mt-4 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="border dark:border-gray-700 rounded-lg p-3 flex flex-col">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 flex-grow">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{product.sku}</p>
                {/* FIX: Use nullish coalescing to prevent error when product.price is undefined for 'ByQuote' products. */}
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 my-2">{(product.price ?? 0).toLocaleString('vi-VN')} VND</p>
                <input
                  type="number"
                  placeholder="SL"
                  value={quantities[product.id] || ''}
                  onChange={e => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                  className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-center"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t dark:border-gray-700 flex justify-end flex-shrink-0">
          <button onClick={handleConfirm} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            Thêm vào đơn
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;
