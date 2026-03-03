import React from 'react';
import { IconName } from '../types';
import { 
    DashboardIcon, ReportIcon, StorefrontIcon, ProductionOrderIcon, ContentIcon, 
    BusinessIcon, AccountingIcon, CatalogIcon, SettingsIcon,
    CashFundIcon, CreditCardIcon, MenuIcon, LinkIcon,
    BoxIcon, UserGroupIcon, ScissorsIcon, TruckIcon,
    ChartBarIcon, ChartPieIcon, PlusIcon
} from './icons/Icons';

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
    DashboardIcon,
    ReportIcon,
    StorefrontIcon,
    ProductionOrderIcon,
    ContentIcon,
    BusinessIcon,
    AccountingIcon,
    CatalogIcon,
    SettingsIcon,
    CashFundIcon,
    CreditCardIcon,
    MenuIcon,
    LinkIcon,
    BoxIcon,
    UserGroupIcon,
    ScissorsIcon,
    TruckIcon,
    ChartBarIcon,
    ChartPieIcon,
    PlusIcon,
};

const IconRenderer: React.FC<{ name?: IconName | null }> = ({ name }) => {
    if (!name) return null;
    const IconComponent = iconMap[name];
    return IconComponent ? <IconComponent /> : null;
};

export default IconRenderer;