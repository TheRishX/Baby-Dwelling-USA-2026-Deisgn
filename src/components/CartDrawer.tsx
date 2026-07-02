import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, CreditCard, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { CartItem } from '../types';
import { useState } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [checkoutStep, setCheckoutStep] = useState<number | null>(null);
  const [shippingForm, setShippingForm] = useState({ name: '', email: '', address: '', city: '', postcode: '' });
  const [paymentForm, setPaymentForm] = useState({ cardNo: '', expiry: '', cvc: '' });

  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const shippingCost = subtotal >= 50 || subtotal === 0 ? 0.0 : 4.99;
  const total = subtotal + shippingCost;

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutStep(1);
  };

  const handleNextStep = () => {
    if (checkoutStep === 1) {
      if (!shippingForm.name || !shippingForm.email || !shippingForm.address || !shippingForm.postcode) {
        alert('Please fill out all shipping fields.');
        return;
      }
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      if (paymentForm.cardNo.length < 12 || !paymentForm.expiry || paymentForm.cvc.length < 3) {
        alert('Please fill out card details accurately.');
        return;
      }
      setCheckoutStep(3); // success
    }
  };

  const handlePlaceOrder = () => {
    onClearCart();
    setCheckoutStep(null);
    onClose();
    alert('Congratulations! Your baby carrier order has been placed securely. Standard carbon-neutral UK dispatch takes 1-2 days.');
  };

  return (
    <>
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

                  {/* Checkout CTA */}
                  <button
                    onClick={handleStartCheckout}
                    className="w-full py-3.5 rounded-xl bg-charcoal text-warm-white hover:opacity-95 dark:bg-warm-white dark:text-charcoal font-sans text-xs font-semibold tracking-wider uppercase shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <CreditCard size={15} />
                    <span>Secure Checkout</span>
                  </button>

                  <div className="flex justify-center items-center gap-1 text-[10px] font-sans text-charcoal/40 dark:text-warm-white/40">
                    <ShieldCheck size={12} className="text-sage" />
                    <span>256-Bit SSL Encrypted Retail Routing</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Dialog Modal */}
      <AnimatePresence>
        {checkoutStep !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutStep(null)}
              className="absolute inset-0 bg-charcoal"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-warm-white dark:bg-charcoal rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-sand/30 dark:border-white/10"
            >
              {/* Step indicator */}
              <div className="flex justify-between items-center border-b border-sand/10 pb-4 mb-4">
                <span className="font-serif text-base font-bold text-charcoal dark:text-warm-white">
                  {checkoutStep === 1 ? 'Step 1: Shipping Details' : checkoutStep === 2 ? 'Step 2: Secured Card' : 'Order Confirmed!'}
                </span>
                <button
                  onClick={() => setCheckoutStep(null)}
                  className="text-charcoal/40 dark:text-warm-white/40 hover:text-charcoal p-1 rounded-full cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Contact Fields */}
              {checkoutStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="font-sans font-semibold text-charcoal/60 dark:text-warm-white/60">Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={shippingForm.name}
                      onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                      className="p-2.5 rounded-lg border border-sand/30 bg-white/50 dark:bg-white/5 dark:border-white/10 text-charcoal dark:text-warm-white text-xs outline-none focus:border-terracotta"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="font-sans font-semibold text-charcoal/60 dark:text-warm-white/60">Email Address</label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                      className="p-2.5 rounded-lg border border-sand/30 bg-white/50 dark:bg-white/5 dark:border-white/10 text-charcoal dark:text-warm-white text-xs outline-none focus:border-terracotta"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="font-sans font-semibold text-charcoal/60 dark:text-warm-white/60">Street Address</label>
                    <input
                      type="text"
                      placeholder="42 High St"
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      className="p-2.5 rounded-lg border border-sand/30 bg-white/50 dark:bg-white/5 dark:border-white/10 text-charcoal dark:text-warm-white text-xs outline-none focus:border-terracotta"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-sans font-semibold text-charcoal/60 dark:text-warm-white/60">City</label>
                      <input
                        type="text"
                        placeholder="London"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        className="p-2.5 rounded-lg border border-sand/30 bg-white/50 dark:bg-white/5 dark:border-white/10 text-charcoal dark:text-warm-white text-xs outline-none focus:border-terracotta"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-sans font-semibold text-charcoal/60 dark:text-warm-white/60">Postcode</label>
                      <input
                        type="text"
                        placeholder="SW1A 1AA"
                        value={shippingForm.postcode}
                        onChange={(e) => setShippingForm({ ...shippingForm, postcode: e.target.value })}
                        className="p-2.5 rounded-lg border border-sand/30 bg-white/50 dark:bg-white/5 dark:border-white/10 text-charcoal dark:text-warm-white text-xs outline-none focus:border-terracotta"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full mt-4 py-3 bg-charcoal text-warm-white hover:opacity-95 dark:bg-warm-white dark:text-charcoal font-sans text-xs font-semibold tracking-wider uppercase rounded-xl transition-all"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* Payment Fields */}
              {checkoutStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="font-sans font-semibold text-charcoal/60 dark:text-warm-white/60">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4000 1234 5678 9010"
                      value={paymentForm.cardNo}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardNo: e.target.value })}
                      className="p-2.5 rounded-lg border border-sand/30 bg-white/50 dark:bg-white/5 dark:border-white/10 text-charcoal dark:text-warm-white text-xs outline-none focus:border-terracotta"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-sans font-semibold text-charcoal/60 dark:text-warm-white/60">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="12/28"
                        value={paymentForm.expiry}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })}
                        className="p-2.5 rounded-lg border border-sand/30 bg-white/50 dark:bg-white/5 dark:border-white/10 text-charcoal dark:text-warm-white text-xs outline-none focus:border-terracotta"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-sans font-semibold text-charcoal/60 dark:text-warm-white/60">CVC</label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="123"
                        value={paymentForm.cvc}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cvc: e.target.value })}
                        className="p-2.5 rounded-lg border border-sand/30 bg-white/50 dark:bg-white/5 dark:border-white/10 text-charcoal dark:text-warm-white text-xs outline-none focus:border-terracotta"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-light-beige/50 dark:bg-white/5 border border-sand/10 rounded-lg text-[10px] text-charcoal/50 dark:text-warm-white/50 flex flex-col gap-1">
                    <div className="flex justify-between font-semibold text-charcoal dark:text-warm-white text-xs">
                      <span>Total Secure Charge</span>
                      <span>£{total.toFixed(2)}</span>
                    </div>
                    <span>No actual money will be charged. This is a functional checkout demo.</span>
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full mt-2 py-3 bg-terracotta text-warm-white hover:bg-terracotta/90 font-sans text-xs font-semibold tracking-wider uppercase rounded-xl transition-all"
                  >
                    Confirm Secure Purchase
                  </button>
                </div>
              )}

              {/* Order Placed Success */}
              {checkoutStep === 3 && (
                <div className="flex flex-col items-center justify-center text-center gap-4 py-6">
                  <div className="w-16 h-16 rounded-full bg-sage/20 border-2 border-sage text-sage flex items-center justify-center animate-bounce">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-charcoal dark:text-warm-white">Thank you, {shippingForm.name}!</h3>
                    <p className="font-sans text-xs text-charcoal/70 dark:text-warm-white/70 mt-2 max-w-sm leading-relaxed">
                      Your order has been recorded successfully. A confirmation email with tracking has been sent to{' '}
                      <strong>{shippingForm.email}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full mt-4 py-3 bg-charcoal text-warm-white hover:opacity-95 dark:bg-warm-white dark:text-charcoal font-sans text-xs font-semibold tracking-wider uppercase rounded-xl transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
