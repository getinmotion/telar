import { useState, useEffect } from 'react';

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: { [key: number]: number };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
  helpful_count: number;
  verified_purchase: boolean;
  title: string;
}

export const useReviews = (productId: string) => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and return default stats
    const timer = setTimeout(() => {
      setStats({
        average_rating: 4.5,
        total_reviews: Math.floor(Math.random() * 50) + 1,
        rating_distribution: { 1: 2, 2: 3, 3: 8, 4: 15, 5: 22 }
      });
      setReviews([]);
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [productId]);

  const addReview = (review: { rating: number; comment: string; user_name?: string; product_id: string; title: string; verified_purchase?: boolean }) => {
    // Simulate adding a review
    console.log('Review added:', review);
  };

  const markHelpful = (reviewId: string) => {
    // Simulate marking review as helpful
    console.log('Marked helpful:', reviewId);
  };

  return { stats, loading, reviews, addReview, markHelpful };
};