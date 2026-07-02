import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShieldCheck, ShoppingBag, Truck, ExternalLink } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  siteConfig?: any;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  siteConfig,
}: CartDrawerProps) {
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const shippingCost = subtotal >= 50 || subtotal === 0 ? 0.0 : 4.99;
  const total = subtotal + shippingCost;

  // Checkout redirect logic
  const handleCheckoutRedirect = (retailer: 'amazon' | 'walmart') => {
    // Look for first item of this retailer in the cart
    const matchingItem = cart.find((item) => item.product.retailer === retailer);
    const redirectUrl = matchingItem?.product.buyUrl || 
      (retailer === 'amazon' ? 'https://www.amazon.co.uk' : 'https://www.walmart.com');
    
    // Alert the user as they are redirected without payment data collection
    alert(`Secure Redirection: Redirecting you to ${retailer === 'amazon' ? 'Amazon' : 'Walmart'} to finalize your order. Thank you!`);
    window.location.href = redirectUrl;
  };

  const showAmazon = siteConfig?.enableAmazonCheckout !== false;
  const showWalmart = siteConfig?.enableWalmartCheckout !== false;
  const amazonText = siteConfig?.amazonCheckoutText || 'Checkout using Amazon';
  const walmartText = siteConfig?.walmartCheckoutText || 'Checkout using Wal-Mart';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal z-50 pointer-events-auto"
          />

          {/* Sliding Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-warm-white dark:bg-charcoal shadow-2xl z-50 flex flex-col justify-between overflow-hidden border-l border-sand/20 dark:border-white/10"
          >
            {/* Header */}
            <div className="p-6 border-b border-sand/15 dark:border-white/5 flex justify-between items-center bg-light-beige/35 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-terracotta dark:text-sand" />
                <h3 className="font-serif text-lg font-bold text-charcoal dark:text-warm-white">Your Basket</h3>
              </div>
              <button
                onClick={onClose}
                className="text-charcoal/60 dark:text-warm-white/60 hover:text-charcoal dark:hover:text-warm-white p-1 rounded-full cursor-pointer active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Content Section */}
            <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-5">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-sand/10 flex items-center justify-center text-sand/60">
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-charcoal dark:text-warm-white">Your bag is empty</h4>
                    <p className="font-sans text-xs text-charcoal/60 dark:text-warm-white/60 mt-1">
                      Explore our carriers and wraps to find your perfect fit.
                    </p>
                  </div>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    layout
                    key={item.product.id}
                    className="flex gap-4 p-4 rounded-xl bg-light-beige/25 dark:bg-white/5 border border-sand/10 dark:border-white/5 shadow-[0_4px_12px_rgb(0,0,0,0.01)]"
                  >
                    {/* Product Thumbnail */}
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-lg object-cover bg-sand/10"
                    />

                    {/* Info & Quantity Control */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-sm font-bold text-charcoal dark:text-warm-white leading-tight">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-charcoal/40 dark:text-warm-white/40 hover:text-terracotta transition-colors p-0.5 cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {item.selectedColor && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-sand/20"
                              style={{ backgroundColor: item.selectedColor }}
                            />
                            <span className="text-[10px] font-sans font-medium text-charcoal/50 dark:text-warm-white/50">
                              Oatmeal / Selection
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Counter */}
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1 rounded-lg border border-sand/25 dark:border-white/10 bg-warm-white dark:bg-charcoal/80 overflow-hidden px-1">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 text-charcoal/60 dark:text-warm-white/60 hover:text-charcoal dark:hover:text-warm-white disabled:opacity-30 cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="font-sans text-xs font-semibold px-2 min-w-5 text-center text-charcoal dark:text-warm-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-charcoal/60 dark:text-warm-white/60 hover:text-charcoal dark:hover:text-warm-white cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <span className="font-serif text-sm font-bold text-charcoal dark:text-warm-white">
                          £{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Static Summary + Checkout Action */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-sand/15 dark:border-white/5 bg-light-beige/25 dark:bg-white/5 flex flex-col gap-4">
                {/* Shipping Indicator */}
                <div className="flex items-center gap-2 text-xs font-sans text-charcoal/70 dark:text-warm-white/70 bg-sage/10 p-3 rounded-lg border border-sage/20">
                  <Truck size={14} className="text-sage" />
                  <span>
                    {subtotal >= 50
                      ? 'Congrats! Your order qualifies for free UK shipping.'
                      : `Add £${(50 - subtotal).toFixed(2)} more for free UK delivery.`}
                  </span>
                </div>

                {/* Pricing Rows */}
                <div className="flex flex-col gap-2 font-sans text-xs">
                  <div className="flex justify-between text-charcoal/60 dark:text-warm-white/60">
                    <span>Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-charcoal/60 dark:text-warm-white/60">
                    <span>Carbon-neutral Shipping</span>
                    <span>{shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-serif text-base font-bold text-charcoal dark:text-warm-white border-t border-sand/10 dark:border-white/5 pt-2 mt-1">
                    <span>Estimated Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Redirection Options */}
                <div className="flex flex-col gap-2.5 mt-2">
                  {showAmazon && (
                    <button
                      onClick={() => handleCheckoutRedirect('amazon')}
                      className="w-full py-3.5 rounded-xl bg-light-beige hover:bg-sand/35 text-charcoal border border-sand/30 font-sans text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-center cursor-pointer"
                    >
                      <span>{amazonText}</span>
                      <ExternalLink size={12} className="text-terracotta" />
                    </button>
                  )}

                  {showWalmart && (
                    <button
                      onClick={() => handleCheckoutRedirect('walmart')}
                      className="w-full py-3.5 rounded-xl bg-light-beige hover:bg-sand/35 text-charcoal border border-sand/30 font-sans text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-center cursor-pointer"
                    >
                      <span>{walmartText}</span>
                      <ExternalLink size={12} className="text-sage" />
                    </button>
                  )}

                  {!showAmazon && !showWalmart && (
                    <p className="text-center text-[11px] text-charcoal/50 py-2">
                      Online checkout is currently paused. Please visit again later.
                    </p>
                  )}
                </div>

                <div className="flex justify-center items-center gap-1 text-[10px] font-sans text-charcoal/40 dark:text-warm-white/40 mt-1">
                  <ShieldCheck size={12} className="text-sage" />
                  <span>256-Bit SSL Encrypted Retail Routing</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
