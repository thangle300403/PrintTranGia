

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Unit, UnitCategory } from '../../types';
import { UnitModal } from '../../components/catalogs/UnitModal';
import { UnitCategoryModal } from '../../components/catalogs/UnitCategoryModal';
import { PencilIcon, TrashIcon } from '../../components/icons/Icons';
import Pagination from '../../components/Pagination';
import CustomSelect from '../../components/CustomSelect';

const categoryColorMap: Record<string, string> = {
    'Sản phẩm': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'Chất liệu': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Gia công': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'Thời gian': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Bán hàng (POS)': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    'Vật tư': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
};

const getCategoryClass = (categoryName: string) => {
    return categoryColorMap[categoryName] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

const UnitListTab: React.FC = () => {
  const { units, addUnit, updateUnit, deleteUnit, currentUser, rolePermissions, unitCategories } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredUnits = useMemo(() => {
    return units.filter(unit => {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch = unit.name.toLowerCase().includes(lowerSearch) || (unit.description || '').toLowerCase().includes(lowerSearch);
        const matchesCategory = !categoryFilter || (unit.categories || []).includes(categoryFilter);
        return matchesSearch && matchesCategory;
    });
  }, [units, searchTerm, categoryFilter]);

  const paginatedUnits = useMemo(() => {
    return filteredUnits.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredUnits, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleOpenModal = (unit: Unit | null = null) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingUnit(null);
    setIsModalOpen(false);
  };

  const handleSave = (unitData: Omit<Unit, 'id'> | Unit) => {
    if ('id' in unitData && unitData.id) {
      updateUnit(unitData as Unit);
    } else {
      addUnit(unitData as Omit<Unit, 'id'>);
    }
  };

  const handleDelete = (unitId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn vị tính này không?')) {
        deleteUnit(unitId);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Tất cả phân loại' },
    ...unitCategories.map(cat => ({ value: cat.id, label: cat.name }))
  ];
  
  const userPermissions = useMemo(() => {
    if (!currentUser) return { canCreate: false, canEdit: false, canDelete: false };
    const permissions = rolePermissions[currentUser.roleId] || [];
    return {
        canCreate: permissions.includes('create_units'),
        canEdit: permissions.includes('edit_units'),
        canDelete: permissions.includes('delete_units'),
    };
  }, [currentUser, rolePermissions]);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <input
                  type="text"
                  placeholder="Tìm theo tên hoặc mô tả..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
               <CustomSelect
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={value => setCategoryFilter(value)}
                  className="w-full md:w-auto md:min-w-48"
              />
            </div>
             {userPermissions.canCreate && (
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                  Thêm đơn vị mới
                </button>
              )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tên đơn vị</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Phân loại</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Mô tả</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUnits.length > 0 ? paginatedUnits.map(unit => (
                <tr key={unit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{unit.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                          {(unit.categories || []).map(catId => {
                            const category = unitCategories.find(c => c.id === catId);
                            if (!category) return null;
                            return (
                                <span key={catId} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryClass(category.name)}`}>
                                    {category.name}
                                </span>
                            );
                          })}
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300">{unit.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                     {userPermissions.canEdit && (
                      <button onClick={() => handleOpenModal(unit)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full" title="Sửa"><PencilIcon className="w-5 h-5" /></button>
                     )}
                     {userPermissions.canDelete && (
                      <button onClick={() => handleDelete(unit.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full" title="Xóa"><TrashIcon className="w-5 h-5" /></button>
                     )}
                  </td>
                </tr>
              )) : (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">Không có đơn vị tính nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredUnits.length > itemsPerPage && (
          <Pagination
              currentPage={currentPage}
              totalItems={filteredUnits.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
      {isModalOpen && <UnitModal unit={editingUnit} onClose={handleCloseModal} onSave={handleSave} />}
    </>
  );
};

const CategoryListTab: React.FC = () => {
    const { unitCategories, addUnitCategory, updateUnitCategory, deleteUnitCategory } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<UnitCategory | null>(null);

    const handleSave = (categoryData: Omit<UnitCategory, 'id'> | UnitCategory) => {
        if ('id' in categoryData && categoryData.id) {
            updateUnitCategory(categoryData as UnitCategory);
        } else {
            addUnitCategory(categoryData as Omit<UnitCategory, 'id'>);
        }
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phân loại này? Nó sẽ bị xóa khỏi tất cả các đơn vị tính hiện có.')) {
            deleteUnitCategory(id);
        }
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                >+ Thêm phân loại</button>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tên Phân loại</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {unitCategories.map(cat => (
                            <tr key={cat.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <UnitCategoryModal category={editingCategory} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </>
    );
};


const UnitCatalogPage: React.FC = () => {
    const { currentUser, rolePermissions } = useData();
    const [activeTab, setActiveTab] = useState<'units' | 'categories'>('units');

    const canManage = useMemo(() => {
        if (!currentUser) return false;
        const permissions = rolePermissions[currentUser.roleId] || [];
        return permissions.includes('view_units'); // Base permission to see the page
    }, [currentUser, rolePermissions]);

    if (!canManage) {
        return <div className="text-center p-8"><h1 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h1></div>;
    }
  
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danh mục Đơn vị tính</h1>
        
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('units')}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'units' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    Danh sách Đơn vị tính
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'categories' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    Quản lý Phân loại
                </button>
            </nav>
        </div>

        <div className="pt-4">
            {activeTab === 'units' && <UnitListTab />}
            {activeTab === 'categories' && <CategoryListTab />}
        </div>
      </div>
    );
};

export default UnitCatalogPage;