

import React from 'react';
import { useData } from '../../context/DataContext';
import { PrinterIcon } from '../icons/Icons';
import { PaymentMethod } from '../../types';

interface InvoiceDetailModalProps {
  invoiceId: string;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoiceId, onClose }) => {
  const { invoices, orders, companyInfo, users, printTemplates } = useData();
  
  const invoice = invoices.find(inv => inv.id === invoiceId);
  const order = invoice ? orders.find(o => o.id === invoice.orderId) : null;

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

          if (h > 0 || readZeroHundred) {
              res += digits[h] + " trăm ";
          }

          if (t === 0 && o > 0 && (h > 0 || readZeroHundred)) {
              res += "lẻ ";
          } else if (t === 1) {
              res += "mười ";
          } else if (t > 1) {
              res += digits[t] + " mươi ";
          }

          if (t > 0 && o === 1 && t !== 1) {
              res += "mốt";
          } else if (t > 0 && o === 5) {
              res += "lăm";
          } else if (o > 0) {
              res += digits[o];
          }
          
          res = res.trim();
          if (res) {
              s += res + " " + units[i] + " ";
          }
      }
      
      s = s.trim();
      if (!s) return "Không đồng";
      return s.charAt(0).toUpperCase() + s.slice(1) + " đồng";
  };

  const handlePrint = () => {
    if (!invoice || !order) return;

    // Find a suitable template
    const template = printTemplates.find(t => t.type === 'Invoice' && t.isActive) || printTemplates.find(t => t.isActive);
    
    if (!template) {
        window.print();
        return;
    }

    let content = template.content;
    
    const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = invoice.totalAmount - amountPaid;
    const vat = order.vatAmount ?? (order.totalAmount - (order.totalAmount / (1 + (companyInfo.vatRate || 0) / 100)));
    const subTotal = order.totalAmount - vat - (order.delivery?.fee || 0);

    const itemsRows = order.items.map((item, index) => `
        <tr>
            <td style="text-align: center; padding: 6px; border: 1px solid #000;">${index + 1}</td>
            <td style="padding: 6px; border: 1px solid #000;">${item.product.name}</td>
            <td style="text-align: center; padding: 6px; border: 1px solid #000;">${item.unit || ''}</td>
            <td style="text-align: center; padding: 6px; border: 1px solid #000;">${item.quantity}</td>
            <td style="text-align: right; padding: 6px; border: 1px solid #000;">${item.unitPrice.toLocaleString('vi-VN')}</td>
            <td style="text-align: right; padding: 6px; border: 1px solid #000;">${item.totalPrice.toLocaleString('vi-VN')}</td>
        </tr>
    `).join('');

    const replacements: Record<string, string> = {
        '{companyName}': companyInfo.name,
        '{companyAddress}': companyInfo.address,
        '{companyPhone}': companyInfo.phone,
        '{companyEmail}': companyInfo.email,
        '{logo}': companyInfo.logoUrl,
        '{orderId}': invoice.orderId,
        '{invoiceId}': invoice.id,
        '{orderDate}': invoice.invoiceDate.toLocaleDateString('vi-VN'),
        '{customerId}': invoice.customer.id,
        '{customerName}': invoice.customer.name,
        '{customerPhone}': invoice.customer.phone,
        '{customerAddress}': invoice.customer.address ? `${invoice.customer.address.street}, ${invoice.customer.address.ward}, ${invoice.customer.address.district}, ${invoice.customer.address.province}` : '',
        '{subTotal}': Math.round(subTotal).toLocaleString('vi-VN'),
        '{vatRate}': String(companyInfo.vatRate || 0),
        '{vatAmount}': Math.round(vat).toLocaleString('vi-VN'),
        '{shippingFee}': Math.round(order.delivery?.fee || 0).toLocaleString('vi-VN'),
        '{totalAmount}': invoice.totalAmount.toLocaleString('vi-VN'),
        '{depositAmount}': amountPaid.toLocaleString('vi-VN'),
        '{remainingAmount}': remaining.toLocaleString('vi-VN'),
        '{amountInWords}': readMoney(invoice.totalAmount),
        '{itemsTableRows}': itemsRows,
        '{title}': 'HÓA ĐƠN BÁN HÀNG'
    };

    for (const [key, value] of Object.entries(replacements)) {
        content = content.split(key).join(value || '');
    }

    const newWindow = window.open('', '', 'height=600,width=800');
    if (newWindow) {
        newWindow.document.write('<html><head><title>In Hóa Đơn</title>');
        newWindow.document.write('<style>body { font-family: Arial, sans-serif; }</style>'); 
        newWindow.document.write('</head><body>');
        newWindow.document.write(content);
        newWindow.document.write('</body></html>');
        newWindow.document.close();
        newWindow.focus();
        setTimeout(() => {
            newWindow.print();
            newWindow.close();
        }, 500);
    }
  };

  if (!invoice || !order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-bold text-red-600 mb-4">Lỗi</h3>
          <p className="text-gray-700 dark:text-gray-300">Không thể tải thông tin hóa đơn.</p>
          <button onClick={onClose} className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg font-semibold">Đóng</button>
        </div>
      </div>
    );
  }
  
  const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = invoice.totalAmount - amountPaid;
  const vat = order.vatAmount ?? (order.totalAmount - (order.totalAmount / (1 + (companyInfo.vatRate || 0) / 100)));
  const subTotal = order.totalAmount - vat;
  const remainingColor = remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'N/A';

  return (
    <>
    <div id="invoice-detail-print-wrapper" className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div id="invoice-detail-modal-content" className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl h-[95vh] flex flex-col border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 flex-shrink-0 no-print">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chi tiết Hóa đơn #{invoice.id}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl p-1 leading-none">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{invoice.customer.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.customer.company?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.customer.phone}</p>
                    </div>
                    <div className="text-right text-sm space-y-1">
                        <p className="text-gray-500 dark:text-gray-400">Ngày hóa đơn: <span className="font-medium text-gray-700 dark:text-gray-200">{invoice.invoiceDate.toLocaleDateString('vi-VN')}</span></p>
                        <p className="text-gray-500 dark:text-gray-400">Ngày đáo hạn: <span className="font-medium text-gray-700 dark:text-gray-200">{invoice.dueDate.toLocaleDateString('vi-VN')}</span></p>
                    </div>
                </div>
                
                {/* Print Button Section */}
                <div className="py-2 no-print border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                    <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
                        <PrinterIcon className="w-4 h-4" /> In hóa đơn
                    </button>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">SẢN PHẨM</th>
                                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">SL</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ĐƠN GIÁ</th>
                                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">THÀNH TIỀN</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {order.items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 whitespace-normal"><p className="text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</p></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300">{item.quantity}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-300">{item.unitPrice.toLocaleString('vi-VN')}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-gray-800 dark:text-gray-200">{item.totalPrice.toLocaleString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
                            <tr>
                                <td colSpan={3} className="px-4 py-2 text-right text-sm">Tiền hàng (chưa VAT)</td>
                                <td className="px-4 py-2 text-right text-sm">{Math.round(subTotal).toLocaleString('vi-VN')} đ</td>
                            </tr>
                             <tr>
                                <td colSpan={3} className="px-4 py-2 text-right text-sm">VAT ({companyInfo.vatRate}%)</td>
                                <td className="px-4 py-2 text-right text-sm">{Math.round(vat).toLocaleString('vi-VN')} đ</td>
                            </tr>
                            <tr className="text-base border-t border-gray-200 dark:border-gray-700">
                                <td colSpan={2} className="px-4 py-3 text-left italic text-sm font-normal text-gray-600 dark:text-gray-400 align-top">
                                    (Bằng chữ: {readMoney(invoice.totalAmount)})
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">TỔNG CỘNG</td>
                                <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">{invoice.totalAmount.toLocaleString('vi-VN')} đ</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="px-4 py-2 text-right text-green-600">Đã thanh toán</td>
                                <td className="px-4 py-2 text-right text-green-600">{amountPaid.toLocaleString('vi-VN')} đ</td>
                            </tr>
                             <tr className="text-base">
                                <td colSpan={3} className={`px-4 py-2 text-right font-bold ${remainingColor}`}>Còn lại</td>
                                <td className={`px-4 py-2 text-right font-bold ${remainingColor}`}>{remaining.toLocaleString('vi-VN')} đ</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Payment History */}
                {invoice.payments.length > 0 && (
                    <div className="pt-4 border-t dark:border-gray-700">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Lịch sử thanh toán</h4>
                        <ul className="space-y-2 text-sm">
                        {invoice.payments.map(p => (
                            <li key={p.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                <div>
                                    <p>Ngày: <span className="font-medium">{p.date.toLocaleString('vi-VN')}</span></p>
                                    <p>Người ghi nhận: <span className="font-medium">{getUserName(p.recordedByUserId)}</span></p>
                                </div>
                                <div>
                                    <p className="text-green-600 font-bold text-base">{p.amount.toLocaleString('vi-VN')} đ</p>
                                    <p className="text-xs text-right text-gray-500">{p.method}</p>
                                </div>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    </div>
    </>
  );
};
