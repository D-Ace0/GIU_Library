import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "./ui/button";
import { Bell, X, Check, Trash2 } from "lucide-react";



interface HeaderProps {
  username: string;
  role: string;
  userId: string;
  handleSignOut: () => void;
  notifications?: Notification[]; // Optional array of notifications
}

// Define a type for notifications
interface Notification {
  id?: string;
  _id?: string;
  from: string;
  body: string;
  date: string;
  read: boolean;
}

const Header: React.FC<HeaderProps> = ({
  username,
  role,
  userId,
  handleSignOut,
  notifications = [] // Default to empty array if not provided
}) => {
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [fetchedNotifications, setFetchedNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = fetchedNotifications.filter(n => !n.read).length;

  // Fetch notifications when the dropdown is opened
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:5000/notifications/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        console.error(`Error fetching notifications: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();

      // Ensure the response is an array
      if (Array.isArray(data)) {
        console.log("Raw notification data:", JSON.stringify(data));
        
        // Map the data to ensure all notifications have an id property
        const processedNotifications = data.map(notification => {
          // Log each notification structure to identify the ID field
          console.log("Notification structure:", notification);
          
          return notification;
        });
        
        setFetchedNotifications(processedNotifications);
      } else {
        console.error("Unexpected response format:", data);
        setFetchedNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setFetchedNotifications([]);
    }
  };

  // Mark notification as read
  const markAsRead = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation(); // Prevent event bubbling
    
    console.log("Marking as read, full notification object:", notification);
    
    // Inspect the notification object to find the ID
    const notificationId = notification._id || notification.id;
    
    console.log("Extracted notification ID:", notificationId);
    
    if (!notificationId) {
      console.error("Cannot mark as read: Missing notification ID");
      return;
    }
    
    try {
      console.log(`Sending API request to mark notification ${notificationId} as read`);
      
      const response = await fetch(`http://localhost:5000/notifications/${notificationId}/mark-as-read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Mark as read response status:", response.status);

      if (!response.ok) {
        console.error(`Error marking notification as read: ${response.status}`);
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        return;
      }

      // Update the local state to reflect the change
      setFetchedNotifications(prevNotifications => 
        prevNotifications.map(n => 
          (n._id === notificationId || n.id === notificationId) 
            ? { ...n, read: true } 
            : n
        )
      );
      
      console.log("Notification marked as read successfully");
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault(); // Prevent any default behavior
    
    console.log("Deleting notification, full notification object:", notification);
    
    // Check every property on the notification object
    for (const key in notification) {
      console.log(`${key}:`, notification[key as keyof Notification]);
    }
    
    // Try to find any ID field (it might have a different name)
    let notificationId = null;
    
    // Check common ID field names
    if (notification._id) {
      notificationId = notification._id;
      console.log("Using _id field:", notificationId);
    } else if (notification.id) {
      notificationId = notification.id;
      console.log("Using id field:", notificationId);
    } else {
      // If no ID field is found, log all properties to help identify what's available
      console.error("No id or _id field found. All properties:", Object.keys(notification));
      return;
    }
    
    if (!notificationId) {
      console.error("Cannot delete: Missing notification ID");
      return;
    }
    
    try {
      console.log(`Sending API request to delete notification ${notificationId}`);
      
      const response = await fetch(`http://localhost:5000/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        console.error(`Error deleting notification: ${response.status}`);
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        return;
      }

      // Remove the notification from local state
      setFetchedNotifications(prevNotifications => 
        prevNotifications.filter(n => 
          n._id !== notificationId && n.id !== notificationId
        )
      );
      
      console.log("Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

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
        {role === "user" && (
          <>
            <Button variant="ghost" onClick={() => router.push("/book-search")}>Books</Button>
            <Button variant="ghost" onClick={() => router.push("/contact")}>Contact</Button>
            <Button variant="ghost" onClick={() => router.push("/account")}>AccountInfo</Button>
          </>
        )}
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
            onClick={async () => {
              setNotificationsOpen(!notificationsOpen);
              if (!notificationsOpen) {
                await fetchNotifications();
              }
            }}
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
                {fetchedNotifications.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {fetchedNotifications.map((notification, index) => {
                      // Generate a unique key if no ID is available
                      const key = notification._id || notification.id || `notification-${index}`;
                      
                      return (
                        <li
                          key={key}
                          className={`p-3 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-bold">From: {notification.from}</p>
                              <p className="text-sm">{notification.body}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                              <p className="text-xs text-gray-400">ID: {notification._id || notification.id || 'Unknown'}</p>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              {!notification.read && (
                                <button 
                                  onClick={(e) => markAsRead(e, notification)}
                                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4 text-green-500" />
                                </button>
                              )}
                              <button 
                                onClick={(e) => deleteNotification(e, notification)}
                                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                                title="Delete notification"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
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