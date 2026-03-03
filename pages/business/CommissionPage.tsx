import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { OrderStatus } from '../../types';
import DatePicker from '../../components/DatePicker';

const CommissionPage: React.FC = () => {
    const { orders, users, commissionPolicies } = useData();
    const [startDate, setStartDate] = useState('2025-11-01');
    const [endDate, setEndDate] = useState('2025-11-30');

    const commissionReport = useMemo(() => {
        if (!startDate || !endDate) return [];

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const eligibleOrders = orders.filter(o => 
            o.status === OrderStatus.Paid && 
            new Date(o.orderDate) >= start && 
            new Date(o.orderDate) <= end
        );

        const report = users
            .filter(u => u.commissionPolicyId)
            .map(user => {
                const policy = commissionPolicies.find(p => p.id === user.commissionPolicyId);
                if (!policy) return null;

                const userOrders = eligibleOrders.filter(o => o.customer.assignedToUserId === user.id); 
                
                if (userOrders.length === 0) {
                    return null;
                }

                const totalRevenue = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                
                // Find the correct commission tier
                const applicableTier = [...policy.tiers]
                    .sort((a, b) => b.revenueThreshold - a.revenueThreshold)
                    .find(tier => totalRevenue >= tier.revenueThreshold);

                if (!applicableTier) return null;

                const commission = totalRevenue * (applicableTier.commissionRate / 100);

                return {
                    user,
                    orderCount: userOrders.length,
                    totalRevenue,
                    commission,
                    effectiveRate: applicableTier.commissionRate,
                };
            })
            .filter((r): r is NonNullable<typeof r> => r !== null); 
            
        return report;
    }, [orders, users, commissionPolicies, startDate, endDate]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[var(--gray-900)] dark:text-white">Tính lương thưởng / Hoa hồng</h1>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kỳ tính lương:</label>
                <DatePicker value={startDate} onChange={setStartDate} className="w-36 py-2 px-3 border rounded-lg bg-white" />
                <span className="text-gray-500">-</span>
                <DatePicker value={endDate} onChange={setEndDate} className="w-36 py-2 px-3 border rounded-lg bg-white" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nhân viên</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">% Hoa hồng (Thực tế)</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số đơn thành công</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Doanh thu tính thưởng</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hoa hồng thực nhận</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {commissionReport.map(row => (
                           <tr key={row.user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                               <td className="px-6 py-4">
                                   <div className="font-medium text-gray-900 dark:text-white">{row.user.name}</div>
                                   <div className="text-sm text-gray-500 dark:text-gray-400">{row.user.email}</div>
                               </td>
                               <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">{row.effectiveRate}%</td>
                               <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">{row.orderCount}</td>
                               <td className="px-6 py-4 text-right font-semibold text-gray-800 dark:text-gray-100">{row.totalRevenue.toLocaleString('vi-VN')}</td>
                               <td className="px-6 py-4 text-right font-bold text-green-600">{row.commission.toLocaleString('vi-VN')}</td>
                           </tr>
                        ))}
                         {commissionReport.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">Không có dữ liệu tính thưởng cho giai đoạn này.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommissionPage;