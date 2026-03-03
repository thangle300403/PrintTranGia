import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import type { Customer, CustomerGroup } from '../../types';
import { CustomerModal } from '../../components/customers/CustomerModal';
import { CustomerGroupModal } from '../../components/customers/CustomerGroupModal';
import { PencilIcon, TrashIcon } from '../../components/icons/Icons';
import Pagination from '../../components/Pagination';
import CustomSelect from '../../components/CustomSelect';

const CustomerListTab: React.FC = () => {
  const { customers, customerGroups, addCustomer, updateCustomer, deleteCustomer, users } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm.trim() ||
            customer.name.toLowerCase().includes(lowercasedTerm) ||
            customer.phone.toLowerCase().includes(lowercasedTerm) ||
            customer.id.toLowerCase().includes(lowercasedTerm);

        const matchesGroup = !groupFilter || customer.customerGroupId === groupFilter;
        return matchesSearch && matchesGroup;
    });
  }, [customers, searchTerm, groupFilter]);
  
  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleOpenModal = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(false);
  };

  const handleSave = (customerData: Omit<Customer, 'id'> | Customer, saveAndNew: boolean) => {
    if ('id' in customerData && customers.some(c => c.id === customerData.id)) {
      updateCustomer(customerData as Customer);
    } else {
      addCustomer(customerData as Omit<Customer, 'id'>);
    }

    if (!saveAndNew) {
      handleCloseModal();
    }
  };

  const handleDelete = (customerId: string) => {
      if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này không?')) {
          deleteCustomer(customerId);
      }
  };
  
  const groupOptions = [
      { value: '', label: 'Tất cả nhóm' },
      ...customerGroups.map(g => ({ value: g.id, label: g.name }))
  ];

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <input
                    id="customer-search"
                    type="text"
                    placeholder="Tìm theo tên, SĐT, mã KH..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                />
                <CustomSelect
                    options={groupOptions}
                    value={groupFilter}
                    onChange={value => { setGroupFilter(value); setCurrentPage(1); }}
                    className="w-full md:w-auto md:min-w-48"
                />
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                Thêm khách hàng
              </button>
          </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Mã KH</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tên khách hàng</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Nhóm KH</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Số điện thoại</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">NV Phụ Trách</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedCustomers.length > 0 ? paginatedCustomers.map(customer => {
                const group = customerGroups.find(g => g.id === customer.customerGroupId);
                const salesperson = users.find(u => u.id === customer.assignedToUserId);
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{customer.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{group?.name || 'Chưa phân loại'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{salesperson?.name || 'Chưa gán'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2 flex justify-center items-center">
                        <button onClick={() => handleOpenModal(customer)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Sửa">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Xóa">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Không tìm thấy khách hàng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length > 0 && (
          <Pagination
              currentPage={currentPage}
              totalItems={filteredCustomers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
      {isModalOpen && <CustomerModal customer={editingCustomer} onClose={handleCloseModal} onSave={handleSave} />}
    </>
  );
};

const CustomerGroupTab: React.FC = () => {
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
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-px"
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
      {isModalOpen && <CustomerGroupModal group={editingGroup} onClose={handleCloseModal} onSave={handleSave} />}
    </>
  );
};

const CustomerListPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'customers' | 'groups'>('customers');

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Khách hàng</h1>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'customers' 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        Danh sách Khách hàng
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'groups' 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        Nhóm khách hàng
                    </button>
                </nav>
            </div>
            
            <div className="pt-4">
                {activeTab === 'customers' ? <CustomerListTab /> : <CustomerGroupTab />}
            </div>
        </div>
    );
};

export default CustomerListPage;