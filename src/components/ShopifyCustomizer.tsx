import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Monitor, 
  Smartphone, 
  Tablet as TabletIcon, 
  Plus, 
  Trash2, 
  Eye, 
  Search,
  Palette,
  Menu,
  Layout,
  Type,
  Grid,
  BookOpen,
  ShoppingBag,
  FileText,
  Sliders,
  Settings,
  ChevronRight,
  Info,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveView, Product } from '../types';
import WysiwygEditor from './WysiwygEditor';
import * as Accordion from '@radix-ui/react-accordion';

// Import our modular subcomponents
import SidebarAccordion from './customizer/SidebarAccordion';
import SidebarTabs from './customizer/SidebarTabs';
import ImageUploader from './customizer/ImageUploader';
import { 
  SettingInput, 
  SettingTextarea, 
  CustomSwitch, 
  ColorPicker, 
  SettingGroup 
} from './customizer/SettingComponents';

interface ShopifyCustomizerProps {
  siteConfig: any;
  onChangeConfig: (newConfig: any) => void;
  onSave: () => void;
  onReset: () => void;
  onClose: () => void;
  activePreviewView: ActiveView;
  onChangePreviewView: (view: ActiveView) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  onChangePreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  currentPageSlug: string;
  onChangePageSlug: (slug: string) => void;
}

