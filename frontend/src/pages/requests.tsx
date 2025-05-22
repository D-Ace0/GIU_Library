import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { useAuth } from "../lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define typing for request records
interface BookRequest {
  _id: string;
  bookId: {
    _id: string;
    bookTitle: string;
    author: string;
  };
  userId: {
    _id: string;
    name?: string;
    email: string;
    username?: string;
  };
  status: "pending" | "approved" | "rejected";
  requestDate?: string;
  createdAt?: string;  // Added to match API response
}

// Dialog component for date picker
const DatePickerDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  bookTitle 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (days: number) => void;
  bookTitle: string;
}) => {
  const [returnDate, setReturnDate] = useState<string>("");
  const today = new Date();
  
  // Calculate default date (14 days from today)
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(today.getDate() + 14);
    setReturnDate(defaultDate.toISOString().split('T')[0]);
  }, []);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const selectedDate = new Date(returnDate);
    const diffTime = Math.abs(selectedDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    onConfirm(diffDays);
  };

  // Calculate min date (today)
  const minDate = today.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Set Return Date for "{bookTitle}"</h3>
        <div className="mb-4">
          <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">
            Return Date
          </label>
          <input
            type="date"
            id="returnDate"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={returnDate}
            min={minDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Confirm Loan
          </Button>
        </div>
      </div>
    </div>
  );
};

const RequestsPage: React.FC = () => {
  const [allRequests, setAllRequests] = useState<BookRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BookRequest | null>(null);
  const router = useRouter();
  const { userId, username, role, handleSignOut } = useAuth();

  // Redirect if not admin
  // useEffect(() => {
  //   if (role !== "admin") {
  //     router.push("/");
  //   }
  // }, [role, router]);

  // Fetch requests data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all requests and pending requests
        const [allRes, pendingRes] = await Promise.all([
          axios.get("http://localhost:5000/requests"),
          axios.get("http://localhost:5000/requests/pending")
        ]);

        setAllRequests(allRes.data);
        setPendingRequests(pendingRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open dialog to set return date for approval
  const openApprovalDialog = (request: BookRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  // Handle approving a request with specified return days
  const handleApproveRequest = async (requestId: string, returnDays: number) => {
    console.log("Request ID:", requestId);
    console.log("Return Days:", returnDays);
    try {
      await axios.post(`http://localhost:5000/borrowed/from-request/${requestId}`, {
        returnDays: returnDays
      });
      
      // Get book title and borrower email for success message
      const request = allRequests.find(req => req._id === requestId);
      if (request) {
        const bookTitle = request.bookId?.bookTitle || "Book";
        const borrowerEmail = request.userId?.email || "User";
        console.log("hello request",request._id);
        
        // Show success toast
        toast.success(`Approved loan request for "${bookTitle}" by ${borrowerEmail}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      // Refresh data after approving request
      const [allRes, pendingRes] = await Promise.all([
        axios.get("http://localhost:5000/requests"),
        axios.get("http://localhost:5000/requests/pending")
      ]);

      setAllRequests(allRes.data);
      setPendingRequests(pendingRes.data);
      
    } catch (err) {
      console.error("Error approving request:", err);
      setError("Failed to approve the request");
      toast.error("Failed to approve the request", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Handle rejecting a request
  const handleRejectRequest = async (requestId: string) => {
    try {
      // Get book title and borrower email for notification before removing
      const request = allRequests.find(req => req._id === requestId);
      let bookTitle = "Book";
      let borrowerEmail = "User";
      
      if (request) {
        bookTitle = request.bookId?.bookTitle || "Book";
        borrowerEmail = request.userId?.email || "User";
      }
      
      // Since we don't have a direct reject endpoint, we can delete the request
      await axios.delete(`http://localhost:5000/requests/${requestId}`);
      
      // Show rejection message
      toast.info(`Rejected loan request for "${bookTitle}" by ${borrowerEmail}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Refresh data after rejecting request
      const [allRes, pendingRes] = await Promise.all([
        axios.get("http://localhost:5000/requests"),
        axios.get("http://localhost:5000/requests/pending")
      ]);

      setAllRequests(allRes.data);
      setPendingRequests(pendingRes.data);
      
    } catch (err) {
      console.error("Error rejecting request:", err);
      setError("Failed to reject the request");
      toast.error("Failed to reject the request", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "";
    }
  };

  // Render request card
  const renderRequestCard = (request: BookRequest) => {
    // Get the date from either requestDate or createdAt
    const requestDateStr = request.requestDate || request.createdAt;
    
    return (
      <div 
        key={request._id} 
        className={`p-4 mb-4 rounded-lg shadow ${
          request.status === "approved" 
            ? 'bg-green-50 border border-green-200' 
            : request.status === "rejected"
              ? 'bg-red-50 border border-red-200' 
              : 'bg-white border border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">
              {request.bookId?.bookTitle || "Unknown Book"}
            </h3>
            {request.bookId?.author && (
              <p className="text-sm text-gray-600">
                Author: {request.bookId.author}
              </p>
            )}
            {request.userId?.email && (
              <p className="text-sm text-gray-600">
                Requester Email: {request.userId.email}
              </p>
            )}
            <div className="mt-2 text-sm">
              {requestDateStr && (
                <p>Requested: {formatDate(requestDateStr)}</p>
              )}
              <p className={`font-medium ${
                request.status === "approved" 
                  ? "text-green-600" 
                  : request.status === "rejected" 
                    ? "text-red-600" 
                    : "text-yellow-600"
              }`}>
                Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </p>
            </div>
          </div>
          
          {request.status === "pending" && (
            <div className="space-x-2">
              <Button 
                onClick={() => openApprovalDialog(request)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve
              </Button>
              <Button 
                onClick={() => handleRejectRequest(request._id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Reject
              </Button>
            </div>
          )}
          
          {request.status === "approved" && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Approved
            </span>
          )}
          
          {request.status === "rejected" && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              Rejected
            </span>
          )}
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
        <h1 className="text-3xl font-bold mb-6">Book Requests</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Loading requests data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Requests ({allRequests.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No pending requests</p>
                ) : (
                  pendingRequests.map(renderRequestCard)
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all">
              <div className="space-y-4">
                {allRequests.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No requests found</p>
                ) : (
                  allRequests.map(renderRequestCard)
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Date Picker Dialog */}
        {selectedRequest && (
          <DatePickerDialog
            isOpen={dialogOpen}
            onClose={() => {
              setDialogOpen(false);
              setSelectedRequest(null);
            }}
            onConfirm={(days) => {
              handleApproveRequest(selectedRequest._id, days);
              setDialogOpen(false);
              setSelectedRequest(null);
            }}
            bookTitle={selectedRequest.bookId?.bookTitle || "Unknown Book"}
          />
        )}
      </div>
    </div>
  );
};

export default RequestsPage; 