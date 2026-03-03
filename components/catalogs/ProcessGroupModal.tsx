

import React, { useState, useEffect } from 'react';
import { ProcessGroup } from '../../types';

interface ProcessGroupModalProps {
  group: Partial<ProcessGroup> | null;
  onClose: () => void;
  onSave: (group: Omit<ProcessGroup, 'id'> | ProcessGroup) => void;
}

export const ProcessGroupModal: React.FC<ProcessGroupModalProps> = ({ group, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<ProcessGroup>>(group || { name: '', description: '' });

  useEffect(() => {
      setFormData(group || { name: '', description: '' });
  }, [group]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Vui lòng nhập tên nhóm.');
      return;
    }
    onSave(formData as ProcessGroup);
    onClose();
  };
  
  const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{group?.id ? 'Chỉnh sửa' : 'Thêm'} Nhóm Gia công</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Tên nhóm</label>
            <input name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} required autoFocus />
          </div>
          <div>
             <label className={labelClass}>Mô tả</label>
             <textarea name="description" value={formData.description || ''} onChange={handleChange} className={inputClass} rows={3} />
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">Hủy</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};
