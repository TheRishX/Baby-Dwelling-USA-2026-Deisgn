import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Plus, Check } from 'lucide-react';
import { Review } from '../types';

interface ReviewSectionProps {
  reviews: Review[];
  onAddReview: (review: Review) => void;
}

export default function ReviewSection({ reviews, onAddReview }: ReviewSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', babyAge: '', rating: 5, comment: '' });

  const handleRatingChange = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) {
      alert('Please fill out your name and comments.');
      return;
    }

    const created: Review = {
      id: `rev-${Date.now()}`,
      name: newReview.name,
      babyAge: newReview.babyAge || '1 mo',
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      verified: true,
    };

    onAddReview(created);
    setNewReview({ name: '', babyAge: '', rating: 5, comment: '' });
    setIsFormOpen(false);
    alert('Thank you! Your feedback has been posted successfully.');
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-sand/15 pb-6">
        <div className="flex flex-col gap-2">
          <span className="font-sans text-[10px] md:text-xs font-semibold tracking-widest text-terracotta dark:text-sand uppercase">
            Parent Communities
          </span>
          <h3 className="font-serif text-xl md:text-2xl font-bold text-charcoal dark:text-warm-white">
            Real Stories, Real Closeness
          </h3>
          <p className="font-sans text-xs md:text-sm text-charcoal/60 dark:text-warm-white/60">
            Read how other parents elevate their daily routine with Baby Dwelling ergonomic carriers.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-charcoal text-charcoal dark:border-warm-white dark:text-warm-white hover:bg-charcoal/5 dark:hover:bg-white/5 font-sans text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer active:scale-95"
        >
          <Plus size={14} />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Review Creator Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl bg-light-beige/35 dark:bg-white/5 border border-sand/25 dark:border-white/10 flex flex-col gap-4 overflow-hidden"
          >
            <h4 className="font-serif text-sm font-bold text-charcoal dark:text-warm-white flex items-center gap-2">
              <MessageSquare size={16} className="text-terracotta" /> Write Your Babywearing Story
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-semibold text-charcoal/70 dark:text-warm-white/70">Your Name & Baby's Name</label>
                <input
                  type="text"
                  placeholder="E.g., Sarah & Leo"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="p-2.5 rounded-lg border border-sand/30 bg-white dark:bg-charcoal dark:border-white/10 text-charcoal dark:text-warm-white text-xs outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-semibold text-charcoal/70 dark:text-warm-white/70">Baby's Age (e.g. 6 mos)</label>
                <input
                  type="text"
                  placeholder="E.g., 5 mos"
                  value={newReview.babyAge}
                  onChange={(e) => setNewReview({ ...newReview, babyAge: e.target.value })}
                  className="p-2.5 rounded-lg border border-sand/30 bg-white dark:bg-charcoal dark:border-white/10 text-charcoal dark:text-warm-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Rating Stars Input */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-charcoal/70 dark:text-warm-white/70">Your Rating</span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRatingChange(i + 1)}
                    className="cursor-pointer"
                  >
                    <Star
                      size={20}
                      className={`${
                        i < newReview.rating
                          ? 'fill-terracotta text-terracotta dark:fill-sand dark:text-sand'
                          : 'text-sand/35 dark:text-white/25'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-charcoal/70 dark:text-warm-white/70">Your Review Feedback</label>
              <textarea
                placeholder="Share your experience with comfort, fabric quality, and support..."
                rows={4}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="p-2.5 rounded-lg border border-sand/30 bg-white dark:bg-charcoal dark:border-white/10 text-charcoal dark:text-warm-white text-xs outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-charcoal text-warm-white dark:bg-warm-white dark:text-charcoal font-sans text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer self-start"
            >
              Post Review
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews Slider / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {reviews.map((rev) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              key={rev.id}
              className="p-6 rounded-2xl bg-light-beige/15 dark:bg-white/5 border border-sand/15 dark:border-white/5 flex flex-col justify-between shadow-[0_4px_12px_rgb(0,0,0,0.01)]"
            >
              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className="fill-terracotta text-terracotta dark:fill-sand dark:text-sand"
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="font-serif text-sm italic text-charcoal/80 dark:text-warm-white/80 leading-relaxed mb-6">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-between border-t border-sand/10 pt-4 mt-auto">
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-bold text-charcoal dark:text-warm-white">
                    {rev.name}
                  </span>
                  <span className="font-sans text-[10px] text-charcoal/50 dark:text-warm-white/50">
                    Baby age: {rev.babyAge}
                  </span>
                </div>

                <span className="text-[10px] font-sans font-bold text-sage bg-sage/10 border border-sage/20 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Check size={9} strokeWidth={3} /> Verified
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
