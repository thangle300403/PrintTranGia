import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { QuoteStatus, QuoteItem, PaymentMethod, BankAccount } from '../../types';
import FormattedNumberInput from '../FormattedNumberInput';
import { PrinterIcon, EnvelopeIcon } from '../icons/Icons';

const getStatusClass = (status: QuoteStatus) => {
  switch (status) {
    case 'Đã chốt': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Đã hủy': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'Đã gửi': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'Chờ duyệt': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  }
};

const PaymentModal: React.FC<{
    onClose: () => void;
    onSave: (amount: number, method: PaymentMethod, bankAccountId?: string) => void;
    remainingAmount: number;
    bankAccounts: BankAccount[];
}> = ({ onClose, onSave, remainingAmount, bankAccounts }) => {
    const [amount, setAmount] = useState<number | ''>(remainingAmount > 0 ? remainingAmount : '');
    const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(bankAccounts[0]?.id || '');
    const [error, setError] = useState('');
    
    const handleSave = () => {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Số tiền phải là một số dương.');
            return;
        }
        if (numericAmount > remainingAmount) {
            setError(`Số tiền không được vượt quá số còn lại (${remainingAmount.toLocaleString('vi-VN')} VND).`);
            return;
        }
        onSave(numericAmount, method, method === PaymentMethod.BankTransfer ? selectedAccountId : undefined);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Nhận đặt cọc cho Báo giá</h3>
                <div className="space-y-4">
                    <p><span className="font-semibold">Số tiền cần thanh toán:</span> <span className="text-red-600 font-bold">{remainingAmount.toLocaleString('vi-VN')} VND</span></p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phương thức thanh toán</label>
                        <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                            <option value={PaymentMethod.Cash}>Tiền mặt</option>
                            <option value={PaymentMethod.BankTransfer}>Chuyển khoản</option>
                        </select>
                    </div>

                    {method === PaymentMethod.BankTransfer && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tài khoản nhận</label>
                            <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountNumber} - {acc.bankName}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số tiền đặt cọc</label>
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
                <div className="mt-6 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
                    <button type="button" onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">Xác nhận</button>
                </div>
            </div>
        </div>
    );
};

