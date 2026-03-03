
import React, { ReactNode, useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useLocation, matchPath, Link } from 'react-router-dom';
import { 
    ChevronDownIcon
} from './icons/Icons';
import Chatbot from './Chatbot';
import { useData } from '../../context/DataContext';
import { Permission, MenuItem } from '../types';
import IconRenderer from './IconRenderer';
import Header from './Header';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, companyInfo, navigationMenu, roles } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Calculate permissions logic updated to support Custom Permissions
  const userPermissions = useMemo(() => {
      if (!currentUser) return [];
      
      // If user has custom permissions enabled, use them
      if (currentUser.useCustomPermissions && currentUser.customPermissions) {
          return currentUser.customPermissions;
      }

      // Otherwise fall back to role permissions
      const role = roles.find(r => r.id === currentUser.roleId);
      return role ? role.permissions : [];
  }, [currentUser, roles]);

  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const isGettingStartedPage = location.pathname === '/getting-started';

  const getActiveItem = (pathname: string): MenuItem | undefined => {
    // Exact match first
    let activeItem = navigationMenu.find(item => item.path === pathname && item.path !== '#');
    if (activeItem) return activeItem;

    // Match for dynamic routes like /quotes/:id/edit
    activeItem = navigationMenu
      .filter(item => item.path.includes(':'))
      .sort((a, b) => b.path.length - a.path.length) // more specific paths first
      .find(item => matchPath(item.path, pathname));
    if (activeItem) return activeItem;
    
    // Match for child routes like /quotes/new when base is /quotes
    activeItem = navigationMenu
      .filter(item => item.path !== '/' && item.path !== '#')
      .sort((a, b) => b.path.length - a.path.length) // more specific paths first
      .find(item => pathname.startsWith(item.path));
      
    return activeItem;
  }

  const pageTitle = useMemo(() => {
    if (isGettingStartedPage) {
        return 'Bắt đầu sử dụng';
    }

    const activeItem = getActiveItem(location.pathname);
    
    if (location.pathname.endsWith('/new')) {
        const parentLabel = activeItem?.label.toLowerCase().replace('danh sách', '').trim() || '';
        return `Tạo mới ${parentLabel}`;
    }
    if (location.pathname.includes('/edit')) {
        const parentLabel = activeItem?.label.toLowerCase().replace('danh sách', '').trim() || '';
        return `Chỉnh sửa ${parentLabel}`;
    }
    
    if (activeItem?.parentId) {
        const parent = navigationMenu.find(p => p.id === activeItem.parentId);
        if (parent?.label === 'Báo cáo' || parent?.label === 'Kinh doanh' || parent?.label === 'Kế toán' || parent?.label === 'Quỹ tiền' || parent?.label === 'Danh mục' || parent?.label === 'Thiết lập')
            return activeItem.label;
    }
    
    return activeItem?.label || 'Tổng quan';
  }, [location.pathname, navigationMenu, isGettingStartedPage]);


  const hasPermission = (permission?: Permission) => {
    if (!permission) return true; // Public link
    return userPermissions.includes(permission);
  };

  const topLevelItems = useMemo(() => 
    navigationMenu
      .filter(item => !item.parentId)
      .sort((a, b) => a.order - b.order),
    [navigationMenu]
  );
  
  const getChildren = (parentId: string) => 
    navigationMenu
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.order - b.order);


  useEffect(() => {
    const currentPath = location.pathname;
    const activeParent = topLevelItems.find(item => {
        const children = getChildren(item.id);
        return children.some(child => hasPermission(child.permission) && currentPath.startsWith(child.path))
    });
    
    setOpenMenu(activeParent ? activeParent.label : null);
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location.pathname, navigationMenu, roles]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // Only close if screen is small (mobile menu behavior)
        if (window.innerWidth < 1024 && sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isMobileMenuOpen) {
             // If click is not on the sidebar and not on the menu button (handled by overlay usually)
             // logic handled by overlay div below
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleMenuClick = (label: string) => {
    setOpenMenu(prev => (prev === label ? null : label));
  };

  if (isGettingStartedPage) {
    return (
        <div className="flex h-screen bg-[var(--gray-100)] text-[var(--gray-800)]">
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title={pageTitle} />
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-200">
                    {children}
                </main>
            </div>
            <Chatbot />
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--gray-100)] text-[var(--gray-800)] overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef} 
        className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[var(--white)] p-3 flex flex-col border-r border-[var(--gray-200)] shadow-lg lg:shadow-sm transition-transform duration-300 ease-in-out transform
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center mb-6 px-3 pt-2 justify-between lg:justify-start">
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={companyInfo.logoUrl || "https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"} alt="Company Logo" className="h-8 w-auto"/>
            </Link>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500 p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        <nav className="flex-grow space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            {topLevelItems.map((item) => {
                const children = getChildren(item.id);
                const hasVisibleChildren = children.some(child => hasPermission(child.permission));

                if (!hasPermission(item.permission)) {
                    return null;
                }

                if (!hasVisibleChildren && children.length > 0) {
                    return null; 
                }

                if (children.length === 0) { // Simple NavLink
                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            onClick={() => { setOpenMenu(null); setIsMobileMenuOpen(false); }}
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                                isActive
                                    ? 'bg-gradient-to-r from-[var(--blue-500)] to-[var(--blue-600)] text-white shadow-md font-semibold'
                                    : 'text-[var(--gray-600)] hover:bg-[var(--gray-150)]'
                                }`
                            }
                        >
                            <span className="group-hover:scale-110 transition-transform flex-shrink-0"><IconRenderer name={item.icon} /></span>
                            <span className="ml-3 flex-1 truncate">{item.label}</span>
                             {item.badge && <span className="bg-[var(--brand-color-2)] text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">{item.badge}</span>}
                        </NavLink>
                    );
                } else { // Accordion
                    const isOpen = openMenu === item.label;
                    const isSubActive = children.some(link => location.pathname.startsWith(link.path));

                    return (
                       <div key={item.id}>
                            <button
                                onClick={() => handleMenuClick(item.label)}
                                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 group ${
                                isSubActive
                                    ? 'text-[var(--brand-color-1)] font-semibold'
                                    : 'text-[var(--gray-600)]'
                                } hover:bg-[var(--gray-150)]`}
                            >
                                <span className="group-hover:scale-110 transition-transform flex-shrink-0"><IconRenderer name={item.icon} /></span>
                                <span className="ml-3 flex-1 text-left truncate">{item.label}</span>
                                <ChevronDownIcon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] mt-1' : 'max-h-0'}`}>
                                <div className="pl-4 space-y-1 my-1">
                                    {children.map(child => (
                                        hasPermission(child.permission) && (
                                            <NavLink 
                                                key={child.id} 
                                                to={child.path} 
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={({ isActive }) => 
                                                    `flex items-center px-3 py-2 text-sm rounded-md transition-colors truncate ${
                                                        isActive 
                                                        ? 'text-[var(--blue-600)] font-semibold bg-blue-50' 
                                                        : 'text-[var(--gray-500)] hover:text-[var(--gray-900)] hover:bg-gray-50'
                                                    }`
                                                }
                                            >
                                               <span className="mr-2 text-gray-400">-</span>
                                               {child.label}
                                            </NavLink>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                }
            })}
        </nav>
        
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={pageTitle} onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>
      
      <Chatbot />
    </div>
  );
};

export default Layout;
