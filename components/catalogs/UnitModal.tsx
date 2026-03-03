

import React, { useState } from 'react';
import { Unit, UnitCategory } from '../../types';
import { useData } from '../../context/DataContext';

interface UnitModalProps {
  unit: Partial<Unit> | null;
  onClose: () => void;
  onSave: (unit: Omit<Unit, 'id'> | Unit) => void;
}

export const UnitModal: React.FC<UnitModalProps> = ({ unit, onClose, onSave }) => {
  const { unitCategories } = useData();
  const [formData, setFormData] = useState<Partial<Unit>>(
    unit || { name: '', description: '', categories: [] }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId: string) => {
    const currentCategories = formData.categories || [];
    const newCategories = currentCategories.includes(categoryId)
        ? currentCategories.filter(c => c !== categoryId)
        : [...currentCategories, categoryId];
    setFormData(prev => ({ ...prev, categories: newCategories }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Vui lòng nhập tên đơn vị tính.');
      return;
    }
    onSave(formData as Unit);
    onClose();
  };
  
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200">
        <h3 className="text-xl font-bold mb-6 text-gray-900">
          {unit?.id ? 'Chỉnh sửa Đơn vị tính' : 'Thêm Đơn vị tính mới'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Tên đơn vị</label>
              <input name="name" type="text" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300" required autoFocus />
            </div>
             <div>
                <label className={labelClass}>Phân loại</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    {unitCategories.map(category => (
                        <label key={category.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={(formData.categories || []).includes(category.id)}
                                onChange={() => handleCategoryChange(category.id)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm">{category.name}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div>
              <label className={labelClass}>Mô tả</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300" />
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition">Hủy</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};