export default function ShopifyCustomizer({
  siteConfig,
  onChangeConfig,
  onSave,
  onReset,
  onClose,
  activePreviewView,
  onChangePreviewView,
  previewDevice,
  onChangePreviewDevice,
  currentPageSlug,
  onChangePageSlug,
}: ShopifyCustomizerProps) {
  // Navigation tabs for sections that have deep settings
  const [aestheticsTab, setAestheticsTab] = useState<string>('presets');
  const [headerTab, setHeaderTab] = useState<string>('logo');
  const [heroTab, setHeroTab] = useState<string>('content');
  const [productsTab, setProductsTab] = useState<string>('price');
  const [checkoutTab, setCheckoutTab] = useState<string>('amazon');

  const [openSection, setOpenSection] = useState<string | null>('hero');
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mobile Drawer responsiveness states
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileUpload = async (file: File, fieldKey: string, index?: number) => {
    const keyIdentifier = index !== undefined ? `${fieldKey}-${index}` : fieldKey;
    setUploadingField(keyIdentifier);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: reader.result,
              name: file.name
            })
          });
          
          if (!response.ok) {
            throw new Error('Upload failed');
          }
          
          const data = await response.json();
          if (data && data.url) {
            if (index !== undefined) {
              handleNestedFieldChange(fieldKey, index, 'image', data.url);
            } else {
              handleFieldChange(fieldKey, data.url);
            }
          }
        } catch (err) {
          console.error("Error uploading file online:", err);
          alert("Failed to upload image online. Please try another image.");
        } finally {
          setUploadingField(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploadingField(null);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleFieldChange = (key: string, value: any) => {
    onChangeConfig({
      ...siteConfig,
      [key]: value,
    });
  };

  const handleNestedFieldChange = (parentKey: string, index: number, field: string, value: any) => {
    const list = [...(siteConfig[parentKey] || [])];
    if (list[index]) {
      list[index] = { ...list[index], [field]: value };
      handleFieldChange(parentKey, list);
    }
  };

  const handleAddListItem = (parentKey: string, defaultObj: any) => {
    const list = [...(siteConfig[parentKey] || [])];
    list.push(defaultObj);
    handleFieldChange(parentKey, list);
  };

  const handleRemoveListItem = (parentKey: string, index: number) => {
    const list = (siteConfig[parentKey] || []).filter((_: any, i: number) => i !== index);
    handleFieldChange(parentKey, list);
  };

  // Recommended high-quality Unsplash image presets
  const PRESET_IMAGES = [
    {
      name: 'Signature Linen Cream',
      url: 'https://images.unsplash.com/photo-1544126592-807adc21510d?auto=format&fit=crop&w=2000&q=80',
    },
    {
      name: 'Earthy Sage Green',
      url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=2000&q=80',
    },
    {
      name: 'Oatmeal Tweed Carrier',
      url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=2000&q=80',
    },
    {
      name: 'Supportive Bonding',
      url: 'https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=2000&q=80',
    }
  ];

  // Definition of customizer accordion sections
  const ACCORDION_SECTIONS = [
    {
      id: 'aesthetics',
      title: 'Theme Settings & Colors',
      icon: <Palette size={16} />,
      keywords: ['preset', 'theme', 'colors', 'font', 'design', 'style', 'brand', 'sage', 'linen', 'comfort', 'meadow'],
    },
    {
      id: 'navigation',
      title: 'Header Navigation',
      icon: <Menu size={16} />,
      keywords: ['menu', 'header', 'links', 'logo', 'brand', 'navigation', 'nav'],
    },
    {
      id: 'hero',
      title: 'Hero Banner',
      icon: <Layout size={16} />,
      keywords: ['hero', 'banner', 'title', 'subtitle', 'tagline', 'cta', 'image', 'button'],
    },
    {
      id: 'badges',
      title: 'Trust Badges Section',
      icon: <Type size={16} />,
      keywords: ['trust', 'badges', 'certified', 'shipping', 'delivery', 'materials', 'support'],
    },
    {
      id: 'categories',
      title: 'Collections',
      icon: <Grid size={16} />,
      keywords: ['collections', 'categories', 'shop', 'routing', 'id', 'category'],
    },
    {
      id: 'products',
      title: 'Products & Pricing',
      icon: <ShoppingBag size={16} />,
      keywords: ['products', 'price', 'pricing', 'specs', 'msrp', 'rating', 'image', 'title', 'buy', 'affiliate'],
    },
    {
      id: 'pages',
      title: 'standalone custom pages',
      icon: <BookOpen size={16} />,
      keywords: ['pages', 'policy', 'sizing', 'about', 'standalone', 'custom pages'],
    },
    {
      id: 'checkout-redirection',
      title: 'Checkout Redirection',
      icon: <FileText size={16} />,
      keywords: ['checkout', 'redirection', 'amazon', 'walmart', 'button text'],
    }
  ];

  // Smart search filtering
  const filteredSections = ACCORDION_SECTIONS.filter(sec => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(query) ||
      sec.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  });

  // Determines whether an accordion section should be open
  const isSectionOpen = (sectionId: string) => {
    if (searchQuery) {
      // Auto expand matching sections when searching so the user instantly finds what they need!
      return filteredSections.some(sec => sec.id === sectionId);
    }
    return openSection === sectionId;
  };

  const SidebarContentMarkup = (
    <div className="w-full h-full flex flex-col bg-[#F9F9FB] dark:bg-[#121214] overflow-hidden">
      
      {/* 1. BRAND HEADER */}
      <div className="p-4 bg-white dark:bg-[#1C1C1E] border-b border-[#E1E3E5] dark:border-gray-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#008060] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-[#008060]/20">S</div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">Shopify Customizer</h1>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008060] inline-block animate-pulse"></span>
              Live Storefront Editor
            </p>
          </div>
        </div>
        
        {isMobile ? (
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
            title="Minimize Panel"
          >
            <X size={16} />
          </button>
        ) : (
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
            title="Exit Customizer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 2. LIVE SEARCH & GLOBAL PREVIEW TARGET CONTROLS */}
      <div className="p-4 bg-white dark:bg-[#1C1C1E] border-b border-[#E1E3E5] dark:border-gray-800 flex flex-col gap-3">
        {/* Shopify Instant Search Box */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search storefront settings..."
            className="w-full pl-9 pr-8 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black rounded-lg text-xs outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060]/20 transition-all font-semibold text-gray-700 dark:text-gray-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Preview Device & Target Page Switchers */}
        <div className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-black p-2 rounded-lg border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase select-none">View:</span>
            <select 
              value={
                activePreviewView === 'page' 
                  ? `page:${currentPageSlug}` 
                  : activePreviewView
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('page:')) {
                  const slug = val.replace('page:', '');
                  onChangePageSlug(slug);
                  onChangePreviewView('page');
                } else {
                  onChangePreviewView(val as ActiveView);
                }
              }}
              className="border border-[#C9CCCF] dark:border-gray-800 rounded bg-white dark:bg-black text-[11px] px-2 py-1 outline-none font-bold text-gray-700 dark:text-gray-300 hover:border-gray-400 transition-all cursor-pointer"
            >
              <option value="home">Home Page (Story)</option>
              <option value="shop">Shop All Collections</option>
              <option value="detail">Product Detail Page</option>
              <optgroup label="Custom Standalone Pages">
                {(siteConfig.pages || []).map((p: any, idx: number) => (
                  <option key={`cust-opt-p-${p.id || idx}-${idx}`} value={`page:${p.slug}`}>{p.title}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex items-center gap-0.5 bg-gray-200 dark:bg-gray-800 rounded-md p-0.5">
            <button
              onClick={() => onChangePreviewDevice('desktop')}
              className={`p-1 rounded transition-all cursor-pointer ${previewDevice === 'desktop' ? 'bg-white dark:bg-black shadow-sm text-[#008060]' : 'text-gray-500 hover:text-gray-900'}`}
              title="Desktop View"
            >
              <Monitor size={13} />
            </button>
            <button
              onClick={() => onChangePreviewDevice('tablet')}
              className={`p-1 rounded transition-all cursor-pointer ${previewDevice === 'tablet' ? 'bg-white dark:bg-black shadow-sm text-[#008060]' : 'text-gray-500 hover:text-gray-900'}`}
              title="Tablet View"
            >
              <TabletIcon size={13} />
            </button>
            <button
              onClick={() => onChangePreviewDevice('mobile')}
              className={`p-1 rounded transition-all cursor-pointer ${previewDevice === 'mobile' ? 'bg-white dark:bg-black shadow-sm text-[#008060]' : 'text-gray-500 hover:text-gray-900'}`}
              title="Mobile View"
            >
              <Smartphone size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. ACCORDION CONTAINER */}
      <div className="flex-1 min-h-0 p-4 bg-[#F9F9FB] dark:bg-[#121214] overflow-y-auto shopify-customizer-scrollbar flex flex-col">
        <Accordion.Root
          type={searchQuery ? "multiple" : "single"}
          collapsible={true}
          value={searchQuery ? undefined : (openSection || undefined)}
          onValueChange={(val) => {
            if (!searchQuery) {
              setOpenSection(Array.isArray(val) ? val[0] : val || null);
            }
          }}
          className="flex flex-col gap-3 w-full"
        >
          
          {/* SECTION: SITE PRESETS & AESTHETICS */}
          {filteredSections.some(s => s.id === 'aesthetics') && (
            <SidebarAccordion
              id="aesthetics"
              title="Theme Presets & Colors"
              isOpen={isSectionOpen('aesthetics')}
              onToggle={() => toggleSection('aesthetics')}
              icon={<Palette size={14} />}
            >
              <SidebarTabs
                activeTab={aestheticsTab}
                onChangeTab={setAestheticsTab}
                tabs={[
                  { id: 'presets', label: 'Presets' },
                  { id: 'typography', label: 'Typography' },
                ]}
              />

              {aestheticsTab === 'presets' ? (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <div className="bg-[#FCFAF7] dark:bg-black/20 p-3 rounded-lg border border-amber-100 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider">Active Preset: Linen Comfort</span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                      The baby dwelling storefront is styled with luxurious cream, oatmeal textures, and warm, calming terracottas. 
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-[#008060]">
                      <Check size={14} /> Certified Organic Aesthetics Active
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => alert('Theme Preset "Linen Comfort" active! Generates soft warm tones.')}
                      className="p-3 border border-[#008060] bg-[#FCFAF7] rounded-xl text-left transition-all active:scale-95"
                    >
                      <span className="block font-bold text-xs text-[#121212]">Linen Comfort</span>
                      <span className="text-[9px] text-[#008060] block mt-0.5">Active Theme</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => alert('Sage Meadow Preset selection active! Sage Green is now pre-loaded across accent layers.')}
                      className="p-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black/35 hover:border-[#008060]/40 rounded-xl text-left transition-all active:scale-95"
                    >
                      <span className="block font-bold text-xs text-gray-800 dark:text-gray-200">Sage Meadow</span>
                      <span className="text-[9px] text-gray-400 block mt-0.5"> Calming Greens</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 animate-fadeIn">
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Primary Display Font</span>
                    <div className="p-3 bg-white dark:bg-black rounded-lg font-serif text-sm font-bold border border-gray-150 dark:border-gray-800 text-gray-800 dark:text-gray-200">
                      Literata (Elegance & Storytelling)
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Primary Sans Body Font</span>
                    <div className="p-3 bg-white dark:bg-black rounded-lg font-sans text-xs font-semibold border border-gray-150 dark:border-gray-800 text-gray-800 dark:text-gray-200">
                      Plus Jakarta Sans (Crisp Readability)
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    * Font pairings are statically linked via Google Fonts premium imports to safeguard speed metrics.
                  </p>
                </div>
              )}
            </SidebarAccordion>
          )}

          {/* SECTION: NAVIGATION HEADER */}
          {filteredSections.some(s => s.id === 'navigation') && (
            <SidebarAccordion
              id="navigation"
              title="Header Navigation"
              isOpen={isSectionOpen('navigation')}
              onToggle={() => toggleSection('navigation')}
              icon={<Menu size={14} />}
            >
              <SidebarTabs
                activeTab={headerTab}
                onChangeTab={setHeaderTab}
                tabs={[
                  { id: 'logo', label: 'Brand Logo' },
                  { id: 'menu', label: 'Menu Links' },
                ]}
              />

              {headerTab === 'logo' ? (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <SettingInput
                    id="logoText"
                    label="Brand Logo Text"
                    value={siteConfig.logoText ?? 'Baby Dwelling'}
                    onChange={(val) => handleFieldChange('logoText', val)}
                    placeholder="e.g. Baby Dwelling"
                    helpText="Shows when logo image is empty."
                  />

                  <ImageUploader
                    id="logoImage"
                    label="Logo Image (Optional)"
                    imageUrl={siteConfig.logoImage ?? ''}
                    onUrlChange={(url) => handleFieldChange('logoImage', url)}
                    onFileUpload={(file) => handleFileUpload(file, 'logoImage')}
                    isUploading={uploadingField === 'logoImage'}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-3 animate-fadeIn">
                  <span className="text-[10px] font-bold text-gray-400 uppercase select-none">Top Header Menu Links</span>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto shopify-customizer-scrollbar pr-1">
                    {(siteConfig.navigation || []).map((navItem: any, index: number) => (
                      <div key={`cust-nav-${index}`} className="flex gap-2 items-center bg-white dark:bg-black/20 p-2.5 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm">
                        <input 
                          type="text" 
                          value={navItem.label} 
                          onChange={(e) => handleNestedFieldChange('navigation', index, 'label', e.target.value)}
                          placeholder="Link Text"
                          className="border border-[#C9CCCF] dark:border-gray-800 rounded-lg px-2.5 py-1.5 text-xs outline-none bg-white dark:bg-black font-bold w-1/2 focus:border-[#008060] text-gray-700 dark:text-gray-300"
                        />
                        <select 
                          value={navItem.target}
                          onChange={(e) => handleNestedFieldChange('navigation', index, 'target', e.target.value)}
                          className="border border-[#C9CCCF] dark:border-gray-800 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-black outline-none w-5/12 text-gray-600 dark:text-gray-400 font-semibold"
                        >
                          <option value="home">Home</option>
                          <option value="shop">Shop All</option>
                          <option value="detail">Signature Product</option>
                          {(siteConfig.pages || []).map((page: any, idx: number) => (
                            <option key={`cust-nav-opt-${page.id || idx}-${idx}`} value={`page:${page.slug}`}>Page: {page.title}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleRemoveListItem('navigation', index)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Delete link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddListItem('navigation', { label: 'New Collection', target: 'shop' })}
                    className="w-full py-2 border border-dashed border-[#008060]/50 text-[#008060] rounded-xl text-xs font-bold hover:bg-[#008060]/5 flex items-center justify-center gap-1 transition-colors cursor-pointer mt-1"
                  >
                    <Plus size={14} /> Add Menu Link
                  </button>
                </div>
              )}
            </SidebarAccordion>
          )}

          {/* SECTION: HERO BANNER HOME */}
          {filteredSections.some(s => s.id === 'hero') && (
            <SidebarAccordion
              id="hero"
              title="Hero Banner"
              isOpen={isSectionOpen('hero')}
              onToggle={() => toggleSection('hero')}
              icon={<Layout size={14} />}
            >
              <SidebarTabs
                activeTab={heroTab}
                onChangeTab={setHeroTab}
                tabs={[
                  { id: 'content', label: 'Content' },
                  { id: 'media', label: 'Media' },
                  { id: 'ctas', label: 'CTAs' },
                ]}
              />

              {heroTab === 'content' ? (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <SettingInput
                    id="heroTagline"
                    label="Hero Tagline Accent"
                    value={siteConfig.heroTagline || ''}
                    onChange={(val) => handleFieldChange('heroTagline', val)}
                    placeholder="e.g. Pure Combed Linen Slings"
                  />

                  <SettingTextarea
                    id="heroTitle"
                    label="Hero Main Title (HTML/Br tags supported)"
                    value={siteConfig.heroTitle || ''}
                    onChange={(val) => handleFieldChange('heroTitle', val)}
                    placeholder="e.g. Breathe Easy.<br />Bond Deeply."
                    rows={2}
                  />

                  <SettingTextarea
                    id="heroSubtitle"
                    label="Hero Narrative Subtitle"
                    value={siteConfig.heroSubtitle || ''}
                    onChange={(val) => handleFieldChange('heroSubtitle', val)}
                    placeholder="e.g. Experience premium organic ergonomic comfort..."
                    rows={3}
                  />
                </div>
              ) : heroTab === 'media' ? (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <ImageUploader
                    id="heroImage"
                    label="Hero Banner Image Background"
                    imageUrl={siteConfig.heroImage || ''}
                    onUrlChange={(url) => handleFieldChange('heroImage', url)}
                    onFileUpload={(file) => handleFileUpload(file, 'heroImage')}
                    isUploading={uploadingField === 'heroImage'}
                    presets={PRESET_IMAGES}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <SettingGroup title="Primary Call to Action">
                    <div className="grid grid-cols-2 gap-2">
                      <SettingInput
                        id="heroCta1Text"
                        label="Button Text"
                        value={siteConfig.heroCta1Text || ''}
                        onChange={(val) => handleFieldChange('heroCta1Text', val)}
                        placeholder="Shop All"
                      />
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Link Destination</label>
                        <select 
                          value={siteConfig.heroCta1Link || 'shop'} 
                          onChange={(e) => handleFieldChange('heroCta1Link', e.target.value)}
                          className="w-full border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-xs bg-white dark:bg-black font-semibold text-gray-800 dark:text-gray-200 outline-none"
                        >
                          <option value="home">Home Page</option>
                          <option value="shop">Shop All Collections</option>
                          <option value="detail">Signature Carrier</option>
                        </select>
                      </div>
                    </div>
                  </SettingGroup>

                  <SettingGroup title="Secondary Call to Action">
                    <div className="grid grid-cols-2 gap-2">
                      <SettingInput
                        id="heroCta2Text"
                        label="Button Text"
                        value={siteConfig.heroCta2Text || ''}
                        onChange={(val) => handleFieldChange('heroCta2Text', val)}
                        placeholder="Learn More"
                      />
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Link Destination</label>
                        <select 
                          value={siteConfig.heroCta2Link || 'detail'} 
                          onChange={(e) => handleFieldChange('heroCta2Link', e.target.value)}
                          className="w-full border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-xs bg-white dark:bg-black font-semibold text-gray-800 dark:text-gray-200 outline-none"
                        >
                          <option value="home">Home Page</option>
                          <option value="shop">Shop All Collections</option>
                          <option value="detail">Signature Carrier</option>
                        </select>
                      </div>
                    </div>
                  </SettingGroup>
                </div>
              )}
            </SidebarAccordion>
          )}

          {/* SECTION: TRUST BADGES */}
          {filteredSections.some(s => s.id === 'badges') && (
            <SidebarAccordion
              id="badges"
              title="Trust Badges Section"
              isOpen={isSectionOpen('badges')}
              onToggle={() => toggleSection('badges')}
              icon={<Type size={14} />}
            >
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase select-none">Storefront Trust Badges</span>
                
                {/* Badge 1 */}
                <div className="bg-white dark:bg-black/25 p-3 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col gap-3">
                  <span className="text-[9px] font-bold text-terracotta uppercase">Trust Column 1</span>
                  <SettingInput
                    id="badge1Title"
                    label="Badge Title"
                    value={siteConfig.badge1Title || ''}
                    onChange={(val) => handleFieldChange('badge1Title', val)}
                    placeholder="Certified Organic"
                  />
                  <SettingInput
                    id="badge1Text"
                    label="Badge Description"
                    value={siteConfig.badge1Text || ''}
                    onChange={(val) => handleFieldChange('badge1Text', val)}
                    placeholder="Pediatric-approved soft cotton..."
                  />
                </div>

                {/* Badge 2 */}
                <div className="bg-white dark:bg-black/25 p-3 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col gap-3">
                  <span className="text-[9px] font-bold text-terracotta uppercase">Trust Column 2</span>
                  <SettingInput
                    id="badge2Title"
                    label="Badge Title"
                    value={siteConfig.badge2Title || ''}
                    onChange={(val) => handleFieldChange('badge2Title', val)}
                    placeholder="Healthy Hips Certification"
                  />
                  <SettingInput
                    id="badge2Text"
                    label="Badge Description"
                    value={siteConfig.badge2Text || ''}
                    onChange={(val) => handleFieldChange('badge2Text', val)}
                    placeholder="Provides anatomical knee-to-knee M support"
                  />
                </div>

                {/* Badge 3 */}
                <div className="bg-white dark:bg-black/25 p-3 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col gap-3">
                  <span className="text-[9px] font-bold text-terracotta uppercase">Trust Column 3</span>
                  <SettingInput
                    id="badge3Title"
                    label="Badge Title"
                    value={siteConfig.badge3Title || ''}
                    onChange={(val) => handleFieldChange('badge3Title', val)}
                    placeholder="Free Shipping"
                  />
                  <SettingInput
                    id="badge3Text"
                    label="Badge Description"
                    value={siteConfig.badge3Text || ''}
                    onChange={(val) => handleFieldChange('badge3Text', val)}
                    placeholder="Quick carbon-neutral packaging..."
                  />
                </div>
              </div>
            </SidebarAccordion>
          )}

          {/* SECTION: COLLECTIONS */}
          {filteredSections.some(s => s.id === 'categories') && (
            <SidebarAccordion
              id="categories"
              title="Collections"
              isOpen={isSectionOpen('categories')}
              onToggle={() => toggleSection('categories')}
              icon={<Grid size={14} />}
            >
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase select-none">Shop Categories & Slug Routing</span>
                
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto shopify-customizer-scrollbar pr-1">
                  {(siteConfig.categories || []).map((cat: any, index: number) => (
                    <div key={`cust-cat-${cat.id || index}-${index}`} className="flex gap-2 items-center bg-white dark:bg-black/25 p-3 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm">
                      <div className="flex-1 flex flex-col gap-1.5 text-left">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Collection Name</label>
                        <input 
                          type="text" 
                          value={cat.name} 
                          onChange={(e) => handleNestedFieldChange('categories', index, 'name', e.target.value)}
                          placeholder="Category Title"
                          className="border border-[#C9CCCF] dark:border-gray-800 rounded-lg p-2 text-xs outline-none bg-white dark:bg-black font-bold text-gray-800 dark:text-gray-200"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col gap-1.5 text-left">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Slug Target ID</label>
                        <input 
                          type="text" 
                          value={cat.id} 
                          disabled={cat.id === 'all'}
                          onChange={(e) => handleNestedFieldChange('categories', index, 'id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                          placeholder="id-slug"
                          className="border border-[#C9CCCF] dark:border-gray-800 rounded-lg p-2 text-xs outline-none bg-white dark:bg-black font-mono text-gray-500 disabled:opacity-50"
                        />
                      </div>

                      {cat.id !== 'all' && cat.id !== 'carriers' && (
                        <button 
                          onClick={() => handleRemoveListItem('categories', index)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer shrink-0 mt-4"
                          title="Delete Collection"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddListItem('categories', { id: `collection-${Date.now().toString().slice(-4)}`, name: 'Custom Collection' })}
                  className="w-full py-2 border border-dashed border-[#008060]/50 text-[#008060] rounded-xl text-xs font-bold hover:bg-[#008060]/5 flex items-center justify-center gap-1 transition-colors cursor-pointer mt-1"
                >
                  <Plus size={14} /> Add New Collection
                </button>
              </div>
            </SidebarAccordion>
          )}

          {/* SECTION: STANDALONE PAGES */}
          {filteredSections.some(s => s.id === 'pages') && (
            <SidebarAccordion
              id="pages"
              title="standalone custom pages"
              isOpen={isSectionOpen('pages')}
              onToggle={() => toggleSection('pages')}
              icon={<BookOpen size={14} />}
            >
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase select-none">Manage Info & Sizing Pages</span>
                
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto shopify-customizer-scrollbar pr-1">
                  {(siteConfig.pages || []).map((page: any, index: number) => (
                    <div key={`cust-page-${page.id || index}-${index}`} className="border border-[#E1E3E5] dark:border-gray-800 rounded-xl p-3.5 bg-white dark:bg-black/25 flex flex-col gap-3 shadow-sm text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#008060]">Page: {page.title}</span>
                        <button 
                          onClick={() => handleRemoveListItem('pages', index)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                          title="Delete page"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <SettingInput
                        id={`page-title-${page.id}`}
                        label="Page Title"
                        value={page.title}
                        onChange={(val) => handleNestedFieldChange('pages', index, 'title', val)}
                        placeholder="e.g. Sizing Guide"
                      />

                      <SettingInput
                        id={`page-slug-${page.id}`}
                        label="Page Slug"
                        value={page.slug}
                        onChange={(val) => handleNestedFieldChange('pages', index, 'slug', val.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        placeholder="e.g. sizing-guide"
                      />

                      <WysiwygEditor
                        value={page.body || ''}
                        onChange={(html) => handleNestedFieldChange('pages', index, 'body', html)}
                        label="Page Rich Text Content"
                        placeholder="Describe page terms, sizes..."
                      />

                      <button
                        type="button"
                        onClick={() => {
                          onChangePageSlug(page.slug);
                          onChangePreviewView('page');
                        }}
                        className="self-start text-[10px] text-[#008060] font-bold hover:underline flex items-center gap-1 cursor-pointer mt-1 bg-green-50 dark:bg-black p-2 rounded-lg"
                      >
                        <Eye size={12} /> View Page in Preview
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddListItem('pages', { 
                    id: String(Date.now()), 
                    title: 'New Organic Page', 
                    slug: 'new-organic-page', 
                    body: '<p>Edit content inside the rich text editor.</p>',
                    isPublished: true, 
                    createdAt: new Date().toISOString().split('T')[0] 
                  })}
                  className="w-full py-2 border border-dashed border-[#008060]/50 text-[#008060] rounded-xl text-xs font-bold hover:bg-[#008060]/5 flex items-center justify-center gap-1 transition-colors cursor-pointer mt-1"
                >
                  <Plus size={14} /> Add Info Page
                </button>
              </div>
            </SidebarAccordion>
          )}

          {/* SECTION: PRODUCTS & PRICING */}
          {filteredSections.some(s => s.id === 'products') && (
            <SidebarAccordion
              id="products"
              title="Products & Pricing"
              isOpen={isSectionOpen('products')}
              onToggle={() => toggleSection('products')}
              icon={<ShoppingBag size={14} />}
            >
              <SidebarTabs
                activeTab={productsTab}
                onChangeTab={setProductsTab}
                tabs={[
                  { id: 'price', label: 'Price & MSRP' },
                  { id: 'details', label: 'Item Details' },
                ]}
              />

              <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto shopify-customizer-scrollbar pr-1">
                {(siteConfig.products || []).map((prod: Product, index: number) => (
                  <div key={`cust-prod-${prod.id || index}-${index}`} className="border border-gray-150 dark:border-gray-800 rounded-xl p-3.5 bg-white dark:bg-black/25 flex flex-col gap-3.5 shadow-sm">
                    <div className="flex justify-between items-center text-left">
                      <span className="text-xs font-bold truncate max-w-[170px] text-gray-800 dark:text-gray-200">{prod.title}</span>
                      <button
                        onClick={() => setEditingProductIndex(editingProductIndex === index ? null : index)}
                        className="text-[10px] font-bold text-[#008060] hover:underline cursor-pointer bg-green-50 dark:bg-black/40 px-2 py-1 rounded"
                      >
                        {editingProductIndex === index ? 'Collapse' : 'Configure specs'}
                      </button>
                    </div>

                    {productsTab === 'price' ? (
                      <div className="grid grid-cols-2 gap-3.5">
                        <SettingInput
                          id={`prod-price-${prod.id}`}
                          label="Sale Price (£)"
                          value={prod.price}
                          type="number"
                          step="0.01"
                          prefix="£"
                          onChange={(val) => handleNestedFieldChange('products', index, 'price', val)}
                        />
                        <SettingInput
                          id={`prod-orig-price-${prod.id}`}
                          label="Original Price (£)"
                          value={prod.originalPrice || ''}
                          type="number"
                          step="0.01"
                          prefix="£"
                          placeholder="MSRP"
                          onChange={(val) => handleNestedFieldChange('products', index, 'originalPrice', val || undefined)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <SettingInput
                          id={`prod-title-${prod.id}`}
                          label="Title Name"
                          value={prod.title}
                          onChange={(val) => handleNestedFieldChange('products', index, 'title', val)}
                        />
                        <SettingInput
                          id={`prod-tagline-${prod.id}`}
                          label="Brief tagline description"
                          value={prod.tagline}
                          onChange={(val) => handleNestedFieldChange('products', index, 'tagline', val)}
                        />
                        <ImageUploader
                          id={`prod-image-${prod.id}`}
                          label="Product Listing Thumbnail"
                          imageUrl={prod.image || ''}
                          onUrlChange={(url) => handleNestedFieldChange('products', index, 'image', url)}
                          onFileUpload={(file) => handleFileUpload(file, 'products', index)}
                          isUploading={uploadingField === `products-${index}`}
                        />
                      </div>
                    )}

                    {editingProductIndex === index && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-3.5 mt-2.5 pt-3.5 border-t border-gray-150 dark:border-gray-800 text-left"
                      >
                        <SettingInput
                          id={`prod-badge-${prod.id}`}
                          label="Reviews / Promo Badge tag"
                          value={prod.badge || ''}
                          onChange={(val) => handleNestedFieldChange('products', index, 'badge', val || undefined)}
                          placeholder="e.g. Pediatrician Approved"
                        />
                        <SettingInput
                          id={`prod-buyurl-${prod.id}`}
                          label="Affiliate / Merchant Checkout Buy URL"
                          value={prod.buyUrl || ''}
                          onChange={(val) => handleNestedFieldChange('products', index, 'buyUrl', val)}
                          placeholder="https://amazon.co.uk/..."
                        />
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </SidebarAccordion>
          )}

          {/* SECTION: CHECKOUT REDIRECTION */}
          {filteredSections.some(s => s.id === 'checkout-redirection') && (
            <SidebarAccordion
              id="checkout-redirection"
              title="Checkout Redirection"
              isOpen={isSectionOpen('checkout-redirection')}
              onToggle={() => toggleSection('checkout-redirection')}
              icon={<FileText size={14} />}
            >
              <SidebarTabs
                activeTab={checkoutTab}
                onChangeTab={setCheckoutTab}
                tabs={[
                  { id: 'amazon', label: 'Amazon' },
                  { id: 'walmart', label: 'Walmart' },
                ]}
              />

              {checkoutTab === 'amazon' ? (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <CustomSwitch
                    id="enableAmazonCheckout"
                    label="Enable Amazon Fast Checkout"
                    checked={siteConfig.enableAmazonCheckout !== false}
                    onChange={(checked) => handleFieldChange('enableAmazonCheckout', checked)}
                    description="Renders direct checkout button inside active baby shopping carts."
                  />

                  <SettingInput
                    id="amazonCheckoutText"
                    label="Amazon CTA text label"
                    value={siteConfig.amazonCheckoutText ?? 'Checkout using Amazon'}
                    onChange={(val) => handleFieldChange('amazonCheckoutText', val)}
                    placeholder="Checkout using Amazon"
                    helpText="Shows on orange Amazon integration button."
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <CustomSwitch
                    id="enableWalmartCheckout"
                    label="Enable Walmart Fast Checkout"
                    checked={siteConfig.enableWalmartCheckout !== false}
                    onChange={(checked) => handleFieldChange('enableWalmartCheckout', checked)}
                    description="Directs shopping cart fast items to Wal-mart global checkout portals."
                  />

                  <SettingInput
                    id="walmartCheckoutText"
                    label="Walmart CTA text label"
                    value={siteConfig.walmartCheckoutText ?? 'Checkout using Wal-Mart'}
                    onChange={(val) => handleFieldChange('walmartCheckoutText', val)}
                    placeholder="Checkout using Wal-Mart"
                    helpText="Shows on Walmart blue integration button."
                  />
                </div>
              )}
            </SidebarAccordion>
          )}

        </Accordion.Root>
      </div>

      {/* 4. STATIC FOOTER ACTIONS CONTROLS */}
      <div className="p-4 bg-white dark:bg-[#1C1C1E] border-t border-[#E1E3E5] dark:border-gray-800 flex flex-col gap-2 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] z-10">
        <button
          onClick={onSave}
          className="w-full bg-[#008060] hover:bg-[#006e52] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#008060]/10 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Save size={14} />
          <span>Save Changes Live</span>
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onReset}
            className="border border-[#C9CCCF] dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
            title="Reset theme config"
          >
            <RotateCcw size={12} />
            <span>Reset Defaults</span>
          </button>
          
          {isMobile ? (
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="bg-charcoal dark:bg-gray-800 hover:opacity-90 text-white py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer active:scale-98"
            >
              <span>Minimize Panel</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-charcoal dark:bg-gray-800 hover:opacity-90 text-white py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer active:scale-98"
            >
              <span>Close Editor</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Responsive Drawer/Sidebar render conditions
  if (isMobile) {
    return (
      <>
        {/* Floating Toggle Launch Button */}
        <div className="fixed bottom-6 left-6 z-[999]">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-[#008060] hover:bg-[#006e52] text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
          >
            <Sliders size={14} className="animate-pulse" />
            <span>Show Shopify Editor Panel</span>
          </button>
        </div>

        {/* Slide-over Drawer Portal */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              {/* Dark Backing overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
              />

              {/* Sidebar Content Panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed top-0 left-0 bottom-0 w-[340px] max-w-[85vw] h-full z-[99999] shadow-2xl flex flex-col overflow-hidden"
              >
                {SidebarContentMarkup}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop Static Sidebar
  return (
    <div className="w-full h-full border-r border-[#E1E3E5] dark:border-gray-800 shadow-lg flex flex-col overflow-hidden">
      {SidebarContentMarkup}
    </div>
  );
}
