
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ContractStatus } from '../../types';
import Pagination from '../../components/Pagination';
import { EyeIcon, DocumentTextIcon, CheckCircleIcon, ClockIcon, ArchiveIcon } from '../../components/icons/Icons';
import DatePicker from '../../components/DatePicker';
import CustomSelect from '../../components/CustomSelect';

const getStatusClass = (status: ContractStatus) => {
  switch (status) {
    case ContractStatus.Active: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case ContractStatus.Expired: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case ContractStatus.Terminated: return 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300';
    case ContractStatus.Draft: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const ContractListPage: React.FC = () => {
  const { contracts, customers } = useData();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Không rõ';
  };
  
  const kpiData = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return {
        totalValue: contracts.reduce((sum, c) => sum + c.contractValue, 0),
        activeCount: contracts.filter(c => c.status === ContractStatus.Active).length,
        expiringSoonCount: contracts.filter(c => 
            c.status === ContractStatus.Active && 
            c.expiryDate && 
            new Date(c.expiryDate) > now && 
            new Date(c.expiryDate) <= thirtyDaysFromNow
        ).length,
        terminatedCount: contracts.filter(c => c.status === ContractStatus.Terminated).length,
    };
  }, [contracts]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const filteredContracts = useMemo(() => {
    return contracts
      .filter(contract => {
        if (statusFilter && contract.status !== statusFilter) return false;
        
        const signingDate = new Date(contract.signingDate);
        if (startDate && signingDate < new Date(startDate)) return false;
        if (endDate) {
            const filterEndDate = new Date(endDate);
            filterEndDate.setHours(23, 59, 59, 999);
            if (signingDate > filterEndDate) return false;
        }

        if (searchTerm) {
          const lowerSearch = searchTerm.toLowerCase();
          const customerName = getCustomerName(contract.customerId).toLowerCase();
          return contract.id.toLowerCase().includes(lowerSearch) ||
                 contract.title.toLowerCase().includes(lowerSearch) ||
                 customerName.includes(lowerSearch);
        }
        return true;
      })
      .sort((a, b) => new Date(b.signingDate).getTime() - new Date(a.signingDate).getTime());
  }, [contracts, searchTerm, statusFilter, startDate, endDate, customers]);

  const paginatedContracts = useMemo(() => {
    return filteredContracts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredContracts, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };
  
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    ...Object.values(ContractStatus).map(s => ({ value: s, label: s }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Hợp đồng</h1>
        <button
          onClick={() => navigate('/contracts/new')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-px"
        >
          Tạo Hợp đồng mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="Tổng giá trị Hợp đồng" value={kpiData.totalValue.toLocaleString('vi-VN') + ' đ'} icon={<DocumentTextIcon />} colorClass="bg-blue-100 text-blue-600" />
          <KpiCard title="Đang hiệu lực" value={kpiData.activeCount} icon={<CheckCircleIcon />} colorClass="bg-green-100 text-green-600" />
          <KpiCard title="Sắp hết hạn (<30 ngày)" value={kpiData.expiringSoonCount} icon={<ClockIcon />} colorClass="bg-yellow-100 text-yellow-600" />
          <KpiCard title="Đã thanh lý" value={kpiData.terminatedCount} icon={<ArchiveIcon />} colorClass="bg-gray-100 text-gray-600" />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, tiêu đề, khách hàng..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          />
          <CustomSelect
            options={statusOptions}
            value={statusFilter}
            onChange={value => { setStatusFilter(value as ContractStatus | ''); setCurrentPage(1); }}
            className="w-full md:w-auto md:min-w-48"
          />
          <DatePicker
            value={startDate}
            onChange={val => { setStartDate(val); setCurrentPage(1); }}
            className="w-full md:w-auto py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          />
          <DatePicker
            value={endDate}
            onChange={val => { setEndDate(val); setCurrentPage(1); }}
            className="w-full md:w-auto py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          />
           <button
                onClick={handleResetFilters}
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition text-sm"
            >
                Xóa lọc
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tiêu đề</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Giá trị</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Ngày ký</th>
                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Ngày hết hạn</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedContracts.length > 0 ? paginatedContracts.map(contract => {
                const now = new Date();
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(now.getDate() + 30);
                const isExpiringSoon = contract.status === ContractStatus.Active && contract.expiryDate && new Date(contract.expiryDate) > now && new Date(contract.expiryDate) <= thirtyDaysFromNow;

                return (
                <tr key={contract.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-normal">
                      <div className="flex items-center gap-2">
                        {isExpiringSoon && <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0" title="Sắp hết hạn"></span>}
                        <div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold">{contract.title}</p>
                            <p className="text-xs text-gray-500 font-mono">{contract.id}</p>
                        </div>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getCustomerName(contract.customerId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200">{contract.contractValue.toLocaleString('vi-VN')} VND</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(contract.signingDate).toLocaleDateString('vi-VN')}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{contract.expiryDate ? new Date(contract.expiryDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 inline-flex justify-center text-xs font-semibold rounded-full min-w-[120px] ${getStatusClass(contract.status)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button onClick={() => navigate(`/contracts/${contract.id}`)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition" title="Xem chi tiết">
                      <EyeIcon />
                    </button>
                  </td>
                </tr>
              )}) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Không có hợp đồng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredContracts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredContracts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  );
};

export default ContractListPage;
