
import { 
    Quote, Order, Invoice, Customer, CustomerGroup, MaterialGroup, MaterialVariant, 
    ProcessGroup, ProcessConfiguration, Product, PrintMethodGroup, PrintPriceConfiguration,
    Unit, ProductionOrder, Contract, User, CompanyInfo, CashTransaction, BankTransaction, 
    NumberingRule, SubscriptionPlan, MenuItem, PrintCostComponent, CostingRecord, 
    RawMaterialGroup, RawMaterial, CustomObjectDefinition, CustomObjectRecord, 
    WastageRule, PlatePrice, RunningCostRule, PrintTemplate, IntegrationSettings, ProfitRule, ZnsTemplate, Promotion, AccessLogEntry, ActivityLogEntry, Role, Supplier, SupplierGroup, PurchaseOrder, PaperConversion, PurchaseOrderStatus, PaymentMethod, PaymentStatus, InventoryTransaction, TransactionType,
    CommissionPolicy, CommissionTier, UserPaymentMethod, BillOfMaterial, OtherCost, OtherCostType,
    PricingModel, QuoteStatus, OrderStatus, ProductionOrderStatus, ContractStatus, SubscriptionStatus, CashTransactionType, BankTransactionType, DocumentType, IconName, ProcessCalculationMethod,
    UnitCategory
} from './types';

export const AVAILABLE_ICONS: IconName[] = ['DashboardIcon', 'ReportIcon', 'StorefrontIcon' , 'ProductionOrderIcon', 'ContentIcon', 'BusinessIcon', 'AccountingIcon', 'CatalogIcon', 'SettingsIcon', 'CashFundIcon', 'CreditCardIcon', 'MenuIcon', 'LinkIcon', 'BoxIcon', 'UserGroupIcon', 'ScissorsIcon', 'TruckIcon', 'ChartBarIcon', 'ChartPieIcon', 'PlusIcon'];

export const MOCK_NAVIGATION_MENU: MenuItem[] = [
    { id: 'menu_1', label: 'Tổng quan', path: '/dashboard', icon: 'DashboardIcon', order: 0, permission: 'view_reports' },
    { id: 'menu_2', label: 'Báo cáo', path: '/reports', icon: 'ReportIcon', order: 1, permission: 'view_reports' },
    { id: 'menu_3', label: 'Bán hàng', path: '/pos', icon: 'StorefrontIcon', order: 2, permission: 'use_pos', badge: 'NEW' },
    { id: 'menu_4', label: 'Danh sách LSX', path: '/production-orders', icon: 'ProductionOrderIcon', order: 3, permission: 'manage_production_orders' },
    { id: 'menu_6', label: 'Kinh doanh', path: '#', icon: 'BusinessIcon', order: 5 },
    { id: 'menu_7', label: 'Kế toán', path: '#', icon: 'AccountingIcon', order: 6 },
    { id: 'menu_8', label: 'Quỹ tiền', path: '#', icon: 'CashFundIcon', order: 7 },
    { id: 'menu_9', label: 'Danh mục', path: '#', icon: 'CatalogIcon', order: 8 },
    { id: 'menu_10', label: 'Thiết lập', path: '#', icon: 'SettingsIcon', order: 9 },
    { id: 'menu_11', label: 'Gói & Thanh toán', path: '/settings/subscription', icon: 'CreditCardIcon', order: 10, permission: 'manage_subscription' },
    
    { id: 'menu_6_1', parentId: 'menu_6', label: 'Báo giá', path: '/quotes', order: 0, permission: 'view_quotes' },
    { id: 'menu_6_2', parentId: 'menu_6', label: 'Hợp đồng', path: '/contracts', order: 1, permission: 'view_contracts' },
    { id: 'menu_6_3', parentId: 'menu_6', label: 'Đơn hàng', path: '/orders', order: 2, permission: 'view_orders' },
    { id: 'menu_6_5', parentId: 'menu_6', label: 'Khách hàng', path: '/customers', order: 3, permission: 'view_customers' },
    { id: 'menu_6_6', parentId: 'menu_6', label: 'Khuyến mãi', path: '/promotions', order: 4, permission: 'manage_promotions' },

    { id: 'menu_7_1', parentId: 'menu_7', label: 'Hóa đơn & Công nợ', path: '/invoices', order: 0, permission: 'manage_invoices' },
    { id: 'menu_7_3', parentId: 'menu_7', label: 'Thu nợ khách hàng', path: '/accounting/debt-collection', order: 1, permission: 'manage_invoices' },
    { id: 'menu_7_2', parentId: 'menu_7', label: 'Giá thành', path: '/accounting/costing', order: 2, permission: 'view_accounting' },
    { id: 'menu_7_4', parentId: 'menu_7', label: 'Mua hàng & NCC', path: '/purchasing', order: 3, permission: 'manage_purchasing' },
    { id: 'menu_7_5', parentId: 'menu_7', label: 'Chi phí khác', path: '/catalogs/other-costs', order: 4, permission: 'manage_costing_rules' },

    { id: 'menu_8_1', parentId: 'menu_8', label: 'Thu, chi tiền mặt', path: '/cash-fund/cash-flow', order: 0, permission: 'manage_cash_fund' },
    { id: 'menu_8_2', parentId: 'menu_8', label: 'Kiểm kê tiền mặt', path: '/cash-fund/cash-count', order: 1, permission: 'manage_cash_fund' },
    { id: 'menu_8_3', parentId: 'menu_8', label: 'Sổ chi tiết tiền mặt', path: '/cash-fund/cash-ledger', order: 2, permission: 'manage_cash_fund' },
    { id: 'menu_8_4', parentId: 'menu_8', label: 'Thu, chi tiền gửi', path: '/cash-fund/bank-flow', order: 3, permission: 'manage_cash_fund' },
    { id: 'menu_8_5', parentId: 'menu_8', label: 'Đối chiếu tiền gửi', path: '/cash-fund/bank-reconciliation', order: 4, permission: 'manage_cash_fund' },
    { id: 'menu_8_6', parentId: 'menu_8', label: 'Sổ chi tiết tiền gửi', path: '/cash-fund/bank-ledger', order: 5, permission: 'manage_cash_fund' },
    
    { id: 'menu_9_1', parentId: 'menu_9', label: 'Sản phẩm', path: '/catalogs/products', order: 0, permission: 'view_products' },
    { id: 'menu_9_8', parentId: 'menu_9', label: 'Định mức vật tư (BOM)', path: '/catalogs/bom', order: 1, permission: 'manage_bom' },
    { id: 'menu_9_2', parentId: 'menu_9', label: 'Chất liệu', path: '/catalogs/materials', order: 2, permission: 'view_materials' },
    { id: 'menu_9_3', parentId: 'menu_9', label: 'Vật tư (Mực/Keo)', path: '/catalogs/raw-materials', order: 3, permission: 'view_raw_materials' },
    { id: 'menu_9_4', parentId: 'menu_9', label: 'Gia công sau in', path: '/catalogs/processes', order: 4, permission: 'view_processes' },
    { id: 'menu_9_5', parentId: 'menu_9', label: 'Phương thức in', path: '/catalogs/print-methods', order: 5, permission: 'view_print_methods' },
    { id: 'menu_9_6', parentId: 'menu_9', label: 'Đơn vị tính', path: '/catalogs/units', order: 6, permission: 'view_units' },
    { id: 'menu_9_7', parentId: 'menu_9', label: 'Cắt giấy/Xả cuộn', path: '/catalogs/paper-conversion', order: 7, permission: 'manage_inventory_conversion' },
    
    { id: 'menu_10_1', parentId: 'menu_10', label: 'Quản lý & Phân quyền', path: '/settings/users', order: 0, permission: 'manage_users' },
    { id: 'menu_10_3', parentId: 'menu_10', label: 'Thông tin công ty', path: '/settings/company-info', order: 2, permission: 'manage_company_info' },
    { id: 'menu_10_4', parentId: 'menu_10', label: 'Quy tắc đánh số', path: '/settings/numbering', order: 3, permission: 'manage_numbering_rules' },
    { id: 'menu_10_5', parentId: 'menu_10', label: 'Tùy chỉnh Giao diện', path: '/settings/customization', order: 4, permission: 'manage_menu' },
    { id: 'menu_10_6', parentId: 'menu_10', label: 'Mẫu in & Máy in', path: '/settings/print-templates', order: 5, permission: 'manage_print_templates' },
    { id: 'menu_10_7', parentId: 'menu_10', label: 'Kết nối mở rộng', path: '/settings/integration', order: 6, permission: 'manage_integration' },
    { id: 'menu_10_9', parentId: 'menu_10', label: 'Nhật ký hệ thống', path: '/settings/system-logs', order: 8, permission: 'view_logs' },
];

export const MOCK_USER_PAYMENT_METHODS: UserPaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    isDefault: true,
    card: {
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2028,
    }
  },
  {
    id: 'pm_2',
    type: 'bank',
    isDefault: false,
    bank: {
      bankName: 'Vietcombank',
      accountLast4: '6789',
    }
  }
];

export const MOCK_INTEGRATION_SETTINGS: IntegrationSettings = {
    websiteUrl: '',
    consumerKey: '',
    consumerSecret: '',
    isConnected: false,
    enableProductSync: false,
    enableInventorySync: false,
    enableOrderSync: false,
    webhookUrl: 'https://api.example-erp.com/webhooks/orders',
    zaloSettings: {
        appId: '',
        secretKey: '',
        accessToken: '',
        isConnected: false,
    },
    meInvoiceSettings: {
        taxCode: '0313843142',
        username: 'inantrangia@gmail.com',
        isConnected: false,
        signingMethod: undefined,
        autoSendEmail: true,
        issueFromPos: true,
        issueTiming: 'immediate',
        autoIssueRule: 'always',
        defaultInvoiceTemplate: '1C25MYY',
        defaultBuyerName: 'Khách lẻ không lấy hóa đơn',
        defaultCompanyName: 'Khách lẻ không lấy hóa đơn'
    }
};

export const MOCK_ZNS_TEMPLATES: ZnsTemplate[] = [
    {
        id: 'zns_1',
        name: 'Xác nhận đơn hàng mới',
        templateId: '227035',
        type: 'OrderConfirmation',
        content: `Cảm ơn {{customer_name}} đã đặt hàng. Đơn hàng {{order_id}} của bạn với tổng giá trị {{total_amount}} đã được tạo thành công. Chúng tôi sẽ sớm liên hệ với bạn.`
    },
    {
        id: 'zns_2',
        name: 'Thông báo bắt đầu giao hàng',
        templateId: '227036',
        type: 'ShippingUpdate',
        content: `Đơn hàng {{order_id}} của bạn đang trên đường giao đến địa chỉ. Shipper sẽ sớm liên hệ với bạn. Cảm ơn!`
    }
];

