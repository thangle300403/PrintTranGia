import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import type { OrderItem, Product, Customer, BankAccount, Payment, SaleTab, Order, DeliveryInfo, Quote, QuoteItem, Promotion } from '../../types';
import { PaymentMethod, PricingModel, OrderStatus, QuoteStatus } from '../../types';
import { TrashIcon, SearchIcon, UserPlusIcon, CreditCardIcon, TruckIcon, NoteIcon, PrinterIcon, QuoteIcon, SparklesIcon, RefreshIcon, GiftIcon, CloseIcon, WarningIcon, PencilIcon } from '../../components/icons/Icons';
import { CustomerModal } from '../../components/customers/CustomerModal';
import FormattedNumberInput from '../../components/FormattedNumberInput';
import { parseNoteWithGemini } from '../../services/geminiService';
import CustomSelect from '../../components/CustomSelect';
import { SelectPromotionModal } from '../../components/promotions/SelectPromotionModal';
import { Toast } from '../../components/Toast';

const removeAccents = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

// ... (Keep readMoney, ReceiptPrintModal, QrPaymentModal, DepositModal, DeliveryModal helper functions and components as they are - no changes needed there) ...
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

const ReceiptPrintModal: React.FC<{
    order: Order;
    onClose: () => void;
    title?: string;
    paymentAmount?: number;
}> = ({ order, onClose, title = "PHIẾU ĐẶT HÀNG", paymentAmount }) => {
    const { companyInfo, invoices } = useData();

    const handlePrint = () => {
        const printContent = document.getElementById('receipt-print-area');
        if (printContent) {
            const newWindow = window.open('', '', 'height=600,width=800');
            newWindow?.document.write('<html><head><title>' + title + '</title>');
            // CSS for print (using inline styles mostly in the HTML string for simplicity across browsers)
            newWindow?.document.write(`
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                    body { font-family: 'Roboto', 'Times New Roman', serif; font-size: 12px; line-height: 1.4; color: #000; margin: 0; padding: 0; }
                    .container { width: 100%; max-width: 210mm; margin: 0 auto; padding: 10px; box-sizing: border-box; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            `);
            newWindow?.document.write('</head><body>');
            newWindow?.document.write('<div class="container">');
            newWindow?.document.write(printContent.innerHTML);
            newWindow?.document.write('</div>');
            newWindow?.document.write('</body></html>');
            newWindow?.document.close();
            newWindow?.focus();
            setTimeout(() => {
                 newWindow?.print();
                 newWindow?.close();
            }, 250);
        }
    };

    // Calculate financial details
    const invoice = invoices.find(inv => inv.orderId === order.id);
    const contextAmountPaid = invoice?.payments.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const amountPaid = paymentAmount !== undefined ? paymentAmount : contextAmountPaid;
    
    const remaining = order.totalAmount - amountPaid;
    const subTotal = order.totalAmount + (order.discountAmount || 0) - (order.vatAmount || 0) - (order.delivery?.fee || 0);

    const amountInWords = readMoney(order.totalAmount);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[70] p-4">
            <div className="bg-white p-0 rounded-lg shadow-xl flex flex-col max-h-[90vh] h-[90vh] w-full max-w-2xl overflow-hidden">
                 <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-800">Xem trước {title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">&times;</button>
                </div>
                
                <div className="overflow-y-auto flex-1 p-8 bg-gray-100 flex justify-center">
                    <div id="receipt-print-area" className="bg-white shadow-lg p-8 w-full min-h-[800px]">
                        {/* HEADER TABLE */}
                        <table style={{ width: '100%', marginBottom: '10px', borderBottom: '2px solid #0037c1', paddingBottom: '5px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '80px', paddingRight: '10px', verticalAlign: 'top', textAlign: 'center' }}>
                                        <img src={companyInfo.logoUrl} style={{ width: '100%', maxWidth: '80px', height: 'auto', objectFit: 'contain' }} alt="Logo" onError={(e) => e.currentTarget.style.display='none'}/>
                                    </td>
                                    <td style={{ verticalAlign: 'middle' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0037c1', marginBottom: '4px' }}>{companyInfo.name}</div>
                                        <div style={{ marginBottom: '2px', fontSize: '11px' }}><b>ĐC:</b> {companyInfo.address}</div>
                                        <div style={{ marginBottom: '2px', fontSize: '11px' }}><b>ĐT:</b> {companyInfo.phone}</div>
                                        <div style={{ marginBottom: '2px', fontSize: '11px' }}><b>Email:</b> {companyInfo.email}</div>
                                    </td>
                                    <td style={{ width: '35%', textAlign: 'right', fontSize: '11px', verticalAlign: 'top' }}>
                                        <div>Mã KH: <b>{order.customer.id}</b></div>
                                        <div>Số phiếu: <b>{order.id}</b></div>
                                        <div>Ngày: {new Date().toLocaleDateString('vi-VN')}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ textAlign: 'center', margin: '15px 0' }}>
                            <div style={{ fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', color: '#333', marginBottom: '0' }}>{title}</div>
                            <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#555' }}>(Kiêm phiếu xuất kho)</div>
                        </div>

                        {/* CUSTOMER INFO TABLE */}
                        <table style={{ width: '100%', marginBottom: '15px', fontSize: '12px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '90px', fontWeight: 'bold', verticalAlign: 'top', padding: '3px 0' }}>Khách hàng:</td>
                                    <td style={{ padding: '3px 0' }}>{order.customer.name}</td>
                                </tr>
                                <tr>
                                    <td style={{ width: '90px', fontWeight: 'bold', verticalAlign: 'top', padding: '3px 0' }}>Địa chỉ:</td>
                                    <td style={{ padding: '3px 0' }}>{order.customer.address ? `${order.customer.address.street}, ${order.customer.address.ward}, ${order.customer.address.district}, ${order.customer.address.province}` : order.delivery?.address || '---'}</td>
                                </tr>
                                <tr>
                                    <td style={{ width: '90px', fontWeight: 'bold', verticalAlign: 'top', padding: '3px 0' }}>Điện thoại:</td>
                                    <td style={{ padding: '3px 0' }}>{order.customer.phone}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* ITEMS TABLE */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', color: '#333', width: '30px' }}>STT</th>
                                    <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', color: '#333' }}>Tên hàng hóa / Dịch vụ</th>
                                    <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', color: '#333', width: '40px' }}>ĐVT</th>
                                    <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', color: '#333', width: '40px' }}>SL</th>
                                    <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', color: '#333', width: '70px' }}>Đơn giá</th>
                                    <th style={{ border: '1px solid #000', padding: '6px', backgroundColor: '#f3f4f6', fontWeight: 'bold', textAlign: 'center', color: '#333', width: '90px' }}>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ border: '1px solid #000', padding: '6px' }}>
                                            <div style={{ fontWeight: '500' }}>{item.product.name}</div>
                                            {item.note && <div style={{ fontSize: '11px', color: '#555', fontStyle: 'italic' }}>({item.note})</div>}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{item.unit || item.product.unit}</td>
                                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{(item.unitPrice).toLocaleString('vi-VN')}</td>
                                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}>{(item.totalPrice).toLocaleString('vi-VN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* TOTALS TABLE */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '12px' }}>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px', width: '150px' }}>Tổng tiền hàng:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px', width: '110px', fontWeight: 'bold' }}>{Math.round(subTotal).toLocaleString('vi-VN')}</td>
                                </tr>
                                {order.discountAmount > 0 && <tr>
                                    <td></td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px' }}>Khuyến mãi ({order.promotionCode}):</td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px', fontWeight: 'bold' }}>-{order.discountAmount.toLocaleString('vi-VN')}</td>
                                </tr>}
                                <tr>
                                    <td></td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px' }}>Thuế GTGT:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px', fontWeight: 'bold' }}>{Math.round(order.vatAmount || 0).toLocaleString('vi-VN')}</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px' }}>Phí vận chuyển:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px', fontWeight: 'bold' }}>{Math.round(order.delivery?.fee || 0).toLocaleString('vi-VN')}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontStyle: 'italic', fontSize: '11px', color: '#333', fontWeight: 'normal', verticalAlign: 'top', paddingTop: '8px', borderTop: '1px solid #333' }}>
                                        (Bằng chữ: {amountInWords})
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '8px 5px 2px', fontWeight: 'bold', borderTop: '1px solid #333', color: '#b91c1c', fontSize: '14px' }}>TỔNG CỘNG:</td>
                                    <td style={{ textAlign: 'right', padding: '8px 5px 2px', fontWeight: 'bold', borderTop: '1px solid #333', color: '#b91c1c', fontSize: '14px' }}>{order.totalAmount.toLocaleString('vi-VN')}</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px' }}>{title === 'HÓA ĐƠN BÁN HÀNG' ? 'Đã thanh toán:' : 'Đã đặt cọc:'}</td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px', fontWeight: 'bold', color: '#166534' }}>{amountPaid.toLocaleString('vi-VN')}</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px' }}>Còn lại:</td>
                                    <td style={{ textAlign: 'right', padding: '3px 5px', fontWeight: 'bold', color: '#b91c1c' }}>{remaining > 0 ? remaining.toLocaleString('vi-VN') : '0'}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ marginTop: '10px', fontStyle: 'italic', fontSize: '11px', border: '1px dashed #ccc', padding: '8px', borderRadius: '4px' }}>
                            <b>* Lưu ý:</b>
                            <ul style={{ margin: '2px 0 0 20px', padding: '0' }}>
                                <li>Quý khách vui lòng kiểm tra kỹ nội dung, quy cách sản phẩm trước khi đặt hàng.</li>
                                <li>Thời gian giao hàng tính từ ngày duyệt file và nhận cọc.</li>
                            </ul>
                        </div>

                        {/* FOOTER SIGNATURES */}
                        <table style={{ width: '100%', marginTop: '20px', textAlign: 'center', fontSize: '12px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '33%', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Người lập phiếu</div>
                                        <div style={{ fontStyle: 'italic', marginBottom: '50px' }}>(Ký, họ tên)</div>
                                    </td>
                                    <td style={{ width: '33%', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Người giao hàng</div>
                                        <div style={{ fontStyle: 'italic', marginBottom: '50px' }}>(Ký, họ tên)</div>
                                    </td>
                                    <td style={{ width: '33%', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Người nhận hàng</div>
                                        <div style={{ fontStyle: 'italic', marginBottom: '50px' }}>(Ký, họ tên)</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-4 border-t bg-white">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium text-sm transition">Đóng</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2 transition shadow-sm">
                        <PrinterIcon className="w-4 h-4" /> In phiếu (Enter)
                    </button>
                </div>
            </div>
        </div>
    );
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
            newWindow?.document.write('<script>setTimeout(function() { window.print(); window.close(); }, 500);</script>'); // Auto print delay
            newWindow?.document.close();
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
                        <div className="w-full md:w-1/2 flex justify-center flex-shrink-0">
                           <div className="p-4 bg-white rounded-xl border-2 border-gray-200 shadow-xl">
                                <img src={qrImageUrl} alt="Mã QR thanh toán" className="rounded-lg max-w-[250px] w-full" />
                           </div>
                        </div>
                        
                        <div className="w-full md:w-1/2 flex-1">
                            <div className="text-left bg-[var(--gray-50)] dark:bg-[var(--gray-700)]/50 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-600 space-y-3 text-sm h-full flex flex-col justify-center shadow-xl">
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

const DepositModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentData: SaleTab['payment']) => void;
    totalAmount: number;
    currentPayment: SaleTab['payment'];
    bankAccounts: BankAccount[];
    orderId: string;
}> = ({ isOpen, onClose, onConfirm, totalAmount, currentPayment, bankAccounts, orderId }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [method, setMethod] = useState<PaymentMethod>(currentPayment.method);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(currentPayment.bankAccountId || bankAccounts[0]?.id || '');
    const [isQrModalOpenForDeposit, setIsQrModalOpenForDeposit] = useState(false);

    useEffect(() => {
        if (isOpen) {
             const initialValue = currentPayment.amount > 0 ? currentPayment.amount : '';
             setAmount(initialValue);
             setMethod(currentPayment.method);
             setSelectedAccountId(currentPayment.bankAccountId || bankAccounts[0]?.id || '');
        }
    }, [currentPayment, isOpen, bankAccounts]);

    const handleConfirm = () => {
        const numericAmount = Number(amount) || 0;
        if (numericAmount < 0 || numericAmount > totalAmount) {
            alert(`Vui lòng nhập số tiền hợp lệ (từ 0 đến ${totalAmount.toLocaleString('vi-VN')})`);
            return;
        }
        onConfirm({
            amount: numericAmount,
            method,
            bankAccountId: method === PaymentMethod.BankTransfer ? selectedAccountId : undefined
        });
    };
    
    if (!isOpen) return null;
    
    const selectedBank = bankAccounts.find(acc => acc.id === selectedAccountId);

    return (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-[var(--white)] dark:bg-[var(--gray-800)] p-6 rounded-xl shadow-xl w-full max-w-md border border-[var(--gray-200)] dark:border-[var(--gray-700)]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[var(--gray-900)] dark:text-[var(--white)]">Nhận đặt cọc</h3>
                    <button onClick={onClose} className="text-[var(--gray-400)] hover:text-[var(--gray-600)] dark:hover:text-[var(--gray-200)] text-2xl">&times;</button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--gray-700)] dark:text-[var(--gray-300)] mb-1">Số tiền đặt cọc</label>
                        <FormattedNumberInput value={amount} onChange={setAmount} className="w-full p-2 border rounded-lg bg-[var(--gray-100)] dark:bg-[var(--gray-700)] border-[var(--gray-300)] dark:border-[var(--gray-600)] text-right font-semibold" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--gray-700)] dark:text-[var(--gray-300)] mb-1">Hình thức thanh toán</label>
                        <select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className="w-full p-2 border rounded-lg bg-[var(--gray-100)] dark:bg-[var(--gray-700)] border-[var(--gray-300)] dark:border-[var(--gray-600)]">
                            <option value={PaymentMethod.Cash}>Tiền mặt</option>
                            <option value={PaymentMethod.BankTransfer}>Chuyển khoản</option>
                        </select>
                    </div>
                    {method === PaymentMethod.BankTransfer && (
                         <div>
                            <label className="block text-sm font-medium text-[var(--gray-700)] dark:text-[var(--gray-300)] mb-1">Tài khoản thu</label>
                            <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="w-full p-2 border rounded-lg bg-[var(--gray-100)] dark:bg-[var(--gray-700)] border-[var(--gray-300)] dark:border-[var(--gray-600)]">
                                {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountNumber} - {acc.bankName}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                <div className="mt-8 flex justify-between items-center">
                     <button
                        type="button"
                        onClick={() => setIsQrModalOpenForDeposit(true)}
                        className="px-5 py-2.5 text-sm font-semibold text-[var(--brand-color-1)] rounded-lg bg-[var(--blue-100)] dark:bg-[var(--blue-900)]/50 hover:bg-[var(--blue-200)] dark:hover:bg-[var(--blue-900)]/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={method !== PaymentMethod.BankTransfer || !Number(amount) || Number(amount) <= 0}
                    >
                        In mã QR
                    </button>
                    <div className="flex space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[var(--gray-200)] dark:bg-gray-600 text-[var(--gray-800)] dark:text-[var(--gray-200)] hover:bg-[var(--gray-300)] dark:hover:bg-[var(--gray-500)] transition">Đóng</button>
                        <button type="button" onClick={handleConfirm} className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--brand-color-1)] rounded-lg hover:bg-[var(--blue-700)] transition shadow-sm">Xác nhận</button>
                    </div>
                </div>
            </div>
        </div>
         <QrPaymentModal
            isOpen={isQrModalOpenForDeposit}
            onClose={() => setIsQrModalOpenForDeposit(false)}
            amount={Number(amount) || 0}
            bankAccount={selectedBank || bankAccounts[0]}
            orderId={orderId}
        />
        </>
    );
};

const DeliveryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (deliveryInfo: DeliveryInfo) => void;
    initialData: DeliveryInfo;
}> = ({ isOpen, onClose, onSave, initialData }) => {
    const [data, setData] = useState<DeliveryInfo>(initialData);

    useEffect(() => {
        if (isOpen) {
            setData(initialData);
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeeChange = (val: number) => {
        setData(prev => ({ ...prev, fee: val }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(data);
        onClose();
    };

    if (!isOpen) return null;

    const inputClass = "w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Thông tin Giao hàng</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelClass}>Tên người nhận</label>
                        <input name="recipientName" value={data.recipientName} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                         <label className={labelClass}>Số điện thoại</label>
                        <input name="phone" value={data.phone} onChange={handleChange} className={inputClass} required />
                    </div>
                     <div>
                         <label className={labelClass}>Địa chỉ giao hàng</label>
                        <input name="address" value={data.address} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Phương thức giao</label>
                            <select name="method" value={data.method} onChange={handleChange} className={inputClass}>
                                <option value="Tự giao">Tự giao</option>
                                <option value="Giao hàng tiết kiệm">Giao hàng tiết kiệm</option>
                                <option value="Grab/Ahamove">Grab/Ahamove</option>
                                <option value="Viettel Post">Viettel Post</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Phí giao hàng</label>
                            <FormattedNumberInput value={data.fee} onChange={handleFeeChange} className={inputClass} />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition">Hủy</button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PointOfSalePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    // FIX: Add 'updateCustomer' to destructured values from useData
    const { products, customers, createPosSale, createOrderFromPos, createQuoteFromPos, companyInfo, addCustomer, updateCustomer, currentUser, getOrderById, invoices, updateOrder, updateInvoice, recordPayment, clearPaymentsForInvoice, getQuoteById, updateQuoteFromPos, updateQuoteStatus, addOrderFromQuote, createInvoiceForOrder, units, unitCategories } = useData();
    
    const [tabs, setTabs] = useState<SaleTab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string>('');
    const [tabCounter, setTabCounter] = useState(1);
    const initialLoadRef = useRef(false);
    const [printOnSave, setPrintOnSave] = useState(false);
    const [receiptData, setReceiptData] = useState<Order | null>(null);
    const [receiptTitle, setReceiptTitle] = useState('PHIẾU ĐẶT HÀNG');
    const [receiptPaymentAmount, setReceiptPaymentAmount] = useState<number | undefined>(undefined);
    const [aiParsingItemId, setAiParsingItemId] = useState<string | null>(null);
    
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
    const customerSearchRef = useRef<HTMLDivElement>(null);
    
    // NEW STATE for editing customer
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    // ADDED TOAST MESSAGE STATE
    const [toastMessage, setToastMessage] = useState('');

    const isEditingOrder = location.pathname.startsWith('/orders/');
    const isEditingQuote = location.pathname.startsWith('/quotes/');

    const createNewTab = useCallback((counter: number): SaleTab => ({
        id: `sale_${Date.now()}_${counter}`,
        name: `Hóa đơn ${counter}`,
        cart: [],
        selectedCustomerId: '', // Start with empty customer ID for search
        wantsVat: false,
        payment: { amount: 0, method: PaymentMethod.Cash },
        delivery: { recipientName: '', phone: '', address: '', fee: 0, method: 'Tự giao' },
        editingNoteOrderItemId: null,
        editingPriceOrderItemId: null,
        isSplitLineMode: false,
        appliedPromotionCode: '',
        discountAmount: 0,
    }), []);

    useEffect(() => {
        if (initialLoadRef.current || (id && customers.length === 0)) return;

        initialLoadRef.current = true;
    
        if (isEditingOrder && id) {
            const orderToEdit = getOrderById(id);
            if (orderToEdit) {
                const invoice = invoices.find(inv => inv.orderId === id);
                const totalPaid = invoice?.payments.reduce((sum, p) => sum + p.amount, 0) || 0;
                const firstPayment = invoice?.payments[0];

                const editTab: SaleTab = {
                    id: `edit_${id}`,
                    name: `Hóa đơn 1`, 
                    cart: orderToEdit.items.map(item => ({...item})),
                    selectedCustomerId: orderToEdit.customer.id,
                    wantsVat: !!orderToEdit.vatAmount && orderToEdit.vatAmount > 0,
                    payment: {
                        amount: totalPaid,
                        method: firstPayment?.method || PaymentMethod.Cash,
                        bankAccountId: firstPayment?.method === PaymentMethod.BankTransfer ? firstPayment.bankAccountId : undefined
                    },
                    delivery: orderToEdit.delivery || { recipientName: orderToEdit.customer.name, phone: orderToEdit.customer.phone, address: '', fee: 0, method: 'Tự giao' },
                    editingNoteOrderItemId: null,
                    editingPriceOrderItemId: null,
                    isSplitLineMode: false,
                    appliedPromotionCode: orderToEdit.promotionCode,
                    discountAmount: orderToEdit.discountAmount,
                };
                setTabs([editTab]);
                setActiveTabId(editTab.id);
                setTabCounter(2);
            } else {
                alert(`Không tìm thấy đơn hàng với mã ${id}`);
                navigate('/orders');
            }
        } else if (isEditingQuote && id) {
            const quoteToEdit = getQuoteById(id);
            if (quoteToEdit) {
                const quoteItemsAsOrderItems: OrderItem[] = quoteToEdit.items.map(item => {
                    const product = products.find(p => p.id === item.sourceProductId) || { 
                        id: item.productName, 
                        name: item.productName, 
                        pricingModel: item.details.unitPrice ? PricingModel.Fixed : PricingModel.ByQuote, 
                        price: item.details.unitPrice,
                        initialStock: 0, 
                        lowStockThreshold: 0, 
                        sku: `QUOTE_${item.id}`
                    } as Product;
                    return {
                        id: item.id,
                        product,
                        quantity: item.quantity,
                        unitPrice: item.details.unitPrice ?? (item.quantity > 0 ? item.totalPrice / item.quantity : 0),
                        totalPrice: item.totalPrice,
                        note: '', 
                        // FIX: Property 'unit' does not exist on type 'MaterialVariant'. Use 'costingUnit' instead.
                        unit: product.unit || item.material?.costingUnit || 'cái',
                    };
                });
                
                const editTab: SaleTab = {
                    id: `edit_${id}`,
                    name: `Báo giá ${id}`,
                    cart: quoteItemsAsOrderItems,
                    selectedCustomerId: quoteToEdit.customer.id,
                    wantsVat: !!quoteToEdit.vatAmount && quoteToEdit.vatAmount > 0,
                    payment: { 
                        amount: (quoteToEdit.payments || []).reduce((sum, p) => sum + p.amount, 0),
                        method: (quoteToEdit.payments || [])[0]?.method || PaymentMethod.Cash,
                        bankAccountId: (quoteToEdit.payments || [])[0]?.bankAccountId
                    },
                    delivery: { recipientName: '', phone: '', address: '', fee: 0, method: 'Tự giao' },
                    editingNoteOrderItemId: null,
                    editingPriceOrderItemId: null,
                    isSplitLineMode: false,
                    appliedPromotionCode: '',
                    discountAmount: 0,
                };
                setTabs([editTab]);
                setActiveTabId(editTab.id);
                setTabCounter(2);
            } else {
                 alert(`Không tìm thấy báo giá với mã ${id}`);
                 navigate('/quotes');
            }
        } else {
            const firstTab = createNewTab(1);
            setTabs([firstTab]);
            setActiveTabId(firstTab.id);
            setTabCounter(2);
        }
    }, [id, isEditingOrder, isEditingQuote, getOrderById, invoices, navigate, createNewTab, customers, getQuoteById, products]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (customerSearchRef.current && !customerSearchRef.current.contains(event.target as Node)) {
                setIsCustomerSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [customerError, setCustomerError] = useState<string>('');
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false); 
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [customerHighlightedIndex, setCustomerHighlightedIndex] = useState(-1);

    const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);
    const isEditMode = useMemo(() => activeTabId?.startsWith('edit_'), [activeTabId]);
    
    const unitOptions = useMemo(() => {
        const posCategoryIds = unitCategories
            .filter(c => c.name === 'Sản phẩm' || c.name === 'Bán hàng (POS)')
            .map(c => c.id);

        if (posCategoryIds.length === 0) {
            // Fallback to all units if categories aren't set up
            return units.map(u => ({ value: u.name, label: u.name }));
        }

        const filteredUnits = units.filter(u =>
            u.categories?.some(catId => posCategoryIds.includes(catId))
        );

        return filteredUnits.map(u => ({ value: u.name, label: u.name }));
    }, [units, unitCategories]);

    const searchResults = useMemo(() => {
        if (searchTerm.trim().length < 2) return [];
        const lowerSearch = removeAccents(searchTerm.toLowerCase());
        return products.filter(p => (removeAccents(p.name.toLowerCase()).includes(lowerSearch) || p.sku.toLowerCase().includes(lowerSearch)));
    }, [searchTerm, products]);
    
    const customerSearchResults = useMemo(() => {
        if (customerSearchTerm.trim().length < 1) return [];
        const lowerSearch = removeAccents(customerSearchTerm.toLowerCase());
        return customers.filter(c => 
            removeAccents(c.name.toLowerCase()).includes(lowerSearch) || 
            c.phone.includes(customerSearchTerm) || 
            c.id.toLowerCase().includes(lowerSearch)
        ).slice(0, 10);
    }, [customerSearchTerm, customers]);

    useEffect(() => {
        setHighlightedIndex(-1);
    }, [searchResults]);
    
    useEffect(() => {
        setCustomerHighlightedIndex(-1);
    }, [customerSearchResults]);

    const updateActiveTab = useCallback((updates: Partial<Omit<SaleTab, 'id' | 'name'>>) => {
        setTabs(prevTabs => prevTabs.map(tab => tab.id === activeTabId ? { ...tab, ...updates } : tab));
    }, [activeTabId]);

    const handleAddToCart = (product: Product) => {
        if (!activeTab) return;
        const isByQuote = product.pricingModel === PricingModel.ByQuote;
        const newItem: OrderItem = { 
            id: crypto.randomUUID(), 
            product, 
            quantity: 1, 
            unitPrice: isByQuote ? 0 : (product.price ?? 0), 
            totalPrice: isByQuote ? 0 : (product.price ?? 0),
            unit: product.unit || 'cái',
        };
        updateActiveTab({ cart: [...activeTab.cart, newItem], editingPriceOrderItemId: isByQuote ? newItem.id : activeTab.editingPriceOrderItemId });
        setSearchTerm('');
    };

    const handleProductKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (searchResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const indexToAdd = highlightedIndex >= 0 ? highlightedIndex : 0;
            if (searchResults[indexToAdd]) {
                handleAddToCart(searchResults[indexToAdd]);
            }
        }
    };

    const handleCustomerSelect = (customer: Customer) => {
        updateActiveTab({ selectedCustomerId: customer.id });
        setIsCustomerSearchOpen(false);
        setCustomerSearchTerm('');
        setCustomerError('');
    };

    const handleCustomerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (customerSearchResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setCustomerHighlightedIndex(prev => (prev < customerSearchResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setCustomerHighlightedIndex(prev => (prev > 0 ? prev - 1 : customerSearchResults.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const indexToSelect = customerHighlightedIndex >= 0 ? customerHighlightedIndex : 0;
            if (customerSearchResults[indexToSelect]) {
                handleCustomerSelect(customerSearchResults[indexToSelect]);
            }
        } else if (e.key === 'Escape') {
            setIsCustomerSearchOpen(false);
        }
    };


    const updateQuantity = (orderItemId: string, newQuantity: number) => {
        if (!activeTab) return;
        const newCart = activeTab.cart.map(item => item.id === orderItemId ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice } : item).filter(item => item.quantity > 0);
        updateActiveTab({ cart: newCart });
    };
    
    const updateNote = (orderItemId: string, note: string) => {
        if (!activeTab) return;
        updateActiveTab({ cart: activeTab.cart.map(item => item.id === orderItemId ? { ...item, note } : item) });
    };

    const updateItemDetails = (orderItemId: string, updates: Partial<OrderItem>) => {
        if (!activeTab) return;
        const newCart = activeTab.cart.map(item => {
            if (item.id === orderItemId) {
                const updatedItem = { ...item, ...updates };
                if (updates.unitPrice !== undefined) {
                    updatedItem.totalPrice = updatedItem.quantity * (updates.unitPrice || 0);
                }
                return updatedItem;
            }
            return item;
        });
        updateActiveTab({ cart: newCart });
    };
    
    const handleAiParse = async (orderItemId: string) => {
        if (!activeTab) return;
        const item = activeTab.cart.find(i => i.id === orderItemId);
        if (!item || !item.note?.trim()) {
            alert("Vui lòng nhập ghi chú trước khi phân tích.");
            return;
        }
        setAiParsingItemId(orderItemId);
        try {
            const parsedDetails = await parseNoteWithGemini(item.note);
            updateItemDetails(orderItemId, { parsedDetails });
        } catch (error) {
            alert(error instanceof Error ? error.message : "Đã có lỗi xảy ra.");
        } finally {
            setAiParsingItemId(null);
        }
    };

    const handleDeliveryUpdate = (info: DeliveryInfo) => {
        updateActiveTab({ delivery: info });
    }
    
    const handleOpenDeliveryModal = () => {
        if (activeTab && !activeTab.delivery.recipientName && activeTab.selectedCustomerId) {
             const customer = customers.find(c => c.id === activeTab.selectedCustomerId);
             if (customer) {
                const addressStr = customer.address ? `${customer.address.street}, ${customer.address.ward}, ${customer.address.district}, ${customer.address.province}` : '';
                updateActiveTab({
                     delivery: {
                         ...activeTab.delivery,
                         recipientName: customer.name,
                         phone: customer.phone,
                         address: addressStr
                     }
                 });
             }
        }
        setIsDeliveryModalOpen(true);
    }

    const subTotal = useMemo(() => activeTab?.cart.reduce((sum, item) => sum + item.totalPrice, 0) || 0, [activeTab]);
    const vatRate = companyInfo.vatRate || 0;
    const vatAmount = useMemo(() => (activeTab?.wantsVat ? subTotal * (vatRate / 100) : 0), [activeTab, subTotal, vatRate]);
    const grandTotal = useMemo(() => subTotal + vatAmount + (activeTab?.delivery?.fee || 0) - (activeTab?.discountAmount || 0), [subTotal, vatAmount, activeTab?.delivery, activeTab?.discountAmount]);
    
    const handleApplyPromotionFromModal = (promo: Promotion) => {
        if (!activeTab) return;
        
        let discount = 0;
        if (promo.type === 'percentage') {
            discount = subTotal * (promo.value / 100);
        } else {
            discount = promo.value;
        }
        
        updateActiveTab({ appliedPromotionCode: promo.code, discountAmount: discount });
    };

    const removePromotion = () => {
        updateActiveTab({ appliedPromotionCode: '', discountAmount: 0 });
    }


    const handleSetPayment = (paymentData: SaleTab['payment']) => {
        updateActiveTab({ payment: paymentData });
        setIsDepositModalOpen(false);
    };

    const handleCreateQuote = () => {
        if (!activeTab) return;
        const customer = customers.find(c => c.id === activeTab.selectedCustomerId);
        if (!customer) { setCustomerError('Vui lòng chọn khách hàng.'); return; }
        if (activeTab.cart.length === 0) { alert('Giỏ hàng trống.'); return; }

        createQuoteFromPos(activeTab.cart, customer, grandTotal, vatAmount);
        alert('Đã tạo báo giá thành công!');
        handleCloseTab(activeTab.id);
        navigate('/quotes');
    };

    const handleSaveOrder = () => {
        if (!activeTab) return;
        const customer = customers.find(c => c.id === activeTab.selectedCustomerId);
        if (!customer) { setCustomerError('Vui lòng chọn khách hàng.'); return; }
        if (activeTab.cart.length === 0) { alert('Giỏ hàng trống.'); return; }

        if (activeTab.payment.amount < 0 || activeTab.payment.amount > grandTotal) {
            alert(`Vui lòng nhập số tiền hợp lệ.`);
            return;
        }

        let orderData: Order | null = null;

        if (isEditMode) {
             if (isEditingQuote) {
                updateQuoteFromPos(id!, activeTab.cart, customer, grandTotal, vatAmount);
                if (printOnSave) {
                    orderData = { id: id!, items: activeTab.cart, customer, totalAmount: grandTotal, vatAmount, status: OrderStatus.PendingPayment, orderDate: new Date(), delivery: activeTab.delivery };
                    setReceiptTitle('BÁO GIÁ');
                    setReceiptPaymentAmount(activeTab.payment.amount);
                    setReceiptData(orderData);
                } else {
                    alert('Đã cập nhật báo giá.');
                    navigate('/quotes');
                }
            } else { // isEditingOrder
                const originalOrder = getOrderById(id!);
                if (!originalOrder) { alert('Lỗi: không tìm thấy đơn hàng gốc.'); return; }
    
                const updatedOrder: Order = { 
                    ...originalOrder, 
                    items: activeTab.cart, 
                    customer, 
                    totalAmount: grandTotal, 
                    vatAmount,
                    delivery: activeTab.delivery,
                    promotionCode: activeTab.appliedPromotionCode,
                    discountAmount: activeTab.discountAmount,
                };
                updateOrder(updatedOrder);
    
                const originalInvoice = invoices.find(inv => inv.orderId === id);
                if (originalInvoice) {
                    updateInvoice({ ...originalInvoice, totalAmount: grandTotal, customer });
                }
                orderData = updatedOrder;
                if (!printOnSave) {
                    alert('Đã cập nhật đơn hàng.');
                    navigate('/orders');
                }
            }
        } else {
            createOrderFromPos(activeTab.cart, customer, grandTotal, vatAmount, activeTab.payment, activeTab.delivery);
            
            orderData = {
                id: 'DH_MOI',
                items: activeTab.cart,
                customer,
                totalAmount: grandTotal,
                vatAmount,
                status: activeTab.payment.amount >= grandTotal ? OrderStatus.Paid : (activeTab.payment.amount > 0 ? OrderStatus.PartialPayment : OrderStatus.PendingPayment),
                orderDate: new Date(),
                delivery: activeTab.delivery,
                promotionCode: activeTab.appliedPromotionCode,
                discountAmount: activeTab.discountAmount
            } as Order;

            if (!printOnSave) {
                alert('Đã tạo đơn hàng thành công!');
                handleCloseTab(activeTab.id);
            }
        }

        if (printOnSave && orderData) {
            if (!isEditingQuote) setReceiptTitle('PHIẾU ĐẶT HÀNG');
            setReceiptPaymentAmount(activeTab.payment.amount);
            setReceiptData(orderData);
        }
    };

    const handleReceiptModalClose = () => {
        setReceiptData(null);
        setReceiptPaymentAmount(undefined);
        if (isEditingQuote) {
            navigate('/quotes');
        } else if (isEditMode) { // isEditingOrder
             navigate('/orders');
        } else if (activeTab) {
             handleCloseTab(activeTab.id);
        }
    };

    const handleCheckout = () => {
        if (!activeTab || !currentUser) return;
        const selectedCustomer = customers.find(c => c.id === activeTab.selectedCustomerId);
        if (!selectedCustomer) { setCustomerError('Vui lòng chọn khách hàng.'); return; }
        if (activeTab.cart.length === 0) { alert('Giỏ hàng trống.'); return; }
        
        let orderData: Order | null = null;

        if (isEditMode) {
            if(isEditingQuote){
                updateQuoteFromPos(id!, activeTab.cart, selectedCustomer, grandTotal, vatAmount);
                updateQuoteStatus(id!, QuoteStatus.Approved);
                const newOrder = addOrderFromQuote(id!);
                if (newOrder) {
                    const newInvoice = createInvoiceForOrder(newOrder);
                    if (newInvoice) {
                        recordPayment(newInvoice.id, { amount: grandTotal, method: activeTab.payment.method, bankAccountId: activeTab.payment.bankAccountId, recordedByUserId: currentUser.id });
                    }
                    orderData = { ...newOrder, totalAmount: grandTotal };
                }
                if (!printOnSave) {
                    alert('Thanh toán từ báo giá và tạo đơn hàng thành công!');
                    navigate('/orders');
                }
            } else { // isEditingOrder
                const originalOrder = getOrderById(id!);
                const originalInvoice = invoices.find(inv => inv.orderId === id);
                if (!originalOrder || !originalInvoice) { alert('Lỗi: không tìm thấy đơn hàng hoặc hóa đơn gốc.'); return; }
    
                const updatedOrderData: Order = { 
                    ...originalOrder, 
                    items: activeTab.cart, 
                    customer: selectedCustomer, 
                    totalAmount: grandTotal, 
                    vatAmount,
                    delivery: activeTab.delivery,
                    status: OrderStatus.Paid,
                    promotionCode: activeTab.appliedPromotionCode,
                    discountAmount: activeTab.discountAmount,
                };
                updateOrder(updatedOrderData);
                updateInvoice({ ...originalInvoice, customer: selectedCustomer, totalAmount: grandTotal });
    
                const amountPaid = originalInvoice.payments.reduce((sum, p) => sum + p.amount, 0);
                const remainingToPay = grandTotal - amountPaid;
    
                if (remainingToPay > 0) {
                    recordPayment(originalInvoice.id, { amount: remainingToPay, method: PaymentMethod.Cash, recordedByUserId: currentUser.id });
                }
                
                orderData = updatedOrderData;
    
                if (!printOnSave) {
                    alert('Đã cập nhật và thanh toán thành công!');
                    navigate('/orders');
                }
            }
        } else {
            const finalPayment: Omit<Payment, 'id' | 'date'> = { amount: grandTotal, method: PaymentMethod.Cash, recordedByUserId: currentUser.id, };
            createPosSale(activeTab.cart, selectedCustomer, finalPayment, grandTotal, vatAmount, activeTab.delivery);
            
            orderData = {
                id: 'DH_MOI',
                items: activeTab.cart,
                customer: selectedCustomer,
                totalAmount: grandTotal,
                vatAmount,
                status: OrderStatus.Paid,
                orderDate: new Date(),
                delivery: activeTab.delivery,
                promotionCode: activeTab.appliedPromotionCode,
                discountAmount: activeTab.discountAmount
            } as Order;

            if (!printOnSave) {
                alert('Thanh toán thành công!');
                handleCloseTab(activeTab.id);
            }
        }

        if (printOnSave && orderData) {
             setReceiptTitle('HÓA ĐƠN BÁN HÀNG');
             setReceiptPaymentAmount(grandTotal);
             setReceiptData(orderData);
        }
    };

    const handleAddNewTab = () => {
        const newTab = createNewTab(tabCounter);
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
        setTabCounter(prev => prev + 1);
    };

    const handleCloseTab = (tabIdToClose: string) => {
        const tabIndex = tabs.findIndex(t => t.id === tabIdToClose);
        const newTabs = tabs.filter(t => t.id !== tabIdToClose);
        
        if (activeTabId === tabIdToClose) {
            if (newTabs.length > 0) {
                setActiveTabId(newTabs[Math.max(0, tabIndex - 1)].id);
            } else {
                setActiveTabId('');
            }
        }
        setTabs(newTabs);
    };

    const handleSaveCustomer = (customerData: Omit<Customer, 'id'> | Customer) => {
        if ('id' in customerData && customerData.id) {
            updateCustomer(customerData as Customer);
        } else {
            const createdCustomer = addCustomer(customerData as Omit<Customer, 'id'>);
            updateActiveTab({ selectedCustomerId: createdCustomer.id });
        }
        setIsCustomerModalOpen(false);
        setEditingCustomer(null);
    };
    
    useEffect(() => {
        if (tabs.length === 0 && !id) {
            handleAddNewTab();
        } else if (activeTabId && !tabs.some(t => t.id === activeTabId)) {
            setActiveTabId(tabs[0]?.id || '');
        }
    }, [tabs, activeTabId]);

    const isActionDisabled = !activeTab || !activeTab.selectedCustomerId || activeTab.cart.length === 0;

    const selectedCustomer = useMemo(() => {
        if (!activeTab?.selectedCustomerId) return null;
        return customers.find(c => c.id === activeTab.selectedCustomerId);
    }, [activeTab?.selectedCustomerId, customers]);

    return (
        <>
            <div className="flex flex-col h-[calc(100vh-65px)] bg-[var(--gray-150)] -m-6 lg:-m-8">
                <div className="bg-white px-4 pt-3 shadow-sm flex items-center border-b">
                     {tabs.map(tab => (
                        <div key={tab.id} onClick={() => setActiveTabId(tab.id)} className={`cursor-pointer flex items-center gap-x-2.5 px-4 py-2 border-b-2 text-sm transition-colors duration-150 ${activeTabId === tab.id ? 'border-blue-600 font-semibold text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>
                            <span>{tab.name}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-200" aria-label={`Close ${tab.name}`}>&times;</button>
                        </div>
                    ))}
                    <button onClick={handleAddNewTab} className="px-3 py-2 text-lg font-bold text-gray-500 hover:text-gray-800" aria-label="Add new invoice">+</button>
                </div>
                {activeTab && (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-4 flex-1 min-h-0 p-4">
                        {/* LEFT PANEL */}
                        <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full border border-gray-200">
                             <div className="mb-4 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm sản phẩm bằng tên hoặc SKU..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    onKeyDown={handleProductKeyDown}
                                    className="w-full p-3 pl-10 border rounded-lg bg-gray-50 border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {searchResults.length > 0 && (
                                    <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-20 max-h-80 overflow-y-auto">
                                        {searchResults.map((product, index) => (
                                            <li 
                                                key={product.id} 
                                                onClick={() => handleAddToCart(product)} 
                                                className={`p-3 cursor-pointer flex justify-between items-center border-b ${
                                                    index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-blue-50'
                                                }`}
                                            >
                                                <div>
                                                    <p className="font-semibold">{product.name}</p>
                                                    <p className="text-sm text-gray-500">{product.sku}</p>
                                                </div>
                                                <span className="font-bold text-blue-600">
                                                    {product.pricingModel === PricingModel.ByQuote ? 'Báo giá' : (product.price ?? 0).toLocaleString('vi-VN')}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto -mx-4 px-4 space-y-3">
                                {activeTab.cart.length > 0 ? (
                                    activeTab.cart.map(item => {
                                        const isByQuote = item.product.pricingModel === PricingModel.ByQuote;
                                        return (
                                            <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 flex flex-col gap-2 transition-all hover:shadow-md">
                                                <div className="flex gap-3 items-center w-full">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate">{item.product.name}</p>
                                                        {isByQuote ? (
                                                            <FormattedNumberInput
                                                                value={item.unitPrice}
                                                                onChange={(val) => updateItemDetails(item.id, { unitPrice: val })}
                                                                className="w-24 p-1 mt-1 text-sm border-b border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                                                                placeholder="Nhập giá"
                                                            />
                                                        ) : (
                                                            <p className="text-sm text-gray-500 mt-1">{item.unitPrice.toLocaleString('vi-VN')}đ</p>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden h-8">
                                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 border-r border-gray-300 font-bold">-</button>
                                                            <FormattedNumberInput 
                                                                value={item.quantity} 
                                                                onChange={(val) => updateQuantity(item.id, val)} 
                                                                className="w-14 h-full p-1 text-center border-none focus:ring-0 text-sm font-semibold text-gray-800"
                                                            />
                                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 border-l border-gray-300 font-bold">+</button>
                                                        </div>
                                                        {isByQuote ? (
                                                            <div className="w-24">
                                                                <CustomSelect
                                                                    options={unitOptions}
                                                                    value={item.unit || item.product.unit || ''}
                                                                    onChange={(value) => updateItemDetails(item.id, { unit: value })}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-center text-gray-700 bg-gray-100 border border-gray-200 rounded-md px-3 h-8 flex items-center justify-center w-24 font-medium">
                                                                {item.product.unit || 'cái'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="font-bold w-24 text-right">{item.totalPrice.toLocaleString('vi-VN')}đ</p>
                                                    
                                                    {/* Action Buttons */}
                                                    <div className="flex items-center gap-1">
                                                        <button 
                                                            onClick={() => updateActiveTab({ editingNoteOrderItemId: activeTab.editingNoteOrderItemId === item.id ? null : item.id })}
                                                            className={`p-1.5 rounded-md transition-colors ${item.note ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                                            title="Ghi chú"
                                                        >
                                                            <NoteIcon className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => updateQuantity(item.id, 0)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Xóa">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Note Section (Conditionally Rendered) */}
                                                {activeTab.editingNoteOrderItemId === item.id && (
                                                    <div className="relative mt-2 animate-fade-in-down">
                                                        <textarea 
                                                            value={item.note || ''} 
                                                            onChange={e => updateNote(item.id, e.target.value)} 
                                                            className="w-full text-sm p-2 pr-10 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y min-h-[60px] bg-yellow-50 border-yellow-200 text-gray-700" 
                                                            placeholder="Nhập ghi chú quy cách (VD: KT: 21x29.7cm, C150, in 2 mặt...)"
                                                            autoFocus
                                                        />
                                                        <button 
                                                            onClick={() => handleAiParse(item.id)}
                                                            className="absolute top-2 right-2 p-1.5 rounded-full text-yellow-600 bg-yellow-200 hover:bg-yellow-300 transition-colors disabled:opacity-50"
                                                            disabled={aiParsingItemId === item.id}
                                                            title="Phân tích ghi chú bằng AI"
                                                        >
                                                            {aiParsingItemId === item.id ? <RefreshIcon className="w-4 h-4 animate-spin"/> : <SparklesIcon className="w-4 h-4"/>}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* AI Parsed Tags */}
                                                {item.parsedDetails && Object.keys(item.parsedDetails).length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                        {Object.entries(item.parsedDetails).map(([key, value]) => value ? (
                                                            <span key={key} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
                                                                <span className="text-gray-500 font-normal capitalize">{key}: </span>{String(value)}
                                                            </span>
                                                        ) : null)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <svg className="w-24 h-24 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                        <p className="text-lg">Giỏ hàng trống</p>
                                        <p className="text-sm">Sử dụng ô tìm kiếm để thêm sản phẩm</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* RIGHT PANEL */}
                        <div className="lg:col-span-1 flex flex-col h-full bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-800">Khách hàng</label>
                                    <div className="flex items-center gap-x-2 mt-1">
                                        <div className="relative w-full" ref={customerSearchRef}>
                                            {selectedCustomer ? (
                                                <div className="w-full p-2 border rounded-lg bg-gray-100 border-gray-300 flex justify-between items-start group">
                                                    <div 
                                                        className="cursor-pointer hover:text-blue-600 transition-colors flex-1"
                                                        onClick={() => { setEditingCustomer(selectedCustomer); setIsCustomerModalOpen(true); }}
                                                        title="Click để sửa thông tin"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-sm">{selectedCustomer.name}</p>
                                                            <PencilIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /> 
                                                        </div>
                                                        <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => { updateActiveTab({ selectedCustomerId: '' }); setCustomerError(''); }}
                                                        className="text-gray-500 hover:text-red-600 text-xl leading-none -mt-1 ml-2"
                                                        title="Bỏ chọn"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <input 
                                                        type="text"
                                                        placeholder="Tìm tên, sđt, mã kh..."
                                                        value={customerSearchTerm}
                                                        onChange={e => {
                                                            setCustomerSearchTerm(e.target.value);
                                                            setIsCustomerSearchOpen(true);
                                                        }}
                                                        onFocus={() => setIsCustomerSearchOpen(true)}
                                                        onKeyDown={handleCustomerKeyDown}
                                                        className={`w-full p-2 border rounded-lg bg-white border-gray-300 transition-colors h-[42px] ${customerError ? 'border-red-500' : ''}`}
                                                    />
                                                    {isCustomerSearchOpen && customerSearchResults.length > 0 && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                                                            <ul>
                                                                {customerSearchResults.map((customer, index) => (
                                                                    <li 
                                                                        key={customer.id}
                                                                        onClick={() => handleCustomerSelect(customer)}
                                                                        className={`p-3 cursor-pointer border-b last:border-0 ${
                                                                            index === customerHighlightedIndex ? 'bg-blue-100' : 'hover:bg-blue-50'
                                                                        }`}
                                                                    >
                                                                        <p className="font-semibold text-sm">{customer.name}</p>
                                                                        <p className="text-xs text-gray-500">{customer.phone} - {customer.id}</p>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <button type="button" onClick={() => { setEditingCustomer(null); setIsCustomerModalOpen(true); }} className="flex-shrink-0 bg-blue-100 text-blue-600 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-blue-200 transition shadow-sm" title="Tạo mới khách hàng"><UserPlusIcon /></button>
                                        <button type="button" onClick={handleOpenDeliveryModal} className="flex-shrink-0 bg-yellow-100 text-yellow-700 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-yellow-200 transition shadow-sm" title="Giao hàng"><TruckIcon /></button>
                                        <button type="button" onClick={() => setIsPromotionModalOpen(true)} className="flex-shrink-0 bg-purple-100 text-purple-700 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-purple-200 transition shadow-sm" title="Khuyến mãi"><GiftIcon /></button>
                                    </div>
                                    {customerError && <p className="text-red-500 text-xs mt-1">{customerError}</p>}
                                    
                                    {selectedCustomer && selectedCustomer.creditBalance && selectedCustomer.creditBalance > 0 && (
                                        <div className="mt-2 p-2.5 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-800">
                                            <p className="text-sm font-bold flex items-center gap-1">
                                                <WarningIcon className="w-4 h-4"/>
                                                Cảnh báo công nợ
                                            </p>
                                            <p className="text-sm mt-1">Khách hàng này đang nợ: <strong>{selectedCustomer.creditBalance.toLocaleString('vi-VN')} đ</strong></p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2 border-t pt-3">
                                    <h3 className="text-sm font-semibold text-gray-800">Tóm tắt đơn hàng</h3>
                                    <div className="flex justify-between items-center"><span className="text-gray-600">Tổng tiền hàng</span><span className="font-semibold text-lg">{subTotal.toLocaleString('vi-VN')} đ</span></div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center"><input type="checkbox" id={`vat-${activeTab.id}`} checked={activeTab.wantsVat} onChange={(e) => updateActiveTab({ wantsVat: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor={`vat-${activeTab.id}`} className="ml-2 text-gray-600">VAT ({vatRate}%)</label></div>
                                        <span className="font-semibold text-lg">{vatAmount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 flex items-center gap-1"><TruckIcon className="w-4 h-4"/> Phí giao hàng</span>
                                        <span className="font-semibold text-lg">{activeTab.delivery.fee.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                     {activeTab.discountAmount > 0 && (
                                        <div className="flex justify-between items-center text-green-600 bg-green-50 p-1 rounded">
                                            <span className="flex items-center gap-1">
                                                <GiftIcon className="w-3 h-3"/> 
                                                KM ({activeTab.appliedPromotionCode})
                                                <button onClick={removePromotion} className="text-gray-400 hover:text-red-500 ml-1" title="Gỡ bỏ"><CloseIcon className="w-3 h-3"/></button>
                                            </span>
                                            <span className="font-semibold">- {activeTab.discountAmount.toLocaleString('vi-VN')} đ</span>
                                        </div>
                                    )}
                                </div>
                                 <div className="space-y-2 border-t pt-3">
                                    <div className="flex justify-between items-center"><span className="text-gray-600">Khách đã trả</span><span className="font-semibold text-lg text-green-600">{(activeTab.payment?.amount || 0).toLocaleString('vi-VN')} đ</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-600">Còn lại</span><span className="font-semibold text-lg text-red-600">{(grandTotal - (activeTab.payment?.amount || 0)).toLocaleString('vi-VN')} đ</span></div>
                                    <div className="flex justify-end gap-2 pt-1"><button onClick={() => setIsQrModalOpen(true)} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200" disabled={(grandTotal - (activeTab?.payment.amount || 0)) <= 0}>In mã QR</button></div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t">
                                <div className="flex justify-between items-center text-lg font-bold mb-3"><span className="text-gray-800">Khách cần trả</span><span className="text-blue-600">{grandTotal.toLocaleString('vi-VN')} đ</span></div>
                                <div className="flex items-center gap-2 mb-3">
                                    <input 
                                        type="checkbox" 
                                        id="print-on-save" 
                                        checked={printOnSave} 
                                        onChange={(e) => setPrintOnSave(e.target.checked)} 
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="print-on-save" className="text-sm text-gray-700 cursor-pointer select-none">In phiếu khi lưu</label>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setIsDepositModalOpen(true)}
                                            disabled={isActionDisabled}
                                            className="py-3 text-base font-bold text-white bg-[#F97316] rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300"
                                        >
                                            ĐẶT CỌC
                                        </button>
                                        <button 
                                            onClick={handleCheckout} 
                                            disabled={isActionDisabled}
                                            className="py-3 text-base font-bold text-white bg-[#10B981] rounded-lg hover:bg-green-600 transition-colors shadow-sm disabled:bg-green-300"
                                        >
                                            THANH TOÁN
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={handleCreateQuote}
                                            disabled={isActionDisabled}
                                            className="py-3 text-base font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:bg-gray-300"
                                        >
                                            <QuoteIcon /> BÁO GIÁ
                                        </button>
                                        <button 
                                            onClick={handleSaveOrder} 
                                            disabled={isActionDisabled}
                                            className="py-3 text-base font-bold text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400"
                                        >
                                            Lưu {isEditingQuote ? 'Báo giá' : 'Đơn hàng'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {isCustomerModalOpen && <CustomerModal customer={editingCustomer} onClose={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }} onSave={handleSaveCustomer} />}
                <DeliveryModal 
                    isOpen={isDeliveryModalOpen}
                    onClose={() => setIsDeliveryModalOpen(false)}
                    onSave={handleDeliveryUpdate}
                    initialData={activeTab?.delivery || { recipientName: '', phone: '', address: '', fee: 0, method: 'Tự giao' }}
                />
                 <DepositModal
                    isOpen={isDepositModalOpen}
                    onClose={() => setIsDepositModalOpen(false)}
                    onConfirm={handleSetPayment}
                    totalAmount={grandTotal}
                    currentPayment={activeTab?.payment || { amount: 0, method: PaymentMethod.Cash }}
                    bankAccounts={companyInfo.bankAccounts}
                    orderId={activeTab?.id || ''}
                />
                <SelectPromotionModal 
                    isOpen={isPromotionModalOpen} 
                    onClose={() => setIsPromotionModalOpen(false)} 
                    // FIX: Changed incorrect 'on' prop to 'onApply' and added 'currentOrderValue'.
                    onApply={handleApplyPromotionFromModal}
                    currentOrderValue={subTotal}
                />
                {receiptData && <ReceiptPrintModal order={receiptData} onClose={handleReceiptModalClose} title={receiptTitle} paymentAmount={receiptPaymentAmount} />}
                <QrPaymentModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} amount={(grandTotal - (activeTab?.payment.amount || 0))} bankAccount={companyInfo.bankAccounts[0]} orderId={activeTab?.id || ''} />
            </div>
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

export default PointOfSalePage;