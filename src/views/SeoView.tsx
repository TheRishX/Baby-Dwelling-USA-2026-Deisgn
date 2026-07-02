import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  ExternalLink, 
  Globe, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Star, 
  TrendingUp, 
  Sliders, 
  Laptop, 
  Smartphone, 
  FileText,
  HelpCircle,
  Tag
} from 'lucide-react';
import { Product, ActiveView } from '../types';
import { products as initialProducts } from '../data';

interface SeoViewProps {
  siteConfig: any;
  onNavigateToView: (view: ActiveView, subTarget?: string) => void;
  setCurrentPageSlug?: (slug: string) => void;
}

export default function SeoView({ siteConfig, onNavigateToView, setCurrentPageSlug }: SeoViewProps) {
  const [searchQuery, setSearchQuery] = useState('Baby Dwelling USA');
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop');
  const [customTitle, setCustomTitle] = useState('Baby Dwelling USA | Premium Ergonomic Baby Carriers & Wraps');
  const [customDesc, setCustomDesc] = useState('Discover our certified organic, ergonomically designed baby carriers, ring slings, and wraps. Crafted for premium comfort, pediatric-approved hip-healthy support, and luxurious babywearing.');
  const [activeTab, setActiveTab] = useState<'simulator' | 'products' | 'checklist'>('simulator');

  // Calculate some basic SEO score metrics
  const titleLength = customTitle.length;
  const descLength = customDesc.length;
  const hasUsaKeyword = customTitle.toLowerCase().includes('usa') || customDesc.toLowerCase().includes('usa');
  const hasBrandName = customTitle.toLowerCase().includes('baby dwelling');
  const hasErgonomicKeyword = customTitle.toLowerCase().includes('ergonomic') || customDesc.toLowerCase().includes('ergonomic');

  let seoScore = 40;
  if (titleLength >= 40 && titleLength <= 60) seoScore += 15;
  else if (titleLength > 20 && titleLength <= 70) seoScore += 8;
  
  if (descLength >= 120 && descLength <= 160) seoScore += 15;
  else if (descLength > 80 && descLength <= 200) seoScore += 8;

  if (hasUsaKeyword) seoScore += 10;
  if (hasBrandName) seoScore += 10;
  if (hasErgonomicKeyword) seoScore += 10;

  // Let's analyze keywords
  const keywordsList = [
    { text: 'Baby Dwelling USA', volume: '12,400/mo', difficulty: 'Low', density: 2.4 },
    { text: 'ergonomic baby carrier', volume: '33,100/mo', difficulty: 'Medium', density: 1.8 },
    { text: 'organic baby sling', volume: '8,900/mo', difficulty: 'Low', density: 1.5 },
    { text: 'hip healthy baby wrap', volume: '5,400/mo', difficulty: 'Low', density: 1.2 },
    { text: 'luxury newborn carrier', volume: '2,800/mo', difficulty: 'Low', density: 0.9 },
  ];

  const handleSitelinkClick = (target: string) => {
    if (target.startsWith('page:')) {
      const slug = target.replace('page:', '');
      if (setCurrentPageSlug) {
        setCurrentPageSlug(slug);
      }
      onNavigateToView('page');
    } else {
      onNavigateToView(target as ActiveView);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-16 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-sand/20 pb-8 mb-10">
        <div className="text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded bg-terracotta/10 text-terracotta text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={12} /> Live SEO Index
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sage/10 text-sage text-[10px] font-bold uppercase tracking-wider">
              Baby Dwelling USA Optimized
            </span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal">
            Google SEO &amp; Search Sitelinks Hub
          </h2>
          <p className="font-sans text-xs md:text-sm text-charcoal/60 mt-1 max-w-2xl leading-relaxed">
            Review search engine visibility, crawl tags, structured schema graphs, and interactive sitelinks previewing. Tailored exclusively for Baby Dwelling USA.
          </p>
        </div>

        {/* Real-time SEO Grade Widget */}
        <div className="flex items-center gap-4 bg-light-beige/35 border border-sand/30 p-4 rounded-2xl shadow-sm min-w-[200px]">
          <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-white border border-sand/20 shadow-inner">
            <span className="font-serif text-lg font-black text-charcoal">{seoScore}%</span>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="29"
                fill="none"
                stroke="#E1E3E5"
                strokeWidth="3.5"
              />
              <circle
                cx="32"
                cy="32"
                r="29"
                fill="none"
                stroke={seoScore >= 80 ? '#2d6a4f' : seoScore >= 60 ? '#cc9900' : '#b22222'}
                strokeWidth="3.5"
                strokeDasharray={`${2 * Math.PI * 29}`}
                strokeDashoffset={`${2 * Math.PI * 29 * (1 - seoScore / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">SEO Visibility Rating</span>
            <span className="text-xs font-bold text-charcoal block mt-0.5">
              {seoScore >= 80 ? '👑 Excellent SEO Health' : seoScore >= 60 ? '⚡ Good Progress' : '⚠️ Action Required'}
            </span>
            <span className="text-[9px] text-gray-500 block">Fully compliant with Google Webmaster criteria.</span>
          </div>
        </div>
      </div>

      {/* Primary Bento Tab Menu */}
      <div className="flex gap-2 border-b border-sand/15 pb-4 mb-8">
        {[
          { id: 'simulator', label: 'Google Search Simulator', icon: Search },
          { id: 'products', label: 'Indexed Products Directory', icon: Tag },
          { id: 'checklist', label: 'Technical SEO Audit', icon: CheckCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-charcoal text-warm-white shadow'
                  : 'bg-light-beige/25 border border-transparent text-charcoal/60 hover:text-charcoal hover:bg-light-beige/60'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main View Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Tools & Content Editors */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-sand/30 shadow-sm text-left">
            <h3 className="font-serif text-base font-bold text-charcoal mb-4 flex items-center gap-1.5">
              <Sliders size={16} className="text-terracotta" />
              <span>Snippet Customizer</span>
            </h3>

            <div className="flex flex-col gap-4">
              {/* Title Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Title Tag (SERP Title)</label>
                  <span className={`text-[9px] font-mono font-bold ${titleLength >= 40 && titleLength <= 60 ? 'text-sage' : 'text-amber-500'}`}>
                    {titleLength} / 60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full border border-sand/30 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none bg-white focus:border-terracotta transition-colors shadow-sm"
                  placeholder="Insert custom Google Title..."
                />
              </div>

              {/* Description Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Meta Description</label>
                  <span className={`text-[9px] font-mono font-bold ${descLength >= 120 && descLength <= 160 ? 'text-sage' : 'text-amber-500'}`}>
                    {descLength} / 160 chars
                  </span>
                </div>
                <textarea
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  rows={4}
                  className="w-full border border-sand/30 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none bg-white focus:border-terracotta transition-colors shadow-sm leading-relaxed"
                  placeholder="Insert custom Meta Description..."
                />
              </div>

              {/* Sitelinks reference info */}
              <div className="bg-sage/10 p-3.5 rounded-xl border border-sage/20 mt-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle size={15} className="text-sage mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-700 block uppercase">Sitelink Automation</span>
                    <p className="text-[10px] text-gray-600 leading-normal mt-0.5 font-sans">
                      Google automatically extracts high-converting links based on structured site hierarchies, clean navigation, and consistent page titles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* High-Impact SEO Keywords List */}
          <div className="glass-panel p-6 rounded-2xl border border-sand/30 shadow-sm text-left">
            <h3 className="font-serif text-base font-bold text-charcoal mb-4 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-sage" />
              <span>Target Keyword Performance</span>
            </h3>

            <div className="flex flex-col gap-3">
              {keywordsList.map((kw, i) => (
                <div key={i} className="flex items-center justify-between border-b border-sand/10 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-charcoal font-sans">{kw.text}</span>
                    <span className="text-[9px] text-gray-400 font-sans">Volume: {kw.volume}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] font-bold text-sage bg-sage/5 px-2 py-0.5 rounded-full border border-sage/10">
                      {kw.difficulty} Difficulty
                    </span>
                    <span className="text-[9px] font-mono text-gray-500 mt-0.5">Density: {kw.density}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Google Search & Sitelinks Visualizer / Product Index Directory */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {activeTab === 'simulator' && (
            <div className="border border-[#E1E3E5] bg-white rounded-3xl overflow-hidden shadow-sm text-left">
              {/* Simulator Browser Header */}
              <div className="bg-[#f1f3f4] px-6 py-3 border-b border-[#E1E3E5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <div className="bg-white border border-[#E1E3E5] px-4 py-1 rounded-full text-[10px] text-gray-500 flex items-center gap-1.5 font-semibold font-mono w-64 ml-4 truncate">
                    <Globe size={11} className="text-gray-400" />
                    <span>https://google.com/search?q=Baby+Dwelling+USA</span>
                  </div>
                </div>

                {/* Device Selector */}
                <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-lg">
                  <button
                    onClick={() => setDeviceType('desktop')}
                    className={`p-1 rounded cursor-pointer transition-all ${deviceType === 'desktop' ? 'bg-white text-charcoal shadow-xs' : 'text-gray-500 hover:text-charcoal'}`}
                    title="Desktop Preview"
                  >
                    <Laptop size={14} />
                  </button>
                  <button
                    onClick={() => setDeviceType('mobile')}
                    className={`p-1 rounded cursor-pointer transition-all ${deviceType === 'mobile' ? 'bg-white text-charcoal shadow-xs' : 'text-gray-500 hover:text-charcoal'}`}
                    title="Mobile Preview"
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
              </div>

              {/* Google Search Body simulation */}
              <div className="p-8 bg-[#ffffff] min-h-[500px] flex flex-col gap-8">
                {/* Search Bar inside google page */}
                <div className="flex items-center bg-white border border-[#dfe1e5] hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.28)] transition-all px-4 py-2.5 rounded-full w-full max-w-xl gap-3">
                  <Search size={16} className="text-[#9aa0a6]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="font-sans text-xs text-charcoal outline-none w-full bg-transparent"
                  />
                  <span className="text-gray-400 font-bold font-mono text-xs cursor-default">×</span>
                </div>

                {/* Search Results Summary */}
                <p className="text-[11px] text-[#70757a] font-sans">
                  About 1,820,000 results (0.42 seconds)
                </p>

                {/* Google Snippet Main Block */}
                <div className={`flex flex-col gap-2 max-w-2xl font-sans text-left ${deviceType === 'mobile' ? 'max-w-sm' : ''}`}>
                  {/* Organic Rich Badge breadcrumb */}
                  <div className="flex items-center gap-1.5 text-xs text-[#202124]">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-serif font-bold text-terracotta">BD</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold">Baby Dwelling USA</span>
                      <span className="text-[10px] text-[#5f6368] leading-none">https://babydwelling.usa</span>
                    </div>
                  </div>

                  {/* Title Link */}
                  <h3 className="text-[19px] font-medium text-[#1a0dab] hover:underline cursor-pointer leading-tight font-serif mt-1">
                    {customTitle}
                  </h3>

                  {/* Rating Stars Rich Snippet */}
                  <div className="flex items-center gap-1 text-[11px] text-[#5f6368] font-sans -mt-0.5">
                    <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                      4.9 <Star size={11} fill="currentColor" />
                    </span>
                    <span>•</span>
                    <span>148 verified parent reviews</span>
                    <span>•</span>
                    <span>Price: £45.00 - £120.00</span>
                    <span>•</span>
                    <span className="text-sage font-semibold">In stock</span>
                  </div>

                  {/* Description Meta */}
                  <p className="text-xs text-[#4d5156] leading-relaxed font-sans mt-0.5">
                    {customDesc}
                  </p>

                  {/* Google Sitelinks Simulated Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-4 border-l-2 border-gray-150">
                    {/* Sitelink 1: Shop */}
                    <div className="flex flex-col gap-0.5 group">
                      <button
                        onClick={() => handleSitelinkClick('shop')}
                        className="text-[14px] font-medium text-[#1a0dab] group-hover:underline text-left cursor-pointer"
                      >
                        Shop All Baby Carriers
                      </button>
                      <p className="text-[11px] text-[#4d5156] leading-normal font-sans">
                        Certified organic carriers, ring slings, and infant pouches designed for certified parent comfort.
                      </p>
                    </div>

                    {/* Sitelink 2: Story */}
                    <div className="flex flex-col gap-0.5 group">
                      <button
                        onClick={() => handleSitelinkClick('page:about-us')}
                        className="text-[14px] font-medium text-[#1a0dab] group-hover:underline text-left cursor-pointer"
                      >
                        Our Clean Sourcing Mission
                      </button>
                      <p className="text-[11px] text-[#4d5156] leading-normal font-sans">
                        Crafted from 100% pure organic hemp and linen with eco-certified materials.
                      </p>
                    </div>

                    {/* Sitelink 3: Sizing Guide */}
                    <div className="flex flex-col gap-0.5 group">
                      <button
                        onClick={() => handleSitelinkClick('page:sizing-guide')}
                        className="text-[14px] font-medium text-[#1a0dab] group-hover:underline text-left cursor-pointer"
                      >
                        Ergonomic Sizing &amp; Guides
                      </button>
                      <p className="text-[11px] text-[#4d5156] leading-normal font-sans">
                        Master the pediatric-approved hip-healthy M-Position rule in less than 30 seconds.
                      </p>
                    </div>

                    {/* Sitelink 4: Review */}
                    <div className="flex flex-col gap-0.5 group">
                      <button
                        onClick={() => handleSitelinkClick('home')}
                        className="text-[14px] font-medium text-[#1a0dab] group-hover:underline text-left cursor-pointer"
                      >
                        Verified Parent Testimonials
                      </button>
                      <p className="text-[11px] text-[#4d5156] leading-normal font-sans">
                        Read 5-star verified feedback from parents praising our breathable linen luxury weaves.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="glass-panel p-6 rounded-3xl border border-sand/30 shadow-sm text-left flex flex-col gap-6 bg-white">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal">
                  Indexed Products Directory Listing
                </h3>
                <p className="text-xs text-charcoal/60 mt-1">
                  This lists how individual products are indexed and served inside rich snippet search results for Google Merchant and Shopping crawlers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {initialProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 rounded-2xl border border-sand/15 bg-light-beige/10 hover:bg-light-beige/25 transition-all flex gap-4"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-sand/20 bg-white shadow-sm"
                    />
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-sage bg-sage/5 px-2 py-0.5 rounded-full border border-sage/10">
                            Indexed / Live
                          </span>
                          <span className="text-[9px] font-bold text-charcoal">£{product.price.toFixed(2)}</span>
                        </div>
                        <h4 className="font-serif text-xs font-bold text-charcoal mt-1 line-clamp-1">{product.title}</h4>
                        <p className="text-[10px] text-gray-500 line-clamp-1">{product.tagline}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-sand/10">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-charcoal/60">
                          <Star size={10} className="text-amber-500 fill-amber-500" />
                          <span>{product.rating} ({product.reviewsCount} reviews)</span>
                        </div>
                        <button
                          onClick={() => {
                            onNavigateToView('detail');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-[9px] font-bold uppercase text-terracotta tracking-wider flex items-center gap-0.5 hover:underline cursor-pointer"
                        >
                          <span>Review SERP</span>
                          <ChevronRight size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="glass-panel p-6 rounded-3xl border border-sand/30 shadow-sm text-left flex flex-col gap-6 bg-white">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal">
                  Baby Dwelling USA - Google SEO Audit Report
                </h3>
                <p className="text-xs text-charcoal/60 mt-1">
                  Continuous crawler validation of internal tagging, index compliance, structural schemas, and page metadata.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Rule 1 */}
                <div className="p-4 rounded-2xl border border-sand/15 bg-gray-50/50 flex items-start gap-3">
                  <span className="p-1 rounded-full bg-sage/10 text-sage shrink-0">
                    <CheckCircle size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal font-sans">Title Tag Optimization</h4>
                    <p className="text-[10px] text-gray-500 mt-1 font-sans leading-relaxed">
                      Title includes premium keyword "USA", brand "Baby Dwelling", and is under 60 characters for pristine Google search layout presentation.
                    </p>
                  </div>
                </div>

                {/* Rule 2 */}
                <div className="p-4 rounded-2xl border border-sand/15 bg-gray-50/50 flex items-start gap-3">
                  <span className="p-1 rounded-full bg-sage/10 text-sage shrink-0">
                    <CheckCircle size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal font-sans">Rich Snippets Schema Detection</h4>
                    <p className="text-[10px] text-gray-500 mt-1 font-sans leading-relaxed">
                      Detects `Store` and `Product` microdata schemas. Includes reviews count, star rating averages, pricing range (£45.00 - £120.00), and Stock Availability parameters inside index.html.
                    </p>
                  </div>
                </div>

                {/* Rule 3 */}
                <div className="p-4 rounded-2xl border border-sand/15 bg-gray-50/50 flex items-start gap-3">
                  <span className="p-1 rounded-full bg-sage/10 text-sage shrink-0">
                    <CheckCircle size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal font-sans">SSL &amp; Navigation Security</h4>
                    <p className="text-[10px] text-gray-500 mt-1 font-sans leading-relaxed">
                      Sitelink structure is secured via modern React navigation and direct out-of-frame redirections to secure merchants. Zero client credit card data is stored or processed on the server, ensuring max privacy compliance.
                    </p>
                  </div>
                </div>

                {/* Rule 4 */}
                <div className="p-4 rounded-2xl border border-sand/15 bg-amber-500/5 border-amber-500/10 flex items-start gap-3">
                  <span className="p-1 rounded-full bg-amber-500/10 text-amber-500 shrink-0">
                    <AlertCircle size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal font-sans">OpenGraph Tag Warning</h4>
                    <p className="text-[10px] text-gray-500 mt-1 font-sans leading-relaxed">
                      Ensure your content-delivery network assets are loaded via relative URLs or securely stored SSL CDNs to prevent mixed-content blocks during Google crawling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
