import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ContractStatus } from '../../types';
import { 
    UserCircleIcon, CreditCardIcon, CalendarIcon, CheckCircleIcon, 
    PencilIcon, DocumentDuplicateIcon, XCircleIcon, PrinterIcon, TrashIcon, 
    PaperClipIcon, DownloadIcon, DocumentTextIcon 
} from '../../components/icons/Icons';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Toast } from '../../components/Toast';

const getStatusInfo = (status: ContractStatus) => {
  switch (status) {
    case ContractStatus.Active: return { text: 'Đang hiệu lực', color: 'text-green-600', bg: 'bg-green-100' };
    case ContractStatus.Expired: return { text: 'Đã hết hạn', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    case ContractStatus.Terminated: return { text: 'Đã thanh lý', color: 'text-gray-600', bg: 'bg-gray-200' };
    case ContractStatus.Draft: return { text: 'Soạn thảo', color: 'text-blue-600', bg: 'bg-blue-100' };
    default: return { text: status, color: 'text-gray-700', bg: 'bg-gray-100'};
  }
};

const DetailCard: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
            <span className="text-blue-600">{icon}</span>
            {title}
        </h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const DetailRow: React.FC<{ label: string, value: string | React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-start text-sm">
        <p className="text-gray-500 dark:text-gray-400 w-1/3">{label}</p>
        <div className="font-semibold text-gray-800 dark:text-gray-200 text-right w-2/3">{value}</div>
    </div>
);

const ContractDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getContractById, customers, users, deleteContract, renewContract } = useData();

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    
    const contract = id ? getContractById(id) : undefined;

    if (!contract) {
        return <div className="text-center p-8">Đang tải thông tin hợp đồng...</div>;
    }

    const customer = customers.find(c => c.id === contract.customerId);
    const salesperson = users.find(u => u.id === contract.salespersonId);
    const statusInfo = getStatusInfo(contract.status);

    const handleDelete = () => {
        if (!contract) return;
        deleteContract(contract.id);
        setIsConfirmDeleteOpen(false);
        navigate('/contracts');
    };

    const handleRenew = () => {
        if(!contract) return;
        const newContract = renewContract(contract.id);
        if (newContract) {
            navigate(`/contracts/${newContract.id}/edit`);
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate max-w-2xl">{contract.title}</h1>
                        <p className="text-gray-500 mt-1">Mã hợp đồng: <span className="font-mono">{contract.id}</span></p>
                    </div>
                    <span className={`px-4 py-2 text-sm font-bold rounded-full ${statusInfo.bg} ${statusInfo.color}`}>{statusInfo.text}</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <DetailCard title="Nội dung Hợp đồng" icon={<DocumentTextIcon />}>
                            <div className="prose prose-sm max-w-none p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600 min-h-[300px]">
                                {contract.content ? <div dangerouslySetInnerHTML={{ __html: contract.content.replace(/\n/g, '<br/>') }} /> : <p className="italic text-gray-400">Không có nội dung chi tiết.</p>}
                            </div>
                        </DetailCard>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 space-y-6">
                         <DetailCard title="Thông tin Chung" icon={<UserCircleIcon />}>
                            <DetailRow label="Khách hàng" value={customer?.name || 'Không rõ'} />
                            <DetailRow label="Nhân viên KD" value={salesperson?.name || 'Không rõ'} />
                            <DetailRow label="Giá trị HĐ" value={<span className="text-green-600">{contract.contractValue.toLocaleString('vi-VN')} đ</span>} />
                            <DetailRow label="Ngày ký" value={new Date(contract.signingDate).toLocaleDateString('vi-VN')} />
                            <DetailRow label="Ngày hết hạn" value={contract.expiryDate ? new Date(contract.expiryDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'} />
                        </DetailCard>
                         <DetailCard title="Hành động" icon={<PencilIcon />}>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => navigate(`/contracts/${contract.id}/edit`)} className="flex items-center gap-2 justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
                                    <PencilIcon className="w-4 h-4"/> Sửa
                                </button>
                                 <button onClick={handleRenew} className="flex items-center gap-2 justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition">
                                    <DocumentDuplicateIcon className="w-4 h-4"/> Gia hạn
                                </button>
                                 <button onClick={() => window.print()} className="flex items-center gap-2 justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                                    <PrinterIcon className="w-4 h-4"/> In hợp đồng
                                </button>
                                 <button onClick={() => setIsConfirmDeleteOpen(true)} className="flex items-center gap-2 justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition">
                                    <TrashIcon className="w-4 h-4"/> Xóa
                                </button>
                            </div>
                        </DetailCard>
                        {contract.attachments && contract.attachments.length > 0 && (
                             <DetailCard title="Tệp đính kèm" icon={<PaperClipIcon />}>
                                {contract.attachments.map(file => (
                                    <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <a href={file.url} download={file.name} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500" title="Tải xuống">
                                            <DownloadIcon className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))}
                            </DetailCard>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmationModal 
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Xác nhận Xóa"
                message="Bạn có chắc chắn muốn xóa hợp đồng này không? Hành động này không thể hoàn tác."
            />
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
        </>
    );
};

export default ContractDetailPage;