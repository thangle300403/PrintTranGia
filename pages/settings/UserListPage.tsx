
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { User, EmploymentStatus } from '../../types';
import { UserModal } from '../../components/settings/UserModal';
import { PencilIcon, SearchIcon } from '../../components/icons/Icons';
import Pagination from '../../components/Pagination';
import CustomSelect from '../../components/CustomSelect';

const UserListPage: React.FC = () => {
  const { users, addUser, updateUser, roles, currentUser, rolePermissions } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const canEditUsers = useMemo(() => {
    if (!currentUser) return false;
    return rolePermissions[currentUser.roleId]?.includes('manage_users');
  }, [currentUser, rolePermissions]);

  const canCreateUsers = useMemo(() => {
    if (!currentUser) return false;
    return rolePermissions[currentUser.roleId]?.includes('manage_users');
  }, [currentUser, rolePermissions]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const lowercasedTerm = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm.trim() ||
        user.name.toLowerCase().includes(lowercasedTerm) ||
        user.email.toLowerCase().includes(lowercasedTerm) ||
        user.id.toLowerCase().includes(lowercasedTerm);
      
      const matchesRole = !roleFilter || user.roleId === roleFilter;
      const matchesStatus = !statusFilter || user.employmentStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleSave = (userData: Omit<User, 'id' | 'joiningDate'> | User) => {
    if ('id' in userData && users.some(u => u.id === userData.id)) {
      updateUser(userData as User);
    } else {
      addUser(userData as Omit<User, 'id' | 'joiningDate'>);
    }
    handleCloseModal();
  };
  
  const roleOptions = [
      { value: '', label: 'Tất cả vai trò' },
      ...roles.map(r => ({ value: r.id, label: r.name }))
  ];
  
  const statusOptions = [
      { value: '', label: 'Tất cả trạng thái' },
      ...Object.values(EmploymentStatus).map(s => ({ value: s as string, label: s as string }))
  ];

  const getRoleName = (roleId: string) => {
      return roles.find(r => r.id === roleId)?.name || roleId;
  };

  return (
    <>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danh sách Nhân viên</h1>
          {canCreateUsers && (
            <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none"
            >
                + Thêm nhân viên
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative w-full md:w-80">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon className="w-4 h-4"/>
                    </span>
                    <input
                        id="user-search"
                        type="text"
                        placeholder="Tìm theo tên, email, mã NV..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <CustomSelect
                    options={roleOptions}
                    value={roleFilter}
                    onChange={value => { setRoleFilter(value as string); setCurrentPage(1); }}
                    className="w-full md:w-auto md:min-w-48"
                />
                 <CustomSelect
                    options={statusOptions}
                    value={statusFilter}
                    onChange={value => { setStatusFilter(value as string); setCurrentPage(1); }}
                    className="w-full md:w-auto md:min-w-48"
                />
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Mã nhân viên</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tên nhân viên</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-center">Giới tính</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-center">Ngày sinh</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Số điện thoại</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Trạng thái</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                        {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                                {user.avatarUrl ? (
                                    <img className="h-8 w-8 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">{getRoleName(user.roleId)}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                        {user.gender || '---'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                        {user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : '---'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-0.5 inline-flex justify-center text-[10px] leading-5 font-bold rounded uppercase ${
                          user.employmentStatus === EmploymentStatus.Official ? 'bg-green-100 text-green-800' :
                          user.employmentStatus === EmploymentStatus.Probation ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                        {user.employmentStatus || 'Chính thức'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canEditUsers && (
                            <button
                                onClick={() => handleOpenModal(user)}
                                className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                title="Sửa"
                            >
                                <PencilIcon className="w-4 h-4" />
                            </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
           {filteredUsers.length > 0 && (
            <Pagination
                currentPage={currentPage}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      </div>
      {isModalOpen && <UserModal user={editingUser} onClose={handleCloseModal} onSave={handleSave} />}
    </>
  );
};

export default UserListPage;
