
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { OrderStatus, PaymentMethod, ZnsTemplateType, ProductionOrder } from '../../types';
import type { Order, BankAccount } from '../../types';
import { ChevronDownIcon, PrinterIcon, ZaloIcon } from '../../components/icons/Icons';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import Pagination from '../../components/Pagination';
import DatePicker from '../../components/DatePicker';
import CustomSelect from '../../components/CustomSelect';
import { ProductionOrderDetailModal } from '../../components/production/ProductionOrderDetailModal';
import { SendZnsModal } from '../../components/orders/SendZnsModal';
import { ProductionOrderModal } from '../../components/production/ProductionOrderModal';

const getStatusClass = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Delivered:
    case OrderStatus.Paid: 
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case OrderStatus.Shipped:
    case OrderStatus.PartialPayment: 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case OrderStatus.Cancelled:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default: 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  }
};

const QrPaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    bankAccount?: BankAccount;
    orderId: string;
}> = ({ isOpen, onClose, amount, bankAccount, orderId }) => {
    const { companyInfo } = useData();
    const printRef = useRef<HTMLDivElement>(null);
    
    if (!isOpen || !bankAccount || amount <= 0) return null;
    
    const finalContent = (companyInfo.bankTransferContentTemplate || 'Thanh toan {orderId}').replace('{orderId}', orderId);
    const qrDescription = finalContent.replace(/[^a-zA-Z0-9-_\s]/g, '').slice(0, 99);
    const qrImageUrl = `https://img.vietqr.io/image/${bankAccount.bin}-${bankAccount.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(qrDescription)}&accountName=${encodeURIComponent(bankAccount.accountHolder)}`;

    const formattedDateTime = new Date().toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    }).replace(',', '');

    const handlePrint = () => {
        const printContent = printRef.current?.innerHTML;
        if (printContent) {
            const newWindow = window.open('', '', 'height=600,width=800');
            newWindow?.document.write('<html><head><title>In mã QR Thanh toán</title>');
            newWindow?.document.write('<style>body { font-family: sans-serif; text-align: center; } img { max-width: 250px; margin: 15px auto; } .confirmation-box { margin-top: 15px; padding: 10px; border: 1px solid #eee; border-radius: 8px; text-align: left; max-width: 280px; margin-left: auto; margin-right: auto; font-size: 12px; } .space-y-2 > * + * { margin-top: 0.5rem; } .flex { display: flex; justify-content: space-between; align-items: start; } .items-center { align-items: center; } .text-lg { font-size: 1.125rem; } .text-sm { font-size: 0.875rem; } .font-extrabold { font-weight: 800; } .font-semibold { font-weight: 600; } .mt-1 { margin-top: 0.25rem; } .pt-2 { padding-top: 0.5rem; } .border-t { border-top: 1px solid #eee; } .text-right { text-align: right; } .flex-shrink-0 { flex-shrink: 0; } .mr-2 { margin-right: 0.5rem; } .font-mono { font-family: monospace; } .break-all { word-break: break-all; } .break-words { word-wrap: break-word; }</style>');
            newWindow?.document.write('</head><body>');
            newWindow?.document.write(printContent);
            newWindow?.document.write('</body></html>');
            newWindow?.document.close();
            newWindow?.focus();
            newWindow?.print();
            newWindow?.close();
        }
    };
    
    return (
         <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex justify-center items-center z-[60] p-4 transition-opacity">
            <div className="bg-[var(--white)] dark:bg-[var(--gray-800)] p-8 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
                <div ref={printRef}>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-[var(--gray-900)] dark:text-[var(--white)]">Quét để thanh toán</h3>
                        <p className="text-base text-[var(--gray-600)] dark:text-[var(--gray-400)] mt-2">Sử dụng ứng dụng ngân hàng của bạn</p>
                        <p className="text-sm text-[var(--gray-500)] dark:text-[var(--gray-400)] mt-1 mb-8">{formattedDateTime}</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* QR Image Column */}
                        <div className="w-full md:w-1/2 flex justify-center flex-shrink-0">
                           <div className="p-4 bg-white rounded-xl border-2 border-gray-200 shadow-xl">
                                <img src={qrImageUrl} alt="Mã QR thanh toán" className="rounded-lg max-w-[250px] w-full" />
                           </div>
                        </div>
                        
                        {/* Details Column */}
                        <div className="w-full md:w-1/2 flex-1">
                            <div className="text-left bg-[var(--gray-50)] dark:bg-[var(--gray-700)]/50 p-5 rounded-xl border-2 border-gray-200 dark:border-[var(--gray-600)] space-y-3 text-sm h-full flex flex-col justify-center shadow-xl">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-[var(--gray-600)] dark:text-[var(--gray-300)]">Số tiền:</span>
                                    <span className="text-[var(--brand-color-1)] dark:text-[var(--blue-400)] font-extrabold">{amount.toLocaleString('vi-VN')} VND</span>
                                </div>
                                
                                <div className="text-base space-y-2 pt-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[var(--gray-600)] dark:text-[var(--gray-300)] flex-shrink-0 mr-2">Ngân hàng:</span>
                                        <span className="font-semibold text-[var(--gray-800)] dark:text-[var(--gray-200)] text-right">{bankAccount.bankName}</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-[var(--gray-600)] dark:text-[var(--gray-300)] flex-shrink-0 mr-2">Số tài khoản:</span>
                                        <span className="font-semibold text-[var(--gray-800)] dark:text-[var(--gray-200)] text-right">{bankAccount.accountNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-[var(--gray-600)] dark:text-[var(--gray-300)] flex-shrink-0 mr-2">Chủ tài khoản:</span>
                                        <span className="font-semibold text-[var(--gray-800)] dark:text-[var(--gray-200)] text-right break-words">{bankAccount.accountHolder}</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-start text-sm pt-3 border-t dark:border-gray-600">
                                    <span className="text-[var(--gray-600)] dark:text-[var(--gray-300)] flex-shrink-0 mr-2">Nội dung:</span>
                                    <span className="font-mono text-[var(--gray-800)] dark:text-[var(--gray-200)] text-right break-all">{qrDescription}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-sm text-center text-[var(--gray-500)] dark:text-[var(--gray-400)] mt-8 italic">
                        Lưu ý: Vui lòng kiểm tra lại thông tin và nội dung chuyển khoản trước khi xác nhận.
                    </p>
                </div>
                 <div className="mt-8 flex justify-center space-x-4">
                    <button type="button" onClick={onClose} className="px-8 py-2.5 text-base font-semibold rounded-lg bg-[var(--gray-200)] dark:bg-[var(--gray-600)] text-[var(--gray-800)] dark:text-[var(--gray-200)] hover:bg-[var(--gray-300)] dark:hover:bg-[var(--gray-500)] transition">Đóng</button>
                    <button type="button" onClick={handlePrint} className="px-8 py-2.5 text-base font-semibold text-white bg-[var(--brand-color-1)] rounded-lg hover:bg-[var(--blue-700)] transition shadow-sm">In</button>
                </div>
            </div>
        </div>
    );
};

