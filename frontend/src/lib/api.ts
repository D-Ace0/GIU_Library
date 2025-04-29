import axios from "axios";
import { get } from "http";

const API_URL = "http://localhost:5000";

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User related API calls
export const userService = {
  // Get current user info
  getCurrentUser: async () => {
    const userId = getUserIdFromToken();
    if (!userId) return null;
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId: string, data: any) => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },
  getBorrowedBooks: async (userId: string) => {
    const response = await api.get(`/users/${userId}/borrowed-books`);
    return response.data;
  },
  //update image
  updateImage: async (userId: string, imageUrl: string) => {
    const response = await api.patch(`/users/${userId}/image`, {
      image_url: imageUrl,
    });
    return response.data;
  },
};

// Reviews related API calls
export const reviewService = {
  // Get user reviews
  getUserReviews: async (userId: string) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },

  // Create a review
  createReview: async (userId: string, reviewData: any) => {
    const response = await api.post(`/reviews/${userId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId: string) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

// Book related API calls
export const bookService = {
  // Get all books
  getAllBooks: async () => {
    const response = await api.get("/book");
    return response.data;
  },

  // Get book by title
  getBookByTitle: async (title: string) => {
    const response = await api.get(`/book/${title}`);
    return response.data;
  },
  //get book by id
  getBookById: async (id: string) => {
    const response = await api.get(`/book/${id}`);
    return response.data;
  },

  // Search books
  searchBooks: async (query: string) => {
    const response = await api.get(`/book/search/${query}`);
    return response.data;
  },

  // Save book for user
  saveBook: async (userId: string, bookId: string) => {
    const response = await api.patch(`/book/${userId}/save/${bookId}`);
    return response.data;
  },

  // Unsave book for user
  unsaveBook: async (userId: string, bookId: string) => {
    const response = await api.patch(`/book/${userId}/unsave/${bookId}`);
    return response.data;
  },
};
// Borrowing related API calls
export const borrowingService = {
  // Borrow a book
  borrowBook: async (userId: string, bookId: string) => {
    const response = await api.post(`/borrowed/${userId}/borrow/${bookId}`);
    return response.data;
  },

  // Return a book
  returnBook: async (borrowingId: string) => {
    const response = await api.put(`/borrowed/return/${borrowingId}`);
    return response.data;
  },
  // New method
  getBorrowedByUserId: async (userId: string) => {
    const response = await api.get(`/borrowed/user/${userId}`);
    return response.data;
  },
};

// Helper function to decode JWT and get userId
export const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    // Decode JWT token (base64)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export default api;
