import React, { useState } from 'react';
import { UnitCategory } from '../../types';

interface UnitCategoryModalProps {
  category: Partial<UnitCategory> | null;
  onClose: () => void;
  onSave: (category: Omit<UnitCategory, 'id'> | UnitCategory) => void;
}

export const UnitCategoryModal: React.FC<UnitCategoryModalProps> = ({ category, onClose, onSave }) => {
  const [name, setName] = useState(category?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ ...category, name });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">{category?.id ? 'Chỉnh sửa' : 'Thêm'} Phân loại</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên phân loại</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full p-2 border rounded mt-1" 
              autoFocus 
              required 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};