const PaymentModal: React.FC<{
    order: Order | null;
    onClose: () => void;
    onSave: (orderId: string, amount: number, method: PaymentMethod, bankAccountId?: string) => void;
    bankAccounts: BankAccount[];
}> = ({ order, onClose, onSave, bankAccounts }) => {
    
    const { invoices } = useData();
    const invoice = order ? invoices.find(inv => inv.orderId === order.id) : null;
    const amountPaid = invoice?.payments.reduce((sum, p) => sum + p.amount, 0) || 0;
    const remaining = order ? order.totalAmount - amountPaid : 0;
    
    const [amount, setAmount] = useState<number | ''>(remaining);
    const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(bankAccounts[0]?.id || '');
    const [error, setError] = useState('');
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    useEffect(() => {
        if (order) {
            const newRemaining = order.totalAmount - amountPaid;
            setAmount(newRemaining > 0 ? newRemaining : '');
            setError('');
            if (bankAccounts.length === 0) {
                setMethod(PaymentMethod.Cash);
            }
        }
    }, [order, amountPaid, bankAccounts]);
    
    if (!order) return null;

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
        if (method === PaymentMethod.BankTransfer && (!selectedAccountId || bankAccounts.length === 0)) {
            setError('Vui lòng chọn tài khoản ngân hàng. Nếu chưa có, bạn có thể thêm ở mục Thiết lập > Thông tin công ty.');
            return;
        }
        onSave(order.id, numericAmount, method, method === PaymentMethod.BankTransfer ? selectedAccountId : undefined);
    };

    const selectedBank = bankAccounts.find(acc => acc.id === selectedAccountId);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Thu tiền cho Đơn hàng #{order.id}</h3>
                    <div className="space-y-4">
                        <p><span className="font-semibold">Khách hàng:</span> {order.customer.name}</p>
                        <p><span className="font-semibold">Số tiền còn lại:</span> <span className="text-red-600 font-bold">{remaining.toLocaleString('vi-VN')} VND</span></p>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phương thức thanh toán</label>
                            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                <option value={PaymentMethod.Cash}>Tiền mặt</option>
                                <option value={PaymentMethod.BankTransfer} disabled={bankAccounts.length === 0}>
                                    Chuyển khoản {bankAccounts.length === 0 && '(Chưa có TK)'}
                                </option>
                            </select>
                        </div>

                        {method === PaymentMethod.BankTransfer && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tài khoản thu</label>
                                <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                    {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountNumber} - {acc.bankName}</option>)}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số tiền thanh toán</label>
                            <FormattedNumberInput
                                value={amount}
                                onChange={(val) => { setAmount(val); setError(''); }}
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                placeholder="Nhập số tiền"
                                autoFocus
                            />
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => setIsQrModalOpen(true)}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={method !== PaymentMethod.BankTransfer || !Number(amount) || Number(amount) <= 0}
                        >
                            In mã QR
                        </button>
                        <div className="flex space-x-2">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
                            <button type="button" onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">Xác nhận</button>
                        </div>
                    </div>
                </div>
            </div>
            <QrPaymentModal 
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                amount={Number(amount)}
                bankAccount={selectedBank}
                orderId={order.id}
            />
        </>
    );
};


