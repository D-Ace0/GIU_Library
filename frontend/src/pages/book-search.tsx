import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../components/ui/button";
import { Bell } from "lucide-react";
import Header from "../components/Header";
import { useAuth } from "../lib/hooks"; // Assuming you have a useAuth hook to get user info            
import {jwtDecode} from "jwt-decode"; // Import jwtDecode for session handling

const BookSearch: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalClass, setModalClass] = useState("modal-enter");
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [orderOption, setOrderOption] = useState("asc"); // DEFAULT A-Z
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [requestedBookIds, setRequestedBookIds] = useState<string[]>([]);

  // Assume session stored in localStorage
  
  
   const [session, setSession] = useState<any>({});
    const [token, setToken] = useState<string | null>(null);
   
     useEffect(() => {
       // Access localStorage only on the client
       const storedToken = localStorage.getItem("token");
       setToken(storedToken);
   
       if (storedToken) {
         try {
           const decodedSession = jwtDecode(storedToken);
           setSession(decodedSession);
           console.log("session", decodedSession);
           console.log("token", storedToken);
         } catch (error) {
           console.error("Invalid token", error);
         }
       }
     }, []);
  
    const username = session?.name || "User";
    const role = session?.role || "user";
    const userId = session?.user_id || "userId";  

    console.log("username", session);

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

  useEffect(() => {
    let filtered = [...books];
  
    // 🧹 Filtering
    if (sortOption === "stock") {
      // Only FILTER to books with stock > 0
      filtered = filtered.filter((book: any) => book.stock > 0);
    } else if (selectedValue) {
      // Otherwise, filter by selectedValue
      filtered = filtered.filter((book: any) =>
        (book[sortOption]?.toLowerCase() || "").includes(selectedValue.toLowerCase())
      );
    }
  
    // Search always applies
    if (searchQuery) {
      filtered = filtered.filter((book: any) =>
        book.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.publisher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  
    // 🧹 Sorting
    filtered.sort((a: any, b: any) => {
      // 👇 ALWAYS sort alphabetically based on bookTitle
      const aVal = a.bookTitle?.toLowerCase() || "";
      const bVal = b.bookTitle?.toLowerCase() || "";
  
      if (aVal < bVal) return orderOption === "asc" ? -1 : 1;
      if (aVal > bVal) return orderOption === "asc" ? 1 : -1;
      return 0;
    });
  
    setFilteredBooks(filtered);
  }, [books, searchQuery, sortOption, orderOption, selectedValue]);  
  

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showModal]);

  useEffect(() => {
    if (userId && token) {
      const fetchSavedBooks = async () => {
        try {
          const res = await fetch(`http://localhost:5000/users/${userId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            throw new Error("Failed to fetch saved books");
          }
          const data = await res.json();
          // 🛠 IMPORTANT: data.savedBooks might be objects, extract _id
          const bookIds = data.savedBooks.map((book: any) => (book._id ? book._id : book));
          setSavedBookIds(bookIds || []);
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchSavedBooks();
    }
  }, [userId, token]);

  useEffect(() => {
    const fetchRequestedBooks = async () => {
      if (!userId || !token) return;
      try {
        const res = await fetch(`http://localhost:5000/requests/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const bookIds = data.map((req: any) => {
          const id = req.bookId;
          // 🛠 handle if bookId is an object { _id: "xxx" } or similar
          if (typeof id === "object" && id._id) return id._id;
          if (typeof id === "object" && id.$oid) return id.$oid;
          return id; // if it's already a string
        });
        setRequestedBookIds(bookIds);
      } catch (err) {
        console.error("Failed to load requested books", err);
      }
    };
  
    fetchRequestedBooks();
  }, [userId, token]); 
  

  const openModal = async (book: any) => {
  setSelectedBook(book); 
  setShowModal(true);
  setModalClass("modal-enter");
  
  setTimeout(() => setModalClass("modal-enter-active"), 10);
};

   
  
  const closeModal = () => {
    setModalClass("modal-exit-active");
    setTimeout(() => {
      setShowModal(false);
      setSelectedBook(null);
      setModalClass("modal-enter"); // reset class for next time
    }, 300); // match the transition duration
  };  
  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleSave = (bookId: string) => {
    const isAlreadySaved = savedBookIds.includes(bookId);
  
    if (isAlreadySaved) {
      // ❌ UNSAVE
      fetch(`http://localhost:5000/book/${userId}/unsave/${bookId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Unsave response:", data);
          alert("Book removed from saved list!");
          setSavedBookIds((prev) => prev.filter((id) => id !== bookId)); // ❌ remove id
        })
        .catch((err) => {
          console.error("Unsave failed:", err);
          alert("Failed to unsave book.");
        });
    } else {
      // ✅ SAVE
      fetch(`http://localhost:5000/book/${userId}/save/${bookId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Save response:", data);
          alert("Book saved successfully!");
          setSavedBookIds((prev) => [...prev, bookId]); // ✅ add id
        })
        .catch((err) => {
          console.error("Save failed:", err);
          alert("Failed to save book.");
        });
    }
  };  

  //ADMIN PAGE
  if (role == "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold text-red-600">🚧 Admin book page under construction 🚧</h1>
      </div>
    );
  }
  
  //USER PAGE
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <Header username={username} role={role} handleSignOut={handleSignOut}userId={userId} />

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

          {/* Filtering and Sorting Options */}
          <div className="flex gap-4 mt-4">
            {/* Filter Field Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => {
                const field = e.target.value;
                setSortOption(field);
                setSelectedValue(""); // Reset selected value
                if (field && field !== "stock") {
                  const uniqueValues = Array.from(new Set(books.map((book: any) => book[field]).filter(Boolean)));
                  setAvailableOptions(uniqueValues);
                } else {
                  setAvailableOptions([]);
                }
              }}
              className="p-2 w-48 border-2 rounded-full bg-white text-black hover:bg-gray-100 transition-all duration-300"
            >
              <option value="">Pick a category</option>
              <option value="author">Author</option>
              <option value="publisher">Publisher</option>
              <option value="language">Language</option>
              <option value="location">Location</option>
              <option value="stock">In Stock</option>
            </select>
            
            {true && (
            <select
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            className="p-2 w-48 border-2 rounded-full bg-white text-black hover:bg-gray-100 transition-all duration-300"
          >          
              <option value="">Choose from list</option>
              {availableOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            
          )}
          <button
              onClick={() => setOrderOption((prev) => (prev === "asc" ? "desc" : "asc"))}
              className="px-4 py-2 rounded-full border-2 font-bold transition-all duration-300 bg-white text-black hover:bg-black hover:text-white"
            >
              {orderOption === "asc" ? "A → Z" : "Z → A"}
            </button>
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
                {role === "user" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ IMPORTANT: prevent openModal
                      handleSave(book._id);
                    }}
                    className="mt-2 p-2 rounded-full bg-transparent hover:bg-gray-200 transition-all duration-300"
                    >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={savedBookIds.includes(book._id) ? "black" : "none"}
                      viewBox="0 0 24 24"
                      stroke="black"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.682l-7.682-7.682a4.5 4.5 0 010-6.364z"
                      />
                    </svg>
                  </button>                
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
      <div className="sticky top-0 z-50 flex justify-end items-center p-2">
        <button
          onClick={closeModal}
          className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full"
        >
          ✕
        </button>
      </div>


      {/* Book Summary + Image */}
      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        <div className="flex flex-col gap-4 w-full lg:w-1/3">
          <div className="bg-gray-200 h-60 rounded-xl shadow-lg flex items-center justify-center">
            <img
              src={selectedBook.image_url}
              alt={selectedBook.bookTitle}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          {selectedBook.stock === 0 ? (
            <button
              disabled
              className="py-2 px-4 rounded-xl border-2 font-bold bg-gray-300 text-gray-600 cursor-not-allowed"
            >
              Out of stock
            </button>
          ) : requestedBookIds.includes(selectedBook._id) ? (
            <button
              disabled
              className="py-2 px-4 rounded-xl border-2 font-bold bg-gray-300 text-gray-600 cursor-not-allowed"
            >
              Requested
            </button>
          ) : (
            <button
              onClick={async () => {
                if (!token) return alert("You must be logged in to request a book.");
                if (!selectedBook?._id) return alert("Book data missing.");

                try {
                  const res = await fetch("http://localhost:5000/requests", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      userId: userId,
                      bookId: selectedBook._id,
                    }),
                  });

                  if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || "Failed to send request.");
                  }

                  alert("✅ Book request submitted successfully!");
                  setRequestedBookIds((prev) => [...prev, selectedBook._id]);
                } catch (error: any) {
                  console.error(error);
                  if (error.message.includes("Request already exists")) {
                    alert("⚠️ You already requested this book.");
                    setRequestedBookIds((prev) => [...prev, selectedBook._id]);
                  } else {
                    alert("❌ Failed to submit book request.");
                  }
                }
              }}
              className="py-2 px-4 rounded-xl border-2 font-bold bg-white text-black border-black hover:bg-black hover:text-white transition-all duration-500 ease-in-out"
            >
              Request
            </button>
          )}

        </div>

        <div className="bg-gray-100 rounded-xl p-4 shadow-lg flex-1">
          <h2 className="font-bold text-2xl text-black">Book Summary</h2>
          <p className="mt-2">{selectedBook.summary}</p>
        </div>
      </div>

      {/* Book Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 text-gray-800">
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl text-black">Author</p>
          <p className="mt-2">{selectedBook.author}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl text-black">Publisher</p>
          <p className="mt-2">{selectedBook.publisher}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl text-black">Categories</p>
          <p className="mt-2">{selectedBook.category}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl text-black">Page Count</p>
          <p className="mt-2">{selectedBook.pageCount}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl text-black">Language</p>
          <p className="mt-2">{selectedBook.language}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl text-black">Location</p>
          <p className="mt-2">{selectedBook.location}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 shadow-lg">
          <p className="font-bold text-2xl text-black">Stock</p>
          <p className="mt-2">{selectedBook.stock}</p>
        </div>
      </div>
      {/* Review Section */}
