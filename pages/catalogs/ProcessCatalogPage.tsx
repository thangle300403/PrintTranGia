

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { ProcessGroup, ProcessConfiguration, ProcessCalculationMethod, PrintBatchRule } from '../../types';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { PencilIcon, TrashIcon, PlusCircleIcon } from '../../components/icons/Icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';
import CustomSelect from '../../components/CustomSelect';
import { ProcessGroupModal } from '../../components/catalogs/ProcessGroupModal';


const ProcessConfigModal: React.FC<{
  config: Partial<ProcessConfiguration> | null;
  groupId: string;
  onClose: () => void;
  onSave: (config: Omit<ProcessConfiguration, 'id'> | ProcessConfiguration) => void;
}> = ({ config, groupId, onClose, onSave }) => {
  const { units, rawMaterials, unitCategories, processGroups } = useData();
  const [formData, setFormData] = useState<Partial<ProcessConfiguration>>(
    config || {
        groupId,
        name: '',
        calculationMethod: ProcessCalculationMethod.PerSheet,
        setupFee: 0,
        unitPrice: 0,
        pricingUnit: 'tờ',
        appliesTo: 'surface',
        batchRules: [],
    }
  );
  
  const processCategoryId = useMemo(() => 
      unitCategories.find(c => c.name === 'Gia công')?.id,
  [unitCategories]);

  const processUnits = useMemo(() => {
      if (!processCategoryId) return units; // Fallback
      return units.filter(u => u.categories?.includes(processCategoryId));
  }, [units, processCategoryId]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({...prev, [name]: value}));
  };



  const handleNumberChange = (name: keyof ProcessConfiguration, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleAddBatchRule = () => {
    setFormData(prev => ({
        ...prev,
        batchRules: [...(prev.batchRules || []), { id: `br_${Date.now()}`, maxQuantity: 0, price: 0 }]
    }));
  };



  const handleRemoveBatchRule = (id: string) => {
    setFormData(prev => ({
        ...prev,
        batchRules: (prev.batchRules || []).filter(r => r.id !== id)
    }));
  };



  const handleBatchRuleChange = (id: string, field: keyof PrintBatchRule, value: number) => {
    setFormData(prev => ({
        ...prev,
        batchRules: (prev.batchRules || []).map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.groupId) {
      alert('Vui lòng điền tên và chọn nhóm gia công.');
      return;
    }
    
    const dataToSave = {
        ...formData,
        setupFee: formData.calculationMethod === ProcessCalculationMethod.FixedLot ? 0 : (formData.setupFee || 0)
    };



    onSave(dataToSave as ProcessConfiguration);
    onClose();
  };
  
  const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const calcMethod = formData.calculationMethod;



  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex-shrink-0">{config?.id ? 'Chỉnh sửa' : 'Thêm'} Cấu hình Gia công</h3>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="space-y-6 overflow-y-auto pr-2 flex-1">
              
              {/* Card 1: General Info */}
              <div className="p-4 border rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-700 mb-3">1. Thông tin chung</h4>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Tên gia công</label>
                    <input name="name" value={formData.name || ''} onChange={handleInputChange} className={inputClass} required autoFocus />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Nhóm gia công</label>
                        <select name="groupId" value={formData.groupId || ''} onChange={handleInputChange} className={inputClass} required>
                            <option value="">-- Chọn nhóm --</option>
                            {processGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Loại gia công</label>
                        <select name="appliesTo" value={formData.appliesTo || 'surface'} onChange={handleInputChange} className={inputClass}>
                            <option value="surface">Gia công bề mặt (Cán màng, UV...)</option>
                            <option value="product">Gia công thành phẩm (Bế, Dán...)</option>
                        </select>
                      </div>
                  </div>
                </div>
              </div>
              
              {/* Card 2: Formula Pricing */}
              <div className="p-4 border rounded-lg shadow-sm">
                <h4 className="font-semibold text-green-700 mb-3">2. Chi phí định mức (Công thức)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelClass}>Cách tính giá</label>
                      <select name="calculationMethod" value={calcMethod} onChange={handleInputChange} className={inputClass}>
                          <option value={ProcessCalculationMethod.PerSheet}>Theo tờ in</option>
                          <option value={ProcessCalculationMethod.PerProduct}>Theo thành phẩm</option>
                          <option value={ProcessCalculationMethod.FixedLot}>Theo lô (trọn gói)</option>
                      </select>
                    </div>
                     <div>
                          <label className={labelClass}>Đơn vị tính</label>
                          <select name="pricingUnit" value={formData.pricingUnit} onChange={handleInputChange} className={inputClass} disabled={calcMethod === ProcessCalculationMethod.FixedLot}>
                              {processUnits.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                          </select>
                     </div>
                </div>
                 <div>
                    {calcMethod === ProcessCalculationMethod.FixedLot ? (
                        <div>
                             <label className={labelClass}>Giá trọn gói (VNĐ)</label>
                             <FormattedNumberInput value={formData.unitPrice || ''} onChange={v => handleNumberChange('unitPrice', v)} className={inputClass} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Phí khởi tạo/Làm khuôn (VNĐ)</label>
                                <FormattedNumberInput value={formData.setupFee || ''} onChange={v => handleNumberChange('setupFee', v)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Đơn giá gia công/{formData.pricingUnit} (VNĐ)</label>
                                <FormattedNumberInput value={formData.unitPrice || ''} onChange={v => handleNumberChange('unitPrice', v)} className={inputClass} />
                            </div>
                        </div>
                    )}
               </div>
              </div>

              {/* Card 3: Batch Pricing */}
              <div className="p-4 border rounded-lg shadow-sm bg-purple-50/50 border-purple-100">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-purple-700">3. Bảng giá theo Lô (Hybrid Pricing)</h4>
                    <button type="button" onClick={handleAddBatchRule} className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 flex items-center gap-1">
                        <PlusCircleIcon className="w-3 h-3"/> Thêm dòng
                    </button>
                </div>
                <div className="space-y-2">
                    {(formData.batchRules || []).map((rule) => (
                        <div key={rule.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5 flex items-center gap-2">
                                <span className="text-xs text-gray-500">Số lượng đến:</span>
                                <FormattedNumberInput value={rule.maxQuantity} onChange={v => handleBatchRuleChange(rule.id, 'maxQuantity', v)} className={`${inputClass} py-1 h-8`} />
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <span className="text-xs text-gray-500">Giá trọn gói:</span>
                                <FormattedNumberInput value={rule.price} onChange={v => handleBatchRuleChange(rule.id, 'price', v)} className={`${inputClass} py-1 h-8 font-semibold text-purple-700`} />
                            </div>
                            <div className="col-span-1 text-center">
                                <button type="button" onClick={() => handleRemoveBatchRule(rule.id)} className="text-red-500 hover:text-red-700 p-1">
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>
                    ))}
                    {(formData.batchRules || []).length === 0 && (
                      <p className="text-xs text-gray-400 italic text-center py-2">Chưa có quy tắc giá lô. Hệ thống sẽ sử dụng công thức tính chi tiết.</p>
                    )}
                </div>
              </div>

          </div>
          <div className="mt-8 flex justify-end space-x-3 border-t dark:border-gray-700 pt-4 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600">Hủy</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProcessListTab: React.FC = () => {
    const { processConfigurations, processGroups, addProcessConfiguration, updateProcessConfiguration, deleteProcessConfiguration, currentUser, rolePermissions } = useData();
    
    const [modal, setModal] = useState<{ type: 'config', data: any, groupId?: string } | null>(null);
    const [searchTermConfigs, setSearchTermConfigs] = useState('');
    const [groupFilter, setGroupFilter] = useState<string>('');
    
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');

    const userPermissions = useMemo(() => {
        if (!currentUser) return { canCreate: false, canEdit: false, canDelete: false };
        const permissions = rolePermissions[currentUser.roleId] || [];
        return {
            canCreate: permissions.includes('create_processes'),
            canEdit: permissions.includes('edit_processes'),
            canDelete: permissions.includes('delete_processes'),
        };
    }, [currentUser, rolePermissions]);

    const filteredConfigs = useMemo(() => {
        return processConfigurations
            .filter(c => {
                if (groupFilter && c.groupId !== groupFilter) return false;
                if (searchTermConfigs) {
                    const lowerSearch = searchTermConfigs.toLowerCase();
                    if (!c.name.toLowerCase().includes(lowerSearch)) return false;
                }
                return true;
            })
            .sort((a,b) => a.name.localeCompare(b.name));
    }, [processConfigurations, groupFilter, searchTermConfigs]);

    const handleSaveConfig = (configData: Omit<ProcessConfiguration, 'id'> | ProcessConfiguration) => {
        if ('id' in configData && configData.id) {
            updateProcessConfiguration(configData as ProcessConfiguration);
            setToastMessage('Cập nhật thành công.');
        } else {
            addProcessConfiguration(configData as Omit<ProcessConfiguration, 'id'>);
            setToastMessage('Thêm mới thành công.');
        }
        setModal(null);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            deleteProcessConfiguration(itemToDelete);
            setToastMessage('Đã xóa cấu hình.');
            setIsConfirmModalOpen(false);
            setItemToDelete(null);
        }
    };

    const formatPrice = (config: ProcessConfiguration) => {
        if (config.batchRules && config.batchRules.length > 0) return 'Giá Lô + Công thức';
        switch(config.calculationMethod) {
            case ProcessCalculationMethod.FixedLot: return `${config.unitPrice.toLocaleString('vi-VN')} / lô`;
            case ProcessCalculationMethod.PerProduct:
            case ProcessCalculationMethod.PerSheet:
                let priceStr = `${config.unitPrice.toLocaleString('vi-VN')} / ${config.pricingUnit}`;
                if (config.setupFee > 0) priceStr = `${config.setupFee.toLocaleString('vi-VN')} + ${priceStr}`;
                return priceStr;
            default: return 'Chưa cấu hình';
        }
    };
    
    const groupOptions = [{ value: '', label: 'Tất cả nhóm' }, ...processGroups.map(g => ({ value: g.id, label: g.name }))];

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                     <div className="flex flex-wrap items-center gap-4">
                        <input
                            type="text"
                            placeholder="Tìm theo tên gia công..."
                            value={searchTermConfigs}
                            onChange={e => setSearchTermConfigs(e.target.value)}
                            className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700"
                        />
                        <CustomSelect options={groupOptions} value={groupFilter} onChange={setGroupFilter} className="w-full md:w-auto min-w-48" />
                    </div>
                    {userPermissions.canCreate && (
                        <button onClick={() => setModal({ type: 'config', data: null, groupId: groupFilter })} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm text-sm">+ Thêm Gia công</button>
                    )}
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mt-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Tên Gia công</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Nhóm</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Bảng giá</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredConfigs.map(config => (
                                <tr key={config.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{config.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{processGroups.find(g => g.id === config.groupId)?.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">{formatPrice(config)}</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => setModal({ type: 'config', data: config, groupId: config.groupId })} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                        <button onClick={() => { setItemToDelete(config.id); setIsConfirmModalOpen(true); }} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {modal?.type === 'config' && <ProcessConfigModal config={modal.data} groupId={modal.groupId || ''} onClose={() => setModal(null)} onSave={handleSaveConfig} />}
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDelete} title="Xác nhận Xóa" message="Bạn có chắc chắn muốn xóa mục này?" />
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

const ProcessGroupTab: React.FC = () => {
    const { processGroups, addProcessGroup, updateProcessGroup, deleteProcessGroup, processConfigurations } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ProcessGroup | null>(null);

    const handleSave = (groupData: Omit<ProcessGroup, 'id'> | ProcessGroup) => {
        if ('id' in groupData) updateProcessGroup(groupData as ProcessGroup);
        else addProcessGroup(groupData);
        setIsModalOpen(false);
    };

    const handleDelete = (groupId: string) => {
        const configsInGroup = processConfigurations.filter(c => c.groupId === groupId).length;
        if (configsInGroup > 0) {
            alert(`Không thể xóa nhóm này vì đang có ${configsInGroup} cấu hình gia công thuộc về nó.`);
            return;
        }
        if (window.confirm('Bạn có chắc muốn xóa nhóm này?')) deleteProcessGroup(groupId);
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <button onClick={() => { setEditingGroup(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">+ Thêm nhóm</button>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tên nhóm</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Mô tả</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">Số lượng</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {processGroups.map(group => (
                            <tr key={group.id}>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{group.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{group.description}</td>
                                <td className="px-6 py-4 text-center">{processConfigurations.filter(c => c.groupId === group.id).length}</td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => { setEditingGroup(group); setIsModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(group.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ProcessGroupModal group={editingGroup} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </>
    );
};


const ProcessCatalogPage: React.FC = () => {
    const { currentUser, rolePermissions } = useData();
    const [activeTab, setActiveTab] = useState<'configs' | 'groups'>('configs');

    const canManage = useMemo(() => {
        if (!currentUser) return false;
        const permissions = rolePermissions[currentUser.roleId] || [];
        return permissions.includes('view_processes');
    }, [currentUser, rolePermissions]);

    if (!canManage) {
        return <div className="text-center p-8"><h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1></div>;
    }
  
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Gia công (In ấn)</h1>
        
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
                <button
                    onClick={() => setActiveTab('configs')}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'configs' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    Danh sách Gia công
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'groups' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    Quản lý Nhóm
                </button>
            </nav>
        </div>

        <div className="pt-4">
            {activeTab === 'configs' && <ProcessListTab />}
            {activeTab === 'groups' && <ProcessGroupTab />}
        </div>
      </div>
    );
};

export default ProcessCatalogPage;