const OrderListPage: React.FC = () => {
  const { orders, invoices, createInvoiceForOrder, recordPayment, currentUser, productionOrders, updateOrderStatus, znsTemplates, addProductionOrder, companyInfo } = useData();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderToPay, setOrderToPay] = useState<Order | null>(null);
  const [manualZnsOrder, setManualZnsOrder] = useState<Order | null>(null);
  const [statusChangeModalInfo, setStatusChangeModalInfo] = useState<{ order: Order; newStatus: OrderStatus; templateType: ZnsTemplateType } | null>(null);
  
  // Quick Create LSX State
  const [isCreateLSXOpen, setIsCreateLSXOpen] = useState(false);
  const [createLSXData, setCreateLSXData] = useState<Partial<ProductionOrder> | null>(null);

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewingLSXId, setViewingLSXId] = useState<string | null>(null);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const fullyFilteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        if (debouncedSearchTerm) {
          const lowerSearch = debouncedSearchTerm.toLowerCase();
          if (!order.id.toLowerCase().includes(lowerSearch) && !order.customer.name.toLowerCase().includes(lowerSearch)) {
            return false;
          }
        }
        if (statusFilter && order.status !== statusFilter) return false;
        
        const orderDate = new Date(order.orderDate);
        if (startDate && orderDate < new Date(startDate)) return false;
        if (endDate) {
            const filterEndDate = new Date(endDate);
            filterEndDate.setHours(23, 59, 59, 999);
            if (orderDate > filterEndDate) return false;
        }
        return true;
      })
      .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
  }, [orders, debouncedSearchTerm, statusFilter, startDate, endDate]);

  const paginatedOrders = useMemo(() => {
    return fullyFilteredOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [fullyFilteredOrders, currentPage, itemsPerPage]);
  
  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };


  const handleOpenPaymentModal = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setOrderToPay(order);
  };
  
  const handleSavePayment = (orderId: string, amount: number, method: PaymentMethod, bankAccountId?: string) => {
    if (!currentUser) {
        alert("Lỗi: Không tìm thấy người dùng hiện tại.");
        return;
    }
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert("Lỗi: Không tìm thấy đơn hàng.");
        return;
    }

    const invoice = createInvoiceForOrder(order);
    if (!invoice) {
        alert("Lỗi: Không thể tạo hóa đơn cho đơn hàng này.");
        return;
    }

    recordPayment(invoice.id, {
        amount,
        method,
        bankAccountId,
        recordedByUserId: currentUser.id,
    });
    setOrderToPay(null);
  };

  const statusToTemplateTypeMap: Partial<Record<OrderStatus, ZnsTemplateType>> = {
    [OrderStatus.PartialPayment]: 'OrderConfirmation',
    [OrderStatus.Paid]: 'OrderConfirmation',
    [OrderStatus.Shipped]: 'ShippingUpdate',
  };

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
      const templateType = statusToTemplateTypeMap[newStatus];
      const templateExists = templateType && znsTemplates.some(t => t.type === templateType);

      if (templateType && templateExists) {
          setStatusChangeModalInfo({ order, newStatus, templateType });
      } else {
          updateOrderStatus(order.id, newStatus);
      }
  };


  const handleToggleExpand = (orderId: string) => {
    setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  };
  
  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    ...Object.values(OrderStatus).map(status => ({ value: status, label: status }))
  ];


  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danh sách Đơn hàng</h1>
        <button
          onClick={() => navigate('/pos')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + Tạo Đơn hàng mới
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <input
                id="search"
                type="text"
                placeholder="Tìm theo mã ĐH hoặc tên khách..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); }}
                className="w-full md:w-80 py-1.5 px-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
            <CustomSelect
                options={statusOptions}
                value={statusFilter}
                onChange={value => { setStatusFilter(value as OrderStatus | ''); setCurrentPage(1); }}
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"></th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Mã Đơn hàng</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Khách hàng</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Người nhận</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Ngày đặt</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tổng tiền</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Đã thanh toán</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Còn lại</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOrders.length > 0 ? paginatedOrders.map(order => {
                const invoice = invoices.find(inv => inv.orderId === order.id);
                const amountPaid = invoice?.payments.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
                const remaining = order.totalAmount - amountPaid;
                const remainingColor = remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200';
                
                return (
                <React.Fragment key={order.id}>
                  <tr onClick={() => handleToggleExpand(order.id)} className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order.id}/edit`);
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-semibold hover:underline"
                        title={`Sửa đơn hàng ${order.id}`}
                      >
                        {order.id}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.delivery?.recipientName || '---'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.orderDate.toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200">{order.totalAmount.toLocaleString('vi-VN')} VND</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">{amountPaid.toLocaleString('vi-VN')} VND</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${remainingColor}`}>{remaining.toLocaleString('vi-VN')} VND</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-2.5 py-1 text-xs leading-5 font-semibold rounded-full border-transparent focus:ring-0 focus:outline-none appearance-none cursor-pointer min-w-[120px] text-center ${getStatusClass(order.status)}`}
                      >
                          {Object.values(OrderStatus).map(status => (
                              <option key={status} value={status}>{status}</option>
                          ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
                        <button onClick={(e) => {e.stopPropagation(); setManualZnsOrder(order); }} className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50" title="Gửi Zalo ZNS">
                            <ZaloIcon />
                        </button>
                        <button onClick={(e) => handleOpenPaymentModal(e, order)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-semibold">
                            Thu tiền
                        </button>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                     <tr>
                        <td colSpan={10} className="p-0 bg-gray-50 dark:bg-gray-800/50">
                            <div className="p-4 mx-4 my-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 bg-white dark:bg-gray-900/70 p-4 rounded-lg shadow-inner">
                                    <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Chi tiết Sản phẩm:</h4>
                                    <table className="min-w-full">
                                        <thead className="border-b-2 border-gray-200 dark:border-gray-600">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Sản phẩm</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">SL</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Thành tiền</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {order.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                                                        <p>{item.product.name}</p>
                                                        {item.note && <p className="text-xs italic text-gray-500">Ghi chú: {item.note}</p>}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-center text-gray-600 dark:text-gray-300">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-sm text-right font-semibold text-gray-800 dark:text-gray-200">{item.totalPrice.toLocaleString('vi-VN')}</td>
                                                     <td className="px-4 py-2 text-right">
                                                        {(() => {
                                                            const relatedLSX = productionOrders.find(po => po.orderId === order.id && po.productName === item.product.name);
                                                            if (relatedLSX) {
                                                                return (
                                                                    <button 
                                                                        onClick={() => setViewingLSXId(relatedLSX.id)}
                                                                        className="text-xs bg-white border border-blue-300 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition flex items-center gap-1 ml-auto"
                                                                        title="Xem và In Lệnh sản xuất"
                                                                    >
                                                                        <PrinterIcon className="w-3 h-3" /> Xem LSX
                                                                    </button>
                                                                );
                                                            }
                                                            return (
                                                                <button 
                                                                    onClick={() => {
                                                                        setCreateLSXData({
                                                                            orderId: order.id,
                                                                            salespersonId: currentUser?.id,
                                                                            productName: item.product.name,
                                                                            quantity: item.quantity,
                                                                            unit: item.unit,
                                                                            notes: item.note, // Pass note to LSX
                                                                            ...(item.parsedDetails || {})
                                                                        });
                                                                        setIsCreateLSXOpen(true);
                                                                    }}
                                                                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                                                                >
                                                                    Tạo LSX
                                                                </button>
                                                            );
                                                        })()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-white dark:bg-gray-900/70 p-4 rounded-lg shadow-inner">
                                    <h4 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">Tóm tắt tài chính</h4>
                                    
                                    {(() => {
                                        const invoice = invoices.find(inv => inv.orderId === order.id);
                                        const amountPaid = invoice?.payments.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
                                        const remaining = order.totalAmount - amountPaid;
                                        
                                        const vat = order.vatAmount ?? (order.totalAmount - (order.totalAmount / (1 + (companyInfo.vatRate || 0) / 100)));
                                        const subTotal = order.totalAmount - vat;

                                        const remainingColor = remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

                                        return (
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-300">Tiền hàng (chưa VAT):</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-100">{Math.round(subTotal).toLocaleString('vi-VN')} đ</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-300">Tiền VAT:</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-100">{Math.round(vat).toLocaleString('vi-VN')} đ</span>
                                                </div>
                                                 <div className="flex justify-between pt-2 border-t dark:border-gray-600">
                                                    <span className="text-gray-600 dark:text-gray-300">Tổng cộng:</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">{order.totalAmount.toLocaleString('vi-VN')} đ</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-300">Đã thanh toán:</span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">{amountPaid.toLocaleString('vi-VN')} đ</span>
                                                </div>
                                                 <div className="flex justify-between text-base pt-2 border-t dark:border-gray-600">
                                                    <span className="font-bold text-gray-800 dark:text-gray-100">Còn lại:</span>
                                                    <span className={`font-bold ${remainingColor}`}>{remaining.toLocaleString('vi-VN')} đ</span>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>
                        </td>
                    </tr>
                  )}
                </React.Fragment>
                )
              }) : (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Không tìm thấy đơn hàng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {fullyFilteredOrders.length > 0 && (
            <Pagination
                currentPage={currentPage}
                totalItems={fullyFilteredOrders.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
            />
        )}
      </div>
    </div>
    {orderToPay && (
        <PaymentModal
            order={orderToPay}
            onClose={() => setOrderToPay(null)}
            onSave={handleSavePayment}
            bankAccounts={companyInfo.bankAccounts}
        />
    )}
    {statusChangeModalInfo && (
        <SendZnsModal
            order={statusChangeModalInfo.order}
            onClose={() => setStatusChangeModalInfo(null)}
            preselectedTemplateType={statusChangeModalInfo.templateType}
            onConfirmAndSend={() => {
                updateOrderStatus(statusChangeModalInfo.order.id, statusChangeModalInfo.newStatus);
            }}
            onConfirmWithoutSend={() => {
                updateOrderStatus(statusChangeModalInfo.order.id, statusChangeModalInfo.newStatus);
                setStatusChangeModalInfo(null);
            }}
        />
    )}
     {manualZnsOrder && (
        <SendZnsModal order={manualZnsOrder} onClose={() => setManualZnsOrder(null)} />
    )}
    {viewingLSXId && (
        <ProductionOrderDetailModal orderId={viewingLSXId} onClose={() => setViewingLSXId(null)} />
    )}
    <ProductionOrderModal
        isOpen={isCreateLSXOpen}
        order={null}
        prefillData={createLSXData}
        onClose={() => setIsCreateLSXOpen(false)}
        onSave={(data) => {
            addProductionOrder(data);
            setIsCreateLSXOpen(false);
            // Optionally show toast for success
        }}
    />
    </>
  );
};

export default OrderListPage;
