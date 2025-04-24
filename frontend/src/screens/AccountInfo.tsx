import { Trash2Icon, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardTitle } from "../components/ui/card";
import { useAuth, useUserReviews, useSavedBooks } from "../lib/hooks";
import { useRouter } from "next/router";

export const AccountInfo = (): JSX.Element => {
  const router = useRouter();
  const { user, isLoading: isUserLoading, isAuthenticated, userId } = useAuth();
  const { reviews, isLoading: isReviewsLoading, deleteReview } = useUserReviews(userId);
  const { books: savedBooks, isLoading: isBooksLoading, unsaveBook } = useSavedBooks(userId);

  // Redirect if not authenticated
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

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-neutral-100 min-h-screen">
      <main className="container mx-auto py-8 space-y-12">
        {/* Profile Section */}
        <section className="flex gap-8">
          <div className="flex flex-col items-center gap-4">
            <img
              className="w-[202px] h-[193px]"
              alt="Account circle"
              src={user?.image_url || "/account-circle.svg"}
            />
            <h2 className="font-title-page text-black">change pic?</h2>
          </div>

          <Card className="flex-1 rounded-[20px] overflow-hidden">
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
          <h2 className="font-title-page text-black mb-6">Recent reviews:</h2>

          <div className="bg-neutral-100 rounded-[20px] p-16">
            {isReviewsLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {reviews.map((review) => (
                  <Card
                    key={review._id}
                    className="rounded-lg border border-[#d9d9d9]"
                  >
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <img
                            key={i}
                            className="w-5 h-5"
                            alt="Star"
                            src="/star.svg"
                          />
                        ))}
                      </div>

                      <div className="space-y-1">
                        <CardTitle className="font-heading text-[#1e1e1e]">
                          {review.BookTitle}
                        </CardTitle>
                        <p className="font-body-base text-[#1e1e1e]">
                          {review.reviewText}
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[url(/shape-2.png)] bg-cover bg-[50%_50%]" />
                        <div className="flex flex-col gap-0.5 flex-1">
                          <p className="font-body-strong text-[#757575]">
                            {review.Username}
                          </p>
                          <p className="font-body-base text-[#b3b3b3]">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          aria-label="Delete review"
                          onClick={() => handleDeleteReview(review._id)}
                        >
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
          <h2 className="font-title-page text-black mb-6">Borrowed history:</h2>
          {user?.borrowedBooks && user.borrowedBooks.length > 0 ? (
            <div className="bg-neutral-100 rounded-[20px] p-16">
              <p>Your borrowed books will appear here</p>
            </div>
          ) : (
            <p className="text-center text-gray-500">No borrowed books yet.</p>
          )}
        </section>

        {/* Saved Books Section */}
        <section>
          <h2 className="font-title-page text-black mb-6">Saved Books:</h2>

          <div className="bg-neutral-100 rounded-[20px] p-16">
            {isBooksLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : savedBooks && savedBooks.length > 0 ? (
              <div className="space-y-6">
                {savedBooks.map((book) => (
                  <Card
                    key={book._id}
                    className="flex flex-wrap items-start gap-6 p-6 bg-white rounded-lg border border-solid border-[#d9d9d9]"
                  >
                    <div className="relative">
                      <div className={`w-40 h-40 ${book.image_url ? '' : 'bg-[url(/image.svg)] bg-cover bg-[50%_50%] bg-image-placeholder'}`}>
                        {book.image_url && (
                          <img
                            src={book.image_url}
                            alt={book.bookTitle}
                            className="w-40 h-40 object-cover"
                          />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-0 right-0 w-12 h-12"
                        aria-label="Delete book"
                        onClick={() => handleUnsaveBook(book._id)}
                      >
                        <Trash2Icon className="w-6 h-6" />
                      </Button>
                    </div>

                    <div className="flex flex-col min-w-40 items-start gap-4 flex-1">
                      <div className="space-y-2 w-full">
                        <h3 className="font-heading text-[#1e1e1e]">
                          {book.bookTitle}
                        </h3>
                        <p className="font-body-base text-[#757575]">
                          {book.summary}
                        </p>
                        <p className="font-body-base text-[#757575]">
                          <strong>Author:</strong> {book.author}
                        </p>
                        <p className="font-body-base text-[#757575]">
                          <strong>Publisher:</strong> {book.publisher}
                        </p>
                      </div>
                    </div>
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
