import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, ArrowUpDown, HelpCircle } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

interface ShopViewProps {
  initialCategoryFilter?: string;
  onViewProduct: (productId: string) => void;
  onAddToCart: (product: Product, color?: string) => void;
  siteConfig: any;
}

export default function ShopView({ initialCategoryFilter = 'all', onViewProduct, onAddToCart, siteConfig }: ShopViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'reviews'>('default');

  // Sync with homepage navigation clicks
  useEffect(() => {
    if (initialCategoryFilter) {
      setActiveCategory(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);

  // Filter and sort items
  const getProcessedProducts = () => {
    let list = [...siteConfig.products];

    // Category Filter
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    // Sort Handler
    if (sortBy === 'priceAsc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'reviews') {
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return list;
  };

  const filteredProducts = getProcessedProducts();

  return (
    <div className="px-5 md:px-16 max-w-7xl mx-auto flex flex-col gap-12 w-full">
      {/* Editorial Title */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-sans text-xs font-bold text-terracotta dark:text-sand tracking-widest uppercase">
          Baby Dwelling Catalog
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-charcoal dark:text-warm-white mt-2 mb-4 leading-tight">
          Shop All Collections
        </h1>
        <p className="font-sans text-xs md:text-sm text-charcoal/60 dark:text-warm-white/60 leading-relaxed">
          Discover our full collection of gentle luxury for your little ones. Each piece is crafted with orthopedic intentionality and aesthetic harmony, perfect for the modern home.
        </p>
      </div>

      {/* Interactive Controls & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-5 border-y border-sand/15 dark:border-white/5 py-6">
        
        {/* Filter tags selection */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'carriers', label: 'Carriers' },
            { id: 'pouches', label: 'Pouches & Wraps' },
            { id: 'combos', label: 'Bundles & Combos' },
            { id: 'accessories', label: 'Accessories' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-sans font-semibold tracking-wider transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-charcoal text-warm-white dark:bg-warm-white dark:text-charcoal shadow-sm'
                  : 'bg-light-beige/35 text-charcoal/60 hover:text-charcoal border border-sand/15 hover:border-sand/45 dark:bg-white/5 dark:text-warm-white/60 dark:border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort & Quick Specs helper */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-charcoal/50 dark:text-warm-white/50" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-sans font-semibold text-charcoal/70 dark:text-warm-white/70 outline-none cursor-pointer border-none p-1 focus:ring-0"
            >
              <option value="default" className="dark:bg-charcoal">Featured Products</option>
              <option value="priceAsc" className="dark:bg-charcoal">Price: Low to High</option>
              <option value="priceDesc" className="dark:bg-charcoal">Price: High to Low</option>
              <option value="reviews" className="dark:bg-charcoal">Most Reviewed</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-sans text-charcoal/40 dark:text-warm-white/40">
            <SlidersHorizontal size={12} />
            <span>{filteredProducts.length} items found</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.length === 0 ? (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-24 text-center flex flex-col items-center justify-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-sand/10 flex items-center justify-center text-sand/60">
                <HelpCircle size={22} />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal dark:text-warm-white">No items found</h3>
              <p className="font-sans text-xs text-charcoal/60 dark:text-warm-white/60">
                We couldn't find any products in this specific category selection. Retry standard filters.
              </p>
            </motion.div>
          ) : (
            filteredProducts.map((prod) => (
              <motion.div
                layout
                key={prod.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <ProductCard
                  product={prod}
                  onViewDetails={() => onViewProduct(prod.id)}
                  onAddToCart={(p, col) => onAddToCart(p, col)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
