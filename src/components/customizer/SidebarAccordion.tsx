import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface SidebarAccordionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
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
    <div 
      id={`accordion-${id}`}
      className={`border rounded-xl bg-white dark:bg-[#1C1C1E] transition-all duration-200 overflow-hidden ${
        isOpen 
          ? 'border-[#008060] shadow-md ring-1 ring-[#008060]/20' 
          : 'border-[#E1E3E5] hover:border-gray-300 dark:border-[#2C2C2E] dark:hover:border-gray-700 shadow-sm'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-panel-${id}`}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left font-sans font-semibold text-xs tracking-wide text-charcoal dark:text-warm-white transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-[#008060]/10 text-[#008060]' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            {icon}
          </div>
          <span className="font-sans font-semibold text-sm text-gray-800 dark:text-gray-200">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          <ChevronRight size={16} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-panel-${id}`}
            role="region"
            aria-labelledby={`accordion-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="p-4 border-t border-[#E1E3E5] dark:border-[#2C2C2E] bg-gray-50/50 dark:bg-black/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
