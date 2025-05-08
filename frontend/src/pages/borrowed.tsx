import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { useAuth } from "../lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
 import {jwtDecode} from "jwt-decode";
// Define typing for borrowing records
interface Borrowing {
  _id: string;
  bookId: {
    _id: string;
    bookTitle: string;
    author: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  bookTitle: string;
  borrowedAt: string;
  returnDate: string;
  returned: boolean;
  returnedAt?: string;
}

const BorrowingsPage: React.FC = () => {
  const [activeBorrowings, setActiveBorrowings] = useState<Borrowing[]>([]);
  const [overdueBorrowings, setOverdueBorrowings] = useState<Borrowing[]>([]);
  const [allBorrowings, setAllBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const router = useRouter();
  const { userId, username, role, handleSignOut } = useAuth();
  const [session, setSession] = useState<any>({});
  const [token, setToken] = useState<string | null>(null);
 


  // Redirect if not admin
  useEffect(() => {
    if (role !== "admin") {
      router.push("/");
    }
        const storedToken = localStorage.getItem("token");
       setToken(storedToken);

       if (storedToken) {
         try {
           const decodedSession = jwtDecode(storedToken);
           setSession(decodedSession);
           console.log("session in borrowed", decodedSession);
           console.log("token", storedToken);
           
           const username = session.name;
           console.log("username", username);
         } catch (error) {
           console.error("Invalid token", error);
         }
       }

  }, [role, router]);

  // Fetch borrowings data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all types of borrowings
        const [allRes, activeRes, overdueRes] = await Promise.all([
          axios.get("http://localhost:5000/borrowed"),
          axios.get("http://localhost:5000/borrowed/active"),
          axios.get("http://localhost:5000/borrowed/overdue")
        ]);

        setAllBorrowings(allRes.data);
        setActiveBorrowings(activeRes.data);
        setOverdueBorrowings(overdueRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching borrowings:", err);
        setError("Failed to load borrowings data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle returning a book
  const handleReturnBook = async (borrowingId: string) => {
    try {
      // Get book info before return for the success message
      const borrowing = allBorrowings.find(b => b._id === borrowingId);
      const bookTitle = borrowing?.bookId?.bookTitle || borrowing?.bookTitle || "Book";
      const borrowerName = borrowing?.userId?.name || "User";
      
      await axios.put(`http://localhost:5000/borrowed/return/${borrowingId}`);
      
      // Show success toast
      toast.success(`Book "${bookTitle}" has been successfully returned by ${borrowerName}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Refresh data after returning book
      const [allRes, activeRes, overdueRes] = await Promise.all([
        axios.get("http://localhost:5000/borrowed"),
        axios.get("http://localhost:5000/borrowed/active"),
        axios.get("http://localhost:5000/borrowed/overdue")
      ]);

      setAllBorrowings(allRes.data);
      setActiveBorrowings(activeRes.data);
      setOverdueBorrowings(overdueRes.data);
      
    } catch (err) {
      console.error("Error returning book:", err);
      setError("Failed to return the book");
      toast.error("Failed to return the book", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Handle issuing a warning
  const handleIssueWarning = (borrowing: Borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsPopupOpen(true);
  };

  const handleSendWarning = async () => {
    if (!selectedBorrowing) return;

    try {
      const token = localStorage.getItem("token"); // Retrieve the token from localStorage
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
      console.log("Sending notification data:", {
  from: username,
  body: warningText,
  borrowId: selectedBorrowing._id,
});

      await axios.post(
        "http://localhost:5000/notifications",
        {
          from: username,
          body: warningText,
          borrowId: selectedBorrowing._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      toast.success(`Warning sent to ${selectedBorrowing.userId?.name || "user"}`, {
        position: "top-right",
        autoClose: 3000,
      });

      setIsPopupOpen(false);
      setWarningText("");
    } catch (error) {
      console.error("Error sending warning:", error);
      toast.error("Failed to send warning", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setWarningText("");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate if a borrowing is overdue
  const isOverdue = (returnDate: string) => {
    return new Date(returnDate) < new Date();
  };

  // Render borrowing card
  const renderBorrowingCard = (borrowing: Borrowing) => {
    const showIssueWarning = isOverdue(borrowing.returnDate) && !borrowing.returned;

    return (
      <div 
        key={borrowing._id} 
        className={`p-4 mb-4 rounded-lg shadow ${
          borrowing.returned 
            ? 'bg-green-50 border border-green-200' 
            : isOverdue(borrowing.returnDate) 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-white border border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">
              {borrowing.bookId?.bookTitle || borrowing.bookTitle}
            </h3>
            <p className="text-sm text-gray-600">
              {borrowing.bookId?.author && <>Author: {borrowing.bookId.author}</>}
            </p>
            <p className="text-sm text-gray-600">
              Borrower: {borrowing.userId?.name || "Unknown"}
            </p>
            <p className="text-sm text-gray-600">
              Email: {borrowing.userId?.email || "Unknown"}
            </p>
            <div className="mt-2 text-sm">
              <p>Borrowed: {formatDate(borrowing.borrowedAt)}</p>
              <p className={isOverdue(borrowing.returnDate) && !borrowing.returned ? "text-red-600 font-medium" : ""}>
                Due: {formatDate(borrowing.returnDate)}
              </p>
              {borrowing.returned && borrowing.returnedAt && (
                <p className="text-green-600">
                  Returned: {formatDate(borrowing.returnedAt)}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {!borrowing.returned && (
              <Button 
                onClick={() => handleReturnBook(borrowing._id)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Mark as Returned
              </Button>
            )}

            {showIssueWarning && (
              <Button 
                onClick={() => handleIssueWarning(borrowing)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Issue Warning
              </Button>
            )}

            {borrowing.returned && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Returned
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // If not admin, don't render
  if (role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header username={username} role={role} handleSignOut={handleSignOut} userId={userId} />
      
      {/* Toast Container for notifications */}
      <ToastContainer />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Borrowings Management</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Loading borrowings data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active">
                Active ({activeBorrowings.length})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({overdueBorrowings.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Borrowings ({allBorrowings.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <div className="space-y-4">
                {activeBorrowings.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No active borrowings</p>
                ) : (
                  activeBorrowings.map(renderBorrowingCard)
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="overdue">
              <div className="space-y-4">
                {overdueBorrowings.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No overdue borrowings</p>
                ) : (
                  overdueBorrowings.map(renderBorrowingCard)
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all">
              <div className="space-y-4">
                {allBorrowings.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No borrowings found</p>
                ) : (
                  allBorrowings.map(renderBorrowingCard)
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Warning Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-2">Issue Warning</h2>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              value={warningText}
              onChange={(e) => setWarningText(e.target.value)}
              placeholder="Type your warning message here..."
            />
            <div className="flex justify-end mt-4">
              <Button
                className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                onClick={handleClosePopup}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSendWarning}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowingsPage;