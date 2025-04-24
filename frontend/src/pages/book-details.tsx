import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const BookDetails: React.FC = () => {
  const router = useRouter();
  const { title } = router.query; // Get the book title from the query parameter
  const [book, setBook] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!title) return;

    // filepath: c:\Users\mosta\Desktop\Repos\GIU_Library\frontend\src\pages\book-details.tsx
    const fetchBookDetails = async () => {
        try {
        const token = localStorage.getItem("token"); // Retrieve the token from local storage
        const res = await fetch(`http://localhost:5000/book/search/${title}`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
        });
    
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Failed to fetch book details");
        }
    
        const data = await res.json();
        setBook(data[0]); // Assuming the API returns an array of books
        } catch (err: any) {
        setError(err.message);
        }
    };

    fetchBookDetails();
  }, [title]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!book) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <img
          src={book.image_url}
          alt={book.bookTitle}
          className="w-full h-64 object-cover rounded mb-4"
        />
        <h1 className="text-3xl font-bold mb-2">{book.bookTitle}</h1>
        <p className="text-gray-700 mb-4">{book.summary}</p>
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Publisher:</strong> {book.publisher}</p>
        <p><strong>Language:</strong> {book.language}</p>
        <p><strong>Page Count:</strong> {book.pageCount}</p>
        <p><strong>Category:</strong> {book.category}</p>
        <p><strong>Location:</strong> {book.location}</p>
        <p>
          <strong>Stock:</strong>{" "}
          {book.stock > 0 ? `${book.stock} copies available` : "Out of stock"}
        </p>
        {book.nearestReturnDate && (
          <p>
            <strong>Nearest Return Date:</strong>{" "}
            {new Date(book.nearestReturnDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookDetails;