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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalClass, setModalClass] = useState("modal-enter");

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

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showModal]);
  

  const openModal = (book: any) => {
    setSelectedBook(book);
    setShowModal(true);
    setTimeout(() => setModalClass("modal-enter-active"), 10); // trigger animation
  };
  
  const closeModal = () => {
    setModalClass("modal-exit-active");
    setTimeout(() => {
      setShowModal(false);
      setSelectedBook(null);
      setModalClass("modal-enter"); // reset class for next time
    }, 300); // match the transition duration
  };  

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
                onClick={() => openModal(book)}
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
            <p className="text-gray-700 col-span-full text-center">No books found</p>
          )}

          {/* Add empty placeholders to maintain layout */}
          {filteredBooks.length < 6 &&
            Array.from({ length: 6 - filteredBooks.length }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="p-4 border border-transparent rounded bg-transparent"
              ></div>
            ))}
        </div>
      </main>

      {/* Modal */}
      {showModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className={`bg-white w-full h-full overflow-y-auto p-8 relative ${modalClass}`}>
      {/* Close Button */}
      <div className="flex justify-end">
        <button
          onClick={closeModal}
          className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full"
        >
          ✕
        </button>
      </div>

      {/* Book Summary + Image */}
      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        <div className="bg-gray-200 w-full lg:w-1/3 h-60 rounded-xl shadow-lg flex items-center justify-center">
          <img
            src={selectedBook.image_url}
            alt={selectedBook.bookTitle}
            className="w-full h-full object-cover rounded"
          />
        </div>
        <div className="bg-black text-white p-4 rounded-xl shadow-lg flex-1">
          <h2 className="text-xl font-bold mb-2">Book Summary</h2>
          <p>{selectedBook.summary}</p>
        </div>
      </div>

      {/* Book Title */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-black">{selectedBook.bookTitle}</h1>
      </div>

      {/* Book Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 text-gray-800">
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl">Author</p>
          <p className="mt-2">{selectedBook.author}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl">Publisher</p>
          <p className="mt-2">{selectedBook.publisher}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl">Categories</p>
          <p className="mt-2">{selectedBook.category}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl">Page Count</p>
          <p className="mt-2">{selectedBook.pageCount}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl">Language</p>
          <p className="mt-2">{selectedBook.language}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl">Location</p>
          <p className="mt-2">{selectedBook.location}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl">Stock</p>
          <p className="mt-2">{selectedBook.stock}</p>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default BookSearch;