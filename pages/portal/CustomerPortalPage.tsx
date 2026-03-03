
import React from 'react';
import { useData } from '../../context/DataContext';
import { OrderStatus } from '../../types';

// This is a SIMULATED external portal.
// In a real app, this would likely be a separate layout or even a separate app.
const CustomerPortalPage: React.FC = () => {
    const { orders, quotes, companyInfo } = useData();
    
    // Simulating a logged-in customer (ID: KH001)
    const customerId = 'KH001';
    const customerOrders = orders.filter(o => o.customer.id === customerId);
    const customerQuotes = quotes.filter(q => q.customer.id === customerId);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Portal Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={companyInfo.logoUrl} alt="Logo" className="h-8 w-auto" />
                        <span className="font-bold text-gray-900 text-lg border-l pl-3 ml-3 border-gray-300">Cổng thông tin Khách hàng</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Xin chào, <strong>Nguyễn Văn A</strong></span>
                        <button className="text-sm text-red-600 hover:underline">Đăng xuất</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                        <p className="text-sm text-gray-500 uppercase">Đơn hàng đang xử lý</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{customerOrders.filter(o => o.status !== OrderStatus.Delivered && o.status !== OrderStatus.Cancelled).length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
                        <p className="text-sm text-gray-500 uppercase">Tổng chi tiêu</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">
                            {customerOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString('vi-VN')} đ
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                        <p className="text-sm text-gray-500 uppercase">Báo giá chờ duyệt</p>
                        <p className="text-3xl font-bold text-purple-600 mt-1">{customerQuotes.length}</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Đơn hàng gần đây</h2>
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã ĐH</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customerOrders.map(order => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold">{order.totalAmount.toLocaleString('vi-VN')} đ</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === OrderStatus.Delivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-blue-600 hover:text-blue-900 mr-3">Chi tiết</button>
                                                <button className="text-gray-600 hover:text-gray-900">Đặt lại</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default CustomerPortalPage;
