import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CustomerGroup } from '../../types';
import { CustomerGroupModal } from '../../components/customers/CustomerGroupModal';
import { PencilIcon, TrashIcon } from '../../components/icons/Icons';

const CustomerGroupPage: React.FC = () => {
  const { customerGroups, addCustomerGroup, updateCustomerGroup, deleteCustomerGroup } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);

  const handleOpenModal = (group: CustomerGroup | null = null) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingGroup(null);
    setIsModalOpen(false);
  };

  const handleSave = (groupData: Omit<CustomerGroup, 'id'> | CustomerGroup) => {
    if ('id' in groupData && groupData.id) {
      updateCustomerGroup(groupData as CustomerGroup);
    } else {
      addCustomerGroup(groupData as Omit<CustomerGroup, 'id'>);
    }
  };

  const handleDelete = (groupId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhóm khách hàng này không? Hành động này không thể hoàn tác.')) {
      deleteCustomerGroup(groupId);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nhóm khách hàng</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-px"
          >
            Thêm nhóm mới
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tên nhóm</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Mô tả</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {customerGroups.length > 0 ? customerGroups.map(group => (
                  <tr key={group.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{group.name}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300">{group.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      <button onClick={() => handleOpenModal(group)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Sửa">
                        <PencilIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => handleDelete(group.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Xóa">
                        <TrashIcon className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                            Chưa có nhóm khách hàng nào.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && <CustomerGroupModal group={editingGroup} onClose={handleCloseModal} onSave={handleSave} />}
    </>
  );
};

export default CustomerGroupPage;
