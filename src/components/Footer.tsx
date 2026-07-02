import { ActiveView } from '../types';

interface FooterProps {
  setActiveView: (view: ActiveView) => void;
  siteConfig?: any;
  currentPageSlug?: string;
  setCurrentPageSlug?: (slug: string) => void;
  onNavigateToShop?: (category: string) => void;
}

export default function Footer({ 
  setActiveView, 
  siteConfig = {}, 
  currentPageSlug = '', 
  setCurrentPageSlug, 
  onNavigateToShop 
}: FooterProps) {
  const handlePageClick = (slug: string) => {
    if (setCurrentPageSlug) {
      setCurrentPageSlug(slug);
    }
    setActiveView('page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId: string) => {
    if (onNavigateToShop) {
      onNavigateToShop(categoryId);
    } else {
      setActiveView('shop');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = siteConfig.categories || [
    { id: 'carriers', name: 'Baby Carriers' },
    { id: 'pouches', name: 'Wraps & Pouches' },
    { id: 'combos', name: 'Bundles & Combos' },
    { id: 'accessories', name: 'Support Accessories' }
  ];

  const pages = siteConfig.pages || [];

  return (
    <footer className="w-full bg-light-beige/50 border-t border-sand/20 mt-20 pt-16 pb-20 md:pb-12 transition-colors duration-300">
      <div className="px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo & Narrative */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl font-bold text-charcoal mb-4">Baby Dwelling</h3>
            <p className="font-sans text-sm text-charcoal/70 max-w-sm mb-6 leading-relaxed">
              Crafted for gentle luxury. We create ergonomic, aesthetically beautiful and certified baby carriers, wraps, and accessories for the modern parent.
            </p>
            <div className="flex gap-4">
              {['Instagram', 'Facebook', 'Pinterest'].map((network) => (
                <span
                  key={network}
                  className="w-10 h-10 rounded-full bg-sand/15 hover:bg-sand/30 flex items-center justify-center text-xs font-sans font-medium text-charcoal/80 cursor-pointer hover:text-charcoal transition-colors"
                >
                  {network.substring(0, 2).toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Shop links dynamically driven */}
          <div className="flex flex-col items-start gap-4 font-sans text-sm">
            <h4 className="font-sans font-bold text-xs text-charcoal uppercase tracking-widest mb-2">Shop Collection</h4>
            {categories.filter((cat: any) => cat.id !== 'all').map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="text-left text-charcoal/70 hover:text-terracotta transition-colors cursor-pointer"
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Support / custom pages links dynamically driven */}
          <div className="flex flex-col items-start gap-4 font-sans text-sm">
            <h4 className="font-sans font-bold text-xs text-charcoal uppercase tracking-widest mb-2">Parenthood Guides</h4>
            {pages.map((p: any) => (
              <button
                key={p.id}
                onClick={() => handlePageClick(p.slug)}
                className="text-left text-charcoal/70 hover:text-terracotta transition-colors cursor-pointer"
              >
                {p.title}
              </button>
            ))}
            
            {/* Fallbacks if list is empty */}
            {pages.length === 0 && (
              <>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert('Free delivery on orders over £50. Shipped via carbon-neutral UK carriers.'); }}
                  className="text-left text-charcoal/70 hover:text-terracotta transition-colors cursor-pointer"
                >
                  Returns & Shipping
                </a>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert('We are here for you! Contact us at support@babydwelling.co.uk.'); }}
                  className="text-left text-charcoal/70 hover:text-terracotta transition-colors cursor-pointer"
                >
                  Contact Us
                </a>
              </>
            )}
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="font-sans text-xs text-charcoal/50 border-t border-sand/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© 2026 Baby Dwelling. Crafted with love for Gentle Luxury.</span>
          <div className="flex gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-charcoal transition-colors">Privacy Policy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-charcoal transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
