import { useState, useEffect, FormEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, ActiveView } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './views/HomeView';
import ShopView from './views/ShopView';
import ProductDetailView from './views/ProductDetailView';
import CartDrawer from './components/CartDrawer';
import AdminView from './views/AdminView';
import CustomPageView from './views/CustomPageView';
import ShopifyCustomizer from './components/ShopifyCustomizer';
import { products as initialProducts, signatureProduct as initialSignatureProduct, reviewsData as initialReviews } from './data';
import { Settings, Palette } from 'lucide-react';
import SeoView from './views/SeoView';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let clientDb: any = null;
try {
  const app = initializeApp(firebaseConfig);
  clientDb = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
} catch (error) {
  console.warn("Failed to initialize Firebase on frontend client:", error);
}

const DEFAULT_CONFIG = {
  logoText: 'Baby Dwelling',
  logoImage: '',
  heroTagline: 'Baby Dwelling USA • Premium Certified Organic Babywearing',
  heroTitle: 'Breathe Easy.<br />Bond Deeply.',
  heroSubtitle: 'Welcome to Baby Dwelling USA. Experience premium ergonomic comfort with our pediatric-approved, certified hip-healthy baby carriers, ring slings, and wraps. Artfully woven from 100% natural organic fabrics.',
  heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjUGZLXpNyFq8eljDX0MSFwUqLu0nP9QxWQhGuXEjeKOCi36I__npWPkI5my2jneyHJpmFJ0TP6-eg7Qt0Gq7VMb-Cet5YDlJSGVe0Ysx42YRQjOVvrJqqq4niUBZsgAEOM7pDESTwufwBXAM_ukbWo78H5o4lJrMeS2fJSYN9xNCcU5L47rf2w7uydTUMyhi-RiaXM-UbM2bbECDLCP18_2r3D5rbhxJFEnDtKqOYoCJoUq1LohewJ-1TbT91-zK9s1VpWDxtzmo',
  
  badge1Title: 'Ergonomically Certified',
  badge1Text: 'Healthy hip & spine developmental support.',
  badge2Title: 'Pure Premium Materials',
  badge2Text: 'Breathable organic linen & combed hemp weaves.',
  badge3Title: 'Carbon Neutral Delivery',
  badge3Text: 'Free UK shipping on orders over £50.',
  
  heroCta1Text: 'Shop Collection',
  heroCta1Link: 'shop',
  heroCta2Text: 'Signature Heritage',
  heroCta2Link: 'detail',
  
  categories: [
    { id: 'all', name: 'All Products' },
    { id: 'carriers', name: 'Ergonomic Carriers' },
    { id: 'pouches', name: 'Ring Slings & Pouches' },
    { id: 'combos', name: 'Teething Combos' },
    { id: 'accessories', name: 'Natural Accessories' }
  ],
  
  navigation: [
    { label: 'Our Story', target: 'home' },
    { label: 'Shop All', target: 'shop' },
    { label: 'Signature Heritage', target: 'detail' },
    { label: 'Sizing Help', target: 'page:sizing-guide' }
  ],
  
  pages: [
    {
      id: 'about-us',
      title: 'Our Clean Sourcing Mission',
      slug: 'about-us',
      body: `<div class="space-y-6">
  <p>At <strong>Baby Dwelling USA</strong>, we believe that the closest bond in life is formed during those early, cozy hours of skin-to-skin touch. That is why our products are designed with 100% natural, certified organic, earth-grown fibers to protect your baby's gentle skin.</p>
  <h3>100% Organic &amp; Clean Raw Materials</h3>
  <p>Every ergonomic baby carrier, ring sling, and newborn pouch in our collection is exclusively sourced from certified organic fair-trade farms. By eliminating plastic materials, toxic chemicals, and synthetic dye-stuffs, we guarantee a pure, safe space for your little ones to rest, cuddle, and sleep.</p>
  <blockquote>"Baby Dwelling USA is dedicated to crafting premium, certified ergonomic baby carriers that provide a lifetime of intimacy, healthy skeletal growth, and ecological preservation."</blockquote>
</div>`,
      isPublished: true,
      createdAt: '2026-07-01'
    },
    {
      id: 'sizing-guide',
      title: 'Ergonomic Sizing & Carrying Guide',
      slug: 'sizing-guide',
      body: `<div class="space-y-4">
  <h3>Finding the Perfect Fit with Baby Dwelling USA</h3>
  <p>All <strong>Baby Dwelling USA</strong> ergonomic wraps, slings, and carriers are structurally engineered to adjust effortlessly to all parent body types and growing infants. With our fully expandable shoulder straps, snug waistbands, and certified sliders, mastering babywearing takes less than 30 seconds.</p>
  <h3>The Pediatric M-Position Rule</h3>
  <p>Our carriers keep your baby's hips correctly aligned in the pediatric-approved <strong>M-Position</strong>: with knees slightly higher than their bottom. This healthy ergonomic placement supports natural spinal curves and actively prevents infant hip dysplasia.</p>
</div>`,
      isPublished: true,
      createdAt: '2026-07-01'
    }
  ],
  
  products: initialProducts,
  signatureProduct: initialSignatureProduct,
  reviews: initialReviews,
  enableAmazonCheckout: true,
  amazonCheckoutText: 'Checkout using Amazon',
  enableWalmartCheckout: true,
  walmartCheckoutText: 'Checkout using Wal-Mart',
};

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPageSlug, setCurrentPageSlug] = useState<string>('about-us');
  const [selectedProductId, setSelectedProductId] = useState<string>('signature-heritage');

  // Secure admin passcode auth states
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [authError, setAuthError] = useState('');

  // Shopify visual customization mode states
  const [isCustomizingMode, setIsCustomizingMode] = useState(() => {
    return localStorage.getItem('bd_customizing_mode') === 'true';
  });
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Dynamic Site Customizer Config State
  const [siteConfig, setSiteConfig] = useState(() => {
    const saved = localStorage.getItem('bd_site_config_v1');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const isInitialMount = useRef(true);
  const previousConfigRef = useRef(JSON.stringify(siteConfig));

  // Admin Session Login State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('bd_admin_logged_in') === 'true';
  });

  const handleAdminAuthSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (passcodeAttempt.trim() === 'admin') {
      setIsAdminLoggedIn(true);
      setIsAdminAuthModalOpen(false);
      setPasscodeAttempt('');
      setAuthError('');
      triggerToast('🔓 Shopify Admin Authorized. Welcome to Visual Customizer!');
    } else {
      setAuthError('Invalid staff passcode. Please verify credentials.');
    }
  };

  // Sync customizing mode
  useEffect(() => {
    localStorage.setItem('bd_customizing_mode', String(isCustomizingMode));
  }, [isCustomizingMode]);

  // Fetch site configuration from Express server on mount and synchronize via real-time Firestore listener
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const fetchConfigFromServer = async () => {
      let loadedConfig = null;

      // 1. Try to fetch directly from Firestore client-side first (extremely fast and robust for Vercel)
      if (clientDb) {
        try {
          const { getDoc } = await import('firebase/firestore');
          const docRef = doc(clientDb, "siteConfigs", "baby_dwelling");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            loadedConfig = docSnap.data();
            console.log("⚡ Loaded initial config directly from Firestore on client mount!");
          }
        } catch (dbErr) {
          console.error("Error fetching initial config from Firestore client:", dbErr);
        }
      }

      // 2. Fallback to REST API if Firestore didn't succeed
      if (!loadedConfig) {
        try {
          const response = await fetch(`/api/site-config?t=${Date.now()}`, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.config) {
              loadedConfig = data.config;
            }
          }
        } catch (err) {
          console.warn('REST config fetch error (expected on serverless Vercel):', err);
        }
      }

      // 3. Set the state
      if (loadedConfig) {
        setSiteConfig(loadedConfig);
        localStorage.setItem('bd_site_config_v1', JSON.stringify(loadedConfig));
      } else {
        // No configuration fetched, use local storage or defaults
        const saved = localStorage.getItem('bd_site_config_v1');
        const initialConfig = saved ? JSON.parse(saved) : DEFAULT_CONFIG;
        setSiteConfig(initialConfig);
        saveConfigToBackend(initialConfig);
      }
    };

    // 1. Initial fresh fetch on mount with absolute cache-busting
    fetchConfigFromServer();

    // 2. Setup Real-time Firebase Firestore synchronization
    if (clientDb) {
      try {
        const docRef = doc(clientDb, "siteConfigs", "baby_dwelling");
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("⚡ Real-time update received from Firestore:", data);
            
            // Only auto-update siteConfig if the admin is NOT actively customizing on this specific device,
            // to avoid overwriting their active typing/selection.
            if (!isCustomizingMode && activeView !== 'admin') {
              setSiteConfig(data);
              localStorage.setItem('bd_site_config_v1', JSON.stringify(data));
            }
          }
        }, (error) => {
          console.error("Firestore listener error, falling back to polling:", error);
          // Fallback to active polling if listener fails
          const interval = setInterval(() => {
            if (!isCustomizingMode && activeView !== 'admin') {
              fetchConfigFromServer();
            }
          }, 3000);
          unsubscribe = () => clearInterval(interval);
        });
      } catch (err) {
        console.error("Error setting up Firestore listener:", err);
      }
    } else {
      // Fallback: active polling
      const interval = setInterval(() => {
        if (!isCustomizingMode && activeView !== 'admin') {
          fetchConfigFromServer();
        }
      }, 3000);
      unsubscribe = () => clearInterval(interval);
    }

    return () => {
      unsubscribe();
    };
  }, [isCustomizingMode, activeView]);

  const executeWithRetry = async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelayMs: number = 1000
  ): Promise<T> => {
    let attempt = 0;
    while (true) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error(`❌ Maximum retries (${maxRetries}) reached. Operation failed:`, error);
          throw error;
        }
        // Calculate exponential backoff delay with some random jitter (up to 200ms)
        const backoffDelay = initialDelayMs * Math.pow(2, attempt) + Math.random() * 200;
        console.warn(`⚠️ Firestore write failed (attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(backoffDelay)}ms...`, error);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  };

  const saveConfigToBackend = async (newConfig: any) => {
    setSyncState('saving');
    let success = false;
    try {
      // 1. Direct Firebase Firestore write on the client side (Instant live sync for Vercel & local development)
      if (clientDb) {
        const docRef = doc(clientDb, "siteConfigs", "baby_dwelling");
        await executeWithRetry(async () => {
          await setDoc(docRef, newConfig);
        }, 3, 1000);
        console.log("⚡ Saved successfully to Firestore directly from client!");
        success = true;
      }
    } catch (dbErr) {
      console.error('Error saving directly to Firestore from client:', dbErr);
    }

    try {
      // 2. Fallback REST API save for Node/container backup
      const res = await fetch('/api/site-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ config: newConfig }),
      });
      if (res.ok) {
        success = true;
      }
    } catch (err) {
      console.warn('REST save error (expected if running on serverless Vercel):', err);
    }

    if (success) {
      setSyncState('saved');
      setTimeout(() => setSyncState('idle'), 2500);
    } else {
      setSyncState('error');
      setTimeout(() => setSyncState('idle'), 3500);
    }
  };

  // Debounce saving config to backend when siteConfig changes (only in Customizing Mode or Admin Mode)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isCustomizingMode && activeView !== 'admin') {
      previousConfigRef.current = JSON.stringify(siteConfig);
      return;
    }

    const currentStr = JSON.stringify(siteConfig);
    if (currentStr === previousConfigRef.current) {
      return;
    }

    // Save to localStorage immediately so user's active progress is safe locally
    localStorage.setItem('bd_site_config_v1', currentStr);
    previousConfigRef.current = currentStr;

    // Set a debounce timer to save to backend in 800ms to avoid flooding backend/Firestore
    const timer = setTimeout(() => {
      console.log('Auto-saving updated customizer settings to live backend (debounced)...');
      saveConfigToBackend(siteConfig);
    }, 800);

    return () => clearTimeout(timer);
  }, [siteConfig, isCustomizingMode, activeView]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveConfig = () => {
    localStorage.setItem('bd_site_config_v1', JSON.stringify(siteConfig));
    saveConfigToBackend(siteConfig);
    triggerToast('✨ Settings saved successfully to live storefront!');
  };

  const handleBulkUpdateProducts = async (updatedProductsList: Product[]) => {
    setSyncState('saving');
    const updatedConfig = { ...siteConfig, products: updatedProductsList };
    setSiteConfig(updatedConfig);
    localStorage.setItem('bd_site_config_v1', JSON.stringify(updatedConfig));

    let success = false;
    try {
      // 1. Direct Firebase Firestore writeBatch operation (Instant live sync for Vercel & local development)
      if (clientDb) {
        const batch = writeBatch(clientDb);
        const docRef = doc(clientDb, "siteConfigs", "baby_dwelling");
        batch.set(docRef, updatedConfig);
        await batch.commit();
        console.log("⚡ Bulk products updated successfully via Firestore writeBatch!");
        success = true;
      }
    } catch (dbErr) {
      console.error('Error saving bulk products in batch:', dbErr);
    }

    try {
      // 2. Fallback REST API save for Node/container backup
      const res = await fetch('/api/site-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ config: updatedConfig }),
      });
      if (res.ok) {
        success = true;
      }
    } catch (err) {
      console.warn('REST save error (expected on serverless):', err);
    }

    if (success) {
      setSyncState('saved');
      setTimeout(() => setSyncState('idle'), 2500);
      triggerToast('✨ Bulk prices and availability updated successfully!');
    } else {
      setSyncState('error');
      setTimeout(() => setSyncState('idle'), 3500);
      triggerToast('❌ Error performing bulk update.');
    }
  };

  const handleResetConfig = () => {
    if (window.confirm('Are you sure you want to reset all site configuration to default values? Any unsaved edits will be lost.')) {
      setSiteConfig(DEFAULT_CONFIG);
      localStorage.setItem('bd_site_config_v1', JSON.stringify(DEFAULT_CONFIG));
      saveConfigToBackend(DEFAULT_CONFIG);
      triggerToast('🔄 Configuration reset to factory defaults.');
    }
  };

  // Sync Admin state
  useEffect(() => {
    localStorage.setItem('bd_admin_logged_in', String(isAdminLoggedIn));
    if (!isAdminLoggedIn) {
      setIsCustomizingMode(false);
    }
  }, [isAdminLoggedIn]);
  
  // Basket Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bd_cart_v1');
    return saved ? JSON.parse(saved) : [];
  });

  // Open triggers
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync Cart to storage
  useEffect(() => {
    localStorage.setItem('bd_cart_v1', JSON.stringify(cart));
  }, [cart]);

  // Ensure dark class is removed so it is always the light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, color?: string) => {
    setCart((prev) => {
      const matchIndex = prev.findIndex((item) => item.product.id === product.id);
      if (matchIndex > -1) {
        const copy = [...prev];
        copy[matchIndex].quantity += 1;
        return copy;
      } else {
        return [...prev, { product, quantity: 1, selectedColor: color }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleNavigateToShop = (category: string = 'all') => {
    setCategoryFilter(category);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDetail = (productId: string = 'signature-heritage') => {
    setSelectedProductId(productId);
    setActiveView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isCustomizingMode) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-[#E5E5E5] flex overflow-hidden font-sans z-[1000]">
        {/* Custom Toast Alert */}
        {toastMessage && (
          <div className="fixed top-5 right-5 bg-charcoal text-white px-5 py-3 rounded-2xl shadow-xl z-[9999] flex items-center gap-2 border border-sand/20 animate-fadeIn font-semibold text-xs">
            <span className="w-2 h-2 rounded-full bg-[#008060]"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Left Side: Shopify Sidebar Customizer Panel */}
        <div className="w-[380px] md:w-[400px] h-full flex-shrink-0 z-20 flex flex-col overflow-hidden">
          <ShopifyCustomizer
            siteConfig={siteConfig}
            onChangeConfig={setSiteConfig}
            onSave={handleSaveConfig}
            onReset={handleResetConfig}
            onClose={() => setIsCustomizingMode(false)}
            activePreviewView={activeView}
            onChangePreviewView={setActiveView}
            previewDevice={previewDevice}
            onChangePreviewDevice={setPreviewDevice}
            currentPageSlug={currentPageSlug}
            onChangePageSlug={setCurrentPageSlug}
            syncState={syncState}
          />
        </div>

        {/* Right Side: Storefront Preview Container */}
        <div className="flex-grow h-full bg-[#E1E3E5] flex flex-col items-center justify-center p-4 overflow-hidden relative">
          
          {/* Preview Topbar Bezel with dimensions indicator */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-sans font-bold text-gray-500/80">
            <span>PREVIEWING: {activeView.toUpperCase()} PAGE</span>
            <span className="font-mono uppercase bg-gray-200/60 px-2 py-0.5 rounded-full">
              {previewDevice === 'mobile' ? '390px x 740px (Mobile)' : previewDevice === 'tablet' ? '768px (Tablet)' : 'Full Responsive Desktop'}
            </span>
          </div>

          {/* Device Frame Viewport Container */}
          <div 
            className={`transition-all duration-300 ease-out bg-warm-white flex flex-col shadow-2xl overflow-hidden ${
              previewDevice === 'mobile' 
                ? 'w-[390px] h-[740px] rounded-[36px] border-[10px] border-charcoal/95 relative' 
                : previewDevice === 'tablet' 
                  ? 'w-[768px] h-[90%] rounded-3xl border-8 border-charcoal/90 relative' 
                  : 'w-full h-[95%] rounded-xl'
            }`}
          >
            {previewDevice === 'mobile' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-charcoal rounded-full z-50 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-charcoal/90 border border-gray-600"></span>
              </div>
            )}

            {/* Embedded Screen scrollable content */}
            <div className="flex-grow overflow-y-auto flex flex-col relative" id="storefront-preview-viewport">
              {/* Navbar inside preview */}
              <Navbar
                activeView={activeView}
                setActiveView={setActiveView}
                cart={cart}
                setIsCartOpen={setIsCartOpen}
                isAdminLoggedIn={isAdminLoggedIn}
                setIsAdminLoggedIn={setIsAdminLoggedIn}
                siteConfig={siteConfig}
                currentPageSlug={currentPageSlug}
                setCurrentPageSlug={setCurrentPageSlug}
                onNavigateToShop={handleNavigateToShop}
              />

              {/* Main Content inside preview */}
              <div className="flex-grow">
                <AnimatePresence mode="wait">
                  {activeView === 'home' && (
                    <motion.div
                      key="home"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <HomeView
                        onNavigateToShop={handleNavigateToShop}
                        onNavigateToDetail={handleNavigateToDetail}
                        siteConfig={siteConfig}
                        setCurrentPageSlug={setCurrentPageSlug}
                        setActiveView={setActiveView}
                        isCustomizing={true}
                      />
                    </motion.div>
                  )}

                  {activeView === 'shop' && (
                    <motion.div
                      key="shop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pt-12"
                    >
                      <ShopView
                        initialCategoryFilter={categoryFilter}
                        onViewProduct={handleNavigateToDetail}
                        onAddToCart={handleAddToCart}
                        siteConfig={siteConfig}
                      />
                    </motion.div>
                  )}

                  {activeView === 'detail' && (
                    <motion.div
                      key="detail"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pt-12"
                    >
                      <ProductDetailView
                        onAddToCart={handleAddToCart}
                        siteConfig={siteConfig}
                        onUpdateConfig={(updated) => {
                          setSiteConfig(updated);
                          localStorage.setItem('bd_site_config_v1', JSON.stringify(updated));
                        }}
                      />
                    </motion.div>
                  )}

                  {activeView === 'page' && (
                    <motion.div
                      key="page"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pt-12"
                    >
                      <CustomPageView
                        pageSlug={currentPageSlug}
                        siteConfig={siteConfig}
                        onNavigateHome={() => {
                          setActiveView('home');
                        }}
                        onNavigateToShop={() => handleNavigateToShop('all')}
                      />
                    </motion.div>
                  )}

                  {activeView === 'seo' && (
                    <motion.div
                      key="seo"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pt-12"
                    >
                      <SeoView
                        siteConfig={siteConfig}
                        onNavigateToView={(view) => setActiveView(view)}
                        setCurrentPageSlug={setCurrentPageSlug}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer inside preview */}
              <Footer
                setActiveView={setActiveView}
                siteConfig={siteConfig}
                currentPageSlug={currentPageSlug}
                setCurrentPageSlug={setCurrentPageSlug}
                onNavigateToShop={handleNavigateToShop}
              />
            </div>
          </div>
        </div>

        {/* Cart Drawer inside preview */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          siteConfig={siteConfig}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white text-charcoal flex flex-col font-sans relative">
      {/* Custom Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-charcoal text-white px-5 py-3 rounded-2xl shadow-xl z-[9999] flex items-center gap-2 border border-sand/20 animate-fadeIn font-semibold text-xs">
          <span className="w-2 h-2 rounded-full bg-[#008060]"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sleek Header & Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        isAdminLoggedIn={isAdminLoggedIn}
        setIsAdminLoggedIn={setIsAdminLoggedIn}
        siteConfig={siteConfig}
        currentPageSlug={currentPageSlug}
        setCurrentPageSlug={setCurrentPageSlug}
        onNavigateToShop={handleNavigateToShop}
      />

      {/* Main Views Container with fluid animations */}
      <main className="flex-grow pb-16">
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <HomeView
                onNavigateToShop={handleNavigateToShop}
                onNavigateToDetail={handleNavigateToDetail}
                siteConfig={siteConfig}
                setCurrentPageSlug={setCurrentPageSlug}
                setActiveView={setActiveView}
              />
            </motion.div>
          )}

          {activeView === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="pt-12"
            >
              <ShopView
                initialCategoryFilter={categoryFilter}
                onViewProduct={handleNavigateToDetail}
                onAddToCart={handleAddToCart}
                siteConfig={siteConfig}
              />
            </motion.div>
          )}

          {activeView === 'detail' && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="pt-12"
            >
              <ProductDetailView
                productId={selectedProductId}
                onAddToCart={handleAddToCart}
                siteConfig={siteConfig}
                onUpdateConfig={(updated) => {
                  setSiteConfig(updated);
                  localStorage.setItem('bd_site_config_v1', JSON.stringify(updated));
                }}
              />
            </motion.div>
          )}

          {activeView === 'page' && (
            <motion.div
              key="page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="pt-12"
            >
              <CustomPageView
                pageSlug={currentPageSlug}
                siteConfig={siteConfig}
                onNavigateHome={() => {
                  setActiveView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToShop={() => handleNavigateToShop('all')}
              />
            </motion.div>
          )}

          {activeView === 'seo' && (
            <motion.div
              key="seo"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="pt-12"
            >
              <SeoView
                siteConfig={siteConfig}
                onNavigateToView={(view) => {
                  setActiveView(view);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                setCurrentPageSlug={setCurrentPageSlug}
              />
            </motion.div>
          )}

          {activeView === 'admin' && (
            isAdminLoggedIn ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <AdminView
                  siteConfig={siteConfig}
                  setSiteConfig={setSiteConfig}
                  onNavigateHome={() => setActiveView('home')}
                  onNavigateToView={(view, subTarget) => {
                    setActiveView(view);
                    if (subTarget) setCurrentPageSlug(subTarget);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  setCurrentPageSlug={setCurrentPageSlug}
                  onLogout={() => {
                    setIsAdminLoggedIn(false);
                    setActiveView('home');
                    setIsCustomizingMode(false);
                    triggerToast('👋 Logged out from Shopify Admin successfully.');
                  }}
                  syncState={syncState}
                  onSave={handleSaveConfig}
                  onBulkUpdateProducts={handleBulkUpdateProducts}
                />
              </motion.div>
            ) : (
              <motion.div
                key="admin-login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="pt-24 pb-20 flex justify-center px-4"
              >
                <div className="w-full max-w-md bg-white dark:bg-charcoal p-8 rounded-3xl border border-sand/20 shadow-2xl flex flex-col gap-6">
                  <div className="text-center flex flex-col gap-2">
                    <span className="font-sans text-[10px] font-bold text-terracotta dark:text-sand tracking-widest uppercase">
                      Shopify Partner Node
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-charcoal dark:text-warm-white">
                      Staff Administration
                    </h2>
                    <p className="font-sans text-xs text-charcoal/50 dark:text-warm-white/50 leading-relaxed">
                      Enter staff credentials to manage listings, reviews, and storefront configuration parameters.
                    </p>
                  </div>

                  <form onSubmit={handleAdminAuthSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-sans font-bold text-charcoal/70 dark:text-warm-white/70 uppercase tracking-wider">
                        Staff Passcode
                      </label>
                      <input 
                        type="password"
                        value={passcodeAttempt}
                        onChange={(e) => {
                          setPasscodeAttempt(e.target.value);
                          setAuthError('');
                        }}
                        placeholder="••••••••"
                        className="w-full border border-sand/30 dark:border-white/10 rounded-xl px-4 py-3 text-xs bg-light-beige/25 dark:bg-white/5 outline-none font-sans text-charcoal dark:text-warm-white focus:border-[#008060] dark:focus:border-sand transition-all"
                        required
                        autoFocus
                      />
                      {authError && (
                        <span className="text-[10px] font-semibold text-terracotta mt-1 animate-pulse">
                          {authError}
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-charcoal text-warm-white hover:opacity-95 dark:bg-warm-white dark:text-charcoal font-sans text-xs font-semibold tracking-wider uppercase rounded-xl shadow-md transition-all active:scale-98 cursor-pointer mt-2"
                    >
                      Authenticate Admin Staff
                    </button>
                  </form>

                  <div className="bg-light-beige/30 dark:bg-white/5 p-4 rounded-2xl border border-sand/15 text-center">
                    <p className="text-[11px] font-sans text-charcoal/60 dark:text-warm-white/60 leading-normal">
                      🗝️ Demo Passcode: <span className="font-mono font-bold text-charcoal dark:text-warm-white bg-sand/30 px-1.5 py-0.5 rounded">admin</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      {/* Unified Footing Section - Hidden in Shopify admin view */}
      {activeView !== 'admin' && (
        <Footer
          setActiveView={setActiveView}
          siteConfig={siteConfig}
          currentPageSlug={currentPageSlug}
          setCurrentPageSlug={setCurrentPageSlug}
          onNavigateToShop={handleNavigateToShop}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        siteConfig={siteConfig}
      />

      {/* Shopify Customize Floating Launcher Bar */}
      {isAdminLoggedIn && (
        <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-2.5">
          <button
            onClick={() => setIsCustomizingMode(true)}
            className="bg-[#008060] hover:bg-[#006e52] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
          >
            <Settings size={14} className="animate-spin-slow" />
            <span>Open Shopify Visual Customizer</span>
          </button>
        </div>
      )}

      {/* Secure staff passcode modal overlay */}
      <AnimatePresence>
        {isAdminAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-white dark:bg-charcoal rounded-3xl border border-sand/20 p-8 shadow-2xl flex flex-col gap-6 animate-fadeIn"
            >
              <div className="text-center flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-terracotta dark:text-sand tracking-widest">Shopify Custodian Gate</span>
                <h3 className="font-serif text-xl font-bold text-charcoal dark:text-warm-white">Enter Passcode</h3>
                <p className="text-xs text-charcoal/50 dark:text-warm-white/50">Only authorized team members can edit layout elements.</p>
              </div>

              <form onSubmit={handleAdminAuthSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <input
                    type="password"
                    value={passcodeAttempt}
                    onChange={(e) => {
                      setPasscodeAttempt(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter Staff Passcode"
                    className="w-full px-4 py-3 text-xs border border-sand/30 dark:border-white/10 rounded-xl bg-light-beige/25 dark:bg-white/5 text-charcoal dark:text-warm-white outline-none focus:border-[#008060]"
                    required
                    autoFocus
                  />
                  {authError && (
                    <span className="text-[10px] font-semibold text-terracotta mt-1 animate-pulse">
                      {authError}
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminAuthModalOpen(false);
                      setPasscodeAttempt('');
                      setAuthError('');
                    }}
                    className="flex-1 py-3 border border-sand/30 rounded-xl text-xs font-semibold text-charcoal/70 dark:text-warm-white/70 hover:bg-light-beige/30 transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#008060] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#006e52] transition-all cursor-pointer"
                  >
                    Authorize
                  </button>
                </div>
              </form>

              <div className="text-center text-[10px] text-charcoal/40 dark:text-warm-white/40 border-t border-sand/15 pt-3">
                🗝️ Staff Demo Passcode: <span className="font-mono font-bold bg-sand/30 px-1 rounded text-charcoal dark:text-warm-white">admin</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
