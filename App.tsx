
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { RefreshIcon } from './components/icons/Icons';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages to improve initial load time
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const GettingStartedPage = lazy(() => import('./pages/GettingStartedPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
// FIX: Resolve lazy loading issue where the default export is not correctly inferred.
const PointOfSalePage = lazy(() => import('./pages/pos/PointOfSalePage').then(module => ({ default: module.default })));
const ProductionOrderListPage = lazy(() => import('./pages/production/ProductionOrderListPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));

const QuoteListPage = lazy(() => import('./pages/quotes/QuoteListPage'));
const ContractListPage = lazy(() => import('./pages/contracts/ContractListPage'));
const ContractCreatePage = lazy(() => import('./pages/contracts/ContractCreatePage'));
const ContractDetailPage = lazy(() => import('./pages/contracts/ContractDetailPage'));
// Update Lazy loading for consistency
const OrderListPage = lazy(() => import('./pages/orders/OrderListPage').then(module => ({ default: module.default })));
const CustomerListPage = lazy(() => import('./pages/customers/CustomerListPage'));
const PromotionListPage = lazy(() => import('./pages/promotions/PromotionListPage'));
const CustomerPortalPage = lazy(() => import('./pages/portal/CustomerPortalPage'));

const InvoiceListPage = lazy(() => import('./pages/invoices/InvoiceListPage'));
const CostingPage = lazy(() => import('./pages/accounting/CostingPage'));
// Update Lazy loading for consistency
const SupplierListPage = lazy(() => import('./pages/purchasing/SupplierListPage').then(module => ({ default: module.default })));
const DebtCollectionPage = lazy(() => import('./pages/accounting/DebtCollectionPage'));

// Update Lazy loading for consistency
const CashFlowPage = lazy(() => import('./pages/accounting/CashFlowPage').then(module => ({ default: module.default })));
// Update Lazy loading for consistency
const BankFlowPage = lazy(() => import('./pages/accounting/BankFlowPage').then(module => ({ default: module.default })));
const CashCountPage = lazy(() => import('./pages/accounting/CashCountPage'));
const CashLedgerPage = lazy(() => import('./pages/accounting/CashLedgerPage'));
const BankReconciliationPage = lazy(() => import('./pages/accounting/BankReconciliationPage'));
const BankLedgerPage = lazy(() => import('./pages/accounting/BankLedgerPage'));

const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const CompanyInfoPage = lazy(() => import('./pages/settings/CompanyInfoPage'));
const NumberingRulesPage = lazy(() => import('./pages/settings/NumberingRulesPage'));
const SubscriptionPage = lazy(() => import('./pages/settings/SubscriptionPage'));
// FIX: Resolve lazy loading issue where the default export is not correctly inferred.
const CustomizationPage = lazy(() => import('./pages/settings/CustomizationPage').then(module => ({ default: module.default })));
const PrintTemplatePage = lazy(() => import('./pages/settings/PrintTemplatePage'));
const IntegrationPage = lazy(() => import('./pages/settings/IntegrationPage'));
const SystemLogPage = lazy(() => import('./pages/settings/SystemLogPage'));

const ProfilePage = lazy(() => import('./pages/account/ProfilePage'));

const ProductCatalogPage = lazy(() => import('./pages/catalogs/ProductCatalogPage'));
const MaterialCatalogPage = lazy(() => import('./pages/catalogs/MaterialCatalogPage'));
const RawMaterialCatalogPage = lazy(() => import('./pages/catalogs/RawMaterialCatalogPage'));
const ProcessCatalogPage = lazy(() => import('./pages/catalogs/ProcessCatalogPage'));
const PrintMethodCatalogPage = lazy(() => import('./pages/catalogs/PrintMethodCatalogPage'));
const UnitCatalogPage = lazy(() => import('./pages/catalogs/UnitCatalogPage'));
const PaperConvertingPage = lazy(() => import('./pages/warehouse/PaperConvertingPage'));
const BOMPage = lazy(() => import('./pages/catalogs/BOMPage'));
const OtherCostsPage = lazy(() => import('./pages/catalogs/OtherCostsPage'));

const CustomObjectListPage = lazy(() => import('./pages/custom/CustomObjectListPage'));
const CustomObjectCreatePage = lazy(() => import('./pages/custom/CustomObjectCreatePage'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-[var(--gray-100)]">
    <div className="animate-spin text-blue-600">
      <RefreshIcon className="w-8 h-8" />
    </div>
  </div>
);

function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Customer Portal (Simulated public route for demo, normally protected) */}
            <Route path="/portal" element={<CustomerPortalPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/getting-started" element={<GettingStartedPage />} />
              
              {/* Top Level Nav */}
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/pos" element={<PointOfSalePage />} />
              <Route path="/production-orders" element={<ProductionOrderListPage />} />
              
              {/* Business Menu */}
              <Route path="/quotes" element={<QuoteListPage />} />
              <Route path="/quotes/:id/edit" element={<PointOfSalePage />} />
              <Route path="/contracts" element={<ContractListPage />} />
              <Route path="/contracts/new" element={<ContractCreatePage />} />
              <Route path="/contracts/:id" element={<ContractDetailPage />} />
              <Route path="/contracts/:id/edit" element={<ContractCreatePage />} />
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/orders/:id/edit" element={<PointOfSalePage />} />
              <Route path="/customers" element={<CustomerListPage />} />
              <Route path="/promotions" element={<PromotionListPage />} />

              {/* Accounting Menu */}
              <Route path="/invoices" element={<InvoiceListPage />} />
              <Route path="/accounting/costing" element={<CostingPage />} />
              <Route path="/accounting/debt-collection" element={<DebtCollectionPage />} />
              <Route path="/purchasing" element={<SupplierListPage />} />

              {/* Cash Fund Routes */}
              <Route path="/cash-fund/cash-flow" element={<CashFlowPage />} />
              <Route path="/cash-fund/cash-count" element={<CashCountPage />} />
              <Route path="/cash-fund/cash-ledger" element={<CashLedgerPage />} />
              <Route path="/cash-fund/bank-flow" element={<BankFlowPage />} />
              <Route path="/cash-fund/bank-reconciliation" element={<BankReconciliationPage />} />
              <Route path="/cash-fund/bank-ledger" element={<BankLedgerPage />} />

              {/* User Account */}
              <Route path="/account" element={<ProfilePage />} />

              {/* Settings Menu */}
              <Route path="/settings" element={<Navigate to="/settings/users" />} />
              <Route path="/settings/users" element={<SettingsPage />} />
              <Route path="/settings/company-info" element={<CompanyInfoPage />} />
              <Route path="/settings/numbering" element={<NumberingRulesPage />} />
              <Route path="/settings/subscription" element={<SubscriptionPage />} />
              <Route path="/settings/customization" element={<CustomizationPage />} />
              <Route path="/settings/print-templates" element={<PrintTemplatePage />} />
              <Route path="/settings/integration" element={<IntegrationPage />} />
              <Route path="/settings/system-logs" element={<SystemLogPage />} />
              
              {/* Catalog Menu */}
              <Route path="/catalogs/products" element={<ProductCatalogPage />} />
              <Route path="/catalogs/materials" element={<MaterialCatalogPage />} />
              <Route path="/catalogs/raw-materials" element={<RawMaterialCatalogPage />} />
              <Route path="/catalogs/processes" element={<ProcessCatalogPage />} />
              <Route path="/catalogs/print-methods" element={<PrintMethodCatalogPage />} />
              <Route path="/catalogs/units" element={<UnitCatalogPage />} />
              <Route path="/catalogs/paper-conversion" element={<PaperConvertingPage />} />
              <Route path="/catalogs/bom" element={<BOMPage />} />
              <Route path="/catalogs/other-costs" element={<OtherCostsPage />} />


              {/* Custom Module Routes */}
              <Route path="/custom/:slug" element={<CustomObjectListPage />} />
              <Route path="/custom/:slug/new" element={<CustomObjectCreatePage />} />
              <Route path="/custom/:slug/:id/edit" element={<CustomObjectCreatePage />} />

              {/* Fallback for any other authenticated route */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </DataProvider>
  );
}

export default App;