export const MOCK_ROLES: Role[] = [
    { 
        id: 'role_admin', 
        name: 'Admin (Hệ thống)', 
        description: 'Quản trị viên toàn quyền.', 
        isSystem: true,
        permissions: [
            // Users
            'manage_users', 'view_users', 'create_users', 'edit_users', 'delete_users',
            
            // Orders
            'view_orders', 'create_orders', 'edit_orders', 'delete_orders', 'manage_orders',

            // Quotes
            'view_quotes', 'create_quotes', 'edit_quotes', 'delete_quotes', 'approve_quotes',

            // Customers
            'view_customers', 'create_customers', 'edit_customers', 'delete_customers', 'manage_customers',

            // Contracts
            'view_contracts', 'create_contracts', 'edit_contracts', 'delete_contracts', 'manage_contracts',

            // Products
            'view_products', 'create_products', 'edit_products', 'delete_products',

            // Materials
            'view_materials', 'create_materials', 'edit_materials', 'delete_materials',
            'view_raw_materials', 'create_raw_materials', 'edit_raw_materials', 'delete_raw_materials',

            // Processes
            'view_processes', 'create_processes', 'edit_processes', 'delete_processes',

            // Others
            'use_pos', 'manage_invoices', 'manage_company_info', 'manage_numbering_rules', 'manage_cash_fund', 'view_reports', 'view_accounting', 'manage_subscription', 'manage_production_orders', 'manage_menu', 'manage_custom_modules',
            'view_print_methods', 'create_print_methods', 'edit_print_methods', 'delete_print_methods',
            'view_units', 'create_units', 'edit_units', 'delete_units', 'manage_costing_rules',
            'manage_print_templates',
            'manage_integration', 'manage_profit_rules', 'manage_data_import', 'manage_zalo_integration', 'manage_promotions', 'manage_einvoice_integration', 'view_logs',
            'manage_purchasing', 'manage_inventory_conversion', 'view_commissions', 'manage_bom'
        ] 
    },
    {
        id: 'role_director',
        name: 'Giám đốc',
        description: 'Xem báo cáo và phê duyệt, không cấu hình hệ thống.',
        permissions: [
            'view_reports', 'approve_quotes', 'view_accounting', 'view_logs', 'view_commissions', 
            'view_orders', 'view_customers', 'view_products', 'view_quotes', 'view_contracts'
        ]
    },
    {
        id: 'role_sales_manager',
        name: 'Trưởng phòng Kinh doanh',
        description: 'Quản lý đội ngũ kinh doanh, duyệt báo giá, xem báo cáo doanh thu.',
        permissions: [
            'create_quotes', 'view_quotes', 'edit_quotes', 'approve_quotes', 
            'view_orders', 'create_orders', 'edit_orders', 'manage_orders',
            'view_customers', 'create_customers', 'edit_customers', 'manage_customers',
            'view_contracts', 'create_contracts', 'edit_contracts', 'manage_contracts',
            'view_reports', 'view_products', 'view_materials', 'view_processes', 'view_print_methods', 'view_units', 
            'manage_promotions', 'view_commissions'
        ]
    },
    {
        id: 'role_sales_staff',
        name: 'Nhân viên Kinh doanh',
        description: 'Tạo báo giá, đơn hàng, quản lý khách hàng của mình.',
        permissions: [
            'create_quotes', 'view_quotes', 'edit_quotes',
            'create_orders', 'view_orders', 'edit_orders',
            'create_customers', 'view_customers', 'edit_customers',
            'view_products', 'view_materials', 'view_processes', 'view_print_methods', 'view_units', 'use_pos', 'view_commissions'
        ]
    },
    {
        id: 'role_chief_accountant',
        name: 'Kế toán trưởng',
        description: 'Quản lý toàn bộ hoạt động kế toán, quỹ, công nợ.',
        permissions: [
            'manage_invoices', 'manage_cash_fund', 'view_reports', 'view_accounting', 'manage_contracts', 'manage_purchasing',
            'view_orders', 'view_customers'
        ]
    },
    {
        id: 'role_accountant',
        name: 'Kế toán viên',
        description: 'Ghi nhận thu chi, xuất hóa đơn.',
        permissions: ['manage_invoices', 'manage_cash_fund', 'view_orders']
    },
    {
        id: 'role_warehouse',
        name: 'Thủ kho',
        description: 'Quản lý xuất nhập tồn kho.',
        permissions: [
            'view_products', 'edit_products', 'view_raw_materials', 
            'manage_production_orders', 'manage_inventory_conversion', 'manage_purchasing'
        ]
    },
    {
        id: 'role_production',
        name: 'Sản xuất / Thiết kế',
        description: 'Thực hiện lệnh sản xuất.',
        permissions: ['manage_production_orders', 'manage_bom']
    }
];


// --- NEW COMMISSION DATA ---
export const MOCK_COMMISSION_POLICIES: CommissionPolicy[] = [
  {
    id: 'policy_standard',
    name: 'Chính sách Bán hàng Chuẩn',
    tiers: [
      { id: 'tier1', revenueThreshold: 0, commissionRate: 2 },
      { id: 'tier2', revenueThreshold: 50000000, commissionRate: 3.5 },
      { id: 'tier3', revenueThreshold: 150000000, commissionRate: 5 },
    ]
  },
  {
    id: 'policy_manager',
    name: 'Chính sách Quản lý',
    tiers: [
      { id: 'tier4', revenueThreshold: 0, commissionRate: 3 },
      { id: 'tier5', revenueThreshold: 100000000, commissionRate: 4 },
    ]
  }
];

// Mock Data Generation
const today = new Date();

export const MOCK_USERS: User[] = [
    { id: 'NV001', name: 'Nguyễn Văn Admin', email: 'admin@example.com', roleId: 'role_admin', status: 'Active', joiningDate: new Date('2022-01-01'), password: '123456' },
    { id: 'NV002', name: 'Trần Thị Sale', email: 'sale@example.com', roleId: 'role_sales_staff', status: 'Active', joiningDate: new Date('2022-02-01'), password: 'password', commissionPolicyId: 'policy_standard' },
    { id: 'NV003', name: 'Lê Văn Kế Toán', email: 'accountant@example.com', roleId: 'role_chief_accountant', status: 'Active', joiningDate: new Date('2022-03-01'), password: 'password' },
    { id: 'NV004', name: 'Vương Kinh Doanh', email: 'vuong@example.com', roleId: 'role_sales_manager', status: 'Active', joiningDate: new Date('2023-05-10'), password: 'password', commissionPolicyId: 'policy_manager' },
    { id: 'NV005', name: 'Phạm Văn Staff', email: 'staff@example.com', roleId: 'role_sales_staff', status: 'Active', joiningDate: new Date('2023-06-15'), password: 'password', commissionPolicyId: 'policy_standard' }, // Assigned policy_standard
];

export const MOCK_CUSTOMER_GROUPS: CustomerGroup[] = [
    { id: 'CG001', name: 'Khách lẻ', description: 'Khách hàng vãng lai' },
    { id: 'CG002', name: 'Đại lý', description: 'Khách hàng mua buôn' },
    { id: 'CG003', name: 'VIP', description: 'Khách hàng thân thiết' },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'KH001', name: 'Nguyễn Văn A', phone: '0901234567', email: 'a@example.com', customerGroupId: 'CG001', address: { province: 'TP.HCM', district: 'Quận 1', ward: 'Bến Nghé', street: '1 Lê Duẩn' }, assignedToUserId: 'NV002', creditBalance: 3150000 },
    { id: 'KH002', name: 'Công ty TNHH B', phone: '0909876543', email: 'b@company.com', customerGroupId: 'CG002', address: { province: 'Hà Nội', district: 'Hoàn Kiếm', ward: 'Hàng Bài', street: '2 Tràng Tiền' }, company: { name: 'Công ty TNHH B', taxId: '0101234567' }, assignedToUserId: 'NV004', creditBalance: 0 },
    { id: 'KH003', name: 'Chị Lan - Shop Hoa', phone: '0988112233', email: 'lanhoa@email.com', customerGroupId: 'CG002', assignedToUserId: 'NV002', creditBalance: 500000 },
    { id: 'KH004', name: 'Anh Hùng - Nhà hàng', phone: '0912345678', email: 'hungnhahang@email.com', customerGroupId: 'CG003', assignedToUserId: 'NV004', creditBalance: 180000 },
    { id: 'KH2720', name: 'Công ty TNHH ABC', phone: '0901234567', email: 'cty.abc@email.com', company: { name: 'Công ty TNHH ABC', taxId: '0312345678' }, assignedToUserId: 'NV002', creditBalance: 2500000 },
];

export const MOCK_MATERIAL_GROUPS: MaterialGroup[] = [
    { id: 'MG001', name: 'Couche', description: 'Giấy in phổ biến, bề mặt láng bóng hoặc mờ' },
    { id: 'MG002', name: 'Ford', description: 'Giấy văn phòng, bề mặt nhám' },
    { id: 'MG003', name: 'Bristol', description: 'Giấy bìa cứng, mịn 2 mặt' },
    { id: 'MG004', name: 'Duplex', description: 'Giấy bìa cứng, 1 mặt trắng 1 mặt xám' },
    { id: 'MG005', name: 'Decal giấy', description: 'Tem nhãn decal' },
];

export const MOCK_MATERIAL_VARIANTS: MaterialVariant[] = [
    { id: 'MV001', groupId: 'MG001', name: 'Couche 150gsm (65x86)', gsm: 150, width: 65, height: 86, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 950000, sellingPrice: 2500, initialStock: 10, lowStockThreshold: 1, averageCost: 1900 },
    { id: 'MV002', groupId: 'MG001', name: 'Couche 300gsm (65x86)', gsm: 300, width: 65, height: 86, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 1900000, sellingPrice: 4500, initialStock: 4, lowStockThreshold: 1, averageCost: 3800 },
    { id: 'MV003', groupId: 'MG001', name: 'Couche 150gsm (79x109)', gsm: 150, width: 79, height: 109, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 1000000, sellingPrice: 2600, initialStock: 6, lowStockThreshold: 1, averageCost: 2000 },
    { id: 'MV004', groupId: 'MG002', name: 'Ford 70gsm (A4)', gsm: 70, width: 21, height: 29.7, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 40000, sellingPrice: 150, initialStock: 40, lowStockThreshold: 4, averageCost: 80 },
    { id: 'MV005', groupId: 'MG002', name: 'Ford 230gsm (A4)', gsm: 230, width: 21, height: 29.7, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 150000, sellingPrice: 500, initialStock: 2, lowStockThreshold: 1, averageCost: 300 },
    { id: 'MV006', groupId: 'MG003', name: 'Bristol 300gsm (79x109)', gsm: 300, width: 79, height: 109, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 1750000, sellingPrice: 4500, initialStock: 3, lowStockThreshold: 1, averageCost: 3500 },
    { id: 'MV007', groupId: 'MG005', name: 'Decal giấy Đế vàng (A3)', gsm: 80, width: 29.7, height: 42, purchaseUnit: 'xấp', costingUnit: 'tờ', conversionRate: 100, purchasePrice: 120000, sellingPrice: 1800, initialStock: 20, lowStockThreshold: 2, averageCost: 1200 },
    { id: 'MV008', groupId: 'MG001', name: 'Couche 150gsm (43x65)', gsm: 150, width: 43, height: 65, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 350000, sellingPrice: 1000, initialStock: 2, lowStockThreshold: 1, averageCost: 700 },
    { id: 'MV009', groupId: 'MG001', name: 'Couche 300gsm (43x65)', gsm: 300, width: 43, height: 65, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 700000, sellingPrice: 2000, initialStock: 2, lowStockThreshold: 1, averageCost: 1400 },
    // New Ford Sizes
    { id: 'MV010', groupId: 'MG002', name: 'Ford 100gsm (79x109)', gsm: 100, width: 79, height: 109, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 1100000, sellingPrice: 3000, initialStock: 5, lowStockThreshold: 1, averageCost: 2200 },
    { id: 'MV011', groupId: 'MG002', name: 'Ford 100gsm (65x86)', gsm: 100, width: 65, height: 86, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 850000, sellingPrice: 2200, initialStock: 5, lowStockThreshold: 1, averageCost: 1700 },
    { id: 'MV012', groupId: 'MG002', name: 'Ford 100gsm (43x65)', gsm: 100, width: 43, height: 65, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 450000, sellingPrice: 1200, initialStock: 5, lowStockThreshold: 1, averageCost: 900 },
    // New Bristol Sizes
    { id: 'MV013', groupId: 'MG003', name: 'Bristol 300gsm (65x86)', gsm: 300, width: 65, height: 86, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 1350000, sellingPrice: 3500, initialStock: 3, lowStockThreshold: 1, averageCost: 2700 },
    { id: 'MV014', groupId: 'MG003', name: 'Bristol 300gsm (43x65)', gsm: 300, width: 43, height: 65, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 700000, sellingPrice: 1800, initialStock: 3, lowStockThreshold: 1, averageCost: 1400 },
    // Added Ford 80gsm
    { id: 'MV015', groupId: 'MG002', name: 'Ford 80gsm (79x109)', gsm: 80, width: 79, height: 109, purchaseUnit: 'Ram', costingUnit: 'tờ', conversionRate: 500, purchasePrice: 1000000, sellingPrice: 2800, initialStock: 10, lowStockThreshold: 2, averageCost: 2000 },
];

export const MOCK_PROCESS_GROUPS: ProcessGroup[] = [
    { id: 'PG001', name: 'Gia công thành phẩm (Bế, Dán...)' },
    { id: 'PG002', name: 'Gia công bề mặt (Cán màng, UV...)' },
    { id: 'PG003', name: 'Đóng cuốn (Ghim, Keo...)' },
];

export const MOCK_PROCESS_CONFIGURATIONS: ProcessConfiguration[] = [
    { 
        id: 'PC001', 
        groupId: 'PG002', 
        name: 'Cán màng bóng', 
        calculationMethod: ProcessCalculationMethod.PerSheet, 
        setupFee: 50000, 
        unitPrice: 2500, 
        pricingUnit: 'm²', 
        appliesTo: 'surface',
        batchRules: [
            { id: 'br_gloss_lam_1', maxQuantity: 50, price: 125000 } // Under 50 m², price is 125,000đ
        ]
    },
    { 
        id: 'PC003', 
        groupId: 'PG002', 
        name: 'Cán màng mờ', 
        calculationMethod: ProcessCalculationMethod.PerSheet, 
        setupFee: 50000, 
        unitPrice: 3000, 
        pricingUnit: 'm²', 
        appliesTo: 'surface',
        batchRules: [
            { id: 'br_matte_lam_1', maxQuantity: 120, price: 300000 } // Under 120 m², price is 300,000đ
        ]
    },
    { id: 'PC002', groupId: 'PG001', name: 'Cấn bế (Die-cut)', calculationMethod: ProcessCalculationMethod.PerSheet, setupFee: 300000, unitPrice: 100, pricingUnit: 'tờ', appliesTo: 'product' },
    { id: 'PC_BETHU', groupId: 'PG001', name: 'Bế bao thư', calculationMethod: ProcessCalculationMethod.PerSheet, setupFee: 400000, unitPrice: 100, pricingUnit: 'tờ', appliesTo: 'product' },
    { id: 'PC004', groupId: 'PG003', name: 'Đóng ghim', calculationMethod: ProcessCalculationMethod.PerProduct, setupFee: 0, unitPrice: 2000, pricingUnit: 'cuốn', appliesTo: 'product' },
    { id: 'PC005', groupId: 'PG001', name: 'Cắt thành phẩm', calculationMethod: ProcessCalculationMethod.FixedLot, setupFee: 0, unitPrice: 50000, pricingUnit: 'lô', appliesTo: 'product' },
    { id: 'PC006', groupId: 'PG001', name: 'Dán thành phẩm', calculationMethod: ProcessCalculationMethod.PerProduct, setupFee: 0, unitPrice: 200, pricingUnit: 'cái', appliesTo: 'product' },
    { id: 'PC007', groupId: 'PG002', name: 'Ép kim', calculationMethod: ProcessCalculationMethod.FixedLot, setupFee: 0, unitPrice: 250000, pricingUnit: 'lô', appliesTo: 'surface' },
];

export const MOCK_PRODUCTS: Product[] = [
    { id: 'SP001', name: 'Tờ rơi A5', sku: 'TR-A5', pricingModel: PricingModel.ByQuote, initialStock: 0, lowStockThreshold: 0, unit: 'tờ' },
    { id: 'SP002', name: 'Danh thiếp', sku: 'NC-01', pricingModel: PricingModel.Fixed, price: 50000, initialStock: 100, lowStockThreshold: 10, unit: 'hộp' },
    { id: 'SP003', name: 'In Tờ rơi A4 - C150', sku: 'TR-A4-C150', pricingModel: PricingModel.ByQuote, initialStock: 0, lowStockThreshold: 0, unit: 'tờ' },
    { id: 'SP004', name: 'In Catalogue A4 - 24 trang', sku: 'CAT-A4-24', pricingModel: PricingModel.ByQuote, initialStock: 0, lowStockThreshold: 0, unit: 'cuốn' },
    { id: 'SP005', name: 'In Standee 0.8x1.8m', sku: 'ST-0818', pricingModel: PricingModel.Fixed, price: 150000, initialStock: 50, lowStockThreshold: 5, unit: 'cái' },
    { id: 'SP006', name: 'In Namecard - B300', sku: 'NC-B300', pricingModel: PricingModel.Fixed, price: 500, initialStock: 500, lowStockThreshold: 5, unit: 'hộp' },
    { id: 'SP007', name: 'In Hiflex 2m x 1m', sku: 'HF-2010', pricingModel: PricingModel.ByQuote, initialStock: 0, lowStockThreshold: 0, unit: 'tấm' },
    { id: 'SP008', name: 'In Decal giấy A3', sku: 'DC-A3', pricingModel: PricingModel.ByQuote, initialStock: 0, lowStockThreshold: 0, unit: 'tờ' },
];

export const MOCK_PRINT_METHOD_GROUPS: PrintMethodGroup[] = [
    { id: 'PMG001', name: 'In Offset' },
    { id: 'PMG002', name: 'In nhanh' },
];

export const MOCK_PRINT_PRICE_CONFIGURATIONS: PrintPriceConfiguration[] = [
    {
        id: 'PPC_OFF_3652', groupId: 'PMG001', name: 'Heidelberg SM 52 (36x52cm)',
        numColors: 4, maxSheetWidth: 52, maxSheetHeight: 36, minSheetWidth: 20, minSheetHeight: 15, gripperEdge: 1,
        platePrice: 90000, setupPrice: 150000, 
        impressionPrice: 160, // > 5000 lượt: 160đ
        fixedWastageSheets: 80, runningWastagePercent: 2,
        batchRules: [
            // Data from Row 1: 360x520
            { id: 'br_sm52_1', maxQuantity: 2000, price: 500000 }, // 1,000-2,000
            { id: 'br_sm52_2', maxQuantity: 3000, price: 600000 }, // 2,000-3,000
            { id: 'br_sm52_3', maxQuantity: 4000, price: 700000 }, // 3,000-4,000
            { id: 'br_sm52_4', maxQuantity: 5000, price: 800000 }  // 4,000-5,000
        ]
    },
    {
        id: 'PPC_OFF_4365', groupId: 'PMG001', name: 'Komori Lithrone (43x65cm)',
        numColors: 4, maxSheetWidth: 65, maxSheetHeight: 43, minSheetWidth: 25, minSheetHeight: 20, gripperEdge: 1.2,
        platePrice: 110000, setupPrice: 200000, 
        impressionPrice: 180, // > 5000 lượt: 180đ
        fixedWastageSheets: 80, runningWastagePercent: 2,
        batchRules: [
             // Data from Row 2: 430x650
            { id: 'br_kl4365_1', maxQuantity: 3000, price: 850000 }, // 2,000-3,000
            { id: 'br_kl4365_2', maxQuantity: 4000, price: 950000 }, // 3,000-4,000
            { id: 'br_kl4365_3', maxQuantity: 5000, price: 1050000 } // 4,000-5,000
        ]
    },
    {
        id: 'PPC_OFF_5376', groupId: 'PMG001', name: 'Máy in 53x76cm',
        numColors: 4, maxSheetWidth: 76, maxSheetHeight: 53, minSheetWidth: 30, minSheetHeight: 25, gripperEdge: 1.5,
        platePrice: 140000, setupPrice: 250000, 
        impressionPrice: 180, // > 5000 lượt: 180đ
        fixedWastageSheets: 80, runningWastagePercent: 1.5,
        batchRules: [
            // Data from Row 3: 530x760
            { id: 'br_5376_1', maxQuantity: 3000, price: 950000 }, // 2,000-3,000
            { id: 'br_5376_2', maxQuantity: 4000, price: 1050000 }, // 3,000-4,000
            { id: 'br_5376_3', maxQuantity: 5000, price: 1150000 }  // 4,000-5,000
        ]
    },
    {
        id: 'PPC_OFF_5479', groupId: 'PMG001', name: 'Máy in 54x79cm',
        numColors: 2, maxSheetWidth: 79, maxSheetHeight: 54, minSheetWidth: 30, minSheetHeight: 25, gripperEdge: 1.5,
        platePrice: 150000, setupPrice: 220000, 
        impressionPrice: 180, // Assumed similar to 53x76
        fixedWastageSheets: 80, runningWastagePercent: 1.5,
        batchRules: [
             // Table Row 7: 540x790 -> 850,000 (1,000-2,000)
             { id: 'br_5479_1', maxQuantity: 2000, price: 850000 }
        ]
    },
     {
        id: 'PPC_OFF_6586', groupId: 'PMG001', name: 'Heidelberg CD 102 (65x86cm)',
        numColors: 5, maxSheetWidth: 86, maxSheetHeight: 65, minSheetWidth: 35, minSheetHeight: 30, gripperEdge: 1.5,
        platePrice: 180000, setupPrice: 350000, 
        impressionPrice: 260, // > 5000 lượt: 260đ
        fixedWastageSheets: 80, runningWastagePercent: 1.2,
        batchRules: [
            // Data from Row 4: 650x860
            { id: 'br_cd102_0', maxQuantity: 1000, price: 1200000 }, // < 1,000
            { id: 'br_cd102_1', maxQuantity: 2000, price: 1300000 }, // 1,000-2,000
            { id: 'br_cd102_2', maxQuantity: 3000, price: 1300000 }, // 2,000-3,000
            { id: 'br_cd102_3', maxQuantity: 4000, price: 1400000 }, // 3,000-4,000
            { id: 'br_cd102_4', maxQuantity: 5000, price: 1500000 }  // 4,000-5,000
        ]
    },
    {
        id: 'PPC_OFF_72102', groupId: 'PMG001', name: 'Komori GL-40 (72x102cm)',
        numColors: 4, maxSheetWidth: 102, maxSheetHeight: 72, minSheetWidth: 40, minSheetHeight: 35, gripperEdge: 2,
        platePrice: 250000, setupPrice: 450000, 
        impressionPrice: 300, // > 5000 lượt: 300đ
        fixedWastageSheets: 80, runningWastagePercent: 1,
        batchRules: [
            // Data from Row 5: 720x1020
            { id: 'br_gl40_0', maxQuantity: 1000, price: 1400000 }, // < 1,000
            { id: 'br_gl40_1', maxQuantity: 2000, price: 1500000 }, // 1,000-2,000
            { id: 'br_gl40_2', maxQuantity: 3000, price: 1500000 }, // 2,000-3,000
            { id: 'br_gl40_3', maxQuantity: 4000, price: 1600000 }, // 3,000-4,000
            { id: 'br_gl40_4', maxQuantity: 5000, price: 1700000 }  // 4,000-5,000
        ]
    },
    {
        id: 'PPC_DIG_A3', groupId: 'PMG002', name: 'Konica Minolta AccurioPress',
        numColors: 4, maxSheetWidth: 48.7, maxSheetHeight: 33, minSheetWidth: 14.8, minSheetHeight: 10, gripperEdge: 0.5,
        platePrice: 0, setupPrice: 5000, impressionPrice: 3000,
        fixedWastageSheets: 5, runningWastagePercent: 1,
        batchRules: [
            { id: 'br_dig_50', maxQuantity: 50, price: 100000 },
            { id: 'br_dig_100', maxQuantity: 100, price: 180000 }
        ]
    },
];

export const MOCK_UNIT_CATEGORIES: UnitCategory[] = [
    { id: 'ucat_1', name: 'Sản phẩm' },
    { id: 'ucat_2', name: 'Chất liệu' },
    { id: 'ucat_3', name: 'Gia công' },
    { id: 'ucat_4', name: 'Thời gian' },
    { id: 'ucat_5', name: 'Bán hàng (POS)' },
    { id: 'ucat_6', name: 'Vật tư' },
];

export const MOCK_UNITS: Unit[] = [
    { id: 'U001', name: 'cái', categories: ['ucat_1', 'ucat_3', 'ucat_5'] },
    { id: 'U002', name: 'tờ', categories: ['ucat_1', 'ucat_2', 'ucat_3'] },
    { id: 'U003', name: 'hộp', categories: ['ucat_1', 'ucat_5'] },
    { id: 'U004', name: 'cuốn', categories: ['ucat_1', 'ucat_5'] },
    { id: 'U005', name: 'lô', categories: ['ucat_3'] },
    { id: 'U006', name: 'tấm', categories: ['ucat_1', 'ucat_5'] },
    { id: 'U007', name: 'kg', categories: ['ucat_2', 'ucat_6'] },
    { id: 'U008', name: 'cuộn', categories: ['ucat_2', 'ucat_6'] },
    { id: 'U009', name: 'lượt', categories: ['ucat_3'] },
    { id: 'U010', name: 'Ram', categories: ['ucat_2'] },
    { id: 'U011', name: 'Gram', categories: ['ucat_2'] },
    { id: 'U012', name: 'm²', categories: ['ucat_2', 'ucat_3'] },
    { id: 'U013', name: 'Bộ', categories: ['ucat_1', 'ucat_5', 'ucat_6'] },
    { id: 'U014', name: 'Giờ', categories: ['ucat_4'] },
    { id: 'U015', name: 'xấp', categories: ['ucat_1', 'ucat_2', 'ucat_5'] },
    { id: 'U016', name: 'Kiện', categories: ['ucat_2'] },
    { id: 'U017', name: 'Thùng', categories: ['ucat_6'] }
];

export const MOCK_QUOTES: Quote[] = [
    { id: 'BG001', customer: MOCK_CUSTOMERS[0], items: [{ id: 'QI001', productType: 'Tờ rơi', productName: 'Tờ rơi khai trương', quantity: 1000, material: MOCK_MATERIAL_VARIANTS[0], totalPrice: 1500000, details: { size: 'A5', resolution: 'Tiêu chuẩn' }, processes: [MOCK_PROCESS_CONFIGURATIONS[0]] }], totalAmount: 1500000, vatAmount: 0, status: QuoteStatus.Draft, createdAt: new Date(today.getTime() - 86400000 * 2), statusHistory: [] },
    { id: 'BG002', customer: MOCK_CUSTOMERS[1], items: [{ id: 'QI002', productType: 'Brochure', productName: 'Catalogue sản phẩm 2025', quantity: 500, material: MOCK_MATERIAL_VARIANTS[2], totalPrice: 12500000, details: { pages: 24 }, processes: [MOCK_PROCESS_CONFIGURATIONS[2], MOCK_PROCESS_CONFIGURATIONS[3]] }], totalAmount: 12500000, vatAmount: 0, status: QuoteStatus.Sent, createdAt: new Date(today.getTime() - 86400000 * 3), statusHistory: [] },
    { id: 'BG003', customer: MOCK_CUSTOMERS[3], items: [{ id: 'QI003', productType: 'Túi giấy', productName: 'Túi giấy đựng quà Tết', quantity: 200, material: MOCK_MATERIAL_VARIANTS[0], totalPrice: 4000000, details: { size: '25x35x10' }, processes: [] }], totalAmount: 4000000, vatAmount: 0, status: QuoteStatus.Approved, createdAt: new Date(today.getTime() - 86400000 * 10), statusHistory: [] }
];

export const MOCK_ORDERS: Order[] = [
    { id: 'DH001', quoteId: 'BG001', customer: MOCK_CUSTOMERS[0], items: [{ id: 'OI001', product: MOCK_PRODUCTS[0], quantity: 1000, unitPrice: 1500, totalPrice: 1500000, unit: 'tờ' }], totalAmount: 1650000, vatAmount: 150000, status: OrderStatus.PendingPayment, orderDate: new Date(today.getTime() - 86400000 * 2) },
    { id: 'DH002', customer: MOCK_CUSTOMERS[1], items: [{ id: 'OI002', product: MOCK_PRODUCTS[1], quantity: 10, unitPrice: 50000, totalPrice: 500000, unit: 'hộp' }], totalAmount: 550000, vatAmount: 50000, status: OrderStatus.Paid, orderDate: new Date('2025-11-25'), delivery: { recipientName: 'Anh B', phone: '0909876543', address: '2 Tràng Tiền', fee: 0, method: 'Tự giao' } },
    { id: 'DH003', quoteId: 'BG003', customer: MOCK_CUSTOMERS[3], items: [{ id: 'OI003', product: MOCK_PRODUCTS[4], quantity: 2, unitPrice: 150000, totalPrice: 300000, unit: 'cái' }], totalAmount: 330000, vatAmount: 30000, status: OrderStatus.PartialPayment, orderDate: new Date(today.getTime() - 86400000 * 8) },
    { id: 'DH004', customer: MOCK_CUSTOMERS[2], items: [{ id: 'OI004', product: MOCK_PRODUCTS[3], quantity: 300, unitPrice: 40000, totalPrice: 12000000, unit: 'cuốn' }], totalAmount: 12000000, vatAmount: 0, status: OrderStatus.Paid, orderDate: new Date(2025, 10, 13) },
    { id: 'DH005', customer: MOCK_CUSTOMERS[4], items: [{ id: 'OI005', product: MOCK_PRODUCTS[7], quantity: 50, unitPrice: 1800, totalPrice: 90000, unit: 'tờ' }], totalAmount: 90000, vatAmount: 0, status: OrderStatus.Paid, orderDate: new Date(2025, 10, 13, 7, 0, 0) },
];

export const MOCK_INVOICES: Invoice[] = [
    { id: 'HD001', orderId: 'DH001', customer: MOCK_CUSTOMERS[0], totalAmount: 1650000, payments: [{ id: 'PAY_DEBT_001', amount: 1650000, method: PaymentMethod.CreditDebt, date: new Date('2025-12-01'), recordedByUserId: 'NV002' }], invoiceDate: new Date('2025-12-01'), dueDate: new Date('2025-12-15') },
    { id: 'HD002', orderId: 'DH002', customer: MOCK_CUSTOMERS[1], totalAmount: 550000, payments: [{ id: 'PAY001', amount: 550000, method: PaymentMethod.BankTransfer, date: new Date(today.getTime() - 86400000 * 5), recordedByUserId: 'NV003', bankAccountId: 'BA001' }], invoiceDate: new Date(today.getTime() - 86400000 * 5), dueDate: new Date(today.getTime() + 86400000 * 25) },
    { id: 'HD003', orderId: 'DH003', customer: MOCK_CUSTOMERS[3], totalAmount: 330000, payments: [{ id: 'PAY002', amount: 150000, method: PaymentMethod.Cash, date: new Date(today.getTime() - 86400000 * 8), recordedByUserId: 'NV002' }], invoiceDate: new Date(today.getTime() - 86400000 * 8), dueDate: new Date(today.getTime() + 86400000 * 22) },
    { id: 'HD004', orderId: 'DH004', customer: MOCK_CUSTOMERS[2], totalAmount: 12000000, payments: [{ id: 'PAY003', amount: 12000000, method: PaymentMethod.BankTransfer, date: new Date(2025, 10, 13), recordedByUserId: 'NV003' }], invoiceDate: new Date(2025, 10, 13), dueDate: new Date(2025, 10, 28) },
    { id: 'HD005', orderId: 'DH005', customer: MOCK_CUSTOMERS[4], totalAmount: 90000, payments: [{ id: 'PAY004', amount: 90000, method: PaymentMethod.Cash, date: new Date(2025, 10, 13, 7, 0, 0), recordedByUserId: 'NV003' }], invoiceDate: new Date(2025, 10, 13), dueDate: new Date(2025, 10, 28) },
];

export const MOCK_PRODUCTION_ORDERS: ProductionOrder[] = [
    { id: 'LSX001', orderId: 'DH001', productName: 'Tờ rơi A5', quantity: 1000, notes: 'In gấp, giao trước 5h chiều', salespersonId: 'NV002', orderDate: new Date('2025-11-20'), deliveryDate: new Date('2025-11-21'), status: ProductionOrderStatus.New, size: 'A5', material: 'Couche 150', printColor: '4 màu', design: 'File của khách', unit: 'tờ', finishing: 'Cán màng bóng' },
    { id: 'LSX002', orderId: 'DH004', productName: 'In Catalogue A4 - 24 trang', quantity: 300, notes: '', salespersonId: 'NV004', orderDate: new Date('2025-11-13'), deliveryDate: new Date('2025-11-18'), status: ProductionOrderStatus.InProgress, size: 'A4', material: 'Bìa C250, Ruột C150', printColor: '4 màu', design: 'Thiết kế mới', unit: 'cuốn', finishing: 'Cán màng mờ bìa, đóng 2 ghim' }
];

export const MOCK_CONTRACTS: Contract[] = [
    { id: 'HD0001', title: 'Hợp đồng cung cấp ấn phẩm quảng cáo 2025', customerId: 'KH002', contractValue: 150000000, signingDate: new Date('2025-01-15'), expiryDate: new Date('2025-12-31'), status: ContractStatus.Active, content: 'Nội dung chi tiết hợp đồng...', salespersonId: 'NV002', attachments: [] },
    { id: 'HD0002', title: 'Hợp đồng in ấn bao bì sản phẩm', customerId: 'KH2720', contractValue: 75000000, signingDate: new Date('2024-06-01'), expiryDate: new Date('2025-05-31'), status: ContractStatus.Active, content: 'Nội dung...', salespersonId: 'NV004', attachments: [] }
];

export const MOCK_COMPANY_INFO: CompanyInfo = {
    name: 'CÔNG TY TNHH IN ẤN TRẦN GIA',
    taxCode: '0315891337',
    address: '52 Đường số 5, Cư Xá Bình Thới, P. Bình Thới, TP.HCM',
    phone: '0898 123 989',
    email: 'it.inantrangia@gmail.com',
    logoUrl: "https://inantrangia.vn/upload/in-an-tran-gia-01.png",
    vatRate: 8,
    bankAccounts: [
        { id: 'BA001', accountNumber: '123456789', bankName: 'Vietcombank', accountHolder: 'CONG TY TNHH IN AN TRAN GIA', bin: '970436' },
        { id: 'BA002', accountNumber: '987654321', bankName: 'ACB', accountHolder: 'CONG TY TNHH IN AN TRAN GIA', bin: '970416' }
    ],
    bankTransferContentTemplate: 'TT {orderId}',
    defaultMarkup: 30,
    managementFeePercentage: 5,
    subscriptionPlanId: 'plan_advanced',
    subscriptionStatus: SubscriptionStatus.Active,
    subscriptionExpiryDate: new Date('2025-12-31'),
};

export const MOCK_CASH_TRANSACTIONS: CashTransaction[] = [
    { id: 'PT001', type: CashTransactionType.Receipt, date: new Date('2025-11-20'), amount: 5000000, subject: 'Anh Hùng', reason: 'Thu tiền cọc đơn hàng DH003'},
    { id: 'PC001', type: CashTransactionType.Payment, date: new Date('2025-11-19'), amount: 2500000, subject: 'Công ty giấy ABC', reason: 'Trả tiền mua giấy'},
];

