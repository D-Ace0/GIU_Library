import { Trash2Icon, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardTitle } from "../components/ui/card";
import {
  useAuth,
  useUserReviews,
  useSavedBooks,
  useBorrowedBooks,
  useUpdateUserImage,
} from "../lib/hooks";
import { useRouter } from "next/router";

export const AccountInfo = (): JSX.Element => {
  const router = useRouter();
  const { user, isLoading: isUserLoading, isAuthenticated, userId } = useAuth();
  const {
    reviews,
    isLoading: isReviewsLoading,
    deleteReview,
  } = useUserReviews(userId);
  const {
    books: savedBooks,
    isLoading: isBooksLoading,
    unsaveBook,
  } = useSavedBooks(userId);
  const {
    books: borrowedBooks,
    isLoading: isBorrowedBooksLoading,
    error: borrowedBooksError,
  } = useBorrowedBooks(userId);
  const [showImageForm, setShowImageForm] = useState<boolean>(false);
  const [newImageUrl, setNewImageUrl] = useState<string>("");

  const {
    updateImage,
    isLoading: isImageLoading,
    error: imageError,
  } = useUpdateUserImage(userId, newImageUrl);

  useEffect(() => {
    if (!isUserLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isUserLoading, isAuthenticated, router]);

  const handleDeleteReview = async (reviewId: string) => {
    await deleteReview(reviewId);
  };

  const handleUnsaveBook = async (bookId: string) => {
    await unsaveBook(bookId);
  };

  const handleImageUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newImageUrl) return;

    try {
      const updatedUser = await updateImage(userId, newImageUrl);
      setShowImageForm(false); // Close the form
      setNewImageUrl(""); // Reset the input
    } catch (err) {
      console.error("Image update failed:", err);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Return to signin when token is gone
  setTimeout(() => {
    if (!isAuthenticated) {
      router.push("/signin");
    }
  }, 1000 * 60 * 60); // 1 hour

  return (
    <div className="bg-neutral-100 min-h-screen">
      <main className="container mx-auto py-8 space-y-12">
        <section className="flex gap-8">
          <div className="flex flex-col items-center gap-4">
            <img
              className="w-[202px] h-[193px] rounded-full border border-gray-300 shadow-sm object-cover"
              alt="Account circle"
              src={user?.image_url || "/account-circle.svg"}
            />
            <div className="text-center">
              {showImageForm ? (
                <form onSubmit={handleImageUpdate} className="space-y-3">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter new image URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    required
                  />
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="submit"
                      disabled={isImageLoading}
                      className="bg-blue-500 text-white hover:bg-blue-600 shadow-sm">
                      {isImageLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowImageForm(false)}
                      className="bg-gray-300 text-gray-800 hover:bg-gray-400 shadow-sm">
                      Cancel
                    </Button>
                  </div>
                  {imageError && (
                    <p className="text-red-500 text-sm">{imageError}</p>
                  )}
                </form>
              ) : (
                <button
                  onClick={() => setShowImageForm(true)}
                  className="font-title-page text-black hover:underline focus:outline-none">
                  Change Picture
                </button>
              )}
            </div>
          </div>

          <Card className="flex-1 rounded-[20px] overflow-hidden shadow-lg border border-gray-200">
            <CardContent className="p-8 space-y-8">
              <div>
                <h2 className="font-title-hero text-black">Name:</h2>
                <p className="font-subtitle text-black text-[32px]">
                  {user?.username || "N/A"}
                </p>
              </div>

              <div>
                <h2 className="font-title-hero text-black">Major:</h2>
                <p className="font-subtitle text-black text-[32px]">
                  {user?.major || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Reviews Section */}
        <section>
          <h2 className="font-title-page text-black mb-6">Recent Reviews:</h2>
          <div className="bg-white rounded-[20px] p-8 shadow-md border border-gray-200">
            {isReviewsLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <Card
                    key={review._id}
                    className="rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <CardTitle className="font-heading text-lg text-gray-800">
                          {review.BookTitle}
                        </CardTitle>
                        <p className="font-body-base text-sm text-gray-600">
                          <strong>Rating:</strong> {review.rating} / 5
                        </p>
                        <p className="font-body-base text-sm text-gray-600">
                          {review.reviewText}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[url('/shape-2.png')] bg-cover bg-center" />
                        <div className="flex flex-col">
                          <p className="font-body-strong text-sm text-gray-700">
                            {review.Username}
                          </p>
                          <p className="font-body-base text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-red-500 hover:text-red-700"
                          aria-label="Delete review"
                          onClick={() => handleDeleteReview(review._id)}>
                          <Trash2Icon className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No reviews yet.</p>
            )}
          </div>
        </section>

        {/* Borrowed History Section */}
        <section>
          <h2 className="font-title-page text-black mb-6">Borrowed History:</h2>
          <div className="bg-white rounded-[20px] p-8 shadow-md border border-gray-200">
            {isBorrowedBooksLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : borrowedBooksError ? (
              <p className="text-center text-red-500">{borrowedBooksError}</p>
            ) : borrowedBooks && borrowedBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {borrowedBooks.map((book) => (
                  <Card
                    key={book._id}
                    className="rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-heading text-lg text-gray-800">
                        {book.bookTitle}
                      </h3>
                      <p className="font-body-base text-sm text-gray-600">
                        {book.summary}
                      </p>
                      <p className="font-body-base text-sm text-gray-600">
                        <strong>Author:</strong> {book.author}
                      </p>
                      <p className="font-body-base text-sm text-gray-600">
                        <strong>Borrowed On:</strong>{" "}
                        {book.borrowedAt
                          ? new Date(book.borrowedAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p className="font-body-base text-sm text-gray-600">
                        <strong>Due Date:</strong>{" "}
                        {book.returnDate
                          ? new Date(book.returnDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No borrowed books yet.
              </p>
            )}
          </div>
        </section>

        {/* Saved Books Section */}
        <section>
          <h2 className="font-title-page text-black mb-6">Saved Books:</h2>
          <div className="bg-white rounded-[20px] p-8 shadow-md border border-gray-200">
            {isBooksLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : savedBooks && savedBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedBooks.map((book) => (
                  <Card
                    key={book._id}
                    className="rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6 space-y-4">
                      <div className="relative">
                        <img
                          src={book.image_url || "/image-placeholder.svg"}
                          alt={book.bookTitle}
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 w-8 h-8 text-red-500 hover:text-red-700"
                          aria-label="Delete book"
                          onClick={() => handleUnsaveBook(book._id)}>
                          <Trash2Icon className="w-4 h-4" />
                        </Button>
                      </div>
                      <h3 className="font-heading text-lg text-gray-800">
                        {book.bookTitle}
                      </h3>
                      <p className="font-body-base text-sm text-gray-600">
                        {book.summary}
                      </p>
                      <p className="font-body-base text-sm text-gray-600">
                        <strong>Author:</strong> {book.author}
                      </p>
                      <p className="font-body-base text-sm text-gray-600">
                        <strong>Publisher:</strong> {book.publisher}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No saved books yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
