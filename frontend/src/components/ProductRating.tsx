import React from 'react';
import { Star } from 'lucide-react';

interface ProductRatingProps {
  data: any;
  variant?: 'single' | 'five-star';
  className?: string;
}

export const getAverageRating = (data: any) => {
  if (!data) return { rating: 0, reviewsCount: 0 };
  
  let directRating = data.rating || data.product?.rating;
  let directReviews = data.reviewsCount || data.product?.reviewsCount;
  
  if (!directRating && data.order?.rating) directRating = data.order.rating;
  if (!directReviews && data.order?.reviewsCount) directReviews = data.order.reviewsCount;
  if (!directRating && data.template?.rating) directRating = data.template.rating;
  if (!directReviews && data.template?.reviewsCount) directReviews = data.template.reviewsCount;

  const orderLinks = data.orderLinks || data.product?.orderLinks || [];
  
  let finalRating = Number(directRating) || 0;
  let finalReviewsCount = typeof directReviews === 'string' ? parseInt(directReviews.replace(/[^0-9]/g, '')) : (Number(directReviews) || 0);

  if (orderLinks.length > 0) {
    const linksWithRatings = orderLinks.filter((l: any) => l.rating);
    if (linksWithRatings.length > 0) {
      const totalRating = linksWithRatings.reduce((acc: number, l: any) => acc + Number(l.rating), 0);
      finalRating = Number((totalRating / linksWithRatings.length).toFixed(1));
    }

    const linksWithReviews = orderLinks.filter((l: any) => l.reviewsCount);
    if (linksWithReviews.length > 0) {
      const totalReviews = linksWithReviews.reduce((acc: number, l: any) => {
        const count = typeof l.reviewsCount === 'string' ? parseInt(l.reviewsCount.replace(/[^0-9]/g, '')) : Number(l.reviewsCount);
        return acc + (isNaN(count) ? 0 : count);
      }, 0);
      finalReviewsCount = totalReviews;
    }
  }

  return { 
    rating: finalRating, 
    reviewsCount: finalReviewsCount 
  };
};

const ProductRating: React.FC<ProductRatingProps> = ({ 
  data, 
  variant = 'single',
  className = 'mb-3'
}) => {
  const { rating, reviewsCount } = getAverageRating(data);

  if (!rating) return null;

  if (variant === 'five-star') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              size={12} 
              className={star <= Math.round(rating) ? "fill-[#FFD700] text-[#FFD700]" : "fill-white/20 text-white/20"} 
            />
          ))}
        </div>
        <span className="text-[11px] text-white/90 font-medium ml-1">
          {rating} {reviewsCount > 0 && <span className="opacity-70">({reviewsCount})</span>}
        </span>
      </div>
    );
  }

  return (
    <>
      <Star size={11} className="fill-[#FFD700] text-[#FFD700]" />
      <span className="text-slate-700 text-[10.5px] font-bold ml-0.5">{rating}</span>
      {reviewsCount > 0 && <span className="text-slate-400 text-[10.5px] ml-0.5">({reviewsCount})</span>}
    </>
  );
};

export default ProductRating;
