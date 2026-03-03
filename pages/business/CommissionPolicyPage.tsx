
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { CommissionPolicy, CommissionTier } from '../../types';
import { PencilIcon, TrashIcon, PlusCircleIcon } from '../../components/icons/Icons';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';

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
      // Editing
      onSave({ ...policy, name } as CommissionPolicy);
    } else {
      // Creating
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

const CommissionPolicyPage: React.FC = () => {
  const { commissionPolicies, addCommissionPolicy, updateCommissionPolicy, deleteCommissionPolicy } = useData();
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Partial<CommissionPolicy> | null>(null);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<{ policyId: string, tier: Partial<CommissionTier> | null }>({ policyId: '', tier: null });
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState<{ type: 'policy' | 'tier', id: string, policyId?: string } | null>(null);

  const handleSavePolicy = (policyData: Omit<CommissionPolicy, 'id'> | CommissionPolicy) => {
    if ('id' in policyData) {
      updateCommissionPolicy(policyData as CommissionPolicy);
      setToast('Cập nhật chính sách thành công.');
    } else {
      // FIX: The type of `policyData` is `Omit<CommissionPolicy, "id">` which is what `addCommissionPolicy` expects. The previous explicit cast was incorrect.
      addCommissionPolicy(policyData as Omit<CommissionPolicy, 'id'>);
      setToast('Thêm chính sách mới thành công.');
    }
    setIsPolicyModalOpen(false);
  };

  const handleSaveTier = (tierData: Partial<CommissionTier>) => {
    const policy = commissionPolicies.find(p => p.id === editingTier.policyId);
    if (!policy) return;

    let updatedTiers: CommissionTier[];

    if (tierData.id) { // Editing existing tier
      updatedTiers = policy.tiers.map(t => (t.id === tierData.id ? { ...t, ...tierData } as CommissionTier : t));
    } else { // Adding new tier
      updatedTiers = [...policy.tiers, { ...tierData, id: `tier_${Date.now()}` } as CommissionTier];
    }
    
    // Sort tiers by revenue threshold
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Chính sách Hoa hồng</h1>
          <button onClick={() => { setEditingPolicy({}); setIsPolicyModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
            <PlusCircleIcon /> Thêm chính sách
          </button>
        </div>

        <div className="space-y-4">
          {commissionPolicies.map(policy => (
            <div key={policy.id} className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-lg font-bold text-gray-800">{policy.name}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingPolicy(policy); setIsPolicyModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => setConfirm({ type: 'policy', id: policy.id })} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-4">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr>
                      <th className="pb-2 font-medium">Doanh thu từ (VND)</th>
                      <th className="pb-2 font-medium">Hoa hồng (%)</th>
                      <th className="w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {policy.tiers.map(tier => (
                      <tr key={tier.id} className="group">
                        <td className="py-1">{tier.revenueThreshold.toLocaleString('vi-VN')}</td>
                        <td className="py-1 font-semibold text-green-600">{tier.commissionRate}%</td>
                        <td className="py-1 text-right">
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                            <button onClick={() => handleOpenTierModal(policy.id, tier)} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => setConfirm({ type: 'tier', id: tier.id, policyId: policy.id })} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                 <button onClick={() => handleOpenTierModal(policy.id, null)} className="text-xs font-semibold text-blue-600 mt-3 hover:underline">+ Thêm bậc</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isPolicyModalOpen && <PolicyModal policy={editingPolicy} onClose={() => setIsPolicyModalOpen(false)} onSave={handleSavePolicy} />}
      {isTierModalOpen && <TierModal tier={editingTier.tier} onClose={() => setIsTierModalOpen(false)} onSave={handleSaveTier} />}
      <ConfirmationModal isOpen={!!confirm} onClose={() => setConfirm(null)} onConfirm={confirmDelete} title="Xác nhận Xóa" message="Bạn có chắc chắn muốn xóa mục này?"/>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  );
};

export default CommissionPolicyPage;
