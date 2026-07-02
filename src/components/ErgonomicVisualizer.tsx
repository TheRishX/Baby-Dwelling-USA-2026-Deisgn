import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export default function ErgonomicVisualizer() {
  const [activeTab, setActiveTab] = useState<'correct' | 'incorrect'>('correct');

  return (
    <div className="bg-warm-white dark:bg-charcoal/40 rounded-3xl border border-sand/15 dark:border-white/5 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-sans text-[10px] md:text-xs font-semibold tracking-widest text-terracotta dark:text-sand uppercase">
          Orthopedic Safety Guide
        </span>
        <h3 className="font-serif text-xl md:text-2xl font-bold text-charcoal dark:text-warm-white">
          The Hip-Healthy "M" Position
        </h3>
        <p className="font-sans text-xs md:text-sm text-charcoal/60 dark:text-warm-white/60">
          Acknowledged by the International Hip Dysplasia Institute, our carriers ensure your baby rests in the natural frog-leg position, avoiding dangling legs that stress developing joints.
        </p>
      </div>

      {/* Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-light-beige/50 dark:bg-white/5 border border-sand/10 dark:border-white/10 max-w-sm">
        <button
          onClick={() => setActiveTab('correct')}
          className={`py-2 rounded-lg text-xs font-sans font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'correct'
              ? 'bg-charcoal text-warm-white dark:bg-warm-white dark:text-charcoal shadow-sm'
              : 'text-charcoal/50 dark:text-warm-white/50 hover:text-charcoal dark:hover:text-warm-white'
          }`}
        >
          <ShieldCheck size={14} className={activeTab === 'correct' ? 'text-sage' : ''} />
          <span>Correct (M Posture)</span>
        </button>
        <button
          onClick={() => setActiveTab('incorrect')}
          className={`py-2 rounded-lg text-xs font-sans font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'incorrect'
              ? 'bg-[#ba1a1a] text-warm-white shadow-sm'
              : 'text-charcoal/50 dark:text-warm-white/50 hover:text-charcoal dark:hover:text-warm-white'
          }`}
        >
          <AlertCircle size={14} />
          <span>Incorrect (Narrow)</span>
        </button>
      </div>

      {/* Interactive Visualizer Graphics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-light-beige/25 dark:bg-white/5 rounded-2xl p-6 border border-sand/10">
        
        {/* Dynamic Posture Diagram/Description */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-base font-bold text-charcoal dark:text-warm-white flex items-center gap-2">
            {activeTab === 'correct' ? (
              <span className="text-sage font-sans text-xs px-2.5 py-1 rounded-full bg-sage/10 font-bold border border-sage/20 uppercase tracking-widest">
                Recommended
              </span>
            ) : (
              <span className="text-red-500 font-sans text-xs px-2.5 py-1 rounded-full bg-red-500/10 font-bold border border-red-500/20 uppercase tracking-widest">
                Avoid Posture
              </span>
            )}
          </h4>

          {activeTab === 'correct' ? (
            <div className="flex flex-col gap-4">
              <p className="font-sans text-xs text-charcoal/70 dark:text-warm-white/70 leading-relaxed">
                The baby’s thighs are spread and supported from knee to knee. The hips are bent, so that the knees are slightly higher than the buttocks, forming an <strong>"M" shape</strong>. This reduces joint pressure.
              </p>
              <div className="flex flex-col gap-2.5 font-sans text-xs">
                <div className="flex items-center gap-2.5 text-charcoal/80 dark:text-warm-white/80">
                  <div className="w-5 h-5 rounded-full bg-sage/15 text-sage flex items-center justify-center flex-shrink-0">
                    <Check size={12} />
                  </div>
                  <span>Wide supportive seat base distributes weight evenly.</span>
                </div>
                <div className="flex items-center gap-2.5 text-charcoal/80 dark:text-warm-white/80">
                  <div className="w-5 h-5 rounded-full bg-sage/15 text-sage flex items-center justify-center flex-shrink-0">
                    <Check size={12} />
                  </div>
                  <span>Knee-to-knee alignment avoids dysplasia risk.</span>
                </div>
                <div className="flex items-center gap-2.5 text-charcoal/80 dark:text-warm-white/80">
                  <div className="w-5 h-5 rounded-full bg-sage/15 text-sage flex items-center justify-center flex-shrink-0">
                    <Check size={12} />
                  </div>
                  <span>Naturally rounds the baby's C-shaped spine safely.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="font-sans text-xs text-charcoal/70 dark:text-warm-white/70 leading-relaxed">
                The seat base is too narrow, causing the legs to dangle straight down. The hip joints bear the full weight of the legs, pulling the femoral heads out of their sockets.
              </p>
              <div className="flex flex-col gap-2.5 font-sans text-xs text-charcoal/70 dark:text-warm-white/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={12} />
                  </div>
                  <span>Unsupported legs strain infant hip sockets.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={12} />
                  </div>
                  <span>Forces straight spine posture prematurely.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={12} />
                  </div>
                  <span>Increases risk of long-term developmental dysplasia.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Posture Schematic Block */}
        <div className="relative aspect-video rounded-xl bg-warm-white dark:bg-charcoal border border-sand/15 overflow-hidden flex items-center justify-center p-4 shadow-sm">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYgJvLuf0Zt1qB223y7Fe29M7UVopEQBrX5A61jrHnarvmG5pE7sIdh8WGCSDyZk7cwW_btP6uvLH2FOzTNaJKGOX6VcWm1FUI--gVXSylk0VtIt3pk40ap2fLbhdwA25hXgQVyp_3cqM2UGG1KurtF8rWTRGwLBt9Tvml6Yr6aJorH_Yi8iGu4jNA8RkiL_irDOsIwNyHrlpOhH93LObOdB24gLGzVZdsop8of4E9l2YBNMq1_Ocdaj7uww4ywAn7FSBEV-ZqXMI"
            alt="Hip position"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-all duration-500 rounded-lg ${
              activeTab === 'incorrect' ? 'grayscale brightness-75 contrast-125 saturate-50' : 'brightness-100 contrast-100'
            }`}
          />
          
          {/* Posture Indicator Overlay Lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
              {activeTab === 'correct' ? (
                <>
                  {/* Correct M Lines */}
                  <path d="M 25,60 L 50,45 L 75,60" fill="none" stroke="#9CA389" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
                  <circle cx="25" cy="60" r="4" fill="#9CA389" />
                  <circle cx="50" cy="45" r="4" fill="#9CA389" />
                  <circle cx="75" cy="60" r="4" fill="#9CA389" />
                </>
              ) : (
                <>
                  {/* Incorrect dangling Lines */}
                  <path d="M 40,48 L 40,85 M 60,48 L 60,85" fill="none" stroke="#ba1a1a" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
                  <circle cx="40" cy="85" r="4" fill="#ba1a1a" />
                  <circle cx="60" cy="85" r="4" fill="#ba1a1a" />
                </>
              )}
            </svg>
            <div className={`absolute bottom-3 right-3 px-2 py-1 rounded text-[9px] font-sans font-bold uppercase tracking-wider ${
              activeTab === 'correct' ? 'bg-sage/90 text-warm-white' : 'bg-[#ba1a1a]/90 text-warm-white'
            }`}>
              {activeTab === 'correct' ? 'Ergonomic M-shape' : 'Dangling Posture'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
