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
  const [bookReviews, setBookReviews] = useState<any[]>([]);
  const totalRatings = bookReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  const averageRating = bookReviews.length > 0 ? (totalRatings / bookReviews.length).toFixed(1) : "Not rated yet";
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState<any>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBookData, setNewBookData] = useState({
    bookTitle: "",
    author: "",
    summary: "",
    publisher: "",
    language: "",
    pageCount: 0,
    image_url: "",
    category: "",
    stock: 0,
    location: "",
  });
  
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

  useEffect(() => {
    const fetchBookReviews = async () => {
      if (!selectedBook?.bookTitle) return;
      try {
        const res = await fetch(`http://localhost:5000/reviews/${selectedBook.bookTitle}`);
        if (!res.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await res.json();
        setBookReviews(data); // ✅ Save reviews
      } catch (err) {
        console.error("Failed to load reviews:", err);
        setBookReviews([]); // If error, empty list
      }
    };
  
    fetchBookReviews();
  }, [selectedBook]);
  

  const openModal = async (book: any) => {
  setSelectedBook(book); 
  setShowModal(true);
  setModalClass("modal-enter");
  setUpdateData(book);
  
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
              <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-6 right-6 bg-black text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-white hover:text-black transition-all duration-300 z-50"
              >
                + Add Book
              </button>
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
            <div className="flex gap-4">
              <button
                onClick={() => setShowUpdateModal(true)}
                className="w-1/2 py-2 px-4 rounded-xl border-2 font-bold bg-white text-black border-black hover:bg-black hover:text-white transition-all duration-500 ease-in-out"
              >
                Update Book
              </button>
              <button
                onClick={async () => {
                  const confirmDelete = confirm(`Are you sure you want to delete "${selectedBook.bookTitle}"?`);
                  if (!confirmDelete) return;

                  try {
                    const res = await fetch(`http://localhost:5000/book/${selectedBook.bookTitle}`, {
                      method: "DELETE",
                      headers: {
                        "Authorization": `Bearer ${token}`,
                      },
                    });
                    if (!res.ok) {
                      const errData = await res.json();
                      alert("❌ Failed to delete: " + errData.message);
                      return;
                    }
                    alert(`✅ "${selectedBook.bookTitle}" deleted successfully.`);
                    setShowModal(false);
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                    alert("❌ Failed to delete the book.");
                  }
                }}
                className="w-1/2 py-2 px-4 rounded-xl border-2 font-bold bg-white text-black border-red-500 hover:bg-red-600 hover:text-white transition-all duration-500 ease-in-out"
              >
                Delete Book
              </button>
            </div>

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
      <div className="mt-10 w-full max-h-60 overflow-y-auto border rounded-lg p-4 bg-white shadow-inner">
  <h3 className="text-2xl font-bold text-black mb-4">User Reviews</h3>
  {bookReviews.length > 0 ? (
    <div className="space-y-4">
      {bookReviews.map((review, index) => (
        <div key={index} className="border rounded p-3 bg-gray-100">
          <p className="font-bold text-black">{review.Username}</p>
          <p className="text-gray-800 italic">Comment: {review.reviewText}</p>
          <p className="text-yellow-600">Rating: {review.rating}</p>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-600">No reviews yet for this book.</p>
  )}
</div>

      </div>
    </div>
    
  )}

{showUpdateModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-lg w-[1000px] max-h-screen overflow-y-auto">
      <h2 className="text-3xl font-bold mb-4 text-black">Update Book</h2>

      {/* Book Title */}
      <label className="font-bold text-black">Book Title</label>
      <input
        type="text"
        value={updateData.bookTitle}
        onChange={(e) => setUpdateData({ ...updateData, bookTitle: e.target.value })}
        className="w-full mb-3 p-2 border rounded"
      />

      {/* Summary */}
      <label className="font-bold text-black">Summary</label>
      <textarea
        value={updateData.summary}
        onChange={(e) => setUpdateData({ ...updateData, summary: e.target.value })}
        className="w-full mb-3 p-2 border rounded"
      />

      {/* Author */}
      <label className="font-bold text-black">Author</label>
      <input
        type="text"
        value={updateData.author}
        onChange={(e) => setUpdateData({ ...updateData, author: e.target.value })}
        className="w-full mb-3 p-2 border rounded"
      />

      {/* Publisher */}
      <label className="font-bold text-black">Publisher</label>
      <input
        type="text"
        value={updateData.publisher}
        onChange={(e) => setUpdateData({ ...updateData, publisher: e.target.value })}
        className="w-full mb-3 p-2 border rounded"
      />

      {/* Language */}
      <label className="font-bold text-black">Language</label>
      <input
        type="text"
        value={updateData.language}
        onChange={(e) => setUpdateData({ ...updateData, language: e.target.value })}
        className="w-full mb-3 p-2 border rounded"
      />

      {/* Page Count */}
      <label className="font-bold text-black">Page Count</label>
      <input
        type="number"
        value={updateData.pageCount}
        onChange={(e) => setUpdateData({ ...updateData, pageCount: parseInt(e.target.value) })}
        className="w-full mb-3 p-2 border rounded"
      />

      {/* Image URL */}
      <label className="font-bold text-black">Image URL</label>
      <input
        type="text"
        value={updateData.image_url}
        onChange={(e) => setUpdateData({ ...updateData, image_url: e.target.value })}
        className="w-full mb-3 p-2 border rounded"
      />

      {/* Category */}
      <label className="font-bold text-black">Category</label>
      <input
        type="text"
        value={updateData.category}
        onChange={(e) => setUpdateData({ ...updateData, category: e.target.value })}
        className="w-full mb-3 p-2 border rounded"
      />

      {/* Stock */}
      <label className="font-bold text-black">Stock</label>
      <input
        type="number"
        value={updateData.stock}
        onChange={(e) => setUpdateData({ ...updateData, stock: parseInt(e.target.value) })}
        className="w-full mb-3 p-2 border rounded"
      />

      {/* Location */}
      <label className="font-bold text-black">Location</label>
      <input
        type="text"
        value={updateData.location}
        onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
        className="w-full mb-3 p-2 border rounded"
      />

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={async () => {
            const res = await fetch(`http://localhost:5000/book/${selectedBook.bookTitle}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(updateData),
            });
            if (!res.ok) {
              const errData = await res.json();
              alert("❌ Failed to update: " + errData.message);
              return;
            }
            alert("✅ Book updated!");
            setShowUpdateModal(false);
            window.location.reload();
          }}
          className="py-2 px-4 rounded-xl border-2 font-bold bg-white text-black border-black hover:bg-black hover:text-white transition-all duration-500 ease-in-out"
        >
          Save
        </button>
        <button
          onClick={() => setShowUpdateModal(false)}
          className="py-2 px-4 rounded-xl border-2 font-bold bg-gray-300 text-black hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
{showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-lg w-[1000px] max-h-screen overflow-y-auto">
      <h2 className="text-3xl font-bold mb-4 text-black">Add New Book</h2>

      {/* FORM FIELDS */}
      {[
        { label: "Book Title", key: "bookTitle" },
        { label: "Author", key: "author" },
        { label: "Summary", key: "summary", type: "textarea" },
        { label: "Publisher", key: "publisher" },
        { label: "Language", key: "language" },
        { label: "Page Count", key: "pageCount", type: "number" },
        { label: "Image URL", key: "image_url" },
        { label: "Category", key: "category" },
        { label: "Stock", key: "stock", type: "number" },
        { label: "Location", key: "location" },
      ].map(({ label, key, type }) => (
        <div key={key} className="mb-3">
          <label className="font-bold text-black">{label}</label>
          {type === "textarea" ? (
            <textarea
              value={newBookData[key]}
              onChange={(e) => setNewBookData({ ...newBookData, [key]: e.target.value })}
              className="w-full p-2 border rounded"
            />
          ) : (
            <input
              type={type || "text"}
              value={newBookData[key]}
              onChange={(e) =>
                setNewBookData({ ...newBookData, [key]: type === "number" ? parseInt(e.target.value) || 0 : e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          )}
        </div>
      ))}

      {/* BUTTONS */}
      <div className="flex justify-between mt-4">
        <button
          onClick={async () => {
            try {
              const res = await fetch(`http://localhost:5000/book`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newBookData),
              });
              if (!res.ok) {
                const errData = await res.json();
                alert("❌ Failed to add book: " + errData.message);
                return;
              }
              alert("✅ Book added successfully!");
              setShowAddModal(false);
              window.location.reload();
            } catch (err) {
              console.error(err);
              alert("❌ Failed to add book.");
            }
          }}
          className="py-2 px-4 rounded-xl border-2 font-bold bg-white text-black border-black hover:bg-black hover:text-white transition-all duration-500 ease-in-out"
        >
          Add Book
        </button>
        <button
          onClick={() => setShowAddModal(false)}
          className="py-2 px-4 rounded-xl border-2 font-bold bg-gray-300 text-black hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

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
        
        {/* Reviews Section */}
      <div className="mt-10 w-full max-h-60 overflow-y-auto border rounded-lg p-4 bg-white shadow-inner">
  <h3 className="text-2xl font-bold text-black mb-4">User Reviews</h3>
  {bookReviews.length > 0 ? (
    <div className="space-y-4">
      {bookReviews.map((review, index) => (
        <div key={index} className="border rounded p-3 bg-gray-100">
          <p className="font-bold text-black">{review.Username}</p>
          <p className="text-gray-800 italic">{review.reviewText}</p>
          <p className="text-yellow-600">Rating: {review.rating}</p>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-600">No reviews yet for this book.</p>
  )}
</div>

      {/* Review Section */}
      <div className="flex flex-col items-center mt-10">
      {/* Rating Stars */}
      <div className="flex mb-4 items-center gap-4">
        <div className="flex">
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
        <div className="text-xl font-bold text-black">
          Rating: {averageRating} / 5
        </div>
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