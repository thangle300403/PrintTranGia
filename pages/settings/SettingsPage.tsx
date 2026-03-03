
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { User, CommissionPolicy, CommissionTier, OrderStatus, ProfitRule } from '../../types';
import { UserModal } from '../../components/settings/UserModal';
import { PencilIcon, TrashIcon, PlusCircleIcon, CreditCardIcon, UserCheckIcon, TrophyIcon } from '../../components/icons/Icons';
import Pagination from '../../components/Pagination';
import CustomSelect from '../../components/CustomSelect';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';
import DatePicker from '../../components/DatePicker';

// --- USER MANAGEMENT TAB ---
const UserListContent: React.FC = () => {
  const { users, addUser, updateUser, roles } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Disabled' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const lowercasedTerm = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm.trim() ||
        user.name.toLowerCase().includes(lowercasedTerm) ||
        user.email.toLowerCase().includes(lowercasedTerm) ||
        user.id.toLowerCase().includes(lowercasedTerm);
      
      const matchesRole = !roleFilter || user.roleId === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;

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

  const getStatusClass = (status: 'Active' | 'Disabled') => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300';
  };
  
  const roleOptions = [
      { value: '', label: 'Tất cả vai trò' },
      ...roles.map(r => ({ value: r.id, label: r.name }))
  ];
  
  const statusOptions = [
      { value: '', label: 'Tất cả trạng thái' },
      { value: 'Active', label: 'Hoạt động' },
      { value: 'Disabled', label: 'Vô hiệu hóa' },
  ];

  const getRoleName = (roleId: string) => {
      return roles.find(r => r.id === roleId)?.name || 'Unknown Role';
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
              <input
                  type="text"
                  placeholder="Tìm theo tên, email, mã NV..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
              <CustomSelect
                  options={roleOptions}
                  value={roleFilter}
                  onChange={value => { setRoleFilter(value); setCurrentPage(1); }}
                  className="w-full md:w-auto md:min-w-48"
              />
               <CustomSelect
                  options={statusOptions}
                  value={statusFilter}
                  onChange={value => { setStatusFilter(value as 'Active' | 'Disabled' | ''); setCurrentPage(1); }}
                  className="w-full md:w-auto md:min-w-48"
              />
              <button
                onClick={() => handleOpenModal()}
                className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm text-sm"
              >
                + Thêm nhân viên
              </button>
          </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nhân viên</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">SĐT</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Vai trò</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                              {user.avatarUrl ? (
                                  <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                              ) : (
                                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                                      {user.name.charAt(0).toUpperCase()}
                                  </div>
                              )}
                          </div>
                          <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">{user.id}</div>
                          </div>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getRoleName(user.roleId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 inline-flex justify-center text-xs leading-5 font-semibold rounded-full min-w-[100px] ${getStatusClass(user.status)}`}>
                      {user.status === 'Active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          title="Sửa"
                      >
                          <PencilIcon className="w-4 h-4" />
                      </button>
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
      {isModalOpen && <UserModal user={editingUser} onClose={handleCloseModal} onSave={handleSave} />}
    </>
  );
};

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-start gap-4">
        <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-3 rounded-lg flex-shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
    </div>
);

const AssignUserModal: React.FC<{
    policy: CommissionPolicy;
    onClose: () => void;
    onSave: (policyId: string, userIds: string[]) => void;
}> = ({ policy, onClose, onSave }) => {
    const { users, roles } = useData();
    const salesRoleIds = roles.filter(r => r.name.toLowerCase().includes('kinh doanh')).map(r => r.id);
    const salesStaff = users.filter(u => salesRoleIds.includes(u.roleId) || u.commissionPolicyId === policy.id);
    
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(() => 
        salesStaff.filter(u => u.commissionPolicyId === policy.id).map(u => u.id)
    );

    const handleToggleUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = () => {
        onSave(policy.id, selectedUserIds);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
                <div className="px-6 py-4 border-b dark:border-gray-700">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Gán nhân viên cho chính sách "{policy.name}"</h3>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-3">
                        {salesStaff.map(user => {
                            const isAssignedToOtherPolicy = user.commissionPolicyId && user.commissionPolicyId !== policy.id;
                            return (
                                <label key={user.id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${isAssignedToOtherPolicy ? 'bg-gray-100 dark:bg-gray-700/50 opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                    <input 
                                        type="checkbox"
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={() => handleToggleUser(user.id)}
                                        disabled={!!isAssignedToOtherPolicy}
                                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
                                    {isAssignedToOtherPolicy && <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">(Đã gán CS khác)</span>}
                                </label>
                            )
                        })}
                         {salesStaff.length === 0 && (
                            <p className="text-center text-gray-500 text-sm">Không tìm thấy nhân viên kinh doanh nào.</p>
                        )}
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold text-sm">Hủy</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm">Lưu thay đổi</button>
                </div>
            </div>
        </div>
    );
};

const PolicyModal: React.FC<{
  policy: Partial<CommissionPolicy> | null;
  onClose: () => void;
  onSave: (policy: Omit<CommissionPolicy, 'id'> | CommissionPolicy) => void;
}> = ({ policy, onClose, onSave }) => {
  const [name, setName] = useState(policy?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (policy?.id) {
      onSave({ ...policy, name } as CommissionPolicy);
    } else {
      const newPolicy: Omit<CommissionPolicy, 'id'> = { name, tiers: [] };
      onSave(newPolicy);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">{policy?.id ? 'Sửa Chính sách' : 'Thêm Chính sách mới'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên chính sách</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded mt-1" autoFocus required />
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

const TierModal: React.FC<{
  tier: Partial<CommissionTier> | null;
  onClose: () => void;
  onSave: (tier: Partial<CommissionTier>) => void;
}> = ({ tier, onClose, onSave }) => {
  const [revenueThreshold, setRevenueThreshold] = useState<number | ''>('');
  const [commissionRate, setCommissionRate] = useState<number | ''>('');

  useEffect(() => {
    setRevenueThreshold(tier?.revenueThreshold ?? '');
    setCommissionRate(tier?.commissionRate ?? '');
  }, [tier]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (revenueThreshold === '' || commissionRate === '') return;
    onSave({ 
        id: tier?.id,
        revenueThreshold: Number(revenueThreshold), 
        commissionRate: Number(commissionRate) 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">{tier?.id ? 'Sửa Bậc hoa hồng' : 'Thêm Bậc hoa hồng'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Doanh thu từ (VND)</label>
            <FormattedNumberInput value={revenueThreshold} onChange={setRevenueThreshold} className="w-full p-2 border rounded mt-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tỷ lệ Hoa hồng (%)</label>
            <FormattedNumberInput value={commissionRate} onChange={setCommissionRate} className="w-full p-2 border rounded mt-1" required />
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

const CommissionPolicyContent: React.FC = () => {
    const { commissionPolicies, users, orders, updateUser, addCommissionPolicy, updateCommissionPolicy, deleteCommissionPolicy } = useData();
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Partial<CommissionPolicy> | null>(null);
    const [isTierModalOpen, setIsTierModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<{ policyId: string, tier: Partial<CommissionTier> | null }>({ policyId: '', tier: null });
    const [toast, setToast] = useState('');
    const [confirm, setConfirm] = useState<{ type: 'policy' | 'tier', id: string, policyId?: string } | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState<CommissionPolicy | null>(null);

    const kpiData = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const eligibleOrders = orders.filter(o => (o.status === OrderStatus.Paid || o.status === OrderStatus.Delivered) && new Date(o.orderDate) >= startOfMonth);

        const revenueByUser: Record<string, number> = {};
        eligibleOrders.forEach(order => {
            if (order.customer.assignedToUserId) {
                revenueByUser[order.customer.assignedToUserId] = (revenueByUser[order.customer.assignedToUserId] || 0) + order.totalAmount;
            }
        });

        let totalCommission = 0;
        let topPerformer = { name: 'Chưa có', revenue: 0 };

        users.filter(u => u.commissionPolicyId).forEach(user => {
             const revenue = revenueByUser[user.id] || 0;
             if (revenue > topPerformer.revenue) {
                topPerformer = { name: user.name, revenue };
             }
             
             const policy = commissionPolicies.find(p => p.id === user.commissionPolicyId);
             if (policy) {
                 const applicableTier = [...policy.tiers]
                    .sort((a, b) => b.revenueThreshold - a.revenueThreshold)
                    .find(tier => revenue >= tier.revenueThreshold);
                 
                 if (applicableTier) {
                    totalCommission += revenue * (applicableTier.commissionRate / 100);
                 }
             }
        });

        return {
            totalCommission: totalCommission.toLocaleString('vi-VN'),
            rewardedStaff: Object.keys(revenueByUser).length,
            topPerformer: topPerformer.name,
        };
    }, [orders, users, commissionPolicies]);

    const handleSavePolicy = (policyData: Omit<CommissionPolicy, 'id'> | CommissionPolicy) => {
        if ('id' in policyData) {
          updateCommissionPolicy(policyData as CommissionPolicy);
          setToast('Cập nhật chính sách thành công.');
        } else {
            const newPolicy = {
                ...policyData,
                tiers: (policyData.tiers || []).map((t: any) => ({
                    ...t,
                    id: t.id || `tier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                }))
            };
            addCommissionPolicy(newPolicy as Omit<CommissionPolicy, 'id'>);
            setToast('Thêm chính sách mới thành công.');
        }
        setIsPolicyModalOpen(false);
    };

    const handleSaveTier = (tierData: Partial<CommissionTier>) => {
        const policy = commissionPolicies.find(p => p.id === editingTier.policyId);
        if (!policy) return;

        let updatedTiers: CommissionTier[];

        if (tierData.id) {
          updatedTiers = policy.tiers.map(t => (t.id === tierData.id ? { ...t, ...tierData } as CommissionTier : t));
        } else {
          updatedTiers = [...policy.tiers, { ...tierData, id: `tier_${Date.now()}` } as CommissionTier];
        }
        
        updatedTiers.sort((a, b) => a.revenueThreshold - b.revenueThreshold);
        updateCommissionPolicy({ ...policy, tiers: updatedTiers });
        setToast('Lưu bậc hoa hồng thành công.');
        setIsTierModalOpen(false);
    };
  
    const confirmDelete = () => {
      if (!confirm) return;
      if (confirm.type === 'policy') {
          deleteCommissionPolicy(confirm.id);
          setToast('Đã xóa chính sách.');
      } else if (confirm.type === 'tier' && confirm.policyId) {
          const policy = commissionPolicies.find(p => p.id === confirm.policyId);
          if(policy) {
            const updatedTiers = policy.tiers.filter(t => t.id !== confirm.id);
            updateCommissionPolicy({ ...policy, tiers: updatedTiers });
            setToast('Đã xóa bậc hoa hồng.');
          }
      }
      setConfirm(null);
    };

    const handleOpenTierModal = (policyId: string, tier: Partial<CommissionTier> | null) => {
        setEditingTier({ policyId, tier });
        setIsTierModalOpen(true);
    };
    
    const handleSaveAssignments = (policyId: string, finalUserIds: string[]) => {
        users.forEach(user => {
            const isCurrentlyAssigned = user.commissionPolicyId === policyId;
            const shouldBeAssigned = finalUserIds.includes(user.id);

            if (shouldBeAssigned && !isCurrentlyAssigned) {
                updateUser({ ...user, commissionPolicyId: policyId });
            } else if (!shouldBeAssigned && isCurrentlyAssigned) {
                updateUser({ ...user, commissionPolicyId: undefined });
            }
        });

        setToast('Gán nhân viên thành công.');
        setIsAssignModalOpen(null);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard title="Tổng hoa hồng (Tháng này)" value={`${kpiData.totalCommission} đ`} icon={<CreditCardIcon />} />
                    <KpiCard title="Nhân viên đạt thưởng" value={kpiData.rewardedStaff.toString()} icon={<UserCheckIcon />} />
                    <KpiCard title="Top Doanh thu" value={kpiData.topPerformer} icon={<TrophyIcon />} />
                </div>

                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Danh sách Chính sách</h2>
                    <button onClick={() => { setEditingPolicy({}); setIsPolicyModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm shadow-sm">
                        <PlusCircleIcon /> Thêm chính sách
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {commissionPolicies.map(policy => (
                        <div key={policy.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                            <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{policy.name}</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setEditingPolicy(policy); setIsPolicyModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => setConfirm({ type: 'policy', id: policy.id })} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            
                            <div className="p-4 space-y-3">
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Các bậc hoa hồng</h4>
                                <div className="space-y-2">
                                {policy.tiers.map((tier, index) => (
                                    <div key={tier.id} className="group flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs bg-white dark:bg-gray-800 border dark:border-gray-600 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300">Bậc {index+1}</span>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Từ <span className="font-semibold">{tier.revenueThreshold.toLocaleString('vi-VN')} đ</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">{tier.commissionRate}%</span>
                                            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                                <button onClick={() => handleOpenTierModal(policy.id, tier)} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => setConfirm({ type: 'tier', id: tier.id, policyId: policy.id })} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                </div>
                                <button onClick={() => handleOpenTierModal(policy.id, null)} className="text-xs font-semibold text-blue-600 mt-2 hover:underline">+ Thêm bậc</button>
                            </div>
                            
                            <div className="p-4 border-t dark:border-gray-700 mt-auto">
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Nhân viên áp dụng</h4>
                                <div className="flex flex-wrap items-center gap-2">
                                    {users.filter(u => u.commissionPolicyId === policy.id).map(user => (
                                        <div key={user.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                             <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">{user.name.charAt(0)}</div>
                                            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
                                        </div>
                                    ))}
                                     <button onClick={() => setIsAssignModalOpen(policy)} className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors font-bold text-lg">+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isPolicyModalOpen && <PolicyModal policy={editingPolicy} onClose={() => setIsPolicyModalOpen(false)} onSave={handleSavePolicy} />}
            {isTierModalOpen && <TierModal tier={editingTier.tier} onClose={() => setIsTierModalOpen(false)} onSave={handleSaveTier} />}
            {isAssignModalOpen && <AssignUserModal policy={isAssignModalOpen} onClose={() => setIsAssignModalOpen(null)} onSave={handleSaveAssignments} />}
            <ConfirmationModal isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirmDelete} title="Xác nhận Xóa" message="Bạn có chắc chắn muốn xóa mục này?" />
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
};

// --- PROFIT RULES TAB ---
const ProfitRuleModal: React.FC<{
    rule: Partial<ProfitRule> | null;
    onClose: () => void;
    onSave: (rule: Omit<ProfitRule, 'id'> | ProfitRule) => void;
}> = ({ rule, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<ProfitRule>>(rule || { minCost: 0, markup: 0 });
    const [isMaxCostNull, setIsMaxCostNull] = useState(rule?.maxCost === null);

    const handleNumberChange = (name: keyof ProfitRule, value: number) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            maxCost: isMaxCostNull ? null : formData.maxCost
        }
        if ((finalData.minCost || 0) < 0 || (finalData.markup || 0) <= 0) {
            alert('Giá trị và lợi nhuận phải là số dương.');
            return;
        }
        onSave(finalData as ProfitRule);
        onClose();
    };

    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-6">{rule?.id ? 'Chỉnh sửa' : 'Thêm'} Quy tắc Lợi nhuận</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Giá vốn từ</label>
                            <FormattedNumberInput value={formData.minCost || 0} onChange={(val) => handleNumberChange('minCost', val)} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Giá vốn đến</label>
                            <FormattedNumberInput value={isMaxCostNull ? '' : (formData.maxCost || '')} onChange={(val) => handleNumberChange('maxCost', val)} className={inputClass} disabled={isMaxCostNull} />
                            <label className="flex items-center mt-2 text-sm">
                                <input type="checkbox" checked={isMaxCostNull} onChange={(e) => setIsMaxCostNull(e.target.checked)} className="h-4 w-4 rounded text-blue-600" />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Trở lên</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Lợi nhuận áp dụng (%)</label>
                        <FormattedNumberInput value={formData.markup || 0} onChange={(val) => handleNumberChange('markup', val)} className={inputClass} required />
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProfitRulesContent: React.FC = () => {
    const { profitRules, addProfitRule, updateProfitRule, deleteProfitRule } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<ProfitRule | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');

    const sortedRules = useMemo(() => [...profitRules].sort((a, b) => a.minCost - b.minCost), [profitRules]);

    const handleSave = (ruleData: Omit<ProfitRule, 'id'> | ProfitRule) => {
        if ('id' in ruleData && ruleData.id) {
            updateProfitRule(ruleData as ProfitRule);
            setToastMessage('Cập nhật quy tắc thành công.');
        } else {
            addProfitRule(ruleData as Omit<ProfitRule, 'id'>);
            setToastMessage('Thêm quy tắc thành công.');
        }
        setIsModalOpen(false);
        setEditingRule(null);
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteProfitRule(itemToDelete);
            setToastMessage('Đã xóa quy tắc.');
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };
    
    const formatCostRange = (min: number, max: number | null) => {
        if (max === null) {
            return `Trên ${min.toLocaleString('vi-VN')} đ`;
        }
        return `Từ ${min.toLocaleString('vi-VN')} đ đến ${max.toLocaleString('vi-VN')} đ`;
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-end">
                    <button onClick={() => { setEditingRule(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">+ Thêm quy tắc</button>
                </div>

                 <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-200 p-4 rounded-r-lg" role="alert">
                    <p className="font-bold">Cách hoạt động:</p>
                    <p className="text-sm">Hệ thống sẽ tự động áp dụng % lợi nhuận tương ứng với tổng giá vốn của sản phẩm khi sử dụng Công cụ Tính giá thành.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Khung giá vốn</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">% Lợi nhuận</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedRules.map(rule => (
                                <tr key={rule.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800 dark:text-gray-100">{formatCostRange(rule.minCost, rule.maxCost)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-green-600">{rule.markup}%</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => { setEditingRule(rule); setIsModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(rule.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                             {sortedRules.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        Chưa có quy tắc nào. Hãy thêm một quy tắc để bắt đầu.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <ProfitRuleModal rule={editingRule} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDelete} title="Xác nhận Xóa" message="Bạn có chắc muốn xóa quy tắc này?" />
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

const CommissionCalculationContent: React.FC = () => {
    const { orders, users, commissionPolicies } = useData();
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(lastDay);

    const commissionReport = useMemo(() => {
        if (!startDate || !endDate) return [];

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const eligibleOrders = orders.filter(o => 
            (o.status === OrderStatus.Paid || o.status === OrderStatus.Delivered) &&
            new Date(o.orderDate) >= start && 
            new Date(o.orderDate) <= end
        );

        const report = users
            .filter(u => u.commissionPolicyId)
            .map(user => {
                const policy = commissionPolicies.find(p => p.id === user.commissionPolicyId);
                // Policy might have been deleted but user still assigned, handle gracefully
                if (!policy) return {
                    user,
                    orderCount: 0,
                    totalRevenue: 0,
                    commission: 0,
                    effectiveRate: 0,
                    policyName: 'Không xác định'
                };

                const userOrders = eligibleOrders.filter(o => o.customer.assignedToUserId === user.id); 
                
                const totalRevenue = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                
                let commission = 0;
                let effectiveRate = 0;

                // Only calculate if there is revenue, otherwise it's 0
                if (totalRevenue > 0) {
                    const applicableTier = [...policy.tiers]
                        .sort((a, b) => b.revenueThreshold - a.revenueThreshold)
                        .find(tier => totalRevenue >= tier.revenueThreshold);

                    if (applicableTier) {
                        commission = totalRevenue * (applicableTier.commissionRate / 100);
                        effectiveRate = applicableTier.commissionRate;
                    }
                }

                return {
                    user,
                    orderCount: userOrders.length,
                    totalRevenue,
                    commission,
                    effectiveRate,
                    policyName: policy.name
                };
            });
            
        return report;
    }, [orders, users, commissionPolicies, startDate, endDate]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kỳ tính lương:</label>
                <DatePicker value={startDate} onChange={setStartDate} className="w-36 py-2 px-3 border rounded-lg bg-white" />
                <span className="text-gray-500">-</span>
                <DatePicker value={endDate} onChange={setEndDate} className="w-36 py-2 px-3 border rounded-lg bg-white" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nhân viên</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chính sách</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">% Hoa hồng (Thực tế)</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số đơn thành công</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Doanh thu tính thưởng</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hoa hồng thực nhận</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {commissionReport.map(row => (
                           <tr key={row.user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                               <td className="px-6 py-4">
                                   <div className="font-medium text-gray-900 dark:text-white">{row.user.name}</div>
                                   <div className="text-sm text-gray-500 dark:text-gray-400">{row.user.email}</div>
                               </td>
                               <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{row.policyName}</td>
                               <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">{row.effectiveRate}%</td>
                               <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">{row.orderCount}</td>
                               <td className="px-6 py-4 text-right font-semibold text-gray-800 dark:text-gray-100">{row.totalRevenue.toLocaleString('vi-VN')}</td>
                               <td className="px-6 py-4 text-right font-bold text-green-600">{row.commission.toLocaleString('vi-VN')}</td>
                           </tr>
                        ))}
                         {commissionReport.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">Không có nhân viên nào được áp dụng chính sách hoa hồng.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const SettingsPage: React.FC = () => {
    const { currentUser, roles } = useData();
    const [activeTab, setActiveTab] = useState<'users' | 'policies' | 'commissions' | 'profit_rules'>('users');

    const { hasUserPermission, isAdmin, canManageProfitRules } = useMemo(() => {
        if (!currentUser) return { hasUserPermission: false, isAdmin: false, canManageProfitRules: false };
        const role = roles.find(r => r.id === currentUser.roleId);
        const permissions = role?.permissions || [];
        return {
            hasUserPermission: permissions.includes('manage_users'),
            isAdmin: role?.id === 'role_admin',
            canManageProfitRules: permissions.includes('manage_profit_rules'),
        };
    }, [currentUser, roles]);


    if (!hasUserPermission) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Bạn không có quyền truy cập trang này.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý & Phân quyền</h1>

             <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                            activeTab === 'users'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        Danh sách Nhân viên
                    </button>
                    {isAdmin && (
                        <>
                             <button
                                onClick={() => setActiveTab('policies')}
                                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === 'policies'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                Chính sách Hoa hồng
                            </button>
                             <button
                                onClick={() => setActiveTab('commissions')}
                                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === 'commissions'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                Tính lương thưởng / Hoa hồng
                            </button>
                        </>
                    )}
                    {canManageProfitRules && (
                        <button
                            onClick={() => setActiveTab('profit_rules')}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                activeTab === 'profit_rules'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            Quy tắc Lợi nhuận
                        </button>
                    )}
                </nav>
            </div>

            <div className="min-h-[600px] pt-6">
                {activeTab === 'users' && <UserListContent />}
                {activeTab === 'policies' && isAdmin && <CommissionPolicyContent />}
                {activeTab === 'commissions' && isAdmin && <CommissionCalculationContent />}
                {activeTab === 'profit_rules' && canManageProfitRules && <ProfitRulesContent />}
            </div>
        </div>
    );
};

export default SettingsPage;
