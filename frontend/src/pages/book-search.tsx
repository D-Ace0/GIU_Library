import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../component/ui/button";
import { Bell } from "lucide-react";

const BookSearch: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [sortOption, setSortOption] = useState("new");
  const [error, setError] = useState<string | null>(null);

  // Assume session stored in localStorage
  const session = JSON.parse(
    typeof window !== "undefined"
      ? localStorage.getItem("session") || "{}"
      : "{}"
  );
  const username = session.username || "User";

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("session");
    router.push("/");
  };

  // Fetch all books on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:5000/book", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch books");
        }

        const data = await res.json();
        setBooks(data);
        setFilteredBooks(data); // Initially show all books
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchBooks();
  }, []);

  // Filter books live as the user types
  useEffect(() => {
    const filtered = books.filter((book: any) =>
      book.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  // Sort books based on the selected option
  useEffect(() => {
    const sortedBooks = [...filteredBooks];
    if (sortOption === "a-z") {
      sortedBooks.sort((a: any, b: any) =>
        a.bookTitle.localeCompare(b.bookTitle)
      );
    } else if (sortOption === "date") {
      sortedBooks.sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (sortOption === "rating") {
      sortedBooks.sort((a: any, b: any) => b.rating - a.rating);
    }
    setFilteredBooks(sortedBooks);
  }, [sortOption]);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white p-4 flex items-center justify-between shadow">
        <img
          src="https://c.animaapp.com/m9mtpk9gsPKuRT/img/giu.png"
          alt="GIU Logo"
          className="h-12"
        />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/book-search")}>
            Books
          </Button>
          <Button variant="ghost">Contact</Button>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Hello, {username}</span>
          <Button variant="ghost">
            <Bell className="w-5 h-5 text-gray-600" />
          </Button>
          <Button
            onClick={handleSignOut}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-8 flex flex-col items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-5xl">
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/3 p-2 border border-gray-300 rounded-full"
          />

          {/* GIU Library Title */}
          <h1 className="text-3xl font-bold text-center">
            <span className="text-black">G</span>
            <span className="text-red-600">I</span>
            <span className="text-orange-500">U</span> Library
          </h1>

          {/* Sorting Options */}
          <div className="flex gap-4">
            {["new", "a-z", "date", "rating"].map((option) => (
              <button
                key={option}
                onClick={() => setSortOption(option)}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-300 ${
                  sortOption === option
                    ? "bg-black text-white scale-105"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {sortOption === option && (
                  <span className="text-white">✔</span>
                )}
                {option === "new"
                  ? "New"
                  : option === "a-z"
                  ? "A-Z"
                  : option === "date"
                  ? "Date"
                  : "Rating"}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          style={{ minHeight: "400px" }} // Fixed height to prevent layout shift
        >
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map((book: any) => (
                        <div
            key={book._id}
            className="p-4 border border-gray-300 rounded shadow bg-white flex flex-col items-start hover:bg-gray-100 hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => router.push(`/book-details?title=${encodeURIComponent(book.bookTitle)}`)}
          >
            <img
              src={book.image_url}
              alt={book.bookTitle}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-bold mb-2 text-left">{book.bookTitle}</h2>
            {book.stock > 0 ? (
              <p className="text-green-600 text-left">Copies Available: {book.stock}</p>
            ) : (
              <p className="text-red-600 text-left">All copies are borrowed</p>
            )}
          </div>
            ))
          ) : (
            <p className="text-gray-700">No books found</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookSearch;