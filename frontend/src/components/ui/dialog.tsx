import React, { useState, useRef, useEffect } from "react"; 
import { useRouter } from "next/router"; 
import { Button } from "./button"; 
import { Bell, X } from "lucide-react";

interface HeaderProps {
  username: string;
  role: string;
  handleSignOut: () => void;
  notifications?: Notification[]; // Optional array of notifications
}

// Define a type for notifications
interface Notification {
  id: string;
  message: string;
  date: string;
  read: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  username, 
  role, 
  handleSignOut,
  notifications = [] // Default to empty array if not provided
}) => {
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white p-4 flex items-center justify-between shadow">
      <img
        src="https://c.animaapp.com/m9mtpk9gsPKuRT/img/giu.png"
        alt="GIU Logo"
        className="h-12"
        onClick={() => router.push("/")}
        style={{ cursor: "pointer" }}
      />
      <nav className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/book-search")}>
          Books
        </Button>
        <Button variant="ghost" onClick={() => router.push("/contact")}>
          Contact
        </Button>
        <Button variant="ghost" onClick={() => router.push("/account")}>
          AccountInfo
        </Button>
        
        {role === "admin" && (
          <>
            <Button variant="ghost" onClick={() => router.push("/books-panel")}>
              BooksPanel
            </Button>
            <Button variant="ghost" onClick={() => router.push("/borrowed")}>
              Borrowed
            </Button>
            <Button variant="ghost" onClick={() => router.push("/requests")}>
              Requests
            </Button>
          </>
        )}
      </nav>
      <div className="flex items-center gap-4">
        <span className="text-gray-700">Hello, {username}</span>
        <div className="relative">
          <Button 
            variant="ghost" 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
          
          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div 
              ref={notificationRef}
              className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <h3 className="font-medium">Notifications</h3>
                <button 
                  onClick={() => setNotificationsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <li 
                        key={notification.id} 
                        className={`p-3 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-8">No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>
        <Button
          onClick={handleSignOut}
          className="bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg shadow-md"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
};

export default Header;