
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { MaterialGroup, MaterialVariant, ProductionOrderStatus, TransactionType } from '../../types';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { PencilIcon, TrashIcon, WarningIcon, ScissorsIcon, BoxIcon, TrendingUpIcon, ClockIcon, CalculatorIcon } from '../../components/icons/Icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';
import CustomSelect from '../../components/CustomSelect';

// --- NEW COMPONENT: INVENTORY HISTORY MODAL ---
const InventoryHistoryModal: React.FC<{
    item: MaterialVariant;
    onClose: () => void;
}> = ({ item, onClose }) => {
    const { inventoryTransactions } = useData();

    const history = useMemo(() => {
        return inventoryTransactions
            .filter(tx => tx.itemId === item.id && tx.itemType === 'material')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [inventoryTransactions, item.id]);

    const getTransactionLabel = (type: TransactionType) => {
        switch (type) {
            case TransactionType.ImportPO: return 'Nhập mua hàng';
            case TransactionType.ImportReturn: return 'Nhập hàng trả';
            case TransactionType.ExportProduction: return 'Xuất sản xuất';
            case TransactionType.ExportSale: return 'Xuất bán';
            case TransactionType.Adjustment: return 'Điều chỉnh kho';
            default: return type;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 p-0 rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[80vh]">
                <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thẻ kho: {item.name}</h3>
                        <p className="text-sm text-gray-500">Mã: {item.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {history.length > 0 ? (
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 sticky top-0">
                                <tr>
                                    <th className="p-3 text-left">Ngày chứng từ</th>
                                    <th className="p-3 text-left">Loại giao dịch</th>
                                    <th className="p-3 text-left">Diễn giải</th>
                                    <th className="p-3 text-right">Số lượng</th>
                                    <th className="p-3 text-right">Người thực hiện</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {history.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                        <td className="p-3 text-gray-700 dark:text-gray-300">
                                            <div>{new Date(tx.date).toLocaleDateString('vi-VN')}</div>
                                            <div className="text-xs text-gray-500">{new Date(tx.date).toLocaleTimeString('vi-VN')}</div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                tx.quantity > 0 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                                {getTransactionLabel(tx.type)}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1 font-mono">{tx.refId}</div>
                                        </td>
                                        <td className="p-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                            {tx.notes || '-'}
                                        </td>
                                        <td className={`p-3 text-right font-bold ${tx.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.quantity > 0 ? '+' : ''}{tx.quantity.toLocaleString('vi-VN')} <span className="text-xs font-normal text-gray-500">{tx.unit}</span>
                                        </td>
                                        <td className="p-3 text-right text-gray-500">
                                            {tx.performedBy}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <BoxIcon className="w-12 h-12 mb-3 opacity-20" />
                            <p>Chưa có dữ liệu giao dịch kho nào.</p>
                        </div>
                    )}
                </div>
                 <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Đóng</button>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const MaterialGroupModal: React.FC<{
  group: Partial<MaterialGroup> | null;
  onClose: () => void;
  onSave: (group: Omit<MaterialGroup, 'id'> | MaterialGroup) => void;
}> = ({ group, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<MaterialGroup>>(group || { name: '', description: '' });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      onSave(formData as MaterialGroup);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{group?.id ? 'Chỉnh sửa' : 'Thêm'} Nhóm Chất liệu</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên nhóm</label>
            <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" required autoFocus />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
             <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" rows={3} />
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

const MaterialVariantModal: React.FC<{
  variant: Partial<MaterialVariant> | null;
  groupId: string;
  onClose: () => void;
  onSave: (variant: Omit<MaterialVariant, 'id'> | MaterialVariant) => void;
}> = ({ variant, groupId, onClose, onSave }) => {
  const { units, unitCategories } = useData();
  
  const [formData, setFormData] = useState<Partial<MaterialVariant>>(
    variant || { 
        groupId, 
        name: '', 
        gsm: 0,
        width: 0,
        height: 0,
        purchaseUnit: 'Ram',
        costingUnit: 'tờ',
        purchasePrice: 0, 
        conversionRate: 500,
        sellingPrice: 0, 
        initialStock: 0, 
        lowStockThreshold: 0 
    }
  );

  const materialCategoryId = useMemo(() => 
      unitCategories.find(c => c.name === 'Chất liệu')?.id,
  [unitCategories]);

  const materialUnits = useMemo(() => {
      if (!materialCategoryId) return units;
      return units.filter(u => u.categories?.includes(materialCategoryId));
  }, [units, materialCategoryId]);
  
  const unitOptions = useMemo(() => 
      materialUnits.map(u => ({ value: u.name, label: u.name })),
  [materialUnits]);

  const costPerSheet = useMemo(() => {
      const price = formData.purchasePrice || 0;
      const rate = formData.conversionRate || 1;
      return rate > 0 ? price / rate : 0;
  }, [formData.purchasePrice, formData.conversionRate]);

  useEffect(() => {
      if (formData.purchaseUnit === 'tờ') {
          setFormData(prev => ({ ...prev, conversionRate: 1 }));
      } else if (formData.purchaseUnit === 'Ram') {
          if (!formData.conversionRate || formData.conversionRate === 1) {
               setFormData(prev => ({ ...prev, conversionRate: 500 }));
          }
      }
  }, [formData.purchaseUnit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: keyof MaterialVariant, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.purchaseUnit) {
        alert('Vui lòng điền tên giấy và đơn vị nhập.');
        return;
    }
    const dataToSave = {
        ...formData,
        costingUnit: 'tờ',
        averageCost: costPerSheet
    };
    onSave(dataToSave as MaterialVariant);
    onClose();
  };
  
  const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">{variant?.id ? 'Chỉnh sửa' : 'Thêm'} Giấy in</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2">
                 <label className={labelClass}>Tên giấy (Hiển thị)</label>
                 <input name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} required autoFocus placeholder="VD: Couche 300 - 65x86" />
             </div>
             <div>
                 <label className={labelClass}>Định lượng (GSM)</label>
                 <FormattedNumberInput value={formData.gsm || ''} onChange={v => handleNumberChange('gsm', v)} className={inputClass} />
             </div>
             <div>
                 <label className={labelClass}>Kích thước (Rộng x Cao) cm</label>
                 <div className="flex items-center gap-2">
                    <FormattedNumberInput value={formData.width || ''} onChange={v => handleNumberChange('width', v)} className={inputClass} placeholder="W" />
                    <span className="text-gray-500">x</span>
                    <FormattedNumberInput value={formData.height || ''} onChange={v => handleNumberChange('height', v)} className={inputClass} placeholder="H" />
                 </div>
             </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 uppercase flex items-center gap-2">
                  <CalculatorIcon className="w-4 h-4"/> Quy đổi đơn vị & Giá vốn
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className={labelClass}>Giá nhập (VND)</label>
                     <FormattedNumberInput 
                        value={formData.purchasePrice || ''} 
                        onChange={v => handleNumberChange('purchasePrice', v)} 
                        className={`${inputClass} bg-white font-semibold`} 
                        placeholder="0"
                    />
                  </div>
                  <div>
                     <label className={labelClass}>Đơn vị tính (Mua)</label>
                     <CustomSelect
                        options={unitOptions}
                        value={formData.purchaseUnit || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, purchaseUnit: value }))}
                        className="!bg-white font-bold"
                     />
                  </div>
                  <div>
                      <label className={labelClass}>Tỷ lệ quy đổi (ra Tờ)</label>
                      <FormattedNumberInput 
                        value={formData.conversionRate || ''} 
                        onChange={v => handleNumberChange('conversionRate', v)} 
                        className={`${inputClass} text-center`}
                        disabled={formData.purchaseUnit === 'tờ'} 
                        placeholder="SL tờ/đơn vị"
                      />
                  </div>
              </div>

              <div className="mt-4 flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded border border-blue-200 dark:border-blue-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                      Công thức: {formData.purchasePrice?.toLocaleString('vi-VN') || 0} / {formData.conversionRate || 1}
                  </span>
                  <div className="text-right">
                      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Giá vốn / 1 Tờ</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">{costPerSheet.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} đ</span>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
             <div>
                <label className={labelClass}>Giá bán (Báo giá)</label>
                <FormattedNumberInput value={formData.sellingPrice || ''} onChange={v => handleNumberChange('sellingPrice', v)} className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">Giá này dùng để gợi ý khi tạo báo giá.</p>
             </div>
             <div>
                <label className={labelClass}>Tồn kho ban đầu ({formData.purchaseUnit})</label>
                <FormattedNumberInput value={formData.initialStock || ''} onChange={v => handleNumberChange('initialStock', v)} className={inputClass} />
             </div>
             <div>
                <label className={labelClass}>Ngưỡng báo hết hàng ({formData.purchaseUnit})</label>
                <FormattedNumberInput value={formData.lowStockThreshold || ''} onChange={v => handleNumberChange('lowStockThreshold', v)} className={inputClass} />
             </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VariantCard: React.FC<{ 
    variant: MaterialVariant, 
    canEdit: boolean, 
    canDelete: boolean, 
    onEdit: () => void, 
    onDelete: () => void,
    onViewHistory: () => void,
    vatRate: number
}> = ({ variant, canEdit, canDelete, onEdit, onDelete, onViewHistory, vatRate }) => {
    const maxScale = (variant.lowStockThreshold * 3) || 500; 
    const runtimeVariant = variant as any;
    const progressPercent = Math.min((runtimeVariant.closingStock / maxScale) * 100, 100);
    const progressColor = runtimeVariant.isLowStock ? 'bg-red-500' : 'bg-green-500';
    const stockValue = runtimeVariant.closingStock * variant.purchasePrice;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            
            <div className="flex justify-between items-start mb-3 mt-1">
                <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{variant.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                            {variant.purchaseUnit}
                        </span>
                        <span className="text-xs text-gray-500">x {variant.conversionRate} tờ</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onViewHistory} className="p-1.5 text-gray-400 hover:text-purple-600 rounded hover:bg-purple-50" title="Xem Thẻ kho"><ClockIcon className="w-4 h-4"/></button>
                    {canEdit && <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"><PencilIcon className="w-4 h-4"/></button>}
                    {canDelete && <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"><TrashIcon className="w-4 h-4"/></button>}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-[10px] text-blue-600 dark:text-blue-300 uppercase font-bold mb-0.5">Giá vốn / Tờ</p>
                    <p className="font-bold text-blue-800 dark:text-blue-200 text-lg">
                        {(variant.averageCost || (variant.purchasePrice / variant.conversionRate)).toLocaleString('vi-VN', {maximumFractionDigits: 0})} <span className="text-xs font-normal">đ</span>
                    </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
                     <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">Giá nhập / {variant.purchaseUnit}</p>
                     <p className="font-semibold text-gray-700 dark:text-gray-300">{variant.purchasePrice.toLocaleString('vi-VN')} đ</p>
                </div>
            </div>
            
            <div className="space-y-2 mt-auto">
                <div className="flex justify-between items-end text-sm">
                     <span className="text-gray-500 text-xs">Tồn kho ({variant.purchaseUnit}):</span>
                     <span className={`font-bold text-xl ${runtimeVariant.isLowStock ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}>
                         {runtimeVariant.closingStock.toLocaleString('vi-VN')}
                     </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${Math.max(progressPercent, 5)}%` }}></div>
                </div>
                 <div className="flex justify-between text-xs text-gray-400 mt-0.5 min-h-[1.25rem]">
                     <span>Min: {variant.lowStockThreshold}</span>
                     {runtimeVariant.isLowStock && <span className="text-red-500 flex items-center gap-1 font-medium"><WarningIcon className="w-3 h-3"/> Sắp hết hàng</span>}
                </div>
            </div>
            
             <div className="mt-3 pt-2 border-t dark:border-gray-700 flex justify-between text-[10px] text-gray-400">
                 <div>Giá trị tồn: <span className="text-gray-600 dark:text-gray-300 font-semibold">{stockValue.toLocaleString('vi-VN')} đ</span></div>
            </div>
        </div>
    );
}

const MaterialCatalogPage: React.FC = () => {
    const { 
        materialGroups, materialVariants, 
        addMaterialGroup, updateMaterialGroup, deleteMaterialGroup, 
        addMaterialVariant, updateMaterialVariant, deleteMaterialVariant, 
        currentUser, rolePermissions, productionOrders, companyInfo,
        paperConversions
    } = useData();

    const [modal, setModal] = useState<{ type: 'group' | 'variant' | 'history', data: any, groupId?: string } | null>(null);
    const [searchTermGroups, setSearchTermGroups] = useState('');
    const [searchTermVariants, setSearchTermVariants] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'group' | 'variant', id: string } | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    
    const vatRate = companyInfo.vatRate || 0;

    useEffect(() => {
        if (!selectedGroupId && materialGroups.length > 0) {
            setSelectedGroupId(materialGroups[0].id);
        }
    }, [materialGroups, selectedGroupId]);

    const materialReport = useMemo(() => {
        const completedPOs = productionOrders.filter(po => po.status === ProductionOrderStatus.Completed);
        const productionUsage = new Map<string, number>();

        for (const po of completedPOs) {
            if (po.material) {
                 for (const variant of materialVariants) {
                     if (po.material.toLowerCase().includes(variant.name.toLowerCase())) {
                         const sheetsUsed = po.quantity;
                         const purchaseUnitsUsed = sheetsUsed / (variant.conversionRate || 1);
                         productionUsage.set(variant.id, (productionUsage.get(variant.id) || 0) + purchaseUnitsUsed);
                     }
                 }
            }
        }

        return materialVariants.map(variant => {
            const usedInProduction = productionUsage.get(variant.id) || 0;
            const currentDbStock = Number(variant.initialStock) || 0; 
            const closingStock = currentDbStock - usedInProduction; 
            const isLowStock = closingStock <= variant.lowStockThreshold;
            
            return {
                ...variant,
                closingStock,
                isLowStock,
                usedInProduction,
                initialStock: currentDbStock 
            };
        });
    }, [materialVariants, materialGroups, productionOrders, paperConversions]);

    const stats = useMemo(() => {
        const totalVariants = materialReport.length;
        const lowStockCount = materialReport.filter(v => v.isLowStock).length;
        const totalStockValue = materialReport.reduce((sum, v) => sum + (v.closingStock * v.purchasePrice), 0);
        return { totalVariants, lowStockCount, totalStockValue };
    }, [materialReport]);

    const userPermissions = useMemo(() => {
        if (!currentUser) return { canView: false, canCreate: false, canEdit: false, canDelete: false };
        const permissions = rolePermissions[currentUser.roleId] || [];
        return {
            canView: permissions.includes('view_materials'),
            canCreate: permissions.includes('create_materials'),
            canEdit: permissions.includes('edit_materials'),
            canDelete: permissions.includes('delete_materials'),
        };
    }, [currentUser, rolePermissions]);

    const filteredGroups = useMemo(() => {
        if (!searchTermGroups.trim()) return materialGroups;
        const lowerSearch = searchTermGroups.toLowerCase();
        return materialGroups.filter(g => g.name.toLowerCase().includes(lowerSearch));
    }, [materialGroups, searchTermGroups]);

    const selectedGroupVariants = useMemo(() => {
        if (!selectedGroupId) return [];
        let variants = materialReport.filter(v => v.groupId === selectedGroupId);
        if(searchTermVariants) {
            const lowerSearch = searchTermVariants.toLowerCase();
            variants = variants.filter(v => v.name.toLowerCase().includes(lowerSearch));
        }
        return variants;
    }, [materialReport, selectedGroupId, searchTermVariants]);
    
    if (!userPermissions.canView) {
        return <div className="text-center p-8"><h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1></div>;
    }
    
     const handleAddGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;
        addMaterialGroup({ name: newGroupName, description: '' });
        setNewGroupName('');
    };

    const handleSaveGroup = (groupData: Omit<MaterialGroup, 'id'> | MaterialGroup) => {
        updateMaterialGroup(groupData as MaterialGroup);
        setModal(null);
        setToastMessage('Lưu nhóm thành công.');
    };
    
    const handleDeleteGroup = (groupId: string) => {
        setItemToDelete({ type: 'group', id: groupId });
        setIsConfirmModalOpen(true);
    };

    const handleSaveVariant = (variantData: Omit<MaterialVariant, 'id'> | MaterialVariant) => {
        if ('id' in variantData && variantData.id) {
            updateMaterialVariant(variantData as MaterialVariant);
        } else {
            addMaterialVariant(variantData as Omit<MaterialVariant, 'id'>);
        }
        setModal(null);
        setToastMessage('Lưu loại giấy thành công.');
    };

    const handleDeleteVariant = (variantId: string) => {
        setItemToDelete({ type: 'variant', id: variantId });
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        let success = false;
        if (itemToDelete.type === 'group') {
            success = deleteMaterialGroup(itemToDelete.id);
            if (success) setToastMessage('Đã xóa nhóm thành công.');
        } else {
            success = deleteMaterialVariant(itemToDelete.id);
            if (success) setToastMessage('Đã xóa loại giấy thành công.');
        }
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kho & Chất liệu In</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Tổng số loại giấy" value={stats.totalVariants} icon={<BoxIcon />} colorClass="bg-blue-100 text-blue-600" />
                    <StatCard title="Giá trị tồn kho" value={stats.totalStockValue.toLocaleString('vi-VN') + ' đ'} icon={<TrendingUpIcon />} colorClass="bg-green-100 text-green-600" />
                    <StatCard title="Sắp hết hàng" value={stats.lowStockCount} icon={<WarningIcon />} colorClass="bg-red-100 text-red-600" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-16rem)] min-h-[600px]">
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                        {userPermissions.canCreate && (
                            <form onSubmit={handleAddGroup} className="pb-4 border-b dark:border-gray-700 space-y-2">
                                <input type="text" placeholder="Tên nhóm mới" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                                <button type="submit" className="w-full px-4 py-2 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm">Thêm nhóm</button>
                            </form>
                        )}
                        <div className="pt-4 flex-1 overflow-y-auto min-h-0">
                            <input type="text" placeholder="Tìm nhóm..." value={searchTermGroups} onChange={e => setSearchTermGroups(e.target.value)} className="w-full p-2 mb-3 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                            <ul className="space-y-2 pr-1">
                                {filteredGroups.map(group => (
                                    <li key={group.id} onClick={() => setSelectedGroupId(group.id)} 
                                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border shadow-sm ${selectedGroupId === group.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
                                        <p className="font-semibold text-sm">{group.name}</p>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100">
                                            {userPermissions.canEdit && <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'group', data: group }); }} className={`p-1 ${selectedGroupId === group.id ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-blue-600'}`}><PencilIcon className="w-4 h-4" /></button>}
                                            {userPermissions.canDelete && <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }} className={`p-1 ${selectedGroupId === group.id ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-red-600'}`}><TrashIcon className="w-4 h-4" /></button>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-3 flex flex-col h-full">
                         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                            {selectedGroupId ? (
                                <>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 flex-shrink-0">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                            {materialGroups.find(g => g.id === selectedGroupId)?.name}
                                        </h3>
                                        <div className="flex gap-3 w-full sm:w-auto">
                                            <input type="text" placeholder="Tìm tên giấy..." value={searchTermVariants} onChange={e => setSearchTermVariants(e.target.value)} className="flex-1 sm:w-64 p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                                            {userPermissions.canCreate && <button onClick={() => setModal({ type: 'variant', data: null, groupId: selectedGroupId })} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 shadow-sm whitespace-nowrap">+ Thêm mới</button>}
                                        </div>
                                    </div>
                                    
                                    <div className="overflow-y-auto flex-1 pr-2 min-h-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {selectedGroupVariants.map(variant => (
                                                <VariantCard 
                                                    key={variant.id}
                                                    variant={variant}
                                                    canEdit={userPermissions.canEdit}
                                                    canDelete={userPermissions.canDelete}
                                                    onEdit={() => setModal({ type: 'variant', data: variant, groupId: selectedGroupId })}
                                                    onDelete={() => handleDeleteVariant(variant.id)}
                                                    onViewHistory={() => setModal({ type: 'history', data: variant })}
                                                    vatRate={vatRate}
                                                />
                                            ))}
                                        </div>
                                        {selectedGroupVariants.length === 0 && (
                                            <div className="text-center text-gray-500 py-12 flex flex-col items-center">
                                                <BoxIcon className="w-16 h-16 text-gray-300 mb-4" />
                                                <p>Chưa có loại giấy nào trong nhóm này.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <BoxIcon className="w-24 h-24 mb-4 opacity-20" />
                                    <p>Chọn một nhóm chất liệu bên trái để xem chi tiết.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {modal?.type === 'group' && <MaterialGroupModal group={modal.data} onClose={() => setModal(null)} onSave={handleSaveGroup} />}
            {modal?.type === 'variant' && <MaterialVariantModal variant={modal.data} groupId={modal.groupId!} onClose={() => setModal(null)} onSave={handleSaveVariant} />}
            {modal?.type === 'history' && <InventoryHistoryModal item={modal.data} onClose={() => setModal(null)} />}
            
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDelete} title="Xác nhận Xóa" message="Bạn có chắc chắn muốn xóa mục này?" />
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};
export default MaterialCatalogPage;