<div className="flex flex-col items-center mt-10">
  {/* Rating Stars */}
  <div className="flex mb-4">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        xmlns="http://www.w3.org/2000/svg"
        fill={reviewRating >= star ? "black" : "none"} // FILLED if clicked
        viewBox="0 0 24 24"
        stroke="black"
        className="w-8 h-8 mx-1 cursor-pointer hover:scale-110 transition-all duration-300"
        onClick={() => setReviewRating(star)} // ✅ set clicked rating
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        />
      </svg>
    ))}
  </div>
      {/* Review TextBox */}
      <textarea
        placeholder="Write your review here..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        className="w-full max-w-md h-32 p-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black resize-none mb-4"
      />

      {/* Add Review Button */}
      <button
        onClick={async () => {
          if (!token) return alert("You must be logged in.");
          if (!selectedBook?.bookTitle) return alert("❌ Book title is missing. Cannot submit review.");
          if (reviewRating === 0 || reviewText.trim() === "") return alert("❌ Please provide a rating and a review.");
        
          try {           
            const res = await fetch(`http://localhost:5000/reviews/${userId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                bookId: selectedBook._id,
                BookTitle: selectedBook.bookTitle,
                rating: reviewRating,
                reviewText: reviewText,
                userId: userId,
              }),
            });
        
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || "Failed to add review.");
            }
        
            alert("✅ Review submitted successfully!");
            setReviewRating(0);
            setReviewText("");
          } catch (err) {
            console.error(err);
            alert("❌ Failed to submit review.");
          }
        }}
        
        className="py-2 px-6 rounded-xl border-2 font-bold bg-white text-black border-black hover:bg-black hover:text-white transition-all duration-500 ease-in-out"
      >
        Add Review
      </button>

    </div>
    </div>
  </div>
)}
    </div>
  );
};

export default BookSearch;