export const MOCK_BANK_TRANSACTIONS: BankTransaction[] = [
    { 
        id: 'NT001', 
        type: BankTransactionType.Receipt, 
        date: new Date('2025-11-20'), 
        amount: 25000000, 
        subject: 'Công ty TNHH B', 
        reason: 'CTY B TT DOT 1 HD CATALOGUE', 
        internalNote: 'Khách hàng Công ty TNHH B thanh toán đợt 1 cho hợp đồng in 5000 cuốn catalogue, theo HĐ số HD0001.',
        bankAccountId: 'BA001', // Vietcombank
        receiverName: 'Công ty TNHH B',
        receiverBankName: 'ACB - CN Sài Gòn',
        receiverBankAccount: '888999111'
    },
    { 
        id: 'NC001', 
        type: BankTransactionType.Payment, 
        date: new Date('2025-11-18'), 
        amount: 12500000, 
        subject: 'Công ty Giấy An Hòa', 
        reason: 'TT TIEN MUA GIAY PO-001', 
        internalNote: 'Thanh toán tiền mua giấy Couche theo đơn mua hàng PO-001 cho NCC An Hòa.',
        bankAccountId: 'BA001', // Vietcombank
        receiverName: 'Cty CP Giấy An Hòa',
        receiverBankName: 'BIDV - CN Đồng Nai',
        receiverBankAccount: '67896789'
    },
    { 
        id: 'NC002', 
        type: BankTransactionType.Payment, 
        date: new Date('2025-11-15'), 
        amount: 3200000, 
        subject: 'Điện lực Bình Tân', 
        reason: 'TT TIEN DIEN T10/2025', 
        internalNote: 'Thanh toán tiền điện tháng 10/2025 cho công ty.',
        bankAccountId: 'BA002', // ACB
        receiverName: 'Điện lực Bình Tân',
        receiverBankName: 'Vietinbank',
        receiverBankAccount: '11223344'
    },
    { 
        id: 'NT002', 
        type: BankTransactionType.Receipt, 
        date: new Date('2025-11-22'), 
        amount: 5000000, 
        subject: 'Nguyễn Văn A', 
        reason: 'A NGUYEN CK DAT COC', 
        internalNote: 'Khách hàng Nguyễn Văn A chuyển khoản đặt cọc cho đơn hàng in tờ rơi.',
        bankAccountId: 'BA002', // ACB
        receiverName: 'Nguyễn Văn A',
        receiverBankName: 'Techcombank',
        receiverBankAccount: '190333444'
    },
     { 
        id: 'NC003', 
        type: BankTransactionType.Payment, 
        date: new Date('2025-11-23'), 
        amount: 1500000, 
        subject: 'Mực in Đại Việt', 
        reason: 'MUA MUC IN', 
        internalNote: 'Thanh toán tiền mua mực in bổ sung cho xưởng.',
        bankAccountId: 'BA001', // Vietcombank
        receiverName: 'Cửa hàng Đại Việt',
        receiverBankName: 'Vietinbank',
        receiverBankAccount: '10102020'
    }
];

export const MOCK_NUMBERING_RULES: NumberingRule[] = [
    { type: DocumentType.Quote, prefix: 'BG', numberLength: 6, suffix: '', nextNumber: 4 },
    { type: DocumentType.Order, prefix: 'DH', numberLength: 6, suffix: '', nextNumber: 6 },
    { type: DocumentType.Invoice, prefix: 'HD', numberLength: 6, suffix: '', nextNumber: 6 },
    { type: DocumentType.ProductionOrder, prefix: 'LSX', numberLength: 6, suffix: '', nextNumber: 3 },
    { type: DocumentType.Contract, prefix: 'HDG', numberLength: 6, suffix: '', nextNumber: 3 },
    { type: DocumentType.CashReceipt, prefix: 'PT', numberLength: 6, suffix: '', nextNumber: 2 },
    { type: DocumentType.CashPayment, prefix: 'PC', numberLength: 6, suffix: '', nextNumber: 2 },
    { type: DocumentType.BankReceipt, prefix: 'NT', numberLength: 6, suffix: '', nextNumber: 3 },
    { type: DocumentType.BankPayment, prefix: 'NC', numberLength: 6, suffix: '', nextNumber: 4 },
    { type: DocumentType.PurchaseOrder, prefix: 'PO', numberLength: 6, suffix: '', nextNumber: 3 },
    { type: DocumentType.PaperConversion, prefix: 'CUT', numberLength: 6, suffix: '', nextNumber: 1 },
    { type: DocumentType.Supplier, prefix: 'NCC', numberLength: 4, suffix: '', nextNumber: 104 },
    { type: DocumentType.Customer, prefix: 'KH', numberLength: 5, suffix: '', nextNumber: 2721 },
    { type: DocumentType.Product, prefix: 'SP', numberLength: 5, suffix: '', nextNumber: 9 },
    { type: DocumentType.CustomerGroup, prefix: 'NKH', numberLength: 3, suffix: '', nextNumber: 4 },
    { type: DocumentType.CostingRecord, prefix: 'TGT', numberLength: 6, suffix: '', nextNumber: 1 },
    { type: DocumentType.BillOfMaterial, prefix: 'BOM', numberLength: 6, suffix: '', nextNumber: 2 },
];

export const MOCK_PLANS: SubscriptionPlan[] = [
    { 
        id: 'plan_support', 
        name: 'GÓI SUPPORT', 
        price: 199000, 
        billingCycle: 'tháng', 
        features: [
            {text: '3 người dùng'}, 
            {text: 'Quản lý bán hàng & Kho'}, 
            {text: 'Quản lý Công nợ & Quỹ tiền'}, 
            {text: 'Báo cáo cơ bản'}, 
            {text: 'Sao lưu dữ liệu hàng ngày', isNew: true}, // Added
            {text: 'Hỗ trợ trong giờ hành chính'}
        ], 
        subtext: ['Dành cho xưởng in nhỏ'], 
        description: 'Giải pháp khởi đầu hoàn hảo cho các xưởng in mới thành lập, tập trung vào các tính năng cốt lõi.'
    },
    { 
        id: 'plan_standard', 
        name: 'GÓI STANDARD', 
        price: 399000, // Updated from 499000
        billingCycle: 'tháng', 
        features: [
            {text: '15 người dùng'}, 
            {text: 'Tất cả tính năng Gói Support'}, 
            {text: 'Module Tính giá thành chi tiết'}, 
            {text: 'Quản lý Lệnh sản xuất'}, 
            {text: 'Phân quyền nhân viên'},
            {text: 'Quản lý Mua hàng & NCC', isNew: true},
            {text: 'Quản lý Cắt giấy/Xả cuộn', isNew: true},
            {text: 'Tính Lương/Thưởng Nhân viên', isNew: true},
            {text: 'Quản lý định mức vật tư (BOM)', isNew: true}, // Added
            {text: 'Hỗ trợ ưu tiên'}
        ], 
        subtext: ['Dành cho xưởng in đang phát triển'], 
        description: 'Gói phổ biến nhất, cung cấp bộ công cụ toàn diện để tối ưu hóa vận hành và tăng trưởng.', 
        popular: true
    },
    { 
        id: 'plan_advanced', 
        name: 'GÓI ADVANCED', 
        price: 799000, // Updated from 999000
        billingCycle: 'tháng', 
        features: [
            {text: 'Không giới hạn người dùng'}, 
            {text: 'Tất cả tính năng Gói Standard'}, 
            {text: 'Tích hợp Website & Zalo ZNS'}, 
            {text: 'Tích hợp Hóa đơn Điện tử', isNew: true},
            {text: 'Module tùy chỉnh (Custom Module)'}, 
            {text: 'Báo cáo quản trị chuyên sâu (BI)', isNew: true}, // Added
            {text: 'Hỗ trợ kỹ thuật 24/7'}
        ], 
        subtext: ['Dành cho xưởng in quy mô lớn'], 
        description: 'Giải pháp cao cấp nhất với khả năng tùy biến và tích hợp không giới hạn, đáp ứng mọi nhu cầu phức tạp.'
    },
];

export const MOCK_PRINT_COST_COMPONENTS: PrintCostComponent[] = [];
export const MOCK_COSTING_RECORDS: CostingRecord[] = [];

// --- UPDATED RAW MATERIAL GROUPS ---
export const MOCK_RAW_MATERIAL_GROUPS: RawMaterialGroup[] = [
    { id: 'RMG001', name: 'Màng nhiệt', description: 'Các loại màng cán nhiệt' },
    { id: 'RMG002', name: 'Mực in', description: 'Mực in Offset, UV...' },
    { id: 'RMG003', name: 'Keo dán', description: 'Keo sữa, keo nhiệt' },
    { id: 'RMG004', name: 'Vật tư khác', description: 'Kim ghim, dây buộc...' },
];

// --- UPDATED RAW MATERIALS ---
export const MOCK_RAW_MATERIALS: RawMaterial[] = [
    { id: 'RM001', groupId: 'RMG001', name: 'Màng bóng 25mic (Cuộn)', unit: 'cuộn', purchasePrice: 350000, sellingPrice: 450000, initialStock: 50, lowStockThreshold: 5 },
    { id: 'RM002', groupId: 'RMG001', name: 'Màng mờ 25mic (Cuộn)', unit: 'cuộn', purchasePrice: 380000, sellingPrice: 480000, initialStock: 50, lowStockThreshold: 5 },
    { id: 'RM003', groupId: 'RMG002', name: 'Mực in 4 màu (Bộ)', unit: 'bộ', purchasePrice: 1200000, sellingPrice: 1500000, initialStock: 10, lowStockThreshold: 2 },
    { id: 'RM004', groupId: 'RMG002', name: 'Mực đen (Kg)', unit: 'kg', purchasePrice: 150000, sellingPrice: 200000, initialStock: 20, lowStockThreshold: 5 },
    { id: 'RM005', groupId: 'RMG003', name: 'Keo sữa (Thùng 10kg)', unit: 'thùng', purchasePrice: 400000, sellingPrice: 500000, initialStock: 15, lowStockThreshold: 3 },
];

export const MOCK_CUSTOM_OBJECT_DEFINITIONS: CustomObjectDefinition[] = [
    {
        id: 'MOD_ASSETS',
        name: 'Tài sản',
        pluralName: 'Quản lý Tài sản',
        slug: 'tai-san',
        fields: [
            { id: 'field_1', name: 'ten_tai_san', label: 'Tên tài sản', type: 'text', isRequired: true },
            { id: 'field_2', name: 'ma_tai_san', label: 'Mã tài sản', type: 'text', isRequired: true },
            { id: 'field_3', name: 'ngay_mua', label: 'Ngày mua', type: 'date', isRequired: false },
            { id: 'field_4', name: 'nguyen_gia', label: 'Nguyên giá', type: 'number', isRequired: false },
            { id: 'field_5', name: 'tinh_trang', label: 'Tình trạng', type: 'select', isRequired: false, options: ['Đang sử dụng', 'Hỏng', 'Đã thanh lý'] },
        ]
    }
];
export const MOCK_CUSTOM_OBJECT_RECORDS: CustomObjectRecord[] = [
    {
        id: 'REC_ASSET_1',
        definitionId: 'MOD_ASSETS',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        fields: {
            ten_tai_san: 'Máy in Offset A',
            ma_tai_san: 'MIO-01',
            ngay_mua: '2024-01-10',
            nguyen_gia: 550000000,
            tinh_trang: 'Đang sử dụng'
        }
    }
];

export const MOCK_WASTAGE_RULES: WastageRule[] = [ { id: 'WR001', threshold: 1000, sheets: 50 }, { id: 'WR002', threshold: 5000, sheets: 100 }, { id: 'WR003', threshold: 10000, sheets: 150 } ];
export const MOCK_PLATE_PRICES: PlatePrice[] = [ { id: 'PP001', machineSize: '52x72', price: 150000 }, { id: 'PP002', machineSize: '79x109', price: 250000 }, ];
export const MOCK_RUNNING_COST_RULES: RunningCostRule[] = [ { id: 'RC001', threshold: 1000, pricePerSheet: 500 }, { id: 'RC002', threshold: 5000, pricePerSheet: 300 }, { id: 'RC003', threshold: 10000, pricePerSheet: 200 } ];

