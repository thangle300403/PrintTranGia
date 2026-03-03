
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';
import { Toast } from '../../components/Toast';
import { CheckCircleIcon, SettingsIcon } from '../../components/icons/Icons';
import { MeInvoiceConfig } from '../../types';

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { number: 1, title: 'Kết nối meinvoice.vn' },
        { number: 2, title: 'Thiết lập ký số điện tử' },
        { number: 3, title: 'Thiết lập khác' },
    ];

    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center justify-center w-full">
                {steps.map((step, stepIdx) => (
                    <li key={step.title} className={`relative flex flex-col items-center ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                         {stepIdx !== steps.length - 1 && (
                            <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${step.number < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        )}
                        
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                            step.number < currentStep ? 'bg-blue-600 border-blue-600' :
                            step.number === currentStep ? 'bg-white border-blue-600' : 'bg-white border-gray-300'
                        }`}>
                             {step.number < currentStep ? (
                                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                                </svg>
                            ) : step.number === currentStep ? (
                                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                            ) : (
                                <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                            )}
                        </div>
                        <p className={`mt-2 text-xs font-medium text-center ${step.number === currentStep ? 'text-blue-600' : 'text-gray-500'}`}>{step.title}</p>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

const StepLogin: React.FC<{ 
    data: MeInvoiceConfig, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    onNext: () => void, 
    loading: boolean 
}> = ({ data, onChange, onNext, loading }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="text-center">
            <img src="https://storage.googleapis.com/fjob-dev/meinvoice-illustration.png" alt="meInvoice Connection" className="max-w-xs mx-auto mb-8" />
            <h3 className="text-lg font-semibold text-gray-700">Bạn chưa có tài khoản kết nối?</h3>
            <button className="mt-4 px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition">
                Đăng ký ngay
            </button>
        </div>
        <div>
            <div className="text-center md:text-left">
                <img src="https://meinvoice.vn/wp-content/uploads/2021/08/logo-misa-meinvoice.svg" alt="MISA meInvoice Logo" className="h-10 mx-auto md:mx-0" />
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                    MISA meInvoice là phần mềm Hóa đơn điện tử giúp cửa hàng <strong>lập, tra cứu, lưu trữ hóa đơn</strong> bằng các phương tiện điện tử thay thế hóa đơn giấy truyền thống.
                </p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="mt-8 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mã số thuế/CCCD <span className="text-red-500">*</span></label>
                    <input type="text" name="taxCode" value={data.taxCode} onChange={onChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tên đăng nhập <span className="text-red-500">*</span></label>
                    <input type="text" name="username" value={data.username} onChange={onChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mật khẩu <span className="text-red-500">*</span></label>
                    <input type="password" name="password" value={data.password || ''} onChange={onChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-800 hover:bg-blue-900 focus:outline-none disabled:bg-blue-300">
                        {loading ? 'Đang kết nối...' : 'Kết nối'}
                    </button>
                </div>
            </form>
            <div className="mt-4 text-center">
                <Link to="/settings/integration" className="text-sm font-medium text-gray-500 hover:text-gray-800">&larr; Quay lại</Link>
            </div>
        </div>
    </div>
);

const StepSigning: React.FC<{
    method: 'esign' | 'usb' | undefined,
    onSelect: (method: 'esign' | 'usb') => void,
    onNext: () => void,
    onBack: () => void
}> = ({ method, onSelect, onNext, onBack }) => (
    <div className="max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-center text-gray-800 mb-8">Vui lòng chọn hình thức ký số</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
                onClick={() => onSelect('esign')}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md flex flex-col items-center text-center ${method === 'esign' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
            >
                 {method === 'esign' && (
                    <div className="absolute top-3 right-3 text-blue-600"><CheckCircleIcon className="w-6 h-6" /></div>
                )}
                <div className="h-16 flex items-center justify-center mb-4">
                     {/* Placeholder for MISA eSign Logo */}
                    <div className="bg-blue-600 text-white px-3 py-1 rounded font-bold text-xl">MISA eSign</div>
                </div>
                <span className="inline-block bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-3">Khuyên dùng</span>
                <h4 className="font-bold text-gray-800 mb-2">Chữ ký số từ xa MISA eSign</h4>
                <p className="text-sm text-gray-600">Chữ ký số từ xa MISA eSign hỗ trợ ký mọi lúc, mọi nơi, an toàn và đảm bảo bảo mật tuyệt đối.</p>
            </div>

            <div 
                onClick={() => onSelect('usb')}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md flex flex-col items-center text-center ${method === 'usb' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
            >
                 {method === 'usb' && (
                    <div className="absolute top-3 right-3 text-blue-600"><CheckCircleIcon className="w-6 h-6" /></div>
                )}
                <div className="h-16 flex items-center justify-center mb-4">
                    {/* Placeholder for USB Icon */}
                    <div className="bg-gray-800 text-white px-3 py-1 rounded font-bold text-xl">USB Token</div>
                </div>
                <h4 className="font-bold text-gray-800 mb-2 mt-7">Ký trực tiếp qua USB</h4>
                <p className="text-sm text-gray-600">Thiết bị đang sử dụng cần cài đặt công cụ MISA KYSO. Thiết bị cần được cắm USB chứa ký số khi thực hiện phát hành.</p>
            </div>
        </div>

        <div className="mt-8 flex justify-between">
            <button onClick={onBack} className="px-6 py-2 text-gray-600 font-semibold hover:text-gray-800">&larr; Quay lại</button>
            <button 
                onClick={onNext} 
                disabled={!method}
                className="px-8 py-2 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
                Tiếp tục
            </button>
        </div>
    </div>
);

const StepConfig: React.FC<{
    data: MeInvoiceConfig,
    onChange: (updates: Partial<MeInvoiceConfig>) => void,
    onComplete: () => void,
    onBack: () => void
}> = ({ data, onChange, onComplete, onBack }) => {
    return (
        <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Thiết lập khác</h3>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={data.autoSendEmail} 
                            onChange={(e) => onChange({ autoSendEmail: e.target.checked })}
                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-gray-700 font-medium">Tự động gửi hóa đơn cho khách hàng</span>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={data.issueFromPos} 
                            onChange={(e) => onChange({ issueFromPos: e.target.checked })}
                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-gray-700 font-medium">Phát hành hóa đơn điện tử từ máy tính tiền</span>
                    </label>

                    <div className="pl-8 space-y-3 border-l-2 border-gray-200 ml-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="issueTiming"
                                checked={data.issueTiming === 'immediate'}
                                onChange={() => onChange({ issueTiming: 'immediate' })}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-600">Mặc định phát hành hóa đơn điện tử ngay sau khi thu tiền từ máy tính tiền</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="issueTiming"
                                checked={data.issueTiming === 'after_delivery'}
                                onChange={() => onChange({ issueTiming: 'after_delivery' })}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-600">Luôn phát hành HĐĐT từ MTT sau khi nhấn Giao hàng</span>
                        </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="issueTiming"
                                checked={data.issueTiming === 'daily'}
                                onChange={() => onChange({ issueTiming: 'daily' })}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-600">Tự động phát hành hóa đơn điện tử từ máy tính tiền cho các hóa đơn bán trong ngày</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-100">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu hóa đơn mặc định</label>
                        <select 
                            value={data.defaultInvoiceTemplate} 
                            onChange={(e) => onChange({ defaultInvoiceTemplate: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="1C25MYY">1C25MYY</option>
                            <option value="2C25MYY">2C25MYY</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thiết lập thông tin người mua mặc định (Khách lẻ)</label>
                        <input 
                            type="text" 
                            value={data.defaultBuyerName}
                            onChange={(e) => onChange({ defaultBuyerName: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            placeholder="Khách lẻ không lấy hóa đơn"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={onBack} className="px-6 py-2 text-gray-600 font-semibold hover:text-gray-800">&larr; Quay lại</button>
                <button 
                    onClick={onComplete}
                    className="px-8 py-2 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 transition"
                >
                    Hoàn thành
                </button>
            </div>
        </div>
    );
};

const ConnectedDashboard: React.FC<{
    data: MeInvoiceConfig,
    onDisconnect: () => void,
    onConfigure: () => void
}> = ({ data, onDisconnect, onConfigure }) => (
    <div className="flex flex-col md:flex-row gap-12 items-start justify-center">
        <div className="w-full md:w-1/3 flex justify-center">
            <img 
                src="https://cdn.dribbble.com/users/1233499/screenshots/3850691/media/1b361a8a759a0d6d2a93b54e789b5d4a.png?resize=400x300&vertical=center" 
                alt="Connected" 
                className="w-full max-w-xs object-contain"
            />
        </div>
        <div className="w-full md:w-2/3 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Hoàn thành kết nối</h2>
                <p className="text-gray-600">
                    Hoàn thành kết nối <strong>ERP</strong> và phần mềm hóa đơn điện tử <strong>MISA meInvoice</strong>.<br/>
                    Bạn có thể phát hành ngay Hóa đơn điện tử.
                </p>
            </div>

            <button 
                onClick={onDisconnect}
                className="px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm font-medium transition"
            >
                Ngắt kết nối
            </button>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-3">
                <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Mã số thuế/CCCD:</span>
                    <span className="text-gray-900">{data.taxCode}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Số HĐ còn được sử dụng:</span>
                    <span className="text-gray-900">1.664</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Hình thức ký số:</span>
                    <span className="text-gray-900">
                        {data.signingMethod === 'esign' ? 'MISA eSign (Từ xa)' : 'USB Token (Trực tiếp)'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                    onClick={onConfigure}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-center"
                >
                    Thiết lập khác
                </button>
                <button className="flex-1 px-6 py-3 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 transition text-center shadow-md">
                    Phát hành hóa đơn điện tử
                </button>
            </div>
        </div>
    </div>
);

const MeInvoiceIntegrationPage: React.FC = () => {
    const { integrationSettings, updateIntegrationSettings } = useData();
    const [formData, setFormData] = useState<MeInvoiceConfig>(integrationSettings.meInvoiceSettings);
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState('');

    // Sync local state if context changes (e.g. disconnect from elsewhere)
    useEffect(() => {
        setFormData(integrationSettings.meInvoiceSettings);
        if (integrationSettings.meInvoiceSettings.isConnected) {
            setCurrentStep(4); // Dashboard
        } else {
            setCurrentStep(1);
        }
    }, [integrationSettings.meInvoiceSettings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleConfigChange = (updates: Partial<MeInvoiceConfig>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            // Simulate successful login but don't save "isConnected" globally yet, 
            // just move to next step locally
            setIsLoading(false);
            setCurrentStep(2);
        }, 1000);
    };

    const handleCompleteSetup = () => {
        const finalConfig = { ...formData, isConnected: true };
        updateIntegrationSettings({ 
            ...integrationSettings, 
            meInvoiceSettings: finalConfig 
        });
        setToast('Kết nối MISA meInvoice thành công!');
        setCurrentStep(4);
    };

    const handleDisconnect = () => {
        if (window.confirm('Bạn có chắc chắn muốn ngắt kết nối không?')) {
            const newSettings = { 
                ...integrationSettings, 
                meInvoiceSettings: { ...formData, isConnected: false, signingMethod: undefined } 
            };
            updateIntegrationSettings(newSettings);
            setToast('Đã ngắt kết nối.');
            setCurrentStep(1);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-6xl mx-auto min-h-[600px]">
            {currentStep < 4 && (
                <div className="mb-16">
                    <Stepper currentStep={currentStep} />
                </div>
            )}

            {currentStep === 1 && (
                <StepLogin 
                    data={formData} 
                    onChange={handleInputChange} 
                    onNext={handleLogin} 
                    loading={isLoading} 
                />
            )}

            {currentStep === 2 && (
                <StepSigning 
                    method={formData.signingMethod}
                    onSelect={(method) => handleConfigChange({ signingMethod: method })}
                    onNext={() => setCurrentStep(3)}
                    onBack={() => setCurrentStep(1)}
                />
            )}

            {currentStep === 3 && (
                <StepConfig 
                    data={formData}
                    onChange={handleConfigChange}
                    onComplete={handleCompleteSetup}
                    onBack={() => setCurrentStep(2)}
                />
            )}

            {currentStep === 4 && (
                <ConnectedDashboard 
                    data={formData}
                    onDisconnect={handleDisconnect}
                    onConfigure={() => setCurrentStep(3)} // Allow editing settings
                />
            )}

            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </div>
    );
};

export default MeInvoiceIntegrationPage;