export const QuoteDetailModal: React.FC<{ quoteId: string, onClose: () => void }> = ({ quoteId, onClose }) => {
  const navigate = useNavigate();
  const { getQuoteById, updateQuoteStatus, addOrderFromQuote, currentUser, addQuote, companyInfo, recordPaymentForQuote, rolePermissions, materialGroups, printMethodGroups, printPriceConfigurations, printTemplates } = useData();
  const quote = getQuoteById(quoteId);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const canUpdateStatus = useMemo(() => {
    if (!currentUser) return false;
    const userPermissions = rolePermissions[currentUser.roleId] || [];
    return userPermissions.includes('approve_quotes');
  }, [currentUser, rolePermissions]);

  const canManageOrders = useMemo(() => {
    if (!currentUser) return false;
    const userPermissions = rolePermissions[currentUser.roleId] || [];
    return userPermissions.includes('manage_orders');
  }, [currentUser, rolePermissions]);

  const readMoney = (amount: number): string => {
      if (amount === 0) return "Không đồng";
      const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
      const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
      let s = "";
      let groups = [];
      let temp = Math.abs(Math.round(amount));
      while (temp > 0) {
          groups.push(temp % 1000);
          temp = Math.floor(temp / 1000);
      }
      for (let i = groups.length - 1; i >= 0; i--) {
          const g = groups[i];
          const isHighest = i === groups.length - 1;
          
          if (g === 0) continue;

          // Read "không trăm" if it is not the highest group
          const readZeroHundred = !isHighest;
          
          let res = "";
          const h = Math.floor(g / 100);
          const t = Math.floor((g % 100) / 10);
          const o = g % 10;
          if (h > 0 || readZeroHundred) res += digits[h] + " trăm ";
          if (t === 0 && o > 0 && (h > 0 || readZeroHundred)) res += "lẻ ";
          else if (t === 1) res += "mười ";
          else if (t > 1) res += digits[t] + " mươi ";
          if (t > 0 && o === 1 && t !== 1) res += "mốt";
          else if (t > 0 && o === 5) res += "lăm";
          else if (o > 0) res += digits[o];
          res = res.trim();
          if (res) s += res + " " + units[i] + " ";
      }
      s = s.trim();
      if (!s) return "Không đồng";
      return s.charAt(0).toUpperCase() + s.slice(1) + " đồng";
  };

  const renderItemDetails = (item: QuoteItem) => {
      const details: string[] = [];
      const materialName = item.material?.name || '';
      if(materialName) details.push(`Vật liệu: ${materialName}`);
      
      const printConfig = printPriceConfigurations.find(c => c.id === item.printPriceConfigurationId);
      if (printConfig) {
        const printGroup = printMethodGroups.find(g => g.id === printConfig.groupId);
        details.push(`In: ${printGroup?.name || ''} - ${printConfig.name} - ${printConfig.numColors} màu`);
      }

      if (item.details?.gsm) details.push(`Định lượng: ${item.details.gsm} gsm`);
      if (item.details?.size) details.push(`Kích thước: ${item.details.size}`);
      if (item.details?.pages) details.push(`Số trang: ${item.details.pages}`);
      if (item.details?.resolution) details.push(`Chất lượng: ${item.details.resolution}`);
      if (item.processes && item.processes.length > 0) details.push(`Gia công: ${item.processes.map(p => p.name).join(', ')}`);
      return details.join(' / ');
  }

  if (!quote) {
    return null;
  }
  
  const vat = quote.vatAmount ?? (quote.totalAmount - (quote.totalAmount / (1 + (companyInfo.vatRate || 0) / 100)));
  const subTotal = quote.totalAmount - vat;
  const amountPaid = quote.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const remaining = quote.totalAmount - amountPaid;

  const handleCreateOrder = () => {
    if(!quote) return;
    const order = addOrderFromQuote(quote.id);
    if (order) {
        updateQuoteStatus(quote.id, QuoteStatus.Approved);
        onClose();
        navigate('/orders');
    }
  };

  const handleCancel = () => {
      if(!quote) return;
      if (window.confirm('Bạn có chắc chắn muốn hủy báo giá này không? Hành động này không thể hoàn tác.')) {
        updateQuoteStatus(quote.id, QuoteStatus.Cancelled);
        onClose();
      }
  }
  
  const handleSendForApproval = () => {
    if (!quote) return;
    updateQuoteStatus(quote.id, QuoteStatus.PendingApproval);
  };

  const handleRequestEdit = () => {
    if (!quote) return;
    updateQuoteStatus(quote.id, QuoteStatus.Draft);
  };

  const handleDuplicate = () => {
    if (!quote) return;
    const { customer, items, totalAmount, vatAmount } = quote;
    const newQuote = addQuote({ customer, items, totalAmount, vatAmount });
    onClose();
    navigate(`/quotes/${newQuote.id}/edit`);
    alert('Báo giá đã được nhân bản thành công. Bạn đang ở màn hình chỉnh sửa bản sao.');
  };
  
  const handleRecordPayment = (amount: number, method: PaymentMethod, bankAccountId?: string) => {
    if (!quote || !currentUser) return;
    recordPaymentForQuote(quote.id, {
        amount,
        method,
        bankAccountId,
        recordedByUserId: currentUser.id,
    });
    setIsPaymentModalOpen(false);
  };

  const handlePrint = () => {
    if (!quote) return;

    const template = printTemplates.find(t => t.type === 'Quote' && t.isActive);
    
    if (template) {
        let html = template.content;

        const itemsRows = quote.items.map((item, index) => `
            <tr>
                <td style="text-align: center; padding: 6px; border: 1px solid #000;">${index + 1}</td>
                <td style="padding: 6px; border: 1px solid #000;">
                    <b>${item.productName}</b><br/>
                    <i style="font-size: 11px;">${renderItemDetails(item)}</i>
                </td>
                <td style="text-align: center; padding: 6px; border: 1px solid #000;">${item.material?.costingUnit || 'cái'}</td>
                <td style="text-align: center; padding: 6px; border: 1px solid #000;">${item.quantity}</td>
                <td style="text-align: right; padding: 6px; border: 1px solid #000;">${(item.totalPrice / item.quantity).toLocaleString('vi-VN')}</td>
                <td style="text-align: right; padding: 6px; border: 1px solid #000;">${item.totalPrice.toLocaleString('vi-VN')}</td>
            </tr>
        `).join('');

        const replacements: Record<string, string> = {
            '{companyName}': companyInfo.name,
            '{companyAddress}': companyInfo.address,
            '{companyPhone}': companyInfo.phone,
            '{companyEmail}': companyInfo.email,
            '{logo}': companyInfo.logoUrl,
            '{orderId}': quote.id,
            '{orderDate}': quote.createdAt.toLocaleDateString('vi-VN'),
            '{expiryDate}': quote.expiryDate ? quote.expiryDate.toLocaleDateString('vi-VN') : '15 ngày kể từ ngày báo giá',
            '{customerId}': quote.customer.id,
            '{customerName}': quote.customer.name,
            '{customerPhone}': quote.customer.phone,
            '{customerAddress}': quote.customer.address ? `${quote.customer.address.street}, ${quote.customer.address.ward}, ${quote.customer.address.district}, ${quote.customer.address.province}` : '',
            '{subTotal}': Math.round(subTotal).toLocaleString('vi-VN'),
            '{vatRate}': String(companyInfo.vatRate || 0),
            '{vatAmount}': Math.round(vat).toLocaleString('vi-VN'),
            '{totalAmount}': quote.totalAmount.toLocaleString('vi-VN'),
            '{depositAmount}': amountPaid.toLocaleString('vi-VN'),
            '{remainingAmount}': remaining.toLocaleString('vi-VN'),
            '{amountInWords}': readMoney(quote.totalAmount),
            '{itemsTableRows}': itemsRows,
            '{title}': 'BẢNG BÁO GIÁ'
        };

        Object.entries(replacements).forEach(([key, value]) => {
            html = html.split(key).join(value || '');
        });

        const newWindow = window.open('', '', 'height=800,width=1000');
        if (newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
            newWindow.focus();
            setTimeout(() => {
                newWindow.print();
                newWindow.close();
            }, 500);
        }
    } else {
        window.print();
    }
  };

  const handleSendEmail = () => {
    if (!quote) return;
    const subject = `Báo giá ${quote.id} - ${companyInfo.name}`;
    const body = `Kính gửi ${quote.customer.name},\n\nChúng tôi xin gửi báo giá cho các dịch vụ/sản phẩm quý khách đã yêu cầu.\n\nTổng cộng: ${quote.totalAmount.toLocaleString('vi-VN')} VND\n\nTrân trọng,\n${companyInfo.name}`;
    window.location.href = `mailto:${quote.customer.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chi tiết Báo giá: {quote.id}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(quote.status)}`}>
              {quote.status}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-3">Thông tin khách hàng</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><span className="font-medium text-gray-900 dark:text-white">Tên:</span> {quote.customer.name}</p>
                <p><span className="font-medium text-gray-900 dark:text-white">Điện thoại:</span> {quote.customer.phone}</p>
                {quote.customer.email && <p><span className="font-medium text-gray-900 dark:text-white">Email:</span> {quote.customer.email}</p>}
                {quote.customer.address && (
                  <p><span className="font-medium text-gray-900 dark:text-white">Địa chỉ:</span> {`${quote.customer.address.street || ''}, ${quote.customer.address.ward || ''}, ${quote.customer.address.district || ''}, ${quote.customer.address.province || ''}`}</p>
                )}
              </div>
            </div>

            {/* Quote Info */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-3">Thông tin báo giá</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><span className="font-medium text-gray-900 dark:text-white">Ngày tạo:</span> {quote.createdAt.toLocaleDateString('vi-VN')}</p>
                <p><span className="font-medium text-gray-900 dark:text-white">Hạn báo giá:</span> {quote.expiryDate ? quote.expiryDate.toLocaleDateString('vi-VN') : '15 ngày kể từ ngày báo giá'}</p>
                <p><span className="font-medium text-gray-900 dark:text-white">Người tạo:</span> {currentUser?.name || 'Hệ thống'}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Danh sách sản phẩm</h3>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">STT</th>
                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Sản phẩm</th>
                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-center">Số lượng</th>
                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-right">Đơn giá</th>
                    <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {quote.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{index + 1}</td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{item.productName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{renderItemDetails(item)}</div>
                        {item.note && <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Ghi chú: {item.note}</div>}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-900 dark:text-white">{item.quantity.toLocaleString('vi-VN')} {item.unit || 'cái'}</td>
                      <td className="px-4 py-4 text-right text-gray-900 dark:text-white">{(item.totalPrice / item.quantity).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-900 dark:text-white">{item.totalPrice.toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals and Payments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {quote.payments && quote.payments.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lịch sử đặt cọc</h3>
                  <div className="space-y-2">
                    {quote.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                        <div>
                          <p className="text-sm font-bold text-green-800 dark:text-green-300">{payment.amount.toLocaleString('vi-VN')} VND</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(payment.date).toLocaleDateString('vi-VN')} - {payment.method}</p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded">Đã nhận</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tạm tính:</span>
                <span className="font-medium text-gray-900 dark:text-white">{subTotal.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Thuế VAT ({companyInfo.vatRate || 0}%):</span>
                <span className="font-medium text-gray-900 dark:text-white">{vat.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Tổng cộng:</span>
                <span className="text-blue-600 dark:text-blue-400">{quote.totalAmount.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="text-right text-xs text-gray-500 dark:text-gray-400 italic">
                ({readMoney(quote.totalAmount)})
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 pt-2">
                <span>Đã đặt cọc:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{amountPaid.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between text-gray-900 dark:text-white font-bold">
                <span>Còn lại:</span>
                <span className="text-red-600 dark:text-red-400">{remaining.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>In báo giá</span>
            </button>
            <button
              onClick={handleSendEmail}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm"
            >
              <EnvelopeIcon className="w-4 h-4" />
              <span>Gửi Email</span>
            </button>
            <button
              onClick={handleDuplicate}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>Nhân bản</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {quote.status === QuoteStatus.Draft && (
              <>
                <button
                  onClick={handleSendForApproval}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm font-semibold"
                >
                  Gửi duyệt
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition font-semibold"
                >
                  Hủy bỏ
                </button>
              </>
            )}

            {quote.status === QuoteStatus.PendingApproval && canUpdateStatus && (
              <>
                <button
                  onClick={() => {
                    updateQuoteStatus(quote.id, QuoteStatus.Approved);
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm font-semibold"
                >
                  Duyệt báo giá
                </button>
                <button
                  onClick={handleRequestEdit}
                  className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition font-semibold"
                >
                  Yêu cầu sửa
                </button>
              </>
            )}

            {(quote.status === QuoteStatus.Approved || quote.status === QuoteStatus.Sent) && (
              <>
                {remaining > 0 && (
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm font-semibold"
                  >
                    Nhận đặt cọc
                  </button>
                )}
                {canManageOrders && (
                  <button
                    onClick={handleCreateOrder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-semibold"
                  >
                    Tạo đơn hàng
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {isPaymentModalOpen && (
        <PaymentModal
          onClose={() => setIsPaymentModalOpen(false)}
          onSave={handleRecordPayment}
          remainingAmount={remaining}
          bankAccounts={companyInfo.bankAccounts}
        />
      )}
    </div>
  );
};