import { useState, useEffect } from "react";
import api, {
  userService,
  reviewService,
  bookService,
  getUserIdFromToken,
  borrowingService,
} from "./api";

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
        setError(err.message || "Failed to fetch user data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have a token
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
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
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await reviewService.getUserReviews(userId);
      setReviews(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch reviews");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const deleteReview = async (reviewId: string) => {
    try {
      setDeleteError(null);
      await reviewService.deleteReview(reviewId);
      // Update the reviews list by removing the deleted review
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review._id !== reviewId)
      );
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete review");
      console.error(err);
    }
  };

  return { reviews, isLoading, error, deleteError, deleteReview };
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
        setError(err.message || "Failed to fetch saved books");
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
      setBooks(books.filter((book) => book._id !== bookId));
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to remove book from saved list");
      console.error(err);
      return false;
    }
  };

  return { books, isLoading, error, unsaveBook };
};
//borrowedboooks
// In hooks.ts
export const useBorrowedBooks = (userId: string | null) => {
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Running useBorrowedBooks useEffect, userId:", userId);
    const fetchBorrowedBooks = async () => {
      if (!userId) {
        console.log("No userId, skipping fetchBorrowedBooks");
        return;
      }

      try {
        setIsLoading(true);
        console.log("Fetching borrowed books for userId:", userId);
        const borrowedRecords = await borrowingService.getBorrowedByUserId(
          userId
        );
        console.log("Fetched borrowed records:", borrowedRecords);
        // Map the records to the format expected by AccountInfo
        const formattedBooks = borrowedRecords.map((record: any) => ({
          _id: record.bookId._id,
          bookTitle: record.bookId.bookTitle,
          author: record.bookId.author,
          summary: record.bookId.summary,
          publisher: record.bookId.publisher,
          image_url: record.bookId.image_url || "",
          borrowedAt: record.borrowedAt,
          returnDate: record.returnDate,
          returned: record.returned,
          returnedAt: record.returnedAt,
        }));
        console.log("Formatted books:", formattedBooks);
        setBooks(formattedBooks);
      } catch (err: any) {
        console.error(
          "Error fetching borrowed books:",
          err.response?.status,
          err.response?.data,
          err.message
        );
        setError(err.message || "Failed to fetch borrowed books");
      } finally {
        console.log("Finished fetching borrowed books, isLoading:", false);
        setIsLoading(false);
      }
    };

    fetchBorrowedBooks();
  }, [userId]);

  useEffect(() => {
    console.log("books state updated:", books);
  }, [books]);

  return { books, isLoading, error };
};
//update user image
export const useUpdateUserImage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateImage = async (userId: string, imageUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await userService.updateImage(userId, imageUrl);
    } catch (err: any) {
      setError(err.message || "Failed to update user image");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { updateImage, error, isLoading };
};
