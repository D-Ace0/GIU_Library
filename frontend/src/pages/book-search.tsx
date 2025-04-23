import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "../component/ui/button";
import { Bell } from "lucide-react";

const BookSearch: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`http://localhost:5000/book/search/${searchQuery}`, {
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
    } catch (err: any) {
      setError(err.message);
    }
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
      <main className="flex-grow p-8">
        <h1 className="text-3xl font-bold mb-6">Search for Books</h1>
        <form onSubmit={handleSearch} className="mb-6">
          <input
            type="text"
            placeholder="Enter book title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <Button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Search
          </Button>
        </form>
        {error && <p className="text-red-500">{error}</p>}
        <div>
          {books.length > 0 ? (
            <ul className="space-y-4">
              {books.map((book: any) => (
                <li key={book._id} className="p-4 border border-gray-300 rounded">
                  <h2 className="text-xl font-bold">{book.bookTitle}</h2>
                  <p>Author: {book.author}</p>
                  <p>Language: {book.language}</p>
                  <p>Category: {book.category}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No books found</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookSearch;