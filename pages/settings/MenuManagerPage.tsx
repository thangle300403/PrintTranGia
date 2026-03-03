
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { MenuItem } from '../../types';
import { PencilIcon, TrashIcon } from '../../components/icons/Icons';
import { MenuItemModal } from '../../components/settings/MenuItemModal';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';
import IconRenderer from '../../components/IconRenderer';

const MenuManagerPage: React.FC = () => {
    const { navigationMenu, updateNavigationMenu, currentUser, rolePermissions } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    
    // Drag & Drop State
    const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'parent' | 'child' } | null>(null);
    const [dragOverTarget, setDragOverTarget] = useState<{ type: 'parent' | 'child' | 'parent-area', id: string } | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState('');

    const hasPermission = useMemo(() => {
        if (!currentUser) return false;
        const permissions = rolePermissions[currentUser.roleId] || [];
        return permissions.includes('manage_menu');
    }, [currentUser, rolePermissions]);

    const topLevelItems = useMemo(() => navigationMenu.filter(item => !item.parentId).sort((a, b) => a.order - b.order), [navigationMenu]);
    const childItems = useMemo(() => {
        if (!selectedParentId) return [];
        return navigationMenu.filter(item => item.parentId === selectedParentId).sort((a, b) => a.order - b.order);
    }, [navigationMenu, selectedParentId]);
    
    useEffect(() => {
        if (!selectedParentId && topLevelItems.length > 0) {
            setSelectedParentId(topLevelItems[0].id);
        }
    }, [topLevelItems, selectedParentId]);

    if (!hasPermission) {
        return <div className="text-red-500">Bạn không có quyền truy cập trang này.</div>;
    }

    const handleOpenModal = (item: Partial<MenuItem> | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSaveItem = (itemData: MenuItem) => {
        let newItems = [...navigationMenu];
        if (itemData.id && newItems.some(i => i.id === itemData.id)) {
            newItems = newItems.map(i => (i.id === itemData.id ? itemData : i));
        } else {
            const newId = `menu_${Date.now()}`;
            newItems.push({ ...itemData, id: newId, order: 999 }); // Add to end, reorder will fix it
        }
        updateNavigationMenu(newItems);
        setToastMessage('Menu đã được cập nhật.');
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = (itemId: string) => {
        setItemToDelete(itemId);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        const itemsToDelete = new Set<string>([itemToDelete]);
        const children = navigationMenu.filter(item => item.parentId === itemToDelete);
        children.forEach(child => itemsToDelete.add(child.id));
        
        const newItems = navigationMenu.filter(item => !itemsToDelete.has(item.id));
        updateNavigationMenu(newItems);
        
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
        setToastMessage('Mục đã được xoá thành công.');
    };

    // --- Drag & Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, id: string, type: 'parent' | 'child') => {
        setDraggedItem({ id, type });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, type: 'parent' | 'child' | 'parent-area', id: string) => {
        e.preventDefault();
        if (draggedItem) {
            setDragOverTarget({ type, id });
        }
    };
    
    const handleDrop = (targetType: 'parent' | 'child', targetId: string) => {
        if (!draggedItem || draggedItem.id === targetId) {
            return;
        }
        if (draggedItem.type === 'parent' && targetType === 'child') {
            return;
        }

        let items = [...navigationMenu];
        const draggedItemIndex = items.findIndex(item => item.id === draggedItem.id);
        if (draggedItemIndex === -1) return;

        // 1. Get a copy of the dragged item and remove the original from the array
        const draggedItemData = { ...items[draggedItemIndex] };
        items.splice(draggedItemIndex, 1);
        
        let targetIndex = items.findIndex(item => item.id === targetId);
        if (targetIndex === -1) return; // Target not found, abort
        
        // 2. Insert the copied & modified item into the new position
        if (draggedItem.type === 'parent' && targetType === 'parent') {
            items.splice(targetIndex, 0, draggedItemData);
        } 
        else if (draggedItem.type === 'child' && targetType === 'child') {
            const targetItem = items[targetIndex];
            draggedItemData.parentId = targetItem.parentId;
            items.splice(targetIndex, 0, draggedItemData);
        } 
        else if (draggedItem.type === 'child' && targetType === 'parent') {
            draggedItemData.parentId = targetId;
            const childrenOfTarget = items.filter(i => i.parentId === targetId);
            let insertIndex;
            if (childrenOfTarget.length > 0) {
                const lastChildId = childrenOfTarget[childrenOfTarget.length - 1].id;
                insertIndex = items.findIndex(i => i.id === lastChildId) + 1;
            } else {
                insertIndex = targetIndex + 1;
            }
            items.splice(insertIndex, 0, draggedItemData);
        } else {
            return; // Invalid drop
        }

        // 3. Recalculate 'order' property for all items based on their new array positions
        const finalItems: MenuItem[] = [];
        const parentsInOrder = items.filter(i => !i.parentId);
        
        parentsInOrder.forEach((parent, parentIdx) => {
            finalItems.push({ ...parent, order: parentIdx });
            
            const childrenOfParent = items.filter(i => i.parentId === parent.id);
            childrenOfParent.forEach((child, childIdx) => {
                finalItems.push({ ...child, order: childIdx });
            });
        });
        
        // Add back any items that might have been orphaned (failsafe)
        items.forEach(item => {
            if (!finalItems.some(fi => fi.id === item.id)) {
                finalItems.push(item);
            }
        });

        updateNavigationMenu(finalItems);
    };
    
    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverTarget(null);
    };


    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Menu</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Kéo và thả để sắp xếp lại các mục menu. Bạn có thể kéo mục con sang một mục cha khác.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] mt-6">
                {/* Parent Menus */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg">Menu Cha (cấp 1)</h2>
                        <button onClick={() => handleOpenModal({ parentId: undefined })} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Thêm mới</button>
                    </div>
                    <ul className="space-y-2 flex-1 overflow-y-auto" onDragLeave={() => setDragOverTarget(null)}>
                        {topLevelItems.map((item, index) => (
                            <React.Fragment key={item.id}>
                                {dragOverTarget?.type === 'parent' && dragOverTarget.id === item.id && draggedItem?.id !== item.id && draggedItem?.type === 'parent' && (
                                     <div className="h-1 bg-blue-500 rounded-full my-1 transition-all" />
                                )}
                                <li
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item.id, 'parent')}
                                    onDragOver={(e) => handleDragOver(e, 'parent', item.id)}
                                    onDrop={() => handleDrop('parent', item.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => setSelectedParentId(item.id)}
                                    className={`group p-3 rounded-lg cursor-grab flex items-center gap-3 transition-all border
                                    ${selectedParentId === item.id ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-700/50 border-transparent hover:shadow-md'} 
                                    ${draggedItem?.id === item.id ? 'opacity-30' : ''} 
                                    ${draggedItem?.type === 'child' && dragOverTarget?.id === item.id ? 'border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'dark:border-gray-700 shadow-sm'}`}
                                >
                                    <div className="flex-1 flex items-center gap-3">
                                        <IconRenderer name={item.icon} />
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.path}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
                {/* Child Menus */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    {selectedParentId ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-lg">Menu Con của "{topLevelItems.find(i => i.id === selectedParentId)?.label}"</h2>
                                <button onClick={() => handleOpenModal({ parentId: selectedParentId })} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">+ Thêm mới</button>
                            </div>
                            <ul className="space-y-2 flex-1 overflow-y-auto" onDragLeave={() => setDragOverTarget(null)}>
                                {childItems.map((item, index) => (
                                     <React.Fragment key={item.id}>
                                        {dragOverTarget?.type === 'child' && dragOverTarget.id === item.id && draggedItem?.id !== item.id && (
                                            <div className="h-1 bg-blue-500 rounded-full my-1 transition-all" />
                                        )}
                                        <li
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item.id, 'child')}
                                            onDragOver={(e) => handleDragOver(e, 'child', item.id)}
                                            onDrop={() => handleDrop('child', item.id)}
                                            onDragEnd={handleDragEnd}
                                            className={`group p-3 rounded-lg cursor-grab flex items-center gap-3 transition-all border bg-white dark:bg-gray-700/50 shadow-sm hover:shadow-md dark:border-gray-700 ${draggedItem?.id === item.id ? 'opacity-30' : ''}`}
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.path}</p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(item)} className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </li>
                                     </React.Fragment>
                                ))}
                                {childItems.length === 0 && (
                                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        <p>Menu này chưa có mục con nào.</p>
                                    </div>
                                )}
                            </ul>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Chọn một Menu Cha để xem các mục con.</div>
                    )}
                </div>
            </div>

            {isModalOpen && <MenuItemModal itemToEdit={editingItem} onClose={() => setIsModalOpen(false)} onSave={handleSaveItem} existingItems={navigationMenu} />}
            <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={confirmDelete} title="Xác nhận Xóa" message="Bạn có chắc chắn muốn xóa mục này? Các mục con (nếu có) cũng sẽ bị xóa." />
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

export default MenuManagerPage;
