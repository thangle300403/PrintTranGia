
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IntegrationSettings, MeInvoiceConfig } from '../../types';
import { LinkIcon, CheckIcon, RefreshIcon, DocumentDuplicateIcon, ZaloIcon, CheckCircleIcon, KeyIcon, SettingsIcon, LogoutIcon, BankIcon, CreditCardIcon } from '../../components/icons/Icons';
import { Toast } from '../../components/Toast';
import { Link } from 'react-router-dom';

// --- Bank Integration Sub-Component ---

const BankIntegrationTab: React.FC = () => {
    const { companyInfo, updateCompanyInfo } = useData();
    const [apiKey, setApiKey] = useState('sk_live_xxxxxxxxxxxx');
    const [webhookUrl, setWebhookUrl] = useState(`https://api.trangia-erp.com/webhooks/bank/${companyInfo.taxCode}`);
    const [toast, setToast] = useState('');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setToast('Đã sao chép vào bộ nhớ tạm.');
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
                <div className="lg:w-1/2 space-y-6">
                    <div className="inline-block p-4 bg-emerald-50 rounded-2xl mb-2">
                        <BankIcon className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Tự động hóa Ngân hàng</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                        Kết nối với các nền tảng **Casso, PayOS hoặc VietQR** để nhận thông báo thanh toán tức thì. Đơn hàng sẽ tự động chuyển trạng thái "Đã thanh toán" ngay khi khách chuyển khoản thành công.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white">Cấu hình Webhook</h4>
                                <p className="text-sm text-gray-500 mt-1">Sao chép URL này dán vào cấu hình Webhook trên trang quản trị ngân hàng của bạn.</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <code className="bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg text-xs font-mono text-blue-600 flex-1 break-all border dark:border-gray-700">{webhookUrl}</code>
                                    <button onClick={() => copyToClipboard(webhookUrl)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><DocumentDuplicateIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 dark:text-white">Nhập API Key / Token</h4>
                                <p className="text-sm text-gray-500 mt-1">Nhập khóa bí mật được cấp từ dịch vụ Auto-Banking.</p>
                                <div className="mt-3 relative">
                                    <input 
                                        type="password" 
                                        value={apiKey} 
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-95">
                            Lưu cấu hình & Kết nối
                        </button>
                    </div>
                </div>

                <div className="lg:w-1/2 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6">Trạng thái các tài khoản</h3>
                    <div className="space-y-4">
                        {companyInfo.bankAccounts.map(acc => (
                            <div key={acc.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                                        {acc.bankName.substring(0, 3).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{acc.bankName}</p>
                                        <p className="text-xs text-gray-500 font-mono">{acc.accountNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        ACTIVE
                                    </span>
                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"><SettingsIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                         <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                             <CheckCircleIcon className="w-4 h-4"/> 
                             Ghi chú quan trọng
                         </h4>
                         <p className="text-xs text-blue-700 dark:text-blue-400 mt-2 leading-relaxed">
                             Để tính năng này hoạt động chính xác, bạn cần cấu hình <strong>Mẫu nội dung chuyển khoản</strong> trong phần "Thông tin công ty" phải chứa biến <code className="bg-blue-100 px-1 rounded">{`{orderId}`}</code>. Hệ thống sẽ dựa vào mã này để tìm đơn hàng.
                         </p>
                    </div>
                </div>
            </div>
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </div>
    );
};

// --- MeInvoice Sub-Components (Keep existing) ---

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { number: 1, title: 'Kết nối tài khoản' },
        { number: 2, title: 'Hình thức ký số' },
        { number: 3, title: 'Cấu hình phát hành' },
    ];

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-center relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
                <div 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 rounded-full -z-10 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
                <div className="flex justify-between w-full max-w-3xl px-4">
                    {steps.map((step) => {
                        const isCompleted = step.number < currentStep;
                        const isActive = step.number === currentStep;
                        return (
                            <div key={step.number} className="flex flex-col items-center group">
                                <div 
                                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold transition-all duration-300 bg-white 
                                    ${isActive ? 'border-blue-600 text-blue-600 scale-110 shadow-md' : 
                                      isCompleted ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}
                                >
                                    {isCompleted ? <CheckIcon className="w-5 h-5" /> : step.number}
                                </div>
                                <span className={`mt-2 text-sm font-medium transition-colors duration-300 ${isActive ? 'text-blue-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const StepLogin: React.FC<{ 
    data: MeInvoiceConfig, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    onNext: () => void, 
    loading: boolean 
}> = ({ data, onChange, onNext, loading }) => (
    <div className="flex flex-col lg:flex-row gap-12 items-center justify-center py-8">
        <div className="lg:w-5/12 text-center lg:text-left space-y-6">
            <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                <img src="https://meinvoice.vn/wp-content/uploads/2021/08/logo-misa-meinvoice.svg" alt="MISA meInvoice" className="h-12 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Kết nối Hóa đơn điện tử</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
                Đồng bộ hóa đơn bán hàng từ phần mềm ERP sang MISA meInvoice tự động, giúp tiết kiệm 90% thời gian nhập liệu.
            </p>
             <div className="flex flex-col gap-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500"/> Phát hành hóa đơn ngay khi bán hàng</div>
                <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500"/> Tự động gửi email cho khách</div>
                <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500"/> Tra cứu hóa đơn dễ dàng</div>
            </div>
        </div>
        <div className="lg:w-5/12 w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Thông tin đăng nhập</h3>
            <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mã số thuế <span className="text-red-500">*</span></label>
                    <input type="text" name="taxCode" value={data.taxCode} onChange={onChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="VD: 0313843142" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
                    <input type="text" name="username" value={data.username} onChange={onChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Email hoặc số điện thoại" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                    <input type="password" name="password" value={data.password || ''} onChange={onChange} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                    {loading && <RefreshIcon className="w-5 h-5 animate-spin"/>}
                    {loading ? 'Đang xác thực...' : 'Kết nối ngay'}
                </button>
                <div className="text-center mt-4">
                    <a href="https://meinvoice.vn/" target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium">Chưa có tài khoản? Đăng ký tại đây</a>
                </div>
            </form>
        </div>
    </div>
);

const StepSigning: React.FC<{
    method: 'esign' | 'usb' | undefined,
    onSelect: (method: 'esign' | 'usb') => void,
    onNext: () => void,
    onBack: () => void
}> = ({ method, onSelect, onNext, onBack }) => (
    <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900">Chọn hình thức ký số</h3>
            <p className="text-gray-500 mt-2">Lựa chọn phương thức ký điện tử phù hợp với doanh nghiệp của bạn</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div onClick={() => onSelect('esign')} className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center h-full ${method === 'esign' ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                {method === 'esign' && <div className="absolute top-3 right-3 text-blue-600 bg-white rounded-full"><CheckCircleIcon className="w-8 h-8" /></div>}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">KHUYÊN DÙNG</div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${method === 'esign' ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg></div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">MISA eSign (Từ xa)</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Ký số mọi lúc mọi nơi không cần USB Token. Bảo mật tuyệt đối, tích hợp sẵn.</p>
            </div>
            <div onClick={() => onSelect('usb')} className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center h-full ${method === 'usb' ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                {method === 'usb' && <div className="absolute top-3 right-3 text-blue-600 bg-white rounded-full"><CheckCircleIcon className="w-8 h-8" /></div>}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${method === 'usb' ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}><KeyIcon className="w-8 h-8" /></div>
                <h4 className="font-bold text-gray-900 text-lg mb-2">USB Token (Trực tiếp)</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Sử dụng thiết bị USB Token truyền thống. Yêu cầu cắm USB vào máy tính khi phát hành.</p>
            </div>
        </div>
        <div className="flex justify-between pt-6 border-t border-gray-200">
            <button onClick={onBack} className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition">Quay lại</button>
            <button onClick={onNext} disabled={!method} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition transform active:scale-95">Tiếp tục</button>
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; description?: string }> = ({ label, checked, onChange, description }) => (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
        <div>
            <span className="text-base font-medium text-gray-900 block">{label}</span>
            {description && <span className="text-sm text-gray-500 mt-1 block">{description}</span>}
        </div>
        <button
            type="button"
            className={`${checked ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
        >
            <span aria-hidden="true" className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
        </button>
    </div>
);

const StepConfig: React.FC<{
    data: MeInvoiceConfig,
    onChange: (updates: Partial<MeInvoiceConfig>) => void,
    onComplete: () => void,
    onBack: () => void
}> = ({ data, onChange, onComplete, onBack }) => (
    <div className="max-w-3xl mx-auto py-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thiết lập quy tắc</h3>
        <p className="text-gray-500 mb-8">Cấu hình cách hệ thống tự động xử lý hóa đơn</p>
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Tự động hóa</h4>
                <ToggleSwitch label="Tự động gửi email" description="Gửi hóa đơn qua email cho khách hàng ngay khi phát hành thành công." checked={data.autoSendEmail || false} onChange={(v) => onChange({ autoSendEmail: v })} />
                <ToggleSwitch label="Kích hoạt tại POS" description="Cho phép nhân viên thu ngân phát hành hóa đơn trực tiếp từ màn hình bán hàng." checked={data.issueFromPos || false} onChange={(v) => onChange({ issueFromPos: v })} />
                <div className="mt-4 pt-4">
                    <label className="block text-sm font-medium text-gray-900 mb-3">Thời điểm phát hành hóa đơn (từ POS)</label>
                    <div className="space-y-3">
                        {[
                            { value: 'immediate', label: 'Ngay lập tức', desc: 'Phát hành ngay khi đơn hàng được thanh toán' },
                            { value: 'after_delivery', label: 'Sau khi giao hàng', desc: 'Chỉ phát hành khi đơn hàng chuyển trạng thái "Hoàn thành"' },
                            { value: 'daily', label: 'Cuối ngày', desc: 'Gom tất cả đơn hàng và phát hành một lần vào cuối ngày' }
                        ].map((option) => (
                            <label key={option.value} className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${data.issueTiming === option.value ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="radio" name="issueTiming" checked={data.issueTiming === option.value} onChange={() => onChange({ issueTiming: option.value as any })} className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                <div className="ml-3"><span className="block text-sm font-medium text-gray-900">{option.label}</span><span className="block text-xs text-gray-500 mt-1">{option.desc}</span></div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Thông tin mặc định</h4>
                <div className="grid grid-cols-1 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu hóa đơn</label>
                        <select value={data.defaultInvoiceTemplate} onChange={(e) => onChange({ defaultInvoiceTemplate: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50">
                            <option value="1C25MYY">Mẫu GTGT Cơ bản (1C25MYY)</option>
                            <option value="2C25MYY">Mẫu GTGT Có logo (2C25MYY)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Khách lẻ mặc định</label>
                        <input type="text" value={data.defaultBuyerName} onChange={(e) => onChange({ defaultBuyerName: e.target.value })} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="VD: Khách lẻ không lấy hóa đơn" />
                    </div>
                </div>
            </div>
        </div>
        <div className="mt-8 flex justify-between pt-6 border-t border-gray-200">
            <button onClick={onBack} className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition">Quay lại</button>
            <button onClick={onComplete} className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg transition transform active:scale-95 flex items-center gap-2"><CheckIcon className="w-5 h-5" /> Hoàn tất cài đặt</button>
        </div>
    </div>
);

const DashboardStat: React.FC<{ label: string; value: string | number; subtext?: string; color?: string }> = ({ label, value, subtext, color = "text-gray-900" }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
);

const ConnectedDashboard: React.FC<{
    data: MeInvoiceConfig,
    onDisconnect: () => void,
    onConfigure: () => void
}> = ({ data, onDisconnect, onConfigure }) => (
    <div className="max-w-4xl mx-auto py-8">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircleIcon className="w-10 h-10" /></div>
             <h2 className="text-2xl font-bold text-green-800 mb-2">Kết nối thành công!</h2>
             <p className="text-green-700">Hệ thống đã sẵn sàng phát hành hóa đơn điện tử qua MISA meInvoice.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <DashboardStat label="Mã số thuế" value={data.taxCode} />
            <DashboardStat label="Hóa đơn còn lại" value="1,664" color="text-blue-600" subtext="Hạn SD: 31/12/2025" />
            <DashboardStat label="Phương thức ký" value={data.signingMethod === 'esign' ? 'MISA eSign' : 'USB Token'} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Thông tin cấu hình</h3>
                <button onClick={onConfigure} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"><SettingsIcon className="w-4 h-4" /> Chỉnh sửa</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Tài khoản kết nối:</span><span className="font-medium">{data.username}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Tự động gửi Email:</span><span className={`font-medium ${data.autoSendEmail ? 'text-green-600' : 'text-gray-600'}`}>{data.autoSendEmail ? 'Đang bật' : 'Đang tắt'}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Phát hành từ POS:</span><span className={`font-medium ${data.issueFromPos ? 'text-green-600' : 'text-gray-600'}`}>{data.issueFromPos ? 'Đang bật' : 'Đang tắt'}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Thời điểm phát hành:</span><span className="font-medium">{data.issueTiming === 'immediate' ? 'Ngay lập tức' : data.issueTiming === 'after_delivery' ? 'Sau giao hàng' : 'Cuối ngày'}</span></div>
                <div className="flex justify-between md:col-span-2 pt-2"><span className="text-gray-500">Mẫu hóa đơn mặc định:</span><span className="font-medium font-mono bg-gray-100 px-2 py-0.5 rounded">{data.defaultInvoiceTemplate}</span></div>
            </div>
        </div>
        <div className="flex justify-center"><button onClick={onDisconnect} className="flex items-center gap-2 px-6 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition"><LogoutIcon className="w-5 h-5" /> Ngắt kết nối tài khoản</button></div>
    </div>
);

const MeInvoiceTab: React.FC = () => {
    const { integrationSettings, updateIntegrationSettings } = useData();
    const [formData, setFormData] = useState<MeInvoiceConfig>(integrationSettings.meInvoiceSettings);
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        setFormData(integrationSettings.meInvoiceSettings);
        if (integrationSettings.meInvoiceSettings.isConnected) setCurrentStep(4); 
        else setCurrentStep(1);
    }, [integrationSettings.meInvoiceSettings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleConfigChange = (updates: Partial<MeInvoiceConfig>) => setFormData(prev => ({ ...prev, ...updates }));

    const handleLogin = () => {
        setIsLoading(true);
        setTimeout(() => { setIsLoading(false); setCurrentStep(2); }, 1000);
    };

    const handleCompleteSetup = () => {
        updateIntegrationSettings({ ...integrationSettings, meInvoiceSettings: { ...formData, isConnected: true } });
        setToast('Kết nối MISA meInvoice thành công!');
        setCurrentStep(4);
    };

    const handleDisconnect = () => {
        if (window.confirm('Bạn có chắc chắn muốn ngắt kết nối không?')) {
            updateIntegrationSettings({ ...integrationSettings, meInvoiceSettings: { ...formData, isConnected: false, signingMethod: undefined } });
            setToast('Đã ngắt kết nối.');
            setCurrentStep(1);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-white min-h-[600px]">
             {currentStep < 4 && <div className="mb-8"><Stepper currentStep={currentStep} /></div>}
            {currentStep === 1 && <StepLogin data={formData} onChange={handleInputChange} onNext={handleLogin} loading={isLoading} />}
            {currentStep === 2 && <StepSigning method={formData.signingMethod} onSelect={(method) => handleConfigChange({ signingMethod: method })} onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
            {currentStep === 3 && <StepConfig data={formData} onChange={handleConfigChange} onComplete={handleCompleteSetup} onBack={() => setCurrentStep(2)} />}
            {currentStep === 4 && <ConnectedDashboard data={formData} onDisconnect={handleDisconnect} onConfigure={() => setCurrentStep(3)} />}
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </div>
    );
};

// --- Website / Zalo Tab (Existing) ---

const WebsiteZaloTab: React.FC = () => {
    const { integrationSettings, updateIntegrationSettings } = useData();
    const [formData, setFormData] = useState<IntegrationSettings>(integrationSettings);
    const [isChecking, setIsChecking] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isCheckingZalo, setIsCheckingZalo] = useState(false);
    const [toast, setToast] = useState('');

    const inputClass = "w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    useEffect(() => { setFormData(integrationSettings); }, [integrationSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('zaloSettings.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, zaloSettings: { ...prev.zaloSettings, [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleCheckConnection = () => {
        if (!formData.websiteUrl) return alert('Vui lòng nhập địa chỉ Website.');
        setIsChecking(true);
        setTimeout(() => { setIsChecking(false); setFormData(prev => ({ ...prev, isConnected: true })); setToast('Kết nối Website thành công!'); }, 1500);
    };
    
    const handleManualSync = () => {
        if (!formData.isConnected) return alert('Vui lòng kết nối Website trước khi đồng bộ.');
        setIsSyncing(true);
        setTimeout(() => { setIsSyncing(false); const now = new Date(); setFormData(prev => ({ ...prev, lastSyncAt: now })); updateIntegrationSettings({ ...formData, lastSyncAt: now }); setToast('Đồng bộ dữ liệu hoàn tất!'); }, 2000);
    };

    const handleSave = () => { updateIntegrationSettings(formData); setToast('Đã lưu cấu hình.'); };

    return (
        <div className="space-y-6 p-6">
             <div className="flex justify-end"><button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm">Lưu cấu hình</button></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><LinkIcon /> Thông tin kết nối (WooCommerce / API)</h2>
                        <div className="space-y-4">
                            <div><label className={labelClass}>Địa chỉ Website (URL)</label><input name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="https://example.com" className={inputClass} /></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className={labelClass}>Consumer Key</label><input name="consumerKey" value={formData.consumerKey} onChange={handleChange} placeholder="ck_xxxxxxxxxxxxxxxx" className={inputClass} type="password" /></div>
                                <div><label className={labelClass}>Consumer Secret</label><input name="consumerSecret" value={formData.consumerSecret} onChange={handleChange} placeholder="cs_xxxxxxxxxxxxxxxx" className={inputClass} type="password" /></div>
                            </div>
                            <div className="flex items-center justify-between pt-4"><div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${formData.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái: {formData.isConnected ? 'Đã kết nối' : 'Chưa kết nối'}</span></div><button onClick={handleCheckConnection} disabled={isChecking} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2">{isChecking ? <div className="animate-spin w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full"></div> : <RefreshIcon className="w-4 h-4" />}Kiểm tra kết nối</button></div>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Thao tác</h2><div className="text-center"><button onClick={handleManualSync} disabled={isSyncing || !formData.isConnected} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:bg-indigo-300"> {isSyncing ? 'Đang đồng bộ...' : <><RefreshIcon className="w-5 h-5" /> Đồng bộ Ngay</>}</button><p className="text-xs text-gray-500 mt-3">Lần đồng bộ cuối: {formData.lastSyncAt ? new Date(formData.lastSyncAt).toLocaleString('vi-VN') : 'Chưa đồng bộ'}</p></div></div>
                </div>
            </div>
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </div>
    );
};


const IntegrationPage: React.FC = () => {
    const { currentUser, rolePermissions } = useData();
    const [activeTab, setActiveTab] = useState<'website' | 'meinvoice' | 'banking'>('website');

    const hasPermission = useMemo(() => {
        if (!currentUser) return false;
        const permissions = rolePermissions[currentUser.roleId] || [];
        return permissions.includes('manage_integration') || 
               permissions.includes('manage_zalo_integration') || 
               permissions.includes('manage_einvoice_integration');
    }, [currentUser, rolePermissions]);

    if (!hasPermission) return <div className="text-center p-8 text-red-600 text-xl">Bạn không có quyền truy cập trang này.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kết nối mở rộng</h1>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('website')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'website' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Website & Zalo</button>
                    <button onClick={() => setActiveTab('banking')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'banking' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Ngân hàng (Auto-Banking)</button>
                    <button onClick={() => setActiveTab('meinvoice')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'meinvoice' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Hóa đơn Điện tử</button>
                </nav>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[600px]">
                {activeTab === 'website' && <WebsiteZaloTab />}
                {activeTab === 'meinvoice' && <MeInvoiceTab />}
                {activeTab === 'banking' && <BankIntegrationTab />}
            </div>
        </div>
    );
};

export default IntegrationPage;
