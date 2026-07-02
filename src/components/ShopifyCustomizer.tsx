import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Monitor, 
  Smartphone, 
  Tablet as TabletIcon, 
  ChevronDown, 
  ChevronUp, 
  Layout, 
  Type, 
  Grid, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  BookOpen, 
  FileText, 
  Settings,
  DollarSign,
  Palette,
  Eye,
  Menu,
  HelpCircle
} from 'lucide-react';
import { ActiveView, Product, CustomPage } from '../types';
import WysiwygEditor from './WysiwygEditor';

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
  const [openSection, setOpenSection] = useState<string | null>('hero');
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);

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

  // Preset images recommended for baby slings / carriers
  const PRESET_IMAGES = [
    {
      name: 'Signature Linen Cream',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjUGZLXpNyFq8eljDX0MSFwUqLu0nP9QxWQhGuXEjeKOCi36I__npWPkI5my2jneyHJpmFJ0TP6-eg7Qt0Gq7VMb-Cet5YDlJSGVe0Ysx42YRQjOVvrJqqq4niUBZsgAEOM7pDESTwufwBXAM_ukbWo78H5o4lJrMeS2fJSYN9xNCcU5L47rf2w7uydTUMyhi-RiaXM-UbM2bbECDLCP18_2r3D5rbhxJFEnDtKqOYoCJoUq1LohewJ-1TbT91-zK9s1VpWDxtzmo',
    },
    {
      name: 'Earthy Sage Green',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAO7QnYkRNpbxSypcRESvTyvVK4rFPqh9BT3mC3WChvyHSPlYNY0lqGM9hw-G9WktZRmzqyViVoDKW_NDs7rripCZrfhMsUzaEbXYTgyiThPnW3oL-M5hCS3Inj5VCJNOYRjmDFOw2HAhQXmLUzql1TfhQVuL8qjKc467NBrfEqwrJ6SAXPWvvP6DT3pNSO6f5JInnzJTnjH6CW3e7hBzEhP08J8-wPRoIR4kkQZa_WhFFYs52ReUzoSPoFcuYWn3sneqwG-dRo8BE',
    },
    {
      name: 'Oatmeal Tweed Carrier',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWWBd9xbi8sJ5zXUsdnBU50R5cZsKdjtPfYS8XGrhpvAlmIfe_54yIAXb7Z1Lg2sLgJvhv4P38lIKKowcVNm6PB_mbbD8PW4V5mPO8GC9dZLW4QkTy3byFsWKrcDB1nRtSM88KtVaN7kY1bllFvNB-QpE7b4WhlH-iB_hVwPQZTMkr2pMcrNUaUZ2b8_Vvfw5tEtq4PYrh6gx65y1gkj_nZEafninbKvKgG2cimlRhCLhfj5Aos55aT37UpVCJ-cCuGVuCYzBZRSM',
    },
    {
      name: 'Supportive Bonding',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2Piw4J1xyoTlo5PGRSLjIISiFjyiPgMDlCYZn_jWcfZfK4mjePiBtpaOlkUdVfFc2CL3Jk66_BDlQQARD9aBAorecrOG_Q_kRZ1LFZFmrLdIw1YkOnGkS05K6PEJakq1rPQExw_6GbIH_ckRcEU0OyoDRTRHU6HYq7jiK4aR-b79qEgiWph_gECwsAsaLNc9ljjOGevOxt78Ds34LFBNSnDT6wop79rqU0QB28I72tqUOO_9dJuIWJbL1s9TkdX8M4pWH7l0eOGI',
    }
  ];

  return (
    <div className="w-full h-full bg-[#F6F6F7] border-r border-[#E1E3E5] flex flex-col font-sans text-charcoal shadow-lg">
      
      {/* Customizer Top Header */}
      <div className="p-4 bg-white border-b border-[#E1E3E5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#008060] flex items-center justify-center text-white font-bold text-sm">S</div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-[#121212]">Theme Customizer</h1>
            <p className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
              Live Store Editor
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
          title="Exit Live Customizer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Control Strip (View selection & Device switches) */}
      <div className="p-3 bg-white border-b border-[#E1E3E5] flex flex-wrap gap-2 items-center justify-between">
        
        {/* Dynamic Page Target selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Page:</span>
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
            className="border border-[#C9CCCF] rounded bg-white text-xs px-2 py-1 outline-none font-semibold text-charcoal/90 hover:border-gray-400 transition-all cursor-pointer"
          >
            <option value="home">Home Page (Story)</option>
            <option value="shop">Shop Collections</option>
            <option value="detail">Product Detail Page</option>
            <optgroup label="Custom Pages">
              {(siteConfig.pages || []).map((p: any) => (
                <option key={p.id} value={`page:${p.slug}`}>{p.title}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Device Viewport Selector */}
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
          <button
            onClick={() => onChangePreviewDevice('desktop')}
            className={`p-1 rounded transition-all ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-[#008060]' : 'text-gray-500 hover:text-gray-900'}`}
            title="Desktop View"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => onChangePreviewDevice('tablet')}
            className={`p-1 rounded transition-all ${previewDevice === 'tablet' ? 'bg-white shadow-sm text-[#008060]' : 'text-gray-500 hover:text-gray-900'}`}
            title="Tablet View"
          >
            <TabletIcon size={14} />
          </button>
          <button
            onClick={() => onChangePreviewDevice('mobile')}
            className={`p-1 rounded transition-all ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-[#008060]' : 'text-gray-500 hover:text-gray-900'}`}
            title="Mobile View"
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>

      {/* Accordion List with Scrollbar */}
      <div className="flex-1 overflow-y-auto shopify-customizer-scrollbar p-4 flex flex-col gap-3">
        
        {/* SECTION: Site Presets & Aesthetics */}
        <div className="border border-[#E1E3E5] bg-white rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('aesthetics')}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-sans font-bold text-xs uppercase tracking-wider text-charcoal hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette size={14} className="text-[#008060]" />
              <span>Theme Presets & Brand Colors</span>
            </div>
            {openSection === 'aesthetics' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {openSection === 'aesthetics' && (
            <div className="p-4 border-t border-[#E1E3E5] flex flex-col gap-3 text-left">
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                Quickly adjust the global theme layout aesthetic:
              </p>
              
              {/* Theme Selector presets */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    // Update global styling colors if desired, or set preset flag
                    alert('Theme Preset "Linen Comfort" active! Generates elegant soft warm tones on background.');
                  }}
                  className="p-2.5 border border-amber-200 bg-[#FCFAF7] hover:border-amber-400 rounded-lg text-left transition-all active:scale-95"
                >
                  <span className="block font-bold text-xs text-[#121212]">Linen Comfort</span>
                  <span className="text-[9px] text-gray-500 block">Soft Oatmeal & Cream</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    alert('Theme Preset "Sage Meadow" active! Introduces calming organic sage green accents.');
                  }}
                  className="p-2.5 border border-gray-200 bg-white hover:border-[#008060]/40 rounded-lg text-left transition-all active:scale-95"
                >
                  <span className="block font-bold text-xs text-[#121212]">Sage Meadow</span>
                  <span className="text-[9px] text-gray-500 block">Fresh Herbaceous Tones</span>
                </button>
              </div>

              {/* Theme Font indicators */}
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Primary Serif Display Font</span>
                <div className="p-2 bg-gray-50 rounded-lg font-serif text-sm font-bold border border-gray-100">
                  Literata (Elegance & Storytelling)
                </div>
              </div>
              
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Primary Sans Body Font</span>
                <div className="p-2 bg-gray-50 rounded-lg font-sans text-xs font-semibold border border-gray-100">
                  Plus Jakarta Sans (Crisp Readability)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION: Top Navigation Header */}
        <div className="border border-[#E1E3E5] bg-white rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('navigation')}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-sans font-bold text-xs uppercase tracking-wider text-charcoal hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Menu size={14} className="text-[#008060]" />
              <span>Header Menu Navigation</span>
            </div>
            {openSection === 'navigation' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {openSection === 'navigation' && (
            <div className="p-4 border-t border-[#E1E3E5] flex flex-col gap-3 text-left">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Top Menu Links</span>
              
              <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto shopify-customizer-scrollbar pr-1.5">
                {(siteConfig.navigation || []).map((navItem: any, index: number) => (
                  <div key={index} className="flex gap-1.5 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <input 
                      type="text" 
                      value={navItem.label} 
                      onChange={(e) => handleNestedFieldChange('navigation', index, 'label', e.target.value)}
                      placeholder="Menu Label"
                      className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white font-bold w-1/2 focus:border-[#008060] transition-colors"
                    />
                    <select 
                      value={navItem.target}
                      onChange={(e) => handleNestedFieldChange('navigation', index, 'target', e.target.value)}
                      className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs bg-white outline-none w-5/12 text-gray-600 focus:border-[#008060] transition-colors"
                    >
                      <option value="home">Home</option>
                      <option value="shop">Shop All</option>
                      <option value="detail">Signature</option>
                      {(siteConfig.pages || []).map((page: any) => (
                        <option key={page.id} value={`page:${page.slug}`}>Page: {page.title}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleRemoveListItem('navigation', index)}
                      className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                      title="Delete link"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAddListItem('navigation', { label: 'New Link', target: 'shop' })}
                className="w-full py-1.5 mt-1 border border-dashed border-[#008060]/50 text-[#008060] rounded-lg text-xs font-bold hover:bg-green-50/50 flex items-center justify-center gap-1 transition-colors"
              >
                <Plus size={14} /> Add Menu Link
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Hero Banner Home */}
        <div id="customizer-section-hero" className="border border-[#E1E3E5] bg-white rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('hero')}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-sans font-bold text-xs uppercase tracking-wider text-charcoal hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layout size={14} className="text-[#008060]" />
              <span>Hero Banner Section</span>
            </div>
            {openSection === 'hero' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {openSection === 'hero' && (
            <div className="p-4 border-t border-[#E1E3E5] flex flex-col gap-3 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Hero Tagline</label>
                <input 
                  type="text" 
                  value={siteConfig.heroTagline || ''} 
                  onChange={(e) => handleFieldChange('heroTagline', e.target.value)}
                  className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Hero Main Title (HTML Supported)</label>
                <textarea 
                  rows={2}
                  value={siteConfig.heroTitle || ''} 
                  onChange={(e) => handleFieldChange('heroTitle', e.target.value)}
                  className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white font-serif font-bold leading-tight"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Hero Subtitle</label>
                <textarea 
                  rows={3}
                  value={siteConfig.heroSubtitle || ''} 
                  onChange={(e) => handleFieldChange('heroSubtitle', e.target.value)}
                  className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white text-gray-600 font-sans leading-relaxed text-left resize-none"
                />
              </div>

              {/* Hero Image Selector URL */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Hero Image URL</label>
                <input 
                  type="text" 
                  value={siteConfig.heroImage || ''} 
                  onChange={(e) => handleFieldChange('heroImage', e.target.value)}
                  className="border border-[#C9CCCF] rounded-lg p-2 text-xs outline-none bg-white text-gray-600 font-mono"
                />
              </div>

              {/* Preset Hero images recommended gallery */}
              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Or Select Premium Presets:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleFieldChange('heroImage', img.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        siteConfig.heroImage === img.url ? 'border-[#008060] scale-95 shadow-md' : 'border-transparent hover:border-gray-300'
                      }`}
                      title={img.name}
                    >
                      <img src={img.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary button settings */}
              <div className="border-t border-gray-100 pt-3 mt-1 grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Primary CTA Text</label>
                  <input 
                    type="text" 
                    value={siteConfig.heroCta1Text || ''} 
                    onChange={(e) => handleFieldChange('heroCta1Text', e.target.value)}
                    className="border border-[#C9CCCF] rounded-lg p-1.5 text-[11px] outline-none bg-white font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">CTA 1 Target</label>
                  <select 
                    value={siteConfig.heroCta1Link || 'shop'} 
                    onChange={(e) => handleFieldChange('heroCta1Link', e.target.value)}
                    className="border border-[#C9CCCF] rounded-lg p-1.5 text-[11px] bg-white outline-none font-semibold text-gray-600"
                  >
                    <option value="home">Home</option>
                    <option value="shop">Shop All</option>
                    <option value="detail">Signature</option>
                  </select>
                </div>
              </div>

              {/* Secondary button settings */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Secondary CTA Text</label>
                  <input 
                    type="text" 
                    value={siteConfig.heroCta2Text || ''} 
                    onChange={(e) => handleFieldChange('heroCta2Text', e.target.value)}
                    className="border border-[#C9CCCF] rounded-lg p-1.5 text-[11px] outline-none bg-white font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">CTA 2 Target</label>
                  <select 
                    value={siteConfig.heroCta2Link || 'detail'} 
                    onChange={(e) => handleFieldChange('heroCta2Link', e.target.value)}
                    className="border border-[#C9CCCF] rounded-lg p-1.5 text-[11px] bg-white outline-none font-semibold text-gray-600"
                  >
                    <option value="home">Home</option>
                    <option value="shop">Shop All</option>
                    <option value="detail">Signature</option>
                  </select>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION: Trust badges columns */}
        <div id="customizer-section-badges" className="border border-[#E1E3E5] bg-white rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('badges')}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-sans font-bold text-xs uppercase tracking-wider text-charcoal hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Type size={14} className="text-[#008060]" />
              <span>Trust Badges Section</span>
            </div>
            {openSection === 'badges' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {openSection === 'badges' && (
            <div className="p-4 border-t border-[#E1E3E5] flex flex-col gap-4 text-left">
              {/* Badge 1 */}
              <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
                <span className="text-[9px] font-bold text-terracotta uppercase">Column Badge 1</span>
                <input 
                  type="text" 
                  value={siteConfig.badge1Title || ''} 
                  onChange={(e) => handleFieldChange('badge1Title', e.target.value)}
                  className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white font-bold focus:border-[#008060] transition-colors"
                  placeholder="Badge Title"
                />
                <input 
                  type="text" 
                  value={siteConfig.badge1Text || ''} 
                  onChange={(e) => handleFieldChange('badge1Text', e.target.value)}
                  className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white text-gray-600 focus:border-[#008060] transition-colors"
                  placeholder="Badge Subtext Description"
                />
              </div>

              {/* Badge 2 */}
              <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
                <span className="text-[9px] font-bold text-terracotta uppercase">Column Badge 2</span>
                <input 
                  type="text" 
                  value={siteConfig.badge2Title || ''} 
                  onChange={(e) => handleFieldChange('badge2Title', e.target.value)}
                  className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white font-bold focus:border-[#008060] transition-colors"
                  placeholder="Badge Title"
                />
                <input 
                  type="text" 
                  value={siteConfig.badge2Text || ''} 
                  onChange={(e) => handleFieldChange('badge2Text', e.target.value)}
                  className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white text-gray-600 focus:border-[#008060] transition-colors"
                  placeholder="Badge Subtext Description"
                />
              </div>

              {/* Badge 3 */}
              <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
                <span className="text-[9px] font-bold text-terracotta uppercase">Column Badge 3</span>
                <input 
                  type="text" 
                  value={siteConfig.badge3Title || ''} 
                  onChange={(e) => handleFieldChange('badge3Title', e.target.value)}
                  className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white font-bold focus:border-[#008060] transition-colors"
                  placeholder="Badge Title"
                />
                <input 
                  type="text" 
                  value={siteConfig.badge3Text || ''} 
                  onChange={(e) => handleFieldChange('badge3Text', e.target.value)}
                  className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white text-gray-600 focus:border-[#008060] transition-colors"
                  placeholder="Badge Subtext Description"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION: Curated collections & Shop Categories */}
        <div className="border border-[#E1E3E5] bg-white rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-sans font-bold text-xs uppercase tracking-wider text-charcoal hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Grid size={14} className="text-[#008060]" />
              <span>Shop Collections & ID Routing</span>
            </div>
            {openSection === 'categories' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {openSection === 'categories' && (
            <div className="p-4 border-t border-[#E1E3E5] flex flex-col gap-3 text-left">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Manage Collection Categories</span>
              
              <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto shopify-customizer-scrollbar pr-1.5">
                {(siteConfig.categories || []).map((cat: any, index: number) => (
                  <div key={cat.id} className="flex gap-1.5 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <input 
                      type="text" 
                      value={cat.name} 
                      onChange={(e) => handleNestedFieldChange('categories', index, 'name', e.target.value)}
                      placeholder="Category Title"
                      className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white font-bold w-1/2 focus:border-[#008060] transition-colors"
                    />
                    <input 
                      type="text" 
                      value={cat.id} 
                      disabled={cat.id === 'all'}
                      onChange={(e) => handleNestedFieldChange('categories', index, 'id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="id-slug"
                      className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white text-gray-500 font-mono w-5/12 disabled:bg-gray-100 disabled:cursor-not-allowed focus:border-[#008060] transition-colors"
                    />
                    {cat.id !== 'all' && cat.id !== 'carriers' && (
                      <button 
                        onClick={() => handleRemoveListItem('categories', index)}
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                        title="Delete Collection"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAddListItem('categories', { id: `new-collection-${Date.now().toString().slice(-4)}`, name: 'New Collection' })}
                className="w-full py-1.5 border border-dashed border-[#008060]/50 text-[#008060] rounded-lg text-xs font-bold hover:bg-green-50/50 flex items-center justify-center gap-1 transition-colors"
              >
                <Plus size={14} /> Add New Collection
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Custom Informational Pages Builder */}
        <div className="border border-[#E1E3E5] bg-white rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('pages')}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-sans font-bold text-xs uppercase tracking-wider text-charcoal hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-[#008060]" />
              <span>Custom Pages (Sizing, About, Policies)</span>
            </div>
            {openSection === 'pages' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {openSection === 'pages' && (
            <div className="p-4 border-t border-[#E1E3E5] flex flex-col gap-3 text-left">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Manage Standalone Pages</span>
              
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto shopify-customizer-scrollbar pr-1.5">
                {(siteConfig.pages || []).map((page: any, index: number) => (
                  <div key={page.id} className="border border-gray-150 rounded-xl p-3 bg-gray-50/50 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#008060]">Page: {page.title}</span>
                      <button 
                        onClick={() => handleRemoveListItem('pages', index)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                        title="Delete page"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400">Page Title</span>
                      <input 
                        type="text" 
                        value={page.title} 
                        onChange={(e) => handleNestedFieldChange('pages', index, 'title', e.target.value)}
                        className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white font-semibold focus:border-[#008060] transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400">Slug URL path</span>
                      <input 
                        type="text" 
                        value={page.slug} 
                        onChange={(e) => handleNestedFieldChange('pages', index, 'slug', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white font-mono text-gray-500 focus:border-[#008060] transition-colors"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onChangePageSlug(page.slug);
                        onChangePreviewView('page');
                        alert(`Viewing custom page "${page.title}" in live preview pane! Edit its text in Shopify Admin view if you desire full WYSIWYG editor.`);
                      }}
                      className="self-start text-[10px] text-[#008060] font-bold hover:underline flex items-center gap-1 cursor-pointer mt-1"
                    >
                      <Eye size={12} /> View Page
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleAddListItem('pages', { 
                  id: String(Date.now()), 
                  title: 'New Policy Page', 
                  slug: 'new-policy', 
                  body: '<p>Edit content inside the rich text editor.</p>',
                  isPublished: true, 
                  createdAt: new Date().toISOString().split('T')[0] 
                })}
                className="w-full py-1.5 border border-dashed border-[#008060]/50 text-[#008060] rounded-lg text-xs font-bold hover:bg-green-50/50 flex items-center justify-center gap-1 transition-colors"
              >
                <Plus size={14} /> Add Info Page
              </button>
            </div>
          )}
        </div>

        {/* SECTION: Products & Pricing Engine */}
        <div className="border border-[#E1E3E5] bg-white rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('products')}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-sans font-bold text-xs uppercase tracking-wider text-charcoal hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-[#008060]" />
              <span>Products & Dynamic Pricing</span>
            </div>
            {openSection === 'products' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {openSection === 'products' && (
            <div className="p-4 border-t border-[#E1E3E5] flex flex-col gap-3 text-left">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Quick Price & Details Customizer</span>
              
              <div className="flex flex-col gap-2.5 max-h-[480px] overflow-y-auto shopify-customizer-scrollbar pr-3">
                {(siteConfig.products || []).map((prod: Product, index: number) => (
                  <div key={prod.id} className="border border-gray-150 rounded-xl p-3 bg-gray-50/55 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold truncate max-w-[150px]">{prod.title}</span>
                      <button
                        onClick={() => setEditingProductIndex(editingProductIndex === index ? null : index)}
                        className="text-[10px] font-bold text-[#008060] hover:underline cursor-pointer"
                      >
                        {editingProductIndex === index ? 'Hide Specs' : 'Edit Specs'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-gray-400">Sale Price (£)</span>
                        <div className="relative">
                          <DollarSign size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="number" 
                            step="0.01"
                            value={prod.price} 
                            onChange={(e) => handleNestedFieldChange('products', index, 'price', parseFloat(e.target.value) || 0)}
                            className="border border-[#C9CCCF] rounded pl-5 pr-2 py-1.5 text-xs outline-none bg-white font-bold w-full focus:border-[#008060] transition-colors"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-gray-400">Original Price (£)</span>
                        <div className="relative">
                          <DollarSign size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="number" 
                            step="0.01"
                            value={prod.originalPrice || ''} 
                            onChange={(e) => handleNestedFieldChange('products', index, 'originalPrice', parseFloat(e.target.value) || undefined)}
                            className="border border-[#C9CCCF] rounded pl-5 pr-2 py-1.5 text-xs outline-none bg-white text-gray-500 w-full focus:border-[#008060] transition-colors"
                            placeholder="MSRP"
                          />
                        </div>
                      </div>
                    </div>

                    {editingProductIndex === index && (
                      <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-gray-200/50">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold text-gray-400">Product Title</span>
                          <input 
                            type="text" 
                            value={prod.title} 
                            onChange={(e) => handleNestedFieldChange('products', index, 'title', e.target.value)}
                            className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white focus:border-[#008060] transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold text-gray-400">Product Tagline</span>
                          <input 
                            type="text" 
                            value={prod.tagline} 
                            onChange={(e) => handleNestedFieldChange('products', index, 'tagline', e.target.value)}
                            className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white text-gray-600 focus:border-[#008060] transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold text-gray-400">Featured Image URL</span>
                          <input 
                            type="text" 
                            value={prod.image} 
                            onChange={(e) => handleNestedFieldChange('products', index, 'image', e.target.value)}
                            className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white font-mono text-gray-500 focus:border-[#008060] transition-colors"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold text-gray-400">Reviews Badge</span>
                            <input 
                              type="text" 
                              value={prod.badge || ''} 
                              onChange={(e) => handleNestedFieldChange('products', index, 'badge', e.target.value || undefined)}
                              className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white focus:border-[#008060] transition-colors"
                              placeholder="e.g. Best Seller"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold text-gray-400">Affiliate Buy Link</span>
                            <input 
                              type="text" 
                              value={prod.buyUrl || ''} 
                              onChange={(e) => handleNestedFieldChange('products', index, 'buyUrl', e.target.value)}
                              className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white font-mono focus:border-[#008060] transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION: Checkout Redirection Options */}
        <div className="border border-[#E1E3E5] bg-white rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection('checkout-redirection')}
            className="w-full px-4 py-3 flex items-center justify-between text-left font-sans font-bold text-xs uppercase tracking-wider text-charcoal hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-[#008060]" />
              <span>Checkout Redirection Options</span>
            </div>
            {openSection === 'checkout-redirection' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {openSection === 'checkout-redirection' && (
            <div className="p-4 border-t border-[#E1E3E5] flex flex-col gap-4 text-left">
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                Customize Amazon and Walmart fast-checkout buttons for live cart routing.
              </p>

              {/* Amazon Checkout Settings */}
              <div className="bg-gray-50/60 p-3 rounded-lg border border-gray-150 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-700 uppercase">Amazon Redirection</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={siteConfig.enableAmazonCheckout !== false}
                      onChange={(e) => handleFieldChange('enableAmazonCheckout', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#008060]"></div>
                  </label>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-400">Amazon Button Text</span>
                  <input 
                    type="text" 
                    value={siteConfig.amazonCheckoutText ?? 'Checkout using Amazon'} 
                    onChange={(e) => handleFieldChange('amazonCheckoutText', e.target.value)}
                    disabled={siteConfig.enableAmazonCheckout === false}
                    className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed focus:border-[#008060] transition-colors"
                  />
                </div>
              </div>

              {/* Walmart Checkout Settings */}
              <div className="bg-gray-50/60 p-3 rounded-lg border border-gray-150 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-700 uppercase">Walmart Redirection</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={siteConfig.enableWalmartCheckout !== false}
                      onChange={(e) => handleFieldChange('enableWalmartCheckout', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#008060]"></div>
                  </label>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-gray-400">Walmart Button Text</span>
                  <input 
                    type="text" 
                    value={siteConfig.walmartCheckoutText ?? 'Checkout using Wal-Mart'} 
                    onChange={(e) => handleFieldChange('walmartCheckoutText', e.target.value)}
                    disabled={siteConfig.enableWalmartCheckout === false}
                    className="border border-[#C9CCCF] rounded px-2.5 py-1.5 text-xs outline-none bg-white font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed focus:border-[#008060] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Footer Controls: Save & Discard buttons */}
      <div className="p-4 bg-white border-t border-[#E1E3E5] flex flex-col gap-2">
        <button
          onClick={onSave}
          className="w-full bg-[#008060] hover:bg-[#006e52] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save size={14} />
          <span>Save Changes Live</span>
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onReset}
            className="border border-[#C9CCCF] hover:bg-gray-50 text-gray-600 py-2 rounded-xl font-semibold text-[11px] uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-1 cursor-pointer"
            title="Reset theme config to factory default values"
          >
            <RotateCcw size={12} />
            <span>Reset Defaults</span>
          </button>
          
          <button
            onClick={onClose}
            className="bg-charcoal hover:opacity-90 text-white py-2 rounded-xl font-semibold text-[11px] uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer"
          >
            <span>Close Editor</span>
          </button>
        </div>
      </div>
    </div>
  );
}
