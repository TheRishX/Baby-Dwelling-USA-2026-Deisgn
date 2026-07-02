import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, Calendar, Share2, CheckCircle } from 'lucide-react';
import { CustomPage } from '../types';

interface CustomPageViewProps {
  pageSlug: string;
  siteConfig: any;
  onNavigateHome: () => void;
  onNavigateToShop: () => void;
}

export default function CustomPageView({ pageSlug, siteConfig, onNavigateHome, onNavigateToShop }: CustomPageViewProps) {
  const pages: CustomPage[] = siteConfig.pages || [];
  const page = pages.find((p) => p.slug === pageSlug);

  if (!page) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <h2 className="font-serif text-3xl font-bold text-charcoal mb-4">Page Not Found</h2>
        <p className="font-sans text-sm text-charcoal/60 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved by the store admin.
        </p>
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 bg-charcoal text-warm-white font-sans text-xs font-semibold tracking-wider uppercase px-6 py-3 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-warm-white min-h-[60vh] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-5 md:px-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-10 flex items-center justify-between border-b border-sand/20 pb-5">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 font-sans text-xs text-charcoal/50 hover:text-charcoal font-semibold tracking-wider uppercase transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Story
          </button>
          
          <div className="flex items-center gap-1.5 text-[10px] text-charcoal/40 font-mono">
            <Clock size={12} />
            <span>Published: {page.createdAt || 'July 1st, 2026'}</span>
          </div>
        </div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-left mb-10"
        >
          <div className="flex items-center gap-2 text-terracotta mb-2 font-sans text-xs font-bold uppercase tracking-widest">
            <BookOpen size={14} />
            <span>Store Information Page</span>
          </div>
          
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-charcoal leading-tight tracking-tight">
            {page.title}
          </h1>
          
          {/* Subtle separator */}
          <div className="w-20 h-[3px] bg-terracotta/80 rounded-full mt-6" />
        </motion.div>

        {/* Page Body Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="rich-page-body prose prose-stone text-charcoal/80 dark:text-warm-white/90 text-sm md:text-base leading-relaxed text-left"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />

        {/* Sourcing / Bottom trust cards */}
        <div className="mt-16 pt-12 border-t border-sand/20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-light-beige/35 border border-sand/15 p-6 rounded-2xl flex gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-sage/15 flex items-center justify-center text-sage flex-shrink-0">
              <CheckCircle size={18} />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-charcoal">Guaranteed Safe Touch</h4>
              <p className="font-sans text-xs text-charcoal/60 mt-1">Our products are non-toxic, hypoallergenic, and certified organic by national testing centers.</p>
            </div>
          </div>

          <div className="bg-light-beige/35 border border-sand/15 p-6 rounded-2xl flex gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-terracotta/15 flex items-center justify-center text-terracotta flex-shrink-0">
              <Share2 size={18} />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-charcoal">Need Sizing Support?</h4>
              <p className="font-sans text-xs text-charcoal/60 mt-1">We host weekly virtual carry check-ins. Reach out to join our community classes.</p>
            </div>
          </div>
        </div>

        {/* Bottom Call to Actions */}
        <div className="mt-12 text-center flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onNavigateToShop}
            className="bg-charcoal text-warm-white hover:opacity-95 font-sans text-xs font-semibold tracking-wider uppercase px-8 py-4 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Shop Dynamic Catalog
          </button>
          <button
            onClick={onNavigateHome}
            className="bg-transparent border border-charcoal/30 text-charcoal hover:bg-charcoal/5 font-sans text-xs font-semibold tracking-wider uppercase px-8 py-4 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            Read Our Story
          </button>
        </div>
      </div>

      <style>{`
        .rich-page-body h1, .rich-page-body h2, .rich-page-body h3 {
          font-family: serif;
          color: #1C1F1D;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .rich-page-body h1 { font-size: 1.85rem; }
        .rich-page-body h2 { font-size: 1.5rem; border-b: 1px solid rgba(194, 176, 149, 0.2); padding-bottom: 0.35rem; }
        .rich-page-body h3 { font-size: 1.2rem; }
        .rich-page-body p {
          margin-bottom: 1.1rem;
          line-height: 1.7;
        }
        .rich-page-body ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.1rem;
        }
        .rich-page-body ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.1rem;
        }
        .rich-page-body li {
          margin-bottom: 0.4rem;
        }
        .rich-page-body blockquote {
          border-left: 3px solid #6E7A63;
          padding-left: 1.25rem;
          color: #6B7280;
          font-style: italic;
          margin: 1.5rem 0;
          background-color: rgba(110, 122, 99, 0.05);
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .rich-page-body strong {
          color: #1C1F1D;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
