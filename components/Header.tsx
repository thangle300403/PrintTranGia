
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ChevronDownIcon, GiftIcon, BellIcon, QuestionMarkCircleIcon, UserCircleIcon, LogoutIcon, MenuIcon } from './icons/Icons';

const Header: React.FC<{ title: string; onMenuClick?: () => void }> = ({ title, onMenuClick }) => {
  const { currentUser, companyInfo, logout, roles } = useData();
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roleName = useMemo(() => {
      if (!currentUser) return '';
      const role = roles.find(r => r.id === currentUser.roleId);
      return role ? role.name : '';
  }, [currentUser, roles]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserDropdownOpen(false);
  };
  
  return (
    <header className="bg-white flex-shrink-0 h-16 border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 z-10 shadow-sm sticky top-0">
      {/* Left side: Mobile Menu & Page Title */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
            <button 
                onClick={onMenuClick}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
        )}
        <h1 className="text-lg lg:text-xl font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-none">{title}</h1>
      </div>

      {/* Right side: Actions & User */}
      <div className="flex items-center space-x-2 lg:space-x-6">
        <Link to="/getting-started" className="hidden md:block text-sm text-blue-600 font-medium hover:underline">Bắt đầu sử dụng</Link>

        {/* Company Selector (Hidden on very small screens) */}
        <div className="relative hidden sm:block">
          <button className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <span className="max-w-[120px] lg:max-w-[200px] truncate" title={companyInfo.name}>{companyInfo.name}</span>
            <ChevronDownIcon className="w-4 h-4 ml-2 text-gray-500" />
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-1">
          <button className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors hidden sm:block">
            <GiftIcon />
          </button>
          <button className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
            <BellIcon />
          </button>
          <button className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors hidden sm:block">
            <QuestionMarkCircleIcon />
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div ref={dropdownRef} className="relative border-l border-gray-200 pl-2 lg:pl-6">
          <button onClick={() => setIsUserDropdownOpen(prev => !prev)} className="flex items-center space-x-2 lg:space-x-3 group">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm group-hover:bg-blue-700 transition-colors overflow-hidden">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser?.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="text-left hidden lg:block">
                <p className="text-sm font-semibold text-gray-800">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{roleName}</p>
            </div>
            <ChevronDownIcon className={`hidden lg:block w-4 h-4 text-gray-500 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown Menu */}
          {isUserDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                 <style>{`
                    @keyframes fade-in-down {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
                `}</style>
                <div className="p-3 border-b border-gray-200 bg-gray-50 lg:hidden">
                   <p className="text-sm font-semibold text-gray-800 truncate">{currentUser?.name}</p>
                   <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                </div>
                <ul className="py-1">
                  <li onClick={() => setIsUserDropdownOpen(false)}>
                    <Link to="/account" className="w-full text-left flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <UserCircleIcon className="w-5 h-5 mr-3 text-gray-400"/>
                      <span>Thông tin tài khoản</span>
                    </Link>
                  </li>
                   <li className="border-t border-gray-100 my-1"></li>
                  <li>
                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogoutIcon className="w-5 h-5 mr-3"/>
                      <span>Đăng xuất</span>
                    </button>
                  </li>
                </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
