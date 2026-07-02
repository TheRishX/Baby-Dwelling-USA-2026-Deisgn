import { motion } from 'motion/react';
import { Star, Heart, ArrowUpRight } from 'lucide-react';
import { Product } from '../types';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onViewDetails: () => void;
  onAddToCart: (product: Product, color?: string) => void;
}

export default function ProductCard({ product, onViewDetails, onAddToCart }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  // Parse rating into stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={13}
        className={`${
          i < rating
            ? 'fill-terracotta text-terracotta dark:fill-sand dark:text-sand'
            : 'text-sand/35 dark:text-white/20'
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-warm-white dark:bg-charcoal/40 rounded-2xl border border-sand/15 dark:border-white/5 overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all duration-300 relative h-full"
    >
      {/* Favorite Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-warm-white/90 dark:bg-charcoal/90 flex items-center justify-center text-charcoal shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer border border-sand/20"
        title="Save to Wishlist"
      >
        <Heart
          size={16}
          className={`${isLiked ? 'fill-terracotta text-terracotta' : 'text-charcoal/60 dark:text-warm-white/60'}`}
        />
      </button>

      {/* Edge-to-Edge Image Container */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-light-beige/35 dark:bg-white/5 cursor-pointer"
        onClick={onViewDetails}
      >
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Dynamic Badge */}
        {product.badge && (
          <div className="absolute bottom-4 left-4 bg-charcoal/85 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-sans font-semibold text-warm-white tracking-widest uppercase border border-white/10">
            {product.badge}
          </div>
        )}
      </div>

      {/* Card Information */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div className="flex flex-col gap-2 cursor-pointer" onClick={onViewDetails}>
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex">{renderStars(product.rating)}</div>
            <span className="text-[11px] font-sans font-medium text-charcoal/50 dark:text-warm-white/50">
              ({product.reviewsCount})
            </span>
          </div>

          <h3 className="font-serif text-lg font-bold text-charcoal dark:text-warm-white group-hover:text-terracotta dark:group-hover:text-sand transition-colors duration-200">
            {product.title}
          </h3>

          <p className="font-sans text-xs text-charcoal/60 dark:text-warm-white/60 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Action Button & Price */}
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-sand/10 dark:border-white/5 pt-4">
          <div className="flex flex-col">
            <span className="text-xs font-sans font-medium text-charcoal/40 dark:text-warm-white/40 uppercase tracking-widest">
              Price
            </span>
            <span className="font-serif text-base font-bold text-charcoal dark:text-warm-white">
              £{product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product, product.colors ? product.colors[0] : undefined)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-charcoal text-warm-white hover:bg-charcoal/90 dark:bg-warm-white dark:text-charcoal dark:hover:bg-warm-white/90 font-sans text-xs font-semibold tracking-wider uppercase shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span>Add to Bag</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
