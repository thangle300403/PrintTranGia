
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Invoice, PaymentMethod, BankAccount } from '../../types';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { InvoiceDetailModal } from '../../components/invoices/InvoiceDetailModal';
import { EyeIcon, CashFundIcon, BankIcon, DocumentTextIcon, CloseIcon, CheckCircleIcon } from '../../components/icons/Icons';
import Pagination from '../../components/Pagination';
import DatePicker from '../../components/DatePicker';
import CustomSelect from '../../components/CustomSelect';

enum InvoiceFilterStatus {
    Paid = 'Đã thanh toán',
    Unpaid = 'Chưa thanh toán',
    Overdue = 'Quá hạn',
}

const getInvoiceStatus = (invoice: Invoice): InvoiceFilterStatus => {
    const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = invoice.totalAmount - amountPaid;
    if (remaining <= 0) return InvoiceFilterStatus.Paid;
    if (new Date() > new Date(invoice.dueDate)) return InvoiceFilterStatus.Overdue;
    return InvoiceFilterStatus.Unpaid;
};


const PaymentModal: React.FC<{
  invoice: Invoice;
  onClose: () => void;
  onSave: (invoiceId: string, amount: number, method: PaymentMethod, bankAccountId?: string) => void;
  bankAccounts: BankAccount[];
}> = ({ invoice, onClose, onSave, bankAccounts }) => {
  const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = invoice.totalAmount - amountPaid;

  const [amount, setAmount] = useState<number | ''>(remaining);
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(bankAccounts[0]?.id || '');
  const [error, setError] = useState('');

  // Auto-fill amount when modal opens (handled by initial state, but good to ensure sync if props change)
  useEffect(() => {
      setAmount(remaining > 0 ? remaining : '');
  }, [remaining]);

  const handleSave = () => {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Số tiền phải là một số dương.');
      return;
    }
    if (numericAmount > remaining) {
      setError(`Số tiền không được vượt quá số còn lại (${remaining.toLocaleString('vi-VN')} VND).`);
      return;
    }
    if (method === PaymentMethod.BankTransfer && !selectedAccountId) {
        setError('Vui lòng chọn tài khoản ngân hàng.');
        return;
    }
    onSave(invoice.id, numericAmount, method, method === PaymentMethod.BankTransfer ? selectedAccountId : undefined);
    onClose();
  };

  const methodOptions = [
      { id: PaymentMethod.Cash, label: 'Tiền mặt', icon: <CashFundIcon className="w-6 h-6"/> },
      { id: PaymentMethod.BankTransfer, label: 'Chuyển khoản', icon: <BankIcon className="w-6 h-6"/> },
      { id: PaymentMethod.CreditDebt, label: 'Ghi nợ', icon: <DocumentTextIcon className="w-6 h-6"/> },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ghi nhận thanh toán</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700">
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="p-6 space-y-6">
            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Khách hàng</p>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-100">{invoice.customer.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Hóa đơn: {invoice.id}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Số tiền còn lại</p>
                    <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{remaining.toLocaleString('vi-VN')} đ</p>
                </div>
            </div>

            {/* Payment Method Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hình thức thanh toán</label>
                <div className="grid grid-cols-3 gap-3">
                    {methodOptions.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setMethod(opt.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                                method === opt.id 
                                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-300' 
                                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {opt.icon}
                            <span className="text-sm font-semibold mt-2">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Bank Account Selection (Conditional) */}
            {method === PaymentMethod.BankTransfer && (
                <div className="animate-fade-in-down">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tài khoản nhận tiền</label>
                    <select 
                        value={selectedAccountId} 
                        onChange={e => setSelectedAccountId(e.target.value)} 
                        className="w-full p-2.5 border border-gray-300 rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    >
                        {bankAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Amount Input */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số tiền thanh toán</label>
                    {amount !== remaining && (
                        <button 
                            type="button" 
                            onClick={() => { setAmount(remaining); setError(''); }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                            Thu hết ({remaining.toLocaleString('vi-VN')})
                        </button>
                    )}
                </div>
                <div className="relative">
                    <FormattedNumberInput
                        value={amount}
                        onChange={val => {
                            setAmount(val);
                            setError('');
                        }}
                        className="w-full pl-4 pr-12 py-3 text-xl font-bold text-right border border-gray-300 rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-gray-800 dark:text-white"
                        placeholder="0"
                        autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">VND</span>
                </div>
                {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="text-lg">•</span> {error}</p>}
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
            >
                Hủy bỏ
            </button>
            <button 
                type="button" 
                onClick={handleSave} 
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
            >
                <CheckCircleIcon className="w-5 h-5" />
                Xác nhận
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; colorClass: string }> = ({ title, value, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h4>
      <p className={`mt-1 text-2xl font-semibold ${colorClass}`}>{value}</p>
    </div>
);

const InvoiceListPage: React.FC = () => {
  const { invoices, recordPayment, currentUser, companyInfo } = useData();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceFilterStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const stats = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.payments.reduce((pSum, p) => pSum + p.amount, 0), 0);
    
    const totalOverdue = invoices.reduce((sum, inv) => {
        const amountPaid = inv.payments.reduce((pSum, p) => pSum + p.amount, 0);
        const remaining = inv.totalAmount - amountPaid;
        const isOverdue = remaining > 0 && new Date() > new Date(inv.dueDate);
        return sum + (isOverdue ? remaining : 0);
    }, 0);

    return { totalInvoiced, totalPaid, totalOverdue };
  }, [invoices]);

  const fullyFilteredInvoices = useMemo(() => {
    return invoices
        .map(inv => ({ ...inv, derivedStatus: getInvoiceStatus(inv) }))
        .filter(inv => {
            if (statusFilter && inv.derivedStatus !== statusFilter) return false;
            
            const invoiceDate = new Date(inv.invoiceDate);
            if (startDate && invoiceDate < new Date(startDate)) return false;
            if (endDate) {
                const filterEndDate = new Date(endDate);
                filterEndDate.setHours(23, 59, 59, 999);
                if (invoiceDate > filterEndDate) return false;
            }

            if (searchTerm) {
                const lowerSearch = searchTerm.toLowerCase();
                return inv.id.toLowerCase().includes(lowerSearch) ||
                       inv.customer.name.toLowerCase().includes(lowerSearch) ||
                       inv.orderId.toLowerCase().includes(lowerSearch);
            }
            return true;
        })
        .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  }, [invoices, searchTerm, statusFilter, startDate, endDate]);

  const paginatedInvoices = useMemo(() => {
    return fullyFilteredInvoices.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [fullyFilteredInvoices, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleRecordPayment = (invoiceId: string, amount: number, method: PaymentMethod, bankAccountId?: string) => {
    if (!currentUser) {
        alert("Lỗi: Không tìm thấy người dùng hiện tại để ghi nhận thanh toán.");
        return;
    }
    recordPayment(invoiceId, { amount, method, bankAccountId, recordedByUserId: currentUser.id });
  };
  
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    ...Object.values(InvoiceFilterStatus).map(status => ({ value: status, label: status }))
  ];

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hóa đơn & Công nợ</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Tổng giá trị hóa đơn" value={stats.totalInvoiced.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} colorClass="text-gray-900 dark:text-white" />
            <StatCard title="Tổng đã thanh toán" value={stats.totalPaid.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} colorClass="text-green-600 dark:text-green-400" />
            <StatCard title="Công nợ Quá hạn" value={stats.totalOverdue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} colorClass="text-red-600 dark:text-red-400" />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-4">
                <input
                    type="text"
                    placeholder="Tìm theo Mã HĐ, Mã ĐH, Tên khách..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                <CustomSelect
                    options={statusOptions}
                    value={statusFilter}
                    onChange={value => { setStatusFilter(value as InvoiceFilterStatus | ''); setCurrentPage(1); }}
                    className="w-full md:w-auto md:min-w-48"
                />
                <DatePicker value={startDate} onChange={val => { setStartDate(val); setCurrentPage(1); }} className="w-full md:w-auto py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                <DatePicker value={endDate} onChange={val => { setEndDate(val); setCurrentPage(1); }} className="w-full md:w-auto py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                <button onClick={handleResetFilters} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-1.5 rounded-lg font-semibold text-sm">Xóa lọc</button>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hóa đơn</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Khách hàng</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Ngày đáo hạn</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase w-1/3">Tình trạng thanh toán</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedInvoices.length > 0 ? paginatedInvoices.map(invoice => {
                  const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
                  const remaining = invoice.totalAmount - amountPaid;
                  const paidPercentage = invoice.totalAmount > 0 ? (amountPaid / invoice.totalAmount) * 100 : 100;
                  const isOverdue = remaining > 0 && new Date() > new Date(invoice.dueDate);
                  const hasCreditPayment = invoice.payments.some(p => p.method === PaymentMethod.CreditDebt);

                  return (
                    <tr key={invoice.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.id}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.totalAmount.toLocaleString('vi-VN')} VND</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{invoice.customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={isOverdue ? 'text-red-600 font-bold dark:text-red-400' : 'text-gray-500 dark:text-gray-300'}>
                          {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                         {isOverdue && <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Quá hạn</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {remaining <= 0 ? (
                            hasCreditPayment ? (
                                <span className="px-2.5 py-1 inline-flex justify-center text-xs font-semibold rounded-full min-w-[120px] bg-orange-100 text-orange-800 border border-orange-200">
                                    Ghi nợ
                                </span>
                            ) : (
                                <span className="px-2.5 py-1 inline-flex justify-center text-xs font-semibold rounded-full min-w-[120px] bg-green-100 text-green-800">
                                    Đã thanh toán
                                </span>
                            )
                        ) : (
                            <div className="w-full">
                                <div className="flex justify-between mb-1 text-sm">
                                    <span className="font-medium text-green-700 dark:text-green-400">{amountPaid.toLocaleString('vi-VN')}</span>
                                    <span className="font-medium text-gray-500 dark:text-gray-400">{invoice.totalAmount.toLocaleString('vi-VN')}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                                    <div className="bg-green-600 h-2 rounded-full" style={{width: `${paidPercentage}%`}}></div>
                                </div>
                            </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        <button onClick={() => setViewingInvoiceId(invoice.id)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full" title="Xem chi tiết">
                            <EyeIcon />
                        </button>
                        {remaining > 0 && (
                          <button onClick={() => setSelectedInvoice(invoice)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                            Thu tiền
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">Không có hóa đơn nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {fullyFilteredInvoices.length > 0 && (
            <Pagination
                currentPage={currentPage}
                totalItems={fullyFilteredInvoices.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
            />
        )}
        </div>
      </div>
      {selectedInvoice && (
        <PaymentModal 
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onSave={handleRecordPayment}
            bankAccounts={companyInfo.bankAccounts}
        />
      )}
      {viewingInvoiceId && (
        <InvoiceDetailModal invoiceId={viewingInvoiceId} onClose={() => setViewingInvoiceId(null)} />
      )}
    </>
  );
};

export default InvoiceListPage;