export const DEFAULT_DOCUMENT_TEMPLATE_A5 = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A5; margin: 5mm; }
        body { font-family: 'Times New Roman', serif; font-size: 10px; line-height: 1.4; color: #000; }
        .container { width: 100%; }
        table { width: 100%; border-collapse: collapse; }
        .header-table td { padding: 0; vertical-align: top; border: none; }
        .items-table th, .items-table td { padding: 5px; border: 1px solid #000; word-break: break-word; }
        .items-table th { background-color: #f2f2f2; font-weight: bold; }
        .totals-table td { padding: 3px 0; border: none; }
        .signatures-table { margin-top: 40px; text-align: center; }
        .signatures-table td { border: none; padding: 0; vertical-align: top; }
        h1, h2, h3 { margin: 0; }
        p { margin: 0 0 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <table class="header-table" style="margin-bottom: 0;">
            <tr>
                <td style="width: 20%;"><img src="{logo}" alt="Logo" style="max-width: 100px; max-height: 50px; object-fit: contain;"></td>
                <td style="width: 50%;">
                    <h2 style="font-size: 10.5px; font-weight: bold; text-transform: uppercase;">{companyName}</h2>
                    <p style="font-size: 10.5px;"><b>ĐC:</b> {companyAddress}</p>
                    <p style="font-size: 10.5px;"><b>ĐT:</b> {companyPhone} | <b>Email:</b> {companyEmail}</p>
                </td>
                <td style="width: 30%; text-align: right; vertical-align: middle;">
                    <div style="border: 1px solid #000; padding: 5px; display: inline-block; text-align: left;">
                        <p style="font-size: 10px; margin: 0 0 2px 0;">Số: <strong>{orderId}</strong></p>
                        <p style="font-size: 10px; margin: 0;">Ngày: {orderDate}</p>
                    </div>
                </td>
            </tr>
        </table>
        <div style="text-align: center; margin-top: 10px; margin-bottom: 20px;">
             <h1 style="font-size: 18px; font-weight: bold; color: #000; margin: 0; display: inline-block; border-bottom: 3px double #000; padding-bottom: 2px; line-height: 1;">{title}</h1>
        </div>
        
        <!-- Customer Info -->
        <table style="width: 100%; margin-bottom: 15px; font-size: 10px;">
            <tr>
                <td style="width: 15%; font-weight: bold;">Khách hàng:</td>
                <td style="width: 55%;">{customerName}</td>
                <td style="width: 30%;"><span style="font-weight: bold;">Mã KH:</span> {customerId}</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Địa chỉ:</td>
                <td colspan="2">{customerAddress}</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Điện thoại:</td>
                <td colspan="2">{customerPhone}</td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table" style="margin-bottom: 15px;">
            <thead>
                <tr>
                    <th style="width: 7%; text-align: center;">STT</th>
                    <th style="width: 47%; text-align: left;">Tên hàng hóa / Dịch vụ</th>
                    <th style="width: 8%; text-align: center;">ĐVT</th>
                    <th style="width: 10%; text-align: center;">SL</th>
                    <th style="width: 14%; text-align: right;">Đơn giá</th>
                    <th style="width: 14%; text-align: right;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                {itemsTableRows}
            </tbody>
        </table>

        <!-- Totals -->
        <table style="width: 100%; margin-bottom: 15px;">
             <tr>
                <td style="width: 50%; vertical-align: bottom;">
                    <p style="font-style: italic; font-size: 10.5px;">(Bằng chữ: {amountInWords})</p>
                </td>
                <td style="width: 50%;">
                    <table class="totals-table">
                        <tr>
                            <td style="text-align: right;">Cộng tiền hàng:</td>
                            <td style="width: 120px; text-align: right; font-weight: bold;">{subTotal} d</td>
                        </tr>
                        <tr>
                            <td style="text-align: right;">Thuế GTGT ({vatRate}%):</td>
                            <td style="text-align: right; font-weight: bold;">{vatAmount} d</td>
                        </tr>
                        <tr>
                            <td style="text-align: right; font-weight: bold; font-size: 11px; border-top: 1px solid #000; padding-top: 5px;">TỔNG CỘNG:</td>
                            <td style="text-align: right; font-weight: bold; font-size: 11px; border-top: 1px solid #000; padding-top: 5px;">{totalAmount} d</td>
                        </tr>
                         <tr>
                            <td style="text-align: right;">Đã thanh toán/cọc:</td>
                            <td style="text-align: right; font-weight: bold;">{depositAmount} d</td>
                        </tr>
                        <tr>
                            <td style="text-align: right;">Còn lại:</td>
                            <td style="text-align: right; font-weight: bold;">{remainingAmount} d</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        
        <!-- Notes -->
        <div style="font-size: 10.5px; font-style: italic; border-top: 1px dashed #999; padding-top: 10px;">
            <p><b>Lưu ý:</b> Báo giá có hiệu lực đến ngày {expiryDate}. Quý khách vui lòng kiểm tra kỹ thông tin trước khi xác nhận.</p>
        </div>

        <!-- Signatures -->
        <table class="signatures-table" style="font-size: 10px;">
            <tr>
                <td style="width: 50%;">
                    <p style="font-weight: bold;">KHÁCH HÀNG</p>
                    <p style="font-style: italic;">(Ký, ghi rõ họ tên)</p>
                </td>
                <td style="width: 50%;">
                    <p style="font-weight: bold;">NGƯỜI LẬP PHIẾU</p>
                    <p style="font-style: italic;">(Ký, ghi rõ họ tên)</p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;

export const DEFAULT_RECEIPT_TEMPLATE_A5 = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A5 landscape; margin: 10mm; }
        body { font-family: 'Times New Roman', serif; font-size: 13px; line-height: 1.5; margin: 0; padding: 0; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .company-info { font-size: 12px; }
        .company-name { font-weight: bold; font-size: 14px; text-transform: uppercase; }
        .voucher-title { text-align: center; font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 10px 0; }
        .voucher-date { text-align: center; font-style: italic; margin-bottom: 20px; font-size: 13px; }
        .content-row { margin-bottom: 10px; font-size: 14px; }
        .label { min-width: 130px; display: inline-block; }
        .value { font-weight: bold; }
        .money-text { font-style: italic; }
        .signatures { display: flex; justify-content: space-between; margin-top: 40px; text-align: center; }
        .sig-block { width: 20%; }
        .sig-title { font-weight: bold; font-size: 12px; }
        .sig-note { font-style: italic; font-size: 11px; margin-bottom: 60px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <div class="company-name">{companyName}</div>
            <div>{companyAddress}</div>
            <div>ĐT: {companyPhone}</div>
        </div>
        <div style="text-align: center; font-size: 12px;">
            <div style="font-weight: bold;">Mẫu số 01-TT</div>
            <div style="font-style: italic;">(Ban hành theo TT số 200/2014/TT-BTC)</div>
            <div style="margin-top: 5px;">Quyển số: .......</div>
            <div>Số: <b>{id}</b></div>
        </div>
    </div>

    <div class="voucher-title">PHIẾU THU</div>
    <div class="voucher-date">Ngày {day} tháng {month} năm {year}</div>

    <div class="content-row">
        <span class="label">Họ và tên người nộp:</span>
        <span class="value">{payerName}</span>
    </div>
    <div class="content-row">
        <span class="label">Đơn vị:</span>
        <span>{customerName}</span>
    </div>
    <div class="content-row">
        <span class="label">Địa chỉ:</span>
        <span>{address}</span>
    </div>
    <div class="content-row">
        <span class="label">Lý do nộp:</span>
        <span>{reason}</span>
    </div>
    <div class="content-row">
        <span class="label">Số tiền:</span>
        <span class="value" style="font-size: 16px;">{amount} VND</span>
    </div>
    <div class="content-row">
        <span class="label">Bằng chữ:</span>
        <span class="money-text">{amountInWords}</span>
    </div>
    <div class="content-row">
        <span class="label">Kèm theo:</span>
        <span>{referenceDoc} chứng từ gốc.</span>
    </div>

    <div class="signatures">
        <div class="sig-block">
            <div class="sig-title">Giám đốc</div>
            <div class="sig-note">(Ký, họ tên, đóng dấu)</div>
        </div>
        <div class="sig-block">
            <div class="sig-title">Kế toán trưởng</div>
            <div class="sig-note">(Ký, họ tên)</div>
        </div>
        <div class="sig-block">
            <div class="sig-title">Người nộp tiền</div>
            <div class="sig-note">(Ký, họ tên)</div>
        </div>
        <div class="sig-block">
            <div class="sig-title">Người lập phiếu</div>
            <div class="sig-note">(Ký, họ tên)</div>
        </div>
        <div class="sig-block">
            <div class="sig-title">Thủ quỹ</div>
            <div class="sig-note">(Ký, họ tên)</div>
        </div>
    </div>
</body>
</html>`;

export const DEFAULT_LSX_TEMPLATE_A5 = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lệnh Sản Xuất</title>
    <style>
        /* ========================================= */
        /* BIẾN CSS & CẤU HÌNH CƠ BẢN */
        /* ========================================= */
        :root {
            --popup-bg-color: #d5ebf7;
            --popup-border-color-with: rgba(81, 115, 168, 0.6);
            --popup-text-color: #000;
            --popup-color: #333; /* Thêm màu cơ bản */

            --popup-padding: 20px;
            --section-padding: 8px;
            --field-gap: 8px;
            --border-width: 1px;
            --radius-primary: 8px;
            --radius-pill: 12px;
            
            --font-family-base: 'Roboto', sans-serif;
            --font-weight-bold: 700;
            
            /* Font size mặc định */
            --font-size-header: 30px; 
            --font-size-title: 16px;
            --font-size-base: 16px;

            /* Màu fallback cho button */
            --gradient-vivid: linear-gradient(to right, #007bff, #0056b3);
            --gradient-success: linear-gradient(to right, #28a745, #218838);
            --white: #fff;
            --blue-500: #007bff;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: var(--font-family-base);
            background-color: #f5f5f5; /* Màu nền web để dễ nhìn */
        }

        /* ========================================= */
        /* LAYOUT CHÍNH */
        /* ========================================= */
        #lsx-popup-overlay {
            /* Thay đổi: Hiển thị luôn thay vì display: none */
            display: flex; 
            justify-content: center;
            align-items: flex-start;
            padding: 20px;
            box-sizing: border-box;
            background-color: #fff;
            min-height: 100vh;
        }

        .lsx-popup {
            background-color: #fff;
            border-radius: var(--radius-primary);
            border: 1px solid #ccc;
            width: 100%;
            max-width: 1100px; /* Giới hạn chiều rộng để giống tờ giấy */
            font-family: var(--font-family-base);
            color: var(--popup-color);
            display: flex;
            flex-direction: column;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .lsx-popup__header {
            text-align: center;
            font-size: var(--font-size-header);
            font-weight: var(--font-weight-bold);
            color: var(--popup-color);
            background-color: #f3f3f3;
            padding: 14px 0;
            border-bottom: 2px solid var(--popup-border-color-with);
            border-top-left-radius: var(--radius-primary);
            border-top-right-radius: var(--radius-primary);
            position: relative;
        }
        
        /* Thêm tên công ty vào header */
        .company-name-sub {
            display: block;
            font-size: 14px;
            margin-top: 5px;
            font-weight: normal;
            text-transform: uppercase;
        }

        .lsx-popup__body {
            padding: var(--popup-padding);
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            grid-auto-rows: auto;
            gap: var(--popup-padding);
        }

        /* ========================================= */
        /* CÁC SECTION VÀ FIELD */
        /* ========================================= */
        .lsx-popup__section {
            border: var(--border-width) solid var(--popup-border-color-with);
            border-radius: var(--radius-primary);
            padding: var(--section-padding);
            display: flex;
            flex-direction: column;
            gap: var(--section-padding);
            background-color: #fbfbfb;
            min-width: 0;
        }

        .lsx-popup__section--full-width {
            grid-column: 1 / -1;
        }

        .lsx-popup-section__title {
            background-color: var(--popup-bg-color);
            border: var(--border-width) solid var(--popup-border-color-with);
            border-radius: var(--radius-pill);
            text-align: center;
            font-weight: var(--font-weight-bold);
            padding: 5px;
            font-size: var(--font-size-title);
        }

        .lsx-popup-field {
            display: flex;
            gap: var(--field-gap);
            align-items: center;
        }

        .lsx-popup-field__label {
            background-color: var(--popup-bg-color);
            border: var(--popup-border-color-with) solid var(--border-width);
            border-radius: var(--radius-pill);
            padding: 6px 14px;
            font-weight: var(--font-weight-bold);
            font-size: var(--font-size-title);
            flex-shrink: 0;
        }

        .lsx-popup-field__control {
            flex-grow: 1;
            border: var(--border-width) solid var(--popup-border-color-with);
            border-radius: var(--radius-pill);
            background-color: #fff;
            padding: 6px 14px;
            min-height: 28px; /* Giảm nhẹ chiều cao */
            display: flex;
            align-items: center;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
            font-size: var(--font-size-base);
            font-weight: 500;
        }

        .lsx-popup-field__control--multiline {
            white-space: pre-wrap;
            word-wrap: break-word;
            align-items: flex-start;
            padding-top: 6px;
            padding-bottom: 6px;
        }

        .custom-checkbox {
            width: 28px;
            height: 28px;
            flex-shrink: 0;
            border: 2px solid var(--popup-border-color-with);
            border-radius: 6px;
            background-color: #fff;
            display: inline-block;
            margin-left: 4px;
        }

        /* Căn chỉnh cụ thể cho các ID */
        #popup-sku { font-weight: var(--font-weight-bold); font-size: 16px; color: #d32f2f; }
        #popup-staff-name, #popup-sku, #popup-so-phieu, #popup-stt { justify-content: center; }

        /* ========================================= */
        /* CẤU TRÚC LƯỚI CHI TIẾT */
        /* ========================================= */
        #product-info-section {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: var(--section-padding);
        }
        #product-info-section .lsx-popup-section__title { grid-column: 1 / -1; }
        #product-info-section .lsx-popup-field { display: contents; }
        #product-info-section .lsx-popup-field__label,
        #product-info-section .lsx-popup-field__control { align-self: center; }

        #progress-section {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: var(--section-padding);
        }
        #progress-section .lsx-popup-section__title { grid-column: 1 / -1; }
        #progress-section .lsx-popup-field { display: contents; }
        /* Dòng cuối của progress (Gửi in) full width */
        #progress-section .lsx-popup-field:last-child { display: flex; grid-column: 1 / -1; }

        #notes-section {
            display: grid;
            grid-template-columns: 100px 1fr;
            gap: var(--section-padding);
        }
        #notes-section .lsx-popup-field { display: contents; }
        #popup-machining, #popup-note { min-height: 40px; }

        /* ========================================= */
        /* FOOTER & BUTTONS */
        /* ========================================= */
        .lsx-popup__footer {
            display: flex;
            justify-content: center;
            padding: var(--popup-padding);
            border-top: 2px solid #F1F1F2;
            gap: 15px;
        }
        .btn { border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        .btn-popup-in { background-image: var(--gradient-success); color: #fff; }

        /* ========================================= */
        /* MEDIA PRINT */
        /* ========================================= */
        @media print {
            @page {
                size: A5 landscape;
                margin: 0.5cm;
            }

            html, body {
                height: 100%;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                /* Tùy chỉnh zoom để vừa trang A5 ngang */
                zoom: 0.85; 
            }

            /* Ẩn nút khi in */
            .lsx-popup__footer { display: none !important; }

            #lsx-popup-overlay {
                display: block !important;
                position: static !important;
                width: 100%;
                height: auto;
                padding: 0 !important;
                background: none !important;
            }

            .lsx-popup {
                box-shadow: none !important;
                border: none !important;
                width: 100%;
                max-width: none !important;
            }
            
            /* Tinh chỉnh màu sắc khi in để đậm hơn */
            .lsx-popup-section__title, .lsx-popup-field__label {
                background-color: #e9ecef !important;
                color: #000 !important;
                border: 1px solid #999 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .lsx-popup-field__control {
                border: 1px solid #999 !important;
            }
        }
    </style>
</head>
<body>

<div id="lsx-popup-overlay">
    <div class="lsx-popup">
        <div class="lsx-popup__header">
            LỆNH SẢN XUẤT
            <span class="company-name-sub">{companyName}</span>
        </div>

        <div class="lsx-popup__body">
            <div class="lsx-popup__section">
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">ĐƠN HÀNG</span>
                    <span id="popup-sku" class="lsx-popup-field__control">{relatedOrderId}</span>
                </div>
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">NGÀY ĐẶT</span>
                    <span id="popup-order-date" class="lsx-popup-field__control">{orderDate}</span>
                    
                    <span class="lsx-popup-field__label">NGÀY GIAO</span>
                    <span id="popup-delivery-date" class="lsx-popup-field__control">{deliveryDate}</span>
                </div>
            </div>

            <div class="lsx-popup__section">
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">KINH DOANH</span>
                    <span id="popup-staff-name" class="lsx-popup-field__control">{salesperson}</span>
                </div>
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">SỐ PHIẾU</span>
                    <span id="popup-so-phieu" class="lsx-popup-field__control">{id}</span>
                    
                    <span class="lsx-popup-field__label">STT</span>
                    <span id="popup-stt" class="lsx-popup-field__control"></span>
                </div>
            </div>

            <div class="lsx-popup__section" id="product-info-section">
                <div class="lsx-popup-section__title">THÔNG TIN SẢN PHẨM</div>
                
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">SẢN PHẨM</span>
                    <span id="popup-product-name" class="lsx-popup-field__control">{productName}</span>
                </div>
                
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">KÍCH THƯỚC</span>
                    <span id="popup-size" class="lsx-popup-field__control">{size}</span>
                </div>
                
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">CHẤT LIỆU</span>
                    <span id="popup-material-name" class="lsx-popup-field__control">{material}</span>
                </div>
                
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">SỐ TRANG/ MẶT</span>
                    <span id="popup-number-of-pages" class="lsx-popup-field__control">{pages}</span>
                </div>
                
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">SỐ LƯỢNG</span>
                    <span id="popup-quantity" class="lsx-popup-field__control" style="font-weight: bold; color: red;">{quantity}</span>
                </div>
            </div>

            <div class="lsx-popup__section" id="progress-section">
                <div class="lsx-popup-section__title">THÔNG SỐ KỸ THUẬT</div>
                
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">THIẾT KẾ</span>
                    <span id="popup-design" class="lsx-popup-field__control">{design}</span>
                    <div class="custom-checkbox"></div>
                </div>
                
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">CHỐT IN</span>
                    <span id="popup-chot-in" class="lsx-popup-field__control"></span>
                    <div class="custom-checkbox"></div>
                </div>
                
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">BÌNH FILE</span>
                    <span id="popup-binh-file" class="lsx-popup-field__control"></span>
                    <div class="custom-checkbox"></div>
                </div>
                
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">PHƯƠNG THỨC</span>
                    <span id="popup-printing-method" class="lsx-popup-field__control">{printMethod}</span>
                    <div></div>
                </div>
                
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">MÀU IN</span>
                    <span id="popup-print-color" class="lsx-popup-field__control">{printColor}</span>
                    
                    <span class="lsx-popup-field__label">GỬI IN</span>
                    <span id="popup-gui-in" class="lsx-popup-field__control"></span>
                    <div class="custom-checkbox"></div>
                </div>
            </div>

            <div class="lsx-popup__section lsx-popup__section--full-width" id="notes-section">
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">GIA CÔNG</span>
                    <span id="popup-machining" class="lsx-popup-field__control lsx-popup-field__control--multiline">{finishing}</span>
                </div>
                <div class="lsx-popup-field">
                    <span class="lsx-popup-field__label">GHI CHÚ</span>
                    <span id="popup-note" class="lsx-popup-field__control lsx-popup-field__control--multiline">{notes}</span>
                </div>
            </div>
        </div>

        <div className="lsx-popup__footer">
            <button className="btn btn-popup-in" onclick="window.print()">In Lệnh Sản Xuất</button>
        </div>
    </div>
</div>

</body>
</html>`;

export const DEFAULT_CASH_COUNT_TEMPLATE_A4 = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@page { size: A4; } body { font-family: 'Times New Roman', serif; font-size: 12px; } .container { max-width: 180mm; margin: auto; } table { width: 100%; border-collapse: collapse; } th, td { padding: 8px; border: 1px solid #000; } </style></head><body>
<div class="container">
    <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="text-transform: uppercase; font-size: 14px; font-weight: bold;">{companyName}</h2>
        <p>{companyAddress}</p>
        <h1 style="font-size: 20px; font-weight: bold; margin: 20px 0;">BIÊN BẢN KIỂM KÊ QUỸ TIỀN MẶT</h1>
        <p>Thời điểm kiểm kê: {countDate}</p>
    </div>
    <h3>I. Bảng kê chi tiết:</h3>
    <table><thead><tr><th>Mệnh giá (VND)</th><th>Số lượng (tờ)</th><th>Thành tiền (VND)</th></tr></thead><tbody>{denominationsTableRows}</tbody></table>
    <h3>II. Kết quả:</h3>
    <table style="width: 50%; margin-left: auto; margin-right: auto;">
        <tr><td style="font-weight: bold;">Tổng số tiền thực tế:</td><td style="text-align: right; font-weight: bold;">{totalActual} đ</td></tr>
        <tr><td>Số dư theo sổ sách:</td><td style="text-align: right;">{systemBalance} đ</td></tr>
        <tr><td style="font-weight: bold;">Chênh lệch:</td><td style="text-align: right; font-weight: bold;">{difference} đ</td></tr>
    </table>
</div></body></html>`;

export const DEFAULT_LEDGER_TEMPLATE_A4 = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@page { size: A4; } body { font-family: 'Times New Roman', serif; font-size: 12px; } .container { max-width: 190mm; margin: auto; } table { width: 100%; border-collapse: collapse; } th, td { padding: 8px; border: 1px solid #000; } </style></head><body>
<div class="container">
    <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="text-transform: uppercase; font-size: 14px; font-weight: bold;">{companyName}</h2>
        <h1 style="font-size: 20px; font-weight: bold; margin: 20px 0;">SỔ CHI TIẾT QUỸ TIỀN MẶT / TIỀN GỬI</h1>
        <p>Tài khoản: {bankName} {accountNumber}</p>
        <p>Từ ngày: {startDate} - Đến ngày: {endDate}</p>
    </div>
    <table>
        <thead><tr><th>Ngày</th><th>Số CT</th><th>Diễn giải</th><th style="text-align: right;">Thu</th><th style="text-align: right;">Chi</th><th style="text-align: right;">Tồn</th></tr></thead>
        <tbody>
            <tr style="font-weight: bold;"><td colspan="5" style="text-align: right;">Số dư đầu kỳ</td><td style="text-align: right;">{openingBalance}</td></tr>
            {ledgerTableRows}
            <tr style="font-weight: bold;"><td colspan="5" style="text-align: right;">Số dư cuối kỳ</td><td style="text-align: right;">{closingBalance}</td></tr>
        </tbody>
    </table>
</div></body></html>`;

export const DEFAULT_CASH_TRANSACTION_TEMPLATE_A5 = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A5 landscape; margin: 10mm; }
        body { font-family: 'Times New Roman', serif; font-size: 13px; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .company-info { font-weight: bold; }
        .template-code { text-align: center; font-weight: bold; font-size: 12px; }
        .title { text-align: center; font-size: 20px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
        .date { text-align: center; font-style: italic; margin-bottom: 15px; }
        .row { margin-bottom: 8px; }
        .label { min-width: 120px; display: inline-block; }
        .content { font-weight: bold; }
        .signatures { display: flex; justify-content: space-between; margin-top: 30px; text-align: center; }
        .sig-col { width: 20%; }
        .sig-title { font-weight: bold; font-size: 12px; }
        .sig-sub { font-style: italic; font-size: 11px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <div>{companyName}</div>
            <div style="font-weight: normal; font-size: 11px;">{companyAddress}</div>
        </div>
        <div class="template-code">
            <div>Mẫu số {formNumber}-TT</div>
            <div style="font-style: italic; font-weight: normal;">(Ban hành theo TT số 200/2014/TT-BTC<br>ngày 22/12/2014 của Bộ Tài chính)</div>
            <div style="margin-top: 5px; text-align: left;">Quyển số:.........</div>
            <div style="text-align: left;">Số: {id}</div>
        </div>
    </div>

    <div class="title">{title}</div>
    <div class="date">Ngày {day} tháng {month} năm {year}</div>

    <div class="row">
        <span class="label">Họ và tên người {actionType}:</span>
        <span class="content">{receiverName}</span>
    </div>
    <div class="row">
        <span class="label">Đơn vị:</span>
        <span>{subject}</span>
    </div>
    <div class="row">
        <span class="label">Địa chỉ:</span>
        <span>{address}</span>
    </div>
    <div class="row">
        <span class="label">Lý do {actionType}:</span>
        <span>{reason}</span>
    </div>
    <div class="row">
        <span class="label">Số tiền:</span>
        <span class="content">{amount} đ</span>
    </div>
    <div class="row">
        <span class="label">Bằng chữ:</span>
        <span style="font-style: italic;">{amountInWords}</span>
    </div>
    <div class="row">
        <span class="label">Kèm theo:</span>
        <span>{referenceDoc} chứng từ gốc</span>
    </div>

    <div class="signatures">
        <div class="sig-col">
            <div class="sig-title">Giám đốc</div>
            <div class="sig-sub">(Ký, họ tên, đóng dấu)</div>
        </div>
        <div class="sig-col">
            <div class="sig-title">Kế toán trưởng</div>
            <div class="sig-sub">(Ký, họ tên)</div>
        </div>
        <div class="sig-col">
            <div class="sig-title">Người lập phiếu</div>
            <div class="sig-sub">(Ký, họ tên)</div>
        </div>
        <div class="sig-col">
            <div class="sig-title">Người {actionType} tiền</div>
            <div class="sig-sub">(Ký, họ tên)</div>
        </div>
        <div class="sig-col">
            <div class="sig-title">Thủ quỹ</div>
            <div class="sig-sub">(Ký, họ tên)</div>
        </div>
    </div>
</body>
</html>
`;

export const DEFAULT_BANK_TRANSACTION_TEMPLATE_A5 = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { size: A5 landscape; margin: 10mm; }
        body { font-family: 'Times New Roman', serif; font-size: 13px; line-height: 1.4; }
        .header { text-align: left; margin-bottom: 15px; }
        .title { text-align: center; font-size: 22px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
        .date { text-align: center; font-style: italic; margin-bottom: 20px; }
        .main-table { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 10px; }
        .main-table td { padding: 5px; border: 1px solid #000; vertical-align: top; }
        .label { font-weight: bold; }
        .signatures { display: flex; justify-content: space-between; margin-top: 20px; text-align: center; }
        .sig-col { width: 30%; }
    </style>
</head>
<body>
    <div class="header">
        <div style="font-weight: bold; text-transform: uppercase;">{bankName}</div>
        <div>Chi nhánh: ..............................</div>
    </div>

    <div class="title">{title}</div>
    <div class="date">Ngày {day} tháng {month} năm {year}</div>

    <table class="main-table">
        <tr>
            <td width="50%">
                <div class="label">ĐƠN VỊ TRẢ TIỀN</div>
                <div>Tên đơn vị: {payerName}</div>
                <div>Số tài khoản: <b>{payerAccount}</b></div>
                <div>Tại ngân hàng: {payerBank}</div>
            </td>
            <td width="50%">
                 <table style="width:100%; border-collapse: collapse;">
                    <tr>
                        <td style="width:70%; border: none; padding: 0; vertical-align: top;">
                            <div class="label">ĐƠN VỊ THỤ HƯỞNG</div>
                            <div>Tên đơn vị: {payeeName}</div>
                            <div>Số tài khoản: <b>{payeeAccount}</b></div>
                            <div>Tại ngân hàng: {payeeBank}</div>
                        </td>
                        <td style="width:30%; border: none; padding: 0; text-align: center; vertical-align: middle;">
                            {qrCodeImage}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <div>Số tiền bằng số: <b>{amount} VND</b></div>
                <div>Số tiền bằng chữ: <i style="font-weight: bold;">{amountInWords}</i></div>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <div>Nội dung: {reason}</div>
            </td>
        </tr>
    </table>

    <div class="signatures">
        <div class="sig-col">
            <div class="label">Kế toán trưởng</div>
            <div style="font-style: italic;">(Ký, họ tên)</div>
        </div>
         <div class="sig-col">
             <!-- Bank space -->
        </div>
        <div class="sig-col">
            <div class="label">Chủ tài khoản</div>
            <div style="font-style: italic;">(Ký, họ tên, đóng dấu)</div>
        </div>
    </div>
</body>
</html>
`;


export const MOCK_PRINT_TEMPLATES: PrintTemplate[] = [
    { id: 'tpl_order_a5', name: 'Mẫu ĐH mặc định (A5)', type: 'Order', paperSize: 'A5', updatedAt: new Date(), isActive: true, content: DEFAULT_DOCUMENT_TEMPLATE_A5 },
    { id: 'tpl_invoice_a5', name: 'Mẫu Hóa đơn mặc định (A5)', type: 'Invoice', paperSize: 'A5', updatedAt: new Date(), isActive: true, content: DEFAULT_DOCUMENT_TEMPLATE_A5 },
    { id: 'tpl_quote_a5', name: 'Mẫu Báo giá mặc định (A5)', type: 'Quote', paperSize: 'A5', updatedAt: new Date(), isActive: true, content: DEFAULT_DOCUMENT_TEMPLATE_A5 },
    { id: 'tpl_lsx_a5', name: 'Mẫu Lệnh sản xuất (A5)', type: 'ProductionOrder', paperSize: 'A5', updatedAt: new Date(), isActive: true, content: DEFAULT_LSX_TEMPLATE_A5 },
    { id: 'tpl_cash_count_a4', name: 'Mẫu Kiểm kê quỹ (A4)', type: 'CashCount', paperSize: 'A4', updatedAt: new Date(), isActive: true, content: DEFAULT_CASH_COUNT_TEMPLATE_A4 },
    { id: 'tpl_cash_ledger_a4', name: 'Mẫu Sổ quỹ TM (A4)', type: 'CashLedger', paperSize: 'A4', updatedAt: new Date(), isActive: true, content: DEFAULT_LEDGER_TEMPLATE_A4 },
    { id: 'tpl_bank_ledger_a4', name: 'Mẫu Sổ tiền gửi (A4)', type: 'BankLedger', paperSize: 'A4', updatedAt: new Date(), isActive: true, content: DEFAULT_LEDGER_TEMPLATE_A4 },
    { id: 'tpl_cash_txn_a5', name: 'Mẫu Phiếu Thu/Chi (A5)', type: 'CashTransaction', paperSize: 'A5', updatedAt: new Date(), isActive: true, content: DEFAULT_CASH_TRANSACTION_TEMPLATE_A5 },
    { id: 'tpl_bank_txn_a5', name: 'Mẫu Ủy nhiệm chi/Báo có (A5)', type: 'BankTransaction', paperSize: 'A5', updatedAt: new Date(), isActive: true, content: DEFAULT_BANK_TRANSACTION_TEMPLATE_A5 },
    { id: 'tpl_cash_receipt_a5', name: 'Mẫu Phiếu thu (A5)', type: 'CashReceipt', paperSize: 'A5', updatedAt: new Date(), isActive: true, content: DEFAULT_RECEIPT_TEMPLATE_A5 },
];

export const MOCK_PROFIT_RULES: ProfitRule[] = [
    { id: 'PR001', minCost: 0, maxCost: 1000000, markup: 50 },
    { id: 'PR002', minCost: 1000000, maxCost: 5000000, markup: 35 },
    { id: 'PR003', minCost: 5000000, maxCost: null, markup: 25 }
];

export const MOCK_PROMOTIONS: Promotion[] = [
    {
        id: 'PROMO001',
        code: 'SALE20',
        description: 'Giảm 20% cho đơn hàng đầu tiên',
        type: 'percentage',
        value: 20,
        minOrderValue: 100000,
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
        status: 'active',
        timesUsed: 5,
        usageLimit: 100,
    },
    {
        id: 'PROMO002',
        code: 'GIAM50K',
        description: 'Giảm 50,000đ cho đơn hàng từ 500,000đ',
        type: 'fixed',
        value: 50000,
        minOrderValue: 500000,
        startDate: new Date('2025-11-01'),
        endDate: null,
        status: 'active',
        timesUsed: 23,
        usageLimit: null,
    },
    {
        id: 'PROMO003',
        code: 'HETHAN',
        description: 'Khuyến mãi đã hết hạn',
        type: 'fixed',
        value: 100000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: 'expired',
        timesUsed: 10,
        usageLimit: 10,
    }
];

export const MOCK_ACCESS_LOGS: AccessLogEntry[] = [
    { id: 'log_1', userId: 'NV001', timestamp: new Date(today.getTime() - 1000 * 60 * 10), action: 'Login', ipAddress: '192.168.1.10', status: 'Success' },
    { id: 'log_2', userId: 'NV002', timestamp: new Date(today.getTime() - 1000 * 60 * 60 * 2), action: 'Login', ipAddress: '192.168.1.12', status: 'Success' },
    { id: 'log_3', userId: 'NV001', timestamp: new Date(today.getTime() - 1000 * 60 * 60 * 5), action: 'Logout', ipAddress: '192.168.1.10', status: 'Success' },
    { id: 'log_4', userId: 'NV001', timestamp: new Date(today.getTime() - 1000 * 60 * 60 * 24), action: 'Login', ipAddress: '192.168.1.10', status: 'Success' },
    { id: 'log_5', userId: 'NV003', timestamp: new Date(today.getTime() - 1000 * 60 * 60 * 25), action: 'Failed Login', ipAddress: '14.232.100.50', status: 'Failure' },
];

export const MOCK_ACTIVITY_LOGS: ActivityLogEntry[] = [
    { id: 'act_1', userId: 'NV002', timestamp: new Date(today.getTime() - 1000 * 60 * 30), action: 'Create', targetType: 'Order', targetId: 'DH006', description: 'Tạo đơn hàng mới cho khách Nguyễn Văn A' },
    { id: 'act_2', userId: 'NV001', timestamp: new Date(today.getTime() - 1000 * 60 * 45), action: 'Update', targetType: 'User', targetId: 'NV002', description: 'Cập nhật thông tin nhân viên Trần Thị Sale' },
    { id: 'act_3', userId: 'NV003', timestamp: new Date(today.getTime() - 1000 * 60 * 60), action: 'Create', targetType: 'Invoice', targetId: 'HD005', description: 'Xuất hóa đơn cho đơn hàng DH005' },
    { id: 'act_4', userId: 'NV002', timestamp: new Date(today.getTime() - 1000 * 60 * 120), action: 'Create', targetType: 'Quote', targetId: 'BG004', description: 'Tạo báo giá mới' },
    { id: 'act_5', userId: 'NV001', timestamp: new Date(today.getTime() - 1000 * 60 * 180), action: 'Delete', targetType: 'Product', targetId: 'SP999', description: 'Xóa sản phẩm lỗi' },
];

// --- NEW MOCK DATA FOR PURCHASING ---
export const MOCK_SUPPLIER_GROUPS: SupplierGroup[] = [
    { id: 'SGNCC01', name: 'NCC Giấy' },
    { id: 'SGNCC02', name: 'NCC Mực in' },
    { id: 'SGNCC03', name: 'NCC Vật tư phụ' },
];

export const MOCK_SUPPLIERS: Supplier[] = [
    { 
        id: 'NCC0101', 
        name: 'Công ty Giấy Hoàng Anh', 
        type: 'organization', 
        contactPerson: 'Chị Thảo', 
        contactTitle: 'Chị',
        phone: '0912345678', 
        address: 'Tân phú', 
        totalDebt: 5000000,
        supplierGroupId: 'SGNCC01',
        status: 'active',
        bankAccounts: [{
            id: 'ba_ncc_1',
            bankName: 'Vietcombank',
            accountNumber: '1100629999',
            accountHolder: 'CONG TY GIAY HOANG ANH',
            bankBranch: ''
        }],
        avatarUrl: '', //FIX: Removed long base64 string for brevity and to fix potential errors.
    },
];

// FIX: Added missing mock data definitions used by DataContext.
export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [];
export const MOCK_PAPER_CONVERSIONS: PaperConversion[] = [];

export const MOCK_BOMS: BillOfMaterial[] = [
    {
        id: 'BOM001',
        productId: 'SP001',
        items: [
            { id: 'bi1', itemId: 'MV001', type: 'material', quantity: 1, unit: 'tờ' },
            { id: 'bi2', itemId: 'RM003', type: 'raw_material', quantity: 0.002, unit: 'bộ' }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

export const MOCK_OTHER_COSTS: OtherCost[] = [
    { id: 'OC001', name: 'Phí thiết kế', defaultPrice: 200000, unit: 'Giờ', type: OtherCostType.Variable },
    { id: 'OC002', name: 'Vận chuyển nội thành', defaultPrice: 50000, unit: 'lượt', type: OtherCostType.Fixed },
];
