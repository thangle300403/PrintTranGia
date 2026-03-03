
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { RawMaterialGroup, RawMaterial, ProductionOrderStatus } from '../../types';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { PencilIcon, TrashIcon, WarningIcon, ScissorsIcon } from '../../components/icons/Icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';
import CustomSelect from '../../components/CustomSelect';

const RawMaterialGroupModal: React.FC<{
    group: Partial<RawMaterialGroup> | null;
    onClose: () => void;
    onSave: (group: Omit<RawMaterialGroup, 'id'> | RawMaterialGroup) => void;
}> = ({ group, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<RawMaterialGroup>>(group || { name: '', description: '' });

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
        onSave(formData as RawMaterialGroup);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{group?.id ? 'Chỉnh sửa' : 'Thêm'} Nhóm Vật tư</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên nhóm</label>
                        <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required autoFocus />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RawMaterialModal: React.FC<{
  material: Partial<RawMaterial> | null;
  groupId: string;
  onClose: () => void;
  onSave: (material: Omit<RawMaterial, 'id'> | RawMaterial) => void;
}> = ({ material, groupId, onClose, onSave }) => {
  const { units, unitCategories } = useData();
  const [formData, setFormData] = useState<Partial<RawMaterial>>(
    material || { groupId, name: '', unit: '', purchasePrice: 0, sellingPrice: 0, initialStock: 0, lowStockThreshold: 0 }
  );
  
  const supplyCategoryId = useMemo(() => 
      unitCategories.find(c => c.name === 'Vật tư')?.id,
  [unitCategories]);

  const supplyUnits = useMemo(() => {
      if (!supplyCategoryId) return units; // Fallback
      return units.filter(u => u.categories?.includes(supplyCategoryId));
  }, [units, supplyCategoryId]);

  const unitOptions = useMemo(() => supplyUnits.map(u => ({ value: u.name, label: u.name })), [supplyUnits]);

  useEffect(() => {
    if (!material && supplyUnits.length > 0 && !formData.unit) {
        setFormData(prev => ({ ...prev, unit: supplyUnits[0]?.name || '' }));
    }
  }, [supplyUnits, material, formData.unit]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: keyof RawMaterial, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.unit || formData.sellingPrice === undefined || formData.sellingPrice < 0) {
      alert('Vui lòng điền đầy đủ Tên, Đơn vị, và Giá bán.');
      return;
    }
    onSave(formData as RawMaterial);
    onClose();
  };
  
  const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{material?.id ? 'Chỉnh sửa' : 'Thêm'} Vật tư</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tên Vật tư</label>
              <input name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} required autoFocus />
            </div>
            <div>
              <label className={labelClass}>Đơn vị tính</label>
              <CustomSelect 
                options={unitOptions}
                value={formData.unit || ''}
                onChange={(val) => setFormData(prev => ({ ...prev, unit: val }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Giá mua (Vốn)</label>
              <FormattedNumberInput value={formData.purchasePrice || ''} onChange={(val) => handleNumberChange('purchasePrice', val)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Giá bán (VND)</label>
              <FormattedNumberInput value={formData.sellingPrice || ''} onChange={(val) => handleNumberChange('sellingPrice', val)} className={inputClass} required />
            </div>
          </div>
           <div className="pt-4 border-t dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Quản lý kho</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tồn kho hiện tại</label>
                <FormattedNumberInput value={formData.initialStock || ''} onChange={(val) => handleNumberChange('initialStock', val)} className={inputClass} />
                <p className="text-xs text-gray-500 mt-1">Sẽ tự động cộng khi Nhập kho PO</p>
              </div>
              <div>
                <label className={labelClass}>Ngưỡng tồn kho thấp</label>
                <FormattedNumberInput value={formData.lowStockThreshold || ''} onChange={(val) => handleNumberChange('lowStockThreshold', val)} className={inputClass} />
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RawMaterialCatalogPage: React.FC = () => {
    const { 
        rawMaterialGroups, rawMaterials, 
        addRawMaterialGroup, updateRawMaterialGroup, deleteRawMaterialGroup, 
        addRawMaterial, updateRawMaterial, deleteRawMaterial, 
        currentUser, rolePermissions, productionOrders
    } = useData();

    const [modal, setModal] = useState<{ type: 'group' | 'material', data: any, groupId?: string } | null>(null);
    const [searchTermGroups, setSearchTermGroups] = useState('');
    const [searchTermMaterials, setSearchTermMaterials] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'group' | 'material', id: string } | null>(null);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (!selectedGroupId && rawMaterialGroups.length > 0) {
            setSelectedGroupId(rawMaterialGroups[0].id);
        }
    }, [rawMaterialGroups, selectedGroupId]);

    const userPermissions = useMemo(() => {
        if (!currentUser) return { canView: false, canCreate: false, canEdit: false, canDelete: false };
        const permissions = rolePermissions[currentUser.roleId] || [];
        return {
            canView: permissions.includes('view_raw_materials'),
            canCreate: permissions.includes('create_raw_materials'),
            canEdit: permissions.includes('edit_raw_materials'),
            canDelete: permissions.includes('delete_raw_materials'),
        };
    }, [currentUser, rolePermissions]);
    
    const rawMaterialReport = useMemo(() => {
        const completedPOs = productionOrders.filter(po => po.status === ProductionOrderStatus.Completed);
        const productionUsage = new Map<string, number>();

        return rawMaterials.map(material => {
             const currentDbStock = Number(material.initialStock) || 0;
             const usedInProduction = productionUsage.get(material.id) || 0;
             const closingStock = currentDbStock - usedInProduction;
             const isLowStock = closingStock <= (material.lowStockThreshold || 0);

             return {
                 ...material,
                 initialStock: currentDbStock, 
                 usedInProduction,
                 closingStock,
                 isLowStock
             }
        });
    }, [rawMaterials, productionOrders]);

    const filteredGroups = useMemo(() => {
        if (!searchTermGroups.trim()) return rawMaterialGroups;
        const lowerSearch = searchTermGroups.toLowerCase();
        return rawMaterialGroups.filter(g => g.name.toLowerCase().includes(lowerSearch));
    }, [rawMaterialGroups, searchTermGroups]);

    const selectedGroupMaterials = useMemo(() => {
        if (!selectedGroupId) return [];
        let materials = rawMaterialReport.filter(v => v.groupId === selectedGroupId);
        if(searchTermMaterials) {
            const lowerSearch = searchTermMaterials.toLowerCase();
            materials = materials.filter(m => m.name.toLowerCase().includes(lowerSearch));
        }
        return materials;
    }, [rawMaterialReport, selectedGroupId, searchTermMaterials]);
    
    if (!userPermissions.canView) {
        return <div className="text-center p-8"><h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1></div>;
    }

    const handleAddGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        addRawMaterialGroup({ name: newGroupName, description: '' });
        setNewGroupName('');
    };
    
    const handleSaveGroup = (groupData: Omit<RawMaterialGroup, 'id'> | RawMaterialGroup) => {
        updateRawMaterialGroup(groupData as RawMaterialGroup);
        setModal(null);
        setToastMessage('Lưu nhóm thành công.');
    };

    const handleDeleteGroup = (groupId: string) => {
        setItemToDelete({ type: 'group', id: groupId });
        setIsConfirmModalOpen(true);
    };
    
    const handleSaveMaterial = (materialData: Omit<RawMaterial, 'id'> | RawMaterial) => {
        if ('id' in materialData && materialData.id) {
            updateRawMaterial(materialData as RawMaterial);
        } else {
            addRawMaterial(materialData as Omit<RawMaterial, 'id'>);
        }
        setModal(null);
        setToastMessage('Lưu vật tư thành công.');
    };

    const handleDeleteMaterial = (materialId: string) => {
        setItemToDelete({ type: 'material', id: materialId });
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        let success = false;
        if (itemToDelete.type === 'group') {
            success = deleteRawMaterialGroup(itemToDelete.id);
            if (success) setToastMessage('Đã xóa nhóm thành công.');
        } else {
            success = deleteRawMaterial(itemToDelete.id);
            if (success) setToastMessage('Đã xóa vật tư thành công.');
        }
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Vật tư (Mực, Keo, Màng...)</h1>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-2 rounded-lg flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                        <ScissorsIcon className="w-5 h-5" />
                        <span>Tồn kho = Tồn kho (Gốc + Nhập) - Xuất (SX)</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-14rem)]">
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                        {userPermissions.canCreate && (
                            <form onSubmit={handleAddGroup} className="pb-4 border-b dark:border-gray-700 space-y-3">
                                <input 
                                    type="text"
                                    placeholder="Tên nhóm mới..."
                                    value={newGroupName}
                                    onChange={e => setNewGroupName(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm"
                                />
                                <button type="submit" className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm">Thêm nhóm</button>
                            </form>
                        )}
                        <div className="pt-4 flex-1 overflow-y-auto min-h-0">
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhóm..."
                                value={searchTermGroups}
                                onChange={e => setSearchTermGroups(e.target.value)}
                                className="w-full p-2 mb-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm"
                            />
                            <ul className="space-y-2 pr-2">
                                {filteredGroups.map(group => (
                                    <li key={group.id} onClick={() => setSelectedGroupId(group.id)} 
                                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border shadow-sm hover:shadow-md ${selectedGroupId === group.id ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600'}`}>
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{group.name}</p>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            {userPermissions.canEdit && <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'group', data: group }); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>}
                                            {userPermissions.canDelete && <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                        {selectedGroupId ? (
                            <>
                                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                                    <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                        Vật tư: {rawMaterialGroups.find(g => g.id === selectedGroupId)?.name}
                                    </h3>
                                    {userPermissions.canCreate && <button onClick={() => setModal({ type: 'material', data: null, groupId: selectedGroupId })} className="text-sm font-semibold text-green-600 hover:underline">+ Thêm mới</button>}
                                </div>
                                 <input
                                    type="text"
                                    placeholder="Tìm kiếm vật tư..."
                                    value={searchTermMaterials}
                                    onChange={e => setSearchTermMaterials(e.target.value)}
                                    className="w-full p-2 mb-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm flex-shrink-0"
                                />
                                <div className="space-y-3 overflow-y-auto flex-1 pr-2 min-h-0">
                                    {selectedGroupMaterials.map(material => (
                                        <div key={material.id} className="group bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-base text-gray-800 dark:text-white">{material.name} <span className="text-sm font-normal text-gray-500">({material.unit})</span></p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Giá vốn: {Number(material.purchasePrice).toLocaleString('vi-VN')} đ</p>
                                                </div>
                                                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {userPermissions.canEdit && <button onClick={() => setModal({ type: 'material', data: material, groupId: selectedGroupId })} className="p-1.5 bg-white dark:bg-gray-600 rounded shadow hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>}
                                                    {userPermissions.canDelete && <button onClick={() => handleDeleteMaterial(material.id)} className="p-1.5 bg-white dark:bg-gray-600 rounded shadow hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-4 gap-2 text-xs border-t dark:border-gray-600 pt-2 mt-2">
                                                <div>
                                                    <span className="text-gray-500 block">Tồn kho (Gốc+Nhập)</span>
                                                    <span className="font-medium">{material.initialStock.toLocaleString('vi-VN')}</span>
                                                </div>
                                                <div>
                                                     <span className="text-gray-500 block">Nhập (PO)</span>
                                                     <span className="text-gray-400">Đã cộng vào Gốc</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block">Xuất (SX)</span>
                                                    <div className="flex flex-col">
                                                        {material.usedInProduction > 0 ? <span className="text-red-500">-{material.usedInProduction}</span> : <span>0</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                     <span className="text-gray-500 block">Tồn cuối</span>
                                                     <div className={`flex items-center justify-end gap-1 font-bold text-lg ${material.isLowStock ? 'text-red-600' : 'text-blue-600'}`}>
                                                        {material.isLowStock && <WarningIcon className="w-4 h-4" title={`Ngưỡng thấp: ${material.lowStockThreshold}`} />}
                                                        {material.closingStock.toLocaleString('vi-VN')}
                                                     </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedGroupMaterials.length === 0 && (
                                        <div className="text-center text-gray-500 py-8">Chưa có vật tư nào.</div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Chọn một nhóm để xem.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {modal?.type === 'group' && <RawMaterialGroupModal group={modal.data} onClose={() => setModal(null)} onSave={handleSaveGroup} />}
            {modal?.type === 'material' && <RawMaterialModal material={modal.data} groupId={modal.groupId!} onClose={() => setModal(null)} onSave={handleSaveMaterial} />}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Xác nhận Xóa"
                message="Bạn có chắc chắn muốn xóa mục này? Hành động này sẽ không thể hoàn tác."
            />
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

export default RawMaterialCatalogPage;
