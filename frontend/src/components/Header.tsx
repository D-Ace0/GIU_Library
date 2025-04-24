import React from "react";
import { useRouter } from "next/router";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";

interface HeaderProps {
  username: string;
  role: string;
  handleSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, role, handleSignOut }) => {
  const router = useRouter();

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
        <Button variant="ghost" onClick={() => router.push("/books")}>
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
        <Button variant="ghost">
          <Bell className="w-5 h-5 text-gray-600" />
        </Button>
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