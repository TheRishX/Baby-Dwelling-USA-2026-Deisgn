import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ShieldCheck, Heart, ArrowUpRight, Scale, Baby, Leaf, Compass, Scroll, ChevronDown, CheckCircle, ExternalLink } from 'lucide-react';
import { Product } from '../types';
import ErgonomicVisualizer from '../components/ErgonomicVisualizer';
import ReviewSection from '../components/ReviewSection';

interface ProductDetailViewProps {
  productId?: string;
  onAddToCart: (product: Product, color?: string) => void;
  siteConfig: any;
  onUpdateConfig?: (config: any) => void;
}

export default function ProductDetailView({ productId = 'signature-heritage', onAddToCart, siteConfig, onUpdateConfig }: ProductDetailViewProps) {
  const product = productId === 'signature-heritage'
    ? siteConfig.signatureProduct
    : (siteConfig.products?.find((p: any) => p.id === productId) || siteConfig.signatureProduct);

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'materials'>('specs');
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  // Gallery images list
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [
        product.image,
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCYgJvLuf0Zt1qB223y7Fe29M7UVopEQBrX5A61jrHnarvmG5pE7sIdh8WGCSDyZk7cwW_btP6uvLH2FOzTNaJKGOX6VcWm1FUI--gVXSylk0VtIt3pk40ap2fLbhdwA25hXgQVyp_3cqM2UGG1KurtF8rWTRGwLBt9Tvml6Yr6aJorH_Yi8iGu4jNA8RkiL_irDOsIwNyHrlpOhH93LObOdB24gLGzVZdsop8of4E9l2YBNMq1_Ocdaj7uww4ywAn7FSBEV-ZqXMI',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBWWBd9xbi8sJ5zXUsdnBU50R5cZsKdjtPfYS8XGrhpvAlmIfe_54yIAXb7Z1Lg2sLgJvhv4P38lIKKowcVNm6PB_mbbD8PW4V5mPO8GC9dZLW4QkTy3byFsWKrcDB1nRtSM88KtVaN7kY1bllFvNB-QpE7b4WhlH-iB_hVwPQZTMkr2pMcrNUaUZ2b8_Vvfw5tEtq4PYrh6gx65y1gkj_nZEafninbKvKgG2cimlRhCLhfj5Aos55aT37UpVCJ-cCuGVuCYzBZRSM',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAO7QnYkRNpbxSypcRESvTyvVK4rFPqh9BT3mC3WChvyHSPlYNY0lqGM9hw-G9WktZRmzqyViVoDKW_NDs7rripCZrfhMsUzaEbXYTgyiThPnW3oL-M5hCS3Inj5VCJNOYRjmDFOw2HAhQXmLUzql1TfhQVuL8qjKc467NBrfEqwrJ6SAXPWvvP6DT3pNSO6f5JInnzJTnjH6CW3e7hBzEhP08J8-wPRoIR4kkQZa_WhFFYs52ReUzoSPoFcuYWn3sneqwG-dRo8BE'
      ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reset active image index when the product changes
  useState(() => {
    setActiveImageIndex(0);
    setSelectedColorIndex(0);
  });

  const productColors = product.colors || ['#E5DCC5', '#9CA389', '#8B8682'];
  const productColorNames = product.colorNames || ['Oatmeal Linen', 'Muted Sage', 'Slate Grey'];
  const productSpecs = product.specs || {};

  const productWrapper: Product = {
    id: product.id,
    title: product.title,
    price: product.price,
    rating: product.rating || 5,
    reviewsCount: product.reviewsCount || 154,
    image: product.image,
    category: product.category || 'carriers',
    badge: product.badge,
    tagline: product.tagline,
    retailer: product.retailer || 'amazon',
    buyUrl: product.buyUrl || 'https://www.amazon.co.uk',
    colors: productColors,
    specs: productSpecs,
    description: product.description,
    images: galleryImages,
  };

  const handleLocalAddToCart = () => {
    onAddToCart(productWrapper, productColors[selectedColorIndex]);
  };

  return (
    <div className="flex flex-col gap-24 px-5 md:px-16 max-w-7xl mx-auto w-full">
      
      {/* 2-Column Split: Image Gallery & Buy Options */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Photo Frame Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-light-beige/35 border border-sand/20 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.img
                key={`${product.id}-${activeImageIndex}`}
                src={galleryImages[activeImageIndex] || product.image}
                alt="Main Product Gallery Frame"
                referrerPolicy="no-referrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            <div className="absolute top-6 left-6 bg-warm-white/90 dark:bg-charcoal/90 backdrop-blur-md px-4 py-2 rounded-full border border-sand/30 shadow-sm z-10">
              <span className="font-sans text-[10px] font-bold text-charcoal dark:text-warm-white tracking-widest uppercase">
                {product.badge || 'Signature Collection'}
              </span>
            </div>
          </div>

          {/* Thumbnail row below */}
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 bg-light-beige/35 transition-all cursor-pointer ${
                    activeImageIndex === i
                      ? 'border-terracotta dark:border-sand scale-102'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Gallery Thumb ${i + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product configuration details */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-32">
          
          {/* Header titles */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-terracotta text-terracotta dark:fill-sand dark:text-sand" />
                ))}
              </div>
              <span className="text-xs font-sans font-medium text-charcoal/50 dark:text-warm-white/50">
                ({product.reviewsCount || 12} Parent Reviews)
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal dark:text-warm-white tracking-tight">
              {product.title}
            </h1>
            <p className="font-sans text-sm text-charcoal/70 dark:text-warm-white/70 leading-relaxed mt-1">
              {product.tagline}
            </p>

            {product.description ? (
              <div 
                className="font-sans text-xs text-charcoal/70 dark:text-warm-white/70 leading-relaxed mt-4 border-t border-sand/15 pt-4 space-y-3"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="font-sans text-xs text-charcoal/60 dark:text-warm-white/60 leading-relaxed mt-3 border-t border-sand/15 pt-3">
                Crafted meticulously with your baby's comfort and developmental safety in mind. Our ergonomic build distributes weight evenly to protect your neck and lumbar spine, while organic, hypoallergenic textiles envelope your little one in gentle closeness.
              </p>
            )}
          </div>

          {/* Price blocks */}
          <div className="flex items-baseline gap-4 border-b border-sand/15 pb-6">
            <span className="font-serif text-2xl md:text-3xl font-bold text-charcoal dark:text-warm-white">
              £{product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="font-serif text-sm text-charcoal/40 dark:text-warm-white/40 line-through">
                  £{product.originalPrice.toFixed(2)}
                </span>
                <span className="text-[10px] font-sans font-bold text-terracotta dark:text-sand uppercase tracking-wider bg-terracotta/10 px-2 py-0.5 rounded-full">
                  Save £{(product.originalPrice - product.price).toFixed(0)}
                </span>
              </>
            )}
          </div>

          {/* Color Selection Buttons */}
          <div className="flex flex-col gap-3">
            <span className="font-sans text-xs font-bold text-charcoal dark:text-warm-white uppercase tracking-wider">
              Color Selection:{' '}
              <span className="text-charcoal/60 dark:text-warm-white/60 font-medium">
                {productColorNames[selectedColorIndex] || 'Selected Color'}
              </span>
            </span>
            <div className="flex gap-3.5">
              {productColors.map((col: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedColorIndex(index)}
                  className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all active:scale-90 cursor-pointer ${
                    selectedColorIndex === index
                      ? 'border-charcoal dark:border-warm-white scale-105'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: col }}
                  title={productColorNames[index] || `Color ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Trust Certifications Checklist */}
          <div className="flex items-center gap-6 py-2">
            <div className="flex items-center gap-2 text-xs font-sans font-medium text-charcoal/70 dark:text-warm-white/70">
              <ShieldCheck size={16} className="text-sage" />
              <span>Ergonomic IHDI Certified</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-sans font-medium text-charcoal/70 dark:text-warm-white/70">
              <CheckCircle size={16} className="text-sage" />
              <span>BSI UK Kitemark Standard</span>
            </div>
          </div>

          {/* Dynamic Order & Checkout Box */}
          <div className="flex flex-col gap-4 bg-light-beige/35 dark:bg-white/5 p-6 rounded-2xl border border-sand/20 dark:border-white/10 shadow-sm mt-2">
            <h3 className="font-sans text-[11px] font-bold text-charcoal dark:text-warm-white text-center uppercase tracking-widest">
              Secured Purchase Options
            </h3>
            
            {/* Main Action: Add directly to local basket */}
            <button
              onClick={handleLocalAddToCart}
              className="w-full py-4 bg-charcoal text-warm-white hover:opacity-95 dark:bg-warm-white dark:text-charcoal font-sans text-xs font-semibold tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>Add to Baby Dwelling Basket</span>
              <ArrowUpRight size={14} />
            </button>

            {/* Split Retailers */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <a
                href={product.buyUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#FF9900] hover:bg-[#E68A00] text-black font-sans text-[11px] font-bold uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
              >
                <span>Amazon UK</span>
                <ExternalLink size={11} />
              </a>
              <a
                href="https://www.walmart.com"
                target="_blank"
                rel="noreferrer"
                className="bg-[#0071CE] hover:bg-[#005FA3] text-white font-sans text-[11px] font-bold uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
              >
                <span>Walmart US</span>
                <ExternalLink size={11} />
              </a>
            </div>
            
            <p className="text-[10px] text-center text-charcoal/40 dark:text-warm-white/40 leading-normal">
              Carbon-neutral standard delivery. VAT and custom duties are pre-calculated.
            </p>
          </div>

          {/* Shipping guidelines accordion */}
          <div className="border-t border-sand/15 dark:border-white/5 mt-4">
            <details className="group py-4 border-b border-sand/15 dark:border-white/5 cursor-pointer">
              <summary className="flex justify-between items-center font-sans text-xs font-bold text-charcoal dark:text-warm-white uppercase tracking-wider list-none select-none">
                <span>Shipping & Returns Policy</span>
                <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
              </summary>
              <p className="font-sans text-xs text-charcoal/70 dark:text-warm-white/70 mt-3 leading-relaxed">
                Standard dispatch takes 1-2 working days. Shipped via carbon-neutral UK carriers with full live tracking. Returns are welcome on unused carriers within 30 days for a zero-hassle complete refund.
              </p>
            </details>
          </div>

        </div>
      </section>

      {/* Full 6D Architecture block matching mockup details */}
      <section className="w-full bg-light-beige/25 dark:bg-white/5 py-16 px-8 rounded-3xl border border-sand/20 dark:border-white/10 text-center">
        <div className="max-w-2xl mx-auto mb-12">
          <span className="font-sans text-xs font-bold text-terracotta dark:text-sand tracking-widest uppercase">
            Product Engineering
          </span>
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-charcoal dark:text-warm-white mt-1 mb-4 leading-tight">
            6D Orthopedic Architecture
          </h2>
          <p className="font-sans text-xs md:text-sm text-charcoal/60 dark:text-warm-white/60 leading-relaxed">
            Engineered with orthopedic feedback to achieve the ultimate balance of comfort, weight dispersal, and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-warm-white dark:bg-charcoal p-8 rounded-2xl border border-sand/15 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-light-beige/50 dark:bg-white/5 rounded-full flex items-center justify-center text-terracotta dark:text-sand">
              <Scale size={22} />
            </div>
            <h3 className="font-serif text-base font-bold text-charcoal dark:text-warm-white">Weight Distribution</h3>
            <p className="font-sans text-xs text-charcoal/60 dark:text-warm-white/60 leading-relaxed">
              Supports 7 to 45 lbs safely. Advanced cross-strap design eliminates pressure tension on neck and back.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-warm-white dark:bg-charcoal p-8 rounded-2xl border border-sand/15 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-light-beige/50 dark:bg-white/5 rounded-full flex items-center justify-center text-terracotta dark:text-sand">
              <Baby size={22} />
            </div>
            <h3 className="font-serif text-base font-bold text-charcoal dark:text-warm-white">Growth Adapting</h3>
            <p className="font-sans text-xs text-charcoal/60 dark:text-warm-white/60 leading-relaxed">
              From newborn to 36 months. Adjustable seat width and height grow seamlessly matching baby's natural milestones.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-warm-white dark:bg-charcoal p-8 rounded-2xl border border-sand/15 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-light-beige/50 dark:bg-white/5 rounded-full flex items-center justify-center text-terracotta dark:text-sand">
              <Leaf size={22} />
            </div>
            <h3 className="font-serif text-base font-bold text-charcoal dark:text-warm-white">Premium Textiles</h3>
            <p className="font-sans text-xs text-charcoal/60 dark:text-warm-white/60 leading-relaxed">
              Woven from a breathable, hypoallergenic organic linen and combed hemp blend. Softens beautifully with every wash.
            </p>
          </div>
        </div>
      </section>

      {/* Ergonomic M position slider section */}
      <section className="w-full">
        <ErgonomicVisualizer />
      </section>

      {/* Advanced Specifications Table block */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start border-t border-sand/15 pt-16">
        
        {/* Specs Table */}
        <div className="p-6 rounded-2xl bg-light-beige/15 dark:bg-white/5 border border-sand/15 dark:border-white/10 flex flex-col gap-6">
          <h3 className="font-serif text-lg font-bold text-charcoal dark:text-warm-white flex items-center gap-2">
            <Compass size={18} className="text-terracotta" /> Technical Specifications
          </h3>
          <dl className="flex flex-col gap-4 font-sans text-xs">
            {Object.keys(productSpecs).length > 0 ? (
              Object.entries(productSpecs).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-sand/10 pb-2">
                  <dt className="text-charcoal/50 dark:text-warm-white/50">{key}</dt>
                  <dd className="font-semibold text-charcoal dark:text-warm-white">{val as string}</dd>
                </div>
              ))
            ) : (
              <>
                <div className="flex justify-between border-b border-sand/10 pb-2">
                  <dt className="text-charcoal/50 dark:text-warm-white/50">Weight Limit</dt>
                  <dd className="font-semibold text-charcoal dark:text-warm-white">7 lbs - 45 lbs</dd>
                </div>
                <div className="flex justify-between border-b border-sand/10 pb-2">
                  <dt className="text-charcoal/50 dark:text-warm-white/50">Positions</dt>
                  <dd className="font-semibold text-charcoal dark:text-warm-white">Front, Back, Hip</dd>
                </div>
                <div className="flex justify-between border-b border-sand/10 pb-2">
                  <dt className="text-charcoal/50 dark:text-warm-white/50">Materials</dt>
                  <dd className="font-semibold text-charcoal dark:text-warm-white">Organic Cotton Blend</dd>
                </div>
              </>
            )}
          </dl>
        </div>

        {/* Materials Table */}
        <div className="p-6 rounded-2xl bg-light-beige/15 dark:bg-white/5 border border-sand/15 dark:border-white/10 flex flex-col gap-6">
          <h3 className="font-serif text-lg font-bold text-charcoal dark:text-warm-white flex items-center gap-2">
            <Scroll size={18} className="text-terracotta" /> Materials &amp; Care Details
          </h3>
          
          <div className="flex flex-col gap-5 text-xs text-charcoal/70 dark:text-warm-white/70">
            <div>
              <h4 className="font-sans font-bold text-charcoal dark:text-warm-white mb-1">Outer Shell Material</h4>
              <span>{productSpecs['Materials'] || 'Woven blend: 55% Organic Hemp, 45% Organic Cotton. Sourced and colored with OEKO-TEX certified non-toxic plant dyes.'}</span>
            </div>
            <div>
              <h4 className="font-sans font-bold text-charcoal dark:text-warm-white mb-1">Cushioning Support</h4>
              <span>High-grade, lightweight orthopedic polyurethane foam inside shoulder belts and waist straps to support all-day carrying.</span>
            </div>
            <div>
              <h4 className="font-sans font-bold text-charcoal dark:text-warm-white mb-1">Washing Guidelines</h4>
              <span>{productSpecs['Care'] || 'Machine washable cold on delicate cycles. Always air dry flat. Avoid bleaching agents, hot ironing, or tumbling. Wipe with soft wet sponge for minor spill spots.'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Review list */}
      <section className="w-full">
        <ReviewSection 
          reviews={siteConfig.reviews || []}
          onAddReview={(newReview) => {
            if (onUpdateConfig) {
              const updated = { ...siteConfig, reviews: [newReview, ...(siteConfig.reviews || [])] };
              onUpdateConfig(updated);
            }
          }}
        />
      </section>

    </div>
  );
}
