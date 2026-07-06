import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface SidebarTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChangeTab: (id: string) => void;
}

export default function SidebarTabs({ tabs, activeTab, onChangeTab }: SidebarTabsProps) {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4 overflow-x-auto shopify-customizer-scrollbar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`relative flex-1 py-2 px-3 text-center text-xs font-semibold tracking-wide transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer pb-2.5 ${
              isActive 
                ? 'text-[#008060] font-bold' 
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008060]"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
