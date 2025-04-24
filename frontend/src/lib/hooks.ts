import { useState, useEffect } from 'react';
import { userService, reviewService, bookService, getUserIdFromToken } from './api';

// Hook for managing user authentication
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const userData = await userService.getCurrentUser();
        setUser(userData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have a token
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    userId: user?._id || getUserIdFromToken(),
  };
};

// Hook for fetching user reviews
export const useUserReviews = (userId: string | null) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const data = await reviewService.getUserReviews(userId);
        setReviews(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reviews');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  const deleteReview = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      // Update the local state to remove the deleted review
      setReviews(reviews.filter(review => review._id !== reviewId));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
      console.error(err);
      return false;
    }
  };

  return { reviews, isLoading, error, deleteReview };
};

// Hook for fetching saved books
export const useSavedBooks = (userId: string | null) => {
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedBooks = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const userData = await userService.getCurrentUser();
        
        if (userData && userData.savedBooks && userData.savedBooks.length > 0) {
          // Fetch details for each saved book
          const bookPromises = userData.savedBooks.map((bookId: string) => 
            bookService.getBookByTitle(bookId)
          );
          
          // Wait for all book details to be fetched
          const bookDetails = await Promise.all(bookPromises);
          setBooks(bookDetails.filter(Boolean)); // Filter out any null results
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch saved books');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedBooks();
  }, [userId]);

  const unsaveBook = async (bookId: string) => {
    if (!userId) return false;
    
    try {
      await bookService.unsaveBook(userId, bookId);
      // Update local state
      setBooks(books.filter(book => book._id !== bookId));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to remove book from saved list');
      console.error(err);
      return false;
    }
  };

  return { books, isLoading, error, unsaveBook };
}; 