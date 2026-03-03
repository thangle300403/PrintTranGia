import React, { useState } from 'react';
import { CustomerGroup } from '../../types';

interface CustomerGroupModalProps {
  group: Partial<CustomerGroup> | null;
  onClose: () => void;
  onSave: (group: Omit<CustomerGroup, 'id'> | CustomerGroup) => void;
}

export const CustomerGroupModal: React.FC<CustomerGroupModalProps> = ({ group, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<CustomerGroup>>(
    group || { name: '', description: '' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Vui lòng nhập tên nhóm khách hàng.');
      return;
    }
    onSave(formData as CustomerGroup);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200">
        <h3 className="text-xl font-bold mb-6 text-gray-900">
          {group?.id ? 'Chỉnh sửa Nhóm' : 'Thêm Nhóm Khách hàng'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm</label>
              <input name="name" type="text" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300" required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
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