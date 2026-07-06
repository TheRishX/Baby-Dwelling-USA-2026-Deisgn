import { ReactNode } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronRight } from 'lucide-react';

interface SidebarAccordionProps {
  id: string;
  title: string;
  isOpen?: boolean; // Maintained for fallback, but styled natively
  onToggle?: () => void;
  icon: ReactNode;
  children: ReactNode;
}

export default function SidebarAccordion({
  id,
  title,
  isOpen,
  onToggle,
  icon,
  children,
}: SidebarAccordionProps) {
  return (
    <Accordion.Item
      value={id}
      id={`accordion-${id}`}
      className="border rounded-xl bg-white dark:bg-[#1C1C1E] transition-all duration-200 overflow-hidden flex flex-col border-[#E1E3E5] dark:border-[#2C2C2E] hover:border-gray-300 dark:hover:border-gray-700 shadow-sm data-[state=open]:border-[#008060] data-[state=open]:shadow-md data-[state=open]:ring-1 data-[state=open]:ring-[#008060]/20"
    >
      <Accordion.Header className="flex flex-shrink-0">
        <Accordion.Trigger
          type="button"
          onClick={onToggle}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left font-sans font-semibold text-xs tracking-wide text-charcoal dark:text-warm-white transition-colors cursor-pointer select-none group"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg transition-colors bg-gray-100 dark:bg-gray-800 text-gray-500 group-data-[state=open]:bg-[#008060]/10 group-data-[state=open]:text-[#008060]">
              {icon}
            </div>
            <span className="font-sans font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</span>
          </div>
          <div
            className="text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-90"
          >
            <ChevronRight size={16} />
          </div>
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content
        id={`accordion-panel-${id}`}
        className="overflow-hidden border-t border-[#E1E3E5] dark:border-[#2C2C2E] bg-gray-50/50 dark:bg-black/10 data-[state=open]:animate-fadeIn"
      >
        <div className="p-4 overflow-y-auto max-h-[500px] md:max-h-[550px] shopify-customizer-scrollbar flex flex-col gap-4 text-left">
          {children}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

