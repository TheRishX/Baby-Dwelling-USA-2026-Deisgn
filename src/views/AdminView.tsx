import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Settings, 
  ShoppingBag, 
  MessageSquare, 
  Upload, 
  Trash2, 
  Edit3, 
  Plus, 
  Check, 
  RefreshCw, 
  ArrowLeft, 
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  Users,
  Percent,
  Star,
  ExternalLink,
  ChevronRight,
  Tag,
  BookOpen,
  Compass,
  Link,
  LogOut,
  Globe,
  Save
} from 'lucide-react';
import { Product, Review } from '../types';
import WysiwygEditor from '../components/WysiwygEditor';
import SeoView from './SeoView';
import { compressImage } from '../utils/image';

interface AdminViewProps {
  siteConfig: any;
  setSiteConfig: (config: any) => void;
  onNavigateHome: () => void;
  onLogout: () => void;
  onNavigateToView?: (view: any, subTarget?: string) => void;
  setCurrentPageSlug?: (slug: string) => void;
  syncState?: 'idle' | 'saving' | 'saved' | 'error';
  onSave?: () => void;
  onBulkUpdateProducts?: (products: Product[]) => Promise<void>;
}

export default function AdminView({ 
  siteConfig, 
  setSiteConfig, 
  onNavigateHome, 
  onLogout,
  onNavigateToView = () => {},
  setCurrentPageSlug = () => {},
  syncState = 'idle',
  onSave = () => {},
  onBulkUpdateProducts = async () => {},
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'homepage' | 'products' | 'categories' | 'pages' | 'navigation' | 'reviews' | 'seo'>('dashboard');
  const [productsSubTab, setProductsSubTab] = useState<'standard' | 'bulk'>('standard');
  const [bulkProducts, setBulkProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (siteConfig && siteConfig.products) {
      setBulkProducts(JSON.parse(JSON.stringify(siteConfig.products)));
    }
  }, [siteConfig.products, productsSubTab]);

  const handleBulkPriceChange = (id: string, newPrice: number) => {
    setBulkProducts(prev => prev.map(p => p.id === id ? { ...p, price: newPrice } : p));
  };

  const handleBulkStockToggle = (id: string) => {
    setBulkProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: p.inStock === false ? true : false } : p));
  };

  const handleDiscardBulkChanges = () => {
    if (siteConfig && siteConfig.products) {
      setBulkProducts(JSON.parse(JSON.stringify(siteConfig.products)));
    }
  };

  const [isSavedToastOpen, setIsSavedToastOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPendingState, setUploadPendingState] = useState<'idle' | 'compressing' | 'uploading' | 'saving' | 'completed' | 'error'>('idle');

  // Helper to validate image URLs before saving them to the site configuration
  const validateImageUrl = (url: string): boolean => {
    if (!url) return false;
    // Accept standard Base64 data URLs, local uploads path, or blob URLs
    if (url.startsWith('data:image/') || url.startsWith('/uploads/') || url.startsWith('blob:')) {
      return true;
    }
    // Check if it's a valid URL with http or https protocol
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  // Helper to get custom progress message for image uploading states
  const getUploadProgressText = (status: 'idle' | 'compressing' | 'uploading' | 'saving' | 'completed' | 'error', defaultText = 'Uploading...') => {
    switch (status) {
      case 'compressing': return 'Compressing image...';
      case 'uploading': return 'Uploading to server...';
      case 'saving': return 'Saving config...';
      case 'completed': return 'Uploaded! ✨';
      case 'error': return 'Upload failed ❌';
      default: return defaultText;
    }
  };

  // Upload references for Base64 image uploading
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'hero' | 'signature' | string>('hero'); // 'hero', 'signature', or product-id

  // Custom pages editing and creation states
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageBody, setNewPageBody] = useState('');

  // Temporary state for additions and edits
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    title: '',
    price: 99.00,
    originalPrice: 130.00,
    category: 'carriers',
    badge: 'NEW',
    tagline: '',
    description: '',
    images: [],
    retailer: 'amazon',
    buyUrl: 'https://www.amazon.co.uk',
    image: '',
    colors: ['#E5DCC5', '#9CA389', '#8B8682'],
    specs: {
      'Materials': 'Organic Cotton Blend',
      'Age limit': '0 - 36 Months',
      'Carry Positions': 'Front (Inward), Hip',
      'Care': 'Machine washable cold, line dry.'
    }
  });

  // Mock Shopify Analytics stats
  const analytics = {
    todaySales: '£1,240.00',
    salesGrowth: '+12.4%',
    visitors: '4,892',
    visitorsGrowth: '+8.3%',
    conversionRate: '3.1%',
    conversionGrowth: '+0.5%',
    avgOrderValue: '£134.50',
    ordersCount: '24'
  };

  const showSavedToast = () => {
    setIsSavedToastOpen(true);
    setTimeout(() => setIsSavedToastOpen(false), 3000);
  };

  // Generic content editor handler
  const handleConfigChange = (field: string, value: any) => {
    const updated = { ...siteConfig, [field]: value };
    setSiteConfig(updated);
    localStorage.setItem('bd_site_config_v1', JSON.stringify(updated));
    showSavedToast();
  };

  // Validates all configured image URLs before triggering the final onSave function
  const handleSaveWithValidation = () => {
    // 1. Validate Hero Image URL
    if (siteConfig.heroImage && !validateImageUrl(siteConfig.heroImage)) {
      alert('❌ Cannot save: Please enter a valid Hero Background Image URL (starting with http://, https://, or /uploads/).');
      return;
    }
    // 2. Validate Signature Product Image URL
    if (siteConfig.signatureProduct?.image && !validateImageUrl(siteConfig.signatureProduct.image)) {
      alert('❌ Cannot save: Please enter a valid Signature Product Image URL.');
      return;
    }
    // 3. Validate All Product Image URLs
    if (siteConfig.products && Array.isArray(siteConfig.products)) {
      for (const prod of siteConfig.products) {
        if (prod.image && !validateImageUrl(prod.image)) {
          alert(`❌ Cannot save: The image URL for product "${prod.title}" is invalid.`);
          return;
        }
      }
    }
    // 4. Validate Review / Testimonial Image URLs if they exist
    if (siteConfig.reviews && Array.isArray(siteConfig.reviews)) {
      for (const rev of siteConfig.reviews) {
        if (rev.image && !validateImageUrl(rev.image)) {
          alert(`❌ Cannot save: The image URL for reviewer "${rev.author}" is invalid.`);
          return;
        }
      }
    }

    // Call actual save function if all validations pass
    onSave();
  };

  // Reset helper
  const handleResetToDefaults = () => {
    localStorage.removeItem('bd_site_config_v1');
    window.location.reload();
  };

  // File drag & drop handlers for local image uploading
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setUploadPendingState('compressing');
    try {
      // 1. Compress client-side
      const base64 = await compressImage(file);
      let uploadUrl = base64;

      setUploadPendingState('uploading');
      try {
        // 2. Try online upload
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64,
            name: file.name
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.url) {
            uploadUrl = data.url;
            console.log("Uploaded successfully to online URL:", uploadUrl);
          }
        } else {
          throw new Error('API server rejected upload');
        }
      } catch (uploadErr) {
        console.warn("Online upload failed or was blocked, falling back to local compressed Base64:", uploadErr);
      }

      setUploadPendingState('saving');
      // 3. Save configuration
      if (uploadTarget === 'hero') {
        handleConfigChange('heroImage', uploadUrl);
      } else if (uploadTarget === 'signature') {
        const updatedSignature = { ...siteConfig.signatureProduct, image: uploadUrl };
        handleConfigChange('signatureProduct', updatedSignature);
      } else if (uploadTarget === 'new-product') {
        setNewProduct(prev => ({ ...prev, image: uploadUrl }));
      } else if (uploadTarget === 'editing-product') {
        setEditingProduct(prev => prev ? { ...prev, image: uploadUrl } : null);
      } else {
        // Product id
        const updatedProducts = siteConfig.products.map((p: Product) => 
          p.id === uploadTarget ? { ...p, image: uploadUrl } : p
        );
        handleConfigChange('products', updatedProducts);
      }
      setUploadPendingState('completed');
      setTimeout(() => setUploadPendingState('idle'), 3000);
    } catch (err) {
      console.error("Error compressing and uploading image in admin view:", err);
      setUploadPendingState('error');
      setTimeout(() => setUploadPendingState('idle'), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = (target: 'hero' | 'signature' | string) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  // Products manager handlers
  const handleSaveProductEdit = () => {
    if (!editingProduct) return;
    if (editingProduct.image && !validateImageUrl(editingProduct.image)) {
      alert('❌ Invalid Primary Product Image URL. Please enter a valid URL (starting with http://, https://, or /uploads/).');
      return;
    }
    const updatedProducts = siteConfig.products.map((p: Product) => 
      p.id === editingProduct.id ? editingProduct : p
    );
    handleConfigChange('products', updatedProducts);
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    if (!newProduct.title) {
      alert('Product title is required');
      return;
    }
    if (newProduct.image && !validateImageUrl(newProduct.image)) {
      alert('❌ Invalid Primary Product Image URL. Please enter a valid URL (starting with http://, https://, or /uploads/).');
      return;
    }
    const id = (newProduct.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created: Product = {
      id: id || `prod-${Date.now()}`,
      title: newProduct.title || 'Untitled Carrier',
      price: Number(newProduct.price) || 0,
      originalPrice: Number(newProduct.originalPrice) || undefined,
      rating: 5,
      reviewsCount: 1,
      image: newProduct.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWWBd9xbi8sJ5zXUsdnBU50R5cZsKdjtPfYS8XGrhpvAlmIfe_54yIAXb7Z1Lg2sLgJvhv4P38lIKKowcVNm6PB_mbbD8PW4V5mPO8GC9dZLW4QkTy3byFsWKrcDB1nRtSM88KtVaN7kY1bllFvNB-QpE7b4WhlH-iB_hVwPQZTMkr2pMcrNUaUZ2b8_Vvfw5tEtq4PYrh6gx65y1gkj_nZEafninbKvKgG2cimlRhCLhfj5Aos55aT37UpVCJ-cCuGVuCYzBZRSM',
      images: newProduct.images || [],
      category: (newProduct.category as any) || 'carriers',
      badge: newProduct.badge || undefined,
      tagline: newProduct.tagline || 'Crafted for luxurious skin-to-skin bonding comfort.',
      description: newProduct.description || '',
      retailer: (newProduct.retailer as any) || 'amazon',
      buyUrl: newProduct.buyUrl || 'https://www.amazon.co.uk',
      colors: newProduct.colors || ['#E5DCC5'],
      specs: newProduct.specs || { 'Materials': 'Organic Linen Blend' }
    };

    const updatedProducts = [...siteConfig.products, created];
    handleConfigChange('products', updatedProducts);
    setIsAddingProduct(false);
    setNewProduct({
      title: '',
      price: 99.00,
      originalPrice: 130.00,
      category: 'carriers',
      badge: 'NEW',
      tagline: '',
      description: '',
      images: [],
      retailer: 'amazon',
      buyUrl: 'https://www.amazon.co.uk',
      image: '',
      colors: ['#E5DCC5', '#9CA389', '#8B8682'],
      specs: {
        'Materials': 'Organic Cotton Blend',
        'Age limit': '0 - 36 Months',
        'Carry Positions': 'Front (Inward), Hip',
        'Care': 'Machine washable cold, line dry.'
      }
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to remove this product from your Shopify inventory?')) {
      const updatedProducts = siteConfig.products.filter((p: Product) => p.id !== productId);
      handleConfigChange('products', updatedProducts);
    }
  };

  // Review handlers
  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Delete this parent testimonial review?')) {
      const updatedReviews = siteConfig.reviews.filter((r: Review) => r.id !== reviewId);
      handleConfigChange('reviews', updatedReviews);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7] text-[#202223] font-sans flex flex-col">
      {/* Hidden file uploader */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Shopify Admin TopBar header */}
      <header className="bg-[#1A1C1D] text-white py-3.5 px-6 md:px-12 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors py-1 px-3 rounded bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft size={15} />
            <span>View Live Site</span>
          </button>
          <div className="h-4 w-px bg-white/20 hidden md:block" />
          <span className="font-semibold text-sm tracking-wide text-gray-200 hidden md:inline-block">
            Shopify Partner Admin Portal
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs bg-white/5 border border-white/10 font-semibold text-gray-300 px-2.5 py-1 rounded hidden sm:inline-block">
            Baby Dwelling Store
          </span>
          <button 
            onClick={handleSaveWithValidation}
            disabled={syncState === 'saving'}
            className={`text-xs font-bold text-white px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              syncState === 'saving' 
                ? 'bg-[#008060]/50 cursor-not-allowed animate-pulse' 
                : syncState === 'saved'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
                  : 'bg-[#008060] hover:bg-[#006e52] shadow-[#008060]/10 active:scale-95'
            }`}
          >
            <Save size={13} className={syncState === 'saving' ? 'animate-spin' : ''} />
            <span>
              {syncState === 'saving' 
                ? 'Saving...' 
                : syncState === 'saved' 
                  ? 'Saved Live!' 
                  : 'Save Changes'}
            </span>
          </button>
          <button 
            onClick={() => setResetModalOpen(true)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 py-1.5 px-2.5 bg-red-500/10 hover:bg-red-500/15 rounded cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Factory Reset</span>
          </button>
          <button 
            onClick={onLogout}
            className="text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 py-1 px-2.5 bg-white/10 hover:bg-white/15 rounded cursor-pointer"
          >
            <LogOut size={12} />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Panel Content split into Admin sidebar navigation & Editor body */}
      <div className="flex flex-col md:flex-row flex-grow max-w-7xl w-full mx-auto p-4 md:p-8 gap-6">
        
        {/* Shopify-like admin left rail sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-1 bg-white p-4 rounded-xl shadow-sm border border-[#E1E3E5] h-fit">
          <div className="pb-4 mb-2 border-b border-[#E1E3E5]">
            <h2 className="font-bold text-sm tracking-wide text-gray-500 uppercase px-2">Store Administration</h2>
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-[#EAF3EF] text-[#008060]' 
                : 'text-[#4C4E50] hover:bg-[#F6F6F7]'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Overview &amp; Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('homepage')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'homepage' 
                ? 'bg-[#EAF3EF] text-[#008060]' 
                : 'text-[#4C4E50] hover:bg-[#F6F6F7]'
            }`}
          >
            <Settings size={18} />
            <span>Modular Page Sections</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'products' 
                ? 'bg-[#EAF3EF] text-[#008060]' 
                : 'text-[#4C4E50] hover:bg-[#F6F6F7]'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Products Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'categories' 
                ? 'bg-[#EAF3EF] text-[#008060]' 
                : 'text-[#4C4E50] hover:bg-[#F6F6F7]'
            }`}
          >
            <Tag size={18} />
            <span>Category Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'pages' 
                ? 'bg-[#EAF3EF] text-[#008060]' 
                : 'text-[#4C4E50] hover:bg-[#F6F6F7]'
            }`}
          >
            <BookOpen size={18} />
            <span>Pages Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('navigation')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'navigation' 
                ? 'bg-[#EAF3EF] text-[#008060]' 
                : 'text-[#4C4E50] hover:bg-[#F6F6F7]'
            }`}
          >
            <Compass size={18} />
            <span>Navigation Menu Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'reviews' 
                ? 'bg-[#EAF3EF] text-[#008060]' 
                : 'text-[#4C4E50] hover:bg-[#F6F6F7]'
            }`}
          >
            <MessageSquare size={18} />
            <span>Parent Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-3 transition-all ${
              activeTab === 'seo' 
                ? 'bg-[#EAF3EF] text-[#008060]' 
                : 'text-[#4C4E50] hover:bg-[#F6F6F7]'
            }`}
          >
            <Globe size={18} />
            <span>Google SEO Hub</span>
          </button>
        </aside>

        {/* Dynamic Admin View Panel */}
        <section className="flex-grow flex flex-col gap-6">
          
          {activeTab !== 'dashboard' && (
            <div className="bg-white p-4 rounded-2xl border border-[#E1E3E5] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  syncState === 'saving' 
                    ? 'bg-amber-50 text-amber-600 animate-pulse' 
                    : syncState === 'saved' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-gray-50 text-gray-500'
                }`}>
                  <Save size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Visual Configuration Manager</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {syncState === 'saving' ? (
                      <span className="text-amber-600 font-medium">Syncing edits directly to Firestore live database...</span>
                    ) : syncState === 'saved' ? (
                      <span className="text-emerald-600 font-medium">✨ All edits are live and visible to visitors instantly!</span>
                    ) : (
                      <span>Modify any links, images, or texts below to update the storefront live.</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleSaveWithValidation}
                  disabled={syncState === 'saving'}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                    syncState === 'saving'
                      ? 'bg-amber-100 text-amber-700 cursor-not-allowed'
                      : 'bg-[#008060] hover:bg-[#006e52] text-white shadow-md'
                  }`}
                >
                  {syncState === 'saving' ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save and Publish Live</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* TAB 1: DASHBOARD & ANALYTICS */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              {/* Welcome message banner */}
              <div className="bg-white p-6 rounded-2xl border border-[#E1E3E5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold">Good morning, Therishx</h1>
                  <p className="text-xs text-gray-500 mt-1">Here is how Baby Dwelling is performing today, Wednesday, July 1st, 2026.</p>
                </div>
                <div className="flex gap-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 py-1.5 px-3 rounded-full font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Live Traffic Stream Connected</span>
                  </span>
                </div>
              </div>

              {/* Shopify Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E1E3E5] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Sales Today</span>
                    <DollarSign size={16} />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-serif text-2xl font-bold">{analytics.todaySales}</h3>
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp size={12} /> {analytics.salesGrowth} vs yesterday
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E1E3E5] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Visitors</span>
                    <Users size={16} />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-serif text-2xl font-bold">{analytics.visitors}</h3>
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp size={12} /> {analytics.visitorsGrowth} sessions
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E1E3E5] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Conversion Rate</span>
                    <Percent size={16} />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-serif text-2xl font-bold">{analytics.conversionRate}</h3>
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp size={12} /> {analytics.conversionGrowth} today
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E1E3E5] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Average Order</span>
                    <DollarSign size={16} />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-serif text-2xl font-bold">{analytics.avgOrderValue}</h3>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                      {analytics.ordersCount} orders placed
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Conversion Funnel chart mock */}
              <div className="bg-white p-6 rounded-2xl border border-[#E1E3E5] shadow-sm">
                <h3 className="font-serif text-base font-bold mb-4">Interactive Performance Chart</h3>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Active Sessions (4,892)</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                    <div className="h-full bg-[#008060]" style={{ width: '100%' }} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>Added to Basket (420)</span>
                    <span>8.6%</span>
                  </div>
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                    <div className="h-full bg-[#3f9e80]" style={{ width: '8.6%' }} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>Reached Checkout (94)</span>
                    <span>1.9%</span>
                  </div>
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                    <div className="h-full bg-[#6dbca0]" style={{ width: '1.9%' }} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>Completed Purchase (24)</span>
                    <span>0.5% (Store Target Met)</span>
                  </div>
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                    <div className="h-full bg-[#9bdbc1]" style={{ width: '0.5%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODULAR HOME & THEME EDITOR */}
          {activeTab === 'homepage' && (
            <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-[#E1E3E5] shadow-sm">
              <div className="border-b border-[#E1E3E5] pb-4">
                <h2 className="font-serif text-xl font-bold">Theme &amp; Modular Content Customizer</h2>
                <p className="text-xs text-gray-500 mt-1">Configure background images, tagline hooks, and key value badges of Baby Dwelling modularly.</p>
              </div>

              {/* SECTION: Hero customizer */}
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 border-l-2 border-[#008060] pl-2">Hero Section Config</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600">Hero Pre-Tagline</label>
                    <input 
                      type="text" 
                      value={siteConfig.heroTagline || ''} 
                      onChange={(e) => handleConfigChange('heroTagline', e.target.value)}
                      className="border border-[#C9CCCF] rounded-lg p-2.5 text-sm outline-none focus:border-[#008060] bg-white transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600">Hero Main Title (HTML safe, Use &lt;br /&gt; for linebreaks)</label>
                    <input 
                      type="text" 
                      value={siteConfig.heroTitle || ''} 
                      onChange={(e) => handleConfigChange('heroTitle', e.target.value)}
                      className="border border-[#C9CCCF] rounded-lg p-2.5 text-sm outline-none focus:border-[#008060] bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Hero Subtitle Paragraph</label>
                  <textarea 
                    rows={3}
                    value={siteConfig.heroSubtitle || ''} 
                    onChange={(e) => handleConfigChange('heroSubtitle', e.target.value)}
                    className="border border-[#C9CCCF] rounded-lg p-2.5 text-sm outline-none focus:border-[#008060] bg-white transition-colors resize-none"
                  />
                </div>

                {/* Hero background image manager */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Hero Background Image (URL or drag &amp; drop file upload)</label>
                  <div className="flex flex-col gap-3">
                    <input 
                      type="text" 
                      value={siteConfig.heroImage || ''} 
                      onChange={(e) => handleConfigChange('heroImage', e.target.value)}
                      placeholder="Enter Image URL directly"
                      className={`border rounded-lg p-2.5 text-sm outline-none bg-white transition-colors w-full ${
                        siteConfig.heroImage && !validateImageUrl(siteConfig.heroImage)
                          ? 'border-red-500 focus:border-red-500 text-red-700 bg-red-50/10'
                          : 'border-[#C9CCCF] focus:border-[#008060]'
                      }`}
                    />
                    {siteConfig.heroImage && !validateImageUrl(siteConfig.heroImage) && (
                      <p className="text-red-500 text-xs font-semibold">
                        ⚠️ Please enter a valid image URL starting with http://, https://, or /uploads/
                      </p>
                    )}

                    {/* Drag and drop panel for file upload */}
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors relative ${
                        dragActive 
                          ? 'border-[#008060] bg-[#EAF3EF]' 
                          : 'border-[#C9CCCF] hover:border-[#008060] bg-gray-50'
                      }`}
                      onClick={() => !isUploading && triggerFileInput('hero')}
                    >
                      {isUploading && uploadTarget === 'hero' && (
                        <div className="absolute inset-0 bg-white/80 rounded-xl flex flex-col items-center justify-center gap-2 z-10">
                          <span className="animate-spin rounded-full h-5 w-5 border-2 border-[#008060] border-t-transparent"></span>
                          <span className="text-xs font-bold text-gray-700">
                            {getUploadProgressText(uploadPendingState, "Processing & uploading image...")}
                          </span>
                        </div>
                      )}
                      {siteConfig.heroImage ? (
                        <div className="flex items-center gap-4 w-full justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src={siteConfig.heroImage} 
                              alt="Hero thumbnail" 
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200" 
                            />
                            <div className="text-left">
                              <p className="text-xs font-semibold text-gray-700">Custom Hero Image Loaded</p>
                              <p className="text-[10px] text-gray-400">Click panel to replace or upload a new background file</p>
                            </div>
                          </div>
                          <span className="text-xs text-[#008060] font-semibold flex items-center gap-1">
                            <Upload size={14} /> Uploaded File
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload className="text-gray-400" size={24} />
                          <p className="text-xs font-semibold text-gray-600">Drag &amp; drop background file, or <span className="text-[#008060] underline">browse local drive</span></p>
                          <p className="text-[10px] text-gray-400">File is processed locally as a fast offline Base64 URL</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hero CTA buttons customizer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                  <div className="p-4 border border-[#E1E3E5] rounded-xl flex flex-col gap-3 bg-gray-50/50">
                    <span className="text-xs font-bold text-[#008060] uppercase tracking-wider">Primary Button (CTA 1)</span>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500">Button Text</label>
                      <input 
                        type="text" 
                        value={siteConfig.heroCta1Text || 'Shop Collection'} 
                        onChange={(e) => handleConfigChange('heroCta1Text', e.target.value)}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500">Destination Link</label>
                      <select 
                        value={siteConfig.heroCta1Link || 'shop'} 
                        onChange={(e) => handleConfigChange('heroCta1Link', e.target.value)}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs bg-white font-sans text-gray-700 outline-none"
                      >
                        <option value="home">Home / Our Story</option>
                        <option value="shop">Shop All Products</option>
                        <option value="detail">Signature Heritage Product</option>
                        <optgroup label="Shop Categories">
                          {(siteConfig.categories || [
                            { id: 'carriers', name: 'Carriers' },
                            { id: 'pouches', name: 'Wraps & Pouches' },
                            { id: 'combos', name: 'Bundles & Combos' },
                            { id: 'accessories', name: 'Accessories' }
                          ]).filter((cat: any) => cat.id !== 'all').map((cat: any, idx: number) => (
                            <option key={`hero-cta1-cat-${cat.id || idx}-${idx}`} value={`shop:${cat.id}`}>Category: {cat.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Custom Pages">
                          {(siteConfig.pages || []).map((page: any, idx: number) => (
                            <option key={`hero-cta1-page-${page.id || idx}-${idx}`} value={`page:${page.slug}`}>Page: {page.title}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 border border-[#E1E3E5] rounded-xl flex flex-col gap-3 bg-gray-50/50">
                    <span className="text-xs font-bold text-[#008060] uppercase tracking-wider">Secondary Button (CTA 2)</span>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500">Button Text</label>
                      <input 
                        type="text" 
                        value={siteConfig.heroCta2Text || 'Signature Heritage'} 
                        onChange={(e) => handleConfigChange('heroCta2Text', e.target.value)}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500">Destination Link</label>
                      <select 
                        value={siteConfig.heroCta2Link || 'detail'} 
                        onChange={(e) => handleConfigChange('heroCta2Link', e.target.value)}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs bg-white font-sans text-gray-700 outline-none"
                      >
                        <option value="home">Home / Our Story</option>
                        <option value="shop">Shop All Products</option>
                        <option value="detail">Signature Heritage Product</option>
                        <optgroup label="Shop Categories">
                          {(siteConfig.categories || [
                            { id: 'carriers', name: 'Carriers' },
                            { id: 'pouches', name: 'Wraps & Pouches' },
                            { id: 'combos', name: 'Bundles & Combos' },
                            { id: 'accessories', name: 'Accessories' }
                          ]).filter((cat: any) => cat.id !== 'all').map((cat: any, idx: number) => (
                            <option key={`hero-cta2-cat-${cat.id || idx}-${idx}`} value={`shop:${cat.id}`}>Category: {cat.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Custom Pages">
                          {(siteConfig.pages || []).map((page: any, idx: number) => (
                            <option key={`hero-cta2-page-${page.id || idx}-${idx}`} value={`page:${page.slug}`}>Page: {page.title}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Trust value badges */}
              <div className="flex flex-col gap-4 border-t border-[#E1E3E5] pt-6 mt-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 border-l-2 border-[#008060] pl-2">Trust Value Statements &amp; Ribbons</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Badge 1 */}
                  <div className="p-4 border border-[#E1E3E5] rounded-xl flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-[#008060]">Badge 1 Statement</span>
                    <input 
                      type="text" 
                      value={siteConfig.badge1Title || ''} 
                      onChange={(e) => handleConfigChange('badge1Title', e.target.value)}
                      placeholder="Title"
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white"
                    />
                    <input 
                      type="text" 
                      value={siteConfig.badge1Text || ''} 
                      onChange={(e) => handleConfigChange('badge1Text', e.target.value)}
                      placeholder="Description Text"
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white"
                    />
                  </div>

                  {/* Badge 2 */}
                  <div className="p-4 border border-[#E1E3E5] rounded-xl flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-[#008060]">Badge 2 Statement</span>
                    <input 
                      type="text" 
                      value={siteConfig.badge2Title || ''} 
                      onChange={(e) => handleConfigChange('badge2Title', e.target.value)}
                      placeholder="Title"
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white"
                    />
                    <input 
                      type="text" 
                      value={siteConfig.badge2Text || ''} 
                      onChange={(e) => handleConfigChange('badge2Text', e.target.value)}
                      placeholder="Description Text"
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white"
                    />
                  </div>

                  {/* Badge 3 */}
                  <div className="p-4 border border-[#E1E3E5] rounded-xl flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-[#008060]">Badge 3 Statement</span>
                    <input 
                      type="text" 
                      value={siteConfig.badge3Title || ''} 
                      onChange={(e) => handleConfigChange('badge3Title', e.target.value)}
                      placeholder="Title"
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white"
                    />
                    <input 
                      type="text" 
                      value={siteConfig.badge3Text || ''} 
                      onChange={(e) => handleConfigChange('badge3Text', e.target.value)}
                      placeholder="Description Text"
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Signature Product editor */}
              <div className="flex flex-col gap-4 border-t border-[#E1E3E5] pt-6 mt-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 border-l-2 border-[#008060] pl-2">Signature Product Override</h3>
                <div className="p-4 bg-gray-50 rounded-xl border border-[#E1E3E5] flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <img 
                      src={siteConfig.signatureProduct.image} 
                      alt="Signature Product" 
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 object-cover rounded-lg border bg-white" 
                    />
                    <div className="flex-grow">
                      <h4 className="font-serif font-bold text-sm">{siteConfig.signatureProduct.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{siteConfig.signatureProduct.tagline}</p>
                      <span className="text-xs font-bold text-terracotta mt-1 inline-block">£{siteConfig.signatureProduct.price.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={() => !isUploading && triggerFileInput('signature')}
                      disabled={isUploading && uploadTarget === 'signature'}
                      className="text-xs bg-white border border-[#C9CCCF] hover:bg-gray-100 py-1.5 px-3 rounded flex items-center gap-1 disabled:opacity-50"
                    >
                      {isUploading && uploadTarget === 'signature' ? (
                        <>
                          <span className="animate-spin rounded-full h-3 w-3 border-2 border-[#008060] border-t-transparent"></span>
                          <span>{getUploadProgressText(uploadPendingState, 'Uploading...')}</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={12} /> Replace Image
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-600">Override Title</label>
                      <input 
                        type="text" 
                        value={siteConfig.signatureProduct.title} 
                        onChange={(e) => {
                          const updated = { ...siteConfig.signatureProduct, title: e.target.value };
                          handleConfigChange('signatureProduct', updated);
                        }}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-600">Override Price (£)</label>
                      <input 
                        type="number" 
                        value={siteConfig.signatureProduct.price} 
                        onChange={(e) => {
                          const updated = { ...siteConfig.signatureProduct, price: Number(e.target.value) };
                          handleConfigChange('signatureProduct', updated);
                        }}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Checkout Redirection Options Card */}
                <div className="bg-white p-6 rounded-2xl border border-[#E1E3E5] shadow-sm mt-6">
                  <div className="flex items-center gap-2 mb-4 border-b border-[#E1E3E5] pb-3">
                    <span className="p-1.5 rounded-lg bg-[#008060]/10 text-[#008060]">
                      <Settings size={18} />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Cart Checkout Redirection</h3>
                      <p className="text-xs text-gray-500">Configure fast-checkout routing to Amazon and Wal-Mart without payment details collection.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Amazon Option Card */}
                    <div className="border border-[#E1E3E5] rounded-xl p-4 bg-gray-50/50 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">Amazon Checkout Button</span>
                          <span className="text-xs text-gray-500">Show redirection button for Amazon inside cart drawer</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={siteConfig.enableAmazonCheckout !== false}
                            onChange={(e) => handleConfigChange('enableAmazonCheckout', e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008060]"></div>
                        </label>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Amazon Button Text</label>
                        <input 
                          type="text" 
                          value={siteConfig.amazonCheckoutText ?? 'Checkout using Amazon'}
                          onChange={(e) => handleConfigChange('amazonCheckoutText', e.target.value)}
                          disabled={siteConfig.enableAmazonCheckout === false}
                          className="border border-[#C9CCCF] rounded-lg p-2.5 text-xs outline-none focus:border-[#008060] bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Walmart Option Card */}
                    <div className="border border-[#E1E3E5] rounded-xl p-4 bg-gray-50/50 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">Walmart Checkout Button</span>
                          <span className="text-xs text-gray-500">Show redirection button for Walmart inside cart drawer</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={siteConfig.enableWalmartCheckout !== false}
                            onChange={(e) => handleConfigChange('enableWalmartCheckout', e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008060]"></div>
                        </label>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600">Walmart Button Text</label>
                        <input 
                          type="text" 
                          value={siteConfig.walmartCheckoutText ?? 'Checkout using Wal-Mart'}
                          onChange={(e) => handleConfigChange('walmartCheckoutText', e.target.value)}
                          disabled={siteConfig.enableWalmartCheckout === false}
                          className="border border-[#C9CCCF] rounded-lg p-2.5 text-xs outline-none focus:border-[#008060] bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS INVENTORY */}
          {activeTab === 'products' && (
            <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-[#E1E3E5] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E1E3E5] pb-4 gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold">Products Inventory Database</h2>
                  <p className="text-xs text-gray-500 mt-1">Total items in active Shopify listings: {siteConfig.products.length} products</p>
                </div>
                {productsSubTab === 'standard' && (
                  <button
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-[#008060] text-white hover:bg-[#006e52] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer w-fit"
                  >
                    <Plus size={15} /> Add Product
                  </button>
                )}
              </div>

              {/* Product Mode Switcher */}
              <div className="flex border-b border-gray-200 gap-1 pb-px">
                <button
                  onClick={() => setProductsSubTab('standard')}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    productsSubTab === 'standard' 
                      ? 'border-[#008060] text-[#008060]' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Standard Catalog List
                </button>
                <button
                  onClick={() => setProductsSubTab('bulk')}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    productsSubTab === 'bulk' 
                      ? 'border-[#008060] text-[#008060]' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Settings size={13} />
                  <span>Bulk Price &amp; Stock Editor (Batch Write)</span>
                </button>
              </div>

              {productsSubTab === 'standard' && (
                <>
                  {/* Add Product Modal Drawer */}
                  {isAddingProduct && (
                <div className="bg-[#F8F9FA] border-2 border-[#008060]/35 p-6 rounded-2xl flex flex-col gap-4 relative animate-fadeIn shadow-inner">
                  <div className="flex justify-between items-center border-b border-[#008060]/10 pb-3">
                    <h3 className="font-serif font-bold text-sm text-[#008060] flex items-center gap-1.5">
                      <Plus size={16} /> Create New Catalog Entry
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Draft Mode</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-600">Product Title *</label>
                      <input 
                        type="text" 
                        value={newProduct.title || ''} 
                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-[#008060]"
                        placeholder="e.g. Linen Sling Carrier"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Active Price (£) *</label>
                      <input 
                        type="number" 
                        value={newProduct.price || 0} 
                        onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-[#008060]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Compare-At / Original Price (£)</label>
                      <input 
                        type="number" 
                        value={newProduct.originalPrice || 0} 
                        onChange={(e) => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-[#008060]"
                        placeholder="MSRP eg 150"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Category *</label>
                      <select 
                        value={newProduct.category || 'carriers'} 
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                        className="border border-[#C9CCCF] bg-white rounded-lg p-2 text-xs outline-none focus:border-[#008060]"
                      >
                        {(siteConfig.categories || [
                          { id: 'carriers', name: 'Carriers' },
                          { id: 'pouches', name: 'Pouches & Wraps' },
                          { id: 'combos', name: 'Bundles & Combos' },
                          { id: 'accessories', name: 'Accessories' }
                        ]).filter((cat: any) => cat.id !== 'all').map((cat: any, idx: number) => (
                          <option key={`new-prod-cat-${cat.id || idx}-${idx}`} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Product Promo Badge (Optional)</label>
                      <input 
                        type="text" 
                        value={newProduct.badge || ''} 
                        onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-[#008060]"
                        placeholder="e.g. BESTSELLER, NEW, SALE"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Buy Now URL (Shopify / Amazon link)</label>
                      <input 
                        type="text" 
                        value={newProduct.buyUrl || ''} 
                        onChange={(e) => setNewProduct({ ...newProduct, buyUrl: e.target.value })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-[#008060]"
                        placeholder="Buy button link..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Primary Product Image *</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newProduct.image || ''} 
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                          className={`border rounded-lg p-2 text-xs outline-none bg-white flex-1 ${
                            newProduct.image && !validateImageUrl(newProduct.image)
                              ? 'border-red-500 focus:border-red-500 text-red-700 bg-red-50/10'
                              : 'border-[#C9CCCF] focus:border-[#008060]'
                          }`}
                          placeholder="Paste image URL or click upload..."
                        />
                        <button
                          type="button"
                          onClick={() => !isUploading && triggerFileInput('new-product')}
                          disabled={isUploading}
                          className="px-3 py-2 bg-white border border-[#C9CCCF] hover:bg-gray-50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {isUploading && uploadTarget === 'new-product' ? (
                            <>
                              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#008060] border-t-transparent"></span>
                              <span>{getUploadProgressText(uploadPendingState, 'Uploading...')}</span>
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              <span>Upload Image</span>
                            </>
                          )}
                        </button>
                      </div>
                      {newProduct.image && !validateImageUrl(newProduct.image) && (
                        <p className="text-red-500 text-[10px] font-semibold mt-1">
                          ⚠️ Invalid URL. Must start with http://, https://, or /uploads/
                        </p>
                      )}
                      {newProduct.image && (
                        <div className="mt-2 relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
                          <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setNewProduct({ ...newProduct, image: '' })}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Additional Gallery Images (Comma-separated URLs)</label>
                      <input 
                        type="text" 
                        value={newProduct.images?.join(', ') || ''} 
                        onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-[#008060]"
                        placeholder="url1, url2, url3 (up to 4)"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-600">Brief Tagline (Shows on cards)</label>
                    <input 
                      type="text" 
                      value={newProduct.tagline || ''} 
                      onChange={(e) => setNewProduct({ ...newProduct, tagline: e.target.value })}
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-[#008060]"
                      placeholder="Single sentence summarizing core comfort..."
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-600">Full Product Description (HTML paragraph tags supported)</label>
                    <textarea 
                      value={newProduct.description || ''} 
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-[#008060] h-20 font-mono"
                      placeholder="e.g. <p>Our Linen sling is woven from 100% Belgian flax...</p><p>Featuring custom safety rails...</p>"
                    />
                  </div>

                  {/* Specifications sub-panel */}
                  <div className="bg-gray-100/60 p-4 rounded-xl border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-700 mb-2">Technical Specifications Sheet</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-gray-500">Materials Blend</label>
                        <input 
                          type="text" 
                          value={newProduct.specs?.['Materials'] || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, specs: { ...newProduct.specs, 'Materials': e.target.value } })}
                          className="border border-gray-300 rounded p-1.5 text-[11px] bg-white"
                          placeholder="e.g. 100% French Linen"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-gray-500">Carry Positions</label>
                        <input 
                          type="text" 
                          value={newProduct.specs?.['Carry Positions'] || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, specs: { ...newProduct.specs, 'Carry Positions': e.target.value } })}
                          className="border border-gray-300 rounded p-1.5 text-[11px] bg-white"
                          placeholder="e.g. Front inward, back, hip"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-gray-500">Age / Weight Limit</label>
                        <input 
                          type="text" 
                          value={newProduct.specs?.['Age limit'] || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, specs: { ...newProduct.specs, 'Age limit': e.target.value } })}
                          className="border border-gray-300 rounded p-1.5 text-[11px] bg-white"
                          placeholder="e.g. Newborn to Toddler"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-gray-500">Care Instructions</label>
                        <input 
                          type="text" 
                          value={newProduct.specs?.['Care'] || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, specs: { ...newProduct.specs, 'Care': e.target.value } })}
                          className="border border-gray-300 rounded p-1.5 text-[11px] bg-white"
                          placeholder="e.g. Machine wash cold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 justify-end mt-2">
                    <button 
                      onClick={() => setIsAddingProduct(false)}
                      className="border border-[#C9CCCF] bg-white text-gray-600 px-3.5 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddProduct}
                      className="bg-[#008060] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-[#006e52]"
                    >
                      Add to Inventory
                    </button>
                  </div>
                </div>
              )}

              {/* Editing Product Modal */}
              {editingProduct && (
                <div className="bg-[#FFFEE5] border-2 border-amber-400/45 p-6 rounded-2xl flex flex-col gap-4 relative animate-fadeIn shadow-md">
                  <div className="flex justify-between items-center border-b border-amber-400/25 pb-3">
                    <h3 className="font-serif font-bold text-sm text-amber-800 flex items-center gap-1.5">
                      <Edit3 size={16} /> Editing: {editingProduct.title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Active SKU</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-600">Product Title *</label>
                      <input 
                        type="text" 
                        value={editingProduct.title || ''} 
                        onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-amber-400"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Active Price (£) *</label>
                      <input 
                        type="number" 
                        value={editingProduct.price || 0} 
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-amber-400"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Compare-At Price (£)</label>
                      <input 
                        type="number" 
                        value={editingProduct.originalPrice || 0} 
                        onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Category *</label>
                      <select 
                        value={editingProduct.category || 'carriers'} 
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                        className="border border-[#C9CCCF] bg-white rounded-lg p-2 text-xs outline-none focus:border-amber-400"
                      >
                        {(siteConfig.categories || [
                          { id: 'carriers', name: 'Carriers' },
                          { id: 'pouches', name: 'Pouches & Wraps' },
                          { id: 'combos', name: 'Bundles & Combos' },
                          { id: 'accessories', name: 'Accessories' }
                        ]).filter((cat: any) => cat.id !== 'all').map((cat: any, idx: number) => (
                          <option key={`edit-prod-cat-${cat.id || idx}-${idx}`} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Promo Badge</label>
                      <input 
                        type="text" 
                        value={editingProduct.badge || ''} 
                        onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-amber-400"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Affiliate / Buy URL</label>
                      <input 
                        type="text" 
                        value={editingProduct.buyUrl || ''} 
                        onChange={(e) => setEditingProduct({ ...editingProduct, buyUrl: e.target.value })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Primary Product Image *</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={editingProduct.image || ''} 
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                          className={`border rounded-lg p-2 text-xs outline-none bg-white flex-1 ${
                            editingProduct.image && !validateImageUrl(editingProduct.image)
                              ? 'border-red-500 focus:border-red-500 text-red-700 bg-red-50/10'
                              : 'border-[#C9CCCF] focus:border-amber-400'
                          }`}
                          placeholder="Paste image URL or click upload..."
                        />
                        <button
                          type="button"
                          onClick={() => !isUploading && triggerFileInput('editing-product')}
                          disabled={isUploading}
                          className="px-3 py-2 bg-white border border-[#C9CCCF] hover:bg-gray-50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {isUploading && uploadTarget === 'editing-product' ? (
                            <>
                              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-amber-500 border-t-transparent"></span>
                              <span>{getUploadProgressText(uploadPendingState, 'Uploading...')}</span>
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              <span>Upload Image</span>
                            </>
                          )}
                        </button>
                      </div>
                      {editingProduct.image && !validateImageUrl(editingProduct.image) && (
                        <p className="text-red-500 text-[10px] font-semibold mt-1">
                          ⚠️ Invalid URL. Must start with http://, https://, or /uploads/
                        </p>
                      )}
                      {editingProduct.image && (
                        <div className="mt-2 relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
                          <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Additional Gallery Images (Comma-separated URLs)</label>
                      <input 
                        type="text" 
                        value={editingProduct.images?.join(', ') || ''} 
                        onChange={(e) => setEditingProduct({ ...editingProduct, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-600">Brief Tagline (Shows on cards)</label>
                    <input 
                      type="text" 
                      value={editingProduct.tagline || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-amber-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-600">Full Description (HTML paragraph tags supported)</label>
                    <textarea 
                      value={editingProduct.description || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white focus:border-amber-400 h-20 font-mono"
                    />
                  </div>

                  {/* Specifications sub-panel */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <h4 className="text-xs font-bold text-amber-900 mb-2">Technical Specifications Sheet</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-amber-800">Materials Blend</label>
                        <input 
                          type="text" 
                          value={editingProduct.specs?.['Materials'] || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, specs: { ...editingProduct.specs, 'Materials': e.target.value } })}
                          className="border border-amber-300 rounded p-1.5 text-[11px] bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-amber-800">Carry Positions</label>
                        <input 
                          type="text" 
                          value={editingProduct.specs?.['Carry Positions'] || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, specs: { ...editingProduct.specs, 'Carry Positions': e.target.value } })}
                          className="border border-amber-300 rounded p-1.5 text-[11px] bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-amber-800">Age / Weight Limit</label>
                        <input 
                          type="text" 
                          value={editingProduct.specs?.['Age limit'] || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, specs: { ...editingProduct.specs, 'Age limit': e.target.value } })}
                          className="border border-amber-300 rounded p-1.5 text-[11px] bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-amber-800">Care Instructions</label>
                        <input 
                          type="text" 
                          value={editingProduct.specs?.['Care'] || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, specs: { ...editingProduct.specs, 'Care': e.target.value } })}
                          className="border border-amber-300 rounded p-1.5 text-[11px] bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 justify-end mt-2">
                    <button 
                      onClick={() => setEditingProduct(null)}
                      className="border border-[#C9CCCF] bg-white text-gray-600 px-3.5 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProductEdit}
                      className="bg-amber-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="overflow-x-auto border border-[#E1E3E5] rounded-xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E1E3E5] text-[#4C4E50] uppercase tracking-wider font-semibold">
                      <th className="p-4 w-16">Preview</th>
                      <th className="p-4">Product details</th>
                      <th className="p-4 w-28">Category</th>
                      <th className="p-4 w-24 text-right">Price</th>
                      <th className="p-4 w-32 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteConfig.products.map((prod: Product) => (
                      <tr key={prod.id} className="border-b border-[#E1E3E5] hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <img 
                            src={prod.image} 
                            alt={prod.title} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-12 object-cover rounded-md border bg-light-beige/45" 
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-serif font-bold text-sm text-[#202223]">{prod.title}</div>
                          <div className="text-gray-400 text-[10px] truncate max-w-md mt-0.5">{prod.tagline}</div>
                        </td>
                        <td className="p-4">
                          <span className="capitalize px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold text-[10px]">
                            {prod.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-semibold font-serif text-sm">
                          £{prod.price.toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => !isUploading && triggerFileInput(prod.id)}
                              disabled={isUploading && uploadTarget === prod.id}
                              className="p-1.5 text-gray-500 hover:text-[#008060] hover:bg-[#EAF3EF] rounded transition-all disabled:opacity-50"
                              title={isUploading && uploadTarget === prod.id ? getUploadProgressText(uploadPendingState, "Uploading...") : "Replace Photo"}
                            >
                              {isUploading && uploadTarget === prod.id ? (
                                <span className="animate-spin rounded-full h-3 w-3 border-2 border-[#008060] border-t-transparent block mx-auto"></span>
                              ) : (
                                <ImageIcon size={14} />
                              )}
                            </button>
                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded transition-all"
                              title="Edit Details"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                              title="Delete Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                </>
              )}

              {/* BULK TAB VIEW */}
              {productsSubTab === 'bulk' && (
                <div className="flex flex-col gap-5 animate-fadeIn">
                  {/* Warning Info Box */}
                  <div className="bg-[#EAF3EF]/60 border border-[#008060]/20 p-4 rounded-xl text-xs text-[#008060] flex items-start gap-3 text-left">
                    <div className="bg-[#008060] text-white p-1 rounded-md shrink-0">
                      <Save size={14} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-xs">Batch Firestore Operations Panel</h4>
                      <p className="text-gray-600 mt-1">
                        Modify prices and availability below. These changes are saved in local buffer state and will be written as a <strong>single batch Firestore transaction</strong> (`writeBatch`) when you click publish.
                      </p>
                    </div>
                  </div>

                  {/* Bulk Editor Table */}
                  <div className="overflow-x-auto border border-[#E1E3E5] rounded-xl bg-white shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F8F9FA] border-b border-[#E1E3E5] text-[#4C4E50] uppercase tracking-wider font-semibold">
                          <th className="p-4 w-16">Preview</th>
                          <th className="p-4">Product details</th>
                          <th className="p-4 w-28">Category</th>
                          <th className="p-4 w-32">Price (£)</th>
                          <th className="p-4 w-40 text-center">Availability (Stock)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkProducts.map((prod: Product) => (
                          <tr key={prod.id} className="border-b border-[#E1E3E5] hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <img 
                                src={prod.image} 
                                alt={prod.title} 
                                referrerPolicy="no-referrer"
                                className="w-10 h-12 object-cover rounded-md border bg-light-beige/45" 
                              />
                            </td>
                            <td className="p-4">
                              <div className="font-serif font-bold text-sm text-[#202223]">{prod.title}</div>
                              <div className="text-gray-400 text-[10px] truncate max-w-xs mt-0.5">{prod.tagline}</div>
                            </td>
                            <td className="p-4">
                              <span className="capitalize px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold text-[10px]">
                                {prod.category}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 max-w-[120px]">
                                <span className="text-gray-400 font-bold">£</span>
                                <input 
                                  type="number"
                                  value={prod.price}
                                  onChange={(e) => handleBulkPriceChange(prod.id, Number(e.target.value))}
                                  className="w-full border border-[#C9CCCF] rounded-lg p-1.5 text-xs outline-none bg-white focus:border-[#008060] font-mono text-right font-semibold"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleBulkStockToggle(prod.id)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                                  prod.inStock !== false 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                }`}
                              >
                                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse"></span>
                                {prod.inStock !== false ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bulk Actions Footer */}
                  <div className="flex justify-end items-center gap-3 border-t border-gray-150 pt-4 mt-1">
                    <button
                      onClick={handleDiscardBulkChanges}
                      className="border border-[#C9CCCF] bg-white text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      Reset Buffer
                    </button>
                    <button
                      onClick={() => onBulkUpdateProducts(bulkProducts)}
                      disabled={syncState === 'saving'}
                      className="bg-[#008060] text-white hover:bg-[#006e52] px-5 py-2.5 rounded-lg text-xs font-extrabold flex items-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {syncState === 'saving' ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Publishing Batch...</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>Commit &amp; Publish Batch (Firestore)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-[#E1E3E5] shadow-sm animate-fadeIn">
              <div className="flex justify-between items-center border-b border-[#E1E3E5] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-gray-800">Categories Manager</h2>
                  <p className="text-xs text-gray-500 mt-1">Configure Baby Dwelling collections dynamically.</p>
                </div>
              </div>

              {/* Add Category Form */}
              <div className="bg-[#F8F9FA] border border-dashed border-[#008060] p-4 rounded-xl flex flex-col gap-3">
                <h3 className="font-sans font-bold text-xs text-[#008060]">Create New Category</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] font-semibold text-gray-500">Category Name</label>
                    <input 
                      type="text"
                      id="new-cat-name"
                      placeholder="e.g. Linen Wraps"
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs bg-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] font-semibold text-gray-500">Unique Category ID / Slug</label>
                    <input 
                      type="text"
                      id="new-cat-id"
                      placeholder="e.g. linen-wraps"
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs bg-white outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    const nameInput = document.getElementById('new-cat-name') as HTMLInputElement;
                    const idInput = document.getElementById('new-cat-id') as HTMLInputElement;
                    if (nameInput && idInput && nameInput.value.trim() && idInput.value.trim()) {
                      const newCatId = idInput.value.trim().toLowerCase().replace(/\s+/g, '-');
                      const newCat = {
                        id: newCatId,
                        name: nameInput.value.trim()
                      };
                      const currentCats = siteConfig.categories || [
                        { id: 'all', name: 'Shop All' },
                        { id: 'carriers', name: 'Baby Carriers' },
                        { id: 'pouches', name: 'Wraps & Pouches' },
                        { id: 'combos', name: 'Bundles & Combos' },
                        { id: 'accessories', name: 'Support Accessories' }
                      ];
                      if (currentCats.some((c: any) => c.id === newCatId)) {
                        alert('Category ID already exists!');
                        return;
                      }
                      const updated = [...currentCats, newCat];
                      handleConfigChange('categories', updated);
                      nameInput.value = '';
                      idInput.value = '';
                    } else {
                      alert('Please provide both Category Name and Category ID!');
                    }
                  }}
                  className="bg-[#008060] text-white self-end hover:bg-[#006e52] px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Create Category
                </button>
              </div>

              {/* Category Directory Table */}
              <div className="border border-[#E1E3E5] rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E1E3E5] text-[#4C4E50] uppercase tracking-wider font-semibold">
                      <th className="p-4">Category Name</th>
                      <th className="p-4">ID (Used in Routing)</th>
                      <th className="p-4 w-24 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(siteConfig.categories || [
                      { id: 'all', name: 'Shop All' },
                      { id: 'carriers', name: 'Baby Carriers' },
                      { id: 'pouches', name: 'Wraps & Pouches' },
                      { id: 'combos', name: 'Bundles & Combos' },
                      { id: 'accessories', name: 'Support Accessories' }
                    ]).map((cat: any) => (
                      <tr key={cat.id} className="border-b border-[#E1E3E5] hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-800 text-left">{cat.name}</td>
                        <td className="p-4 font-mono text-gray-500 text-left">{cat.id}</td>
                        <td className="p-4 text-center">
                          {cat.id === 'all' || cat.id === 'carriers' || cat.id === 'pouches' ? (
                            <span className="text-[10px] text-gray-400 font-sans italic">Core</span>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                                  const updated = (siteConfig.categories || []).filter((c: any) => c.id !== cat.id);
                                  handleConfigChange('categories', updated);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CUSTOM PAGES */}
          {activeTab === 'pages' && (
            <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-[#E1E3E5] shadow-sm animate-fadeIn">
              <div className="flex justify-between items-center border-b border-[#E1E3E5] pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-gray-800">Custom Pages Directory</h2>
                  <p className="text-xs text-gray-500 mt-1">Create and publish standalone informational pages using WYSIWYG editor.</p>
                </div>
                {!isAddingPage && !editingPage && (
                  <button
                    onClick={() => {
                      setIsAddingPage(true);
                      setNewPageTitle('');
                      setNewPageSlug('');
                      setNewPageBody('');
                    }}
                    className="bg-[#008060] text-white hover:bg-[#006e52] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus size={15} /> Create Page
                  </button>
                )}
              </div>

              {/* Form to Add New Page */}
              {isAddingPage && (
                <div className="bg-[#F8F9FA] border border-dashed border-[#008060] p-6 rounded-2xl flex flex-col gap-4 text-left">
                  <h3 className="font-serif font-bold text-sm text-[#008060]">Create New Rich Page</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Page Title</label>
                      <input 
                        type="text" 
                        value={newPageTitle} 
                        onChange={(e) => {
                          setNewPageTitle(e.target.value);
                          if (!newPageSlug) {
                            setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                          }
                        }}
                        placeholder="e.g. Our Sourcing Policy"
                        className="border border-[#C9CCCF] rounded-lg p-2.5 text-xs bg-white outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Slug / URL Path</label>
                      <input 
                        type="text" 
                        value={newPageSlug} 
                        onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, ''))}
                        placeholder="e.g. sourcing-policy"
                        className="border border-[#C9CCCF] rounded-lg p-2.5 text-xs bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-600 mb-1">Page Body Content (WYSIWYG Editor)</label>
                    <WysiwygEditor 
                      value={newPageBody} 
                      onChange={setNewPageBody} 
                    />
                  </div>

                  <div className="flex gap-2.5 justify-end mt-4">
                    <button 
                      onClick={() => setIsAddingPage(false)}
                      className="border border-[#C9CCCF] bg-white text-gray-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancel Page
                    </button>
                    <button 
                      onClick={() => {
                        if (!newPageTitle.trim() || !newPageSlug.trim()) {
                          alert('Title and Slug are required!');
                          return;
                        }
                        const currentPages = siteConfig.pages || [];
                        if (currentPages.some((p: any) => p.slug === newPageSlug)) {
                          alert('A page with this URL Slug already exists!');
                          return;
                        }
                        const newPage = {
                          id: String(Date.now()),
                          title: newPageTitle.trim(),
                          slug: newPageSlug.trim(),
                          body: newPageBody,
                          isPublished: true,
                          createdAt: new Date().toISOString().split('T')[0]
                        };
                        const updated = [...currentPages, newPage];
                        handleConfigChange('pages', updated);
                        setIsAddingPage(false);
                      }}
                      className="bg-[#008060] text-white px-5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Publish Page Live
                    </button>
                  </div>
                </div>
              )}

              {/* Form to Edit Page */}
              {editingPage && (
                <div className="bg-[#FFFEE5] border border-dashed border-amber-400 p-6 rounded-2xl flex flex-col gap-4 text-left">
                  <h3 className="font-serif font-bold text-sm text-amber-800">Editing Custom Page: {editingPage.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Page Title</label>
                      <input 
                        type="text" 
                        value={editingPage.title} 
                        onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                        className="border border-[#C9CCCF] rounded-lg p-2.5 text-xs bg-white outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-gray-600">Slug / URL Path</label>
                      <input 
                        type="text" 
                        value={editingPage.slug} 
                        onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '') })}
                        className="border border-[#C9CCCF] rounded-lg p-2.5 text-xs bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-600 mb-1">Page Body Content (WYSIWYG Editor)</label>
                    <WysiwygEditor 
                      value={editingPage.body} 
                      onChange={(body) => setEditingPage({ ...editingPage, body })} 
                    />
                  </div>

                  <div className="flex gap-2.5 justify-end mt-4">
                    <button 
                      onClick={() => setEditingPage(null)}
                      className="border border-[#C9CCCF] bg-white text-gray-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (!editingPage.title.trim() || !editingPage.slug.trim()) {
                          alert('Title and Slug are required!');
                          return;
                        }
                        const currentPages = siteConfig.pages || [];
                        const updated = currentPages.map((p: any) => p.id === editingPage.id ? editingPage : p);
                        handleConfigChange('pages', updated);
                        setEditingPage(null);
                      }}
                      className="bg-[#008060] text-white px-5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Save &amp; Publish Page
                    </button>
                  </div>
                </div>
              )}

              {/* Pages Directory Table */}
              {!isAddingPage && !editingPage && (
                <div className="border border-[#E1E3E5] rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F8F9FA] border-b border-[#E1E3E5] text-[#4C4E50] uppercase tracking-wider font-semibold">
                        <th className="p-4">Page Title</th>
                        <th className="p-4">Path / Slug</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4 w-28 text-center">Status</th>
                        <th className="p-4 w-28 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(siteConfig.pages || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400 font-sans italic">
                            No custom pages created yet. Click "Create Page" above to get started.
                          </td>
                        </tr>
                      ) : (
                        (siteConfig.pages || []).map((page: any, idx: number) => (
                          <tr key={`admin-tbl-page-${page.id || idx}-${idx}`} className="border-b border-[#E1E3E5] hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-bold text-gray-800 text-left">{page.title}</td>
                            <td className="p-4 font-mono text-gray-500 text-left">/page/{page.slug}</td>
                            <td className="p-4 text-gray-500 text-left">{page.createdAt}</td>
                            <td className="p-4 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">
                                Live &amp; Active
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setEditingPage(page)}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all cursor-pointer"
                                  title="Edit Page"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete custom page "${page.title}"?`)) {
                                      const updated = (siteConfig.pages || []).filter((p: any) => p.id !== page.id);
                                      handleConfigChange('pages', updated);
                                    }
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer"
                                  title="Delete Page"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: NAVIGATION EDITOR */}
          {activeTab === 'navigation' && (
            <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-[#E1E3E5] shadow-sm animate-fadeIn">
              <div className="border-b border-[#E1E3E5] pb-4">
                <h2 className="font-serif text-xl font-bold text-gray-800">Store Navigation Editor</h2>
                <p className="text-xs text-gray-500 mt-1">Modify storefront's top header menu links dynamically.</p>
              </div>

              {/* Add Navigation Link Form */}
              <div className="bg-[#F8F9FA] border border-dashed border-[#008060] p-4 rounded-xl flex flex-col gap-3">
                <h3 className="font-sans font-bold text-xs text-[#008060] text-left">Add Navigation Link</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] font-semibold text-gray-500">Menu Label</label>
                    <input 
                      type="text"
                      id="new-nav-label"
                      placeholder="e.g. Sourcing Policy"
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs bg-white outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] font-semibold text-gray-500">Link Destination</label>
                    <select 
                      id="new-nav-target"
                      className="border border-[#C9CCCF] rounded-lg p-2 text-xs bg-white outline-none"
                    >
                      <option value="home">Home / Our Story</option>
                      <option value="shop">Shop All Products</option>
                      <option value="detail">Signature Heritage Product</option>
                      <optgroup label="Shop Categories">
                        {(siteConfig.categories || [
                          { id: 'carriers', name: 'Carriers' },
                          { id: 'pouches', name: 'Wraps & Pouches' },
                          { id: 'combos', name: 'Bundles & Combos' },
                          { id: 'accessories', name: 'Accessories' }
                        ]).filter((cat: any) => cat.id !== 'all').map((cat: any, idx: number) => (
                          <option key={`new-nav-cat-${cat.id || idx}-${idx}`} value={`shop:${cat.id}`}>Category: {cat.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Custom Pages">
                        {(siteConfig.pages || []).map((page: any, idx: number) => (
                          <option key={`new-nav-page-${page.id || idx}-${idx}`} value={`page:${page.slug}`}>Page: {page.title}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const labelInput = document.getElementById('new-nav-label') as HTMLInputElement;
                    const targetSelect = document.getElementById('new-nav-target') as HTMLSelectElement;
                    if (labelInput && targetSelect && labelInput.value.trim()) {
                      const newNav = {
                        label: labelInput.value.trim(),
                        target: targetSelect.value
                      };
                      const currentNav = siteConfig.navigation || [
                        { label: 'Our Story', target: 'home' },
                        { label: 'Shop All', target: 'shop' },
                        { label: 'Signature Heritage', target: 'detail' }
                      ];
                      const updated = [...currentNav, newNav];
                      handleConfigChange('navigation', updated);
                      labelInput.value = '';
                    } else {
                      alert('Please provide a label for your menu link.');
                    }
                  }}
                  className="bg-[#008060] text-white self-end hover:bg-[#006e52] px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Add Link to Menu
                </button>
              </div>

              {/* Navigation Items list */}
              <div className="border border-[#E1E3E5] rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E1E3E5] text-[#4C4E50] uppercase tracking-wider font-semibold">
                      <th className="p-4">Menu Label</th>
                      <th className="p-4">Destination Target</th>
                      <th className="p-4 w-24 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(siteConfig.navigation || [
                      { label: 'Our Story', target: 'home' },
                      { label: 'Shop All', target: 'shop' },
                      { label: 'Signature Heritage', target: 'detail' }
                    ]).map((navItem: any, index: number) => {
                      let readableTarget = navItem.target;
                      if (navItem.target === 'home') readableTarget = 'Home / Our Story';
                      else if (navItem.target === 'shop') readableTarget = 'Shop All Products';
                      else if (navItem.target === 'detail') readableTarget = 'Signature Heritage';
                      else if (navItem.target.startsWith('shop:')) {
                        const catId = navItem.target.replace('shop:', '');
                        const cat = (siteConfig.categories || []).find((c: any) => c.id === catId);
                        readableTarget = `Shop Category: ${cat ? cat.name : catId}`;
                      } else if (navItem.target.startsWith('page:')) {
                        const slug = navItem.target.replace('page:', '');
                        const page = (siteConfig.pages || []).find((p: any) => p.slug === slug);
                        readableTarget = `Custom Page: ${page ? page.title : slug}`;
                      }

                      return (
                        <tr key={index} className="border-b border-[#E1E3E5] hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-gray-800 text-left">{navItem.label}</td>
                          <td className="p-4 text-gray-500 font-mono text-left">{readableTarget}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                const currentNav = siteConfig.navigation || [
                                  { label: 'Our Story', target: 'home' },
                                  { label: 'Shop All', target: 'shop' },
                                  { label: 'Signature Heritage', target: 'detail' }
                                ];
                                const updated = currentNav.filter((_: any, i: number) => i !== index);
                                handleConfigChange('navigation', updated);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Remove Link"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS MANAGEMENT */}
          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-[#E1E3E5] shadow-sm">
              <div className="border-b border-[#E1E3E5] pb-4">
                <h2 className="font-serif text-xl font-bold">Parent Testimonials &amp; Reviews</h2>
                <p className="text-xs text-gray-500 mt-1">Manage verified reviews appearing in parent feedback lists.</p>
              </div>

              <div className="flex flex-col gap-4">
                {siteConfig.reviews.map((rev: Review) => (
                  <div key={rev.id} className="p-5 border border-[#E1E3E5] hover:border-gray-300 rounded-xl flex items-start gap-4 transition-all">
                    <div className="w-10 h-10 rounded-full bg-light-beige flex items-center justify-center font-serif font-bold text-sm text-terracotta flex-shrink-0">
                      {rev.name.substring(0, 1)}
                    </div>
                    
                    <div className="flex-grow text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-sans font-bold text-sm">{rev.name}</h4>
                          <span className="text-[10px] text-gray-400 mt-0.5 inline-block">Baby age: {rev.babyAge} | Date: {rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} size={11} className="fill-terracotta text-terracotta" />
                            ))}
                          </div>
                          {rev.verified && (
                            <span className="text-[9px] uppercase font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="font-sans text-xs text-gray-600 mt-2 leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>

                    <button 
                      onClick={() => handleDeleteReview(rev.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-colors self-start flex-shrink-0"
                      title="Remove Review"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GOOGLE SEO HUB */}
          {activeTab === 'seo' && (
            <div className="flex flex-col gap-6">
              <SeoView 
                siteConfig={siteConfig}
                onNavigateToView={(view, subTarget) => onNavigateToView(view, subTarget)}
                setCurrentPageSlug={setCurrentPageSlug}
              />
            </div>
          )}

        </section>

      </div>

      {/* Success saving indicator toast */}
      <AnimatePresence>
        {isSavedToastOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-[#1A1C1D] border border-white/10 text-white py-3.5 px-5 rounded-xl shadow-xl flex items-center gap-2.5 z-50 text-xs font-semibold tracking-wide"
          >
            <Check size={16} className="text-green-500 stroke-[3px]" />
            <span>Storefront Settings Saved to Shopify Live</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Factory Reset safety modal confirmation */}
      <AnimatePresence>
        {resetModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-5">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl text-left border border-red-100"
            >
              <h3 className="font-serif text-lg font-bold text-red-700">Restore Factory Defaults?</h3>
              <p className="font-sans text-xs text-gray-500 mt-2 leading-relaxed">
                This will wipe out all customized texts, uploaded Base64 images, newly created products, and review alterations. The storefront will return completely to original default values.
              </p>
              
              <div className="flex gap-2.5 justify-end mt-6">
                <button 
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel Safety
                </button>
                <button 
                  onClick={handleResetToDefaults}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Yes, Wipe Storefront
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
